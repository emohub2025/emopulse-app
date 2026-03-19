import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { useRoute } from "@react-navigation/native";

type AchievementsRouteParams = {
  userId: string;
};

// -----------------------------
// Screen Component
// -----------------------------
export default function AchievementsScreen() {
  const route = useRoute();
  const { userId } = route.params as AchievementsRouteParams;

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={{ flex: 1 }}
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