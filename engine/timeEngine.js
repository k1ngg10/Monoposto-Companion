// TIME ENGINE — the advance-time clock (SPEC §4).
// advance() moves the save one day forward and returns everything that fired:
// task completions (research / manufacture / facility sub-upgrades), the Monday
// weekly tick, and race-weekend arrivals.
import { CALENDAR, nextRace } from '../data/calendar2026.js?v=20261022h';
import { teamById } from '../data/teamsAndDrivers.js?v=20261022h';
import { computeSponsorEconomy } from '../data/sponsorsAndEngines.js?v=20261022h';
import {
  facilityNodeById,
  hasFacilityNode,
  branchPhaseInfo,
  syncLegacyFacilities,
  facilityEconomyStats
} from '../data/facilitiesCatalog.js?v=20261022h';
import { resolveResearch, resolveManufacture } from './rdEngine.js?v=20261022h';
import { log, save } from './store.js?v=20261022h';

// --- date helpers ------------------------------------------------------------
export const DAY = 86400000;
export const toISO = ts => new Date(ts).toISOString().slice(0, 10);
export const fromISO = iso => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
export const addDays = (iso, n) => toISO(fromISO(iso) + n * DAY);
export const daysBetween = (isoA, isoB) => Math.max(0, Math.round((fromISO(isoB) - fromISO(isoA)) / DAY));
export const isMonday = iso => new Date(fromISO(iso)).getUTCDay() === 1;
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export function prettyDate(iso) {
  const d = new Date(fromISO(iso));
  const day = d.getUTCDate();
  const suf = (day % 10 === 1 && day !== 11) ? 'st' : (day % 10 === 2 && day !== 12) ? 'nd' : (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
  return `${day}${suf} ${MONTHS[d.getUTCMonth()]}`;
}

export const SEASON_WEEKS = 38;

// --- weekly tick ---------------------------------------------------------------
export function weeklyTick(state) {
  const facStats = facilityEconomyStats(state);
  const spEcon = computeSponsorEconomy(state.teamId, state.activeSponsors);
  let sponsorWk = spEcon.weeklyIncomeM; // Active sponsors pay 100% weekly + 35% passive board retainer
  let income = sponsorWk + facStats.commercialWkM;
  if (state.ownerBg === 'cfo') income *= 1.1;

  const costs = facStats.runningCostM; // $287k/wk at Basic -> $459k/wk at Advanced -> $602k/wk at Extensive
  let rp = facStats.weeklyRp;          // 113 RP/wk at Basic -> 216 RP/wk at Advanced -> 305 RP/wk at Extensive
  const power = teamById(state.teamId).carPower;
  rp *= power <= 5 ? 1.15 : power >= 7 ? 0.90 : 1.0; // ATR anti-snowball
  if (state.ownerBg === 'head-engineer') rp *= 1.1;
  rp = Math.round(rp);

  state.cash = +(state.cash + income - costs).toFixed(2);
  state.rp += rp;
  log('weekly-tick', { income: +income.toFixed(2), costs: +costs.toFixed(2), rp });
  return {
    type: 'tick',
    date: state.date,
    income: +income.toFixed(2),
    costs: +costs.toFixed(2),
    rp
  };
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

// --- facility sub-upgrade purchases --------------------------------------------
export function queueFacility(state, nodeIdOrBranchId, legacyNode, legacyToLevel) {
  // Support both new single-arg queueFacility(state, nodeId) and legacy 3-arg calls
  const node = facilityNodeById(nodeIdOrBranchId) || legacyNode;
  if (!node) return { error: 'Unknown facility upgrade' };
  const nodeId = node.id || nodeIdOrBranchId;

  if (hasFacilityNode(state, nodeId)) return { error: 'Upgrade already completed' };
  if (state.tasks.some(t => t.kind === 'facility' && (t.nodeId === nodeId || t.facilityId === nodeId))) {
    return { error: 'This upgrade is already under construction' };
  }

  // Only allow 1 active construction per branch at a time
  if (node.branchId && state.tasks.some(t => t.kind === 'facility' && t.branchId === node.branchId)) {
    return { error: `Another ${node.branchName} upgrade is currently under construction` };
  }

  if (node.branchId && node.phase) {
    const info = branchPhaseInfo(state, node.branchId);
    if (node.phase > info.currentPhase) {
      return { error: `Locked — complete all Phase ${node.phase - 1} ${node.branchName} sub-upgrades first` };
    }
  }

  if (state.cash < node.cost) return { error: `Not enough cash (need $${node.cost.toFixed(2)}M, have $${state.cash.toFixed(2)}M)` };
  state.cash = +(state.cash - node.cost).toFixed(2);
  const days = Math.max(3, Math.round(node.days * (state.ownerBg === 'peoples-manager' ? 0.9 : 1)));
  const due = addDays(state.date, days);

  state.tasks.push({
    id: 'fac_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    kind: 'facility',
    nodeId,
    facilityId: node.branchId || nodeId,
    branchId: node.branchId,
    branchName: node.branchName,
    phase: node.phase || legacyToLevel || 1,
    started: state.date,
    totalDays: days,
    due,
    title: `${node.branchName || 'Facility'} Upgrade`,
    label: `${node.name} (Phase ${node.phase || 1})`
  });
  log('facility-started', { nodeId, branch: node.branchId, phase: node.phase, cost: node.cost, due });
  save();
  return { ok: true, due, node };
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
      if (!state.facilityNodes) state.facilityNodes = {};
      const nodeId = task.nodeId || task.facilityId;
      state.facilityNodes[nodeId] = true;
      const node = facilityNodeById(nodeId);
      if (node?.fanBonus) state.fanRating += node.fanBonus;
      syncLegacyFacilities(state);
      const info = node?.branchId ? branchPhaseInfo(state, node.branchId) : null;
      const phaseUp = info && info.currentPhase > (task.phase || 1)
        ? ` · ★ ${node.branchName.toUpperCase()} PHASE ${info.currentPhase} UNLOCKED!`
        : '';
      log('facility-complete', { nodeId, branch: task.branchId, phase: task.phase });
      fired.push({
        type: 'facility',
        title: `Facility Built — ${node ? node.name : task.label}`,
        label: `${node ? node.effects.join(' · ') : 'Upgrade operational'}${phaseUp}`
      });
    }
  }
  if (isMonday(state.date)) fired.push(weeklyTick(state));
  const race = CALENDAR.find(r => r.sat === state.date);
  if (race && !state.results[race.round]) fired.push({ type: 'race', race });
  save();
  return fired;
}
