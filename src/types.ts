export type ArcTier =
  | "probing"
  | "ultra"
  | "high"
  | "medium"
  | "low"

export interface ArcMetrics {
  avgFps: number
  droppedFramePercent: number
  longTasks: number
  hardwareConcurrency: number
  deviceMemory?: number
  webgl: boolean
}

export interface ArcState {
  tier: ArcTier
  metrics: ArcMetrics
  stable: boolean
  overridden: boolean
}