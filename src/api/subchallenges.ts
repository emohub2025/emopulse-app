import type { SubchallengeList, SubchallengeTemplate, UserSubchallengeResponse } from '../navigation/types';
import { apiGet } from "./engineClient";

export async function getSubchallengeList(challengeId: string) {
  console.log("🧠 Running getSubchallengeList() with:", {
    activeChallenge: {
      id: challengeId,
    }
  });
  return apiGet<SubchallengeList[]>(
    `/mobile/subchallenge/list/${challengeId}`
  );
}

export async function getSubchallengeTemplate(subchallengeId: string) {
  return apiGet<SubchallengeTemplate>(
    `/mobile/subchallenge/${subchallengeId}`
  );
}

export async function getSubchallengeResponses(
  subchallengeId: string,
  userId: string
) {
  return apiGet<UserSubchallengeResponse[]>(
    `/mobile/subchallenge/responses/${subchallengeId}?user_id=${userId}`
  );
}