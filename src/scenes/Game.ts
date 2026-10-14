import Phaser from "phaser";
import { getInvo, InvoEvents } from "@invonetwork/phaser";
import { ITEMS } from "../../shared/economy.js";
import { Round } from "../logic.js";
import { OrbView } from "../orb.js";
import { PALETTE, VIEW } from "../palette.js";
import { ambient, chip, display, enter, eyebrow, go, gradient, label, onInvo, ownsGolden } from "../ui.js";

export interface RoundResult {
  coins: number;
  taps: number;
  autoCoins: number;
}

const RING_RADIUS = 186;

/** The core loop: tap the orb before the ring runs out. Auto-Tappers (a shop upgrade) tap for you. */
export class Game extends Phaser.Scene {
  private round!: Round;
  private orb!: OrbView;
  private ring!: Phaser.GameObjects.Graphics;
  private score!: Phaser.GameObjects.Text;
  private clock!: Phaser.GameObjects.Text;
  private playing = false;

  constructor() {
    super("Game");
  }

  create() {
    enter(this);
    ambient(this);
    const { economy, ui } = getInvo(this);
    this.round = new Round();
    this.playing = false;

    eyebrow(this, VIEW.cx, 196, "Coins this round", PALETTE.css.muted);
    this.score = display(this, VIEW.cx, 278, "0", 112);
    gradient(this.score, [PALETTE.css.tealLight, PALETTE.css.teal]);

    this.ring = this.add.graphics();
    this.orb = new OrbView(this, VIEW.cx, 690);
    this.orb.setDepth(1);
    this.clock = display(this, VIEW.cx, 980, "30", 44, PALETTE.css.text);
    label(this, VIEW.cx, 1022, "seconds", 20, PALETTE.css.faint, "600").setLetterSpacing(3);

    if (!economy.signedIn) {
      const guest = chip(this, VIEW.cx, 1200, "Guest round · sign in to keep coins", PALETTE.css.gold, PALETTE.gold);
      guest.container.setInteractive({ useHandCursor: true }).on("pointerup", () => ui?.openSignIn());
    }

    // The tap target is the orb's sphere.
    this.orb.core.setInteractive(new Phaser.Geom.Circle(150, 150, 118), Phaser.Geom.Circle.Contains);
    this.orb.core.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (!this.playing) return;
      const coins = this.round.tap();
      if (!coins) return;
      // INVO: earnings are batched and sent to the server, which credits the player's
      // Coins in its ledger (and rate-limits them). Nothing happens for guests.
      economy.earn(coins, "orb tapped");
      this.orb.tap(p.worldX, p.worldY);
      this.floatText(p.worldX, p.worldY, `+${coins}`, PALETTE.css.goldLight);
      this.bumpScore();
    });

    this.applyUpgrades();
    onInvo(this, InvoEvents.WALLET, () => this.applyUpgrades());
    this.countIn();
  }

  /** INVO: what the player owns changes the game: the orb's skin and the Auto-Tappers. */
  private applyUpgrades() {
    this.orb.setSkin(ownsGolden(this)).setSatellites(getInvo(this).economy.quantity(ITEMS.autoTapper));
  }

  private countIn() {
    const words = ["3", "2", "1", "Go!"];
    words.forEach((word, i) => {
      this.time.delayedCall(i * 420, () => {
        const t = display(this, VIEW.cx, 690, word, word === "Go!" ? 110 : 150, word === "Go!" ? PALETTE.css.gold : PALETTE.css.text).setDepth(10).setScale(1.4).setAlpha(0);
        this.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 180, ease: "Back.easeOut" });
        this.tweens.add({ targets: t, alpha: 0, scale: 0.85, delay: 260, duration: 160, onComplete: () => t.destroy() });
        if (word === "Go!") {
          this.playing = true;
          this.orb.ripple(PALETTE.gold, 1, 2.4);
        }
      });
    });
  }

  override update(_time: number, delta: number) {
    const invo = getInvo(this);
    this.drawRing();
    if (!this.playing || invo.modalOpen || this.round.over) return; // the clock stops while a dialog is open

    const auto = this.round.tick(delta, invo.economy.quantity(ITEMS.autoTapper));
    if (auto > 0) {
      invo.economy.earn(auto, "auto-tapper");
      this.orb.pulseSatellites();
      this.floatText(this.orb.x + 150, this.orb.y - 150, `+${auto}`, PALETTE.css.tealLight);
      this.bumpScore();
    }
    const left = this.round.secondsLeft;
    if (this.clock.text !== String(left)) {
      this.clock.setText(String(left));
      if (left <= 5 && left > 0) {
        this.clock.setColor(PALETTE.css.gold);
        this.tweens.add({ targets: this.clock, scale: 1.25, duration: 120, yoyo: true });
      }
    }
    if (this.round.over) this.finish();
  }

  /** The timer: a ring around the orb that drains clockwise and turns gold at the end. */
  private drawRing() {
    const progress = 1 - this.round.secondsLeftExact / (this.round.lengthMs / 1000);
    const late = this.round.secondsLeftExact <= 5;
    const g = this.ring;
    const { x, y } = this.orb;
    g.clear();
    g.lineStyle(10, 0xffffff, 0.06);
    g.strokeCircle(x, y, RING_RADIUS);
    if (progress < 1) {
      const start = -Math.PI / 2 + progress * Math.PI * 2;
      g.lineStyle(10, late ? PALETTE.gold : PALETTE.teal, 0.95);
      g.beginPath();
      g.arc(x, y, RING_RADIUS, start, Math.PI * 1.5, false);
      g.strokePath();
      // A bright head on the draining edge.
      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(x + Math.cos(start) * RING_RADIUS, y + Math.sin(start) * RING_RADIUS, 7);
    }
  }

  private bumpScore() {
    this.score.setText(String(this.round.coins));
    gradient(this.score, [PALETTE.css.tealLight, PALETTE.css.teal]);
    this.tweens.killTweensOf(this.score);
    this.score.setScale(1.08);
    this.tweens.add({ targets: this.score, scale: 1, duration: 160, ease: "Quad.easeOut" });
  }

  private floatText(x: number, y: number, value: string, color: string) {
    const t = display(this, x + Phaser.Math.Between(-18, 18), y - 30, value, 46, color).setDepth(6);
    this.tweens.add({ targets: t, y: t.y - 110, alpha: 0, scale: 1.15, duration: 720, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
  }

  private finish() {
    this.playing = false;
    const { economy } = getInvo(this);
    void economy.flushEarnings();
    // INVO: a loyalty event. Set up a loyalty program with this milestone key in the INVO
    // console to reward it. A failure here never interrupts the game.
    void economy.reportEvent("game.milestone.reached", { milestone_key: "round_complete" }).catch(() => undefined);

    const done = display(this, VIEW.cx, 690, "Time!", 120, PALETTE.css.gold).setDepth(10).setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: done, scale: 1, alpha: 1, duration: 260, ease: "Back.easeOut" });
    this.orb.celebrate(30);
    const result: RoundResult = { coins: this.round.coins, taps: this.round.taps, autoCoins: this.round.autoCoins };
    this.time.delayedCall(1100, () => go(this, "Results", result));
  }
}
