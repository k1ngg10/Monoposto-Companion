// DRIVER MARKET ENGINE — the 3-tier prestige algorithm (SPEC §6, Pillar 5).
// NEVER a random lottery. This evaluates the rules and reports who is at
// risk and why; contract windows open at R12 (Spa) and R22 (Abu Dhabi).
// ("Silly season" is not a term we use — it's the contract window.)
import { DRIVERS, teamById, driversOfTeam } from '../data/teamsAndDrivers.js?v=20261022k';
import { driverStandings } from './raceSimulator.js?v=20261022k';

export function contractWindowReport(state) {
  const standings = driverStandings(state);
  const positionOf = id => standings.findIndex(s => s.driver.id === id) + 1;
  // A standings position only means something once the driver has a logged
  // finish — before that there is no position, and no rule may fire off one.
  const hasResult = id => Object.values(state.results).some(r => r.entries && id in r.entries);
  const report = [];

  // Rule 1 — veteran retirement check (35+): at risk if their car is below
  // Power 6 OR they finish outside the Top 10 at Abu Dhabi. The standings
  // trigger can only be judged on real logged results.
  for (const d of DRIVERS.filter(x => (x.age || 0) >= 35)) {
    const team = teamById(d.team);
    const powerTrigger = team.carPower < 6;
    const posTrigger = hasResult(d.id) && positionOf(d.id) > 10;
    if (powerTrigger || posTrigger) report.push({ rule: 1, driver: d, team,
      risk: (d.id === 'ALO' || d.id === 'HAM') ? 40 : 50,
      triggers: [
        ...(powerTrigger ? [`car Power ${team.carPower} < 6`] : []),
        ...(posTrigger ? [`P${positionOf(d.id)} in the standings — outside the Top 10`] : [])
      ],
      reason: `Age ${d.age} · ${team.name} Power ${team.carPower} · ${hasResult(d.id) ? `P${positionOf(d.id)} in the standings` : 'no classified finish logged yet'}` });
  }

  // Rule 2 — a #2 driver below 35% of their teammate's points: seat at risk.
  for (const teamId of [...new Set(DRIVERS.map(d => d.team))]) {
    const [a, b] = driversOfTeam(teamId);
    if (!a || !b) continue;
    const pa = state.points[a.id] || 0, pb = state.points[b.id] || 0;
    if (pa + pb === 0) continue;
    const [top, low] = pa >= pb ? [a, b] : [b, a];
    const topPts = Math.max(pa, pb), lowPts = Math.min(pa, pb);
    if (topPts > 0 && lowPts < 0.35 * topPts) report.push({ rule: 2, driver: low, team: teamById(teamId),
      risk: 100, ratio: Math.round((lowPts / topPts) * 100),
      reason: `${lowPts} pts vs teammate ${top.name}'s ${topPts} — ${Math.round((lowPts / topPts) * 100)}% of teammate, below the 35% line` });
  }

  // Rule 3 — prestige ladder (informational): who qualifies for top seats.
  const eligible = DRIVERS.filter(d => d.speed >= 8).map(d => d.id);
  return { report, topSeatEligible: eligible };
}
