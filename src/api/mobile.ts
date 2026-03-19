import { apiGet } from "./engineClient";

export async function fetchChallengesForCategory(category: string) {
  return apiGet(
    `/categories/${encodeURIComponent(category)}/challenges`
  );
}