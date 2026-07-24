import React, { useEffect, useState, useRef } from 'react';
import { Platform, View, Text, Image, ImageBackground, StyleSheet, Pressable, BackHandler, TextInput, Animated, KeyboardAvoidingView, ScrollView, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePollTimer } from '../../components/TimerProviderPolls';
import { useRssTimer } from '../../components/TimerProviderEmotion';
import { useLiveSnapshot, normalizeEmotions, type EnrichedLiveSnapshotItem } from '../../api/getLiveSnapshot';
import activeButton from '../../assets/buttons/active.png';
import activePollButton from '../../assets/buttons/active-polls.png';
import sendButton from '../../assets/buttons/send.png';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useFeed } from '../../context/FeedContext';
import { emotionLookup, emotionSlotMap } from '../../utils/emotionList';
import { ChallengeComment, fetchComments, postComment } from '../../api/challengeComments';
import { Dimensions } from "react-native";

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ChallengeCountdown'>;
const isIOS = Platform.OS === "ios";

function useChallengeTimer(liveChallenge : EnrichedLiveSnapshotItem | undefined) {
  const isPoll = liveChallenge?.isPoll === true;
  const timer = isPoll ? usePollTimer() : useRssTimer();
  //console.log("📦 isPoll:", isPoll);
  //console.log("📦 liveChallenge:", liveChallenge);

  return {
    ...timer,
    isPoll,   // ⭐ expose the correct value
  };
}

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */
function normalizeTo100(emotions: any) {
  const total =
    emotions.happy.pct +
    emotions.angry.pct +
    emotions.sad.pct +
    emotions.anxious.pct;

  if (total === 0) return emotions;

  return {
    happy: { ...emotions.happy, pct: emotions.happy.pct / total },
    angry: { ...emotions.angry, pct: emotions.angry.pct / total },
    sad: { ...emotions.sad, pct: emotions.sad.pct / total },
    anxious: { ...emotions.anxious, pct: emotions.anxious.pct / total },
  };
}

function wobblePct(pct: number) {
  if (pct === 0) pct = 0.1;
  const wobble = Math.random() * 0.06 - 0.03;
  let next = pct + wobble;
  next = Math.max(0.01, Math.min(0.99, next));
  return next;
}

function truncate(text: string, max: number) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

/* -------------------------------------------------------
   Progress Bar
------------------------------------------------------- */
type ProgressBarProps = {
  label: string;
  pct: number; // 0–1
  count: number;
  color: string;
  labelColor?: string;
};

const ProgressBar = ({ label, pct, color, labelColor }: ProgressBarProps) => {
  const barWidth = Math.max(pct * 100, 1);

  return (
    <View style={{ marginVertical: 13 }}>
      <View style={{ position: 'relative', height: 20, justifyContent: 'center' }}>
        
        {/* Background bar */}
        <View
          style={{
            height: 30,
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.2)',
            overflow: 'hidden',
          }}
        >
          {/* Fill bar */}
          <View
            style={{
              width: `${barWidth}%`,
              height: '100%',
              borderRadius: 12,
              backgroundColor: color,
            }}
          />
        </View>

        {/* Overlay text */}
        <Text
          style={{
            position: 'absolute',
            width: '100%',
            textAlign: 'left',
            color: labelColor || color,
            fontSize: 18,
            fontWeight: '700',
            paddingVertical: -1,
            paddingLeft: 10,
          }}
        >
          {label} — {Math.round(pct * 100)}%
        </Text>
      </View>
    </View>
  );
};

