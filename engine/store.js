// STORE — the live save state. Single source of truth for the career.
// Persists to localStorage; JSON export/import for backup (SPEC §1).
import { TEAMS, DRIVERS, RESERVE_DRIVERS, teamById, tierOf, ENTRY_TIERS, driversOfTeam, driverById, activeDrivers } from '../data/teamsAndDrivers.js?v=20261022m';
import { computeSponsorEconomy, puContractCost, puById, sponsorsOfTeam } from '../data/sponsorsAndEngines.js?v=20261022m';
import { initialFacilityNodes, syncLegacyFacilities, allFacilityNodes, hasFacilityNode } from '../data/facilitiesCatalog.js?v=20261022m';
import { initialPartsState, partById } from '../data/partsCatalog.js?v=20261022m';
import { ensureAiState, computeSeason2Preview } from './aiRdEngine.js?v=20261022m';

const KEY = 'monoposto-companion-save-v1';
let memoryFallback = null;

export const CASH_RESERVE_PRESETS = {
  none:        { id: 'none',        label: 'None',        cashM: 0,    desc: '+$0.00M — Start strictly with your Day 1 Sponsor Signing Cash minus Power Unit cost.' },
  some:        { id: 'some',        label: 'Some',        cashM: 5.0,  desc: '+$5.00M extra cash reserve added to your Day 1 bank balance.' },
  significant: { id: 'significant', label: 'Significant', cashM: 12.0, desc: '+$12.00M extra cash reserve added to your Day 1 bank balance.' }
};

export const FACILITY_BASELINE_PRESETS = {
  basic:     { id: 'basic',     label: 'Basic (Phase 1)',     phase: 1, weeklyRp: 113, costWkK: 287, desc: 'All 3 HQ branches start at Phase 1 (0 sub-upgrades built · ~113 RP/wk · $287k/wk cost).' },
  advanced:  { id: 'advanced',  label: 'Advanced (Phase 2)',  phase: 2, weeklyRp: 216, costWkK: 459, desc: 'Phase 1 100% completed across all 3 branches → starts at Phase 2 (~216 RP/wk · $459k/wk cost).' },
  extensive: { id: 'extensive', label: 'Extensive (Phase 3)', phase: 3, weeklyRp: 305, costWkK: 602, desc: 'Phases 1 & 2 100% completed across all 3 branches → starts at Phase 3 (~305 RP/wk · $602k/wk cost).' }
};

export function ensureDriverAndSyncState(s) {
  if (!s || typeof s !== 'object') return;
  ensureAiState(s);
  if (!s.qualifying || typeof s.qualifying !== 'object') s.qualifying = {};
  if (!s.driverStats || typeof s.driverStats !== 'object') s.driverStats = {};

  const allDrv = [...activeDrivers(s), ...RESERVE_DRIVERS];
  for (const d of allDrv) {
    if (!s.driverStats[d.id]) {
      s.driverStats[d.id] = {
        baseSpeed: d.speed,
        baseRisk: d.risk,
        speedDelta: 0,
        riskDelta: 0,
        speedReason: '',
        riskReason: '',
        cooldownRaces: 0
      };
    }
  }

  if (!s.monopostoSynced || typeof s.monopostoSynced !== 'object') {
    s.monopostoSynced = { teams: {}, drivers: {} };
    for (const t of TEAMS) {
      s.monopostoSynced.teams[t.id] = teamMonopostoPower(t.id, s);
    }
    for (const d of activeDrivers(s)) {
      const live = driverLiveStats(d.id, s);
      s.monopostoSynced.drivers[d.id] = { speed: live.speed, risk: live.risk };
    }
  } else {
    if (!s.monopostoSynced.teams) s.monopostoSynced.teams = {};
    if (!s.monopostoSynced.drivers) s.monopostoSynced.drivers = {};
    for (const t of TEAMS) {
      if (typeof s.monopostoSynced.teams[t.id] !== 'number') {
        s.monopostoSynced.teams[t.id] = t.carPower;
      }
    }
    for (const d of activeDrivers(s)) {
      if (!s.monopostoSynced.drivers[d.id]) {
        s.monopostoSynced.drivers[d.id] = { speed: d.speed, risk: d.risk };
      }
    }
  }
}

