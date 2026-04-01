import React, { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import eventBus from './EventBus';
import type { CycleInfo } from "../navigation/types";

export type CycleTimerContextType = {
  cycleStartTime: number | null;
  cycleEndTime: number | null;
  timeRemainingMs: number;
  elapsedMs: number;
  formattedTime: string | null;
  isExpired: boolean;

  // Screens call this after fetching feed
  applyCycleFromFeed: (cycle: CycleInfo) => void;
};

const CycleTimerContext = createContext<CycleTimerContextType>({
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

export function CycleTimerProvider({ children }: Props) {
  const hasFiredRef = useRef(false);

  const [cycleStartTime, setCycleStartTime] = useState<number | null>(null);
  const [cycleEndTime, setCycleEndTime] = useState<number | null>(null);
  const [timeRemainingMs, setTimeRemainingMs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  //
  // Apply cycle metadata from feed
  //
  const applyCycleFromFeed = useCallback((cycle: CycleInfo) => {
    const rawStart = cycle.startTime;
    const rawEnd = cycle.endTime;

    let start: number | null = null;
    let end: number | null = null;

    if (typeof rawStart === 'number') start = rawStart;
    if (typeof rawEnd === 'number') end = rawEnd;

    if (start && end && start > 0 && end > 0) {
      hasFiredRef.current = false;
      setCycleStartTime(start);
      setCycleEndTime(end);
    }
  }, []);

  //
  // Countdown interval
  //
  useEffect(() => {
    hasFiredRef.current = false;

    const interval = setInterval(() => {
      if (cycleStartTime == null || cycleEndTime == null) return;

      const now = Date.now();
      const remaining = cycleEndTime - now;
      const elapsed = now - cycleStartTime;

      setTimeRemainingMs(Math.max(0, remaining));
      setElapsedMs(elapsed);

      if (remaining <= 0 && !hasFiredRef.current) {
        hasFiredRef.current = true;
        eventBus.emit('cycleExpired');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cycleStartTime, cycleEndTime]);

  //
  // Derived values
  //
  const isExpired = timeRemainingMs <= 0;

  const formattedTime = useMemo(() => {
    if (cycleStartTime == null || cycleEndTime == null) {
      return 'Expired';
    }

    const totalSeconds = Math.max(0, Math.floor(timeRemainingMs / 1000));
    if (isNaN(totalSeconds)) return 'Expired';
    if (totalSeconds === 0) return 'Expired';

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes === 0) {
      return `${seconds}s remaining`;
    }

    return `${minutes}m ${seconds.toString().padStart(2, '0')}s remaining`;
  }, [timeRemainingMs, cycleStartTime, cycleEndTime]);

  return (
    <CycleTimerContext.Provider
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
    </CycleTimerContext.Provider>
  );
}

export function useCycleTimer() {
  return useContext(CycleTimerContext);
}