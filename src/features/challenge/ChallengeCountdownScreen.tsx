import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, Pressable, BackHandler, TextInput, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, LiveSnapshotItem } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCycleTimer } from '../../components/CycleTimerContext';
import { useLiveSnapshot, normalizeEmotions } from "../../api/getLiveSnapshot";
import activeButton from '../../assets/buttons/active.png';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useFeed } from "../../context/FeedContext";

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ChallengeCountdown'>;

function normalizeTo100(emotions: any) {
  const total =
    emotions.happy.pct +
    emotions.angry.pct +
    emotions.sad.pct +
    emotions.anxious.pct;

  // Avoid divide-by-zero
  if (total === 0) return emotions;

  return {
    happy:   { ...emotions.happy,   pct: emotions.happy.pct   / total },
    angry:   { ...emotions.angry,   pct: emotions.angry.pct   / total },
    sad:     { ...emotions.sad,     pct: emotions.sad.pct     / total },
    anxious: { ...emotions.anxious, pct: emotions.anxious.pct / total },
  };
}

function wobblePct(pct: number) {
  // Give Wacky a fake baseline if needed
  if (pct === 0) pct = 0.10; // 10%

  const wobble = (Math.random() * 0.06) - 0.03; // ±3%
  let next = pct + wobble;

  // clamp 1%–99%
  next = Math.max(0.01, Math.min(0.99, next));

  return next;
}

type ProgressBarProps = {
  label: string;
  pct: number;     // 0–1
  count: number;   // raw vote count
  color: string;
};

