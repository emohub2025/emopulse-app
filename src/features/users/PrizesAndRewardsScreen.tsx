import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { useRoute } from "@react-navigation/native";
import ButtonPanel from '../../components/ButtonPanel';

// -----------------------------
// Screen Component
// -----------------------------
export default function HelpAndSupportScreen() {
  const route = useRoute();

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
      <Text style={styles.topLabel}>Help & Support</Text>

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
            We’re working on a dedicated support center to help you with anything you need.
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