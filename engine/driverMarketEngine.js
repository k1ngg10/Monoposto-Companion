// DRIVER MARKET ENGINE — the 3-tier prestige algorithm (SPEC §6, Pillar 5) + Interactive Contract Negotiations.
// Evaluates veteran retirement triggers, the 35% teammate hot-seat rule, Teammate Qualifying & Race H2H,
// and Fan Rating / Car Power prestige gates for signing drivers in R12 (Spa) and R22 (Abu Dhabi).
import { TEAMS, RESERVE_DRIVERS, activeDrivers, teamById, driversOfTeam, driverById } from '../data/teamsAndDrivers.js?v=20261022m';
import { driverStandings } from './raceSimulator.js?v=20261022m';
import { ensureDriverAndSyncState, teamMonopostoPower, driverLiveStats, log, save } from './store.js?v=20261022m';

export function isContractWindowOpen(state) {
  const loggedCount = Object.keys(state?.results || {}).length;
  // Open at R12 (Spa, after 11-12 rounds) and R22 (Abu Dhabi, after 21-22 rounds)
  return loggedCount === 12 || loggedCount === 22;
}

export function teammateH2H(state, driverId) {
  const d = driverById(driverId, state);
  if (!d || !d.team) return { mate: null, qualiWins: 0, qualiLosses: 0, raceWins: 0, raceLosses: 0 };
  const mates = driversOfTeam(d.team, state);
  const mate = mates.find(x => x.id !== d.id) || null;
  if (!mate) return { mate: null, qualiWins: 0, qualiLosses: 0, raceWins: 0, raceLosses: 0 };

  let qualiWins = 0, qualiLosses = 0;
  for (const q of Object.values(state.qualifying || {})) {
    if (q.skipped || !Array.isArray(q.order) || !q.order.length) continue;
    const myIdx = q.order.indexOf(d.id);
    const mateIdx = q.order.indexOf(mate.id);
    if (myIdx !== -1 && mateIdx !== -1) {
      if (myIdx < mateIdx) qualiWins++;
      else if (mateIdx < myIdx) qualiLosses++;
    }
  }

  let raceWins = 0, raceLosses = 0;
  for (const r of Object.values(state.results || {})) {
    const entries = r.entries || {};
    if (!(d.id in entries) && !(mate.id in entries)) continue;
    const myPos = entries[d.id] ?? 99;
    const matePos = entries[mate.id] ?? 99;
    if (myPos < matePos) raceWins++;
    else if (matePos < myPos) raceLosses++;
  }

  return { mate, qualiWins, qualiLosses, raceWins, raceLosses };
}

export function contractEligibilityForPlayer(state, candidate) {
  const playerPwr = teamMonopostoPower(state.teamId, state);
  const fan = state.fanRating || 12;
  const live = candidate.isReserve
    ? { speed: candidate.speed, risk: candidate.risk }
    : driverLiveStats(candidate.id, state);
  const spd = live.speed || candidate.speed;

  if (candidate.team === state.teamId) {
    return { eligible: true, currentDriver: true, reason: 'Already signed to your constructor.' };
  }
  if (spd >= 9) {
    const okFan = fan >= 45;
    const okPwr = playerPwr >= 6;
    if (!okFan || !okPwr) {
      return {
        eligible: false,
        reason: `Star Driver Prestige Gate: Requires Fan Rating 45+ (have ${fan}) and Car Power 6+ (have ${playerPwr}).`
      };
    }
  } else if (spd === 8) {
    if (fan < 25) {
      return {
        eligible: false,
        reason: `Speed 8 Prestige Gate: Requires Fan Rating 25+ (currently ${fan}). Earn podiums & double points to raise Fan Rating.`
      };
    }
  }
  return {
    eligible: true,
    reason: candidate.isReserve
      ? 'FIA F2 Reserve Pool — Ready for immediate promotion.'
      : `Meets Fan Rating (${fan}) & Car Power (${playerPwr}) prestige requirements.`
  };
}

export function driverDossier(state, driverId) {
  ensureDriverAndSyncState(state);
  const d = driverById(driverId, state);
  if (!d) return null;
  const team = d.team ? teamById(d.team) : null;
  const standings = driverStandings(state);
  const standingIdx = standings.findIndex(s => s.driver.id === d.id);
  const standingPos = standingIdx !== -1 ? standingIdx + 1 : null;
  const points = state.points?.[d.id] || 0;

  let wins = 0, podiums = 0, dnfs = 0, bestFinish = null, racesLogged = 0;
  for (const r of Object.values(state.results || {})) {
    if (!r.entries || !(d.id in r.entries)) continue;
    racesLogged++;
    const pos = r.entries[d.id];
    if (pos === null) dnfs++;
    else {
      if (pos === 1) wins++;
      if (pos <= 3) podiums++;
      if (bestFinish === null || pos < bestFinish) bestFinish = pos;
    }
  }

  const live = d.isReserve
    ? { speed: d.speed, risk: d.risk, baseSpeed: d.speed, baseRisk: d.risk, speedReason: '', riskReason: '' }
    : driverLiveStats(d.id, state);
  const h2h = teammateH2H(state, d.id);
  const { report } = contractWindowReport(state);
  const radarHit = report.find(r => r.driver.id === d.id) || null;
  const eligibility = contractEligibilityForPlayer(state, d);

  return {
    driver: d,
    team,
    standingPos,
    points,
    racesLogged,
    wins,
    podiums,
    dnfs,
    bestFinish,
    live,
    h2h,
    radarHit,
    eligibility
  };
}

