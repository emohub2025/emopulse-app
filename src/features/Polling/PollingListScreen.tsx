import { CommonActions } from "@react-navigation/native";
import { useEffect, useState } from 'react';
import { Image, ImageBackground, View, Text, StyleSheet, FlatList, Pressable, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { PollTimerProvider, usePollTimer } from '../../components/TimerProviderPolls';
import { useFeed } from "../../context/FeedContext";
import { getFeedList } from "../../api/getFeedList";
import { getChallengeImageSource } from '../../assets/wacky/getChallengeImageSource';
import { usePlayedChallenges } from '../../hooks/usePlayedChallenges';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'PollingList'
>;

const CATEGORY_ORDER = [
  'Wacky',
  'Entertainment',
  'Politics',
  'Sports',
  'Tech',
  'Gaming',
  'Music',
  'Finance',
  'Health',
];

function sortByCategoryOrder(list: any[]) {
  return [...list].sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a.category);
    const indexB = CATEGORY_ORDER.indexOf(b.category);

    // If both categories are known, sort by index
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;

    // If only A is known, A goes first
    if (indexA !== -1) return -1;

    // If only B is known, B goes first
    if (indexB !== -1) return 1;

    // Fallback alphabetical
    return a.category.localeCompare(b.category);
  });
}

// -----------------------------
// Category Icons
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
    label: "Technology & Science",
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
    label: "Health",
  },
  Wacky: {
    icon: require("../../assets/icons/wacky.png"),
    label: "Wacky Pulse",   // ← your custom display name
  },
};

