import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity } from 'react-native';
import EmotionSelector from '../../components/EmotionSelector';
import { SafeAreaView } from 'react-native-safe-area-context';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useCycleTimer } from '../../components/CycleTimerContext';
import eventBus from '../../components/EventBus';
import { postPlaceUserBet } from '../../api/postPlaceUserBet';
import { getSubchallengeList } from '../../api/subchallenges';

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
  const USER_ID = "dda1522f-2c44-499e-a8e5-04460b888d05";

  // Auto-shrink state
  const [topicFontSize, setTopicFontSize] = useState(24);

  const handleSubmit = async () => {
    if (!emotion) return;

    try {
      setLoading(true);

       const response = await postPlaceUserBet({
         challenge_id: challenge.id,
         user_id: USER_ID,
         emotion: emotion
       });

       console.log("Bet placed:", response);

      // ⭐ RUN SUBCHALLENGE GATING HERE
      const listResults = await getSubchallengeList(challenge.id);
      //console.log("Subchallenge list:", JSON.stringify(listResults, null, 2));

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
      }
      else {
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error("Bet failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !emotion || loading;
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;

    const handler = () => {
      //navigation.navigate('ChallengeResults', {
      //  challenge
      //});
    };

    eventBus.on('cycleExpired', handler);

    return () => {
      eventBus.off('cycleExpired', handler);
    };
  }, [isFocused, navigation, challenge]);

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

  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
});