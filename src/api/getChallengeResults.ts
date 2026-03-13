import { apiGet } from "./engineClient";

export interface ChallengeResult {
  challenge_id: string;
  batch_id: string;
  topic: string;
  source: string;
  resolved_at: string;
  paid_out_at: string;
  winning_emotion: string;
  total_participants: number;
  total_amount: number;
  total_bets: number;

  emotion_counts: {
    emotion: string;
    count: number;
  }[];

  // ⭐ user-specific result (null if no bet or no user_id)
  user: {
    user_id: string;
    emotion: string;
    amount: number;
    odds: number;
    payout: number;
    delta: number;
    won: boolean;
  } | null;
}

export function getChallengeResults(
  id: string,
  userId?: string
): Promise<ChallengeResult> {
  const url = userId
    ? `/mobile/challenge-results/${encodeURIComponent(id)}?user_id=${encodeURIComponent(
        userId
      )}`
    : `/mobile/challenge-results/${encodeURIComponent(id)}`;

  return apiGet<ChallengeResult>(url);
}
