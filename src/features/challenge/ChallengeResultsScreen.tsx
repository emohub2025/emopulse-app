import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, Animated, ScrollView, BackHandler, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import ButtonPanel from '../../components/ButtonPanel';
import { ChallengeResult, getChallengeResults } from '../../api/getChallengeResults';
import { LinearGradient } from "expo-linear-gradient";
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useCurrentUserId } from "../../state/useUserSelectors";
import { getEmotionLabel } from '../../utils/emotionList';

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
    <LinearGradient
      colors={[
        'rgba(255, 0, 204, 0.7)',
        'rgba(138, 43, 226, 0.5)',
        'rgba(75, 0, 130, 0.2)'
      ]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.cardGradient}
    >
      <View style={styles.cardInner}>
        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: '700',
            textAlign: 'center',
            marginTop: 16,
            marginBottom: 10
          }}
        >
          Poll Breakdown
        </Text>

        {pollResults.slice(0,4)?.map(opt => {
          const isWinner = opt.text.toLowerCase() === winningAnswer?.toLowerCase();

          return (
            <View key={opt.index} style={{ marginBottom: 14, paddingHorizontal: 20 }}>
              <Text style={{ color: 'white', fontSize: 18, marginBottom: 4 }}>
                {opt.text} — {opt.percent}%
              </Text>

              <View
                style={{
                  height: 8,
                  backgroundColor: '#333',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}
              >
                <View
                  style={{
                    width: `${opt.percent}%`,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: isWinner ? 'lime' : 'red'
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </LinearGradient>
  );
}

function SummaryCard({
  topic,
  category,
  totalDelta,
  totalPayout
}: SummaryCardProps) {
  const categoryKey = category ?? "politics";

  return (
    <LinearGradient
      colors={['#ff00cc', '#8a2be2', '#4b0082']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.cardGradient, styles.summaryGradient]}
    >
      <View style={styles.summarycard}>
        <View style={styles.summaryHeaderPill}>
          <Text style={styles.summaryHeaderPillText}>Challenge Summary</Text>
        </View>

        <View style={styles.summaryCategory}>
          <Image
            source={categoryIcons[categoryKey] ?? null}
            style={styles.icon}
          />
          <Text style={styles.category}>{category}</Text>
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

        <Text style={[styles.cardLabel, { marginTop: -22 }]}>Net Coins:</Text>
        <Text
          style={[
            styles.cardValue,
            { color: totalDelta >= 0 ? 'lime' : 'gold' }
          ]}
        >
          {totalDelta >= 0 ? `+${format(totalDelta)}` : format(totalDelta)}
        </Text>

        <Text style={styles.cardLabel}>Total Payout:</Text>
        <Text style={styles.cardValue}>
          {format(totalPayout)}
        </Text>
      </View>
    </LinearGradient>
  );
}

function ResultCard(props: ResultCardProps) {
  const image = props.skipped
    ? null
    : props.won
      ? require('../../assets/images/winner.png')
      : require('../../assets/images/loser.png');

  return (
    <LinearGradient
      colors={[ 'rgba(255, 0, 204, 0.7)', 'rgba(138, 43, 226, 0.5)', 'rgba(75, 0, 130, 0.2)' ]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
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
    </LinearGradient>
  );
}

export default function ChallengeResultScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<any>();
  const { challenge, challengeId, fromHistory } = route.params || {};
  const effectiveId = challenge?.id ?? challengeId;
  const userId = useCurrentUserId();

  // ⭐ ALL HOOKS MUST COME FIRST
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ChallengeResult | null>(null);
  const fetchedRef = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: loading ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [loading, fadeAnim]);

  const fetchResults = async () => {
    if (!effectiveId) return;              // ⭐ guard here
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    try {
      setLoading(true);
      const data = await getChallengeResults(effectiveId, userId ?? undefined);
      setResults(data);
    } catch (err) {
      console.log("❌ ERROR LOADING RESULT:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always fetch as soon as we have a valid challenge ID.
    if (!effectiveId) return;             // ⭐ guard here
    fetchResults();
  }, [effectiveId, userId]);

  useEffect(() => {
    if (fromHistory) return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      navigation.reset({
        index: 0,
        routes: [{ name: "CategoryList" }],
      });
      return true;
    });

    return () => sub.remove();
  }, [fromHistory, navigation]);

  //console.log("📦 Challenge param:", results?.challenge);

  const isPolling = results?.challenge?.source === "polling";
  //console.log("❌IS POLLING:", isPolling);

  // ⭐ EARLY RETURN — SAFE NOW (AFTER ALL HOOKS)
  if (!effectiveId) {
    console.log("❌ ChallengeResults missing challenge or challenge.id:", challenge);
    return (
      <SafeAreaView style={dynamicStyles(!!fromHistory).safe} edges={['bottom']}>
        <Text style={styles.loadingText}>Missing challenge data</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
        <SafeAreaView style={dynamicStyles(!!fromHistory).safe} edges={['bottom']}>
          <View style={styles.resultsShell}>
            <ScrollView
              style={{ maxHeight: fromHistory ? '105%' : '96%' }}
              showsVerticalScrollIndicator={false}
            >
              {results && (() => {
                const main = results.user_main;
                const subs = results.subchallenge_results || [];
                const totalBets = 1 + subs.length;

                const totalDelta =
                  (main?.delta || 0) +
                  subs.reduce((sum, s) => sum + s.delta, 0);

                const totalPayout =
                  (main?.payout || 0) +
                  subs.reduce((sum, s) => sum + s.payout, 0);

                return (
                  <>
                    {(isPolling || totalBets > 1) && (
                      <SummaryCard
                        topic={results.challenge.topic}
                        category={results.challenge.category}
                        totalDelta={totalDelta}
                        totalPayout={totalPayout}
                      />
                    )}
                  </>
                );
              })()}

              {!isPolling && results?.user_main && !results.user_main.skipped && (
                <ResultCard
                  title="Main Challenge"
                  won={results.user_main.won}
                  skipped={results.user_main.skipped}
                  userChoice={getEmotionLabel(
                    results.user_main.emotion,
                    results.challenge.category
                  )}
                  winningChoice={getEmotionLabel(
                    results.challenge.winning_emotion,
                    results.challenge.category
                  )}
                  payout={results.user_main.payout}
                />
              )}              
              {isPolling && results?.user_main && (
                <ResultCard
                  title="Polling Result"
                  won={results.user_main.won}
                  skipped={results.user_main.skipped}
                  userChoice={results.user_main.selected_answer}
                  winningChoice={results.challenge.winning_answer}
                  payout={results.user_main.payout}
                />
              )}

              {isPolling && results?.poll_results && (
                <PollBreakdownCard
                  pollResults={results.poll_results}
                  winningAnswer={results.challenge.winning_answer}
                />
              )}

              {!isPolling && results?.subchallenge_results
                ?.filter(sub => !sub.skipped && sub.user_option_label)
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

              {!loading && !results && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Results are not available yet.</Text>
                </View>
              )}
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
    paddingBottom: 50,
    paddingHorizontal: 20,
    marginBottom: fromHistory ? -20 : -75,
  }
});

const styles = StyleSheet.create({
  resultsShell: {
    backgroundColor: 'transparent',
    paddingTop: 0,
    borderRadius: 18,
    marginTop: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  summaryGradient: {
    marginBottom: 24,
    marginHorizontal: 15,
  },
  summarycard: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 42,
    paddingBottom: 20,
    borderWidth: 3,
    borderColor: '#ed84df',
  },
  summaryHeaderPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(194, 139, 210, 0.54)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  summaryHeaderPillText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  summaryCategory: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
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
  cardImage: {
    width: 270,
    height: 65,
    resizeMode: 'cover',
    alignSelf: 'center',
    marginTop: 18,
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
    color: '#AAA',
    fontSize: 16,
    marginTop: 4,
    marginLeft: 44,
  },
  cardValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 60,
    marginRight: 10,
  },
  cardGradient: {
    borderRadius: 44,
    padding: 0,
    marginBottom: 20,
  },
  cardInner: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 42,
    paddingBottom: 20,
    borderWidth: 3,
    borderColor: '#ed84df',
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
