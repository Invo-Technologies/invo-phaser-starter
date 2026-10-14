import Phaser from "phaser";
import { getInvo, InvoEvents } from "@invonetwork/phaser";
import { ITEMS } from "../../shared/economy.js";
import { readBest } from "../best.js";
import { wordWatcher } from "../logic.js";
import { OrbView } from "../orb.js";
import { PALETTE, VIEW } from "../palette.js";
import { ambient, button, chip, display, enter, eyebrow, go, gradient, label, onInvo, ownsGolden } from "../ui.js";

export class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    enter(this);
    ambient(this);
    const invo = getInvo(this);

    eyebrow(this, VIEW.cx, 196, "An INVO starter");
    const wordmark = display(this, VIEW.cx, 290, "ORB RUSH", 116);
    gradient(wordmark, [PALETTE.css.goldLight, PALETTE.css.gold, PALETTE.css.goldDeep]);
    wordmark.setShadow(0, 10, "rgba(244,192,74,0.35)", 34, false, true);
    label(this, VIEW.cx, 382, "Tap the orb. Earn coins. Upgrade.", 30);

    const orb = new OrbView(this, VIEW.cx, 680);

    button(this, VIEW.cx, 1000, "Play", () => go(this, "Game"), { variant: "gold", icon: "▶" });
    button(this, VIEW.cx, 1116, "Shop", () => go(this, "Shop"));

    let status: ReturnType<typeof chip> | null = null;
    const refresh = () => {
      orb.setSkin(ownsGolden(this)).setSatellites(invo.economy.quantity(ITEMS.autoTapper));
      status?.container.destroy();
      const best = readBest();
      if (invo.economy.player) {
        const text = best ? `${invo.economy.player.name} · best round ${best}` : `Signed in as ${invo.economy.player.name}`;
        status = chip(this, VIEW.cx, 1222, text, PALETTE.css.text, PALETTE.teal);
      } else {
        status = chip(this, VIEW.cx, 1222, "Sign in to keep your coins", PALETTE.css.gold, PALETTE.gold);
        status.container.setInteractive({ useHandCursor: true }).on("pointerup", () => invo.ui?.openSignIn());
      }
    };
    refresh();
    onInvo(this, InvoEvents.WALLET, refresh);
    onInvo(this, InvoEvents.SESSION, refresh);

    const typed = wordWatcher("invo");
    this.input.keyboard?.on("keydown", (e: KeyboardEvent) => {
      if (typed(e.key)) this.signature(orb);
    });
  }

  /** Type the word on this screen. */
  private signature(orb: OrbView) {
    orb.celebrate(60);
    const note = label(this, VIEW.cx, 470, "made with care · INVO", 22, PALETTE.css.muted, "600").setLetterSpacing(3).setAlpha(0);
    this.tweens.add({ targets: note, alpha: 0.8, duration: 600, yoyo: true, hold: 2200, onComplete: () => note.destroy() });
  }
}
