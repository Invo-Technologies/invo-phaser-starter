import Phaser from "phaser";
import { getInvo } from "@invonetwork/phaser";
import { readBest, recordBest } from "../best.js";
import { PALETTE, VIEW } from "../palette.js";
import { ambient, button, display, enter, eyebrow, go, gradient, label, panel } from "../ui.js";
import type { RoundResult } from "./Game.js";

export class Results extends Phaser.Scene {
  private result: RoundResult = { coins: 0, taps: 0, autoCoins: 0 };

  constructor() {
    super("Results");
  }

  init(data: RoundResult) {
    this.result = data;
  }

  create() {
    enter(this);
    ambient(this);
    const { economy, ui } = getInvo(this);
    const { coins, taps, autoCoins } = this.result;
    const newBest = recordBest(coins);
    const best = readBest();

    const card = panel(this, VIEW.cx, 560, 620, 720, newBest ? PALETTE.gold : null).setAlpha(0);
    card.y += 30;
    this.tweens.add({ targets: card, alpha: 1, y: 560, duration: 420, ease: "Cubic.easeOut" });

    eyebrow(this, VIEW.cx, 270, "Round complete");
    if (newBest && coins > 0) this.ribbon(VIEW.cx, 222);

    const coin = this.add.image(VIEW.cx - 150, 392, "coin").setScale(1.25);
    const total = display(this, VIEW.cx + 30, 392, "+0", 130);
    gradient(total, [PALETTE.css.tealLight, PALETTE.css.teal]);
    label(this, VIEW.cx, 490, "coins earned", 26, PALETTE.css.muted, "600");
    const counter = { value: 0 };
    this.tweens.add({
      targets: counter,
      value: coins,
      duration: Math.min(1400, 400 + coins * 12),
      ease: "Cubic.easeOut",
      onUpdate: () => {
        total.setText(`+${Math.round(counter.value)}`);
        gradient(total, [PALETTE.css.tealLight, PALETTE.css.teal]);
        coin.x = total.x - total.width / 2 - 60;
      },
      onComplete: () => this.tweens.add({ targets: [total, coin], scale: "+=0.08", duration: 120, yoyo: true }),
    });

    const g = this.add.graphics();
    g.lineStyle(2, 0xffffff, 0.08);
    g.lineBetween(VIEW.cx - 250, 556, VIEW.cx + 250, 556);
    this.stat(610, "Taps", String(taps));
    this.stat(672, "From Auto-Tappers", String(autoCoins));
    this.stat(734, "Best round", String(best), newBest ? PALETTE.css.gold : PALETTE.css.text);

    // INVO: guests' coins were not saved; signed-in players' were credited by the server.
    if (economy.signedIn) {
      label(this, VIEW.cx, 840, "✓  Added to your wallet", 26, PALETTE.css.teal, "700");
    } else {
      const ask = label(this, VIEW.cx, 840, "Sign in to keep coins next round  →", 26, PALETTE.css.gold, "700");
      ask.setInteractive({ useHandCursor: true }).on("pointerup", () => ui?.openSignIn());
    }

    button(this, VIEW.cx, 1000, "Play again", () => go(this, "Game"), { variant: "gold", icon: "↻" });
    button(this, VIEW.cx - 105, 1116, "Shop", () => go(this, "Shop"), { width: 190 });
    button(this, VIEW.cx + 105, 1116, "Menu", () => go(this, "MainMenu"), { width: 190 });
  }

  private stat(y: number, name: string, value: string, color: string = PALETTE.css.text) {
    label(this, VIEW.cx - 250, y, name, 26, PALETTE.css.muted, "500").setOrigin(0, 0.5);
    display(this, VIEW.cx + 250, y, value, 34, color).setOrigin(1, 0.5);
  }

  private ribbon(x: number, y: number) {
    const g = this.add.graphics();
    g.fillStyle(PALETTE.gold, 1);
    g.fillRoundedRect(-92, -22, 184, 44, 22);
    const t = label(this, 0, 0, "NEW BEST", 19, PALETTE.css.onGold, "800").setLetterSpacing(4);
    const c = this.add.container(x, y, [g, t]).setScale(0);
    this.tweens.add({ targets: c, scale: 1, delay: 500, duration: 380, ease: "Back.easeOut" });
  }
}
