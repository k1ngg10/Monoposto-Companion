// AI R&D ENGINE — Background 11-Team R&D Simulation, FIA ATR Wind Tunnel Resets (R7 & R14),
// Round 16–22 Next-Season Technical Directive Spec Allocation, and Season 2 Rollover.
import { TEAMS, teamById } from '../data/teamsAndDrivers.js?v=20261022m';
import { engineeringPhase } from '../data/facilitiesCatalog.js?v=20261022m';

// Deterministic per-team weekly DP rates and upgrade queues by Constructor Tier
export const AI_TEAM_PROFILES = {
  // Tier 1: Giants (Phase 3 Facilities, +4.2 to +4.8 DP/wk -> +1.50 to +1.85 Car Power in S1)
  mercedes: { tier: 1, basePhase: 3, weeklyDp: 4.55, s1Ceiling: 8.80, defaultFocus: 'current', queue: ['Underfloor Spec 2', 'Front Wing Spec 2', 'MGU-K Stators', 'Low-Drag Active Aero', 'Venturi Channels'] },
  redbull:  { tier: 1, basePhase: 3, weeklyDp: 4.65, s1Ceiling: 7.85, defaultFocus: 'current', queue: ['Underfloor Spec 2', 'Sidepod Undercut', '2026 Hybrid PU Spec 2', 'Rear Downforce Beam Wing', 'Lightweight Monocoque'] },
  ferrari:  { tier: 1, basePhase: 3, weeklyDp: 4.50, s1Ceiling: 7.80, defaultFocus: 'current', queue: ['Front Wing Spec 2', 'Sidepods Spec 2', 'Forged Pistons', 'Venturi Channels', 'Fuel Injection'] },
  mclaren:  { tier: 1, basePhase: 3, weeklyDp: 4.35, s1Ceiling: 7.75, defaultFocus: 'balanced', queue: ['Underfloor Spec 2', 'Front Wing Endplates', 'Floor Edge Winglets', 'Lightweight Wheel Rims', 'Roll Dampers'] },

  // Tier 2: Midfield & Works Newcomers (Phase 2 Facilities, +3.4 to +4.1 DP/wk -> +1.25 to +1.55 Car Power in S1)
  aston:    { tier: 2, basePhase: 2, weeklyDp: 3.85, s1Ceiling: 6.55, defaultFocus: 'balanced', queue: ['Front Wing Spec 1', 'Sidepods Spec 1', 'Underfloor Spec 2', 'Brake Pad Material', 'Wastegate Actuator'] },
  williams: { tier: 2, basePhase: 2, weeklyDp: 3.65, s1Ceiling: 6.45, defaultFocus: 'balanced', queue: ['Underfloor Spec 1', 'Rear Wing Spec 1', 'Floor Stiffening Stays', 'Engine Cover', 'Gearbox Internals'] },
  audi:     { tier: 2, basePhase: 2, weeklyDp: 3.80, s1Ceiling: 6.50, defaultFocus: 'next',     queue: ['2026 Hybrid PU Spec 1', 'Air Filter', 'Piston Rings', 'Stators', 'Underfloor Spec 2'] },
  byd:      { tier: 2, basePhase: 2, weeklyDp: 3.45, s1Ceiling: 6.35, defaultFocus: 'balanced', queue: ['Wing Mirrors', 'Front Wing Spec 1', 'Lightweight ES Cells', 'ES Cooling', 'Sidepods Spec 2'] },
  porsche:  { tier: 2, basePhase: 2, weeklyDp: 3.90, s1Ceiling: 6.55, defaultFocus: 'next',     queue: ['2026 Hybrid PU Spec 1', 'Underfloor Spec 1', 'Plank Construction', 'Sidepods Spec 2', 'Stators'] },

  // Tier 3: Backmarkers (Phase 1 Facilities, +2.6 to +3.1 DP/wk -> +0.95 to +1.22 Car Power in S1)
  cadillac: { tier: 3, basePhase: 1, weeklyDp: 2.85, s1Ceiling: 5.22, defaultFocus: 'next',     queue: ['Wing Mirrors', 'Plank Construction', 'Brake Calipers', 'Front Wing Spec 1', 'Underfloor Spec 1'] },
  haas:     { tier: 3, basePhase: 1, weeklyDp: 2.75, s1Ceiling: 5.18, defaultFocus: 'balanced', queue: ['Plank Construction', 'Nose Structure', 'Air Filter', 'Rear Wing Spec 1', 'Sidepods Spec 1'] },
  bmw:      { tier: 3, basePhase: 1, weeklyDp: 3.05, s1Ceiling: 5.25, defaultFocus: 'next',     queue: ['Front Wing Spec 1', 'Spark Plugs', 'Control Electronics', 'Underfloor Spec 1', 'Engine Cover'] }
};