export function signDriverContract(state, candidateId, outgoingDriverId) {
  ensureDriverAndSyncState(state);
  const candidate = driverById(candidateId, state);
  const outgoing = driverById(outgoingDriverId, state);
  if (!candidate || !outgoing) return { error: 'Driver not found.' };
  if (outgoing.team !== state.teamId) return { error: 'Can only replace one of your own active drivers.' };
  if (candidate.team === state.teamId) return { error: 'Driver is already racing for your team.' };

  const elig = contractEligibilityForPlayer(state, candidate);
  if (!elig.eligible) return { error: elig.reason };

  const buyoutCostM = +(candidate.salaryM || 1.5).toFixed(2);
  if (state.cash < buyoutCostM) {
    return { error: `Insufficient funds for contract signing fee (need $${buyoutCostM.toFixed(2)}M, have $${state.cash.toFixed(2)}M).` };
  }

  state.cash = +(state.cash - buyoutCostM).toFixed(2);
  const prevTeamId = candidate.team;

  // Update active 24-driver roster
  if (!Array.isArray(state.roster) || state.roster.length !== 24) {
    state.roster = activeDrivers(state).map(x => ({ ...x }));
  }

  const outIdx = state.roster.findIndex(x => x.id === outgoing.id);
  const candIdx = state.roster.findIndex(x => x.id === candidate.id);

  if (candIdx !== -1 && prevTeamId) {
    // Swap seats between player's outgoing driver and rival team's driver
    state.roster[candIdx].team = state.teamId;
    state.roster[outIdx].team = prevTeamId;
  } else {
    // Candidate came from the F2 Reserve Pool -> replaces outgoing driver in the 24-driver grid
    state.roster[outIdx] = {
      ...candidate,
      team: state.teamId,
      isReserve: false
    };
  }

  if (!state.contractMoves) state.contractMoves = [];
  const moveRecord = {
    date: state.date,
    season: state.season || 1,
    signedId: candidate.id,
    signedName: candidate.name,
    replacedId: outgoing.id,
    replacedName: outgoing.name,
    fromTeam: prevTeamId ? teamById(prevTeamId)?.name : 'FIA F2 Reserve Pool',
    toTeam: teamById(state.teamId).name,
    costM: buyoutCostM
  };
  state.contractMoves.unshift(moveRecord);

  // Ensure monopostoSynced tracks the newly signed driver
  const live = driverLiveStats(candidate.id, state);
  state.monopostoSynced.drivers[candidate.id] = { speed: live.speed, risk: live.risk };

  log('driver-signed', moveRecord);
  save();
  return { ok: true, move: moveRecord };
}

export function contractWindowReport(state) {
  ensureDriverAndSyncState(state);
  const roster = activeDrivers(state);
  const standings = driverStandings(state);
  const positionOf = id => standings.findIndex(s => s.driver.id === id) + 1;
  const hasResult = id => Object.values(state.results || {}).some(r => r.entries && id in r.entries);
  const report = [];

  // Rule 1 — veteran retirement check (35+): at risk if their car is below
  // Power 6 OR they finish outside the Top 10 at Abu Dhabi.
  for (const d of roster.filter(x => (x.age || 0) >= 35)) {
    const team = teamById(d.team);
    const livePwr = teamMonopostoPower(team.id, state);
    const powerTrigger = livePwr < 6;
    const posTrigger = hasResult(d.id) && positionOf(d.id) > 10;
    if (powerTrigger || posTrigger) {
      report.push({
        rule: 1,
        driver: d,
        team,
        risk: (d.id === 'ALO' || d.id === 'HAM') ? 40 : 50,
        triggers: [
          ...(powerTrigger ? [`car Power ${livePwr} < 6`] : []),
          ...(posTrigger ? [`P${positionOf(d.id)} in the standings — outside the Top 10`] : [])
        ],
        reason: `Age ${d.age} · ${team.name} Power ${livePwr} · ${hasResult(d.id) ? `P${positionOf(d.id)} in the standings` : 'no classified finish logged yet'}`
      });
    }
  }

  // Rule 2 — a #2 driver below 35% of their teammate's points: seat at risk.
  for (const t of TEAMS) {
    const [a, b] = driversOfTeam(t.id, state);
    if (!a || !b) continue;
    const pa = state.points?.[a.id] || 0, pb = state.points?.[b.id] || 0;
    if (pa + pb === 0) continue;
    const [top, low] = pa >= pb ? [a, b] : [b, a];
    const topPts = Math.max(pa, pb), lowPts = Math.min(pa, pb);
    if (topPts >= 8 && lowPts < 0.35 * topPts) {
      report.push({
        rule: 2,
        driver: low,
        team: t,
        risk: 100,
        ratio: Math.round((lowPts / topPts) * 100),
        reason: `${lowPts} pts vs teammate ${top.name}'s ${topPts} — ${Math.round((lowPts / topPts) * 100)}% of teammate, below the 35% line`
      });
    }
  }

  // Rule 3 — prestige ladder: who qualifies for top seats (Speed 8+ or 20+ pt win over teammate).
  const eligible = roster.filter(d => {
    const live = driverLiveStats(d.id, state);
    if (live.speed >= 8) return true;
    const mates = driversOfTeam(d.team, state);
    const mate = mates.find(m => m.id !== d.id);
    if (mate && ((state.points?.[d.id] || 0) - (state.points?.[mate.id] || 0)) >= 20) return true;
    return false;
  }).map(d => d.id);

  return { report, topSeatEligible: eligible, reservePool: RESERVE_DRIVERS };
}
