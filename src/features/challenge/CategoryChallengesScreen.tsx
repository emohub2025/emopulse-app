import { useEffect, useState } from 'react';
import { Image, ImageBackground, View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { useCycleTimer } from '../../components/CycleTimerContext';
import { useFeed } from "../../context/FeedContext";
import { getChallengeImageSource } from '../../assets/wacky/getChallengeImageSource';
import eventBus from '../../components/EventBus';
import { usePlayedChallenges } from '../../hooks/usePlayedChallenges';
import { useLiveSnapshot, normalizeEmotions } from "../../api/getLiveSnapshot";

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'CategoryChallenges'
>;

type RouteProps = RouteProp<RootStackParamList, 'CategoryChallenges'>;

// const EMOTION_COLORS: Record<string, string> = {
//   happy: "#00C46B",
//   angry: "#D7263D",
//   sad: "#2D6BFF",
//   anxious: "#A259FF",
// };

// const EMOTION_EMOJI: Record<string, string> = {
//   happy: "😊",
//   angry: "😡",
//   sad: "😢",
//   anxious: "😰",
// };

export default function CategoryChallengesScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { category } = route.params;
  const { formattedTime } = useCycleTimer();
  const isFocused = useIsFocused();
  const { feed } = useFeed();
  const [error] = useState<string | null>(null);

  const playedIds = usePlayedChallenges();
  const { snapshot } = useLiveSnapshot();

  if (!feed) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <Text style={{ color: "white" }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const categoryData = feed.categories.find(c => c.name === category);
  const active = categoryData?.active ?? [];
  const recent = categoryData?.recent ?? [];

  useEffect(() => {
    if (!isFocused) return;

    const handler = () => navigation.navigate('CategoryList');
    eventBus.on('cycleExpired', handler);

    return () => {
      eventBus.off('cycleExpired', handler);
    };
  }, [isFocused, navigation]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'white' }}>{error}</Text>
      </View>
    );
  }

  function enrichChallenge(ch: any) {
    snapshot.find(s => s.id === ch.id);
    //const live = snapshot.find(s => s.id === ch.id);
    //const emotions = live ? normalizeEmotions(live.main) : null;

    // if (!emotions) {
    //   return { ...ch, leadingEmotion: null, leadingPct: 0 };
    // }

    // const sorted = Object.entries(emotions).sort((a, b) => b[1].pct - a[1].pct);
    // const [winner, data] = sorted[0];

    return {
      ...ch,
//      leadingEmotion: winner,
//      leadingPct: Math.round(data.pct * 100),
    };
  }

  const enrichedActive = active.map(enrichChallenge);
  const enrichedRecent = recent.map(enrichChallenge);

  // --------------------------------------------------
  // CORRECT LOGIC:
  // Played = ONLY active challenges the user played
  // Active = active challenges NOT played
  // Recent = ALL recent challenges (played or not)
  // --------------------------------------------------

  const enrichedPlayed = enrichedActive.filter(ch =>
    playedIds.includes(ch.id)
  );

  const filteredActive = enrichedActive.filter(ch =>
    !playedIds.includes(ch.id)
  );

  // Sort previous challenges newest → oldest
  const sortedRecent = [...enrichedRecent].sort((a, b) => {
    const aTime = new Date(a.resolved_at || 0).getTime();
    const bTime = new Date(b.resolved_at || 0).getTime();

    if (bTime !== aTime) return bTime - aTime;

    const aArchive = new Date(a.archived_at || 0).getTime();
    const bArchive = new Date(b.archived_at || 0).getTime();

    if (bArchive !== aArchive) return bArchive - aArchive;

    // Final fallback: reverse ID order (ensures deterministic ordering)
    return b.id.localeCompare(a.id);
  });

  const filteredRecent = sortedRecent;

  // --------------------------------------------------
  // Build Sectioned List (Active → Played → Previous)
  // --------------------------------------------------
  const listData: any[] = [];

  // Active first
  if (filteredActive.length > 0) {
    listData.push({ type: "header", title: "Active Challenges" });
    filteredActive.forEach(ch =>
      listData.push({ type: "item", data: ch, section: "active" })
    );
  }

  // Played second
  if (enrichedPlayed.length > 0) {
    listData.push({ type: "header", title: "Played Challenges" });
    enrichedPlayed.forEach(ch =>
      listData.push({ type: "item", data: ch, section: "played" })
    );
  }

  // Previous last
  if (filteredRecent.length > 0) {
    listData.push({ type: "header", title: "Previous Challenges" });
    filteredRecent.forEach(ch =>
      listData.push({ type: "item", data: ch, section: "previous" })
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Text style={styles.topLabel}>{category}</Text>

          <View style={styles.content}>
            {listData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No Available Challenges</Text>
              </View>
            ) : (
              <FlatList
                data={listData}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => {
                  if (item.type === "header") {
                    return <Text style={styles.sectionHeader}>{item.title}</Text>;
                  }

                  const ch = item.data;
                  const played = playedIds.includes(ch.id);
                  const previous = item.section === "previous";

                  return (
                    <Pressable
                      style={styles.card}
                      onPress={() => {
                        if (played && !previous) {
                          navigation.navigate("ChallengeCountdown", { challengeId: ch.id });
                        } else {
                          navigation.navigate("ChallengeDetail", { challengeId: ch.id });
                        }
                      }}
                    >
                      <Image
                        source={getChallengeImageSource(ch)}
                        style={styles.topicImage}
                        resizeMode="contain"
                      />

                      <Text style={styles.title}>{ch.topic}</Text>
{/* 
                      {played && (
                        <View style={styles.progressRow}>
                          <Text style={{ fontSize: 26, marginRight: 8 }}>
                            {EMOTION_EMOJI[ch.leadingEmotion] || "❓"}
                          </Text>

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

                          <Text style={styles.percentText}>{ch.leadingPct}%</Text>
                        </View>
                      )} */}
                    </Pressable>
                  );
                }}
              />
            )}
          </View>

          <Text style={styles.timer}>{formattedTime}</Text>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#220d58',
    borderRadius: 12,
    marginLeft: 22,
    marginRight: 22,
    overflow: 'hidden',
    marginBottom: 16,
  },

  topicImage: {
    marginTop: 10,
    marginBottom: -10,
    width: '70%',
    height: 150,
    alignSelf: 'center',
  },

  title: {
    padding: 12,
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
  },

  sectionHeader: {
    color: 'yellow',
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    opacity: 0.9,
  },

  safe: {
    flex: 1,
    marginBottom: -35,
  },

  topLabel: {
    color: 'white',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 65,
    marginBottom: 5,
    paddingHorizontal: 20,
    textAlign: 'center',
  },

  content: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: -8,
    marginBottom: 10,
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

  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: -10,
  },
});