function migrate(s) {
  if (!s || typeof s !== 'object' || !s.teamId) return s;
  let dirty = false;
  const board = sponsorsOfTeam(s.teamId);
  if (board.length) {
    const validIds = (s.activeSponsors || []).filter(id => board.some(sp => sp.id === id));
    if (validIds.length < 2) {
      const nextIds = [...validIds];
      for (const sp of board) {
        if (nextIds.length >= 2) break;
        if (!nextIds.includes(sp.id)) nextIds.push(sp.id);
      }
      s.activeSponsors = nextIds;
      dirty = true;
    }
  }
  if (typeof s.puCost === 'undefined') {
    const team = teamById(s.teamId);
    const pu = puById(s.puId || team?.pu);
    const spEcon = computeSponsorEconomy(s.teamId, s.activeSponsors);
    const cost = puContractCost(team, pu);
    s.signingCash = spEcon.signingCashM;
    s.puCost = cost;
    dirty = true;
  }
  if (!s.facilityNodes || typeof s.facilityNodes !== 'object') {
    const wt = s.facilities?.windtunnel || 1;
    const lvl = wt >= 3 ? 'extensive' : wt === 2 ? 'advanced' : 'basic';
    s.facilityNodes = initialFacilityNodes(lvl);
    syncLegacyFacilities(s);
    dirty = true;
  }
  if (s.parts && typeof s.parts === 'object') {
    for (const [, p] of Object.entries(s.parts)) {
      if (typeof p.car1 === 'undefined') {
        const res = p.researched || 0;
        const copies = p.copies || 0;
        p.car1 = copies >= 1 ? res : 0;
        p.car2 = copies >= 2 ? res : 0;
        dirty = true;
      }
    }
  }
  ensureDriverAndSyncState(s);
  if (dirty) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  }
  return s;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? migrate(JSON.parse(raw)) : null;
  } catch { return memoryFallback; }
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch { memoryFallback = state; }
}

let state = load();

export function getState() { return state; }
export function hasSave() { return !!state; }

export function newSave({
  teamId,
  ownerBg,
  activeSponsors,
  puId,
  facilityBaseline = 'basic',
  carDevBaseline = 'none',
  cashBaseline = 'none'
}) {
  const team = teamById(teamId);
  const tier = ENTRY_TIERS[tierOf(team)];
  const resolvedPuId = team.works ? team.pu : (puId || team.pu);
  const pu = puById(resolvedPuId);
  const spEcon = computeSponsorEconomy(teamId, activeSponsors);
  const signingCash = spEcon.signingCashM;
  const puCost = puContractCost(team, pu);
  const reserveCash = CASH_RESERVE_PRESETS[cashBaseline]?.cashM || 0;
  const startingCash = +(signingCash - puCost + reserveCash).toFixed(2);

  const facilityNodes = initialFacilityNodes(facilityBaseline);
  const { parts, dpTotal } = initialPartsState(carDevBaseline);

  // Sum any initial Fan Rating boosts from pre-completed corporate sub-upgrades.
  let fanBonus = 0;
  for (const n of allFacilityNodes()) {
    if (facilityNodes[n.id] && n.fanBonus) fanBonus += n.fanBonus;
  }

  const seasonStartPower = {};
  for (const t of TEAMS) seasonStartPower[t.id] = t.carPower;

  state = {
    version: 1,
    season: 1,
    seasonHistory: [],
    seasonStartPower,
    teamId,
    ownerBg,
    puId: resolvedPuId,
    signingCash,
    puCost,
    reserveCash,
    facilityBaseline,
    carDevBaseline,
    cashBaseline,
    activeSponsors,                       // exactly 2 sponsor ids (objective cards)
    date: '2026-02-20',                   // pre-season start
    cash: startingCash,                   // 30% signing bucket minus customer PU cost + cash reserve
    rp: tier.rp,
    fanRating: Math.min(100, tier.fan + fanBonus),
    facilityNodes,                        // nodeId -> true
    facilities: { ...tier.facilities },   // synced legacy facility phase map
    staff: {},                            // staffId -> tier owned
    parts,                                // partId -> { researched, car1, car2, copies, dpAppliedFor, dpCredited, breakthrough }
    tasks: [],                            // background queue (research | manufacture | facility)
    qualifying: {},                       // round -> { skipped, gridOnly, order, times }
    results: {},                          // round -> { entries, gaps, fastestLap, conditions, laps, rewards }
    points: {},                           // driverId -> championship points
    dpTotal,                              // accumulated Development Progress (player team)
    teamDp: {},                           // teamId -> accumulated DP (AI teams)
    regFocus: 'current',                  // 'current' | 'balanced' | 'next' (R16-R22 regulation split)
    nextSeasonDpBank: 0,                  // banked next-season spec protection DP
    roster: DRIVERS.map(d => ({ ...d })), // live 24-driver roster (supports contract window signings)
    contractMoves: [],                    // log of contract window transfers/signings
    lastPriorityDriverId: null,           // tracks #1 priority driver for revert notice when cars equalize
    equalizedRevertDriverId: null,        // set when cars equalize after a priority split
    activeFeedEvents: [],                 // current day/week ephemeral HQ notifications
    puUsed: 1,
    ledger: []                            // append-only audit trail
  };
  syncLegacyFacilities(state);
  ensureDriverAndSyncState(state);

  // Sync initial starting baseline to monopostoSynced
  state.monopostoSynced = { teams: {}, drivers: {} };
  for (const t of TEAMS) {
    state.monopostoSynced.teams[t.id] = t.carPower;
  }
  for (const d of activeDrivers(state)) {
    state.monopostoSynced.drivers[d.id] = { speed: d.speed, risk: d.risk };
  }

  log('save-created', {
    team: team.name,
    signingCash,
    pu: pu ? pu.name : resolvedPuId,
    puCost,
    reserveCash,
    startingCash,
    facilityBaseline,
    carDevBaseline,
    dpTotal
  });
  persist();
  return state;
}

