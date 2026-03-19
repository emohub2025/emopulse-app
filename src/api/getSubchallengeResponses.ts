import { apiGet } from "./engineClient";
import type { UserSubchallengeResponse } from "../navigation/types";

export async function getSubchallengeResponses(
  subchallengeId: string,
  userId: string
) {
  return apiGet<UserSubchallengeResponse[]>(
    `subchallenge/responses/${subchallengeId}?user_id=${userId}`
  );
}