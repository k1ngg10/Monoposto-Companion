// RACE ENGINE — takes results the GAME produced and does the bookkeeping.
// It never decides an on-track outcome (SPEC hard boundary). Points are F1's:
// 25-18-15-12-10-8-6-4-2-1. Race RP income follows the expectation-relative
// reward engine (SPEC §6): beat your band ×1.5, in band ×1.0, miss ×0.6.
import { DRIVERS, driversOfTeam, teamById } from '../data/teamsAndDrivers.js';
import { log } from './store.js';

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

export function driverStandings(state) {
  return DRIVERS.map(d => ({ driver: d, points: state.points[d.id] || 0 }))
                .sort((a, b) => b.points - a.points);
}
export function constructorStandings(state) {
  const totals = {};
  for (const d of DRIVERS) totals[d.team] = (totals[d.team] || 0) + (state.points[d.id] || 0);
  return Object.entries(totals).map(([teamId, points]) => ({ team: teamById(teamId), points }))
                               .sort((a, b) => b.points - a.points);
}
export const teamDrivers = state => driversOfTeam(state.teamId);
