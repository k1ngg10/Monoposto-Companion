// RACE WEEKEND — renders entirely from the calendar row + the save.
// Race length is selectable; distance = laps × lap length, computed live.
// Results are logged AFTER the game is played — the app never dictates them.
import { CALENDAR } from '../data/calendar2026.js?v=20261022b';
import { TRACK_MAPS } from '../data/trackMaps.js?v=20261022b';
import { driversOfTeam } from '../data/teamsAndDrivers.js?v=20261022b';
import { getState, save } from '../engine/store.js?v=20261022b';
import { logResult } from '../engine/raceSimulator.js?v=20261022b';
import { prettyDate } from '../engine/timeEngine.js?v=20261022b';
import { topbarHTML } from './shared.js?v=20261022b';

function rangeLabel(race) {
  const sat = prettyDate(race.sat), sun = prettyDate(race.sun);
  const sParts = sat.split(' '), uParts = sun.split(' ');
  if (sParts[1] === uParts[1]) return `${sParts[0].replace(/\D/g, '')}–${uParts[0].replace(/\D/g, '')} ${uParts[1]}`;
  return `${sat} – ${sun}`;
}
const posOptions = sel => {
  let h = '';
  for (let p = 1; p <= 24; p++) h += `<option value="${p}" ${sel === p ? 'selected' : ''}>P${p}</option>`;
  h += `<option value="" ${!sel ? 'selected' : ''}>DNF</option>`;
  return h;
};

// The side ribbon from the original Race Weekend prototype (user asked for
// it back, 2026-10-21): a fixed rainbow-gradient strip down the left edge
// with a slow-rising vertical "RACE WEEKEND" marquee.
const ribbonHTML = () => {
  const grp = `<div class="rw-grp">${'<span>Race Weekend</span>'.repeat(5)}</div>`;
  return `<div class="rw-sidebar"><div class="rw-marquee">${grp}${grp}</div></div>`;
};

