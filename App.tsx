import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { CycleTimerProvider } from "./src/components/CycleTimerContext";
import { OfflineContext } from "./src/context/OfflineContext";
import { OfflineBanner } from "./src/components/OfflineBanner";
import { OfflineOverlay } from "./src/components/OfflineOverlay";
import AuthGate from "./src/auth/AuthGate";
import { navigationRef } from "./src/navigation/navigationRef";

export default function App() {
  const [isOffline, setIsOffline] = useState(false);

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