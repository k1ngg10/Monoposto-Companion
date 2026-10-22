// THE GRID — SPEC.md §5 canon (user's 2026-10-19 revision).
// Edit numbers HERE only; every screen renders from this table.
// Team logos: `logo` is an SVG file in assets/logos/ (user-supplied links,
// 2026-10-21). Marks that only exist as PNG/JPG live in logoData.js as
// data URIs — resolve a team's mark with logoOf(), never team.logo alone.
import { LOGO_DATA } from './logoData.js?v=20261022m';
export const logoOf = t => LOGO_DATA[t.id] || t.logo || null;

// Each constructor includes its authentic real-world headquarters (`hq` short city
// and `hqFull` full location). "Weissach" is strictly exclusive to Apple Porsche.
export const TEAMS = [
  { id: 'porsche',  name: 'Apple Porsche',         short: 'POR', color: '#f5c542', carPower: 5, pu: 'porsche',     works: true,  tier: 'newcomer', aiTier: 2,
    hq: 'Weissach',       hqFull: 'Weissach, Baden-Württemberg, Germany',
    logo: null, logoBg: '#ffffff', wellBg: '#ffffff' },
  { id: 'redbull',  name: 'Red Bull Ford',         short: 'RBR', color: '#33479e', carPower: 6, pu: 'redbullford', works: true,  aiTier: 1,
    hq: 'Milton Keynes',  hqFull: 'Milton Keynes, Buckinghamshire, United Kingdom',
    logo: 'assets/logos/team-redbull.svg', wellBg: 'linear-gradient(160deg, #1c2547, #0b0f22)' },
  { id: 'ferrari',  name: 'Ferrari HP',            short: 'FER', color: '#e8002d', carPower: 6, pu: 'ferrari',     works: true,  aiTier: 1,
    hq: 'Maranello',      hqFull: 'Maranello, Modena, Italy',
    logo: 'assets/logos/team-ferrari.svg', wellBg: 'linear-gradient(160deg, #4a1118, #14080a)' },
  { id: 'mclaren',  name: 'McLaren Mastercard',    short: 'MCL', color: '#ff8000', carPower: 6, pu: 'mercedes',    works: false, aiTier: 1,
    hq: 'Woking',         hqFull: 'Woking, Surrey, United Kingdom',
    logo: null, logoBg: '#000000', wellBg: '#000000', logoBlend: true },
  { id: 'mercedes', name: 'Mercedes-AMG Petronas', short: 'MER', color: '#27f4d2', carPower: 7, pu: 'mercedes',    works: true,  aiTier: 1,
    hq: 'Brackley',       hqFull: 'Brackley, Northamptonshire, United Kingdom',
    logo: 'assets/logos/team-mercedes.svg', logoBg: 'linear-gradient(160deg, #e4e6eb, #aeb3bc)', wellBg: 'linear-gradient(160deg, #e4e6eb, #9ea4ae)' },
  { id: 'byd',      name: 'BYD Huawei',            short: 'BYD', color: '#c8102e', carPower: 5, pu: 'tbd',         works: false, aiTier: 2,
    hq: 'Shenzhen',       hqFull: 'Shenzhen, Guangdong, China',
    logo: 'assets/logos/team-byd.svg' },
  { id: 'audi',     name: 'Audi Revolut',          short: 'AUD', color: '#c7c7cc', carPower: 5, pu: 'audi',        works: true,  aiTier: 2,
    hq: 'Hinwil',         hqFull: 'Hinwil, Zürich, Switzerland',
    logo: 'assets/logos/team-audi.svg' },
  { id: 'bmw',      name: 'BMW M iQOO',            short: 'BMW', color: '#ffd500', carPower: 4, pu: 'tbd',         works: false, aiTier: 3,
    hq: 'Munich',         hqFull: 'Munich, Bavaria, Germany',
    logo: 'assets/logos/team-bmw.svg' },
  { id: 'aston',    name: 'Aston Martin Aramco',   short: 'AMR', color: '#229971', carPower: 5, pu: 'honda',       works: false, aiTier: 2,
    hq: 'Silverstone',    hqFull: 'Silverstone, Northamptonshire, United Kingdom',
    logo: null, logoBg: 'linear-gradient(160deg, #28ad80, #177555)', wellBg: 'linear-gradient(160deg, #28ad80, #146348)' },
  { id: 'cadillac', name: 'Cadillac TWG',          short: 'CAD', color: '#9a9aa3', carPower: 4, pu: 'ferrari',     works: false, aiTier: 3,
    hq: 'Indianapolis',   hqFull: 'Indianapolis, Indiana, United States',
    logo: 'assets/logos/team-cadillac.svg', logoBg: 'linear-gradient(160deg, #d8dbe2, #9ea3af)', wellBg: 'linear-gradient(160deg, #d8dbe2, #8f94a0)' },
  { id: 'williams', name: 'Williams Atlassian',    short: 'WIL', color: '#64c4ff', carPower: 5, pu: 'mercedes',    works: false, aiTier: 2,
    hq: 'Grove',          hqFull: 'Grove, Oxfordshire, United Kingdom',
    logo: 'assets/logos/team-williams.svg', logoBg: '#ffffff', wellBg: 'linear-gradient(160deg, #ffffff, #edf2f8)' },
  { id: 'haas',     name: 'Haas TGR',              short: 'HAA', color: '#e8e8e8', carPower: 4, pu: 'ferrari',     works: false, aiTier: 3,
    hq: 'Kannapolis',     hqFull: 'Kannapolis, North Carolina, United States',
    logo: 'assets/logos/team-haas.svg', logoBg: 'linear-gradient(160deg, #eef0f4, #d5d9e2)', wellBg: 'linear-gradient(160deg, #eef0f4, #cfd4de)' }
];

