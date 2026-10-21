// SPONSORS & POWER UNITS.
// S1 sponsor board is LOCKED canon (SPEC §6, Pillar 1) — the board the user
// supplied from his own game. Payout split: 30% signing / 40% weekly / 30% goals.
// Display rule: only the 2 chosen active sponsors show objective cards.
export const SPONSORS = [
  { id: 'applemusic', name: 'Apple Music', value: 25.0, role: 'Title Partner',
    objectiveType: 'Brand Exposure', logo: 'assets/logos/applemusic.svg',
    objective: 'Score constructors\u2019 points in 3 consecutive races' },
  { id: 'tagheuer', name: 'TAG Heuer', value: 15.0, role: 'Official Partner',
    objectiveType: 'Performance Targets', logo: 'assets/logos/tagheuer.svg',
    objective: 'Beat your teammate in qualifying at the next race' },
  { id: 'boss', name: 'BOSS', value: 12.0, role: 'Official Partner',
    objectiveType: 'Hospitality & Events', logo: 'assets/logos/boss.svg', objective: null },
  { id: 'mobil1', name: 'Mobil 1', value: 10.0, role: 'Official Partner',
    objectiveType: 'Technical Collaboration', logo: 'assets/logos/mobil1.svg', objective: null }
];
export const sponsorById = id => SPONSORS.find(s => s.id === id);
export const totalSponsorValue = () => SPONSORS.reduce((a, s) => a + s.value, 0); // $62.0M

// PU suppliers. Performance/Durability AND contract costs are DRAFT values
// (SPEC open question 7) awaiting the user's ruling — costs carry over from
// the approved PU-card prototype's placeholders. One edit here retunes all.
export const PU_SUPPLIERS = [
  { id: 'mercedes',    name: 'Mercedes-AMG',        performance: 94, durability: 92, cost: 4.1, logo: 'assets/logos/pu-mercedes.svg' },
  { id: 'ferrari',     name: 'Ferrari',             performance: 92, durability: 90, cost: 3.8, logo: 'assets/logos/pu-ferrari-hp.svg' },
  { id: 'redbullford', name: 'Red Bull Powertrains', performance: 90, durability: 87, cost: 3.4, logo: 'assets/logos/pu-redbull-powertrains.png' },
  { id: 'audi',        name: 'Audi',                performance: 85, durability: 78, cost: 2.6, logo: 'assets/logos/pu-audi.svg' },
  { id: 'honda',       name: 'Honda (Aston Martin)', performance: 84, durability: 76, cost: 2.1, logo: 'assets/logos/pu-aston-honda.jpg' },
  { id: 'porsche',     name: 'Porsche (works)',     performance: 82, durability: 74, cost: 0, logo: null }
];
export const puById = id => PU_SUPPLIERS.find(p => p.id === id);

// Owner backgrounds (F1 25 creation funnel — screen-read facts).
export const OWNER_BACKGROUNDS = [
  { id: 'peoples-manager', name: "People's Manager", perk: '+10% facility improvement speed' },
  { id: 'head-engineer',   name: 'Head Engineer',    perk: '+10% weekly RP generation' },
  { id: 'cfo',             name: 'CFO',              perk: '+10% weekly cash income' }
];
