import React, { useContext } from "react";
import { View, Text } from "react-native";
import { OfflineContext } from "../context/OfflineContext";

export function OfflineOverlay() {
  const { isOffline } = useContext(OfflineContext);

  if (!isOffline) return null;

  return (
    <View style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.85)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}>
      <Text style={{ color: "white", fontSize: 20, fontWeight: "600" }}>
        No Internet Connection
      </Text>
      <Text style={{ color: "#ccc", marginTop: 10 }}>
        Please reconnect to continue
      </Text>
    </View>
  );
}