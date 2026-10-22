// DRIVER MARKET — Interactive Contract Radar, Driver Dossiers & Contract Negotiations.
// Evaluates Rule 1 (Veteran 35+ Retirement Check), Rule 2 (35% Teammate Hot Seat),
// and Rule 3 (Prestige & Fan Rating Gate: Fan Rating 25+ for Speed 8, Fan Rating 45+ & Car Power 6+ for Speed 9).
import { activeDrivers, teamById } from '../data/teamsAndDrivers.js?v=20261022m';
import { getState, playerTeam, monopostoPower, driverLiveStats } from '../engine/store.js?v=20261022m';
import {
  contractWindowReport,
  teammateH2H,
  contractEligibilityForPlayer,
  isContractWindowOpen
} from '../engine/driverMarketEngine.js?v=20261022m';
import { driverStandings } from '../engine/raceSimulator.js?v=20261022m';
import { topbarHTML, openDriverDossierModal, fmt$ } from './shared.js?v=20261022m';

export function render(root) {
  const s = getState();
  const myTeam = playerTeam(s);
  const myPwr = monopostoPower(s);
  const fan = s.fanRating || 12;
  const windowOpen = isContractWindowOpen(s);
  const loggedRounds = Object.keys(s.results || {}).length;
  const { report, reservePool } = contractWindowReport(s);
  const r1 = report.filter(r => r.rule === 1);
  const r2 = report.filter(r => r.rule === 2);
  const standings = driverStandings(s);

  root.innerHTML = `${topbarHTML(true)}
    <h1 class="page">DRIVER MARKET &amp; CONTRACT NEGOTIATIONS</h1>
    <div class="sub">
      Official FIA Contract Windows open at <b style="color:#fff">R12 (Spa)</b> and <b style="color:#fff">R22 (Abu Dhabi)</b> (${loggedRounds}/22 rounds logged · ${windowOpen ? '<span style="color:var(--green)">★ WINDOW OPEN</span>' : 'Mid-season buyout available'}).
      Click any driver or F2 Reserve Pool member below to inspect their Qualifying/Race H2H dossier and negotiate a seat for <b>${myTeam.name} (${myTeam.hq} HQ)</b>.
    </div>

    <div class="fac-kpis" style="margin:16px 0">
      <div class="fac-kpi">
        <span>YOUR CONSTRUCTOR</span>
        <b>${myTeam.name.toUpperCase()} (${myTeam.hq.toUpperCase()})</b>
      </div>
      <div class="fac-kpi">
        <span>CAR POWER &amp; FAN RATING</span>
        <b>POWER ${myPwr} · FAN RATING <span style="color:var(--green)">${fan}</span>/100</b>
      </div>
      <div class="fac-kpi">
        <span>SPEED 8 PRESTIGE GATE</span>
        <b class="${fan >= 25 ? 'pos' : 'neg'}">${fan >= 25 ? '✓ UNLOCKED (FAN 25+)' : `LOCKED (NEED FAN 25, HAVE ${fan})`}</b>
      </div>
      <div class="fac-kpi">
        <span>SPEED 9 STAR GATE</span>
        <b class="${(fan >= 45 && myPwr >= 6) ? 'pos' : 'neg'}">${(fan >= 45 && myPwr >= 6) ? '✓ UNLOCKED (FAN 45+ & PWR 6+)' : `LOCKED (NEED FAN 45+ & PWR 6+)`}</b>
      </div>
    </div>

    ${s.contractMoves && s.contractMoves.length ? `
      <div class="dept">Completed Contract Transfers</div>
      ${s.contractMoves.map(m => `
        <div class="trow" style="border-color:rgba(55,224,139,.4)">
          <div>
            <div class="tt">★ ${m.signedName} signed to ${m.toTeam} <span class="tag good">COMPLETED</span></div>
            <div class="ts">Replaced ${m.replacedName} (moved to ${m.fromTeam}) · Signing buyout ${fmt$(m.costM)} · ${m.date}</div>
          </div>
        </div>
      `).join('')}
    ` : ''}

    <div class="dept">Rule 1 — Veteran Retirement Watch (Age 35+)</div>
    ${r1.length ? r1.map(r => `
      <div class="trow" style="cursor:pointer" data-open-drv="${r.driver.id}">
        <div>
          <div class="tt">#${r.driver.no} ${r.driver.name} <span class="tag warn">${r.risk}% RETIREMENT RISK</span></div>
          <div class="ts">${r.reason}</div>
        </div>
        <button type="button" class="btn small" data-open-drv="${r.driver.id}">INSPECT DOSSIER →</button>
      </div>
    `).join('') : '<div class="sub">No veteran currently meets the Rule 1 triggers (sub-Power-6 car or outside Top 10).</div>'}

    <div class="dept">Rule 2 — The 35% Teammate Hot-Seat Rule</div>
    ${r2.length ? r2.map(r => `
      <div class="trow" style="cursor:pointer" data-open-drv="${r.driver.id}">
        <div>
          <div class="tt">#${r.driver.no} ${r.driver.name} <span class="tag bad">SEAT AT RISK (${r.ratio}% OF TEAMMATE)</span></div>
          <div class="ts">${r.team.name} — ${r.reason}</div>
        </div>
        <button type="button" class="btn small" data-open-drv="${r.driver.id}">INSPECT &amp; NEGOTIATE →</button>
      </div>
    `).join('') : '<div class="sub">Every #2 driver is currently within 35% of their teammate (or 0 points logged so far).</div>'}

    <div class="dept">Rule 3 — FIA Formula 2 Reserve Pool (Available for Immediate Signing)</div>
    <div class="pickgrid" style="margin-bottom:18px">
      ${reservePool.map(res => {
        const elig = contractEligibilityForPlayer(s, res);
        return `
          <div class="pick" data-open-drv="${res.id}">
            <div class="pt"><span class="mx-num sm" style="background:#38b6ff">${res.no}</span> ${res.name}</div>
            <div class="ps">Monoposto SPD <b>${res.speed}</b> · RSK <b>${res.risk}</b> · Age ${res.age}</div>
            <div class="ps">${res.bio}</div>
            <div class="pv">Signing Fee: ${fmt$(res.salaryM)} · ${elig.eligible ? '<span style="color:var(--green)">Eligible</span>' : 'Locked'}</div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="dept">All 24 Active Championship Drivers (Click Any Row to Open Dossier &amp; Negotiate)</div>
    <table class="tower">
      <thead>
        <tr>
          <th>Pos</th>
          <th>Driver</th>
          <th>Constructor &amp; HQ</th>
          <th>Live SPD / RSK</th>
          <th>Teammate H2H (Q / R)</th>
          <th>Contract Eligibility</th>
          <th class="pts">Pts</th>
          <th class="pts">Action</th>
        </tr>
      </thead>
      <tbody>
        ${standings.map((row, idx) => {
          const d = row.driver;
          const t = teamById(d.team);
          const live = driverLiveStats(d.id, s);
          const h2h = teammateH2H(s, d.id);
          const elig = contractEligibilityForPlayer(s, d);
          return `
            <tr class="${d.team === s.teamId ? 'me' : ''}" style="cursor:pointer" data-open-drv="${d.id}">
              <td>${idx + 1}</td>
              <td>
                <div class="tname">
                  <span class="mx-num sm" style="background:${t.color}">${d.no}</span>
                  <span><span class="fn">${d.first}</span> <span class="ln">${d.last}</span></span>
                </div>
              </td>
              <td>${t.name} <small style="color:var(--dim)">(${t.hq})</small></td>
              <td style="font-family:'F1DisplayBold',sans-serif">SPD ${live.speed} · RSK ${live.risk}</td>
              <td style="color:var(--dim);font-size:.86rem">${h2h.mate ? `Q: ${h2h.qualiWins}-${h2h.qualiLosses} · R: ${h2h.raceWins}-${h2h.raceLosses}` : '—'}</td>
              <td>
                ${elig.currentDriver
                  ? '<span class="tag good">YOUR DRIVER</span>'
                  : elig.eligible
                    ? `<span class="tag good">✓ ELIGIBLE (${fmt$(d.salaryM || 2.0)})</span>`
                    : `<span class="tag bad" title="${elig.reason}">PRESTIGE LOCKED</span>`}
              </td>
              <td class="pts">${row.points}</td>
              <td class="pts"><button type="button" class="btn small" data-open-drv="${d.id}" style="padding:5px 10px;font-size:.7rem">DOSSIER</button></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
    <div class="foot">${myTeam.hq} HQ Prestige Rules: Speed 8 drivers require Fan Rating 25+; Speed 9 star drivers require Fan Rating 45+ and Car Power 6+.</div>
  `;

  root.querySelectorAll('[data-open-drv]').forEach(el => {
    el.onclick = e => {
      e.stopPropagation();
      openDriverDossierModal(el.dataset.openDrv, () => render(root));
    };
  });
}
