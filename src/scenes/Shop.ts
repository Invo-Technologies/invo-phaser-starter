import Phaser from "phaser";
import { getInvo, InvoEvents } from "@invonetwork/phaser";
import type { GameCatalogItem } from "@invonetwork/phaser";
import { ITEMS } from "../../shared/economy.js";
import { OrbView } from "../orb.js";
import { PALETTE, VIEW } from "../palette.js";
import { ambient, button, display, enter, eyebrow, go, label, onInvo, ownsGolden, panel } from "../ui.js";

/**
 * The loadout: a preview of the orb as the player owns it, plus a card per item. Buying
 * happens in INVO's shop (prices, sign-in and checkout are handled there and confirmed by
 * the server); this scene redraws itself whenever the wallet changes.
 */
export class Shop extends Phaser.Scene {
  private cards: Phaser.GameObjects.Container[] = [];

  constructor() {
    super("Shop");
  }

  create() {
    enter(this);
    ambient(this);
    const invo = getInvo(this);
    this.cards = [];

    eyebrow(this, VIEW.cx, 196, "Loadout");
    display(this, VIEW.cx, 262, "Your orb", 76);

    const orb = new OrbView(this, VIEW.cx, 530);
    orb.setScale(0.72);

    button(this, VIEW.cx, 1060, "Open shop", () => invo.ui?.openShop(), { variant: "gold" });
    // Arriving here opens INVO's shop straight away; closing it leaves this loadout behind it.
    this.time.delayedCall(320, () => {
      if (this.scene.isActive()) invo.ui?.openShop();
    });
    button(this, VIEW.cx - 105, 1176, "Get Gems", () => invo.ui?.openBuyCurrency(), { width: 190 });
    button(this, VIEW.cx + 105, 1176, "Back", () => go(this, "MainMenu"), { width: 190 });

    const refresh = () => {
      orb.setSkin(ownsGolden(this)).setSatellites(invo.economy.quantity(ITEMS.autoTapper));
      this.cards.forEach((c) => c.destroy());
      const items = invo.economy.catalog?.items ?? [];
      this.cards = items.slice(0, 2).map((item, i) => this.card(item, VIEW.cx + (i === 0 ? -158 : 158), 860));
    };
    refresh();
    onInvo(this, InvoEvents.WALLET, refresh);
    onInvo(this, InvoEvents.SESSION, refresh);
    this.events.on(Phaser.Scenes.Events.WAKE, refresh);
  }

  /** A card for one item: what it is, what it costs and whether it is owned. Tap to shop. */
  private card(item: GameCatalogItem, x: number, y: number) {
    const { economy, ui } = getInvo(this);
    const owned = economy.quantity(item.id);
    const max = item.maxOwned ?? 1;
    const color = item.currency === "premium" ? PALETTE.gold : PALETTE.teal;
    const parts: Phaser.GameObjects.GameObject[] = [panel(this, 0, 0, 300, 250, owned > 0 ? color : null)];

    parts.push(label(this, -122, -84, item.category.toUpperCase(), 17, PALETTE.css.muted, "700").setOrigin(0, 0.5).setLetterSpacing(3));
    if (owned > 0) {
      const tag = owned >= max ? (max === 1 ? "OWNED" : "MAXED") : `${owned}/${max}`;
      const g = this.add.graphics();
      g.fillStyle(PALETTE.teal, 1);
      g.fillRoundedRect(122 - 96, -102, 96, 36, 18);
      parts.push(g, label(this, 122 - 48, -84, tag, 17, "#04201E", "800").setLetterSpacing(2));
    }
    parts.push(display(this, -122, -32, item.name, 32).setOrigin(0, 0.5));

    if (max > 1) {
      const pips = this.add.graphics();
      const w = (244 - (max - 1) * 8) / max;
      for (let i = 0; i < max; i++) {
        pips.fillStyle(i < owned ? PALETTE.teal : 0xffffff, i < owned ? 1 : 0.1);
        pips.fillRoundedRect(-122 + i * (w + 8), 14, w, 8, 4);
      }
      parts.push(pips);
    } else {
      parts.push(label(this, -122, 18, owned ? "Equipped" : "Not owned yet", 22, owned ? PALETTE.css.teal : PALETTE.css.faint, "600").setOrigin(0, 0.5));
    }

    parts.push(this.add.image(-108, 76, item.currency === "premium" ? "gem" : "coin").setScale(0.5));
    parts.push(display(this, -84, 76, item.price.toLocaleString(), 34, item.currency === "premium" ? PALETTE.css.gold : PALETTE.css.teal).setOrigin(0, 0.5));
    parts.push(label(this, 122, 76, owned >= max ? "" : "View  →", 22, PALETTE.css.muted, "600").setOrigin(1, 0.5));

    const hit = this.add.rectangle(0, 0, 300, 250, 0, 0).setInteractive({ useHandCursor: true });
    parts.push(hit);
    const c = this.add.container(x, y, parts).setAlpha(0);
    c.y += 20;
    this.tweens.add({ targets: c, alpha: 1, y, duration: 380, delay: x < VIEW.cx ? 60 : 120, ease: "Cubic.easeOut" });
    hit.on("pointerover", () => this.tweens.add({ targets: c, scale: 1.03, duration: 150 }));
    hit.on("pointerout", () => this.tweens.add({ targets: c, scale: 1, duration: 150 }));
    hit.on("pointerup", () => ui?.openShop(item.category));
    return c;
  }
}
