// TIME ENGINE — the advance-time clock (SPEC §4).
// advance() moves the save one day forward and returns everything that fired:
// task completions (research / manufacture / facility), the Monday weekly
// tick, and race-weekend arrivals. The agenda is GENERATED from state —
// player entries exist only because the player queued them.
import { CALENDAR, nextRace } from '../data/calendar2026.js?v=20261022b';
import { teamById } from '../data/teamsAndDrivers.js?v=20261022b';
import { totalSponsorValue } from '../data/sponsorsAndEngines.js?v=20261022b';
import { resolveResearch, resolveManufacture } from './rdEngine.js?v=20261022b';
import { log, save } from './store.js?v=20261022b';

// --- date helpers ------------------------------------------------------------
export const DAY = 86400000;
export const toISO = ts => new Date(ts).toISOString().slice(0, 10);
export const fromISO = iso => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
export const addDays = (iso, n) => toISO(fromISO(iso) + n * DAY);
export const isMonday = iso => new Date(fromISO(iso)).getUTCDay() === 1;
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export function prettyDate(iso) {
  const d = new Date(fromISO(iso));
  const day = d.getUTCDate();
  const suf = (day % 10 === 1 && day !== 11) ? 'st' : (day % 10 === 2 && day !== 12) ? 'nd' : (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
  return `${day}${suf} ${MONTHS[d.getUTCMonth()]}`;
}
function seasonMondays() {  // Mondays from pre-season start to the finale — prorates the spec's per-race economy
  let n = 0;
  for (let d = '2026-02-23'; d <= '2026-12-06'; d = addDays(d, 7)) n++;
  return n; // 41
}

// --- weekly tick ---------------------------------------------------------------
export function weeklyTick(state) {
  const weeks = seasonMondays();
  let income = totalSponsorValue(state.teamId) * 0.40 / weeks;                 // 40% weekly bucket
  if (state.ownerBg === 'cfo') income *= 1.1;
  const levels = Object.values(state.facilities).reduce((a, b) => a + b, 0);
  const costs = 0.287 * (1 + 0.15 * (levels - 4));                  // draft scale — rises with facility level
  let rp = 120 * 22 / weeks;                                       // 120/race facility generation, prorated
  for (const lvl of Object.values(state.facilities)) rp += (lvl === 2 ? 25 : lvl === 3 ? 60 : 0) * 22 / weeks;
  const power = teamById(state.teamId).carPower;                   // ATR anti-snowball (SPEC §6)
  rp *= power <= 5 ? 1.15 : power >= 7 ? 0.90 : 1.0;
  if (state.ownerBg === 'head-engineer') rp *= 1.1;
  rp = Math.round(rp);
  state.cash = +(state.cash + income - costs).toFixed(2);
  state.rp += rp;
  log('weekly-tick', { income: +income.toFixed(2), costs: +costs.toFixed(2), rp });
  return { type: 'tick', income, costs, rp };
}

// --- agenda (visible = fixtures + tasks surfacing within the window) -----------
export function agenda(state, windowDays = 7) {
  const items = [];
  const horizon = addDays(state.date, windowDays);
  for (const t of state.tasks) {
    if (t.due <= horizon) items.push({ date: t.due, kind: t.kind, title: t.title, label: t.label, taskId: t.id });
  }
  // next weekly tick (fixture)
  let d = addDays(state.date, 1);
  while (!isMonday(d)) d = addDays(d, 1);
  if (d <= horizon) items.push({ date: d, kind: 'tick', title: 'Weekly tick', label: 'Base income · running costs · resource points' });
  // next race weekend (fixture) — always listed once inside the window
  const race = nextRace(state.date);
  if (race && race.sat <= horizon) items.push({ date: race.sat, kind: 'race', title: race.gp, label: `Race weekend — ${race.circuit}`, race });
  return items.sort((a, b) => a.date.localeCompare(b.date));
}

// --- facility purchases ------------------------------------------------------------
export function queueFacility(state, facilityId, node, toLevel) {
  if (state.cash < node.cost) return { error: `Not enough cash (need $${node.cost}M)` };
  if (state.tasks.some(t => t.kind === 'facility' && t.facilityId === facilityId)) return { error: 'Upgrade already in progress' };
  state.cash = +(state.cash - node.cost).toFixed(2);
  const days = Math.round(node.days * (state.ownerBg === 'peoples-manager' ? 0.9 : 1));
  const due = addDays(state.date, days);
  state.tasks.push({ id: 't' + Date.now(), kind: 'facility', facilityId, toLevel, due,
                     title: 'Facility improvement', label: node.name });
  log('facility-started', { facility: facilityId, toLevel, cost: node.cost, due });
  save();
  return { ok: true, due };
}

// --- the clock -------------------------------------------------------------------
export function advance(state) {
  state.date = addDays(state.date, 1);
  const fired = [];
  // tasks due today leave the background queue and resolve
  const due = state.tasks.filter(t => t.due <= state.date);
  state.tasks = state.tasks.filter(t => t.due > state.date);
  for (const task of due) {
    if (task.kind === 'research') fired.push(resolveResearch(state, task));
    else if (task.kind === 'manufacture') fired.push(resolveManufacture(state, task));
    else if (task.kind === 'facility') {
      state.facilities[task.facilityId] = task.toLevel;
      log('facility-complete', { facility: task.facilityId, level: task.toLevel });
      fired.push({ type: 'facility', title: task.title, label: `Now Level ${task.toLevel}` });
    }
  }
  if (isMonday(state.date)) fired.push(weeklyTick(state));
  const race = CALENDAR.find(r => r.sat === state.date);
  if (race && !state.results[race.round]) fired.push({ type: 'race', race });
  save();
  return fired;
}
