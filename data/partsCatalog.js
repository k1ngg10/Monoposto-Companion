// PARTS CATALOG — the complete 40-part F1 25/26 R&D tree (Zero "DATA PENDING" placeholders).
// 4 Departments: Aerodynamics (14) + Chassis (11) + Powertrain (9) + Durability (6) = 40 parts.
// Core parts (Front Wing, Rear Wing, Sidepods, Underfloor, 2026 Hybrid PU) have Spec 1 → 2 → 3 ladders
// (gated by Engineering Facility Phase 1 → 2 → 3).
// Supplementary F1 25/26 upgrade nodes have Spec 1 assigned to Phase 1, Phase 2, or Phase 3,
// gated by Engineering Facility Phase and sequential departmental prerequisites.

export const DEPARTMENTS = [
  {
    id: 'aero',
    name: 'Aerodynamics',
    facilityGate: 'engineering',
    parts: [
      // Core Multi-Spec Parts (Specs 1, 2, 3)
      {
        id: 'frontwing', name: 'Front Wing', core: true, phase: 1,
        blurb: 'Primary front-axle downforce and wake management assembly.',
        steps: [
          { spec: 1, phase: 1, rp: 500,  researchDays: 28, costPerCopy: 0.65, manufDays: 8,  dp: 16, needsFacility: 1 },
          { spec: 2, phase: 2, rp: 1100, researchDays: 40, costPerCopy: 1.15, manufDays: 10, dp: 14, needsFacility: 2 },
          { spec: 3, phase: 3, rp: 2200, researchDays: 52, costPerCopy: 1.95, manufDays: 12, dp: 12, needsFacility: 3 }
        ]
      },
      {
        id: 'rearwing', name: 'Rear Wing', core: true, phase: 1,
        blurb: 'Upper rear aero profile balancing cornering load and DRS efficiency.',
        steps: [
          { spec: 1, phase: 1, rp: 450,  researchDays: 28, costPerCopy: 0.60, manufDays: 8,  dp: 14, needsFacility: 1 },
          { spec: 2, phase: 2, rp: 1000, researchDays: 40, costPerCopy: 1.10, manufDays: 10, dp: 13, needsFacility: 2 },
          { spec: 3, phase: 3, rp: 2000, researchDays: 52, costPerCopy: 1.90, manufDays: 12, dp: 11, needsFacility: 3 }
        ]
      },
      {
        id: 'sidepods', name: 'Sidepods', core: true, phase: 1,
        blurb: 'Radiator packaging and outwash bodywork channeling airflow to the diffuser.',
        steps: [
          { spec: 1, phase: 1, rp: 550,  researchDays: 30, costPerCopy: 0.80, manufDays: 9,  dp: 18, needsFacility: 1 },
          { spec: 2, phase: 2, rp: 1200, researchDays: 42, costPerCopy: 1.45, manufDays: 11, dp: 16, needsFacility: 2 },
          { spec: 3, phase: 3, rp: 2450, researchDays: 55, costPerCopy: 2.50, manufDays: 14, dp: 14, needsFacility: 3 }
        ]
      },
      {
        id: 'underfloor', name: 'Underfloor', core: true, phase: 1,
        blurb: 'Ground-effect Venturi floor generating low-drag peak suction.',
        steps: [
          { spec: 1, phase: 1, rp: 700,  researchDays: 34, costPerCopy: 1.00, manufDays: 10, dp: 22, needsFacility: 1 },
          { spec: 2, phase: 2, rp: 1550, researchDays: 46, costPerCopy: 1.80, manufDays: 12, dp: 20, needsFacility: 2 },
          { spec: 3, phase: 3, rp: 3100, researchDays: 60, costPerCopy: 3.10, manufDays: 15, dp: 18, needsFacility: 3 }
        ]
      },
      // Phase 1 Aero Nodes
      {
        id: 'wing_mirrors', name: 'Wing Mirrors', phase: 1,
        blurb: 'Aero-sculpted mirror stalks that condition flow over the sidepod shoulders.',
        steps: [
          { spec: 1, phase: 1, rp: 320, researchDays: 14, costPerCopy: 0.40, manufDays: 6, dp: 10, needsFacility: 1 }
        ]
      },
      {
        id: 'fw_gurney', name: 'Front Wing Gurney Flap', phase: 1,
        blurb: 'Trailing-edge micro-tab boosting front turn-in bite.',
        steps: [
          { spec: 1, phase: 1, rp: 360, researchDays: 16, costPerCopy: 0.45, manufDays: 6, dp: 12, needsFacility: 1 }
        ]
      },
      {
        id: 'fw_bracket', name: 'Front Wing Adjuster Bracket', phase: 1, prereq: 'fw_gurney',
        blurb: 'Low-profile flap adjuster reducing local vortex separation.',
        steps: [
          { spec: 1, phase: 1, rp: 400, researchDays: 18, costPerCopy: 0.50, manufDays: 7, dp: 12, needsFacility: 1 }
        ]
      },
      // Phase 2 Aero Nodes
      {
        id: 'floor_stays', name: 'Floor Stiffening Stays', phase: 2, prereq: 'underfloor',
        blurb: 'Carbon tension stays preventing high-speed floor porpoising.',
        steps: [
          { spec: 1, phase: 2, rp: 680, researchDays: 22, costPerCopy: 0.85, manufDays: 8, dp: 14, needsFacility: 2 }
        ]
      },
      {
        id: 'floor_winglets', name: 'Floor Edge Winglets', phase: 2, prereq: 'floor_stays',
        blurb: 'Vortex-sealing edge vanes keeping tyre squirt out of the diffuser.',
        steps: [
          { spec: 1, phase: 2, rp: 740, researchDays: 24, costPerCopy: 0.95, manufDays: 8, dp: 14, needsFacility: 2 }
        ]
      },
      {
        id: 'fw_endplates', name: 'Front Wing Endplates', phase: 2, prereq: 'frontwing',
        blurb: 'Outwash-inducing endplate diveplanes cleaning front tyre wake.',
        steps: [
          { spec: 1, phase: 2, rp: 780, researchDays: 26, costPerCopy: 1.00, manufDays: 9, dp: 16, needsFacility: 2 }
        ]
      },
      {
        id: 'sidepod_undercut', name: 'Sidepod Undercut & Inlets', phase: 2, prereq: 'sidepods',
        blurb: 'High-undercut shark-mouth inlets feeding clean air to the Coke-bottle rear.',
        steps: [
          { spec: 1, phase: 2, rp: 850, researchDays: 28, costPerCopy: 1.15, manufDays: 9, dp: 16, needsFacility: 2 }
        ]
      },
      // Phase 3 Aero Nodes
      {
        id: 'beam_wing', name: 'Rear Downforce Beam Wing', phase: 3, prereq: 'rearwing',
        blurb: 'Bi-plane lower beam wing coupling diffuser extraction to the upper wing.',
        steps: [
          { spec: 1, phase: 3, rp: 1350, researchDays: 34, costPerCopy: 1.65, manufDays: 10, dp: 18, needsFacility: 3 }
        ]
      },
      {
        id: 'venturi_channels', name: 'Venturi Underfloor Channels', phase: 3, prereq: 'floor_winglets',
        blurb: 'Re-profiled throat fences maximizing ground-effect seal across ride heights.',
        steps: [
          { spec: 1, phase: 3, rp: 1500, researchDays: 38, costPerCopy: 1.90, manufDays: 11, dp: 20, needsFacility: 3 }
        ]
      },
      {
        id: 'active_aero', name: 'Low-Drag Active Aero Spec', phase: 3, prereq: 'beam_wing',
        blurb: '2026 Z-Mode / X-Mode active front & rear element actuation package.',
        steps: [
          { spec: 1, phase: 3, rp: 1750, researchDays: 42, costPerCopy: 2.30, manufDays: 12, dp: 22, needsFacility: 3 }
        ]
      }
    ]
  },
  {
    id: 'chassis',
    name: 'Chassis',
    facilityGate: 'engineering',
    parts: [
      // Phase 1 Chassis Nodes (4 parts)
      {
        id: 'brake_calipers', name: 'Brake Calipers', phase: 1,
        blurb: 'Machined lithium-aluminum 6-piston calipers reducing unsprung mass.',
        steps: [
          { spec: 1, phase: 1, rp: 350, researchDays: 14, costPerCopy: 0.45, manufDays: 6, dp: 14, needsFacility: 1 }
        ]
      },
      {
        id: 'plank_mounts', name: 'Plank Mounts', phase: 1,
        blurb: 'Compliant skid-block mounts allowing lower static ride heights.',
        steps: [
          { spec: 1, phase: 1, rp: 320, researchDays: 12, costPerCopy: 0.40, manufDays: 6, dp: 10, needsFacility: 1 }
        ]
      },
      {
        id: 'engine_cover', name: 'Engine Cover (Distribution)', phase: 1,
        blurb: 'Shrink-wrapped carbon engine cover improving center-of-gravity and roll balance.',
        steps: [
          { spec: 1, phase: 1, rp: 650, researchDays: 13, costPerCopy: 0.75, manufDays: 7, dp: 16, needsFacility: 1 }
        ]
      },
      {
        id: 'brake_disc_width', name: 'Brake Disc Width', phase: 1, prereq: 'brake_calipers',
        blurb: 'Optimized carbon rotor drilling for rapid thermal bite in heavy braking zones.',
        steps: [
          { spec: 1, phase: 1, rp: 420, researchDays: 16, costPerCopy: 0.55, manufDays: 7, dp: 12, needsFacility: 1 }
        ]
      },
      // Phase 2 Chassis Nodes (4 parts)
      {
        id: 'floor_stay_pos', name: 'Floor Stay Positions', phase: 2, prereq: 'plank_mounts',
        blurb: 'Relocated chassis pick-up points stiffening lateral load transfer.',
        steps: [
          { spec: 1, phase: 2, rp: 720, researchDays: 22, costPerCopy: 0.90, manufDays: 8, dp: 14, needsFacility: 2 }
        ]
      },
      {
        id: 'roll_dampers', name: 'Roll Dampers', phase: 2, prereq: 'floor_stay_pos',
        blurb: 'Inboard heave and roll damper valves stabilizing high-speed chicane transitions.',
        steps: [
          { spec: 1, phase: 2, rp: 800, researchDays: 25, costPerCopy: 1.05, manufDays: 8, dp: 16, needsFacility: 2 }
        ]
      },
      {
        id: 'brake_pad_mat', name: 'Brake Pad Material', phase: 2, prereq: 'brake_disc_width',
        blurb: 'High-friction carbon-ceramic pad compound shortening stopping distances.',
        steps: [
          { spec: 1, phase: 2, rp: 760, researchDays: 24, costPerCopy: 0.95, manufDays: 8, dp: 14, needsFacility: 2 }
        ]
      },
      {
        id: 'weight_red_1', name: 'Weight Reduction I', phase: 2, prereq: 'engine_cover',
        blurb: 'Thin-ply pre-preg layup stripping 3.5 kg toward the 2026 minimum weight limit.',
        steps: [
          { spec: 1, phase: 2, rp: 920, researchDays: 28, costPerCopy: 1.25, manufDays: 9, dp: 18, needsFacility: 2 }
        ]
      },
      // Phase 3 Chassis Nodes (3 parts)
      {
        id: 'weight_redist', name: 'Weight Redistribution', phase: 3, prereq: 'weight_red_1',
        blurb: 'Tungsten ballast pockets optimizing front-to-rear tyre temperature balance.',
        steps: [
          { spec: 1, phase: 3, rp: 1380, researchDays: 34, costPerCopy: 1.75, manufDays: 10, dp: 18, needsFacility: 3 }
        ]
      },
      {
        id: 'rear_undertray', name: 'Rear Floor Undertray', phase: 3, prereq: 'roll_dampers',
        blurb: 'Ultra-rigid rear suspension carrier eliminating toe compliance under load.',
        steps: [
          { spec: 1, phase: 3, rp: 1520, researchDays: 38, costPerCopy: 2.00, manufDays: 11, dp: 20, needsFacility: 3 }
        ]
      },
      {
        id: 'light_monocoque', name: 'Lightweight Monocoque', phase: 3, prereq: 'weight_redist',
        blurb: 'High-modulus survival cell achieving peak torsional stiffness at minimum weight.',
        steps: [
          { spec: 1, phase: 3, rp: 1850, researchDays: 44, costPerCopy: 2.60, manufDays: 12, dp: 24, needsFacility: 3 }
        ]
      }
    ]
  },
  {
    id: 'powertrain',
    name: 'Powertrain',
    facilityGate: 'engineering',
    parts: [
      // Core Multi-Spec PU Part (Specs 1, 2, 3)
      {
        id: 'pu', name: '2026 Hybrid PU & MGU-K', core: true, factory: true, phase: 1,
        blurb: 'Core 350 kW MGU-K electrical deployment & sustainable fuel ICE integration.',
        steps: [
          { spec: 1, phase: 1, rp: 800,  researchDays: 36, costPerCopy: 0.60, manufDays: 9,  dp: 20, needsFacility: 1 },
          { spec: 2, phase: 2, rp: 1750, researchDays: 52, costPerCopy: 1.10, manufDays: 11, dp: 22, needsFacility: 2 },
          { spec: 3, phase: 3, rp: 3600, researchDays: 68, costPerCopy: 1.85, manufDays: 14, dp: 24, needsFacility: 3 }
        ]
      },
      // Phase 1 Powertrain Nodes (3 parts)
      {
        id: 'air_filter', name: 'Air Filter', phase: 1,
        blurb: 'High-flow plenum intake filter maximizing turbocharger mass airflow.',
        steps: [
          { spec: 1, phase: 1, rp: 360, researchDays: 14, costPerCopy: 0.45, manufDays: 6, dp: 16, needsFacility: 1 }
        ]
      },
      {
        id: 'spark_plugs', name: 'Spark Plugs', phase: 1,
        blurb: 'Pre-chamber turbulent jet ignition plugs for lean sustainable-fuel burn.',
        steps: [
          { spec: 1, phase: 1, rp: 310, researchDays: 12, costPerCopy: 0.35, manufDays: 6, dp: 10, needsFacility: 1 }
        ]
      },
      {
        id: 'piston_rings', name: 'Piston Rings', phase: 1, prereq: 'air_filter',
        blurb: 'Low-tension DLC-coated rings cutting parasitic cylinder friction.',
        steps: [
          { spec: 1, phase: 1, rp: 440, researchDays: 18, costPerCopy: 0.55, manufDays: 7, dp: 14, needsFacility: 1 }
        ]
      },
      // Phase 2 Powertrain Nodes (3 parts)
      {
        id: 'wastegate', name: 'Wastegate Actuator', phase: 2, prereq: 'piston_rings',
        blurb: 'High-frequency pneumatic wastegate smoothing turbo boost transients.',
        steps: [
          { spec: 1, phase: 2, rp: 740, researchDays: 24, costPerCopy: 0.95, manufDays: 8, dp: 14, needsFacility: 2 }
        ]
      },
      {
        id: 'stators', name: 'Stators', phase: 2, prereq: 'spark_plugs',
        blurb: 'Hairpin copper MGU-K stator windings boosting electrical harvesting efficiency.',
        steps: [
          { spec: 1, phase: 2, rp: 820, researchDays: 26, costPerCopy: 1.05, manufDays: 8, dp: 16, needsFacility: 2 }
        ]
      },
      {
        id: 'pistons', name: 'Pistons', phase: 2, prereq: 'wastegate',
        blurb: 'Forged bowl-crown pistons raising compression ratio stability.',
        steps: [
          { spec: 1, phase: 2, rp: 880, researchDays: 28, costPerCopy: 1.20, manufDays: 9, dp: 18, needsFacility: 2 }
        ]
      },
      // Phase 3 Powertrain Nodes (2 parts)
      {
        id: 'ecu', name: 'ECU', phase: 3, prereq: 'stators',
        blurb: 'Predictive Override-Mode energy deployment mapping across all straights.',
        steps: [
          { spec: 1, phase: 3, rp: 1420, researchDays: 36, costPerCopy: 1.85, manufDays: 10, dp: 20, needsFacility: 3 }
        ]
      },
      {
        id: 'fuel_injection', name: 'Fuel Injection', phase: 3, prereq: 'pistons',
        blurb: '500-bar direct injector nozzles atomizing 100% sustainable e-fuel.',
        steps: [
          { spec: 1, phase: 3, rp: 1650, researchDays: 42, costPerCopy: 2.20, manufDays: 11, dp: 22, needsFacility: 3 }
        ]
      }
    ]
  },
  {
    id: 'durability',
    name: 'Durability',
    facilityGate: 'engineering',
    parts: [
      // Phase 1 Durability Nodes (2 parts)
      {
        id: 'wear_parts', name: 'General Wear Parts', phase: 1,
        blurb: 'Ceramic wheel bearings and suspension bushes reducing mechanical attrition.',
        steps: [
          { spec: 1, phase: 1, rp: 340, researchDays: 14, costPerCopy: 0.40, manufDays: 6, dp: 14, needsFacility: 1 }
        ]
      },
      {
        id: 'ctrl_elec', name: 'Control Electronics', phase: 1,
        blurb: 'Gold-shielded wiring looms preventing high-voltage ERS cutouts.',
        steps: [
          { spec: 1, phase: 1, rp: 300, researchDays: 12, costPerCopy: 0.35, manufDays: 6, dp: 10, needsFacility: 1 }
        ]
      },
      // Phase 2 Durability Nodes (2 parts)
      {
        id: 'es_cooling', name: 'ES Cooling', phase: 2, prereq: 'ctrl_elec',
        blurb: 'Dielectric immersion cooling keeping the Energy Store in its peak thermal window.',
        steps: [
          { spec: 1, phase: 2, rp: 680, researchDays: 22, costPerCopy: 0.85, manufDays: 8, dp: 14, needsFacility: 2 }
        ]
      },
      {
        id: 'gearbox_int', name: 'Gearbox Internals', phase: 2, prereq: 'wear_parts',
        blurb: 'Isotropic super-finished dog rings for seamless 8-speed shifts.',
        steps: [
          { spec: 1, phase: 2, rp: 780, researchDays: 25, costPerCopy: 1.00, manufDays: 8, dp: 16, needsFacility: 2 }
        ]
      },
      // Phase 3 Durability Nodes (2 parts)
      {
        id: 'ice_dur', name: 'ICE', phase: 3, prereq: 'gearbox_int',
        blurb: 'Plasma-transferred wire arc cylinder liners extending full-power engine life.',
        steps: [
          { spec: 1, phase: 3, rp: 1320, researchDays: 34, costPerCopy: 1.65, manufDays: 10, dp: 18, needsFacility: 3 }
        ]
      },
      {
        id: 'mguk_turbo', name: 'MGU-K & Turbo', phase: 3, prereq: 'es_cooling',
        blurb: 'Silicon-nitride turbo shaft bearings surviving sustained 125,000 RPM operation.',
        steps: [
          { spec: 1, phase: 3, rp: 1550, researchDays: 38, costPerCopy: 1.95, manufDays: 11, dp: 20, needsFacility: 3 }
        ]
      }
    ]
  }
];

