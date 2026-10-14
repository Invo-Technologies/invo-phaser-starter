/** The player's best round on this device. */
const KEY = "orbrush.best";

export function readBest(): number {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

/** Saves `coins` if it beats the record. Returns true for a new best. */
export function recordBest(coins: number): boolean {
  if (coins <= readBest()) return false;
  try {
    localStorage.setItem(KEY, String(coins));
  } catch {
    /* private mode */
  }
  return true;
}
