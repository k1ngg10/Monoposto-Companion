// R&D — Authentic F1 24/25/26 Research & Development Hub + Department Upgrade Inspector.
// - Top Sub-Tabs: Performance | R&D in Progress | Progress History (no controller icons, zero emojis).
// - Performance Hub: 2x2 Department Grid (Aerodynamics, Chassis, Powertrain, Durability) + Vehicle Performance Comparison.
// - Department Upgrade Inspector: Separate component cards per department + Left Chamfered Box + Right Translucent Detail Box
//   + Horizontal Completion Timeline Strip + Bottom Action Box.

import { DEPARTMENTS, APPROACHES, partById } from '../data/partsCatalog.js?v=20261022h';
import { CALENDAR, nextRace } from '../data/calendar2026.js?v=20261022h';
import { engineeringPhase, hasDualBuild, maxResearchSlots, maxManufactureSlots } from '../data/facilitiesCatalog.js?v=20261022h';
import {
  getState,
  save,
  truePower,
  monopostoPower,
  driverPriorityStatus,
  unmanufacturedBlueprints
} from '../engine/store.js?v=20261022h';
import {
  researchQuote,
  startResearch,
  manufactureQuote,
  startManufacture,
  debutRound
} from '../engine/rdEngine.js?v=20261022h';
import { prettyDate, addDays } from '../engine/timeEngine.js?v=20261022h';
import { vehiclePerformanceComparisonHTML } from './DevGraphView.js?v=20261022h';
import { topbarHTML, fmt$ } from './shared.js?v=20261022h';

let approach = 'standard';
let activeSubTab = 'performance'; // 'performance' | 'inprogress' | 'history'
let selectedDeptId = null;        // null (2x2 hub) | 'aero' | 'chassis' | 'powertrain' | 'durability'
let hoveredDeptId = 'aero';
let selectedPartByDept = {
  aero: 'frontwing',
  chassis: 'engine_cover',
  powertrain: 'pu',
  durability: 'wear_parts'
};
let msg = '', msgErr = false;

const DEPT_META = {
  aero: {
    id: 'aero',
    title: 'AERODYNAMICS',
    themeClass: 'aero',
    accent: '#2aa8ff',
    desc: 'The Aerodynamics department is responsible for downforce generation, drag reduction, and vortex airflow conditioning across the front wing, sidepods, underfloor, and rear wing assembly.'
  },
  chassis: {
    id: 'chassis',
    title: 'CHASSIS',
    themeClass: 'chassis',
    accent: '#8bc34a',
    desc: 'The Chassis department governs unsprung mass, weight reduction, center-of-gravity ballast distribution, braking bite, and suspension compliance across kerbs.'
  },
  powertrain: {
    id: 'powertrain',
    title: 'POWERTRAIN',
    themeClass: 'powertrain',
    accent: '#ff2a9d',
    desc: 'The Powertrain department develops internal combustion efficiency, 350 kW MGU-K electrical deployment, turbocharger boost response, and 100% sustainable e-fuel injection.'
  },
  durability: {
    id: 'durability',
    title: 'DURABILITY',
    themeClass: 'durability',
    accent: '#f5c518',
    desc: 'The Durability department reinforces gearbox dog rings, dielectric energy store cooling, control electronics, and high-RPM turbocharger bearings against race attrition.'
  }
};