/* -------------------------------------------------------
   ⭐ Main Screen (emotion + polling + comments)
------------------------------------------------------- */
export default function ChallengeCountdownScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<any>();
  const from = route.params?.from;
  //console.log("📦 from:", from);
  const { challengeId } = route.params;
  const { feed, setSuppressGlobalReset } = useFeed();
  const SCREEN_HEIGHT = Dimensions.get("window").height - 250;   // 68 should be height of logo
  const [bottomBarHeight, setBottomBarHeight] = useState(0);

  /* -------------------------------------------------------
     ⭐ ALL HOOKS MUST COME FIRST
     (before ANY early return, before using feed/challenge)
  ------------------------------------------------------- */

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const { snapshot } = useLiveSnapshot();
  //console.log("snapshot:", snapshot);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(1)).current;

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<ChallengeComment[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const commentsRef = useRef(comments);
  const scrollRef = useRef<ScrollView>(null);

  const [wEmotion, setWEmotion] = useState({
    happy: { pct: 0, count: 0 },
    angry: { pct: 0, count: 0 },
    sad: { pct: 0, count: 0 },
    anxious: { pct: 0, count: 0 },
  });

  const isResettingRef = useRef(false);

  async function handlePostComment() {
    if (!commentText.trim()) return;

    try {
      await postComment(challengeId, commentText.trim());
      setCommentText("");
      const list = await fetchComments(challengeId);
      setComments(list);
      Keyboard.dismiss();
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      });
    } catch (err: any) {
      console.log("❌ Post comment failed:", err);
    }
  }

  function handleCommentFocus() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }

  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        if (!challengeId) return; // ⭐ guard
        const list = await fetchComments(challengeId);
        if (mounted) setComments(list);
      } catch (err) {
        console.log("Fetch comments error:", err);
      }
    }

    load();
    const interval = setInterval(load, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [challengeId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const list = commentsRef.current;
      if (list.length === 0) return;
      setCurrentIndex(prev => (prev + 1) % list.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(-10);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex]);

  useEffect(() => {
    // Tell FeedProvider NOT to reset to CategoryList
    setSuppressGlobalReset(true);

    return () => {
      // Restore default behavior when leaving this screen
      setSuppressGlobalReset(false);
    };
  }, []);

  useEffect(() => {
    if (from !== "play") {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }
  }, [from]);

  let isPoll = false;
  let pollData = [];
  let paddedPollData = [];
  let polling_answers = [];
  let rawEmotion = null;
  let isWacky = false;
  let wobbled = null;

  /* -------------------------------------------------------
     ⭐ SAFE TO USE feed NOW
  ------------------------------------------------------- */
  const challenge = feed?.categories
    .flatMap(c => [...c.active, ...c.recent])
    .find(ch => ch.id === challengeId);

  /* -------------------------------------------------------
     Live snapshot (enriched)
  ------------------------------------------------------- */
  const liveChallenge = snapshot?.find(
    (item: EnrichedLiveSnapshotItem) => item.id === challenge?.id
  );

  const { formattedTime } = useChallengeTimer(liveChallenge);

  /* -------------------------------------------------------
     Polling data
  ------------------------------------------------------- */
  isPoll = liveChallenge?.isPoll === true;
  pollData = isPoll && liveChallenge?.pollResults ? liveChallenge.pollResults : [];

  // ⭐ Ensure 4 poll options always exist
  paddedPollData = [...pollData];
  while (paddedPollData.length < 4) {
    paddedPollData.push({ index: paddedPollData.length, pct: 0 });
  }

  polling_answers = challenge?.polling_answers ?? [];

  /* -------------------------------------------------------
     Emotion Data
  ------------------------------------------------------- */
  rawEmotion =
    !isPoll && liveChallenge
      ? normalizeEmotions(liveChallenge.main)
      : {
          angry: { pct: 0, count: 0 },
          happy: { pct: 0, count: 0 },
          sad: { pct: 0, count: 0 },
          anxious: { pct: 0, count: 0 },
        };

  isWacky =
    challenge?.category === 'Wacky' ||
    (typeof challenge?.source === 'string' &&
      challenge?.source.startsWith('WackyPulse:'));

  useEffect(() => {
    if (isPoll) return;

    if (!isWacky) {
      setWEmotion(normalizeTo100(rawEmotion));
      return;
    }

    wobbled = {
      happy: { ...rawEmotion.happy, pct: wobblePct(rawEmotion.happy.pct) },
      angry: { ...rawEmotion.angry, pct: wobblePct(rawEmotion.angry.pct) },
      sad: { ...rawEmotion.sad, pct: wobblePct(rawEmotion.sad.pct) },
      anxious: { ...rawEmotion.anxious, pct: wobblePct(rawEmotion.anxious.pct) },
    };

    setWEmotion(normalizeTo100(wobbled));
  }, [tick, isWacky, isPoll]);

  /* -------------------------------------------------------
     ⭐ EARLY RETURN #1 — SAFE NOW
     (feed is allowed to be null here)
  ------------------------------------------------------- */
  if (!feed) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
        <Text style={{ color: 'white' }}>Loading…</Text>
       </SafeAreaView>
    );
  }

  /* -------------------------------------------------------
     ⭐ EARLY RETURN #2 — SAFE
  ------------------------------------------------------- */
  if (!challenge) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loadingText}>Missing challenge data</Text>
      </SafeAreaView>
    );
  }

  /* -------------------------------------------------------
     Render
  ------------------------------------------------------- */
  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1 }}
      >
          <View style={styles.text}>
            <AutoShrinkBlock
              height={110}
              width={'100%'}
              fontWeight="700"
              textAlign="center"
            >
              {challenge?.topic}
            </AutoShrinkBlock>
          </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={isIOS ? "padding" : "padding"}
          keyboardVerticalOffset={isIOS ? 92 : 30}
        >
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{
              ...styles.scrollContent,
              minHeight: 222,
            }}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1, maxHeight: SCREEN_HEIGHT - bottomBarHeight }}
            showsVerticalScrollIndicator={false}
          >

            {/* Live Results block */}
            <View
              style={{
                maxHeight: 250,
                minHeight: 250,
                justifyContent: 'flex-start',
                borderWidth: 2,
                borderRadius: 22,
                marginTop: 3,
                borderColor: '#c43dff',
                backgroundColor: 'rgba(19, 14, 104, 0.65)',
                shadowColor: '#c43dff',
                shadowOpacity: 0.25,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 0 },
              }}
            >
              <Text
                style={{
                  marginTop: 12,
                  marginBottom: -16,
                  color: 'white',
                  fontWeight: '700',
                  fontSize: 24,
                  alignSelf: 'center',
                }}
              >
                Live Results
              </Text>

              <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
                {isPoll ? (
                  /* ⭐ POLLING RESULTS — always 4 bars */
                  paddedPollData.map((opt, i) => (
                    <ProgressBar
                      key={i}
                      label={truncate(
                      polling_answers[i] ?? `Option ${i + 1}`, 23)}   // Max char=22
                      pct={opt.pct}
                      count={0}
                      color="#4da6ff"
                      labelColor="white"
                    />
                  ))
                ) : (
                  /* ⭐ EMOTION RESULTS */
                  <>
                    <ProgressBar
                      label={emotionLookup[emotionSlotMap['happy']][challenge.category]}
                      pct={wEmotion.happy.pct}
                      count={wEmotion.happy.count}
                      color="#00C46B"
                      labelColor="white"
                    />
                    <ProgressBar
                      label={emotionLookup[emotionSlotMap['angry']][challenge.category]}
                      pct={wEmotion.angry.pct}
                      count={wEmotion.angry.count}
                      color="#D7263D"
                      labelColor="white"
                    />
                    <ProgressBar
                      label={emotionLookup[emotionSlotMap['sad']][challenge.category]}
                      pct={wEmotion.sad.pct}
                      count={wEmotion.sad.count}
                      color="#2D6BFF"
                      labelColor="white"
                    />
                    <ProgressBar
                      label={emotionLookup[emotionSlotMap['anxious']][challenge.category]}
                      pct={wEmotion.anxious.pct}
                      count={wEmotion.anxious.count}
                      color="#A259FF"
                      labelColor="white"
                    />
                  </>
                )}
              </View>
            </View>


          <View style={{ flex: 1, justifyContent: 'space-between', marginTop: 15 }}>
            {/* Comments block */}
            <View
              style={{
                height: 200,
                justifyContent: 'flex-start',
                borderWidth: 2,
                borderRadius: 22,
                marginBottom: 8,
                borderColor: 'rgba(225, 137, 232, 1.0)',
                backgroundColor: 'rgba(19, 14, 104, 0.95)',
                padding: 10,
              }}
            >
              <Text
                style={{
                  marginBottom: -5,
                  color: 'white',
                  fontWeight: '700',
                  fontSize: 20,
                  alignSelf: 'center',
                }}
              >
                What people are saying...
              </Text>

              <View
                style={{
                  height: 70,
                  marginHorizontal: 4,
                  marginBottom: 32,
                  padding: 10,
                }}
              >
                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 18,
                      fontWeight: '800',
                    }}
                  >
                    {commentsRef.current[currentIndex]?.username
                      ? `${commentsRef.current[currentIndex]!.username}:`
                      : ''}
                  </Text>
                  <Text
                    style={{
                      color: 'yellow',
                      fontSize: 23,
                      fontWeight: '800',
                      maxHeight: 55,
                      fontStyle: 'italic',
                    }}
                  >
                    {commentsRef.current[currentIndex]?.text ?? ''}
                  </Text>
                </Animated.View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 14,
                }}
              >
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  onFocus={handleCommentFocus}
                  placeholder="Write a comment..."
                  placeholderTextColor="#aaa"
                  style={{
                    flex: 1,
                    height: 40,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255)',
                    color: 'white',
                    paddingHorizontal: 10,
                  }}
                />

                <Pressable
                  onPress={handlePostComment}
                  style={{
                    maxWidth: 50,
                    maxHeight: 40,
                    marginLeft: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 6,
                  }}
                >
                  <Image source={sendButton} style={styles.sendImage} />
                </Pressable>
              </View>
            </View>
          </View>
          
          </ScrollView>


        </SafeAreaView>
        </KeyboardAvoidingView>
      
        {/* Bottom button + timer */}
        <View 
          style={styles.bottomBar}
          onLayout={e => setBottomBarHeight(e.nativeEvent.layout.height)}
        >
          <Pressable
            onPress={() => {
              isResettingRef.current = true;
              navigation.reset({
                index: 1,
                routes: [
                  { name: 'CategoryList' },
                  { name: isPoll ? 'PollingList' : 'CategoryList' }
                ]
              });
            }}
          >
            <Image source={isPoll ? activePollButton : activeButton} style={styles.buttonImage} />
          </Pressable>

          <Text style={styles.timer}>{formattedTime}</Text>
        </View>
        
      </ImageBackground>
    </View>
  );
}

/* -------------------------------------------------------
   Styles
------------------------------------------------------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -5,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 45,
    left: 0,
    right: 0,
    //paddingBottom: isIOS ? 34 : 20, // safe area lift
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: isIOS ? 120 : 90,
  },
  loadingText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
  buttonImage: {
    width: 300,
    height: 80,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  sendImage: {
    width: 43,
    height: 43,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: -11,
  },
  text: {
    marginTop: 18,
    marginBottom: 15,
    borderRadius: 18,
    backgroundColor: 'rgba(47, 23, 116, 0.78)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.58)',
    paddingHorizontal: 10,
    marginHorizontal: 20,
  },
  timer: {
    color: 'yellow',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: -15,
    alignSelf: 'center',
  },});
