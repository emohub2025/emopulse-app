import type {
  Challenge,
  SubchallengeTemplate,
  UserSubchallengeResponse
} from "../../navigation/types";

export function shouldShowSubchallenge({
  activeChallenge,
  template,
  userResponses,
  now = Date.now()
}: {
  activeChallenge: Challenge;
  template: SubchallengeTemplate;
  userResponses: UserSubchallengeResponse[];
  now?: number;
}) {
  console.log("🔎 shouldShowSubchallenge inputs:", {
    hasResponses: userResponses.length > 0,
    responsesCount: userResponses.length,
    challengeId: activeChallenge.id,
    subchallengeId: activeChallenge.subchallenge_id
  });
  if (!activeChallenge.subchallenge_id) return false;

  if (!template.active) {
    console.log("❌ Template inactive");
    return false;
  }
  
  // 0. Category match required
  if (template.category !== activeChallenge.category) {
    console.log("❌ Category mismatch");
    return false;
  }

//return true;

  // 1. User opted out
  const optedOut = userResponses.find(r => r.dont_ask_again);
  if (optedOut) return false;

  // 2. User already answered this challenge
  const alreadyAnswered = userResponses.find(
    r => r.challenge_id === activeChallenge.id
  );
  if (alreadyAnswered) {
    console.log("❌ User already answered this subchallenge");
    return false;
  }

  // 3. Cooldown logic
  const lastAnswer = userResponses[0]; // sorted DESC by backend
  const cooldownMs = template.challenge_period_ms ?? 24 * 60 * 60 * 1000;

  if (lastAnswer) {
    const lastAnswerTime = new Date(lastAnswer.created_at).getTime();
    const elapsed = now - lastAnswerTime;
    const remaining = cooldownMs - elapsed;

    console.log("⏳ Cooldown debug:", {
      lastAnswerAt: new Date(lastAnswerTime).toISOString(),
      cooldownMs,
      elapsedMs: elapsed,
      remainingMs: remaining,
      remainingMinutes: Math.max(0, Math.round(remaining / 60000)),
      expired: remaining <= 0
    });

    if (remaining > 0) {
      console.log("❌ Cooldown not expired");
      return false;
    }
  }

  // 4. Avoid showing subchallenge near cycle expiration
  if (activeChallenge.expires_at) {
    const expiresAt = new Date(activeChallenge.expires_at).getTime();
    const timeLeft = expiresAt - now;
    if (timeLeft < 1 * 60 * 1000) {
      console.log("❌ Too close to cycle end");
      return false;
    }
  }

  return true;
}