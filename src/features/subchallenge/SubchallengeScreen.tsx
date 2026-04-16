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
    if (index + 1 < subchallenges.length) {
      setIndex(index + 1);
      setSelected(null);
    } else {
      // If this was the last question, go to results
      navigation.navigate("ChallengeCountdown", { challengeId: challenge.id, from: "play" });
    }
  };

  const handleAnswer = async () => {
    if (!selected || loading) return;
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
        console.log("API threw:", err);
        throw err;
      }

      console.log("Subchallenge prediction submitted:", response);

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
          : "Unable to submit prediction.";

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
        return true;
      }

      setIndex(prev => prev - 1);
      setSelected(null);
      return true;
    });

    return () => sub.remove();
  }, [index]);

  useEffect(() => {
    if (errorMessage) {
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
  }, [errorMessage, errorOpacity, timerOpacity]);

  useEffect(() => {
    if (current?.options?.length > 0) {
      setSelected(current.options[0].id);
    }
  }, [index, current]);

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

          <View style={styles.questionCard}>
            <AutoShrinkBlock height={100} textAlign="center" fontStyle="italic" marginBottom={0}>
              {String(current.question_text ?? "")}
            </AutoShrinkBlock>
          </View>

          <View style={styles.optionsContainer}>
            {current.options.map((opt, idx) => {
              const isSelected = selected === opt.id;
              const optionText =
                typeof opt.metadata?.text === "string" ? opt.metadata.text : "";

              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setSelected(opt.id)}
                  activeOpacity={0.9}
                  style={[
                    styles.optionWrapper,
                    isSelected && styles.optionSelected
                  ]}
                >
                  <View style={[styles.optionLetterBubble, isSelected && styles.optionLetterBubbleSelected]}>
                    <Text style={styles.optionLetterText}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>

                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {optionText}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.skipWrapper} onPress={handleSkip}>
              <Image source={skipButton} style={styles.skipImage} />
            </Pressable>

            <Pressable
              onPress={handleAnswer}
              disabled={!selected || loading}
              style={loading ? { opacity: 0.7 } : undefined}
            >
              <Image source={answerButton} style={styles.answerImage} />
            </Pressable>
          </View>

          <View style={{ height: 40, justifyContent: "center", alignItems: "center" }}>
            <Animated.View
              style={{
                position: "absolute",
                opacity: errorOpacity,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={styles.errorText}>
                {typeof errorMessage === "string" ? errorMessage : ""}
              </Text>
            </Animated.View>

            <Animated.View
              style={{
                position: "absolute",
                opacity: timerOpacity,
                width: "100%",
                alignItems: "center",
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
    height: 170,
    marginTop: 60,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  questionCard: {
    marginTop: 10,
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(18, 10, 42, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  optionsContainer: {
    gap: 0,
    minHeight: 280,
    maxHeight: 280,
  },
  optionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
    paddingLeft: 14,
    paddingRight: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    marginBottom: 9,
    borderWidth: 2,
    height: 70,
    justifyContent: 'center',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  optionSelected: {
    borderColor: '#c43dff',
    backgroundColor: 'rgba(133, 47, 184, 0.28)',
    shadowColor: '#c43dff',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  optionLetterBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.30)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLetterBubbleSelected: {
    backgroundColor: '#c43dff',
  },
  optionLetterText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  answerImage: {
    width: 210,
    height: 46,
    marginTop: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    gap: 18,
  },
  skipWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipImage: {
    width: 100,
    height: 46,
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
  },
  loadingText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
});