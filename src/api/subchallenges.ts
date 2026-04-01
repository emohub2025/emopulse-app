import type { SubchallengeList, SubchallengeTemplate, UserSubchallengeResponse } from '../navigation/types';
import { apiGet } from "./engineClient";

export async function getSubchallengeList(challengeId: string) {
  console.log("🧠 Running getSubchallengeList() with:", {
    activeChallenge: {
      id: challengeId,
    }
  });

  return apiGet<SubchallengeList[]>(
    `/subchallenge/list/${challengeId}`
  );
}

// Sponsored challenges
export async function getSubchallengeTemplate(subchallengeId: string) {
  return apiGet<SubchallengeTemplate>(
    `/subchallenge/${subchallengeId}`
  );
}

// Sponsored challenges
export async function getSubchallengeResponses(
  subchallengeId: string,
  userId: string
) {
  return apiGet<UserSubchallengeResponse[]>(
    `/subchallenge/responses/${subchallengeId}?user_id=${userId}`
  );
}