export const partById = id => {
  for (const d of DEPARTMENTS) {
    const p = d.parts.find(x => x.id === id);
    if (p) return { ...p, dept: d.id, deptName: d.name, gate: d.facilityGate };
  }
  return null;
};

// Starting Car Development presets (all Phase-1 upgrades so they never conflict with Basic/Phase-1 Facilities):
// - 'none':      0 parts pre-fitted -> +0 DP (+0.00 Car Power)
// - 'some':      4 Phase-1 parts (1 per dept) -> 16 + 14 + 16 + 14 = +60 DP (+0.60 Car Power)
// - 'extensive': 8 Phase-1 parts (2 per dept) -> 60 + 10 + 10 + 10 + 10 = +100 DP (+1.00 Car Power)
export const STARTER_DEV_PRESETS = {
  none: {
    id: 'none',
    label: 'No Development',
    dp: 0,
    partIds: [],
    desc: '0% R&D progress (+0 DP) and 0 parts unlocked across all 4 departments.'
  },
  some: {
    id: 'some',
    label: 'Some Development',
    dp: 60,
    partIds: ['frontwing', 'brake_calipers', 'air_filter', 'wear_parts'],
    desc: 'Pre-completes 4 Phase-1 upgrades (1 in Aero, Chassis, Powertrain, Durability) on both cars for +60 DP (+0.60 Car Power).'
  },
  extensive: {
    id: 'extensive',
    label: 'Extensive Development',
    dp: 100,
    partIds: ['frontwing', 'wing_mirrors', 'brake_calipers', 'plank_mounts', 'air_filter', 'spark_plugs', 'wear_parts', 'ctrl_elec'],
    desc: 'Pre-completes 8 Phase-1 upgrades (2 per department) on both cars for +100 DP (+1.00 full Car Power integer).'
  }
};

export function initialPartsState(devLevel = 'none') {
  const preset = STARTER_DEV_PRESETS[devLevel] || STARTER_DEV_PRESETS.none;
  const parts = {};
  let dpTotal = 0;
  for (const partId of preset.partIds) {
    const p = partById(partId);
    if (!p) continue;
    const step = p.steps[0];
    parts[partId] = {
      researched: 1,
      car1: 1,
      car2: 1,
      copies: 2,
      dpAppliedFor: 1,
      dpCredited: step.dp,
      breakthrough: false
    };
    dpTotal += step.dp;
  }
  return { parts, dpTotal };
}

// Design approaches (SPEC §6): trade time / RP / D20 modifier.
export const APPROACHES = {
  aggressive:   { label: 'Aggressive',   timeFactor: 0.7, rpFactor: 1.5, d20: -2 },
  standard:     { label: 'Standard',     timeFactor: 1.0, rpFactor: 1.0, d20: 0 },
  conservative: { label: 'Conservative', timeFactor: 1.3, rpFactor: 0.8, d20: 2 }
};
