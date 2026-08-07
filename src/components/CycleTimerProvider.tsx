// src/context/CycleTimerContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import eventBus from "../components/EventBus";
import { useFeed } from "../context/FeedContext";
import { navigationRef } from "../navigation/navigationRef";
import type { CycleInfo, CycleMode } from "../navigation/types";
import CountdownOverlay from "./CountdownOverlay";

type ModeState = {
  cycleStartTime: number | null;
  cycleEndTime: number | null;
  timeRemainingMs: number;
  elapsedMs: number;
  activeChallengeId: string | null;
  playedThisCycle: boolean;
  formattedTime: string | null;
};

export type CycleTimerContextType = {
  rss: ModeState;
  poll: ModeState;

  applyCycleFromFeed: (cycle: CycleInfo) => void;
  markPlayed: (mode: CycleMode) => void;
  setActiveChallengeId: (mode: CycleMode, id: string | null) => void;
};

const defaultModeState: ModeState = {
  cycleStartTime: null,
  cycleEndTime: null,
  timeRemainingMs: 0,
  elapsedMs: 0,
  activeChallengeId: null,
  playedThisCycle: false,
  formattedTime: "",
};

const CycleTimerContext = createContext<CycleTimerContextType>({
  rss: defaultModeState,
  poll: defaultModeState,
  applyCycleFromFeed: () => {},
  markPlayed: () => {console.log("🌀 createContext: markPlayed ignored (empty cycle)");},
  setActiveChallengeId: () => {console.log("🌀 createContext: setActiveChallengeId ignored (empty cycle)");},
});

interface Props {
  children: React.ReactNode;
}

