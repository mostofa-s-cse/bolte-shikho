const WINDOW_MS = 60_000
const MAX_REQUESTS = 20
const hits = new Map<string, number[]>()

// Best-effort, per-server-instance only (an in-memory Map isn't shared
// across serverless instances) — enough to blunt casual abuse on this app's
// scale. A multi-instance deployment would need a shared store instead.
export function isRateLimited(key: string): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(key, recent)
  return recent.length > MAX_REQUESTS
}

// Exposed only so tests can start each case from a clean slate — the
// in-memory Map otherwise persists across test cases in the same file.
export function resetRateLimit() {
  hits.clear()
}
