// RACE WEEKEND — Two-Stage Full-Grid Session Control:
// Stage 1: QUALIFYING SESSION (24-driver starting grid P1–P24 + required lap times,
//          with a toggle for "Grid Positions Only (No Lap Time Data)" and a button to "Skip Qualifying Session").
// Stage 2: GRAND PRIX (24-driver race classification P1–P24 or DNF + optional finishing time/gap + Fastest Lap,
//          computing official F1 points for all 24 drivers & 12 teams, FIA Prize Cash, Telemetry RP,
//          Fan Rating progression, R7/R14 ATR resets, and Season 2 transition at Round 22).
import { CALENDAR, nextUnloggedRace } from '../data/calendar2026.js?v=20261022m';
import { TRACK_MAPS } from '../data/trackMaps.js?v=20261022m';
import { activeDrivers, driversOfTeam, teamById, driverById } from '../data/teamsAndDrivers.js?v=20261022m';
import {
  getState,
  save,
  teamTruePower,
  driverLiveStats,
  startSeason2
} from '../engine/store.js?v=20261022m';
import {
  logQualifying,
  logResult,
  pointsFor,
  driverStandings,
  constructorStandings
} from '../engine/raceSimulator.js?v=20261022m';
import { computeSeason2Preview } from '../engine/aiRdEngine.js?v=20261022m';
import { prettyDate, daysBetween } from '../engine/timeEngine.js?v=20261022m';
import { topbarHTML, refreshHUD, fmt$ } from './shared.js?v=20261022m';

function rangeLabel(race) {
  const sat = prettyDate(race.sat), sun = prettyDate(race.sun);
  const sParts = sat.split(' '), uParts = sun.split(' ');
  if (sParts[1] === uParts[1]) return `${sParts[0].replace(/\D/g, '')}–${uParts[0].replace(/\D/g, '')} ${uParts[1]}`;
  return `${sat} – ${sun}`;
}

const ribbonHTML = () => {
  const grp = `<div class="rw-grp">${'<span>Race Weekend</span>'.repeat(5)}</div>`;
  return `<div class="rw-sidebar"><div class="rw-marquee">${grp}${grp}</div></div>`;
};

// Default realistic baseline order of the 24 drivers by Car Power + Driver Speed
function defaultPerformanceOrder(state) {
  return [...activeDrivers(state)].sort((a, b) => {
    const pA = teamTruePower(a.team, state);
    const pB = teamTruePower(b.team, state);
    if (pB !== pA) return pB - pA;
    const sA = driverLiveStats(a.id, state).speed;
    const sB = driverLiveStats(b.id, state).speed;
    if (sB !== sA) return sB - sA;
    return a.no - b.no;
  });
}

// Generates realistic sample qualifying lap times for a circuit if the user wants to pre-fill times
function generateBaselineLapTime(race, posIndex) {
  const baseSec = Math.max(68, Math.min(108, race.lapKm * 16.4));
  const totalSec = baseSec + posIndex * 0.14;
  const mins = Math.floor(totalSec / 60);
  const secs = (totalSec - mins * 60).toFixed(3).padStart(6, '0');
  return `${mins}:${secs}`;
}

export function openSeason2TransitionModal(onComplete) {
  const s = getState();
  const existing = document.getElementById('s2-modal-backdrop');
  if (existing) existing.remove();

  const dStand = driverStandings(s);
  const cStand = constructorStandings(s);
  const dChamp = dStand[0];
  const cChamp = cStand[0];
  const myRank = cStand.findIndex(c => c.team.id === s.teamId) + 1;
  const prizeBonusM = +(Math.max(8.0, 20.0 - (myRank - 1) * 1.0)).toFixed(2);
  const preview = computeSeason2Preview(s);

  const backdrop = document.createElement('div');
  backdrop.id = 's2-modal-backdrop';
  backdrop.className = 'del-modal-backdrop';
  backdrop.innerHTML = `
    <div class="del-modal-box" role="dialog" aria-modal="true" style="max-width:780px;max-height:88vh;overflow-y:auto">
      <div class="del-modal-eyebrow">SEASON 1 (2026) COMPLETE · FIA ANNUAL TECHNICAL DIRECTIVE</div>
      <h2 class="del-modal-title">2026 SEASON FINALE &amp; 2027 LAUNCH</h2>
      <p class="del-modal-desc">
        All 22 rounds of the 2026 Championship are complete! Because 2026 was the major regulation overhaul and the next major rules reset is in 2030, only targeted FIA Technical Directive part bans apply entering Season 2 (2027), mitigated by each constructor's R16–R22 Spec Protection.
      </p>

      <div class="drv-dossier-grid" style="margin-bottom:14px">
        <div class="drv-dossier-stat">
          <span>2026 DRIVERS' CHAMPION</span>
          <b>${dChamp ? `${dChamp.driver.first} ${dChamp.driver.last} (${dChamp.points} pts)` : '—'}</b>
        </div>
        <div class="drv-dossier-stat">
          <span>2026 CONSTRUCTORS' CHAMPION</span>
          <b>${cChamp ? `${cChamp.team.name} (${cChamp.points} pts)` : '—'}</b>
        </div>
        <div class="drv-dossier-stat">
          <span>YOUR CONSTRUCTOR FINISH</span>
          <b>P${myRank} · ${teamById(s.teamId).name}</b>
        </div>
        <div class="drv-dossier-stat">
          <span>FIA PRIZE PURSE PAYOUT</span>
          <b style="color:var(--green)">+${fmt$(prizeBonusM)}</b>
        </div>
      </div>

      <div style="font-family:'F1DisplayBold',sans-serif;font-size:.74rem;letter-spacing:.12em;color:var(--dim);margin:12px 0 8px">
        2027 STARTING CAR POWER BASELINES (POST-DIRECTIVE PART BANS)
      </div>
      <table class="tower" style="font-size:.84rem;margin-bottom:16px">
        <thead>
          <tr>
            <th>Team</th>
            <th>2026 End Power</th>
            <th>R16–R22 Shield</th>
            <th>2027 Start Baseline</th>
            <th class="pts">Monoposto Slider</th>
          </tr>
        </thead>
        <tbody>
          ${preview.map(row => `
            <tr class="${row.team.id === s.teamId ? 'me' : ''}">
              <td><b>${row.team.name}</b></td>
              <td>${row.endingPower.toFixed(2)}</td>
              <td>${row.protPct}% (${row.focusLabel})</td>
              <td style="color:var(--green);font-family:'F1DisplayBold',sans-serif">${row.nextStartPower.toFixed(2)}</td>
              <td class="pts">${row.nextMonopostoInt}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="del-modal-actions">
        <button type="button" class="btn small" id="s2-modal-close">STAY IN 2026 ARCHIVE</button>
        <button type="button" class="btn primary small" id="s2-modal-launch">LAUNCH SEASON 2 (2027) · CLAIM +${fmt$(prizeBonusM)} →</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  backdrop.querySelector('#s2-modal-close').onclick = () => backdrop.remove();
  backdrop.querySelector('#s2-modal-launch').onclick = () => {
    startSeason2(s, {
      driverChampion: dChamp ? dChamp.driver.name : '',
      constructorChampion: cChamp ? cChamp.team.name : '',
      playerConstructorPos: myRank,
      prizeBonusM
    });
    backdrop.remove();
    refreshHUD();
    if (typeof onComplete === 'function') onComplete();
  };
}

