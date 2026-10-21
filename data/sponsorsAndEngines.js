// SPONSORS & POWER UNITS.
// SPONSOR BOARDS ARE PER TEAM (user, 2026-10-21): every team has its own
// real-world sponsors — never another team's board. Porsche's board is
// LOCKED canon (SPEC §6, Pillar 1) from the user's own board image:
// $62.0M, 30% signing / 40% weekly / 30% goals; only the 2 chosen active
// sponsors show objective cards, the rest pay in the background. Every
// OTHER team's values/objectives are DRAFT placeholders in the same
// shape. Sponsor logos are white-glyph SVGs (assets/logos/sp-*.svg);
// logo: null = no clean mark found — the name still renders.
import { LOGO_DATA } from './logoData.js';
const L = n => `assets/logos/sp-${n}.svg`;
export const TEAM_SPONSORS = {
  porsche: [
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
  ],
  mercedes: [
    { id: 'petronas', name: 'Petronas', value: 30.0, role: 'Title Partner', objectiveType: 'Brand Exposure',
      objective: 'Lead the constructors\u2019 standings at the summer break', logo: null },
    { id: 'ineos', name: 'INEOS', value: 18.0, role: 'Official Partner', objectiveType: 'Performance Targets',
      objective: 'Win at least 5 races this season', logo: null },
    { id: 'teamviewer', name: 'TeamViewer', value: 12.0, role: 'Official Partner', objectiveType: 'Technical Collaboration',
      objective: null, logo: L('teamviewer') },
    { id: 'snapdragon', name: 'Snapdragon', value: 10.0, role: 'Official Partner', objectiveType: 'Brand Exposure',
      objective: null, logo: L('snapdragon') }
  ],
  ferrari: [
    { id: 'hp', name: 'HP', value: 32.0, role: 'Title Partner', objectiveType: 'Brand Exposure',
      objective: 'Win a home-soil race (Monza) this season', logo: L('hp') },
    { id: 'shell', name: 'Shell', value: 24.0, role: 'Official Partner', objectiveType: 'Technical Collaboration',
      objective: 'Zero PU failures across the season', logo: L('shell') },
    { id: 'ibm', name: 'IBM', value: 14.0, role: 'Official Partner', objectiveType: 'Technical Collaboration',
      objective: null, logo: null }
  ],
  redbull: [
    { id: 'oracle', name: 'Oracle', value: 34.0, role: 'Title Partner', objectiveType: 'Performance Targets',
      objective: 'Win the constructors\u2019 championship', logo: null },
    { id: 'ford', name: 'Ford', value: 24.0, role: 'Official Partner', objectiveType: 'Technical Collaboration',
      objective: 'Fastest pit stop of the season', logo: L('ford') },
    { id: 'mobil1rb', name: 'Mobil 1', value: 9.0, role: 'Official Partner', objectiveType: 'Technical Collaboration',
      objective: null, logo: 'assets/logos/mobil1.svg' }
  ],
  mclaren: [
    { id: 'mastercard', name: 'Mastercard', value: 28.0, role: 'Title Partner', objectiveType: 'Brand Exposure',
      objective: 'Both cars in Q3 at 18+ rounds', logo: L('mastercard') },
    { id: 'google', name: 'Google', value: 18.0, role: 'Official Partner', objectiveType: 'Brand Exposure',
      objective: 'Reach 10M social followers', logo: L('google') },
    { id: 'okx', name: 'OKX', value: 12.0, role: 'Official Partner', objectiveType: 'Hospitality & Events',
      objective: null, logo: L('okx') }
  ],
  aston: [
    { id: 'aramco', name: 'Aramco', value: 26.0, role: 'Title Partner', objectiveType: 'Brand Exposure',
      objective: 'Score a podium this season', logo: null },
    { id: 'jcb', name: 'JCB', value: 8.0, role: 'Official Partner', objectiveType: 'Hospitality & Events',
      objective: 'Finish P5 or better in the constructors\u2019', logo: L('jcb') },
    { id: 'valvoline', name: 'Valvoline', value: 7.0, role: 'Official Partner', objectiveType: 'Technical Collaboration',
      objective: null, logo: null }
  ],
  williams: [
    { id: 'atlassian', name: 'Atlassian', value: 18.0, role: 'Title Partner', objectiveType: 'Brand Exposure',
      objective: 'Score points at 12+ rounds', logo: L('atlassian') },
    { id: 'komatsu', name: 'Komatsu', value: 9.0, role: 'Official Partner', objectiveType: 'Technical Collaboration',
      objective: 'Zero crash-damage DNFs before the summer break', logo: null },
    { id: 'gulf', name: 'Gulf', value: 7.0, role: 'Official Partner', objectiveType: 'Brand Exposure',
      objective: null, logo: null }
  ],
  audi: [
    { id: 'revolut', name: 'Revolut', value: 24.0, role: 'Title Partner', objectiveType: 'Brand Exposure',
      objective: 'Score points in your debut season', logo: L('revolut') },
    { id: 'bp', name: 'BP', value: 11.0, role: 'Official Partner', objectiveType: 'Technical Collaboration',
      objective: 'Zero fuel-related penalties all season', logo: null }
  ],
  haas: [
    { id: 'tgr', name: 'Toyota Gazoo Racing', value: 14.0, role: 'Title Partner', objectiveType: 'Technical Collaboration',
      objective: 'Beat one factory team at 3+ rounds', logo: L('toyota') },
    { id: 'moneygram', name: 'MoneyGram', value: 11.0, role: 'Official Partner', objectiveType: 'Brand Exposure',
      objective: 'Score points at both American rounds', logo: L('moneygram') }
  ],
  cadillac: [
    { id: 'twg', name: 'TWG', value: 14.0, role: 'Title Partner', objectiveType: 'Brand Exposure',
      objective: 'Finish your debut season off the bottom of the table', logo: null },
    { id: 'gm', name: 'General Motors', value: 10.0, role: 'Official Partner', objectiveType: 'Technical Collaboration',
      objective: 'Both cars classified at the US rounds', logo: L('generalmotors') }
  ],
  byd: [
    { id: 'huawei', name: 'Huawei', value: 20.0, role: 'Title Partner', objectiveType: 'Technical Collaboration',
      objective: 'Top-6 finish at the Chinese GP', logo: L('huawei') },
    { id: 'alibaba', name: 'Alibaba', value: 11.0, role: 'Official Partner', objectiveType: 'Brand Exposure',
      objective: 'Reach 5M social followers in Asia', logo: L('alibabacloud') },
    { id: 'deepseek', name: 'DeepSeek', value: 8.0, role: 'Official Partner', objectiveType: 'Technical Collaboration',
      objective: null, logo: L('deepseek') }
  ],
  bmw: [
    { id: 'iqoo', name: 'iQOO', value: 11.0, role: 'Title Partner', objectiveType: 'Brand Exposure',
      objective: 'Score points in your debut season', logo: null },
    { id: 'shellbmw', name: 'Shell', value: 9.0, role: 'Official Partner', objectiveType: 'Technical Collaboration',
      objective: 'Zero PU failures across the season', logo: L('shell') },
    { id: 'puma', name: 'Puma', value: 7.0, role: 'Official Partner', objectiveType: 'Hospitality & Events',
      objective: null, logo: L('puma') }
  ]
};
// Back-compat: the Porsche board under its old name (S1 canon).
export const SPONSORS = TEAM_SPONSORS.porsche;
export const sponsorsOfTeam = teamId => TEAM_SPONSORS[teamId] || [];
export const sponsorById = (teamId, id) => typeof id === 'undefined'
  ? SPONSORS.find(s => s.id === teamId)                       // legacy 1-arg call
  : sponsorsOfTeam(teamId).find(s => s.id === id);
