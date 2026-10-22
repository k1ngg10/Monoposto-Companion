// CHAMPIONSHIP CREATION — one scrolling desktop page, in the order the user
// asked for (2026-10-21): pick your team on a card slider (the approved
// PU-card component design), the page then scrolls itself down to the power
// unit section — blurred and locked until a team is confirmed — then the
// remaining selections, then START. The team is chosen HERE, once; every
// other screen reads it from the save. Works teams (Ferrari, Mercedes,
// Red Bull Ford, Audi, Porsche) build their own PU: their section shows the
// in-house unit locked in, no customer choice (SPEC §3).
import { TEAMS, teamById, tierOf, ENTRY_TIERS, driversOfTeam, logoOf } from '../data/teamsAndDrivers.js?v=20261022b';
import { PU_SUPPLIERS, puById, OWNER_BACKGROUNDS, sponsorsOfTeam, totalSponsorValue } from '../data/sponsorsAndEngines.js?v=20261022b';
import { newSave } from '../engine/store.js?v=20261022b';
import { applyTheme } from '../engine/themeEngine.js?v=20261022b';
import { fmt$ } from './shared.js?v=20261022b';

// Performance order, same as the Matrix.
const speedSum = t => driversOfTeam(t.id).reduce((a, d) => a + d.speed, 0);
const ORDER = [...TEAMS].sort((a, b) => b.carPower - a.carPower || speedSum(b) - speedSum(a));
const CUSTOMER_PUS = PU_SUPPLIERS.filter(p => p.id !== 'porsche');
const PU_WELLS = {
  mercedes: 'linear-gradient(160deg,#e4e6eb,#aeb3bc)',
  porsche: 'linear-gradient(160deg,#fafaf7,#dcd9d0)',
  ferrari: 'linear-gradient(160deg,#33100f,#150707)',
  redbullford: 'linear-gradient(160deg,#1c2547,#0b0f22)',
  audi: 'linear-gradient(160deg,#2b2b30,#131316)',
  honda: '#000000'
};

const W = { teamIdx: 0, puIdx: 0, team: null, bg: null, sponsors: [] };
let rootEl = null;

function defaultPuIdx(team) {
  const i = CUSTOMER_PUS.findIndex(p => p.id === team.pu);
  return i >= 0 ? i : 0;
}
function chosenPu() {
  const team = W.team ? teamById(W.team) : null;
  if (!team) return null;
  return team.works ? puById(team.pu) : CUSTOMER_PUS[W.puIdx];
}

function logoWell(team) {
  const src = logoOf(team);
  if (!src) return `<span class="wz-wellword" style="color:${team.color}">${team.short}</span>`;
  return `<img class="wz-logo${team.logoBlend ? ' blend' : ''}" src="${src}" alt="${team.name} logo">`;
}

function teamCardHTML(team) {
  const tier = ENTRY_TIERS[tierOf(team)];
  const [d1, d2] = driversOfTeam(team.id);
  const drv = d => `<div class="wz-drv"><span class="mx-num" style="background:${team.color}">${d.no}</span>
    <span class="wz-drvname"><span class="fn">${d.first}</span> <span class="ln">${d.last}</span></span>
    <span class="wz-drvstats">SPD <b>${d.speed}</b> · RSK <b>${d.risk}</b></span></div>`;
  const wellBg = team.wellBg || `linear-gradient(160deg, ${team.color}40, #101014 78%)`;
  return `<div class="wz-well" style="background:${wellBg}">${logoWell(team)}</div>
    <div class="wz-cbody">
      <div class="wz-sname">${team.name.toUpperCase()}</div>
      <div class="wz-ssub">${tier.label} · ${team.works ? 'Works team — own PU' : 'Customer team'}</div>
      <div class="wz-stat"><div class="wz-srow"><span class="wz-lbl">Car Power</span><span class="wz-val">${team.carPower} / 10</span></div>
        <div class="wz-bar power"><i data-w="${team.carPower * 10}"></i></div></div>
      <div class="wz-drvh">DRIVERS</div>
      ${drv(d1)}${drv(d2)}
      <div class="wz-divider"></div>
      <div class="wz-footrow"><span>START <b>${tier.rp} RP</b></span><span>FAN RATING <b>${tier.fan}</b></span></div>
    </div>`;
}

