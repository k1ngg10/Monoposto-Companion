// SPONSORS & POWER UNITS.
// Every team has 4 distinct official sponsors on its board (Pick 2 Active of 4):
//   Slot 1 — Title / Upfront Capital Partner: HIGHEST Day 1 Signing Base, LOWEST Weekly Income.
//   Slot 2 — Performance Partner:             HIGH Signing Base, LOW-MID Weekly, HIGHEST Race Goal Bonus.
//   Slot 3 — Balanced Official Partner:       MODERATE Signing Base, HIGH Weekly Income, BALANCED Race Goal.
//   Slot 4 — Weekly Cashflow Partner:         LOWEST Day 1 Signing Base, HIGHEST Weekly Income (+38 wks).
//
// The 2 non-selected sponsors on a team's board act as Passive Board Partners,
// contributing a flat 35% passive retainer of their Signing & Weekly base so that
// picking WHICH 2 sponsors are your Primary Active Partners directly shapes your
// Day 1 bank balance vs. your 38-week recurring cashflow.
//
// All 12 teams operate under the $213M F1 Cost Cap, so sponsor boards are balanced
// within a tight, fair band across all 12 teams, and Works teams pay an In-House
// Factory PU Cap Allocation on Day 1 so Works and Customer teams start on an equal footing.

import { LOGO_DATA } from './logoData.js?v=20261022h';

const WHITE_WELL = 'linear-gradient(135deg, #ffffff 0%, #f1f4f9 100%)';

