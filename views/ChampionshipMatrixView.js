// CHAMPIONSHIP MATRIX — 12 Teams & 24 Drivers Performance Matrix.
// Includes:
// 1. Two-State Monoposto Slider Diff & Sync Tracker (state.monopostoSynced vs Live Target)
// 2. 4 Functional View Modes: ALL 12 TEAMS, MONOPOSTO 1-10 SLIDERS, R&D DEVELOPMENT PROGRESS, BASELINE DEV GRAPH
// 3. Interactive FIA ATR Wind Tunnel Reset & Round 16–22 Next-Season Regulation Focus Selector
// 4. Interactive Contract Radar (click any driver or Reserve Pool member to open their Dossier & Contract Modal)
import { TEAMS, RESERVE_DRIVERS, driversOfTeam, teamById, logoOf } from '../data/teamsAndDrivers.js?v=20261022m';
import { CALENDAR } from '../data/calendar2026.js?v=20261022m';
import {
  getState,
  save,
  playerTeam,
  teamTruePower,
  teamMonopostoPower,
  driverLiveStats,
  getMonopostoDiffs,
  confirmMonopostoSync
} from '../engine/store.js?v=20261022m';
import {
  ensureAiState,
  isRegAdaptationUnlocked,
  regulationProtectionPct,
  REG_FOCUS_MODES
} from '../engine/aiRdEngine.js?v=20261022m';
import { constructorStandings } from '../engine/raceSimulator.js?v=20261022m';
import { contractWindowReport } from '../engine/driverMarketEngine.js?v=20261022m';
import { prettyDate } from '../engine/timeEngine.js?v=20261022m';
import { openDriverDossierModal } from './shared.js?v=20261022m';

let matrixViewMode = 'all'; // 'all' | 'sliders' | 'rdspy'

const ATR_MILESTONES = [
  { round: 7,  label: 'First ATR Wind Tunnel Reset' },
  { round: 14, label: 'Second ATR Wind Tunnel Reset' },
  { round: 16, label: '2027 Technical Directive & Spec Split' }
];

function logoHTML(team) {
  const src = logoOf(team);
  if (!src) return `<span class="mx-wordmark" style="color:${team.color}">${team.short}</span>`;
  const hasBg = Boolean(team.logoBg && !team.logoBlend);
  const bgStyle = hasBg ? ` style="background:${team.logoBg}"` : '';
  const wrapCls = `mx-logos${hasBg ? ' has-bg' : ''}${team.logoBlend ? ' is-blend' : ''}`;
  const imgCls = `mx-logo${team.logoBlend ? ' blend' : ''}`;
  return `<span class="${wrapCls}"${bgStyle}><img class="${imgCls}" src="${src}" alt="${team.name} logo"></span>`;
}

function lastFinish(state, driverId) {
  const rounds = Object.keys(state.results || {}).map(Number).sort((a, b) => b - a);
  for (const r of rounds) {
    const entries = state.results[r].entries || {};
    if (driverId in entries) return { round: r, pos: entries[driverId] };
  }
  return null;
}

function statusFor(driver, report, state, live) {
  const hit = report.find(r => r.driver.id === driver.id);
  if (hit && hit.rule === 1) return { label: 'Retirement Watch', cls: 'bad' };
  if (hit && hit.rule === 2) return { label: 'Hot Seat', cls: 'bad' };
  if (live.speedDelta > 0) return { label: 'Hot Streak (+1 SPD)', cls: 'good' };
  if (live.speedDelta < 0) return { label: 'Cold Slump (−1 SPD)', cls: 'bad' };
  if (live.riskDelta > 0) return { label: 'Attack Mode (+1 RSK)', cls: 'warn' };
  if (live.riskDelta < 0) return { label: 'Discipline (−1 RSK)', cls: 'good' };
  const lf = lastFinish(state, driver.id);
  if (!lf) return { label: 'Season Start', cls: '' };
  if (!lf.pos) return { label: 'DNF — Last Race', cls: 'bad' };
  if (lf.pos <= 3) return { label: 'Peak Form', cls: 'good' };
  if (lf.pos <= 10) return { label: 'Consistent', cls: 'good' };
  return { label: 'Stable', cls: '' };
}

