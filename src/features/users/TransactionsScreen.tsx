import React, { useEffect, useState } from "react";
import { View, Text, Image, SectionList, StyleSheet, LayoutAnimation, ImageBackground } from "react-native";
import { useRoute } from "@react-navigation/native";
import { apiGet } from "../../api/engineClient";

// Icons
import payoutIcon from "../../assets/images/payout.png";
import payoutSubIcon from "../../assets/images/payout-sub.png";
import betIcon from "../../assets/images/bet.png";

type Transaction = {
  id: string;
  amount: string;
  type: string;
  description: string | null;
  transaction_date: string;
  challenge_id: string | null;
  challenge_topic?: string | null;
};

type TransactionsRouteParams = {
  userId: string;
};

// -----------------------------
// Helpers
// -----------------------------

function formatAmount(amount: string) {
  const num = Number(amount);
  const isPositive = num > 0;

  return {
    text: `${isPositive ? "+" : ""}${num.toFixed(2)}`,
    color: isPositive ? "#4CAF50" : "#FF5252",
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

function iconFor(type: string) {
  switch (type) {
    case "payout":
      return payoutIcon;
    case "bet":
      return betIcon;
    default:
      return payoutSubIcon;
  }
}

function groupTransactionsByDay(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  function labelFor(date: string) {
    const d = new Date(date);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 7) return "Last Week";

    return "Older";
  }

  transactions.forEach((tx) => {
    const label = labelFor(tx.transaction_date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  });

  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

// -----------------------------
// Screen Component
// -----------------------------

export default function TransactionsScreen() {
  const route = useRoute();
  const { userId } = route.params as TransactionsRouteParams;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [grouped, setGrouped] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // -----------------------------
  // Initial load
  // -----------------------------
  async function loadInitial() {
    try {
      setInitialLoading(true);

      const data = await apiGet<{
        wallet_id: string;
        transactions: Transaction[];
        next_cursor: string | null;
      }>(`wallet/transactions/${userId}?limit=50`);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      setTransactions(data.transactions);
      setGrouped(groupTransactionsByDay(data.transactions));
      setNextCursor(data.next_cursor);
    } catch (err) {
      console.error("Failed to load wallet", err);
    } finally {
      setInitialLoading(false);
    }
  }

  // -----------------------------
  // Load more (pagination)
  // -----------------------------
  async function loadMore() {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);

    try {
      const data = await apiGet<{
        transactions: Transaction[];
        next_cursor: string | null;
      }>(
        `wallet/transactions/${userId}?cursor=${nextCursor}&limit=50`
      );

      const merged = [...transactions, ...data.transactions];

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      setTransactions(merged);
      setGrouped(groupTransactionsByDay(merged));
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

        {/* -----------------------------
            EMPTY STATE (no black panel)
        ------------------------------ */}
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

        {/* -----------------------------
            TRANSACTION LIST (with panel)
        ------------------------------ */}
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
                const { text, color } = formatAmount(item.amount);

                return (
                  <View style={styles.txRow}>
                    <Image source={iconFor(item.type)} style={styles.txIcon} />

                    <View style={{ flex: 1 }}>
                      <Text style={styles.txType}>
                        {item.type.toUpperCase()}
                      </Text>
                      <Text style={styles.txDesc}>{item.challenge_topic}</Text>
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
    marginBottom: 15,
    borderRadius: 20,
    overflow: "hidden",
  },
  sectionHeader: {
    color: "yellow",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 14,
    marginTop: 20,
    marginBottom: 8,
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
  txDesc: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginTop: -5,
  },
  txDate: {
    color: "rgba(255, 255, 255, 1.0)",
    fontSize: 14,
    marginTop: -5,
  },
  txAmount: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
    marginTop: -27,
  },
});