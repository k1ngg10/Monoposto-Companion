// STORE — the live save state. Single source of truth for the career.
// Persists to localStorage; JSON export/import for backup (SPEC §1).
import { teamById, tierOf, ENTRY_TIERS, driversOfTeam, driverById } from '../data/teamsAndDrivers.js?v=20261022k';
import { computeSponsorEconomy, puContractCost, puById, sponsorsOfTeam } from '../data/sponsorsAndEngines.js?v=20261022k';
import { initialFacilityNodes, syncLegacyFacilities, allFacilityNodes } from '../data/facilitiesCatalog.js?v=20261022k';
import { initialPartsState, partById } from '../data/partsCatalog.js?v=20261022k';

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

  state = {
    version: 1,
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
    fanRating: tier.fan + fanBonus,
    facilityNodes,                        // nodeId -> true
    facilities: { ...tier.facilities },   // synced legacy facility phase map
    staff: {},                            // staffId -> tier owned
    parts,                                // partId -> { researched, car1, car2, copies, dpAppliedFor, dpCredited, breakthrough }
    tasks: [],                            // background queue (research | manufacture | facility)
    results: {},                          // round -> { entries, conditions, laps }
    points: {},                           // driverId -> championship points
    dpTotal,                              // accumulated Development Progress (player team)
    lastPriorityDriverId: null,           // tracks #1 priority driver for revert notice when cars equalize
    equalizedRevertDriverId: null,        // set when cars equalize after a priority split
    activeFeedEvents: [],                 // current day/week ephemeral HQ notifications
    puUsed: 1,
    ledger: []                            // append-only audit trail
  };
  syncLegacyFacilities(state);
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
export function playerTeam() { return teamById(state.teamId); }
export function truePower() {           // fractional truth; Monoposto gets the floor
  return playerTeam().carPower + state.dpTotal / 100;
}
export function monopostoPower() { return Math.floor(truePower()); }

// Counts fitted upgrades on Car #1 vs Car #2 and computes the flat +1 Speed
// #1 Priority Car Bonus (strictly capped at +1 and clamped to max 10).
export function driverPriorityStatus(s = state) {
  if (!s) return null;
  const [d1, d2] = driversOfTeam(s.teamId);
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
  const d1EffectiveSpeed = priorityCar === 1 ? Math.min(10, d1.speed + 1) : d1.speed;
  const d2EffectiveSpeed = priorityCar === 2 ? Math.min(10, d2.speed + 1) : d2.speed;
  const revertDriver = (!priorityDriver && s.equalizedRevertDriverId)
    ? driverById(s.equalizedRevertDriverId)
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
