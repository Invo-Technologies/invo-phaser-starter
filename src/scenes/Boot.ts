import Phaser from "phaser";

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/**
 * Paints every texture the game uses, in code, so the template ships with no image files.
 * When you have real art, load it in a preload() and keep the same texture keys.
 */
export class Boot extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create() {
    this.orb("orb-teal", ["#F2FFFE", "#5CF0E6", "#17B3AA", "#05302E"]);
    this.orb("orb-gold", ["#FFF8E1", "#FFD15C", "#D9921A", "#3D2402"]);

    this.paint("glow", 512, 512, (ctx, w) => {
      const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      g.addColorStop(0, "rgba(255,255,255,0.5)");
      g.addColorStop(0.22, "rgba(255,255,255,0.26)");
      g.addColorStop(0.5, "rgba(255,255,255,0.08)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, w);
    });
    this.paint("ring-dash", 520, 520, (ctx, w) => {
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 13]);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(w / 2, w / 2, w / 2 - 4, 0, Math.PI * 2);
      ctx.stroke();
    });
    this.paint("ring-arc", 470, 470, (ctx, w) => {
      ctx.lineCap = "round";
      ctx.lineWidth = 3;
      for (const start of [0, Math.PI]) {
        const g = ctx.createLinearGradient(0, 0, w, w);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.5, "rgba(255,255,255,0.9)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.arc(w / 2, w / 2, w / 2 - 6, start, start + 1.3);
        ctx.stroke();
      }
    });
    this.paint("ring-thin", 256, 256, (ctx, w) => {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(w / 2, w / 2, w / 2 - 6, 0, Math.PI * 2);
      ctx.stroke();
    });
    this.paint("spark", 32, 32, (ctx, w) => {
      const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.4, "rgba(255,255,255,0.7)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, w);
    });
    this.paint("satellite", 48, 48, (ctx, w) => {
      const c = w / 2;
      const halo = ctx.createRadialGradient(c, c, 0, c, c, c);
      halo.addColorStop(0, "rgba(255,255,255,0.9)");
      halo.addColorStop(0.3, "rgba(255,255,255,0.5)");
      halo.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, w);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(c, c, 7, 0, Math.PI * 2);
      ctx.fill();
    });
    this.paint("gem", 64, 64, (ctx) => {
      const g = ctx.createLinearGradient(8, 6, 56, 58);
      g.addColorStop(0, "#FFE9A8");
      g.addColorStop(0.5, "#F4C04A");
      g.addColorStop(1, "#A8730F");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(19, 9);
      ctx.lineTo(45, 9);
      ctx.lineTo(57, 25);
      ctx.lineTo(32, 57);
      ctx.lineTo(7, 25);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.22)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(7, 25);
      ctx.lineTo(57, 25);
      ctx.moveTo(19, 9);
      ctx.lineTo(32, 25);
      ctx.lineTo(45, 9);
      ctx.moveTo(32, 25);
      ctx.lineTo(32, 57);
      ctx.stroke();
    });
    this.paint("coin", 64, 64, (ctx) => {
      const g = ctx.createRadialGradient(24, 20, 2, 32, 32, 30);
      g.addColorStop(0, "#C9FFFA");
      g.addColorStop(0.55, "#3FD0C9");
      g.addColorStop(1, "#167A75");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(32, 32, 27, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.22)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(32, 32, 17, 0, Math.PI * 2);
      ctx.stroke();
    });
    this.scene.start("MainMenu");
  }

  /** A lit sphere: base gradient, a rim light, and a soft specular highlight. */
  private orb(key: string, [highlight, light, mid, deep]: [string, string, string, string]) {
    this.paint(key, 300, 300, (ctx, w) => {
      const c = w / 2;
      const r = 104;
      const base = ctx.createRadialGradient(c - 38, c - 44, 6, c, c, r);
      base.addColorStop(0, highlight);
      base.addColorStop(0.28, light);
      base.addColorStop(0.72, mid);
      base.addColorStop(1, deep);
      ctx.fillStyle = base;
      ctx.beginPath();
      ctx.arc(c, c, r, 0, Math.PI * 2);
      ctx.fill();
      // Rim light from below right.
      const rim = ctx.createRadialGradient(c + 40, c + 52, r * 0.55, c, c, r);
      rim.addColorStop(0, "rgba(255,255,255,0)");
      rim.addColorStop(0.85, "rgba(255,255,255,0)");
      rim.addColorStop(1, "rgba(255,255,255,0.35)");
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(c, c, r, 0, Math.PI * 2);
      ctx.fill();
      // Plasma bands inside the sphere.
      ctx.save();
      ctx.beginPath();
      ctx.arc(c, c, r - 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.filter = "blur(5px)";
      for (const [rx, ry, rot, a] of [[84, 34, -0.5, 0.2], [96, 46, 1.2, 0.12]] as const) {
        ctx.strokeStyle = `rgba(255,255,255,${a})`;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.ellipse(c + 6, c + 10, rx, ry, rot, 0.2, Math.PI * 1.25);
        ctx.stroke();
      }
      ctx.filter = "none";
      const core = ctx.createRadialGradient(c + 10, c + 26, 0, c + 10, c + 26, 70);
      core.addColorStop(0, "rgba(255,255,255,0.28)");
      core.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, w, w);
      ctx.restore();
      // Specular highlight.
      const spec = ctx.createRadialGradient(c - 40, c - 48, 0, c - 40, c - 48, 34);
      spec.addColorStop(0, "rgba(255,255,255,0.95)");
      spec.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = spec;
      ctx.beginPath();
      ctx.ellipse(c - 40, c - 48, 34, 24, -0.6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private paint(key: string, w: number, h: number, draw: Draw) {
    if (this.textures.exists(key)) return;
    const tex = this.textures.createCanvas(key, w, h)!;
    draw(tex.context, w, h);
    tex.refresh();
  }
}
