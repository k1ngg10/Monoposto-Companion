// RACE ENGINE — Full 24-Driver Qualifying & Grand Prix Classification, Official F1 Points,
// FIA Prize Purse & Telemetry RP, Fan Rating Progression, R7/R14 ATR Resets, and
// Deterministic 24-Driver Speed & Risk Evolution.
import { TEAMS, activeDrivers, driversOfTeam, teamById, driverById } from '../data/teamsAndDrivers.js?v=20261022m';
import { computeSponsorEconomy, sponsorsOfTeam } from '../data/sponsorsAndEngines.js?v=20261022m';
import { facilityEconomyStats, hasFacilityNode } from '../data/facilitiesCatalog.js?v=20261022m';
import { recalculateAtrMultipliers } from './aiRdEngine.js?v=20261022m';
import { log, ensureDriverAndSyncState, teamMonopostoPower } from './store.js?v=20261022m';

export const POINTS_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
export const pointsFor = (pos, isFastestLap = false) => {
  if (!pos || pos < 1 || pos > 10) return 0;
  return POINTS_TABLE[pos - 1] + (isFastestLap ? 1 : 0);
};

// Expected finishing position band for a driver based on their team's Monoposto Car Power (1-10)
export const expectedDriverBand = power =>
  power >= 7 ? [1, 3]
  : power === 6 ? [3, 8]
  : power === 5 ? [9, 16]
  : [17, 24];

// Expected constructors' band by car power
export const bandForPower = power =>
  power >= 7 ? [1, 2]
  : power === 6 ? [2, 4]
  : power === 5 ? [5, 8]
  : [9, 12];

// Logs or updates Qualifying Session for a round
export function logQualifying(state, round, { skipped = false, gridOnly = false, order = [], times = {} } = {}) {
  ensureDriverAndSyncState(state);
  if (!state.qualifying) state.qualifying = {};
  state.qualifying[round] = {
    skipped: Boolean(skipped),
    gridOnly: Boolean(gridOnly),
    order: Array.isArray(order) ? [...order] : [],
    times: { ...times },
    date: state.date
  };
  log('qualifying-logged', { round, skipped, gridOnly });
  return state.qualifying[round];
}

// Per-car FIA Classification Purse ($M) and Telemetry RP for finishes outside Top 10 (or DNF)
function nonPointsClassificationReward(pos) {
  if (!pos) {
    // DNF: halved telemetry data & minimum travel classification stipend
    return { cashM: 0.06, rp: 35 };
  }
  if (pos <= 10) return { cashM: 0, rp: 0 };
  // P11 ($350k, 100 RP) scaling linearly down to P24 ($120k, 60 RP)
  const t = Math.min(1, Math.max(0, (pos - 11) / 13));
  const cashM = +(0.35 - t * 0.23).toFixed(3);
  const rp = Math.round(100 - t * 40);
  return { cashM, rp };
}

