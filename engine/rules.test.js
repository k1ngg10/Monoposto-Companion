import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for headless Node test environment
const mem = {};
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; }
};

const { getState, wipe, newSave, driverLiveStats } = await import('./store.js');
const { advance, canAdvanceCalendar } = await import('./timeEngine.js');
const { evaluateSpecUpgradeCorrelation } = await import('./rdEngine.js');
const { logResult } = await import('./raceSimulator.js');
const { contractWindowReport, isProtectedFranchiseDriver } = await import('./driverMarketEngine.js');
const { nextUnloggedRace, nextRace } = await import('../data/calendar2026.js');
const { activeDrivers, driverById } = await import('../data/teamsAndDrivers.js');

test('1. Calendar Gate: cannot skip an unlogged Grand Prix weekend when advancing time', () => {
  wipe();
  newSave({ teamId: 'porsche', ownerBg: 'head-engineer' });
  const s = getState();

  // Fast-forward day by day to Round 1 Australia Saturday (2026-03-07)
  while (s.date < '2026-03-07') {
    const evs = advance(s);
    assert.ok(!evs.some(e => e.type === 'race-locked'));
  }
  assert.equal(s.date, '2026-03-07');

  // Now at Round 1 Saturday with neither Qualifying nor GP logged -> advancing is blocked!
  const gate1 = canAdvanceCalendar(s);
  assert.equal(gate1.ok, false);
  assert.equal(gate1.blockedByRace.round, 1);

  const lockedEv = advance(s);
  assert.equal(lockedEv[0].type, 'race-locked');
  assert.equal(s.date, '2026-03-07', 'Date must remain held on 2026-03-07');

  // Simulate user at Round 2 Chinese GP Saturday (2026-03-14) after Round 1 is logged:
  const entriesR1 = {};
  activeDrivers(s).forEach((d, idx) => { entriesR1[d.id] = idx + 1; });
  logResult(s, 1, entriesR1, 'Dry', 58);

  while (s.date < '2026-03-14') {
    advance(s);
  }
  assert.equal(s.date, '2026-03-14');
  assert.equal(nextUnloggedRace(s).round, 2);
  assert.equal(nextRace(s.date, s).round, 2, 'nextRace must still point to unlogged Round 2 Chinese GP');

  // Attempt to advance without logging Chinese GP -> blocked, never jumps to Round 3 Japan
  const lockedChina = advance(s);
  assert.equal(lockedChina[0].type, 'race-locked');
  assert.equal(lockedChina[0].race.gp, 'Chinese Grand Prix');
  assert.equal(s.date, '2026-03-14');
});