function puCardHTML(pu, works) {
  return `<div class="wz-well" style="background:${PU_WELLS[pu.id] || `linear-gradient(160deg,#2b2b30,#131316)`}">
      ${pu.logo ? `<img class="wz-logo pu${pu.id === 'honda' ? ' blend' : ''}" src="${pu.logo}" alt="${pu.name} logo">` : `<span class="wz-wellword">${pu.name.toUpperCase()}</span>`}</div>
    <div class="wz-cbody">
      <div class="wz-sname">${pu.name.toUpperCase()}</div>
      <div class="wz-stat"><div class="wz-srow"><span class="wz-lbl">Performance</span><span class="wz-val">${pu.performance}</span></div>
        <div class="wz-bar perf"><i data-w="${pu.performance}"></i></div></div>
      <div class="wz-stat"><div class="wz-srow"><span class="wz-lbl">Durability</span><span class="wz-val">${pu.durability}</span></div>
        <div class="wz-bar dur"><i data-w="${pu.durability}"></i></div></div>
      <div class="wz-divider"></div>
      <div class="wz-cost"><div class="wz-costlbl">CONTRACT COST</div>
        <div class="wz-costnum">${works ? 'IN-HOUSE' : `<span class="wz-cur">$</span>${pu.cost.toFixed(1)}M`}</div></div>
    </div>`;
}

function sliderHTML(kind, idx, count) {
  return `<div class="wz-stage" id="wz-${kind}-stage" tabindex="0">
    <button class="wz-arrow" id="wz-${kind}-prev" aria-label="Previous">‹</button>
    <div class="wz-card" id="wz-${kind}-card"></div>
    <button class="wz-arrow" id="wz-${kind}-next" aria-label="Next">›</button>
  </div>
  <div class="wz-dots" id="wz-${kind}-dots">${Array.from({ length: count }, (_, i) => `<button class="wz-dot ${i === idx ? 'on' : ''}" data-${kind}-dot="${i}" aria-label="Item ${i + 1}"></button>`).join('')}</div>`;
}

// The confirm button must always name the team on the card RIGHT NOW —
// flipping updates the card via fillSlider, so the label syncs here too.
// (Bug found by the user, 2026-10-22: the button kept the first team's
// name while flipping, so the engine step never unlocked for the team
// he was actually looking at.)
function syncConfirmBtn() {
  const btn = rootEl.querySelector('#wz-confirm-team');
  if (!btn) return;
  const pending = ORDER[W.teamIdx];
  btn.textContent = (W.team && W.team === pending.id)
    ? `✓ YOUR TEAM — ${pending.name.toUpperCase()}`
    : `RACE WITH ${pending.name.toUpperCase()} →`;
}

function fillSlider(kind) {
  const card = rootEl.querySelector(`#wz-${kind}-card`);
  if (!card) return;
  if (kind === 'team') { card.innerHTML = teamCardHTML(ORDER[W.teamIdx]); syncConfirmBtn(); }
  else {
    const team = teamById(W.team);
    card.innerHTML = puCardHTML(team.works ? puById(team.pu) : CUSTOMER_PUS[W.puIdx], team.works);
  }
  rootEl.querySelectorAll(`[data-${kind}-dot]`).forEach((d, i) => d.classList.toggle('on',
    i === (kind === 'team' ? W.teamIdx : W.puIdx)));
  const sel = rootEl.querySelector(`#wz-${kind}-sel`);
  if (sel && kind === 'pu') {
    const team = teamById(W.team), pu = chosenPu();
    sel.textContent = team.works ? `${team.name} runs its own power unit — nothing to buy.` : `Selected engine: ${pu.name} — ${fmt$(pu.cost)} contract (draft figure). Flip the card to change it.`;
  }
  animateBars(card);
}
function animateBars(scope) {
  if (typeof requestAnimationFrame !== 'function') { scope.querySelectorAll('.wz-bar i').forEach(i => i.style.width = i.dataset.w + '%'); return; }
  requestAnimationFrame(() => requestAnimationFrame(() => {
    scope.querySelectorAll('.wz-bar i').forEach(i => i.style.width = i.dataset.w + '%');
  }));
}
function flip(kind, dir) {
  if (kind === 'team') {
    W.teamIdx = (W.teamIdx + dir + ORDER.length) % ORDER.length;
  } else {
    const team = teamById(W.team);
    if (!team || team.works) return;
    W.puIdx = (W.puIdx + dir + CUSTOMER_PUS.length) % CUSTOMER_PUS.length;
  }
  fillSlider(kind);
}

export function render(root) {
  rootEl = root;
  W.teamIdx = Math.max(0, ORDER.findIndex(t => t.id === 'porsche'));
  W.puIdx = 0; W.team = null; W.bg = null; W.sponsors = [];
  draw();
}

function draw() {
  const root = rootEl;
  const team = W.team ? teamById(W.team) : null;
  const pending = ORDER[W.teamIdx];
  const tier = team ? ENTRY_TIERS[tierOf(team)] : null;
  const pu = chosenPu();
  const board = team ? sponsorsOfTeam(team.id) : [];
  const boardTotal = team ? totalSponsorValue(team.id) : 0;
  const ready = !!(team && W.bg && W.sponsors.length === 2 && pu);
  let engineInner = '<div class="wz-stage"><div class="wz-card wz-ghost"></div></div>';
  if (team && team.works) engineInner = '<div class="wz-stage"><div class="wz-card" id="wz-pu-card"></div></div>';
  else if (team) engineInner = sliderHTML('pu', W.puIdx, CUSTOMER_PUS.length) + '<p class="wz-hint">Arrows, dots, or ← →</p>';

  root.innerHTML = `<div class="wz-wrap">
    <span class="wz-tag">NEW CHAMPIONSHIP</span>
    <h1 class="wz-title">BUILD YOUR 2026 SEASON</h1>
    <p class="wz-sub">Pick your team, then your engine — the page walks you down. Everything after that is the championship itself.</p>
    <div class="foot" style="margin:0 0 8px">Testing? <a href="#" id="wz-demo">Create the S1 Porsche save instantly →</a></div>

    <section class="wz-section" id="wz-sec-team">
      <div class="wz-secnum">STEP 1</div>
      <h2 class="wz-sec">CHOOSE YOUR TEAM</h2>
      <p class="wz-secsub">Flip through all 12 teams — car power, both drivers, starting RP. Picked once, for the whole championship; there is no switching later.</p>
      ${sliderHTML('team', W.teamIdx, ORDER.length)}
      <p class="wz-hint">Arrows, dots, or click the stage and use ← →</p>
      <button class="btn primary wz-confirm" id="wz-confirm-team">${team && team.id === pending.id ? `✓ YOUR TEAM — ${team.name.toUpperCase()}` : `RACE WITH ${pending.name.toUpperCase()} →`}</button>
    </section>

    <section class="wz-section" id="wz-sec-engine">
      <div class="wz-secnum">STEP 2</div>
      <h2 class="wz-sec">POWER UNIT</h2>
      <p class="wz-secsub">${team ? (team.works ? `${team.name} is a works team — you build your own engine.` : 'Customer team — choose your engine supplier. The card you stop on is your engine.') : 'Locked until you choose your team.'}</p>
      <div class="wz-lockwrap ${team ? '' : 'locked'}">
        ${engineInner}
        ${team ? '' : '<div class="wz-lockchip">SELECT YOUR TEAM FIRST</div>'}
      </div>
      ${team ? `<p class="wz-sel" id="wz-pu-sel"></p>` : ''}
    </section>

    <section class="wz-section" id="wz-sec-details">
      <div class="wz-secnum">STEP 3</div>
      <h2 class="wz-sec">FINAL DETAILS</h2>
      <p class="wz-secsub">Owner background and your 2 active sponsors — every team has its own board; the rest pay in the background, no objective cards.</p>
      <div class="wz-lockwrap ${team ? '' : 'locked'}">
        <div class="wz-deth">OWNER BACKGROUND</div>
        <div class="pickgrid">${OWNER_BACKGROUNDS.map(b => `
          <button class="pick ${W.bg === b.id ? 'on' : ''}" data-bg="${b.id}">
            <div class="pt">${b.name}</div><div class="ps">${b.perk}</div></button>`).join('')}
        </div>
        <div class="wz-deth" style="margin-top:22px">${team ? `${team.name.toUpperCase()} SPONSORS — PICK 2 OF ${board.length} · BOARD PAYS ${fmt$(boardTotal)} TOTAL` : 'TEAM SPONSORS'}</div>
        <div class="pickgrid">${board.map(sp => `
          <button class="pick ${W.sponsors.includes(sp.id) ? 'on' : ''}" data-sp="${sp.id}">
            ${sp.logo ? `<img class="logo" src="${sp.logo}" alt="${sp.name}">` : ''}
            <div class="pt">${sp.name}</div><div class="ps">${sp.role} · ${sp.objectiveType}</div>
            <div class="pv">${fmt$(sp.value)} / season</div></button>`).join('')}
        </div>
        ${team ? `<div class="wz-summary">
          <span><b>Team</b> ${team.name} (Power ${team.carPower})</span>
          <span><b>Engine</b> ${pu ? pu.name : '—'}</span>
          <span><b>Signing cash</b> ${fmt$(boardTotal * 0.30)}</span>
          <span><b>Start RP</b> ${tier.rp}</span>
          <span><b>Fan rating</b> ${tier.fan}</span>
        </div>` : ''}
        ${team ? '' : '<div class="wz-lockchip">SELECT YOUR TEAM FIRST</div>'}
      </div>
      <button class="btn primary wz-start" id="wz-start" ${ready ? '' : 'disabled'}>START CHAMPIONSHIP →</button>
      ${team && !ready ? '<div class="wz-hint">Pick an owner background and exactly 2 sponsors to start.</div>' : ''}
    </section>
  </div>`;

  // Sliders ---------------------------------------------------------------
  fillSlider('team');
  if (team) fillSlider('pu');
  const bindSlider = kind => {
    const prev = root.querySelector(`#wz-${kind}-prev`), next = root.querySelector(`#wz-${kind}-next`);
    if (prev) prev.onclick = () => flip(kind, -1);
    if (next) next.onclick = () => flip(kind, 1);
    root.querySelectorAll(`[data-${kind}-dot]`).forEach(d => d.onclick = () => {
      if (kind === 'team') W.teamIdx = +d.dataset.teamDot; else W.puIdx = +d.dataset.puDot;
      fillSlider(kind);
    });
    const stage = root.querySelector(`#wz-${kind}-stage`);
    if (stage) stage.onkeydown = e => {
      if (e.key === 'ArrowLeft') { flip(kind, -1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { flip(kind, 1); e.preventDefault(); }
    };
  };
  bindSlider('team');
  if (team && !team.works) bindSlider('pu');

  const confirmBtn = root.querySelector('#wz-confirm-team');
  if (confirmBtn) confirmBtn.onclick = () => {
    const picked = ORDER[W.teamIdx];
    const changed = W.team !== picked.id;
    W.team = picked.id;
    if (changed) { W.puIdx = defaultPuIdx(picked); W.sponsors = []; }
    draw();
    const sec = root.querySelector('#wz-sec-engine');
    if (sec && typeof sec.scrollIntoView === 'function') sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  root.querySelectorAll('[data-bg]').forEach(el => el.onclick = () => { W.bg = el.dataset.bg; draw(); });
  root.querySelectorAll('[data-sp]').forEach(el => el.onclick = () => {
    const id = el.dataset.sp;
    W.sponsors = W.sponsors.includes(id) ? W.sponsors.filter(x => x !== id)
      : W.sponsors.length < 2 ? [...W.sponsors, id] : W.sponsors;
    draw();
  });

  const start = root.querySelector('#wz-start');
  if (start) start.onclick = () => {
    if (!ready) return;
    const s = newSave({ teamId: W.team, ownerBg: W.bg, activeSponsors: W.sponsors, puId: pu.id });
    applyTheme(s.teamId);
    location.hash = '#/matrix';
  };
  const demo = root.querySelector('#wz-demo');
  if (demo) demo.onclick = e => {
    e.preventDefault();
    const s = newSave({ teamId: 'porsche', ownerBg: 'head-engineer', activeSponsors: ['applemusic', 'tagheuer'], puId: 'porsche' });
    applyTheme(s.teamId);
    location.hash = '#/matrix';
  };
}