export const TEAM_SPONSORS = {
  porsche: [
    {
      id: 'applemusic', name: 'Apple Music', role: 'Title Sponsor / Entertainment',
      strategyTag: 'HIGH BASE · LOW WEEKLY',
      signingM: 5.10, weeklyK: 115, goalK: 190, value: 13.65,
      objectiveType: 'Brand Exposure',
      logo: 'assets/logos/applemusic.svg',
      logoBg: WHITE_WELL,
      objective: 'Score constructors\u2019 points in 3 consecutive races'
    },
    {
      id: 'tagheuer', name: 'TAG Heuer', role: 'Official Timekeeper & Performance Partner',
      strategyTag: 'HIGH RACE GOAL BONUS',
      signingM: 3.80, weeklyK: 160, goalK: 275, value: 15.93,
      objectiveType: 'Performance Targets',
      logo: 'assets/logos/tagheuer.svg',
      logoBg: 'linear-gradient(135deg, #262c36 0%, #141820 100%)',
      objective: 'Beat your teammate in qualifying at the Grand Prix'
    },
    {
      id: 'boss', name: 'BOSS', role: 'Official Team Apparel & Lifestyle Partner',
      strategyTag: 'BALANCED BASE & WEEKLY',
      signingM: 2.65, weeklyK: 235, goalK: 185, value: 15.65,
      objectiveType: 'Hospitality & Events',
      logo: 'assets/logos/boss.svg',
      logoBg: WHITE_WELL,
      objective: 'Classify both cars inside the Top 12 on Sunday'
    },
    {
      id: 'mobil1', name: 'Mobil 1', role: 'Fuel & Lubricants Partner',
      strategyTag: 'LOWEST BASE · HIGHEST WEEKLY',
      signingM: 1.65, weeklyK: 315, goalK: 145, value: 16.81,
      objectiveType: 'Technical Collaboration',
      logo: 'assets/logos/mobil1.svg',
      logoBg: WHITE_WELL,
      objective: 'Complete full race distance with zero PU reliability faults'
    }
  ],
  haas: [
    {
      id: 'tgr', name: 'Toyota Gazoo Racing (TGR)', role: 'Title Technical Partner',
      strategyTag: 'HIGH BASE · LOW WEEKLY',
      signingM: 5.00, weeklyK: 115, goalK: 185, value: 13.44,
      objectiveType: 'Technical Collaboration',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Toyota_Gazoo_Racing_logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Beat at least one factory team car in the classification'
    },
    {
      id: 'haascnc', name: 'Haas Automation', role: 'Founding CNC & Manufacturing Partner',
      strategyTag: 'HIGH RACE GOAL BONUS',
      signingM: 3.75, weeklyK: 160, goalK: 265, value: 15.66,
      objectiveType: 'Performance Targets',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Haas_Automation_Logo.png',
      logoBg: WHITE_WELL,
      objective: 'Finish P10 or better to score a championship point'
    },
    {
      id: 'playngo', name: "Play'n GO", role: 'Official Entertainment Partner',
      strategyTag: 'BALANCED BASE & WEEKLY',
      signingM: 2.60, weeklyK: 235, goalK: 180, value: 15.49,
      objectiveType: 'Brand Exposure',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/PLAYNGO_LOGO.png',
      logoBg: WHITE_WELL,
      objective: 'Classify both cars inside the Top 14'
    },
    {
      id: 'exein', name: 'Exein', role: 'Embedded Cybersecurity Partner',
      strategyTag: 'LOWEST BASE · HIGHEST WEEKLY',
      signingM: 1.60, weeklyK: 310, goalK: 140, value: 16.46,
      objectiveType: 'Technical Collaboration',
      logo: 'https://i.postimg.cc/v8pCHQPF/68824c8009d127986a1f489d-exein-logo.jpg',
      logoBg: WHITE_WELL,
      objective: 'Complete the race with zero retirements'
    }
  ],
  redbull: [
    {
      id: 'oracle', name: 'Oracle', role: 'Title Sponsor / Tech Provider',
      strategyTag: 'HIGH BASE · LOW WEEKLY',
      signingM: 5.20, weeklyK: 115, goalK: 195, value: 13.86,
      objectiveType: 'Performance Targets',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Finish on the podium at the Grand Prix'
    },
    {
      id: 'ford', name: 'Ford', role: 'Technical & Engine Partner',
      strategyTag: 'HIGH RACE GOAL BONUS',
      signingM: 3.85, weeklyK: 160, goalK: 280, value: 16.09,
      objectiveType: 'Technical Collaboration',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Ford_Motor_Company_Logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Score points with both cars in the same race'
    },
    {
      id: 'mobil1rb', name: 'Mobil 1', role: 'Fuel & Lubricants Partner',
      strategyTag: 'BALANCED BASE & WEEKLY',
      signingM: 2.65, weeklyK: 235, goalK: 185, value: 15.65,
      objectiveType: 'Technical Collaboration',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Mobil1_logo.png',
      logoBg: WHITE_WELL,
      objective: 'Finish inside the Top 6 with at least one car'
    },
    {
      id: '1password', name: '1Password', role: 'Official Cybersecurity Partner',
      strategyTag: 'LOWEST BASE · HIGHEST WEEKLY',
      signingM: 1.65, weeklyK: 315, goalK: 145, value: 16.81,
      objectiveType: 'Brand Exposure',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/02/1Password_wordmark_blue_2023.svg',
      logoBg: WHITE_WELL,
      objective: 'Complete full race distance without a DNF'
    }
  ],
  mercedes: [
    {
      id: 'petronas', name: 'Petronas', role: 'Title Sponsor / Fuel & Oil',
      strategyTag: 'HIGH BASE · LOW WEEKLY',
      signingM: 5.20, weeklyK: 115, goalK: 195, value: 13.86,
      objectiveType: 'Brand Exposure',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/PETRONAS_Logo_%282013%29.png',
      logoBg: WHITE_WELL,
      objective: 'Finish inside the Top 4 with at least one car'
    },
    {
      id: 'ineos', name: 'INEOS', role: 'Principal Partner & Team Co-Owner',
      strategyTag: 'HIGH RACE GOAL BONUS',
      signingM: 3.90, weeklyK: 160, goalK: 280, value: 16.14,
      objectiveType: 'Performance Targets',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/INEOS_logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Score a podium finish at the Grand Prix'
    },
    {
      id: 'microsoft', name: 'Microsoft', role: 'Tech & Cloud Infrastructure',
      strategyTag: 'BALANCED BASE & WEEKLY',
      signingM: 2.70, weeklyK: 235, goalK: 185, value: 15.70,
      objectiveType: 'Technical Collaboration',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
      logoBg: WHITE_WELL,
      objective: 'Finish both cars in the points on Sunday'
    },
    {
      id: 'adidasmerc', name: 'Adidas', role: 'Official Kit & Luxury Lifestyle Gear',
      strategyTag: 'LOWEST BASE · HIGHEST WEEKLY',
      signingM: 1.70, weeklyK: 315, goalK: 145, value: 16.86,
      objectiveType: 'Hospitality & Events',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Classify both cars inside the Top 10'
    }
  ],
  ferrari: [
    {
      id: 'hp', name: 'HP', role: 'Title Sponsor / Tech Partner',
      strategyTag: 'HIGH BASE · LOW WEEKLY',
      signingM: 5.20, weeklyK: 115, goalK: 195, value: 13.86,
      objectiveType: 'Brand Exposure',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg',
      logoBg: WHITE_WELL,
      objective: 'Score a podium or double Top-6 finish'
    },
    {
      id: 'shell', name: 'Shell', role: 'Historical Fuel & Primary Innovation Partner',
      strategyTag: 'HIGH RACE GOAL BONUS',
      signingM: 3.90, weeklyK: 160, goalK: 280, value: 16.14,
      objectiveType: 'Technical Collaboration',
      logo: 'assets/logos/sp-shell.svg',
      logoBg: 'linear-gradient(135deg, #dd1d21 0%, #960f12 100%)',
      objective: 'Zero PU failures and at least one car in the Top 5'
    },
    {
      id: 'unicredit', name: 'UniCredit', role: 'Major Global Banking Partner',
      strategyTag: 'BALANCED BASE & WEEKLY',
      signingM: 2.70, weeklyK: 235, goalK: 185, value: 15.70,
      objectiveType: 'Hospitality & Events',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Unicredit_logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Gain at least 2 positions from grid slot in the race'
    },
    {
      id: 'pumafer', name: 'PUMA', role: 'Official Team Apparel & Racewear',
      strategyTag: 'LOWEST BASE · HIGHEST WEEKLY',
      signingM: 1.70, weeklyK: 315, goalK: 145, value: 16.86,
      objectiveType: 'Brand Exposure',
      logo: 'https://upload.wikimedia.org/wikipedia/fr/7/72/Puma.svg',
      logoBg: WHITE_WELL,
      objective: 'Complete the race distance with both cars classified'
    }
  ],
  mclaren: [
    {
      id: 'mastercard', name: 'Mastercard', role: 'Title Sponsor / Finance',
      strategyTag: 'HIGH BASE · LOW WEEKLY',
      signingM: 5.15, weeklyK: 115, goalK: 195, value: 13.81,
      objectiveType: 'Brand Exposure',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Finish inside the Top 5 with at least one car'
    },
    {
      id: 'okx', name: 'OKX', role: 'Major Crypto & Digital Exchange Partner',
      strategyTag: 'HIGH RACE GOAL BONUS',
      signingM: 3.85, weeklyK: 160, goalK: 275, value: 15.98,
      objectiveType: 'Performance Targets',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/OKX_Logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Score points with both cars on Sunday'
    },
    {
      id: 'google', name: 'Google Chrome', role: 'Primary Tech & Browser Partner',
      strategyTag: 'BALANCED BASE & WEEKLY',
      signingM: 2.65, weeklyK: 235, goalK: 185, value: 15.65,
      objectiveType: 'Brand Exposure',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg',
      logoBg: WHITE_WELL,
      objective: 'Beat a rival Contender team car in the classification'
    },
    {
      id: 'gemini', name: 'Gemini', role: 'Official Cloud & Ecosystem Partner',
      strategyTag: 'LOWEST BASE · HIGHEST WEEKLY',
      signingM: 1.65, weeklyK: 315, goalK: 145, value: 16.81,
      objectiveType: 'Technical Collaboration',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Google_Gemini_icon_2025.svg',
      logoBg: WHITE_WELL,
      objective: 'Classify both cars with zero mechanical retirements'
    }
  ],
  aston: [
    {
      id: 'aramco', name: 'Aramco', role: 'Title Sponsor / Energy & Chemicals',
      strategyTag: 'HIGH BASE · LOW WEEKLY',
      signingM: 5.05, weeklyK: 115, goalK: 190, value: 13.60,
      objectiveType: 'Brand Exposure',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Saudi_Aramco_logo_without_star.png',
      logoBg: WHITE_WELL,
      objective: 'Score a Top-6 finish this weekend'
    },
    {
      id: 'hondaaston', name: 'Honda', role: 'Works Engine Partner',
      strategyTag: 'HIGH RACE GOAL BONUS',
      signingM: 3.75, weeklyK: 160, goalK: 270, value: 15.77,
      objectiveType: 'Technical Collaboration',
      logo: 'https://i.postimg.cc/3rzJ3P42/c260113eng-01.jpg',
      logoBg: WHITE_WELL,
      objective: 'Finish both cars inside the Top 10'
    },
    {
      id: 'cognizant', name: 'Cognizant', role: 'Primary IT & Digital Consulting Sponsor',
      strategyTag: 'BALANCED BASE & WEEKLY',
      signingM: 2.60, weeklyK: 235, goalK: 185, value: 15.60,
      objectiveType: 'Performance Targets',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Cognizant_logo_2022.svg',
      logoBg: WHITE_WELL,
      objective: 'Finish P8 or better in the race classification'
    },
    {
      id: 'jcb', name: 'JCB', role: 'Official Heavy Machinery & Engineering Partner',
      strategyTag: 'LOWEST BASE · HIGHEST WEEKLY',
      signingM: 1.65, weeklyK: 310, goalK: 145, value: 16.62,
      objectiveType: 'Hospitality & Events',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/JCB_%28J.C._Bamford_Excavators_Limited%29_logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Classify both cars with zero mechanical retirements'
    }
  ],
  williams: [
    {
      id: 'atlassian', name: 'Atlassian', role: 'Title Sponsor / Software & Tech Workflow',
      strategyTag: 'HIGH BASE · LOW WEEKLY',
      signingM: 5.00, weeklyK: 115, goalK: 185, value: 13.44,
      objectiveType: 'Brand Exposure',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Atlassian-logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Score championship points this weekend'
    },
    {
      id: 'barclays', name: 'Barclays', role: 'Major Banking & Financial Partner',
      strategyTag: 'HIGH RACE GOAL BONUS',
      signingM: 3.70, weeklyK: 160, goalK: 265, value: 15.61,
      objectiveType: 'Performance Targets',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Barclays-Logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Finish inside the Top 9 with either car'
    },
    {
      id: 'claude', name: 'Claude', role: 'Official Digital & Systems Partner',
      strategyTag: 'BALANCED BASE & WEEKLY',
      signingM: 2.60, weeklyK: 235, goalK: 180, value: 15.49,
      objectiveType: 'Technical Collaboration',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Claude_AI_logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Finish ahead of at least two midfield rival cars'
    },
    {
      id: 'duracell', name: 'Duracell', role: 'Prominent Battery & Electronics Sponsor',
      strategyTag: 'LOWEST BASE · HIGHEST WEEKLY',
      signingM: 1.60, weeklyK: 310, goalK: 140, value: 16.46,
      objectiveType: 'Technical Collaboration',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Duracell_logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Zero crash-damage or battery DNFs during the Grand Prix'
    }
  ],
  audi: [
    {
      id: 'revolut', name: 'Revolut', role: 'Title Sponsor / Fintech Banking',
      strategyTag: 'HIGH BASE · LOW WEEKLY',
      signingM: 5.05, weeklyK: 115, goalK: 190, value: 13.60,
      objectiveType: 'Brand Exposure',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Revolut_logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Score points in your works debut season'
    },
    {
      id: 'bp', name: 'bp', role: 'Fuel & Oil Innovation Partner',
      strategyTag: 'HIGH RACE GOAL BONUS',
      signingM: 3.75, weeklyK: 160, goalK: 270, value: 15.77,
      objectiveType: 'Technical Collaboration',
      logo: 'https://upload.wikimedia.org/wikipedia/en/d/d2/BP_Helios_logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Finish inside the Top 8 at the Grand Prix'
    },
    {
      id: 'ninjaone', name: 'NinjaOne', role: 'Automated Endpoint Management Partner',
      strategyTag: 'BALANCED BASE & WEEKLY',
      signingM: 2.60, weeklyK: 235, goalK: 185, value: 15.60,
      objectiveType: 'Technical Collaboration',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/86/NinjaOne_logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Beat your grid starting slot with both cars'
    },
    {
      id: 'qatarairways', name: 'Qatar Airways', role: 'Tourism & Sovereign Commercial Partner',
      strategyTag: 'LOWEST BASE · HIGHEST WEEKLY',
      signingM: 1.65, weeklyK: 310, goalK: 145, value: 16.62,
      objectiveType: 'Hospitality & Events',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Qatar_Airways_logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Finish both cars inside the Top 14 with zero penalties'
    }
  ],
  cadillac: [
    {
      id: 'gm', name: 'General Motors / Cadillac', role: 'Foundational Auto Manufacturer',
      strategyTag: 'HIGH BASE · LOW WEEKLY',
      signingM: 4.95, weeklyK: 115, goalK: 185, value: 13.39,
      objectiveType: 'Technical Collaboration',
      logo: 'assets/logos/sp-generalmotors.svg',
      logoBg: 'linear-gradient(135deg, #0055a5 0%, #002e5d 100%)',
      objective: 'Finish inside the Top 12 with at least one car'
    },
    {
      id: 'twg', name: 'TWG', role: 'Principal Motorsports Partner',
      strategyTag: 'HIGH RACE GOAL BONUS',
      signingM: 3.70, weeklyK: 160, goalK: 265, value: 15.61,
      objectiveType: 'Performance Targets',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/47/TWG_Motorsports_Logo.png',
      logoBg: WHITE_WELL,
      objective: 'Score a Top-10 finish in your debut season'
    },
    {
      id: 'tommy', name: 'Tommy Hilfiger', role: 'Official Team Apparel & Fashion House',
      strategyTag: 'BALANCED BASE & WEEKLY',
      signingM: 2.60, weeklyK: 235, goalK: 180, value: 15.49,
      objectiveType: 'Brand Exposure',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Tommy_Hilfiger_Logo.png',
      logoBg: WHITE_WELL,
      objective: 'Out-qualify a rival customer team'
    },
    {
      id: 'ifs', name: 'IFS', role: 'Enterprise Cloud & Asset Management Partner',
      strategyTag: 'LOWEST BASE · HIGHEST WEEKLY',
      signingM: 1.60, weeklyK: 310, goalK: 140, value: 16.46,
      objectiveType: 'Technical Collaboration',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/IFS_logo_2021.png',
      logoBg: WHITE_WELL,
      objective: 'Both cars classified at the chequered flag'
    }
  ],
  bmw: [
    {
      id: 'iqoo', name: 'iQOO', role: 'Title Sponsor / Performance Mobile Partner',
      strategyTag: 'HIGH BASE · LOW WEEKLY',
      signingM: 5.00, weeklyK: 115, goalK: 185, value: 13.44,
      objectiveType: 'Brand Exposure',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Iqoo.svg',
      logoBg: WHITE_WELL,
      objective: 'Score championship points in your debut season'
    },
    {
      id: 'shellbmw', name: 'Shell', role: 'Official Fuel & Lubricants Innovation Partner',
      strategyTag: 'HIGH RACE GOAL BONUS',
      signingM: 3.75, weeklyK: 160, goalK: 265, value: 15.66,
      objectiveType: 'Technical Collaboration',
      logo: 'assets/logos/sp-shell.svg',
      logoBg: 'linear-gradient(135deg, #dd1d21 0%, #960f12 100%)',
      objective: 'Finish inside the Top 10 with zero PU faults'
    },
    {
      id: 'allianz', name: 'Allianz', role: 'Global Financial & Insurance Partner',
      strategyTag: 'BALANCED BASE & WEEKLY',
      signingM: 2.60, weeklyK: 235, goalK: 180, value: 15.49,
      objectiveType: 'Hospitality & Events',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Allianz.svg',
      logoBg: WHITE_WELL,
      objective: 'Finish inside the Top 12 with at least one car'
    },
    {
      id: 'deutschebank', name: 'Deutsche Bank', role: 'Corporate Banking & Capital Partner',
      strategyTag: 'LOWEST BASE · HIGHEST WEEKLY',
      signingM: 1.60, weeklyK: 310, goalK: 140, value: 16.46,
      objectiveType: 'Brand Exposure',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Deutsche_Bank-Logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Classify both cars inside the Top 15 on Sunday'
    }
  ],
  byd: [
    {
      id: 'huawei', name: 'Huawei', role: 'Title Sponsor / 5G & Telemetry Systems',
      strategyTag: 'HIGH BASE · LOW WEEKLY',
      signingM: 5.00, weeklyK: 115, goalK: 185, value: 13.44,
      objectiveType: 'Technical Collaboration',
      logo: 'https://upload.wikimedia.org/wikipedia/en/0/04/Huawei_Standard_logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Finish inside the Top 8 at the Grand Prix'
    },
    {
      id: 'catl', name: 'CATL', role: 'High-Density Energy Store & Battery Partner',
      strategyTag: 'HIGH RACE GOAL BONUS',
      signingM: 3.75, weeklyK: 160, goalK: 265, value: 15.66,
      objectiveType: 'Technical Collaboration',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Contemporary_Amperex_Technology_logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Score championship points with either driver'
    },
    {
      id: 'tencent', name: 'Tencent', role: 'Digital Cloud & Global Media Partner',
      strategyTag: 'BALANCED BASE & WEEKLY',
      signingM: 2.60, weeklyK: 235, goalK: 180, value: 15.49,
      objectiveType: 'Brand Exposure',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Tencent_Logo.svg',
      logoBg: WHITE_WELL,
      objective: 'Gain at least 3 positions across both cars on Sunday'
    },
    {
      id: 'lenovo', name: 'Lenovo', role: 'High-Performance CFD & Trackside Computing',
      strategyTag: 'LOWEST BASE · HIGHEST WEEKLY',
      signingM: 1.60, weeklyK: 310, goalK: 140, value: 16.46,
      objectiveType: 'Technical Collaboration',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Lenovo_Global_Corporate_Logo.png',
      logoBg: WHITE_WELL,
      objective: 'Classify both cars without a retirement'
    }
  ]
};

