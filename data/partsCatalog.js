// PARTS CATALOG — the R&D tree (SPEC.md §6, Pillar 4).
// Shape: departments -> parts -> steps (the Spec 1→2→3 ladder).
// Each step: research { rp, days } then manufacture { costPerCopy ($M), days }.
// DP is granted when manufactured copies are fitted. Adding a part = adding an
// object here; the R&D screen renders the whole tree from this file.
//
// `planned` parts are real upgrade names screen-read from F1 25's 2026 Season
// Pack menus (research/f1-25-myteam-extraction.md). Their numbers are NOT yet
// mapped onto our economy, so they render as locked "data pending" entries.
export const DEPARTMENTS = [
  {
    id: 'aero', name: 'Aerodynamics', facilityGate: 'windtunnel',
    parts: [
      { id: 'frontwing', name: 'Front Wing', steps: [
        { spec: 1, rp: 500,  researchDays: 35, costPerCopy: 1.0, dp: 15 },
        { spec: 2, rp: 1100, researchDays: 50, costPerCopy: 1.8, dp: 13, needsFacility: 2 },
        { spec: 3, rp: 2200, researchDays: 70, costPerCopy: 3.2, dp: 11, needsFacility: 3 } ] },
      { id: 'rearwing', name: 'Rear Wing', steps: [
        { spec: 1, rp: 450,  researchDays: 43, costPerCopy: 1.0, dp: 15 },
        { spec: 2, rp: 1000, researchDays: 60, costPerCopy: 1.8, dp: 13, needsFacility: 2 },
        { spec: 3, rp: 2000, researchDays: 85, costPerCopy: 3.2, dp: 11, needsFacility: 3 } ] },
      { id: 'sidepods', name: 'Sidepods', steps: [
        { spec: 1, rp: 550,  researchDays: 35, costPerCopy: 1.5, dp: 20 },
        { spec: 2, rp: 1200, researchDays: 50, costPerCopy: 2.7, dp: 17, needsFacility: 2 },
        { spec: 3, rp: 2450, researchDays: 70, costPerCopy: 4.8, dp: 14, needsFacility: 3 } ] },
      { id: 'underfloor', name: 'Underfloor', steps: [
        { spec: 1, rp: 700,  researchDays: 43, costPerCopy: 2.0, dp: 25 },
        { spec: 2, rp: 1550, researchDays: 60, costPerCopy: 3.6, dp: 21, needsFacility: 2 },
        { spec: 3, rp: 3100, researchDays: 85, costPerCopy: 6.4, dp: 17, needsFacility: 3 } ] }
    ],
    planned: ['Wing Mirrors', 'Front Wing Gurney Flap', 'Front Wing Adjuster Bracket', 'Floor Stiffening Stays',
              'Floor Edge Winglets', 'Front Wing Endplates', 'Sidepod Undercut & Inlets',
              'Rear Downforce Beam Wing', 'Venturi Underfloor Channels', 'Low-Drag Active Aero Spec']
  },
  {
    id: 'chassis', name: 'Chassis', facilityGate: 'fabrication',
    parts: [],
    planned: ['Brake Calipers', 'Brake Disc Width', 'Plank Mounts', 'Floor Stay Positions', 'Roll Dampers',
              'Brake Pad Material', 'Weight Reduction I', 'Weight Redistribution', 'Rear Floor Undertray',
              'Lightweight Monocoque', 'Engine Cover (Distribution) — research verified: 650 RP / 13 days']
  },
  {
    id: 'powertrain', name: 'Powertrain', facilityGate: 'fabrication',
    parts: [
      { id: 'pu', name: '2026 Hybrid PU & MGU-K', factory: true, steps: [
        { spec: 1, rp: 800,  researchDays: 60,  costPerCopy: 0, dp: 30 },
        { spec: 2, rp: 1750, researchDays: 85,  costPerCopy: 0, dp: 25, needsFacility: 2 },
        { spec: 3, rp: 3600, researchDays: 120, costPerCopy: 0, dp: 20, needsFacility: 3 } ] }
    ],
    planned: ['Air Filter', 'Piston Rings', 'Wastegate Actuator', 'Pistons', 'Spark Plugs', 'Stators', 'ECU', 'Fuel Injection']
  },
  {
    id: 'durability', name: 'Durability', facilityGate: 'fabrication',
    parts: [],
    planned: ['General Wear Parts', 'Control Electronics', 'ES Cooling', 'Gearbox Internals', 'ICE', 'MGU-K & Turbo']
  }
];

export const partById = id => {
  for (const d of DEPARTMENTS) { const p = d.parts.find(x => x.id === id); if (p) return { ...p, dept: d.id, gate: d.facilityGate }; }
  return null;
};

// Design approaches (SPEC §6): trade time / RP / D20 modifier.
export const APPROACHES = {
  aggressive:   { label: 'Aggressive',   timeFactor: 0.7, rpFactor: 1.5, d20: -2 },
  standard:     { label: 'Standard',     timeFactor: 1.0, rpFactor: 1.0, d20: 0 },
  conservative: { label: 'Conservative', timeFactor: 1.3, rpFactor: 0.8, d20: 2 }
};
