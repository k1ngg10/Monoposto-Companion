# Monoposto Companion

**A championship manager companion for a self-simulated Monoposto F1 career.**

Run the off-track half of a full Formula 1 season — sponsors, money, facilities, research & development, and the driver market — for a fictional 2026 championship of **12 teams and 24 drivers**. The game itself decides everything that happens on track; this app is the team principal's office around it.

### ▶ [Live app](https://k1ngg10.github.io/Monoposto-Companion/)

![Vanilla JS](https://img.shields.io/badge/built%20with-vanilla%20JS-f7df1e)
![No build step](https://img.shields.io/badge/build-none-success)
![Runs on](https://img.shields.io/badge/hosted-GitHub%20Pages-blue)

![Championship creation — pick your team](docs/screenshots/01-creation.png)

---

## What is this?

Monoposto gives you the racing. It doesn't give you a season-long management layer — no budgets, no development war against the other eleven teams, no contracts, no consequences that carry from one race weekend to the next.

Monoposto Companion is that layer. You create a championship once — team, power unit, owner background, sponsors, starting baselines — and then live the season week by week: money arrives and leaves, parts get researched and built, facilities go up, rival teams develop their own cars, and the driver market moves under a fixed set of prestige rules. Every rule and number lives inside the app itself, so the app is the referee — it never improvises.

## Screenshots

**The Championship Matrix** — every team, every driver, one screen. Standings are worked out from your logged results with proper F1 countback.

![Championship Matrix](docs/screenshots/02-matrix.png)

**Team HQ** — your cash, resource points and fan rating, the weekly ledger, and everything currently on the factory floor.

![Team HQ](docs/screenshots/03-hq.png)

## Features

- **Full championship tracking** — all 12 teams and 24 drivers on one matrix, with standings, form, and a contract radar that flags seats at risk before the market opens.
- **Championship creation flow** — a team card slider (car power, both drivers, starting resources), power-unit selection (works teams run their in-house engine; customer teams pick a supplier and pay the contract), owner backgrounds with real perks, and per-team sponsor boards.
- **A working economy** — sponsors pay a Day 1 signing fee, weekly income and per-race goal bonuses; the two sponsors you don't pick still pay a partial retainer. Power units, facility running costs and manufacturing all draw from the same bank.
- **Research & Development** — four departments (Aerodynamics, Chassis, Powertrain, Durability) with subcategory part trees and a 3-spec upgrade ladder per part. Engineering outcomes are settled by D20 correlation rolls, and finished parts debut on a real calendar: a part is ready on a date, and it first races at the next Grand Prix after that date.
- **Facilities** — three upgrade branches (Engineering, Personnel, Corporate), each with phased sub-upgrades that raise your weekly research output, unlock parallel work, and add commercial income.
- **Rival development** — the other eleven teams improve their cars too, balanced by an ATR-style scale based on constructors' standing, with an R&D spy view so you can see what you're up against.
- **Driver market** — no dice, no lottery. Veteran retirement checks, a teammate points threshold for underperforming drivers, and a prestige ladder that decides who can move where. Contract windows open at Spa and Abu Dhabi.
- **Race weekends** — log results with selectable race length and actual conditions, weekend objectives, and rewards that scale with what your car was expected to do.
- **Advance-time agenda** — the calendar is generated from your own queued work plus the fixtures (weekly tick, race weekends). Nothing appears that you didn't set in motion.
- **Your save stays yours** — everything persists in the browser's local storage, with JSON export/import in the header settings when you want a backup or a fresh start.

## Run it locally

No build step, no dependencies — it's plain ES modules and CSS.

```bash
git clone https://github.com/k1ngg10/Monoposto-Companion.git
cd Monoposto-Companion
python3 -m http.server 8000
# open http://localhost:8000
```

Any static file server works just as well.

## Tech

- Vanilla JavaScript (ES modules) + CSS — zero frameworks, zero bundlers
- Save state in `localStorage`, exportable/importable as JSON
- Team theming driven by a single CSS variable set from your save
- Hosted on GitHub Pages

## Project structure

| Folder | What's in it |
|---|---|
| `data/` | The static database — teams & drivers, the 2026 calendar, parts and facilities trees, sponsors & power units |
| `engine/` | The rules — save store, time/advance engine, R&D, race rewards, AI development, driver market |
| `views/` | One file per screen; screens render from data + save state |
| `css/` | Fonts and design tokens, global layout, components |
| `assets/` | Logos and track maps |

---

## Disclaimer

This is an **unofficial, fan-made, non-commercial project**, built for personal entertainment. It is **not affiliated with, endorsed by, or connected to** Formula 1, the FIA, the Monoposto game or its developers, or any real-world racing team, driver, or company mentioned in it.

All company names, team names, sponsor names, logos and other trademarks shown in this project belong to their respective owners. They are used for identification and fan purposes only, and no copyright or trademark infringement is intended. If you are a rights holder and would like any material removed, please open an issue and it will be taken down.

The 2026 grid, teams and season depicted here are a fictional scenario created for a single-player career mode.

This app was developed independently. Any resemblance between its systems, layout or appearance and those of any other game, application or product — existing or otherwise — is **purely coincidental**.
