# ARC

### Adaptive Runtime Controller

Performance-aware runtime tier detection for React applications.

ARC is a lightweight runtime engine that measures real-world frontend performance and classifies a device into a performance tier. It enables React applications to adapt heavy UI features (animations, canvas, WebGL, effects) based on actual runtime behavior instead of assumptions.

Maintained by **Build Incredibles**  
https://buildincredibles.com

---

## Installation

```bash
npm install @buildincredibles/arc
```

Peer dependency:

```bash
react >= 18
```

---

## Core Concept

ARC measures how the browser actually performs during a short probing window (default: 2000ms). It collects:

- Frame timing via `requestAnimationFrame`
- Long tasks via `PerformanceObserver`
- Hardware information
- WebGL support

After probing completes, ARC computes a performance tier and exposes the result through a React context.

ARC does not automatically change anything in your UI. It only exposes state. You decide how to adapt.

---

## What ARC Measures

### 1. Frame Times

Each animation frame duration is recorded using `requestAnimationFrame`.

If frames consistently exceed ~16ms (ideal 60fps frame time), performance is constrained.

Frame times are used to compute:

- Average FPS
- Dropped frame percentage

---

### 2. Average FPS (`avgFps`)

Calculated as:

```
1000 / averageFrameTime
```

Higher FPS indicates smoother rendering.

Typical ranges:

- 55–60 FPS → Excellent
- 45–55 FPS → Good
- 30–45 FPS → Moderate
- <30 FPS → Constrained

---

### 3. Dropped Frame Percentage (`droppedFramePercent`)

Defined as:

```
percentage of frames exceeding 20ms
```

This indicates how often the browser fails to maintain smooth rendering.

Lower is better.

---

### 4. Long Tasks (`longTasks`)

Tracked using `PerformanceObserver` with `entryTypes: ["longtask"]`.

A long task is a task blocking the main thread for >50ms.

Higher counts indicate:

- Heavy JavaScript execution
- Blocking layout work
- Expensive synchronous operations

---

### 5. Hardware Concurrency (`hardwareConcurrency`)

From:

```
navigator.hardwareConcurrency
```

Represents logical CPU cores available.

---

### 6. Device Memory (`deviceMemory`)

From:

```
navigator.deviceMemory
```

Approximate RAM in GB (if supported).

Optional and browser-dependent.

---

### 7. WebGL Support (`webgl`)

Checks for WebGL2 context availability.

Indicates whether GPU-accelerated rendering is supported.

---

## Performance Tiers

After probing, ARC assigns one of the following tiers:

| Tier    | Condition                                |
| ------- | ---------------------------------------- |
| probing | Initial measurement phase                |
| ultra   | avgFps > 55 AND droppedFramePercent < 10 |
| high    | avgFps > 45                              |
| medium  | avgFps > 30                              |
| low     | Otherwise                                |

Tier selection is based only on measured metrics unless overridden manually.

---

## State Model

ARC exposes the following state:

```ts
interface ArcState {
  tier: ArcTier
  metrics: ArcMetrics
  stable: boolean
  overridden: boolean
}
```

---

### `tier`

Current performance classification.

Possible values:

```ts
"type ArcTier = 'probing' | 'ultra' | 'high' | 'medium' | 'low'"
```

---

### `metrics`

```ts
interface ArcMetrics {
  avgFps: number
  droppedFramePercent: number
  longTasks: number
  hardwareConcurrency: number
  deviceMemory?: number
  webgl: boolean
}
```

Contains all measured runtime data.

---

### `stable`

Boolean indicating whether the probing phase has completed.

- `false` → Still measuring performance
- `true` → Tier is finalized

ARC becomes stable after `probeDuration` (default 2000ms).

You can use this to avoid rendering tier-dependent UI prematurely.

Example:

```tsx
const { stable } = useArc()

if (!stable) return null
```

---

### `overridden`

Indicates whether the current tier is manually forced.

- `true` → Tier was set using override
- `false` → Tier determined automatically

---

## React Usage

### 1. Wrap Application

```tsx
import { ArcProvider } from '@buildincredibles/arc'

function App() {
  return (
    <ArcProvider>
      <Root />
    </ArcProvider>
  )
}
```

---

### 2. Consume State

```tsx
import { useArc } from '@buildincredibles/arc'

const Component = () => {
  const { tier, stable, metrics } = useArc()

  if (!stable) return null

  if (tier === 'low') {
    return <LightVersion />
  }

  return <FullVersion />
}
```

---

## Manual Override

ARC supports forcing a tier.

Useful for:

- Testing
- QA
- Performance debugging
- Demo modes

### Force Tier

```ts
import { arc } from '@buildincredibles/arc'

arc.overrideTier('low')
```

This immediately recalculates state with the forced tier.

---

### Reset Override

```ts
arc.resetOverride()
```

Returns control to automatic tier calculation.

---

## Custom Engine (Optional)

You may create your own engine instance:

```ts
import { ArcEngine } from '@buildincredibles/arc'

const engine = new ArcEngine(3000) // 3-second probe
```

Default probe duration: `2000ms`.

---

## SSR Behavior

ARC checks for `window` before starting.

Probing only runs in the browser.
Safe for SSR environments.

---

## Design Guarantees

ARC:

- Does not modify animations
- Does not patch browser APIs
- Does not force downgrades
- Does not interfere with components

If a component does not consume `useArc()`, ARC has zero effect on it.

---

## Bundle Size

- ~3 KB (ESM build)
- No runtime dependencies
- React as peer dependency only

---

## Intended Use Cases

- Conditional animation complexity
- Adaptive particle systems
- Selective WebGL rendering
- Dynamic blur/shadow intensity
- Performance-aware feature toggling

---

## Contributing

Contributions are welcome.

If you would like to improve ARC:

1. Fork the repository
2. Create a new branch
3. Make your changes with clear commit messages
4. Ensure TypeScript types remain strict and consistent
5. Open a pull request with a clear explanation of the improvement

When contributing:

- Keep the engine lightweight
- Avoid adding runtime dependencies
- Maintain strong type safety
- Preserve SSR safety
- Do not introduce automatic UI side-effects

Bug reports and feature suggestions can be opened as issues.

---

## Roadmap

Potential future improvements:

- Configurable tier thresholds
- Optional continuous monitoring mode
- Devtools integration
- Visual performance dashboard
- Non-React adapter layer

ARC is intentionally minimal. Any addition must justify its impact on size and complexity.

---

## Versioning

ARC follows semantic versioning:

- **MAJOR** — Breaking API changes
- **MINOR** — New features (non-breaking)
- **PATCH** — Fixes and internal improvements

---

## Support

If you are using ARC in production and need guidance, integration help, or custom performance architecture consulting, you may contact:

Build Incredibles  
https://buildincredibles.com

---

## Repository

GitHub Organization:  
https://github.com/buildincredibles

ARC Repository:  
https://github.com/buildincredibles/arc

Issues and feature requests should be opened in the repository.

---

## License

MIT

---

## Maintained By

Build Incredibles  
https://buildincredibles.com  
https://github.com/buildincredibles
