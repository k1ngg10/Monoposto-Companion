// HQ DASHBOARD — the advance-time agenda (SPEC §4).
// The agenda is generated from the save: player tasks surface ~7 days out,
// fire on their date, and leave. Fixtures: Monday tick + race weekends.
import { getState, truePower, monopostoPower, wipe, exportJSON, importJSON } from '../engine/store.js';
import { advance, agenda, prettyDate, fromISO } from '../engine/timeEngine.js';
import { nextRace, CALENDAR } from '../data/calendar2026.js';
import { topbarHTML, refreshHUD, floater, fmt$ } from './shared.js';

let running = false, timer = null;
const stop = () => { running = false; clearTimeout(timer); };

const GLYPH = { research: 'R', manufacture: 'D', facility: 'F', tick: 'W' };

function seasonLabel(s) {
  if (s.date < CALENDAR[0].sat) return 'Pre-season · 2026';
  const nr = nextRace(s.date);
  return `Season 1 · Round ${nr ? nr.round : 22} of 22`;
}
function dateParts(iso) {
  const pretty = prettyDate(iso);
  const [ord, ...rest] = pretty.split(' ');
  return { ord, month: rest.join(' ') };
}

export function render(root) {
  stop();
  const s = getState();
  const { ord, month } = dateParts(s.date);
  root.innerHTML = `
    ${topbarHTML()}
    <div style="max-width:340px">
      <div class="dateblock"><div class="bigdate" id="bigdate">${ord} <span>${month}</span></div></div>
      <div class="season" id="season-label">${seasonLabel(s)}</div>
    </div>
    <div class="stage" style="margin-top:22px">
      <div class="agenda glass">
        <div class="agenda-title">Coming up</div>
        <div class="node ctl"><div class="dot" style="border:none;background:none;box-shadow:none">
          <div class="ring" id="ring"><div class="inner">▶</div></div></div>
          <div class="ctl-label" id="ctl-label">ADVANCE TIME</div></div>
        <div id="nodes"></div>
        <div class="btnrow" style="margin:16px 0 8px">
          <button class="btn" id="advance">▶ ADVANCE</button>
        </div>
      </div>
      <div class="feed" id="feed">
        <div class="hint" id="hint">The agenda shows only what's within a week — longer work stays in the background queue and surfaces as its date approaches.<br><br>Hit <b>ADVANCE</b>: time rolls, events fire on their date, then leave the list.</div>
      </div>
    </div>
    <div class="foot">
      Car power — true value <b style="color:#fff">${truePower().toFixed(2)}</b> · Monoposto input <b style="color:#fff">${monopostoPower()}</b>
      (the game takes integers; the fraction is real progress).<br>
      Save tools: <a href="#" id="exp">Export JSON</a> · <a href="#" id="imp">Import JSON</a> · <a href="#" id="wipe">Delete save</a>
      <input type="file" id="impfile" accept=".json" style="display:none">
    </div>`;

  renderAgenda();
  updateRing();

  const btn = root.querySelector('#advance');
  btn.onclick = () => {
    if (running) { stop(); btn.textContent = '▶ ADVANCE'; btn.classList.remove('stop'); setCtl('ADVANCE TIME'); return; }
    running = true; btn.textContent = '■ STOP'; btn.classList.add('stop'); setCtl('STOP ADVANCING');
    timer = setTimeout(stepDay, 160);
  };
  root.querySelector('#exp').onclick = e => {
    e.preventDefault();
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'monoposto-save.json'; a.click();
  };
  const impFile = root.querySelector('#impfile');
  root.querySelector('#imp').onclick = e => { e.preventDefault(); impFile.click(); };
  impFile.onchange = () => {
    const f = impFile.files[0]; if (!f) return;
    f.text().then(t => { try { importJSON(t); location.reload(); } catch { alert('That file is not a valid save.'); } });
  };
  root.querySelector('#wipe').onclick = e => {
    e.preventDefault();
    if (confirm('Delete this championship save? This cannot be undone.')) { wipe(); location.hash = '#/start'; location.reload(); }
  };

  function setCtl(t) { const el = document.getElementById('ctl-label'); if (el) el.textContent = t; }
  function updateRing() {
    const st = getState();
    const race = nextRace(st.date);
    const ring = document.getElementById('ring');
    if (!ring) return;
    if (!race) { ring.style.setProperty('--p', '100%'); return; }
    const start = fromISO('2026-02-20'), now = fromISO(st.date), target = fromISO(race.sat);
    ring.style.setProperty('--p', Math.min(100, Math.max(0, (now - start) / (target - start) * 100)) + '%');
  }
  function renderAgenda() {
    const st = getState();
    const box = document.getElementById('nodes');
    if (!box) return;
    const items = agenda(st);
    box.innerHTML = items.map((it, i) => `
      <div class="node ${it.kind === 'race' ? 'race' : ''} ${i === items.length - 1 ? 'last' : ''}">
        <div class="dot ${it.kind === 'race' ? 'flag' : ''}">${it.kind === 'race' ? it.race.flag : GLYPH[it.kind] || '•'}</div>
        <span class="when">${dateParts(it.date).ord}</span><span class="what">${it.title}</span>
        <div class="lbl">${it.label || ''}</div>
      </div>`).join('') || '<div class="lbl" style="padding:10px 0 14px">Nothing in the next 7 days.</div>';
  }
  function feed(html) {
    const feedEl = document.getElementById('feed');
    const hint = document.getElementById('hint');
    if (hint) hint.remove();
    feedEl.insertAdjacentHTML('beforeend', html);
  }
  function fireEvent(ev) {
    if (ev.type === 'tick') {
      floater('hud-cash', `+${fmt$(ev.income)}`, 'pos');
      feed(`<div class="card pos"><div><div class="ct">Base Income</div><div class="cs">Sponsor weekly base — 40% bucket</div></div><div class="amt pos">+${fmt$(ev.income)}</div></div>`);
      feed(`<div class="card neg"><div><div class="ct">Running Costs</div><div class="cs">HQ running costs — rise with facility level</div></div><div class="amt neg">−${fmt$(ev.costs)}</div></div>`);
      feed(`<div class="card pos"><div><div class="ct">Weekly Resource Points</div><div class="cs">Facility generation · ATR applied</div></div><div class="amt pos">+${ev.rp} RP</div></div>`);
      floater('hud-rp', `+${ev.rp} RP`, 'pos');
    } else if (ev.type === 'research') {
      const cls = ev.outcome === 'failure' ? 'red' : ev.outcome === 'breakthrough' ? 'blue' : '';
      feed(`<div class="banner ${cls}"><div class="bt">${ev.title}</div><div class="bs">${ev.label}</div></div>`);
    } else if (ev.type === 'manufacture') {
      feed(`<div class="banner blue"><div class="bt">${ev.title}</div><div class="bs">${ev.label}</div></div>`);
    } else if (ev.type === 'facility') {
      feed(`<div class="banner"><div class="bt">Facility Improvement Completed</div><div class="bs">${ev.title} — ${ev.label}</div></div>`);
    } else if (ev.type === 'race') {
      feed(`<div class="banner blue"><div class="bt">Race Weekend — ${ev.race.gp}</div><div class="bs">${ev.race.circuit} · Round ${ev.race.round} of 22</div></div>
            <div class="card pos"><div><div class="ct">Race Weekend screen</div><div class="cs">Race length, objectives and result logging live here</div></div><a href="#/race" style="font-family:'F1DisplayBold';color:var(--gold);text-decoration:none">Open →</a></div>`);
    }
  }
  function stepDay() {
    if (!running) return;
    const st = getState();
    const fired = advance(st);
    const { ord: o2, month: m2 } = dateParts(st.date);
    const bd = document.getElementById('bigdate');
    if (bd) bd.innerHTML = `${o2} <span>${m2}</span>`;
    const sl = document.getElementById('season-label');
    if (sl) sl.textContent = seasonLabel(st);
    renderAgenda(); updateRing(); refreshHUD();
    for (const ev of fired) fireEvent(ev);
    if (fired.some(e => e.type === 'race')) {
      stop();
      btn.textContent = '▶ ADVANCE'; btn.classList.remove('stop'); setCtl('ADVANCE TIME');
      return;
    }
    if (!nextRace(st.date) && st.date > '2026-12-06') { stop(); btn.textContent = 'SEASON OVER'; btn.disabled = true; return; }
    timer = setTimeout(stepDay, 240);
  }
}
