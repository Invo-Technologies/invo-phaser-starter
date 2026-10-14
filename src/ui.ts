/** The game's small design system: type, buttons, panels, chips and scene transitions. */
import Phaser from "phaser";
import { getInvo } from "@invonetwork/phaser";
import { ITEMS } from "../shared/economy.js";
import { FONTS, PALETTE, VIEW } from "./palette.js";

type Text = Phaser.GameObjects.Text;

/** Headline type (Sora). */
export function display(scene: Phaser.Scene, x: number, y: number, value: string, size: number, color: string = PALETTE.css.text): Text {
  return scene.add
    .text(x, y, value, { fontFamily: FONTS.display, fontSize: `${size}px`, fontStyle: "800", color, align: "center" })
    .setOrigin(0.5)
    .setLetterSpacing(-size * 0.02);
}

/** Body type (Inter). */
export function label(scene: Phaser.Scene, x: number, y: number, value: string, size = 28, color: string = PALETTE.css.muted, weight = "500"): Text {
  return scene.add
    .text(x, y, value, { fontFamily: FONTS.ui, fontSize: `${size}px`, fontStyle: weight, color, align: "center" })
    .setOrigin(0.5);
}

/** Small spaced capitals above a headline. */
export function eyebrow(scene: Phaser.Scene, x: number, y: number, value: string, color: string = PALETTE.css.teal): Text {
  return label(scene, x, y, value.toUpperCase(), 19, color, "700").setLetterSpacing(5);
}

/** Fill a text with a vertical gradient (for the wordmark and big numbers). */
export function gradient(text: Text, stops: string[]): Text {
  text.updateText();
  const g = text.context.createLinearGradient(0, 0, 0, text.height);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
  return text.setFill(g);
}

export interface ButtonOptions {
  variant?: "gold" | "glass" | "text";
  width?: number;
  icon?: string;
}

/** Paints a pill button texture for this exact size (so corners never stretch). */
function pillTexture(scene: Phaser.Scene, kind: "gold" | "glass" | "glass-hover", width: number, height: number): string {
  const key = `btn-${kind}-${width}x${height}`;
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, width, height)!;
  const ctx = tex.context;
  const r = height / 2;
  if (kind === "gold") {
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, "#FFDE8A");
    g.addColorStop(0.55, "#F4C04A");
    g.addColorStop(1, "#D99D27");
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = kind === "glass" ? "rgba(255,255,255,0.06)" : "rgba(63,208,201,0.10)";
  }
  ctx.beginPath();
  ctx.roundRect(1, 1, width - 2, height - 2, r - 1);
  ctx.fill();
  if (kind !== "gold") {
    ctx.strokeStyle = kind === "glass" ? "rgba(255,255,255,0.16)" : "rgba(63,208,201,0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  const top = ctx.createLinearGradient(0, 0, 0, height * 0.5);
  top.addColorStop(0, kind === "gold" ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.12)");
  top.addColorStop(1, "rgba(255,255,255,0)");
  ctx.strokeStyle = top;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(3, 3, width - 6, height - 6, r - 3);
  ctx.stroke();
  tex.refresh();
  return key;
}

/** A pill button with hover lift and press feedback. */
export function button(scene: Phaser.Scene, x: number, y: number, text: string, onClick: () => void, options: ButtonOptions = {}) {
  const variant = options.variant ?? "glass";
  const width = options.width ?? 400;
  const height = variant === "text" ? 64 : 96;
  const parts: Phaser.GameObjects.GameObject[] = [];
  let bg: Phaser.GameObjects.Image | null = null;
  if (variant !== "text") {
    if (variant === "gold") {
      parts.push(scene.add.image(0, 18, "glow").setTint(PALETTE.gold).setDisplaySize(width * 1.15, height * 1.3).setAlpha(0.45));
    }
    bg = scene.add.image(0, 0, pillTexture(scene, variant === "gold" ? "gold" : "glass", width, height));
    parts.push(bg);
  }
  const color = variant === "gold" ? PALETTE.css.onGold : variant === "text" ? PALETTE.css.muted : PALETTE.css.text;
  const caption = label(scene, 0, 0, options.icon ? `${options.icon}  ${text}` : text, variant === "text" ? 26 : 31, color, variant === "text" ? "600" : "700");
  parts.push(caption);
  const hit = scene.add.rectangle(0, 0, width, height, 0x000000, 0).setInteractive({ useHandCursor: true });
  parts.push(hit);
  const container = scene.add.container(x, y, parts);

  const hover = (on: boolean) => {
    scene.tweens.add({ targets: container, scale: on ? 1.035 : 1, duration: 160, ease: "Cubic.easeOut" });
    if (variant === "glass") bg?.setTexture(pillTexture(scene, on ? "glass-hover" : "glass", width, height));
    if (variant === "text") caption.setColor(on ? PALETTE.css.text : PALETTE.css.muted);
  };
  hit.on("pointerover", () => hover(true));
  hit.on("pointerout", () => hover(false));
  hit.on("pointerdown", () => scene.tweens.add({ targets: container, scale: 0.96, duration: 70 }));
  hit.on("pointerup", () => {
    scene.tweens.add({ targets: container, scale: 1, duration: 140, ease: "Back.easeOut" });
    onClick();
  });
  return container;
}

