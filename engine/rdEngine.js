// R&D ENGINE — Step A: Research (RP + days + D20 check) → Step B: Manufacture ($ + days for Car #1, Car #2, or Both) → 50/50 Car DP + #1 Driver Priority Speed Bonus.
import { partById, APPROACHES } from '../data/partsCatalog.js?v=20261022m';
import { CALENDAR } from '../data/calendar2026.js?v=20261022m';
import { driversOfTeam } from '../data/teamsAndDrivers.js?v=20261022m';
import {
  engineeringPhase,
  facilityEconomyStats,
  hasDualBuild,
  hasFacilityNode,
  maxResearchSlots,
  maxManufactureSlots
} from '../data/facilitiesCatalog.js?v=20261022m';
import { addDays } from './timeEngine.js?v=20261022m';
import { log, driverPriorityStatus } from './store.js?v=20261022m';

export function debutRound(isoDate) {
  const race = CALENDAR.find(r => r.sun >= isoDate);
  return race ? `R${race.round} · ${race.circuit}` : 'next season';
}
const roll20 = () => 1 + Math.floor(Math.random() * 20);

function tdDiscount(state) {
  const tier = state.staff?.td || 0;
  return tier >= 3 ? 0.70 : tier >= 2 ? 0.85 : 1.0;
}

export function specTotalDp(state, part, step, breakthrough = false) {
  const aeroStaffMult = (part.dept === 'aero' && (state.staff?.aerohead || 0) >= 2) ? 1.15 : 1.0;
  const btMult = breakthrough ? (hasFacilityNode(state, 'eng_p3_zero_defect') ? 1.6 : 1.5) : 1.0;
  return Math.round(step.dp * aeroStaffMult * btMult);
}

export function researchQuote(state, partId, approachId = 'standard') {
  const part = partById(partId);
  if (!part) return null;
  const p = state.parts[partId] || { researched: 0, car1: 0, car2: 0 };
  const cur = p.researched || 0;
  const step = part.steps[cur];
  if (!step) return null;

  const approach = APPROACHES[approachId] || APPROACHES.standard;
  const engPhase = engineeringPhase(state);
  const facStats = facilityEconomyStats(state);
  const neededPhase = step.needsFacility || step.phase || part.phase || 1;
  const gateBlocked = engPhase < neededPhase;

  let prereqBlocked = false;
  let prereqName = null;
  if (part.prereq) {
    const pre = partById(part.prereq);
    const preState = state.parts[part.prereq];
    if (!preState || (preState.researched || 0) < 1) {
      prereqBlocked = true;
      prereqName = pre ? pre.name : part.prereq;
    }
  }

  // If a lower spec of this multi-spec part was researched, require at least one car to have it fitted before researching the next spec.
  const unbuiltPrevSpec = cur > 0 && (p.car1 || 0) < cur && (p.car2 || 0) < cur;

  const rp = Math.max(50, Math.round(step.rp * approach.rpFactor * tdDiscount(state)));
  const ownerMult = state.ownerBg === 'peoples-manager' ? 0.9 : 1.0;
  const days = Math.max(4, Math.round(step.researchDays * approach.timeFactor * facStats.researchTimeMult * ownerMult));

  return {
    part,
    step,
    rp,
    days,
    neededPhase,
    gateBlocked,
    prereqBlocked,
    prereqName,
    unbuiltPrevSpec
  };
}

export function startResearch(state, partId, approachId = 'standard') {
  const q = researchQuote(state, partId, approachId);
  if (!q) return { error: 'All specs of this part are already researched' };
  if (q.gateBlocked) return { error: `Locked — requires Engineering Facility Phase ${q.neededPhase}` };
  if (q.prereqBlocked) return { error: `Locked — research ${q.prereqName} first` };
  if (q.unbuiltPrevSpec) return { error: `Develop/manufacture Spec ${q.step.spec - 1} before researching Spec ${q.step.spec}` };
  if (state.tasks.some(t => t.kind === 'research' && t.partId === partId)) return { error: 'This part is already in research' };

  const activeRes = state.tasks.filter(t => t.kind === 'research').length;
  const maxSlots = maxResearchSlots(state);
  if (activeRes >= maxSlots) {
    return { error: `Research slots full (${activeRes}/${maxSlots}). Upgrade Parallel Research in Engineering Facilities to add slots.` };
  }
  if (state.rp < q.rp) return { error: `Not enough RP (need ${q.rp} RP, have ${state.rp} RP)` };

  state.rp -= q.rp;
  const due = addDays(state.date, q.days);
  const specLabel = q.part.steps.length > 1 ? `Spec ${q.step.spec}` : `Phase ${q.neededPhase}`;
  state.tasks.push({
    id: 'res_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    kind: 'research',
    partId,
    spec: q.step.spec,
    approach: approachId,
    rpPaid: q.rp,
    started: state.date,
    totalDays: q.days,
    due,
    title: 'Research completes',
    label: `${q.part.name} (${specLabel})`
  });
  log('research-started', { part: partId, spec: q.step.spec, rp: q.rp, due });
  return { ok: true, due, debut: debutRound(due), quote: q };
}

