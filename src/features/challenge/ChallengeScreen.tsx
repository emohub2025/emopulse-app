import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, Animated, ImageBackground, TouchableOpacity } from 'react-native';
import EmotionSelector from '../../components/EmotionSelector';
import { SafeAreaView } from 'react-native-safe-area-context';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useCycleTimer } from '../../components/CycleTimerContext';
import { postPlaceUserBet } from '../../api/postPlaceUserBet';
import { getSubchallengeList } from '../../api/subchallenges';
import { useCurrentUserId } from "../../state/useUserSelectors";

type ChallengeRouteProp = RouteProp<RootStackParamList, 'Challenge'>;

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Challenge'
>;

export default function ChallengeScreen({ route }: { route: ChallengeRouteProp }) {
  const { challenge } = route.params;   // ⭐ Full challenge object now passed in
  const [emotion, setEmotion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigation = useNavigation<NavProp>();
  const { formattedTime } = useCycleTimer();
  const userId = useCurrentUserId();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const timerOpacity = useRef(new Animated.Value(1)).current;
  const [lastTap, setLastTap] = useState<number | null>(null);
  const [topicFontSize, setTopicFontSize] = useState(24);
  const isYouTube = challenge.source?.startsWith('YouTube');

  const handleDoubleTapSubmit = () => {
    const now = Date.now();

    if (lastTap && now - lastTap < 800) {
      handleSubmit(); // ⬅️ This is where navigation happens
      setLastTap(null);
      return;
    }

    setLastTap(now);
    setTimeout(() => setLastTap(null), 900);
  };

  const handleSubmit = async () => {
    if (!emotion) return;
    if (!userId) {
      setErrorMessage("Missing user ID");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      let response;

      try {
        response = await postPlaceUserBet({
          challenge_id: challenge.id,
          user_id: userId,
          emotion
        });
      } catch (apiErr) {
        console.log("postPlaceUserBet API error caught:", apiErr);
        throw apiErr; // ensures outer catch handles it cleanly
      }

      console.log("Bet placed:", response);

      if (isYouTube) {
        setLoading(false);
        navigation.navigate("ChallengeCountdown", { challenge });
        return;
      }

      const listResults = await getSubchallengeList(challenge.id);

      if (listResults?.length > 0) {
        // listResults.forEach((item, i) => {
        //   console.log(`--- Subchallenge ${i} ---`);
        //   console.log("id:", item.id);
        //   console.log("question:", item.question_text);
        //   console.log("sequence:", item.sequence);

        //   item.options.forEach((opt, j) => {
        //     console.log(`Option ${j}:`, opt.metadata?.text);
        //   });
        // });
        navigation.navigate("Subchallenge", {
          challenge,
          subchallenges: listResults
        });
      } else {
        setSubmitted(true);
      }

    } catch (err: any) {
      console.log("❌ Bet failed:", err);

      // ⭐ Haptic feedback on error
      console.log("HAPTIC SHOULD FIRE NOW");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // ⭐ Prevent Expo red screen
      setErrorMessage(err?.message || "Unable to place bet.");
    } finally {
      setLoading(false);
    }
  };

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

 useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const isDisabled = !emotion || loading;

  return (
  <View style={{ flex: 1, backgroundColor: 'black' }}>
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={{ flex: 1, marginBottom: 42 }}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {!submitted && (
          <Text style={styles.topLabel}>What's your reaction?</Text>
        )}

        {!submitted ? (
          <View style={styles.content}>

            {/* Invisible measurement text */}
            <Text
              style={[
                styles.valueMeasure,
                { fontSize: topicFontSize }
              ]}
              onLayout={(event) => {
                const h = event.nativeEvent.layout.height;

                if (h > 130 && topicFontSize > 14) {
                  setTopicFontSize(topicFontSize - 1);
                }
              }}
            >
              {challenge.topic}
            </Text>

            {/* Visible fixed-height text */}
            <AutoShrinkBlock 
              height={110} 
              fontWeight="500"
              >
              {challenge.topic}
            </AutoShrinkBlock>

            <EmotionSelector selected={emotion} onSelect={setEmotion} />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isDisabled}
              style={[
                styles.submitWrapper,
                isDisabled && { opacity: 0.6 },
              ]}
            >
              <Image
                source={require('../../assets/buttons/submit.png')}
                style={styles.submitButton}
              />
            </TouchableOpacity>
          </View>
          ) : (
          
          <View style={[styles.gradient, { backgroundColor: 'black' }]}>
            <View style={styles.content}>
              <Image
                source={require('../../assets/images/victory.png')}
                style={styles.submitGraphic}
              />
              <Image
                source={require('../../assets/buttons/victory.png')}
                style={styles.submitButton}
              />
            </View>
          </View>
        )}

        {/* Timer */}
        <View style={{ height: 40, justifyContent: "center", alignItems: "center" }}>

          {/* Error */}
          <Animated.View
            style={{
              position: "absolute",
              opacity: errorOpacity,
              width: "100%",
              alignItems: "center",
              transform: [{ perspective: 1000 }]   // ⭐ FIX
            }}
          >
            <Text style={styles.errorText}>{errorMessage}</Text>
          </Animated.View>

          {/* Timer */}
          <Animated.View
            style={{
              position: "absolute",
              opacity: timerOpacity,
              width: "100%",
              alignItems: "center",
              transform: [{ perspective: 1000 }]   // ⭐ FIX
            }}
          >
            <Text style={styles.timer}>{formattedTime}</Text>
          </Animated.View>

        </View>

      </SafeAreaView>
    </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    marginBottom: -37,
  },

  topLabel: {
    color: 'white',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 75,
    marginBottom: 5,
    paddingHorizontal: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  gradient: {
    flex: 1,
    padding: 10,
    marginTop: 10,
  },

  content: {
    flex: 1,
  },

  valueMeasure: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },

  submitWrapper: {
    alignSelf: 'center',
    width: 265,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },

  submitButton: {
    width: 280,
    height: 47,
    marginTop: 122,
    resizeMode: 'contain',
  },

  submitGraphic: {
    width: 324,
    height: 506,
    resizeMode: 'contain',
    alignSelf: 'center',
  },

  errorText: {
    color: '#e26fae',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 20,
  },

  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
});