// STORE — the live save state. Single source of truth for the career.
// Persists to localStorage; JSON export/import for backup (SPEC §1).
import { teamById, tierOf, ENTRY_TIERS } from '../data/teamsAndDrivers.js';
import { totalSponsorValue } from '../data/sponsorsAndEngines.js';

const KEY = 'monoposto-companion-save-v1';
let memoryFallback = null;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return memoryFallback; }
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch { memoryFallback = state; }
}

let state = load();

export function getState() { return state; }
export function hasSave() { return !!state; }

export function newSave({ teamId, ownerBg, activeSponsors, puId }) {
  const team = teamById(teamId);
  const tier = ENTRY_TIERS[tierOf(team)];
  state = {
    version: 1,
    teamId,
    ownerBg,
    puId: puId || team.pu,
    activeSponsors,                       // exactly 2 sponsor ids (objective cards)
    date: '2026-02-20',                   // pre-season start
    cash: +(totalSponsorValue(teamId) * 0.30).toFixed(2),  // 30% signing bucket of YOUR team board, Day 1
    rp: tier.rp,
    fanRating: tier.fan,
    facilities: { ...tier.facilities },   // facilityId -> level
    staff: {},                            // staffId -> tier owned
    parts: {},                             // partId -> { researched, copies, dpAppliedFor, breakthrough }
    tasks: [],                            // background queue (invisible until ~7 days out)
    results: {},                          // round -> { entries, conditions, laps }
    points: {},                           // driverId -> championship points
    dpTotal: 0,                           // accumulated Development Progress (player team)
    puUsed: 1,
    ledger: []                            // append-only audit trail
  };
  log('save-created', { team: team.name });
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

export function exportJSON() { return JSON.stringify(state, null, 2); }
export function importJSON(text) {
  const parsed = JSON.parse(text);
  if (!parsed || parsed.version !== 1 || !parsed.teamId) throw new Error('Not a valid save file');
  state = parsed;
  persist();
  return state;
}