export function PollResults({ ch }: { ch: any }) {
  const results = ch.main?.poll_results ?? [];

  return (
    <View style={{ marginTop: 10, paddingHorizontal: 20 }}>
      <Text style={styles.polltitle}>Results</Text>

      {results.slice(0, 4).map((opt: any, i: number) => (
        <View key={i} style={{ marginBottom: 14, paddingHorizontal: 10 }}>
          
          {/* Percent + Answer */}
          <View style={{ flexDirection: "row", marginBottom: 4 }}>
            <Text style={{ color: 'white', fontSize: 18, width: 50 }}>
              {(opt.pct * 100).toFixed(0)}%
            </Text>

            <Text
              style={{ color: 'white', fontSize: 18, flex: 1, marginLeft: 8 }}
              ellipsizeMode="tail"
            >
              {ch.polling_answers?.[opt.index]}
            </Text>
          </View>

          {/* Progress bar */}
          <View
            style={{
              height: 10,
              backgroundColor: '#766e6e',
              borderRadius: 5,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${Math.max(opt.pct * 100, 1)}%`,
                height: '100%',
                backgroundColor: '#4da6ff',
                borderTopRightRadius: 5,
                borderBottomRightRadius: 5,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function PollingListScreen() {
  return (
    <PollTimerProvider>
      <PollingListScreenInner />
    </PollTimerProvider>
  );
}

function PollingListScreenInner() {
  const navigation = useNavigation<NavProp>();
  const { applyCycleFromFeed, formattedTime } = usePollTimer();
  const { setFeed } = useFeed();
  const playedIds = usePlayedChallenges();

  const [allActivePolls, setAllActivePolls] = useState<any[]>([]);
  const [allRecentPolls, setAllRecentPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load feed ONCE
  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const feed = await getFeedList("polling");
        if (!isActive) return;

        applyCycleFromFeed(feed.cycle);
        setFeed(feed);

        const active = feed.categories.flatMap(c =>
          c.active.filter(ch => ch.source === "polling")
        );

        const recent = feed.categories.flatMap(c =>
          c.recent.filter(ch => ch.source === "polling")
        );

        setAllActivePolls(active);
        setAllRecentPolls(recent);

      } finally {
        if (isActive) setLoading(false);
      }
    }

    load();
    return () => { isActive = false };
  }, [applyCycleFromFeed, setFeed]);

  useEffect(() => {
    const onBackPress = () => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "CategoryList" }],
        })
      );
      return true; // prevent default exit behavior
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove();
  }, [navigation]);

  // Always go back to the home screen and reset the navigation stack
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // Only intercept if the user is actually going BACK
      if (e.data.action.type === "GO_BACK") {
        e.preventDefault();
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "CategoryList" }],
          })
        );
      }
    });

    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <Text style={{ color: "white", textAlign: "center", marginTop: 40 }}>
          Loading polls…
        </Text>
      </SafeAreaView>
    );
  }

  // ⭐ Compute played + active dynamically (like RSS screen)
  const playedPolls = allActivePolls.filter(ch =>
    playedIds.includes(ch.id)
  );

  const activePolls = allActivePolls.filter(ch =>
    !playedIds.includes(ch.id)
  );

  const recentPolls = allRecentPolls;

  // ⭐ Sort them
  const finalActive = sortByCategoryOrder(activePolls);
  const finalPlayed = sortByCategoryOrder(playedPolls);
  const finalRecent = sortByCategoryOrder(recentPolls);

  // ⭐ Build listData
  const listData: any[] = [];

  if (finalActive.length > 0) {
    listData.push({ type: "header", title: "Active Polls" });
    finalActive.forEach(ch =>
      listData.push({ type: "item", data: ch, section: "active" })
    );
  }

  if (finalPlayed.length > 0) {
    listData.push({ type: "header", title: "Played Polls" });
    finalPlayed.forEach(ch => {
      if (ch.resolved_at) return;
      listData.push({ type: "item", data: ch, section: "played" });
    });
  }

  if (finalRecent.length > 0) {
    listData.push({ type: "header", title: "Recent Polls" });
    finalRecent.forEach(ch =>
      listData.push({ type: "recent", data: ch })
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safe} edges={['bottom']}>

          <View style={{ 
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 0,
            marginBottom: 20 
          }}>
            <Image
              source={require('../../assets/icons/polls.png')}
              style={styles.topIcon}
            />
            <Text style={styles.topLabel}>Polling</Text>
          </View>

          <View style={styles.content}>
            {listData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No Available Polls</Text>
              </View>
            ) : (
              <FlatList
                data={listData}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => {

                  // ⭐ Section header
                  if (item.type === "header") {
                    return <Text style={styles.sectionHeader}>{item.title}</Text>;
                  }

                  const ch = item.data;
                  const isPlayed = item.section === "played";
                  const isRecent = item.type === "recent";

                  // ⭐ Recent polls → show results
                  if (isRecent) {
                    return (
                      <Pressable style={styles.card}>
                        <View style={styles.categoryRow}>
                          <Image
                            source={categoryMeta[ch.category]?.icon}
                            style={styles.categoryIcon}
                          />
                          <Text style={styles.categoryLabel}>
                            {categoryMeta[ch.category]?.label}
                          </Text>
                        </View>

                        <Image
                          source={getChallengeImageSource(ch)}
                          style={styles.topicImage}
                          resizeMode="contain"
                        />

                        <Text style={styles.title}>{ch.topic}</Text>

                        <PollResults ch={ch} />
                      </Pressable>
                    );
                  }

                  // ⭐ Played polls → go to countdown
                  if (isPlayed) {
                    return (
                      <Pressable
                        style={styles.card}
                        onPress={() =>
                          navigation.navigate("ChallengeCountdown", { challengeId: ch.id, from: "play" })
                        }
                      >
                        <View style={styles.categoryRow}>
                          <Image
                            source={categoryMeta[ch.category]?.icon}
                            style={styles.categoryIcon}
                          />
                          <Text style={styles.categoryLabel}>
                            {categoryMeta[ch.category]?.label}
                          </Text>
                        </View>

                        <Image
                          source={getChallengeImageSource(ch)}
                          style={styles.topicImage}
                          resizeMode="contain"
                        />

                        <Text style={styles.title}>{ch.topic}</Text>
                      </Pressable>
                    );
                  }

                  // ⭐ Active polls → normal card
                  return (
                    <Pressable
                      style={styles.card}
                      onPress={() =>
                        navigation.navigate("PollingChallenge", { challengeId: ch.id })
                      }
                    >
                      <View style={styles.categoryRow}>
                        <Image
                          source={categoryMeta[ch.category]?.icon}
                          style={styles.categoryIcon}
                        />
                        <Text style={styles.categoryLabel}>
                          {categoryMeta[ch.category]?.label}
                        </Text>
                      </View>

                      <Image
                        source={getChallengeImageSource(ch)}
                        style={styles.topicImage}
                        resizeMode="contain"
                      />

                      <Text style={styles.title}>{ch.topic}</Text>
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
  },
  topIcon: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  topLabel: {
    color: 'white',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 5,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  sectionHeader: {
    color: 'yellow',
    fontSize: 21,
    fontWeight: '700',
    marginHorizontal: 40,
    backgroundColor: "rgba(255, 215, 0, 0.16)",
    textAlign: 'center',
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.75)",
    borderRadius: 999,
    paddingVertical: 5,
    marginTop: 10,
    marginBottom: 15,
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


  card: {
    backgroundColor: 'rgba(34, 13, 88, 0.66)',
    borderRadius: 30,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
    paddingTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  topicImage: {
    marginTop: 2,
    marginBottom: -4,
    width: '90%',
    height: 160,
    alignSelf: 'center',
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
  timer: {
    marginHorizontal: 40,
    color: 'yellow',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    paddingTop: 15,
    marginBottom: -2,
    alignSelf: 'center',
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  categoryIcon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
    marginRight: 8,
  },
  categoryLabel: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
  },
  polltitle: {
    textAlign: 'center',
    marginTop: -5,
    marginBottom: 15,
    color: '#A8FF9F',
    fontSize: 22,
    fontWeight: '500',
    backgroundColor: 'rgba(102,255,102,0.14)',
    borderColor: 'rgba(102,255,102,0.4)',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 1,
    paddingHorizontal: 12,
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
});