// Deterministic 24-Driver Speed (1-10) & Risk (1-10) Evolution Engine
export function evaluateDriverEvolution(state, upToRound) {
  ensureDriverAndSyncState(state);
  const loggedRounds = Object.keys(state.results || {})
    .map(Number)
    .filter(r => r <= upToRound)
    .sort((a, b) => a - b);

  if (!loggedRounds.length) return [];

  const standings = driverStandings(state);
  const leaderPts = standings[0]?.points || 0;
  const leaderId = standings[0]?.driver?.id || null;
  const rankOf = id => standings.findIndex(x => x.driver.id === id) + 1;
  const last3Rounds = loggedRounds.slice(-3);
  const has3Races = last3Rounds.length >= 3;

  const shifts = [];

  for (const drv of activeDrivers(state)) {
    const ds = state.driverStats[drv.id] || (state.driverStats[drv.id] = {
      baseSpeed: drv.speed,
      baseRisk: drv.risk,
      speedDelta: 0,
      riskDelta: 0,
      speedReason: '',
      riskReason: '',
      cooldownRaces: 0
    });

    const prevSpeedDelta = ds.speedDelta || 0;
    const prevRiskDelta = ds.riskDelta || 0;
    const teamPwr = teamMonopostoPower(drv.team, state);
    const [expTop, expBottom] = expectedDriverBand(teamPwr);

    // --- 1. DRIVER SPEED (Momentum Form: Hot Streak +1 / Cold Slump -1) ---
    let newSpeedDelta = 0;
    let newSpeedReason = '';
    if (has3Races) {
      const finishes = last3Rounds.map(r => state.results[r]?.entries?.[drv.id] ?? null);
      const allHot = finishes.every(pos => pos !== null && pos <= Math.max(1, expTop - 3));
      const allCold = finishes.every(pos => pos === null || pos >= Math.min(24, expBottom + 4));

      if (allHot) {
        newSpeedDelta = 1;
        newSpeedReason = `Hot Streak: 3 races ≥3 pos above Power ${teamPwr} expectation`;
      } else if (allCold) {
        newSpeedDelta = -1;
        newSpeedReason = `Cold Slump: 3 races ≥4 pos below target / DNF`;
      }
    }
    ds.speedDelta = newSpeedDelta;
    ds.speedReason = newSpeedReason;

    // --- 2. DRIVER RISK (Title Attack, H2H / Hot Seat, Crash Cooldown, Safe Lead) ---
    let newRiskDelta = 0;
    let newRiskReason = '';

    // Check High-Risk Crash Cooldown first: if Risk >= 7 and 2+ DNFs in last 3 races
    const recentDnfs = last3Rounds.filter(r => {
      const entries = state.results[r]?.entries;
      return entries && (drv.id in entries) && entries[drv.id] === null;
    }).length;

    const currentEffectiveRisk = (ds.baseRisk || drv.risk) + prevRiskDelta;
    if ((ds.baseRisk >= 7 || currentEffectiveRisk >= 7) && recentDnfs >= 2) {
      newRiskDelta = -1;
      newRiskReason = `Telemetry Discipline Directive: ${recentDnfs} DNFs in last ${last3Rounds.length} races (−1 Risk)`;
    } else if (drv.id === leaderId && leaderPts >= 40 && (leaderPts - (standings[1]?.points || 0)) >= 40) {
      // Comfortable 40+ point Championship Lead -> safe management mode (-1 Risk)
      newRiskDelta = -1;
      newRiskReason = `Championship Control: 40+ pt lead safe mode (−1 Risk)`;
    } else {
      // Check Championship Contender Desperation (+1 Risk) in second half of season (or after 4+ logged rounds)
      const myPts = state.points[drv.id] || 0;
      const myRank = rankOf(drv.id);
      const gapToLeader = leaderPts - myPts;
      const isSecondHalf = upToRound >= 11 || loggedRounds.length >= 5;

      // Teammate comparison
      const mates = driversOfTeam(drv.team, state);
      const mate = mates.find(m => m.id !== drv.id);
      const matePts = mate ? (state.points[mate.id] || 0) : 0;
      const under35Pct = matePts >= 10 && myPts < 0.35 * matePts;

      let lostLast3H2H = false;
      if (has3Races && mate) {
        lostLast3H2H = last3Rounds.every(r => {
          const myPos = state.results[r]?.entries?.[drv.id] ?? 99;
          const matePos = state.results[r]?.entries?.[mate.id] ?? 99;
          return myPos > matePos;
        });
      }

      if (isSecondHalf && (myRank <= 4 || teamPwr >= 7) && drv.id !== leaderId && gapToLeader >= 10 && gapToLeader <= 45) {
        newRiskDelta = 1;
        newRiskReason = `Title Attack Mode: P${myRank} trailing leader by ${gapToLeader} pts (+1 Risk)`;
      } else if (under35Pct) {
        newRiskDelta = 1;
        newRiskReason = `Hot-Seat Urgency: Under 35% of teammate ${mate.last}'s points (+1 Risk)`;
      } else if (lostLast3H2H) {
        newRiskDelta = 1;
        newRiskReason = `Teammate H2H Pressure: Lost 3 straight races to ${mate.last} (+1 Risk)`;
      }
    }

    ds.riskDelta = newRiskDelta;
    ds.riskReason = newRiskReason;

    if (newSpeedDelta !== prevSpeedDelta || newRiskDelta !== prevRiskDelta) {
      shifts.push({
        driver: drv,
        speedDelta: newSpeedDelta,
        riskDelta: newRiskDelta,
        reason: newSpeedReason || newRiskReason || 'Form returned to baseline'
      });
    }
  }

  return shifts;
}

