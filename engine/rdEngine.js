// R&D ENGINE — research (RP + days + D20) → manufacture ($ + days) → DP.
// Rules: SPEC §6 Pillar 4. Dice live here and ONLY here — never in a race.
import { partById, APPROACHES } from '../data/partsCatalog.js?v=20261022b';
import { CALENDAR } from '../data/calendar2026.js?v=20261022b';
import { addDays } from './timeEngine.js?v=20261022b';
import { log } from './store.js?v=20261022b';

export function debutRound(isoDate) {
  const race = CALENDAR.find(r => r.sun >= isoDate);
  return race ? `R${race.round} · ${race.circuit}` : 'next season';
}
const roll20 = () => 1 + Math.floor(Math.random() * 20);

function tdDiscount(state) {
  const tier = state.staff.td || 0;
  return tier >= 3 ? 0.70 : tier >= 2 ? 0.85 : 1.0;
}
function facilityBonus(state, gate) {  // D20 modifier from the gating facility (cap +6 with approach)
  const lvl = state.facilities[gate] || 1;
  return gate === 'windtunnel' ? [0, 0, 2, 4][lvl] : [0, 0, 1, 2][lvl]; // fabrication scale is a draft
}

export function researchQuote(state, partId, approachId = 'standard') {
  const part = partById(partId);
  const cur = state.parts[partId]?.researched || 0;
  const step = part.steps[cur];
  if (!step) return null;
  const approach = APPROACHES[approachId];
  return {
    part, step,
    rp: Math.round(step.rp * approach.rpFactor * tdDiscount(state)),
    days: Math.round(step.researchDays * approach.timeFactor * (state.ownerBg === 'peoples-manager' ? 0.9 : 1)),
    gateBlocked: step.needsFacility ? (state.facilities[part.gate] || 1) < step.needsFacility : false
  };
}

export function startResearch(state, partId, approachId = 'standard') {
  const q = researchQuote(state, partId, approachId);
  if (!q) return { error: 'Part already at Spec 3' };
  if (q.gateBlocked) return { error: `Needs ${q.part.gate === 'windtunnel' ? 'Wind Tunnel' : 'Fabrication'} Level ${q.step.needsFacility}` };
  if (state.tasks.some(t => t.kind === 'research' && t.partId === partId)) return { error: 'Already in research' };
  if (state.rp < q.rp) return { error: `Not enough RP (need ${q.rp})` };
  state.rp -= q.rp;
  const due = addDays(state.date, q.days);
  state.tasks.push({ id: 't' + Date.now(), kind: 'research', partId, spec: q.step.spec, approach: approachId,
                     rpPaid: q.rp, due, title: 'Research completes', label: `${q.part.name} — Spec ${q.step.spec}` });
  log('research-started', { part: partId, spec: q.step.spec, rp: q.rp, due });
  return { ok: true, due, debut: debutRound(due) };
}

export function resolveResearch(state, task) {
  const part = partById(task.partId);
  const step = part.steps[task.spec - 1];
  const approach = APPROACHES[task.approach || 'standard'];
  const mod = Math.min(6, facilityBonus(state, part.gate) + approach.d20);
  const raw = roll20();
  const total = raw + mod;
  const base = { type: 'research', partId: task.partId, roll: raw, mod, total };
  if (total <= 4) {           // failure — no DP, fix costs 20% of the step's research RP
    const fix = Math.round(step.rp * 0.2);
    const paid = Math.min(fix, state.rp);
    state.rp -= paid;
    log('research-failed', { part: task.partId, spec: task.spec, roll: raw, fixPaid: paid });
    return { ...base, outcome: 'failure', title: `Research Failed — ${part.name} Spec ${task.spec}`,
             label: `D20 ${raw} ${mod >= 0 ? '+' : ''}${mod} = ${total}. Correlation check failed; fix cost ${paid} RP. The part slips — research it again.` };
  }
  const breakthrough = total >= 17;
  const p = state.parts[task.partId] || (state.parts[task.partId] = { researched: 0, copies: 0, dpAppliedFor: 0 });
  p.researched = task.spec;
  p.breakthrough = breakthrough;
  log('research-complete', { part: task.partId, spec: task.spec, roll: raw, breakthrough });
  return { ...base, outcome: breakthrough ? 'breakthrough' : 'success',
           title: `Research Complete — ${part.name} Spec ${task.spec}`,
           label: `D20 ${raw} ${mod >= 0 ? '+' : ''}${mod} = ${total} · ${breakthrough ? 'BREAKTHROUGH (+50% DP, rushed manufacture)' : 'SUCCESS'} — ready to manufacture` };
}

export function manufactureQuote(state, partId, copies = 2) {
  const part = partById(partId);
  const p = state.parts[partId];
  if (!p || !p.researched) return null;
  const step = part.steps[p.researched - 1];
  const fab = state.facilities.fabrication || 1;
  const cost = part.factory ? 0 : +(step.costPerCopy * copies * (fab >= 2 ? 0.8 : 1)).toFixed(2);
  const days = part.factory ? 14 : (fab >= 3 ? 8 : 8 * copies) * (p.breakthrough ? 0.5 : 1);
  return { part, step, copies, cost, days: Math.round(days) };
}

export function startManufacture(state, partId, copies = 2) {
  const q = manufactureQuote(state, partId, copies);
  if (!q) return { error: 'Research this part first' };
  const parallel = (state.facilities.fabrication || 1) >= 2 ? 2 : 1;
  if (state.tasks.filter(t => t.kind === 'manufacture').length >= parallel) return { error: 'Manufacturing slots full' };
  if (state.cash < q.cost) return { error: `Not enough cash (need $${q.cost}M)` };
  state.cash = +(state.cash - q.cost).toFixed(2);
  const due = addDays(state.date, q.days);
  state.tasks.push({ id: 't' + Date.now(), kind: 'manufacture', partId, copies,
                     due, title: 'Development completes', label: `${q.part.name} Spec ${q.step.spec} — ${copies} ${copies === 1 ? 'copy' : 'copies'}` });
  log('manufacture-started', { part: partId, copies, cost: q.cost, due });
  return { ok: true, due, debut: debutRound(due) };
}

export function resolveManufacture(state, task) {
  const part = partById(task.partId);
  const p = state.parts[task.partId];
  const step = part.steps[p.researched - 1];
  p.copies = (p.copies || 0) + task.copies;
  let dpGained = 0;
  if (p.dpAppliedFor < p.researched) {          // DP lands once per spec, when copies first arrive
    dpGained = Math.round(step.dp * (p.breakthrough ? 1.5 : 1));
    state.dpTotal += dpGained;
    p.dpAppliedFor = p.researched;
    p.breakthrough = false;
  }
  log('manufacture-complete', { part: task.partId, copies: task.copies, dpGained });
  return { type: 'manufacture', title: `Development Complete — ${part.name} Spec ${p.researched}`,
           label: `${task.copies} ${task.copies === 1 ? 'copy' : 'copies'} in the warehouse · debuts ${debutRound(task.due)}${dpGained ? ` · +${dpGained} DP` : ''}` };
}