// Back-compat: the Porsche board under its old name.
export const SPONSORS = TEAM_SPONSORS.porsche;
export const sponsorsOfTeam = teamId => TEAM_SPONSORS[teamId] || [];
export const sponsorById = (teamId, id) => typeof id === 'undefined'
  ? SPONSORS.find(s => s.id === teamId)
  : sponsorsOfTeam(teamId).find(s => s.id === id);

export function fmtCompact$(valM) {
  const n = +valM;
  if (Math.abs(n) >= 1) return '$' + n.toFixed(2) + 'M';
  return '$' + Math.round(n * 1000) + 'k';
}

// Returns explicit Signing Base (Day 1), Weekly Income (38 weeks), and Race Goal Bonus (22 races).
// Each sponsor has distinct Signing vs Weekly vs Goal payouts so that Slot 1 has the highest
// upfront base and lowest weekly, while Slot 4 has the lowest upfront base and highest weekly.
export function sponsorBreakdown(sp) {
  const signingBonus = typeof sp.signingM === 'number' ? sp.signingM : +(sp.value * 0.30).toFixed(2);
  const weeklyBase = typeof sp.weeklyK === 'number' ? sp.weeklyK / 1000 : (sp.value * 0.40) / 38;
  const raceGoalBonus = typeof sp.goalK === 'number' ? sp.goalK / 1000 : (sp.value * 0.30) / 22;
  const seasonTotal = +(signingBonus + weeklyBase * 38 + raceGoalBonus * 22).toFixed(2);
  return {
    signingM: signingBonus,
    weeklyM: weeklyBase,
    goalM: raceGoalBonus,
    signingBonus,
    weeklyBase,
    raceGoalBonus,
    seasonTotal,
    signingText: '$' + signingBonus.toFixed(2) + 'M',
    weeklyText: '+$' + Math.round(weeklyBase * 1000) + 'k/wk',
    goalText: '+$' + Math.round(raceGoalBonus * 1000) + 'k/race'
  };
}

