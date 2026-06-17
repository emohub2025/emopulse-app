// api/comments.ts
import { apiGet, apiPost } from "./engineClient";

export type ChallengeComment = {
  username: string;
  text: string;
  created_at: string;
};

export async function fetchComments(
  challengeId: string
): Promise<ChallengeComment[]> {
  const res = await apiGet<{ comments: ChallengeComment[] }>(
    `/challenge/${challengeId}/comments`
  );
  return res.comments;
}

export async function postComment(
  challengeId: string,
  text: string
): Promise<void> {
  await apiPost(`/challenge/${challengeId}/comments`, { text });
}