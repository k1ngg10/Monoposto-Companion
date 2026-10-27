// HQ DASHBOARD — the advance-time agenda, active operations panel, and modal drawer.
// Includes frosted-glass panels over the F1 garage backdrop, non-stacking weekly tick cards,
// Two-Stage Race Weekend Hero Stop Card (Qualifying Session -> Grand Prix), Head of Engineering
// radio banner, dynamic constructor HQ city names, and the F1 game clockwise green sweep reticle.
import {
  getState,
  save,
  truePower,
  monopostoPower,
  wipe,
  exportJSON,
  importJSON,
  driverPriorityStatus,
  unmanufacturedBlueprints
} from '../engine/store.js?v=20261022m';
import { advance, agenda, prettyDate, fromISO, queueFacility, canAdvanceCalendar } from '../engine/timeEngine.js?v=20261022m';
import { nextRace, nextUnloggedRace, CALENDAR } from '../data/calendar2026.js?v=20261022m';
import { teamById } from '../data/teamsAndDrivers.js?v=20261022m';
import { puById, puContractCost, computeSponsorEconomy } from '../data/sponsorsAndEngines.js?v=20261022m';
import {
  FACILITY_BACKDROPS,
  FACILITY_BRANCHES,
  branchPhaseInfo,
  maxResearchSlots,
  maxManufactureSlots
} from '../data/facilitiesCatalog.js?v=20261022m';
import { DEPARTMENTS } from '../data/partsCatalog.js?v=20261022m';
import {
  researchQuote,
  startResearch,
  manufactureQuote,
  startManufacture
} from '../engine/rdEngine.js?v=20261022m';
import { topbarHTML, refreshHUD, floater, fmt$, openDeleteConfirmModal } from './shared.js?v=20261022m';

let running = false;
let rafId = null;
let dayStartTs = 0;
const DAY_SWEEP_MS = 1450; // Deliberate day-by-day pace (~1.45s per day) so player can stop on any day

let drawerMode = null; // null | 'research' | 'manufacture' | 'facility'
let drawerMsg = '', drawerErr = false;

const stop = () => {
  running = false;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  const ring = document.getElementById('ring');
  if (ring) {
    ring.classList.remove('is-advancing');
    ring.style.setProperty('--sweep-deg', '0deg');
  }
};

const GLYPH = { research: 'R', manufacture: 'D', facility: 'F', tick: 'W' };

