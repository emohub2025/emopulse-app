// postPlaceUserBet.ts
import { apiPost } from "./engineClient";

export interface PlaceBetRequest {
  challenge_id: string;
  user_id: string;
  emotion: string;
}

export interface PlaceBetResponse {
  bet_id: string;
  wallet_balance: string;
}

export function postPlaceUserBet(
  payload: PlaceBetRequest
): Promise<PlaceBetResponse> {
  return apiPost<PlaceBetResponse>("prediction", payload);
}

export async function postPlaceUserSubBet(payload: {
  subchallenge_id: string;
  option_id: string;
  user_id: string;
  amount: number;
}) {
  return apiPost("subchallenge-prediction", payload);
}