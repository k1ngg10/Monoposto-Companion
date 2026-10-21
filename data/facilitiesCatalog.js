// FACILITIES & STAFF — the HQ tree (SPEC.md §6, Pillars 2–3).
// Shape: facilities -> levels -> nodes[]. A level can hold MULTIPLE upgrade
// nodes; today each level has one node (the level upgrade itself), so adding
// a sub-upgrade later = appending a node object — no UI changes needed.
// Level index 0 in `levels` is Level 1 (the starting state, nothing to buy).
export const FACILITIES = [
  { id: 'windtunnel', name: 'Wind Tunnel & CFD', branch: 'Engineering',
    blurb: 'Aerodynamics research: RP generation share, D20 correlation bonus.',
    levels: [
      { level: 1, nodes: [] },
      { level: 2, nodes: [{ name: 'Wind Tunnel & CFD — Level 2', cost: 5,  days: 30, effects: ['Aero D20 +2', '+25 RP per race', 'Unlocks Spec-2 aero'] }] },
      { level: 3, nodes: [{ name: 'Wind Tunnel & CFD — Level 3', cost: 12, days: 45, effects: ['Aero D20 +4', '+60 RP per race', 'Unlocks Spec-3 aero'] }] }
    ] },
  { id: 'fabrication', name: 'Fabrication & QC', branch: 'Engineering',
    blurb: 'Manufacturing: parallel builds, cost control, failure protection.',
    levels: [
      { level: 1, nodes: [] },
      { level: 2, nodes: [{ name: 'Fabrication & QC — Level 2', cost: 5,  days: 30, effects: ['2 parts in production at once', '−20% manufacture cost', 'Critical-failure immunity'] }] },
      { level: 3, nodes: [{ name: 'Fabrication & QC — Level 3', cost: 12, days: 45, effects: ['Both cars fitted in the debut race', '+60 RP per race'] }] }
    ] },
  { id: 'simulator', name: 'Race Simulator & Telemetry', branch: 'Personnel',
    blurb: 'Driver preparation: rookie XP, acclimatisation, risk control.',
    levels: [
      { level: 1, nodes: [] },
      { level: 2, nodes: [{ name: 'Race Simulator & Telemetry — Level 2', cost: 5,  days: 30, effects: ['Pre-race acclimatisation roll (D20 12+ → +1 Speed that weekend)', '+25 RP per race'] }] },
      { level: 3, nodes: [{ name: 'Race Simulator & Telemetry — Level 3', cost: 12, days: 45, effects: ['−1 permanent driver Risk', '+60 RP per race'] }] }
    ] },
  { id: 'corporate', name: 'Corporate & Marketing', branch: 'Corporate',
    blurb: 'The money machine: sponsor bonuses and reputation protection.',
    levels: [
      { level: 1, nodes: [] },
      { level: 2, nodes: [{ name: 'Corporate & Marketing — Level 2', cost: 5,  days: 30, effects: ['+25% sponsor goal bonuses', '+25 RP per race'] }] },
      { level: 3, nodes: [{ name: 'Corporate & Marketing — Level 3', cost: 12, days: 45, effects: ['+50% sponsor goal bonuses', 'Scandal shield', '+60 RP per race'] }] }
    ] }
];
export const facilityById = id => FACILITIES.find(f => f.id === id);

// Staff (SPEC §6, Pillar 3). Tiers bought with cash; effects read by engines.
export const STAFF = [
  { id: 'td', name: 'Technical Director', tiers: [
    { tier: 2, cost: 8,  effect: '−15% research RP costs' },
    { tier: 3, cost: 16, effect: '−30% research RP costs' } ] },
  { id: 'aerohead', name: 'Head of Aerodynamics', tiers: [
    { tier: 2, cost: 6,  effect: '+15 DP on aero research passes' } ] },
  { id: 'raceeng', name: 'Race Engineer', tiers: [
    { tier: 2, cost: 4,  effect: '"Radio Calm-Down" — tempers driver temper events' } ] },
  { id: 'sporting', name: 'Sporting Director', tiers: [
    { tier: 2, cost: 6,  effect: 'D20 11+ appeal against FIA penalties' },
    { tier: 3, cost: 12, effect: 'Appeal + contract-window leverage' } ] }
];
export const staffById = id => STAFF.find(s => s.id === id);
