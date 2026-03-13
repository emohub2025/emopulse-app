import { Challenge } from "../navigation/types";
import { apiGet } from "./engineClient";

export function getChallengesForCategory(category: string): Promise<Challenge[]> {

  console.log("📂 getChallengesForCategory called with category:", category);


  return apiGet<Challenge[]>(`/mobile/category/${encodeURIComponent(category)}/challenge-topic`);
}
