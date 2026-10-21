// CHAMPIONSHIP MATRIX — the desktop championship tracker (all 12 teams).
// This is the neutral league layer, separate from the player's Team HQ:
// it renders ONLY from the canon data tables + the live save (points,
// results, player DP). Nothing here is typed in by hand. Driver faces are
// not used — a number tile in team colour stands in for the portrait.
import { TEAMS, DRIVERS, driversOfTeam, teamById, logoOf } from '../data/teamsAndDrivers.js?v=20261022b';
import { CALENDAR } from '../data/calendar2026.js?v=20261022b';
import { getState, playerTeam, truePower } from '../engine/store.js?v=20261022b';
import { constructorStandings } from '../engine/raceSimulator.js?v=20261022b';
import { contractWindowReport } from '../engine/driverMarketEngine.js?v=20261022b';
import { prettyDate } from '../engine/timeEngine.js?v=20261022b';

const ATR_MILESTONES = [
  { round: 7,  label: 'Next ATR Restriction Phase' },
  { round: 14, label: 'Second ATR Phase' },
  { round: 16, label: 'Regulation Reset · Major Update Expected' }
];
// Canon reserve pool (SPEC §6, Rule 3) — backmarker/midfield seats fill from here.
const RESERVE_POOL = ['T. Pourchaire', 'F. Vesti', 'P. Aron'];

function logoHTML(team) {
  const src = logoOf(team);
  if (!src) return `<span class="mx-wordmark" style="color:${team.color}">${team.short}</span>`;
  return `<span class="mx-logos"><img class="mx-logo" src="${src}" alt="${team.name} logo"></span>`;
}

// Form comes from the driver's last LOGGED finish — nothing else. A driver
// with no result in the save has no form to show, whatever the points table
// ordering happens to look like.
function lastFinish(state, driverId) {
  const rounds = Object.keys(state.results).map(Number).sort((a, b) => b - a);
  for (const r of rounds) {
    const entries = state.results[r].entries || {};
    if (driverId in entries) return { round: r, pos: entries[driverId] }; // pos null = DNF
  }
  return null;
}

function statusFor(driver, report, state) {
  const hit = report.find(r => r.driver.id === driver.id);
  if (hit && hit.rule === 1) return { label: 'Retirement Watch', cls: 'bad' };
  if (hit && hit.rule === 2) return { label: 'Hot Seat', cls: 'bad' };
  const lf = lastFinish(state, driver.id);
  if (!lf) return { label: 'Season Start', cls: '' };
  if (!lf.pos) return { label: 'DNF — Last Race', cls: 'bad' };
  if (lf.pos <= 3) return { label: 'Peak Form', cls: 'good' };
  if (lf.pos <= 10) return { label: 'Consistent', cls: 'good' };
  return { label: 'Stable', cls: '' };
}

function driverCell(driver, report, state) {
  const team = teamById(driver.team);
  const st = statusFor(driver, report, state);
  return `<div class="mx-driver">
    <span class="mx-num" style="background:${team.color}">${driver.no}</span>
    <span class="mx-dmeta">
      <span class="mx-dname"><span class="fn">${driver.first}</span> <span class="ln">${driver.last}</span></span>
      <span class="mx-dstats">SPD <b>${driver.speed}</b> · RSK <b>${driver.risk}</b> · <span class="mx-status ${st.cls}">${st.label}</span></span>
    </span>
  </div>`;
}