// Official FIA ATR Wind Tunnel & CFD Multiplier scale by Constructors' Championship rank (P1 -> P12)
export const ATR_SCALE_BY_POS = [
  0.70, // P1: 70% (-30% R&D speed)
  0.75, // P2: 75%
  0.80, // P3: 80%
  0.85, // P4: 85%
  0.90, // P5: 90%
  0.95, // P6: 95%
  1.00, // P7: 100%
  1.04, // P8: 104%
  1.08, // P9: 108%
  1.12, // P10: 112%
  1.16, // P11: 116%
  1.20  // P12: 120% (+20% catch-up boost)
];

export const REG_FOCUS_MODES = {
  current: {
    id: 'current',
    label: '100% Current Car Focus',
    short: '100% Current / 0% Next Spec',
    currentShare: 1.0,
    nextShare: 0.0,
    launchBonusDp: 0,
    desc: 'All weekly R&D and wind-tunnel output goes into current-season Car Power. Suffers the full −1.20 Car Power FIA Technical Directive part ban entering next season.'
  },
  balanced: {
    id: 'balanced',
    label: '50/50 Balanced Spec Split',
    short: '50% Current / 50% Next Spec',
    currentShare: 0.5,
    nextShare: 0.5,
    launchBonusDp: 10,
    desc: 'Splits R&D 50/50 between current-season upgrades and next-season Technical Directive adaptation, shielding ~50% of banned-part losses (+0.10 launch bonus).'
  },
  next: {
    id: 'next',
    label: '100% Next-Season Spec Focus',
    short: '0% Current / 100% Next Spec',
    currentShare: 0.0,
    nextShare: 1.0,
    launchBonusDp: 30,
    desc: 'Freezes current-season Car Power upgrades after Round 16 to channel 100% of wind-tunnel RP/DP into next season, fully shielding part bans and granting a +0.30 Car Power launch bonus.'
  }
};

export function ensureAiState(state) {
  if (!state) return;
  if (!state.season) state.season = 1;
  if (!state.seasonHistory) state.seasonHistory = [];
  if (!state.teamDp || typeof state.teamDp !== 'object') state.teamDp = {};
  if (!state.seasonStartPower || typeof state.seasonStartPower !== 'object') {
    state.seasonStartPower = {};
    for (const t of TEAMS) state.seasonStartPower[t.id] = t.carPower;
  }
  if (!state.regFocus) state.regFocus = 'current';
  if (typeof state.nextSeasonDpBank !== 'number') state.nextSeasonDpBank = 0;
  if (!state.atrHistory) state.atrHistory = [];

  if (!state.aiTeams || typeof state.aiTeams !== 'object') {
    state.aiTeams = {};
  }

  for (const t of TEAMS) {
    const prof = AI_TEAM_PROFILES[t.id] || { tier: 2, basePhase: 2, weeklyDp: 3.5, s1Ceiling: t.carPower + 1.4, defaultFocus: 'balanced', queue: ['Aero Package'] };
    if (typeof state.teamDp[t.id] !== 'number') state.teamDp[t.id] = 0;
    if (!state.aiTeams[t.id]) {
      // Initial pre-Round-7 ATR multiplier by baseline Car Power tier
      const initAtr = t.carPower >= 7 ? 0.85 : t.carPower === 6 ? 0.92 : t.carPower === 5 ? 1.02 : 1.12;
      state.aiTeams[t.id] = {
        teamId: t.id,
        tier: prof.tier,
        facilityPhase: prof.basePhase,
        weeklyDpBase: prof.weeklyDp,
        atrMult: initAtr,
        regFocus: 'current',
        nextSeasonDpBank: 0,
        upgradeIdx: 0,
        upgradeProg: 0,
        activeUpgrade: prof.queue[0]
      };
    }
  }
  // Keep player team's facility phase in sync with their actual Engineering facility branch
  if (state.aiTeams[state.teamId]) {
    state.aiTeams[state.teamId].facilityPhase = engineeringPhase(state);
    state.aiTeams[state.teamId].regFocus = state.regFocus || 'current';
  }
}