function driverCell(driver, report, state) {
  if (!driver) return '';
  const team = teamById(driver.team);
  const live = driverLiveStats(driver.id, state);
  const st = statusFor(driver, report, state, live);
  const synced = state.monopostoSynced?.drivers?.[driver.id] || { speed: driver.speed, risk: driver.risk };
  const spdDiff = live.speed !== synced.speed;
  const rskDiff = live.risk !== synced.risk;

  return `<div class="mx-driver mx-clickable-drv" data-inspect-drv="${driver.id}" title="Click to inspect ${driver.name}'s contract &amp; H2H dossier">
    <span class="mx-num" style="background:${team.color}">${driver.no}</span>
    <span class="mx-dmeta">
      <span class="mx-dname"><span class="fn">${driver.first}</span> <span class="ln">${driver.last}</span>${live.isPriority ? ' <span class="mx-priobadge" title="#1 Car Upgrade Priority (+1 Speed)">★ +1 SPD</span>' : ''}</span>
      <span class="mx-dstats">
        SPD <b style="${spdDiff ? 'color:var(--gold)' : ''}">${spdDiff ? `${synced.speed}→${live.speed}` : live.speed}</b>
        · RSK <b style="${rskDiff ? 'color:var(--gold)' : ''}">${rskDiff ? `${synced.risk}→${live.risk}` : live.risk}</b>
        · <span class="mx-status ${st.cls}">${st.label}</span>
      </span>
    </span>
  </div>`;
}

