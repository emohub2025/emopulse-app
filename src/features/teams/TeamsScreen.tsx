import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { useRoute } from "@react-navigation/native";

// -----------------------------
// Screen Component
// -----------------------------
export default function TeamsScreen() {
  const route = useRoute();

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
      <Text style={styles.topLabel}>Teams</Text>

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
            Coming Soon!
        </Text>

        <Text
            style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 20,
            textAlign: "center",
            }}
        >
          Team play is on the way. Soon you’ll be able to join groups and compete together.
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