import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { navigationRef } from "../navigation/navigationRef";

const BASE_URL = "http://172.236.119.144:4100";
const API_PREFIX = "/mobile";

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

async function clearAuthStorage(): Promise<void> {
  await AsyncStorage.multiRemove(["authToken", "refreshToken", "userId"]);
}

async function forceLogout(): Promise<void> {
  await clearAuthStorage();

  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  }
}

async function refreshAuthToken(): Promise<string> {
  const refreshToken = await AsyncStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const refreshUrl = `${BASE_URL}${API_PREFIX}/auth/refresh`;

  const res = await fetch(refreshUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const rawText = await res.text();

  if (!res.ok) {
    throw new Error(`Refresh failed: ${res.status} ${rawText}`);
  }

  let data: any;

  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error("Invalid refresh response");
  }

  if (!data?.accessToken) {
    throw new Error("No access token returned from refresh");
  }

  await AsyncStorage.setItem("authToken", data.accessToken);

  if (data.refreshToken) {
    await AsyncStorage.setItem("refreshToken", data.refreshToken);
  }

  return data.accessToken;
}

async function request<T>(
  method: "GET" | "POST",
  path: string,
  body?: any
): Promise<T> {
  const cleanPath = normalizePath(path);
  const url = `${BASE_URL}${API_PREFIX}${cleanPath}`;

  const doFetch = async (authToken?: string): Promise<Response> => {
    return fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  };

  try {
    let token = await AsyncStorage.getItem("authToken");
    let res = await doFetch(token ?? undefined);

    const isRefreshEndpoint = cleanPath === "/auth/refresh";

    if (res.status === 401 && !isRefreshEndpoint) {
      console.log("🔐 Access token expired — attempting refresh");

      try {
        token = await refreshAuthToken();
      } catch (refreshErr) {
        console.log("❌ Refresh failed — forcing logout", refreshErr);
        await forceLogout();
        throw new Error("Session expired. Please log in again.");
      }

      res = await doFetch(token);
    }

    if (!res.ok) {
      let message = `Request failed with status ${res.status}`;

      try {
        const errBody = await res.json();

        if (errBody?.error) {
          message = errBody.error;
        } else if (errBody?.message) {
          message = errBody.message;
        }
      } catch {
        try {
          const fallbackText = await res.text();

          if (fallbackText) {
            message = fallbackText;
          }
        } catch {
          // ignore fallback parsing errors
        }
      }

      throw new Error(message);
    }

    try {
      return (await res.json()) as T;
    } catch {
      throw new Error("Invalid server response");
    }
  } catch (err: any) {
    console.log("🔥 request() caught error:", err);
    throw new Error(err?.message || "Network error");
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>("GET", path);
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  return request<T>("POST", path, body);
}

export { forceLogout, clearAuthStorage, refreshAuthToken };