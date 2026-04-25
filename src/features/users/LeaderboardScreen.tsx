import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ButtonPanel from "../../components/ButtonPanel";
import { getLeaderboard, LeaderboardUser } from "../../api/engineClient";

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadLeaderboard(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      const data = await getLeaderboard();
      setLeaders(data);
    } catch (err: any) {
      console.log("❌ Failed to load leaderboard:", err);
      setError(err?.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const renderLeader = ({ item }: { item: LeaderboardUser }) => {
    const isTopThree = item.rank <= 3;

    return (
      <LinearGradient
        colors={
          item.rank === 1
            ? ["#FFD700", "#FF8C00"]
            : item.rank === 2
            ? ["#D8D8FF", "#8A7CFF"]
            : item.rank === 3
            ? ["#FF9F68", "#B85CFF"]
            : ["#221044", "#080018"]
        }
        style={[styles.card, isTopThree && styles.topCard]}
      >
        <Text style={styles.rank}>#{item.rank}</Text>

        <Image
          source={
            item.avatar_url
              ? { uri: item.avatar_url }
              : require("../../assets/buttons/panel-account.png")
          }
          style={styles.avatar}
        />

        <View style={styles.userInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {item.display_name}
          </Text>

          <Text style={styles.stats}>
            🪙 {item.coin_balance} Coins
          </Text>

          <Text style={styles.stats}>
            🏆 {item.wins} Wins
          </Text>
        </View>

        {item.rank === 1 && <Text style={styles.crown}>👑</Text>}
      </LinearGradient>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <Text style={styles.subtitle}>Top 20 players in EmoPulse</Text>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading champions...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.hintText}>Pull down to try again.</Text>
        </View>
      ) : (
        <FlatList
          data={leaders}
          keyExtractor={(item) => item.user_id}
          renderItem={renderLeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadLeaderboard(true)}
              tintColor="#FFD700"
            />
          }
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Text style={styles.emptyText}>No players yet.</Text>
            </View>
          }
        />
      )}

      <ButtonPanel currentScreen="Leaderboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050018",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120,
  },
  title: {
    color: "#FFD700",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 15,
    opacity: 0.85,
    textAlign: "center",
    marginBottom: 18,
  },
  list: {
    paddingBottom: 160,
  },
  card: {
    minHeight: 82,
    borderRadius: 22,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  topCard: {
    minHeight: 92,
  },
  rank: {
    width: 42,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  userInfo: {
    flex: 1,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 3,
  },
  stats: {
    color: "#FFFFFF",
    fontSize: 13,
    opacity: 0.92,
  },
  crown: {
    fontSize: 28,
    marginLeft: 8,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 120,
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 12,
    fontSize: 15,
  },
  errorText: {
    color: "#FF5C8A",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "700",
  },
  hintText: {
    color: "#FFFFFF",
    opacity: 0.75,
    marginTop: 8,
  },
  emptyText: {
    color: "#FFFFFF",
    fontSize: 16,
    opacity: 0.8,
  },
});