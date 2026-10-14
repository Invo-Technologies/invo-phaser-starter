# Orb Rush: guide for coding agents

A Phaser 4 + TypeScript game with INVO's economy wired in. Read this before changing anything that touches money.

## Run, build, test

- `npm run dev`: one server on `PORT` (default 3000), Vite with hot reload, INVO routes at `/api/invo`.
- `npm run build`, then `npm start`: production.
- `npm test` and `npm run typecheck` must pass after every change.

## Rules that must not be broken

1. **Secrets stay on the server.** `INVO_GAME_SECRET` and `INVO_WEBHOOK_SECRET` live in Replit Secrets and are read only in `server/`.
   - Never import `server/` from `src/`.
   - Never commit `.invo/`, which holds this copy's webhook secret.
2. **The server decides balances and ownership.** In the browser, read `economy.wallet`, `economy.owns(id)` and `economy.quantity(id)`. Never compute or store balances client-side.
3. **Gems are credited only by INVO's signed webhook** (`POST /api/invo/webhook`, verified and deduplicated by the SDK). Never credit from a checkout return URL.
4. **Prices and items come from `shared/economy.ts`.** Add items there; the server rejects anything not in it.
5. **Keep the demo key working.** `INVO_DEMO_KEY` in `server/invo.ts` is public by design. Going live means setting the two Secrets, and nothing else.

## Where INVO is wired in (search for `INVO:` comments)

| File | What it does |
|---|---|
| `server/invo.ts` | Demo key, `registerProject` on every start, `invoGameServerFromEnv` |
| `server/app.ts` | Mounts the INVO routes and serves the game |
| `server/store.ts` | The ledger: Postgres if `DATABASE_URL` is set, else `.data/` |
| `shared/economy.ts` | Currencies, Gem packs, items |
| `src/main.ts` | `installInvo(game)`: the UI over the canvas |
| `src/scenes/Game.ts` | `economy.earn(...)`, items changing the game, the loyalty event |
| `src/first-sale.ts` | The one-time "first sale" card shown to the builder in the sandbox |

## Common tasks

- **New shop item:** add it to `shared/economy.ts`, give its id a constant in `ITEMS`, then react to it with `economy.owns(ITEMS.x)` inside a `InvoEvents.WALLET` listener (see `applyUpgrades` in `Game.ts`).
- **Earn currency for an action:** `getInvo(this).economy.earn(amount, "reason")`. It is batched and rate-limited by the server; don't call it per frame.
- **Open the shop or Gem packs from your own button:** `getInvo(this).ui?.openShop(category)` or `ui?.openBuyCurrency()`.
- **Pause during INVO dialogs:** Phaser input pauses automatically. Skip timers while `getInvo(this).modalOpen`.
- **Loyalty milestone:** `economy.reportEvent("game.milestone.reached", { milestone_key: "..." })`.

Package docs: `node_modules/@invonetwork/phaser/INTEGRATION.md`.
