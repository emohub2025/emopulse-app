import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Image, ImageBackground, FlatList, Pressable, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLiveSnapshot, normalizeEmotions } from "../../api/getLiveSnapshot";
import { useFeed } from "../../context/FeedContext";
import ButtonPanel from "../../components/ButtonPanel";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  "LiveChallenges"
>;

type LiveChallenge = {
  id: string;
  topic: string;
  categoryName: string;
  leadingEmotion: string;
  leadingPct: number;
};

const CATEGORY_ORDER = [
  "Politics",
  "Sports",
  "Entertainment",
  "Music",
  "Tech",
  "Finance",
  "Gaming",
  "Health",
  "Wacky",
];

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

// --------------------------------------------------
// Emotion Maps
// --------------------------------------------------
const EMOTION_COLORS: Record<string, string> = {
  happy: "#00C46B",
  angry: "#D7263D",
  sad: "#2D6BFF",
  anxious: "#A259FF",
};

const EMOTION_EMOJI: Record<string, string> = {
  happy: "😊",
  angry: "😡",
  sad: "😢",
  anxious: "😰",
};

// --------------------------------------------------
// Embedded Card Component (hooks allowed here)
// --------------------------------------------------
function LiveChallengeCard({ ch }: { ch: LiveChallenge }) {
  const topic = (ch.topic || "").trim();
  const navigation = useNavigation<NavProp>();

  // Track previous leader
  const prevLeaderRef = useRef(ch.leadingEmotion);

  // Emoji animation
  const emojiOpacity = useRef(new Animated.Value(1)).current;
  const emojiTranslate = useRef(new Animated.Value(0)).current;

  // Glow animation
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const hasPredictions = ch.leadingPct > 0 && ch.leadingEmotion;

// Leader-change animation
  useEffect(() => {
    const newLeader = ch.leadingEmotion;
    const prevLeader = prevLeaderRef.current;

    if (newLeader !== prevLeader) {
      // Emoji fade/slide
      emojiOpacity.setValue(0);
      emojiTranslate.setValue(-8);

      Animated.parallel([
        Animated.timing(emojiOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(emojiTranslate, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      // Glow pulse
      glowOpacity.setValue(0.8);
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      prevLeaderRef.current = newLeader;
    }
  }, [ch.leadingEmotion]);

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate("ChallengeCountdown", { challengeId: ch.id, from: "live" })
      }
    >
      {/* Topic */}
      <Text style={styles.topic} numberOfLines={1} ellipsizeMode="tail">
        {topic}
      </Text>

      {/* Emoji + Bar + Percent */}
      <View style={styles.progressRow}>
        {hasPredictions ? (
          <>
            {/* Glow */}
            <Animated.View
              style={[
                styles.glow,
                {
                  opacity: glowOpacity,
                  backgroundColor: EMOTION_COLORS[ch.leadingEmotion],
                },
              ]}
            />

            {/* Emoji */}
            <Animated.Text
              style={{
                marginRight: 10,
                fontSize: 30,
                opacity: emojiOpacity,
                transform: [{ translateY: emojiTranslate }],
              }}
            >
              {EMOTION_EMOJI[ch.leadingEmotion] || "❓"}
            </Animated.Text>

            {/* Bar */}
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${ch.leadingPct}%`,
                    backgroundColor: EMOTION_COLORS[ch.leadingEmotion],
                  },
                ]}
              />
            </View>

            {/* Percent */}
            <Text style={styles.percentText}>{ch.leadingPct}%</Text>
          </>
        ) : (
          <View style={styles.noPredictionsContainer}>
            <Text style={styles.noPredictionsText}>No predictions</Text>
          </View>
        )}
      </View>

    </Pressable>
  );
}

// --------------------------------------------------
// Main Screen Component
// --------------------------------------------------
export default function LiveChallengesScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const { feed } = useFeed();
  const { snapshot } = useLiveSnapshot();

  if (!feed) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <Text style={{ color: "white" }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const categories = feed.categories;

  const allActive = categories.flatMap(cat =>
    cat.active.map(ch => ({
      ...ch,
      categoryName: cat.name,
    }))
  );

  const enriched = allActive.map(ch => {
    const live = snapshot.find(s => s.id === ch.id);
    const emotions = live ? normalizeEmotions(live.main) : null;

    if (!emotions) {
      return { ...ch, leadingEmotion: "—", leadingPct: 0 };
    }

    const sorted = Object.entries(emotions).sort((a, b) => b[1].pct - a[1].pct);
    const [winner, data] = sorted[0];

    return {
      ...ch,
      leadingEmotion: winner,
      leadingPct: Math.round(data.pct * 100),
    };
  });

  const grouped = categories
    .map(cat => ({
      category: cat.name,
      challenges: enriched.filter(ch => ch.categoryName === cat.name),
    }))
    .sort((a, b) => {
      return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    });

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Text style={styles.topLabel}>Live Challenge Results</Text>
          <View
            style={{
              flex: 1,
              backgroundColor: "black",
              marginTop: 15,
              marginLeft: 15,
              marginRight: 15,
              marginBottom: 30,
              borderRadius: 25,
            }}
          >
            <View style={{ flex: 1, paddingVertical: 15, marginTop: 10 }}>
              <FlatList
                data={grouped}
                keyExtractor={item => item.category}
                renderItem={({ item }) => (
                  <View style={{ marginBottom: 25 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, marginTop: -3 }}>
                      <Image
                        source={categoryIcons[item.category]}
                        style={styles.icon}
                      />
                      <Text style={styles.categoryHeader}>{item.category}</Text>
                    </View>
                    {item.challenges.length === 0 ? (
                      <Text style={styles.emptyText}>No active challenges</Text>
                    ) : (
                      item.challenges.map(ch => (
                        <LiveChallengeCard key={ch.id} ch={ch} />
                      ))
                    )}
                  </View>
                )}
              />
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <ButtonPanel currentScreen={route.name} />
    </View>
  );
}

// --------------------------------------------------
// Styles
// --------------------------------------------------
const styles = StyleSheet.create({
  topLabel: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 65,
    textAlign: "center",
  },
  categoryHeader: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 20,
    marginBottom: 0,
  },
  emptyText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    marginLeft: 20,
  },
  card: {
    backgroundColor: "#220d58",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderColor: "#ed84df",
    borderWidth: 1.25,
  },
  icon: {
    width: 40,
    height: 40,
    marginTop: 0,
    marginLeft: 20,
    marginRight: 0,
    resizeMode: "contain",
  },
  topic: {
    marginTop: -5,
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: -8,
    position: "relative",
  },
  glow: {
    position: "absolute",
    left: 30,
    right: 55,
    height: 10,
    borderRadius: 6,
  },
  progressBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
    overflow: "hidden",
    marginRight: 4,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  percentText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    width: 45,
    textAlign: "right",
  },
  noPredictionsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },

  noPredictionsText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    fontWeight: "600",
  },
});