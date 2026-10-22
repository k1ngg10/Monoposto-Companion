// Shared UI fragments — the HUD, top bar, Delete Championship confirmation modal,
// and Interactive Driver Dossier & Contract Negotiation Modal.
import { getState, playerTeam } from '../engine/store.js?v=20261022m';
import { driversOfTeam, teamById } from '../data/teamsAndDrivers.js?v=20261022m';
import { driverDossier, signDriverContract, isContractWindowOpen } from '../engine/driverMarketEngine.js?v=20261022m';

export const fmt$ = v => '$' + (+v).toFixed(2) + 'M';

export function hudHTML() {
  const s = getState(), t = playerTeam();
  return `<div class="hud">
    <div class="team" title="${t.hqFull || t.hq}">${t.name.toUpperCase()} <small style="font-size:.62rem;color:var(--dim);font-weight:400;margin-left:4px">· ${(t.hq || '').toUpperCase()}</small></div>
    <div class="cell"><div class="k">Cash</div><div class="v" id="hud-cash">${fmt$(s.cash)}</div></div>
    <div class="cell"><div class="k">Resource Points</div><div class="v rp" id="hud-rp">${s.rp}</div></div>
    <div class="cell"><div class="k">Fan Rating</div><div class="v" id="hud-fan">${s.fanRating}</div></div>
  </div>`;
}

export function brandHTML() {
  return `<div class="brand-identity">
    <img src="assets/logos/f1.svg" alt="Formula 1">
    <div class="bt"><b>Monoposto</b> · Companion HQ</div>
  </div>`;
}

export function topbarHTML(withBack = false) {
  const back = withBack ? `<a class="backlink" href="#/hq"><span class="icon-box"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></span><span>Team HQ</span></a>` : '';
  return `<div class="topbar"><div class="brandrow">${back}${brandHTML()}</div>${hudHTML()}</div>`;
}

export function refreshHUD() {
  const s = getState();
  const cash = document.getElementById('hud-cash'), rp = document.getElementById('hud-rp'), fan = document.getElementById('hud-fan');
  if (cash) cash.textContent = fmt$(s.cash);
  if (rp) rp.textContent = s.rp;
  if (fan) fan.textContent = s.fanRating;
}

export function floater(cellId, text, cls) {
  const cell = document.getElementById(cellId)?.parentElement;
  if (!cell) return;
  const f = document.createElement('div');
  f.className = 'delta ' + cls; f.textContent = text;
  cell.appendChild(f);
  setTimeout(() => f.remove(), 2300);
}

