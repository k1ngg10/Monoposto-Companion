// R&D — Authentic 3-Screen F1 Game Research & Development Workflow:
// Screen 1 ('hub'):         2x2 Department Overview Hub + Vehicle Performance Comparison.
// Screen 2 ('subcategory'): "SELECT A PART TO RESEARCH" — Vertical Subcategory Spine (^ / v),
//                           Horizontal Chamfered Part Card Row (with UNKNOWN UPGRADE for locked nodes),
//                           and Lower Subcategory Progress Strips ([✓]-[✓]-[ ]-[?]).
// Screen 3 ('detail'):      "DEVELOP UPGRADE" — Dedicated Part Detail Page with Chamfered Card +
//                           Translucent Spec Box, Calendar Timeline with GP Flags, Standard / Rush
//                           F1 Reticle Action Cards, UNLOCKS preview, and Vehicle Performance Comparison.

import { DEPARTMENTS, APPROACHES, partById, partsUnlockedBy } from '../data/partsCatalog.js?v=20261022j';
import { CALENDAR, nextRace } from '../data/calendar2026.js?v=20261022j';
import {
  engineeringPhase,
  facilityEconomyStats,
  hasDualBuild,
  maxResearchSlots,
  maxManufactureSlots
} from '../data/facilitiesCatalog.js?v=20261022j';
import {
  getState,
  save,
  truePower,
  monopostoPower,
  driverPriorityStatus,
  unmanufacturedBlueprints
} from '../engine/store.js?v=20261022j';
import {
  researchQuote,
  startResearch,
  manufactureQuote,
  startManufacture,
  debutRound
} from '../engine/rdEngine.js?v=20261022j';
import { prettyDate, addDays } from '../engine/timeEngine.js?v=20261022j';
import { vehiclePerformanceComparisonHTML } from './DevGraphView.js?v=20261022j';
import { topbarHTML, fmt$ } from './shared.js?v=20261022j';

let activeSubTab = 'performance'; // 'performance' | 'inprogress' | 'history'
let rdScreen = 'hub';             // 'hub' | 'subcategory' | 'detail'
let selectedDeptId = 'chassis';
let hoveredDeptId = 'aero';
let selectedSubcatByDept = {
  aero: 'aero_front',
  chassis: 'ch_redist',
  powertrain: 'pt_ice',
  durability: 'dur_pu'
};
let selectedPartByDept = {
  aero: 'frontwing',
  chassis: 'plank_mounts',
  powertrain: 'air_filter',
  durability: 'ctrl_elec'
};
let previewPartBySubcat = {};
let msg = '', msgErr = false;

const DEPT_META = {
  aero: {
    id: 'aero',
    title: 'AERODYNAMICS',
    themeClass: 'aero',
    accent: '#2aa8ff',
    desc: 'The Aerodynamics department governs front wing downforce, underbody Venturi suction, sidepod outwash conditioning, and active rear wing drag reduction.'
  },
  chassis: {
    id: 'chassis',
    title: 'CHASSIS',
    themeClass: 'chassis',
    accent: '#8bc34a',
    desc: 'The Chassis department controls longitudinal weight redistribution, carbon-composite weight reduction, and braking & suspension compliance.'
  },
  powertrain: {
    id: 'powertrain',
    title: 'POWERTRAIN',
    themeClass: 'powertrain',
    accent: '#ff2a9d',
    desc: 'The Powertrain department develops internal combustion efficiency, 350 kW MGU-K electrical recovery, and turbocharger e-fuel injection.'
  },
  durability: {
    id: 'durability',
    title: 'DURABILITY',
    themeClass: 'durability',
    accent: '#f5c518',
    desc: 'The Durability department reinforces power unit thermal reliability, control electronics, and 8-speed gearbox wear resistance.'
  }
};

// Geometric SVG icons (no emojis, no controller buttons)
const SVG_CLOCK = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 3h6"/><path d="M12 3v2"/></svg>`;
const SVG_CHECK = `<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 10.5 8.2 14.5 16 6"/></svg>`;
const SVG_UP = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>`;
const SVG_DOWN = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;

function actionReticleSVG(mode = 'play') {
  const glyph = mode === 'rush'
    ? `<polygon points="14,14 21,20 14,26" fill="currentColor"/><polygon points="20,14 27,20 20,26" fill="currentColor"/>`
    : mode === 'conservative'
      ? `<polygon points="16,13 26,20 16,27" fill="currentColor"/><circle cx="20" cy="20" r="9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="3 2"/>`
      : `<polygon points="16,13 27,20 16,27" fill="currentColor"/>`;
  return `
    <span class="f1rd-act-reticle" aria-hidden="true">
      <svg viewBox="0 0 40 40" width="38" height="38">
        <circle class="f1rd-ret-outer" cx="20" cy="20" r="17.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="16 6 8 6" opacity="0.72"/>
        <circle class="f1rd-ret-inner" cx="20" cy="20" r="13" fill="rgba(10,12,16,0.9)" stroke="#ffffff" stroke-width="1.8"/>
        ${glyph}
      </svg>
    </span>
  `;
}

export function setRdStage(stage) {
  if (stage === 'manufacture') {
    activeSubTab = 'inprogress';
    rdScreen = 'hub';
  } else if (stage === 'research' || stage === 'all') {
    activeSubTab = 'performance';
  }
}

// Compute department upgrade progress
function deptStats(s, dept) {
  let totalSteps = 0;
  let completedSteps = 0;
  let readyToBuild = 0;
  for (const part of dept.parts) {
    const ps = s.parts[part.id] || { researched: 0, car1: 0, car2: 0 };
    const c1 = typeof ps.car1 === 'number' ? ps.car1 : 0;
    const c2 = typeof ps.car2 === 'number' ? ps.car2 : 0;
    totalSteps += part.steps.length;
    completedSteps += Math.min(part.steps.length, ps.researched || 0);
    if ((ps.researched || 0) > c1 || (ps.researched || 0) > c2) {
      readyToBuild++;
    }
  }
  const pct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  return { totalSteps, completedSteps, readyToBuild, pct, partCount: dept.parts.length };
}

// Compute overall R&D KPI metrics shown in the top-right corner of Screenshots 1, 2, 3
function globalRdKpis(s, deptId, approachId = 'standard') {
  let totalUpgrades = 0;
  let completedUpgrades = 0;
  for (const d of DEPARTMENTS) {
    for (const p of d.parts) {
      totalUpgrades += p.steps.length;
      const ps = s.parts[p.id];
      if (ps && ps.researched) {
        completedUpgrades += Math.min(p.steps.length, ps.researched);
      }
    }
  }
  const facStats = facilityEconomyStats(s);
  const deptBonus = (facStats.d20ByDept && facStats.d20ByDept[deptId]) || 0;
  const appMod = (APPROACHES[approachId] || APPROACHES.standard).d20 || 0;
  const mod = Math.min(6, deptBonus + appMod);
  // D20 <= 4 fails: raw + mod <= 4 => raw <= 4 - mod
  const failCount = Math.max(0, Math.min(20, 4 - mod));
  const failurePct = Math.round((failCount / 20) * 100);
  const activeRes = s.tasks.filter(t => t.kind === 'research').length;
  const maxRes = maxResearchSlots(s);
  return { completedUpgrades, totalUpgrades, failurePct, activeRes, maxRes };
}