export function loggedRoundsCount(state) {
  return Object.keys(state?.results || {}).length;
}

export function isRegAdaptationUnlocked(state) {
  return loggedRoundsCount(state) >= 15 || (state?.date && state.date >= '2026-10-05');
}

// Protection percentage (0% to 100%) against the -1.20 Car Power (120 DP) annual FIA Technical Directive part ban
export function regulationProtectionPct(state, teamId) {
  ensureAiState(state);
  const bank = teamId === state.teamId
    ? (state.nextSeasonDpBank || 0)
    : (state.aiTeams[teamId]?.nextSeasonDpBank || 0);
  return Math.min(100, Math.round((bank / 90) * 100));
}

// Executed every Monday tick in timeEngine.js
export function tickAiTeamsRd(state) {
  ensureAiState(state);
  const regOpen = isRegAdaptationUnlocked(state);
  const season = state.season || 1;

  for (const t of TEAMS) {
    const ai = state.aiTeams[t.id];
    const prof = AI_TEAM_PROFILES[t.id];
    if (!ai || !prof) continue;

    if (t.id === state.teamId) {
      ai.facilityPhase = engineeringPhase(state);
      ai.regFocus = state.regFocus || 'current';
      // If player selected Balanced or 100% Next-Season Focus after Round 16, bank next-season protection DP each Monday
      if (regOpen && state.regFocus !== 'current') {
        const mode = REG_FOCUS_MODES[state.regFocus] || REG_FOCUS_MODES.current;
        const playerPhase = engineeringPhase(state);
        const baseGen = playerPhase === 3 ? 14 : playerPhase === 2 ? 11.5 : 9.5;
        state.nextSeasonDpBank = +(state.nextSeasonDpBank + baseGen * mode.nextShare * (ai.atrMult || 1)).toFixed(1);
        ai.nextSeasonDpBank = state.nextSeasonDpBank;
      }
      continue;
    }

    // After Round 16 (Singapore), AI teams automatically adopt their strategic regulation focus
    // (Contenders in top 3 stay 'current' or 'balanced'; midfield/backmarkers shift to 'balanced' or 'next')
    if (regOpen && ai.regFocus === 'current' && prof.defaultFocus !== 'current') {
      ai.regFocus = prof.defaultFocus;
    }

    const mode = regOpen ? (REG_FOCUS_MODES[ai.regFocus] || REG_FOCUS_MODES.current) : REG_FOCUS_MODES.current;
    const phaseBoost = ai.facilityPhase === 3 ? 1.08 : ai.facilityPhase === 2 ? 1.0 : 0.92;
    const rawWeeklyDp = ai.weeklyDpBase * (ai.atrMult || 1.0) * phaseBoost;

    let currentDpGain = rawWeeklyDp * mode.currentShare;
    const nextDpGain = rawWeeklyDp * mode.nextShare * 3.1; // Scales across the 7 post-Singapore weeks toward 90 DP protection cap

    // Enforce Season 1 Constructor Tier Ceiling so Backmarkers (4.0) cannot overtake Giants (6.0-7.0) in Season 1
    const startBase = state.seasonStartPower?.[t.id] ?? t.carPower;
    const currentPower = startBase + (state.teamDp[t.id] || 0) / 100;
    const ceiling = season === 1 ? prof.s1Ceiling : Math.min(9.6, startBase + 1.95);

    if (currentPower + currentDpGain / 100 > ceiling) {
      currentDpGain = Math.max(0, (ceiling - currentPower) * 100);
    }

    state.teamDp[t.id] = +((state.teamDp[t.id] || 0) + currentDpGain).toFixed(2);
    if (regOpen) {
      ai.nextSeasonDpBank = +((ai.nextSeasonDpBank || 0) + nextDpGain).toFixed(1);
    }

    // Advance background upgrade queue label for the R&D Spy Table
    ai.upgradeProg = (ai.upgradeProg || 0) + rawWeeklyDp;
    if (ai.upgradeProg >= 26) {
      ai.upgradeProg -= 26;
      ai.upgradeIdx = ((ai.upgradeIdx || 0) + 1) % prof.queue.length;
      ai.activeUpgrade = prof.queue[ai.upgradeIdx];
    }
  }
}

