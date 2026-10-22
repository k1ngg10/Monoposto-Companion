# Logic development 

To turn the static placeholders in your screenshots into a living career simulation where all 12 teams and 24 drivers evolve dynamically—and where the app actually knows what numbers are inside your Monoposto game—here is the exact mechanical and UI blueprint for each system.



### 1\. Fixing the "Required Monoposto In-Game Changes" Box (`Synced` vs. `Live` State)

Right now, the top box in your first screenshot (`REQUIRED MONOPOSTO IN-GAME CHANGES BEFORE NEXT RACE`) is useless because the app only stores one set of numbers. It has no idea whether you have opened Monoposto and updated the sliders or not.

**How to make it actually work (`engine/store.js` & `views/MatrixView.js`):**

1. Store **two** snapshots for all 12 teams and 24 drivers in `store.js`:

    - **`monopostoSynced`:** The exact `1–10` integers currently set inside your Monoposto mobile app (`carPower`, `driver1Speed`, `driver1Risk`, `driver2Speed`, `driver2Risk`). At the start of a new save, `monopostoSynced` equals the starting baseline.

    - **`liveTarget`:** The newly calculated `1–10` integers produced after R&D upgrades complete, AI teams level up, or driver form/risk shifts.

2. **Automatic Diff Detection:**

    - Before every race, the app compares `liveTarget` against `monopostoSynced` across all 12 teams.

    - If `Apple Porsche` reaches `6.00` (`liveTarget.carPower = 6`) while `monopostoSynced.carPower` is still `5`, or if `Valtteri Bottas` drops from `Speed 8` to `Speed 7`, the box turns **Amber/Red** and lists each pending change as a checklist row:

        - `[ ] APPLE PORSCHE — Car Power: 5 → 6 (Underfloor &amp; Sidepods fitted)`

        - `[ ] V. BOTTAS (Cadillac) — Driver Speed: 8 → 7 (Cold Streak: 3 races outside target)`

        - `[ ] I. HADJAR (Red Bull) — Driver Risk: 8 → 9 (Teammate H2H Pressure)`

3. **The `[✓ Confirm Applied in Monoposto]` Button:**

    - Each row has a checkbox, plus a master **`[✓ MARK ALL APPLIED IN MONOPOSTO]`** button at the bottom of the panel.

    - Clicking that button copies `liveTarget` into `monopostoSynced`. Only then does the box return to green (`"All 12 teams &amp; 24 drivers in Monoposto match the tracker"`). It will never nag you about Bottas or Car Power again until a new change occurs.

### 2\. Cleaning Up the 4 Top Filter Buttons on the Matrix Screen (`13595.png`)

In your third screenshot (`13595.png`), the four pill buttons above the table (`ALL 12 TEAMS`, `MONOPOSTO 1-10 SLIDERS`, `R&amp;D DEVELOPMENT PROGRESS`, `BASELINE DEV GRAPH -&gt;`) are currently redundant. Instead of deleting them, turn the first three into **distinct table views** on that same screen:

1. **`[ALL 12 TEAMS]` (Default Broadcast Matrix):** Shows the full overview table you have right now.

2. **`[MONOPOSTO 1-10 SLIDERS]` (Quick Game-Setup Sheet):**

    - Strips away all percentages and clutter. Shows a clean, 12-row table with **only the 5 integer sliders you enter in Monoposto**: `Team Car Power (1–10)`, `Driver 1 SPD (1–10)`, `Driver 1 RSK (1–10)`, `Driver 2 SPD (1–10)`, `Driver 2 RSK (1–10)`.

    - Any number that changed since the last race is highlighted in bright green/red with its old value crossed out (`5 → 6`), plus the **`[✓ Confirm Synced]`** button right at the top.

3. **`[R&amp;D DEVELOPMENT PROGRESS]` (12-Team Engineering Spy Table):**

    - Shows what all 12 teams are doing in the background: **Facility Phase (`Phase 1 / 2 / 3`)**, **ATR Wind Tunnel Multiplier (`70%` to `115%`)**, **Weekly DP Rate**, **Current True Power (`e.g., 6.45`)**, **Active Upgrade in Queue**, and **Season-2 Regulation Protection (`%`)**.

