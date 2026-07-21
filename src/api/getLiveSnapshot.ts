import { useEffect, useState } from "react";
import { apiGet } from "./engineClient";
import type { LiveSnapshotResponse, LiveSnapshotItem, LiveMain } from "../navigation/types";

/* --------------------------------------------------
   Normalize emotions
-------------------------------------------------- */
export function normalizeEmotions(main: LiveMain) {
  const total =
    (main.angry?.total ?? 0) +
    (main.happy?.total ?? 0) +
    (main.sad?.total ?? 0) +
    (main.anxious?.total ?? 0);

  if (total === 0) {
    return {
      angry: { pct: 0, count: 0 },
      happy: { pct: 0, count: 0 },
      sad: { pct: 0, count: 0 },
      anxious: { pct: 0, count: 0 },
    };
  }

  return {
    angry:   { pct: (main.angry?.count ?? 0) / total,   count: main.angry?.count ?? 0 },
    happy:   { pct: (main.happy?.count ?? 0) / total,   count: main.happy?.count ?? 0 },
    sad:     { pct: (main.sad?.count ?? 0) / total,     count: main.sad?.count ?? 0 },
    anxious: { pct: (main.anxious?.count ?? 0) / total, count: main.anxious?.count ?? 0 },
  };
}

/* --------------------------------------------------
   Normalize polling
-------------------------------------------------- */
export function normalizePoll(main: LiveMain) {
  const raw = main.poll_results ?? [];

  // Always produce exactly 4 entries, sorted by index
  const poll = [0, 1, 2, 3].map(i => {
    const found = raw.find(r => r.index === i);
    return {
      index: i,
      pct: found ? found.pct : 0
    };
  });

  return poll;
}

/* --------------------------------------------------
   Enriched type (extends backend type safely)
-------------------------------------------------- */
export type EnrichedLiveSnapshotItem = LiveSnapshotItem & {
  isPoll: boolean;
  pollResults?: { index: number; pct: number }[];
  polling_answers?: string[];
  leadingOption?: number;
  leadingEmotion?: string;
  leadingPct: number;
};

/* --------------------------------------------------
   Fetcher
-------------------------------------------------- */
export async function getLiveSnapshot() {
  return apiGet<LiveSnapshotResponse>("/live/snapshot");
}

/* --------------------------------------------------
   Hook with polling + emotion enrichment
-------------------------------------------------- */
export function useLiveSnapshot(pollIntervalMs: number = 2000) {
  const [snapshot, setSnapshot] = useState<EnrichedLiveSnapshotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchSnapshot() {
      try {
        const response = await getLiveSnapshot();

        if (mounted) {
          const enriched: EnrichedLiveSnapshotItem[] = response.snapshot.map(ch => {
            const isPoll = ch.isPoll;

            if (isPoll) {
              const poll = normalizePoll(ch.main);
              const sorted = [...poll].sort((a, b) => b.pct - a.pct);
              const winner = sorted[0];

              return {
                ...ch,
                isPoll: true,
                pollResults: poll,
                leadingOption: winner.index,
                leadingPct: Math.round(winner.pct * 100),
              };
            }

            // Emotion challenge
            const emotions = normalizeEmotions(ch.main);
            const sorted = Object.entries(emotions).sort((a, b) => b[1].pct - a[1].pct);
            const [winner, data] = sorted[0];

            return {
              ...ch,
              isPoll: false,
              leadingEmotion: winner,
              leadingPct: Math.round(data.pct * 100),
            };
          });

          setSnapshot(enriched);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError("Failed to load live data");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchSnapshot();
    const interval = setInterval(fetchSnapshot, pollIntervalMs);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pollIntervalMs]);

  return { snapshot, loading, error };
}