// Reference map for all FIA & Constructor Factory Headquarters (including RB & Alpine if referenced)
export const FACTORY_HQ_DIRECTORY = {
  mclaren:  'Woking, Surrey, United Kingdom',
  mercedes: 'Brackley, Northamptonshire, United Kingdom',
  redbull:  'Milton Keynes, Buckinghamshire, United Kingdom',
  ferrari:  'Maranello, Modena, Italy',
  williams: 'Grove, Oxfordshire, United Kingdom',
  rb:       'Faenza, Ravenna, Italy',
  aston:    'Silverstone, Northamptonshire, United Kingdom',
  haas:     'Kannapolis, North Carolina, United States',
  alpine:   'Enstone, Oxfordshire, United Kingdom',
  audi:     'Hinwil, Zürich, Switzerland',
  cadillac: 'Indianapolis, Indiana, United States',
  porsche:  'Weissach, Baden-Württemberg, Germany',
  byd:      'Shenzhen, Guangdong, China',
  bmw:      'Munich, Bavaria, Germany'
};

// speed / risk are Monoposto integers (SPEC §5 canon). age is included for
// veteran retirement evaluation and driver dossiers.
export const DRIVERS = [
  { id: 'JAN', name: 'Shashwat Jangid',       first: 'Shashwat',    last: 'JANGID',     no: 17, team: 'porsche',  speed: 6, risk: 5, age: 22, salaryM: 1.2 },
  { id: 'JUN', name: 'Jun-seo Han',           first: 'Jun-seo',     last: 'HAN',        no: 88, team: 'porsche',  speed: 7, risk: 5, age: 23, salaryM: 1.6 },
  { id: 'VER', name: 'Max Verstappen',        first: 'Max',         last: 'VERSTAPPEN', no: 1,  team: 'redbull',  speed: 9, risk: 7, age: 28, salaryM: 6.5 },
  { id: 'HAD', name: 'Isack Hadjar',          first: 'Isack',       last: 'HADJAR',     no: 6,  team: 'redbull',  speed: 8, risk: 8, age: 21, salaryM: 2.2 },
  { id: 'LEC', name: 'Charles Leclerc',       first: 'Charles',     last: 'LECLERC',    no: 16, team: 'ferrari',  speed: 8, risk: 7, age: 28, salaryM: 5.0 },
  { id: 'HAM', name: 'Lewis Hamilton',        first: 'Lewis',       last: 'HAMILTON',   no: 44, team: 'ferrari',  speed: 9, risk: 6, age: 41, salaryM: 6.0 },
  { id: 'NOR', name: 'Lando Norris',          first: 'Lando',       last: 'NORRIS',     no: 4,  team: 'mclaren',  speed: 8, risk: 6, age: 26, salaryM: 4.8 },
  { id: 'PIA', name: 'Oscar Piastri',         first: 'Oscar',       last: 'PIASTRI',    no: 81, team: 'mclaren',  speed: 7, risk: 6, age: 25, salaryM: 3.4 },
  { id: 'RUS', name: 'George Russell',        first: 'George',      last: 'RUSSELL',    no: 63, team: 'mercedes', speed: 8, risk: 6, age: 28, salaryM: 4.6 },
  { id: 'ANT', name: 'Andrea Kimi Antonelli', first: 'Andrea Kimi', last: 'ANTONELLI',  no: 12, team: 'mercedes', speed: 8, risk: 8, age: 19, salaryM: 2.4 },
  { id: 'ZHO', name: 'Guanyu Zhou',           first: 'Guanyu',      last: 'ZHOU',       no: 24, team: 'byd',      speed: 7, risk: 5, age: 26, salaryM: 2.0 },
  { id: 'YIF', name: 'Ye Yifei',              first: 'Yifei',       last: 'YE',         no: 83, team: 'byd',      speed: 7, risk: 6, age: 25, salaryM: 1.8 },
  { id: 'HUL', name: 'Nico Hülkenberg',       first: 'Nico',        last: 'HÜLKENBERG', no: 27, team: 'audi',     speed: 8, risk: 4, age: 39, salaryM: 3.0 },
  { id: 'BOR', name: 'Gabriel Bortoleto',     first: 'Gabriel',     last: 'BORTOLETO',  no: 5,  team: 'audi',     speed: 8, risk: 6, age: 21, salaryM: 2.1 },
  { id: 'WEB', name: 'Florian Weber',         first: 'Florian',     last: 'WEBER',      no: 20, team: 'bmw',      speed: 7, risk: 5, age: 24, salaryM: 1.5 },
  { id: 'ROS', name: 'Mateo Rossi',           first: 'Mateo',       last: 'ROSSI',      no: 19, team: 'bmw',      speed: 8, risk: 8, age: 20, salaryM: 1.9 },
  { id: 'ALO', name: 'Fernando Alonso',       first: 'Fernando',    last: 'ALONSO',     no: 14, team: 'aston',    speed: 8, risk: 7, age: 45, salaryM: 4.5 },
  { id: 'STR', name: 'Lance Stroll',          first: 'Lance',       last: 'STROLL',     no: 18, team: 'aston',    speed: 7, risk: 6, age: 27, salaryM: 2.2 },
  { id: 'PER', name: 'Sergio Pérez',          first: 'Sergio',      last: 'PÉREZ',      no: 11, team: 'cadillac', speed: 8, risk: 5, age: 36, salaryM: 3.2 },
  { id: 'BOT', name: 'Valtteri Bottas',       first: 'Valtteri',    last: 'BOTTAS',     no: 77, team: 'cadillac', speed: 8, risk: 5, age: 37, salaryM: 3.0 },
  { id: 'ALB', name: 'Alexander Albon',       first: 'Alexander',   last: 'ALBON',      no: 23, team: 'williams', speed: 8, risk: 6, age: 30, salaryM: 3.2 },
  { id: 'SAI', name: 'Carlos Sainz',          first: 'Carlos',      last: 'SAINZ',      no: 55, team: 'williams', speed: 8, risk: 6, age: 31, salaryM: 3.8 },
  { id: 'OCO', name: 'Esteban Ocon',          first: 'Esteban',     last: 'OCON',       no: 31, team: 'haas',     speed: 8, risk: 7, age: 29, salaryM: 2.6 },
  { id: 'BEA', name: 'Oliver Bearman',        first: 'Oliver',      last: 'BEARMAN',    no: 87, team: 'haas',     speed: 8, risk: 7, age: 20, salaryM: 2.0 }
];