export const totalSponsorValue = teamId =>
  (teamId ? sponsorsOfTeam(teamId) : SPONSORS).reduce((a, s) => a + s.value, 0);

// PU suppliers. Engine marks (user, 2026-10-21): Ferrari/Mercedes/Audi and
// Porsche wear their TEAM logos; Red Bull Powertrains and Honda (the Aston
// Martin lockup) are raster-only, so they come from logoData.js.
// Performance/Durability AND contract costs are DRAFT values
// (SPEC open question 7) awaiting the user's ruling — costs carry over from
// the approved PU-card prototype's placeholders. One edit here retunes all.
export const PU_SUPPLIERS = [
  { id: 'mercedes',    name: 'Mercedes-AMG',        performance: 94, durability: 92, cost: 4.1, logo: 'assets/logos/team-mercedes.svg' },
  { id: 'ferrari',     name: 'Ferrari',             performance: 92, durability: 90, cost: 3.8, logo: 'assets/logos/team-ferrari.svg' },
  { id: 'redbullford', name: 'Red Bull Powertrains', performance: 90, durability: 87, cost: 3.4, logo: LOGO_DATA.puRedbull },
  { id: 'audi',        name: 'Audi',                performance: 85, durability: 78, cost: 2.6, logo: 'assets/logos/team-audi.svg' },
  { id: 'honda',       name: 'Honda (Aston Martin)', performance: 84, durability: 76, cost: 2.1, logo: LOGO_DATA.honda },
  { id: 'porsche',     name: 'Porsche (works)',     performance: 82, durability: 74, cost: 0, logo: LOGO_DATA.porsche }
];
export const puById = id => PU_SUPPLIERS.find(p => p.id === id);

// Owner backgrounds (F1 25 creation funnel — screen-read facts).
export const OWNER_BACKGROUNDS = [
  { id: 'peoples-manager', name: "People's Manager", perk: '+10% facility improvement speed' },
  { id: 'head-engineer',   name: 'Head Engineer',    perk: '+10% weekly RP generation' },
  { id: 'cfo',             name: 'CFO',              perk: '+10% weekly cash income' }
];
