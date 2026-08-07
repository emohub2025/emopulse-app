import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const PLAYED_KEY = "playedChallenges";

interface PlayedChallenge {
  challenge_id: string;
  batch_id: string;
}

export async function markChallengePlayed(
  challenge_id: string,
  batch_id: string,
  visibleIdsFromFeed: string[]   // ⭐ active + recent
) {
  const raw = await AsyncStorage.getItem(PLAYED_KEY);
  const arr: PlayedChallenge[] = raw ? JSON.parse(raw) : [];

  // Add new played challenge
  if (!arr.some(pc => pc.challenge_id === challenge_id)) {
    arr.push({ challenge_id, batch_id });
  }

  // Include previously played challenges in visibility
  const playedIds = arr.map(pc => pc.challenge_id);

  const visibleIds = new Set([
    ...visibleIdsFromFeed,
    ...playedIds,
  ]);

  // Prune only challenges that truly disappeared
  const pruned = arr.filter(pc => visibleIds.has(pc.challenge_id));

  await AsyncStorage.setItem(PLAYED_KEY, JSON.stringify(pruned));
}

export async function getPlayedChallenges(): Promise<PlayedChallenge[]> {
  const raw = await AsyncStorage.getItem(PLAYED_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function usePlayedChallenges() {
  const [played, setPlayed] = useState<PlayedChallenge[]>([]);

  useEffect(() => {
    getPlayedChallenges().then(setPlayed);
  }, []);

  return played;
}
