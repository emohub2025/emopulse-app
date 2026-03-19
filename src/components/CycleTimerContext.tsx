import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { getCycleStatus } from '../api/cycleStatus';
import eventBus from './EventBus';

export type CycleTimerContextType = {
  cycleStartTime: number | null;
  cycleEndTime: number | null;
  timeRemainingMs: number;
  elapsedMs: number;
  formattedTime: string | null;
  isExpired: boolean;
  refreshCycle: () => Promise<void>;   // ⭐ NEW
};

const CycleTimerContext = createContext<CycleTimerContextType>({
  cycleStartTime: null,
  cycleEndTime: null,
  timeRemainingMs: 0,
  elapsedMs: 0,
  formattedTime: null,
  isExpired: false,
  refreshCycle: async () => {},        // default no-op
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
  // ⭐ Unified function to load cycle times
  //
  const refreshCycle = useCallback(async () => {
    const result = await getCycleStatus();

    const rawStart = result.cycle.startTime;
    const rawEnd = result.cycle.endTime;

    let start: number | null = null;
    let end: number | null = null;

    if (typeof rawStart === 'number') {
      start = rawStart;
    } else if (typeof rawStart === 'string') {
      const parsed = new Date(rawStart).getTime();
      if (!isNaN(parsed)) start = parsed;
    }

    if (typeof rawEnd === 'number') {
      end = rawEnd;
    } else if (typeof rawEnd === 'string') {
      const parsed = new Date(rawEnd).getTime();
      if (!isNaN(parsed)) end = parsed;
    }

    if (start && end && start > 0 && end > 0) {
      hasFiredRef.current = false; // reset expiration flag
      setCycleStartTime(start);
      setCycleEndTime(end);
    } 
  }, []);

  //
  // ⭐ Initial load
  //
  useEffect(() => {
    refreshCycle();
  }, [refreshCycle]);

  //
  // ⭐ Countdown interval (unchanged)
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
        refreshCycle,   // ⭐ exposed
      }}
    >
      {children}
    </CycleTimerContext.Provider>
  );
}

export function useCycleTimer() {
  return useContext(CycleTimerContext);
}