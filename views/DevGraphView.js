// DEV GRAPH — Authentic F1 "VEHICLE PERFORMANCE COMPARISON" chart.
// Features the vertical white baseline marker at Car Power 4.00 (where the lowest
// starting speed cars just touch the baseline, and cars move ahead to the right
// of the baseline as their Car Power increases across the season).
import { TEAMS, driversOfTeam } from '../data/teamsAndDrivers.js?v=20261022b';
import { getState, truePower } from '../engine/store.js?v=20261022b';
import { topbarHTML } from './shared.js?v=20261022b';

// Baseline Car Power = 4.00 sits at 38% of the horizontal track width.
// Cars at 4.00 (Haas, Cadillac, BMW at season start) touch the vertical line at 38%;
// higher base power and R&D upgrades extend the bar to the right of the vertical line (up to 10.00 = 100%).
export const BASELINE_PCT = 38;

export function powerToBarPct(powerVal) {
  const clamped = Math.max(3.0, Math.min(10.0, +powerVal || 4.0));
  if (clamped <= 4.0) {
    return +((clamped / 4.0) * BASELINE_PCT).toFixed(2);
  }
  return +(BASELINE_PCT + ((clamped - 4.0) / 6.0) * (100 - BASELINE_PCT)).toFixed(2);
}

export function vehiclePerformanceComparisonHTML(s = getState()) {
  const speedSum = t => driversOfTeam(t.id).reduce((a, d) => a + d.speed, 0);
  const rows = TEAMS.map(t => {
    const extraDp = (s.teamDp && s.teamDp[t.id]) ? s.teamDp[t.id] / 100 : 0;
    const val = t.id === s.teamId ? truePower() : t.carPower + extraDp;
    return {
      team: t,
      value: val,
      mine: t.id === s.teamId,
      tieSpeed: speedSum(t)
    };
  }).sort((a, b) => b.value - a.value || b.tieSpeed - a.tieSpeed);

  return `
    <div class="f1-perf-panel">
      <div class="f1-perf-head">
        <h2 class="f1-perf-title">VEHICLE PERFORMANCE COMPARISON</h2>
        <div class="f1-perf-legend">
          <span><i class="f1-leg-line"></i> Base Development Line (4.00)</span>
          <span><i class="f1-leg-you"></i> Your Constructor (${truePower().toFixed(2)})</span>
        </div>
      </div>
      <div class="f1-perf-chart">
        ${rows.map(r => {
          const widthPct = powerToBarPct(r.value);
          return `
            <div class="f1-perf-row ${r.mine ? 'is-player' : ''}">
              <div class="f1-perf-track-wrap">
                <div class="f1-perf-track">
                  <div class="f1-perf-fill ${r.mine ? 'mine' : ''}" style="width:${widthPct}%"></div>
                </div>
                <div class="f1-perf-baseline" style="left:${BASELINE_PCT}%" title="Season Base Development (Car Power 4.00)"></div>
              </div>
              <div class="f1-perf-team">
                <span class="f1-perf-swatch" style="background:${r.team.color}"></span>
                <span class="f1-perf-name">${r.mine ? r.team.name.toUpperCase() : r.team.name}</span>
                <span class="f1-perf-val">${r.mine ? r.value.toFixed(2) : r.value.toFixed(1)}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export function render(root) {
  const s = getState();
  root.innerHTML = `
    ${topbarHTML(true)}
    <div class="f1rd-page-wrap">
      <h1 class="page">DEVELOPMENT GRAPH</h1>
      <div class="sub">
        The vertical white line marks the season-start base development level (Car Power <b>4.00</b>). Lowest-speed starting cars touch the baseline, and cars move ahead of the line as R&amp;D upgrades are fitted across the season.
      </div>
      ${vehiclePerformanceComparisonHTML(s)}
      <div class="foot">
        Baseline: Monoposto 2026 canon (Mercedes 7.0 · Ferrari / Red Bull / McLaren 6.0 · Aston Martin / Williams / Audi / Porsche / BYD 5.0 · Haas / Cadillac / BMW 4.0 touching the base line).
      </div>
    </div>
  `;
}
