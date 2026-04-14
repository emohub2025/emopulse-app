import { useState, useEffect, useRef } from 'react';
import { View, Text, Image, ImageBackground, Pressable, TouchableOpacity, Animated, BackHandler, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, SubchallengeList } from '../../navigation/types';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import * as Haptics from 'expo-haptics';
import { useCycleTimer } from '../../components/CycleTimerContext';
import answerButton from '../../assets/buttons/answer.png';
import skipButton from '../../assets/buttons/skip.png';
import { getChallengeImageSource } from '../../assets/wacky/getChallengeImageSource';
import { postPlaceUserSubBet } from '../../api/postPlaceUserBet';
import { useCurrentUserId } from "../../state/useUserSelectors";
import { useFeed } from "../../context/FeedContext";

// Route params type
type SubchallengeRouteProp = RouteProp<
  RootStackParamList,
  'Subchallenge'
>;

type SubchallengeNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Subchallenge'
>;

export default function SubchallengeScreen({
  route,
  navigation,
  }: {
    route: SubchallengeRouteProp;
    navigation: SubchallengeNavProp;
  }) {

  const { challengeId, subchallenges } = route.params;
  const [loading, setLoading] = useState(false);
  const { formattedTime } = useCycleTimer();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const current: SubchallengeList = subchallenges[index];
  const userId = useCurrentUserId();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const timerOpacity = useRef(new Animated.Value(1)).current;
  const [lastTap, setLastTap] = useState<number | null>(null);
  
  const { feed } = useFeed();
  if (!feed) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <Text style={{ color: "white" }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const challenge = feed.categories
    .flatMap(c => [...c.active, ...c.recent])
    .find(ch => ch.id === challengeId);

  if (!challenge) {
    console.error("❌ SubchallengeScreen missing challenge or challenge.id:", challenge);
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loadingText}>Missing challenge data</Text>
      </SafeAreaView>
    );
  }

  const imageSource = getChallengeImageSource(challenge);

  const handleDoubleTapSubmit = () => {
    const now = Date.now();

    if (lastTap && now - lastTap < 800) {
      handleAnswer(); // ⬅️ This is where navigation happens
      setLastTap(null);
      return;
    }

    setLastTap(now);
    setTimeout(() => setLastTap(null), 900);
  };

  const handleSkip = () => {
    // If there are more questions, move forward
    if (index + 1 < subchallenges.length) {
      setIndex(index + 1);
      setSelected(null); // reset selection for next question
    } else {
      // If this was the last question, go to results
      navigation.navigate("ChallengeCountdown", { challengeId: challenge.id, from: "play" });
    }
  };

  const handleAnswer = async () => {
    if (!selected) return;
    if (!userId) {
      setErrorMessage("Missing user ID");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const option = current.options.find(o => o.id === selected);
      if (!option || typeof option.id !== "string" || option.id.length < 10) {
        throw new Error("Invalid option object: missing or invalid UUID");
      }

      let response;
      try {
        response = await postPlaceUserSubBet({
          subchallenge_id: current.id,
          option_id: selected,
          user_id: userId,
          amount: 1
        });
      } catch (err) {
        // This catches the first throw
        console.log("API threw:", err);
        throw err; // ensures outer catch handles it cleanly
      }

      console.log("Subchallenge bet placed:", response);

      if (index + 1 < subchallenges.length) {
        setIndex(index + 1);
        setSelected(null);
      } else {
        navigation.navigate("ChallengeCountdown", { challengeId: challenge.id });
      }

    } catch (err: any) {
      console.log("🟥 UI CATCH (Subchallenge):", err, "type:", typeof err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const msg =
        typeof err === "string"
          ? err
          : typeof err?.message === "string"
          ? err.message
          : "Unable to place subbet.";

      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!current || !current.options) {
    return null;
  }

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (index === 0) {
        // On first question → do nothing
        return true; // block default behavior
      }

      // On 2nd or 3rd question → go back one question
      setIndex(prev => prev - 1);
      setSelected(null); // optional: reset selection
      return true; // handled
    });

    return () => sub.remove();
  }, [index]);

  useEffect(() => {
    if (errorMessage) {
      // Fade IN error, fade OUT timer
      Animated.parallel([
        Animated.timing(errorOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(timerOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Fade OUT error, fade IN timer
      Animated.parallel([
        Animated.timing(errorOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(timerOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [errorMessage]);

  // ⭐ Auto-select first option whenever the question changes
  useEffect(() => {
    if (current?.options?.length > 0) {
      setSelected(current.options[0].id);
    }
  }, [index]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <View style={styles.imageWrapper}>
            {imageSource && (
              <Image source={imageSource} style={styles.image} />
            )}
          </View>

          <AutoShrinkBlock height={100} textAlign="center" fontStyle="italic" marginBottom={0}>
            {String(current.question_text ?? "")}
          </AutoShrinkBlock>

          <View style={styles.optionsContainer}>
            {current.options.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setSelected(opt.id)}
                style={[
                  styles.optionWrapper,
                  selected === opt.id && styles.optionSelected
                ]}
              >
                <Text style={styles.optionText}>
                  {typeof opt.metadata?.text === "string" ? opt.metadata.text : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* BUTTON ROW */}
          <View style={styles.buttonRow}>

            {/* SKIP BUTTON */}
            <Pressable style={styles.skipWrapper} onPress={handleSkip}>
              <Image source={skipButton} style={styles.skipImage} />
            </Pressable>

            {/* ANSWER BUTTON */}
            <Pressable
              onPress={() => {
                if (!selected) return;
                handleDoubleTapSubmit();
              }}
            >
              <Image source={answerButton} style={styles.answerImage} />
            </Pressable>

          </View>

          {/* Timer */}
          <View style={{ height: 40, justifyContent: "center", alignItems: "center" }}>

            {/* Error */}
            <Animated.View
              style={{
                position: "absolute",
                opacity: errorOpacity,
                width: "100%",
                alignItems: "center",
                transform: [{ perspective: 1000 }]
              }}
            >
              <Text style={styles.errorText}>
                {typeof errorMessage === "string" ? errorMessage : ""}
              </Text>
            </Animated.View>

            {/* Timer */}
            <Animated.View
              style={{
                position: "absolute",
                opacity: timerOpacity,
                width: "100%",
                alignItems: "center",
                transform: [{ perspective: 1000 }]
              }}
            >
              <Text style={styles.timer}>
                {typeof formattedTime === "string" ? formattedTime : ""}
              </Text>
            </Animated.View>

          </View>

        </View>
      </ImageBackground>

    </View>
  );

}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
  },
  imageWrapper: {
    width: '100%',
    height: 176,
    marginTop: 70,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  optionsContainer: {
    gap: 0,
    minHeight: 280,
    maxHeight: 280,
  },
  optionWrapper: {
    paddingVertical: 0,
    paddingLeft: 16,
    paddingRight: 7,
    borderRadius: 10,
    backgroundColor: 'black',
    marginBottom: 9,
    borderWidth: 2,
    minHeight: 72,
    maxHeight: 72,
  justifyContent: 'center',
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: '#b270cd',
    borderWidth: 2.5,
  },
  optionText: {
    marginTop: -4,
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  answerImage: {
    width: 210,
    height: 48,
    marginTop: 0,
  },
  buttonRowOuter: {
    width: '100%',
    alignItems: 'center', // centers the inner row
    marginTop: 50,
  },
  buttonRowInner: {
    flexDirection: 'row',
    width: 380, // 100 + 280 (skip + answer)
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    gap: 18,
  },
  skipWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipImage: {
    width: 100,   // 1/4 of your 280px answer button
    height: 48,  // same height for alignment
  },
  errorText: {
    color: '#e26fae',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '700',
    marginTop: -3,
  },
  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  loadingText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
});