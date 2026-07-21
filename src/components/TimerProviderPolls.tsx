import React, { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import eventBus from './EventBus';
import type { CycleInfo } from "../navigation/types";

export type PollTimerContextType = {
  cycleStartTime: number | null;
  cycleEndTime: number | null;
  timeRemainingMs: number;
  elapsedMs: number;
  formattedTime: string | null;
  isExpired: boolean;
  applyCycleFromFeed: (cycle: CycleInfo) => void;
};

const PollTimerContext = createContext<PollTimerContextType>({
  cycleStartTime: null,
  cycleEndTime: null,
  timeRemainingMs: 0,
  elapsedMs: 0,
  formattedTime: null,
  isExpired: false,
  applyCycleFromFeed: () => {}
});

interface Props {
  children: React.ReactNode;
}

export function PollTimerProvider({ children }: Props) {
  const hasFiredRef = useRef(false);
  const wasActiveRef = useRef(false);

  const [cycleStartTime, setCycleStartTime] = useState<number | null>(null);
  const [cycleEndTime, setCycleEndTime] = useState<number | null>(null);
  const [timeRemainingMs, setTimeRemainingMs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const applyCycleFromFeed = useCallback((cycle: CycleInfo) => {
    //console.log("🔥 PollTimer: applyCycleFromFeed received:", cycle);

    const start = cycle.startTime ? Number(cycle.startTime) : null;
    const end = cycle.endTime ? Number(cycle.endTime) : null;

    //console.log("🔥 parsed start =", start, "parsed end =", end);

    if (start && end && start > 0 && end > 0) {
      hasFiredRef.current = false;
      wasActiveRef.current = false;
      setCycleStartTime(start);
      setCycleEndTime(end);
    } else {
      //console.log("❌ PollTimer: INVALID cycle, timer will show expired");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (cycleStartTime == null || cycleEndTime == null) return;

      const now = Date.now();
      const remaining = cycleEndTime - now;
      const elapsed = now - cycleStartTime;

      //console.log(elapsed);

      setTimeRemainingMs(Math.max(0, remaining));
      setElapsedMs(elapsed);

      if (remaining > 0) {
        wasActiveRef.current = true;
        return;
      }

      if (remaining <= 0 && wasActiveRef.current && !hasFiredRef.current) {
        console.log("🔥 [POLL] Emitting cycleExpired");
        hasFiredRef.current = true;
        wasActiveRef.current = false;
        eventBus.emit("pollCycleExpired", { type: "poll" });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cycleStartTime, cycleEndTime]);

  const isExpired = timeRemainingMs <= 0;

  const formattedTime = useMemo(() => {
    if (cycleStartTime == null || cycleEndTime == null) {
      return '';
    }

    const totalSeconds = Math.max(0, Math.floor(timeRemainingMs / 1000));
    if (isNaN(totalSeconds)) return '';
    if (totalSeconds === 0) return '';

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes === 0) {
      return `${seconds}s remaining`;
    }

    return `${minutes}m ${seconds.toString().padStart(2, '0')}s remaining`;
  }, [timeRemainingMs, cycleStartTime, cycleEndTime]);

  return (
    <PollTimerContext.Provider
      value={{
        cycleStartTime,
        cycleEndTime,
        timeRemainingMs,
        elapsedMs,
        formattedTime,
        isExpired,
        applyCycleFromFeed
      }}
    >
      {children}
    </PollTimerContext.Provider>
  );
}

export function usePollTimer() {
  return useContext(PollTimerContext);
}
