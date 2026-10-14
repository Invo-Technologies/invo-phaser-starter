/**
 * The orb: the game's hero object, shared by every screen. A soft halo, two counter-rotating
 * rings, the lit sphere, and one orbiting satellite per Auto-Tapper the player owns.
 */
import Phaser from "phaser";
import { PALETTE } from "./palette.js";

export class OrbView extends Phaser.GameObjects.Container {
  private readonly glow: Phaser.GameObjects.Image;
  private readonly innerGlow: Phaser.GameObjects.Image;
  private readonly ringDash: Phaser.GameObjects.Image;
  private readonly ringArc: Phaser.GameObjects.Image;
  readonly core: Phaser.GameObjects.Image;
  private readonly beams: Phaser.GameObjects.Graphics;
  private readonly burst: Phaser.GameObjects.Particles.ParticleEmitter;
  private satellites: Phaser.GameObjects.Image[] = [];
  private golden = false;
  private spin = 0;
  /** Distance of the satellites from the centre. */
  orbitRadius = 250;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.glow = scene.add.image(0, 0, "glow").setScale(1.6).setAlpha(1);
    this.innerGlow = scene.add.image(0, 0, "glow").setScale(0.78).setAlpha(1);
    this.ringDash = scene.add.image(0, 0, "ring-dash").setAlpha(0.35);
    this.ringArc = scene.add.image(0, 0, "ring-arc").setAlpha(0.7);
    this.beams = scene.add.graphics();
    this.core = scene.add.image(0, 0, "orb-teal");
    this.add([this.glow, this.ringDash, this.ringArc, this.innerGlow, this.beams, this.core]);
    scene.add.existing(this);

    this.burst = scene.add.particles(0, 0, "spark", {
      speed: { min: 220, max: 520 },
      angle: { min: 0, max: 360 },
      lifespan: { min: 380, max: 720 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false,
    });
    this.burst.setDepth(5);

    scene.tweens.add({ targets: this.glow, alpha: 0.7, scale: 1.45, duration: 1800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    scene.events.on(Phaser.Scenes.Events.UPDATE, this.tick, this);
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      scene.events.off(Phaser.Scenes.Events.UPDATE, this.tick, this);
      this.burst.destroy();
    });
    this.setSkin(false);
  }

  /** Teal by default, gold with the Golden Orb. */
  setSkin(golden: boolean): this {
    this.golden = golden;
    const color = golden ? PALETTE.gold : PALETTE.teal;
    this.core.setTexture(golden ? "orb-gold" : "orb-teal");
    this.glow.setTint(color);
    this.innerGlow.setTint(color);
    this.ringArc.setTint(golden ? PALETTE.goldLight : PALETTE.tealLight);
    this.ringDash.setTint(color);
    this.burst.setParticleTint(golden ? PALETTE.goldLight : PALETTE.tealLight);
    for (const s of this.satellites) s.setTint(PALETTE.teal);
    return this;
  }

  /** One satellite per Auto-Tapper. */
  setSatellites(count: number): this {
    while (this.satellites.length < count) {
      const s = this.scene.add.image(0, 0, "satellite").setTint(PALETTE.teal).setScale(0);
      this.addAt(s, 4);
      this.satellites.push(s);
      this.scene.tweens.add({ targets: s, scale: 1, duration: 420, ease: "Back.easeOut" });
    }
    while (this.satellites.length > count) this.satellites.pop()!.destroy();
    return this;
  }

  /** The tap response: squash, a ripple and a spark burst at the tap point (world coords). */
  tap(worldX: number, worldY: number): void {
    this.scene.tweens.add({ targets: this.core, scaleX: 0.9, scaleY: 0.94, duration: 55, yoyo: true, ease: "Quad.easeOut" });
    this.ripple(this.golden ? PALETTE.gold : PALETTE.teal);
    this.burst.explode(10, worldX, worldY);
  }

  ripple(color: number, from = 0.8, to = 2.1): void {
    const ring = this.scene.add.image(this.x, this.y, "ring-thin").setTint(color).setScale(from).setAlpha(0.7).setDepth(this.depth - 1);
    this.scene.tweens.add({ targets: ring, scale: to, alpha: 0, duration: 650, ease: "Cubic.easeOut", onComplete: () => ring.destroy() });
  }

  /** Satellites flash and send a beam into the orb (an Auto-Tapper paying out). */
  pulseSatellites(): void {
    this.beams.clear();
    this.beams.lineStyle(3, PALETTE.teal, 0.6);
    for (const s of this.satellites) {
      this.beams.lineBetween(s.x * 0.92, s.y * 0.92, s.x * 0.45, s.y * 0.45);
      this.scene.tweens.add({ targets: s, scale: 1.7, duration: 110, yoyo: true, ease: "Quad.easeOut" });
    }
    this.beams.setAlpha(1);
    this.scene.tweens.add({ targets: this.beams, alpha: 0, duration: 380 });
  }

  /** Celebration burst from the centre. */
  celebrate(count = 40): void {
    this.burst.explode(count, this.x, this.y);
    this.ripple(PALETTE.gold, 1, 2.6);
    this.ripple(PALETTE.teal, 0.8, 2.2);
  }

  private tick(_time: number, delta: number): void {
    const dt = delta / 1000;
    this.spin += dt;
    this.ringDash.rotation += dt * 0.12;
    this.ringArc.rotation -= dt * 0.45;
    this.core.y = Math.sin(this.spin * 1.6) * 6;
    const n = this.satellites.length;
    this.satellites.forEach((s, i) => {
      const a = this.spin * 0.9 + (i / n) * Math.PI * 2;
      s.setPosition(Math.cos(a) * this.orbitRadius, Math.sin(a) * this.orbitRadius * 0.92);
    });
  }
}
