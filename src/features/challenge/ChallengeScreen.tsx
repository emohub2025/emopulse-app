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

            <View style={styles.submitArea}>
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

              <Text style={styles.costText}>Cost: 1 Coin</Text>
            </View>
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
  submitArea: {
    alignItems: 'center',
    marginBottom: 8,
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
    width: 265,
    height: 54,
    resizeMode: 'contain',
  },
  costText: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  timer: {
    color: 'yellow',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 16,
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