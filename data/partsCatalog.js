// PARTS CATALOG — F1 25/26 R&D Tree with Authentic Department Subcategories.
// 4 Departments: Aerodynamics, Chassis, Powertrain, Durability.
// Every department is organized into domain-specific F1 engineering subcategories
// (e.g. Chassis -> Weight Redistribution, Weight Reduction, Braking & Suspension;
//  Aerodynamics -> Front Downforce, Underbody & Airflow, Rear Downforce & Drag;
//  Powertrain -> Internal Combustion (ICE), Energy Recovery (ERS / MGU-K), Turbo & Fuel Systems;
//  Durability -> Power Unit Reliability, Gearbox & Wear Resistance).

export const DEPARTMENTS = [
  {
    id: 'aero',
    name: 'Aerodynamics',
    facilityGate: 'engineering',
    subcategories: [
      { id: 'aero_front', name: 'Front Downforce', tier: 'Major' },
      { id: 'aero_underbody', name: 'Underbody & Airflow', tier: 'Major' },
      { id: 'aero_rear', name: 'Rear Downforce & Drag', tier: 'Minor' }
    ],
    parts: [
      // --- Subcategory 1: Front Downforce ---
      {
        id: 'frontwing', name: 'Front Wing', subcategoryId: 'aero_front', subcategoryName: 'Front Downforce', tier: 'Major', core: true, phase: 1,
        blurb: 'Primary front-axle downforce and outwash wake management assembly across three progressive wind-tunnel specifications.',
        steps: [
          { spec: 1, phase: 1, rp: 500,  researchDays: 28, costPerCopy: 0.65, manufDays: 8,  dp: 16, needsFacility: 1 },
          { spec: 2, phase: 2, rp: 1100, researchDays: 40, costPerCopy: 1.15, manufDays: 10, dp: 14, needsFacility: 2 },
          { spec: 3, phase: 3, rp: 2200, researchDays: 52, costPerCopy: 1.95, manufDays: 12, dp: 12, needsFacility: 3 }
        ]
      },
      {
        id: 'wing_mirrors', name: 'Wing Mirrors', subcategoryId: 'aero_front', subcategoryName: 'Front Downforce', tier: 'Minor', phase: 1,
        blurb: 'Aero-sculpted mirror stalks and housings that condition airflow over the cockpit and sidepod shoulders.',
        steps: [
          { spec: 1, phase: 1, rp: 320, researchDays: 14, costPerCopy: 0.40, manufDays: 6, dp: 10, needsFacility: 1 }
        ]
      },
      {
        id: 'fw_gurney', name: 'Front Wing Gurney Flap', subcategoryId: 'aero_front', subcategoryName: 'Front Downforce', tier: 'Minor', phase: 1, prereq: 'wing_mirrors',
        blurb: 'Trailing-edge micro-tab on the upper front wing element boosting front turn-in bite in slow and medium-speed corners.',
        steps: [
          { spec: 1, phase: 1, rp: 360, researchDays: 16, costPerCopy: 0.45, manufDays: 6, dp: 12, needsFacility: 1 }
        ]
      },
      {
        id: 'fw_bracket', name: 'Front Wing Adjuster Bracket', subcategoryId: 'aero_front', subcategoryName: 'Front Downforce', tier: 'Minor', phase: 1, prereq: 'fw_gurney',
        blurb: 'Low-profile titanium flap adjuster fairings reducing local vortex separation across the inner wing span.',
        steps: [
          { spec: 1, phase: 1, rp: 400, researchDays: 18, costPerCopy: 0.50, manufDays: 7, dp: 12, needsFacility: 1 }
        ]
      },
      {
        id: 'fw_endplates', name: 'Front Wing Endplates', subcategoryId: 'aero_front', subcategoryName: 'Front Downforce', tier: 'Major', phase: 2, prereq: 'fw_bracket',
        blurb: 'Outwash-inducing endplate diveplanes and footplates cleaning turbulent front tyre wake before it reaches the floor.',
        steps: [
          { spec: 1, phase: 2, rp: 780, researchDays: 26, costPerCopy: 1.00, manufDays: 9, dp: 16, needsFacility: 2 }
        ]
      },

      // --- Subcategory 2: Underbody & Airflow ---
      {
        id: 'underfloor', name: 'Underfloor', subcategoryId: 'aero_underbody', subcategoryName: 'Underbody & Airflow', tier: 'Major', core: true, phase: 1,
        blurb: 'Ground-effect Venturi floor tunnels generating low-drag peak underbody suction across all ride heights.',
        steps: [
          { spec: 1, phase: 1, rp: 700,  researchDays: 34, costPerCopy: 1.00, manufDays: 10, dp: 22, needsFacility: 1 },
          { spec: 2, phase: 2, rp: 1550, researchDays: 46, costPerCopy: 1.80, manufDays: 12, dp: 20, needsFacility: 2 },
          { spec: 3, phase: 3, rp: 3100, researchDays: 60, costPerCopy: 3.10, manufDays: 15, dp: 18, needsFacility: 3 }
        ]
      },
      {
        id: 'sidepods', name: 'Sidepods', subcategoryId: 'aero_underbody', subcategoryName: 'Underbody & Airflow', tier: 'Major', core: true, phase: 1,
        blurb: 'Radiator packaging and downwash bodywork channeling high-energy airflow toward the diffuser roof and beam wing.',
        steps: [
          { spec: 1, phase: 1, rp: 550,  researchDays: 30, costPerCopy: 0.80, manufDays: 9,  dp: 18, needsFacility: 1 },
          { spec: 2, phase: 2, rp: 1200, researchDays: 42, costPerCopy: 1.45, manufDays: 11, dp: 16, needsFacility: 2 },
          { spec: 3, phase: 3, rp: 2450, researchDays: 55, costPerCopy: 2.50, manufDays: 14, dp: 14, needsFacility: 3 }
        ]
      },
      {
        id: 'sidepod_undercut', name: 'Sidepod Undercut & Inlets', subcategoryId: 'aero_underbody', subcategoryName: 'Underbody & Airflow', tier: 'Major', phase: 2, prereq: 'sidepods',
        blurb: 'High-undercut shark-mouth inlets feeding clean boundary-layer air around the Coke-bottle rear packaging.',
        steps: [
          { spec: 1, phase: 2, rp: 850, researchDays: 28, costPerCopy: 1.15, manufDays: 9, dp: 16, needsFacility: 2 }
        ]
      },
      {
        id: 'floor_stays', name: 'Floor Stiffening Stays', subcategoryId: 'aero_underbody', subcategoryName: 'Underbody & Airflow', tier: 'Minor', phase: 2, prereq: 'underfloor',
        blurb: 'Carbon tension stays preventing high-speed aero-elastic floor deflection and porpoising on long straights.',
        steps: [
          { spec: 1, phase: 2, rp: 680, researchDays: 22, costPerCopy: 0.85, manufDays: 8, dp: 14, needsFacility: 2 }
        ]
      },
      {
        id: 'floor_winglets', name: 'Floor Edge Winglets', subcategoryId: 'aero_underbody', subcategoryName: 'Underbody & Airflow', tier: 'Minor', phase: 2, prereq: 'floor_stays',
        blurb: 'Vortex-sealing edge vanes keeping rear tyre squirt out of the diffuser expansion ramp.',
        steps: [
          { spec: 1, phase: 2, rp: 740, researchDays: 24, costPerCopy: 0.95, manufDays: 8, dp: 14, needsFacility: 2 }
        ]
      },
      {
        id: 'venturi_channels', name: 'Venturi Underfloor Channels', subcategoryId: 'aero_underbody', subcategoryName: 'Underbody & Airflow', tier: 'Ultimate', phase: 3, prereq: 'floor_winglets',
        blurb: 'Re-profiled throat fences maximizing ground-effect suction seal across yaw and pitch transitions.',
        steps: [
          { spec: 1, phase: 3, rp: 1500, researchDays: 38, costPerCopy: 1.90, manufDays: 11, dp: 20, needsFacility: 3 }
        ]
      },

      // --- Subcategory 3: Rear Downforce & Drag ---
      {
        id: 'rearwing', name: 'Rear Wing', subcategoryId: 'aero_rear', subcategoryName: 'Rear Downforce & Drag', tier: 'Major', core: true, phase: 1,
        blurb: 'Upper rear aero profile balancing high-speed cornering stability and straight-line active aero efficiency.',
        steps: [
          { spec: 1, phase: 1, rp: 450,  researchDays: 28, costPerCopy: 0.60, manufDays: 8,  dp: 14, needsFacility: 1 },
          { spec: 2, phase: 2, rp: 1000, researchDays: 40, costPerCopy: 1.10, manufDays: 10, dp: 13, needsFacility: 2 },
          { spec: 3, phase: 3, rp: 2000, researchDays: 52, costPerCopy: 1.90, manufDays: 12, dp: 11, needsFacility: 3 }
        ]
      },
      {
        id: 'beam_wing', name: 'Rear Downforce Beam Wing', subcategoryId: 'aero_rear', subcategoryName: 'Rear Downforce & Drag', tier: 'Major', phase: 3, prereq: 'rearwing',
        blurb: 'Bi-plane lower beam wing coupling diffuser extraction to the upper rear wing mainplane.',
        steps: [
          { spec: 1, phase: 3, rp: 1350, researchDays: 34, costPerCopy: 1.65, manufDays: 10, dp: 18, needsFacility: 3 }
        ]
      },
      {
        id: 'active_aero', name: 'Low-Drag Active Aero Spec', subcategoryId: 'aero_rear', subcategoryName: 'Rear Downforce & Drag', tier: 'Ultimate', phase: 3, prereq: 'beam_wing',
        blurb: '2026 Z-Mode / X-Mode synchronized active front and rear wing actuation package shedding straight-line drag.',
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
    subcategories: [
      { id: 'ch_redist', name: 'Weight Redistribution', tier: 'Minor' },
      { id: 'ch_reduction', name: 'Weight Reduction', tier: 'Major' },
      { id: 'ch_braking', name: 'Braking & Suspension', tier: 'Minor' }
    ],
    parts: [
      // --- Subcategory 1: Weight Redistribution (Matches Screenshot 1) ---
      {
        id: 'plank_mounts', name: 'Plank Construction', subcategoryId: 'ch_redist', subcategoryName: 'Weight Redistribution', tier: 'Minor', phase: 1,
        blurb: 'Resin-infused skid-block and titanium mountings lowering the car center-of-gravity and optimizing static ride height.',
        steps: [
          { spec: 1, phase: 1, rp: 320, researchDays: 12, costPerCopy: 0.40, manufDays: 6, dp: 10, needsFacility: 1 }
        ]
      },
      {
        id: 'intercooler_pos', name: 'Intercooler Positioning', subcategoryId: 'ch_redist', subcategoryName: 'Weight Redistribution', tier: 'Minor', phase: 1, prereq: 'plank_mounts',
        blurb: 'Repackaged charge-air cooler cores mounted lower within the chassis survival cell to improve lateral roll inertia.',
        steps: [
          { spec: 1, phase: 1, rp: 380, researchDays: 14, costPerCopy: 0.45, manufDays: 6, dp: 12, needsFacility: 1 }
        ]
      },
      {
        id: 'hydraulics_pos', name: 'Hydraulics', subcategoryId: 'ch_redist', subcategoryName: 'Weight Redistribution', tier: 'Minor', phase: 1, prereq: 'intercooler_pos',
        blurb: 'Centralized high-pressure hydraulic manifold and braided line routing shifting mass toward the longitudinal midpoint.',
        steps: [
          { spec: 1, phase: 1, rp: 450, researchDays: 16, costPerCopy: 0.55, manufDays: 7, dp: 12, needsFacility: 1 }
        ]
      },
      {
        id: 'floor_stay_pos', name: 'Floor Undertray (Distribution)', subcategoryId: 'ch_redist', subcategoryName: 'Weight Redistribution', tier: 'Major', phase: 2, prereq: 'hydraulics_pos',
        blurb: 'Relocated undertray ballast pockets and chassis pick-up points stiffening lateral load transfer across kerbs.',
        steps: [
          { spec: 1, phase: 2, rp: 720, researchDays: 22, costPerCopy: 0.90, manufDays: 8, dp: 14, needsFacility: 2 }
        ]
      },
      {
        id: 'es_cells_pos', name: 'Energy Store Cells Positioning', subcategoryId: 'ch_redist', subcategoryName: 'Weight Redistribution', tier: 'Major', phase: 2, prereq: 'floor_stay_pos',
        blurb: 'Low-slung battery module tray nested beneath the fuel bladder to optimize front-to-rear weight distribution.',
        steps: [
          { spec: 1, phase: 2, rp: 720, researchDays: 22, costPerCopy: 0.90, manufDays: 8, dp: 14, needsFacility: 2 }
        ]
      },
      {
        id: 'weight_redist', name: 'Fuel Tank Positioning', subcategoryId: 'ch_redist', subcategoryName: 'Weight Redistribution', tier: 'Ultimate', phase: 3, prereq: 'es_cells_pos',
        blurb: 'Re-contoured Kevlar fuel cell collector and tungsten ballast pockets stabilizing pitch sensitivity as fuel burns off.',
        steps: [
          { spec: 1, phase: 3, rp: 990, researchDays: 30, costPerCopy: 1.55, manufDays: 10, dp: 18, needsFacility: 3 }
        ]
      },

      // --- Subcategory 2: Weight Reduction (Matches Screenshots 2 & 3) ---
      {
        id: 'nose_structure', name: 'Nose Structure', subcategoryId: 'ch_reduction', subcategoryName: 'Weight Reduction', tier: 'Minor', phase: 1,
        blurb: 'Thin-wall carbon-honeycomb front impact structure shedding overhang mass ahead of the front axle.',
        steps: [
          { spec: 1, phase: 1, rp: 340, researchDays: 12, costPerCopy: 0.40, manufDays: 6, dp: 10, needsFacility: 1 }
        ]
      },
      {
        id: 'light_es_cells', name: 'Lightweight Energy Store Cells', subcategoryId: 'ch_reduction', subcategoryName: 'Weight Reduction', tier: 'Minor', phase: 1, prereq: 'nose_structure',
        blurb: 'High-density lithium-silicon cell casing and busbars trimming 1.8 kg from the hybrid energy store pack.',
        steps: [
          { spec: 1, phase: 1, rp: 420, researchDays: 15, costPerCopy: 0.50, manufDays: 6, dp: 12, needsFacility: 1 }
        ]
      },
      {
        id: 'engine_cover', name: 'Engine Cover', subcategoryId: 'ch_reduction', subcategoryName: 'Weight Reduction', tier: 'Minor', phase: 1, prereq: 'light_es_cells',
        blurb: 'Shrink-wrapped ultra-thin pre-preg carbon engine cover reducing upper bodywork mass and roll moment.',
        steps: [
          { spec: 1, phase: 1, rp: 650, researchDays: 13, costPerCopy: 0.75, manufDays: 7, dp: 16, needsFacility: 1 }
        ]
      },
      {
        id: 'weight_red_1', name: 'Lightweight Wheel Rims', subcategoryId: 'ch_reduction', subcategoryName: 'Weight Reduction', tier: 'Major', phase: 2, prereq: 'engine_cover',
        blurb: 'Flow-formed magnesium alloy 18-inch wheel rims cutting rotational inertia and unsprung corner mass.',
        steps: [
          { spec: 1, phase: 2, rp: 920, researchDays: 24, costPerCopy: 1.15, manufDays: 8, dp: 18, needsFacility: 2 }
        ]
      },
      {
        id: 'floor_undertray_red', name: 'Floor Undertray', subcategoryId: 'ch_reduction', subcategoryName: 'Weight Reduction', tier: 'Major', phase: 2, prereq: 'weight_red_1',
        blurb: 'Using sophisticated FEA (Finite Element Analysis) tools, carbon fiber strips have been rearranged on the floor undertray to handle peak loads more effectively and save weight.',
        steps: [
          { spec: 1, phase: 2, rp: 720, researchDays: 14, costPerCopy: 0.95, manufDays: 8, dp: 16, needsFacility: 2 }
        ]
      },
      {
        id: 'light_monocoque', name: 'Lightweight Monocoque', subcategoryId: 'ch_reduction', subcategoryName: 'Weight Reduction', tier: 'Ultimate', phase: 3, prereq: 'floor_undertray_red',
        blurb: 'High-modulus survival cell layup achieving peak torsional stiffness right at the 2026 minimum weight limit.',
        steps: [
          { spec: 1, phase: 3, rp: 1850, researchDays: 44, costPerCopy: 2.60, manufDays: 12, dp: 24, needsFacility: 3 }
        ]
      },

      // --- Subcategory 3: Braking & Suspension ---
      {
        id: 'brake_calipers', name: 'Brake Calipers', subcategoryId: 'ch_braking', subcategoryName: 'Braking & Suspension', tier: 'Minor', phase: 1,
        blurb: 'Machined lithium-aluminum 6-piston monobloc calipers reducing unsprung mass and fluid compliance.',
        steps: [
          { spec: 1, phase: 1, rp: 350, researchDays: 14, costPerCopy: 0.45, manufDays: 6, dp: 14, needsFacility: 1 }
        ]
      },
      {
        id: 'brake_disc_width', name: 'Brake Disc Width', subcategoryId: 'ch_braking', subcategoryName: 'Braking & Suspension', tier: 'Minor', phase: 1, prereq: 'brake_calipers',
        blurb: 'Optimized 1,000-hole carbon rotor cooling channels for rapid thermal bite in heavy braking zones.',
        steps: [
          { spec: 1, phase: 1, rp: 420, researchDays: 16, costPerCopy: 0.55, manufDays: 7, dp: 12, needsFacility: 1 }
        ]
      },
      {
        id: 'brake_pad_mat', name: 'Brake Pad Material', subcategoryId: 'ch_braking', subcategoryName: 'Braking & Suspension', tier: 'Major', phase: 2, prereq: 'brake_disc_width',
        blurb: 'High-friction carbon-ceramic pad compound shortening stopping distances and improving MGU-K brake-by-wire blending.',
        steps: [
          { spec: 1, phase: 2, rp: 760, researchDays: 24, costPerCopy: 0.95, manufDays: 8, dp: 14, needsFacility: 2 }
        ]
      },
      {
        id: 'roll_dampers', name: 'Roll Dampers', subcategoryId: 'ch_braking', subcategoryName: 'Braking & Suspension', tier: 'Major', phase: 2, prereq: 'brake_pad_mat',
        blurb: 'Inboard heave and roll damper valves stabilizing high-speed chicane direction changes.',
        steps: [
          { spec: 1, phase: 2, rp: 800, researchDays: 25, costPerCopy: 1.05, manufDays: 8, dp: 16, needsFacility: 2 }
        ]
      },
      {
        id: 'rear_undertray', name: 'Rear Suspension Carrier', subcategoryId: 'ch_braking', subcategoryName: 'Braking & Suspension', tier: 'Ultimate', phase: 3, prereq: 'roll_dampers',
        blurb: 'Ultra-rigid carbon rear suspension upright and wishbone carrier eliminating toe compliance under peak cornering load.',
        steps: [
          { spec: 1, phase: 3, rp: 1520, researchDays: 38, costPerCopy: 2.00, manufDays: 11, dp: 20, needsFacility: 3 }
        ]
      }
    ]
  },
  {
    id: 'powertrain',
    name: 'Powertrain',
    facilityGate: 'engineering',
    subcategories: [
      { id: 'pt_ice', name: 'Internal Combustion (ICE)', tier: 'Major' },
      { id: 'pt_ers', name: 'Energy Recovery (ERS / MGU-K)', tier: 'Major' },
      { id: 'pt_turbo', name: 'Turbo & Fuel Systems', tier: 'Minor' }
    ],
    parts: [
      // --- Subcategory 1: Internal Combustion (ICE) ---
      {
        id: 'air_filter', name: 'Air Filter', subcategoryId: 'pt_ice', subcategoryName: 'Internal Combustion (ICE)', tier: 'Minor', phase: 1,
        blurb: 'High-flow plenum intake filter element maximizing compressor mass airflow with minimal pressure drop.',
        steps: [
          { spec: 1, phase: 1, rp: 360, researchDays: 14, costPerCopy: 0.45, manufDays: 6, dp: 16, needsFacility: 1 }
        ]
      },
      {
        id: 'spark_plugs', name: 'Spark Plugs', subcategoryId: 'pt_ice', subcategoryName: 'Internal Combustion (ICE)', tier: 'Minor', phase: 1,
        blurb: 'Pre-chamber turbulent jet ignition plugs engineered for ultra-lean 2026 sustainable e-fuel combustion.',
        steps: [
          { spec: 1, phase: 1, rp: 310, researchDays: 12, costPerCopy: 0.35, manufDays: 6, dp: 10, needsFacility: 1 }
        ]
      },
      {
        id: 'piston_rings', name: 'Piston Rings', subcategoryId: 'pt_ice', subcategoryName: 'Internal Combustion (ICE)', tier: 'Minor', phase: 1, prereq: 'air_filter',
        blurb: 'Low-tension DLC-coated compression rings cutting parasitic cylinder wall friction at 15,000 RPM.',
        steps: [
          { spec: 1, phase: 1, rp: 440, researchDays: 18, costPerCopy: 0.55, manufDays: 7, dp: 14, needsFacility: 1 }
        ]
      },
      {
        id: 'pistons', name: 'Pistons', subcategoryId: 'pt_ice', subcategoryName: 'Internal Combustion (ICE)', tier: 'Major', phase: 2, prereq: 'piston_rings',
        blurb: 'Forged bowl-crown steel-alloy pistons raising thermal efficiency and detonation margin.',
        steps: [
          { spec: 1, phase: 2, rp: 880, researchDays: 28, costPerCopy: 1.20, manufDays: 9, dp: 18, needsFacility: 2 }
        ]
      },

      // --- Subcategory 2: Energy Recovery (ERS / MGU-K) ---
      {
        id: 'pu', name: '2026 Hybrid PU & MGU-K', subcategoryId: 'pt_ers', subcategoryName: 'Energy Recovery (ERS / MGU-K)', tier: 'Major', core: true, factory: true, phase: 1,
        blurb: 'Core 350 kW MGU-K electrical deployment & sustainable fuel ICE integration across three dyno evolutions.',
        steps: [
          { spec: 1, phase: 1, rp: 800,  researchDays: 36, costPerCopy: 0.60, manufDays: 9,  dp: 20, needsFacility: 1 },
          { spec: 2, phase: 2, rp: 1750, researchDays: 52, costPerCopy: 1.10, manufDays: 11, dp: 22, needsFacility: 2 },
          { spec: 3, phase: 3, rp: 3600, researchDays: 68, costPerCopy: 1.85, manufDays: 14, dp: 24, needsFacility: 3 }
        ]
      },
      {
        id: 'stators', name: 'Stators', subcategoryId: 'pt_ers', subcategoryName: 'Energy Recovery (ERS / MGU-K)', tier: 'Major', phase: 2, prereq: 'spark_plugs',
        blurb: 'Hairpin copper MGU-K stator windings boosting electrical harvesting efficiency under heavy braking.',
        steps: [
          { spec: 1, phase: 2, rp: 820, researchDays: 26, costPerCopy: 1.05, manufDays: 8, dp: 16, needsFacility: 2 }
        ]
      },
      {
        id: 'ecu', name: 'ECU', subcategoryId: 'pt_ers', subcategoryName: 'Energy Recovery (ERS / MGU-K)', tier: 'Ultimate', phase: 3, prereq: 'stators',
        blurb: 'Predictive Override-Mode energy deployment mapping maximizing 350 kW electrical boost at the end of straights.',
        steps: [
          { spec: 1, phase: 3, rp: 1420, researchDays: 36, costPerCopy: 1.85, manufDays: 10, dp: 20, needsFacility: 3 }
        ]
      },

      // --- Subcategory 3: Turbo & Fuel Systems ---
      {
        id: 'wastegate', name: 'Wastegate Actuator', subcategoryId: 'pt_turbo', subcategoryName: 'Turbo & Fuel Systems', tier: 'Major', phase: 2, prereq: 'piston_rings',
        blurb: 'High-frequency pneumatic wastegate valve smoothing turbocharger boost transients out of slow corners.',
        steps: [
          { spec: 1, phase: 2, rp: 740, researchDays: 24, costPerCopy: 0.95, manufDays: 8, dp: 14, needsFacility: 2 }
        ]
      },
      {
        id: 'fuel_injection', name: 'Fuel Injection', subcategoryId: 'pt_turbo', subcategoryName: 'Turbo & Fuel Systems', tier: 'Ultimate', phase: 3, prereq: 'wastegate',
        blurb: '500-bar piezo direct injector nozzles atomizing 100% sustainable e-fuel for maximum specific power.',
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
    subcategories: [
      { id: 'dur_pu', name: 'Power Unit Reliability', tier: 'Major' },
      { id: 'dur_gearbox', name: 'Gearbox & Wear Resistance', tier: 'Minor' }
    ],
    parts: [
      // --- Subcategory 1: Power Unit Reliability ---
      {
        id: 'ctrl_elec', name: 'Control Electronics', subcategoryId: 'dur_pu', subcategoryName: 'Power Unit Reliability', tier: 'Minor', phase: 1,
        blurb: 'Gold-shielded high-voltage wiring looms and inverter shielding preventing ERS thermal cutouts.',
        steps: [
          { spec: 1, phase: 1, rp: 300, researchDays: 12, costPerCopy: 0.35, manufDays: 6, dp: 10, needsFacility: 1 }
        ]
      },
      {
        id: 'es_cooling', name: 'ES Cooling', subcategoryId: 'dur_pu', subcategoryName: 'Power Unit Reliability', tier: 'Major', phase: 2, prereq: 'ctrl_elec',
        blurb: 'Dielectric immersion cooling plates keeping the Energy Store in its optimal thermal window over race distance.',
        steps: [
          { spec: 1, phase: 2, rp: 680, researchDays: 22, costPerCopy: 0.85, manufDays: 8, dp: 14, needsFacility: 2 }
        ]
      },
      {
        id: 'ice_dur', name: 'ICE Cylinder Liners', subcategoryId: 'dur_pu', subcategoryName: 'Power Unit Reliability', tier: 'Ultimate', phase: 3, prereq: 'es_cooling',
        blurb: 'Plasma-transferred wire arc cylinder liners extending full-power internal combustion life across the calendar.',
        steps: [
          { spec: 1, phase: 3, rp: 1320, researchDays: 34, costPerCopy: 1.65, manufDays: 10, dp: 18, needsFacility: 3 }
        ]
      },
      {
        id: 'mguk_turbo', name: 'MGU-K & Turbo', subcategoryId: 'dur_pu', subcategoryName: 'Power Unit Reliability', tier: 'Ultimate', phase: 3, prereq: 'ice_dur',
        blurb: 'Silicon-nitride ceramic turbo shaft bearings surviving sustained 125,000 RPM operation in hot climates.',
        steps: [
          { spec: 1, phase: 3, rp: 1550, researchDays: 38, costPerCopy: 1.95, manufDays: 11, dp: 20, needsFacility: 3 }
        ]
      },

      // --- Subcategory 2: Gearbox & Wear Resistance ---
      {
        id: 'wear_parts', name: 'General Wear Parts', subcategoryId: 'dur_gearbox', subcategoryName: 'Gearbox & Wear Resistance', tier: 'Minor', phase: 1,
        blurb: 'Ceramic wheel bearings and titanium suspensionspherical bushes reducing mechanical attrition.',
        steps: [
          { spec: 1, phase: 1, rp: 340, researchDays: 14, costPerCopy: 0.40, manufDays: 6, dp: 14, needsFacility: 1 }
        ]
      },
      {
        id: 'gearbox_int', name: 'Gearbox Internals', subcategoryId: 'dur_gearbox', subcategoryName: 'Gearbox & Wear Resistance', tier: 'Major', phase: 2, prereq: 'wear_parts',
        blurb: 'Isotropic super-finished dog rings and bevel gears for seamless, zero-wear 8-speed shifts.',
        steps: [
          { spec: 1, phase: 2, rp: 780, researchDays: 25, costPerCopy: 1.00, manufDays: 8, dp: 16, needsFacility: 2 }
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

export const partsUnlockedBy = partId => {
  const res = [];
  for (const d of DEPARTMENTS) {
    for (const p of d.parts) {
      if (p.prereq === partId) {
        res.push({ ...p, dept: d.id, deptName: d.name });
      }
    }
  }
  return res;
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
  aggressive:   { label: 'Rush / Aggressive', timeFactor: 0.7, rpFactor: 1.5, d20: -2 },
  standard:     { label: 'Standard',          timeFactor: 1.0, rpFactor: 1.0, d20: 0 },
  conservative: { label: 'Conservative',      timeFactor: 1.3, rpFactor: 0.8, d20: 2 }
};
