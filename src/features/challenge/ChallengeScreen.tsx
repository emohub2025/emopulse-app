import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Platform, View, Text, StyleSheet, Image, Animated, TouchableOpacity, ScrollView } from 'react-native';
import EmotionSelector from '../../components/EmotionSelector';
import { SafeAreaView } from 'react-native-safe-area-context';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useRssTimer } from "../../components/TimerProviderEmotion";
import { postPlaceUserBet } from '../../api/postPlaceUserBet';
import { getSubchallengeList } from '../../api/subchallenges';
import { useCurrentUserId } from "../../state/useUserSelectors";
import { useFeed } from "../../context/FeedContext";
import { markChallengePlayed } from '../../hooks/usePlayedChallenges';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { getFeelingSentence } from '../../utils/emotionList';

type ChallengeRouteProp = RouteProp<RootStackParamList, 'Challenge'>;
type NavProp = NativeStackNavigationProp<RootStackParamList, 'Challenge'>;
const isIOS = Platform.OS === "ios";

export default function ChallengeScreen({ route }: { route: ChallengeRouteProp }) {
  // ⭐ ALL HOOKS MUST COME FIRST
  const [emotion, setEmotion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavProp>();
  const { applyCycleFromFeed, formattedTime } = useRssTimer();
  const userId = useCurrentUserId();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const timerOpacity = useRef(new Animated.Value(1)).current;
  const [lastTap, setLastTap] = useState<number | null>(null);
  const bottomStatusText = formattedTime?.toLowerCase?.() === 'expired' ? 'Expired' : formattedTime;
  const { challengeId } = route.params;
  const { feed } = useFeed();   // hook is fine here — early return must be below all hooks

  const { scale, font, isVeryCompact } = useResponsiveLayout();
  const submitWidth = scale(isVeryCompact ? 230 : 265, 220, 265);
  const submitHeight = scale(isVeryCompact ? 47 : 54, 44, 54);
  const titleFontSize = font(28, 22, 28);
  const subtitleFontSize = font(18, 15, 18);

  let isYouTube = false;
  let challenge = null;

  // ⭐ SAFE TO USE feed NOW
  challenge = feed?.categories
    .flatMap(c => [...c.active, ...c.recent])
    .find(ch => ch.id === challengeId);

  isYouTube = challenge?.source?.startsWith('YouTube');

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

      const response = await postPlaceUserBet({
        challenge_id: challenge.id,
        user_id: userId,
        emotion,
        amount: 1
      });

      console.log("Prediction submitted:", response);
      await markChallengePlayed(challengeId);

      // Allow subchallenges now for Youtube!
      // if (isYouTube) {
      //   setLoading(false);
      //   navigation.navigate("ChallengeCountdown", { challengeId: challenge.id })
      //   return;
      // }

      const listResults = await getSubchallengeList(challenge.id);

      // ⭐ If no subchallenges → go straight to countdown
      if (!listResults || listResults.length === 0) {
        navigation.navigate("ChallengeCountdown", { 
          challengeId: challenge.id, 
          from: "play" 
        });
        return;
      }

      // Otherwise → go to Subchallenge screen
      navigation.navigate("Subchallenge", {
        challengeId: challenge.id,
        subchallenges: listResults
      });
    } catch (err: any) {
      console.log("❌ Prediction failed:", err);

      const msg = err?.message || "Unable to submit prediction.";

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (feed?.cycle) {
      applyCycleFromFeed(feed.cycle);
    }
  }, [feed, applyCycleFromFeed]);

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
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const isDisabled = !emotion || loading;

  if (!feed || !challenge) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <Text style={{ color: "white", textAlign: "center", marginTop: 40 }}>
          Challenge not found
        </Text>
      </SafeAreaView>
    );
  }

  const feelingText = emotion ? getFeelingSentence(emotion, challenge?.category) : null;

  return (
    <View style={{ flex: 1 }}>
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={require('../../assets/images/background.png')}
          style={{ width: '100%', height: '95%', paddingTop: 0 }}
          resizeMode="stretch"
        />

        {/* ⭐ Dim overlay ONLY affects the image */}
        <View style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0,0,0,0.0)'
        }} />
      </View>
              
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.topLabel, { fontSize: 26 }]} numberOfLines={1}>What's your reaction?</Text>
          {emotion ? (
            <Text style={styles.subLabel}>
              <Text style={[styles.subLabel, { fontSize: 20 }]} >{feelingText}</Text>
            </Text>
          ) : (
            <Text style={[styles.subLabel, { fontSize: 20 }]} numberOfLines={1}>
              Select the best matching emotion.
            </Text>
          )}

          <View style={styles.content}>
            <View style={styles.mainCard}>

              <AutoShrinkBlock
                height={110}
                width={"100%"}
                fontWeight="600"
              >
                {challenge?.topic}
              </AutoShrinkBlock>
            </View>

            <View style={styles.selectorWrap}>
              <EmotionSelector
                selected={emotion}
                onSelect={setEmotion}
                category={challenge?.category}
              />
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
      
      {/* ⭐ Bottom bar stays fixed */}
      <View style={styles.bottomBar}>
        <Text style={[styles.costText]}>Cost: 1 Coin</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isDisabled}
          style={[
            styles.submitWrapper,
            { width: submitWidth, height: submitHeight },
            isDisabled && { opacity: 0.6 },
          ]}
        >
          <Image
            source={require('../../assets/buttons/submit.png')}
            style={[styles.submitButton]}
          />
        </TouchableOpacity>
        {!errorMessage && (
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Animated.View
              style={{
                position: "absolute",
                opacity: 100,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={styles.timer}>{bottomStatusText}</Text>
            </Animated.View>
          </View>
        )}
        {errorMessage && (
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Animated.View
              style={{
                position: "absolute",
                opacity: 100,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={styles.errorText}>{errorMessage}</Text>
            </Animated.View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 42,
    left: 0,
    right: 0,
    paddingBottom: isIOS ? 34 : 20, // safe area lift
    paddingTop: 6,
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  topLabel: {
    color: 'yellow',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 0,
    marginBottom: 5,
    paddingHorizontal: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  subLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 28,
    marginBottom: 13,
  },
  content: {
    justifyContent: 'space-between',
  },
  mainCard: {
    marginTop: 0,
    marginHorizontal: 14,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: 'rgba(20, 10, 46, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  selectorWrap: {
    marginTop: 4,
    marginBottom: 15,
  },
  submitArea: {
    alignItems: 'center',
    marginBottom: 8,
  },
  submitWrapper: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 5,
    marginBottom: 0,
    width: 280,
    height: 47,
    resizeMode: 'contain',
  },
  costText: {
    color: 'gold',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 3,
  },
  timer: {
    color: 'yellow',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 0,
    alignSelf: 'center',  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(19, 10, 45, 0.96)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    paddingVertical: 22,
    paddingHorizontal: 18,
  },
  modalTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalText: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalSecondaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  modalSecondaryText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalPrimaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: '#7c3aed',
  },
  modalPrimaryText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  singleActionWrap: {
    marginTop: 2,
  },
  modalPrimaryButtonFull: {
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: '#7c3aed',
  },
  contentSpacer: {
    height: 8,
  },
});
