import { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, Pressable, TouchableOpacity, BackHandler, StyleSheet } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, SubchallengeList } from '../../navigation/types';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useCycleTimer } from '../../components/CycleTimerContext';
import answerButton from '../../assets/buttons/answer.png';
import skipButton from '../../assets/buttons/skip.png';
import { getChallengeImageSource } from '../../assets/wacky/getChallengeImageSource';
import { postPlaceUserSubBet } from '../../api/postPlaceUserBet';
import { useCurrentUserId } from "../../state/useUserSelectors";

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

  const { challenge, subchallenges } = route.params;
  const [loading, setLoading] = useState(false);
  const { formattedTime } = useCycleTimer();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const current: SubchallengeList = subchallenges[index];
  const imageSource = getChallengeImageSource(challenge);
  const userId = useCurrentUserId();

  const handleSkip = () => {
    // If there are more questions, move forward
    if (index + 1 < subchallenges.length) {
      setIndex(index + 1);
      setSelected(null); // reset selection for next question
    } else {
      // If this was the last question, go to results
      navigation.navigate("ChallengeCountdown", { challenge });
    }
  };

  const handleAnswer = async () => {
    try {
      setLoading(true);

      if (!selected) return;
      if (!userId) return; // prevent invalid request

      // ⭐ Validate the selected option BEFORE sending to backend
      const option = current.options.find(o => o.id === selected);

      if (!option || typeof option.id !== "string" || option.id.length < 10) {
        console.error("Invalid option object:", option);
        throw new Error("Invalid option object: missing or invalid UUID");
      }

      const response = await postPlaceUserSubBet({
        subchallenge_id: current.id,
        option_id: selected,
        user_id: userId,
        amount: 1
      });

      console.log("Subchallenge bet placed:", response);

    } catch (err) {
      console.error("Subchallenge bet failed:", err);
    } finally {
      setLoading(false);
    }

    if (index + 1 < subchallenges.length) {
      setIndex(index + 1);
      setSelected(null);
    } else {
      navigation.navigate("ChallengeCountdown", { challenge });
    }
  };

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

  // ⭐ Auto-select first option whenever the question changes
  useEffect(() => {
    if (current?.options?.length > 0) {
      setSelected(current.options[0].id);
    }
  }, [index]);

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
        {current.question_text}
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
            <Text style={styles.optionText}>{opt.metadata?.text}</Text>
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
            handleAnswer();
          }}
        >
          <Image source={answerButton} style={styles.answerImage} />
        </Pressable>

      </View>

      <Text style={styles.timer}>{formattedTime}</Text>
    </View>
    </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
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
  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
});