export function render(root) {
  const s = getState();
  const me = playerTeam();
  const loggedRounds = Object.keys(s.results).length;
  const currentRound = Math.min(22, loggedRounds + 1);
  const race = CALENDAR.find(r => r.round === currentRound);
  // "Next round" IS the current unlogged round — the same one the header
  // shows. (Deriving it from the calendar date instead made the panel jump
  // a round ahead of the header whenever the save's date had advanced.)
  const next = race;
  const constructors = constructorStandings(s);
  const ctorPts = new Map(constructors.map(c => [c.team.id, c.points]));
  const { report } = contractWindowReport(s);

  // Matrix order: performance order (Car Power, then combined driver speed).
  const speedSum = t => driversOfTeam(t.id).reduce((a, d) => a + d.speed, 0);
  const ordered = [...TEAMS].sort((a, b) => b.carPower - a.carPower || speedSum(b) - speedSum(a));

  // R&D progress to next Monoposto level: the player team's is the live
  // fractional true power; other teams show their tracked DP when the save
  // carries it (state.teamDp), otherwise their season-start baseline.
  const progressOf = t => {
    if (t.id === s.teamId) return Math.round((truePower() % 1) * 100);
    const dp = (s.teamDp && s.teamDp[t.id]) || 0;
    return Math.round((dp % 100 + 100) % 100);
  };
  const powerOf = t => (t.id === s.teamId ? Math.floor(truePower()) : t.carPower + Math.floor(((s.teamDp && s.teamDp[t.id]) || 0) / 100));

  // Required in-game changes: any driver/team whose tracked value no longer
  // matches its Monoposto integer (today: the player team's car power).
  const changes = [];
  if (Math.floor(truePower()) !== me.carPower) {
    changes.push({ team: me, label: 'Car Power', from: me.carPower, to: Math.floor(truePower()) });
  }

  const atrCards = ATR_MILESTONES.map(m => {
    const r = CALENDAR.find(x => x.round === m.round);
    const toGo = Math.max(0, m.round - currentRound);
    return `<div class="mx-atr-card">
      <div class="mx-atr-round">ROUND ${m.round}</div>
      <div class="mx-atr-gp">${r.flag} ${r.country.toUpperCase()}</div>
      <div class="mx-atr-big">${toGo}</div>
      <div class="mx-atr-lbl">ROUNDS TO GO</div>
      <div class="mx-atr-note">» ${m.label}</div>
    </div>`;
  }).join('');

  const retirees = report.filter(r => r.rule === 1);
  const hotSeat = report.filter(r => r.rule === 2);
  const anyPoints = Object.values(s.points).some(p => p > 0);
  const radarList = (list, empty) => list.length
    ? list.map(r => `<div class="mx-radar-row"><span class="mx-num sm" style="background:${r.team.color}">${r.driver.no}</span><span class="mx-radar-name"><span class="fn">${r.driver.first}</span> <span class="ln">${r.driver.last}</span><small>${r.team.name} · ${r.reason}</small></span>${r.risk ? `<span class="mx-risk">${r.risk}%</span>` : ''}</div>`).join('')
    : `<div class="mx-radar-empty">${empty}</div>`;

  root.innerHTML = `<div class="mx-wrap">
    <div class="mx-head">
      <div>
        <h1 class="mx-title">12 TEAMS &amp; 24 DRIVERS — PERFORMANCE MATRIX</h1>
        <div class="mx-sub">MONOPOSTO CAR POWER &nbsp;|&nbsp; R&amp;D DEVELOPMENT &nbsp;|&nbsp; DRIVER SLIDERS &nbsp;|&nbsp; FORM &amp; STATUS</div>
      </div>
      <div class="mx-roundbox">
        <div class="mx-round">ROUND ${race.round}<span>/22</span></div>
        <div class="mx-gp">${race.flag} ${race.country.toUpperCase()} — ${race.circuit.toUpperCase()}</div>
        <a class="btn primary small mx-logbtn" href="#/race">+ LOG RACE RESULT</a>
      </div>
    </div>

    <div class="mx-grid">
      <section class="mx-panel mx-matrix">
        <div class="mx-filterrow">
          <span class="mx-chip on">ALL 12 TEAMS</span>
          <span class="mx-chip">MONOPOSTO 1–10 SLIDERS</span>
          <span class="mx-chip">R&amp;D DEVELOPMENT PROGRESS</span>
          <a class="mx-chip link" href="#/devgraph">BASELINE DEV GRAPH →</a>
        </div>
        <table class="mx-table">
          <thead><tr>
            <th>POS</th><th>TEAM</th>
            <th class="c">MONOPOSTO<br>CAR POWER (1–10)</th>
            <th>R&amp;D PROGRESS<br>TO NEXT LEVEL</th>
            <th>DRIVER 1 <span class="mx-th-sub">SPD&nbsp;&nbsp;RSK&nbsp;&nbsp;FORM / STATUS</span></th>
            <th>DRIVER 2 <span class="mx-th-sub">SPD&nbsp;&nbsp;RSK&nbsp;&nbsp;FORM / STATUS</span></th>
          </tr></thead>
          <tbody>
          ${ordered.map((t, i) => {
            const [d1, d2] = driversOfTeam(t.id);
            const pct = progressOf(t);
            return `<tr class="${t.id === s.teamId ? 'me' : ''}">
              <td class="mx-pos">${i + 1}</td>
              <td><div class="mx-team"><span class="mx-colorbar" style="background:${t.color}"></span>${logoHTML(t)}<span class="mx-tname">${t.name.toUpperCase()}</span></div></td>
              <td class="c"><span class="mx-power" style="border-color:${t.color}">${powerOf(t)}</span></td>
              <td><div class="mx-prog"><span class="mx-track"><span class="mx-fill" style="width:${pct}%;background:${t.color}"></span></span><b>${pct}%</b></div></td>
              <td>${driverCell(d1, report, s)}</td>
              <td>${driverCell(d2, report, s)}</td>
            </tr>`;
          }).join('')}
          </tbody>
        </table>

        <div class="mx-bottomrow">
          <div class="mx-mini">
            <div class="mx-mini-title">CONSTRUCTORS' CHAMPIONSHIP</div>
            <div class="mx-ctor">
              ${constructors.map((c, i) => `<div class="mx-ctor-row ${c.team.id === s.teamId ? 'me' : ''}"><span>${i + 1}</span>${logoHTML(c.team)}<span class="mx-ctor-name">${c.team.name.toUpperCase()}</span><b>${c.points}</b></div>`).join('')}
            </div>
          </div>
          <div class="mx-mini mx-next">
            <div class="mx-mini-title">NEXT ROUND</div>
            <div class="mx-next-round">ROUND ${next.round}</div>
            <div class="mx-next-gp">${next.flag} ${next.country.toUpperCase()}</div>
            <div class="mx-next-circuit">${next.circuit.toUpperCase()}</div>
            <div class="mx-next-meta">${next.laps} LAPS &nbsp;·&nbsp; ${next.lapKm.toFixed(3)} KM &nbsp;·&nbsp; ${(next.laps * next.lapKm).toFixed(1)} KM</div>
            <div class="mx-next-meta">${prettyDate(next.sun).toUpperCase()} 2026</div>
            <a class="btn small" href="#/race">OPEN RACE WEEKEND →</a>
          </div>
        </div>
      </section>

      <aside class="mx-rail">
        <div class="mx-panel mx-required">
          <div class="mx-rail-title">⚠ REQUIRED MONOPOSTO IN-GAME CHANGES<br>BEFORE NEXT RACE</div>
          ${changes.length
            ? `<div class="mx-badge">${changes.length} CHANGE${changes.length === 1 ? '' : 'S'} REQUIRED</div>` +
              changes.map(c => `<div class="mx-change-row">${logoHTML(c.team)}<span class="mx-change-name">${c.team.name.toUpperCase()}</span><span class="mx-change-what">Car Power</span><b>${c.from} → ${c.to}</b></div>`).join('')
            : `<div class="mx-nochange">No changes required — every Monoposto value already matches the tracker. Development and logged results create the change list here.</div>`}
          <div class="mx-rail-note">Update these exact values in the Monoposto mobile game.</div>
        </div>

        <div class="mx-panel">
          <div class="mx-rail-title">FIA ATR WIND TUNNEL RESET &amp; REGULATION TRACKER</div>
          <div class="mx-rail-note">Aerodynamic Testing Restrictions (ATR) and Regulation Changes</div>
          <div class="mx-atr">${atrCards}</div>
        </div>

        <div class="mx-panel">
          <div class="mx-rail-title">CONTRACT RADAR</div>
          <div class="mx-rail-note">24 DRIVERS — CONTRACT STATUS &amp; AUTOMATED TRIGGERS (PRESTIGE RULES, NEVER A LOTTERY)</div>
          <div class="mx-radar-cols">
            <div>
              <div class="mx-radar-h bad">● RETIREMENT WATCH</div>
              <div class="mx-radar-sub">RULE 1 — age 35+ AND (car Power &lt; 6 OR outside the Top 10 at Abu Dhabi) → retirement roll at the % shown</div>
              ${radarList(retirees, 'No veteran meets the Rule 1 triggers.')}
            </div>
            <div>
              <div class="mx-radar-h warn">● HOT SEAT / SACK RISK</div>
              <div class="mx-radar-sub">RULE 2 — under 35% of your teammate's points → seat terminated</div>
              ${radarList(hotSeat, anyPoints ? 'Nobody is below the 35% line.' : 'No points logged yet — Rule 2 arms once results are in.')}
            </div>
            <div>
              <div class="mx-radar-h info">● RESERVE POOL</div>
              <div class="mx-radar-sub">RULE 3 — Power 4–5 seats fill from this pool; top seats (Power 7–9) need Speed 8+ or a 20+ pt win over a teammate</div>
              ${RESERVE_POOL.map(n => `<div class="mx-radar-row"><span class="mx-radar-name"><span class="ln">${n.toUpperCase()}</span><small>F2 / reserve pool · potential 2027+ seat</small></span></div>`).join('')}
            </div>
          </div>
          <a class="btn primary mx-simbtn" href="#/market">OPEN DRIVER MARKET →</a>
        </div>

        <div class="mx-panel mx-hqcta">
          <div class="mx-rail-title">${me.name.toUpperCase()} — TEAM HQ</div>
          <div class="mx-rail-note">Your team layer is separate from this tracker: cash, RP, facilities, parts and sponsors live in HQ.</div>
          <a class="btn mx-hqbtn" href="#/hq">GO TO TEAM HQ →</a>
        </div>
      </aside>
    </div>
  </div>`;
}