4. **`[BASELINE DEV GRAPH -&gt;]`:** Jumps to the horizontal bar chart screen.

### 3\. Rebalancing R&D Speed (`+1.0` to `+2.0` Per Season) & AI Team Background R&D

You spotted a major math flaw: if a team only goes from `4.85` to `5.10` (`+0.25`) over a whole season, Monoposto's integer slider literally never moves. In a 22-race season (38 calendar weeks), teams need to gain **\+1.00 to +2.20 Car Power** (`100` to `220 DP`) so every team jumps **1 to 2 integer levels** across the year.

At the same time, **Cadillac, Haas, or BMW cannot out-develop Mercedes, Ferrari, or Red Bull in Season 1**.

#### How the AI Background R&D Engine Works (`engine/aiRdEngine.js`):

Every Monday tick (`timeEngine.js`), all 11 AI teams generate **Weekly Development Progress (DP)** and complete background upgrades based on **three locked tiers** in Season 1:

| Constructor Tier                                                                         | Teams                                                                                    | Starting Power                                                                           | S1 Facility Phase                                                                        | Base Weekly DP Gain                                                                      | Expected S1 Total Gain (38 Wks)                                                          | S1 Peak Power Ceiling                                                                    |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Tier 1: Giants**                                                                       | Mercedes (`7.0`), Red Bull (`6.0`), Ferrari (`6.0`), McLaren (`6.0`)                     | `6.00 – 7.00`                                                                            | **Phase 3** (Extensive)                                                                  | `+4.2 to +5.0 DP/wk`                                                                     | **`+1.50 to +1.85` Power**                                                               | **`7.80 – 8.80`** (Integers `8` or `9`)                                                  |
| **Tier 2: Midfield & Works Newcomers**                                                   | Aston Martin (`5.0`), Williams (`5.0`), Audi (`5.0`), BYD (`5.0`), Apple Porsche (`5.0`) | `5.00`                                                                                   | **Phase 2** (Advanced)                                                                   | `+3.4 to +4.2 DP/wk`                                                                     | **`+1.25 to +1.55` Power**                                                               | **`6.25 – 6.55`** (Integer `6` or `7`)                                                   |
| **Tier 3: Backmarkers**                                                                  | Cadillac (`4.0`), Haas (`4.0`), BMW (`4.0`)                                              | `4.00`                                                                                   | **Phase 1** (Basic)                                                                      | `+2.5 to +3.2 DP/wk`                                                                     | **`+0.95 to +1.25` Power**                                                               | **`4.95 – 5.25`** (Integer `5`)                                                          |

- **Why this guarantees realism:**

    - Even if **Cadillac (`4.00`)** has a great season and gains `+1.20` Power, they finish Season 1 at **`5.20` (Integer `5`)**.

    - Meanwhile, **Ferrari (`6.00`)** and **Mercedes (`7.00`)** have Phase 3 facilities and higher budgets, finishing Season 1 at **`7.60 – 8.60` (Integer `8` or `9`)**.

    - A Tier 3 team can **only** close the gap to Tier 1 over **2 to 3 seasons** by upgrading its Facilities from Phase 1 \rightarrow Phase 2 \rightarrow Phase 3 and banking FIA ATR Wind Tunnel bonuses.

- **Rebalancing Player Part DP & Lead Times (`data/partsCatalog.js`):**

    - Reduce Research lead times from `35–85 days` down to **`10–21 days`**, and Manufacturing lead times to **`6–12 days`**.

    - Increase Part DP values (`+18` to `+35 DP` for core specs, `+10` to `+18 DP` for secondary nodes) so an active player researching and manufacturing parts consistently gains **`+1.40 to +2.00` Car Power** over the 22-race season.

### 4\. Making the FIA ATR Wind Tunnel Reset & Season-2 Regulation Reset Actually Work

Right now, the **FIA ATR Wind Tunnel Reset & Regulation Tracker** (`Round 7 Canada`, `Round 14 Netherlands`, `Round 16 Singapore`) is just a static countdown card. Here is how to wire it into the engine:

