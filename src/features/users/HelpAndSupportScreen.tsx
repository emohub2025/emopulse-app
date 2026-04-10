import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import ButtonPanel from "../../components/ButtonPanel";

// -----------------------------
// Screen Component
// -----------------------------
export default function HelpAndSupportScreen() {
  const route = useRoute();

  const handleEmailPress = async () => {
    const email = "app@emopulse.ai";
    const subject = encodeURIComponent("Emotional Pulse Beta Support");
    const url = `mailto:${email}?subject=${subject}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.warn("Could not open email app:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.topLabel}>Help & Support</Text>

          <View style={styles.card}>
            <Text style={styles.heading}>Welcome to Emotional Pulse Beta</Text>

            <Text style={styles.subText}>
              Thanks for being one of our early beta users. Emotional Pulse is a
              live prediction experience where you can explore trending topics,
              join challenges, compete with teams, and earn Coins through gameplay.
            </Text>

            <Text style={styles.sectionTitle}>What to expect in beta</Text>
            <Text style={styles.bodyText}>
              • Early access to core features and live challenges{"\n"}
              • New updates, improvements, and feature adjustments during testing{"\n"}
              • Occasional bugs, balancing changes, or temporary downtime while we improve the experience
            </Text>

            <Text style={styles.sectionTitle}>Need help?</Text>
            <Text style={styles.bodyText}>
              If something is not working correctly, if a challenge looks off, or
              if you have feedback on gameplay, rewards, teams, or account access,
              please contact our support team.
            </Text>

            <Text style={styles.sectionTitle}>Beta support contact</Text>
            <TouchableOpacity onPress={handleEmailPress}>
              <Text style={styles.contactText}>app@emopulse.ai</Text>
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              Your feedback during beta helps shape the future of Emotional Pulse.
              We appreciate your support while we build and improve the experience.
            </Text>
          </View>
        </ScrollView>
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
  scrollContent: {
    paddingBottom: 90,
  },
  topLabel: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 95,
    marginBottom: 20,
    textAlign: "center",
    backgroundColor: "transparent",
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  heading: {
    color: "#111111",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 18,
  },
  subText: {
    color: "#333333",
    fontSize: 17,
    lineHeight: 25,
    textAlign: "center",
    marginBottom: 28,
  },
  sectionTitle: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 8,
  },
  bodyText: {
    color: "#333333",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 18,
  },
  contactText: {
    color: "#007AFF",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 20,
    textDecorationLine: "underline",
  },
  footerNote: {
    color: "#555555",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
});