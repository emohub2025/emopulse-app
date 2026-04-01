import { apiGet } from "./engineClient";

export interface ChallengeResult {
  status: "ok";

  challenge: {
    challenge_id: string;
    category: string;
    batch_id: string;
    topic: string;
    source: string;
    resolved_at: string;
    paid_out_at: string;
    winning_emotion: string;

    total_participants: number | null;
    total_amount: number | null;
    total_bets: number | null;

    emotion_counts: {
      emotion: string;
      count: number;
    }[];
  };

  user_main: {
    user_id: string;
    emotion: string | null;
    amount: number;
    payout: number;
    delta: number;
    won: boolean;
    skipped: boolean;
  } | null;

  subchallenge_results: {
    subchallenge_id: string;
    question_text: string;
    user_option_id: string | null;
    winning_option_id: string | null;
    skipped: boolean;
    won: boolean;
    payout: number;
    delta: number;
    user_option_label: string | null;
    winning_option_label: string | null;
  }[];
}

export function getChallengeResults(
  id: string,
  userId?: string,
  delayMs: number = 1500   // ⭐ adjustable delay
): Promise<ChallengeResult> {

  const url = userId
    ? `challenge-results/${encodeURIComponent(id)}?user_id=${encodeURIComponent(
        userId
      )}`
    : `challenge-results/${encodeURIComponent(id)}`;

  console.log("⏳ Waiting before fetching challenge results…", delayMs, "ms");

  return new Promise(resolve => setTimeout(resolve, delayMs))
    .then(() => apiGet<ChallengeResult>(url))
    .then(response => {
      //console.log("🔥 Full Challenge Results Payload:");
      //console.log(JSON.stringify(response, null, 2));
      return response;
    })
    .catch(err => {
      console.log("❌ GET error body:", err?.response?.data ?? err);
      throw err;
    });
}