// Clean geometric SVG icons (no emojis, no copied controller prompts)
const SVG_CLOCK = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 3h6"/><path d="M12 3v2"/></svg>`;
const SVG_CALENDAR = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const SVG_COMPLETE = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 12 10.5 15 16.5 9"/></svg>`;
const SVG_FLAG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`;
const SVG_HEX = `<svg viewBox="0 0 36 36" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><polygon points="18,2 32,10 32,26 18,34 4,26 4,10"/><circle cx="18" cy="18" r="5"/></svg>`;

export function setRdStage(stage) {
  if (stage === 'manufacture') {
    activeSubTab = 'inprogress';
    selectedDeptId = null;
  } else if (stage === 'research' || stage === 'all') {
    activeSubTab = 'performance';
  }
}

// Compute department upgrade progress: total upgrade steps vs researched/fitted steps
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
          <div class="f1rd-dept-blurb-hint">Click any department card above to open its component upgrade inspector.</div>
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

function renderDepartmentInspector(s, deptId) {
  const dept = DEPARTMENTS.find(d => d.id === deptId) || DEPARTMENTS[0];
  const meta = DEPT_META[dept.id] || DEPT_META.aero;
  const engPhase = engineeringPhase(s);
  const dualOk = hasDualBuild(s, dept.id);
  const prio = driverPriorityStatus(s);
  const d1No = prio.d1 ? prio.d1.no : '1';
  const d2No = prio.d2 ? prio.d2.no : '2';

  const curPartId = selectedPartByDept[dept.id] || dept.parts[0].id;
  const partIdx = Math.max(0, dept.parts.findIndex(p => p.id === curPartId));
  const part = dept.parts[partIdx] || dept.parts[0];
  selectedPartByDept[dept.id] = part.id;

  const ps = s.parts[part.id] || { researched: 0, copies: 0, car1: 0, car2: 0 };
  const c1 = typeof ps.car1 === 'number' ? ps.car1 : 0;
  const c2 = typeof ps.car2 === 'number' ? ps.car2 : 0;
  const maxSpec = part.steps.length;
  const task = s.tasks.find(t => t.partId === part.id);
  const qRes = researchQuote(s, part.id, approach);
  const qCar1 = manufactureQuote(s, part.id, 'car1');
  const qCar2 = manufactureQuote(s, part.id, 'car2');
  const qBoth = manufactureQuote(s, part.id, 'both');
  const prereqPart = part.prereq ? partById(part.prereq) : null;

  // Determine the active/preview step to show in the Right Translucent Detail Box
  const activeStep = qRes ? qRes.step : part.steps[Math.min(maxSpec - 1, Math.max(0, (ps.researched || 1) - 1))];
  const displayRp = qRes ? qRes.rp : activeStep.rp;
  const displayDays = qRes ? qRes.days : (qBoth ? qBoth.days : activeStep.researchDays);
  const projectedDue = task ? task.due : addDays(s.date, displayDays);
  const nextGp = nextRace(projectedDue) || nextRace(s.date) || CALENDAR[CALENDAR.length - 1];

  const categorySubtitle = part.core
    ? `Core 3-Spec Upgrade — Spec ${qRes ? qRes.step.spec : ps.researched}/${maxSpec} · +${activeStep.dp} DP (+${activeStep.dp / 2} DP/car)`
    : `Minor — Phase ${part.phase || 1} ${dept.name} · +${activeStep.dp} DP (+${activeStep.dp / 2} DP/car)`;

  // Separate parts grouped cleanly by Phase 1, Phase 2, Phase 3 so distinct components are never mixed
  const phases = [1, 2, 3];

  return `
    <div class="f1rd-inspector" style="--dept-accent:${meta.accent}">
      <div class="f1rd-insp-topbar">
        <div class="f1rd-insp-titlewrap">
          <button type="button" class="btn small f1rd-back-btn" id="f1rd-back-hub">← BACK TO 2×2 HUB</button>
          <div>
            <div class="f1rd-insp-eyebrow">${meta.title} DEPARTMENT · ENGINEERING PHASE ${engPhase} ${dualOk ? '· DUAL CAR BUILD ACTIVE' : ''}</div>
            <h1 class="f1rd-insp-heading">RESEARCH UPGRADE</h1>
          </div>
        </div>
        <div class="f1rd-insp-controls">
          <div class="f1rd-dept-pills">
            ${DEPARTMENTS.map(d => `<button type="button" class="f1rd-dpill ${d.id === dept.id ? 'on' : ''}" data-switch-dept="${d.id}">${d.name.toUpperCase()} (${d.parts.length})</button>`).join('')}
          </div>
          <div class="f1rd-approach-inline">
            <label for="f1rd-approach">APPROACH</label>
            <select id="f1rd-approach">
              ${Object.entries(APPROACHES).map(([id, a]) => `<option value="${id}" ${id === approach ? 'selected' : ''}>${a.label}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- Separate Component Nodes Rail (Never mixing distinct parts) -->
      <div class="f1rd-component-selector">
        ${phases.map(ph => {
          const phParts = dept.parts.filter(p => (p.phase || 1) === ph);
          if (!phParts.length) return '';
          return `
            <div class="f1rd-phase-col">
              <div class="f1rd-phase-colhead">
                <span>PHASE ${ph} COMPONENTS (${phParts.length})</span>
                <span>${engPhase >= ph ? 'UNLOCKED' : `REQUIRES ENG. PHASE ${ph}`}</span>
              </div>
              <div class="f1rd-part-chips">
                ${phParts.map(p => {
                  const pState = s.parts[p.id] || { researched: 0, car1: 0, car2: 0 };
                  const pc1 = pState.car1 || 0;
                  const pc2 = pState.car2 || 0;
                  const pTask = s.tasks.find(t => t.partId === p.id);
                  const pMax = p.steps.length;
                  let stateLabel = 'UNRESEARCHED';
                  let stateCls = '';
                  if (pTask) {
                    stateLabel = pTask.kind === 'research' ? 'IN RESEARCH' : 'MANUFACTURING';
                    stateCls = 'inprog';
                  } else if (pc1 >= pMax && pc2 >= pMax) {
                    stateLabel = 'MAXED BOTH CARS';
                    stateCls = 'maxed';
                  } else if (pState.researched > pc1 || pState.researched > pc2) {
                    stateLabel = `SPEC ${pState.researched} READY TO BUILD`;
                    stateCls = 'ready';
                  } else if (pState.researched > 0) {
                    stateLabel = `SPEC ${pState.researched}/${pMax} FITTED`;
                    stateCls = 'fitted';
                  }
                  return `
                    <button type="button" class="f1rd-part-node ${p.id === part.id ? 'active' : ''} ${stateCls}" data-select-part="${p.id}">
                      <span class="f1rd-pnode-name">${p.name}</span>
                      <span class="f1rd-pnode-meta">${p.core ? `Core 3-Spec` : `Phase ${p.phase || 1}`} · ${stateLabel}</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Screenshot 3 Two-Box Upgrade Showcase -->
      <div class="f1rd-showcase-stage ${meta.themeClass}">
        <div class="f1rd-two-box-row">
          <!-- Box 1: Left Chamfered Upgrade Box -->
          <div class="f1rd-chamfer-box">
            <div class="f1rd-chamfer-inner">
              <div class="f1rd-chamfer-topmeta">
                <span>COMPONENT ${partIdx + 1} OF ${dept.parts.length}</span>
                <span>${part.core ? `SPEC ${ps.researched}/${maxSpec}` : `PHASE ${part.phase || 1}`}</span>
              </div>
              <div class="f1rd-chamfer-blueprint" aria-hidden="true">
                <div class="f1rd-bp-line"></div>
                <div class="f1rd-bp-spec">${qRes ? `TARGET SPEC ${qRes.step.spec}` : `SPEC ${ps.researched || 1}`}</div>
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

          <!-- Box 2: Right Translucent Detail Box -->
          <div class="f1rd-detail-box">
            <div class="f1rd-detail-title">${part.name.toUpperCase()}</div>
            <div class="f1rd-detail-sub">${categorySubtitle}</div>
            <div class="f1rd-detail-divider"></div>
            <p class="f1rd-detail-desc">${part.blurb}</p>
            <div class="f1rd-detail-extra">
              <span>Step B Manufacturing: <b>${activeStep.costPerCopy ? fmt$(activeStep.costPerCopy) + ' / car' : 'In-House ($0.00M)'}</b> (${activeStep.manufDays} days)</span>
              ${prereqPart ? `<span>Prerequisite: <b style="color:${((s.parts[prereqPart.id]?.researched || 0) >= 1) ? 'var(--green)' : 'var(--gold)'}">${prereqPart.name}</b></span>` : ''}
            </div>
            <div class="f1rd-detail-divider"></div>
            <div class="f1rd-detail-metrics">
              <div class="f1rd-metric-rp">
                <span class="f1rd-metric-val">${displayRp}</span>
                <span class="f1rd-metric-unit">RP</span>
              </div>
              <div class="f1rd-metric-days">
                <span class="f1rd-clock-icon">${SVG_CLOCK}</span>
                <span class="f1rd-metric-val">${displayDays} DAYS</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Horizontal Completion Timeline Strip (Screenshot 3) -->
        <div class="f1rd-timeline">
          <div class="f1rd-tl-node start">
            <div class="f1rd-tl-circle">${SVG_CALENDAR}</div>
            <div class="f1rd-tl-label">
              <b>START</b>
              <span>${prettyDate(s.date)}</span>
            </div>
          </div>
          <div class="f1rd-tl-solid"></div>
          <div class="f1rd-tl-node complete">
            <div class="f1rd-tl-circle">${SVG_COMPLETE}</div>
            <div class="f1rd-tl-label">
              <b>COMPLETE</b>
              <span>${prettyDate(projectedDue)}</span>
            </div>
          </div>
          <div class="f1rd-tl-dashed"></div>
          <div class="f1rd-tl-node gp">
            <div class="f1rd-tl-circle gp-circle">${SVG_FLAG}</div>
            <div class="f1rd-tl-label">
              <b>GRAND PRIX™ · R${nextGp.round}</b>
              <span>${ prettyDate(nextGp.sun)} (${nextGp.country})</span>
            </div>
          </div>
        </div>

        <!-- Bottom Action Box (Screenshot 3) -->
        <div class="f1rd-bottom-bar">
          <div class="f1rd-action-area">
            ${task ? `
              <div class="f1rd-action-box locked">
                <div>
                  <div class="f1rd-act-title">${task.kind === 'research' ? 'Research in Progress' : `Manufacturing (${task.target === 'both' ? 'Both Cars' : task.target.toUpperCase()})`}</div>
                  <div class="f1rd-act-cost">Completes ${prettyDate(task.due)} · Debuts ${debutRound(task.due)}</div>
                </div>
                <div class="f1rd-act-crest">${SVG_HEX}</div>
              </div>
            ` : ''}

            ${!task && qRes ? (
              qRes.gateBlocked ? `
                <div class="f1rd-action-box locked">
                  <div>
                    <div class="f1rd-act-title">Research Locked</div>
                    <div class="f1rd-act-cost">${qRes.prereqBlocked ? `Requires Prerequisite: ${qRes.prereqName}` : `Requires Engineering Facility Phase ${qRes.step.needsFacility}`}</div>
                  </div>
                  <div class="f1rd-act-crest">${SVG_HEX}</div>
                </div>
              ` : `
                <button type="button" class="f1rd-action-box clickable" data-research="${part.id}">
                  <div>
                    <div class="f1rd-act-title">Start Research ${maxSpec > 1 ? `(Spec ${qRes.step.spec})` : ''}</div>
                    <div class="f1rd-act-cost">${qRes.rp} RP · ${qRes.days} Days</div>
                  </div>
                  <div class="f1rd-act-crest" style="color:${meta.accent}">${SVG_HEX}</div>
                </button>
              `
            ) : ''}

            ${!task && (qCar1 || qCar2 || qBoth) ? `
              <div class="f1rd-manuf-actions">
                <div class="f1rd-manuf-lbl">STEP B · BLUEPRINT READY FOR MANUFACTURING (BANK: ${fmt$(s.cash)})</div>
                <div class="f1rd-manuf-btns">
                  ${qCar1 ? `
                    <button type="button" class="f1rd-action-box clickable compact" data-manuf="${part.id}:car1">
                      <div>
                        <div class="f1rd-act-title">Build for Car #${d1No}</div>
                        <div class="f1rd-act-cost">${qCar1.cost ? fmt$(qCar1.cost) : '$0.00M'} · ${qCar1.days}d (+${qCar1.dpGain} DP)</div>
                      </div>
                    </button>
                  ` : ''}
                  ${qCar2 ? `
                    <button type="button" class="f1rd-action-box clickable compact" data-manuf="${part.id}:car2">
                      <div>
                        <div class="f1rd-act-title">Build for Car #${d2No}</div>
                        <div class="f1rd-act-cost">${qCar2.cost ? fmt$(qCar2.cost) : '$0.00M'} · ${qCar2.days}d (+${qCar2.dpGain} DP)</div>
                      </div>
                    </button>
                  ` : ''}
                  ${qBoth ? (
                    qBoth.dualUnlocked ? `
                      <button type="button" class="f1rd-action-box clickable compact primary-act" data-manuf="${part.id}:both">
                        <div>
                          <div class="f1rd-act-title">Build Both Cars</div>
                          <div class="f1rd-act-cost">${qBoth.cost ? fmt$(qBoth.cost) : '$0.00M'} · ${qBoth.days}d (+${qBoth.dpGain} DP)</div>
                        </div>
                      </button>
                    ` : `
                      <div class="f1rd-action-box locked compact">
                        <div>
                          <div class="f1rd-act-title">Dual Car Build Locked</div>
                          <div class="f1rd-act-cost">Unlock ${dept.name} Dual Bay in Eng. Phase 2</div>
                        </div>
                      </div>
                    `
                  ) : ''}
                </div>
              </div>
            ` : ''}

            ${!task && !qRes && !qCar1 && !qCar2 ? `
              <div class="f1rd-action-box maxed">
                <div>
                  <div class="f1rd-act-title">Max Spec Fitted on Both Cars</div>
                  <div class="f1rd-act-cost">All ${maxSpec} specification(s) researched and manufactured</div>
                </div>
                <div class="f1rd-act-crest" style="color:var(--green)">${SVG_HEX}</div>
              </div>
            ` : ''}
          </div>

          <div class="f1rd-part-stepper">
            <button type="button" class="btn small" id="f1rd-prev-part">‹ PREVIOUS PART</button>
            <span class="f1rd-step-indicator">${partIdx + 1} / ${dept.parts.length} IN ${meta.title}</span>
            <button type="button" class="btn small" id="f1rd-next-part">NEXT PART ›</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

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
              <div class="tt">${part.name} (Spec ${spec}) <span class="tag">${part.deptName}</span></div>
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

  for (const dept of DEPARTMENTS) {
    for (const part of dept.parts) {
      const ps = s.parts[part.id];
      if (ps && (ps.researched > 0 || ps.car1 > 0 || ps.car2 > 0)) {
        unlockedRows.push({ dept, part, ps });
      }
    }
  }

  return `
    <div class="f1rd-subpage">
      <div class="dept">COMPLETED BLUEPRINTS &amp; FITTED UPGRADE HISTORY (${unlockedRows.length} OF 40 PARTS)</div>
      ${unlockedRows.length ? unlockedRows.map(({ dept, part, ps }) => `
        <div class="trow">
          <div>
            <div class="tt">${part.name} <span class="tag">${dept.name}</span> ${ps.breakthrough ? `<span class="tag good">BREAKTHROUGH (+50% DP)</span>` : ''}</div>
            <div class="ts">
              Blueprint: <b>Spec ${ps.researched}/${part.steps.length}</b> ·
              Car #${d1No}: <b style="color:${ps.car1 >= ps.researched ? 'var(--green)' : '#fff'}">${ps.car1 ? `Spec ${ps.car1}` : 'Stock'}</b> ·
              Car #${d2No}: <b style="color:${ps.car2 >= ps.researched ? 'var(--green)' : '#fff'}">${ps.car2 ? `Spec ${ps.car2}` : 'Stock'}</b> ·
              Credited Team DP: <b>+${ps.dpCredited || 0} DP</b>
            </div>
          </div>
          <button type="button" class="btn small" data-inspect-part="${dept.id}:${part.id}">INSPECT PART →</button>
        </div>
      `).join('') : `<div class="rd-empty"><div class="rd-empty-title">No Upgrades Completed Yet</div><div class="rd-empty-sub">As your engineering team completes Step A research and Step B manufacturing across the season, every upgrade will be logged here.</div></div>`}
    </div>
  `;
}

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
  } else if (selectedDeptId) {
    bodyHTML = renderDepartmentInspector(s, selectedDeptId);
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
      if (activeSubTab !== 'performance') selectedDeptId = null;
      msg = '';
      render(root);
    };
  });

  // 2x2 Department tile hover & click
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
      msg = '';
      render(root);
    };
  });

  // Back to 2x2 Hub button
  const backBtn = root.querySelector('#f1rd-back-hub');
  if (backBtn) {
    backBtn.onclick = () => {
      selectedDeptId = null;
      msg = '';
      render(root);
    };
  }

  // Department switcher inside Inspector
  root.querySelectorAll('[data-switch-dept]').forEach(btn => {
    btn.onclick = () => {
      selectedDeptId = btn.dataset.switchDept;
      hoveredDeptId = selectedDeptId;
      msg = '';
      render(root);
    };
  });

  // Research approach selector
  const appSel = root.querySelector('#f1rd-approach');
  if (appSel) {
    appSel.onchange = e => {
      approach = e.target.value;
      msg = '';
      render(root);
    };
  }

  // Select separate component inside Inspector
  root.querySelectorAll('[data-select-part]').forEach(btn => {
    btn.onclick = () => {
      if (selectedDeptId) {
        selectedPartByDept[selectedDeptId] = btn.dataset.selectPart;
        msg = '';
        render(root);
      }
    };
  });

  // Previous / Next part stepper inside Inspector
  const prevPartBtn = root.querySelector('#f1rd-prev-part');
  const nextPartBtn = root.querySelector('#f1rd-next-part');
  if ((prevPartBtn || nextPartBtn) && selectedDeptId) {
    const dept = DEPARTMENTS.find(d => d.id === selectedDeptId) || DEPARTMENTS[0];
    const curId = selectedPartByDept[dept.id] || dept.parts[0].id;
    const idx = Math.max(0, dept.parts.findIndex(p => p.id === curId));
    if (prevPartBtn) {
      prevPartBtn.onclick = () => {
        const nextIdx = (idx - 1 + dept.parts.length) % dept.parts.length;
        selectedPartByDept[dept.id] = dept.parts[nextIdx].id;
        msg = '';
        render(root);
      };
    }
    if (nextPartBtn) {
      nextPartBtn.onclick = () => {
        const nextIdx = (idx + 1) % dept.parts.length;
        selectedPartByDept[dept.id] = dept.parts[nextIdx].id;
        msg = '';
        render(root);
      };
    }
  }

  // Inspect part from History tab
  root.querySelectorAll('[data-inspect-part]').forEach(btn => {
    btn.onclick = () => {
      const [dId, pId] = btn.dataset.inspectPart.split(':');
      activeSubTab = 'performance';
      selectedDeptId = dId;
      selectedPartByDept[dId] = pId;
      msg = '';
      render(root);
    };
  });

  // Step A: Start Research handler
  root.querySelectorAll('[data-research]').forEach(b => {
    b.onclick = () => {
      const r = startResearch(s, b.dataset.research, approach);
      if (r.error) {
        msg = r.error;
        msgErr = true;
      } else {
        msg = `Research started — completes ${prettyDate(r.due)}, target debut ${r.debut}.`;
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