export function resolveResearch(state, task) {
  const part = partById(task.partId);
  const step = part.steps[task.spec - 1];
  const approach = APPROACHES[task.approach || 'standard'] || APPROACHES.standard;
  const facStats = facilityEconomyStats(state);
  const deptBonus = facStats.d20ByDept[part.dept] || 0;
  const mod = Math.min(6, deptBonus + approach.d20);
  const raw = roll20();
  const total = raw + mod;
  const base = { type: 'research', partId: task.partId, roll: raw, mod, total };

  if (total <= 4) {
    // D20 correlation failure — blueprint does NOT unlock for manufacturing; must be researched again.
    const fixMult = hasFacilityNode(state, 'eng_p3_zero_defect') ? 0.10 : 0.20;
    const fix = Math.round(step.rp * fixMult);
    const paid = Math.min(fix, state.rp);
    state.rp -= paid;
    log('research-failed', { part: task.partId, spec: task.spec, roll: raw, fixPaid: paid });
    return {
      ...base,
      outcome: 'failure',
      title: `Research Failed — ${part.name}`,
      label: `D20 ${raw} ${mod >= 0 ? '+' : ''}${mod} = ${total} (≤4). Wind-tunnel correlation check failed; fix cost ${paid} RP. Blueprint did not pass — research again.`
    };
  }

  const breakthrough = total >= 17;
  const p = state.parts[task.partId] || (state.parts[task.partId] = { researched: 0, car1: 0, car2: 0, copies: 0, dpAppliedFor: 0, dpCredited: 0 });
  p.researched = task.spec;
  p.breakthrough = breakthrough;
  log('research-complete', { part: task.partId, spec: task.spec, roll: raw, breakthrough });
  const btPct = hasFacilityNode(state, 'eng_p3_zero_defect') ? '+60% DP' : '+50% DP';
  return {
    ...base,
    outcome: breakthrough ? 'breakthrough' : 'success',
    title: `Blueprint Ready — ${part.name}${part.steps.length > 1 ? ` Spec ${task.spec}` : ''}`,
    label: `D20 ${raw} ${mod >= 0 ? '+' : ''}${mod} = ${total} · ${breakthrough ? `BREAKTHROUGH (${btPct}, rushed build)` : 'CORRELATION PASSED'} — ready to manufacture in Development.`
  };
}

// Step B — Manufacturing Quote for Car #1 ('car1'), Car #2 ('car2'), or Both Cars ('both').
export function manufactureQuote(state, partId, target = 'car1') {
  const part = partById(partId);
  if (!part) return null;
  const p = state.parts[partId];
  if (!p || !p.researched) return null;

  const spec = p.researched;
  const step = part.steps[spec - 1];
  const needCar1 = (p.car1 || 0) < spec;
  const needCar2 = (p.car2 || 0) < spec;
  if (!needCar1 && !needCar2) return null;

  const dualUnlocked = hasDualBuild(state, part.dept);
  if (target === 'car1' && !needCar1) return null;
  if (target === 'car2' && !needCar2) return null;
  if (target === 'both' && (!needCar1 || !needCar2)) return null;

  const copies = target === 'both' ? 2 : 1;
  const facStats = facilityEconomyStats(state);
  const rawCost = step.costPerCopy * copies * facStats.manufCostMult;
  const cost = +(Math.max(0.15, rawCost)).toFixed(2);

  const baseDays = step.manufDays || 8;
  const copyTimeMult = target === 'both' ? 1.25 : 1.0; // Dual build bay builds both in 1.25x single-car time
  const btMult = p.breakthrough ? 0.5 : 1.0;
  const ownerMult = state.ownerBg === 'peoples-manager' ? 0.9 : 1.0;
  const days = Math.max(3, Math.round(baseDays * copyTimeMult * facStats.manufTimeMult * btMult * ownerMult));

  const totalDp = specTotalDp(state, part, step, p.breakthrough);
  const car1Dp = Math.floor(totalDp / 2);
  const car2Dp = totalDp - car1Dp;
  const dpGain = target === 'both' ? totalDp : target === 'car1' ? car1Dp : car2Dp;

  return {
    part,
    step,
    spec,
    target,
    copies,
    cost,
    days,
    dpGain,
    totalDp,
    car1Dp,
    car2Dp,
    dualUnlocked,
    needCar1,
    needCar2
  };
}