// Recalculates FIA ATR Wind Tunnel Multipliers at Round 7 (Canada) and Round 14 (Netherlands)
// based on live Constructors' Championship Standings
export function recalculateAtrMultipliers(state, round, orderedConstructors) {
  ensureAiState(state);
  if (!Array.isArray(orderedConstructors) || !orderedConstructors.length) return null;

  const summary = [];
  orderedConstructors.forEach((entry, idx) => {
    const teamId = entry.team.id;
    const mult = ATR_SCALE_BY_POS[Math.min(idx, ATR_SCALE_BY_POS.length - 1)];
    if (state.aiTeams[teamId]) {
      state.aiTeams[teamId].atrMult = mult;
    }
    summary.push({ pos: idx + 1, teamId, teamName: entry.team.name, mult });
  });

  // Mid-season (Round 14) AI Facility Phase upgrade check for top-scoring Tier 2 / Tier 3 teams
  if (round === 14) {
    orderedConstructors.forEach((entry, idx) => {
      const teamId = entry.team.id;
      if (teamId === state.teamId) return;
      const ai = state.aiTeams[teamId];
      if (!ai) return;
      // If a Tier 3 team is inside the Top 8 by Round 14, or a Tier 2 team is inside the Top 4, they reinvest prize purse into +1 Facility Phase
      if (ai.facilityPhase === 1 && idx <= 8) ai.facilityPhase = 2;
      else if (ai.facilityPhase === 2 && idx <= 4) ai.facilityPhase = 3;
    });
  }

  state.atrHistory.push({ round, date: state.date, table: summary });
  return summary;
}

// Computes the End-of-Season FIA Technical Directive Part-Ban adjustment for all 12 teams
export function computeSeason2Preview(state) {
  ensureAiState(state);
  const DIRECTIVE_BASE_DROP = 1.20; // -1.20 Car Power from banned aero/underbody elements entering 2027
  const rows = TEAMS.map(t => {
    const startPower = state.seasonStartPower?.[t.id] ?? t.carPower;
    const dp = t.id === state.teamId ? (state.dpTotal || 0) : (state.teamDp[t.id] || 0);
    const endingPower = +(startPower + dp / 100).toFixed(2);
    const focusId = t.id === state.teamId ? (state.regFocus || 'current') : (state.aiTeams[t.id]?.regFocus || 'current');
    const mode = REG_FOCUS_MODES[focusId] || REG_FOCUS_MODES.current;
    const protPct = regulationProtectionPct(state, t.id);
    const mitigatedDrop = +(DIRECTIVE_BASE_DROP * (1 - (protPct / 100) * 0.85)).toFixed(2);
    const launchBonus = +(mode.launchBonusDp / 100).toFixed(2);
    const rawNextPower = endingPower - mitigatedDrop + launchBonus;
    // Clamp Season 2 starting baseline between 4.00 and 8.50
    const nextStartPower = +Math.max(4.00, Math.min(8.50, rawNextPower)).toFixed(2);
    const nextMonopostoInt = Math.floor(nextStartPower);

    return {
      team: t,
      startPower,
      endingPower,
      protPct,
      focusLabel: mode.short,
      mitigatedDrop,
      launchBonus,
      nextStartPower,
      nextMonopostoInt
    };
  }).sort((a, b) => b.nextStartPower - a.nextStartPower);

  return rows;
}