// Computes the team's Day 1 Signing Cash and Weekly Sponsor Income based on the 2 chosen active sponsors!
// The 2 chosen active sponsors pay 100% of their Signing Base, 100% of their Weekly Income, and unlock their Race Goal Bonus.
// The 2 non-selected sponsors on the board act as Passive Board Partners (paying 35% of their signing & weekly base).
export function computeSponsorEconomy(teamId, activeSponsorIds = []) {
  const board = sponsorsOfTeam(teamId);
  if (!board.length) return { signingCashM: 10.0, weeklyIncomeM: 0.48, goalPerRaceM: 0.35, totalContractM: 36.0 };

  const validBoardIds = board.filter(sp => activeSponsorIds && activeSponsorIds.includes(sp.id)).map(sp => sp.id);
  const pickedIds = validBoardIds.length
    ? validBoardIds
    : [board[0].id, board[1]?.id].filter(Boolean);

  let signingCashM = 0;
  let weeklyIncomeM = 0;
  let goalPerRaceM = 0;

  for (const sp of board) {
    const bk = sponsorBreakdown(sp);
    const isActive = pickedIds.includes(sp.id);
    if (isActive) {
      signingCashM += bk.signingM;
      weeklyIncomeM += bk.weeklyM;
      goalPerRaceM += bk.goalM;
    } else {
      // Passive board partner retainer (35% of base & weekly, 0 race goal)
      signingCashM += bk.signingM * 0.35;
      weeklyIncomeM += bk.weeklyM * 0.35;
    }
  }

  signingCashM = +signingCashM.toFixed(2);
  weeklyIncomeM = +weeklyIncomeM.toFixed(3);
  goalPerRaceM = +goalPerRaceM.toFixed(3);
  const totalContractM = +(signingCashM + weeklyIncomeM * 38 + goalPerRaceM * 22).toFixed(2);

  return {
    signingCashM,
    weeklyIncomeM,
    weeklyIncomeK: Math.round(weeklyIncomeM * 1000),
    goalPerRaceM,
    goalPerRaceK: Math.round(goalPerRaceM * 1000),
    totalContractM
  };
}

