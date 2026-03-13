import { getSubchallengeList } from "../../api/subchallenges";

export async function getSubchallenges(
  challenge_id: string,
) {

  console.log("📡 Fetching subchallenges for: ", challenge_id);
  const list = await getSubchallengeList(challenge_id);

  console.log("🧠 Running shouldShowSubchallenge() with:", {
    activeChallenge: {
      id: challenge_id,
    },
    list
  });

  return true;
}