// Entry point + hash router. No save → the start wizard; save → HQ.
import { hasSave, getState } from './engine/store.js';
import { applyTheme } from './engine/themeEngine.js';
import { render as StartWizard } from './views/StartWizardView.js';
import { render as HQ } from './views/HqDashboardView.js';
import { render as RaceWeekend } from './views/RaceWeekendView.js';
import { render as ResearchDev } from './views/ResearchDevView.js';
import { render as Facilities } from './views/FacilitiesView.js';
import { render as Standings } from './views/StandingsView.js';
import { render as DevGraph } from './views/DevGraphView.js';
import { render as SponsorsStaff } from './views/SponsorsStaffView.js';
import { render as DriverMarket } from './views/DriverMarketView.js';

const ROUTES = {
  start: StartWizard, hq: HQ, race: RaceWeekend, rd: ResearchDev,
  facilities: Facilities, standings: Standings, devgraph: DevGraph,
  sponsors: SponsorsStaff, market: DriverMarket
};

function route() {
  let h = (location.hash || '#/hq').replace('#/', '');
  if (!hasSave()) h = 'start';
  else if (h === 'start' || !ROUTES[h]) h = 'hq';
  if (hasSave()) applyTheme(getState().teamId);
  document.getElementById('mainnav').style.display = hasSave() ? 'flex' : 'none';
  document.querySelectorAll('#mainnav a').forEach(a => a.classList.toggle('on', a.dataset.route === h));
  ROUTES[h](document.getElementById('app'));
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
route();
