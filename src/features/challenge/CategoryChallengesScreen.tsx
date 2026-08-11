import { useEffect, useMemo, useState } from 'react';
import { Image, ImageBackground, Platform, View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { CycleTimerProvider, useCycleTimer } from '../../components/CycleTimerProvider';
import { useFeed } from "../../context/FeedContext";
import { getChallengeImageSource } from '../../assets/wacky/getChallengeImageSource';
import { usePlayedChallenges } from '../../hooks/usePlayedChallenges';
import { getFeedList } from '../../api/getFeedList';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'CategoryChallenges'
>;

type RouteProps = RouteProp<RootStackParamList, 'CategoryChallenges'>;
const isIOS = Platform.OS === "ios";

// -----------------------------
// Topic Icons
// -----------------------------
const categoryMeta: Record<string, { icon: any; label: string }> = {
  Politics: {
    icon: require("../../assets/icons/politics.png"),
    label: "Politics",
  },
  Sports: {
    icon: require("../../assets/icons/sports.png"),
    label: "Sports",
  },
  Entertainment: {
    icon: require("../../assets/icons/entertainment.png"),
    label: "Entertainment",
  },
  Tech: {
    icon: require("../../assets/icons/tech.png"),
    label: "Science & Technology",
  },
  Music: {
    icon: require("../../assets/icons/music.png"),
    label: "Music",
  },
  Finance: {
    icon: require("../../assets/icons/finance.png"),
    label: "Finance",
  },
  Gaming: {
    icon: require("../../assets/icons/gaming.png"),
    label: "Gaming",
  },
  Health: {
    icon: require("../../assets/icons/health.png"),
    label: "Health & Fitness",
  },
  Wacky: {
    icon: require("../../assets/icons/wacky.png"),
    label: "Wacky Pulse",   // ← your custom display name
  },
};

export default function CategoryChallenges() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { category } = route.params;
  const { rssFeed, setRssFeed } = useFeed();
  const { rss, applyCycleFromFeed } = useCycleTimer();
  const played = usePlayedChallenges();

  // ⭐ If feed is missing, redirect immediately
  if (!rssFeed) {
    navigation.navigate("CategoryList");
    return null;
  }

  // ⭐ Now feed is guaranteed to exist
  const categoryData = rssFeed.categories.find(c => c.name === category);

  if (!categoryData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <Text style={{ color: "white", textAlign: "center", marginTop: 40 }}>
          Category not found
        </Text>
      </SafeAreaView>
    );
  }
  //console.log("categoryData:" + JSON.stringify(categoryData, null, 2));
  //console.log("feed.categories:" + JSON.stringify(feed.categories, null, 2));
  //console.log("category:" + JSON.stringify(category, null, 2));

  // ⭐ Move async logic into useEffect
  useEffect(() => {
    async function ensureFreshFeed() {
      const cycle = rssFeed?.cycle;

      const needsReload =
        !cycle ||
        cycle.status === "expired";

      if (needsReload) {
        const feedResponse = await getFeedList("rss");
        setRssFeed(feedResponse);
      }
    }

    ensureFreshFeed();
  }, [rssFeed, setRssFeed]);

  // ⭐ Apply cycle from existing feed
  useEffect(() => {
    applyCycleFromFeed(rssFeed.cycle);
  }, [rssFeed, applyCycleFromFeed]);

  // ⭐ Timer display
  const formattedTime = rss?.formattedTime;
  useMemo(() => {
    if (!formattedTime) return "";
    const lower = formattedTime.toLowerCase();
    return lower === "expired" ? "Expired Challenges" : formattedTime;
  }, [formattedTime]);

  // ⭐ Active / recent RSS challenges
  const activeChallenges = categoryData.active;
  const recentChallenges = categoryData.recent;

  // ⭐ Normalize played IDs
  const playedChallengeIds = played.map(p =>
    typeof p === "string" ? p : p.challenge_id
  );

  // ⭐ Played = active challenges the user played
  const playedActive = activeChallenges.filter(ch =>
    playedChallengeIds.includes(ch.id)
  );

  // ⭐ Active = active challenges NOT played
  const unplayedActive = activeChallenges.filter(ch =>
    !playedChallengeIds.includes(ch.id)
  );

  // ⭐ Previous = resolved recent challenges
  const sortedRecent = [...recentChallenges].sort((a, b) => {
    const aTime = new Date(a.resolved_at || 0).getTime();
    const bTime = new Date(b.resolved_at || 0).getTime();

    if (bTime !== aTime) return bTime - aTime;

    const aArchive = new Date(a.archived_at || 0).getTime();
    const bArchive = new Date(b.archived_at || 0).getTime();

    if (bArchive !== aArchive) return bArchive - aArchive;

    return b.id.localeCompare(a.id);
  });

  // ⭐ Build Sectioned List
  const listData: any[] = [];

  // Active first
  if (unplayedActive.length > 0) {
    listData.push({ type: "header", title: "Active Challenges" });
    unplayedActive.forEach(ch =>
      listData.push({ type: "item", data: ch, section: "active" })
    );
  }

  // Played second — ONLY active challenges the user has played
  if (playedActive.length > 0) {
    listData.push({ type: "header", title: "Played Challenges" });
    playedActive.forEach(ch => {
      if (ch.resolved_at) return;
      listData.push({ type: "item", data: ch, section: "played" });
    });
  }

  // Previous last — resolved challenges
  if (sortedRecent.length > 0) {
    listData.push({ type: "header", title: "Previous Challenges" });
    sortedRecent.forEach(ch =>
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
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <View style={{ 
            flexDirection: "row", 
            alignItems: "center", 
            justifyContent: "center",
            marginTop: 0
          }}>
            <Image
              source={categoryMeta[category]?.icon}
              style={styles.icon}
            />
            <Text style={styles.topLabel}>
              {categoryMeta[category]?.label}
            </Text>
          </View>
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
                    return <Text style={styles.statusPill}>{item.title}</Text>;
                  }

                  const ch = item.data;
                  const played = playedChallengeIds.includes(ch.id);
                  const previous = item.section === "previous";
                  const isVideo = ch.source?.startsWith('YouTube');
                  const isPolling = ch.source === "polling";

                  return (
                    <Pressable
                      style={styles.card}
                      onPress={() => {
                        if (played && !previous) {
                          navigation.navigate("ChallengeCountdown", { challengeId: ch.id, from: "play" });
                        } else if (isPolling && !previous) {
                          navigation.navigate("PollingChallenge", { challengeId: ch.id });
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
                        {isVideo && (
                          <View style={styles.videoBadge}>
                            <Text style={styles.videoBadgeText}>
                              Video: {ch.source.replace('YouTube: ', '')}
                            </Text>
                          </View>
                        )}
                        {isPolling && (
                          <View style={styles.videoBadge}>
                            <Text style={styles.videoBadgeText}>
                              Polling Question
                            </Text>
                          </View>
                        )}
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
  safe: {
    flex: 1,
    marginBottom: -35,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  topLabel: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginTop: -5,
  },
  listContent: {
    paddingTop: 6,
    paddingBottom: 10,
  },
  sectionHeader: {
    color: 'yellow',
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(34, 13, 88, 0.66)',
    borderRadius: 30,
    marginLeft: 20,
    marginRight: 20,
    overflow: 'hidden',
    paddingTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  imageShell: {
    paddingTop: 8,
    paddingBottom: 0,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  topicImage: {
    marginTop: 4,
    marginBottom: -4,
    width: '72%',
    height: 150,
    alignSelf: 'center',
  },
  textBlock: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
  },
  title: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 15,
    fontSize: 19,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
  videoBadge: {
    alignSelf: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(102,255,102,0.14)',
    borderColor: 'rgba(102,255,102,0.4)',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  PollingBadgeText: {
    color: '#A8FF9F',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 0,
    marginBottom: 0,
    textAlign: 'center',
  },
  videoBadgeText: {
    color: '#A8FF9F',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 0,
    marginBottom: 0,
    textAlign: 'center',
  },
  statusPill: {
    marginTop: 20,
    marginBottom: 25,
    marginHorizontal: 40,
    backgroundColor: "rgba(255, 215, 0, 0.16)",
    textAlign: 'center',
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.75)",
    borderRadius: 999,
    paddingVertical: 5,
    fontSize: 21,
    color: "yellow",
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  emptyText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    marginHorizontal: 40,
    color: 'yellow',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    paddingTop: 5,
    marginBottom: -8,
    alignSelf: 'center',
  },
});
