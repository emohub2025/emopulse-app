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
import { LinearGradient } from "expo-linear-gradient";
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

function formatAmount(amount: string) {
  const num = Number(amount);
  const isPositive = num > 0;

  return {
    text: `${isPositive ? "+" : ""}${num.toFixed(2)}`,
    color: isPositive ? "#00E676" : "#FF5C8A",
    bg: isPositive ? "rgba(0, 230, 118, 0.15)" : "rgba(255, 92, 138, 0.15)",
    border: isPositive ? "rgba(0, 230, 118, 0.7)" : "rgba(255, 92, 138, 0.7)",
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
      return "Challenge Reward";
    case "payout_sub":
      return "Subchallenge Reward";
    case "bet":
      return "Challenge Coin";
    case "subchallenge_bet":
      return "Subchallenge Coin";
    default:
      return type.toUpperCase();
  }
}

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

  const sessionsById: Record<
    string,
    {
      challenge_id: string;
      challenge_topic: string;
      challenge_category: string;
      items: Transaction[];
    }
  > = {};

  let lastSeenChallengeId: string | null = null;

  for (const tx of transactions) {
    const cid = tx.challenge_id;
    const topic = tx.challenge_topic?.trim() || "(Unknown Challenge)";
    const category = tx.challenge_category?.trim() || "(Unknown Category)";

    if (cid) {
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
  const dayBuckets: Record<string, any[]> = {};

  sessions.forEach((session) => {
    const groupKey = `session-${session.challenge_id}`;
    const isCollapsed = collapsed[groupKey] ?? true;

    session.items.forEach((tx, index) => {
      const label = dayLabel(tx.transaction_date);
      if (!dayBuckets[label]) dayBuckets[label] = [];

      if (index === 0) {
        const topicKey =
          session.challenge_category.toLowerCase().trim() || "__default";

        dayBuckets[label].push({
          type: "challengeHeader",
          id: `header-${groupKey}-${label}`,
          title: session.challenge_topic,
          topicKey,
          collapsed: isCollapsed,
          groupKey,
        });
      }

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

      const initialCollapsed: Record<string, boolean> = {};
      for (const tx of data.transactions) {
        if (tx.challenge_id) {
          initialCollapsed[`session-${tx.challenge_id}`] = true;
        }
      }

      setCollapsed(initialCollapsed);
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
    <View style={styles.root}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.topLabel}>Coin Ledger</Text>
          <Text style={styles.subtitle}>Track coins earned and spent.</Text>

          {!initialLoading && transactions.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🪙</Text>
              <Text style={styles.emptyTitle}>No Transactions Yet</Text>
              <Text style={styles.emptySubtitle}>
                Your coin activity will appear here once you enter challenges or
                earn payouts.
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
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={
                  loadingMore ? (
                    <Text style={styles.loadingMore}>Loading more…</Text>
                  ) : null
                }
                renderSectionHeader={({ section }) => (
                  <View style={styles.sectionHeaderWrap}>
                    <Text style={styles.sectionHeader}>{section.title}</Text>
                  </View>
                )}
                renderItem={({ item }) => {
                  if (item.type === "challengeHeader") {
                    const icon = topicIcons[item.topicKey] || topicIcons.politics;

                    return (
                      <Pressable onPress={() => toggleGroup(item.groupKey)}>
                        <LinearGradient
                          colors={[
                            "rgba(59, 7, 100, 0.95)",
                            "rgba(5, 0, 24, 0.98)",
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.challengeHeaderRow}
                        >
                          <View style={styles.challengeIconWrap}>
                            <Image source={icon} style={styles.challengeIcon} />
                          </View>

                          <View style={styles.challengeTextWrap}>
                            <Text style={styles.challengeHeader} numberOfLines={2}>
                              {item.title}
                            </Text>
                            <Text style={styles.challengeSubtext}>
                              {item.collapsed
                                ? "Tap to view coin activity"
                                : "Tap to collapse activity"}
                            </Text>
                          </View>

                          <View style={styles.expandPill}>
                            <Text style={styles.collapseIndicator}>
                              {item.collapsed ? "▶" : "▼"}
                            </Text>
                          </View>
                        </LinearGradient>
                      </Pressable>
                    );
                  }

                  const amount = formatAmount(item.amount);

                  return (
                    <View style={styles.txRow}>
                      <View style={styles.txIconWrap}>
                        <Image source={iconFor(item.type)} style={styles.txIcon} />
                      </View>

                      <View style={styles.txTextWrap}>
                        <Text style={styles.txType}>{labelFor(item.type)}</Text>

                        <Text style={styles.txDate}>
                          {formatDate(item.transaction_date)}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.amountPill,
                          {
                            backgroundColor: amount.bg,
                            borderColor: amount.border,
                          },
                        ]}
                      >
                        <Text style={[styles.txAmount, { color: amount.color }]}>
                          {amount.text}
                        </Text>
                      </View>
                    </View>
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
    backgroundColor: "rgba(5, 0, 24, 0.32)",
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
    marginBottom: 14,
  },

  listContainer: {
    flex: 1,
    backgroundColor: "rgba(5, 0, 24, 0.82)",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(216, 180, 255, 0.55)",
    overflow: "hidden",
  },

  listContent: {
    padding: 12,
    paddingBottom: 190,
  },

  sectionHeaderWrap: {
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 10,
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

  challengeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1.3,
    borderColor: "rgba(216, 180, 255, 0.45)",
  },

  challengeIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  challengeIcon: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },

  challengeTextWrap: {
    flex: 1,
  },

  challengeHeader: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },

  challengeSubtext: {
    color: "#00FFD1",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },

  expandPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 215, 0, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.65)",
    marginLeft: 8,
  },

  collapseIndicator: {
    color: "#FFD700",
    fontSize: 15,
    fontWeight: "900",
  },

  txRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 18,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  txIconWrap: {
    width: 43,
    height: 43,
    borderRadius: 21.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  txIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  txTextWrap: {
    flex: 1,
  },

  txType: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  txDate: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },

  amountPill: {
    minWidth: 76,
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 10,
  },

  txAmount: {
    fontSize: 14,
    fontWeight: "900",
  },

  loadingMore: {
    color: "white",
    textAlign: "center",
    padding: 20,
    opacity: 0.7,
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 0.78,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 52,
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