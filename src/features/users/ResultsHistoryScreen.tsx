import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, LayoutAnimation, ImageBackground, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useRoute, useNavigation } from "@react-navigation/native";
import { apiGet } from "../../api/engineClient";

type ChallengeItem = {
  challenge_id: string;
  topic: string | null;
  category: string | null;
  resolved_at: string | null;
};

type RouteParams = {
  userId: string;
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
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId } = route.params as RouteParams;

  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

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
    
  // Group by Today / Yesterday / Last Week / Older
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

  // Sort groups in desired order
  const order = ["Today", "Yesterday", "Last Week", "Older"];
  grouped.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));

  // Flatten into final list
  const finalList: any[] = [];
  grouped.forEach((group) => {
    finalList.push({ type: "header", text: group.label });
    group.items.forEach((item: any) =>
      finalList.push({ type: "challenge", item })
    );
  });

  // Debug logging
  //console.log("🔥 GROUPED HISTORY:", JSON.stringify(grouped, null, 2));
  //console.log("🔥 FINAL LIST:", JSON.stringify(finalList, null, 2));

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
        <Text style={styles.topLabel}>Challenge History</Text>

        {/* Empty State */}
        {!initialLoading && challenges.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Challenges Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your played challenges will appear here once you start participating.
            </Text>
          </View>
        )}

        {/* Challenge List */}
        {challenges.length > 0 && (
        <View style={styles.listContainer}>
          <FlatList
            data={finalList}
            keyExtractor={(item, index) => {
            if (item.type === "header") {
                return `header-${item.text}-${index}`;
            }
            return item.item.challenge_id;
            }}
            renderItem={({ item }) => {
              if (item.type === "header") {
                return (
                <Text style={[styles.sectionHeader, { marginTop: 20 }]}>
                    {item.text}
                </Text>
                );
              }

              // Challenge card
              const c = item.item;
              const categoryKey = c.category ?? "politics";

              return (
                <Pressable
                  onPress={() =>
                    navigation.navigate("ChallengeResults", {
                      challengeId: c.challenge_id,
                      fromHistory: true,
                    })
                  }
                  >
                  <View style={styles.row}>
                    <Text style={styles.topic}>{c.topic}</Text>

                    <View style={styles.categoryRow}>
                      <Image source={categoryIcons[categoryKey]} style={styles.icon} />
                      <Text style={styles.category}>{c.category}</Text>
                    </View>

                    <Text style={styles.date}>
                      {c.resolved_at
                        ? new Date(c.resolved_at).toLocaleString()
                        : "Pending"}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
            />
          </View>
        )}
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
    paddingBottom: 10,
    textAlign: "center",
  },

  listContainer: {
    flex: 1,
    backgroundColor: "transparent",
    marginHorizontal: 12,
    marginBottom: 20,
    overflow: "hidden",
  },

  sectionHeader: {
    color: "yellow",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
    paddingHorizontal: 4,
  },

  row: {
    marginTop: 10,
    borderRadius: 20,
    backgroundColor: "#120367",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderColor: "#ed84df",
    borderWidth: 1.5,
  },

  topic: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },

  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 35,
    height: 35,
    marginRight: 6,
    resizeMode: "contain",
  },

  category: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 18,
    fontWeight: "600",
  },

  date: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 4,
  },

  emptyContainer: {
    flex: 0.7,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 34,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
  },

  emptySubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 20,
    textAlign: "center",
  },
});