// FIA F2 / Official Reserve Driver Pool (Rule 3 — available for promotion & contract signings)
export const RESERVE_DRIVERS = [
  { id: 'POU', name: 'Théo Pourchaire', first: 'Théo',     last: 'POURCHAIRE', no: 98, team: null, speed: 7, risk: 7, age: 22, salaryM: 1.1, isReserve: true, bio: 'FIA Formula 2 Champion · Reserve Pool' },
  { id: 'VES', name: 'Frederik Vesti',  first: 'Frederik', last: 'VESTI',      no: 99, team: null, speed: 7, risk: 6, age: 24, salaryM: 1.0, isReserve: true, bio: 'F2 Vice-Champion · Simulator & Reserve Pool' },
  { id: 'ARO', name: 'Paul Aron',       first: 'Paul',     last: 'ARON',       no: 97, team: null, speed: 7, risk: 8, age: 22, salaryM: 1.0, isReserve: true, bio: 'F2 Rookie Podium Contender · Reserve Pool' }
];

export const teamById = id => TEAMS.find(t => t.id === id);

// Supports custom driver roster overrides when contracts change in Season 1 R12 / R22 or Season 2
export function activeDrivers(state = null) {
  if (state && Array.isArray(state.roster) && state.roster.length === 24) {
    return state.roster;
  }
  return DRIVERS;
}

export const driverById = (id, state = null) => {
  const list = activeDrivers(state);
  return list.find(d => d.id === id) || DRIVERS.find(d => d.id === id) || RESERVE_DRIVERS.find(d => d.id === id) || null;
};

export const driversOfTeam = (teamId, state = null) => {
  const list = activeDrivers(state);
  return list.filter(d => d.team === teamId);
};

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
