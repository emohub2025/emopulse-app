import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, Animated, ScrollView, BackHandler } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import ButtonPanel from '../../components/ButtonPanel';
import { ChallengeResult, getChallengeResults } from '../../api/getChallengeResults';
import { useCycleTimer } from '../../components/CycleTimerContext';
import { LinearGradient } from "expo-linear-gradient";
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useCurrentUserId } from "../../state/useUserSelectors";

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
  delta: number;
}

const format = (n: number) => Number(n.toFixed(2));

interface SummaryCardProps {
  topic: string;
  category: string;
  totalDelta: number;
  totalPayout: number;
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
      <View style={styles.cardInner}>
        <View style={styles.summaryHeaderPill}>
          <Text style={styles.summaryHeaderPillText}>Challenge Summary</Text>
        </View>

        <View style={styles.summaryCategory}>
          <Image
            source={categoryIcons[categoryKey]}
            style={styles.icon}
          />
          <Text style={styles.category}>{category}</Text>
        </View>

        <View style={{ paddingHorizontal: 0 }}>
          <AutoShrinkBlock
            key={topic}
            height={100}
            fontWeight="700"
            minFontSize={12}
            maxFontSize={22}
            textAlign="center"
            fontStyle="italic"
          >
            {topic}
          </AutoShrinkBlock>
        </View>

        <Text style={styles.cardLabel}>Net Coins:</Text>
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
      colors={['#ff00cc', '#8a2be2', '#4b0082']}
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

        <Text style={styles.cardLabel}>Delta:</Text>
        <Text
          style={[
            styles.cardValue,
            { color: props.delta >= 0 ? 'lime' : 'gold' }
          ]}
        >
          {props.delta >= 0 ? `+${format(props.delta)}` : format(props.delta)}
        </Text>
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
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ChallengeResult | null>(null);
  const { isExpired, formattedTime } = useCycleTimer();
  const fetchedRef = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const bottomStatusText =
    formattedTime?.toLowerCase?.() === 'expired' ? 'Expired Challenges' : formattedTime;

  if (!effectiveId) {
    console.error("❌ ChallengeResults missing challenge or challenge.id:", challenge);
    return (
      <SafeAreaView style={dynamicStyles(!!fromHistory).safe}>
        <Text style={styles.loadingText}>Missing challenge data</Text>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: loading ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [loading, fadeAnim]);

  const fetchResults = async () => {
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
    if (fromHistory) {
      fetchResults();
      return;
    }

    if (isExpired) {
      fetchResults();
    }
  }, [fromHistory, isExpired, challenge?.id]);

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

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
        <SafeAreaView style={dynamicStyles(!!fromHistory).safe}>
          <View style={styles.resultsShell}>
            <ScrollView
              style={{ maxHeight: fromHistory ? '105%' : '96%' }}
              contentContainerStyle={styles.resultsScrollContent}
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
                    {totalBets > 1 && (
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

              {results?.user_main && !results.user_main.skipped && (
                <ResultCard
                  title="Main Challenge"
                  won={results.user_main.won}
                  skipped={results.user_main.skipped}
                  userChoice={results.user_main.emotion}
                  winningChoice={results.challenge.winning_emotion}
                  payout={results.user_main.payout}
                  delta={results.user_main.delta}
                />
              )}

              {results?.subchallenge_results
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
                    delta={sub.delta}
                  />
                ))}
            </ScrollView>
          </View>

          {!loading && !fromHistory && !isExpired && (
            <Text style={styles.timer}>{bottomStatusText}</Text>
          )}

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
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 20,
    marginBottom: fromHistory ? 0 : -50,
  }
});

const styles = StyleSheet.create({
  resultsShell: {
    backgroundColor: 'rgba(30,30,30,0.94)',
    paddingTop: 15,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 8,
    borderRadius: 18,
    marginTop: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  resultsScrollContent: {
    paddingBottom: 10,
  },
  summaryGradient: {
    marginBottom: 24,
  },
  summaryHeaderPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  summaryHeaderPillText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  summaryCategory: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    marginBottom: 2,
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
    width: 220,
    height: 99,
    resizeMode: 'cover',
    alignSelf: 'center',
    marginTop: 18,
    marginBottom: 12,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 7,
    marginRight: 7,
    textAlign: 'center',
  },
  cardLabel: {
    color: '#AAA',
    fontSize: 16,
    marginTop: 4,
    marginLeft: 24,
  },
  cardValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 24,
  },
  cardGradient: {
    borderRadius: 44,
    padding: 0,
    marginBottom: 20,
  },
  cardInner: {
    backgroundColor: 'rgba(0,0,0,0.35)',
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
});