// In-app confirmation modal before deleting the championship save
export function openDeleteConfirmModal(onConfirm) {
  let existing = document.getElementById('delete-confirm-backdrop');
  if (existing) existing.remove();

  let teamName = 'Current Team';
  let seasonNum = 1;
  try {
    const s = getState();
    const t = playerTeam();
    if (t && t.name) teamName = t.name;
    if (s && s.season) seasonNum = s.season;
  } catch {
    // ignore if no save
  }

  const backdrop = document.createElement('div');
  backdrop.id = 'delete-confirm-backdrop';
  backdrop.className = 'del-modal-backdrop';
  backdrop.innerHTML = `
    <div class="del-modal-box" role="dialog" aria-modal="true" aria-labelledby="del-modal-title">
      <div class="del-modal-eyebrow">CAREER SAVE MANAGEMENT</div>
      <h2 class="del-modal-title" id="del-modal-title">DELETE CHAMPIONSHIP?</h2>
      <p class="del-modal-desc">
        Are you sure you want to permanently delete your <b>${teamName}</b> Season ${seasonNum} championship save?
        All R&amp;D upgrades, facility phases, driver contracts, and race results will be erased.
      </p>
      <div class="del-modal-actions">
        <button type="button" class="btn small" id="del-modal-cancel">CANCEL</button>
        <button type="button" class="btn primary small" id="del-modal-confirm">DELETE CHAMPIONSHIP</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const closeModal = () => {
    backdrop.remove();
    document.removeEventListener('keydown', onKey);
  };
  const onKey = e => {
    if (e.key === 'Escape') closeModal();
  };
  document.addEventListener('keydown', onKey);

  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeModal();
  });
  backdrop.querySelector('#del-modal-cancel').addEventListener('click', closeModal);
  backdrop.querySelector('#del-modal-confirm').addEventListener('click', () => {
    closeModal();
    if (typeof onConfirm === 'function') onConfirm();
  });
}

// Interactive Driver Dossier & Contract Negotiation Modal (clickable from Contract Radar & Driver Market)
export function openDriverDossierModal(driverId, onUpdated = null) {
  let existing = document.getElementById('driver-dossier-backdrop');
  if (existing) existing.remove();

  const s = getState();
  if (!s) return;
  const dos = driverDossier(s, driverId);
  if (!dos) return;

  const { driver: d, team, standingPos, points, racesLogged, wins, podiums, dnfs, bestFinish, live, h2h, radarHit, eligibility } = dos;
  const myTeam = teamById(s.teamId);
  const [myD1, myD2] = driversOfTeam(s.teamId, s);
  const windowOpen = isContractWindowOpen(s);
  const loggedCount = Object.keys(s.results || {}).length;
  const color = team ? team.color : '#38b6ff';

  const backdrop = document.createElement('div');
  backdrop.id = 'driver-dossier-backdrop';
  backdrop.className = 'del-modal-backdrop';

  const drawModal = (feedbackMsg = '', feedbackErr = false) => {
    const freshDos = driverDossier(s, driverId);
    const curElig = freshDos.eligibility;
    const isMine = freshDos.driver.team === s.teamId;

    backdrop.innerHTML = `
      <div class="del-modal-box drv-dossier-box" role="dialog" aria-modal="true" style="max-width:620px;border-top:3px solid ${color}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
          <div style="display:flex;align-items:center;gap:12px">
            <span class="mx-num" style="background:${color};width:44px;height:40px;font-size:1.15rem">${d.no}</span>
            <div>
              <div class="del-modal-eyebrow">${team ? `${team.name.toUpperCase()} · ${team.hq.toUpperCase()} HQ` : 'FIA FORMULA 2 RESERVE POOL'}</div>
              <h2 class="del-modal-title" style="margin:2px 0 0">${d.first} ${d.last}</h2>
            </div>
          </div>
          <button type="button" class="btn small" id="dossier-close" style="padding:6px 12px">✕</button>
        </div>

        <div class="drv-dossier-grid">
          <div class="drv-dossier-stat">
            <span>MONOPOSTO SPEED</span>
            <b>${live.speed} <small>/ 10 (Base ${live.baseSpeed})</small></b>
          </div>
          <div class="drv-dossier-stat">
            <span>MONOPOSTO RISK</span>
            <b>${live.risk} <small>/ 10 (Base ${live.baseRisk})</small></b>
          </div>
          <div class="drv-dossier-stat">
            <span>SEASON STANDING</span>
            <b>${standingPos && racesLogged > 0 ? `P${standingPos}` : '—'} <small>(${points} PTS)</small></b>
          </div>
          <div class="drv-dossier-stat">
            <span>AGE &amp; FEE</span>
            <b>${d.age || 25} yrs · ${fmt$(d.salaryM || 1.5)}</b>
          </div>
        </div>

        ${(live.speedReason || live.riskReason) ? `
          <div class="banner blue" style="margin:12px 0;padding:10px 14px">
            <div class="bt" style="font-size:.82rem">ACTIVE FORM &amp; AGGRESSION TELEMETRY</div>
            <div class="bs" style="font-size:.82rem">${[live.speedReason, live.riskReason].filter(Boolean).join(' · ')}</div>
          </div>
        ` : ''}

        ${radarHit ? `
          <div class="banner red" style="margin:12px 0;padding:10px 14px">
            <div class="bt" style="font-size:.82rem">${radarHit.rule === 1 ? 'RULE 1 — VETERAN RETIREMENT WATCH (' + radarHit.risk + '%)' : 'RULE 2 — HOT SEAT / 35% TEAMMATE RISK'}</div>
            <div class="bs" style="font-size:.82rem">${radarHit.reason}</div>
          </div>
        ` : ''}

        <div class="drv-dossier-h2h">
          <div><span>RACES LOGGED</span><b>${racesLogged}</b></div>
          <div><span>WINS / PODIUMS</span><b>${wins} / ${podiums}</b></div>
          <div><span>BEST FINISH / DNFs</span><b>${bestFinish ? 'P' + bestFinish : '—'} / ${dnfs}</b></div>
          ${h2h.mate ? `
            <div><span>QUALI H2H vs ${h2h.mate.last}</span><b>${h2h.qualiWins} – ${h2h.qualiLosses}</b></div>
            <div><span>RACE H2H vs ${h2h.mate.last}</span><b>${h2h.raceWins} – ${h2h.raceLosses}</b></div>
          ` : ''}
        </div>

        <div class="drv-dossier-contract">
          <div class="del-modal-eyebrow" style="margin-bottom:6px">CONTRACT NEGOTIATION — ${myTeam.name.toUpperCase()} (${myTeam.hq.toUpperCase()} HQ)</div>
          <div style="font-size:.84rem;color:var(--dim);line-height:1.45;margin-bottom:10px">
            ${curElig.reason}
            ${!windowOpen ? `<br><span style="color:var(--gold)">Note: Official FIA Contract Windows open after Round 12 (Spa) and Round 22 (Abu Dhabi) — currently ${loggedCount}/22 rounds logged. Emergency mid-season buyout is available below if eligible.</span>` : `<br><span style="color:var(--green)">★ FIA Contract Window is currently OPEN!</span>`}
          </div>
          ${feedbackMsg ? `<div class="fac-alert ${feedbackErr ? 'err' : 'ok'}" style="margin-bottom:10px">${feedbackMsg}</div>` : ''}
          ${!isMine && curElig.eligible ? `
            <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
              ${myD1 ? `<button type="button" class="btn primary small" data-sign-replace="${myD1.id}">SIGN FOR ${fmt$(d.salaryM || 1.5)} (REPLACE #${myD1.no} ${myD1.last})</button>` : ''}
              ${myD2 ? `<button type="button" class="btn primary small" data-sign-replace="${myD2.id}">SIGN FOR ${fmt$(d.salaryM || 1.5)} (REPLACE #${myD2.no} ${myD2.last})</button>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    backdrop.querySelector('#dossier-close').onclick = closeModal;
    backdrop.querySelectorAll('[data-sign-replace]').forEach(btn => {
      btn.onclick = () => {
        const outId = btn.dataset.signReplace;
        const res = signDriverContract(s, d.id, outId);
        if (res.error) {
          drawModal(res.error, true);
        } else {
          refreshHUD();
          drawModal(`Signed ${res.move.signedName} to ${res.move.toTeam} (replaced ${res.move.replacedName})!`, false);
          if (typeof onUpdated === 'function') onUpdated();
        }
      };
    });
  };

  drawModal();
  document.body.appendChild(backdrop);

  function closeModal() {
    backdrop.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) {
    if (e.key === 'Escape') closeModal();
  }
  document.addEventListener('keydown', onKey);
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeModal();
  });
}