export function render(root) {
  const s = getState();
  ensureAiState(s);
  const me = playerTeam();
  const loggedRounds = Object.keys(s.results || {}).length;
  const currentRound = Math.min(22, loggedRounds + 1);
  const race = CALENDAR.find(r => r.round === currentRound);
  const next = race;
  const constructors = constructorStandings(s);
  const { report } = contractWindowReport(s);

  // Matrix order: live true Car Power, then combined live driver speed
  const speedSum = t => driversOfTeam(t.id, s).reduce((a, d) => a + driverLiveStats(d.id, s).speed, 0);
  const ordered = [...TEAMS].sort((a, b) => teamTruePower(b.id, s) - teamTruePower(a.id, s) || speedSum(b) - speedSum(a));

  const progressOf = t => {
    const frac = teamTruePower(t.id, s);
    return Math.round(((frac % 1) + 1) % 1 * 100);
  };

  const diffs = getMonopostoDiffs(s);
  const regUnlocked = isRegAdaptationUnlocked(s);
  const playerAtr = Math.round((s.aiTeams?.[s.teamId]?.atrMult || 1.0) * 100);

  const atrCards = ATR_MILESTONES.map(m => {
    const r = CALENDAR.find(x => x.round === m.round);
    const toGo = Math.max(0, m.round - currentRound);
    const passed = loggedRounds >= m.round;
    return `<div class="mx-atr-card ${passed ? 'is-active' : ''}">
      <div class="mx-atr-round">ROUND ${m.round} ${passed ? '<span style="color:var(--green)">✓ ACTIVE</span>' : ''}</div>
      <div class="mx-atr-gp">${r.flag} ${r.country.toUpperCase()}</div>
      <div class="mx-atr-big">${passed ? 'LIVE' : toGo}</div>
      <div class="mx-atr-lbl">${passed ? 'APPLIED TO GRID' : 'ROUNDS TO GO'}</div>
      <div class="mx-atr-note">» ${m.label}</div>
    </div>`;
  }).join('');

  const retirees = report.filter(r => r.rule === 1);
  const hotSeat = report.filter(r => r.rule === 2);
  const anyPoints = Object.values(s.points || {}).some(p => p > 0);
  const radarList = (list, empty) => list.length
    ? list.map(r => `<div class="mx-radar-row mx-clickable-drv" data-inspect-drv="${r.driver.id}" title="Click to inspect ${r.driver.name}">
        <span class="mx-num sm" style="background:${r.team.color}">${r.driver.no}</span>
        <span class="mx-radar-name"><span class="fn">${r.driver.first}</span> <span class="ln">${r.driver.last}</span><small>${r.team.name} · ${r.reason}</small></span>
        ${r.risk ? `<span class="mx-risk">${r.risk}%</span>` : ''}
      </div>`).join('')
    : `<div class="mx-radar-empty">${empty}</div>`;

  // Build table HTML according to selected matrixViewMode ('all' | 'sliders' | 'rdspy')
  let tableHTML = '';
  if (matrixViewMode === 'all') {
    tableHTML = `
      <table class="mx-table">
        <thead><tr>
          <th>POS</th><th>TEAM &amp; HQ</th>
          <th class="c">MONOPOSTO<br>CAR POWER (1–10)</th>
          <th>R&amp;D PROGRESS<br>TO NEXT LEVEL</th>
          <th>DRIVER 1 <span class="mx-th-sub">SPD&nbsp;&nbsp;RSK&nbsp;&nbsp;FORM / STATUS (CLICK FOR DOSSIER)</span></th>
          <th>DRIVER 2 <span class="mx-th-sub">SPD&nbsp;&nbsp;RSK&nbsp;&nbsp;FORM / STATUS (CLICK FOR DOSSIER)</span></th>
        </tr></thead>
        <tbody>
        ${ordered.map((t, i) => {
          const [d1, d2] = driversOfTeam(t.id, s);
          const pct = progressOf(t);
          const livePwr = teamMonopostoPower(t.id, s);
          const syncedPwr = s.monopostoSynced?.teams?.[t.id] ?? t.carPower;
          const pwrChanged = livePwr !== syncedPwr;
          return `<tr class="${t.id === s.teamId ? 'me' : ''}">
            <td class="mx-pos">${i + 1}</td>
            <td><div class="mx-team"><span class="mx-colorbar" style="background:${t.color}"></span>${logoHTML(t)}<div><span class="mx-tname">${t.name.toUpperCase()}</span><div style="font-size:.66rem;color:var(--dim);letter-spacing:.06em">${t.hq.toUpperCase()} HQ</div></div></div></td>
            <td class="c"><span class="mx-power" style="border-color:${pwrChanged ? 'var(--gold)' : t.color}" title="True Fractional Power: ${teamTruePower(t.id, s).toFixed(2)}">${pwrChanged ? `<small style="font-size:.7rem;color:var(--dim);text-decoration:line-through;margin-right:2px">${syncedPwr}</small>${livePwr}` : livePwr}</span></td>
            <td><div class="mx-prog"><span class="mx-track"><span class="mx-fill" style="width:${pct}%;background:${t.color}"></span></span><b>${pct}%</b></div></td>
            <td>${driverCell(d1, report, s)}</td>
            <td>${driverCell(d2, report, s)}</td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
    `;
  } else if (matrixViewMode === 'sliders') {
    tableHTML = `
      <div class="mx-mode-banner">
        <div>
          <b>QUICK MONOPOSTO 1–10 GAME SETUP SHEET</b> — Enter these exact 5 integer sliders per team inside the Monoposto mobile game. Highlighted <span style="color:var(--gold);font-weight:700">Old → New</span> values indicate unsynced changes since your last confirmation.
        </div>
        ${diffs.length ? `<button class="btn primary small" id="mx-Sliders-syncall">✓ CONFIRM ALL ${diffs.length} SLIDERS APPLIED</button>` : `<span class="tag good">✓ ALL SLIDERS SYNCED</span>`}
      </div>
      <table class="mx-table">
        <thead><tr>
          <th>POS</th>
          <th>TEAM</th>
          <th class="c">CAR POWER<br>SLIDER (1–10)</th>
          <th>DRIVER 1<br><span class="mx-th-sub">SPEED (1–10) &nbsp;|&nbsp; RISK (1–10)</span></th>
          <th>DRIVER 2<br><span class="mx-th-sub">SPEED (1–10) &nbsp;|&nbsp; RISK (1–10)</span></th>
          <th class="c">SYNC STATUS</th>
        </tr></thead>
        <tbody>
        ${ordered.map((t, i) => {
          const [d1, d2] = driversOfTeam(t.id, s);
          const lPwr = teamMonopostoPower(t.id, s);
          const sPwr = s.monopostoSynced?.teams?.[t.id] ?? t.carPower;
          const l1 = d1 ? driverLiveStats(d1.id, s) : { speed: 7, risk: 6 };
          const s1 = d1 ? (s.monopostoSynced?.drivers?.[d1.id] || { speed: d1.speed, risk: d1.risk }) : { speed: 7, risk: 6 };
          const l2 = d2 ? driverLiveStats(d2.id, s) : { speed: 7, risk: 6 };
          const s2 = d2 ? (s.monopostoSynced?.drivers?.[d2.id] || { speed: d2.speed, risk: d2.risk }) : { speed: 7, risk: 6 };
          const rowChanged = lPwr !== sPwr || l1.speed !== s1.speed || l1.risk !== s1.risk || l2.speed !== s2.speed || l2.risk !== s2.risk;

          const fmtVal = (oldV, newV) => oldV !== newV
            ? `<span style="color:var(--gold);font-family:'F1DisplayBold',sans-serif"><s style="color:var(--dim);font-weight:400">${oldV}</s> → ${newV}</span>`
            : `<b style="font-family:'F1DisplayBold',sans-serif">${newV}</b>`;

          return `<tr class="${t.id === s.teamId ? 'me' : ''}">
            <td class="mx-pos">${i + 1}</td>
            <td><div class="mx-team"><span class="mx-colorbar" style="background:${t.color}"></span>${logoHTML(t)}<span class="mx-tname">${t.name.toUpperCase()}</span></div></td>
            <td class="c"><span class="mx-power" style="border-color:${lPwr !== sPwr ? 'var(--gold)' : t.color};width:auto;min-width:42px;padding:0 8px">${fmtVal(sPwr, lPwr)}</span></td>
            <td>${d1 ? `<div style="display:flex;align-items:center;gap:10px"><span class="mx-num sm" style="background:${t.color}">${d1.no}</span><div><div style="font-family:'F1DisplayBold',sans-serif;font-size:.86rem">${d1.last}</div><div style="font-size:.82rem;color:var(--dim)">SPD: ${fmtVal(s1.speed, l1.speed)} &nbsp;|&nbsp; RSK: ${fmtVal(s1.risk, l1.risk)}</div></div></div>` : '—'}</td>
            <td>${d2 ? `<div style="display:flex;align-items:center;gap:10px"><span class="mx-num sm" style="background:${t.color}">${d2.no}</span><div><div style="font-family:'F1DisplayBold',sans-serif;font-size:.86rem">${d2.last}</div><div style="font-size:.82rem;color:var(--dim)">SPD: ${fmtVal(s2.speed, l2.speed)} &nbsp;|&nbsp; RSK: ${fmtVal(s2.risk, l2.risk)}</div></div></div>` : '—'}</td>
            <td class="c">${rowChanged ? `<span class="tag warn">UPDATE IN GAME</span>` : `<span class="tag good">✓ SYNCED</span>`}</td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
    `;
  } else {
    // 'rdspy' — 12-Team R&D Development Progress Spy Table
    tableHTML = `
      <div class="mx-mode-banner">
        <div>
          <b>12-TEAM ENGINEERING &amp; BACKGROUND R&amp;D SPY TELEMETRY</b> — Tracks every constructor's HQ Facility Phase, FIA Wind Tunnel ATR multiplier, weekly DP output, true fractional Car Power, and Season-2 Technical Directive protection.
        </div>
      </div>
      <table class="mx-table">
        <thead><tr>
          <th>POS</th>
          <th>TEAM &amp; FACTORY HQ</th>
          <th class="c">TRUE POWER<br><span class="mx-th-sub">START → LIVE</span></th>
          <th>FACILITY PHASE &amp;<br>ATR MULTIPLIER</th>
          <th>ACTIVE R&amp;D UPGRADE<br>&amp; WEEKLY DP RATE</th>
          <th>2027 SPEC FOCUS &amp;<br>DIRECTIVE SHIELD</th>
        </tr></thead>
        <tbody>
        ${ordered.map((t, i) => {
          const ai = s.aiTeams?.[t.id] || { facilityPhase: 1, atrMult: 1.0, weeklyDpBase: 3.2, activeUpgrade: 'Aero Package', regFocus: 'current' };
          const startPwr = s.seasonStartPower?.[t.id] ?? t.carPower;
          const liveTrue = teamTruePower(t.id, s);
          const atrPct = Math.round((ai.atrMult || 1.0) * 100);
          const protPct = regulationProtectionPct(s, t.id);
          const isMe = t.id === s.teamId;
          const activeTask = isMe ? (s.tasks.find(x => x.kind === 'research' || x.kind === 'manufacture')?.label || 'Player R&D Queue') : (ai.activeUpgrade || 'Wind Tunnel Spec');
          const wkRate = isMe ? 'Player R&D + RP' : `+${(ai.weeklyDpBase * (ai.atrMult || 1.0)).toFixed(1)} DP/wk`;
          const focusMode = REG_FOCUS_MODES[isMe ? (s.regFocus || 'current') : (ai.regFocus || 'current')] || REG_FOCUS_MODES.current;

          return `<tr class="${isMe ? 'me' : ''}">
            <td class="mx-pos">${i + 1}</td>
            <td><div class="mx-team"><span class="mx-colorbar" style="background:${t.color}"></span>${logoHTML(t)}<div><span class="mx-tname">${t.name.toUpperCase()}</span><div style="font-size:.66rem;color:var(--dim)">${t.hqFull || t.hq}</div></div></div></td>
            <td class="c"><div style="font-family:'F1DisplayBold',sans-serif;font-size:1rem;color:#fff">${liveTrue.toFixed(2)}</div><div style="font-size:.72rem;color:var(--dim)">Base ${startPwr.toFixed(2)} (+${(liveTrue - startPwr).toFixed(2)})</div></td>
            <td>
              <span class="tag ${ai.facilityPhase === 3 ? 'good' : ai.facilityPhase === 2 ? 'warn' : ''}">PHASE ${ai.facilityPhase}</span>
              <span class="tag" style="margin-left:4px">ATR ${atrPct}%</span>
            </td>
            <td>
              <div style="font-family:'F1DisplayBold',sans-serif;font-size:.82rem;color:#fff">${activeTask}</div>
              <div style="font-size:.75rem;color:var(--green)">${wkRate}</div>
            </td>
            <td>
              <div style="font-size:.78rem;color:#d8d8dd">${focusMode.short}</div>
              <div style="font-size:.74rem;color:${protPct > 0 ? 'var(--gold)' : 'var(--dim)'}">2027 Part-Ban Shield: <b>${protPct}%</b></div>
            </td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
    `;
  }

  root.innerHTML = `<div class="mx-wrap">
    <div class="mx-head">
      <div>
        <h1 class="mx-title">12 TEAMS &amp; 24 DRIVERS — PERFORMANCE MATRIX</h1>
        <div class="mx-sub">SEASON ${s.season || 1} (${(s.season || 1) === 1 ? '2026' : '2027'}) &nbsp;|&nbsp; MONOPOSTO CAR POWER &nbsp;|&nbsp; AI BACKGROUND R&amp;D &nbsp;|&nbsp; DRIVER SLIDERS &amp; FORM</div>
      </div>
      <div class="mx-roundbox">
        <div class="mx-round">ROUND ${race.round}<span>/22</span></div>
        <div class="mx-gp">${race.flag} ${race.country.toUpperCase()} — ${race.circuit.toUpperCase()}</div>
        <a class="btn primary small mx-logbtn" href="#/race">+ LOG RACE WEEKEND</a>
      </div>
    </div>

    <div class="mx-grid">
      <section class="mx-panel mx-matrix">
        <div class="mx-filterrow">
          <button type="button" class="mx-chip ${matrixViewMode === 'all' ? 'on' : ''}" data-mx-mode="all">ALL 12 TEAMS</button>
          <button type="button" class="mx-chip ${matrixViewMode === 'sliders' ? 'on' : ''}" data-mx-mode="sliders">MONOPOSTO 1–10 SLIDERS ${diffs.length ? `(${diffs.length})` : ''}</button>
          <button type="button" class="mx-chip ${matrixViewMode === 'rdspy' ? 'on' : ''}" data-mx-mode="rdspy">R&amp;D DEVELOPMENT PROGRESS</button>
          <a class="mx-chip link" href="#/devgraph">BASELINE DEV GRAPH →</a>
        </div>

        ${tableHTML}

        <div class="mx-bottomrow">
          <div class="mx-mini">
            <div class="mx-mini-title">CONSTRUCTORS' CHAMPIONSHIP</div>
            <div class="mx-ctor">
              ${constructors.map((c, i) => `<div class="mx-ctor-row ${c.team.id === s.teamId ? 'me' : ''}"><span class="mx-ctor-pos">${i + 1}</span>${logoHTML(c.team)}<span class="mx-ctor-name">${c.team.name.toUpperCase()}</span><b>${c.points}</b></div>`).join('')}
            </div>
          </div>
          <div class="mx-mini mx-next">
            <div class="mx-mini-title">NEXT ROUND</div>
            <div class="mx-next-round">ROUND ${next.round}</div>
            <div class="mx-next-gp">${next.flag} ${next.country.toUpperCase()}</div>
            <div class="mx-next-circuit">${next.circuit.toUpperCase()}</div>
            <div class="mx-next-meta">${next.laps} LAPS &nbsp;·&nbsp; ${next.lapKm.toFixed(3)} KM &nbsp;·&nbsp; ${(next.laps * next.lapKm).toFixed(1)} KM</div>
            <div class="mx-next-meta">${prettyDate(next.sun).toUpperCase()} ${(s.season || 1) === 1 ? '2026' : '2027'}</div>
            <a class="btn small" href="#/race">OPEN RACE WEEKEND →</a>
          </div>
        </div>
      </section>

      <aside class="mx-rail">
        <div class="mx-panel mx-required">
          <div class="mx-rail-title">⚠ REQUIRED MONOPOSTO IN-GAME CHANGES<br>BEFORE NEXT RACE</div>
          ${diffs.length
            ? `<div class="mx-badge">${diffs.length} SLIDER CHANGE${diffs.length === 1 ? '' : 'S'} PENDING IN MONOPOSTO</div>
               <div class="mx-diff-list">
                 ${diffs.map(c => `
                   <div class="mx-change-row">
                     ${logoHTML(c.team)}
                     <div style="flex:1;min-width:0">
                       <div class="mx-change-name">${c.team.name.toUpperCase()} · ${c.label}</div>
                       <div class="mx-change-what">${c.reason}</div>
                     </div>
                     <b style="color:var(--gold);font-size:.95rem;white-space:nowrap">${c.from} → ${c.to}</b>
                     <button type="button" class="btn small" data-sync-key="${c.key}" style="padding:4px 9px;font-size:.66rem">✓ Applied</button>
                   </div>
                 `).join('')}
               </div>
               <button type="button" class="btn primary small" id="mx-sync-all-btn" style="width:100%;margin-top:10px;padding:10px">✓ CONFIRM ALL APPLIED IN MONOPOSTO</button>`
            : `<div class="mx-nochange" style="color:var(--green)">✓ All 12 teams &amp; 24 drivers in Monoposto match the tracker. As R&amp;D upgrades complete or driver Speed/Risk shifts, pending slider updates will appear here.</div>`}
          <div class="mx-rail-note">Compares your confirmed Monoposto sliders against live R&amp;D and form telemetry.</div>
        </div>

        <div class="mx-panel">
          <div class="mx-rail-title">FIA ATR WIND TUNNEL RESET &amp; REGULATION TRACKER</div>
          <div class="mx-rail-note">Your Current Wind Tunnel ATR Allocation: <b style="color:#fff">${playerAtr}%</b> · 2027 Directive Shield: <b style="color:var(--gold)">${regulationProtectionPct(s, s.teamId)}%</b></div>
          <div class="mx-atr">${atrCards}</div>
          <div class="mx-reg-box" style="margin-top:12px;padding-top:12px;border-top:1px solid #25252e">
            <div style="font-family:'F1DisplayBold',sans-serif;font-size:.72rem;letter-spacing:.1em;color:var(--dim);margin-bottom:6px">
              2027 FIA TECHNICAL DIRECTIVE R&amp;D ALLOCATION ${regUnlocked ? '<span style="color:var(--green)">(UNLOCKED)</span>' : '<span style="color:var(--gold)">(UNLOCKS AT R16 SINGAPORE)</span>'}
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${Object.values(REG_FOCUS_MODES).map(mode => `
                <button type="button" class="btn small ${s.regFocus === mode.id ? 'primary' : ''}" data-reg-focus="${mode.id}" ${!regUnlocked ? 'disabled' : ''} style="flex:1;min-width:105px;padding:7px 8px;font-size:.66rem">
                  ${mode.short}
                </button>
              `).join('')}
            </div>
            <div style="font-size:.76rem;color:var(--dim);margin-top:6px;line-height:1.4">
              ${(REG_FOCUS_MODES[s.regFocus || 'current'] || REG_FOCUS_MODES.current).desc}
            </div>
          </div>
        </div>

        <div class="mx-panel">
          <div class="mx-rail-title">CONTRACT RADAR (CLICK ANY DRIVER TO INSPECT)</div>
          <div class="mx-rail-note">24 DRIVERS &amp; F2 RESERVE POOL — PRESTIGE &amp; FAN RATING RULES</div>
          <div class="mx-radar-cols">
            <div>
              <div class="mx-radar-h bad">● RETIREMENT WATCH</div>
              <div class="mx-radar-sub">RULE 1 — age 35+ AND (car Power &lt; 6 OR outside Top 10 at Abu Dhabi)</div>
              ${radarList(retirees, 'No veteran meets the Rule 1 triggers.')}
            </div>
            <div>
              <div class="mx-radar-h warn">● HOT SEAT / SACK RISK</div>
              <div class="mx-radar-sub">RULE 2 — under 35% of teammate's points → seat at risk</div>
              ${radarList(hotSeat, anyPoints ? 'Nobody is below the 35% line.' : 'No points logged yet — Rule 2 arms once results are in.')}
            </div>
            <div>
              <div class="mx-radar-h info">● FIA F2 RESERVE POOL</div>
              <div class="mx-radar-sub">RULE 3 — Click any reserve driver below to view dossier or sign to your team</div>
              ${RESERVE_DRIVERS.map(r => `
                <div class="mx-radar-row mx-clickable-drv" data-inspect-drv="${r.id}" title="Click to inspect ${r.name}">
                  <span class="mx-num sm" style="background:#38b6ff">${r.no}</span>
                  <span class="mx-radar-name"><span class="fn">${r.first}</span> <span class="ln">${r.last}</span><small>SPD ${r.speed} · RSK ${r.risk} · ${r.bio}</small></span>
                </div>
              `).join('')}
            </div>
          </div>
          <a class="btn primary mx-simbtn" href="#/market">OPEN DRIVER MARKET &amp; NEGOTIATIONS →</a>
        </div>

        <div class="mx-panel mx-hqcta">
          <div class="mx-rail-title">${me.name.toUpperCase()} — ${me.hq.toUpperCase()} HQ</div>
          <div class="mx-rail-note">Manage your factory cash, Resource Points, ${me.hq} facility branches, R&amp;D parts, and sponsor goals in Team HQ.</div>
          <a class="btn mx-hqbtn" href="#/hq">GO TO ${me.hq.toUpperCase()} TEAM HQ →</a>
        </div>
      </aside>
    </div>
  </div>`;

  // View mode tabs
  root.querySelectorAll('[data-mx-mode]').forEach(btn => {
    btn.onclick = () => {
      matrixViewMode = btn.dataset.mxMode;
      render(root);
    };
  });

  // Single diff item sync
  root.querySelectorAll('[data-sync-key]').forEach(btn => {
    btn.onclick = () => {
      confirmMonopostoSync(s, btn.dataset.syncKey);
      render(root);
    };
  });

  // Master sync all buttons
  const syncAllBtn = root.querySelector('#mx-sync-all-btn');
  if (syncAllBtn) {
    syncAllBtn.onclick = () => {
      confirmMonopostoSync(s, 'all');
      render(root);
    };
  }
  const slidersSyncAll = root.querySelector('#mx-Sliders-syncall');
  if (slidersSyncAll) {
    slidersSyncAll.onclick = () => {
      confirmMonopostoSync(s, 'all');
      render(root);
    };
  }

  // R16-R22 Regulation Focus toggle
  root.querySelectorAll('[data-reg-focus]').forEach(btn => {
    btn.onclick = () => {
      if (!regUnlocked) return;
      s.regFocus = btn.dataset.regFocus;
      if (s.aiTeams?.[s.teamId]) s.aiTeams[s.teamId].regFocus = s.regFocus;
      save();
      render(root);
    };
  });

  // Clickable Driver Cells & Contract Radar Rows -> Open Driver Dossier Modal
  root.querySelectorAll('[data-inspect-drv]').forEach(el => {
    el.onclick = () => {
      openDriverDossierModal(el.dataset.inspectDrv, () => render(root));
    };
  });
}
