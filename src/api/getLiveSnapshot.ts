import { useEffect, useRef, useState } from "react";
import { apiGet } from "./engineClient";
import type { LiveSnapshotResponse, LiveSnapshotItem, LiveMainEmotions } from "../navigation/types";

/* Normalize emotions */
export function normalizeEmotions(main: LiveMainEmotions) {
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

/* Simple fetcher */
export async function getLiveSnapshot() {
  return apiGet<LiveSnapshotResponse>("/live/snapshot");
}

/* React hook */
export function useLiveSnapshot(pollIntervalMs: number = 2000) {
  const [snapshot, setSnapshot] = useState<LiveSnapshotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchSnapshot() {
      try {
        const response = await getLiveSnapshot();
        if (mounted) {
          setSnapshot(response.snapshot);
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
  }, []);
/*
  // ⭐ Log vote totals whenever snapshot updates
  useEffect(() => {
    if (snapshot.length > 0) {
      console.log("🔥 Live Snapshot Updated:");

      snapshot.forEach(ch => {
        console.log(
          `Challenge ${ch.id}:`,
          `happy=${ch.main.happy?.count ?? 0},`,
          `angry=${ch.main.angry?.count ?? 0},`,
          `sad=${ch.main.sad?.count ?? 0},`,
          `anxious=${ch.main.anxious?.count ?? 0}`
        );
      });
    }
  }, [snapshot]);
*/
  return { snapshot, loading, error };
}