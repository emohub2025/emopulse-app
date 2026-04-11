import React, { useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import ButtonPanel from "../../components/ButtonPanel";

// -----------------------------
// Accordion Item Component
// -----------------------------
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={styles.faqHeader}
      >
        <Text style={styles.question}>{question}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#333"
        />
      </TouchableOpacity>

      {open && <Text style={styles.answer}>{answer}</Text>}
    </View>
  );
};

// -----------------------------
// Screen Component
// -----------------------------
export default function HelpAndSupportScreen() {
  const route = useRoute();

  const openEmail = () => {
    Linking.openURL(
      "mailto:app@emopulse.ai?subject=Emotional Pulse Support"
    );
  };

  const reportBug = () => {
    Linking.openURL(
      "mailto:app@emopulse.ai?subject=Bug Report&body=Describe the issue you experienced..."
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.topLabel}>Help & Support</Text>

          <View style={styles.card}>
            <Text style={styles.heading}>Emotional Pulse Beta</Text>

            <Text style={styles.subText}>
              Explore trends, join challenges, compete with teams, and earn Coins.
              This is an early beta, so your feedback matters.
            </Text>

            {/* ----------------------------- */}
            {/* ICON SECTIONS */}
            {/* ----------------------------- */}
            <View style={styles.iconRow}>
              <View style={styles.iconBox}>
                <Ionicons name="game-controller" size={22} color="#7B61FF" />
                <Text style={styles.iconText}>Play</Text>
              </View>

              <View style={styles.iconBox}>
                <Ionicons name="trophy" size={22} color="#FFC107" />
                <Text style={styles.iconText}>Coins</Text>
              </View>

              <View style={styles.iconBox}>
                <Ionicons name="bug" size={22} color="#FF4D4D" />
                <Text style={styles.iconText}>Report</Text>
              </View>

              <View style={styles.iconBox}>
                <Ionicons name="help-circle" size={22} color="#00C2FF" />
                <Text style={styles.iconText}>Support</Text>
              </View>
            </View>

            {/* ----------------------------- */}
            {/* CONTACT */}
            {/* ----------------------------- */}
            <Text style={styles.sectionTitle}>Contact Support</Text>

            <TouchableOpacity onPress={openEmail}>
              <Text style={styles.contactText}>app@emopulse.ai</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.reportBtn} onPress={reportBug}>
              <Ionicons name="alert-circle" size={18} color="#fff" />
              <Text style={styles.reportText}>Report a Bug</Text>
            </TouchableOpacity>

            {/* ----------------------------- */}
            {/* FAQ ACCORDION */}
            {/* ----------------------------- */}
            <Text style={styles.sectionTitle}>Common Questions</Text>

            <FAQItem
              question="How do I play?"
              answer="Pick a category, join a challenge, and predict the next emotional trend. Earn Coins when you're right."
            />

            <FAQItem
              question="What are Coins?"
              answer="Coins are earned through gameplay, streaks, and accuracy. Rewards will expand as features roll out."
            />

            <FAQItem
              question="Is this free?"
              answer="Yes. The beta is completely free and includes bonus Coins for early users."
            />

            <FAQItem
              question="Why do things change?"
              answer="We’re actively improving the app during beta, so features and gameplay may evolve."
            />

            <FAQItem
              question="Will my progress reset?"
              answer="Some resets may happen during beta while we refine the system."
            />

            <FAQItem
              question="When is launch?"
              answer="We’re moving fast—your feedback helps determine the final release timeline."
            />

            <Text style={styles.footerNote}>
              Thanks for helping build Emotional Pulse.
            </Text>
          </View>
        </ScrollView>
      </ImageBackground>

      <ButtonPanel currentScreen={route.name} />
    </View>
  );
}

// -----------------------------
// Styles
// -----------------------------
const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  topLabel: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 95,
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    color: "#111",
  },
  subText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#444",
  },

  iconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  iconBox: {
    alignItems: "center",
    flex: 1,
  },
  iconText: {
    fontSize: 12,
    marginTop: 4,
    color: "#333",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111",
  },

  contactText: {
    color: "#007AFF",
    fontSize: 16,
    marginBottom: 15,
    textDecorationLine: "underline",
  },

  reportBtn: {
    flexDirection: "row",
    backgroundColor: "#FF4D4D",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  reportText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },

  faqItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  answer: {
    marginTop: 6,
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },

  footerNote: {
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
    color: "#666",
  },
});