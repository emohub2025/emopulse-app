import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity } from 'react-native';
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

  // Auto-shrink state
  const [topicFontSize, setTopicFontSize] = useState(24);

  const handleSubmit = async () => {
    if (!emotion) return;

    try {
      setLoading(true);
      setErrorMessage(null);

      if (!userId) {
        setErrorMessage("Missing user ID");
        return;
      }
      const response = await postPlaceUserBet({
        challenge_id: challenge.id,
        user_id: userId,
        emotion: emotion
      });

      console.log("Bet placed:", response);

      const listResults = await getSubchallengeList(challenge.id);

      if (listResults && listResults.length > 0) {
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
      console.error("Bet failed:", err);

      // ⭐ Prevent Expo red screen
      setErrorMessage(err?.message || "Unable to place bet.");
    } finally {
      setLoading(false);
    }
  };

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

            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

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
        <Text style={styles.timer}>
          {formattedTime}
        </Text>

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
    color: 'red',
    fontSize: 22,
    textAlign: 'center',
    marginTop: 20,
  },

  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
});