export function CycleTimerProvider({ children }: Props) {
  const [rssState, setRssState] = useState<ModeState>(defaultModeState);
  const [pollState, setPollState] = useState<ModeState>(defaultModeState);
  const rssRef = useRef(rssState);
  const pollRef = useRef(pollState);
  const { rssFeed, pollFeed, setRssFeed, setPollFeed } = useFeed();
  const rssBatchIdRef = useRef<string | null>(null);
  const pollBatchIdRef = useRef<string | null>(null);

  useEffect(() => {
    rssRef.current = rssState;
  }, [rssState]);

  useEffect(() => {
    pollRef.current = pollState;
  }, [pollState]);

  const applyCycleFromFeed = useCallback((cycle: CycleInfo) => {
    // ⭐ Ignore empty cycles FIRST
    if (!cycle || !cycle.startTime || !cycle.endTime) {
      //console.log("🌀 applyCycleFromFeed ignored (empty cycle)");
      return;
    }

    // ⭐ DO NOT update cycle state while Results screen is active
    const currentRoute = navigationRef.getCurrentRoute()?.name;
    if (currentRoute === "ChallengeResults") {
      //console.log("🌀 applyCycleFromFeed ignored (in results flow)");
      return;
    }

    const start = Number(cycle.startTime);
    const end = Number(cycle.endTime);

    const base = {
      cycleStartTime: start,
      cycleEndTime: end,
      timeRemainingMs: Math.max(0, end - Date.now()),
      elapsedMs: 0,
      formattedTime: "",
    };

    if (cycle.mode === "rss") {
      rssBatchIdRef.current = cycle.batchId ?? null;
      setRssState(prev => ({ ...prev, ...base }));
    } else {
      pollBatchIdRef.current = cycle.batchId ?? null;
      setPollState(prev => ({ ...prev, ...base }));
    }
  }, [rssFeed, pollFeed]);

  const markPlayed = useCallback((mode: CycleMode) => {
    if (mode === "rss") {
      setRssState(prev => {
        const updated = { ...prev, playedThisCycle: true };
        rssRef.current = updated;
        return updated;
      });
    } else {
      setPollState(prev => {
        const updated = { ...prev, playedThisCycle: true };
        pollRef.current = updated;
        return updated;
      });
    }
  }, []);

  const setActiveChallengeId = useCallback(
    (mode: CycleMode, id: string | null) => {
      if (mode === "rss") {
        setRssState((prev) => ({ ...prev, activeChallengeId: id }));
      } else {
        setPollState((prev) => ({ ...prev, activeChallengeId: id }));
      }
    },
    []
  );

  // Helper to compute formatted time
  const computeFormattedTime = (
    start: number | null,
    end: number | null,
    remainingMs: number
  ): string => {
    if (start == null || end == null) return "";

    const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    if (isNaN(totalSeconds) || totalSeconds === 0) return "";

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes === 0) return `${seconds}s remaining`;
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s remaining`;
  };

  useEffect(() => {
    const playedHandler = (payload: { mode: "rss" | "poll" }) => {
      markPlayed(payload.mode);
    };

    eventBus.on("userPlayed", playedHandler);

    return () => {
      eventBus.off("userPlayed", playedHandler);   // ⭐ return void, not EventEmitter
    };
  }, []);

  // Single interval for both modes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      // RSS
      if (rssRef.current.cycleStartTime != null && rssRef.current.cycleEndTime != null) {
        //console.log("⏱ RSS tick → playedThisCycle:", rssRef.current.playedThisCycle);
        const remaining = rssRef.current.cycleEndTime - now;
        const elapsed = now - rssRef.current.cycleStartTime;

        const formatted = computeFormattedTime(
          rssRef.current.cycleStartTime,
          rssRef.current.cycleEndTime,
          remaining
        );

        const nextRemaining = Math.max(0, remaining);
        const crossedZero = rssRef.current.timeRemainingMs > 0 && nextRemaining === 0;

        setRssState(prev => ({
          ...prev,
          timeRemainingMs: nextRemaining,
          elapsedMs: elapsed,
          formattedTime: formatted,
        }));

        if (crossedZero) {
          //console.log("crossedZero:", crossedZero, "remaining:", remaining, "elapsed:", elapsed);
          eventBus.emit("cycleExpired", { mode: "rss" });
        }
      }

      // POLL
      if (pollRef.current.cycleStartTime != null && pollRef.current.cycleEndTime != null) {
        //console.log("⏱ POLL tick → playedThisCycle:", pollRef.current.playedThisCycle);
        const remaining = pollRef.current.cycleEndTime - now;
        const elapsed = now - pollRef.current.cycleStartTime;

        const formatted = computeFormattedTime(
          pollRef.current.cycleStartTime,
          pollRef.current.cycleEndTime,
          remaining
        );

        const nextRemaining = Math.max(0, remaining);
        const crossedZero = pollRef.current.timeRemainingMs > 0 && nextRemaining === 0;

        setPollState((prev) => ({
          ...prev,
          timeRemainingMs: Math.max(0, remaining),
          elapsedMs: elapsed,
          formattedTime: formatted,
        }));

        if (crossedZero) {
          //console.log("Polls crossedZero:", crossedZero, "remaining:", remaining, "elapsed:", elapsed);
          eventBus.emit("cycleExpired", { mode: "poll" });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const expireReset = (payload: { mode: "rss" | "poll" }) => {
      const mode = payload.mode;

      // Delay reset until AFTER navigation has completed
      setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {

            const played =
              mode === "rss"
                ? rssRef.current.playedThisCycle
                : pollRef.current.playedThisCycle;

            // Reset timer state
            if (mode === "rss") {
              setRssState(defaultModeState);
              rssRef.current = defaultModeState;
            } else {
              setPollState(defaultModeState);
              pollRef.current = defaultModeState;
            }

            if (played) {
              if (mode === "rss") {
                setRssFeed(prev =>
                  prev
                    ? {
                        ...prev,
                        cycle: {
                          ...prev.cycle,
                          status: "expired",
                        },
                      }
                    : prev
                );
              } else {
                setPollFeed(prev =>
                  prev
                    ? {
                        ...prev,
                        cycle: {
                          ...prev.cycle,
                          status: "expired",
                        },
                      }
                    : prev
                );
              }
            }
          });
        });
      }, 0);
    };

    eventBus.on("cycleExpired", expireReset);

    return () => {
      eventBus.off("cycleExpired", expireReset);
    };
  }, []);

  useEffect(() => {
    const handler = (payload: { mode: "rss" | "poll" }) => {
      if (!navigationRef.isReady()) return;

      const mode = payload.mode;
      const played =
        mode === "rss"
          ? rssRef.current.playedThisCycle
          : pollRef.current.playedThisCycle;

      const batchId = mode === "rss" ? rssBatchIdRef.current : pollBatchIdRef.current;

      // ⭐ FIRST: navigate
      if (mode === "rss") {
        navigationRef.reset(
          played
            ? {
                index: 1,
                routes: [
                  { name: "CategoryList" },
                  {
                    name: "ChallengeResults",
                    params: {
                      batchId,
                      fromHistory: false,
                    },
                  },
                ],
              }
            : {
                index: 0,
                routes: [{ name: "CategoryList" }],
              }
        );
      }

      if (mode === "poll") {
        navigationRef.reset(
          played
            ? {
                index: 2,
                routes: [
                  { name: "CategoryList" },
                  { name: "PollingList" },
                  {
                    name: "ChallengeResults",
                    params: {
                      batchId,
                      fromHistory: false,
                    },
                  },
                ],
              }
            : {
                index: 1,
                routes: [
                  { name: "CategoryList" },
                  { name: "PollingList" },
                ],
              }
        );
      }
    };
    eventBus.on("cycleExpired", handler);

    return () => {
      eventBus.off("cycleExpired", handler);
    };
  }, []);

  return (
    <CycleTimerContext.Provider
      value={{
        rss: rssState,
        poll: pollState,
        applyCycleFromFeed,
        markPlayed,
        setActiveChallengeId,
      }}
    >
        {children}

        {/* ⬇️ Add your overlay right here */}
        <CountdownOverlay />

    </CycleTimerContext.Provider>
  );
}

export function useCycleTimer() {
  return useContext(CycleTimerContext);
}