export function save() { persist(); }
export function wipe() {
  state = null;
  try { localStorage.removeItem(KEY); } catch { memoryFallback = null; }
}
export function log(type, detail = {}) {
  if (!state) return;
  state.ledger.push({ date: state.date, type, ...detail });
}

// Derived values -------------------------------------------------------------
export function playerTeam(s = state) { return teamById(s.teamId); }

export function teamSeasonStartPower(teamId, s = state) {
  const t = teamById(teamId);
  if (!t) return 4.0;
  return (s?.seasonStartPower && typeof s.seasonStartPower[teamId] === 'number')
    ? s.seasonStartPower[teamId]
    : t.carPower;
}

export function teamTruePower(teamId, s = state) {
  if (!s) return teamById(teamId)?.carPower || 4.0;
  const startBase = teamSeasonStartPower(teamId, s);
  const dp = teamId === s.teamId
    ? (s.dpTotal || 0)
    : ((s.teamDp && s.teamDp[teamId]) || 0);
  return +Math.min(10.0, startBase + dp / 100).toFixed(2);
}

export function teamMonopostoPower(teamId, s = state) {
  return Math.min(10, Math.max(1, Math.floor(teamTruePower(teamId, s))));
}

export function truePower(s = state) {           // fractional truth; Monoposto gets the floor
  return teamTruePower(s.teamId, s);
}
export function monopostoPower(s = state) { return teamMonopostoPower(s.teamId, s); }

// Counts fitted upgrades on Car #1 vs Car #2 and computes the flat +1 Speed
// #1 Priority Car Bonus (strictly capped at +1 and clamped to max 10).
export function driverPriorityStatus(s = state) {
  if (!s) return null;
  const [d1, d2] = driversOfTeam(s.teamId, s);
  let car1Upgrades = 0, car2Upgrades = 0;
  for (const p of Object.values(s.parts || {})) {
    car1Upgrades += (p.car1 || 0);
    car2Upgrades += (p.car2 || 0);
  }
  const diff = car1Upgrades - car2Upgrades;
  let priorityDriver = null;
  let priorityCar = null;
  if (diff > 0) {
    priorityDriver = d1;
    priorityCar = 1;
  } else if (diff < 0) {
    priorityDriver = d2;
    priorityCar = 2;
  }
  const d1Base = (d1?.speed || 7) + (s.driverStats?.[d1?.id]?.speedDelta || 0);
  const d2Base = (d2?.speed || 7) + (s.driverStats?.[d2?.id]?.speedDelta || 0);
  const d1EffectiveSpeed = Math.min(10, Math.max(1, priorityCar === 1 ? d1Base + 1 : d1Base));
  const d2EffectiveSpeed = Math.min(10, Math.max(1, priorityCar === 2 ? d2Base + 1 : d2Base));
  const revertDriver = (!priorityDriver && s.equalizedRevertDriverId)
    ? driverById(s.equalizedRevertDriverId, s)
    : null;

  return {
    d1, d2,
    car1Upgrades,
    car2Upgrades,
    diff: Math.abs(diff),
    priorityDriver,
    priorityCar,
    d1EffectiveSpeed,
    d2EffectiveSpeed,
    revertDriver
  };
}