export function startManufacture(state, partId, target = 'car1') {
  const part = partById(partId);
  if (!part) return { error: 'Unknown part' };
  const p = state.parts[partId];
  if (!p || !p.researched) return { error: 'Research this part blueprint first' };

  if (target === 'both' && !hasDualBuild(state, part.dept)) {
    return { error: `Dual Build Slot locked for ${part.deptName}. Unlock the ${part.deptName} Dual Build upgrade in Engineering Facilities first, or build for Car #1 / Car #2 individually.` };
  }

  // Prevent duplicate manufacture task for the same car & part
  const existingTasks = state.tasks.filter(t => t.kind === 'manufacture' && t.partId === partId);
  if (existingTasks.some(t => t.target === 'both' || t.target === target || target === 'both')) {
    return { error: 'Already manufacturing this part for the selected car' };
  }

  const activeManuf = state.tasks.filter(t => t.kind === 'manufacture').length;
  const maxSlots = maxManufactureSlots(state);
  if (activeManuf >= maxSlots) {
    return { error: `Manufacturing bays full (${activeManuf}/${maxSlots}). Wait for current build or upgrade Engineering Facilities.` };
  }

  const q = manufactureQuote(state, partId, target);
  if (!q) return { error: 'Selected car already has this spec fitted' };
  if (state.cash < q.cost) return { error: `Not enough cash (need $${q.cost.toFixed(2)}M, have $${state.cash.toFixed(2)}M)` };

  const [d1, d2] = driversOfTeam(state.teamId);
  const carLabel = target === 'both'
    ? `Both Cars (#${d1.no} & #${d2.no})`
    : target === 'car1'
      ? `Car #${d1.no} ${d1.last}`
      : `Car #${d2.no} ${d2.last}`;

  state.cash = +(state.cash - q.cost).toFixed(2);
  const due = addDays(state.date, q.days);
  state.tasks.push({
    id: 'mfg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    kind: 'manufacture',
    partId,
    spec: q.spec,
    target,
    copies: q.copies,
    dpGain: q.dpGain,
    started: state.date,
    totalDays: q.days,
    due,
    title: 'Part manufactured',
    label: `${q.part.name}${q.part.steps.length > 1 ? ` Spec ${q.spec}` : ''} → ${carLabel}`
  });
  log('manufacture-started', { part: partId, spec: q.spec, target, copies: q.copies, cost: q.cost, due });
  return { ok: true, due, debut: debutRound(due), quote: q, carLabel };
}

export function resolveManufacture(state, task) {
  const part = partById(task.partId);
  const p = state.parts[task.partId];
  const spec = task.spec || p.researched;
  const step = part.steps[spec - 1];
  const totalDp = specTotalDp(state, part, step, p.breakthrough);
  const car1Dp = Math.floor(totalDp / 2);
  const car2Dp = totalDp - car1Dp;

  const target = task.target || (task.copies >= 2 ? 'both' : 'car1');
  let dpGained = 0;

  if ((target === 'car1' || target === 'both') && (p.car1 || 0) < spec) {
    p.car1 = spec;
    dpGained += car1Dp;
  }
  if ((target === 'car2' || target === 'both') && (p.car2 || 0) < spec) {
    p.car2 = spec;
    dpGained += car2Dp;
  }

  p.copies = ((p.car1 || 0) >= spec ? 1 : 0) + ((p.car2 || 0) >= spec ? 1 : 0);
  p.dpCredited = (p.dpCredited || 0) + dpGained;
  state.dpTotal += dpGained;

  if ((p.car1 || 0) >= spec && (p.car2 || 0) >= spec) {
    p.dpAppliedFor = spec;
    p.breakthrough = false;
  }

  // Update #1 Car Priority Driver tracking for Championship Matrix In-Game Changes alert
  const status = driverPriorityStatus(state);
  if (status.priorityDriver) {
    state.lastPriorityDriverId = status.priorityDriver.id;
    state.equalizedRevertDriverId = null;
  } else if (state.lastPriorityDriverId) {
    state.equalizedRevertDriverId = state.lastPriorityDriverId;
    state.lastPriorityDriverId = null;
  }

  const [d1, d2] = driversOfTeam(state.teamId);
  const carLabel = target === 'both'
    ? `Both Cars (#${d1.no} & #${d2.no})`
    : target === 'car1'
      ? `Car #${d1.no} ${d1.last}`
      : `Car #${d2.no} ${d2.last}`;

  const priorityNote = status.priorityDriver
    ? ` · #1 Priority Bonus: ${status.priorityDriver.last} +1 Speed (→ ${status.priorityCar === 1 ? status.d1EffectiveSpeed : status.d2EffectiveSpeed})`
    : state.equalizedRevertDriverId
      ? ` · Both cars now equalized (revert Priority Speed bonus in Monoposto)`
      : '';

  log('manufacture-complete', { part: task.partId, spec, target, dpGained });
  return {
    type: 'manufacture',
    title: `Part Fitted — ${part.name}${part.steps.length > 1 ? ` Spec ${spec}` : ''}`,
    label: `Fitted to ${carLabel} · debuts ${debutRound(task.due)} · +${dpGained} Team DP${priorityNote}`
  };
}