// Calendar + down-arrow badge SVG matching reference video header
const SVG_DATE_CALENDAR = `
  <svg class="hq-cal-svg" viewBox="0 0 36 34" width="34" height="32" fill="none" aria-hidden="true">
    <path d="M5 7h22l-2.5 20H2.5L5 7z" stroke="#d8dce4" stroke-width="2" fill="rgba(255,255,255,0.03)"/>
    <path d="M4.5 12h22" stroke="#d8dce4" stroke-width="2"/>
    <line x1="10" y1="4" x2="9.5" y2="8" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/>
    <line x1="21" y1="4" x2="20.5" y2="8" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="8" y="15" width="3" height="2.5" fill="#d8dce4"/>
    <rect x="13.5" y="15" width="3" height="2.5" fill="#d8dce4"/>
    <rect x="19" y="15" width="3" height="2.5" fill="#d8dce4"/>
    <rect x="7.5" y="20" width="3" height="2.5" fill="#d8dce4"/>
    <rect x="13" y="20" width="3" height="2.5" fill="#d8dce4"/>
    <circle cx="26.5" cy="24.5" r="6.5" fill="#d8dce4" stroke="#0e1015" stroke-width="1.5"/>
    <path d="M23.8 23.3l2.7 3 2.7-3" stroke="#0e1015" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

function seasonLabel(s) {
  const yr = (s.season || 1) === 1 ? '2026' : '2027';
  const hqCity = teamById(s.teamId)?.hq || 'Factory';
  if (s.date < CALENDAR[0].sat) return `Pre-season · ${yr} · ${hqCity} HQ`;
  const nr = nextRace(s.date, s);
  return `Season ${s.season || 1} (${yr}) · Round ${nr ? nr.round : 22} of 22 · ${hqCity} HQ`;
}

function dateParts(iso) {
  const pretty = prettyDate(iso);
  const [ord, ...rest] = pretty.split(' ');
  return { ord, month: rest.join(' ') };
}

function daysBetween(isoA, isoB) {
  const a = fromISO(isoA), b = fromISO(isoB);
  return Math.max(0, Math.round((b - a) / 86400000));
}

function taskProgressPct(s, task) {
  if (!task.started || !task.due) return 35;
  const total = Math.max(1, daysBetween(task.started, task.due));
  const elapsed = Math.max(0, daysBetween(task.started, s.date));
  return Math.min(98, Math.max(8, Math.round((elapsed / total) * 100)));
}

// Finds the earliest unlogged race weekend if the calendar has reached its Saturday (or Qualifying is logged)
function activeRaceStop(s) {
  const pending = nextUnloggedRace(s);
  if (!pending) return null;
  if (s.date >= pending.sat || Boolean(s.quali?.[pending.round] || s.qualifying?.[pending.round])) {
    return pending;
  }
  return null;
}

export function render(root) {
  stop();
  const s = getState();
  const team = teamById(s.teamId);
  const hqCity = team.hq || 'Factory';
  const pu = puById(s.puId || team.pu);
  const spEcon = computeSponsorEconomy(s.teamId, s.activeSponsors);
  const signingCash = typeof s.signingCash === 'number' ? s.signingCash : spEcon.signingCashM;
  const puCost = typeof s.puCost === 'number' ? s.puCost : puContractCost(team, pu);
  const { ord, month } = dateParts(s.date);
  const bgUrl = FACILITY_BACKDROPS.hq;
  const isDay1 = s.date === '2026-02-20' && Object.keys(s.results || {}).length === 0;
  const gate = canAdvanceCalendar(s);

  root.innerHTML = `
    <div class="hq-shell" style="--hq-bg: url('${bgUrl}')">
      ${topbarHTML()}
      <div class="hq-header-row">
        <div>
          <div class="dateblock">
            ${SVG_DATE_CALENDAR}
            <div class="bigdate" id="bigdate">${ord} <span>${month}</span></div>
          </div>
          <div class="season" id="season-label">${seasonLabel(s)}</div>
        </div>
        <div class="hq-quick-bar">
          <button class="btn small hq-qbtn" data-open-drawer="research">+ RESEARCH PART</button>
          <button class="btn small hq-qbtn" data-open-drawer="manufacture">+ MANUFACTURE PART</button>
          <button class="btn small hq-qbtn" data-open-drawer="facility">+ UPGRADE FACILITY</button>
        </div>
      </div>

      <div class="stage hq-stage">
        <div class="agenda glass hq-glass">
          <div class="agenda-title">Coming up</div>
          <div class="node ctl f1-ctl-node" id="ctl-row" role="button" tabindex="0" aria-label="Toggle Advancing Time">
            <span class="f1-reticle-leader" aria-hidden="true"></span>
            <div class="f1-reticle" id="ring">
              <div class="f1-reticle-sweep" aria-hidden="true"></div>
              <div class="f1-reticle-track" aria-hidden="true"></div>
              <div class="f1-reticle-core">
                <span class="f1-reticle-glyph" id="ring-glyph">${gate.ok ? '▶' : '⚑'}</span>
              </div>
            </div>
            <div class="ctl-label" id="ctl-label">${gate.ok ? 'ADVANCE TIME' : `LOG R${gate.blockedByRace.round} FIRST`}</div>
          </div>
          <div id="nodes"></div>
          <div class="btnrow" style="margin:16px 0 8px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn" id="advance" style="flex:1">${gate.ok ? '▶ AUTO ADVANCE' : `⚑ LOG R${gate.blockedByRace.round} TO ADVANCE`}</button>
            <button class="btn" id="step-one-day" title="Advance exactly 1 calendar day" ${gate.ok ? '' : 'disabled'}>+1 DAY</button>
          </div>
        </div>

        <div class="hq-right-col">
          <div id="hq-race-hero"></div>
          <div class="feed glass hq-glass-feed" id="feed">
            <div class="hq-feed-head">
              <span>${hqCity.toUpperCase()} HQ DISPATCH &amp; WEEKLY LEDGER</span>
              <span class="hq-feed-sub" id="hq-feed-date">${prettyDate(s.date)}</span>
            </div>
            <div id="feed-items">
              ${isDay1 ? `
                <div class="card pos feed-day1-card"><div><div class="ct">Sponsor Signing Bonus</div><div class="cs">${team.name} sponsor package — Day 1 payout (+$${spEcon.weeklyIncomeK}k/wk recurring)</div></div><div class="amt pos">+${fmt$(signingCash)}</div></div>
                <div class="card neg feed-day1-card"><div><div class="ct">Power Unit — ${pu ? pu.name : 'In-House'}</div><div class="cs">${team.works ? 'In-House Works PU R&D & Dyno Cap Allocation' : 'Customer engine supply contract'} — deducted from bank</div></div><div class="amt neg">−${fmt$(puCost)}</div></div>
              ` : ''}
              <div class="hint" id="hint">Use <b>▶ AUTO ADVANCE</b> (day-by-day sweep) or <b>+1 DAY</b> (single-day step) to roll the calendar forward. Advancing automatically pauses on task completions and locks on Race Weekends until results are logged.</div>
            </div>
          </div>
        </div>
      </div>

      <div id="hq-radio-slot"></div>
      <div id="hq-ops-slot"></div>
      <div id="hq-drawer-slot"></div>

      <div class="foot hq-foot">
        ${team.hqFull || hqCity} · Car power — true value <b style="color:#fff">${truePower().toFixed(2)}</b> · Monoposto input <b style="color:#fff">${monopostoPower()}</b>
        (the game takes integers; the fraction is real progress).<br>
        Save tools: <a href="#" id="exp">Export JSON</a> · <a href="#" id="imp">Import JSON</a> · <a href="#" id="wipe">Delete save</a>
        <input type="file" id="impfile" accept=".json" style="display:none">
      </div>
    </div>`;

  renderAgenda();
  renderRaceHero();
  renderRadioBanner();
  renderActiveOps();
  renderDrawer();
  bindStaticControls();

  function syncClockButtons() {
    const st = getState();
    const g = canAdvanceCalendar(st);
    const btn = root.querySelector('#advance');
    const stepBtn = root.querySelector('#step-one-day');
    const glyph = document.getElementById('ring-glyph');
    if (!g.ok) {
      if (btn) {
        btn.textContent = `⚑ LOG R${g.blockedByRace.round} TO ADVANCE`;
        btn.classList.remove('stop');
      }
      if (stepBtn) stepBtn.disabled = true;
      if (glyph) glyph.textContent = '⚑';
      setCtl(`LOG R${g.blockedByRace.round} FIRST`);
      return;
    }
    if (stepBtn) stepBtn.disabled = running;
    if (running) {
      if (btn) {
        btn.textContent = '■ STOP';
        btn.classList.add('stop');
      }
      if (glyph) glyph.textContent = '■';
      setCtl('STOP ADVANCING');
    } else {
      if (btn) {
        btn.textContent = '▶ AUTO ADVANCE';
        btn.classList.remove('stop');
      }
      if (glyph) glyph.textContent = '▶';
      setCtl('ADVANCE TIME');
    }
  }

  function toggleAdvance() {
    const st = getState();
    const g = canAdvanceCalendar(st);
    if (!g.ok) {
      stop();
      syncClockButtons();
      renderRaceHero(g.blockedByRace);
      pushFeedItem(`<div class="banner red feed-event-banner"><div class="bt">Race Weekend Lock — Round ${g.blockedByRace.round} ${g.blockedByRace.gp}</div><div class="bs">${g.reason}</div></div>`, false);
      return;
    }
    const ring = document.getElementById('ring');
    if (running) {
      stop();
      syncClockButtons();
      return;
    }
    running = true;
    if (ring) {
      ring.classList.add('is-advancing');
      ring.style.setProperty('--sweep-deg', '0deg');
    }
    syncClockButtons();
    dayStartTs = performance.now();
    rafId = requestAnimationFrame(tickSweep);
  }

  function stepSingleDay() {
    if (running) stop();
    const st = getState();
    const g = canAdvanceCalendar(st);
    if (!g.ok) {
      syncClockButtons();
      renderRaceHero(g.blockedByRace);
      pushFeedItem(`<div class="banner red feed-event-banner"><div class="bt">Race Weekend Lock — Round ${g.blockedByRace.round} ${g.blockedByRace.gp}</div><div class="bs">${g.reason}</div></div>`, false);
      return;
    }
    stepDay(true);
    syncClockButtons();
  }

  function tickSweep(now) {
    if (!running) return;
    const elapsed = now - dayStartTs;
    const ring = document.getElementById('ring');
    if (elapsed >= DAY_SWEEP_MS) {
      dayStartTs = now - ((elapsed - DAY_SWEEP_MS) % DAY_SWEEP_MS);
      if (ring) ring.style.setProperty('--sweep-deg', '0deg');
      const keepGoing = stepDay(false);
      if (!keepGoing || !running) return;
    } else {
      const deg = (elapsed / DAY_SWEEP_MS) * 360;
      if (ring) ring.style.setProperty('--sweep-deg', deg.toFixed(1) + 'deg');
    }
    rafId = requestAnimationFrame(tickSweep);
  }

  function bindStaticControls() {
    const btn = root.querySelector('#advance');
    if (btn) btn.onclick = toggleAdvance;

    const stepBtn = root.querySelector('#step-one-day');
    if (stepBtn) stepBtn.onclick = stepSingleDay;

    const ctlRow = root.querySelector('#ctl-row');
    if (ctlRow) {
      ctlRow.onclick = toggleAdvance;
      ctlRow.onkeydown = e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAdvance();
        }
      };
    }

    root.querySelectorAll('[data-open-drawer]').forEach(b => {
      b.onclick = () => {
        drawerMode = b.dataset.openDrawer;
        drawerMsg = '';
        renderDrawer();
      };
    });

    const exp = root.querySelector('#exp');
    if (exp) {
      exp.onclick = e => {
        e.preventDefault();
        const blob = new Blob([exportJSON()], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'monoposto-save.json';
        a.click();
      };
    }
    const impFile = root.querySelector('#impfile');
    const imp = root.querySelector('#imp');
    if (imp && impFile) {
      imp.onclick = e => { e.preventDefault(); impFile.click(); };
      impFile.onchange = () => {
        const f = impFile.files[0];
        if (!f) return;
        f.text().then(t => {
          try { importJSON(t); location.reload(); } catch { console.warn('Invalid save file.'); }
        });
      };
    }
    const wipeBtn = root.querySelector('#wipe');
    if (wipeBtn) {
      wipeBtn.onclick = e => {
        e.preventDefault();
        stop();
        openDeleteConfirmModal(() => {
          wipe();
          document.documentElement.style.setProperty('--team', '#e10600');
          location.hash = '#/start';
        });
      };
    }
  }

  function setCtl(t) {
    const el = document.getElementById('ctl-label');
    if (el) el.textContent = t;
  }

  function renderAgenda() {
    const st = getState();
    const box = document.getElementById('nodes');
    if (!box) return;
    const items = agenda(st);
    box.innerHTML = items.map((it, i) => `
      <div class="node ${it.kind === 'race' ? 'race' : ''} ${i === items.length - 1 ? 'last' : ''}">
        <div class="dot ${it.kind === 'race' ? 'flag' : ''}">${it.kind === 'race' ? it.race.flag : GLYPH[it.kind] || '•'}</div>
        <span class="when">${dateParts(it.date).ord}</span><span class="what">${it.title}</span>
        <div class="lbl">${it.label || ''}</div>
      </div>`).join('') || '<div class="lbl" style="padding:10px 0 14px">Nothing in the next 7 days.</div>';
  }

  function renderRaceHero(forcedRace = null) {
    const st = getState();
    const slot = document.getElementById('hq-race-hero');
    if (!slot) return;
    const race = forcedRace || activeRaceStop(st);
    if (!race) {
      slot.innerHTML = '';
      return;
    }
    const pending = unmanufacturedBlueprints(st);
    const qState = st.quali?.[race.round] || st.qualifying?.[race.round] || null;
    const qualiDone = Boolean(qState);
    const stageEyebrow = qualiDone
      ? `RACE WEEKEND LOCKED · ROUND ${race.round} OF 22 · ${qState.skipped ? 'QUALIFYING SKIPPED' : 'QUALIFYING LOGGED'} — LOG GRAND PRIX TO ADVANCE`
      : `RACE WEEKEND ARRIVED · ROUND ${race.round} OF 22 · STAGE 1: QUALIFYING SESSION (CALENDAR HELD)`;
    const ctaLabel = qualiDone
      ? 'LOG GRAND PRIX RESULTS →'
      : 'GO TO QUALIFYING SESSION →';
    const dateOvershoot = st.date > race.sun;

    slot.innerHTML = `
      <div class="hq-race-stop-card">
        <div class="hq-race-stop-top">
          <span class="hq-race-flag">${race.flag}</span>
          <div>
            <div class="hq-race-eyebrow">${stageEyebrow}</div>
            <div class="hq-race-title">${race.gp.toUpperCase()}</div>
            <div class="hq-race-sub">${race.circuit} · ${race.laps} Laps · Monoposto Car Power <b>${monopostoPower()}</b> · Calendar cannot skip past Round ${race.round} until GP is logged</div>
          </div>
          <a class="btn primary hq-race-cta" href="#/race">${ctaLabel}</a>
        </div>
        ${dateOvershoot ? `
          <div class="hq-race-warn">
            <span><b>Calendar Sync Recovery:</b> Your save date (${prettyDate(st.date)}) is ahead of unlogged Round ${race.round} (${prettyDate(race.sun)}).</span>
            <button class="btn small" id="hero-sync-date">SNAP DATE TO ${prettyDate(race.sat).toUpperCase()}</button>
          </div>
        ` : ''}
        ${pending.length > 0 ? `
          <div class="hq-race-warn">
            <span><b>Chief Engineer Alert:</b> ${pending.length} researched part blueprint${pending.length === 1 ? ' is' : 's are'} sitting in Research un-manufactured!</span>
            <button class="btn small" id="hero-open-manuf">DEVELOP PARTS NOW</button>
          </div>
        ` : ''}
      </div>
    `;
    const syncBtn = slot.querySelector('#hero-sync-date');
    if (syncBtn) {
      syncBtn.onclick = () => {
        st.date = qualiDone ? race.sun : race.sat;
        save();
        render(root);
      };
    }
    const mBtn = slot.querySelector('#hero-open-manuf');
    if (mBtn) {
      mBtn.onclick = () => {
        drawerMode = 'manufacture';
        drawerMsg = '';
        renderDrawer();
      };
    }
  }

  function renderRadioBanner() {
    const st = getState();
    const slot = document.getElementById('hq-radio-slot');
    if (!slot) return;
    const pending = unmanufacturedBlueprints(st);
    if (!pending.length) {
      slot.innerHTML = '';
      return;
    }
    const names = pending.slice(0, 3).map(p => `${p.part.name}${p.part.steps.length > 1 ? ` (Spec ${p.spec})` : ''}`).join(', ');
    slot.innerHTML = `
      <div class="hq-radio-banner glass">
        <div class="hq-radio-avatar">RD</div>
        <div class="hq-radio-body">
          <div class="hq-radio-speaker">HEAD OF ENGINEERING · ${hqCity.toUpperCase()} TEAM RADIO</div>
          <div class="hq-radio-quote">"Hey, Chief. We've got parts out of research. Don't forget to develop them."</div>
          <div class="hq-radio-meta">${pending.length} researched blueprint${pending.length === 1 ? '' : 's'} awaiting manufacturing: <b>${names}${pending.length > 3 ? ` +${pending.length - 3} more` : ''}</b></div>
        </div>
        <button class="btn primary small hq-radio-btn" id="radio-manuf-btn">DEVELOP PARTS (${pending.length})</button>
      </div>
    `;
    const btn = slot.querySelector('#radio-manuf-btn');
    if (btn) {
      btn.onclick = () => {
        drawerMode = 'manufacture';
        drawerMsg = '';
        renderDrawer();
      };
    }
  }

  function specBadgeHTML(specEff) {
    if (!specEff || !specEff.racesLeft || specEff.racesLeft <= 0) return '';
    const mod = specEff.speedMod ?? specEff.delta ?? 0;
    if (mod > 0) {
      return ` <span class="tag good">★ +1 SPD SPEC SURGE (${specEff.racesLeft} GP left)</span>`;
    }
    if (mod < 0) {
      return ` <span class="tag bad">⚠ −1 SPD CORRELATION ISSUE (${specEff.racesLeft} GP left)</span>`;
    }
    return ` <span class="tag">SPEC FITTED (+0 SPD · DP ONLY)</span>`;
  }

  function renderActiveOps() {
    const st = getState();
    const slot = document.getElementById('hq-ops-slot');
    if (!slot) return;
    const resTasks = st.tasks.filter(t => t.kind === 'research');
    const manTasks = st.tasks.filter(t => t.kind === 'manufacture');
    const facTasks = st.tasks.filter(t => t.kind === 'facility');
    const maxR = maxResearchSlots(st);
    const maxM = maxManufactureSlots(st);
    const prio = driverPriorityStatus(st);
    const pending = unmanufacturedBlueprints(st);

    slot.innerHTML = `
      <section class="hq-ops-panel glass">
        <div class="hq-ops-header">
          <div>
            <div class="hq-ops-title">ACTIVE FACTORY OPERATIONS — ${hqCity.toUpperCase()} CONTROL</div>
            <div class="hq-ops-sub">
              Car #${prio.d1 ? prio.d1.no : '1'} (${prio.d1 ? prio.d1.last : 'D1'}): <b>${prio.car1Upgrades} upgrades</b>${specBadgeHTML(prio.eff1)}
              &nbsp;·&nbsp;
              Car #${prio.d2 ? prio.d2.no : '2'} (${prio.d2 ? prio.d2.last : 'D2'}): <b>${prio.car2Upgrades} upgrades</b>${specBadgeHTML(prio.eff2)}
            </div>
          </div>
          <div class="hq-ops-links">
            <a class="btn small" href="#/rd">FULL R&amp;D TREE →</a>
            <a class="btn small" href="#/facilities">FULL FACILITIES TREE →</a>
          </div>
        </div>

        <div class="hq-ops-grid">
          <div class="hq-ops-col">
            <div class="hq-ops-colhead">
              <span>STEP A · ACTIVE RESEARCH</span>
              <b>${resTasks.length} / ${maxR} SLOTS</b>
            </div>
            <div class="hq-ops-list">
              ${resTasks.length ? resTasks.map(t => {
                const daysLeft = daysBetween(st.date, t.due);
                const pct = taskProgressPct(st, t);
                return `<div class="hq-op-item">
                  <div class="hq-op-top"><b>${t.title}</b><span>${daysLeft}d left</span></div>
                  <div class="hq-op-sub">${t.label} · Due ${prettyDate(t.due)}</div>
                  <div class="hq-op-bar"><i style="width:${pct}%"></i></div>
                </div>`;
              }).join('') : `<div class="hq-op-empty">No active wind-tunnel / CFD research queued.</div>`}
            </div>
            <button class="btn small hq-op-add" data-open-drawer="research">+ START RESEARCH (RP)</button>
          </div>

          <div class="hq-ops-col">
            <div class="hq-ops-colhead">
              <span>STEP B · PART MANUFACTURING</span>
              <b>${manTasks.length} / ${maxM} SLOTS ${pending.length ? `· <em style="color:var(--gold)">${pending.length} Ready</em>` : ''}</b>
            </div>
            <div class="hq-ops-list">
              ${manTasks.length ? manTasks.map(t => {
                const daysLeft = daysBetween(st.date, t.due);
                const pct = taskProgressPct(st, t);
                return `<div class="hq-op-item">
                  <div class="hq-op-top"><b>${t.title}</b><span>${daysLeft}d left</span></div>
                  <div class="hq-op-sub">${t.label} · Due ${prettyDate(t.due)}</div>
                  <div class="hq-op-bar blue"><i style="width:${pct}%"></i></div>
                </div>`;
              }).join('') : `<div class="hq-op-empty">${pending.length ? `${pending.length} researched blueprint(s) ready to manufacture!` : 'No physical parts currently on the factory floor.'}</div>`}
            </div>
            <button class="btn small hq-op-add ${pending.length ? 'primary' : ''}" data-open-drawer="manufacture">
              + MANUFACTURE PART ($)${pending.length ? ` · ${pending.length} READY` : ''}
            </button>
          </div>

          <div class="hq-ops-col">
            <div class="hq-ops-colhead">
              <span>FACILITY CONSTRUCTION</span>
              <b>${facTasks.length} / 2 SLOTS</b>
            </div>
            <div class="hq-ops-list">
              ${facTasks.length ? facTasks.map(t => {
                const daysLeft = daysBetween(st.date, t.due);
                const pct = taskProgressPct(st, t);
                return `<div class="hq-op-item">
                  <div class="hq-op-top"><b>${t.title}</b><span>${daysLeft}d left</span></div>
                  <div class="hq-op-sub">${t.label} · Due ${prettyDate(t.due)}</div>
                  <div class="hq-op-bar gold"><i style="width:${pct}%"></i></div>
                </div>`;
              }).join('') : `<div class="hq-op-empty">No ${hqCity} HQ facility sub-upgrades under construction.</div>`}
            </div>
            <button class="btn small hq-op-add" data-open-drawer="facility">+ UPGRADE FACILITY ($)</button>
          </div>
        </div>
      </section>
    `;

    slot.querySelectorAll('[data-open-drawer]').forEach(b => {
      b.onclick = () => {
        drawerMode = b.dataset.openDrawer;
        drawerMsg = '';
        renderDrawer();
      };
    });
  }

  function renderDrawer() {
    const slot = document.getElementById('hq-drawer-slot');
    if (!slot) return;
    if (!drawerMode) {
      slot.innerHTML = '';
      return;
    }
    const st = getState();
    const prio = driverPriorityStatus(st);
    const d1No = prio.d1 ? prio.d1.no : '1';
    const d2No = prio.d2 ? prio.d2.no : '2';
    const pending = unmanufacturedBlueprints(st);

    let bodyHTML = '';

    if (drawerMode === 'research') {
      const available = [];
      for (const dept of DEPARTMENTS) {
        for (const part of dept.parts) {
          const task = st.tasks.find(t => t.partId === part.id);
          const q = researchQuote(st, part.id, 'standard');
          if (q && !task && !q.gateBlocked && !q.prereqBlocked && !q.unbuiltPrevSpec) {
            available.push({ dept, part, q });
          }
        }
      }
      bodyHTML = `
        <div class="hq-drawer-sub">Available blueprints unlocked for immediate wind-tunnel research at ${hqCity} HQ (Balance: <b>${st.rp} RP</b>):</div>
        <div class="hq-drawer-list">
          ${available.length ? available.map(({ dept, part, q }) => `
            <div class="hq-drawer-row">
              <div>
                <div class="hq-drawer-itemtitle">${part.name} <span class="tag">${dept.name} · ${part.subcategoryName || ''}</span> <span class="tag">${part.core ? `Spec ${q.step.spec}` : `Phase ${part.phase || 1}`}</span></div>
                <div class="hq-drawer-itemsub">+${q.step.dp} Team DP (${q.step.dp / 2} DP/car) · Mfg Cost ${q.step.costPerCopy ? fmt$(q.step.costPerCopy) : 'In-House'}</div>
              </div>
              <button class="btn small" data-drawer-res="${part.id}">RESEARCH · ${q.rp} RP · ${q.days}d</button>
            </div>
          `).join('') : '<div class="hq-op-empty">No unlocked blueprints available right now. Upgrade Engineering Facilities to unlock higher phases.</div>'}
        </div>
      `;
    } else if (drawerMode === 'manufacture') {
      const buildable = [];
      for (const dept of DEPARTMENTS) {
        for (const part of dept.parts) {
          const task = st.tasks.find(t => t.partId === part.id);
          if (task) continue;
          const q1 = manufactureQuote(st, part.id, 'car1');
          const q2 = manufactureQuote(st, part.id, 'car2');
          const qB = manufactureQuote(st, part.id, 'both');
          if (q1 || q2 || qB) {
            buildable.push({ dept, part, q1, q2, qB, state: st.parts[part.id] });
          }
        }
      }
      bodyHTML = `
        <div class="hq-drawer-sub">Researched blueprints ready for physical manufacturing at ${hqCity} HQ (Bank: <b>${fmt$(st.cash)}</b>):</div>
        <div class="hq-drawer-list">
          ${buildable.length ? buildable.map(({ dept, part, q1, q2, qB, state: ps }) => `
            <div class="hq-drawer-row">
              <div>
                <div class="hq-drawer-itemtitle">${part.name} (Spec ${ps.researched}) <span class="tag">${dept.name}</span></div>
                <div class="hq-drawer-itemsub">Car #${d1No}: ${ps.car1 ? `Spec ${ps.car1}` : 'Stock'} · Car #${d2No}: ${ps.car2 ? `Spec ${ps.car2}` : 'Stock'}</div>
              </div>
              <div class="rd-manuf-group">
                ${q1 ? `<button class="btn small" data-drawer-manuf="${part.id}:car1">CAR #${d1No} · ${q1.cost ? fmt$(q1.cost) : '$0.00M'} (+${q1.dpGain} DP)</button>` : ''}
                ${q2 ? `<button class="btn small" data-drawer-manuf="${part.id}:car2">CAR #${d2No} · ${q2.cost ? fmt$(q2.cost) : '$0.00M'} (+${q2.dpGain} DP)</button>` : ''}
                ${qB && qB.dualUnlocked ? `<button class="btn primary small" data-drawer-manuf="${part.id}:both">BOTH · ${qB.cost ? fmt$(qB.cost) : '$0.00M'} (+${qB.dpGain} DP)</button>` : ''}
              </div>
            </div>
          `).join('') : '<div class="hq-op-empty">All researched blueprints are already built on both cars! Research a new blueprint in Step A first.</div>'}
        </div>
      `;
    } else if (drawerMode === 'facility') {
      const buildableNodes = [];
      for (const b of FACILITY_BRANCHES) {
        const info = branchPhaseInfo(st, b.id);
        for (const p of b.phases) {
          const unlocked = p.phase === 1
            || (p.phase === 2 && info.p1Done === info.p1Total)
            || (p.phase === 3 && info.p1Done === info.p1Total && info.p2Done === info.p2Total);
          if (!unlocked) continue;
          for (const n of p.nodes) {
            const built = Boolean(st.facilityNodes && st.facilityNodes[n.id]);
            const inProg = st.tasks.some(t => t.kind === 'facility' && (t.nodeId === n.id || t.facilityId === n.id));
            if (!built && !inProg) {
              buildableNodes.push({ branch: b, phase: p.phase, node: n });
            }
          }
        }
      }
      bodyHTML = `
        <div class="hq-drawer-sub">Unlocked ${hqCity} HQ sub-upgrades available for construction (Bank: <b>${fmt$(st.cash)}</b>):</div>
        <div class="hq-drawer-list">
          ${buildableNodes.length ? buildableNodes.map(({ branch, phase, node }) => `
            <div class="hq-drawer-row">
              <div>
                <div class="hq-drawer-itemtitle">${node.name} <span class="tag">${branch.name} · Phase ${phase}</span></div>
                <div class="hq-drawer-itemsub">${node.effects.join(' · ')}</div>
              </div>
              <button class="btn small" data-drawer-fac="${node.id}">BUILD · ${fmt$(node.cost)} · ${node.days}d</button>
            </div>
          `).join('') : `<div class="hq-op-empty">Every ${hqCity} HQ facility sub-upgrade is either built or currently under construction!</div>`}
        </div>
      `;
    }

    slot.innerHTML = `
      <div class="hq-drawer-backdrop" id="hq-drawer-bg">
        <div class="hq-drawer-modal glass" onclick="event.stopPropagation()">
          <div class="hq-drawer-head">
            <div class="hq-drawer-tabs">
              <button class="rd-stab ${drawerMode === 'research' ? 'on' : ''}" data-switch-drawer="research">STEP A · RESEARCH (RP)</button>
              <button class="rd-stab ${drawerMode === 'manufacture' ? 'on' : ''}" data-switch-drawer="manufacture">
                STEP B · MANUFACTURE ($) ${pending.length ? `<span class="rd-badge">${pending.length}</span>` : ''}
              </button>
              <button class="rd-stab ${drawerMode === 'facility' ? 'on' : ''}" data-switch-drawer="facility">FACILITIES ($)</button>
            </div>
            <button class="btn small" id="hq-drawer-close">✕ CLOSE</button>
          </div>
          ${drawerMsg ? `<div class="fac-alert ${drawerErr ? 'err' : 'ok'}" style="margin:10px 0">${drawerMsg}</div>` : ''}
          <div class="hq-drawer-body">${bodyHTML}</div>
        </div>
      </div>
    `;

    slot.querySelector('#hq-drawer-bg').onclick = () => { drawerMode = null; renderDrawer(); };
    slot.querySelector('#hq-drawer-close').onclick = () => { drawerMode = null; renderDrawer(); };
    slot.querySelectorAll('[data-switch-drawer]').forEach(b => {
      b.onclick = () => {
        drawerMode = b.dataset.switchDrawer;
        drawerMsg = '';
        renderDrawer();
      };
    });

    slot.querySelectorAll('[data-drawer-res]').forEach(b => {
      b.onclick = () => {
        const r = startResearch(st, b.dataset.drawerRes, 'standard');
        if (r.error) { drawerMsg = r.error; drawerErr = true; }
        else { drawerMsg = `Research queued — completes ${prettyDate(r.due)} (debuts ${r.debut}).`; drawerErr = false; save(); }
        refreshHUD(); renderAgenda(); renderActiveOps(); renderDrawer();
      };
    });

    slot.querySelectorAll('[data-drawer-manuf]').forEach(b => {
      b.onclick = () => {
        const [partId, target] = b.dataset.drawerManuf.split(':');
        const r = startManufacture(st, partId, target);
        if (r.error) { drawerMsg = r.error; drawerErr = true; }
        else { drawerMsg = `Manufacturing queued — ready ${prettyDate(r.due)} (debuts ${r.debut}).`; drawerErr = false; save(); }
        refreshHUD(); renderAgenda(); renderRaceHero(); renderRadioBanner(); renderActiveOps(); renderDrawer();
      };
    });

    slot.querySelectorAll('[data-drawer-fac]').forEach(b => {
      b.onclick = () => {
        const r = queueFacility(st, b.dataset.drawerFac);
        if (r.error) { drawerMsg = r.error; drawerErr = true; }
        else { drawerMsg = `Facility construction started — completes ${prettyDate(r.due)}.`; drawerErr = false; save(); }
        refreshHUD(); renderAgenda(); renderActiveOps(); renderDrawer();
      };
    });
  }

  function pushFeedItem(html, isWeeklyTick = false) {
    const feedItems = document.getElementById('feed-items');
    if (!feedItems) return;
    const hint = document.getElementById('hint');
    if (hint) hint.remove();
    feedItems.querySelectorAll('.feed-day1-card').forEach(el => el.remove());

    if (isWeeklyTick) {
      feedItems.querySelectorAll('.feed-tick-card').forEach(el => el.remove());
      feedItems.insertAdjacentHTML('afterbegin', html);
    } else {
      feedItems.insertAdjacentHTML('afterbegin', html);
      const banners = feedItems.querySelectorAll('.feed-event-banner');
      if (banners.length > 5) {
        for (let i = 5; i < banners.length; i++) banners[i].remove();
      }
    }
  }

  function fireEvent(ev) {
    const st = getState();
    if (ev.type === 'tick') {
      floater('hud-cash', `+${fmt$(ev.income)}`, 'pos');
      floater('hud-rp', `+${ev.rp} RP`, 'pos');
      const merchK = Math.round((ev.fanMerchM || 0) * 1000);
      pushFeedItem(`
        <div class="card pos feed-tick-card"><div><div class="ct">Weekly Sponsor &amp; Fan Merchandise Income</div><div class="cs">Monday settlement (${prettyDate(st.date)}) · Includes +$${merchK}k Fan Rating (${st.fanRating}) Merch</div></div><div class="amt pos">+${fmt$(ev.income)}</div></div>
        <div class="card neg feed-tick-card"><div><div class="ct">${hqCity} HQ Running Costs</div><div class="cs">Weekly department &amp; facility operating overhead</div></div><div class="amt neg">−${fmt$(ev.costs)}</div></div>
        <div class="card pos feed-tick-card"><div><div class="ct">Weekly Resource Points &amp; AI Grid R&amp;D</div><div class="cs">Engineering output (ATR ${Math.round((ev.atrMult || 1) * 100)}%) · 11 AI teams progressed background R&amp;D</div></div><div class="amt pos">+${ev.rp} RP</div></div>
      `, true);
    } else if (ev.type === 'research') {
      const cls = ev.outcome === 'failure' ? 'red' : ev.outcome === 'breakthrough' ? 'blue' : '';
      pushFeedItem(`<div class="banner ${cls} feed-event-banner"><div class="bt">${ev.title}</div><div class="bs">${ev.label}</div></div>`, false);
    } else if (ev.type === 'manufacture') {
      const cls = ev.outcome === 'problematic' ? 'red' : 'blue';
      pushFeedItem(`<div class="banner ${cls} feed-event-banner"><div class="bt">${ev.title}</div><div class="bs">${ev.label}</div></div>`, false);
    } else if (ev.type === 'facility') {
      pushFeedItem(`<div class="banner feed-event-banner"><div class="bt">Facility Upgrade Operational at ${hqCity} HQ</div><div class="bs">${ev.title} — ${ev.label}</div></div>`, false);
    } else if (ev.type === 'race') {
      renderRaceHero(ev.race);
      pushFeedItem(`<div class="banner feed-event-banner"><div class="bt">Race Weekend Arrived — Round ${ev.race.round} ${ev.race.gp}</div><div class="bs">Calendar held at ${prettyDate(st.date)}. Open Race Control to log Qualifying &amp; Grand Prix results.</div></div>`, false);
    } else if (ev.type === 'race-locked') {
      renderRaceHero(ev.race);
      pushFeedItem(`<div class="banner red feed-event-banner"><div class="bt">Race Weekend Lock — Round ${ev.race.round} ${ev.race.gp}</div><div class="bs">${ev.reason}</div></div>`, false);
    }
  }

  function stepDay(singleStep = false) {
    if (!running && !singleStep) return false;
    const st = getState();
    const fired = advance(st);
    const { ord: o2, month: m2 } = dateParts(st.date);
    const bd = document.getElementById('bigdate');
    if (bd) bd.innerHTML = `${o2} <span>${m2}</span>`;
    const sl = document.getElementById('season-label');
    if (sl) sl.textContent = seasonLabel(st);
    const fd = document.getElementById('hq-feed-date');
    if (fd) fd.textContent = prettyDate(st.date);

    renderAgenda();
    refreshHUD();
    for (const ev of fired) fireEvent(ev);
    renderRaceHero();
    renderRadioBanner();
    renderActiveOps();

    const glyph = document.getElementById('ring-glyph');

    // Pause auto-advance on Race Weekend arrival, Race Lock, or R&D/Facility task completion
    if (fired.some(e => e.type === 'race' || e.type === 'race-locked' || e.type === 'research' || e.type === 'manufacture' || e.type === 'facility')) {
      stop();
      syncClockButtons();
      return false;
    }
    if (!nextRace(st.date, st) && st.date > '2026-12-06') {
      stop();
      const btn = root.querySelector('#advance');
      if (btn) {
        btn.textContent = 'SEASON OVER';
        btn.disabled = true;
      }
      if (glyph) glyph.textContent = '✓';
      return false;
    }
    syncClockButtons();
    return true;
  }
}
