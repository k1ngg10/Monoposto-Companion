// R&D — the parts tree, rendered from data/partsCatalog.js.
// Research (RP + days + D20) → Manufacture ($ + days) → DP → car power.
// In-progress work shows here in full; the HQ agenda only surfaces it ≤7 days out.
import { DEPARTMENTS, APPROACHES } from '../data/partsCatalog.js?v=20261022b';
import { getState, save, truePower, monopostoPower } from '../engine/store.js?v=20261022b';
import { researchQuote, startResearch, manufactureQuote, startManufacture, debutRound } from '../engine/rdEngine.js?v=20261022b';
import { prettyDate } from '../engine/timeEngine.js?v=20261022b';
import { topbarHTML, fmt$ } from './shared.js?v=20261022b';

let approach = 'standard';
let msg = '', msgErr = false;

export function render(root) {
  const s = getState();
  const tp = truePower();
  const nextInt = Math.floor(tp) + 1;

  let html = `${topbarHTML(true)}
    <h1 class="page">RESEARCH & DEVELOPMENT</h1>
    <div class="sub">True car power <b style="color:#fff">${tp.toFixed(2)}</b> — Monoposto takes <b style="color:#fff">${monopostoPower()}</b>; the next integer lands at ${nextInt}.00 (${Math.max(0, Math.round((nextInt - tp) * 100))} DP away).</div>
    <div class="fld" style="max-width:260px"><label>Design approach</label>
      <select id="approach">${Object.entries(APPROACHES).map(([id, a]) => `<option value="${id}" ${id === approach ? 'selected' : ''}>${a.label}</option>`).join('')}</select></div>
    ${msg ? `<div class="${msgErr ? 'err' : 'sub'}" style="margin-top:12px;${msgErr ? '' : 'color:var(--green)'}">${msg}</div>` : ''}`;

  for (const dept of DEPARTMENTS) {
    html += `<div class="dept">${dept.name}</div>`;
    for (const part of dept.parts) {
      const p = s.parts[part.id] || { researched: 0, copies: 0 };
      const task = s.tasks.find(t => t.partId === part.id);
      const q = researchQuote(s, part.id, approach);
      const mq = manufactureQuote(s, part.id, 2);
      html += `<div class="trow"><div style="min-width:230px;flex:1">
          <div class="tt">${part.name}</div>
          <div class="ts">${p.researched ? `Spec ${p.researched} researched · ${p.copies} ${p.copies === 1 ? 'copy' : 'copies'} in warehouse` : 'Not researched yet'}
          ${task ? ` · <span style="color:var(--gold)">${task.kind === 'research' ? 'Researching' : 'Manufacturing'} — due ${prettyDate(task.due)} (debuts ${debutRound(task.due)})</span>` : ''}</div>
          <div class="tags">
            ${part.steps.map(st => `<span class="tag ${p.researched >= st.spec ? 'good' : ''}">Spec ${st.spec} · ${st.rp} RP · ${st.researchDays}d · +${st.dp} DP</span>`).join('')}
          </div></div>
        <div style="display:flex;gap:9px;flex-wrap:wrap">
          ${q && !task ? `<button class="btn small" data-research="${part.id}">RESEARCH SPEC ${q.step.spec} · ${q.rp} RP · ${q.days}d</button>` : ''}
          ${q && q.gateBlocked ? `<span class="tag warn">Needs facility Level ${q.step.needsFacility}</span>` : ''}
          ${mq && !task ? `<button class="btn small" data-manuf="${part.id}">MANUFACTURE ×2 · ${mq.cost ? fmt$(mq.cost) : 'factory'} · ${mq.days}d</button>` : ''}
        </div></div>`;
    }
    for (const name of dept.planned || []) {
      html += `<div class="trow" style="opacity:.45"><div><div class="tt">${name}</div><div class="ts">Real F1 25 upgrade — numbers not yet mapped onto our economy</div></div><span class="tag">DATA PENDING</span></div>`;
    }
  }
  html += `<div class="foot">D20 correlation rolls happen in the engine when research completes — never in a race. Failures cost 20% of the step's RP to fix and slip the part; breakthroughs pay +50% DP.</div>`;
  root.innerHTML = html;

  root.querySelector('#approach').onchange = e => { approach = e.target.value; msg = ''; render(root); };
  root.querySelectorAll('[data-research]').forEach(b => b.onclick = () => {
    const r = startResearch(s, b.dataset.research, approach);
    if (r.error) { msg = r.error; msgErr = true; } else { msg = `Research started — completes ${prettyDate(r.due)}, target debut ${r.debut}.`; msgErr = false; save(); }
    render(root);
  });
  root.querySelectorAll('[data-manuf]').forEach(b => b.onclick = () => {
    const r = startManufacture(s, b.dataset.manuf, 2);
    if (r.error) { msg = r.error; msgErr = true; } else { msg = `Manufacturing started — ready ${prettyDate(r.due)}, debuts ${r.debut}.`; msgErr = false; save(); }
    render(root);
  });
}
