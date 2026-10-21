// RACE ENGINE — takes results the GAME produced and does the bookkeeping.
// It never decides an on-track outcome (SPEC hard boundary). Points are F1's:
// 25-18-15-12-10-8-6-4-2-1. Race RP income follows the expectation-relative
// reward engine (SPEC §6): beat your band ×1.5, in band ×1.0, miss ×0.6.
import { DRIVERS, driversOfTeam, teamById } from '../data/teamsAndDrivers.js?v=20261022b';
import { log } from './store.js?v=20261022b';

export const POINTS_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
export const pointsFor = pos => (pos >= 1 && pos <= 10) ? POINTS_TABLE[pos - 1] : 0;

// Expected constructors' band by car power (SPEC reward engine).
export const bandForPower = power => power >= 7 ? [1, 2] : power === 6 ? [2, 4] : power === 5 ? [5, 8] : [9, 12];

function raceRP(state, driverId, pos) {
  if (!pos) return 0; // DNF
  let base = pos === 1 ? 200 : pos <= 3 ? 100 : pos <= 10 ? 40 : 0;
  if (!base) return 0;
  const team = teamById(DRIVERS.find(d => d.id === driverId).team);
  const [top, bottom] = bandForPower(team.carPower);
  const mult = pos < top ? 1.5 : pos > bottom ? 0.6 : 1.0;  // per-driver proxy for the team band (draft)
  return Math.round(base * mult);
}

export function logResult(state, round, entries, conditions, laps) {
  if (state.results[round]) {           // re-logging replaces: reverse the old points first
    for (const [driverId, pos] of Object.entries(state.results[round].entries)) {
      if (pos) state.points[driverId] = (state.points[driverId] || 0) - pointsFor(pos);
    }
  }
  state.results[round] = { entries, conditions, laps, date: state.date };
  let rpGained = 0;
  for (const [driverId, pos] of Object.entries(entries)) {
    if (pos) state.points[driverId] = (state.points[driverId] || 0) + pointsFor(pos);
    if (DRIVERS.find(d => d.id === driverId)?.team === state.teamId) rpGained += raceRP(state, driverId, pos);
  }
  state.rp += rpGained;
  log('race-logged', { round, rpGained, conditions });
  return { rpGained };
}

// F1 countback: on equal points, most wins wins, then most 2nds, and so on
// down the finishing positions — computed from the finishes actually logged.
// A driver with no logged finish has an all-zero countback and no business
// outranking anyone on list order alone.
function finishCounts(state, driverId) {
  const counts = new Array(24).fill(0);
  for (const r of Object.values(state.results)) {
    const pos = r.entries?.[driverId];
    if (pos) counts[pos - 1]++;
  }
  return counts;
}
export function driverStandings(state) {
  return DRIVERS.map(d => ({ driver: d, points: state.points[d.id] || 0, counts: finishCounts(state, d.id) }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      for (let i = 0; i < 24; i++) if (b.counts[i] !== a.counts[i]) return b.counts[i] - a.counts[i];
      return a.driver.id.localeCompare(b.driver.id);
    });
}
export function constructorStandings(state) {
  const totals = {}, counts = {};
  for (const d of DRIVERS) {
    totals[d.team] = (totals[d.team] || 0) + (state.points[d.id] || 0);
    const c = finishCounts(state, d.id), t = counts[d.team] || (counts[d.team] = new Array(24).fill(0));
    for (let i = 0; i < 24; i++) t[i] += c[i];
  }
  return Object.entries(totals).map(([teamId, points]) => ({ team: teamById(teamId), points, counts: counts[teamId] }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      for (let i = 0; i < 24; i++) if (b.counts[i] !== a.counts[i]) return b.counts[i] - a.counts[i];
      return a.team.id.localeCompare(b.team.id);
    });
}
export const teamDrivers = state => driversOfTeam(state.teamId);
