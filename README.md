# Orb Rush: a Phaser 4 starter with INVO built in

[![Open in Replit](https://replit.com/badge?caption=Open%20in%20Replit)](https://replit.com/github.com/Invo-Technologies/invo-phaser-starter)

A minimal, forkable 2D idle/clicker in **Phaser 4 + TypeScript** with INVO's game economy already wired in:

- a wallet in two currencies
- **Gems** sold through INVO's hosted checkout
- an item shop
- **Coins** earned by playing
- loyalty events

Press **Run** and it works. No keys, no setup.

The gameplay is deliberately small: tap the orb before the ring runs out. It's a starting point; replace it with your game.

## What's in the box

| | |
|---|---|
| **Wallet HUD** | Gems and Coins, live from the server, at the top right. |
| **Shop** | A cosmetic sold for Gems (the Golden Orb) and an upgrade sold for Coins (the Auto-Tapper, stacks to 5). Both visibly change the game. |
| **Buying Gems** | INVO's hosted checkout. The wallet is credited only by INVO's signed webhook, exactly once. |
| **Earning Coins** | Taps are batched to the server, which keeps the ledger and rate-limits earnings. |
| **Loyalty** | A milestone event at the end of each round. |
| **Screens** | Boot, Main Menu, Game, Shop (loadout) and Results, all drawn in code: no image files. |

## Run it

**On Replit:** press **Run**. The first start registers your copy with INVO's demo sandbox and prints its project ID.

**Locally:**

```bash
npm install
npm run dev   # http://localhost:3000
```

Locally everything works except crediting Gems from checkout: the demo sandbox delivers webhooks only to Replit addresses (`*.replit.app`, `*.replit.dev`, `*.repl.co`), so test checkout on Replit.

## The demo sandbox

Out of the box the game uses INVO's **public demo key**, which is in `server/invo.ts`:

- It's safe to keep in the code: it only reaches a sandbox-locked demo app and is refused in production.
- Players are fictional. Whatever email a player types becomes a `@demo.invo.network` address, and phone numbers are never sent to INVO.
- Payments use test cards only, for example `4242 4242 4242 4242` with any future expiry and any CVC. No real money moves.

## Going live

1. Create your game in the [INVO console](https://console.invo.network) and copy its **game secret** and **webhook signing secret**.
2. In Replit, open **Tools → Secrets** and add:
   - `INVO_GAME_SECRET`: your game secret
   - `INVO_WEBHOOK_SECRET`: your webhook signing secret
3. In the INVO console, set the webhook URL to `https://<your-app>.replit.app/api/invo/webhook`.
4. Add a PostgreSQL database (Replit's **Database** tool sets `DATABASE_URL`) so the ledger survives redeploys, then **Deploy**.

That's all. No code changes: the SDK picks production from your key, and your copy's project ID links it to your INVO account on the first live call.

## Make it yours

| To change | Edit |
|---|---|
| Currencies, Gem packs, shop items and prices | `shared/economy.ts` (the server enforces it) |
| What items do in the game | `src/scenes/Game.ts` (`applyUpgrades`) and `src/orb.ts` |
| Art | `src/scenes/Boot.ts` paints every texture; load real art there with the same keys |
| Colours and type | `src/palette.ts` and `index.html` |
| Round length | `src/logic.ts` |

Every INVO touchpoint in the code is marked with an `INVO:` comment. The agent-readable map is [replit.md](./replit.md).

## Project layout

```
server/   Node server: INVO routes at /api/invo plus the game (one port)
shared/   economy.ts, the shop, shared by server and game
src/      the Phaser game: scenes, design system, the orb
tests/    rules, server and ledger tests (npm test)
```

Built on [`@invonetwork/phaser`](https://www.npmjs.com/package/@invonetwork/phaser) and [`@invonetwork/web-sdk`](https://www.npmjs.com/package/@invonetwork/web-sdk). Docs: https://docs.invo.network

MIT licensed. Make it your own.