// Computes live Monoposto Speed (1-10) and Risk (1-10) for any of the 24 drivers
export function driverLiveStats(driverId, s = state) {
  const drv = driverById(driverId, s);
  if (!drv) return { speed: 7, risk: 6, baseSpeed: 7, baseRisk: 6, isPriority: false, speedReason: '', riskReason: '' };
  ensureDriverAndSyncState(s);
  const st = s.driverStats[driverId] || { baseSpeed: drv.speed, baseRisk: drv.risk, speedDelta: 0, riskDelta: 0, speedReason: '', riskReason: '' };

  let speed = (st.baseSpeed || drv.speed) + (st.speedDelta || 0);
  let speedReason = st.speedReason || '';
  let isPriority = false;

  if (drv.team === s.teamId) {
    const prio = driverPriorityStatus(s);
    if (prio?.priorityDriver?.id === drv.id) {
      speed += 1;
      isPriority = true;
      speedReason = speedReason ? `${speedReason} · #1 Car Priority (+1)` : '#1 Car Upgrade Priority (+1 SPD)';
    }
  }
  speed = Math.min(10, Math.max(1, speed));

  let risk = (st.baseRisk || drv.risk) + (st.riskDelta || 0);
  let riskReason = st.riskReason || '';
  if (drv.team === s.teamId && hasFacilityNode(s, 'per_p3_sim3')) {
    risk -= 1;
    riskReason = riskReason ? `${riskReason} · Digital Twin Sim (−1)` : 'Digital Twin Simulator (−1 RSK)';
  }
  risk = Math.min(9, Math.max(3, risk));

  return {
    driver: drv,
    speed,
    risk,
    baseSpeed: st.baseSpeed || drv.speed,
    baseRisk: st.baseRisk || drv.risk,
    speedDelta: speed - (st.baseSpeed || drv.speed),
    riskDelta: risk - (st.baseRisk || drv.risk),
    isPriority,
    speedReason,
    riskReason
  };
}

// Compares live calculated integer sliders against state.monopostoSynced across all 12 teams & 24 drivers
export function getMonopostoDiffs(s = state) {
  if (!s) return [];
  ensureDriverAndSyncState(s);
  const diffs = [];

  for (const t of TEAMS) {
    const livePwr = teamMonopostoPower(t.id, s);
    const syncedPwr = s.monopostoSynced.teams[t.id] ?? t.carPower;
    if (livePwr !== syncedPwr) {
      const frac = teamTruePower(t.id, s).toFixed(2);
      diffs.push({
        key: `team:${t.id}`,
        kind: 'team',
        team: t,
        driver: null,
        label: `Car Power (${frac} True)`,
        reason: t.id === s.teamId ? 'Player R&D Parts Fitted' : `AI Background R&D (${s.aiTeams?.[t.id]?.activeUpgrade || 'Spec Upgrade'})`,
        from: syncedPwr,
        to: livePwr
      });
    }
  }

  for (const d of activeDrivers(s)) {
    const t = teamById(d.team);
    const live = driverLiveStats(d.id, s);
    const synced = s.monopostoSynced.drivers[d.id] || { speed: d.speed, risk: d.risk };

    if (live.speed !== synced.speed) {
      diffs.push({
        key: `drv-spd:${d.id}`,
        kind: 'driver-speed',
        team: t,
        driver: d,
        label: `${d.first[0]}. ${d.last} — Driver Speed`,
        reason: live.speedReason || (live.speed < synced.speed ? 'Cars Equalized / Form Revert' : 'Momentum Form Shift'),
        from: synced.speed,
        to: live.speed
      });
    }
    if (live.risk !== synced.risk) {
      diffs.push({
        key: `drv-rsk:${d.id}`,
        kind: 'driver-risk',
        team: t,
        driver: d,
        label: `${d.first[0]}. ${d.last} — Driver Risk`,
        reason: live.riskReason || 'Track Aggression Shift',
        from: synced.risk,
        to: live.risk
      });
    }
  }

  return diffs;
}