1. **Round 7 (Canada) & Round 14 (Netherlands) — Live ATR Sliding Scale:**

    - After Round 7 and Round 14 are logged, the engine reads the **Constructors' Championship Standings** and applies the official FIA Aerodynamic Testing Restriction (ATR) multiplier to **both Player Weekly RP and AI Weekly DP**:

        - **P1 Constructor:** `0.70x` (`-30%` R&D speed)

        - **P2–P4 Constructors:** `0.80x – 0.90x`

        - **P5–P8 Constructors:** `0.95x – 1.05x`

        - **P9–P12 Constructors:** `1.10x – 1.20x` (`+10% to +20%` R&D catch-up boost)

2. **Round 16 (Singapore) to Round 22 (Abu Dhabi) — Current Season vs. Next Season Regulation Reset:**

    - At Round 16 (Singapore), the FIA announces **Next Season's Technical Directive**—banning/resetting **25% to 35% of current aero/chassis specs** (`-1.50 Car Power` grid-wide drop at the end of the year so cars don't exceed `10/10` in Season 2).

    - From Round 16 to Round 22, both the Player and AI teams get an **R&D Allocation Toggle**:

        - **`Focus on 2026 Car (100% Current / 0% Next Season)`:** Keep pushing your 2026 Car Power for the current title fight, but suffer the full `-1.50 Car Power` regulation drop entering 2027.

        - **`Balanced Split (50% Current / 50% 2027 Spec Adaptation)`:** Halves your current-season R&D speed for the final 6 races, but shields `50%` of your upgrades (`only -0.75 drop` entering 2027).

        - **`Full 2027 Regulation Focus (0% Current / 100% 2027 Spec)`:** Freezes your 2026 car upgrades after Singapore, but carries **100% of your DP + a +0.30 launch bonus** into Season 2! That is how a midfield team like Audi or Porsche strategically jumps a top team entering Season 2.

3. **How the `Development Graph` (`1000164172.jpg`) Works in Season 2:**

    - In Season 1, the vertical white line is at `4.00`.

    - In Season 2+, each team's bar shows **two segments**: a **Solid Bar** for their **Season-Start Baseline** (where they started Day 1 of that season after the FIA regulation reset) and a **Bright Highlight Extension** showing how much Car Power (`+DP`) they have added *during the current season*, while the vertical white reference line marks the **Season's Minimum Grid Baseline**.

### 5\. Deterministic Driver `Speed (1–10)` & `Risk (1–10)` Evolution Engine

