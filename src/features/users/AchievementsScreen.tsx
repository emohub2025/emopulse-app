import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, StyleSheet, ImageBackground, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import React from "react";
import ButtonPanel from "../../components/ButtonPanel";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

export default function AchievementsScreen() {
  const route = useRoute();

  React.useEffect(() => {
    const loadUserId = async () => {
      await AsyncStorage.getItem("userId");
    };

    loadUserId();
  }, []);

  const previewIcons = [
    <Ionicons name="ribbon-outline" size={32} color="#FFD76A" key="1" />,
    <Ionicons name="trophy-outline" size={32} color="#38BDF8" key="2" />,
    <Ionicons name="sparkles-outline" size={32} color="#F472B6" key="3" />,
    <MaterialCommunityIcons name="crown-outline" size={32} color="#8B5CF6" key="4" />,
    <Ionicons name="flame-outline" size={32} color="#F97316" key="5" />,
    <FontAwesome5 name="medal" size={28} color="#22C55E" key="6" />,
  ];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.topLabel}>Achievements</Text>

          <View style={styles.heroCard}>
            <View style={styles.heroGlow} />
            <Text style={styles.badge}>Coming Soon</Text>
            <Text style={styles.title}>Badges, Recognition & Status</Text>
            <Text style={styles.subtitle}>
              Complete challenges, build momentum, and unlock achievements that show
              off your progress across EmoPulse.
            </Text>
          </View>

          <View style={styles.previewCard}>
            <Text style={styles.sectionTitle}>What’s Coming</Text>
            <Text style={styles.sectionText}>
              As you complete more challenges, you’ll begin earning badges, gaining
              recognition, and standing out on the leaderboard.
            </Text>

            <View style={styles.iconGrid}>
              {previewIcons.map((icon, index) => (
                <View key={index} style={styles.iconWrap}>
                  {icon}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.smallCard}>
              <Ionicons name="shield-checkmark-outline" size={28} color="#FFD76A" />
              <Text style={styles.smallCardTitle}>Earn Badges</Text>
              <Text style={styles.smallCardText}>
                Unlock visual badges as you stay active and keep progressing.
              </Text>
            </View>

            <View style={styles.smallCard}>
              <Ionicons name="stats-chart-outline" size={28} color="#38BDF8" />
              <Text style={styles.smallCardTitle}>Rise in Status</Text>
              <Text style={styles.smallCardText}>
                Your performance will shape your rank and help you stand out.
              </Text>
            </View>
          </View>

          <View style={styles.leaderboardCard}>
            <Ionicons name="podium-outline" size={34} color="#FFD76A" />
            <Text style={styles.leaderboardTitle}>Leaderboard Visibility</Text>
            <Text style={styles.leaderboardText}>
              Top performers will gain more visibility, stronger status, and a more
              impressive presence inside the community.
            </Text>
          </View>

          <View style={styles.footerCard}>
            <Text style={styles.footerText}>
              The more challenges you complete, the more your profile will reflect your
              success.
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  background: {
    flex: 1,
    marginBottom: 42,
  },
  scrollContent: {
    paddingTop: 90,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  topLabel: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    backgroundColor: "transparent",
  },
  heroCard: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "rgba(18,18,32,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: "center",
    marginBottom: 22,
  },
  heroGlow: {
    position: "absolute",
    top: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(139,92,246,0.10)",
  },
  badge: {
    color: "#FFD76A",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  previewCard: {
    backgroundColor: "rgba(16,16,28,0.86)",
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 18,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  iconWrap: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  smallCard: {
    width: "48%",
    backgroundColor: "rgba(20,20,34,0.9)",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  smallCardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  smallCardText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  leaderboardCard: {
    backgroundColor: "rgba(255,215,106,0.08)",
    borderColor: "rgba(255,215,106,0.22)",
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
    marginBottom: 18,
  },
  leaderboardTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  leaderboardText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  footerCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  footerText: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "600",
  },
});