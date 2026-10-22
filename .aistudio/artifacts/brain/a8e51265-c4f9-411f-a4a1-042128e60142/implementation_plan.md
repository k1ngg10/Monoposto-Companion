# Full-Grid AI R&D, Monoposto Slider Sync, 24-Driver Qualifying/Race Control & Season 2 Lifecycle

This update transforms the companion app from a single-team tracker into a complete 12-team, 24-driver career simulation across Seasons 1 (2026) and 2 (2027), syncing live integer slider changes (`Car Power`, `Driver Speed`, `Driver Risk`) directly with your Monoposto mobile game.

---

## User Review & Confirmed Decisions

> [!IMPORTANT]
> The following core workflows and simulation rules incorporate your exact specifications and clarifying responses:

- **Confirmed Decision 1 — Full 24-Driver Manual Classification across Two Distinct Weekend Screens (Qualifying → Grand Prix)**:
  - When a Race Weekend arrives on the Team HQ calendar, advancing pauses and presents a direct entry into **Qualifying Control**.
  - **Qualifying Screen**: Requires manual entry for all 24 drivers (`P1`–`P24` starting grid and mandatory qualifying lap times), **plus an explicit `[SKIP QUALIFYING → GO TO GRAND PRIX]` button** if you did not record Qualifying for that round.
  - **Seamless Transition to Grand Prix Screen**: As soon as Qualifying is logged or skipped, Race Control transitions directly to the **Grand Prix Classification** screen (no need to navigate back to Team HQ). If you exit to Team HQ between Qualifying and the Race, the Team HQ Race Weekend banner remembers that Qualifying is complete/skipped and provides a direct **`[CONTINUE TO GRAND PRIX →]`** button.
  - **Grand Prix Screen**: Requires manual position/status entry (`P1`–`P24` or `DNF`) for all 24 drivers across all 12 teams, with **optional** finishing time/gap inputs and Fastest Lap selection, calculating official F1 points (`25-18-15-12-10-8-6-4-2-1` + `+1 FL`) across both the Drivers' and Constructors' Championships.
- **Confirmed Decision 2 — Season 1 (2026) to Season 2 (2027) Transition & Targeted Annual Part Bans**:
  - Since 2026 was the major regulation reset and the next major overhaul is not until 2030, transitioning from Season 1 (2026) to Season 2 (2027) applies **targeted FIA Technical Directive part bans** (announced at Round 16 Singapore) rather than an arbitrary full regulation wipe.
  - Between Round 16 (Singapore) and Round 22 (Abu Dhabi), both you and the 11 AI teams choose an **R&D Spec Allocation Split** (`100% Current 2026 Car`, `50/50 Balanced Adaptation`, or `100% 2027 Spec Protection`) to shield against off-season banned-part power drops.
  - After Round 22 (Abu Dhabi) is logged, an **End-of-Season Summary Modal** reviews the championship winners, prize purses, contract window moves, and each team's 2027 starting baseline before launching **Season 2 (2027)**.
- **Confirmed Decision 3 — Dynamic Team HQ Cities (Removing Hardcoded "Weissach")**:
  - `"Weissach"` (`Weissach, Baden-Württemberg, Germany`) is now strictly exclusive to **Apple Porsche**. Every other constructor displays its authentic real-world headquarters across Team HQ, Facilities, Radio Banners, Weekly Ledger cards, and Driver Market screens (`Woking` for McLaren, `Brackley` for Mercedes, `Milton Keynes` for Red Bull, `Maranello` for Ferrari, `Grove` for Williams, `Silverstone` for Aston Martin, `Kannapolis` for Haas, `Hinwil` for Audi, `Indianapolis` for Cadillac, `Shenzhen` for BYD, and `Munich` for BMW).

---

## 1. Overview & Core Concept

