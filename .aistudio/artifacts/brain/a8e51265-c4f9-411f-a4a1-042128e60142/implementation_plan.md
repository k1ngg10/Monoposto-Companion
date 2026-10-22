# Monoposto Companion — Official Sponsor Logos, Circuit Maps, F1 R&D Hub & Baseline Performance Graph

This update replaces all custom-generated sponsor badges with the exact 4-sponsor rosters and official brand logos from your reference list, adds the 16 missing/updated circuit maps (including Bahrain), redesigns the R&D experience into the authentic F1 2×2 Department Hub + two-panel Upgrade Inspector, updates the Vehicle Performance Comparison graph with the vertical starting-baseline line, and fixes the Constructors' Championship row alignment for positions 10–12.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Synthesized Requirements from Reference Screenshots & Markdown**:
> - **R&D 2×2 Hub & Department Upgrade Inspector**: Clicking any of the 4 department tiles (`AERODYNAMICS`, `CHASSIS`, `POWERTRAIN`, `DURABILITY`) opens that department's dedicated **Research / Upgrade Inspector** screen where each part is listed separately (never mixing separate components) and rendered with the **left chamfered upgrade card** + **right translucent detail card** + **completion timeline strip** + **bottom action box** (with zero emojis).
> - **Vehicle Performance Comparison Graph**: Uses a vertical white baseline marker representing the season-start base performance (`Car Power 4.00`), where the lowest-speed starting cars (`Haas`, `Cadillac`, `BMW`) touch the baseline on Day 1 and extend past it to the right as upgrades are fitted.
> - **Official Sponsor Rosters & Logos**: Uses the exact 4 sponsors and logo URLs per team from your uploaded `Sponsors-for-site.md` (while keeping `Shell` and `General Motors` existing vector logos as instructed, and retaining `Apple Porsche`'s 4 official SVGs: `Apple Music`, `TAG Heuer`, `BOSS`, `Mobil 1`).
> - **Constructors' Championship List Alignment (Rows 10–12)**: Fixes the horizontal shift on 2-digit position numbers (`10`, `11`, `12`) so all 12 rows align on the same vertical grid as rows `1–9`.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Official Team Sponsor Boards & Logos**: Updates all 12 teams' 4-sponsor boards to match your exact list and official brand logo assets (removing all self-made SVG text badges), while preserving the inverse **Day 1 Signing Base vs. Weekly Cashflow** trade-offs across the 4 slots.
  2. **Complete 22-Round Track Map Coverage**: Integrates all 16 circuit `.webp` maps (`Bahrain`, `Saudi Arabia`, `Miami`, `Canada`, `Catalunya`, `Austria`, `Silverstone`, `Belgium`, `Hungary`, `Netherlands`, `Italy`, `Singapore`, `COTA`, `Brazil`, `Las Vegas`, and `Abu Dhabi`) so every race weekend displays the proper track layout.
  3. **Authentic F1 R&D Hub & Upgrade Inspector**: Replaces the flat table list with the F1 game's `Performance | R&D in Progress | Progress History` sub-navigation, the 2×2 color-coded Department Grid (`Aerodynamics`, `Chassis`, `Powertrain`, `Durability`), and the two-box Department Upgrade Inspector upon entering a department.
  4. **Baseline Vehicle Performance Comparison**: Implements the F1-style horizontal comparison chart with the vertical starting baseline line, available both alongside the R&D Hub and on the dedicated Dev Graph view.
  5. **Constructors' Standings Alignment Fix**: Gives position numerals a fixed tabular column width so positions `10`, `11`, and `12` line up cleanly with positions `1–9`.

---

## 2. User Experience & Visual Design

### A. F1 R&D Hub (2×2 Department Grid + Sub-Tabs)

![F1 R&D 2x2 Department Hub Reference](/public/assets/aistudio/Screenshot_2026-10-22-16-37-27-038_com.miui.gallery-edit_e9e0bc78.jpg)

- **Sub-Navigation Bar**: Clean F1-style segmented bar directly under the main navigation with three views (no controller `L2`/`R2` button prompts):
  - **Performance**: Displays the 2×2 Department Grid on the left and the **Vehicle Performance Comparison** chart on the right.
  - **R&D in Progress**: Displays active Step A (Research) and Step B (Manufacturing) tasks with completion dates, target debut Grand Prix, and Car #1 / Car #2 build controls for researched blueprints.
  - **Progress History**: Displays a chronological log of completed research blueprints, D20 correlation outcomes, and fitted car upgrades.
- **2×2 Department Tiles**:
  - **AERODYNAMICS**: Deep cobalt-blue gradient (`#005a9c` → `#002642`), bold white uppercase header, bottom-left part counter (`X/14`), and bottom-right circular progress ring.
  - **CHASSIS**: Olive/forest technical green gradient (`#2e3a1f` → `#161c0f`), bottom-left counter (`X/11`), and circular progress ring.
  - **POWERTRAIN**: Deep plum/magenta gradient (`#3d123a` → `#1c081b`), bottom-left counter (`X/9`), and circular progress ring.
  - **DURABILITY**: Amber/ochre gradient (`#4a3e12` → `#221c08`), bottom-left counter (`X/6`), and circular progress ring.

### B. Department Drill-Down — "RESEARCH UPGRADE" Inspector

![F1 Research Upgrade Inspector Reference](/public/assets/aistudio/Screenshot_2026-10-20-20-51-56-179_app.morphe.android.youtube-edit_50da2823.jpg)

- **Entering a Department**: Clicking any of the 4 department tiles opens that department's **Upgrade Inspector**.
- **Separate Part Selector Rail**: All distinct parts within that department (e.g., all 11 Chassis parts: `Brake Calipers`, `Plank Mounts`, `Engine Cover (Distribution)`, `Brake Disc Width`, `Floor Stay Positions`, `Roll Dampers`, `Brake Pad Material`, `Weight Reduction I`, `Weight Redistribution`, `Rear Floor Undertray`, `Lightweight Monocoque`) are listed as separate selectable component tiles organized by Phase 1, Phase 2, and Phase 3—never lumping different parts together.
- **Two-Box Upgrade Inspector Layout**:
  1. **Left Chamfered Upgrade Box**: White-bordered card with an angled top-left chamfer (`clip-path`), dark department-tinted interior, bold uppercase part name (`ENGINE COVER (DISTRIBUTION)`), department label (`CHASSIS`), and current Spec/Car fitment status. No emojis or artificial drawings.
  2. **Right Translucent Detail Box**: Frosted dark-slate glass card (`rgba(36, 39, 46, 0.86)`) displaying:
     - **Header**: Uppercase Part Name (`ENGINE COVER (DISTRIBUTION)`)
     - **Subtitle**: Tier & Engineering Category (e.g., `Minor - Phase 1 Chassis · +16 DP (+8 DP/car)`)
     - **Divider Line**
     - **Technical Description**: Full engineering explanation (`part.blurb`) plus prerequisite and Car #1 / Car #2 fitment status.
     - **Divider Line**
     - **Cost & Duration Row**: Resource Point cost (`650 RP`) on the left and duration (`13 DAYS` with a clean geometric SVG stopwatch icon) on the right.
  3. **Horizontal Completion Timeline Strip**: Connects the **Start Date** node on the left to the **COMPLETE** date marker in the middle, with a dashed projection line extending to the target **GRAND PRIX** round and date on the right.
  4. **Bottom Action Box**: Framed translucent action panel at the bottom left with the primary `Start Research` button (and Step B `Manufacture for Car #1 / Car #2 / Both Cars` buttons once the blueprint passes correlation).

### C. Vehicle Performance Comparison (Baseline Dev Graph)

![Vehicle Performance Comparison Reference](/public/assets/aistudio/Screenshot_2026-10-22-16-37-44-048_com.miui.gallery-edit_1bdbbf0c.jpg)

- **Vertical Baseline Line**:
  - Each of the 12 constructors has a dark horizontal bar track.
  - A crisp **vertical white baseline line** cuts across all 12 rows at the season's minimum base performance (`Car Power 4.00`, placed at `32%` of the bar track width).
  - Teams starting at `Car Power 4.00` (`Haas`, `Cadillac`, `BMW`) fill up to and touch the vertical white line on Day 1.
  - Faster starting teams (`5.00` to `7.00`) and teams that complete R&D upgrades extend to the right of the vertical white line as their true performance increases across the season.
  - Player's team bar is highlighted in electric blue / team color with bold uppercase team name on the right, while AI teams render in neutral silver-grey bars with their vertical team-color stripe (`|`) next to their name.

### D. Constructors' Championship Row Alignment (Rows 10–12)

- **Focused Selector Fix**: In `.mx-ctor-row` (`ChampionshipMatrixView.js` & `css/components.css`), the leading position `<span>` (`1` through `12`) receives a fixed `width: 24px; min-width: 24px; text-align: right; font-variant-numeric: tabular-nums; flex: none;` so that 2-digit rows (`10`, `11`, `12`) align their team logo and constructor name identically with 1-digit rows (`1–9`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Resolving Official Sponsor Logos & Contrasting Wells**
  - *Chosen Approach*: Map every team's 4 sponsors to the exact brands and URLs in `Sponsors-for-site.md` (resolving Wikipedia `/wiki/File:...` links to their direct `upload.wikimedia.org` image URLs so `<img>` tags load directly), keep `Shell` and `General Motors` local vector logos as requested, and pair each logo with an appropriate light or dark `.wz-sp-well` background so both dark-ink logos (`Oracle`, `INEOS`, `HP`, `OKX`, `Claude`, `Revolut`, `Qatar Airways`, `Allianz`, `Deutsche Bank`, `CATL`, `Tencent`) and white/colored logos are 100% legible.
  - *Why*: Eliminates all custom text-fallback SVGs while guaranteeing zero broken or invisible logos.
- **Decision 2: Zero Emojis Across the R&D Interface**
  - *Chosen Approach*: Replace all emoji markers (`🔬`, `🔧`, `⚡`, `🔒`) in the R&D views with clean geometric SVG line icons (stopwatch, calendar, blueprint node, lock) or clean typographic labels.
  - *Why*: Matches the authentic F1 broadcast/game telemetry aesthetic requested by the user.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        MONOPOSTO COMPANION DATA LAYER                      │
├──────────────────────────────────────┬─────────────────────────────────────┤
│Sponsors & Engines Catalog            │2026 Calendar & Track Maps           │
│• 12 Teams × 4 Official Sponsors      │• 22 Rounds                          │
│• Direct Wikimedia & Postimg Logos    │• 16 Updated .webp Circuit Maps      │
│• Inverse Base vs. Weekly Archetypes  │  (Bahrain, Saudi, Miami, Canada,    │
│                                      │   Spain, Austria, UK, Belgium, etc.)│
└──────────────────┬───────────────────┴──────────────────┬──────────────────┘
                   │                                      │
                   ▼                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           VIEW & INTERACTION LAYER                         │
├──────────────────────────┬──────────────────────────┬──────────────────────┤
│F1 R&D Hub & Inspector    │Vehicle Performance Graph │Championship Matrix   │
│• Sub-tabs: Performance / │• 12-Team Horizontal Bars │• Fixed 24px tabular  │
│  R&D in Progress /       │• Vertical White Baseline │  position column on  │
│  Progress History        │  at Car Power 4.00       │  .mx-ctor-row (1-12) │
│• 2×2 Department Grid     │• Player Highlight Bar +  │                      │
│• 2-Box Upgrade Inspector │  Right Team Color Swatch │                      │
│  + Completion Timeline   │                          │                      │
└──────────────────────────┴──────────────────────────┴──────────────────────┘
```

### Official 12-Team Sponsor Roster Mapping

| Team | Slot 1 (`HIGH BASE · LOW WEEKLY`) | Slot 2 (`HIGH RACE GOAL BONUS`) | Slot 3 (`BALANCED BASE & WEEKLY`) | Slot 4 (`LOWEST BASE · HIGHEST WEEKLY`) |
| :--- | :--- | :--- | :--- | :--- |
| **Haas** | Toyota Gazoo Racing (TGR) | Haas Automation | Play'n GO | Exein |
| **Red Bull** | Oracle | Ford | Mobil 1 | 1Password |
| **Mercedes** | Petronas | INEOS | Microsoft | Adidas |
| **Ferrari** | HP | Shell *(keep existing)* | UniCredit | PUMA |
| **McLaren** | Mastercard | OKX | Google Chrome | Gemini |
| **Aston Martin** | Aramco | Honda | Cognizant | JCB |
| **Williams** | Atlassian | Barclays | Claude | Duracell |
| **Audi** | Revolut | bp | NinjaOne | Qatar Airways |
| **Cadillac** | General Motors *(keep existing)* | TWG Motorsports | Tommy Hilfiger | IFS |
| **BMW** | iQOO | Shell *(keep existing)* | Allianz | Deutsche Bank |
| **BYD** | Huawei | CATL | Tencent | Lenovo |
| **Apple Porsche** | Apple Music | TAG Heuer | BOSS | Mobil 1 |

### Interactive Component & State Mapping
- **R&D Sub-Tab Switching (`Performance` / `R&D in Progress` / `Progress History`)**: Clicking a sub-tab updates `activeSubTab` and re-renders either the 2×2 Department Hub + Vehicle Performance Comparison, the live queue of active research/manufacturing tasks, or the completed upgrades log.
- **Department Selection & Part Inspector**: Clicking any of the 4 department cards sets `selectedDeptId` and opens the **Research Upgrade** inspector for that department. Clicking any separate part in the department's Phase 1 / 2 / 3 selector rail updates `selectedPartId`, refreshing the Left Chamfered Card, Right Translucent Detail Card, Completion Timeline Strip, and Bottom Action Box (`Start Research` for Step A, and `Manufacture Car #1 / Car #2 / Both` for Step B).
