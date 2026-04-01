import React, { useContext } from 'react';
import { OfflineContext } from "../context/OfflineContext";
import { View, Text } from 'react-native';

export function OfflineBanner() {
  const { isOffline } = useContext(OfflineContext);

  if (!isOffline) return null;

  return (
    <View style={{
      position: "absolute",
      top: 0,
      width: "100%",
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      paddingVertical: 8,
      backgroundColor: "#C62F2F",
      alignItems: "center",
      zIndex: 999,
    }}>
      <Text style={{ color: "white", fontWeight: "600", fontSize: 20 }}>
        No internet connection
      </Text>
    </View>
  );
}
