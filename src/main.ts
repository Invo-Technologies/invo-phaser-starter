import Phaser from "phaser";
import { installInvo } from "@invonetwork/phaser";
import { VIEW } from "./palette.js";
import { celebrateFirstSale } from "./first-sale.js";
import { Boot } from "./scenes/Boot.js";
import { MainMenu } from "./scenes/MainMenu.js";
import { Game } from "./scenes/Game.js";
import { Shop } from "./scenes/Shop.js";
import { Results } from "./scenes/Results.js";

// Canvas text needs the web fonts loaded first (give up after 2.5 s and use the fallbacks).
await Promise.race([
  Promise.all(["800 64px Sora", "700 32px Inter", "500 28px Inter"].map((f) => document.fonts.load(f))),
  new Promise((resolve) => setTimeout(resolve, 2500)),
]);

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  transparent: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: VIEW.width,
    height: VIEW.height,
  },
  scene: [Boot, MainMenu, Game, Shop, Results],
});

// INVO: one call connects the economy. It mounts the INVO UI (balances, shop, sign-in,
// buying Gems) over the canvas, talks to this project's server at /api/invo, and pauses
// Phaser input while an INVO dialog is open. Scenes reach it with getInvo(this).
const invo = installInvo(game);

celebrateFirstSale(invo.economy, () => invo.ui);
