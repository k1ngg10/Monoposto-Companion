// START WIZARD — the championship creation flow (SPEC §3).
// The team is chosen HERE, once — with owner background, sponsors, facility
// investment tier and PU. Every other screen reads it from the save.
import { TEAMS, teamById, tierOf, ENTRY_TIERS } from '../data/teamsAndDrivers.js';
import { SPONSORS, PU_SUPPLIERS, OWNER_BACKGROUNDS, totalSponsorValue } from '../data/sponsorsAndEngines.js';
import { FACILITIES, facilityById } from '../data/facilitiesCatalog.js';
import { newSave } from '../engine/store.js';
import { applyTheme } from '../engine/themeEngine.js';
import { fmt$ } from './shared.js';

let step = 0;
const sel = { bg: null, team: null, sponsors: [], pu: null };
const STEPS = ['Owner Background', 'Team', 'Sponsors', 'Facilities', 'Power Unit', 'Confirm'];

function finish() {
  const s = newSave({ teamId: sel.team, ownerBg: sel.bg, activeSponsors: sel.sponsors, puId: sel.pu || teamById(sel.team).pu });
  applyTheme(s.teamId);
  location.hash = '#/hq';
}

export function render(root) {
  step = 0; sel.bg = null; sel.team = null; sel.sponsors = []; sel.pu = null;
  draw(root);
}

function nav(root, canNext, nextLabel = 'CONTINUE') {
  return `<div class="btnrow">
    ${step > 0 ? '<button class="btn small" id="w-back">← BACK</button>' : ''}
    <button class="btn small primary" id="w-next" ${canNext ? '' : 'disabled'}>${nextLabel}</button>
  </div><div class="err" id="w-err"></div>`;
}

