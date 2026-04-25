import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  LayoutAnimation,
  ImageBackground,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useNavigation, useRoute } from "@react-navigation/native";
import ButtonPanel from "../../components/ButtonPanel";
import { apiGet } from "../../api/engineClient";
import { useCurrentUserId } from "../../state/useUserSelectors";

type ChallengeItem = {
  challenge_id: string;
  topic: string | null;
  category: string | null;
  resolved_at: string | null;
};

const categoryIcons: Record<string, any> = {
  Politics: require("../../assets/icons/politics.png"),
  Sports: require("../../assets/icons/sports.png"),
  Entertainment: require("../../assets/icons/entertainment.png"),
  Music: require("../../assets/icons/music.png"),
  Tech: require("../../assets/icons/tech.png"),
  Finance: require("../../assets/icons/finance.png"),
  Gaming: require("../../assets/icons/gaming.png"),
  Health: require("../../assets/icons/health.png"),
  Wacky: require("../../assets/icons/wacky.png"),
};

function getRelativeLabel(dateString?: string | null): string {
  if (!dateString) return "Older";

  const date = new Date(dateString);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);

  const startOfLastWeek = new Date(startOfToday);
  startOfLastWeek.setDate(startOfToday.getDate() - 7);

  if (date >= startOfToday) return "Today";
  if (date >= startOfYesterday) return "Yesterday";
  if (date >= startOfLastWeek) return "Last Week";

  return "Older";
}

export default function ChallengeHistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const userId = useCurrentUserId();
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const route = useRoute();

  async function loadChallenges() {
    try {
      setInitialLoading(true);

      const data = await apiGet<{
        status: string;
        challenges: ChallengeItem[];
      }>(`user-challenges?user_id=${userId}`);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setChallenges(data.challenges);
    } catch (err) {
      console.error("Failed to load challenge history", err);
    } finally {
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    loadChallenges();
  }, [userId]);

  const grouped = challenges.reduce((acc: any[], item) => {
    const label = getRelativeLabel(item.resolved_at);

    let group = acc.find((g) => g.label === label);
    if (!group) {
      group = { label, items: [] };
      acc.push(group);
    }

    group.items.push(item);
    return acc;
  }, []);

  const order = ["Today", "Yesterday", "Last Week", "Older"];
  grouped.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));

  const finalList: any[] = [];
  grouped.forEach((group) => {
    finalList.push({ type: "header", text: group.label });
    group.items.forEach((item: any) =>
      finalList.push({ type: "challenge", item })
    );
  });

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.topLabel}>Results History</Text>
          <Text style={styles.subtitle}>Review your past predictions</Text>

          {!initialLoading && challenges.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏆</Text>
              <Text style={styles.emptyTitle}>No Results Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start predicting emotions and your completed challenges will appear here.
              </Text>
            </View>
          )}

          {challenges.length > 0 && (
            <View style={styles.listContainer}>
              <FlatList
                data={finalList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                keyExtractor={(item, index) => {
                  if (item.type === "header") {
                    return `header-${item.text}-${index}`;
                  }
                  return item.item.challenge_id;
                }}
                renderItem={({ item }) => {
                  if (item.type === "header") {
                    return (
                      <View style={styles.sectionHeaderWrap}>
                        <Text style={styles.sectionHeader}>{item.text}</Text>
                      </View>
                    );
                  }

                  const c = item.item;
                  const categoryKey = c.category ?? "Politics";
                  const iconSource = categoryIcons[categoryKey] ?? categoryIcons.Politics;

                  return (
                    <Pressable
                      onPress={() =>
                        navigation.navigate("ChallengeResults", {
                          challengeId: c.challenge_id,
                          fromHistory: true,
                        })
                      }
                    >
                      <LinearGradient
                        colors={["rgba(59, 7, 100, 0.92)", "rgba(5, 0, 24, 0.95)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.card}
                      >
                        <View style={styles.cardTopRow}>
                          <View style={styles.iconGlow}>
                            <Image source={iconSource} style={styles.icon} />
                          </View>

                          <View style={styles.cardTextArea}>
                            <Text style={styles.topic} numberOfLines={2}>
                              {c.topic || "Untitled Challenge"}
                            </Text>

                            <View style={styles.categoryRow}>
                              <Text style={styles.category}>{c.category || "Challenge"}</Text>
                            </View>
                          </View>

                          <View style={styles.statusPill}>
                            <Text style={styles.statusText}>VIEW</Text>
                          </View>
                        </View>

                        <View style={styles.cardFooter}>
                          <Text style={styles.date}>
                            {c.resolved_at
                              ? new Date(c.resolved_at).toLocaleString()
                              : "Pending"}
                          </Text>

                          <Text style={styles.tapHint}>Tap for result →</Text>
                        </View>
                      </LinearGradient>
                    </Pressable>
                  );
                }}
              />
            </View>
          )}
        </View>
      </ImageBackground>

      <View style={styles.bottomSafeArea} />
      <ButtonPanel currentScreen={route.name} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#050018",
  },

  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(5, 0, 24, 0.28)",
    paddingHorizontal: 16,
    paddingTop: 42,
  },

  topLabel: {
    color: "#FFD700",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 14,
    opacity: 0.85,
    marginTop: 3,
    marginBottom: 12,
  },

  listContainer: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 190,
  },

  sectionHeaderWrap: {
    alignSelf: "center",
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(160, 32, 240, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(216, 180, 255, 0.65)",
  },

  sectionHeader: {
    color: "#F3E8FF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  card: {
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.4,
    borderColor: "rgba(216, 180, 255, 0.48)",
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconGlow: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },

  icon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },

  cardTextArea: {
    flex: 1,
  },

  topic: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 21,
  },

  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  category: {
    color: "#D8B4FF",
    fontSize: 13,
    fontWeight: "800",
  },

  statusPill: {
    backgroundColor: "rgba(255, 215, 0, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.75)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 8,
  },

  statusText: {
    color: "#FFD700",
    fontSize: 11,
    fontWeight: "900",
  },

  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  date: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },

  tapHint: {
    color: "#00FFD1",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 10,
  },

  emptyContainer: {
    flex: 0.78,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },

  emptyTitle: {
    color: "#FFD700",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 10,
  },

  emptySubtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 23,
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