// Confirms either a single diff key ('team:porsche', 'drv-spd:BOT', etc.) or 'all'
export function confirmMonopostoSync(s = state, keyOrAll = 'all') {
  if (!s) return;
  ensureDriverAndSyncState(s);
  if (keyOrAll === 'all') {
    for (const t of TEAMS) {
      s.monopostoSynced.teams[t.id] = teamMonopostoPower(t.id, s);
    }
    for (const d of activeDrivers(s)) {
      const live = driverLiveStats(d.id, s);
      s.monopostoSynced.drivers[d.id] = { speed: live.speed, risk: live.risk };
    }
    s.equalizedRevertDriverId = null;
  } else if (keyOrAll.startsWith('team:')) {
    const teamId = keyOrAll.slice(5);
    s.monopostoSynced.teams[teamId] = teamMonopostoPower(teamId, s);
  } else if (keyOrAll.startsWith('drv-spd:')) {
    const drvId = keyOrAll.slice(8);
    const live = driverLiveStats(drvId, s);
    if (!s.monopostoSynced.drivers[drvId]) s.monopostoSynced.drivers[drvId] = { speed: live.speed, risk: live.risk };
    else s.monopostoSynced.drivers[drvId].speed = live.speed;
    if (s.equalizedRevertDriverId === drvId) s.equalizedRevertDriverId = null;
  } else if (keyOrAll.startsWith('drv-rsk:')) {
    const drvId = keyOrAll.slice(8);
    const live = driverLiveStats(drvId, s);
    if (!s.monopostoSynced.drivers[drvId]) s.monopostoSynced.drivers[drvId] = { speed: live.speed, risk: live.risk };
    else s.monopostoSynced.drivers[drvId].risk = live.risk;
  }
  persist();
}

// Transitions the career from Season 1 (2026) to Season 2 (2027) with FIA Technical Directive part bans applied
export function startSeason2(s = state, championSummary = {}) {
  if (!s || (s.season || 1) >= 2) return s;
  const preview = computeSeason2Preview(s);

  s.seasonHistory.push({
    season: s.season || 1,
    year: 2026,
    points: { ...s.points },
    resultsCount: Object.keys(s.results || {}).length,
    ...championSummary
  });

  s.season = 2;
  s.date = '2026-02-20'; // Uses the 22-round calendar dates for Season 2 progression
  s.seasonStartPower = {};
  for (const row of preview) {
    s.seasonStartPower[row.team.id] = row.nextStartPower;
    s.teamDp[row.team.id] = 0;
    if (s.aiTeams[row.team.id]) {
      s.aiTeams[row.team.id].regFocus = 'current';
      s.aiTeams[row.team.id].nextSeasonDpBank = 0;
    }
  }
  s.dpTotal = 0;
  s.regFocus = 'current';
  s.nextSeasonDpBank = 0;
  s.parts = {};
  s.tasks = [];
  s.qualifying = {};
  s.results = {};
  s.points = {};
  s.puUsed = 1;

  // Award off-season Constructor Prize Purse bonus ($8.0M to $18.0M)
  const bonusCash = championSummary.prizeBonusM || 10.0;
  s.cash = +(s.cash + bonusCash).toFixed(2);
  log('season-2-started', { bonusCash, startPower: s.seasonStartPower[s.teamId] });
  persist();
  return s;
}

// Returns researched part blueprints that have NOT been manufactured for either car yet
// and are not currently in the manufacturing queue (triggers Head of Engineering radio banner).
export function unmanufacturedBlueprints(s = state) {
  if (!s || !s.parts) return [];
  const list = [];
  for (const [partId, p] of Object.entries(s.parts)) {
    const res = p.researched || 0;
    if (res <= 0) continue;
    const c1 = p.car1 || 0, c2 = p.car2 || 0;
    const inManuf = (s.tasks || []).some(t => t.kind === 'manufacture' && t.partId === partId);
    if (c1 < res && c2 < res && !inManuf) {
      const meta = partById(partId);
      if (meta) list.push({ part: meta, spec: res, state: p });
    }
  }
  return list;
}

export function exportJSON() { return JSON.stringify(state, null, 2); }
export function importJSON(text) {
  const parsed = JSON.parse(text);
  if (!parsed || parsed.version !== 1 || !parsed.teamId) throw new Error('Not a valid save file');
  state = migrate(parsed);
  persist();
  return state;
}
