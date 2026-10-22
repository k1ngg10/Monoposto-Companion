// THEME ENGINE — reads the saved team and paints the whole app with it.
// Every accent in css/ uses var(--team); this is the only place that sets it.
import { teamById } from '../data/teamsAndDrivers.js?v=20261022k';

export function applyTheme(teamId) {
  const team = teamById(teamId);
  if (!team) return;
  document.documentElement.style.setProperty('--team', team.color);
  document.documentElement.style.setProperty('--team-ink', team.id === 'haas' || team.id === 'audi' || team.id === 'bmw' ? '#101014' : '#ffffff');
}
