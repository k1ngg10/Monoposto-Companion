// HQ DASHBOARD — the advance-time agenda, active operations panel, and modal drawer.
// Includes frosted-glass panels over the F1 garage backdrop, non-stacking weekly tick cards,
// Race Weekend Hero Stop Card, and the Head of Engineering radio banner when blueprints await manufacturing.
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
} from '../engine/store.js?v=20261022b';
import { advance, agenda, prettyDate, fromISO, queueFacility } from '../engine/timeEngine.js?v=20261022b';
import { nextRace, CALENDAR } from '../data/calendar2026.js?v=20261022b';
import { teamById } from '../data/teamsAndDrivers.js?v=20261022b';
import { puById, puContractCost, computeSponsorEconomy } from '../data/sponsorsAndEngines.js?v=20261022b';
import {
  FACILITY_BACKDROPS,
  FACILITY_BRANCHES,
  branchPhaseInfo,
  maxResearchSlots,
  maxManufactureSlots
} from '../data/facilitiesCatalog.js?v=20261022b';
import { DEPARTMENTS } from '../data/partsCatalog.js?v=20261022b';
import {
  researchQuote,
  startResearch,
  manufactureQuote,
  startManufacture,
  debutRound
} from '../engine/rdEngine.js?v=20261022b';
import { topbarHTML, refreshHUD, floater, fmt$ } from './shared.js?v=20261022b';

let running = false, timer = null;
let drawerMode = null; // null | 'research' | 'manufacture' | 'facility'
let drawerMsg = '', drawerErr = false;

const stop = () => { running = false; clearTimeout(timer); };

const GLYPH = { research: 'R', manufacture: 'D', facility: 'F', tick: 'W' };

