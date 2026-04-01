import { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, SubchallengeList } from '../../navigation/types';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useCycleTimer } from '../../components/CycleTimerContext';
import answerButton from '../../assets/buttons/answer.png';
import { getChallengeImageSource } from '../../assets/wacky/getChallengeImageSource';
import { postPlaceUserSubBet } from '../../api/postPlaceUserBet';

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
  const USER_ID = "dda1522f-2c44-499e-a8e5-04460b888d05";

  const handleAnswer = async () => {
    try {
      setLoading(true);

      if (!selected) return;

      // ⭐ Validate the selected option BEFORE sending to backend
      const option = current.options.find(o => o.id === selected);

      if (!option || typeof option.id !== "string" || option.id.length < 10) {
        console.error("Invalid option object:", option);
        throw new Error("Invalid option object: missing or invalid UUID");
      }

      const response = await postPlaceUserSubBet({
        subchallenge_id: current.id,
        option_id: selected,
        user_id: USER_ID,
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
      navigation.navigate("ChallengeResults", { challenge });
    }
  };

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

      {/* NEXT BUTTON */}
      <Pressable
        onPress={() => {
          if (!selected) return;   // ignore if nothing selected
          handleAnswer();  // go to next question
        }}
      >
        <Image source={answerButton} style={styles.answerImage} />
      </Pressable>

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
    width: 280,
    height: 47,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 52,
  },
  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
});