test('2. Spec Upgrade Correlation & Depletion: realistic temporary boost (1-2 GP lower teams, 2-3 GP top teams) and no +8/+10 runaway', () => {
  wipe();
  newSave({ teamId: 'porsche', ownerBg: 'head-engineer' }); // Apple Porsche has carPower 5 (lower/midfield team)
  const s = getState();

  // Force an optimal roll (0.10) on a lower/midfield team (carPower 5)
  const corrLow = evaluateSpecUpgradeCorrelation(s, { id: 'fw_flaps', name: 'Front Wing Flaps' }, 1, 0.10);
  assert.equal(corrLow.outcome, 'optimal');
  assert.equal(corrLow.delta, 1);
  assert.ok(corrLow.racesLeft >= 1 && corrLow.racesLeft <= 2, `Lower team boost must last 1-2 races, got ${corrLow.racesLeft}`);

  // Force a problematic roll (0.98) -> track correlation issue (-1 SPD for 1 race)
  const corrProb = evaluateSpecUpgradeCorrelation(s, { id: 'fl_edge', name: 'Floor Edge Wing' }, 1, 0.98);
  assert.equal(corrProb.outcome, 'problematic');
  assert.equal(corrProb.delta, -1);
  assert.equal(corrProb.racesLeft, 1);

  // Apply optimal upgrade to Jun-seo Han (car2, base speed 7)
  s.specEffects.car2 = {
    partId: 'fw_flaps',
    partName: 'Front Wing Flaps',
    spec: 1,
    outcome: 'optimal',
    delta: 1,
    racesLeft: 2,
    initialRaces: 2
  };
  // Even if Han also has a hot streak (+1), total speed delta is capped at +1 (never +2 or more)
  s.driverAdjustments['han'] = { speedDelta: 1, riskDelta: 0, hotStreak: 3, coldStreak: 0, dnfStreak: 0 };
  const liveHan = driverLiveStats('han', s);
  assert.equal(liveHan.baseSpeed, 7);
  assert.equal(liveHan.speed, 8, 'Combined spec + form delta must never exceed +1 above base speed');

  // Log 2 races and verify the spec boost depletes back to 0 as rival teams catch up
  const entries = {};
  activeDrivers(s).forEach((d, idx) => { entries[d.id] = idx + 1; });
  logResult(s, 1, entries, 'Dry', 58);
  assert.equal(s.specEffects.car2.racesLeft, 1, 'After 1 GP, 1 race of spec boost remains');

  logResult(s, 2, entries, 'Dry', 56);
  assert.equal(s.specEffects.car2, null, 'After 2 GPs, spec boost has depleted to null');

  // Verify higher/contender team (Mercedes, carPower 7) gets 2-3 races on an optimal spec roll
  wipe();
  newSave({ teamId: 'mercedes', ownerBg: 'head-engineer' });
  const sTop = getState();
  const corrTop = evaluateSpecUpgradeCorrelation(sTop, { id: 'fw_flaps', name: 'Front Wing Flaps' }, 1, 0.05);
  assert.equal(corrTop.outcome, 'optimal');
  assert.ok(corrTop.racesLeft >= 2 && corrTop.racesLeft <= 3, `Top team boost must last 2-3 races, got ${corrTop.racesLeft}`);
});

test('3. Seat Security Rules: Champions & Franchise Drivers are protected when high-risk rookies outscore them; rookies face Hot Seat', () => {
  wipe();
  newSave({ teamId: 'redbull', ownerBg: 'racer' });
  const s = getState();

  // Day 1 check: 0 rounds logged -> no Retirement Watch and no Hot Seat
  const day1Report = contractWindowReport(s).report;
  assert.equal(day1Report.filter(r => r.rule === 1).length, 0, 'No Retirement Watch on Day 1');
  assert.equal(day1Report.filter(r => r.rule === 2 && r.risk > 0).length, 0, 'No Hot Seat on Day 1');

  // Verify Max Verstappen ('ver'), Lewis Hamilton ('ham'), Charles Leclerc ('lec'), Fernando Alonso ('alo') are protected franchise drivers
  assert.equal(isProtectedFranchiseDriver(driverById('ver', s)), true);
  assert.equal(isProtectedFranchiseDriver(driverById('ham', s)), true);
  assert.equal(isProtectedFranchiseDriver(driverById('lec', s)), true);
  assert.equal(isProtectedFranchiseDriver(driverById('alo', s)), true);
  assert.equal(isProtectedFranchiseDriver(driverById('had', s)), false);

  // Simulate 5 rounds where rookie Isack Hadjar ('had', RSK 8) wins (125 pts) while Max Verstappen ('ver') has 20 pts,
  // and veteran George Russell ('rus') wins (90 pts) while rookie Kimi Antonelli ('ant') has 10 pts.
  for (let r = 1; r <= 5; r++) {
    s.results[r] = { entries: { had: 1, ver: 8, rus: 2, ant: 10 }, laps: 55, conditions: 'Dry' };
  }
  s.points.had = 125;
  s.points.ver = 20;
  s.points.rus = 90;
  s.points.ant = 10;

  const midReport = contractWindowReport(s).report;
  const maxEntry = midReport.find(r => r.driver.id === 'ver');
  assert.ok(maxEntry, 'Verstappen has a status note');
  assert.equal(maxEntry.risk, 0, 'World Champion Max Verstappen must have 0% sack risk even when trailing high-risk rookie Hadjar');

  const kimiEntry = midReport.find(r => r.driver.id === 'ant' && r.rule === 2);
  assert.ok(kimiEntry && kimiEntry.risk >= 55, 'Underperforming rookie Antonelli (<45% of Russell points) is placed on the Hot Seat');
});
