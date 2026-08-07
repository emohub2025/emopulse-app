import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RootNavigator from "../navigation/RootNavigator";
import { clearAuthStorage, refreshAuthToken } from "../api/engineClient";

export default function AuthGate() {
  const [booting, setBooting] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const authToken = await AsyncStorage.getItem("authToken");
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        const userId = await AsyncStorage.getItem("userId");

        const hasAccessToken = !!authToken;
        const hasRefreshToken = !!refreshToken;
        const hasUserId = !!userId;

        // Refresh token is the real session token.
        // Access token is allowed to expire.
        if (!hasRefreshToken || !hasUserId) {
          await clearAuthStorage();

          if (mounted) {
            setIsLoggedIn(false);
          }

          return;
        }

        // If the access token is missing, silently refresh it.
        // If it exists but is expired, engineClient will refresh it on the next 401.
        if (!hasAccessToken) {
          try {
            await refreshAuthToken();
          } catch (refreshErr) {
            console.log("❌ Startup token refresh failed:", refreshErr);
            await clearAuthStorage();

            if (mounted) {
              setIsLoggedIn(false);
            }

            return;
          }
        }

        if (mounted) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.log("❌ AuthGate bootstrap failed:", err);
        await clearAuthStorage();

        if (mounted) {
          setIsLoggedIn(false);
        }
      } finally {
        if (mounted) {
          setBooting(false);
        }
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  if (booting) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <RootNavigator initialRouteName={isLoggedIn ? "CategoryList" : "Login"} />
  );
}