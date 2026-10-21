// SPONSORS & STAFF — the money pillar and the people pillar (SPEC §6).
// Only the 2 active sponsors show objective cards; the other two pay quietly.
import { sponsorsOfTeam, totalSponsorValue } from '../data/sponsorsAndEngines.js?v=20261022b';
import { teamById } from '../data/teamsAndDrivers.js?v=20261022b';
import { STAFF } from '../data/facilitiesCatalog.js?v=20261022b';
import { getState, save, log } from '../engine/store.js?v=20261022b';
import { topbarHTML, fmt$ } from './shared.js?v=20261022b';

let msg = '', msgErr = false;

export function render(root) {
  const s = getState();
  const board = sponsorsOfTeam(s.teamId);
  const total = totalSponsorValue(s.teamId);
  root.innerHTML = `${topbarHTML(true)}
    <h1 class="page">SPONSORS & STAFF</h1>
    <div class="sub">${teamById(s.teamId).name} board: ${fmt$(total)} — signing ${fmt$(total * 0.3)} (paid Day 1) · weekly ${fmt$(total * 0.4)} across the season · goals ${fmt$(total * 0.3)}.</div>
    ${msg ? `<div class="${msgErr ? 'err' : 'sub'}" style="${msgErr ? '' : 'color:var(--green)'}">${msg}</div>` : ''}
    <div class="dept">Sponsors</div>
    <div class="pickgrid">
      ${board.map(sp => {
        const active = s.activeSponsors.includes(sp.id);
        return `<div class="pick ${active ? 'on' : ''}">
          ${sp.logo ? `<img class="logo" src="${sp.logo}" alt="${sp.name}">` : ''}
          <div class="pt">${sp.name}</div>
          <div class="ps">${sp.role} · ${sp.objectiveType}</div>
          <div class="pv">${fmt$(sp.value)} / season</div>
          <div class="ps">${active && sp.objective ? `<b style="color:#fff">Objective:</b> ${sp.objective}` : 'Pays in the background — no objective card.'}</div>
        </div>`;
      }).join('')}
    </div>
    <div class="dept">Staff</div>
    ${STAFF.map(role => {
      const owned = s.staff[role.id] || 0;
      return `<div class="trow"><div style="min-width:230px;flex:1">
          <div class="tt">${role.name} ${owned ? `<span class="tag good">TIER ${owned}</span>` : ''}</div>
          <div class="ts">${role.tiers.filter(t => t.tier > owned).map(t => `Tier ${t.tier}: ${t.effect}`).join(' · ') || 'Top tier hired'}</div>
        </div>
        ${role.tiers.filter(t => t.tier > owned).map(t => `<button class="btn small" data-hire="${role.id}:${t.tier}:${t.cost}">HIRE T${t.tier} · ${fmt$(t.cost)}</button>`).join('')}
      </div>`;
    }).join('')}
    <div class="foot">Staff are hired instantly (people, not construction) — their effects apply in the engines automatically.</div>`;
  root.querySelectorAll('[data-hire]').forEach(b => b.onclick = () => {
    const [id, tier, cost] = b.dataset.hire.split(':');
    if (s.cash < +cost) { msg = `Not enough cash (need ${fmt$(+cost)})`; msgErr = true; render(root); return; }
    s.cash = +(s.cash - +cost).toFixed(2);
    s.staff[id] = +tier;
    log('staff-hired', { staff: id, tier: +tier, cost: +cost });
    save();
    msg = `${STAFF.find(r => r.id === id).name} Tier ${tier} hired.`; msgErr = false;
    render(root);
  });
}
