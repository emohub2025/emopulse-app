import { View, Text, StyleSheet, ImageBackground, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

export default function PrizesRewardsScreen() {
  const prizes = [
    {
      title: "Gift Cards",
      subtitle: "Redeem Coins for top brands",
      icon: <Ionicons name="card-outline" size={34} color="#FFD76A" />,
    },
    {
      title: "Gaming Rewards",
      subtitle: "Gear, credits, and extras",
      icon: <Ionicons name="game-controller-outline" size={34} color="#8B5CF6" />,
    },
    {
      title: "Tech Gadgets",
      subtitle: "Cool devices and accessories",
      icon: <Ionicons name="phone-portrait-outline" size={34} color="#38BDF8" />,
    },
    {
      title: "VIP Experiences",
      subtitle: "Exclusive premium rewards",
      icon: <MaterialCommunityIcons name="crown-outline" size={34} color="#F472B6" />,
    },
    {
      title: "Fashion & Style",
      subtitle: "Popular merch and lifestyle items",
      icon: <FontAwesome5 name="gift" size={30} color="#22C55E" />,
    },
    {
      title: "Mystery Drops",
      subtitle: "Surprise rewards coming soon",
      icon: <Ionicons name="sparkles-outline" size={34} color="#F97316" />,
    },
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
          <Text style={styles.topLabel}>Prizes & Rewards</Text>

          <View style={styles.heroCard}>
            <Text style={styles.badge}>Coming Soon</Text>
            <Text style={styles.title}>Amazing Rewards Are On The Way</Text>
            <Text style={styles.subtitle}>
              Stack up your Coins and get ready to exchange them for exciting prizes
              through our future rewards partners.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Potential Prizes</Text>

          <View style={styles.grid}>
            {prizes.map((prize, index) => (
              <View key={index} style={styles.prizeCard}>
                <View style={styles.iconWrap}>{prize.icon}</View>
                <Text style={styles.prizeTitle}>{prize.title}</Text>
                <Text style={styles.prizeSubtitle}>{prize.subtitle}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How It Will Work</Text>
            <Text style={styles.infoText}>
              Earn Coins by participating in challenges, building streaks, and climbing
              the leaderboard. When rewards launch, eligible users will be able to use
              their Coins toward awesome third-party prize options.
            </Text>
          </View>

          <View style={styles.footerCard}>
            <Ionicons name="trophy-outline" size={32} color="#FFD76A" />
            <Text style={styles.footerText}>
              The more Coins you earn, the better the prizes.
            </Text>
          </View>
        </ScrollView>
      </ImageBackground>
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
  },
  heroCard: {
    backgroundColor: "rgba(14,14,24,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 26,
  },
  badge: {
    color: "#FFD76A",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 17,
    textAlign: "center",
    lineHeight: 25,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  prizeCard: {
    width: "48%",
    backgroundColor: "rgba(18,18,30,0.85)",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    minHeight: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  prizeTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  prizeSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: "rgba(24,24,38,0.88)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  infoTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    lineHeight: 23,
  },
  footerCard: {
    backgroundColor: "rgba(255,215,106,0.08)",
    borderColor: "rgba(255,215,106,0.24)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },
});