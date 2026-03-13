const BASE_URL = "http://172.236.119.144:4100";

export async function fetchChallengesForCategory(category: string) {
  const url = `${BASE_URL}/mobile/categories/${encodeURIComponent(category)}/challenges`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch challenges: ${response.status}`);
  }

  return response.json();
}