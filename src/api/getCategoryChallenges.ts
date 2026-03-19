import { Challenge } from "../navigation/types";
import { apiGet } from "./engineClient";

export function getChallengesForCategory(category: string): Promise<Challenge[]> {

  return apiGet<Challenge[]>(
    `category/${encodeURIComponent(category)}/challenge-details`
  ).then((response) => {
    //console.log("📥 getChallengesForCategory response:", response);
    return response;
  });
}
