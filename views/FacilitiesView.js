// FACILITIES — the 3-branch F1 My Team HQ tree (Engineering, Personnel, Corporate),
// each with Phase 1, Phase 2, and Phase 3 containing multiple individual sub-upgrades.
// Completing 100% of a Phase's sub-upgrades unlocks the next Phase for that branch.
import {
  FACILITY_BRANCHES,
  FACILITY_BACKDROPS,
  branchPhaseInfo,
  facilityEconomyStats,
  maxResearchSlots,
  maxManufactureSlots,
  hasDualBuild
} from '../data/facilitiesCatalog.js?v=20261022k';
import { getState } from '../engine/store.js?v=20261022k';
import { queueFacility, prettyDate } from '../engine/timeEngine.js?v=20261022k';
import { topbarHTML, fmt$ } from './shared.js?v=20261022k';

let activeBranch = 'all';
let msg = '', msgErr = false;

export function render(root) {
  const s = getState();
  const econ = facilityEconomyStats(s);
  const engInfo = branchPhaseInfo(s, 'Engineering');
  const perInfo = branchPhaseInfo(s, 'Personnel');
  const corInfo = branchPhaseInfo(s, 'Corporate');
  const activeFacTasks = s.tasks.filter(t => t.kind === 'facility');

  const dualDepts = ['aero', 'chassis', 'powertrain', 'durability'].filter(d => hasDualBuild(s, d));

  let html = `${topbarHTML(true)}
    <div class="fac-tophead">
      <div>
        <h1 class="page">WEISSACH HQ — FACILITIES</h1>
        <div class="sub">Complete 100% of every sub-upgrade inside a Phase to unlock the next Phase for that branch. Reaching Engineering Phase 2 &amp; Phase 3 unlocks Phase 2 &amp; Phase 3 car parts in R&amp;D.</div>
      </div>
      <div class="fac-filtertabs">
        <button class="fac-tab ${activeBranch === 'all' ? 'on' : ''}" data-branch="all">ALL BRANCHES</button>
        <button class="fac-tab ${activeBranch === 'Engineering' ? 'on' : ''}" data-branch="Engineering">ENGINEERING (P${engInfo.phase})</button>
        <button class="fac-tab ${activeBranch === 'Personnel' ? 'on' : ''}" data-branch="Personnel">PERSONNEL (P${perInfo.phase})</button>
        <button class="fac-tab ${activeBranch === 'Corporate' ? 'on' : ''}" data-branch="Corporate">CORPORATE (P${corInfo.phase})</button>
      </div>
    </div>

    <div class="fac-kpis">
      <div class="fac-kpi">
        <span>ENGINEERING PHASE</span>
        <b>PHASE ${engInfo.phase} <em>(${engInfo.totalDone}/${engInfo.totalNodes})</em></b>
      </div>
      <div class="fac-kpi">
        <span>PERSONNEL PHASE</span>
        <b>PHASE ${perInfo.phase} <em>(${perInfo.totalDone}/${perInfo.totalNodes})</em></b>
      </div>
      <div class="fac-kpi">
        <span>CORPORATE PHASE</span>
        <b>PHASE ${corInfo.phase} <em>(${corInfo.totalDone}/${corInfo.totalNodes})</em></b>
      </div>
      <div class="fac-kpi">
        <span>WEEKLY RP OUTPUT</span>
        <b class="pos">+${econ.weeklyRp} RP / WK</b>
      </div>
      <div class="fac-kpi">
        <span>WEEKLY RUNNING COST</span>
        <b class="neg">−$${Math.round(econ.weeklyCost * 1000)}k / WK</b>
      </div>
      <div class="fac-kpi">
        <span>QUEUE CAPACITY</span>
        <b>${maxResearchSlots(s)} R&amp;D · ${maxManufactureSlots(s)} BUILD${dualDepts.length ? ` · ${dualDepts.length}/4 DUAL` : ''}</b>
      </div>
    </div>

    ${msg ? `<div class="fac-alert ${msgErr ? 'err' : 'ok'}">${msg}</div>` : ''}
    ${activeFacTasks.length ? `<div class="fac-activebar">
      <span class="fac-active-lbl">ACTIVE CONSTRUCTION (${activeFacTasks.length}/2):</span>
      ${activeFacTasks.map(t => `<span class="fac-active-pill">🏗 <b>${t.title}</b> (${t.branch || 'HQ'} P${t.phase || 1}) · Due ${prettyDate(t.due)}</span>`).join('')}
    </div>` : ''}
  `;

  const branches = activeBranch === 'all'
    ? FACILITY_BRANCHES
    : FACILITY_BRANCHES.filter(b => b.id === activeBranch);

  for (const b of branches) {
    const info = branchPhaseInfo(s, b.id);
    const bgUrl = FACILITY_BACKDROPS[b.id] || FACILITY_BACKDROPS.hq;
    const pct = Math.round((info.totalDone / info.totalNodes) * 100);

    html += `<section class="fac-branch-card">
      <div class="fac-branch-hero" style="background-image:linear-gradient(90deg, rgba(10,10,14,.92) 0%, rgba(10,10,14,.74) 55%, rgba(10,10,14,.88) 100%), url('${bgUrl}')">
        <div class="fac-branch-meta">
          <div class="fac-branch-eyebrow">${b.subtitle.toUpperCase()}</div>
          <div class="fac-branch-title">${b.name.toUpperCase()} <span class="tag good">PHASE ${info.phase}</span></div>
          <div class="fac-branch-blurb">${b.blurb}</div>
        </div>
        <div class="fac-branch-progbox">
          <div class="fac-branch-progrow">
            <span>BRANCH COMPLETION</span>
            <b>${info.totalDone} / ${info.totalNodes} SUB-UPGRADES (${pct}%)</b>
          </div>
          <div class="fac-progtrack"><div class="fac-progfill" style="width:${pct}%"></div></div>
          <div class="fac-phase-pills">
            <span class="fac-ppill ${info.p1Done === info.p1Total ? 'done' : 'active'}">Phase 1: ${info.p1Done}/${info.p1Total}</span>
            <span class="fac-ppill ${info.p2Done === info.p2Total ? 'done' : info.p1Done === info.p1Total ? 'active' : 'locked'}">Phase 2: ${info.p2Done}/${info.p2Total}</span>
            <span class="fac-ppill ${info.p3Done === info.p3Total ? 'done' : (info.p1Done === info.p1Total && info.p2Done === info.p2Total) ? 'active' : 'locked'}">Phase 3: ${info.p3Done}/${info.p3Total}</span>
          </div>
        </div>
      </div>

      <div class="fac-phases-wrap">
        ${b.phases.map(p => {
          const phaseUnlocked = p.phase === 1
            || (p.phase === 2 && info.p1Done === info.p1Total)
            || (p.phase === 3 && info.p1Done === info.p1Total && info.p2Done === info.p2Total);
          const doneInPhase = p.nodes.filter(n => s.facilityNodes && s.facilityNodes[n.id]).length;
          const phaseComplete = doneInPhase === p.nodes.length;

          return `<div class="fac-phase-block ${phaseUnlocked ? '' : 'is-locked'}">
            <div class="fac-phase-head">
              <div>
                <span class="fac-phase-badge ${phaseComplete ? 'done' : phaseUnlocked ? 'open' : 'locked'}">PHASE ${p.phase}</span>
                <span class="fac-phase-title">${p.title}</span>
              </div>
              <div class="fac-phase-count">
                ${phaseComplete ? '<span class="tag good">✓ 100% COMPLETE</span>' : phaseUnlocked ? `<b>${doneInPhase} / ${p.nodes.length}</b> Built` : `<span class="tag warn">🔒 Complete 100% of Phase ${p.phase - 1} to Unlock</span>`}
              </div>
            </div>
            <div class="fac-node-grid">
              ${p.nodes.map(node => {
                const isBuilt = Boolean(s.facilityNodes && s.facilityNodes[node.id]);
                const task = s.tasks.find(t => t.kind === 'facility' && (t.nodeId === node.id || t.facilityId === node.id));
                return `<div class="fac-node-card ${isBuilt ? 'built' : task ? 'building' : phaseUnlocked ? '' : 'locked'}">
                  <div class="fac-node-top">
                    <div class="fac-node-name">${node.name}</div>
                    ${isBuilt
                      ? '<span class="tag good">✓ BUILT</span>'
                      : task
                        ? '<span class="tag warn">BUILDING</span>'
                        : phaseUnlocked
                          ? `<span class="fac-node-cost">${fmt$(node.cost)} · ${node.days}d</span>`
                          : `<span class="tag">PHASE ${p.phase} LOCKED</span>`}
                  </div>
                  <div class="tags fac-node-tags">
                    ${node.effects.map(e => `<span class="tag ${isBuilt ? 'good' : ''}">${e}</span>`).join('')}
                  </div>
                  <div class="fac-node-foot">
                    ${isBuilt
                      ? '<div class="fac-node-status ok">Operational at Weissach HQ</div>'
                      : task
                        ? `<div class="fac-node-status gold">Under construction — completes ${prettyDate(task.due)}</div>`
                        : phaseUnlocked
                          ? `<button class="btn small fac-buybtn" data-buy-node="${node.id}">BUILD UPGRADE · ${fmt$(node.cost)} · ${node.days}d</button>`
                          : `<div class="fac-node-status dim">Requires all ${b.name} Phase ${p.phase - 1} upgrades</div>`}
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
    </section>`;
  }

  root.innerHTML = html;

  root.querySelectorAll('[data-branch]').forEach(btn => {
    btn.onclick = () => {
      activeBranch = btn.dataset.branch;
      render(root);
    };
  });

  root.querySelectorAll('[data-buy-node]').forEach(btn => {
    btn.onclick = () => {
      const nodeId = btn.dataset.buyNode;
      const r = queueFacility(s, nodeId);
      if (r.error) {
        msg = r.error;
        msgErr = true;
      } else {
        msg = `Construction started — completes ${prettyDate(r.due)}.`;
        msgErr = false;
      }
      render(root);
    };
  });
}

