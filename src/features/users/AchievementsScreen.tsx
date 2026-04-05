import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import ButtonPanel from '../../components/ButtonPanel';

// -----------------------------
// Screen Component
// -----------------------------
export default function AchievementsScreen() {
  const route = useRoute();
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
    };

    loadUserId();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
      <Text style={styles.topLabel}>Achievements</Text>

      <View
        style={{
            flex: 0.7,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 34,
        }}
        >
        <Text
            style={{
            color: "#fff",
            fontSize: 22,
            fontWeight: "600",
            marginBottom: 20,
            }}
        >
          No Achievements Yet
        </Text>

        <Text
            style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 20,
            textAlign: "center",
            }}
        >
            Start completing challenges to unlock badges and build your achievement history.
        </Text>
        </View>
      </ImageBackground>

      <View>
        <ButtonPanel currentScreen={route.name} />
      </View>
    </View>
  );
}

// -----------------------------
// Styles
// -----------------------------

const styles = StyleSheet.create({
  topLabel: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 95,
    textAlign: "center",
    backgroundColor: "transparent",
  },
});