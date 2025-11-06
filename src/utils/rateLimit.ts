export function allowAction(key: string, intervalMs: number): { allowed: boolean; waitMs: number } {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(`rl:${key}`);
    const last = raw ? parseInt(raw, 10) : 0;
    const waitMs = Math.max(0, last + intervalMs - now);
    if (waitMs > 0) return { allowed: false, waitMs };
    localStorage.setItem(`rl:${key}`, String(now));
    return { allowed: true, waitMs: 0 };
  } catch {
    // If storage fails, allow action (do not block)
    return { allowed: true, waitMs: 0 };
  }
}
