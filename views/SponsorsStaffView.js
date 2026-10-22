// SPONSORS & STAFF — the money pillar and the people pillar (SPEC §6).
// Only the 2 active sponsors show objective cards; the other two pay 35% passive board retainer.
import { sponsorsOfTeam, puById, puContractCost, sponsorBreakdown, computeSponsorEconomy } from '../data/sponsorsAndEngines.js?v=20261022m';
import { teamById } from '../data/teamsAndDrivers.js?v=20261022m';
import { STAFF } from '../data/facilitiesCatalog.js?v=20261022m';
import { getState, save, log } from '../engine/store.js?v=20261022m';
import { topbarHTML, fmt$ } from './shared.js?v=20261022m';

let msg = '', msgErr = false;

export function render(root) {
  const s = getState();
  const team = teamById(s.teamId);
  const pu = puById(s.puId || team.pu);
  const puCost = puContractCost(team, pu);
  const board = sponsorsOfTeam(s.teamId);
  const spEcon = computeSponsorEconomy(s.teamId, s.activeSponsors);
  root.innerHTML = `${topbarHTML(true)}
    <h1 class="page">SPONSORS &amp; STAFF</h1>
    <div class="sub">${team.name} sponsor package — Day 1 Signing Cash <b style="color:var(--green)">+${fmt$(spEcon.signingCashM)}</b> · ${pu ? pu.name : 'Works'} PU <b style="color:#ff7a6e">−${fmt$(puCost)}</b> (${team.works ? 'In-House Works Cap Allocation' : 'Customer Supply Contract'}) · Weekly Sponsor Base <b style="color:#38b6ff">+$${spEcon.weeklyIncomeK}k/wk</b> across 38 weeks · Active Race Goal Pool <b style="color:var(--gold)">+$${spEcon.goalPerRaceK}k/race</b>.</div>
    ${msg ? `<div class="${msgErr ? 'err' : 'sub'}" style="${msgErr ? '' : 'color:var(--green)'}">${msg}</div>` : ''}
    <div class="dept">Sponsors (2 Primary Active · 2 Passive Board Retainers)</div>
    <div class="pickgrid wz-spgrid">
      ${board.map(sp => {
        const active = s.activeSponsors.includes(sp.id);
        const bk = sponsorBreakdown(sp);
        return `<div class="pick wz-sp-card ${active ? 'on' : ''}">
          <div class="wz-sp-well" style="background:${sp.logoBg || '#ffffff'}">
            ${sp.logo ? `<img class="wz-sp-logo" src="${sp.logo}" alt="${sp.name}" referrerpolicy="no-referrer">` : `<span class="wz-sp-word">${sp.name}</span>`}
          </div>
          <div class="wz-sp-headrow">
            <div class="pt">${sp.name}</div>
            <span class="wz-sp-strat">${sp.strategyTag || sp.role}</span>
          </div>
          <div class="ps">${sp.role} · ${sp.objectiveType}</div>
          <div class="wz-sp-breakdown">
            <div><span>Day 1 Signing Base</span><b>+${bk.signingText}</b></div>
            <div><span>Weekly Base (38 wks)</span><b class="weekly">${bk.weeklyText}</b></div>
            <div><span>Race Goal Bonus</span><b class="gold">${bk.goalText}</b></div>
          </div>
          <div class="ps wz-sp-goal">${active && sp.objective ? `<b style="color:#fff">Active Goal (100%):</b> ${sp.objective}` : '<b>Passive Board Partner:</b> Pays 35% signing &amp; weekly retainer automatically.'}</div>
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
