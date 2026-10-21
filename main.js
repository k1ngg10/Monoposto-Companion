// Entry point + hash router. No save → championship creation; save → Matrix.
import { hasSave, getState, wipe, exportJSON, importJSON } from './engine/store.js';
import { applyTheme } from './engine/themeEngine.js';
import { render as StartWizard } from './views/StartWizardView.js';
import { render as ChampionshipMatrix } from './views/ChampionshipMatrixView.js';
import { render as HQ } from './views/HqDashboardView.js';
import { render as RaceWeekend } from './views/RaceWeekendView.js';
import { render as ResearchDev } from './views/ResearchDevView.js';
import { render as Facilities } from './views/FacilitiesView.js';
import { render as Standings } from './views/StandingsView.js';
import { render as DevGraph } from './views/DevGraphView.js';
import { render as SponsorsStaff } from './views/SponsorsStaffView.js';
import { render as DriverMarket } from './views/DriverMarketView.js';

const ROUTES = {
  start: StartWizard, matrix: ChampionshipMatrix, hq: HQ, race: RaceWeekend, rd: ResearchDev,
  facilities: Facilities, standings: Standings, devgraph: DevGraph,
  sponsors: SponsorsStaff, market: DriverMarket
};

function route() {
  let h = (location.hash || '#/matrix').replace('#/', '');
  if (!hasSave()) h = 'start';
  else if (h === 'start' || !ROUTES[h]) h = 'matrix';
  if (hasSave()) applyTheme(getState().teamId);
  document.getElementById('siteheader').style.display = hasSave() ? 'flex' : 'none';
  document.getElementById('mainnav').style.display = hasSave() ? 'flex' : 'none';
  document.querySelectorAll('#mainnav a').forEach(a => a.classList.toggle('on', a.dataset.route === h));
  const app = document.getElementById('app');
  app.style.paddingLeft = '';   // Race Weekend sets this for its side ribbon
  ROUTES[h](app);
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
route();

// Settings menu (header) — save management: export/import backup, and
// deleting the championship to start over with a new team.
(function setupSettings() {
  const btn = document.getElementById('settings-btn');
  const menu = document.getElementById('settings-menu');
  if (!btn || !menu) return;
  const close = () => { menu.hidden = true; };
  btn.addEventListener('click', e => { e.stopPropagation(); menu.hidden = !menu.hidden; });
  document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target)) close(); });
  document.getElementById('set-export').addEventListener('click', () => {
    close();
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'monoposto-save.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  });
  document.getElementById('set-import').addEventListener('change', async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      importJSON(await file.text());
      close();
      location.hash = '#/matrix';
      route();
    } catch { alert('That file is not a valid Monoposto save.'); }
  });
  document.getElementById('set-delete').addEventListener('click', () => {
    close();
    if (confirm('Delete this championship and start over with a new team? This cannot be undone — export a backup first if you want one.')) {
      wipe();
      location.hash = '#/start';
      route();
    }
  });
})();
