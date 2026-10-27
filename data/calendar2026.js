// 2026 CALENDAR — 22 rounds, official dates (SPEC.md §4).
// Monoposto weekends run Saturday–Sunday (no practice): `sat` = qualifying day,
// `sun` = race day (Las Vegas races on Saturday — its race day is the 21st).
// lapKm / laps: standard published circuit figures (Albert Park verified from
// the official F1 track map); race distance is always computed laps × lapKm.
export const CALENDAR = [
  { round: 1,  gp: 'Australian Grand Prix',     circuit: 'Albert Park',                  country: 'Australia',     flag: '🇦🇺', sat: '2026-03-07', sun: '2026-03-08', laps: 58, lapKm: 5.278, map: null },
  { round: 2,  gp: 'Chinese Grand Prix',        circuit: 'Shanghai International',       country: 'China',         flag: '🇨🇳', sat: '2026-03-14', sun: '2026-03-15', laps: 56, lapKm: 5.451, map: null },
  { round: 3,  gp: 'Japanese Grand Prix',       circuit: 'Suzuka',                       country: 'Japan',         flag: '🇯🇵', sat: '2026-03-28', sun: '2026-03-29', laps: 53, lapKm: 5.807, map: null },
  { round: 4,  gp: 'Bahrain Grand Prix',        circuit: 'Sakhir',                       country: 'Bahrain',       flag: '🇧🇭', sat: '2026-04-11', sun: '2026-04-12', laps: 57, lapKm: 5.412, map: 'https://i.postimg.cc/63t0FjwT/Bahrain-Circuit.webp' },
  { round: 5,  gp: 'Saudi Arabian Grand Prix',  circuit: 'Jeddah Corniche',              country: 'Saudi Arabia',  flag: '🇸🇦', sat: '2026-04-18', sun: '2026-04-19', laps: 50, lapKm: 6.174, map: 'https://i.postimg.cc/dQS29t7y/Saudi-Arabia-Circuit.webp' },
  { round: 6,  gp: 'Miami Grand Prix',          circuit: 'Miami International',          country: 'USA',           flag: '🇺🇸', sat: '2026-05-02', sun: '2026-05-03', laps: 57, lapKm: 5.412, map: 'https://i.postimg.cc/76t2XmLw/Miami-Circuit.webp' },
  { round: 7,  gp: 'Canadian Grand Prix',       circuit: 'Circuit Gilles Villeneuve',    country: 'Canada',        flag: '🇨🇦', sat: '2026-05-23', sun: '2026-05-24', laps: 70, lapKm: 4.361, map: 'https://i.postimg.cc/yNV3Hwg6/Canada-Circuit.webp' },
  { round: 8,  gp: 'Monaco Grand Prix',         circuit: 'Monte Carlo',                  country: 'Monaco',        flag: '🇲🇨', sat: '2026-06-06', sun: '2026-06-07', laps: 78, lapKm: 3.337, map: null },
  { round: 9,  gp: 'Spanish Grand Prix',        circuit: 'Barcelona-Catalunya',          country: 'Spain',         flag: '🇪🇸', sat: '2026-06-13', sun: '2026-06-14', laps: 66, lapKm: 4.657, map: 'https://i.postimg.cc/zXZnQ2kM/Spain-Circuit.webp' },
  { round: 10, gp: 'Austrian Grand Prix',       circuit: 'Red Bull Ring',                country: 'Austria',       flag: '🇦🇹', sat: '2026-06-27', sun: '2026-06-28', laps: 71, lapKm: 4.318, map: 'https://i.postimg.cc/cJb3BFC1/Austria-Circuit.webp' },
  { round: 11, gp: 'British Grand Prix',        circuit: 'Silverstone',                  country: 'Great Britain', flag: '🇬🇧', sat: '2026-07-04', sun: '2026-07-05', laps: 52, lapKm: 5.891, map: 'https://i.postimg.cc/3xL03tgW/Great-Britain-Circuit.webp' },
  { round: 12, gp: 'Belgian Grand Prix',        circuit: 'Spa-Francorchamps',            country: 'Belgium',       flag: '🇧🇪', sat: '2026-07-18', sun: '2026-07-19', laps: 44, lapKm: 7.004, map: 'https://i.postimg.cc/zX8yWs7S/Belgium-Circuit.webp' },
  { round: 13, gp: 'Hungarian Grand Prix',      circuit: 'Hungaroring',                  country: 'Hungary',       flag: '🇭🇺', sat: '2026-07-25', sun: '2026-07-26', laps: 70, lapKm: 4.381, map: 'https://i.postimg.cc/ZnZ58N8S/Hungary-Circuit.webp' },
  { round: 14, gp: 'Dutch Grand Prix',          circuit: 'Zandvoort',                    country: 'Netherlands',   flag: '🇳🇱', sat: '2026-08-22', sun: '2026-08-23', laps: 72, lapKm: 4.259, map: 'https://i.postimg.cc/G3QL0HPD/Netherlands-Circuit.webp' },
  { round: 15, gp: 'Italian Grand Prix',        circuit: 'Monza',                        country: 'Italy',         flag: '🇮🇹', sat: '2026-09-05', sun: '2026-09-06', laps: 53, lapKm: 5.793, map: 'https://i.postimg.cc/jjHVzFZb/Italy-Circuit.webp' },
  { round: 16, gp: 'Singapore Grand Prix',      circuit: 'Marina Bay',                   country: 'Singapore',     flag: '🇸🇬', sat: '2026-10-10', sun: '2026-10-11', laps: 62, lapKm: 4.940, map: 'https://i.postimg.cc/kXzLLmH8/Singapore-Circuit.webp' },
  { round: 17, gp: 'United States Grand Prix',  circuit: 'COTA',                         country: 'USA',           flag: '🇺🇸', sat: '2026-10-24', sun: '2026-10-25', laps: 56, lapKm: 5.513, map: 'https://i.postimg.cc/6QwbN5fs/USA-Circuit.webp' },
  { round: 18, gp: 'Mexican Grand Prix',        circuit: 'Autódromo Hermanos Rodríguez', country: 'Mexico',        flag: '🇲🇽', sat: '2026-10-31', sun: '2026-11-01', laps: 71, lapKm: 4.304, map: null },
  { round: 19, gp: 'Brazilian Grand Prix',      circuit: 'Interlagos',                   country: 'Brazil',        flag: '🇧🇷', sat: '2026-11-07', sun: '2026-11-08', laps: 71, lapKm: 4.309, map: 'https://i.postimg.cc/W3zn2DD5/Brazil-Circuit.webp' },
  { round: 20, gp: 'Las Vegas Grand Prix',      circuit: 'Las Vegas Strip',              country: 'USA',           flag: '🇺🇸', sat: '2026-11-20', sun: '2026-11-21', laps: 50, lapKm: 6.201, map: 'https://i.postimg.cc/9Q2scpWH/Las-Vegas-Circuit.webp' },
  { round: 21, gp: 'Qatar Grand Prix',          circuit: 'Lusail',                       country: 'Qatar',         flag: '🇶🇦', sat: '2026-11-28', sun: '2026-11-29', laps: 57, lapKm: 5.419, map: null },
  { round: 22, gp: 'Abu Dhabi Grand Prix',      circuit: 'Yas Marina',                   country: 'UAE',           flag: '🇦🇪', sat: '2026-12-05', sun: '2026-12-06', laps: 58, lapKm: 5.281, map: 'https://i.postimg.cc/3wcL0CHJ/Abu-Dhabi-Circuit.webp' }
];

export const raceByRound = r => CALENDAR.find(x => x.round === r);
export function nextUnloggedRace(state) {
  if (!state) return CALENDAR[0];
  return CALENDAR.find(r => !state.results?.[r.round]) || null;
}
export function nextRace(isoDate, state = null) {
  if (state && state.results) {
    const unlogged = CALENDAR.find(r => !state.results[r.round]);
    if (unlogged) return unlogged;
  }
  return CALENDAR.find(r => r.sun >= isoDate) || null;
}
export function raceOn(isoDate) { return CALENDAR.find(r => r.sat === isoDate || r.sun === isoDate) || null; }
