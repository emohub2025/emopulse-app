// src/features/users/LeaderboardScreen.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ButtonPanel from "../../components/ButtonPanel";
import { getLeaderboard, LeaderboardUser } from "../../api/engineClient";

function AnimatedCoins({ value, style }: { value: number; style?: any }) {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 900;
    const startTime = Date.now();

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(value * eased);

      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    animate();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  return <Text style={style}>🪙 {displayValue.toLocaleString()} Coins</Text>;
}

function getTier(coins: number) {
  if (coins > 500) {
    return { label: "Intelligent Genius", color: "#00FFD1", emoji: "🧠" };
  }

  if (coins > 300) {
    return { label: "Somewhat Intelligent", color: "#FFD700", emoji: "⚡" };
  }

  if (coins > 200) {
    return { label: "Average", color: "#C0C0C0", emoji: "🎯" };
  }

  if (coins > 100) {
    return { label: "Still Learning", color: "#CD7F32", emoji: "📘" };
  }

  return { label: "BabyPhase", color: "#FF6EC7", emoji: "🍼" };
}

function getCardGradient(rank: number): [string, string] {
  if (rank === 1) return ["#FFB000", "#FF2DAA"];
  if (rank === 2) return ["#0F172A", "#38BDF8"];
  if (rank === 3) return ["#312E81", "#A78BFA"];
  return ["#1A0033", "#050018"];
}

function getRankEmoji(rank: number) {
  if (rank === 1) return "👑";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "";
}

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const glowAnim = useRef(new Animated.Value(0)).current;
  const legendaryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(legendaryAnim, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(legendaryAnim, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [glowAnim, legendaryAnim]);

  async function loadLeaderboard(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await getLeaderboard();
      setLeaders(data);
    } catch (err) {
      console.log("❌ Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const champion = leaders[0];

  const totalCoins = useMemo(() => {
    return leaders.reduce((sum, p) => sum + Number(p.coin_balance || 0), 0);
  }, [leaders]);

  const renderLeader = ({ item }: { item: LeaderboardUser }) => {
    const tier = getTier(item.coin_balance);
    const gradient = getCardGradient(item.rank);
    const rankEmoji = getRankEmoji(item.rank);
    const isLegendary = item.rank === 1;

    const legendaryShadowOpacity = legendaryAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.25, 0.75],
    });

    const legendaryShadowRadius = legendaryAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [8, 20],
    });

    const legendaryBorderColor = legendaryAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(255, 215, 0, 0.45)", "rgba(255, 255, 255, 0.95)"],
    });

    const cardContent = (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, isLegendary && styles.legendaryCard]}
      >
        {isLegendary && (
          <View style={styles.legendaryBadge}>
            <Text style={styles.legendaryBadgeText}>LEGENDARY</Text>
          </View>
        )}

        <View style={styles.rankBox}>
          <Text style={[styles.rank, isLegendary && styles.legendaryRank]}>
            #{item.rank}
          </Text>
        </View>

        <Image
          source={
            item.avatar_url
              ? { uri: item.avatar_url }
              : require("../../assets/buttons/panel-account.png")
          }
          style={[styles.avatar, isLegendary && styles.legendaryAvatar]}
        />

        <View style={styles.info}>
          <Text
            style={[styles.name, isLegendary && styles.legendaryName]}
            numberOfLines={1}
          >
            {item.display_name}
          </Text>

          <AnimatedCoins
            value={item.coin_balance}
            style={[styles.coins, isLegendary && styles.legendaryCoins]}
          />

          <Text style={[styles.tier, { color: tier.color }]}>
            {tier.emoji} {tier.label}
          </Text>
        </View>

        {rankEmoji ? <Text style={styles.sideEmoji}>{rankEmoji}</Text> : null}
      </LinearGradient>
    );

    if (!isLegendary) {
      return cardContent;
    }

    return (
      <Animated.View
        style={[
          styles.legendaryWrapper,
          {
            shadowOpacity: legendaryShadowOpacity,
            shadowRadius: legendaryShadowRadius,
            borderColor: legendaryBorderColor,
          },
        ]}
      >
        {cardContent}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <Text style={styles.subtitle}>Climb the ranks. Stack the coins.</Text>

      {champion && (
        <Animated.View
          style={[
            styles.spotlightWrapper,
            {
              shadowOpacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.7],
              }),
              shadowRadius: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 18],
              }),
              shadowColor: "#00FF9C",
            },
          ]}
        >
          <LinearGradient
            colors={["#00C853", "#00E676"]}
            style={styles.spotlight}
          >
            <Text style={styles.spotlightLabel}>Current Champion</Text>

            <View style={styles.spotlightRow}>
              <Image
                source={
                  champion.avatar_url
                    ? { uri: champion.avatar_url }
                    : require("../../assets/buttons/panel-account.png")
                }
                style={styles.spotlightAvatar}
              />

              <View style={styles.spotlightInfo}>
                <Text style={styles.spotlightName} numberOfLines={1}>
                  👑 {champion.display_name}
                </Text>
                <AnimatedCoins
                  value={champion.coin_balance}
                  style={styles.spotlightCoins}
                />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      <View style={styles.statsBar}>
        <View style={styles.statPill}>
          <AnimatedCoins value={totalCoins} style={styles.statValue} />
          <Text style={styles.statLabel}>Total Coins Wrecked</Text>
        </View>

        <View style={styles.statPill}>
          <Text style={styles.statValue}>Top 20</Text>
          <Text style={styles.statLabel}>All-Time</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : (
        <FlatList
          data={leaders}
          keyExtractor={(item) => item.user_id}
          renderItem={renderLeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadLeaderboard(true)}
              tintColor="#FFD700"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 190 }}
        />
      )}

      <View style={styles.bottomSafeArea} />
      <ButtonPanel currentScreen="Leaderboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050018",
    paddingHorizontal: 16,
    paddingTop: 42,
  },

  title: {
    color: "#FFD700",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    color: "#FFF",
    textAlign: "center",
    marginBottom: 14,
  },

  spotlightWrapper: {
    borderRadius: 22,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },

  spotlight: {
    borderRadius: 20,
    padding: 12,
  },

  spotlightLabel: {
    color: "#003B1F",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 6,
  },

  spotlightName: {
    color: "#002B16",
    fontWeight: "900",
    fontSize: 16,
  },

  spotlightCoins: {
    color: "#003B1F",
    fontWeight: "900",
  },

  spotlightRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  spotlightAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#00E676",
  },

  spotlightInfo: {
    flex: 1,
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

  legendaryWrapper: {
    borderRadius: 24,
    marginBottom: 12,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
    borderWidth: 1.5,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 22,
    marginBottom: 12,
    overflow: "hidden",
  },

  legendaryCard: {
    marginBottom: 0,
    paddingTop: 20,
    borderWidth: 0,
  },

  legendaryBadge: {
    position: "absolute",
    top: 5,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },

  legendaryBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  rankBox: {
    width: 40,
  },

  rank: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
  },

  legendaryRank: {
    color: "#FFFFFF",
    fontSize: 20,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
  },

  legendaryAvatar: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  info: {
    flex: 1,
  },

  name: {
    color: "#FFF",
    fontWeight: "900",
  },

  legendaryName: {
    color: "#FFFFFF",
    fontSize: 16,
  },

  coins: {
    color: "#FFD700",
    fontWeight: "900",
  },

  legendaryCoins: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  tier: {
    fontSize: 12,
    fontWeight: "900",
  },

  sideEmoji: {
    fontSize: 30,
    marginLeft: 8,
  },

  bottomSafeArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    backgroundColor: "#050018",
  },

  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});