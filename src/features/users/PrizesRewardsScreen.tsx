import { View, Text, StyleSheet, ImageBackground } from "react-native";

export default function PrizesRewardsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <Text style={styles.topLabel}>Prizes & Rewards</Text>

        <View style={styles.content}>
          <Text style={styles.title}>Coming Soon!</Text>

          <Text style={styles.subtitle}>
            This page will show your prizes, rewards, and future redemption options.
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  topLabel: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 95,
    textAlign: "center",
    backgroundColor: "transparent",
  },
  content: {
    flex: 0.7,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 34,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 20,
    textAlign: "center",
  },
});