export function render(root, forcedRound = null) {
  root.style.paddingLeft = 'clamp(42px, 7vw, 64px)';
  const s = getState();
  const pendingUnlogged = nextUnloggedRace(s);
  const completedRounds = CALENDAR.filter(r => Boolean(s.results?.[r.round]));
  const race = (forcedRound && CALENDAR.find(r => r.round === +forcedRound))
    || pendingUnlogged
    || CALENDAR[CALENDAR.length - 1];

  const allRoundsLogged = Object.keys(s.results || {}).length >= 22;
  const existingQuali = s.quali?.[race.round] || s.qualifying?.[race.round] || null;
  const existingRace = s.results?.[race.round] || null;

  // Lock upcoming race weekend if the calendar has NOT reached Qualifying Saturday yet
  const isFutureLocked = !existingRace && s.date < race.sat;
  const daysToQuali = isFutureLocked ? daysBetween(s.date, race.sat) : 0;

  // Determine initial active stage:
  // If Qualifying has NOT been logged/skipped yet (and race isn't logged), start on 'qualifying'.
  // Once Qualifying is logged or skipped, automatically open 'gp' (Grand Prix).
  let sessionStage = (existingQuali || existingRace) ? 'gp' : 'qualifying';
  let laps = existingRace?.laps || race.laps;
  let conditions = existingRace?.conditions || 'Dry';
  let fastestLapId = existingRace?.fastestLap || null;
  let feedbackBanner = null;
  let validationErr = '';

  // Working Qualifying state for all 24 drivers
  const perfDrivers = defaultPerformanceOrder(s);
  let qualiGridOnly = existingQuali ? Boolean(existingQuali.gridOnly) : false;
  let qualiPosMap = {}; // driverId -> 1..24
  let qualiTimeMap = {}; // driverId -> string

  if (existingQuali && Array.isArray(existingQuali.order) && existingQuali.order.length === 24) {
    existingQuali.order.forEach((id, idx) => { qualiPosMap[id] = idx + 1; });
    qualiTimeMap = { ...(existingQuali.times || {}) };
  } else {
    perfDrivers.forEach((d, idx) => {
      qualiPosMap[d.id] = idx + 1;
      qualiTimeMap[d.id] = '';
    });
  }

  // Working Grand Prix state for all 24 drivers
  let gpPosMap = {}; // driverId -> 1..24 or null (DNF)
  let gpGapMap = {}; // driverId -> string

  const syncGpDefaultFromQuali = () => {
    const qObj = s.quali?.[race.round] || s.qualifying?.[race.round];
    const baseOrder = (qObj?.order?.length === 24)
      ? qObj.order.map(id => driverById(id, s)).filter(Boolean)
      : defaultPerformanceOrder(s);
    baseOrder.forEach((d, idx) => {
      gpPosMap[d.id] = idx + 1;
      gpGapMap[d.id] = '';
    });
  };

  if (existingRace && existingRace.entries) {
    for (const d of activeDrivers(s)) {
      gpPosMap[d.id] = (d.id in existingRace.entries) ? existingRace.entries[d.id] : null;
      gpGapMap[d.id] = existingRace.gaps?.[d.id] || '';
    }
  } else {
    syncGpDefaultFromQuali();
  }

  const posSelectOptions = (selectedVal, allowDnf = false) => {
    let html = '';
    for (let p = 1; p <= 24; p++) {
      html += `<option value="${p}" ${selectedVal === p ? 'selected' : ''}>P${p}</option>`;
    }
    if (allowDnf) {
      html += `<option value="DNF" ${selectedVal === null ? 'selected' : ''}>DNF</option>`;
    }
    return html;
  };

  const draw = () => {
    const mapSrc = race.map || TRACK_MAPS[race.round] || null;
    const dist = (laps * race.lapKm).toFixed(1);
    const qSaved = s.quali?.[race.round] || s.qualifying?.[race.round] || null;

    // If the calendar hasn't reached Qualifying Saturday of this unlogged round yet, render the Paddock Lock / Countdown screen
    if (isFutureLocked) {
      root.innerHTML = `
        ${ribbonHTML()}
        ${topbarHTML(true)}
        <div class="hero">
          <div class="eyebrow">Season ${s.season || 1} (${(s.season || 1) === 1 ? '2026' : '2027'}) · Round ${race.round} of 22 · Paddock Standby</div>
          <h1 class="page" style="font-size:clamp(2rem,5.5vw,3.2rem)">PADDOCK NOT OPEN YET</h1>
          <div class="circuit"><span style="font-size:1.25rem;vertical-align:-2px;margin-right:8px">${race.flag}</span>${race.circuit.toUpperCase()} — ${race.gp.toUpperCase()}</div>
          ${mapSrc ? `<div class="trackframe"><img id="rw-track-map" src="${mapSrc}" alt="${race.circuit} — official F1 track map" loading="eager" decoding="async"></div>` : ''}
          <div class="chips">
            <span class="mchip">Current HQ Date: <b>${prettyDate(s.date)}</b></span>
            <span class="mchip">Qualifying Opens: <b>${prettyDate(race.sat)}</b></span>
            <span class="mchip">Grand Prix: <b>${prettyDate(race.sun)}</b></span>
            <span class="mchip" style="border-color:var(--gold);color:var(--gold)"><b>${daysToQuali} Day${daysToQuali === 1 ? '' : 's'} Until Qualifying</b></span>
          </div>
        </div>

        <div class="panel" style="max-width:960px">
          <div class="banner" style="margin-bottom:18px;border-left:4px solid var(--gold)">
            <div class="bt" style="font-size:1.05rem">⏱ RACE CONTROL LOCKED UNTIL ${prettyDate(race.sat).toUpperCase()} (${daysToQuali} DAY${daysToQuali === 1 ? '' : 'S'} AWAY)</div>
            <div class="bs" style="line-height:1.55;margin-top:6px">
              Your team is currently at HQ on <b>${prettyDate(s.date)}</b>. Qualifying and Grand Prix result logging for <b>Round ${race.round} — ${race.gp}</b> will unlock automatically as soon as the calendar reaches <b>${prettyDate(race.sat)}</b>.
              Advance the calendar day-by-day at Team HQ first so your R&amp;D, manufacturing, and weekly sponsor ticks stay synchronized with the race calendar.
            </div>
          </div>

          <div class="btnrow" style="justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
            <a class="btn primary" href="#/hq">GO TO TEAM HQ &amp; ADVANCE CALENDAR →</a>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
              ${completedRounds.length ? `
                <label style="font-size:.82rem;color:var(--dim);display:inline-flex;align-items:center;gap:8px">
                  <span>Inspect Completed Round:</span>
                  <select id="rw-archive-select" style="padding:6px 10px">
                    <option value="">Select Logged Round...</option>
                    ${completedRounds.map(cr => `<option value="${cr.round}">R${cr.round} · ${cr.gp}</option>`).join('')}
                  </select>
                </label>
              ` : ''}
              <a class="btn small" href="#/matrix">12-TEAM MATRIX</a>
              <a class="btn small" href="#/standings">STANDINGS</a>
            </div>
          </div>
        </div>
      `;

      const archSel = document.getElementById('rw-archive-select');
      if (archSel) {
        archSel.onchange = () => {
          if (archSel.value) render(root, +archSel.value);
        };
      }
      return;
    }

    // Order rows for display
    const qualiRows = [...activeDrivers(s)].sort((a, b) => (qualiPosMap[a.id] || 99) - (qualiPosMap[b.id] || 99));
    const gpRows = [...activeDrivers(s)].sort((a, b) => {
      const pA = gpPosMap[a.id] === null ? 99 : (gpPosMap[a.id] || 99);
      const pB = gpPosMap[b.id] === null ? 99 : (gpPosMap[b.id] || 99);
      if (pA !== pB) return pA - pB;
      const qA = qSaved?.order?.indexOf(a.id) ?? 99;
      const qB = qSaved?.order?.indexOf(b.id) ?? 99;
      return qA - qB;
    });

    root.innerHTML = `
      ${ribbonHTML()}
      ${topbarHTML(true)}
      <div class="hero">
        <div class="eyebrow">Season ${s.season || 1} (${(s.season || 1) === 1 ? '2026' : '2027'}) · Round ${race.round} of 22</div>
        <h1 class="page" style="font-size:clamp(2rem,6vw,3.4rem)">${sessionStage === 'qualifying' ? 'QUALIFYING SESSION' : 'GRAND PRIX'}</h1>
        <div class="circuit"><span style="font-size:1.25rem;vertical-align:-2px;margin-right:8px">${race.flag}</span>${race.circuit.toUpperCase()} — ${race.gp.toUpperCase()}</div>
        ${mapSrc ? `<div class="trackframe"><img id="rw-track-map" src="${mapSrc}" alt="${race.circuit} — official F1 track map" loading="eager" decoding="async"></div>` : ''}
        <div class="chips">
          <span class="mchip"><b>${rangeLabel(race)}</b></span>
          <span class="mchip">Lap <b>${race.lapKm.toFixed(3)}</b> km</span>
          <span class="mchip"><b id="chip-laps">${laps}</b> laps · <b id="chip-dist">${dist}</b> km</span>
          <span class="mchip">Qualifying: <b>${qSaved ? (qSaved.skipped ? 'Skipped' : qSaved.gridOnly ? '24-Car Grid Logged (No Times)' : '24-Car Grid & Lap Times Logged') : 'Pending'}</b></span>
        </div>
      </div>

      <div class="panel" style="max-width:1080px">
        <div class="rw-stage-tabs" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid var(--line)">
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button type="button" class="btn small ${sessionStage === 'qualifying' ? 'primary' : ''}" id="tab-quali-btn">
              1. QUALIFYING SESSION ${qSaved ? (qSaved.skipped ? '(SKIPPED)' : '✓') : ''}
            </button>
            <button type="button" class="btn small ${sessionStage === 'gp' ? 'primary' : ''}" id="tab-gp-btn">
              2. GRAND PRIX ${s.results?.[race.round] ? '✓' : '→'}
            </button>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            ${completedRounds.length ? `
              <select id="rw-round-switcher" style="padding:6px 10px;font-size:.78rem">
                ${ pendingUnlogged && s.date >= pendingUnlogged.sat ? `<option value="${pendingUnlogged.round}" ${race.round === pendingUnlogged.round ? 'selected' : ''}>Active: R${pendingUnlogged.round} ${pendingUnlogged.gp}</option>` : '' }
                ${completedRounds.map(cr => `<option value="${cr.round}" ${race.round === cr.round ? 'selected' : ''}>Logged: R${cr.round} ${cr.gp}</option>`).join('')}
              </select>
            ` : ''}
            <a class="btn small" href="#/hq">TEAM HQ</a>
            <a class="btn small" href="#/standings">STANDINGS</a>
            <a class="btn small" href="#/matrix">12-TEAM MATRIX</a>
          </div>
        </div>

        ${allRoundsLogged && (s.season || 1) === 1 ? `
          <div class="banner" style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap">
            <div>
              <div class="bt">★ 2026 CHAMPIONSHIP COMPLETE (ALL 22 ROUNDS LOGGED)</div>
              <div class="bs">Review the 2026 Champions, FIA Prize Purse, and 2027 Technical Directive Part-Ban Baselines to launch Season 2.</div>
            </div>
            <button type="button" class="btn primary small" id="rw-open-s2-btn">REVIEW &amp; START SEASON 2 (2027) →</button>
          </div>
        ` : ''}

        ${feedbackBanner ? `
          <div class="banner blue" style="margin-bottom:16px">
            <div class="bt">${feedbackBanner.title}</div>
            <div class="bs">${feedbackBanner.body}</div>
            ${feedbackBanner.nextCta ? `<div style="margin-top:10px"><a class="btn primary small" href="#/hq">${feedbackBanner.nextCta}</a></div>` : ''}
          </div>
        ` : ''}

        ${validationErr ? `
          <div class="banner red" style="margin-bottom:16px">
            <div class="bt">Classification Check</div>
            <div class="bs">${validationErr}</div>
          </div>
        ` : ''}

        ${sessionStage === 'qualifying' ? `
          <div class="rw-quali-wrap">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:14px">
              <div>
                <h2 style="margin:0 0 4px">SATURDAY QUALIFYING SESSION — 24-DRIVER STARTING GRID</h2>
                <div style="color:var(--dim);font-size:.88rem;line-height:1.5">
                  Log the starting grid positions (<b>P1–P24</b>) and qualifying lap times for all 24 drivers. If you ran Qualifying without recording lap times, toggle <b>Grid Positions Only</b> below; or click <b>Skip Qualifying Session</b> to jump straight to the Grand Prix.
                </div>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button type="button" class="btn small" id="quali-fill-times-btn" title="Pre-fills sample circuit lap times based on current grid order">PRE-FILL SAMPLE LAP TIMES</button>
                <button type="button" class="btn small" id="quali-reset-perf-btn" title="Orders all 24 drivers by Car Power &amp; Speed">ORDER BY CAR POWER &amp; SPEED</button>
              </div>
            </div>

            <div class="lapsrow" style="margin-bottom:16px;justify-content:space-between">
              <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:.92rem;color:#fff">
                <input type="checkbox" id="quali-gridonly-chk" ${qualiGridOnly ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--red)">
                <span><b>Log Grid Positions Only (No Qualifying Lap Time Data Recorded)</b> — Make lap times optional while still recording the 24-car starting grid</span>
              </label>
              <button type="button" class="btn small" id="quali-skip-top-btn" style="border-color:var(--gold);color:var(--gold)">SKIP QUALIFYING SESSION → GO TO GRAND PRIX</button>
            </div>

            <div style="overflow-x:auto">
              <table class="tower rw-grid-table">
                <thead>
                  <tr>
                    <th style="width:90px">GRID POS</th>
                    <th style="width:76px">MOVE</th>
                    <th>DRIVER</th>
                    <th>CONSTRUCTOR</th>
                    <th style="width:210px">${qualiGridOnly ? 'QUALIFYING LAP TIME (OPTIONAL)' : 'QUALIFYING LAP TIME (REQUIRED)'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${qualiRows.map((d, idx) => {
                    const t = teamById(d.team);
                    const isMine = d.team === s.teamId;
                    const curPos = qualiPosMap[d.id] || (idx + 1);
                    const curTime = qualiTimeMap[d.id] || '';
                    return `
                      <tr class="${isMine ? 'me' : ''}" data-q-row="${d.id}">
                        <td>
                          <select class="rw-q-pos" data-q-pos="${d.id}" style="width:78px;padding:6px 8px;font-family:'F1DisplayBold',sans-serif">
                            ${posSelectOptions(curPos, false)}
                          </select>
                        </td>
                        <td>
                          <div style="display:inline-flex;gap:4px">
                            <button type="button" class="btn small" data-q-move="${d.id}:-1" style="padding:4px 8px" ${idx === 0 ? 'disabled' : ''}>▲</button>
                            <button type="button" class="btn small" data-q-move="${d.id}:1" style="padding:4px 8px" ${idx === qualiRows.length - 1 ? 'disabled' : ''}>▼</button>
                          </div>
                        </td>
                        <td>
                          <div class="tname">
                            <span class="mx-num sm" style="background:${t.color}">${d.no}</span>
                            <span><span class="fn">${d.first}</span> <span class="ln">${d.last}</span></span>
                          </div>
                        </td>
                        <td style="color:var(--dim);font-size:.88rem">${t.name}</td>
                        <td>
                          <input type="text" class="rw-q-time" data-q-time="${d.id}" value="${curTime}" placeholder="${qualiGridOnly ? 'Optional (e.g. 1:27.412)' : 'e.g. 1:27.412'}" style="width:185px;padding:7px 10px;font-variant-numeric:tabular-nums">
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div class="btnrow" style="justify-content:space-between;margin-top:18px">
              <button type="button" class="btn" id="quali-skip-btn" style="border-color:var(--gold);color:var(--gold)">
                SKIP QUALIFYING SESSION → GO TO GRAND PRIX
              </button>
              <button type="button" class="btn primary" id="quali-save-btn">
                SAVE QUALIFYING SESSION &amp; PROCEED TO GRAND PRIX →
              </button>
            </div>
          </div>
        ` : `
          <div class="rw-gp-wrap">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:14px">
              <div>
                <h2 style="margin:0 0 4px">SUNDAY GRAND PRIX — FULL 24-DRIVER RACE CLASSIFICATION</h2>
                <div style="color:var(--dim);font-size:.88rem;line-height:1.5">
                  Assign finishing positions (<b>P1–P24</b> or <b>DNF</b>) for all 24 drivers. Finishing times / gaps are optional. Official F1 points (<b>25-18-15-12-10-8-6-4-2-1</b> + <b>+1 Fastest Lap</b> if inside Top 10) update both Championships automatically.
                </div>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                ${qSaved && !qSaved.skipped && qSaved.order?.length === 24 ? `<button type="button" class="btn small" id="gp-copy-quali-btn">COPY QUALIFYING GRID ORDER</button>` : ''}
                <button type="button" class="btn small" id="gp-order-perf-btn">ORDER BY CAR POWER &amp; SPEED</button>
              </div>
            </div>

            <div class="lapsrow" style="margin-bottom:16px;justify-content:space-between">
              <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
                <span class="lk">Race length</span>
                <div class="stepper">
                  <button type="button" id="lap-minus" aria-label="Fewer laps">−</button>
                  <span class="lv" id="lap-val">${laps} laps</span>
                  <button type="button" id="lap-plus" aria-label="More laps">+</button>
                </div>
                <span class="ld">Distance <b id="lap-dist">${dist} km</b></span>
              </div>
              <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                <span class="lk">Conditions</span>
                <select id="log-cond" style="padding:7px 12px">
                  <option ${conditions === 'Dry' ? 'selected' : ''}>Dry</option>
                  <option ${conditions === 'Less wet — inters' ? 'selected' : ''}>Less wet — inters</option>
                  <option ${conditions === 'Full wet' ? 'selected' : ''}>Full wet</option>
                </select>
              </div>
            </div>

            <div style="overflow-x:auto">
              <table class="tower rw-grid-table">
                <thead>
                  <tr>
                    <th style="width:94px">FINISH</th>
                    <th style="width:76px">MOVE</th>
                    <th style="width:72px">GRID</th>
                    <th>DRIVER</th>
                    <th>CONSTRUCTOR</th>
                    <th style="width:78px;text-align:center">PTS</th>
                    <th style="width:72px;text-align:center">FL (+1)</th>
                    <th style="width:190px">TIME / GAP (OPTIONAL)</th>
                  </tr>
                </thead>
                <tbody>
                  ${gpRows.map((d, idx) => {
                    const t = teamById(d.team);
                    const isMine = d.team === s.teamId;
                    const curPos = gpPosMap[d.id];
                    const curGap = gpGapMap[d.id] || '';
                    const qIdx = (qSaved && !qSaved.skipped && Array.isArray(qSaved.order)) ? qSaved.order.indexOf(d.id) : -1;
                    const gridBadge = qIdx !== -1 ? `P${qIdx + 1}` : '—';
                    const isFl = fastestLapId === d.id;
                    const pts = pointsFor(curPos, isFl);
                    return `
                      <tr class="${isMine ? 'me' : ''}" data-gp-row="${d.id}">
                        <td>
                          <select class="rw-gp-pos" data-gp-pos="${d.id}" style="width:82px;padding:6px 8px;font-family:'F1DisplayBold',sans-serif;${curPos === null ? 'color:#ff7a6e;border-color:#ff7a6e' : ''}">
                            ${posSelectOptions(curPos, true)}
                          </select>
                        </td>
                        <td>
                          <div style="display:inline-flex;gap:4px">
                            <button type="button" class="btn small" data-gp-move="${d.id}:-1" style="padding:4px 8px" ${idx === 0 ? 'disabled' : ''}>▲</button>
                            <button type="button" class="btn small" data-gp-move="${d.id}:1" style="padding:4px 8px" ${idx === gpRows.length - 1 ? 'disabled' : ''}>▼</button>
                          </div>
                        </td>
                        <td style="color:var(--dim);font-family:'F1DisplayBold',sans-serif;font-variant-numeric:tabular-nums">${gridBadge}</td>
                        <td>
                          <div class="tname">
                            <span class="mx-num sm" style="background:${t.color}">${d.no}</span>
                            <span><span class="fn">${d.first}</span> <span class="ln">${d.last}</span></span>
                          </div>
                        </td>
                        <td style="color:var(--dim);font-size:.88rem">${t.name}</td>
                        <td style="text-align:center;font-family:'F1DisplayBold',sans-serif;color:${pts > 0 ? 'var(--green)' : 'var(--dim)'}">${pts > 0 ? `+${pts}` : '0'}</td>
                        <td style="text-align:center">
                          <button type="button" class="btn small ${isFl ? 'primary' : ''}" data-gp-fl="${d.id}" style="padding:4px 8px;font-size:.68rem">${isFl ? '★ FL' : 'FL'}</button>
                        </td>
                        <td>
                          <input type="text" class="rw-gp-gap" data-gp-gap="${d.id}" value="${curGap}" placeholder="${curPos === 1 ? 'Winner time (opt)' : curPos === null ? 'DNF reason (opt)' : '+Gap (optional)'}" style="width:170px;padding:7px 10px;font-variant-numeric:tabular-nums">
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div class="btnrow" style="justify-content:space-between;align-items:center;margin-top:18px">
              <button type="button" class="btn small" id="gp-back-quali-btn">← BACK TO QUALIFYING SESSION</button>
              <button type="button" class="btn primary" id="gp-save-btn">LOG GRAND PRIX RESULTS (ALL 24 DRIVERS) →</button>
            </div>
          </div>
        `}
      </div>
    `;

    // Track map retry fallback
    const mapImg = document.getElementById('rw-track-map');
    if (mapImg && mapSrc && mapSrc.startsWith('http')) {
      let retries = 0;
      mapImg.onerror = () => {
        if (retries < 2) {
          retries += 1;
          setTimeout(() => {
            mapImg.src = `${mapSrc}${mapSrc.includes('?') ? '&' : '?'}r=${retries}`;
          }, 250 * retries);
        }
      };
    }

    // Bind stage switchers
    const tabQ = document.getElementById('tab-quali-btn');
    const tabG = document.getElementById('tab-gp-btn');
    if (tabQ) tabQ.onclick = () => { validationErr = ''; sessionStage = 'qualifying'; draw(); };
    if (tabG) tabG.onclick = () => { validationErr = ''; sessionStage = 'gp'; draw(); };

    const rndSwitch = document.getElementById('rw-round-switcher');
    if (rndSwitch) {
      rndSwitch.onchange = () => {
        if (rndSwitch.value) render(root, +rndSwitch.value);
      };
    }

    const s2Btn = document.getElementById('rw-open-s2-btn');
    if (s2Btn) {
      s2Btn.onclick = () => openSeason2TransitionModal(() => render(root));
    }

    if (sessionStage === 'qualifying') {
      bindQualifyingEvents();
    } else {
      bindGrandPrixEvents();
    }
  };

  function captureQualiInputs() {
    root.querySelectorAll('[data-q-time]').forEach(inp => {
      qualiTimeMap[inp.dataset.qTime] = inp.value.trim();
    });
  }

  function bindQualifyingEvents() {
    const gridOnlyChk = document.getElementById('quali-gridonly-chk');
    if (gridOnlyChk) {
      gridOnlyChk.onchange = () => {
        captureQualiInputs();
        qualiGridOnly = gridOnlyChk.checked;
        draw();
      };
    }

    const fillTimesBtn = document.getElementById('quali-fill-times-btn');
    if (fillTimesBtn) {
      fillTimesBtn.onclick = () => {
        captureQualiInputs();
        const ordered = [...activeDrivers(s)].sort((a, b) => (qualiPosMap[a.id] || 99) - (qualiPosMap[b.id] || 99));
        ordered.forEach((d, idx) => {
          qualiTimeMap[d.id] = generateBaselineLapTime(race, idx);
        });
        draw();
      };
    }

    const resetPerfBtn = document.getElementById('quali-reset-perf-btn');
    if (resetPerfBtn) {
      resetPerfBtn.onclick = () => {
        captureQualiInputs();
        defaultPerformanceOrder(s).forEach((d, idx) => {
          qualiPosMap[d.id] = idx + 1;
        });
        draw();
      };
    }

    // Position dropdown change -> automatically swap with the driver currently holding that slot
    root.querySelectorAll('[data-q-pos]').forEach(sel => {
      sel.onchange = () => {
        captureQualiInputs();
        const drvId = sel.dataset.qPos;
        const newPos = +sel.value;
        const oldPos = qualiPosMap[drvId];
        const otherDrv = activeDrivers(s).find(d => d.id !== drvId && qualiPosMap[d.id] === newPos);
        if (otherDrv && oldPos) {
          qualiPosMap[otherDrv.id] = oldPos;
        }
        qualiPosMap[drvId] = newPos;
        draw();
      };
    });

    // Up / Down row move buttons
    root.querySelectorAll('[data-q-move]').forEach(btn => {
      btn.onclick = () => {
        captureQualiInputs();
        const [drvId, dirStr] = btn.dataset.qMove.split(':');
        const dir = +dirStr;
        const ordered = [...activeDrivers(s)].sort((a, b) => (qualiPosMap[a.id] || 99) - (qualiPosMap[b.id] || 99));
        const idx = ordered.findIndex(d => d.id === drvId);
        const swapIdx = idx + dir;
        if (swapIdx >= 0 && swapIdx < ordered.length) {
          const temp = ordered[idx];
          ordered[idx] = ordered[swapIdx];
          ordered[swapIdx] = temp;
          ordered.forEach((d, i) => { qualiPosMap[d.id] = i + 1; });
          draw();
        }
      };
    });

    const handleSkipQuali = () => {
      logQualifying(s, race.round, { skipped: true, gridOnly: false, order: [], times: {} });
      save();
      validationErr = '';
      feedbackBanner = {
        title: `Round ${race.round} Qualifying Session Skipped`,
        body: `Proceeded directly to the ${race.gp} Grand Prix classification screen.`
      };
      sessionStage = 'gp';
      draw();
    };

    const skipBtn1 = document.getElementById('quali-skip-top-btn');
    const skipBtn2 = document.getElementById('quali-skip-btn');
    if (skipBtn1) skipBtn1.onclick = handleSkipQuali;
    if (skipBtn2) skipBtn2.onclick = handleSkipQuali;

    const saveQualiBtn = document.getElementById('quali-save-btn');
    if (saveQualiBtn) {
      saveQualiBtn.onclick = () => {
        captureQualiInputs();
        const seenPos = new Set();
        for (const d of activeDrivers(s)) {
          const p = qualiPosMap[d.id];
          if (!p || p < 1 || p > 24 || seenPos.has(p)) {
            validationErr = `Every driver must have a unique Qualifying Grid Position from P1 to P24.`;
            draw();
            return;
          }
          seenPos.add(p);
          if (!qualiGridOnly && !qualiTimeMap[d.id]) {
            validationErr = `Missing Qualifying lap time for #${d.no} ${d.name}. Enter a lap time, click "Pre-Fill Sample Lap Times", or check "Log Grid Positions Only (No Qualifying Lap Time Data Recorded)".`;
            draw();
            return;
          }
        }

        const orderedIds = [...activeDrivers(s)]
          .sort((a, b) => qualiPosMap[a.id] - qualiPosMap[b.id])
          .map(d => d.id);

        logQualifying(s, race.round, {
          skipped: false,
          gridOnly: qualiGridOnly,
          order: orderedIds,
          times: qualiTimeMap
        });
        // Pre-populate Grand Prix order from the newly logged Qualifying grid if GP isn't logged yet
        if (!s.results?.[race.round]) {
          orderedIds.forEach((id, idx) => { gpPosMap[id] = idx + 1; });
        }
        save();
        validationErr = '';
        const poleDrv = driverById(orderedIds[0], s);
        feedbackBanner = {
          title: `Qualifying Session Logged — Pole Position: ${poleDrv ? poleDrv.name : 'P1'}${qualiTimeMap[orderedIds[0]] ? ` (${qualiTimeMap[orderedIds[0]]})` : ''}`,
          body: `24-driver starting grid saved. You are now on the Grand Prix screen — log the race results below whenever you finish the race in Monoposto.`
        };
        sessionStage = 'gp';
        draw();
      };
    }
  }

  function captureGpInputs() {
    const condEl = document.getElementById('log-cond');
    if (condEl) conditions = condEl.value;
    root.querySelectorAll('[data-gp-gap]').forEach(inp => {
      gpGapMap[inp.dataset.gpGap] = inp.value.trim();
    });
  }

  function bindGrandPrixEvents() {
    const syncLapsUI = () => {
      const d = (laps * race.lapKm).toFixed(1);
      document.getElementById('lap-val').textContent = laps + ' laps';
      document.getElementById('lap-dist').textContent = d + ' km';
      document.getElementById('chip-laps').textContent = laps;
      document.getElementById('chip-dist').textContent = d;
    };
    const lMinus = document.getElementById('lap-minus');
    const lPlus = document.getElementById('lap-plus');
    if (lMinus) lMinus.onclick = () => { laps = Math.max(5, laps - 1); syncLapsUI(); };
    if (lPlus) lPlus.onclick = () => { laps = Math.min(race.laps, laps + 1); syncLapsUI(); };

    const backQuali = document.getElementById('gp-back-quali-btn');
    if (backQuali) {
      backQuali.onclick = () => {
        captureGpInputs();
        validationErr = '';
        sessionStage = 'qualifying';
        draw();
      };
    }

    const copyQualiBtn = document.getElementById('gp-copy-quali-btn');
    if (copyQualiBtn) {
      copyQualiBtn.onclick = () => {
        captureGpInputs();
        const qOrder = (s.quali?.[race.round] || s.qualifying?.[race.round])?.order || [];
        if (qOrder.length === 24) {
          qOrder.forEach((id, idx) => { gpPosMap[id] = idx + 1; });
          draw();
        }
      };
    }

    const orderPerfBtn = document.getElementById('gp-order-perf-btn');
    if (orderPerfBtn) {
      orderPerfBtn.onclick = () => {
        captureGpInputs();
        defaultPerformanceOrder(s).forEach((d, idx) => { gpPosMap[d.id] = idx + 1; });
        draw();
      };
    }

    // Finishing position dropdown change -> swap cleanly if another driver holds that numeric position
    root.querySelectorAll('[data-gp-pos]').forEach(sel => {
      sel.onchange = () => {
        captureGpInputs();
        const drvId = sel.dataset.gpPos;
        const val = sel.value;
        const newPos = val === 'DNF' ? null : +val;
        const oldPos = gpPosMap[drvId];
        if (newPos !== null) {
          const otherDrv = activeDrivers(s).find(d => d.id !== drvId && gpPosMap[d.id] === newPos);
          if (otherDrv) {
            gpPosMap[otherDrv.id] = oldPos;
          }
        }
        gpPosMap[drvId] = newPos;
        draw();
      };
    });

    // Up / Down row move buttons in GP table
    root.querySelectorAll('[data-gp-move]').forEach(btn => {
      btn.onclick = () => {
        captureGpInputs();
        const [drvId, dirStr] = btn.dataset.gpMove.split(':');
        const dir = +dirStr;
        const rows = [...activeDrivers(s)].sort((a, b) => {
          const pA = gpPosMap[a.id] === null ? 99 : (gpPosMap[a.id] || 99);
          const pB = gpPosMap[b.id] === null ? 99 : (gpPosMap[b.id] || 99);
          return pA - pB;
        });
        const idx = rows.findIndex(d => d.id === drvId);
        const swapIdx = idx + dir;
        if (swapIdx >= 0 && swapIdx < rows.length) {
          const dA = rows[idx], dB = rows[swapIdx];
          const posA = gpPosMap[dA.id], posB = gpPosMap[dB.id];
          gpPosMap[dA.id] = posB;
          gpPosMap[dB.id] = posA;
          draw();
        }
      };
    });

    // Fastest Lap toggle
    root.querySelectorAll('[data-gp-fl]').forEach(btn => {
      btn.onclick = () => {
        captureGpInputs();
        const id = btn.dataset.gpFl;
        fastestLapId = fastestLapId === id ? null : id;
        draw();
      };
    });

    // Save full 24-driver Grand Prix classification
    const saveGpBtn = document.getElementById('gp-save-btn');
    if (saveGpBtn) {
      saveGpBtn.onclick = () => {
        captureGpInputs();
        const usedPositions = new Set();
        for (const d of activeDrivers(s)) {
          const p = gpPosMap[d.id];
          if (p !== null) {
            if (p < 1 || p > 24 || usedPositions.has(p)) {
              validationErr = `Duplicate finishing position P${p} detected. Each classified finisher must have a unique position (or DNF).`;
              draw();
              return;
            }
            usedPositions.add(p);
          }
        }

        const out = logResult(s, race.round, { ...gpPosMap }, conditions, laps, {
          gaps: { ...gpGapMap },
          fastestLap: fastestLapId
        });
        save();
        refreshHUD();
        validationErr = '';

        const [myD1, myD2] = driversOfTeam(s.teamId, s);
        const p1Str = myD1 ? (gpPosMap[myD1.id] ? `P${gpPosMap[myD1.id]}` : 'DNF') : '—';
        const p2Str = myD2 ? (gpPosMap[myD2.id] ? `P${gpPosMap[myD2.id]}` : 'DNF') : '—';
        const fanSign = out.fanDelta >= 0 ? `+${out.fanDelta}` : `${out.fanDelta}`;
        const shiftText = out.driverShifts?.length
          ? `<br><b>Driver Form/Risk Shifts (${out.driverShifts.length}):</b> ${out.driverShifts.map(sh => `${sh.driver.last} (${sh.reason})`).join(' · ')}`
          : '';
        const atrText = out.atrResetTable
          ? `<br><b style="color:var(--gold)">★ FIA ATR Wind Tunnel Reset Applied (Round ${race.round}):</b> All 12 constructors' wind-tunnel multipliers updated based on live Constructors' Standings.`
          : '';
        const nextR = nextUnloggedRace(s);

        feedbackBanner = {
          title: `Round ${race.round} ${race.gp} Logged — +${fmt$(out.cashGainedM)} Prize Purse · +${out.rpGained} Telemetry RP · Fan Rating ${fanSign}`,
          body: `${myD1 ? myD1.last : 'Car #1'}: <b>${p1Str}</b> · ${myD2 ? myD2.last : 'Car #2'}: <b>${p2Str}</b> · Team Points Scored: <b>+${out.rewards.playerPointsScored} PTS</b> · Sponsor Goal: <b>${out.rewards.sponsorGoalPassed ? `PASSED (+${fmt$(out.rewards.sponsorGoalCashM)})` : 'Missed'}</b>${shiftText}${atrText}`,
          nextCta: nextR ? `RETURN TO TEAM HQ & ADVANCE CALENDAR TO ROUND ${nextR.round} (${nextR.gp.toUpperCase()}) →` : ''
        };

        draw();
        if (race.round === 22 && (s.season || 1) === 1) {
          openSeason2TransitionModal(() => render(root));
        }
      };
    }
  }

  draw();
}
