// STANDINGS — broadcast timing-tower tables, computed from logged results.
import { teamById } from '../data/teamsAndDrivers.js?v=20261022k';
import { getState } from '../engine/store.js?v=20261022k';
import { driverStandings, constructorStandings } from '../engine/raceSimulator.js?v=20261022k';
import { topbarHTML } from './shared.js?v=20261022k';

export function render(root) {
  const s = getState();
  const logged = Object.keys(s.results).length;
  const nameCell = d => `<div class="tname"><span class="bar" style="background:${teamById(d.team).color}"></span><span><span class="fn">${d.first}</span> <span class="ln">${d.last}</span></span></div>`;
  root.innerHTML = `${topbarHTML(true)}
    <h1 class="page">STANDINGS</h1>
    <div class="sub">${logged ? `After ${logged} logged round${logged === 1 ? '' : 's'}` : 'No results logged yet — standings fill in as you log race weekends.'}</div>
    <div class="dept">Drivers</div>
    <table class="tower"><tr><th>Pos</th><th>Driver</th><th>Team</th><th class="pts">Pts</th></tr>
      ${driverStandings(s).map((r, i) => `<tr class="${r.driver.team === s.teamId ? 'me' : ''}"><td>${i + 1}</td><td>${nameCell(r.driver)}</td><td>${teamById(r.driver.team).name}</td><td class="pts">${r.points}</td></tr>`).join('')}
    </table>
    <div class="dept">Constructors</div>
    <table class="tower"><tr><th>Pos</th><th>Team</th><th class="pts">Pts</th></tr>
      ${constructorStandings(s).map((r, i) => `<tr class="${r.team.id === s.teamId ? 'me' : ''}"><td>${i + 1}</td><td><div class="tname"><span class="bar" style="background:${r.team.color}"></span><span class="ln">${r.team.name.toUpperCase()}</span></div></td><td class="pts">${r.points}</td></tr>`).join('')}
    </table>
    <div class="foot">Only drivers whose results you've entered score points — full-grid entry arrives with the next build step.</div>`;
}
