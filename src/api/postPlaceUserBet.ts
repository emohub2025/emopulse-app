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

export async function postPlaceUserBet(
  payload: PlaceBetRequest
): Promise<PlaceBetResponse> {
  try {
    const response = await apiPost<PlaceBetResponse>("prediction", payload);
    return response;
  } catch (err: any) {
    // Normalize the error so your UI can handle it
    throw new Error(err?.message || "Failed to place bet");
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
    throw new Error(err?.message || "Failed to place sub-bet");
  }
}