const ProgressBar = ({ label, pct, count, color }: ProgressBarProps) => {
  return (
    <View style={{ marginVertical: 6 }}>
      <Text style={{ marginBottom: 4, fontSize: 18, fontWeight: '600' }}>
        <Text style={{ color }}>{label}</Text>
        <Text style={{ color: 'white' }}>
          {` — ${Math.round(pct * 100)}%`}
        </Text>
      </Text>

      <View
        style={{
          height: 15,
          borderRadius: 15,
          backgroundColor: 'rgba(255,255,255,0.2)',
        }}
      >
        <View
          style={{
            width: `${pct * 100}%`,
            height: '100%',
            borderRadius: 15,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
};

/* -------------------------------------------------------
   ⭐ Main Screen
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <Text style={{ color: "white" }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const challenge = feed.categories
    .flatMap(c => [...c.active, ...c.recent])
    .find(ch => ch.id === challengeId);

  if (!challenge) {
    console.error("❌ ChallengeResults missing challenge or challenge.id:", challenge);
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loadingText}>Missing challenge data</Text>
      </SafeAreaView>
    );
  }

  // get snapshot info
  const { snapshot } = useLiveSnapshot();

  const liveChallenge = snapshot.find(
    (item: LiveSnapshotItem) => item.id === challenge.id
  );

  const emotionData = liveChallenge
    ? normalizeEmotions(liveChallenge.main)
    : {
    angry:   { pct: 0, count: 0 },
    happy:   { pct: 0, count: 0 },
    sad:     { pct: 0, count: 0 },
    anxious: { pct: 0, count: 0 },
  };

  const isWacky =
    challenge.category === "Wacky" ||
    (typeof challenge.source === "string" &&
      challenge.source.startsWith("WackyPulse:"));

  const [wEmotion, setWEmotion] = useState(emotionData);
    
  useEffect(() => {
    if (!isWacky) {
      setWEmotion(normalizeTo100(emotionData));
      return;
    }

    const wobbled = {
      happy:   { ...emotionData.happy,   pct: wobblePct(emotionData.happy.pct) },
      angry:   { ...emotionData.angry,   pct: wobblePct(emotionData.angry.pct) },
      sad:     { ...emotionData.sad,     pct: wobblePct(emotionData.sad.pct) },
      anxious: { ...emotionData.anxious, pct: wobblePct(emotionData.anxious.pct) },
    };

    setWEmotion(normalizeTo100(wobbled));
  }, [tick, isWacky]);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(1)).current;
  const [commentText, setCommentText] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [comments, setComments] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const commentsRef = useRef(comments);
  const usersRef = useRef(users);
  const startedRef = useRef(false);

  function handlePostComment() {
    if (!commentText.trim()) return;

    setComments(prev => [...prev, commentText.trim()]);
    setCommentText("");
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
      "This is wild!",
      "No way this is happening, how crazy!",
      "I knew it!",
      "Let’s goooo",
    ];

    const testUsers = [
      "Joe Cool",
      "Johhny Goofball",
      "Geogry Porgy",
      "Meathead Magoo",
      "Joey Knuckles",
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
    // Start from slightly above and invisible
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
      })
    ]).start();
  }, [currentIndex]);

  useEffect(() => {
    if (from === "play" && isExpired) {
      setTimeout(() => {
        navigation.navigate("ChallengeResults", {
          challengeId: challenge.id,
        });
      }, 2000);
    }
  }, [isExpired]);

  useEffect(() => {
    if (from === "play") {
      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true // block back
      );
      return () => sub.remove();
    }

    // allow default behavior
    return;
  }, [from]);

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>

      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1, marginBottom: 42 }}
        >
        <SafeAreaView style={styles.safe}>

          <AutoShrinkBlock
            height={100}
            width={"100%"}
            fontWeight="700"
            textAlign="center"
            marginTop={5}
          >
            {challenge.topic}
          </AutoShrinkBlock>

          {/* ⭐ Full-screen vertical layout */}
          <View style={{ flex: 1, justifyContent: 'space-between' }}>

            <View style={{ 
                height: 200, 
                justifyContent: 'flex-start',
                borderWidth: 2.5,
                borderRadius: 22,
                marginLeft: -6,
                marginRight: -6,
                marginBottom: 8,
                borderColor: "rgba(225, 137, 232, 1.0)",
                backgroundColor: 'rgba(19, 14, 104, 0.55)',
                padding: 10,
              }}>

              <Text style={{ 
                marginBottom: -5,
                color: "white",
                fontWeight: "700",
                fontSize: 24,
                alignSelf: 'center',
                }}>Comments</Text>

              {/* ⭐ Comment Display */}
              <View style={{ 
                height: 70,
                marginHorizontal: 4, 
                marginBottom: 32,
                padding: 10
              }}>
                <Animated.View style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }}>
                  <Text style={{ color: "white", fontSize: 18, fontWeight: '800' }}>
                    {usersRef.current[currentIndex] ? `${usersRef.current[currentIndex]}:` : ""}
                  </Text>
                  <Text style={{ color: "yellow", fontSize: 23, fontWeight: '800', fontStyle: 'italic' }}>
                    {commentsRef.current[currentIndex] || ""}
                  </Text>
                </Animated.View>
              </View>

              {/* ⭐ Comment Input */}
              <View style={{ 
                flexDirection: "row", 
                alignItems: "center",
                marginHorizontal: 4,
              }}>
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Write a comment..."
                  placeholderTextColor="#aaa"
                  style={{
                    flex: 1,
                    height: 40,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255)",
                    color: "white",
                    paddingHorizontal: 10
                  }}
                />

                <Pressable
                  onPress={handlePostComment}
                  style={{
                    maxHeight: 40, 
                    marginLeft: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    backgroundColor: 'blue',   // ⭐ move it here
                    borderRadius: 6            // optional, looks better
                  }}
                >
                  <Text style={{ color: "white", fontSize: 18, marginTop: -2, fontWeight: "600" }}>
                    Send
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={{ 
                maxHeight: 290, 
                minHeight: 290, 
                justifyContent: 'flex-start',
                borderWidth: 3,
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
              }}>

              <Text style={{ 
                marginTop: 12,
                marginBottom: -16,
                color: "white",
                fontWeight: "700",
                fontSize: 24,
                alignSelf: 'center',
                }}>Live Results</Text>

              {/* ⭐ 4 Progress Bars */}
              <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
                <ProgressBar label="Happy"   pct={wEmotion.happy.pct}   count={wEmotion.happy.count}   color="#00C46B" />
                <ProgressBar label="Angry"   pct={wEmotion.angry.pct}   count={wEmotion.angry.count}   color="#D7263D" />
                <ProgressBar label="Sad"     pct={wEmotion.sad.pct}     count={wEmotion.sad.count}     color="#2D6BFF" />
                <ProgressBar label="Anxious" pct={wEmotion.anxious.pct} count={wEmotion.anxious.count} color="#A259FF" />
              </View>
            </View>

            {/* ⭐ Bottom area: button + timer */}
            <View style={{ alignItems: 'center', marginBottom: -10 }}>
              <Pressable
                onPress={() =>
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "CategoryList" }],
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
   ⭐ Styles
------------------------------------------------------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  topLabel: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },
  waitingText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonImage: {
    width: 285,
    height: 48,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 17,
  },
  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },

  loadingText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
});