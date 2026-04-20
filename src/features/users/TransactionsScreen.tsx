import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  SectionList,
  StyleSheet,
  LayoutAnimation,
  ImageBackground,
  Pressable,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import ButtonPanel from "../../components/ButtonPanel";
import { apiGet } from "../../api/engineClient";
import payoutIcon from "../../assets/images/payout.png";
import payoutSubIcon from "../../assets/images/payout-sub.png";
import betIcon from "../../assets/images/bet.png";
import betSubIcon from "../../assets/images/bet-sub.png";
import { useCurrentUserId } from "../../state/useUserSelectors";

type Transaction = {
  id: string;
  amount: string;
  type: string;
  description: string | null;
  transaction_date: string;
  challenge_id: string | null;
  challenge_topic?: string | null;
  challenge_category?: string | null;
};

// -----------------------------
// Topic Icons
// -----------------------------
const topicIcons: Record<string, any> = {
  politics: require("../../assets/icons/politics.png"),
  sports: require("../../assets/icons/sports.png"),
  entertainment: require("../../assets/icons/entertainment.png"),
  tech: require("../../assets/icons/tech.png"),
  music: require("../../assets/icons/music.png"),
  finance: require("../../assets/icons/finance.png"),
  gaming: require("../../assets/icons/gaming.png"),
  health: require("../../assets/icons/health.png"),
};

// -----------------------------
// Helpers
// -----------------------------
function formatAmount(amount: string) {
  const num = Number(amount);
  const isPositive = num > 0;

  return {
    text: `${isPositive ? "+" : ""}${num.toFixed(2)}`,
    color: isPositive ? "lime" : "#FF5252",
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

function iconFor(type: string) {
  switch (type) {
    case "payout":
      return payoutIcon;
    case "payout_sub":
      return payoutSubIcon;
    case "bet":
      return betIcon;
    case "subchallenge_bet":
      return betSubIcon;
    default:
      return payoutSubIcon;
  }
}

function labelFor(type: string) {
  switch (type) {
    case "payout":
      return "Challenge Payout";
    case "payout_sub":
      return "Subchallenge Payout";
    case "bet":
      return "Challenge Bet";
    case "subchallenge_bet":
      return "Subchallenge Bet";
    default:
      return type.toUpperCase();
  }
}

// -----------------------------
// Grouping: Challenge Sessions + Day Buckets
// -----------------------------
function buildChallengeSessions(
  transactions: Transaction[],
  collapsed: Record<string, boolean>
) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  function dayLabel(date: string) {
    const d = new Date(date);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 7) return "Last Week";

    return "Older";
  }

  // -----------------------------------------
  // 1) Group by challenge_id (REAL FIX)
  // -----------------------------------------
  const sessionsById: Record<
    string,
    { challenge_id: string; challenge_topic: string; challenge_category: string; items: Transaction[] }
  > = {};

  let lastSeenChallengeId: string | null = null;

  for (const tx of transactions) {
    const cid = tx.challenge_id;
    const topic = tx.challenge_topic?.trim() || "(Unknown Challenge)";
    const category = tx.challenge_category?.trim() || "(Unknown Category)";

    if (cid) {
      // Create session if needed
      if (!sessionsById[cid]) {
        sessionsById[cid] = {
          challenge_id: cid,
          challenge_topic: topic,
          challenge_category: category,
          items: [],
        };
      }

      sessionsById[cid].items.push(tx);
      lastSeenChallengeId = cid;
    } else {
      // Null challenge_id → inherit from last seen challenge
      if (lastSeenChallengeId) {
        const inherited = sessionsById[lastSeenChallengeId];
        inherited.items.push({
          ...tx,
          challenge_id: inherited.challenge_id,
          challenge_topic: inherited.challenge_topic,
        });
      }
    }
  }

  const sessions = Object.values(sessionsById);

  // -----------------------------------------
  // 2) Build day buckets
  // -----------------------------------------
  const dayBuckets: Record<string, any[]> = {};

  sessions.forEach((session) => {
    const groupKey = `session-${session.challenge_id}`;
    const isCollapsed = collapsed[groupKey] ?? true;

    session.items.forEach((tx, index) => {
      const label = dayLabel(tx.transaction_date);
      if (!dayBuckets[label]) dayBuckets[label] = [];

      // Insert header once per session per day
      if (index === 0) {
        const topicKey = session.challenge_category.toLowerCase().trim() || "__default";

        dayBuckets[label].push({
          type: "challengeHeader",
          id: `header-${groupKey}-${label}`,
          title: session.challenge_topic,
          topicKey,
          collapsed: isCollapsed,
          groupKey,
        });
      }

      // Insert items only if expanded
      if (!isCollapsed) {
        dayBuckets[label].push({
          ...tx,
          type: tx.type,
        });
      }
    });
  });

  return Object.entries(dayBuckets).map(([title, data]) => ({
    title,
    data,
  }));
}