export function render(root) {
  root.style.paddingLeft = 'clamp(42px, 7vw, 64px)';   // room for the ribbon; main.js resets on route change
  const s = getState();
  const race = CALENDAR.find(r => !s.results[r.round] && r.sun >= s.date) || CALENDAR.find(r => !s.results[r.round]);
  if (!race) {
    root.innerHTML = `${ribbonHTML()}${topbarHTML(true)}<h1 class="page">SEASON COMPLETE</h1>
      <div class="sub">All 22 rounds are logged. Final tables are in Standings; the contract window resolves in Driver Market.</div>`;
    return;
  }
  const [d1, d2] = driversOfTeam(s.teamId);
  const logged = s.results[race.round];
  let laps = logged?.laps || race.laps;

  let selectedRound = race.round;

  const draw = msg => {
    const curRace = CALENDAR.find(r => r.round === selectedRound) || race;
    const curLogged = s.results[curRace.round];
    if (typeof draw.lastRound !== 'number' || draw.lastRound !== curRace.round) {
      laps = curLogged?.laps || curRace.laps;
      draw.lastRound = curRace.round;
    }
    const mapSrc = curRace.map || TRACK_MAPS[curRace.round] || null;
    const dist = (laps * curRace.lapKm).toFixed(1);
    root.innerHTML = `
      ${ribbonHTML()}
      ${topbarHTML(true)}
      <div class="hero">
        <div class="eyebrow">Season 1 · Round ${curRace.round} of 22</div>
        <h1 class="page" style="font-size:clamp(2rem,6vw,3.4rem)">RACE WEEKEND</h1>
        <div class="circuit"><span style="font-size:1.25rem;vertical-align:-2px;margin-right:8px">${curRace.flag}</span>${curRace.circuit.toUpperCase()} — ${curRace.gp.toUpperCase()}</div>
        <div style="margin:12px auto 0;max-width:420px;display:flex;align-items:center;justify-content:center;gap:10px">
          <label for="rw-round-sel" style="font-family:'F1DisplayBold',sans-serif;font-size:.7rem;letter-spacing:.12em;color:var(--dim)">CIRCUIT / ROUND</label>
          <select id="rw-round-sel" style="flex:1;max-width:300px">
            ${CALENDAR.map(r => `<option value="${r.round}" ${r.round === curRace.round ? 'selected' : ''}>R${r.round} · ${r.flag} ${r.gp} (${r.circuit})${s.results[r.round] ? ' ✓' : ''}</option>`).join('')}
          </select>
        </div>
        ${mapSrc ? `<div class="trackframe"><img src="${mapSrc}" alt="${curRace.circuit} — official F1 track map" referrerpolicy="no-referrer"></div>` : ''}
        <div class="chips">
          <span class="mchip"><b>${rangeLabel(curRace)}</b></span>
          <span class="mchip">Lap <b>${curRace.lapKm.toFixed(3)}</b> km</span>
          <span class="mchip"><b id="chip-laps">${laps}</b> laps · <b id="chip-dist">${dist}</b> km</span>
        </div>
      </div>
      <div class="panel">
        <h2>THE WEEKEND — ${curRace.gp.toUpperCase()}</h2>
        <div class="lapsrow">
          <span class="lk">Race length</span>
          <div class="stepper"><button id="lap-minus" aria-label="Fewer laps">−</button><span class="lv" id="lap-val">${laps} laps</span><button id="lap-plus" aria-label="More laps">+</button></div>
          <span class="ld">Race distance <b id="lap-dist">${dist} km</b></span>
        </div>
        <div class="objectives"><b>WEEKEND OBJECTIVES</b> — drawn at random each weekend (pool of 10–15, 2–3 shown). The objectives system lands in a later build step.</div>
        ${curLogged ? `<div class="banner" style="margin-top:16px"><div class="bt">Result already logged</div>
          <div class="bs">Car #${d1.no}: ${curLogged.entries[d1.id] ? 'P' + curLogged.entries[d1.id] : 'DNF'} · Car #${d2.no}: ${curLogged.entries[d2.id] ? 'P' + curLogged.entries[d2.id] : 'DNF'} · ${curLogged.laps} laps · ${curLogged.conditions}. Logging again replaces it.</div></div>` : ''}
        <div class="logform">
          <div class="fld"><label>Car #${d1.no} ${d1.last} — finish</label><select id="log-a">${posOptions(curLogged?.entries[d1.id])}</select></div>
          <div class="fld"><label>Car #${d2.no} ${d2.last} — finish</label><select id="log-b">${posOptions(curLogged?.entries[d2.id])}</select></div>
          <div class="fld"><label>Actual conditions</label><select id="log-cond">
            <option ${curLogged?.conditions === 'Dry' ? 'selected' : ''}>Dry</option>
            <option ${curLogged?.conditions === 'Less wet — inters' ? 'selected' : ''}>Less wet — inters</option>
            <option ${curLogged?.conditions === 'Full wet' ? 'selected' : ''}>Full wet</option></select></div>
          <button class="btn primary small" id="log-save" style="padding:12px 22px">LOG RESULTS</button>
        </div>
        ${msg ? `<div class="banner blue" style="margin-top:16px"><div class="bt">Logged</div><div class="bs">${msg}</div></div>` : ''}
        <div class="foot">Run the weekend in Monoposto first, then log what actually happened. Full-grid result entry arrives with the standings build-out; the economy reads your two cars.</div>
      </div>`;
    const rSel = document.getElementById('rw-round-sel');
    if (rSel) {
      rSel.onchange = e => {
        selectedRound = +e.target.value;
        draw();
      };
    }
    const sync = () => {
      const d = (laps * curRace.lapKm).toFixed(1);
      document.getElementById('lap-val').textContent = laps + ' laps';
      document.getElementById('lap-dist').textContent = d + ' km';
      document.getElementById('chip-laps').textContent = laps;
      document.getElementById('chip-dist').textContent = d;
    };
    document.getElementById('lap-minus').onclick = () => { laps = Math.max(5, laps - 1); sync(); };
    document.getElementById('lap-plus').onclick = () => { laps = Math.min(curRace.laps, laps + 1); sync(); };
    document.getElementById('log-save').onclick = () => {
      const va = document.getElementById('log-a').value, vb = document.getElementById('log-b').value;
      const entries = { [d1.id]: va ? +va : null, [d2.id]: vb ? +vb : null };
      const cond = document.getElementById('log-cond').value;
      const { rpGained } = logResult(s, curRace.round, entries, cond, laps);
      save();
      draw(`Car #${d1.no}: ${entries[d1.id] ? 'P' + entries[d1.id] : 'DNF'} · Car #${d2.no}: ${entries[d2.id] ? 'P' + entries[d2.id] : 'DNF'} · ${laps} laps (${(laps * curRace.lapKm).toFixed(1)} km) · ${cond} · +${rpGained} RP race income.`);
    };
  };
  draw();
}
