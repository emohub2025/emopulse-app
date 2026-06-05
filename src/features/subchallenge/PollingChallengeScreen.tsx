import React, { useState } from "react";
import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../navigation/types";
import { postPlaceUserPollingBet } from "../../api/postPlaceUserBet";
import AutoShrinkBlock from "../../components/AutoShrinkBlock";
import { useCycleTimer } from "../../components/CycleTimerContext";
import { useCurrentUserId } from "../../state/useUserSelectors";
import { useFeed } from "../../context/FeedContext";
import { markChallengePlayed } from '../../hooks/usePlayedChallenges';

/* ---------------------------------------------
   TYPES
---------------------------------------------- */

interface PollingChallenge {
  id: string;
  topic: string;
  image_url: string;
  category: string;
  polling_answers: string[];
}

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  "PollingChallenge"
>;
type RouteProps = RouteProp<RootStackParamList, "PollingChallenge">;

/* ---------------------------------------------
   COMPONENT
---------------------------------------------- */

export default function PollingChallengeScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const userId = useCurrentUserId();
  const { formattedTime } = useCycleTimer();
  const { feed } = useFeed();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✔ selected is an index (0,1,2,...)
  const [selected, setSelected] = useState<number | null>(null);

  const { challengeId } = route.params;

  if (!feed) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <Text style={{ color: "white" }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const challenge: PollingChallenge | undefined = feed.categories
    .flatMap(c => [...c.active, ...c.recent])
    .find(ch => ch.id === challengeId);

  if (!challenge) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <Text style={{ color: "white" }}>Challenge not found</Text>
      </SafeAreaView>
    );
  }

  /* ---------------------------------------------
     HANDLE ANSWER
  ---------------------------------------------- */

  const handleAnswer = async () => {
    if (selected === null || loading) return;
    if (!userId) return;

    try {
      setLoading(true);
      setErrorMessage(null);

      const selectedIndex = selected;
      const selectedAnswer = challenge.polling_answers[selectedIndex];

      const response = await postPlaceUserPollingBet({
        challenge_id: challenge.id,
        user_id: userId,
        selected_index: selectedIndex,
        selected_answer: selectedAnswer,
        amount: 1
      });

      console.log("Polling prediction submitted:", response);
      await markChallengePlayed(challengeId);

      navigation.navigate("ChallengeCountdown", {
        challengeId: challenge.id
      });
    } catch (err: any) {
      console.log("🟥 UI CATCH (Polling):", err);
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

  /* ---------------------------------------------
     RENDER
  ---------------------------------------------- */

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={{ flex: 1, marginBottom: -45 }}
        resizeMode="cover"
      >
        <View style={styles.container}>
            <Image
              source={{
                uri: `${challenge.image_url}?v=${challenge.category}`
              }}
              style={styles.image}
            />

          <View style={styles.questionCard}>
            <AutoShrinkBlock
              maxFontSize={26}
              minFontSize={15}
              height={55}
              width={"100%"}
              minHeight={55}
              marginTop={-8}
              marginBottom={5}
              textAlign="center"
              fontWeight="500"
            >
              {challenge.topic}
            </AutoShrinkBlock>
          </View>

          {/* ⭐ Correct wrapper restored */}
          <View style={styles.optionsContainer}>
            {challenge.polling_answers.slice(0, 4).map((text, idx) => {
              const isSelected = selected === idx;

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelected(idx)}
                  activeOpacity={0.9}
                  style={[
                    styles.optionWrapper,
                    isSelected && styles.optionSelected
                  ]}
                >
                  <View
                    style={[
                      styles.optionLetterBubble,
                      isSelected && styles.optionLetterBubbleSelected
                    ]}
                  >
                    <Text style={styles.optionLetterText}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected
                    ]}
                  >
                    {text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity
              onPress={handleAnswer}
              disabled={submitting}
              style={submitting ? { opacity: 0.7 } : undefined}
            >
              <Image
                source={require("../../assets/buttons/submit.png")}
                style={styles.submitButton}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      <Text style={styles.timer}>{formattedTime}</Text>
    </View>
  );
}

/* ---------------------------------------------
   STYLES
---------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    justifyContent: "flex-start"
  },
  bottomBar: {
    marginTop: 17,
    alignItems: "center"
  },
  submitButton: {
    width: 250,
    height: 60,
    marginBottom: -10,
    resizeMode: "contain"
  },
  questionCard: {
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 18,
    backgroundColor: "rgba(18, 10, 42, 0.78)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: 10,
    paddingTop: 10
  },
  image: {
    marginTop: 80,
    width: "100%",
    height: "30%",
    resizeMode: "contain"
  },
  optionsContainer: {
    gap: 0,
    minHeight: 280,
    maxHeight: 280
  },
  optionWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 0,
    paddingLeft: 14,
    paddingRight: 12,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    marginBottom: 6,
    borderWidth: 2,
    height: 70,
    justifyContent: "center",
    borderColor: "rgba(255,255,255,0.06)"
  },
  optionSelected: {
    borderColor: "#c43dff",
    backgroundColor: "rgba(133, 47, 184, 0.28)",
    shadowColor: "#c43dff",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 }
  },
  optionLetterBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.30)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  optionLetterBubbleSelected: {
    backgroundColor: "#c43dff"
  },
  optionLetterText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700"
  },
  optionText: {
    flex: 1,
    color: "white",
    fontSize: 18,
    fontWeight: "600"
  },
  optionTextSelected: {
    color: "#ffffff"
  },
  timer: {
    marginHorizontal: 40,
    width: 250,
    backgroundColor: "rgba(255, 215, 0, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.75)",
    borderRadius: 999,
    color: 'yellow',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 40,
    alignSelf: 'center',
  },
});
