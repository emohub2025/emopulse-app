import { shouldShowSubchallenge } from "./shouldShowSubchallenge";
import { getSubchallengeTemplate, getSubchallengeResponses } from "../../api/subchallenges";
import type { NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../navigation/types";
import { Challenge } from "../../navigation/types";

export async function maybeShowSubchallenge(
  challenge: Challenge,
  navigation: NavigationProp<RootStackParamList>
) {
  console.log("🔍 maybeShowSubchallenge() called with challenge:", {
    id: challenge.id,
    subchallenge_id: challenge.subchallenge_id,
    topic: challenge.topic
  });

  if (!challenge.subchallenge_id) {
    console.log("⛔ No subchallenge_id on challenge. Exiting.");
    return false;
  }

  const USER_ID = "dda1522f-2c44-499e-a8e5-04460b888d05";
  console.log("📡 Fetching template for subchallenge:", challenge.subchallenge_id);
  const template = await getSubchallengeTemplate(challenge.subchallenge_id);
  console.log("📄 Template loaded:", template);

  console.log("📡 Fetching user responses for subchallenge:", challenge.subchallenge_id);
  const responses = await getSubchallengeResponses(
    challenge.subchallenge_id,
    USER_ID
  );

  console.log("🧾 User responses:", responses);

  console.log("🧠 Running shouldShowSubchallenge() with:", {
    activeChallenge: {
      id: challenge.id,
      subchallenge_id: challenge.subchallenge_id
    },
    template,
    responsesCount: responses.length
  });

  const show = shouldShowSubchallenge({
    activeChallenge: challenge,
    template,
    userResponses: responses
  });

  console.log("🎯 shouldShowSubchallenge returned:", show);

  if (!show) {
    console.log("🚫 Gating logic says DO NOT SHOW subchallenge.");
    return false;
  }

  console.log("🚀 Navigating to Subchallenge screen...");
  navigation.navigate("Subchallenge", { challenge });

  return true;
}