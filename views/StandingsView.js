// STANDINGS — Broadcast timing-tower tables for all 24 drivers and 12 constructors,
// computed from full-grid logged race results.
import { teamById } from '../data/teamsAndDrivers.js?v=20261022m';
import { getState, teamTruePower, driverLiveStats } from '../engine/store.js?v=20261022m';
import { driverStandings, constructorStandings } from '../engine/raceSimulator.js?v=20261022m';
import { openDriverDossierModal, topbarHTML } from './shared.js?v=20261022m';

export function render(root) {
  const s = getState();
  const logged = Object.keys(s.results || {}).length;
  const season = s.season || 1;
  const yr = season === 1 ? '2026' : '2027';

  const nameCell = d => {
    const t = teamById(d.team);
    return `<div class="tname"><span class="mx-num sm" style="background:${t.color}">${d.no}</span><span><span class="fn">${d.first}</span> <span class="ln">${d.last}</span></span></div>`;
  };

  root.innerHTML = `${topbarHTML(true)}
    <h1 class="page">CHAMPIONSHIP STANDINGS — SEASON ${season} (${yr})</h1>
    <div class="sub">${logged ? `After ${logged} of 22 logged Grand Prix round${logged === 1 ? '' : 's'}. Click any driver row to inspect their full season dossier.` : 'No Grand Prix results logged yet — log all 24 drivers in Race Weekend to populate the Drivers\' and Constructors\' Championships.'}</div>

    <div class="dept">Drivers' Championship (24 Drivers)</div>
    <table class="tower">
      <thead>
        <tr>
          <th>Pos</th>
          <th>Driver</th>
          <th>Constructor &amp; HQ</th>
          <th>SPD / RSK</th>
          <th>Wins</th>
          <th>Podiums</th>
          <th class="pts">Pts</th>
        </tr>
      </thead>
      <tbody>
        ${driverStandings(s).map((r, i) => {
          const t = teamById(r.driver.team);
          const live = driverLiveStats(r.driver.id, s);
          const wins = r.counts[0] || 0;
          const podiums = (r.counts[0] || 0) + (r.counts[1] || 0) + (r.counts[2] || 0);
          return `<tr class="${r.driver.team === s.teamId ? 'me' : ''}" style="cursor:pointer" data-stand-drv="${r.driver.id}">
            <td>${i + 1}</td>
            <td>${nameCell(r.driver)}</td>
            <td>${t.name} <small style="color:var(--dim)">(${t.hq})</small></td>
            <td style="font-family:'F1DisplayBold',sans-serif;font-size:.86rem">SPD ${live.speed} · RSK ${live.risk}</td>
            <td>${wins}</td>
            <td>${podiums}</td>
            <td class="pts">${r.points}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    <div class="dept">Constructors' Championship (12 Teams)</div>
    <table class="tower">
      <thead>
        <tr>
          <th>Pos</th>
          <th>Constructor</th>
          <th>Factory HQ</th>
          <th>Car Power (True)</th>
          <th>Wins</th>
          <th>Podiums</th>
          <th class="pts">Pts</th>
        </tr>
      </thead>
      <tbody>
        ${constructorStandings(s).map((r, i) => {
          const wins = r.counts[0] || 0;
          const podiums = (r.counts[0] || 0) + (r.counts[1] || 0) + (r.counts[2] || 0);
          const truePwr = teamTruePower(r.team.id, s);
          return `<tr class="${r.team.id === s.teamId ? 'me' : ''}">
            <td>${i + 1}</td>
            <td><div class="tname"><span class="bar" style="background:${r.team.color}"></span><span class="ln">${r.team.name.toUpperCase()}</span></div></td>
            <td style="color:var(--dim);font-size:.88rem">${r.team.hqFull || r.team.hq}</td>
            <td style="font-family:'F1DisplayBold',sans-serif">${Math.floor(truePwr)} <small style="color:var(--dim)">(${truePwr.toFixed(2)})</small></td>
            <td>${wins}</td>
            <td>${podiums}</td>
            <td class="pts">${r.points}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    <div class="foot">Official FIA Points System: 25-18-15-12-10-8-6-4-2-1 (+1 for Fastest Lap inside Top 10). Tie-breakers resolved by FIA countback (most wins, then 2nds, etc.).</div>`;

  root.querySelectorAll('[data-stand-drv]').forEach(row => {
    row.onclick = () => openDriverDossierModal(row.dataset.standDrv, () => render(root));
  });
}
