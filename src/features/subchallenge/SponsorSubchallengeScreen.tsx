import React, { useEffect, useState } from "react";
import { View, Text, Image, Dimensions, StyleSheet, Pressable, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList, SubchallengeTemplate, UserSubchallengeResponse } from "../../navigation/types";
import { getSubchallengeTemplate, getSubchallengeResponses } from "../../api/subchallenges";
import { postSubchallengeResponse } from "../../api/postSubchallengeResponse";
import { LinearGradient } from "expo-linear-gradient";
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useCycleTimer } from '../../components/CycleTimerContext';
import { useCurrentUserId } from "../../state/useUserSelectors";

type NavProp = NativeStackNavigationProp<RootStackParamList, "Subchallenge">;
type RouteProps = RouteProp<RootStackParamList, "Subchallenge">;

export default function SponsorSubchallengeScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { challenge } = route.params;
  const userId = useCurrentUserId();
  const [template, setTemplate] = useState<SubchallengeTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ⭐ NEW: store user responses for cooldown + already-answered logic
  const [userResponses, setUserResponses] = useState<UserSubchallengeResponse[]>([]);

  const { formattedTime } = useCycleTimer();

  //
  // Load template
  //
  useEffect(() => {
    async function load() {
      try {
        const t = await getSubchallengeTemplate(challenge.subchallenge_id!);
        setTemplate(t);
      } catch (err) {
        console.log("Subchallenge template error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [challenge.subchallenge_id]);

  //
  // ⭐ NEW: Load user responses for this template
  //
  useEffect(() => {
    async function loadResponses() {
      if (!userId) return; // prevent invalid request
      try {
        const res = await getSubchallengeResponses(
          challenge.subchallenge_id!,
          userId
        );
        setUserResponses(res);
        //console.log("Loaded userResponses:", res);
      } catch (err) {
        console.log("Error loading user responses:", err);
      }
    }
    loadResponses();
  }, [challenge.subchallenge_id]);

  //
  // Preselect first option
  //
  useEffect(() => {
    if (template && Array.isArray(template.options) && template.options.length > 0) {
      setSelectedOption(template.options[0]);
    }
  }, [template]);

  //
  // Submit response
  //
  async function handleSubmit() {
    if (!selectedOption && !dontAskAgain) return;
    if (!userId) return; // prevent invalid request

    try {
      setSubmitting(true);

      await postSubchallengeResponse({
        user_id: userId,
        challenge_id: challenge.id,
        subchallenge_id: challenge.subchallenge_id!,
        option_text: selectedOption,
        dont_ask_again: dontAskAgain
      });

      // ⭐ NEW: Refresh user responses after submit
      const updated = await getSubchallengeResponses(
        challenge.subchallenge_id!,
        userId
      );
      setUserResponses(updated);

      navigation.goBack();
    } catch (err) {
      console.log("Subchallenge submit error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  //
  // UI states
  //
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    );
  }

  if (!template) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: "white" }}>Failed to load subchallenge.</Text>
      </SafeAreaView>
    );
  }

  //
  // Determine layout mode (3, 4, or 5 options)
  //
  const optionCount = template.options.length;
  let layoutMode: "three" | "four" | "five" = "three";

  if (optionCount === 4) layoutMode = "four";
  if (optionCount === 5) layoutMode = "five";

  //
  // Main UI
  //
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <LinearGradient
        colors={['#6a0dad', '#ff0000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >

        <View style={styles.contentArea}>
          <AutoShrinkBlock
            maxFontSize={26}
            minFontSize={18}
            height={82}
            minHeight={82}
            textAlign="center"
            fontWeight="500"
          >
            {template.question_text}
          </AutoShrinkBlock>

          {template.image_url && (
            <Image
              source={{ uri: `${template.image_url}?v=${template.category}` }}
              style={styles.subchallengeImage}
            />
          )}

          <View style={styles.optionsWrapper}>

            {template.options.map((opt) => (
              <RadioTile
                key={opt}
                label={opt}
                selected={selectedOption === opt}
                layoutMode={layoutMode}
                onPress={() => {
                  setSelectedOption(opt);
                  setDontAskAgain(false);
                }}
              />
            ))}

            <RadioTile
              label="Don’t ask again"
              selected={dontAskAgain}
              layoutMode={layoutMode}
              onPress={() => {
                setDontAskAgain(true);
                setSelectedOption(null);
              }}
            />

          </View>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={handleSubmit}>
            <Image
              source={require('../../assets/buttons/submit.png')}
              style={styles.submitButton}
            />
          </TouchableOpacity>
        </View>

      </LinearGradient>

      <Text style={styles.timer}>
        {formattedTime}
      </Text>

    </SafeAreaView>
  );
}

//
// ⭐ RadioTile Component with 3 layout modes
//
function RadioTile({
  label,
  selected,
  layoutMode,
  onPress
}: {
  label: string;
  selected: boolean;
  layoutMode: "three" | "four" | "five";
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.radioTileBase,
        layoutMode === "three" && styles.radioTileThree,
        layoutMode === "four" && styles.radioTileFour,
        layoutMode === "five" && styles.radioTileFive,
      ]}
      onPress={onPress}
    >
      <Image
        source={
          selected
            ? require("../../assets/buttons/radio-sel.png")
            : require("../../assets/buttons/radio.png")
        }
        style={[
          styles.radioIconBase,
          layoutMode === "three" && styles.radioIconThree,
          layoutMode === "four" && styles.radioIconFour,
          layoutMode === "five" && styles.radioIconFive,
        ]}
      />

      <Text
        style={[
          styles.radioLabelBase,
          layoutMode === "three" && styles.radioLabelThree,
          layoutMode === "four" && styles.radioLabelFour,
          layoutMode === "five" && styles.radioLabelFive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

//
// Styles
//
const styles = StyleSheet.create({
  contentArea: {
    flex: 1,
    paddingVertical: -2,
    paddingHorizontal: 20,
  },
  bottomBar: {
    paddingVertical: 22,
    alignItems: "center",
  },
  submitButton: {
    width: 250,
    height: 60,
    marginBottom: -10,
    resizeMode: "contain",
  },
  gradient: {
    flex: 1,
    padding: 10,
  },
  safe: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 60,
  },
  center: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center"
  },
  subchallengeImage: {
    width: "100%",
    height: Dimensions.get("window").height * 0.19,
    borderRadius: 12,
    resizeMode: "cover",
    marginBottom: 3,
  },
  optionsWrapper: {
    marginTop: 10
  },

  //
  // ⭐ Radio Tiles (3 layout modes)
  //
  radioTileBase: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 15,
  },

  // 3 options → spacious
  radioTileThree: {
    paddingVertical: 8,
    marginLeft: 15,
    marginTop: 1,
    marginBottom: 8,
    minHeight: 60,
  },

  // 4 options → medium
  radioTileFour: {
    paddingVertical: 3,
    marginTop: 1,
    marginLeft: 25,
    marginBottom: 7,
    minHeight: 54,
  },

  // 5 options → compact
  radioTileFive: {
    paddingVertical: 3,
    marginLeft: 20,
    marginBottom: 6,
    minHeight: 44,
  },

  //
  // Icons
  //
  radioIconBase: {
    resizeMode: "contain",
    marginRight: 16,
  },

  radioIconThree: { width: 50, height: 50 },
  radioIconFour: { width: 45, height: 45 },
  radioIconFive: { width: 40, height: 40 },

  //
  // Labels
  //
  radioLabelBase: {
    color: "white",
    flexShrink: 1,
    fontWeight: "600",
  },

  radioLabelThree: { fontSize: 24 },
  radioLabelFour: { fontSize: 22 },
  radioLabelFive: { fontSize: 22 },

  timer: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
});