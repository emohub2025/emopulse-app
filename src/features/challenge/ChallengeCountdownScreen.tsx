import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, Pressable, BackHandler, TextInput, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCycleTimer } from '../../components/CycleTimerContext';
import { useLiveSnapshot, normalizeEmotions, type EnrichedLiveSnapshotItem } from '../../api/getLiveSnapshot';
import activeButton from '../../assets/buttons/active.png';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useFeed } from '../../context/FeedContext';
import { emotionLookup, emotionSlotMap } from '../../utils/emotionList';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ChallengeCountdown'>;

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
    <View style={{ marginVertical: 10 }}>
      <View style={{ position: 'relative', height: 20, justifyContent: 'center' }}>
        
        {/* Background bar */}
        <View
          style={{
            height: 25,
            borderRadius: 15,
            backgroundColor: 'rgba(255,255,255,0.2)',
            overflow: 'hidden',
          }}
        >
          {/* Fill bar */}
          <View
            style={{
              width: `${barWidth}%`,
              height: '100%',
              borderRadius: 15,
              backgroundColor: color,
            }}
          />
        </View>

        {/* Overlay text */}
        <Text
          style={{
            position: 'absolute',
            width: '100%',
            textAlign: 'center',
            color: labelColor || color,
            fontSize: 18,
            fontWeight: '700',
            paddingVertical: -1,
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
export default function ChallengeResultScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<any>();
  const from = route.params?.from;
  const { isExpired, formattedTime } = useCycleTimer();

  const { challengeId } = route.params;
  const { feed } = useFeed();

  if (!feed) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
        <Text style={{ color: 'white' }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const challenge = feed.categories
    .flatMap(c => [...c.active, ...c.recent])
    .find(ch => ch.id === challengeId);

  if (!challenge) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loadingText}>Missing challenge data</Text>
      </SafeAreaView>
    );
  }

  /* -------------------------------------------------------
     Live snapshot (enriched)
  ------------------------------------------------------- */
  const { snapshot } = useLiveSnapshot();
  const liveChallenge = snapshot.find(
    (item: EnrichedLiveSnapshotItem) => item.id === challenge.id
  );

  /* -------------------------------------------------------
  // Polling data
  ------------------------------------------------------- */
  const isPoll = liveChallenge?.isPoll === true;
  const pollData = isPoll && liveChallenge?.pollResults ? liveChallenge.pollResults : [];

  // ⭐ Ensure 4 poll options always exist
  const paddedPollData = [...pollData];
  while (paddedPollData.length < 4) {
    paddedPollData.push({ index: paddedPollData.length, pct: 0 });
  }
  const polling_answers = challenge.polling_answers ?? [];

  /* -------------------------------------------------------
     Emotion Data
  ------------------------------------------------------- */
  const rawEmotion =
    !isPoll && liveChallenge
      ? normalizeEmotions(liveChallenge.main)
      : {
          angry: { pct: 0, count: 0 },
          happy: { pct: 0, count: 0 },
          sad: { pct: 0, count: 0 },
          anxious: { pct: 0, count: 0 },
        };

  const isWacky =
    challenge.category === 'Wacky' ||
    (typeof challenge.source === 'string' &&
      challenge.source.startsWith('WackyPulse:'));

  const [wEmotion, setWEmotion] = useState(rawEmotion);

  useEffect(() => {
    if (isPoll) return;

    if (!isWacky) {
      setWEmotion(normalizeTo100(rawEmotion));
      return;
    }

    const wobbled = {
      happy: { ...rawEmotion.happy, pct: wobblePct(rawEmotion.happy.pct) },
      angry: { ...rawEmotion.angry, pct: wobblePct(rawEmotion.angry.pct) },
      sad: { ...rawEmotion.sad, pct: wobblePct(rawEmotion.sad.pct) },
      anxious: { ...rawEmotion.anxious, pct: wobblePct(rawEmotion.anxious.pct) },
    };

    setWEmotion(normalizeTo100(wobbled));
  }, [tick, isWacky, isPoll]);

  /* -------------------------------------------------------
     Comments + animation
  ------------------------------------------------------- */
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(1)).current;
  const [commentText, setCommentText] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [comments, setComments] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const commentsRef = useRef(comments);
  const usersRef = useRef(users);
  const startedRef = useRef(false);

  function handlePostComment() {
    if (!commentText.trim()) return;
    setComments(prev => [...prev, commentText.trim()]);
    setCommentText('');
  }

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const test = [
      'This is wild!',
      'No way this is happening, how crazy!',
      'The new Taylor Swift album is Fire 🔥',
      'Let’s goooo',
      'Throw the bums out... tired of losing! 😮‍💨',
    ];

    const testUsers = [
      'Joe Cool',
      'Rebellious Johhny',
      'Swifty Sally',
      'Big Mike',
      'Sam Shalabam',
    ];

    let i = 0;

    const interval = setInterval(() => {
      setComments(prev => [...prev, test[i % test.length]]);
      setUsers(prev => [...prev, testUsers[i % test.length]]);
      i++;
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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

  /* -------------------------------------------------------
     Timer + back handling
  ------------------------------------------------------- */
  useEffect(() => {
    if (from === 'play' && isExpired) {
      setTimeout(() => {
        navigation.navigate('ChallengeResults', {
          challengeId: challenge.id,
        });
      }, 2000);
    }
  }, [isExpired]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [from]);

  /* -------------------------------------------------------
     Render
  ------------------------------------------------------- */
  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1, marginBottom: 42 }}
      >
        <SafeAreaView style={styles.safe}>
          <View style={styles.text}>
            <AutoShrinkBlock
              height={120}
              width={'100%'}
              fontWeight="700"
              textAlign="center"
              marginTop={5}
            >
              {challenge.topic}
            </AutoShrinkBlock>
          </View>

          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            {/* Comments block */}
            <View
              style={{
                height: 200,
                justifyContent: 'flex-start',
                borderWidth: 2,
                borderRadius: 22,
                marginLeft: -6,
                marginRight: -6,
                marginBottom: 8,
                borderColor: 'rgba(225, 137, 232, 1.0)',
                backgroundColor: 'rgba(19, 14, 104, 0.55)',
                padding: 10,
              }}
            >
              <Text
                style={{
                  marginBottom: -5,
                  color: 'white',
                  fontWeight: '700',
                  fontSize: 24,
                  alignSelf: 'center',
                }}
              >
                Comments (coming soon)
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
                    {usersRef.current[currentIndex]
                      ? `${usersRef.current[currentIndex]}:`
                      : ''}
                  </Text>
                  <Text
                    style={{
                      color: 'yellow',
                      fontSize: 23,
                      fontWeight: '800',
                      fontStyle: 'italic',
                    }}
                  >
                    {commentsRef.current[currentIndex] || ''}
                  </Text>
                </Animated.View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginHorizontal: 4,
                }}
              >
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
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
                    maxHeight: 40,
                    marginLeft: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    backgroundColor: 'blue',
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 18,
                      marginTop: -2,
                      fontWeight: '600',
                    }}
                  >
                    Send
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Live Results block */}
            <View
              style={{
                maxHeight: 230,
                minHeight: 230,
                justifyContent: 'flex-start',
                borderWidth: 2,
                borderRadius: 22,
                marginTop: 8,
                marginLeft: -6,
                marginRight: -6,
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

              <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
                {isPoll ? (
                  /* ⭐ POLLING RESULTS — always 4 bars */
                  paddedPollData.map((opt, i) => (
                    <ProgressBar
                      key={i}
                      label={truncate(
                      polling_answers[opt.index] ?? `Option ${opt.index + 1}`, 23)}   // Max char=22
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

            {/* Bottom button + timer */}
            <View style={{ alignItems: 'center', marginBottom: -10 }}>
              <Pressable
                onPress={() =>
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'CategoryList' }],
                  })
                }
              >
                <Image source={activeButton} style={styles.buttonImage} />
              </Pressable>

              <Text style={styles.timer}>{formattedTime}</Text>
            </View>
          </View>
        </SafeAreaView>
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
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
  buttonImage: {
    width: 285,
    height: 48,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 17,
  },
  text: {
    marginTop: 18,
    marginBottom: 15,
    borderRadius: 18,
    backgroundColor: 'rgba(18, 10, 42, 0.33)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.58)',
    paddingHorizontal: 10,
  },
  timer: {
    marginHorizontal: 40,
    width: 250,
    backgroundColor: "rgba(255, 215, 0, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.75)",
    borderRadius: 999,
    paddingVertical: 0,
    color: 'yellow',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 0,
    alignSelf: 'center',
  },});