// Logs full 24-driver Grand Prix results, points, FIA Prize Cash, Telemetry RP, and Fan Rating
export function logResult(state, round, entries, conditions, laps, extras = {}) {
  ensureDriverAndSyncState(state);

  // If re-logging an already logged round, reverse its previous points, cash, RP, and Fan Rating first
  if (state.results[round]) {
    const prev = state.results[round];
    const prevFl = prev.fastestLap || null;
    for (const [driverId, pos] of Object.entries(prev.entries || {})) {
      if (pos) {
        state.points[driverId] = Math.max(0, (state.points[driverId] || 0) - pointsFor(pos, prevFl === driverId));
      }
    }
    if (prev.rewards) {
      state.cash = +(state.cash - (prev.rewards.totalCashM || 0)).toFixed(2);
      state.rp = Math.max(0, state.rp - (prev.rewards.totalRp || 0));
      state.fanRating = Math.min(100, Math.max(1, (state.fanRating || 12) - (prev.rewards.fanDelta || 0)));
    }
  }

  const fastestLap = extras.fastestLap || null;
  const gaps = extras.gaps || {};

  // 1. Apply official F1 points across all 24 drivers
  let playerPointsScored = 0;
  for (const [driverId, pos] of Object.entries(entries)) {
    const pts = pointsFor(pos, fastestLap === driverId);
    if (pts > 0) {
      state.points[driverId] = (state.points[driverId] || 0) + pts;
    }
    const drv = driverById(driverId, state);
    if (drv && drv.team === state.teamId) {
      playerPointsScored += pts;
    }
  }

  // 2. Compute Player Team FIA Prize Cash & Telemetry RP
  const [d1, d2] = driversOfTeam(state.teamId, state);
  const pos1 = d1 ? (entries[d1.id] ?? null) : null;
  const pos2 = d2 ? (entries[d2.id] ?? null) : null;

  // Constructor Points Bonus: +$45,000 ($0.045M) and +8 RP per championship point scored
  const pointsCashM = +(playerPointsScored * 0.045).toFixed(3);
  const pointsRp = playerPointsScored * 8;

  // Classification Purse & Telemetry RP for finishes outside Top 10 (or DNF)
  const c1Reward = nonPointsClassificationReward(pos1);
  const c2Reward = nonPointsClassificationReward(pos2);
  let classCashM = +(c1Reward.cashM + c2Reward.cashM).toFixed(3);
  let baseTelemetryRp = c1Reward.rp + c2Reward.rp;

  // Pit Crew Hydraulic Gantry (+10% race RP bonus on double-classified finishes)
  if (pos1 !== null && pos2 !== null && hasFacilityNode(state, 'per_p1_pit')) {
    baseTelemetryRp = Math.round(baseTelemetryRp * 1.10);
  }

  // Evaluate Active Sponsor Weekend Goal
  const spEcon = computeSponsorEconomy(state.teamId, state.activeSponsors);
  const facStats = facilityEconomyStats(state);
  const teamPwr = teamMonopostoPower(state.teamId, state);
  const [expTop] = expectedDriverBand(teamPwr);
  const bestPos = Math.min(pos1 || 99, pos2 || 99);
  const targetPos = teamPwr >= 6 ? 5 : teamPwr === 5 ? 10 : 14;
  const sponsorGoalPassed = bestPos <= targetPos;
  const sponsorGoalCashM = sponsorGoalPassed
    ? +(spEcon.goalPerRaceM * (1 + (facStats.goalBonusBoost || 0))).toFixed(3)
    : 0;

  const totalCashM = +(pointsCashM + classCashM + sponsorGoalCashM).toFixed(2);
  const totalRp = Math.round(pointsRp + baseTelemetryRp);

  // 3. Compute Fan Rating (1 to 100) Delta & Reasons
  let fanDelta = 0;
  const fanReasons = [];

  for (const [drv, p] of [[d1, pos1], [d2, pos2]]) {
    if (!drv || !p) continue;
    if (p === 1) { fanDelta += 4; fanReasons.push(`${drv.last} P1 Win (+4)`); }
    else if (p === 2) { fanDelta += 3; fanReasons.push(`${drv.last} P2 Podium (+3)`); }
    else if (p === 3) { fanDelta += 2; fanReasons.push(`${drv.last} P3 Podium (+2)`); }
  }
  if ((pos1 && pos1 <= 3) || (pos2 && pos2 <= 3)) {
    if (hasFacilityNode(state, 'per_p3_pit_elite')) {
      fanDelta += 2;
      fanReasons.push('Sub-2.0s Pit Bay Podium Bonus (+2)');
    }
  }
  if (pos1 && pos1 <= 10 && pos2 && pos2 <= 10) {
    fanDelta += 2;
    fanReasons.push('Double Points Finish (+2)');
  }
  if (bestPos < expTop) {
    fanDelta += 1;
    fanReasons.push(`Beat Power ${teamPwr} Tier Expectation (+1)`);
  }
  if (fastestLap && (fastestLap === d1?.id || fastestLap === d2?.id)) {
    fanDelta += 1;
    fanReasons.push('Fastest Lap (+1)');
  }
  if (sponsorGoalPassed) {
    fanDelta += 1;
    fanReasons.push('Sponsor Weekend Goal Passed (+1)');
  }
  const bothDnf = pos1 === null && pos2 === null;
  const finishedLast = pos1 === 24 || pos2 === 24;
  if (bothDnf || finishedLast) {
    if (hasFacilityNode(state, 'cor_p2_pr')) {
      fanReasons.push('Crisis PR Shield blocked −2 DNF/P24 Fan penalty');
    } else {
      fanDelta -= 2;
      fanReasons.push(bothDnf ? 'Double DNF (−2)' : 'Finished Last on Grid (−2)');
    }
  }

  const prevFan = state.fanRating || 12;
  const nextFan = Math.min(100, Math.max(1, prevFan + fanDelta));
  const appliedFanDelta = nextFan - prevFan;

  state.cash = +(state.cash + totalCashM).toFixed(2);
  state.rp += totalRp;
  state.fanRating = nextFan;

  const rewards = {
    playerPointsScored,
    pointsCashM,
    classCashM,
    sponsorGoalPassed,
    sponsorGoalCashM,
    totalCashM,
    pointsRp,
    baseTelemetryRp,
    totalRp,
    fanDelta: appliedFanDelta,
    fanReasons
  };

  state.results[round] = {
    entries,
    gaps,
    fastestLap,
    conditions,
    laps,
    date: state.date,
    rewards
  };

  // 4. Evaluate 24-Driver Speed & Risk Evolution
  const driverShifts = evaluateDriverEvolution(state, round);

  // 5. Trigger FIA ATR Wind Tunnel Reset at Round 7 (Canada) & Round 14 (Netherlands)
  let atrResetTable = null;
  if (round === 7 || round === 14) {
    atrResetTable = recalculateAtrMultipliers(state, round, constructorStandings(state));
  }

  log('race-logged', {
    round,
    conditions,
    playerPointsScored,
    totalCashM,
    totalRp,
    fanDelta: appliedFanDelta
  });

  return {
    rpGained: totalRp,
    cashGainedM: totalCashM,
    fanDelta: appliedFanDelta,
    rewards,
    driverShifts,
    atrResetTable
  };
}

