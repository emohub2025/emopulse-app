import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, Animated, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import ButtonPanel from '../../components/ButtonPanel';
import { ChallengeResult, getBatchResults, getChallengeResults } from '../../api/getChallengeResults';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useCurrentUserId } from "../../state/useUserSelectors";
import { getEmotionLabel } from '../../utils/emotionList';
import { usePlayedChallenges } from '../../hooks/usePlayedChallenges';
import { CATEGORIES } from '../../navigation/types';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChallengeResults'
>;

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

function hexToRgba(hex: string, alpha: number) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type Category = keyof typeof CATEGORIES;

function normalizeCategory(category: string | undefined): Category {
  if (category && category in CATEGORIES) {
    return category as Category;
  }
  return "Politics";
}

interface ResultCardProps {
  title: string;
  won: boolean;
  skipped: boolean;
  userChoice: string | null;
  winningChoice: string | null;
  payout: number;
}

const format = (n: number) => Number(n.toFixed(2));

interface SummaryCardProps {
  topic: string;
  category: string;
  totalDelta: number;
  totalPayout: number;
}

function PollBreakdownCard({
  pollResults,
  winningAnswer
}: {
  pollResults: {
    text: string;
    count: number;
    index: number;
    percent: number;
  }[];
  winningAnswer: string | null;
}) {
  return (
    <View
      style={styles.cardGradient}
    >
      <View style={styles.cardInner}>
        <Text style={styles.headerPill}>
          Poll Breakdown
        </Text>

        {pollResults.slice(0,4)?.map(opt => {
          const isWinner = opt.text.toLowerCase() === winningAnswer?.toLowerCase();

          return (
            <View key={opt.index} style={{ marginBottom: 14, paddingHorizontal: 20 }}>
              <Text style={{ color: 'white', fontSize: 18, marginBottom: 2 }}>
                {opt.text}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                {/* Left-aligned percent */}
                <View style={{ width: 50, paddingRight: 10, alignItems: 'flex-start' }}>
                  <Text style={{ color: 'gold', fontSize: 16, fontWeight: '800' }}>
                    {opt.percent}%
                  </Text>
                </View>

                {/* Fixed-width bar */}
                <View
                  style={{
                    width: "85%",        // ⭐ fixed width for alignment
                    height: 12,
                    backgroundColor: '#010101ab',
                    borderRadius: 6,
                    overflow: 'hidden',
                    marginRight: 12,   // spacing before percent
                  }}
                >
                  <View
                    style={{
                      width: `${opt.percent}%`,
                      height: 12,
                      backgroundColor: isWinner ? 'lime' : 'red',
                    }}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function SummaryCard({
  topic,
  category,
  totalDelta,
  totalPayout
}: SummaryCardProps) {

  const categoryKey = normalizeCategory(category);
  const displayLabel = CATEGORIES[categoryKey].label;

  return (
    <View
      style={[
        styles.summaryGradient
      ]}
    >
      <View style={styles.summarycard}>
        <View style={styles.summaryCategory}>
          <Image
            source={categoryIcons[categoryKey] ?? null}
            style={styles.icon}
          />
          <Text style={styles.category}>{displayLabel}</Text>
        </View>

        <View style={{ paddingHorizontal: 5 }}>
          <AutoShrinkBlock
            key={topic}
            height={100}
            width={"100%"}
            fontWeight="700"
            minFontSize={12}
            maxFontSize={24}
            textAlign="center"
            fontStyle="italic"
            marginBottom={20}
          >
            {topic}
          </AutoShrinkBlock>
        </View>

        <Text style={[styles.cardLabel, { marginTop: -15 }]}>Net Coins:</Text>
        <Text
          style={[
            styles.cardValue,
            { color: 'white' }
          ]}
        >
          {totalDelta >= 0 ? `+${format(totalDelta)}` : format(totalDelta)}
        </Text>

        <Text style={styles.cardLabel}>Total Payout:</Text>
        <Text style={styles.cardValue}>
          {format(totalPayout)}
        </Text>
      </View>
    </View>
  );
}

function ResultCard(props: ResultCardProps) {
  const image = props.skipped
    ? null
    : props.won
      ? require('../../assets/images/winner.png')
      : require('../../assets/images/loser.png');

  return (
    <View
      style={styles.cardGradient}
    >
      <View style={styles.cardInner}>
        {image && <Image source={image} style={styles.cardImage} />}

        <Text style={styles.cardTitle}>{props.title}</Text>

        <Text style={styles.cardLabel}>Your Choice:</Text>
        <Text style={styles.cardValue}>{props.userChoice ?? '—'}</Text>

        <Text style={styles.cardLabel}>Winning Choice:</Text>
        <Text style={styles.cardValue}>{props.winningChoice ?? '—'}</Text>

        <Text style={styles.cardLabel}>Payout:</Text>
        <Text style={styles.cardValue}>{props.payout}</Text>
      </View>
    </View>
  );
}

export default function ChallengeResultsScreen() {
  const route = useRoute<any>();
  const { fromHistory, results: passedResults } = route.params || {};
  if (!route.params || !route.params.batchId) {
    console.log("❌ ResultsScreen mounted without params — exiting");
    return null;
  }
  const batchFetchedRef = useRef(false);
  const userId = useCurrentUserId();
  const played = usePlayedChallenges();
  const { challengeId } = route.params || {};

  const effectiveId =
    challengeId ??
    played[played.length - 1]?.challenge_id;

  // ⭐ ALL HOOKS MUST COME FIRST
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ChallengeResult[]>([]);
  const fetchedRef = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // If results were passed in, use them immediately
  useEffect(() => {
    if (passedResults) {
      setResults([passedResults]);
    }
  }, [passedResults]);

  // Fetch single challenge results for history and recent challenges
  useEffect(() => {
    if (!fromHistory) return;
    if (!effectiveId) return;

    if (fetchedRef.current || results.length > 0) return;
    fetchedRef.current = true;

    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await getChallengeResults(effectiveId, userId ?? undefined);
        setResults([data]);
      } catch (err) {
        console.log("❌ ERROR LOADING RESULT:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [effectiveId, userId, fromHistory]);

  // Fetch batch results from backend
  useEffect(() => {
    if (fromHistory) return;
    if (!userId) return;
    if (batchFetchedRef.current) return;

    let attempts = 0;
    const maxAttempts = 10;

    const tryFetch = async () => {
      // ⭐ STOP if results already exist
      if (results.length > 0) {
        console.log("✅ Results already loaded — stopping retry loop");
        setLoading(false);
        return;
      }

      const batchId = route.params?.batchId;

      if (!batchId) {
        console.log("❌ No batchId yet, retrying...");
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(tryFetch, 1000);
        } else {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const data = await getBatchResults(userId, batchId);

        if (data.status === "ok") {
          batchFetchedRef.current = true;
          setResults(data.results ?? []);
          setLoading(false);
        } else {
          console.log("❌ Results not ready, retrying...");
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(tryFetch, 1000);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.log("❌ Error fetching batch results:", err);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(tryFetch, 1000);
        } else {
          setLoading(false);
        }
      }
    };

    tryFetch();
  }, [fromHistory, userId, results.length]);

  // Fade animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: loading ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [loading, fadeAnim]);

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1, marginBottom: 72 }}
        resizeMode="cover"
      >
        <SafeAreaView style={dynamicStyles(!!fromHistory).safe} edges={['bottom']}>
          <View style={styles.resultsShell}>
            <ScrollView
              style={{ maxHeight: fromHistory ? '105%' : '96%' }}
              showsVerticalScrollIndicator={false}
            >
              {/* Empty state */}
              {!loading && results.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Results are not available yet.</Text>
                </View>
              )}

              {/* Render all results */}
              {results.map((res, idx) => {
                const challenge = res.challenge;
                const main = res.user_main;
                const subs = res.subchallenge_results || [];
                const isPolling = challenge?.source === "polling";

                const totalDelta =
                  (main?.delta || 0) +
                  subs.reduce((sum, s) => sum + s.delta, 0);

                const totalPayout =
                  (main?.payout || 0) +
                  subs.reduce((sum, s) => sum + s.payout, 0);
                
                const categoryKey = normalizeCategory(challenge.category) as Category;
                const backgroundColor = hexToRgba(CATEGORIES[categoryKey].color, 0.55);

                return (
                  <View key={idx} style={[styles.challengeResultContainer, { backgroundColor }]}>
                    {(isPolling || subs.length > 0) && (
                      <SummaryCard
                        topic={challenge.topic}
                        category={challenge.category}
                        totalDelta={totalDelta}
                        totalPayout={totalPayout}
                      />
                    )}

                    {!isPolling && main && !main.skipped && (
                      <ResultCard
                        title="Main Challenge"
                        won={main.won}
                        skipped={main.skipped}
                        userChoice={getEmotionLabel(main.emotion, challenge.category)}
                        winningChoice={getEmotionLabel(challenge.winning_emotion, challenge.category)}
                        payout={main.payout}
                      />
                    )}

                    {isPolling && main && (
                      <ResultCard
                        title="Polling Result"
                        won={main.won}
                        skipped={main.skipped}
                        userChoice={main.selected_answer}
                        winningChoice={challenge.winning_answer}
                        payout={main.payout}
                      />
                    )}

                    {isPolling && res.poll_results && (
                      <PollBreakdownCard
                        pollResults={res.poll_results}
                        winningAnswer={challenge.winning_answer}
                      />
                    )}

                    {!isPolling &&
                      subs
                        .filter(sub => !sub.skipped && sub.user_option_label)
                        .map(sub => (
                          <ResultCard
                            key={sub.subchallenge_id}
                            title={sub.question_text}
                            won={sub.won}
                            skipped={sub.skipped}
                            userChoice={sub.user_option_label}
                            winningChoice={sub.winning_option_label}
                            payout={sub.payout}
                          />
                        ))}
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <Animated.View
            pointerEvents={loading ? 'auto' : 'none'}
            style={[styles.loadingOverlay, { opacity: fadeAnim }]}
          >
            <Text style={styles.loadingText}>Loading challenge results…</Text>
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>

      <View>
        <ButtonPanel currentScreen={route.name} />
      </View>
    </View>
  );
}

export const dynamicStyles = (fromHistory: boolean) => ({
  safe: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 35,
    paddingHorizontal: 20,
    marginBottom: fromHistory ? -20 : -75,
  }
});

const styles = StyleSheet.create({
  challengeResultContainer: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 18,
    padding: 0,
    marginTop: 10,
    marginBottom: 25,
  },
  resultsShell: {
    backgroundColor: 'transparent',
    paddingTop: 0,
    borderRadius: 18,
    marginTop: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  summaryGradient: {
    marginBottom: 0,
    marginHorizontal: 0,
  },
  summarycard: {
    marginTop: 10,
    paddingBottom: 20,
  },
  summaryCategory: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
  },
  category: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 22,
    fontWeight: "600",
    marginLeft: 8,
  },
  icon: {
    width: 45,
    height: 45,
    marginRight: 6,
    resizeMode: "contain",
  },
  headerPill: {
    alignSelf: 'center',
    color: "white",
    fontSize: 20,
    textAlign: "center",
    width: '70%',
    backgroundColor: 'rgba(48, 23, 56, 0.44)',
    borderRadius: 22,
    paddingVertical: 6,
    marginBottom: 8,
  },
  cardImage: {
    width: 290,
    height: 60,
    resizeMode: 'stretch',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  cardTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    textAlign: 'center',
  },
  cardLabel: {
    textAlign: 'center',
    color: 'gold',
    fontSize: 18,
    marginTop: 4,
    marginLeft: 0,
  },
  cardValue: {
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 15,
    marginRight: 15,
  },
  cardGradient: {
    borderRadius: 0,
    padding: 0,
    marginBottom: 0,
  },
  cardInner: {
    borderRadius: 0,
    paddingBottom: 20,
    borderWidth: 0,
  },
  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyStateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    textAlign: 'center',
  },
});