function kpiStripHTML(s, deptId, approachId = 'standard') {
  const kpi = globalRdKpis(s, deptId, approachId);
  return `
    <div class="f1rd-kpi-strip">
      <div class="f1rd-kpi-box">
        <span class="f1rd-kpi-lbl">TOTAL UPGRADES</span>
        <b class="f1rd-kpi-val">${kpi.completedUpgrades}/${kpi.totalUpgrades}</b>
      </div>
      <div class="f1rd-kpi-box">
        <span class="f1rd-kpi-lbl">FAILURE CHANCE</span>
        <b class="f1rd-kpi-val">${kpi.failurePct}%</b>
      </div>
      <div class="f1rd-kpi-box">
        <span class="f1rd-kpi-lbl">SIMULTANEOUS UPGRADES</span>
        <b class="f1rd-kpi-val">${kpi.activeRes}/${kpi.maxRes}</b>
      </div>
    </div>
  `;
}

function progressRingSVG(pct, accentColor) {
  const r = 34;
  const c = +(2 * Math.PI * r).toFixed(2);
  const offset = +(c - (Math.min(100, Math.max(0, pct)) / 100) * c).toFixed(2);
  return `
    <div class="f1rd-ring-wrap">
      <svg class="f1rd-ring-svg" viewBox="0 0 84 84" aria-hidden="true">
        <circle class="f1rd-ring-bg" cx="42" cy="42" r="${r}" />
        <circle class="f1rd-ring-fg" cx="42" cy="42" r="${r}"
          style="stroke:${accentColor};stroke-dasharray:${c};stroke-dashoffset:${offset}" />
      </svg>
      <div class="f1rd-ring-inner" style="color:${accentColor}">
        <span>${pct}%</span>
      </div>
    </div>
  `;
}

// Classify a part's state for Screen 2 (Subcategory Browser)
function classifyPartNode(s, part) {
  const ps = s.parts[part.id] || { researched: 0, car1: 0, car2: 0 };
  const c1 = typeof ps.car1 === 'number' ? ps.car1 : 0;
  const c2 = typeof ps.car2 === 'number' ? ps.car2 : 0;
  const maxSpec = part.steps.length;
  const task = s.tasks.find(t => t.partId === part.id);
  const qRes = researchQuote(s, part.id, 'standard');

  const isCompleted = (ps.researched || 0) >= maxSpec && c1 >= maxSpec && c2 >= maxSpec;
  const needsBuild = (ps.researched || 0) > c1 || (ps.researched || 0) > c2;
  const isLocked = Boolean(qRes && qRes.prereqBlocked && (ps.researched || 0) === 0);

  let nodeType = 'available'; // 'completed' | 'ready' | 'inprog' | 'available' | 'locked'
  if (isCompleted) nodeType = 'completed';
  else if (task) nodeType = 'inprog';
  else if (needsBuild) nodeType = 'ready';
  else if (isLocked) nodeType = 'locked';

  return { ps, c1, c2, maxSpec, task, qRes, nodeType, isCompleted, needsBuild, isLocked };
}

// ============================================================================
// SCREEN 1: 2x2 DEPARTMENT OVERVIEW HUB
// ============================================================================
function renderPerformanceHub(s) {
  const activeMeta = DEPT_META[hoveredDeptId] || DEPT_META.aero;
  const prio = driverPriorityStatus(s);
  const pending = unmanufacturedBlueprints(s);
  const activeRes = s.tasks.filter(t => t.kind === 'research');
  const activeMan = s.tasks.filter(t => t.kind === 'manufacture');

  return `
    <div class="f1rd-hub-layout">
      <div class="f1rd-hub-left">
        <div class="f1rd-dept-grid">
          ${DEPARTMENTS.map(dept => {
            const meta = DEPT_META[dept.id] || DEPT_META.aero;
            const st = deptStats(s, dept);
            const isFoc = hoveredDeptId === dept.id;
            return `
              <button type="button" class="f1rd-dept-tile ${meta.themeClass} ${isFoc ? 'is-focused' : ''}" data-open-dept="${dept.id}" data-hover-dept="${dept.id}">
                <div class="f1rd-dept-top">
                  <span class="f1rd-dept-name">${meta.title}</span>
                  ${st.readyToBuild ? `<span class="f1rd-dept-ready">${st.readyToBuild} BLUEPRINT${st.readyToBuild > 1 ? 'S' : ''} READY</span>` : ''}
                </div>
                <div class="f1rd-dept-bottom">
                  <div class="f1rd-dept-count">${st.completedSteps}/${st.totalSteps}</div>
                  ${progressRingSVG(st.pct, meta.accent)}
                </div>
              </button>
            `;
          }).join('')}
        </div>

        <div class="f1rd-dept-blurb-bar" style="--dept-accent:${activeMeta.accent}">
          <div class="f1rd-dept-blurb-text">${activeMeta.desc}</div>
          <div class="f1rd-dept-blurb-hint">Click any department tile above to browse its F1 subcategories &amp; part upgrades.</div>
        </div>

        <div class="f1rd-status-strip">
          <div class="f1rd-status-cell">
            <span>CAR #${prio.d1 ? prio.d1.no : '1'} (${prio.d1 ? prio.d1.last.toUpperCase() : 'D1'})</span>
            <b>${prio.car1Upgrades} Fitted · SPD ${prio.d1EffectiveSpeed}${prio.priorityCar === 1 ? ' (+1 Prio)' : ''}</b>
          </div>
          <div class="f1rd-status-cell">
            <span>CAR #${prio.d2 ? prio.d2.no : '2'} (${prio.d2 ? prio.d2.last.toUpperCase() : 'D2'})</span>
            <b>${prio.car2Upgrades} Fitted · SPD ${prio.d2EffectiveSpeed}${prio.priorityCar === 2 ? ' (+1 Prio)' : ''}</b>
          </div>
          <div class="f1rd-status-cell">
            <span>ACTIVE QUEUES</span>
            <b>Research ${activeRes.length}/${maxResearchSlots(s)} · Build ${activeMan.length}/${maxManufactureSlots(s)}${pending.length ? ` · ${pending.length} Ready` : ''}</b>
          </div>
        </div>
      </div>

      <div class="f1rd-hub-right">
        ${vehiclePerformanceComparisonHTML(s)}
      </div>
    </div>
  `;
}

