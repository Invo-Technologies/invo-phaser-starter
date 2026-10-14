import { describe, expect, it } from "vitest";
import { MAX_AUTO_TAPPERS, Round, wordWatcher } from "../src/logic.js";
import { economy, ITEMS } from "../shared/economy.js";

describe("Round", () => {
  it("counts taps until time runs out", () => {
    const round = new Round(1000);
    expect(round.tap()).toBe(1);
    expect(round.tap()).toBe(1);
    round.tick(1000, 0);
    expect(round.over).toBe(true);
    expect(round.tap()).toBe(0);
    expect(round.coins).toBe(2);
  });

  it("pays Auto-Tappers once a second each, across uneven frames", () => {
    const round = new Round(10_000);
    let auto = 0;
    for (let i = 0; i < 119; i++) auto += round.tick(16.6667, 3); // 1.983 s of frames
    expect(auto).toBe(5); // 3/s for 1.983 s = 5.95: whole coins only, the rest carries over
    auto += round.tick(20, 3);
    expect(auto).toBe(6);
    expect(round.autoCoins).toBe(6);
  });

  it("caps Auto-Tappers at the shop limit and stops at the end of the round", () => {
    const round = new Round(2000);
    expect(round.tick(5000, 99)).toBe(2 * MAX_AUTO_TAPPERS);
    expect(round.tick(1000, 5)).toBe(0);
    expect(round.secondsLeft).toBe(0);
  });
});

describe("economy config", () => {
  it("defines the items the game code uses, with the cosmetic in Gems and the upgrade in Coins", () => {
    const golden = economy.items.find((i) => i.id === ITEMS.goldenOrb);
    const tapper = economy.items.find((i) => i.id === ITEMS.autoTapper);
    expect(golden?.currency).toBe("premium");
    expect(tapper?.currency).toBe("soft");
    expect(tapper?.maxOwned).toBe(MAX_AUTO_TAPPERS);
  });
});

describe("wordWatcher", () => {
  it("fires on the key that completes the word, ignoring case and earlier keys", () => {
    const typed = wordWatcher("invo");
    expect([..."xxINV"].map(typed)).toEqual([false, false, false, false, false]);
    expect(typed("O")).toBe(true);
    expect(typed("i")).toBe(false);
  });
});
