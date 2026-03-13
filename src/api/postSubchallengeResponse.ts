import { apiPost } from "./engineClient";

export interface PostSubchallengeResponseBody {
  user_id: string;
  challenge_id: string;
  subchallenge_id: string;
  option_text: string | null;
  dont_ask_again: boolean;
}

export async function postSubchallengeResponse(body: PostSubchallengeResponseBody) {
  return apiPost<void>("/mobile/subchallenge/respond", body);
}