function draw(root) {
  const team = sel.team ? teamById(sel.team) : null;
  let body = '';
  if (step === 0) {
    body = `<h1 class="page">START A NEW CHAMPIONSHIP</h1><div class="sub">Step 1 of 6 — who owns this team?</div>
      <div class="pickgrid">${OWNER_BACKGROUNDS.map(b => `
        <button class="pick ${sel.bg === b.id ? 'on' : ''}" data-bg="${b.id}">
          <div class="pt">${b.name}</div><div class="ps">${b.perk}</div></button>`).join('')}
      </div>${nav(root, !!sel.bg)}
      <div class="foot">Testing? <a href="#" id="w-demo">Create the S1 Porsche save instantly →</a></div>`;
  }
  if (step === 1) {
    body = `<h1 class="page">CHOOSE YOUR TEAM</h1><div class="sub">Step 2 of 6 — picked once, for the whole championship. There is no switching later.</div>
      <div class="pickgrid">${TEAMS.map(t => `
        <button class="pick ${sel.team === t.id ? 'on' : ''}" data-team="${t.id}">
          <div class="pt"><span class="swatch" style="background:${t.color}"></span>${t.name}</div>
          <div class="ps">Car Power ${t.carPower} · ${ENTRY_TIERS[tierOf(t)].label}${t.works ? ' · Works PU' : ''}</div>
          <div class="pv">${ENTRY_TIERS[tierOf(t)].rp} RP start</div></button>`).join('')}
      </div>${nav(root, !!sel.team)}`;
  }
  if (step === 2) {
    body = `<h1 class="page">SPONSORS</h1><div class="sub">Step 3 of 6 — the S1 board pays ${fmt$(totalSponsorValue())} total (30% signing / 40% weekly / 30% goals). Pick the <b>2 active sponsors</b> whose objectives you'll chase; the rest pay in the background.</div>
      <div class="pickgrid">${SPONSORS.map(sp => `
        <button class="pick ${sel.sponsors.includes(sp.id) ? 'on' : ''}" data-sp="${sp.id}">
          ${sp.logo ? `<img class="logo" src="${sp.logo}" alt="${sp.name}">` : ''}
          <div class="pt">${sp.name}</div><div class="ps">${sp.role} · ${sp.objectiveType}</div>
          <div class="pv">${fmt$(sp.value)} / season</div></button>`).join('')}
      </div>${nav(root, sel.sponsors.length === 2)}`;
  }
  if (step === 3) {
    const tier = ENTRY_TIERS[tierOf(team)];
    body = `<h1 class="page">FACILITY INVESTMENT</h1><div class="sub">Step 4 of 6 — your entry tier sets the starting HQ. Upgrades are bought later, in Facilities, and take calendar time.</div>
      <div class="pickgrid">${FACILITIES.map(f => `
        <div class="pick"><div class="pt">${f.name}</div><div class="ps">${f.blurb}</div>
        <div class="pv">Starts at Level ${tier.facilities[f.id]}</div></div>`).join('')}
      </div>${nav(root, true)}`;
  }
  if (step === 4) {
    if (team.works) {
      sel.pu = team.pu;
      const pu = PU_SUPPLIERS.find(p => p.id === team.pu);
      body = `<h1 class="page">POWER UNIT</h1><div class="sub">Step 5 of 6 — ${team.name} is a works team: you build your own PU, so there is nothing to buy.</div>
        <div class="pickgrid"><div class="pick on"><div class="pt">${pu ? pu.name : team.pu}</div>
        <div class="ps">Performance ${pu?.performance ?? '—'} · Durability ${pu?.durability ?? '—'}</div></div></div>${nav(root, true)}`;
    } else {
      body = `<h1 class="page">POWER UNIT</h1><div class="sub">Step 5 of 6 — customer team: choose your supplier.</div>
        <div class="pickgrid">${PU_SUPPLIERS.filter(p => p.id !== 'porsche').map(p => `
          <button class="pick ${sel.pu === p.id ? 'on' : ''}" data-pu="${p.id}">
            ${p.logo ? `<img class="logo" src="${p.logo}" alt="${p.name}">` : ''}
            <div class="pt">${p.name}</div><div class="ps">Performance ${p.performance} · Durability ${p.durability}</div></button>`).join('')}
        </div>${nav(root, !!sel.pu)}`;
    }
  }
  if (step === 5) {
    const tier = ENTRY_TIERS[tierOf(team)];
    body = `<h1 class="page">CONFIRM YOUR CHAMPIONSHIP</h1><div class="sub">Step 6 of 6 — this creates the save. Everything can be tuned later in the data files; the team cannot be changed.</div>
      <div class="glass" style="padding:20px 22px; line-height:2">
        <div><b>Team:</b> ${team.name} (Power ${team.carPower} · ${tier.label})</div>
        <div><b>Owner:</b> ${OWNER_BACKGROUNDS.find(b => b.id === sel.bg).name}</div>
        <div><b>Active sponsors:</b> ${sel.sponsors.map(id => SPONSORS.find(s => s.id === id).name).join(' + ')}</div>
        <div><b>Power unit:</b> ${(PU_SUPPLIERS.find(p => p.id === (sel.pu || team.pu)) || {}).name || team.pu}</div>
        <div><b>Starting cash:</b> ${fmt$(totalSponsorValue() * 0.30)} (signing bonus) · <b>RP:</b> ${tier.rp} · <b>Fan rating:</b> ${tier.fan}</div>
      </div>${nav(root, true, 'START CHAMPIONSHIP')}`;
  }
  root.innerHTML = body;

  root.querySelectorAll('[data-bg]').forEach(el => el.onclick = () => { sel.bg = el.dataset.bg; draw(root); });
  root.querySelectorAll('[data-team]').forEach(el => el.onclick = () => { sel.team = el.dataset.team; sel.pu = null; draw(root); });
  root.querySelectorAll('[data-sp]').forEach(el => el.onclick = () => {
    const id = el.dataset.sp;
    sel.sponsors = sel.sponsors.includes(id) ? sel.sponsors.filter(x => x !== id)
      : sel.sponsors.length < 2 ? [...sel.sponsors, id] : sel.sponsors;
    draw(root);
  });
  root.querySelectorAll('[data-pu]').forEach(el => el.onclick = () => { sel.pu = el.dataset.pu; draw(root); });
  const back = root.querySelector('#w-back');
  if (back) back.onclick = () => { step--; draw(root); };
  const next = root.querySelector('#w-next');
  if (next) next.onclick = () => { if (step === 5) finish(); else { step++; draw(root); } };
  const demo = root.querySelector('#w-demo');
  if (demo) demo.onclick = e => {
    e.preventDefault();
    sel.bg = 'head-engineer'; sel.team = 'porsche'; sel.sponsors = ['applemusic', 'tagheuer']; sel.pu = 'porsche';
    finish();
  };
}
