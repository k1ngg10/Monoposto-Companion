// Shared UI fragments — the HUD, top bar, and Delete Championship confirmation modal.
// Values always come from the live save; nothing is typed in by hand.
import { getState, playerTeam } from '../engine/store.js?v=20261022j';

export const fmt$ = v => '$' + (+v).toFixed(2) + 'M';

export function hudHTML() {
  const s = getState(), t = playerTeam();
  return `<div class="hud">
    <div class="team">${t.name.toUpperCase()}</div>
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
  try {
    const t = playerTeam();
    if (t && t.name) teamName = t.name;
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
        Are you sure you want to permanently delete your <b>${teamName}</b> 2026 championship save?
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
