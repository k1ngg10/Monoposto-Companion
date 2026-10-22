# Monoposto Companion — R&D Subcategory Browser, Develop Upgrade Page, F1 Advance Reticle & Delete Confirmation Plan

This plan adds a confirmation dialog before deleting a championship in the Settings menu, replicates the exact F1 game advancing circle/reticle from your reference video (`VID_20261022_202944_d5e52829.mp4`), and upgrades the R&D system into the three-stage F1 game workflow shown in your reference screenshots: **2×2 Department Hub** → **Department Subcategory Browser (`SELECT A PART TO RESEARCH`)** → **Dedicated Part Detail Screen (`DEVELOP UPGRADE`)**.

## User Review & Critical Decisions

> [!IMPORTANT]
> All choices confirmed in our clarification step and your reference video are locked in below:
> - **Confirmed Decision 1 (Department Subcategories & Parts)**: Group the existing parts into authentic, domain-specific F1 subcategories for each of the 4 departments and include the Chassis parts shown in your screenshots (`Weight Redistribution` and `Weight Reduction`) while preserving all core Spec 1/2/3 ladders and starter preset compatibility.
> - **Confirmed Decision 2 (Locked Upgrades Display)**: Upgrades locked behind an unresearched prerequisite render as dark **`UNKNOWN UPGRADE`** cards in the subcategory row and as **`[?]`** nodes in the compact subcategory progress strips below until their prerequisite is researched.
> - **Confirmed Decision 3 (Delete Championship Confirmation)**: Clicking **Delete championship…** in the header Settings menu opens an in-app confirmation modal with **Cancel** and **Delete Championship** buttons before wiping the save.
> - **Confirmed Decision 4 (Exact F1 Video Advancing Circle / Reticle)**: Replicate the exact advancing circle from your video (`VID_20261022_202944_d5e52829.mp4`): a crisp dark inner circle with a clean white circular ring outline inside a thin dark outer ring track, surrounded by an outer green gradient arc wedge that sweeps smoothly 360° clockwise once per simulated day (incrementing the date each time the green sweep completes a revolution at 12 o'clock), with zero oval distortion or weird borders.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. Protects the user's career save from accidental deletion with a confirmation dialog when clicking **Delete championship…** in Settings.
  2. Rebuilds the HQ advancing circle (`#ring`) to match your reference video: an outer green glowing sweep wedge with a fading tail rotates smoothly 360° clockwise around the white-ringed dark center circle, advancing the calendar by 1 day on each full 12-o'clock revolution while events slide up the vertical timeline line.
  3. Splits R&D navigation into three distinct screens matching the F1 game:
     - **Screen 1 — 2×2 Department Overview Hub**: Select from `AERODYNAMICS`, `CHASSIS`, `POWERTRAIN`, or `DURABILITY`.
     - **Screen 2 — Subcategory Browser (`SELECT A PART TO RESEARCH`)**: Browse a department's domain-specific subcategories via the left vertical subcategory spine (`^` / `v` switcher) and lower progress strips (`[✓]-[✓]-[ ]-[?]`), showing a horizontal row of chamfered upgrade cards for the active subcategory.
     - **Screen 3 — Dedicated Part Detail Screen (`DEVELOP UPGRADE`)**: Clicking a part card opens a separate detail screen with the chamfered card + translucent specification box, horizontal calendar completion timeline, `UNLOCKS:` downstream preview, `VEHICLE PERFORMANCE COMPARISON` chart, and research/manufacture action controls.
- **Target Audience / Persona**: Monoposto career players who want an authentic F1 R&D tree browser, the exact F1 calendar-advancing sweep reticle, and safeguard against accidental save deletion.
- **Key Value**: Replicates the exact F1 game advancing sweep animation without weird borders, gives each department realistic F1 engineering subcategories without mixing unrelated parts together, and keeps part inspection on its own clean, dedicated page.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Settings → Delete Championship Confirmation Modal**:
   - Clicking the gear icon (`⚙`) → **Delete championship…** opens a sleek dark motorsport confirmation modal over the viewport:
     - **Heading**: `DELETE CHAMPIONSHIP?`
     - **Body**: Explains that deleting the current career permanently erases your team progress, R&D tree, and race results (suggesting JSON export first if desired).
     - **Actions**: **CANCEL** (closes modal safely) and **CONFIRM DELETE** (wipes the save and routes to Championship Creation).

2. **Exact F1 Video Advancing Circle (`ADVANCE` / `STOP ADVANCING`)**:
   - **Why It Looked Weird Before**: `.ring` (`38px × 38px`) was placed inside `.node .dot` (`34px × 34px`), squishing the circle into a distorted oval and causing the vertical timeline line and inner background to clip unevenly.
   - **Exact Video Design (`VID_20261022_202944_d5e52829.mp4`)**:
     - **Concentric Geometry (Perfect 1:1 Circle, No Weird Borders)**:
       - **Inner Core**: A dark circular disc (`#0b0d10`) with a crisp white circular ring border (`stroke: #ffffff`) centered on the vertical timeline axis, displaying the clean control glyph inside.
       - **Outer Ring Track**: A subtle thin dark-grey concentric circle around the inner core, with the subtle horizontal dashed tick on the left and the vertical timeline line extending strictly downward from the bottom of the outer ring (never cutting behind or through the circle).
       - **Clockwise Green Sweep Wedge (Active while Advancing)**: A thick outer ring band (`conic-gradient` mask / SVG sector outside the white inner ring) featuring a bright neon-green leading edge (`#24e058`) and a smooth fading green tail (~100° arc) that rotates smoothly 360° clockwise (`requestAnimationFrame` / linear angle `0deg → 360deg`).
       - **1 Revolution = 1 Day Sync**: Each full 360° clockwise sweep from 12 o'clock back to 12 o'clock advances the date by 1 day (e.g., `19th February` → `20th February`) while upcoming timeline items slide smoothly upward toward the circle.

3. **R&D Screen 1 → Screen 2 (`SELECT A PART TO RESEARCH` — Subcategory Browser)**:
   - Clicking any department in the 2×2 grid opens **`SELECT A PART TO RESEARCH`** for that department:
     - **Top Bar**: Department switcher tabs (`AERODYNAMICS`, `CHASSIS`, `POWERTRAIN`, `DURABILITY`), a **Back to R&D Hub** button, and the right-hand KPI header (`TOTAL UPGRADES`, `FAILURE CHANCE`, `SIMULTANEOUS UPGRADES`).
     - **Left Vertical Subcategory Spine**: A tall pill-shaped vertical switcher on the left edge of the card row with Up (`^`) and Down (`v`) buttons, the subcategory completion counter (e.g., `4/6`), and rotated uppercase title (e.g., `WEIGHT REDISTRIBUTION` or `WEIGHT REDUCTION`).
     - **Active Subcategory Part Row**: A horizontal row of chamfered upgrade cards belonging strictly to the selected subcategory:
       - **Completed / Fitted Cards**: Filled with the department's translucent accent gradient, top-right checkmark badge, part name, department label, and bottom status pill (`BOT | Completed`, `CAR 1`, `CAR 2`, or `BLUEPRINT READY`).
       - **Available Cards**: Dark chamfered card with the RP cost in the top-right corner (showing discounted RP + struck-through base RP when facility discounts apply), part title at bottom-left, and `Available` status pill beneath.
       - **Locked Downstream Cards**: Dark chamfered card titled **`UNKNOWN UPGRADE`** until its prerequisite part is researched.
     - **Lower Compact Subcategory Progress Strips**: Directly beneath the card row, each of the other subcategories in the department is rendered as a clickable horizontal strip showing its ratio badge (e.g., `6/8`, `4/5`) followed by connected square nodes:
       - `[✓]` (colored box with checkmark) for researched parts,
       - `[ ]` (outlined dark box) for available unresearched parts,
       - `[?]` (dark box with `?`) for locked downstream parts.
       - Clicking any lower strip (or clicking `^` / `v` on the vertical spine) immediately switches the active subcategory row.
     - **Bottom-Right Completion Preview**: Displays `COMPLETED` or `ESTIMATED COMPLETION` date range and the player team's progress bar.

4. **R&D Screen 2 → Screen 3 (`DEVELOP UPGRADE` — Dedicated Part Detail Page)**:
   - Clicking a part card in Screen 2 navigates to the separate **`DEVELOP UPGRADE`** screen:
     - **Left Column**:
       - **Two-Box Upgrade Inspector**: The chamfered part card on the left + the translucent detail box immediately to its right (Part Name, `Major/Minor - <Subcategory Name>`, technical description, RP cost, research/build days, and failure/correlation percentage).
       - **Horizontal Calendar Completion Timeline**: Displays the current date on the left, upcoming Grand Prix flags and dates along the horizontal line, and the `COMPLETE` date marker.
       - **Bottom Action Boxes**: Research approach cards (`Standard`, `Aggressive`, `Conservative`) when researching, or Car-Specific Manufacturing cards (`Car #1`, `Car #2`, `Both Cars`) when the blueprint is ready, plus a **Back** button returning to Screen 2 (`SELECT A PART TO RESEARCH`).
     - **Right Column**:
       - **`UNLOCKS:` Panel**: Lists the downstream part(s) unlocked by researching this upgrade (or states `Final tier upgrade in this branch` if terminal).
       - **`VEHICLE PERFORMANCE COMPARISON`**: The 12-team horizontal bar chart with the dashed vertical baseline line at `4.00` and the player team's green projected gain bar.

### Domain-Specific Subcategories by Department

Every department has its own authentic F1 engineering subcategories (no shared or repeated subcategory names across departments):

- **CHASSIS (3 Subcategories)**:
  1. `Weight Redistribution`: Plank Construction, Intercooler Positioning, Hydraulics, Floor Undertray (Distribution), Energy Store Cells Positioning, Fuel Tank Positioning.
  2. `Weight Reduction`: Nose Structure, Lightweight Energy Store Cells, Engine Cover, Lightweight Wheel Rims, Floor Undertray, Lightweight Monocoque.
  3. `Braking & Suspension`: Brake Calipers, Brake Disc Width, Brake Pad Material, Roll Dampers, Rear Floor Undertray.
- **AERODYNAMICS (3 Subcategories)**:
  1. `Front Downforce`: Front Wing (Specs 1–3), Wing Mirrors, Front Wing Gurney Flap, Front Wing Adjuster Bracket, Front Wing Endplates.
  2. `Underbody & Airflow`: Underfloor (Specs 1–3), Sidepods (Specs 1–3), Sidepod Undercut & Inlets, Floor Stiffening Stays, Floor Edge Winglets, Venturi Underfloor Channels.
  3. `Rear Downforce & Drag`: Rear Wing (Specs 1–3), Rear Downforce Beam Wing, Low-Drag Active Aero Spec.
- **POWERTRAIN (3 Subcategories)**:
  1. `Internal Combustion (ICE)`: Air Filter, Spark Plugs, Piston Rings, Pistons.
  2. `Energy Recovery (ERS / MGU-K)`: 2026 Hybrid PU & MGU-K (Specs 1–3), Stators, ECU.
  3. `Turbo & Fuel Systems`: Wastegate Actuator, Fuel Injection.
- **DURABILITY (2 Subcategories)**:
  1. `Power Unit Reliability`: ES Cooling, ICE Durability, MGU-K & Turbo Bearings.
  2. `Gearbox & Control Systems`: General Wear Parts, Control Electronics, Gearbox Internals.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Exact F1 Video Outer Green Sweep Ring (`1 Revolution = 1 Day`)**
  - *Chosen Approach*: Remove the old `div.dot > div.ring` wrapper that squished the circle and replace it with a dedicated `52×52` 1:1 circular reticle assembly where the outer green gradient arc (`conic-gradient(from 260deg, transparent 0deg, rgba(24,224,88,0.15) 35deg, #18e058 100deg, transparent 101deg)`) is masked strictly to the outer ring annulus (`mask: radial-gradient(...)`) and rotated smoothly via `transform: rotate(calc(var(--angle, 0) * 1deg))` in `requestAnimationFrame`, while the inner circle has a crisp white ring border and dark core.
  - *Why*: Matches the exact visual appearance and motion in `VID_20261022_202944_d5e52829.mp4` with zero border artifacts, zero oval squishing, and silky-smooth 60fps rotation synced to each day tick.
- **Decision 2: Three-State View Machine Inside R&D (`hub` → `subcategory` → `detail`)**
  - *Chosen Approach*: Maintain explicit view state (`rdScreen = 'hub' | 'subcategory' | 'detail'`, `selectedDeptId`, `selectedSubcatId`, `selectedPartId`) so clicking a department opens the Subcategory Browser (`SELECT A PART TO RESEARCH`), and clicking a part card opens the dedicated `DEVELOP UPGRADE` page with a clean Back button at each level.
  - *Why*: Matches the exact 3-screen hierarchy from your F1 game screenshots while keeping navigation instant.
- **Decision 3: In-App Confirmation Modal for Delete Championship**
  - *Chosen Approach*: Render an accessible, keyboard- and touch-friendly modal overlay before invoking `wipe()`.
  - *Why*: Prevents accidental career loss with a single misclick in the Settings menu and works reliably across desktop and mobile browsers without relying on blocked `window.confirm` popups.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        SITE HEADER SETTINGS MENU                           │
│  [Export Save]  [Import Save]  [Delete Championship…] ──► Confirm Modal    │
└──────────────────────────────────────────────────────────────┬─────────────┘
                                                               │ Confirm
                                                               ▼
                                                    wipe() + Route to #/start

┌────────────────────────────────────────────────────────────────────────────┐
│           EXACT F1 VIDEO ADVANCING RETICLE (`HqDashboardView`)             │
│         ╭───━━━───╮   <-- Outer green gradient sweep wedge (rotates 360°   │
│    ┄┄┄┄ │  ( ▶ )  │       clockwise per day; masked to outer annulus)      │
│         ╰────┬────╯   <-- Crisp white-ringed dark inner circle             │
│              │            + vertical timeline line below                   │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│                   R&D 3-SCREEN FLOW (ResearchDevView)                      │
├────────────────────────────────────────────────────────────────────────────┤
│  SCREEN 1: 2x2 DEPARTMENT HUB (`rdScreen === 'hub'`)                       │
│  ┌─────────────────────────┬─────────────────────────┐                     │
│  │ AERODYNAMICS            │ CHASSIS                 │                     │
│  ├─────────────────────────┼─────────────────────────┤                     │
│  │ POWERTRAIN              │ DURABILITY              │                     │
│  └─────────────────────────┴─────────────────────────┘                     │
│                                    │ Click Department                      │
│                                    ▼                                       │
│  SCREEN 2: SUBCATEGORY BROWSER (`rdScreen === 'subcategory'`)              │
│  ┌──────────┬───────────────────────────────────────────────────────────┐  │
│  │    ^     │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌─────────┐ │  │
│  │  4/6     │  │ PLANK      │ │ INTERCOOLER│ │ HYDRAULICS │ │ UNKNOWN │ │  │
│  │  WEIGHT  │  │ CONSTRUCT. │ │ POSITIONING│ │            │ │ UPGRADE │ │  │
│  │  REDIST. │  └────────────┘ └────────────┘ └────────────┘ └─────────┘ │  │
│  │    v     │    [Completed]    [Completed]    [Available]    [Locked]  │  │
│  └──────────┴───────────────────────────────────────────────────────────┘  │
│  Lower Subcategory Strips:                                                 │
│  [6/8 Weight Reduction]  [✓]-[✓]-[✓]-[✓]-[✓]-[✓]-[ ]-[?]                   │
│  [4/5 Braking & Susp.]   [✓]-[✓]-[✓]-[✓]-[?]                               │
│                                    │ Click Unlocked Part Card              │
│                                    ▼                                       │
│  SCREEN 3: DEVELOP UPGRADE PAGE (`rdScreen === 'detail'`)                  │
│  ┌───────────────────────────────────────┬──────────────────────────────┐  │
│  │ Left: Chamfered Card + Detail Box     │ Right Top: UNLOCKS:          │  │
│  │ Middle: Grand Prix Calendar Timeline  │ Right Bottom: VEHICLE        │  │
│  │ Bottom: Research / Manufacture Boxes  │ PERFORMANCE COMPARISON       │  │
│  └───────────────────────────────────────┴──────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Interactive Component & State Mapping

- **Settings Delete Modal**:
  - Clicking `#set-delete` closes the dropdown and opens `#delete-confirm-modal`.
  - Clicking `#confirm-delete-cancel` or the backdrop closes the modal without touching the save.
  - Clicking `#confirm-delete-yes` calls `wipe()`, resets `--team` color, closes the modal, and navigates to `#/start`.
- **F1 Advancing Reticle (`#ring` in `HqDashboardView.js` & `css/components.css`)**:
  - Clicking `#ctl` or `#go` activates `.is-advancing` on `#ring`.
  - During `requestAnimationFrame` in `HqDashboardView.js`, `--sweep-deg` rotates smoothly from `0deg` to `360deg` over `DAY_MS`; each time a revolution completes at 12 o'clock, `advanceOneDay(s)` fires and the date header updates seamlessly.
- **Subcategory Browser (`SELECT A PART TO RESEARCH`)**:
  - Clicking `^` or `v` on the left vertical spine cycles `selectedSubcatId` through the current department's subcategories.
  - Clicking any compact subcategory progress strip below jumps directly to that subcategory.
  - Clicking an unlocked part card sets `selectedPartId` and transitions `rdScreen` to `'detail'`.
- **Develop Upgrade Page (`DEVELOP UPGRADE`)**:
  - Displays the selected part's specification, RP discount math, calendar timeline with Grand Prix flags, `UNLOCKS:` downstream parts, and the 12-team `VEHICLE PERFORMANCE COMPARISON` chart.
  - Clicking **Back** returns to `rdScreen = 'subcategory'` with the current department and subcategory preserved.
