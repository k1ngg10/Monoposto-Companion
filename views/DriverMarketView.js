// DRIVER MARKET — the contract window (SPEC §6, Pillar 5).
// The 3-tier prestige algorithm, evaluated openly: retirement checks,
// the 35% teammate rule, and the prestige ladder. Never a random lottery.
import { teamById } from '../data/teamsAndDrivers.js?v=20261022k';
import { getState } from '../engine/store.js?v=20261022k';
import { contractWindowReport } from '../engine/driverMarketEngine.js?v=20261022k';
import { driverStandings } from '../engine/raceSimulator.js?v=20261022k';
import { topbarHTML } from './shared.js?v=20261022k';

export function render(root) {
  const s = getState();
  const { report, topSeatEligible } = contractWindowReport(s);
  const r1 = report.filter(r => r.rule === 1), r2 = report.filter(r => r.rule === 2);
  const byId = Object.fromEntries(driverStandings(s).map(x => [x.driver.id, x.driver]));
  root.innerHTML = `${topbarHTML(true)}
    <h1 class="page">DRIVER MARKET</h1>
    <div class="sub">Contract windows open at <b style="color:#fff">R12 (Spa)</b> and <b style="color:#fff">R22 (Abu Dhabi)</b>. The market runs on the prestige algorithm below — every flag here is computed from the standings, nothing is rolled.</div>
    <div class="dept">Rule 1 — Veteran retirement check (35+)</div>
    ${r1.length ? r1.map(r => `<div class="trow"><div><div class="tt">${r.driver.name} <span class="tag warn">${r.risk}% RETIREMENT RISK</span></div><div class="ts">${r.reason}</div></div></div>`).join('')
      : '<div class="sub">No veteran currently at risk (needs a sub-Power-6 car or a finish outside the Top 10).</div>'}
    <div class="dept">Rule 2 — The 35% teammate rule</div>
    ${r2.length ? r2.map(r => `<div class="trow"><div><div class="tt">${r.driver.name} <span class="tag bad">SEAT AT RISK</span></div><div class="ts">${r.team.name} — ${r.reason}</div></div></div>`).join('')
      : '<div class="sub">Every #2 driver is within 35% of their teammate — no seats at risk right now.</div>'}
    <div class="dept">Rule 3 — Prestige ladder (top-seat eligibility)</div>
    <div class="trow"><div><div class="tt">Speed 8+ drivers</div>
      <div class="tags" style="display:flex;gap:7px;flex-wrap:wrap;margin-top:7px">${topSeatEligible.map(id => `<span class="tag">${byId[id].name} · ${teamById(byId[id].team).short}</span>`).join('')}</div>
      <div class="ts" style="margin-top:8px">Power 7–9 seats only go to Speed 8+ drivers, or midfielders who beat their teammate by 20+ points. Power 4–5 seats draw from the F2/reserve pool.</div></div></div>
    <div class="foot">Weissach standing, morale fallout and the actual window resolutions build on this report in the next step.</div>`;
}
