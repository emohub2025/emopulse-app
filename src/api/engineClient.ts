import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://172.236.119.144:4100";
const API_PREFIX = "/mobile"; // All routes automatically go through /mobile

// Normalize path so callers can pass "login" or "/login"
function normalizePath(path: string): string {
  if (!path.startsWith("/")) {
    return "/" + path;
  }
  return path;
}

// Centralized logout helper
async function forceLogout() {
  await AsyncStorage.clear();
}

// Attempt refresh token
async function attemptTokenRefresh(): Promise<boolean> {
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();

    await AsyncStorage.setItem("authToken", data.accessToken);
    await AsyncStorage.setItem("refreshToken", data.refreshToken);

    return true;
  } catch {
    return false;
  }
}

// Core request wrapper
async function request<T>(
  method: "GET" | "POST",
  path: string,
  body?: any
): Promise<T> {
  try {
    const token = await AsyncStorage.getItem("authToken");

    const cleanPath = normalizePath(path);
    const url = `${BASE_URL}${API_PREFIX}${cleanPath}`;

    const doFetch = async (authToken?: string) => {
      return await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    };

    let res = await doFetch(token ?? undefined);

    if (res.status === 401) {
      console.log("🔐 Access token expired — attempting refresh");

      const refreshed = await attemptTokenRefresh();

      if (!refreshed) {
        console.log("❌ Refresh failed — forcing logout");
        await forceLogout();
        throw new Error("Session expired. Please log in again.");
      }

      const newToken = await AsyncStorage.getItem("authToken");
      res = await doFetch(newToken ?? undefined);
    }

    if (!res.ok) {
      let message = `Request failed with status ${res.status}`;

      try {
        const errBody = await res.json();
        if (errBody?.error) message = errBody.error;
        if (errBody?.message) message = errBody.message;
      } catch {
        // ignore JSON parse errors
      }

      throw new Error(message);
    }

    try {
      return await res.json();
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