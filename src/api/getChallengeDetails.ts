import { apiGet } from "./engineClient";

export interface ChallengeDetail {
  id: string;
  topic: string;
  source: string;
  quote?: string;
  snippet?: string;
  stat?: string;
  image_url?: string;
  category: string;
}

export function getChallengeDetails(category: string, id: string): Promise<ChallengeDetail> {
  return apiGet<ChallengeDetail>(
    `category/${encodeURIComponent(category)}/challenge-details/${encodeURIComponent(id)}`
  );
}