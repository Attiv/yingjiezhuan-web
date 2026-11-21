import assert from 'node:assert/strict';

/** 使用真实流程生成隔离测试存档，再以实际按钮验证复制、编成和存读档。 */
export async function verifyTrainerRecruit(page, base) {
  await page.goto(`${base}/?seed=3`);
  await page.waitForFunction(() => !!window.__yjz?.scene?.b);
  const fixtures = await page.evaluate(async () => {
    const { SCRIPT } = await import('/src/data/game.ts');
    const { startStory, nextStep } = await import('/src/story.ts');
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei'] });
    const api = { join(s, id) { if (!s.party.includes(id)) s.party.push(id); }, away(s, id) { s.party = s.party.filter(x => x !== id); } };
    let camp;
    for (let i = 0; i < 1000; i++) {
      const step = nextStep(SCRIPT, st, 0, api);
      if (step?.t === 'room' && !camp) camp = structuredClone(st);
      if (step?.t === 'battle') return { camp, battle: structuredClone(st) };
    }
    throw new Error('未找到序章营地与战斗');
  });
  const load = async (story, battle) => {
    await page.evaluate(async ({ story, battle }) => {
      await window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify({ slots: [{ story, battle, at: Date.now() }], last: 0 }));
    }, { story, battle });
    await page.reload();
    await page.waitForSelector('[data-go="load"]');
    await page.click('[data-go="load"]');
    await page.click('[data-slot="0"][data-act="read"]');
  };
  const openTrainer = async () => {
    const p = await page.evaluate(() => { const r = document.getElementById('stage').getBoundingClientRect(); return { x: r.left + 8, y: r.top + 8 }; });
    for (let i = 0; i < 3; i++) await page.mouse.click(p.x, p.y);
    await page.waitForSelector('#gate:not([hidden])');
    await page.fill('#gate-pass', '1122');
    await page.keyboard.press('Enter');
    await page.waitForSelector('#trainer:not([hidden])');
  };
  await load(fixtures.camp);
  await page.waitForSelector('[data-room="prepare"]');
  await page.click('[data-room="prepare"]');
  await page.waitForSelector('[data-go="camp-go"]');
  await openTrainer();
  await page.selectOption('#tr-recruit', 'lu_bu');
  await page.click('[data-tr="recruit"]');
  await page.waitForFunction(() => window.__yjz.story.party.includes('lu_bu'));
  await page.click('[data-tr="close"]');
  assert.ok(await page.$('[data-pick="lu_bu"]'), '营地须立即显示新增武将，不能等重新进入');
  const recruited = await page.evaluate(() => structuredClone(window.__yjz.story.roster.lu_bu));
  assert.equal(recruited.trainerCopy, true);

  const battleStory = { ...fixtures.battle, party: [...fixtures.battle.party, 'lu_bu'], roster: { ...fixtures.battle.roster, lu_bu: recruited } };
  const battle = await page.evaluate(async st => {
    const { level } = await import('/src/data/game.ts');
    const { newBattle } = await import('/src/rules/turn.ts');
    return newBattle(level('c0_s0_b5'), 3, st.roster, { deploy: ['liu_bei', 'guan_yu', 'lu_bu'], flags: st.flags }).b;
  }, battleStory);
  await load(battleStory, battle);
  await page.waitForFunction(() => window.__yjz.mode === 'idle');
  const enemy = await page.evaluate(() => structuredClone(window.__yjz.b.units.find(u => u.slot >= 15 && u.key === 'hua_xiong')));
  assert.ok(await page.evaluate(() => window.__yjz.b.units.some(u => u.slot < 15 && u.key === 'lu_bu' && u.trainerCopy)), '营地加入的武将能带到战场');
  await openTrainer();
  await page.selectOption('#tr-recruit', 'hua_xiong');
  await page.click('[data-tr="recruit"]');
  await page.waitForFunction(() => window.__yjz.scene.tokens.size === window.__yjz.b.units.length && !!document.querySelector('[data-lv="hua_xiong"]'));
  assert.equal(await page.$('#tr-recruit option[value="hua_xiong"]'), null, '已入队武将不能重复复制');
  await page.fill('[data-lv="hua_xiong"]', String(enemy.level + 5));
  await page.press('[data-lv="hua_xiong"]', 'Tab');
  const copied = await page.evaluate(() => {
    const b = window.__yjz.b, u = b.units.find(u => u.slot < 15 && u.key === 'hua_xiong');
    return { friend: structuredClone(u), enemy: b.units.find(u => u.slot >= 15 && u.key === 'hua_xiong'), visible: window.__yjz.scene.tokens.get(u.slot).visible };
  });
  assert.equal(copied.friend.mode, 7);
  assert.equal(copied.friend.level, enemy.level + 5);
  assert.equal(copied.visible, true);
  assert.deepEqual(copied.enemy, enemy, '复制、修改我方副本后，敌将原数据保持不变');
  await page.click('[data-tr="close"]');
  await page.keyboard.press('s');
  await page.waitForFunction(() => !document.getElementById('save-notice').hidden);
  await page.reload();
  await page.waitForSelector('[data-go="load"]');
  await page.click('[data-go="load"]');
  await page.click('[data-slot="0"][data-act="read"]');
  await page.waitForFunction(() => window.__yjz.mode === 'idle');
  const restored = await page.evaluate(() => ({ party: window.__yjz.story.party, units: window.__yjz.b.units.filter(u => u.key === 'hua_xiong') }));
  assert.ok(restored.party.includes('lu_bu') && restored.party.includes('hua_xiong'));
  assert.deepEqual(restored.units.find(u => u.slot < 15), copied.friend, '读档恢复独立的我方副本');
  assert.deepEqual(restored.units.find(u => u.slot >= 15), enemy, '读档不覆盖敌方原武将');
  return '复制武将支持营地编成、战场即时登场和存读档，敌方原武将保持不变';
}