// ============================================================================
// SCREEN 2: SUBCATEGORY BROWSER ("SELECT A PART TO RESEARCH" — Screenshots 1 & 2)
// ============================================================================
function renderSubcategoryBrowser(s, deptId) {
  const dept = DEPARTMENTS.find(d => d.id === deptId) || DEPARTMENTS[0];
  const meta = DEPT_META[dept.id] || DEPT_META.chassis;
  const subcats = dept.subcategories || [];
  let activeSubcatId = selectedSubcatByDept[dept.id] || (subcats[0] && subcats[0].id);
  if (!subcats.some(sc => sc.id === activeSubcatId) && subcats[0]) {
    activeSubcatId = subcats[0].id;
    selectedSubcatByDept[dept.id] = activeSubcatId;
  }
  const activeSubcatIdx = Math.max(0, subcats.findIndex(sc => sc.id === activeSubcatId));
  const activeSubcat = subcats[activeSubcatIdx] || { id: 'default', name: dept.name };

  const subcatParts = dept.parts.filter(p => p.subcategoryId === activeSubcat.id);
  const completedInSubcat = subcatParts.filter(p => {
    const { ps } = classifyPartNode(s, p);
    return (ps.researched || 0) >= 1;
  }).length;

  // Determine which part in the active row is highlighted for the bottom-right preview bar
  let previewPartId = previewPartBySubcat[activeSubcat.id];
  if (!subcatParts.some(p => p.id === previewPartId)) {
    const firstAvail = subcatParts.find(p => {
      const st = classifyPartNode(s, p);
      return !st.isCompleted && !st.isLocked;
    });
    previewPartId = (firstAvail || subcatParts[0] || dept.parts[0]).id;
    previewPartBySubcat[activeSubcat.id] = previewPartId;
  }
  const previewPart = subcatParts.find(p => p.id === previewPartId) || subcatParts[0];
  const previewInfo = classifyPartNode(s, previewPart);
  const previewStep = previewInfo.qRes ? previewInfo.qRes.step : previewPart.steps[Math.max(0, (previewInfo.ps.researched || 1) - 1)];
  const previewDue = previewInfo.task
    ? previewInfo.task.due
    : addDays(s.date, previewInfo.qRes ? previewInfo.qRes.days : previewStep.researchDays);

  // Other subcategories for the lower compact progress strips (Screenshots 1 & 2)
  const lowerSubcats = subcats.filter(sc => sc.id !== activeSubcat.id);

  return `
    <div class="f1rd-subbrowser ${meta.themeClass}" style="--dept-accent:${meta.accent}">
      <!-- Top Bar: Title + Department Tabs + Right KPI Strip -->
      <div class="f1rd-sb-topbar">
        <div class="f1rd-sb-titlecol">
          <div class="f1rd-sb-breadcrumbs">
            <button type="button" class="btn small f1rd-back-btn" id="f1rd-back-hub">← BACK TO 2×2 HUB</button>
            <div class="f1rd-dept-pills">
              ${DEPARTMENTS.map(d => `<button type="button" class="f1rd-dpill ${d.id === dept.id ? 'on' : ''}" data-switch-dept="${d.id}">${d.name.toUpperCase()}</button>`).join('')}
            </div>
          </div>
          <h1 class="f1rd-sb-heading">SELECT A PART TO RESEARCH</h1>
        </div>
        ${kpiStripHTML(s, dept.id, 'standard')}
      </div>

      <!-- Main Row: Left Vertical Subcategory Spine + Horizontal Chamfered Part Cards -->
      <div class="f1rd-sb-stage">
        <div class="f1rd-spine">
          <button type="button" class="f1rd-spine-arrow" id="f1rd-subcat-prev" title="Previous Subcategory (${subcats[(activeSubcatIdx - 1 + subcats.length) % subcats.length]?.name || ''})">
            ${SVG_UP}
          </button>
          <div class="f1rd-spine-count">${completedInSubcat}/${subcatParts.length}</div>
          <div class="f1rd-spine-label-wrap">
            <div class="f1rd-spine-label">${activeSubcat.name.toUpperCase()}</div>
          </div>
          <button type="button" class="f1rd-spine-arrow" id="f1rd-subcat-next" title="Next Subcategory (${subcats[(activeSubcatIdx + 1) % subcats.length]?.name || ''})">
            ${SVG_DOWN}
          </button>
        </div>

        <div class="f1rd-cards-track">
          ${subcatParts.map((part, idx) => {
            const info = classifyPartNode(s, part);
            const isPreviewed = part.id === previewPart.id;
            const step = info.qRes ? info.qRes.step : part.steps[Math.min(part.steps.length - 1, Math.max(0, (info.ps.researched || 1) - 1))];
            const baseRp = step.rp;
            const discRp = info.qRes ? info.qRes.rp : baseRp;
            const hasDiscount = discRp < baseRp;

            // Top-right badge inside card
            let topRightHTML = '';
            if (info.nodeType === 'completed') {
              topRightHTML = `<span class="f1rd-card-check">${SVG_CHECK}</span>`;
            } else if (info.nodeType === 'ready') {
              topRightHTML = `<span class="f1rd-card-rp ready-pill">SPEC ${info.ps.researched} READY</span>`;
            } else if (info.nodeType === 'inprog') {
              topRightHTML = `<span class="f1rd-card-rp inprog-pill">IN R&amp;D</span>`;
            } else if (info.nodeType === 'available') {
              topRightHTML = `<span class="f1rd-card-rp"><b>${discRp}</b>${hasDiscount ? ` <s>${baseRp}</s>` : ''} RP</span>`;
            }

            // Status strip underneath the chamfered card (matching Screenshots 1 & 2)
            let statusText = 'Available';
            let statusTag = '';
            if (info.nodeType === 'completed') {
              statusTag = 'BOT';
              statusText = 'Completed';
            } else if (info.nodeType === 'ready') {
              statusTag = `S${info.ps.researched}`;
              statusText = 'Develop / Build';
            } else if (info.nodeType === 'inprog') {
              statusTag = 'R&D';
              statusText = `Due ${prettyDate(info.task.due)}`;
            } else if (info.nodeType === 'locked') {
              statusText = 'Locked';
            } else if (info.qRes && info.qRes.gateBlocked) {
              statusText = `Eng. Phase ${info.qRes.neededPhase}`;
            }

            const displayTitle = info.isLocked ? 'UNKNOWN UPGRADE' : part.name.toUpperCase();
            const displaySub = info.isLocked ? '' : meta.title;

            return `
              <div class="f1rd-pcard-col ${idx > 0 ? 'has-connector' : ''}">
                <button
                  type="button"
                  class="f1rd-pcard ${info.nodeType} ${isPreviewed ? 'is-selected' : ''}"
                  data-card-part="${part.id}"
                  data-card-locked="${info.isLocked ? '1' : '0'}"
                >
                  <div class="f1rd-pcard-inner">
                    <div class="f1rd-pcard-top">
                      <span class="f1rd-pcard-tier">${info.isLocked ? '' : (part.core ? `SPEC ${Math.min(part.steps.length, (info.ps.researched || 0) + (info.isCompleted ? 0 : 1))}/${part.steps.length}` : (part.tier || 'MINOR').toUpperCase())}</span>
                      ${topRightHTML}
                    </div>

                    <div class="f1rd-pcard-art" aria-hidden="true">
                      ${info.isLocked
                        ? `<span class="f1rd-pcard-qmark">?</span>`
                        : `<div class="f1rd-pcard-schem">
                             <span class="f1rd-schem-dp">+${step.dp} DP</span>
                             <span class="f1rd-schem-sub">${part.subcategoryName || activeSubcat.name}</span>
                           </div>`
                      }
                    </div>

                    <div class="f1rd-pcard-bottom">
                      <div class="f1rd-pcard-title">${displayTitle}</div>
                      ${displaySub ? `<div class="f1rd-pcard-dept" style="color:${meta.accent}">${displaySub}</div>` : ''}
                    </div>
                  </div>
                </button>

                <div class="f1rd-pcard-status ${info.nodeType}">
                  ${statusTag ? `<span class="f1rd-st-code">${statusTag}</span>` : `<span class="f1rd-st-bar"></span>`}
                  <span class="f1rd-st-txt">${statusText}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Lower Section: Compact Subcategory Progress Strips on Left + Completion Preview on Right -->
      <div class="f1rd-sb-bottom">
        <div class="f1rd-strips-col">
          <div class="f1rd-strips-label">OTHER ${meta.title} SUBCATEGORIES (CLICK TO SWITCH)</div>
          ${lowerSubcats.map(sc => {
            const scParts = dept.parts.filter(p => p.subcategoryId === sc.id);
            const scDone = scParts.filter(p => (classifyPartNode(s, p).ps.researched || 0) >= 1).length;
            return `
              <button type="button" class="f1rd-substrip" data-switch-subcat="${sc.id}">
                <span class="f1rd-substrip-count">${scDone}/${scParts.length}</span>
                <span class="f1rd-substrip-name">${sc.name.toUpperCase()}</span>
                <div class="f1rd-substrip-nodes">
                  ${scParts.map((p, i) => {
                    const st = classifyPartNode(s, p);
                    const done = (st.ps.researched || 0) >= 1;
                    const locked = st.isLocked;
                    return `
                      ${i > 0 ? `<span class="f1rd-snode-line ${done ? 'done' : ''}"></span>` : ''}
                      <span class="f1rd-snode ${done ? 'done' : locked ? 'locked' : 'avail'}">
                        ${done ? SVG_CHECK : locked ? '?' : ''}
                      </span>
                    `;
                  }).join('')}
                </div>
              </button>
            `;
          }).join('')}
        </div>

        <div class="f1rd-preview-col">
          <div class="f1rd-est-bar">
            ${previewInfo.isCompleted ? `
              <span class="f1rd-est-lbl">COMPLETED</span>
              <b class="f1rd-est-val">${previewPart.name.toUpperCase()} · FITTED ON BOTH CARS</b>
            ` : previewInfo.isLocked ? `
              <span class="f1rd-est-lbl">LOCKED UPGRADE</span>
              <b class="f1rd-est-val">RESEARCH ${previewInfo.qRes?.prereqName?.toUpperCase() || 'PREREQUISITE'} TO REVEAL</b>
            ` : `
              <span class="f1rd-est-lbl">ESTIMATED COMPLETION</span>
              <b class="f1rd-est-val">${prettyDate(s.date).toUpperCase()} - ${prettyDate(previewDue).toUpperCase()}</b>
            `}
          </div>
          <div class="f1rd-preview-hint">
            Click any unlocked upgrade card above to open its dedicated <b>DEVELOP UPGRADE</b> screen.
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// SCREEN 3: DEDICATED PART DETAIL SCREEN ("DEVELOP UPGRADE" — Screenshot 3)
// ============================================================================
function buildTimelineNodes(s, dueIso) {
  const nodes = [];
  nodes.push({ kind: 'start', date: s.date, label: prettyDate(s.date).toUpperCase(), sub: 'START' });

  // Find upcoming Grand Prix events around the completion window so the timeline looks like Screenshot 3
  const upcomingRaces = CALENDAR.filter(r => r.sun >= s.date).slice(0, 3);
  let completeInserted = false;

  for (const r of upcomingRaces) {
    if (!completeInserted && dueIso <= r.sun) {
      nodes.push({ kind: 'complete', date: dueIso, label: 'COMPLETE', sub: prettyDate(dueIso).toUpperCase() });
      completeInserted = true;
    }
    nodes.push({ kind: 'gp', date: r.sun, flag: r.flag, label: prettyDate(r.sun).toUpperCase(), sub: `R${r.round} ${r.country.toUpperCase()}` });
  }
  if (!completeInserted) {
    nodes.push({ kind: 'complete', date: dueIso, label: 'COMPLETE', sub: prettyDate(dueIso).toUpperCase() });
  }
  return nodes.slice(0, 5);
}

function renderDevelopUpgradePage(s, deptId) {
  const dept = DEPARTMENTS.find(d => d.id === deptId) || DEPARTMENTS[0];
  const meta = DEPT_META[dept.id] || DEPT_META.chassis;
  const prio = driverPriorityStatus(s);
  const d1No = prio.d1 ? prio.d1.no : '1';
  const d2No = prio.d2 ? prio.d2.no : '2';

  const curPartId = selectedPartByDept[dept.id] || dept.parts[0].id;
  const part = dept.parts.find(p => p.id === curPartId) || dept.parts[0];
  selectedPartByDept[dept.id] = part.id;
  if (part.subcategoryId) {
    selectedSubcatByDept[dept.id] = part.subcategoryId;
  }

  const ps = s.parts[part.id] || { researched: 0, copies: 0, car1: 0, car2: 0 };
  const c1 = typeof ps.car1 === 'number' ? ps.car1 : 0;
  const c2 = typeof ps.car2 === 'number' ? ps.car2 : 0;
  const maxSpec = part.steps.length;
  const task = s.tasks.find(t => t.partId === part.id);

  const qStd = researchQuote(s, part.id, 'standard');
  const qRush = researchQuote(s, part.id, 'aggressive');
  const qCons = researchQuote(s, part.id, 'conservative');
  const qCar1 = manufactureQuote(s, part.id, 'car1');
  const qCar2 = manufactureQuote(s, part.id, 'car2');
  const qBoth = manufactureQuote(s, part.id, 'both');

  const activeStep = qStd ? qStd.step : part.steps[Math.min(maxSpec - 1, Math.max(0, (ps.researched || 1) - 1))];
  const baseRp = activeStep.rp;
  const displayRp = qStd ? qStd.rp : baseRp;
  const hasDiscount = displayRp < baseRp;
  const displayDays = qStd ? qStd.days : (qBoth ? qBoth.days : activeStep.researchDays);
  const projectedDue = task ? task.due : addDays(s.date, displayDays);

  const kpiStd = globalRdKpis(s, dept.id, 'standard');
  const kpiRush = globalRdKpis(s, dept.id, 'aggressive');
  const kpiCons = globalRdKpis(s, dept.id, 'conservative');

  const tierName = part.tier || (part.core ? 'Major' : 'Minor');
  const subcatLabel = part.subcategoryName || dept.name;
  const categorySubtitle = `${tierName} - ${subcatLabel}`;

  const unlockedDownstream = partsUnlockedBy(part.id);
  const tlNodes = buildTimelineNodes(s, projectedDue);

  return `
    <div class="f1rd-devpage ${meta.themeClass}" style="--dept-accent:${meta.accent}">
      <!-- Top Bar: DEVELOP UPGRADE + Back to Subcategories + KPI Strip -->
      <div class="f1rd-sb-topbar">
        <div class="f1rd-sb-titlecol">
          <div class="f1rd-sb-breadcrumbs">
            <button type="button" class="btn small f1rd-back-btn" id="f1rd-back-subcat">← BACK TO ${subcatLabel.toUpperCase()}</button>
            <span class="f1rd-crumb-tag">${meta.title} · ${subcatLabel.toUpperCase()}</span>
          </div>
          <h1 class="f1rd-sb-heading">DEVELOP UPGRADE</h1>
        </div>
        ${kpiStripHTML(s, dept.id, 'standard')}
      </div>

      <!-- Screenshot 3 Two-Column Split: Left (Card + Translucent Box + Timeline + Actions) | Right (UNLOCKS + Performance Comparison) -->
      <div class="f1rd-dev-grid">
        <div class="f1rd-dev-left">
          <!-- Two-Box Inspector Row -->
          <div class="f1rd-two-box-row">
            <!-- Left Chamfered Part Card -->
            <div class="f1rd-chamfer-box">
              <div class="f1rd-chamfer-inner">
                <div class="f1rd-chamfer-topmeta">
                  <span>${part.core ? `SPEC ${Math.min(maxSpec, (ps.researched || 0) + 1)}/${maxSpec}` : `PHASE ${part.phase || 1}`}</span>
                  <span class="f1rd-chamfer-rp"><b>${displayRp}</b>${hasDiscount ? ` <s>${baseRp}</s>` : ''} RP</span>
                </div>
                <div class="f1rd-chamfer-blueprint" aria-hidden="true">
                  <div class="f1rd-bp-line"></div>
                  <div class="f1rd-bp-spec">+${activeStep.dp} TEAM DP (+${activeStep.dp / 2} DP/CAR)</div>
                  <div class="f1rd-bp-cars">
                    <span>CAR #${d1No}: <b>${c1 ? `SPEC ${c1}` : 'STOCK'}</b></span>
                    <span>CAR #${d2No}: <b>${c2 ? `SPEC ${c2}` : 'STOCK'}</b></span>
                  </div>
                </div>
                <div class="f1rd-chamfer-bottom">
                  <div class="f1rd-chamfer-title">${part.name.toUpperCase()}</div>
                  <div class="f1rd-chamfer-dept" style="color:${meta.accent}">${meta.title}</div>
                </div>
              </div>
            </div>

            <!-- Right Translucent Detail Box -->
            <div class="f1rd-detail-box">
              <div>
                <div class="f1rd-detail-title">${part.name.toUpperCase()}</div>
                <div class="f1rd-detail-sub">${categorySubtitle}</div>
                <div class="f1rd-detail-divider"></div>
                <p class="f1rd-detail-desc">${part.blurb}</p>
                <div class="f1rd-detail-extra">
                  <span>Manufacturing: <b>${activeStep.costPerCopy ? fmt$(activeStep.costPerCopy) + ' / car' : 'In-House ($0.00M)'}</b> (${activeStep.manufDays}d)</span>
                </div>
              </div>
              <div>
                <div class="f1rd-detail-divider"></div>
                <div class="f1rd-detail-metrics">
                  <div class="f1rd-metric-rp">
                    <span class="f1rd-metric-val">${displayRp}${hasDiscount ? ` <s class="f1rd-rp-strike">${baseRp}</s>` : ''}</span>
                    <span class="f1rd-metric-unit">RP</span>
                  </div>
                  <div class="f1rd-metric-days">
                    <span class="f1rd-clock-icon">${SVG_CLOCK}</span>
                    <span class="f1rd-metric-val">${displayDays} DAYS</span>
                  </div>
                  <div class="f1rd-metric-fail">
                    <span class="f1rd-metric-val">${kpiStd.failurePct}%</span>
                    <span class="f1rd-metric-unit">FAILURE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Horizontal Calendar Completion Timeline Strip (Screenshot 3) -->
          <div class="f1rd-timeline">
            ${tlNodes.map((n, i) => `
              ${i > 0 ? `<div class="${n.kind === 'complete' || tlNodes[i - 1].kind === 'start' ? 'f1rd-tl-solid' : 'f1rd-tl-dashed'}"></div>` : ''}
              <div class="f1rd-tl-node ${n.kind}">
                ${n.kind === 'gp' ? `<div class="f1rd-tl-flag">${n.flag}</div>` : `<div class="f1rd-tl-tick"></div>`}
                <div class="f1rd-tl-label">
                  <b>${n.label}</b>
                  <span>${n.sub}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Bottom Action Cards (Standard / Rush / Conservative or Step B Manufacture) -->
          <div class="f1rd-dev-actions">
            ${task ? `
              <div class="f1rd-action-box locked">
                ${actionReticleSVG('play')}
                <div>
                  <div class="f1rd-act-title">${task.kind === 'research' ? 'Research in Progress' : `Manufacturing (${task.target === 'both' ? 'Both Cars' : task.target.toUpperCase()})`}</div>
                  <div class="f1rd-act-cost">Completes ${prettyDate(task.due)} · Debuts ${debutRound(task.due)}</div>
                </div>
              </div>
            ` : ''}

            ${!task && (qCar1 || qCar2 || qBoth) ? `
              <div class="f1rd-manuf-actions">
                <div class="f1rd-manuf-lbl">STEP B · BLUEPRINT READY FOR MANUFACTURING (BANK: ${fmt$(s.cash)})</div>
                <div class="f1rd-manuf-btns">
                  ${qCar1 ? `
                    <button type="button" class="f1rd-action-box clickable compact" data-manuf="${part.id}:car1">
                      ${actionReticleSVG('play')}
                      <div>
                        <div class="f1rd-act-title">Car #${d1No} (${prio.d1 ? prio.d1.last : 'D1'})</div>
                        <div class="f1rd-act-cost">${qCar1.cost ? fmt$(qCar1.cost) : '$0.00M'} · ${qCar1.days} Days (+${qCar1.dpGain} DP)</div>
                      </div>
                    </button>
                  ` : ''}
                  ${qCar2 ? `
                    <button type="button" class="f1rd-action-box clickable compact" data-manuf="${part.id}:car2">
                      ${actionReticleSVG('play')}
                      <div>
                        <div class="f1rd-act-title">Car #${d2No} (${prio.d2 ? prio.d2.last : 'D2'})</div>
                        <div class="f1rd-act-cost">${qCar2.cost ? fmt$(qCar2.cost) : '$0.00M'} · ${qCar2.days} Days (+${qCar2.dpGain} DP)</div>
                      </div>
                    </button>
                  ` : ''}
                  ${qBoth ? (
                    qBoth.dualUnlocked ? `
                      <button type="button" class="f1rd-action-box clickable compact primary-act" data-manuf="${part.id}:both">
                        ${actionReticleSVG('rush')}
                        <div>
                          <div class="f1rd-act-title">Both Cars (Dual Build)</div>
                          <div class="f1rd-act-cost">${qBoth.cost ? fmt$(qBoth.cost) : '$0.00M'} · ${qBoth.days} Days (+${qBoth.dpGain} DP)</div>
                        </div>
                      </button>
                    ` : `
                      <div class="f1rd-action-box locked compact">
                        <div>
                          <div class="f1rd-act-title">Dual Build Locked</div>
                          <div class="f1rd-act-cost">Unlock ${dept.name} Dual Bay in Eng. Phase 2</div>
                        </div>
                      </div>
                    `
                  ) : ''}
                </div>
              </div>
            ` : ''}

            ${!task && !(qCar1 || qCar2 || qBoth) && qStd ? (
              qStd.gateBlocked || qStd.prereqBlocked || qStd.unbuiltPrevSpec ? `
                <div class="f1rd-action-box locked">
                  ${actionReticleSVG('play')}
                  <div>
                    <div class="f1rd-act-title">Upgrade Locked</div>
                    <div class="f1rd-act-cost">
                      ${qStd.prereqBlocked
                        ? `Requires Prerequisite: ${qStd.prereqName}`
                        : qStd.unbuiltPrevSpec
                          ? `Manufacture Spec ${qStd.step.spec - 1} before researching Spec ${qStd.step.spec}`
                          : `Requires Engineering Facility Phase ${qStd.neededPhase}`}
                    </div>
                  </div>
                </div>
              ` : `
                <div class="f1rd-approach-cards">
                  <button type="button" class="f1rd-action-box clickable" data-research-mode="${part.id}:standard">
                    ${actionReticleSVG('play')}
                    <div>
                      <div class="f1rd-act-title">Standard</div>
                      <div class="f1rd-act-cost"><b>${qStd.rp} RP</b> · ${qStd.days} Days · ${kpiStd.failurePct}% Fail</div>
                    </div>
                  </button>

                  <button type="button" class="f1rd-action-box clickable rush-box" data-research-mode="${part.id}:aggressive">
                    ${actionReticleSVG('rush')}
                    <div>
                      <div class="f1rd-act-title">Rush</div>
                      <div class="f1rd-act-cost"><b>${qRush.rp} RP</b> · ${qRush.days} Days · ${kpiRush.failurePct}% Fail</div>
                    </div>
                  </button>

                  <button type="button" class="f1rd-action-box clickable cons-box" data-research-mode="${part.id}:conservative">
                    ${actionReticleSVG('conservative')}
                    <div>
                      <div class="f1rd-act-title">Conservative</div>
                      <div class="f1rd-act-cost"><b>${qCons.rp} RP</b> · ${qCons.days} Days · ${kpiCons.failurePct}% Fail</div>
                    </div>
                  </button>
                </div>
              `
            ) : ''}

            ${!task && !qStd && !qCar1 && !qCar2 ? `
              <div class="f1rd-action-box maxed">
                ${actionReticleSVG('play')}
                <div>
                  <div class="f1rd-act-title">Completed &amp; Fitted on Both Cars</div>
                  <div class="f1rd-act-cost">All ${maxSpec} specification(s) researched and manufactured</div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Right Column: UNLOCKS + VEHICLE PERFORMANCE COMPARISON (Screenshot 3) -->
        <div class="f1rd-dev-right">
          <div class="f1rd-unlocks-panel">
            <div class="f1rd-unlocks-title">UNLOCKS:</div>
            ${unlockedDownstream.length ? `
              <div class="f1rd-unlocks-list">
                ${unlockedDownstream.map(u => `
                  <div class="f1rd-unlock-card">
                    <div class="f1rd-unlock-chamfer">
                      <span class="f1rd-unlock-tier">${(u.tier || 'ULTIMATE').toUpperCase()}</span>
                      <span class="f1rd-unlock-name">${u.name.toUpperCase()}</span>
                      <span class="f1rd-unlock-dept" style="color:${meta.accent}">${meta.title} · ${(u.subcategoryName || '').toUpperCase()}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : part.core && (ps.researched || 0) + 1 < maxSpec ? `
              <div class="f1rd-unlock-card">
                <div class="f1rd-unlock-chamfer">
                  <span class="f1rd-unlock-tier">NEXT EVOLUTION</span>
                  <span class="f1rd-unlock-name">${part.name.toUpperCase()} SPEC ${(ps.researched || 0) + 2}</span>
                  <span class="f1rd-unlock-dept" style="color:${meta.accent}">+${part.steps[(ps.researched || 0) + 1].dp} DP UPGRADE</span>
                </div>
              </div>
            ` : `
              <div class="f1rd-unlock-empty">Final tier upgrade in the <b>${subcatLabel}</b> branch.</div>
            `}
          </div>

          ${vehiclePerformanceComparisonHTML(s, activeStep.dp)}
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// R&D IN PROGRESS & HISTORY TABS
// ============================================================================
function renderInProgressTab(s) {
  const activeRes = s.tasks.filter(t => t.kind === 'research');
  const activeMan = s.tasks.filter(t => t.kind === 'manufacture');
  const pending = unmanufacturedBlueprints(s);
  const prio = driverPriorityStatus(s);
  const d1No = prio.d1 ? prio.d1.no : '1';
  const d2No = prio.d2 ? prio.d2.no : '2';

  return `
    <div class="f1rd-subpage">
      <div class="f1rd-queue-grid">
        <div class="f1rd-queue-col">
          <div class="f1rd-qhead">
            <span>STEP A · ACTIVE RESEARCH IN PROGRESS</span>
            <b>${activeRes.length} / ${maxResearchSlots(s)} SLOTS</b>
          </div>
          ${activeRes.length ? activeRes.map(t => `
            <div class="trow">
              <div>
                <div class="tt">${t.title}</div>
                <div class="ts">${t.label} · Completes <b>${prettyDate(t.due)}</b> · Target Debut <b>${debutRound(t.due)}</b></div>
              </div>
              <span class="tag warn">IN RESEARCH</span>
            </div>
          `).join('') : `<div class="rd-empty"><div class="rd-empty-title">No Active Research Tasks</div><div class="rd-empty-sub">Open the Performance tab and select a department to start researching a new blueprint.</div></div>`}
        </div>

        <div class="f1rd-queue-col">
          <div class="f1rd-qhead">
            <span>STEP B · ACTIVE PART MANUFACTURING</span>
            <b>${activeMan.length} / ${maxManufactureSlots(s)} SLOTS</b>
          </div>
          ${activeMan.length ? activeMan.map(t => `
            <div class="trow">
              <div>
                <div class="tt">${t.title}</div>
                <div class="ts">${t.label} · Completes <b>${prettyDate(t.due)}</b> · Target Debut <b>${debutRound(t.due)}</b></div>
              </div>
              <span class="tag good">BUILDING</span>
            </div>
          `).join('') : `<div class="rd-empty"><div class="rd-empty-title">No Parts Currently on the Factory Floor</div><div class="rd-empty-sub">Manufacture researched blueprints below to fit them to Car #${d1No} and Car #${d2No}.</div></div>`}
        </div>
      </div>

      <div class="dept" style="margin-top:24px">RESEARCHED BLUEPRINTS READY FOR STEP B MANUFACTURING (${pending.length})</div>
      ${pending.length ? pending.map(({ part, spec, car1, car2 }) => {
        const q1 = manufactureQuote(s, part.id, 'car1');
        const q2 = manufactureQuote(s, part.id, 'car2');
        const qB = manufactureQuote(s, part.id, 'both');
        return `
          <div class="trow rd-row needs-build">
            <div>
              <div class="tt">${part.name} (Spec ${spec}) <span class="tag">${part.deptName} · ${part.subcategoryName || ''}</span></div>
              <div class="ts">Car #${d1No}: <b>${car1 ? `Spec ${car1}` : 'Stock'}</b> · Car #${d2No}: <b>${car2 ? `Spec ${car2}` : 'Stock'}</b></div>
            </div>
            <div class="rd-manuf-group">
              ${q1 ? `<button class="btn small" data-manuf="${part.id}:car1">BUILD CAR #${d1No} · ${q1.cost ? fmt$(q1.cost) : '$0.00M'} · ${q1.days}d (+${q1.dpGain} DP)</button>` : ''}
              ${q2 ? `<button class="btn small" data-manuf="${part.id}:car2">BUILD CAR #${d2No} · ${q2.cost ? fmt$(q2.cost) : '$0.00M'} · ${q2.days}d (+${q2.dpGain} DP)</button>` : ''}
              ${qB && qB.dualUnlocked ? `<button class="btn primary small" data-manuf="${part.id}:both">BUILD BOTH CARS · ${qB.cost ? fmt$(qB.cost) : '$0.00M'} · ${qB.days}d (+${qB.dpGain} DP)</button>` : ''}
            </div>
          </div>
        `;
      }).join('') : `<div class="rd-empty"><div class="rd-empty-title">All Researched Blueprints Are Manufactured</div><div class="rd-empty-sub">Every unlocked blueprint has already been fitted to both cars.</div></div>`}
    </div>
  `;
}

function renderHistoryTab(s) {
  const prio = driverPriorityStatus(s);
  const d1No = prio.d1 ? prio.d1.no : '1';
  const d2No = prio.d2 ? prio.d2.no : '2';
  const unlockedRows = [];
  let totalPartsCount = 0;

  for (const dept of DEPARTMENTS) {
    totalPartsCount += dept.parts.length;
    for (const part of dept.parts) {
      const ps = s.parts[part.id];
      if (ps && (ps.researched > 0 || ps.car1 > 0 || ps.car2 > 0)) {
        unlockedRows.push({ dept, part, ps });
      }
    }
  }

  return `
    <div class="f1rd-subpage">
      <div class="dept">COMPLETED BLUEPRINTS &amp; FITTED UPGRADE HISTORY (${unlockedRows.length} OF ${totalPartsCount} PARTS)</div>
      ${unlockedRows.length ? unlockedRows.map(({ dept, part, ps }) => `
        <div class="trow">
          <div>
            <div class="tt">${part.name} <span class="tag">${dept.name} · ${part.subcategoryName || ''}</span> ${ps.breakthrough ? `<span class="tag good">BREAKTHROUGH (+50% DP)</span>` : ''}</div>
            <div class="ts">
              Blueprint: <b>Spec ${ps.researched}/${part.steps.length}</b> ·
              Car #${d1No}: <b style="color:${ps.car1 >= ps.researched ? 'var(--green)' : '#fff'}">${ps.car1 ? `Spec ${ps.car1}` : 'Stock'}</b> ·
              Car #${d2No}: <b style="color:${ps.car2 >= ps.researched ? 'var(--green)' : '#fff'}">${ps.car2 ? `Spec ${ps.car2}` : 'Stock'}</b> ·
              Credited Team DP: <b>+${ps.dpCredited || 0} DP</b>
            </div>
          </div>
          <button type="button" class="btn small" data-inspect-part="${dept.id}:${part.id}">OPEN PART →</button>
        </div>
      `).join('') : `<div class="rd-empty"><div class="rd-empty-title">No Upgrades Completed Yet</div><div class="rd-empty-sub">As your engineering team completes Step A research and Step B manufacturing across the season, every upgrade will be logged here.</div></div>`}
    </div>
  `;
}

// ============================================================================
// MAIN RENDER & EVENT HANDLERS
// ============================================================================
export function render(root) {
  const s = getState();
  const tp = truePower();
  const nextInt = Math.floor(tp) + 1;
  const engPhase = engineeringPhase(s);
  const pendingBlueprints = unmanufacturedBlueprints(s);
  const activeCount = s.tasks.filter(t => t.kind === 'research' || t.kind === 'manufacture').length + pendingBlueprints.length;

  let bodyHTML = '';
  if (activeSubTab === 'inprogress') {
    bodyHTML = renderInProgressTab(s);
  } else if (activeSubTab === 'history') {
    bodyHTML = renderHistoryTab(s);
  } else if (rdScreen === 'subcategory') {
    bodyHTML = renderSubcategoryBrowser(s, selectedDeptId);
  } else if (rdScreen === 'detail') {
    bodyHTML = renderDevelopUpgradePage(s, selectedDeptId);
  } else {
    bodyHTML = renderPerformanceHub(s);
  }

  root.innerHTML = `
    ${topbarHTML(true)}
    <div class="f1rd-shell">
      <div class="f1rd-header-row">
        <div class="f1rd-subnav" role="tablist">
          <button type="button" class="f1rd-subtab ${activeSubTab === 'performance' ? 'active' : ''}" data-subtab="performance">Performance</button>
          <button type="button" class="f1rd-subtab ${activeSubTab === 'inprogress' ? 'active' : ''}" data-subtab="inprogress">
            R&amp;D in Progress ${activeCount ? `<span class="f1rd-subbadge">${activeCount}</span>` : ''}
          </button>
          <button type="button" class="f1rd-subtab ${activeSubTab === 'history' ? 'active' : ''}" data-subtab="history">Progress History</button>
        </div>
        <div class="f1rd-power-pill">
          <span>True Car Power <b>${tp.toFixed(2)}</b></span>
          <span>·</span>
          <span>Monoposto Slider <b>${monopostoPower()}</b> (${Math.max(0, Math.round((nextInt - tp) * 100))} DP to ${nextInt}.00)</span>
          <span>·</span>
          <span>Engineering <b>Phase ${engPhase}</b></span>
        </div>
      </div>

      ${msg ? `<div class="fac-alert ${msgErr ? 'err' : 'ok'}">${msg}</div>` : ''}

      ${bodyHTML}
    </div>
  `;

  // Sub-tab navigation
  root.querySelectorAll('[data-subtab]').forEach(btn => {
    btn.onclick = () => {
      activeSubTab = btn.dataset.subtab;
      if (activeSubTab !== 'performance') rdScreen = 'hub';
      msg = '';
      render(root);
    };
  });

  // 2x2 Department tile hover & click -> opens Screen 2 (Subcategory Browser)
  root.querySelectorAll('[data-open-dept]').forEach(tile => {
    tile.onmouseenter = () => {
      const dId = tile.dataset.hoverDept;
      if (dId && hoveredDeptId !== dId) {
        hoveredDeptId = dId;
        root.querySelectorAll('.f1rd-dept-tile').forEach(el => el.classList.toggle('is-focused', el.dataset.openDept === dId));
        const meta = DEPT_META[dId];
        const bar = root.querySelector('.f1rd-dept-blurb-bar');
        const txt = root.querySelector('.f1rd-dept-blurb-text');
        if (bar && meta) bar.style.setProperty('--dept-accent', meta.accent);
        if (txt && meta) txt.textContent = meta.desc;
      }
    };
    tile.onclick = () => {
      selectedDeptId = tile.dataset.openDept;
      hoveredDeptId = selectedDeptId;
      rdScreen = 'subcategory';
      msg = '';
      render(root);
    };
  });

  // Back to 2x2 Hub button (from Screen 2)
  const backHubBtn = root.querySelector('#f1rd-back-hub');
  if (backHubBtn) {
    backHubBtn.onclick = () => {
      rdScreen = 'hub';
      msg = '';
      render(root);
    };
  }

  // Back to Subcategory Browser button (from Screen 3)
  const backSubcatBtn = root.querySelector('#f1rd-back-subcat');
  if (backSubcatBtn) {
    backSubcatBtn.onclick = () => {
      rdScreen = 'subcategory';
      msg = '';
      render(root);
    };
  }

  // Department switcher pills inside Screen 2
  root.querySelectorAll('[data-switch-dept]').forEach(btn => {
    btn.onclick = () => {
      selectedDeptId = btn.dataset.switchDept;
      hoveredDeptId = selectedDeptId;
      rdScreen = 'subcategory';
      msg = '';
      render(root);
    };
  });

  // Left vertical spine Up (^) / Down (v) buttons in Screen 2
  const prevSubBtn = root.querySelector('#f1rd-subcat-prev');
  const nextSubBtn = root.querySelector('#f1rd-subcat-next');
  if ((prevSubBtn || nextSubBtn) && selectedDeptId) {
    const dept = DEPARTMENTS.find(d => d.id === selectedDeptId) || DEPARTMENTS[0];
    const subcats = dept.subcategories || [];
    const curIdx = Math.max(0, subcats.findIndex(sc => sc.id === selectedSubcatByDept[dept.id]));
    if (prevSubBtn && subcats.length) {
      prevSubBtn.onclick = () => {
        const nextIdx = (curIdx - 1 + subcats.length) % subcats.length;
        selectedSubcatByDept[dept.id] = subcats[nextIdx].id;
        msg = '';
        render(root);
      };
    }
    if (nextSubBtn && subcats.length) {
      nextSubBtn.onclick = () => {
        const nextIdx = (curIdx + 1) % subcats.length;
        selectedSubcatByDept[dept.id] = subcats[nextIdx].id;
        msg = '';
        render(root);
      };
    }
  }

  // Lower compact subcategory progress strips in Screen 2
  root.querySelectorAll('[data-switch-subcat]').forEach(btn => {
    btn.onclick = () => {
      if (selectedDeptId) {
        selectedSubcatByDept[selectedDeptId] = btn.dataset.switchSubcat;
        msg = '';
        render(root);
      }
    };
  });

  // Part Cards in Screen 2 -> Hover updates bottom-right completion preview; Click opens Screen 3 (DEVELOP UPGRADE)
  root.querySelectorAll('[data-card-part]').forEach(card => {
    const pId = card.dataset.cardPart;
    const isLocked = card.dataset.cardLocked === '1';

    card.onmouseenter = () => {
      const dept = DEPARTMENTS.find(d => d.id === selectedDeptId) || DEPARTMENTS[0];
      const scId = selectedSubcatByDept[dept.id];
      if (scId && previewPartBySubcat[scId] !== pId) {
        previewPartBySubcat[scId] = pId;
      }
    };

    card.onclick = () => {
      if (isLocked) {
        const q = researchQuote(s, pId, 'standard');
        msg = `Unknown Upgrade locked — research ${q && q.prereqName ? q.prereqName : 'the preceding upgrade in this subcategory'} first to reveal and unlock this part.`;
        msgErr = true;
        render(root);
        return;
      }
      selectedPartByDept[selectedDeptId] = pId;
      rdScreen = 'detail';
      msg = '';
      render(root);
    };
  });

  // Open part from History tab directly into Screen 3
  root.querySelectorAll('[data-inspect-part]').forEach(btn => {
    btn.onclick = () => {
      const [dId, pId] = btn.dataset.inspectPart.split(':');
      activeSubTab = 'performance';
      selectedDeptId = dId;
      selectedPartByDept[dId] = pId;
      const p = partById(pId);
      if (p && p.subcategoryId) selectedSubcatByDept[dId] = p.subcategoryId;
      rdScreen = 'detail';
      msg = '';
      render(root);
    };
  });

  // Step A: Start Research with chosen approach card (Standard / Rush / Conservative) in Screen 3
  root.querySelectorAll('[data-research-mode]').forEach(b => {
    b.onclick = () => {
      const [partId, appId] = b.dataset.researchMode.split(':');
      const r = startResearch(s, partId, appId || 'standard');
      if (r.error) {
        msg = r.error;
        msgErr = true;
      } else {
        msg = `Research (${(APPROACHES[appId] || APPROACHES.standard).label}) started — completes ${prettyDate(r.due)}, target debut ${r.debut}.`;
        msgErr = false;
        save();
      }
      render(root);
    };
  });

  // Step B: Start Manufacturing handler
  root.querySelectorAll('[data-manuf]').forEach(b => {
    b.onclick = () => {
      const [partId, target] = b.dataset.manuf.split(':');
      const r = startManufacture(s, partId, target);
      if (r.error) {
        msg = r.error;
        msgErr = true;
      } else {
        msg = `Manufacturing (${target === 'both' ? 'Both Cars' : target.toUpperCase()}) started — ready ${prettyDate(r.due)}, debuts ${r.debut}.`;
        msgErr = false;
        save();
      }
      render(root);
    };
  });
}
