// postPlaceUserBet.ts
import { apiPost } from "./engineClient";

export interface PlaceBetRequest {
  challenge_id: string;
  user_id: string;
  emotion: string;
  amount: number;
}

export interface PlaceBetResponse {
  bet_id: string;
  wallet_balance: string;
}

export interface PlaceSubBetRequest {
  subchallenge_id: string;
  option_id: string;
  user_id: string;
  amount: number;
}

export interface PlaceSubBetResponse {
  subbet_id: string;
  wallet_balance: string;
}

interface PollingBetRequest {
  challenge_id: string;
  user_id: string;
  selected_index: number;
  selected_answer: string;
  amount: number;
}

interface PollingBetResponse {
  vote_id: string;
  wallet_balance: number;
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
        : "Failed to submit challenge prediction";

    throw new Error(msg);
  }
}

export async function postPlaceUserSubBet(payload: PlaceSubBetRequest) {
  try {
    return await apiPost<PlaceSubBetResponse>("subchallenge-prediction", payload);
  } catch (err: any) {
    // ⭐ Normalize to a STRING — never rethrow an Error object
    const msg =
      typeof err === "string"
        ? err
        : typeof err?.message === "string"
        ? err.message
        : "Failed to submit subchallenge prediction";

    throw msg; // ⭐ throw STRING, not Error
  }
}

export async function postPlaceUserPollingBet(payload: PollingBetRequest) {
  try {
    return await apiPost<PollingBetResponse>("polling-prediction", payload);
  } catch (err: any) {
    const msg =
      typeof err === "string"
        ? err
        : typeof err?.message === "string"
        ? err.message
        : "Failed to submit polling response";

    throw new Error(msg);
  }
}
