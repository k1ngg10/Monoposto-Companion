// FACILITIES — the HQ tree, rendered from data/facilitiesCatalog.js.
// Each level holds nodes[]; buying a node queues a calendar task that
// completes on its date (the HQ agenda surfaces it when it's ≤7 days out).
import { FACILITIES } from '../data/facilitiesCatalog.js';
import { getState } from '../engine/store.js';
import { queueFacility, prettyDate } from '../engine/timeEngine.js';
import { topbarHTML, fmt$ } from './shared.js';

let msg = '', msgErr = false;

export function render(root) {
  const s = getState();
  let html = `${topbarHTML(true)}
    <h1 class="page">FACILITIES</h1>
    <div class="sub">Weissach HQ — every upgrade costs cash and calendar time. Porsche is a big corporate: nothing here is instant.</div>
    ${msg ? `<div class="${msgErr ? 'err' : 'sub'}" style="${msgErr ? '' : 'color:var(--green)'}">${msg}</div>` : ''}`;

  for (const branch of ['Engineering', 'Personnel', 'Corporate']) {
    html += `<div class="dept">${branch}</div>`;
    for (const f of FACILITIES.filter(x => x.branch === branch)) {
      const lvl = s.facilities[f.id] || 1;
      const task = s.tasks.find(t => t.kind === 'facility' && t.facilityId === f.id);
      const next = f.levels[lvl]; // levels[] index = current level → next level entry
      const node = next?.nodes[0];
      html += `<div class="trow"><div style="min-width:230px;flex:1">
          <div class="tt">${f.name} <span class="tag ${lvl >= 3 ? 'good' : ''}">LEVEL ${lvl}</span></div>
          <div class="ts">${f.blurb}${task ? ` · <span style="color:var(--gold)">Upgrade in progress — completes ${prettyDate(task.due)}</span>` : ''}</div>
          ${node ? `<div class="tags">${node.effects.map(e => `<span class="tag">${e}</span>`).join('')}</div>` : ''}
        </div>
        ${node && !task ? `<button class="btn small" data-buy="${f.id}">UPGRADE TO L${next.level} · ${fmt$(node.cost)} · ${node.days}d</button>` : ''}
        ${!node ? '<span class="tag good">MAX LEVEL</span>' : ''}
      </div>`;
    }
  }
  root.innerHTML = html;
  root.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
    const f = FACILITIES.find(x => x.id === b.dataset.buy);
    const next = f.levels[s.facilities[f.id] || 1];
    const r = queueFacility(s, f.id, next.nodes[0], next.level);
    if (r.error) { msg = r.error; msgErr = true; } else { msg = `${next.nodes[0].name} started — completes ${prettyDate(r.due)}.`; msgErr = false; }
    render(root);
  });
}
