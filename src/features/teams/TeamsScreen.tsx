import { Platform, View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute } from "@react-navigation/native";
import ButtonPanel from "../../components/ButtonPanel";

import teamIcon from "../../assets/buttons/panel-teams.png";
import leaderboardIcon from "../../assets/buttons/panel-leaderboard.png";
import accountIcon from "../../assets/buttons/panel-account.png";
import coinIcon from "../../assets/images/coin.png";
import sportsIcon from "../../assets/icons/sports.png";
import gamingIcon from "../../assets/icons/gaming.png";
import techIcon from "../../assets/icons/tech.png";

const previewTeams = [
  {
    name: "Pulse Squad",
    score: "1,240",
    gradient: ["#00C853", "#00E676"] as [string, string],
    members: [sportsIcon, gamingIcon, accountIcon],
  },
  {
    name: "Trend Rivals",
    score: "1,090",
    gradient: ["#FFB000", "#FF2DAA"] as [string, string],
    members: [techIcon, leaderboardIcon, teamIcon],
  },
];

const featureCards = [
  {
    title: "Create Teams",
    text: "Build a squad with your own name, style, and teammates.",
    icon: teamIcon,
  },
  {
    title: "Challenge Teammates",
    text: "Play head-to-head and see who reads the emotional pulse best.",
    icon: leaderboardIcon,
  },
  {
    title: "Stack Team Coins",
    text: "Compete together and climb future team rankings.",
    icon: coinIcon,
  },
];

const isIOS = Platform.OS === "ios";

export default function TeamsScreen() {
  const route = useRoute();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Teams</Text>
        <Text style={styles.subtitle}>Create your squad. Challenge your crew.</Text>

        <LinearGradient
          colors={["#00C853", "#00E676"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroIconWrap}>
            <Image source={teamIcon} style={styles.heroIcon} />
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.heroLabel}>Arriving Soon</Text>
            <Text style={styles.heroTitle}>Team Play Is Almost Here</Text>
            <Text style={styles.heroText}>
              Users will be able to create their own teams and play against
              teammates in Emotional Pulse challenges.
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.statsBar}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>Custom</Text>
            <Text style={styles.statLabel}>Team Names</Text>
          </View>

          <View style={styles.statPill}>
            <Text style={styles.statValue}>Versus</Text>
            <Text style={styles.statLabel}>Teammate Play</Text>
          </View>
        </View>

        <View style={styles.matchupCard}>
          <Text style={styles.matchupLabel}>Team Battle Preview</Text>

          <View style={styles.matchupRow}>
            {previewTeams.map((team, index) => (
              <LinearGradient
                key={team.name}
                colors={team.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.teamPreview}
              >
                <Text style={styles.teamName}>{team.name}</Text>

                <View style={styles.memberRow}>
                  {team.members.map((memberIcon, memberIndex) => (
                    <View
                      key={`${team.name}-${memberIndex}`}
                      style={[
                        styles.memberAvatar,
                        { marginLeft: memberIndex === 0 ? 0 : -10 },
                      ]}
                    >
                      <Image source={memberIcon} style={styles.memberIcon} />
                    </View>
                  ))}
                </View>

                <Text style={styles.teamScore}>{team.score} Coins</Text>

                {index === 0 && (
                  <View style={styles.leadingBadge}>
                    <Text style={styles.leadingBadgeText}>LEADING</Text>
                  </View>
                )}
              </LinearGradient>
            ))}
          </View>
        </View>

        <View style={styles.featureGrid}>
          {featureCards.map((feature) => (
            <View key={feature.title} style={styles.featureCard}>
              <View style={styles.featureIconWrap}>
                <Image source={feature.icon} style={styles.featureIcon} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomSafeArea} />
      <ButtonPanel currentScreen={route.name} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050018",
    paddingHorizontal: 16,
    paddingTop: isIOS ? 14 : 92,
  },
  scrollContent: {
    paddingBottom: 190,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  heroCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "white",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#00FF9C",
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  heroIconWrap: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.75)",
  },
  heroIcon: {
    width: 56,
    height: 56,
    resizeMode: "contain",
  },
  heroCopy: {
    flex: 1,
  },
  heroLabel: {
    color: "#003B1F",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  heroTitle: {
    color: "#002B16",
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 6,
  },
  heroText: {
    color: "#003B1F",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  statsBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  statPill: {
    flex: 1,
    backgroundColor: "rgba(160, 32, 240, 0.18)",
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(216, 180, 255, 0.75)",
  },
  statValue: {
    color: "#FFF",
    fontWeight: "900",
  },
  statLabel: {
    color: "#F3E8FF",
    fontSize: 11,
    fontWeight: "800",
  },
  matchupCard: {
    backgroundColor: "rgba(160, 32, 240, 0.16)",
    borderRadius: 22,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "rgba(216, 180, 255, 0.65)",
    marginBottom: 12,
  },
  matchupLabel: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
  },
  matchupRow: {
    flexDirection: "row",
    gap: 10,
  },
  teamPreview: {
    flex: 1,
    borderRadius: 20,
    padding: 12,
    minHeight: 158,
    overflow: "hidden",
  },
  teamName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  memberAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.86)",
    alignItems: "center",
    justifyContent: "center",
  },
  memberIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  teamScore: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginTop: "auto",
  },
  leadingBadge: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  leadingBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  featureGrid: {
    gap: 10,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  featureIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },
  featureTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    minWidth: 118,
  },
  featureText: {
    flex: 1,
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  bottomSafeArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    backgroundColor: "#050018",
  },
});