// -----------------------------
// Screen Component
// -----------------------------
export default function TransactionsScreen() {
  const route = useRoute();
  const userId = useCurrentUserId();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [grouped, setGrouped] = useState<any[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  function toggleGroup(groupKey: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const updated = {
      ...collapsed,
      [groupKey]: !collapsed[groupKey],
    };

    setCollapsed(updated);
    setGrouped(buildChallengeSessions(transactions, updated));
  }

  async function loadInitial() {
    if (!userId) {
      setInitialLoading(false);
      return;
    }

    try {
      setInitialLoading(true);

      const data = await apiGet<{
        wallet_id: string;
        transactions: Transaction[];
        next_cursor: string | null;
      }>(`wallet/transactions/${userId}?limit=50`);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      // 1) Initialize collapsed state FIRST
      const initialCollapsed: Record<string, boolean> = {};
      for (const tx of data.transactions) {
        if (tx.challenge_id) {
          initialCollapsed[`session-${tx.challenge_id}`] = true; // default collapsed
        }
      }

      // 2) Apply collapsed state BEFORE grouping
      setCollapsed(initialCollapsed);

      // 3) Build grouped using the correct collapsed state
      setTransactions(data.transactions);
      setGrouped(buildChallengeSessions(data.transactions, initialCollapsed));

      setNextCursor(data.next_cursor);
    } catch (err) {
      console.error("Failed to load wallet", err);
    } finally {
      setInitialLoading(false);
    }
  }

  async function loadMore() {
    if (!userId || !nextCursor || loadingMore) return;

    setLoadingMore(true);

    try {
      const data = await apiGet<{
        transactions: Transaction[];
        next_cursor: string | null;
      }>(`wallet/transactions/${userId}?cursor=${nextCursor}&limit=50`);

      const merged = [...transactions, ...data.transactions];

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      setTransactions(merged);
      setGrouped(buildChallengeSessions(merged, collapsed));
      setNextCursor(data.next_cursor);
    } catch (err) {
      console.error("Failed to load more transactions", err);
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    loadInitial();
  }, [userId]);

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
        <Text style={styles.topLabel}>Transaction History</Text>

        {!initialLoading && transactions.length === 0 && (
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
              No Transactions Yet
            </Text>

            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 20,
                textAlign: "center",
              }}
            >
              Your activity will appear here once you start entering challenges
              or earning payouts.
            </Text>
          </View>
        )}

        {transactions.length > 0 && (
          <View style={styles.listContainer}>
            <SectionList
              sections={grouped}
              keyExtractor={(item) => item.id}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loadingMore ? (
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      padding: 20,
                      opacity: 0.7,
                    }}
                  >
                    Loading more…
                  </Text>
                ) : null
              }
              renderSectionHeader={({ section }) => (
                <Text style={styles.sectionHeader}>{section.title}</Text>
              )}
              renderItem={({ item }) => {
                if (item.type === "challengeHeader") {
                  const icon =
                    topicIcons[item.topicKey] || topicIcons.__default;

                  return (
                    <Pressable
                      onPress={() => toggleGroup(item.groupKey)}
                      style={styles.challengeHeaderRow}
                    >
                      <Image source={icon} style={styles.challengeIcon} />
                      <Text style={styles.challengeHeader}>{item.title}</Text>
                      <Text style={styles.collapseIndicator}>
                        {item.collapsed ? "▶" : "▼"}
                      </Text>
                    </Pressable>
                  );
                }

                const { text, color } = formatAmount(item.amount);

                return (
                  <View style={styles.txRow}>
                    <Image source={iconFor(item.type)} style={styles.txIcon} />

                    <View style={{ flex: 1 }}>
                      <Text style={styles.txType}>
                        {labelFor(item.type)}
                      </Text>

                      <Text style={styles.txDate}>
                        {formatDate(item.transaction_date)}
                      </Text>
                    </View>

                    <Text style={[styles.txAmount, { color }]}>{text}</Text>
                  </View>
                );
              }}
            />
          </View>
        )}
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
  listContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    marginHorizontal: 12,
    marginTop: 20,
    paddingTop: 20,
    paddingBottom: 15,
    marginBottom: 75,
    borderRadius: 20,
    overflow: "hidden",
  },
  sectionHeader: {
    color: "yellow",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 14,
    marginBottom: 8,
  },
  challengeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  challengeIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  challengeHeader: {
    color: "rgba(0, 255, 0, 0.9)",
    fontSize: 16,
    fontWeight: "700",
    fontStyle: "italic",
    flex: 1,
  },
  collapseIndicator: {
    color: "rgba(0, 255, 0, 0.9)",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 14,
  },
  txIcon: {
    width: 33,
    height: 33,
    marginRight: 12,
  },
  txType: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  txDate: {
    color: "rgba(255, 255, 255, 1.0)",
    fontSize: 14,
    marginTop: -5,
  },
  txAmount: {
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 12,
    marginTop: 0,
  },
});
