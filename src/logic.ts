/**
 * The game's rules, kept free of Phaser so they are easy to test and change. A round lasts
 * ROUND_SECONDS; each tap is worth one coin and each Auto-Tapper taps once a second.
 */
export const ROUND_SECONDS = 30;
export const MAX_AUTO_TAPPERS = 5;

export class Round {
  taps = 0;
  autoCoins = 0;
  private elapsedMs = 0;
  private autoCarry = 0;

  constructor(readonly lengthMs = ROUND_SECONDS * 1000) {}

  get over(): boolean {
    return this.elapsedMs >= this.lengthMs;
  }

  get secondsLeft(): number {
    return Math.max(0, Math.ceil((this.lengthMs - this.elapsedMs) / 1000));
  }

  /** Time left with fractions, for smooth timers. */
  get secondsLeftExact(): number {
    return Math.max(0, (this.lengthMs - this.elapsedMs) / 1000);
  }

  get coins(): number {
    return this.taps + this.autoCoins;
  }

  /** A player tap. Returns the coins it earned (0 once the round is over). */
  tap(): number {
    if (this.over) return 0;
    this.taps += 1;
    return 1;
  }

  /** Advance time. Returns the coins the Auto-Tappers earned in this step. */
  tick(deltaMs: number, autoTappers: number): number {
    if (this.over || deltaMs <= 0) return 0;
    const step = Math.min(deltaMs, this.lengthMs - this.elapsedMs);
    this.elapsedMs += step;
    const perSecond = Math.max(0, Math.min(MAX_AUTO_TAPPERS, Math.floor(autoTappers)));
    this.autoCarry += (perSecond * step) / 1000;
    const earned = Math.floor(this.autoCarry);
    this.autoCarry -= earned;
    this.autoCoins += earned;
    return earned;
  }
}

/** Watches typed keys for a word (case-insensitive). Returns true on the key that completes it. */
export function wordWatcher(word: string): (key: string) => boolean {
  const target = word.toLowerCase();
  let typed = "";
  return (key) => {
    typed = (typed + key.toLowerCase()).slice(-target.length);
    return typed === target;
  };
}
