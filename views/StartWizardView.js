// CHAMPIONSHIP CREATION — one scrolling desktop/mobile page:
// Step 1: 12-team slider card.
// Step 2: Power Unit lock-in card (deducts Works In-House Cap Allocation or Customer Engine Contract from Day 1 Signing Cash).
// Step 3: Owner Background, 4 Sponsor cards (with inverse Upfront Base vs Weekly Cashflow trade-offs & high-contrast logo wells),
//         and the 3 F1 My Team Starting Baseline Toggles (Facilities, Car Development, Cash Reserves).
import { TEAMS, teamById, tierOf, ENTRY_TIERS, driversOfTeam, logoOf } from '../data/teamsAndDrivers.js?v=20261022j';
import {
  PU_SUPPLIERS,
  puById,
  puContractCost,
  OWNER_BACKGROUNDS,
  sponsorsOfTeam,
  sponsorBreakdown,
  computeSponsorEconomy
} from '../data/sponsorsAndEngines.js?v=20261022j';
import { STARTER_DEV_PRESETS } from '../data/partsCatalog.js?v=20261022j';
import {
  newSave,
  FACILITY_BASELINE_PRESETS,
  CASH_RESERVE_PRESETS
} from '../engine/store.js?v=20261022j';
import { applyTheme } from '../engine/themeEngine.js?v=20261022j';
import { fmt$ } from './shared.js?v=20261022j';

const speedSum = t => driversOfTeam(t.id).reduce((a, d) => a + d.speed, 0);
const ORDER = [...TEAMS].sort((a, b) => b.carPower - a.carPower || speedSum(b) - speedSum(a));
const CUSTOMER_PUS = PU_SUPPLIERS.filter(p => p.id !== 'porsche');
const PU_WELLS = {
  mercedes: 'linear-gradient(160deg,#e4e6eb,#aeb3bc)',
  porsche: '#ffffff',
  ferrari: 'linear-gradient(160deg,#33100f,#150707)',
  redbullford: 'linear-gradient(160deg,#1c2547,#0b0f22)',
  audi: 'linear-gradient(160deg,#2b2b30,#131316)',
  honda: '#000000'
};

const W = {
  teamIdx: 0,
  puIdx: 0,
  team: null,
  pu: null,
  bg: null,
  sponsors: [],
  facilityBaseline: 'basic',
  carDevBaseline: 'none',
  cashBaseline: 'none'
};
let rootEl = null;

