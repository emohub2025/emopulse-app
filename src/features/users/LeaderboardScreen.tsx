import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ButtonPanel from "../../components/ButtonPanel";

export default function LeaderboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <Text style={styles.subtitle}>Top players coming soon.</Text>

      <ButtonPanel currentScreen="Leaderboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050018",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    paddingBottom: 120,
  },
  title: {
    color: "#FFD700",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 16,
    opacity: 0.85,
  },
});
