// Entry point + hash router. No save → championship creation; save → Matrix.
import { hasSave, getState, wipe, exportJSON, importJSON } from './engine/store.js?v=20261022h';
import { applyTheme } from './engine/themeEngine.js?v=20261022h';
import { render as StartWizard } from './views/StartWizardView.js?v=20261022h';
import { render as ChampionshipMatrix } from './views/ChampionshipMatrixView.js?v=20261022h';
import { render as HQ } from './views/HqDashboardView.js?v=20261022h';
import { render as RaceWeekend } from './views/RaceWeekendView.js?v=20261022h';
import { render as ResearchDev } from './views/ResearchDevView.js?v=20261022h';
import { render as Facilities } from './views/FacilitiesView.js?v=20261022h';
import { render as Standings } from './views/StandingsView.js?v=20261022h';
import { render as DevGraph } from './views/DevGraphView.js?v=20261022h';
import { render as SponsorsStaff } from './views/SponsorsStaffView.js?v=20261022h';
import { render as DriverMarket } from './views/DriverMarketView.js?v=20261022h';

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
    } catch {
      console.warn('Invalid Monoposto save file.');
    }
  });
  document.getElementById('set-delete').addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    close();
    wipe();
    document.documentElement.style.setProperty('--team', '#e10600');
    if (location.hash === '#/start') route();
    else location.hash = '#/start';
  });
})();
