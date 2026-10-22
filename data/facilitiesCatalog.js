// FACILITIES & STAFF — the F1 25/26 My Team Multi-Upgrade Phase System.
// 3 Main Branches (Engineering, Personnel, Corporate) × 3 Phases (Phase 1, 2, 3).
// Completing all sub-upgrades in Phase 1 of a branch advances that branch to Phase 2;
// completing all sub-upgrades in Phase 2 advances that branch to Phase 3.
// Reaching Phase 2 / Phase 3 in Engineering unlocks Phase 2 / Phase 3 R&D car parts.

// Built-in F1 garage/factory architectural SVG backdrops (can be replaced with Postimages URLs anytime).
const svgBackdrop = (accent, gridColor, label) =>
  `data:image/svg+xml;utf8,` + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="g1" cx="72%" cy="22%" r="75%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.26"/>
        <stop offset="55%" stop-color="#12141c" stop-opacity="0.88"/>
        <stop offset="100%" stop-color="#08090c" stop-opacity="1"/>
      </radialGradient>
      <linearGradient id="bay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1b1e28" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#090a0e" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#g1)"/>
    <g stroke="${gridColor}" stroke-opacity="0.14" stroke-width="2" fill="none">
      <path d="M0 160 L1600 160 M0 310 L1600 310 M0 680 L1600 680"/>
      <path d="M220 0 L80 900 M520 0 L440 900 M1080 0 L1160 900 M1380 0 L1520 900"/>
      <rect x="260" y="90" width="1080" height="520" rx="18" fill="url(#bay)" stroke-opacity="0.22"/>
      <line x1="360" y1="140" x2="680" y2="140" stroke="#ffffff" stroke-opacity="0.35" stroke-width="6"/>
      <line x1="920" y1="140" x2="1240" y2="140" stroke="#ffffff" stroke-opacity="0.35" stroke-width="6"/>
      <path d="M180 820 L480 620 L1120 620 L1420 820 Z" stroke="${accent}" stroke-opacity="0.28"/>
    </g>
    <text x="1540" y="860" text-anchor="end" fill="#ffffff" fill-opacity="0.04" font-family="sans-serif" font-weight="900" font-size="96" letter-spacing="12">${label}</text>
  </svg>`);

export const FACILITY_BACKDROPS = {
  hq: svgBackdrop('#e10600', '#60a5fa', 'MISSION CONTROL HQ'),
  engineering: svgBackdrop('#3b82f6', '#60a5fa', 'ENGINEERING & WIND TUNNEL'),
  personnel: svgBackdrop('#37e08b', '#34d399', 'SIMULATOR & HUMAN PERFORMANCE'),
  corporate: svgBackdrop('#f5c542', '#fbbf24', 'CORPORATE & HOSPITALITY')
};

export const FACILITY_BRANCHES = [
  {
    id: 'engineering',
    name: 'Engineering',
    subtitle: 'Wind Tunnel, CFD, Autoclaves & R&D Phase Unlocks',
    blurb: 'Controls R&D part phase access (Phase 1 → 2 → 3), Dual Build Slots per department, parallel research capacity, and D20 correlation calibration.',
    phases: [
      {
        phase: 1,
        title: 'Phase 1 — Foundation & Dual Bays',
        unlockNote: 'Complete all 4 Phase 1 upgrades to advance Engineering to Phase 2 and unlock Phase 2 R&D car parts.',
        nodes: [
          {
            id: 'eng_p1_aero_dual',
            name: 'Aero Dual Build Bay',
            cost: 1.8,
            days: 14,
            weeklyRp: 15,
            costPerWkM: 0.022,
            dualBuildDept: 'aero',
            effects: ['Unlocks Car #1 & #2 Dual Build for Aerodynamics', '+15 RP / week', '+$22k / wk running cost']
          },
          {
            id: 'eng_p1_chassis_dual',
            name: 'Chassis Dual Autoclave',
            cost: 1.8,
            days: 14,
            weeklyRp: 15,
            costPerWkM: 0.022,
            dualBuildDept: 'chassis',
            effects: ['Unlocks Car #1 & #2 Dual Build for Chassis', '+15 RP / week', '+$22k / wk running cost']
          },
          {
            id: 'eng_p1_wt_cal',
            name: 'Wind Tunnel Scale Calibration',
            cost: 2.2,
            days: 18,
            weeklyRp: 20,
            costPerWkM: 0.024,
            d20Bonus: { aero: 1, chassis: 1, powertrain: 0, durability: 0 },
            effects: ['+1 D20 correlation on Aero & Chassis research', '+20 RP / week', '+$24k / wk running cost']
          },
          {
            id: 'eng_p1_cad',
            name: 'CFD Cluster Node Expansion',
            cost: 2.0,
            days: 16,
            weeklyRp: 18,
            costPerWkM: 0.020,
            manufCostDiscount: 0.10,
            effects: ['−10% part manufacturing cash cost', '+18 RP / week', '+$20k / wk running cost']
          }
        ]
      },
      {
        phase: 2,
        title: 'Phase 2 — Factory Expansion & Parallel R&D',
        unlockNote: 'Complete all 4 Phase 2 upgrades to advance Engineering to Phase 3 and unlock Phase 3 R&D car parts.',
        nodes: [
          {
            id: 'eng_p2_pt_dual',
            name: 'Powertrain & Durability Dual Testbeds',
            cost: 3.2,
            days: 21,
            weeklyRp: 16,
            costPerWkM: 0.020,
            dualBuildDepts: ['powertrain', 'durability'],
            effects: ['Unlocks Dual Build for Powertrain & Durability', '+16 RP / week', '+$20k / wk running cost']
          },
          {
            id: 'eng_p2_res_dual',
            name: 'Parallel Research Office',
            cost: 3.8,
            days: 24,
            weeklyRp: 16,
            costPerWkM: 0.022,
            researchSlots: 2,
            effects: ['2 Simultaneous R&D Research Slots', '+16 RP / week', '+$22k / wk running cost']
          },
          {
            id: 'eng_p2_qc_rig',
            name: '7-Post Dynamic QC Rig',
            cost: 3.5,
            days: 22,
            weeklyRp: 14,
            costPerWkM: 0.018,
            manufCostDiscount: 0.10,
            manufSlots: 2,
            d20Bonus: { aero: 1, chassis: 1, powertrain: 1, durability: 1 },
            effects: ['+1 D20 correlation all depts · 2 Parallel Build Jobs · −10% build cost', '+14 RP / week', '+$18k / wk running cost']
          },
          {
            id: 'eng_p2_wind_2',
            name: 'Rolling-Road 60% Wind Tunnel',
            cost: 4.2,
            days: 28,
            weeklyRp: 16,
            costPerWkM: 0.020,
            d20Bonus: { aero: 1, chassis: 1, powertrain: 1, durability: 1 },
            effects: ['+1 D20 correlation across all departments', '+16 RP / week', '+$20k / wk running cost']
          }
        ]
      },
      {
        phase: 3,
        title: 'Phase 3 — Works Championship Spec',
        unlockNote: 'Pinnacle factory infrastructure — maximizes correlation, build speed, and weekly RP generation.',
        nodes: [
          {
            id: 'eng_p3_res_tri',
            name: 'Advanced Simulation Research Wing',
            cost: 6.0,
            days: 30,
            weeklyRp: 22,
            costPerWkM: 0.028,
            researchSlots: 3,
            manufSlots: 3,
            effects: ['3 Simultaneous Research Slots & 3 Build Jobs', '+22 RP / week', '+$28k / wk running cost']
          },
          {
            id: 'eng_p3_rapid_fab',
            name: 'Additive Titanium Rapid Fab',
            cost: 5.5,
            days: 28,
            weeklyRp: 18,
            costPerWkM: 0.024,
            manufTimeDiscount: 0.35,
            effects: ['−35% part manufacturing build time', '+18 RP / week', '+$24k / wk running cost']
          },
          {
            id: 'eng_p3_wt_full',
            name: 'Full-Scale Cryogenic Wind Tunnel',
            cost: 7.0,
            days: 35,
            weeklyRp: 25,
            costPerWkM: 0.030,
            d20Bonus: { aero: 2, chassis: 2, powertrain: 2, durability: 2 },
            effects: ['+2 D20 correlation across all departments', '+25 RP / week', '+$30k / wk running cost']
          },
          {
            id: 'eng_p3_zero_defect',
            name: 'Zero-Defect Telemetry Link',
            cost: 5.8,
            days: 28,
            weeklyRp: 20,
            costPerWkM: 0.025,
            effects: ['Halves failed D20 RP fix penalty · Breakthrough grants +60% DP', '+20 RP / week', '+$25k / wk running cost']
          }
        ]
      }
    ]
  },
  {
    id: 'personnel',
    name: 'Personnel',
    subtitle: 'Race Simulator, Pit Crew Gantry & Human Performance',
    blurb: 'Accelerates R&D research timelines, prepares drivers via pre-race simulator acclimatisation, and reduces driver risk.',
    phases: [
      {
        phase: 1,
        title: 'Phase 1 — Telemetry & Pit Crew Rig',
        unlockNote: 'Complete all 3 Phase 1 upgrades to advance Personnel to Phase 2.',
        nodes: [
          {
            id: 'per_p1_sim',
            name: 'Driver-in-Loop Simulator Rig',
            cost: 1.5,
            days: 14,
            weeklyRp: 9,
            costPerWkM: 0.014,
            effects: ['Pre-race acclimatisation roll (D20 14+ → +1 Speed for weekend)', '+9 RP / week', '+$14k / wk running cost']
          },
          {
            id: 'per_p1_pit',
            name: 'Pit Crew Hydraulic Gantry',
            cost: 1.4,
            days: 12,
            weeklyRp: 9,
            costPerWkM: 0.014,
            effects: [' Pit stop consistency & +10% race RP bonus on double-classified finishes', '+9 RP / week', '+$14k / wk running cost']
          },
          {
            id: 'per_p1_fitness',
            name: 'Human Performance & Recovery Lab',
            cost: 1.6,
            days: 14,
            weeklyRp: 9,
            costPerWkM: 0.014,
            researchTimeDiscount: 0.05,
            effects: ['−5% R&D research duration across all departments', '+9 RP / week', '+$14k / wk running cost']
          }
        ]
      },
      {
        phase: 2,
        title: 'Phase 2 — 6-DOF Motion & Engineering Academy',
        unlockNote: 'Complete all 3 Phase 2 upgrades to advance Personnel to Phase 3.',
        nodes: [
          {
            id: 'per_p2_sim2',
            name: '6-DOF Motion Platform Telemetry',
            cost: 2.8,
            days: 20,
            weeklyRp: 7,
            costPerWkM: 0.011,
            effects: ['Upgrades simulator acclimatisation roll to D20 12+', '+7 RP / week', '+$11k / wk running cost']
          },
          {
            id: 'per_p2_academy',
            name: 'Engineering Graduate Academy',
            cost: 3.0,
            days: 22,
            weeklyRp: 7,
            costPerWkM: 0.011,
            researchTimeDiscount: 0.08,
            effects: ['−8% additional R&D research duration', '+7 RP / week', '+$11k / wk running cost']
          },
          {
            id: 'per_p2_med',
            name: 'Trackside Biometrics & Focus Unit',
            cost: 2.6,
            days: 18,
            weeklyRp: 6,
            costPerWkM: 0.011,
            effects: ['−1 Driver Risk in wet conditions', '+6 RP / week', '+$11k / wk running cost']
          }
        ]
      },
      {
        phase: 3,
        title: 'Phase 3 — Neural-Link Digital Twin',
        unlockNote: 'Elite driver & engineering operations center.',
        nodes: [
          {
            id: 'per_p3_sim3',
            name: 'Neural-Link Digital Twin Simulator',
            cost: 5.0,
            days: 28,
            weeklyRp: 15,
            costPerWkM: 0.020,
            driverRiskDelta: -1,
            effects: ['Permanent −1 Driver Risk for both team drivers', '+15 RP / week', '+$20k / wk running cost']
          },
          {
            id: 'per_p3_ops',
            name: '24/7 Mission Control Operations Room',
            cost: 4.8,
            days: 26,
            weeklyRp: 15,
            costPerWkM: 0.020,
            researchTimeDiscount: 0.10,
            effects: ['−10% additional R&D research duration', '+15 RP / week', '+$20k / wk running cost']
          },
          {
            id: 'per_p3_pit_elite',
            name: 'Sub-2.0s Automated Pit Training Bay',
            cost: 4.5,
            days: 25,
            weeklyRp: 12,
            costPerWkM: 0.018,
            effects: ['+2 Fan Rating on every podium finish', '+12 RP / week', '+$18k / wk running cost']
          }
        ]
      }
    ]
  },
  {
    id: 'corporate',
    name: 'Corporate',
    subtitle: 'Hospitality, Media Studio & Commercial Revenue',
    blurb: 'Boosts sponsor race-objective payouts, generates weekly commercial merchandise income, and grows team Fan Rating.',
    phases: [
      {
        phase: 1,
        title: 'Phase 1 — Media & Paddock Hospitality',
        unlockNote: 'Complete all 3 Phase 1 upgrades to advance Corporate to Phase 2.',
        nodes: [
          {
            id: 'cor_p1_media',
            name: 'Broadcast & Media Content Studio',
            cost: 1.4,
            days: 12,
            weeklyRp: 3,
            costPerWkM: 0.014,
            goalBonusBoost: 0.10,
            fanBonus: 2,
            effects: ['+10% sponsor race goal payouts · +2 Fan Rating', '+3 RP / week', '+$14k / wk running cost']
          },
          {
            id: 'cor_p1_hosp',
            name: 'Paddock Club Hospitality Suite',
            cost: 1.6,
            days: 14,
            weeklyRp: 3,
            costPerWkM: 0.014,
            goalBonusBoost: 0.15,
            effects: ['+15% sponsor race goal payouts (+25% total in Phase 1)', '+3 RP / week', '+$14k / wk running cost']
          },
          {
            id: 'cor_p1_merch',
            name: 'Global Team Store & Licensing Desk',
            cost: 1.5,
            days: 14,
            weeklyRp: 2,
            costPerWkM: 0.014,
            commercialWkM: 0.035,
            effects: ['+$35k / week commercial merchandise revenue', '+2 RP / week', '+$14k / wk running cost']
          }
        ]
      },
      {
        phase: 2,
        title: 'Phase 2 — Title Partner Hub & PR Shield',
        unlockNote: 'Complete all 3 Phase 2 upgrades to advance Corporate to Phase 3.',
        nodes: [
          {
            id: 'cor_p2_vip',
            name: 'VIP Brand Experience Center',
            cost: 2.8,
            days: 20,
            weeklyRp: 3,
            costPerWkM: 0.010,
            goalBonusBoost: 0.15,
            fanBonus: 4,
            effects: ['+15% sponsor race goal payouts · +4 Fan Rating', '+3 RP / week', '+$10k / wk running cost']
          },
          {
            id: 'cor_p2_pr',
            name: 'Crisis PR & Scandal Shield Desk',
            cost: 2.6,
            days: 18,
            weeklyRp: 2,
            costPerWkM: 0.010,
            effects: ['Scandal shield — protects Fan Rating from DNF penalties', '+2 RP / week', '+$10k / wk running cost']
          },
          {
            id: 'cor_p2_partner',
            name: 'Title Partner Activation Hub',
            cost: 3.0,
            days: 21,
            weeklyRp: 2,
            costPerWkM: 0.010,
            commercialWkM: 0.065,
            effects: ['+$65k / week commercial partner revenue', '+2 RP / week', '+$10k / wk running cost']
          }
        ]
      },
      {
        phase: 3,
        title: 'Phase 3 — Global Brand Campus',
        unlockNote: 'Maximum commercial monetization and sponsor goal multipliers.',
        nodes: [
          {
            id: 'cor_p3_campus',
            name: 'Global Brand Experience Campus',
            cost: 5.2,
            days: 28,
            weeklyRp: 10,
            costPerWkM: 0.015,
            goalBonusBoost: 0.10,
            fanBonus: 8,
            effects: ['+10% sponsor race goal payouts (+50% max) · +8 Fan Rating', '+10 RP / week', '+$15k / wk running cost']
          },
          {
            id: 'cor_p3_global',
            name: 'Global Esports & Documentary Syndicate',
            cost: 4.8,
            days: 26,
            weeklyRp: 10,
            costPerWkM: 0.015,
            commercialWkM: 0.110,
            effects: ['+$110k / week global media rights revenue', '+10 RP / week', '+$15k / wk running cost']
          },
          {
            id: 'cor_p3_board',
            name: 'Executive Boardroom & Cap Retention',
            cost: 5.0,
            days: 28,
            weeklyRp: 10,
            costPerWkM: 0.015,
            effects: ['−15% staff hiring costs', '+10 RP / week', '+$15k / wk running cost']
          }
        ]
      }
    ]
  }
];

export const branchById = id => FACILITY_BRANCHES.find(b => b.id === id);

export function allFacilityNodes() {
  const list = [];
  for (const b of FACILITY_BRANCHES) {
    for (const p of b.phases) {
      for (const n of p.nodes) {
        list.push({ ...n, branchId: b.id, branchName: b.name, phase: p.phase });
      }
    }
  }
  return list;
}

export const facilityNodeById = nodeId => allFacilityNodes().find(n => n.id === nodeId) || null;

export function hasFacilityNode(state, nodeId) {
  return Boolean(state?.facilityNodes && state.facilityNodes[nodeId]);
}

// Computes the current Phase (1, 2, or 3) and completion counts for a branch.
// Phase 1 = working on Phase 1 sub-upgrades (0..N built).
// Once 100% of Phase 1 sub-upgrades are built, the branch is in Phase 2!
// Once 100% of Phase 1 and Phase 2 sub-upgrades are built, the branch is in Phase 3!
export function branchPhaseInfo(state, branchId) {
  const b = branchById(branchId);
  if (!b) return { currentPhase: 1, phase1Done: false, phase2Done: false, phase3Done: false, builtCount: 0, totalCount: 0 };
  const p1 = b.phases.find(p => p.phase === 1).nodes;
  const p2 = b.phases.find(p => p.phase === 2).nodes;
  const p3 = b.phases.find(p => p.phase === 3).nodes;
  const p1Built = p1.filter(n => hasFacilityNode(state, n.id)).length;
  const p2Built = p2.filter(n => hasFacilityNode(state, n.id)).length;
  const p3Built = p3.filter(n => hasFacilityNode(state, n.id)).length;
  const phase1Done = p1Built === p1.length;
  const phase2Done = phase1Done && p2Built === p2.length;
  const phase3Done = phase2Done && p3Built === p3.length;
  const currentPhase = phase2Done ? 3 : phase1Done ? 2 : 1;
  return {
    branch: b,
    currentPhase,
    phase1Done,
    phase2Done,
    phase3Done,
    p1Built, p1Total: p1.length,
    p2Built, p2Total: p2.length,
    p3Built, p3Total: p3.length,
    builtCount: p1Built + p2Built + p3Built,
    totalCount: p1.length + p2.length + p3.length
  };
}

// Engineering branch phase (1, 2, or 3) gates Phase 2 and Phase 3 R&D car parts.
export function engineeringPhase(state) {
  return branchPhaseInfo(state, 'engineering').currentPhase;
}

// Sync legacy state.facilities { windtunnel, fabrication, simulator, corporate } from branch phases.
export function syncLegacyFacilities(state) {
  const eng = branchPhaseInfo(state, 'engineering').currentPhase;
  const per = branchPhaseInfo(state, 'personnel').currentPhase;
  const cor = branchPhaseInfo(state, 'corporate').currentPhase;
  state.facilities = {
    windtunnel: eng,
    fabrication: eng,
    simulator: per,
    corporate: cor
  };
  return state.facilities;
}

// Builds initial facilityNodes map for the 3 Start Wizard baselines:
// 'basic'     -> Phase 1 (0 sub-upgrades built: 113 RP/wk, $287k/wk running cost)
// 'advanced'  -> Phase 2 (all Phase 1 sub-upgrades built: 216 RP/wk, $459k/wk running cost)
// 'extensive' -> Phase 3 (all Phase 1 & 2 sub-upgrades built: 305 RP/wk, $602k/wk running cost)
export function initialFacilityNodes(level = 'basic') {
  const map = {};
  if (level === 'advanced' || level === 'extensive') {
    for (const n of allFacilityNodes()) {
      if (n.phase === 1) map[n.id] = true;
      if (level === 'extensive' && n.phase === 2) map[n.id] = true;
    }
  }
  return map;
}

export function hasDualBuild(state, deptId) {
  for (const n of allFacilityNodes()) {
    if (!hasFacilityNode(state, n.id)) continue;
    if (n.dualBuildDept === deptId) return true;
    if (Array.isArray(n.dualBuildDepts) && n.dualBuildDepts.includes(deptId)) return true;
  }
  return false;
}

export function maxResearchSlots(state) {
  let slots = 1;
  for (const n of allFacilityNodes()) {
    if (hasFacilityNode(state, n.id) && n.researchSlots) slots = Math.max(slots, n.researchSlots);
  }
  return slots;
}

export function maxManufactureSlots(state) {
  let slots = 1;
  for (const n of allFacilityNodes()) {
    if (hasFacilityNode(state, n.id) && n.manufSlots) slots = Math.max(slots, n.manufSlots);
  }
  return slots;
}

// Computes live weekly RP, running costs ($M/wk), commercial bonus ($M/wk), D20 bonus, and discounts.
export function facilityEconomyStats(state) {
  let weeklyRp = 113;           // Baseline Phase 1 weekly RP (~113 RP/wk)
  let runningCostM = 0.287;     // Baseline Phase 1 weekly running cost ($287k/wk)
  let commercialWkM = 0;
  let goalBonusBoost = 0;
  let researchTimeDiscount = 0;
  let manufCostDiscount = 0;
  let manufTimeDiscount = 0;
  const d20ByDept = { aero: 0, chassis: 0, powertrain: 0, durability: 0 };

  for (const n of allFacilityNodes()) {
    if (!hasFacilityNode(state, n.id)) continue;
    if (n.weeklyRp) weeklyRp += n.weeklyRp;
    if (n.costPerWkM) runningCostM += n.costPerWkM;
    if (n.commercialWkM) commercialWkM += n.commercialWkM;
    if (n.goalBonusBoost) goalBonusBoost += n.goalBonusBoost;
    if (n.researchTimeDiscount) researchTimeDiscount += n.researchTimeDiscount;
    if (n.manufCostDiscount) manufCostDiscount += n.manufCostDiscount;
    if (n.manufTimeDiscount) manufTimeDiscount += n.manufTimeDiscount;
    if (n.d20Bonus) {
      for (const k of Object.keys(d20ByDept)) d20ByDept[k] += (n.d20Bonus[k] || 0);
    }
  }
  return {
    weeklyRp: Math.round(weeklyRp),
    runningCostM: +runningCostM.toFixed(3),
    commercialWkM: +commercialWkM.toFixed(3),
    goalBonusBoost: +goalBonusBoost.toFixed(2),
    researchTimeMult: Math.max(0.60, +(1 - researchTimeDiscount).toFixed(2)),
    manufCostMult: Math.max(0.65, +(1 - manufCostDiscount).toFixed(2)),
    manufTimeMult: Math.max(0.50, +(1 - manufTimeDiscount).toFixed(2)),
    d20ByDept
  };
}

// Backwards-compatible FACILITIES export.
export const FACILITIES = FACILITY_BRANCHES;
export const facilityById = id => FACILITY_BRANCHES.find(f => f.id === id) || facilityNodeById(id);

// Staff (SPEC §6, Pillar 3). Tiers bought with cash; effects read by engines.
export const STAFF = [
  { id: 'td', name: 'Technical Director', tiers: [
    { tier: 2, cost: 8,  effect: '−15% research RP costs' },
    { tier: 3, cost: 16, effect: '−30% research RP costs' } ] },
  { id: 'aerohead', name: 'Head of Aerodynamics', tiers: [
    { tier: 2, cost: 6,  effect: '+15% DP on aero research passes' } ] },
  { id: 'raceeng', name: 'Race Engineer', tiers: [
    { tier: 2, cost: 4,  effect: '"Radio Calm-Down" — tempers driver temper events' } ] },
  { id: 'sporting', name: 'Sporting Director', tiers: [
    { tier: 2, cost: 6,  effect: 'D20 11+ appeal against FIA penalties' },
    { tier: 3, cost: 12, effect: 'Appeal + contract-window leverage' } ] }
];
export const staffById = id => STAFF.find(s => s.id === id);
