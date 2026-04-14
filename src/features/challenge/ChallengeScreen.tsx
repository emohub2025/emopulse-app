import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  ImageBackground,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
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
  const { challenge } = route.params;
  const [emotion, setEmotion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSupplementalPrompt, setShowSupplementalPrompt] = useState(false);
  const [showDuplicatePrompt, setShowDuplicatePrompt] = useState(false);
  const [pendingSubchallenges, setPendingSubchallenges] = useState<any[]>([]);
  const navigation = useNavigation<NavProp>();
  const { formattedTime } = useCycleTimer();
  const userId = useCurrentUserId();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const timerOpacity = useRef(new Animated.Value(1)).current;
  const [topicFontSize, setTopicFontSize] = useState(24);

  const bottomStatusText =
    formattedTime?.toLowerCase?.() === 'expired' ? 'Expired Challenges' : formattedTime;

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
        emotion
      });

      console.log("Prediction submitted:", response);

      const listResults = await getSubchallengeList(challenge.id);

      if (listResults?.length > 0) {
        setPendingSubchallenges(listResults);
        setShowSupplementalPrompt(true);
        return;
      }

      navigation.navigate("ChallengeCountdown", { challenge });
    } catch (err: any) {
      console.log("❌ Prediction failed:", err);

      const msg = err?.message || "Unable to submit prediction.";

      if (
        typeof msg === 'string' &&
        msg.toLowerCase().includes('only place one prediction')
      ) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setShowDuplicatePrompt(true);
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSupplementals = () => {
    setShowSupplementalPrompt(false);
    navigation.navigate("Subchallenge", {
      challenge,
      subchallenges: pendingSubchallenges
    });
  };

  const handleSkipSupplementals = () => {
    setShowSupplementalPrompt(false);
    navigation.navigate("ChallengeCountdown", { challenge });
  };

  const handleDuplicateOkay = () => {
    setShowDuplicatePrompt(false);
    navigation.navigate("ChallengeCountdown", { challenge });
  };

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

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Text style={styles.topLabel}>What's your reaction?</Text>
          <Text style={styles.subLabel}>Choose the emotion that best matches this challenge</Text>

          <View style={styles.content}>
            <View style={styles.mainCard}>
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

              <AutoShrinkBlock
                height={110}
                fontWeight="500"
              >
                {challenge.topic}
              </AutoShrinkBlock>

              <View style={styles.selectorWrap}>
                <EmotionSelector selected={emotion} onSelect={setEmotion} />
              </View>
            </View>

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

          <View style={{ height: 44, justifyContent: "center", alignItems: "center" }}>
            <Animated.View
              style={{
                position: "absolute",
                opacity: errorOpacity,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={styles.errorText}>{errorMessage}</Text>
            </Animated.View>

            <Animated.View
              style={{
                position: "absolute",
                opacity: timerOpacity,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={styles.timer}>{bottomStatusText}</Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <Modal
        visible={showSupplementalPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSupplementalPrompt(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Prediction Submitted</Text>
            <Text style={styles.modalText}>
              Your prediction has been submitted. Would you like to go on to see the supplemental challenges?
            </Text>

            <View style={styles.modalActions}>
              <Pressable style={styles.modalSecondaryButton} onPress={handleSkipSupplementals}>
                <Text style={styles.modalSecondaryText}>No</Text>
              </Pressable>

              <Pressable style={styles.modalPrimaryButton} onPress={handleGoToSupplementals}>
                <Text style={styles.modalPrimaryText}>Yes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDuplicatePrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDuplicatePrompt(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Prediction Already Submitted</Text>
            <Text style={styles.modalText}>
              You are not allowed to place more than one prediction per challenge.
            </Text>

            <View style={styles.singleActionWrap}>
              <Pressable style={styles.modalPrimaryButtonFull} onPress={handleDuplicateOkay}>
                <Text style={styles.modalPrimaryText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 28,
    fontWeight: '700',
    marginTop: 75,
    marginBottom: 5,
    paddingHorizontal: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  subLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 28,
    marginBottom: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mainCard: {
    marginTop: 8,
    marginHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: 'rgba(20, 10, 46, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectorWrap: {
    marginTop: 10,
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
    marginBottom: 6,
  },
  submitButton: {
    width: 280,
    height: 47,
    marginTop: 0,
    resizeMode: 'contain',
  },
  errorText: {
    color: '#e26fae',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1b103f',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalText: {
    color: '#f3eefe',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  singleActionWrap: {
    width: '100%',
  },
  modalSecondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2a2150',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPrimaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#c43dff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPrimaryButtonFull: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#c43dff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSecondaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});