export const totalSponsorValue = (teamId, activeSponsorIds) => {
  const board = teamId ? sponsorsOfTeam(teamId) : SPONSORS;
  if (Array.isArray(activeSponsorIds) && activeSponsorIds.length) {
    return computeSponsorEconomy(teamId, activeSponsorIds).totalContractM;
  }
  return +board.reduce((a, s) => a + sponsorBreakdown(s).seasonTotal, 0).toFixed(2);
};

// PU suppliers.
// Under the $213M F1 Cost Cap, Works teams pay their In-House Works PU R&D & Dyno Cap Allocation (`worksCost`),
// while Customer teams pay the Customer Supply Contract (`cost`).
export const PU_SUPPLIERS = [
  { id: 'mercedes',    name: 'Mercedes-AMG',         performance: 94, durability: 92, cost: 4.1, worksCost: 3.8, logo: 'assets/logos/team-mercedes.svg' },
  { id: 'ferrari',     name: 'Ferrari',              performance: 92, durability: 90, cost: 3.8, worksCost: 3.6, logo: 'assets/logos/team-ferrari.svg' },
  { id: 'redbullford', name: 'Red Bull Powertrains', performance: 90, durability: 87, cost: 3.4, worksCost: 3.3, logo: LOGO_DATA.puRedbull },
  { id: 'audi',        name: 'Audi',                 performance: 85, durability: 78, cost: 2.6, worksCost: 2.8, logo: 'assets/logos/team-audi.svg' },
  { id: 'honda',       name: 'Honda (Aston Martin)', performance: 84, durability: 76, cost: 2.1, worksCost: 2.4, logo: LOGO_DATA.honda },
  { id: 'porsche',     name: 'Porsche (Works)',      performance: 82, durability: 74, cost: 3.0, worksCost: 3.0, logo: LOGO_DATA.porsche }
];
export const puById = id => PU_SUPPLIERS.find(p => p.id === id);

export function puContractCost(team, pu) {
  if (!team || !pu) return 0;
  return team.works ? +(pu.worksCost ?? pu.cost ?? 3.0) : +pu.cost;
}

// Owner backgrounds (F1 25 creation funnel — screen-read facts).
export const OWNER_BACKGROUNDS = [
  { id: 'peoples-manager', name: "People's Manager", perk: '+10% facility improvement speed' },
  { id: 'head-engineer',   name: 'Head Engineer',    perk: '+10% weekly RP generation' },
  { id: 'cfo',             name: 'CFO',              perk: '+10% weekly cash income' }
];
