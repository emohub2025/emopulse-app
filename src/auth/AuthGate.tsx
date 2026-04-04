import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RootNavigator from "../navigation/RootNavigator";

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

        if (hasAccessToken && hasRefreshToken && hasUserId) {
          if (mounted) setIsLoggedIn(true);
        } else {
          await AsyncStorage.multiRemove(["authToken", "refreshToken", "userId"]);
          if (mounted) setIsLoggedIn(false);
        }
      } catch (err) {
        console.log("❌ AuthGate bootstrap failed:", err);
        await AsyncStorage.multiRemove(["authToken", "refreshToken", "userId"]);
        if (mounted) setIsLoggedIn(false);
      } finally {
        if (mounted) setBooting(false);
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

  return <RootNavigator initialRouteName={isLoggedIn ? "CategoryList" : "Login"} />;
}