function seasonLabel(s) {
  if (s.date < CALENDAR[0].sat) return 'Pre-season · 2026';
  const nr = nextRace(s.date);
  return `Season 1 · Round ${nr ? nr.round : 22} of 22`;
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

function activeRaceStop(s) {
  return CALENDAR.find(r => (r.sat === s.date || r.sun === s.date) && !s.results[r.round]) || null;
}

export function render(root) {
  stop();
  const s = getState();
  const team = teamById(s.teamId);
  const pu = puById(s.puId || team.pu);
  const spEcon = computeSponsorEconomy(s.teamId, s.activeSponsors);
  const signingCash = typeof s.signingCash === 'number' ? s.signingCash : spEcon.signingCashM;
  const puCost = typeof s.puCost === 'number' ? s.puCost : puContractCost(team, pu);
  const { ord, month } = dateParts(s.date);
  const bgUrl = FACILITY_BACKDROPS.hq;
  const isDay1 = s.date === '2026-02-20';

  root.innerHTML = `
    <div class="hq-shell" style="--hq-bg: url('${bgUrl}')">
      ${topbarHTML()}
      <div class="hq-header-row">
        <div>
          <div class="dateblock"><div class="bigdate" id="bigdate">${ord} <span>${month}</span></div></div>
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
          <div class="node ctl">
            <div class="dot" style="border:none;background:none;box-shadow:none">
              <div class="ring" id="ring"><div class="inner">▶</div></div>
            </div>
            <div class="ctl-label" id="ctl-label">ADVANCE TIME</div>
          </div>
          <div id="nodes"></div>
          <div class="btnrow" style="margin:16px 0 8px">
            <button class="btn" id="advance">▶ ADVANCE</button>
          </div>
        </div>

        <div class="hq-right-col">
          <div id="hq-race-hero"></div>
          <div class="feed glass hq-glass-feed" id="feed">
            <div class="hq-feed-head">
              <span>TEAM HQ DISPATCH &amp; WEEKLY LEDGER</span>
              <span class="hq-feed-sub" id="hq-feed-date">${prettyDate(s.date)}</span>
            </div>
            <div id="feed-items">
              ${isDay1 ? `
                <div class="card pos feed-day1-card"><div><div class="ct">Sponsor Signing Bonus</div><div class="cs">${team.name} sponsor package — Day 1 payout (+$${spEcon.weeklyIncomeK}k/wk recurring)</div></div><div class="amt pos">+${fmt$(signingCash)}</div></div>
                <div class="card neg feed-day1-card"><div><div class="ct">Power Unit — ${pu ? pu.name : 'In-House'}</div><div class="cs">${team.works ? 'In-House Works PU R&D & Dyno Cap Allocation' : 'Customer engine supply contract'} — deducted from bank</div></div><div class="amt neg">−${fmt$(puCost)}</div></div>
              ` : ''}
              <div class="hint" id="hint">Hit <b>ADVANCE</b> to roll the calendar forward. Weekly Monday income/costs replace the previous week's ledger card cleanly, and advancing stops automatically on Race Weekends.</div>
            </div>
          </div>
        </div>
      </div>

      <div id="hq-radio-slot"></div>
      <div id="hq-ops-slot"></div>
      <div id="hq-drawer-slot"></div>

      <div class="foot hq-foot">
        Car power — true value <b style="color:#fff">${truePower().toFixed(2)}</b> · Monoposto input <b style="color:#fff">${monopostoPower()}</b>
        (the game takes integers; the fraction is real progress).<br>
        Save tools: <a href="#" id="exp">Export JSON</a> · <a href="#" id="imp">Import JSON</a> · <a href="#" id="wipe">Delete save</a>
        <input type="file" id="impfile" accept=".json" style="display:none">
      </div>
    </div>`;

  renderAgenda();
  updateRing();
  renderRaceHero();
  renderRadioBanner();
  renderActiveOps();
  renderDrawer();
  bindStaticControls();

  function bindStaticControls() {
    const btn = root.querySelector('#advance');
    if (btn) {
      btn.onclick = () => {
        if (running) {
          stop();
          btn.textContent = '▶ ADVANCE';
          btn.classList.remove('stop');
          setCtl('ADVANCE TIME');
          return;
        }
        running = true;
        btn.textContent = '■ STOP';
        btn.classList.add('stop');
        setCtl('STOP ADVANCING');
        timer = setTimeout(stepDay, 150);
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
        wipe();
        document.documentElement.style.setProperty('--team', '#e10600');
        location.hash = '#/start';
      };
    }
  }

  function setCtl(t) {
    const el = document.getElementById('ctl-label');
    if (el) el.textContent = t;
  }

  function updateRing() {
    const st = getState();
    const race = nextRace(st.date);
    const ring = document.getElementById('ring');
    if (!ring) return;
    if (!race) { ring.style.setProperty('--p', '100%'); return; }
    const start = fromISO('2026-02-20'), now = fromISO(st.date), target = fromISO(race.sat);
    ring.style.setProperty('--p', Math.min(100, Math.max(0, (now - start) / (target - start) * 100)) + '%');
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
    slot.innerHTML = `
      <div class="hq-race-stop-card">
        <div class="hq-race-stop-top">
          <span class="hq-race-flag">${race.flag}</span>
          <div>
            <div class="hq-race-eyebrow">RACE WEEKEND ARRIVED · ROUND ${race.round} OF 22</div>
            <div class="hq-race-title">${race.gp.toUpperCase()}</div>
            <div class="hq-race-sub">${race.circuit} · ${race.laps} Laps · Monoposto Car Power <b>${monopostoPower()}</b></div>
          </div>
          <a class="btn primary hq-race-cta" href="#/race">GO TO RACE WEEKEND →</a>
        </div>
        ${pending.length > 0 ? `
          <div class="hq-race-warn">
            <span><b>Chief Engineer Alert:</b> ${pending.length} researched part blueprint${pending.length === 1 ? ' is' : 's are'} sitting in Research un-manufactured!</span>
            <button class="btn small" id="hero-open-manuf">DEVELOP PARTS NOW</button>
          </div>
        ` : ''}
      </div>
    `;
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
          <div class="hq-radio-speaker">HEAD OF ENGINEERING · WEISSACH TEAM RADIO</div>
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
            <div class="hq-ops-title">ACTIVE FACTORY OPERATIONS — WEISSACH CONTROL</div>
            <div class="hq-ops-sub">
              Car #${prio.d1 ? prio.d1.no : '1'} (${prio.d1 ? prio.d1.last : 'D1'}): <b>${prio.car1Upgrades} upgrades</b>${prio.priorityCar === 1 ? ' <span class="tag good">★ +1 SPD PRIORITY</span>' : ''}
              &nbsp;·&nbsp;
              Car #${prio.d2 ? prio.d2.no : '2'} (${prio.d2 ? prio.d2.last : 'D2'}): <b>${prio.car2Upgrades} upgrades</b>${prio.priorityCar === 2 ? ' <span class="tag good">★ +1 SPD PRIORITY</span>' : ''}
            </div>
          </div>
          <div class="hq-ops-links">
            <a class="btn small" href="#/rd">FULL 40-PART R&amp;D TREE →</a>
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
              }).join('') : `<div class="hq-op-empty">No HQ facility sub-upgrades under construction.</div>`}
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
          if (q && !task && !q.gateBlocked) {
            available.push({ dept, part, q });
          }
        }
      }
      bodyHTML = `
        <div class="hq-drawer-sub">Available blueprints unlocked for immediate wind-tunnel research (Balance: <b>${st.rp} RP</b>):</div>
        <div class="hq-drawer-list">
          ${available.length ? available.map(({ dept, part, q }) => `
            <div class="hq-drawer-row">
              <div>
                <div class="hq-drawer-itemtitle">${part.name} <span class="tag">${dept.name}</span> <span class="tag">${part.core ? `Spec ${q.step.spec}` : `Phase ${part.phase || 1}`}</span></div>
                <div class="hq-drawer-itemsub">+${q.step.dp} Team DP (${q.step.dp / 2} DP/car) · Mfg Cost ${q.step.manufCost ? fmt$(q.step.manufCost) : 'In-House'}</div>
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
        <div class="hq-drawer-sub">Researched blueprints ready for physical manufacturing (Bank: <b>${fmt$(st.cash)}</b>):</div>
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
        <div class="hq-drawer-sub">Unlocked Weissach HQ sub-upgrades available for construction (Bank: <b>${fmt$(st.cash)}</b>):</div>
        <div class="hq-drawer-list">
          ${buildableNodes.length ? buildableNodes.map(({ branch, phase, node }) => `
            <div class="hq-drawer-row">
              <div>
                <div class="hq-drawer-itemtitle">${node.name} <span class="tag">${branch.name} · Phase ${phase}</span></div>
                <div class="hq-drawer-itemsub">${node.effects.join(' · ')}</div>
              </div>
              <button class="btn small" data-drawer-fac="${node.id}">BUILD · ${fmt$(node.cost)} · ${node.days}d</button>
            </div>
          `).join('') : '<div class="hq-op-empty">Every HQ facility sub-upgrade is either built or currently under construction!</div>'}
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
    // Remove Day 1 static cards once live events begin firing
    feedItems.querySelectorAll('.feed-day1-card').forEach(el => el.remove());

    if (isWeeklyTick) {
      // Replace previous Monday's weekly tick cards instead of stacking forever
      feedItems.querySelectorAll('.feed-tick-card').forEach(el => el.remove());
      feedItems.insertAdjacentHTML('afterbegin', html);
    } else {
      feedItems.insertAdjacentHTML('afterbegin', html);
      // Keep non-tick event notifications tidy (cap at 5 recent banners)
      const banners = feedItems.querySelectorAll('.feed-event-banner');
      if (banners.length > 5) {
        for (let i = 5; i < banners.length; i++) banners[i].remove();
      }
    }
  }

  function fireEvent(ev) {
    if (ev.type === 'tick') {
      floater('hud-cash', `+${fmt$(ev.income)}`, 'pos');
      floater('hud-rp', `+${ev.rp} RP`, 'pos');
      pushFeedItem(`
        <div class="card pos feed-tick-card"><div><div class="ct">Weekly Sponsor Base Income</div><div class="cs">Monday settlement · 40% season base (${prettyDate(getState().date)})</div></div><div class="amt pos">+${fmt$(ev.income)}</div></div>
        <div class="card neg feed-tick-card"><div><div class="ct">Weissach HQ Running Costs</div><div class="cs">Weekly department &amp; facility operating overhead</div></div><div class="amt neg">−${fmt$(ev.costs)}</div></div>
        <div class="card pos feed-tick-card"><div><div class="ct">Weekly Resource Points</div><div class="cs">Engineering &amp; Personnel generation · ATR applied</div></div><div class="amt pos">+${ev.rp} RP</div></div>
      `, true);
    } else if (ev.type === 'research') {
      const cls = ev.outcome === 'failure' ? 'red' : ev.outcome === 'breakthrough' ? 'blue' : '';
      pushFeedItem(`<div class="banner ${cls} feed-event-banner"><div class="bt">${ev.title}</div><div class="bs">${ev.label}</div></div>`, false);
    } else if (ev.type === 'manufacture') {
      pushFeedItem(`<div class="banner blue feed-event-banner"><div class="bt">${ev.title}</div><div class="bs">${ev.label}</div></div>`, false);
    } else if (ev.type === 'facility') {
      pushFeedItem(`<div class="banner feed-event-banner"><div class="bt">Facility Upgrade Operational</div><div class="bs">${ev.title} — ${ev.label}</div></div>`, false);
    } else if (ev.type === 'race') {
      renderRaceHero(ev.race);
    }
  }

  function stepDay() {
    if (!running) return;
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
    updateRing();
    refreshHUD();
    for (const ev of fired) fireEvent(ev);
    renderRadioBanner();
    renderActiveOps();

    if (fired.some(e => e.type === 'race')) {
      stop();
      const btn = root.querySelector('#advance');
      if (btn) {
        btn.textContent = '▶ ADVANCE';
        btn.classList.remove('stop');
      }
      setCtl('ADVANCE TIME');
      return;
    }
    if (!nextRace(st.date) && st.date > '2026-12-06') {
      stop();
      const btn = root.querySelector('#advance');
      if (btn) {
        btn.textContent = 'SEASON OVER';
        btn.disabled = true;
      }
      return;
    }
    timer = setTimeout(stepDay, 220);
  }
}

