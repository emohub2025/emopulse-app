import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { CycleTimerProvider } from "./src/components/CycleTimerContext";
import { OfflineContext } from "./src/context/OfflineContext";
import { OfflineBanner } from "./src/components/OfflineBanner";
import { OfflineOverlay } from "./src/components/OfflineOverlay";
import AuthGate from "./src/auth/AuthGate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserInfo } from "./src/api/getUserInfo";
import { useUserStore } from "./src/state/useUserStore";   // Zustand store

export default function App() {
  const [isOffline, setIsOffline] = useState(false);

  const setUser = useUserStore(state => state.setUser);

  // -----------------------------
  // ⭐ Hydrate user on app launch
  // -----------------------------
  useEffect(() => {
    const loadUser = async () => {
      try {
        const id = await AsyncStorage.getItem("userId");
        if (id) {
          const fullUser = await getUserInfo(id);
          setUser(fullUser);
        }
      } catch (err) {
        console.log("Failed to load user:", err);
      }
    };

    loadUser();
  }, []);

  // -----------------------------
  // Offline detection
  // -----------------------------
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

          <NavigationContainer>
            <AuthGate />
          </NavigationContainer>
        </View>
      </CycleTimerProvider>
    </OfflineContext.Provider>
  );
}