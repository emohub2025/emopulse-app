import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { CycleTimerProvider } from "./src/components/CycleTimerContext";
import { OfflineContext } from "./src/context/OfflineContext";
import { OfflineBanner } from "./src/components/OfflineBanner";
import { OfflineOverlay } from "./src/components/OfflineOverlay";
import AuthGate from "./src/auth/AuthGate";
import { getUserInfo } from "./src/api/getUserInfo";
import { useUserStore } from "./src/state/useUserStore";
import { navigationRef } from "./src/navigation/navigationRef";

export default function App() {
  const [isOffline, setIsOffline] = useState(false);

  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const id = await AsyncStorage.getItem("userId");
        const authToken = await AsyncStorage.getItem("authToken");
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (!id || !authToken || !refreshToken) {
          if (mounted) {
            clearUser();
          }
          return;
        }

        const fullUser = await getUserInfo(id);

        if (mounted) {
          setUser(fullUser);
        }
      } catch (err) {
        console.log("Failed to load user:", err);

        await AsyncStorage.multiRemove(["authToken", "refreshToken", "userId"]);

        if (mounted) {
          clearUser();
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [setUser, clearUser]);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected || !state.isInternetReachable;
      setIsOffline(offline);
    });

    return () => unsub();
  }, []);

  return (
    <OfflineContext.Provider value={{ isOffline }}>
      <CycleTimerProvider>
        <View style={{ flex: 1 }}>
          <OfflineBanner />
          <OfflineOverlay />

          <NavigationContainer ref={navigationRef}>
            <AuthGate />
          </NavigationContainer>
        </View>
      </CycleTimerProvider>
    </OfflineContext.Provider>
  );
}