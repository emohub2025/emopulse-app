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

export async function postPlaceUserBet(payload: PlaceBetRequest) {
  try {
    return await apiPost<PlaceBetResponse>("prediction", payload);
  } catch (err: any) {
    const msg =
      typeof err === "string"
        ? err
        : typeof err?.message === "string"
        ? err.message
        : "Failed to place bet";

    throw new Error(msg);
  }
}

export async function postPlaceUserSubBet(payload: {
  subchallenge_id: string;
  option_id: string;
  user_id: string;
  amount: number;
}) {
  try {
    return await apiPost("subchallenge-prediction", payload);
  } catch (err: any) {
    // ⭐ Normalize to a STRING — never rethrow an Error object
    const msg =
      typeof err === "string"
        ? err
        : typeof err?.message === "string"
        ? err.message
        : "Failed to place sub-bet";

    throw msg; // ⭐ throw STRING, not Error
  }
}