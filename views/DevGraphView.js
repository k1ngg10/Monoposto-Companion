// DEV GRAPH — Authentic F1 "VEHICLE PERFORMANCE COMPARISON" chart.
// Displays the vertical white baseline marker at Car Power 4.00 (or Season-2 Minimum Baseline),
// each team's Season-Start Baseline segment, and their In-Season R&D Gain segment.
import { TEAMS, driversOfTeam } from '../data/teamsAndDrivers.js?v=20261022m';
import { getState, truePower, teamTruePower, teamSeasonStartPower, driverLiveStats } from '../engine/store.js?v=20261022m';
import { topbarHTML } from './shared.js?v=20261022m';

export const BASELINE_PCT = 38;

export function powerToBarPct(powerVal, minBase = 4.0) {
  const clamped = Math.max(3.0, Math.min(10.0, +powerVal || minBase));
  if (clamped <= minBase) {
    return +((clamped / minBase) * BASELINE_PCT).toFixed(2);
  }
  return +(BASELINE_PCT + ((clamped - minBase) / (10.0 - minBase)) * (100 - BASELINE_PCT)).toFixed(2);
}

export function vehiclePerformanceComparisonHTML(s = getState(), projectedDpGain = 0) {
  const season = s?.season || 1;
  const minGridBase = Math.min(...TEAMS.map(t => teamSeasonStartPower(t.id, s)), 4.0);
  const speedSum = t => driversOfTeam(t.id, s).reduce((a, d) => a + driverLiveStats(d.id, s).speed, 0);

  const rows = TEAMS.map(t => {
    const startVal = teamSeasonStartPower(t.id, s);
    const liveVal = teamTruePower(t.id, s);
    return {
      team: t,
      startVal,
      value: liveVal,
      seasonGain: Math.max(0, +(liveVal - startVal).toFixed(2)),
      mine: t.id === s.teamId,
      tieSpeed: speedSum(t)
    };
  }).sort((a, b) => b.value - a.value || b.tieSpeed - a.tieSpeed);

  return `
    <div class="f1-perf-panel">
      <div class="f1-perf-head">
        <h2 class="f1-perf-title">VEHICLE PERFORMANCE COMPARISON — SEASON ${season} (${season === 1 ? '2026' : '2027'})</h2>
        <div class="f1-perf-legend">
          <span><i class="f1-leg-line"></i> Season Base Line (${minGridBase.toFixed(2)})</span>
          <span><i class="f1-leg-you"></i> Your Constructor (${truePower(s).toFixed(2)})</span>
        </div>
      </div>
      <div class="f1-perf-chart">
        ${rows.map(r => {
          const startPct = powerToBarPct(r.startVal, minGridBase);
          const totalPct = powerToBarPct(r.value, minGridBase);
          const inSeasonExtensionPct = Math.max(0, +(totalPct - startPct).toFixed(2));
          const gainPower = r.mine && projectedDpGain > 0 ? r.value + (projectedDpGain / 100) : r.value;
          const gainPct = r.mine && projectedDpGain > 0 ? Math.max(1.2, +(powerToBarPct(gainPower, minGridBase) - totalPct).toFixed(2)) : 0;
          return `
            <div class="f1-perf-row ${r.mine ? 'is-player' : ''}">
              <div class="f1-perf-track-wrap">
                <div class="f1-perf-track">
                  <div class="f1-perf-fill ${r.mine ? 'mine' : ''}" style="width:${startPct}%" title="Season ${season} Starting Baseline: ${r.startVal.toFixed(2)}"></div>
                  ${inSeasonExtensionPct > 0 ? `<div class="f1-perf-fill ${r.mine ? 'mine' : ''}" style="left:${startPct}%;width:${inSeasonExtensionPct}%;position:absolute;top:0;bottom:0;opacity:0.82;filter:brightness(1.25)" title="In-Season R&D Gain: +${r.seasonGain.toFixed(2)}"></div>` : ''}
                  ${gainPct > 0 ? `<div class="f1-perf-gain" style="left:${totalPct}%;width:${gainPct}%" title="+${projectedDpGain} DP Projected Upgrade Gain"></div>` : ''}
                </div>
                <div class="f1-perf-baseline" style="left:${BASELINE_PCT}%" title="Season Base Development (${minGridBase.toFixed(2)})"></div>
              </div>
              <div class="f1-perf-team">
                <span class="f1-perf-swatch" style="background:${r.team.color}"></span>
                <span class="f1-perf-name" title="${r.team.hq} HQ · Start ${r.startVal.toFixed(2)} + ${r.seasonGain.toFixed(2)} R&D">${r.mine ? r.team.name.toUpperCase() : r.team.name}</span>
                <span class="f1-perf-val">${r.value.toFixed(2)}</span>
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
  const season = s.season || 1;
  root.innerHTML = `
    ${topbarHTML(true)}
    <div class="f1rd-page-wrap">
      <h1 class="page">DEVELOPMENT GRAPH — SEASON ${season}</h1>
      <div class="sub">
        The vertical white line marks the season-start minimum baseline. Each constructor bar displays its <b>Season-${season} Starting Baseline</b> plus its <b>In-Season R&amp;D Development Gain</b> as upgrades are fitted across the calendar by both your team and the 11 AI teams.
      </div>
      ${vehiclePerformanceComparisonHTML(s)}
      <div class="foot">
        Season 1 Baseline: Mercedes 7.00 · Ferrari / Red Bull / McLaren 6.00 · Aston Martin / Williams / Audi / Porsche / BYD 5.00 · Haas / Cadillac / BMW 4.00. Season 2 Baselines incorporate R16–R22 Technical Directive Part-Ban Protection.
      </div>
    </div>
  `;
}
