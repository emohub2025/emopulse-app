// src/auth/AuthGate.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RootNavigator from "../navigation/RootNavigator";   // ⭐ Use your real stack

export default function AuthGate() {
  const [booting, setBooting] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        const access = await AsyncStorage.getItem("authToken");
        const refresh = await AsyncStorage.getItem("refreshToken");
        const userId = await AsyncStorage.getItem("userId");

        if (access && !refresh) {
          await AsyncStorage.clear();
          setIsLoggedIn(false);
        } else if (refresh && userId) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }

      setBooting(false);
    }

    bootstrap();
  }, []);

  if (booting) {
    return (
      <View style={{ flex: 1, backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // ⭐ NO NavigationContainer here
  return (
    <RootNavigator initialRouteName={isLoggedIn ? "CategoryList" : "Login"} />
  );
}