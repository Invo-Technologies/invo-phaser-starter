/** INVO colours: charcoal glass, gold for premium value, teal for soft currency and accents. */
export const PALETTE = {
  ink: 0x0b0d11,
  panel: 0x1c1f26,
  line: 0x2e333d,
  gold: 0xf4c04a,
  goldLight: 0xffde8a,
  teal: 0x3fd0c9,
  tealLight: 0xa8f2ee,
  white: 0xffffff,
  css: {
    text: "#EEF1F6",
    muted: "#98A1B3",
    faint: "#5E6676",
    gold: "#F4C04A",
    goldLight: "#FFE6A3",
    goldDeep: "#D99D27",
    teal: "#3FD0C9",
    tealLight: "#B6F5F1",
    onGold: "#1A1405",
  },
} as const;

export const FONTS = {
  /** Headlines and numbers. */
  display: 'Sora, Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
  /** Everything else. */
  ui: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
} as const;

/** The game's logical size; Phaser scales it to fit the screen. */
export const VIEW = { width: 720, height: 1280, cx: 360 } as const;