// F1 countback: on equal points, most wins wins, then most 2nds, and so on
function finishCounts(state, driverId) {
  const counts = new Array(24).fill(0);
  for (const r of Object.values(state.results || {})) {
    const pos = r.entries?.[driverId];
    if (pos && pos >= 1 && pos <= 24) counts[pos - 1]++;
  }
  return counts;
}

export function driverStandings(state) {
  const list = activeDrivers(state);
  return list.map(d => ({
    driver: d,
    points: state.points?.[d.id] || 0,
    counts: finishCounts(state, d.id)
  })).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    for (let i = 0; i < 24; i++) if (b.counts[i] !== a.counts[i]) return b.counts[i] - a.counts[i];
    return a.driver.no - b.driver.no;
  });
}

export function constructorStandings(state) {
  const totals = {}, counts = {};
  for (const t of TEAMS) {
    totals[t.id] = 0;
    counts[t.id] = new Array(24).fill(0);
  }
  for (const d of activeDrivers(state)) {
    totals[d.team] = (totals[d.team] || 0) + (state.points?.[d.id] || 0);
    const c = finishCounts(state, d.id);
    const t = counts[d.team] || (counts[d.team] = new Array(24).fill(0));
    for (let i = 0; i < 24; i++) t[i] += c[i];
  }
  return Object.entries(totals).map(([teamId, points]) => ({
    team: teamById(teamId),
    points,
    counts: counts[teamId]
  })).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    for (let i = 0; i < 24; i++) if (b.counts[i] !== a.counts[i]) return b.counts[i] - a.counts[i];
    return b.team.carPower - a.team.carPower;
  });
}

export const teamDrivers = state => driversOfTeam(state.teamId, state);
