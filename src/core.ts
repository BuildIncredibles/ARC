import { ArcState, ArcTier, ArcMetrics } from "./types"

type Listener = (state: ArcState) => void

export class ArcEngine {
  private state: ArcState
  private listeners: Listener[] = []
  private frameTimes: number[] = []
  private longTasks = 0
  private override: ArcTier | null = null

  constructor(private probeDuration = 2000) {
    this.state = {
      tier: "probing",
      stable: false,
      overridden: false,
      metrics: {
        avgFps: 0,
        droppedFramePercent: 0,
        longTasks: 0,
        hardwareConcurrency: navigator.hardwareConcurrency || 2,
        deviceMemory: (navigator as any).deviceMemory,
        webgl: this.checkWebGL()
      }
    }

    this.start()
  }

  private checkWebGL(): boolean {
    try {
      const canvas = document.createElement("canvas")
      return !!canvas.getContext("webgl2")
    } catch {
      return false
    }
  }

  private start() {
    if (typeof window === "undefined") return

    const observer = new PerformanceObserver((list) => {
      this.longTasks += list.getEntries().length
    })

    try {
      observer.observe({ entryTypes: ["longtask"] })
    } catch {}

    let last = performance.now()

    const loop = (now: number) => {
      const delta = now - last
      last = now
      this.frameTimes.push(delta)
      requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)

    setTimeout(() => {
      this.analyze()
    }, this.probeDuration)
  }

  private analyze() {
    const avgFrame =
      this.frameTimes.reduce((a, b) => a + b, 0) /
      this.frameTimes.length

    const avgFps = 1000 / avgFrame

    const dropped =
      this.frameTimes.filter((t) => t > 20).length /
      this.frameTimes.length

    const metrics: ArcMetrics = {
      ...this.state.metrics,
      avgFps,
      droppedFramePercent: dropped * 100,
      longTasks: this.longTasks
    }

    const tier = this.override ?? this.calculateTier(metrics)

    this.state = {
      tier,
      metrics,
      stable: true,
      overridden: !!this.override
    }

    this.emit()
  }

  private calculateTier(m: ArcMetrics): ArcTier {
    if (m.avgFps > 55 && m.droppedFramePercent < 10) return "ultra"
    if (m.avgFps > 45) return "high"
    if (m.avgFps > 30) return "medium"
    return "low"
  }

  private emit() {
    this.listeners.forEach((l) => l(this.state))
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  getState() {
    return this.state
  }

  overrideTier(tier: ArcTier) {
    this.override = tier
    this.analyze()
  }

  resetOverride() {
    this.override = null
    this.analyze()
  }
}