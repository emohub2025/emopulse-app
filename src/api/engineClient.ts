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
  const token = await AsyncStorage.getItem("authToken");

  // Normalize caller path + auto-prefix /mobile
  const cleanPath = normalizePath(path);
  const url = `${BASE_URL}${API_PREFIX}${cleanPath}`;

  let res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  // 🔐 Token expired or invalid
  if (res.status === 401) {
    console.log("🔐 Access token expired — attempting refresh");

    // ⭐ NEW — Try refresh instead of immediate logout
    const refreshed = await attemptTokenRefresh();

    if (!refreshed) {
      console.log("❌ Refresh failed — forcing logout");
      await forceLogout(navigation);
      throw new Error("Session expired. Please log in again.");
    }

    // ⭐ NEW — Retry original request with new token
    const newToken = await AsyncStorage.getItem("authToken");

    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  }

  // ❌ Other errors
  if (!res.ok) {
    let errBody = null;

    try {
      errBody = await res.json();
    } catch {
      errBody = null;
    }

    console.log(`${method} error body:`, errBody);

    const message =
      errBody?.error ||
      errBody?.message ||
      `Request failed with status ${res.status}`;

    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// 📡 Public API
export async function apiGet<T>(path: string, navigation?: any): Promise<T> {
  return request<T>("GET", path, undefined, navigation);
}

export async function apiPost<T>(
  path: string,
  body: any,
  navigation?: any
): Promise<T> {
  return request<T>("POST", path, body, navigation);
}