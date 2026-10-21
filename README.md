# Monoposto Companion

A data-driven championship manager companion for the Monoposto F1 career mode.
Rules and numbers live in `SPEC.md` (one level up) — this folder is the app.

## Run it

Serve the folder with any static server and open it in a browser:

```
python3 -m http.server 8000
# → http://localhost:8000
```

No build step. Vanilla ES modules. The save persists in the browser's
localStorage; export/import JSON from the HQ screen's save tools.

## Structure

| Folder | What lives there | Edit it when… |
|---|---|---|
| `data/` | The static database: teams & drivers, 2026 calendar, parts tree, facilities tree, sponsors & PUs | You want to change a number, add a part, add a team |
| `engine/` | The rules: save store, theming, the advance-time clock, R&D + D20, race points/rewards, driver market | A game rule changes |
| `views/` | One file per screen; screens only render from data + store | A screen's layout changes |
| `css/` | `variables.css` (fonts, tokens, `--team`), `global.css` (layout, HUD, nav), `components.css` (cards, agenda, tables, trees) | Styling changes |
| `assets/` | Fonts, official logos, track maps | Adding media |

## Hard rules baked into the engines

- The game decides all on-track outcomes; the app only books them.
- D20 rolls exist only in `engine/rdEngine.js` (factory correlation checks).
- Monoposto takes integers 1–10; the app tracks fractional "true" power and
  displays it everywhere.
- The agenda is generated from state — nothing appears that the player
  didn't queue, apart from fixtures (Monday tick, race weekends).
- The team is chosen once, in the start wizard; theming flows from the save
  through `--team` (engine/themeEngine.js).