- **What It Does**: Simulates all 12 constructors and 24 drivers in parallel with your career team, tracking exact `1–10` Monoposto slider integers (`Car Power`, `Driver Speed`, `Driver Risk`), full-grid Qualifying and Race classifications, FIA Wind Tunnel (ATR) multipliers, Fan Rating economy, and interactive driver contracts across a 2-season arc.
- **Target Audience / Persona**: Monoposto players running a realistic 2026–2027 Formula 1 career who want deterministic, transparent rules governing AI car upgrades, driver aggression/form shifts, and in-game slider synchronization.
- **Key Value**: Eliminates static placeholder panels and guesswork—every slider adjustment you need to make inside Monoposto is tracked as a two-state diff (`Synced in Game` vs. `New Live Value`) with one-click confirmation.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Monoposto Sync Checklist & 4-Mode Championship Matrix**:
     - The `REQUIRED MONOPOSTO IN-GAME CHANGES BEFORE NEXT RACE` panel compares `state.monopostoSynced` against live integer values for all 12 teams and 24 drivers. Each changed slider appears as an actionable row (`[✓ Applied]`) alongside a master **`[✓ CONFIRM ALL APPLIED IN MONOPOSTO]`** button.
     - The 4 top filter buttons on the Championship Matrix screen act as live view-switchers:
       - `ALL 12 TEAMS`: Full broadcast matrix with Car Power, R&D Progress %, and Driver SPD/RSK/Status.
       - `MONOPOSTO 1–10 SLIDERS`: Clean 12-row quick-entry setup sheet displaying only the 5 integer sliders per team (`Car Power`, `D1 SPD`, `D1 RSK`, `D2 SPD`, `D2 RSK`) with `Old → New` diff badges.
       - `R&D DEVELOPMENT PROGRESS`: 12-team engineering spy table showing Facility Phase (`Phase 1–3`), FIA ATR Multiplier (`70%–120%`), Weekly DP gain rate, True Fractional Power (`e.g., 6.48`), Active Background Upgrade, and `2027 Spec Protection %`.
       - `BASELINE DEV GRAPH →`: Opens the Vehicle Performance Comparison chart (showing Season-Start Baseline + Current-Season Development Gain).
  2. **Two-Stage Race Weekend Control (`Qualifying` → `Grand Prix`)**:
     - **Stage 1 — Qualifying Session**: 24-driver grid entry table where you assign `P1`–`P24` and required Qualifying lap times (e.g., `1:27.412`), or click **`[SKIP QUALIFYING → GO TO GRAND PRIX]`** if Qualifying was not recorded.
     - **Stage 2 — Grand Prix Session**: Automatically opens once Qualifying is saved or skipped. Displays all 24 drivers (ordered by starting grid if Qualifying was logged) to record finishing positions (`P1`–`P24` or `DNF`), optional race time/gap, and Fastest Lap, followed by an instant breakdown of FIA Prize Cash, Telemetry RP, Fan Rating delta, and newly triggered Driver Speed/Risk slider changes.
  3. **Interactive Contract Radar & Driver Market**:
     - Clicking any driver row in the Contract Radar or Driver Market opens a **Driver Dossier & Contract Negotiation Modal** showing their season points, Teammate Qualifying/Race H2H, Speed/Risk history, Rule 1/2/3 status, and—during the **Round 12 (Spa)** and **Round 22 (Abu Dhabi)** contract windows—allows signing eligible free agents, poaching rival drivers (gated by your team's **Fan Rating** and **Car Power**), or promoting from the F2 Reserve Pool (`T. Pourchaire`, `F. Vesti`, `P. Aron`).
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-contrast F1 broadcast telemetry and race-engineering console.
  - *Color Palette & Mood*: Deep carbon-obsidian surfaces (`#0b0b0e`, `#131318`), crisp hairline borders (`#262630`), team livery color bars, and semantic telemetry accents—F1 crimson (`#e10600`), emerald sync confirmation (`#1ee656`), and amber slider-diff alerts (`#f5c542`).
  - *Typography & Hierarchy*: `F1DisplayWide` and `F1DisplayBold` for headers and driver surnames, paired with `tabular-nums` across all lap times, gaps, points, and `1–10` slider matrices.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Two-State Slider Synchronization (`monopostoSynced` vs. `liveTarget`)**:
  - *Chosen Approach*: Persist a dedicated `monopostoSynced` snapshot in the save state for all 12 teams (`carPower`) and 24 drivers (`speed`, `risk`), updating it only when the user clicks `[✓ Applied]` or `[✓ CONFIRM ALL APPLIED IN MONOPOSTO]`.
  - *Why*: Previously, the tracker had no memory of what was already entered into the Monoposto app, causing alerts to either vanish prematurely or linger forever.
- **Decision 2 — Tier-Locked AI R&D Progression with ATR Catch-Up**:
  - *Chosen Approach*: Rebalance part research (`10–21d`) and manufacturing (`6–12d`) lead times and DP values (`+15 to +35 DP`) so teams gain `+1.00 to +2.00 Car Power` per season, while AI teams progress on Monday ticks according to their Constructor Tier (`Tier 1 Giants: +4.0–4.8 DP/wk`, `Tier 2 Midfield: +3.3–4.0 DP/wk`, `Tier 3 Backmarkers: +2.5–3.2 DP/wk`) modified by the Round 7 & Round 14 FIA ATR Wind Tunnel sliding scale (`70%` for P1 to `120%` for P12).
  - *Why*: Ensures integer Car Power sliders visibly advance by 1–2 points during a season while guaranteeing backmarkers (`4.00`) cannot unrealistically overtake giants (`6.00–7.00`) in Season 1.
- **Decision 3 — Deterministic 3-Race Rolling Evaluation for Driver Speed & Risk**:
  - *Chosen Approach*: Evaluate all 24 drivers after every logged Grand Prix using transparent, rule-based triggers (Championship Desperation `+1 Risk`, Teammate H2H / Hot Seat Pressure `+1 Risk`, High-Risk Crash Cooldown `-1 Risk` after 2 DNFs in 3 races, 40+ pt Lead Safe Mode `-1 Risk`, #1 Car Upgrade Priority `+1 Speed`, and 3-race Hot Streak `+1 Speed` / Cold Slump `-1 Speed`) with an explicit reason tag attached to every change.
  - *Why*: Replaces random stat noise with authentic motorsport storylines you can verify in the table.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        PERSISTENT CAREER SAVE (store.js)                     │
│  • season (1 | 2), seasonHistory[], teamDp{}, aiTeams{} (phase, atr, focus)  │
│  • driverStats{} (live speed, live risk, baseSpeed, baseRisk, formReason)    │
│  • monopostoSynced: { teams: {id: power}, drivers: {id: {speed, risk}} }     │
│  • results[round]: { quali: {skipped, grid, times}, race: {entries, gaps} }  │
└───────────────┬──────────────────────────────┬───────────────────────────────┘
                │                              │
   ┌────────────▼────────────┐    ┌────────────▼────────────┐
   │   MONDAY TIME ENGINE    │    │  RACE WEEKEND SIMULATOR │
   │  • Player Weekly RP/$   │    │  • Stage 1: 24-Car Quali│
   │  • Fan Merch (+$10k×Fan)│    │    (or Skip Qualifying) │
   │  • AI 11-Team Weekly DP │    │  • Stage 2: 24-Car GP   │
   │  • R16–R22 Spec Split   │    │  • FIA Purse, RP & Fan  │
   └────────────┬────────────┘    │  • R7/R14 ATR & 24-Drv  │
                │                 │    Speed/Risk Evolution │
                └────────┬────────┴────────────┬────────────┘
                         │                     │
      ┌──────────────────▼─────────────────────▼──────────────────┐
      │                USER INTERFACE VIEWS                       │
      │  • ChampionshipMatrixView (Sync Diff Box + 4 View Modes)  │
      │  • RaceWeekendView (Qualifying Screen ↔ GP Screen)        │
      │  • DevGraphView (S1 Base 4.00 / S2 Baseline + Gain Bar)   │
      │  • DriverMarketView (Interactive Dossiers & Signings)     │
      │  • HqDashboardView & FacilitiesView (Dynamic Team HQ City)│
      └───────────────────────────────────────────────────────────┘
```

### Data Model & State Transitions

1. **Dynamic Team Headquarters (`data/teamsAndDrivers.js`)**:
   - Each team entry defines `hq` (short city name, e.g., `'Brackley'`, `'Maranello'`, `'Shenzhen'`, `'Weissach'`) and `hqFull` (full regional location string). All UI headers, facility statuses, radio banners, and ledger descriptions read `playerTeam().hq` dynamically.
2. **Two-State Monoposto Sync Engine (`engine/store.js`)**:
   - `getLiveMonopostoValues(state)` computes the live integer `carPower` (`1–10`) for all 12 teams and live `speed` (`1–10`, including `#1 Priority Car +1 Speed`) and `risk` (`1–10`) for all 24 drivers.
   - `getMonopostoDiffs(state)` diffs `getLiveMonopostoValues(state)` against `state.monopostoSynced`, returning a list of pending changes with human-readable explanations (e.g., `"Hot Streak: 3 races ≥3 pos above tier"`, `"Crash Cooldown: 2 DNFs in 3 races"`, `"R&D Level Up: 5.02 → Power 5"`).
   - `confirmMonopostoSync(state, itemKeyOrAll)` updates `state.monopostoSynced` for a single row or all rows at once.
3. **Two-Stage Full-Grid Race Control (`views/RaceWeekendView.js` & `engine/raceSimulator.js`)**:
   - Each round stores `state.qualifying[round] = { skipped: boolean, order: [driverId...], times: { [driverId]: string } }` and `state.results[round] = { entries: { [driverId]: number|null }, gaps: { [driverId]: string }, fastestLap: driverId|null, conditions, laps, rewards }`.
   - In `HqDashboardView.js`, `activeRaceStop(state)` remains active throughout the race weekend until `state.results[race.round]` is logged—showing `"GO TO QUALIFYING →"` first, and `"QUALIFYING LOGGED/SKIPPED · GO TO GRAND PRIX →"` if the player returns to HQ before logging the race.
4. **Season-End Summary & Season 2 Rollover (`engine/timeEngine.js` & `views/RaceWeekendView.js`)**:
   - After Round 22 is logged in Season 1, an interactive **End of Season 1 & 2027 Technical Directive Summary** modal computes each team's 2027 starting baseline (`endingPower - (1.20 * (1 - protectionFraction)) + launchBonus`, clamped to realistic bounds), archives Season 1 standings into `state.seasonHistory`, resets the 22-round calendar for Season 2 (`2027`), and updates `state.seasonStartPower[teamId]` so the Season 2 Development Graph renders both the **2027 Starting Baseline** and **In-Season Development Gain**.
