// THE GRID — SPEC.md §5 canon (user's 2026-10-19 revision).
// Edit numbers HERE only; every screen renders from this table.
export const TEAMS = [
  { id: 'porsche',  name: 'Apple Porsche',        short: 'POR', color: '#f5c542', carPower: 5, pu: 'porsche', works: true,  tier: 'newcomer', logo: 'assets/logos/team-apple.svg', logo2: 'assets/logos/team-porsche.svg' }, // Newcomer by canon despite Power 5
  { id: 'redbull',  name: 'Red Bull Ford',        short: 'RBR', color: '#33479e', carPower: 6, pu: 'redbullford', works: true, logo: 'assets/logos/team-redbull.svg' },
  { id: 'ferrari',  name: 'Ferrari HP',           short: 'FER', color: '#e8002d', carPower: 6, pu: 'ferrari', works: true, logo: 'assets/logos/pu-ferrari-hp.svg' },
  { id: 'mclaren',  name: 'McLaren Mastercard',   short: 'MCL', color: '#ff8000', carPower: 6, pu: 'mercedes', works: false, logo: 'assets/logos/team-mclaren.svg' },
  { id: 'mercedes', name: 'Mercedes-AMG Petronas',short: 'MER', color: '#27f4d2', carPower: 7, pu: 'mercedes', works: true, logo: 'assets/logos/pu-mercedes.svg' },
  { id: 'byd',      name: 'BYD Huawei',           short: 'BYD', color: '#c8102e', carPower: 5, pu: 'tbd', works: false, logo: null },
  { id: 'audi',     name: 'Audi Revolut',         short: 'AUD', color: '#c7c7cc', carPower: 5, pu: 'audi', works: true, logo: 'assets/logos/pu-audi.svg' },
  { id: 'bmw',      name: 'BMW M iQOO',           short: 'BMW', color: '#ffd500', carPower: 4, pu: 'tbd', works: false, logo: 'assets/logos/team-bmw.svg' },
  { id: 'aston',    name: 'Aston Martin Aramco',  short: 'AMR', color: '#229971', carPower: 5, pu: 'honda', works: false, logo: 'assets/logos/team-aston.svg' },
  { id: 'cadillac', name: 'Cadillac TWG',         short: 'CAD', color: '#9a9aa3', carPower: 4, pu: 'ferrari', works: false, logo: 'assets/logos/team-cadillac.svg' },
  { id: 'williams', name: 'Williams Atlassian',   short: 'WIL', color: '#64c4ff', carPower: 5, pu: 'mercedes', works: false, logo: null },
  { id: 'haas',     name: 'Haas TGR',             short: 'HAA', color: '#e8e8e8', carPower: 4, pu: 'ferrari', works: false, logo: null }
];

