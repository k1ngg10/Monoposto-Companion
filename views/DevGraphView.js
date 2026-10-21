// DEV GRAPH — every team in its own color, always (SPEC design rule).
// The player team shows its fractional true power; rivals show base power
// until the AI development simulation joins in a later build step.
import { TEAMS } from '../data/teamsAndDrivers.js';
import { getState, truePower } from '../engine/store.js';
import { topbarHTML } from './shared.js';

export function render(root) {
  const s = getState();
  const rows = TEAMS.map(t => ({
    team: t,
    value: t.id === s.teamId ? truePower() : t.carPower,
    mine: t.id === s.teamId
  })).sort((a, b) => b.value - a.value);
  root.innerHTML = `${topbarHTML(true)}
    <h1 class="page">DEVELOPMENT GRAPH</h1>
    <div class="sub">Car power across the grid. Yours is the true fractional value — Monoposto only ever takes the integer.</div>
    ${rows.map(r => `<div class="devbar">
      <div class="dn">${r.team.name}${r.mine ? ' <span class="tag good">YOU</span>' : ''}</div>
      <div class="track"><div class="fill" style="width:${(r.value / 10 * 100).toFixed(1)}%;background:${r.team.color}"></div></div>
      <div class="dv">${r.mine ? r.value.toFixed(2) : r.value.toFixed(0)}</div>
    </div>`).join('')}
    <div class="foot">Baseline: SPEC §5 canon (Mercedes 7 · Ferrari/Red Bull/McLaren 6 · five teams at 5 · Haas/Cadillac/BMW 4).</div>`;
}
