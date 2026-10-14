/**
 * INVO: your game's economy, in one place. The server enforces it (prices, limits, who owns
 * what) and the browser shows it, so edit it here and both sides agree.
 *
 * - PREMIUM currency ("Gems") is your game's INVO currency. Players buy it with real money
 *   through INVO's hosted checkout; INVO holds it. Its name should match the currency you
 *   created in the INVO console.
 * - SOFT currency ("Coins") is earned by playing and kept in your server's own ledger.
 * - Items cost one or the other. When a player spends Gems, INVO splits the sale 90% to
 *   you and 10% to INVO automatically; nothing here needs to do that maths.
 */
import type { GameEconomyConfig } from "@invonetwork/web-sdk/game";

/** Item ids the game code checks. Keep them in sync with `items` below. */
export const ITEMS = {
  /** Premium cosmetic: turns the orb gold. */
  goldenOrb: "golden_orb",
  /** Soft upgrade: taps once a second for you, stacks up to 5. */
  autoTapper: "auto_tapper",
} as const;

export const economy: GameEconomyConfig = {
  premium: {
    name: "Gems",
    packs: [
      { id: "gems_small", name: "Handful of Gems", usdAmount: "0.99", amount: 100 },
      { id: "gems_large", name: "Chest of Gems", usdAmount: "4.99", amount: 550, badge: "Best value" },
    ],
  },
  soft: {
    name: "Coins",
    startingBalance: 25,
  },
  items: [
    {
      id: ITEMS.goldenOrb,
      name: "Golden Orb",
      description: "A gilded orb with a warm glow. Purely cosmetic.",
      category: "cosmetic",
      currency: "premium",
      price: 50,
      color: "#F4C04A",
      icon: "◉",
    },
    {
      id: ITEMS.autoTapper,
      name: "Auto-Tapper",
      description: "Taps once a second for you. Stacks up to 5.",
      category: "upgrade",
      currency: "soft",
      price: 30,
      maxOwned: 5,
      color: "#3FD0C9",
      icon: "⟳",
    },
  ],
};