In Monoposto, `Speed (1–10)` is raw pace and `Risk (1–10)` controls dive-bombs and wheel-to-wheel aggression versus docile driving. Instead of random changes, run this exact evaluation after **every 3 races** (and whenever a #1 Priority Car upgrade imbalance occurs):

#### A. How `Driver Risk (1–10)` Changes Dynamically:

Every driver has a **Base Archetype Risk** in `teamsAndDrivers.js` (e.g., Champions/Aggressors like Verstappen `7`, Hamilton `6`, Leclerc `7`; Rookies like Hadjar `8`, Bearman `7`, Rossi `8`; Veterans like Hülkenberg `4`, Bottas `5`). Their **Live Risk** shifts between `Base - 2` and `Base + 2` (clamped `3` to `9`) based on 4 factual triggers:

1. **Championship Contender Desperation (`+1 Risk`):**

    - If a driver is in the **Top 4 of the Drivers' Standings** (or in a Car Power `7+` car) and trails the Championship Leader by `10 to 45 points` in the second half of the season, they go into **Title Attack Mode (`Risk +1`, up to `8–9`)**—taking aggressive dive-bombs in Monoposto.

2. **Teammate H2H & Contract Hot-Seat Pressure (`+1 Risk`):**

    - If a driver is losing the Qualifying/Race H2H to their teammate for **3 consecutive races**, OR falls under the **35% Teammate Points Rule (Hot Seat)**, their frustration/urgency spikes (`Risk +1`).

3. **Rookie / High-Risk Crash Cooldown (`-1 Risk`):**

    - If any driver with `Risk &gt;= 7` logs **2 DNFs/crashes in a 3-race span**, the Team Principal orders a **Telemetry Discipline Directive**, forcing their `Risk` down by **`-1` (toward `5–6`)** for the next 3 races so they drive cleanly and bank points.

4. **Comfortable Championship Lead (`-1 Risk`):**

    - If the P1 Championship Leader is ahead by `40+ points`, their `Risk` drops by **`-1` (down to `5–6`)** to bring the car home safely without dive-bombing.

#### B. How `Driver Speed (1–10)` Changes Dynamically:

1. **\#1 Priority Car Upgrade Edge (`+1 Speed` temporary):**

    - Whenever Car #1 has more manufactured upgrades fitted than Car #2 (or vice versa), that driver gets **`+1 Speed`** until the second car receives the part.

2. **Momentum Form (`Hot Streak +1` / `Slump -1`):**

    - Every team has an **Expected Finishing Position** based on its Car Power rank (`P1–P2` for Power 7, `P3–P8` for Power 6, `P9–P16` for Power 5, `P17–P22` for Power 4).

    - Finishing **3+ positions above car expectation for 3 straight races** triggers **`FORM: HOT STREAK (+1 Speed)`**.

    - Finishing **4+ positions below car expectation (or DNFing) for 3 straight races** triggers **`FORM: COLD SLUMP (-1 Speed)`**.

### 6\. Race Rewards (Prize Cash + Telemetry RP) & Fan Rating (Acclaim) System

Right now, logging a race in `RaceControlView.js` only logs points and basic sponsor goals. Add these three rewards to `raceSimulator.js` after every race:

1. **FIA Per-Race Prize Purse & Telemetry RP:**

    - **Constructor Points Bonus:** Every Championship point scored pays **`+$45,000` Cash** and **`+8 RP`** (so a P1 + P3 finish scoring 40 pts awards `+$1.80M` and `+320 RP` from race telemetry).

    - Finishing Position Purse (for Midfield/Backmarkers outside Top 10): Even if you finish P11–P22 with 0 points, FIA Travel & Classification Payouts award **`$350k` (P11) scaling down to `$120k` (P22)** plus **`+60 to +100 Telemetry RP`** for completing race distance (halved on a DNF).

2. **Fan Rating (`1` to `100`) Progression & Perks:**

    - **How Fan Rating Changes Each Race:**

        - Podium Finish (`P1 / P2 / P3`): **`+4 / +3 / +2 Fan Rating`**

        - Double Points Finish: **`+2 Fan Rating`**

        - Beating Expected Constructor Tier: **`+1 Fan Rating`**

        - Fastest Lap: **`+1 Fan Rating`**

        - Sponsor Weekend Objective Passed: **`+1 Fan Rating`**

        - Double DNF or finishing last on the grid: **`-2 Fan Rating`**

    - **What Fan Rating Actually Does in the Game:**

        - **Merchandise Weekly Income:** Adds **`+$10,000 × Fan Rating`** to your Monday `Base Income` tick (at Fan Rating `12` = `+$120k/wk`; at Fan Rating `50` = `+$500k/wk`).

        - **Driver Market Prestige Gate:** In the `Driver Contracts` screen, `Speed 8` drivers require **Fan Rating `25+`** to sign with your team, and `Speed 9` stars (Verstappen, Leclerc, Hamilton, Russell, Norris) require **Fan Rating `45+` AND Car Power `6+`**.

        - **Title Sponsor Tier Unlock:** Unlocks premium Season-2 Title Sponsors at Fan Rating `35+` and `60+`.

**One thing and this is importan**t- Currently, we lack a system for logging full driver results. Right now, we only have logging for the specific driver the player is using. For example, if I am using BMW, I can only record results for the drivers representing BMW, such as their finishing positions or what happened to them during the session. For all other drivers, you cannot see what is going on.

How are we supposed to calculate points without that data? We need to use the official F1 points system across the whole grid, for both the Drivers' and Constructors' Championships. Because of this, we need the option to log results for every team and driver present on the grid.

Over a race weekend, we also need the ability to:

1\. Log qualifying results for all drivers, including their lap times and their starting grid positions.

2\. Log race day results, including finishing times, gaps, and overall race outcomes for every driver.

Having this full data would allow us to properly track standings in both the Drivers' Championship and the Constructors' Championship.

Last but not least= ALSO you're putting this hard coded line of "WEISSACH" In each team's database which is problematic. Keep this line only in the database of porsche and replace it for others with these-

McLaren Formula 1 Team: Woking, Surrey, United Kingdom

\[Mercedes-AMG Petronas F1 Team]: Brackley, Northamptonshire, United Kingdom

\[Oracle Red Bull Racing]: Milton Keynes, Buckinghamshire, United Kingdom

\[Scuderia Ferrari]: Maranello, Modena, Italy

\[Williams Racing]: Grove, Oxfordshire, United Kingdom

Visa Cash App [RB F1 Team]: Faenza, Ravenna, Italy

\[Aston Martin Aramco F1 Team]: Silverstone, Northamptonshire, United Kingdom

\[MoneyGram Haas F1 Team]: Kannapolis, North Carolina, United States

\[Alpine F1 Team]: Enstone, Oxfordshire, United Kingdom

\[Audi F1 Team]: Hinwil, Zürich, Switzerland

[Cadillac F1 Team: Indianapolis, Indiana, United States

\[Porsche Motorsport]: Weissach, Baden-Württemberg, Germany

BYD Company Limited: Shenzhen, Guangdong, China



So for example: for BYD you keep Shenzhen, and similarly the first one of all the other teams.





### Copy-Paste Master Specification for Google AI Studio

Paste this prompt directly into Google AI Studio so Gemini implements all 6 systems cleanly into your existing files:

```
We now need to implement the **Full-Grid AI Simulation, Monoposto Slider Sync Tracker, Dynamic Driver Speed/Risk Engine, FIA ATR/Regulation Reset, and Fan Rating Economy**. Update the existing files with these 6 exact specifications:

### 1. TWO-STATE MONOPOSTO SLIDER DIFF & SYNC TRACKER (`engine/store.js` & `views/MatrixView.js`)
- Currently, the "REQUIRED MONOPOSTO IN-GAME CHANGES BEFORE NEXT RACE" box has no way of knowing if I actually updated the sliders in the Monoposto mobile game.
- In `store.js`, maintain `state.monopostoSynced` storing the last-confirmed integer values (`carPower`, `d1Speed`, `d1Risk`, `d2Speed`, `d2Risk`) for all 12 teams and 24 drivers.
- Compare the live calculated integer values against `state.monopostoSynced`. Whenever ANY team's integer Car Power or ANY driver's integer Speed/Risk differs from `monopostoSynced`, display an actionable checklist row in the "REQUIRED MONOPOSTO IN-GAME CHANGES" box (e.g., `BMW M IQOO: Car Power 4 → 5`, `M. Rossi: Risk 8 → 7 [Crash Cooldown]`) with individual `[✓ Applied]` buttons and a master `[✓ CONFIRM ALL APPLIED IN MONOPOSTO]` button that updates `monopostoSynced` and clears the alert.
- Make the 4 top filter pills in `MatrixView.js` functional view-switchers:
  1. `ALL 12 TEAMS`: Full broadcast matrix.
  2. `MONOPOSTO 1-10 SLIDERS`: Clean game-setup sheet showing ONLY the 1–10 integer values (`Synced` vs `New`) for all 12 teams & 24 drivers for fast copying into Monoposto.
  3. `R&D DEVELOPMENT PROGRESS`: 12-team R&D spy table showing each team's Facility Phase, ATR Multiplier (70%–120%), Weekly DP rate, True Fractional Power, and 2027 Regulation Protection %.
  4. `BASELINE DEV GRAPH →`: Navigates to the Dev Graph screen.

### 2. 11-TEAM AI BACKGROUND R&D ENGINE & REBALANCED PART CADENCE (`engine/aiRdEngine.js` & `data/partsCatalog.js`)
- Rebalance `partsCatalog.js` lead times (`10–21d` research, `6–12d` manufacture) and DP values (`+15 to +30 DP`) so active development yields `+1.20 to +2.00 Car Power` over a 22-race season.
- On every Monday tick in `timeEngine.js`, run `tickAiTeamsRd(state)` so all 11 non-player teams develop their cars in the background according to 3 realistic tiers (preventing backmarkers from out-developing giants in Season 1):
  - **Tier 1 Giants (Mercedes 7.0, Red Bull 6.0, Ferrari 6.0, McLaren 6.0):** Phase 3 Facilities, gain `+4.0 to +4.8 DP/week` (~`+1.50 to +1.80` Car Power across S1).
  - **Tier 2 Midfield/Works (Aston Martin, Williams, Audi, BYD, Porsche at 5.0):** Phase 2 Facilities, gain `+3.3 to +4.0 DP/week` (~`+1.25 to +1.50` Car Power across S1).
  - **Tier 3 Backmarkers (Cadillac, Haas, BMW at 4.0):** Phase 1 Facilities, gain `+2.5 to +3.2 DP/week` (~`+0.95 to +1.20` Car Power across S1).
- Also allow AI teams to slowly upgrade their Facility Phase at mid-season and end-of-season based on Constructor Standings prize money.

### 3. FUNCTIONAL FIA ATR WIND TUNNEL RESETS (R7 & R14) & S2 REGULATION RESET (R16–R22)
- Make the "FIA ATR WIND TUNNEL RESET & REGULATION TRACKER" panel interactive and functional:
  - At **Round 7 (Canada)** and **Round 14 (Netherlands)**, automatically recalculate every team's ATR Multiplier based on Constructor Standings: P1 gets `70%` RP/DP multiplier, scaling linearly up to P12 getting `120%` RP/DP multiplier.
  - At **Round 16 (Singapore)**, unlock the **Next-Season Regulation Adaptation Slider** (`100% Current Season`, `50/50 Balanced`, or `100% Next-Season Focus`) for the player and AI teams.
  - At the end of Round 22 (Abu Dhabi), trigger the **End-of-Season Regulation Reset (`-1.50 Car Power` base cut across the grid, reduced by how much each team invested in Next-Season Regulation Protection between R16 and R22)** so Car Power stays balanced within the `4.00–9.00` range for Season 2, and update `DevGraphView.js` to show `Season-Start Baseline` vs `Current Season Gain`.

### 4. DETERMINISTIC 24-DRIVER SPEED & RISK EVOLUTION (`engine/driverMarketEngine.js` & `engine/raceSimulator.js`)
- Expand the Race Control result logger so I can log or auto-simulate the full 24-driver classification (and DNFs) for each Grand Prix.
- After every race, update driver Form (`Speed 1–10`) and Aggression (`Risk 1–10`) across all 24 drivers using deterministic rules:
  - **Risk (+1 Aggression, max 9):** Triggered if a title contender trails P1 by 10–45 pts in the second half of the season, OR if a driver loses Teammate H2H 3 races in a row / falls under the 35% Teammate Points Hot-Seat rule.
  - **Risk (-1 Cooldown, min 3):** Triggered if a high-risk driver (`Risk >= 7`) suffers 2 DNFs in 3 races (Team Principal orders clean driving), OR if the championship leader holds a 40+ point lead.
  - **Speed (+1 Hot Streak / -1 Cold Slump, clamped 1–10):** Finishing 3+ places above car tier expectation for 3 races grants `+1 Speed`; finishing 4+ places below expectation or DNFing for 3 races applies `-1 Speed`.

### 5. INTERACTIVE CONTRACT RADAR & DRIVER MARKET (`views/DriverMarketView.js`)
- Make the Contract Radar cards on the Matrix screen and the Driver Market view interactive: allow clicking any driver to inspect their contract, H2H record, retirement risk, and—when the R12 (Spa) or R22 (Abu Dhabi) contract window is open—let the player negotiate contracts or sign replacements from eligible drivers and the F2 Reserve Pool.

### 6. RACE WEEKEND PRIZE PURSE, TELEMETRY RP & FAN RATING SYSTEM (`engine/raceSimulator.js`)
- Award per-race FIA Prize Cash & Telemetry RP based on finishing positions (`+$45k` & `+8 RP` per championship point, plus `$120k–$350k` & `+60–100 RP` base classification payout for finishes outside the Top 10).
- Update **Fan Rating (1–100)** after every race (`+2 to +4` for podiums, `+2` for double points, `+1` for beating tier expectation or Fastest Lap, `-2` for double DNF).
- Wire Fan Rating into the economy: add `+$10k × Fan Rating` to weekly Monday Base Income (Merchandise revenue) and require minimum Fan Rating thresholds (`25+` for Speed 8 drivers, `45+` for Speed 9 star drivers) in Driver Contract negotiations.
```