// speed / risk are Monoposto integers (SPEC §5 canon). age only where the
// driver-market retirement rule needs it (SPEC §6, Pillar 5 / prestige rules).
export const DRIVERS = [
  { id: 'JAN', name: 'Shashwat Jangid', first: 'Shashwat', last: 'JANGID', no: 17, team: 'porsche',  speed: 6, risk: 5 },
  { id: 'JUN', name: 'Jun-seo Han',     first: 'Jun-seo',  last: 'HAN',    no: 88, team: 'porsche',  speed: 7, risk: 5 },
  { id: 'VER', name: 'Max Verstappen', first: 'Max',      last: 'VERSTAPPEN', no: 1, team: 'redbull', speed: 9, risk: 7 },
  { id: 'HAD', name: 'Isack Hadjar',    first: 'Isack',    last: 'HADJAR', no: 6,  team: 'redbull',  speed: 8, risk: 8 },
  { id: 'LEC', name: 'Charles Leclerc',first: 'Charles',  last: 'LECLERC', no: 16, team: 'ferrari', speed: 8, risk: 7 },
  { id: 'HAM', name: 'Lewis Hamilton', first: 'Lewis',    last: 'HAMILTON', no: 44, team: 'ferrari', speed: 9, risk: 6, age: 41 },
  { id: 'NOR', name: 'Lando Norris',   first: 'Lando',    last: 'NORRIS', no: 4,  team: 'mclaren',  speed: 8, risk: 6 },
  { id: 'PIA', name: 'Oscar Piastri',  first: 'Oscar',    last: 'PIASTRI', no: 81, team: 'mclaren', speed: 7, risk: 6 },
  { id: 'RUS', name: 'George Russell', first: 'George',   last: 'RUSSELL', no: 63, team: 'mercedes', speed: 8, risk: 6 },
  { id: 'ANT', name: 'Andrea Kimi Antonelli', first: 'Andrea Kimi', last: 'ANTONELLI', no: 12, team: 'mercedes', speed: 8, risk: 8 },
  { id: 'ZHO', name: 'Guanyu Zhou',    first: 'Guanyu',   last: 'ZHOU',   no: 24, team: 'byd',      speed: 7, risk: 5 },
  { id: 'YIF', name: 'Ye Yifei',       first: 'Yifei',    last: 'YE',     no: 83, team: 'byd',      speed: 7, risk: 6 },
  { id: 'HUL', name: 'Nico Hülkenberg',first: 'Nico',     last: 'HÜLKENBERG', no: 27, team: 'audi', speed: 8, risk: 4, age: 39 },
  { id: 'BOR', name: 'Gabriel Bortoleto', first: 'Gabriel', last: 'BORTOLETO', no: 5, team: 'audi', speed: 8, risk: 6 },
  { id: 'WEB', name: 'Florian Weber',  first: 'Florian',  last: 'WEBER',  no: 20, team: 'bmw',      speed: 7, risk: 5 },
  { id: 'ROS', name: 'Mateo Rossi',    first: 'Mateo',    last: 'ROSSI',  no: 19, team: 'bmw',      speed: 8, risk: 8 },
  { id: 'ALO', name: 'Fernando Alonso',first: 'Fernando', last: 'ALONSO', no: 14, team: 'aston',    speed: 8, risk: 7, age: 45 },
  { id: 'STR', name: 'Lance Stroll',   first: 'Lance',    last: 'STROLL', no: 18, team: 'aston',    speed: 7, risk: 6 },
  { id: 'PER', name: 'Sergio Pérez',   first: 'Sergio',   last: 'PÉREZ',  no: 11, team: 'cadillac', speed: 8, risk: 5, age: 36 },
  { id: 'BOT', name: 'Valtteri Bottas',first: 'Valtteri', last: 'BOTTAS', no: 77, team: 'cadillac', speed: 8, risk: 5, age: 37 },
  { id: 'ALB', name: 'Alexander Albon',first: 'Alexander',last: 'ALBON',  no: 23, team: 'williams', speed: 8, risk: 6 },
  { id: 'SAI', name: 'Carlos Sainz',   first: 'Carlos',   last: 'SAINZ',  no: 55, team: 'williams', speed: 8, risk: 6 },
  { id: 'OCO', name: 'Esteban Ocon',   first: 'Esteban',  last: 'OCON',   no: 31, team: 'haas',     speed: 8, risk: 7 },
  { id: 'BEA', name: 'Oliver Bearman', first: 'Oliver',   last: 'BEARMAN', no: 87, team: 'haas',    speed: 8, risk: 7 }
];

export const teamById = id => TEAMS.find(t => t.id === id);
export const driverById = id => DRIVERS.find(d => d.id === id);
export const driversOfTeam = teamId => DRIVERS.filter(d => d.team === teamId);

// Entry tiers (SPEC §5): starting facilities + RP bank by car power.
// A team's `tier` field overrides the power-based tier (Porsche = newcomer).
export const ENTRY_TIERS = {
  contender: { label: 'Championship Contender', facilities: { windtunnel: 2, fabrication: 2, simulator: 2, corporate: 2 }, rp: 1600, fan: 35 },
  midfield:  { label: 'Midfield Challenger',    facilities: { windtunnel: 2, fabrication: 1, simulator: 1, corporate: 1 }, rp: 1300, fan: 20 },
  newcomer:  { label: 'Newcomer',               facilities: { windtunnel: 1, fabrication: 1, simulator: 1, corporate: 1 }, rp: 1150, fan: 12 }
};
export function tierOf(team) {
  if (team.tier) return team.tier;
  if (team.carPower >= 6) return 'contender';
  if (team.carPower === 5) return 'midfield';
  return 'newcomer';
}
