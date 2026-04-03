import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";

const BASE_URL = "http://172.236.119.144:4100";
const API_PREFIX = "/mobile"; // All routes automatically go through /mobile

// 🔧 Normalize path so callers can pass "login" or "/login"
function normalizePath(path: string): string {
  if (!path.startsWith("/")) {
    return "/" + path;
  }
  return path;
}

// 🔐 Centralized logout helper
async function forceLogout(navigation?: any) {
  await AsyncStorage.clear();

  if (navigation) {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  }
}

// ⭐ NEW — Attempt refresh token
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

    // Store new tokens
    await AsyncStorage.setItem("authToken", data.accessToken);
    await AsyncStorage.setItem("refreshToken", data.refreshToken);

    return true;
  } catch (err) {
    return false;
  }
}

// 🌐 Core request wrapper
async function request<T>(
  method: "GET" | "POST",
  path: string,
  body?: any,
  navigation?: any
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

    // First attempt
    let res = await doFetch(token ?? undefined);

    // Token expired
    if (res.status === 401) {
      console.log("🔐 Access token expired — attempting refresh");

      const refreshed = await attemptTokenRefresh();

      if (!refreshed) {
        console.log("❌ Refresh failed — forcing logout");
        await forceLogout(navigation);
        // ⭐ Throw a STRING, not an Error object
        throw "Session expired. Please log in again.";
      }

      const newToken = await AsyncStorage.getItem("authToken");
      res = await doFetch(newToken ?? undefined);
    }

    // Non-OK responses
    if (!res.ok) {
      let message = `Request failed with status ${res.status}`;

      try {
        const errBody = await res.json();
        if (errBody?.error) message = errBody.error;
        if (errBody?.message) message = errBody.message;
      } catch (jsonErr) {
        console.log("⚠️ JSON parse failed for error body:", jsonErr);
      }

      // ⭐ Throw a STRING, not an Error object
      throw message;
    }

    // Safe JSON parsing
    try {
      return await res.json();
    } catch {
      console.log("🚨 THROWING FROM invalid server response");
      throw "Invalid server response";
    }

  } catch (err: any) {
    console.log("🔥 request() caught error:", err, "type:", typeof err, "path:", path);

    // ⭐ Normalize EVERYTHING into a string
    const msg =
      typeof err === "string"
        ? err
        : typeof err?.message === "string"
        ? err.message
        : "Network error";

    // ⭐ Throw a STRING, not an Error object
    console.log("🚨 THROWING FROM request():", msg, "for path:", path);
    throw msg;
  }
}

export async function apiGet<T>(
  path: string,
  navigation?: any
): Promise<T> {
  return request<T>("GET", path, undefined, navigation);
}

export async function apiPost<T>(
  path: string,
  body: any,
  navigation?: any
): Promise<T> {
  return request<T>("POST", path, body, navigation);
}