/** A frosted panel with a gold-to-teal hairline on top. Painted once per size. */
export function panel(scene: Phaser.Scene, x: number, y: number, width: number, height: number, accent: number | null = null) {
  const key = `panel-${width}x${height}-${accent ?? "none"}`;
  if (!scene.textures.exists(key)) {
    const tex = scene.textures.createCanvas(key, width, height)!;
    const ctx = tex.context;
    const r = 36;
    const fill = ctx.createLinearGradient(0, 0, 0, height);
    fill.addColorStop(0, "rgba(36,40,49,0.86)");
    fill.addColorStop(1, "rgba(20,22,27,0.9)");
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(1, 1, width - 2, height - 2, r);
    ctx.fill();
    ctx.strokeStyle = accent === null ? "rgba(255,255,255,0.09)" : `#${accent.toString(16).padStart(6, "0")}88`;
    ctx.lineWidth = 2;
    ctx.stroke();
    const line = ctx.createLinearGradient(r, 0, width - r, 0);
    line.addColorStop(0, "rgba(244,192,74,0)");
    line.addColorStop(0.3, "rgba(244,192,74,0.8)");
    line.addColorStop(0.7, "rgba(63,208,201,0.8)");
    line.addColorStop(1, "rgba(63,208,201,0)");
    ctx.fillStyle = line;
    ctx.fillRect(r, 1, width - r * 2, 2);
    tex.refresh();
  }
  return scene.add.image(x, y, key);
}

/** A rounded capsule with text, e.g. a status line. Returns the container and its text. */
export function chip(scene: Phaser.Scene, x: number, y: number, value: string, color: string = PALETTE.css.muted, dot: number | null = null) {
  const caption = label(scene, 0, 0, value, 23, color, "600");
  const padX = dot === null ? 26 : 46;
  const w = caption.width + padX + 26;
  const g = scene.add.graphics();
  g.fillStyle(0xffffff, 0.05);
  g.fillRoundedRect(-w / 2, -26, w, 52, 26);
  g.lineStyle(2, 0xffffff, 0.1);
  g.strokeRoundedRect(-w / 2, -26, w, 52, 26);
  const parts: Phaser.GameObjects.GameObject[] = [g];
  if (dot !== null) {
    parts.push(scene.add.circle(-w / 2 + 28, 0, 6, dot));
    caption.setX(10);
  }
  parts.push(caption);
  return { container: scene.add.container(x, y, parts).setSize(w, 52), caption };
}

/** Slow motes drifting up behind everything, for depth. */
export function ambient(scene: Phaser.Scene) {
  scene.add
    .particles(0, 0, "spark", {
      x: { min: 0, max: VIEW.width },
      y: VIEW.height + 20,
      speedY: { min: -26, max: -60 },
      speedX: { min: -8, max: 8 },
      scale: { min: 0.12, max: 0.35 },
      alpha: { start: 0, end: 0.55, ease: "Sine.easeInOut" },
      lifespan: 14000,
      frequency: 420,
      tint: [PALETTE.teal, PALETTE.gold, PALETTE.white],
    })
    .setDepth(-10);
}

/** Fade the scene in. Call at the top of create(). */
export function enter(scene: Phaser.Scene) {
  scene.input.enabled = true;
  scene.cameras.main.setAlpha(0);
  scene.tweens.add({ targets: scene.cameras.main, alpha: 1, duration: 280, ease: "Cubic.easeOut" });
}

/** Fade the scene out, then start another. */
export function go(scene: Phaser.Scene, key: string, data?: object) {
  scene.input.enabled = false;
  scene.tweens.add({
    targets: scene.cameras.main,
    alpha: 0,
    duration: 200,
    ease: "Cubic.easeIn",
    onComplete: () => scene.scene.start(key, data),
  });
}

/** Whether the player owns the Golden Orb. */
export function ownsGolden(scene: Phaser.Scene): boolean {
  return getInvo(scene).economy.owns(ITEMS.goldenOrb);
}

/** Listen to an INVO event on `game.events` for as long as the scene runs. */
export function onInvo(scene: Phaser.Scene, event: string, listener: (...args: never[]) => void): void {
  scene.game.events.on(event, listener);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.game.events.off(event, listener));
}