function defaultPuIdx(team) {
  const i = CUSTOMER_PUS.findIndex(p => p.id === team.pu);
  return i >= 0 ? i : 0;
}
function pendingPu() {
  const team = W.team ? teamById(W.team) : null;
  if (!team) return null;
  return team.works ? puById(team.pu) : CUSTOMER_PUS[W.puIdx];
}
function chosenPu() {
  const team = W.team ? teamById(W.team) : null;
  if (!team) return null;
  if (team.works) return puById(team.pu);
  return W.pu ? puById(W.pu) : null;
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
      <div class="wz-ssub">${tier.label} · ${team.works ? 'Works team — in-house PU' : 'Customer team'}</div>
      <div class="wz-stat"><div class="wz-srow"><span class="wz-lbl">Car Power</span><span class="wz-val">${team.carPower} / 10</span></div>
        <div class="wz-bar power"><i data-w="${team.carPower * 10}"></i></div></div>
      <div class="wz-drvh">DRIVERS</div>
      ${drv(d1)}${drv(d2)}
      <div class="wz-divider"></div>
      <div class="wz-footrow"><span>START <b>${tier.rp} RP</b></span><span>FAN RATING <b>${tier.fan}</b></span></div>
    </div>`;
}

function puCardHTML(team, pu, isLockedIn) {
  const works = team.works;
  const cost = puContractCost(team, pu);
  const statusBadge = isLockedIn
    ? `<div class="wz-pubadge locked">✓ LOCKED IN · −${fmt$(cost)} ${works ? '(WORKS CAP ALLOCATION)' : 'FROM BANK'}</div>`
    : `<div class="wz-pubadge">${works ? 'CLICK TO CONFIRM IN-HOUSE PU ALLOCATION' : 'CLICK CARD OR BUTTON BELOW TO SELECT'}</div>`;
  return `<div class="wz-well" style="background:${PU_WELLS[pu.id] || `linear-gradient(160deg,#2b2b30,#131316)`}">
      ${pu.logo ? `<img class="wz-logo pu${pu.id === 'honda' ? ' blend' : ''}" src="${pu.logo}" alt="${pu.name} logo">` : `<span class="wz-wellword">${pu.name.toUpperCase()}</span>`}</div>
    <div class="wz-cbody">
      <div class="wz-sname">${pu.name.toUpperCase()}</div>
      <div class="wz-stat"><div class="wz-srow"><span class="wz-lbl">Performance</span><span class="wz-val">${pu.performance}</span></div>
        <div class="wz-bar perf"><i data-w="${pu.performance}"></i></div></div>
      <div class="wz-stat"><div class="wz-srow"><span class="wz-lbl">Durability</span><span class="wz-val">${pu.durability}</span></div>
        <div class="wz-bar dur"><i data-w="${pu.durability}"></i></div></div>
      <div class="wz-divider"></div>
      <div class="wz-cost"><div class="wz-costlbl">${works ? 'IN-HOUSE PU CAP ALLOCATION' : 'CUSTOMER CONTRACT COST'}</div>
        <div class="wz-costnum"><span class="wz-cur">$</span>${cost.toFixed(1)}M</div></div>
      ${statusBadge}
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

function syncConfirmBtn() {
  const btn = rootEl.querySelector('#wz-confirm-team');
  if (!btn) return;
  const pending = ORDER[W.teamIdx];
  const isLocked = W.team && W.team === pending.id;
  btn.classList.toggle('is-locked', !!isLocked);
  btn.textContent = isLocked
    ? `✓ YOUR TEAM — ${pending.name.toUpperCase()}`
    : `RACE WITH ${pending.name.toUpperCase()} →`;
}

function syncPuConfirmBtn() {
  const team = W.team ? teamById(W.team) : null;
  if (!team) return;
  const curPu = pendingPu();
  const isLocked = W.pu === curPu.id;
  const spEcon = computeSponsorEconomy(team.id, W.sponsors);
  const signingCash = spEcon.signingCashM;
  const cost = puContractCost(team, curPu);
  const reserve = CASH_RESERVE_PRESETS[W.cashBaseline]?.cashM || 0;
  const afterBank = +(signingCash - cost + reserve).toFixed(2);

  const card = rootEl.querySelector('#wz-pu-card');
  if (card) card.classList.toggle('on', isLocked);

  const btn = rootEl.querySelector('#wz-confirm-pu');
  if (btn) {
    btn.classList.toggle('is-locked', isLocked);
    if (team.works) {
      btn.textContent = isLocked
        ? `✓ LOCKED IN — ${curPu.name.toUpperCase()} (−${fmt$(cost)} WORKS CAP ALLOCATION)`
        : `LOCK IN ${curPu.name.toUpperCase()} (${fmt$(cost)} WORKS ALLOCATION) →`;
    } else {
      btn.textContent = isLocked
        ? `✓ LOCKED IN — ${curPu.name.toUpperCase()} (−${fmt$(cost)} CUT FROM BANK)`
        : `BUY & LOCK IN ${curPu.name.toUpperCase()} (${fmt$(cost)}) →`;
    }
  }

  const bank = rootEl.querySelector('#wz-pu-bank');
  if (bank) {
    const lockedObj = W.pu ? puById(W.pu) : null;
    bank.innerHTML = `
      <div class="wz-bankcell"><span>Day 1 Signing Cash</span><b>+${fmt$(signingCash)}</b></div>
      <div class="wz-bankcell"><span>${curPu.name} (${team.works ? 'Works Cap' : 'Contract'})</span><b class="neg">−${fmt$(cost)}</b></div>
      <div class="wz-bankcell"><span>Bank After Engine</span><b class="pos">${fmt$(afterBank)}</b></div>
      <div class="wz-bankstatus ${isLocked ? 'on' : ''}">${isLocked ? `✓ ${curPu.name.toUpperCase()} LOCKED IN` : (lockedObj ? `LOCKED: ${lockedObj.name.toUpperCase()} · CLICK BELOW TO SWITCH` : 'NOT LOCKED IN YET — CLICK BELOW TO BUY')}</div>
    `;
  }

  const sel = rootEl.querySelector('#wz-pu-sel');
  if (sel) {
    const lockedObj = W.pu ? puById(W.pu) : null;
    if (team.works) {
      sel.textContent = `${team.name} manufactures its own ${curPu.name} power unit in-house under the $213M F1 Cost Cap (−${fmt$(cost)} Day 1 factory PU allocation). Net starting bank before optional reserves: ${fmt$(signingCash - cost)}.`;
    } else if (lockedObj) {
      const lCost = puContractCost(team, lockedObj);
      sel.textContent = `Locked engine: ${lockedObj.name} — ${fmt$(lCost)} deducted from Day 1 signing cash (${fmt$(signingCash)} → ${fmt$(signingCash - lCost)} net before reserves).`;
    } else {
      sel.textContent = `Previewing ${curPu.name} (${fmt$(cost)}). Click the button above or the engine card to lock in your choice and deduct ${fmt$(cost)} from your bank.`;
    }
  }
}

function fillSlider(kind) {
  const card = rootEl.querySelector(`#wz-${kind}-card`);
  if (!card) return;
  if (kind === 'team') {
    card.innerHTML = teamCardHTML(ORDER[W.teamIdx]);
    card.classList.toggle('on', W.team === ORDER[W.teamIdx].id);
    syncConfirmBtn();
  } else {
    const team = teamById(W.team);
    const curPu = pendingPu();
    card.innerHTML = puCardHTML(team, curPu, W.pu === curPu.id);
    syncPuConfirmBtn();
  }
  rootEl.querySelectorAll(`[data-${kind}-dot]`).forEach((d, i) => d.classList.toggle('on',
    i === (kind === 'team' ? W.teamIdx : W.puIdx)));
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
  W.puIdx = 0;
  W.team = null;
  W.pu = null;
  W.bg = null;
  W.sponsors = [];
  W.facilityBaseline = 'basic';
  W.carDevBaseline = 'none';
  W.cashBaseline = 'none';
  draw();
}

function draw() {
  const root = rootEl;
  const team = W.team ? teamById(W.team) : null;
  const pending = ORDER[W.teamIdx];
  const tier = team ? ENTRY_TIERS[tierOf(team)] : null;
  const pu = chosenPu();
  const board = team ? sponsorsOfTeam(team.id) : [];
  const spEcon = team ? computeSponsorEconomy(team.id, W.sponsors) : { signingCashM: 0, weeklyIncomeK: 0, goalPerRaceK: 0, totalContractM: 0 };
  const signingCash = spEcon.signingCashM;
  const puCost = (team && pu) ? puContractCost(team, pu) : 0;
  const facPreset = FACILITY_BASELINE_PRESETS[W.facilityBaseline] || FACILITY_BASELINE_PRESETS.basic;
  const devPreset = STARTER_DEV_PRESETS[W.carDevBaseline] || STARTER_DEV_PRESETS.none;
  const cashPreset = CASH_RESERVE_PRESETS[W.cashBaseline] || CASH_RESERVE_PRESETS.none;
  const startingCash = +(signingCash - puCost + cashPreset.cashM).toFixed(2);
  const startTruePower = team ? +(team.carPower + devPreset.dp / 100).toFixed(2) : 0;

  const detailsUnlocked = !!(team && pu);
  const ready = !!(team && pu && W.bg && W.sponsors.length === 2);

  let engineInner = '<div class="wz-stage"><div class="wz-card wz-ghost"></div></div><p class="wz-hint">Select your team in Step 1 to unlock Power Unit selection.</p>';
  if (team && team.works) {
    engineInner = `<div class="wz-stage"><div class="wz-card wz-clickable" id="wz-pu-card"></div></div>
      <p class="wz-hint">Works team — in-house factory PU allocation under the $213M F1 Cost Cap.</p>
      <div class="wz-bankbar" id="wz-pu-bank"></div>
      <button class="btn primary wz-confirm" id="wz-confirm-pu"></button>`;
  } else if (team) {
    engineInner = `${sliderHTML('pu', W.puIdx, CUSTOMER_PUS.length)}
      <p class="wz-hint">Swipe with arrows or dots, then click the engine card or button below to lock in your power unit.</p>
      <div class="wz-bankbar" id="wz-pu-bank"></div>
      <button class="btn primary wz-confirm" id="wz-confirm-pu"></button>`;
  }

  root.innerHTML = `<div class="wz-wrap">
    <span class="wz-tag">NEW CHAMPIONSHIP</span>
    <h1 class="wz-title">BUILD YOUR 2026 SEASON</h1>
    <p class="wz-sub">Pick your team, lock in your engine, and configure your F1 My Team starting baselines.</p>
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
      <p class="wz-secsub">${team ? (team.works ? `${team.name} is a works manufacturer — your In-House PU R&D & Dyno Allocation is deducted from your Day 1 Cost Cap budget.` : 'Customer team — browse the 5 suppliers and click to buy & lock in your engine. The contract cost is deducted from your Day 1 bank balance.') : 'Locked until you choose your team.'}</p>
      <div class="wz-lockwrap ${team ? '' : 'locked'}">
        ${engineInner}
        ${team ? '' : '<div class="wz-lockchip">SELECT YOUR TEAM FIRST</div>'}
      </div>
      ${team ? `<p class="wz-sel" id="wz-pu-sel"></p>` : ''}
    </section>

    <section class="wz-section" id="wz-sec-details">
      <div class="wz-secnum">STEP 3</div>
      <h2 class="wz-sec">FINAL DETAILS &amp; STARTING BASELINES</h2>
      <p class="wz-secsub">Select your owner background, pick 2 active sponsors (choose between High Day 1 Base vs. High Weekly Cashflow), and set your starting facility, car development, and cash reserve baselines.</p>
      <div class="wz-lockwrap ${detailsUnlocked ? '' : 'locked'}">
        <div class="wz-deth">OWNER BACKGROUND</div>
        <div class="pickgrid">${OWNER_BACKGROUNDS.map(b => `
          <button class="pick ${W.bg === b.id ? 'on' : ''}" data-bg="${b.id}">
            <div class="pt">${b.name}</div><div class="ps">${b.perk}</div></button>`).join('')}
        </div>

        <div class="wz-deth" style="margin-top:24px">${team ? `${team.name.toUpperCase()} SPONSORS — PICK 2 PRIMARY OF ${board.length} · DAY 1 SIGNING +${fmt$(signingCash)} · WEEKLY +$${spEcon.weeklyIncomeK}k/WK` : 'TEAM SPONSORS'}</div>
        <div class="pickgrid wz-spgrid">${board.map(sp => {
          const bd = sponsorBreakdown(sp);
          const isPicked = W.sponsors.includes(sp.id);
          return `
          <button class="pick wz-sp-card ${isPicked ? 'on' : ''}" data-sp="${sp.id}">
            <div class="wz-sp-well" style="background:${sp.logoBg || '#ffffff'}">
              ${sp.logo ? `<img class="wz-sp-logo" src="${sp.logo}" alt="${sp.name}" referrerpolicy="no-referrer">` : `<span class="wz-sp-word">${sp.name}</span>`}
            </div>
            <div class="wz-sp-headrow">
              <div class="pt">${sp.name}</div>
              <span class="wz-sp-strat">${sp.strategyTag || sp.role}</span>
            </div>
            <div class="ps">${sp.role} · ${sp.objectiveType}</div>
            <div class="wz-sp-breakdown">
              <div><span>Day 1 Signing Base</span><b>+${bd.signingText}</b></div>
              <div><span>Weekly Base (38 wks)</span><b class="weekly">${bd.weeklyText}</b></div>
              <div><span>Race Goal Bonus</span><b class="gold">${bd.goalText}</b></div>
            </div>
            <div class="ps wz-sp-goal"><b style="color:#fff">Objective:</b> ${sp.objective || 'Score points at the Grand Prix'}</div>
          </button>`;
        }).join('')}
        </div>

        <div class="wz-deth" style="margin-top:26px">1. STARTING FACILITY INVESTMENT</div>
        <div class="pickgrid">${Object.values(FACILITY_BASELINE_PRESETS).map(fp => `
          <button class="pick ${W.facilityBaseline === fp.id ? 'on' : ''}" data-facbase="${fp.id}">
            <div class="pt">${fp.label}</div>
            <div class="pv">~${fp.weeklyRp} RP/wk · $${fp.costWkK}k/wk cost</div>
            <div class="ps">${fp.desc}</div>
          </button>`).join('')}
        </div>

        <div class="wz-deth" style="margin-top:22px">2. STARTING CAR DEVELOPMENT</div>
        <div class="pickgrid">${Object.values(STARTER_DEV_PRESETS).map(dp => `
          <button class="pick ${W.carDevBaseline === dp.id ? 'on' : ''}" data-devbase="${dp.id}">
            <div class="pt">${dp.label}</div>
            <div class="pv">+${dp.dp} DP (${dp.partIds.length} Phase-1 upgrades fitted)</div>
            <div class="ps">${dp.desc}</div>
          </button>`).join('')}
        </div>

        <div class="wz-deth" style="margin-top:22px">3. STARTING CASH RESERVES</div>
        <div class="pickgrid">${Object.values(CASH_RESERVE_PRESETS).map(cp => `
          <button class="pick ${W.cashBaseline === cp.id ? 'on' : ''}" data-cashbase="${cp.id}">
            <div class="pt">${cp.label}</div>
            <div class="pv">${cp.cashM > 0 ? `+${fmt$(cp.cashM)} Reserve` : '+$0.00M (Baseline)'}</div>
            <div class="ps">${cp.desc}</div>
          </button>`).join('')}
        </div>

        ${team ? `<div class="wz-summary">
          <span><b>Team</b> ${team.name}</span>
          <span><b>True Car Power</b> <em style="color:var(--green);font-style:normal">${startTruePower.toFixed(2)}</em> (Monoposto: ${Math.floor(startTruePower)})</span>
          <span><b>Engine</b> ${pu ? `${pu.name} (−${fmt$(puCost)})` : 'Not locked in'}</span>
          <span><b>Signing cash</b> +${fmt$(signingCash)}</span>
          ${pu ? `<span><b>Engine cost</b> <em style="color:#ff7a6e;font-style:normal">−${fmt$(puCost)}</em></span>` : ''}
          ${cashPreset.cashM > 0 ? `<span><b>Cash reserve</b> <em style="color:var(--gold);font-style:normal">+${fmt$(cashPreset.cashM)}</em></span>` : ''}
          <span><b>Starting bank</b> <em style="color:var(--green);font-style:normal">${fmt$(startingCash)}</em></span>
          <span><b>Sponsor Weekly</b> <em style="color:#38b6ff;font-style:normal">+$${spEcon.weeklyIncomeK}k/wk</em></span>
          <span><b>HQ Facilities</b> Phase ${facPreset.phase} (~${facPreset.weeklyRp} RP/wk · $${facPreset.costWkK}k/wk)</span>
          <span><b>Start RP</b> ${tier.rp}</span>
          <span><b>Fan rating</b> ${tier.fan}</span>
        </div>` : ''}
        ${detailsUnlocked ? '' : `<div class="wz-lockchip">${team ? 'LOCK IN YOUR POWER UNIT IN STEP 2 FIRST' : 'SELECT YOUR TEAM FIRST'}</div>`}
      </div>
      <button class="btn primary wz-start" id="wz-start" ${ready ? '' : 'disabled'}>START CHAMPIONSHIP →</button>
      ${team && !ready ? `<div class="wz-hint">${!pu ? 'Lock in your Power Unit in Step 2, then pick an owner background and 2 sponsors.' : 'Pick an owner background and exactly 2 sponsors to start.'}</div>` : ''}
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
    if (changed) {
      W.puIdx = defaultPuIdx(picked);
      W.pu = picked.works ? picked.pu : null;
      W.sponsors = [];
    }
    draw();
    const sec = root.querySelector('#wz-sec-engine');
    if (sec && typeof sec.scrollIntoView === 'function') sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const lockInPu = () => {
    if (!W.team) return;
    const cur = pendingPu();
    if (!cur) return;
    W.pu = cur.id;
    draw();
    const sec = root.querySelector('#wz-sec-details');
    if (sec && typeof sec.scrollIntoView === 'function') sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const confirmPuBtn = root.querySelector('#wz-confirm-pu');
  if (confirmPuBtn) confirmPuBtn.onclick = lockInPu;
  const puCard = root.querySelector('#wz-pu-card');
  if (puCard && team) {
    puCard.classList.add('wz-clickable');
    puCard.onclick = lockInPu;
  }

  root.querySelectorAll('[data-bg]').forEach(el => el.onclick = () => { W.bg = el.dataset.bg; draw(); });
  root.querySelectorAll('[data-sp]').forEach(el => el.onclick = () => {
    const id = el.dataset.sp;
    W.sponsors = W.sponsors.includes(id) ? W.sponsors.filter(x => x !== id)
      : W.sponsors.length < 2 ? [...W.sponsors, id] : W.sponsors;
    draw();
  });
  root.querySelectorAll('[data-facbase]').forEach(el => el.onclick = () => { W.facilityBaseline = el.dataset.facbase; draw(); });
  root.querySelectorAll('[data-devbase]').forEach(el => el.onclick = () => { W.carDevBaseline = el.dataset.devbase; draw(); });
  root.querySelectorAll('[data-cashbase]').forEach(el => el.onclick = () => { W.cashBaseline = el.dataset.cashbase; draw(); });

  const start = root.querySelector('#wz-start');
  if (start) start.onclick = () => {
    if (!ready) return;
    const s = newSave({
      teamId: W.team,
      ownerBg: W.bg,
      activeSponsors: W.sponsors,
      puId: pu.id,
      facilityBaseline: W.facilityBaseline,
      carDevBaseline: W.carDevBaseline,
      cashBaseline: W.cashBaseline
    });
    applyTheme(s.teamId);
    location.hash = '#/matrix';
  };
  const demo = root.querySelector('#wz-demo');
  if (demo) demo.onclick = e => {
    e.preventDefault();
    const s = newSave({
      teamId: 'porsche',
      ownerBg: 'head-engineer',
      activeSponsors: ['applemusic', 'tagheuer'],
      puId: 'porsche',
      facilityBaseline: 'basic',
      carDevBaseline: 'none',
      cashBaseline: 'none'
    });
    applyTheme(s.teamId);
    location.hash = '#/matrix';
  };
}
