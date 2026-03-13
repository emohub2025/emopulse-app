import { apiGet } from './engineClient';

export interface CycleInfo {
  batchId: string | null;
  startTime: number | null;
  durationMs: number | null;
  endTime: number | null;
  timeRemainingMs: number | null;
}

export interface CategoryInfo {
  id: string;
  name: string;
  challengeCount: number;
}

export interface CycleStatusResponse {
  ok: boolean;
  cycle: CycleInfo;
  categories: CategoryInfo[];
}

export function getCycleStatus(): Promise<CycleStatusResponse> {
  return apiGet<CycleStatusResponse>('/mobile/cycle-status');
}