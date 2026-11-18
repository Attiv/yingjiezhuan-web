// 定向浏览器回归：由调用方提供已打开的 Page，兼容项目测试页与受控浏览器。
// 测试存档从真实 SCRIPT 路线生成；仅在独立测试 origin 的第3–6槽放置 fixture。
// verifyBeihaiRoom / verifyXuzhouRooms 覆盖北海赠金与徐州人物路线选择。
import assert from 'node:assert/strict';

export async function roomFixtures(page) {
  return page.evaluate(async () => {
    const { SCRIPT, officers } = await import('/src/data/game.ts');
    const { startStory, nextStep } = await import('/src/story.ts');
    const fixtures = {};
    for (const route of [0, 1]) {
      const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei'] });
      const api = {
        join(s, id) { if (!s.party.includes(id)) s.party.push(id); },
        away(s, id) { s.party = s.party.filter(x => x !== id); },
      };
      let step = nextStep(SCRIPT, st, 0, api);
      for (let n = 0; step && n < 4000; n++) {
        if (step.t === 'room') {
          const copy = JSON.parse(JSON.stringify(st));
          copy.gold = 2000;
          copy.roster = Object.fromEntries(copy.party.map(id => [id, { level: officers[id]?.level ?? 1, exp: 0, items: [] }]));
          fixtures[step.id] = copy;
          if (step.id === 'c1_s0_story5:b5g4' || step.id === 'c1_s0_story8:b8g1') break;
        }
        step = nextStep(SCRIPT, st, step.t === 'choice' ? route : 0, api);
      }
    }
    return fixtures;
  });
}

const state = page => page.evaluate(() => ({
  story: JSON.parse(JSON.stringify(window.__yjz.story)),
  people: [...document.querySelectorAll('.actor')].map(e => Number(e.dataset.who)).sort((a, b) => a - b),
  walking: document.querySelectorAll('.actor.walking').length,
  room: !!document.querySelector('.room-controls'),
  talk: !document.getElementById('talk').hidden,
  ask: !!document.querySelector('#talk:not([hidden]) .ask'),
  line: document.querySelector('#talk p')?.textContent ?? '',
  face: document.querySelector('#talk .face')?.getAttribute('style') ?? '',
}));

async function until(page, expected, pick = 0) {
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    const s = await page.evaluate(() => ({
      room: document.querySelector('.room-controls') ? window.__yjz.story.resume?.id : '',
      camp: !!document.querySelector('[data-go="camp-go"]'),
      talk: !document.getElementById('talk').hidden,
      ask: !!document.querySelector('#talk:not([hidden]) .ask'),
      chapter: !!document.querySelector('.chapter'),
      pc: window.__yjz.story.pc,
      section: window.__yjz.story.section,
    }));
    if (expected === 'camp' ? s.camp : expected.startsWith('section:') ? s.section === expected.slice(8) : s.room === expected) return;
    if (s.ask) await page.click(`#talk .ask button:nth-child(${pick + 1})`);
    else if (s.talk) await page.click('#talk');
    else if (s.chapter) await page.click('#screen');
    else await page.waitForFunction(pc => window.__yjz.story.pc !== pc || !document.getElementById('talk').hidden || !!document.querySelector('.room-controls') || !!document.querySelector('[data-go="camp-go"]'), s.pc, { timeout: 6000 });
  }
  throw new Error(`未到达 ${expected}`);
}

async function loadSlot(page, slot) {
  await page.reload();
  await page.waitForSelector('[data-go="load"]');
  await page.click('[data-go="load"]');
  await page.waitForSelector('#save-list:not([hidden])');
  // 七行存档放在可滚动卡片内；后几槽在缩放舞台中可能不在可见区域。
  await page.evaluate(slot => document.querySelector(`#save-list [data-slot="${slot}"][data-act="read"]`).scrollIntoView({ block: 'center' }), slot);
  await page.waitForFunction(slot => {
    const e = document.querySelector(`#save-list [data-slot="${slot}"][data-act="read"]`);
    if (!e) return false;
    const r = e.getBoundingClientRect();
    return e.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
  }, slot);
  await page.click(`#save-list [data-slot="${slot}"][data-act="read"]`);
  await page.waitForSelector('.room-controls');
}

async function saveSlot(page, slot, shop = false) {
  await page.click(shop ? '[data-go="camp-save"]' : '[data-room="save"]');
  await page.waitForSelector('#save-list:not([hidden])');
  await page.click(`#save-list [data-slot="${slot}"][data-act="write"]`);
}

async function cancelDeparture(page) {
  const before = (await state(page)).story;
  await page.click('.actor[data-who="1"]');
  await page.waitForSelector('#talk .ask');
  await page.click('#talk .ask button:last-child');
  await page.waitForSelector('.room-controls');
  assert.deepEqual((await state(page)).story, before, '取消出发必须保留全部剧情状态');
}

export async function verifyRooms(page) {
  const fixtures = await roomFixtures(page);
  const ids = ['c1_s0_story0:b0g2', 'c1_s0_story0:b1g0', 'c1_s0_story1:b2g0', 'c1_s0_story2:b2g1', 'c1_s0_story5:b5g4', 'c1_s0_story8:b8g1'];
  for (const id of ids) assert.ok(fixtures[id], `真实路线必须到达 ${id}`);
  await page.evaluate(fixtures => {
    const list = JSON.parse(localStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
    const selected = ['c1_s0_story0:b0g2', 'c1_s0_story5:b5g4', 'c1_s0_story8:b8g1', 'c0_s0_story4'];
    selected.forEach((id, n) => { list.slots[n + 2] = { story: fixtures[id], at: Date.now() }; });
    localStorage.setItem('yjz.saves.v1', JSON.stringify(list));
    localStorage.setItem('yjz.script', 'hant');
  }, fixtures);
  const results = [];
  await loadSlot(page, 2);
  assert.deepEqual((await state(page)).people, [0, 1, 2]);
  await page.click('.actor[data-who="1"]');
  await page.waitForSelector('#talk:not([hidden])');
  assert.match((await state(page)).face, /faces\/001/);
  assert.equal((await state(page)).room, false, '闲谈时隐藏推进和存档控件');
  await until(page, ids[0]);
  await page.click('[data-room="continue"]');
  await until(page, ids[1]);
  let s = await state(page);
  assert.deepEqual(s.people, [0, 1, 2, 82]);
  assert.ok(!s.story.party.includes('jian_yong'), '来访通报时简雍尚未入队');
  await page.click('.actor[data-who="1"]');
  await page.waitForSelector('#talk:not([hidden])');
  assert.match((await state(page)).line, /請兄長講話/);
  await until(page, ids[1]);
  await page.click('.actor[data-who="82"]');
  await until(page, ids[2]);
  s = await state(page);
  assert.deepEqual(s.people, [0, 1, 2, 82, 364]);
  assert.equal(s.story.party.filter(x => x === 'jian_yong').length, 1);
  await saveSlot(page, 2);
  await loadSlot(page, 2);
  s = await state(page);
  assert.equal(s.story.resume.id, ids[2]);
  assert.equal(s.story.gold, 2000);
  assert.equal(s.walking, 0);
  assert.equal(s.story.party.filter(x => x === 'jian_yong').length, 1);
  await page.click('.actor[data-who="364"]');
  await until(page, ids[3]);
  await cancelDeparture(page);
  await page.click('[data-room="continue"]');
  await until(page, 'camp');
  assert.match(await page.evaluate(() => document.querySelector('#screen .card').textContent), /信都 — 出兵準備/);
  results.push('平原四阶段、人物点击、闲谈头像、简雍入队、存读档、取消与确认出发');

  await loadSlot(page, 3);
  const guang = (await state(page)).story;
  await page.click('.actor[data-who="374"]');
  await page.waitForSelector('[data-buy="30"]');
  assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('[data-buy]')].map(e => Number(e.dataset.buy))), [27, 30, 52]);
  assert.equal(await page.evaluate(() => document.querySelectorAll('[data-toggle]').length), 0);
  await page.click('[data-buy="30"]');
  assert.equal((await state(page)).story.gold, guang.gold - 100);
  assert.deepEqual((await state(page)).story.deploy, guang.deploy);
  assert.deepEqual((await state(page)).story.bag, [...guang.bag, 30]);
  await saveSlot(page, 3, true);
  await page.click('[data-go="camp-go"]');
  await page.waitForSelector('.room-controls');
  assert.equal((await state(page)).story.resume.id, ids[4]);
  await loadSlot(page, 3);
  s = await state(page);
  assert.equal(s.story.gold, guang.gold - 100);
  assert.deepEqual(s.story.bag, [...guang.bag, 30]);
  assert.equal(s.story.resume.id, ids[4]);
  await page.click('.actor[data-who="2"]');
  await page.waitForSelector('#talk:not([hidden])');
  assert.match((await state(page)).face, /faces\/002/);
  await until(page, ids[4]);
  await cancelDeparture(page);
  await page.click('[data-room="continue"]');
  await until(page, 'camp');
  assert.match(await page.evaluate(() => document.querySelector('#screen .card').textContent), /清河|巨鹿/);
  results.push('广川原始货单、购买扣款、返回、购物存档、张飞头像与后续路线');

  await loadSlot(page, 4);
  assert.equal((await state(page)).story.resume.id, ids[5]);
  await page.click('.actor[data-who="82"]');
  await page.waitForSelector('#talk:not([hidden])');
  assert.ok((await state(page)).line.length);
  await until(page, ids[5]);
  await cancelDeparture(page);
  await page.click('[data-room="continue"]');
  await until(page, 'camp');
  assert.match(await page.evaluate(() => document.querySelector('#screen .card').textContent), /清河|巨鹿/);
  results.push('信都闲谈、取消出发、确认后接回路线');

  await loadSlot(page, 5);
  for (const who of [12, 15]) {
    await page.click(`.actor[data-who="${who}"]`);
    await until(page, 'c0_s0_story4');
  }
  assert.equal((await state(page)).story.flags.orig_f0, 1);
  assert.equal((await state(page)).story.flags.orig_f1, 1);
  await cancelDeparture(page);
  await page.click('.actor[data-who="374"]');
  await page.waitForSelector('[data-go="camp-go"]');
  await page.click('[data-go="camp-go"]');
  await page.waitForSelector('.room-controls');
  results.push('序章人物点击、参战交谈、取消出征与道具屋返回回归');
  return { results, fixtures };
}

export async function verifyBeihaiRoom(page) {
  const roomId = 'c1_s1_story4:b4g1';
  const fixture = await page.evaluate(async roomId => {
    const { SCRIPT, officers } = await import('/src/data/game.ts');
    const { startStory, nextStep } = await import('/src/story.ts');
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei'] });
    const api = {
      join(s, id) { if (!s.party.includes(id)) s.party.push(id); s.roster[id] ??= { level: officers[id].level, exp: 0, items: [] }; },
      away(s, id) { s.party = s.party.filter(x => x !== id); },
      level(s, id, n) { const r = s.roster[id] ??= { level: officers[id].level, exp: 0, items: [] }; r.level += n; },
    };
    let beforeGold;
    for (let n = 0, step = nextStep(SCRIPT, st, 0, api); step && n < 5000; n++, step = nextStep(SCRIPT, st, 0, api)) {
      if (st.section === 'c1_s1_story4' && beforeGold === undefined) beforeGold = st.gold;
      if (step.t !== 'room' || step.id !== roomId) continue;
      for (const id of st.party) st.roster[id] ??= { level: officers[id].level, exp: 0, items: [] };
      const list = JSON.parse(localStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
      list.slots[4] = { story: st, at: Date.now() };
      localStorage.setItem('yjz.saves.v1', JSON.stringify(list));
      localStorage.setItem('yjz.script', 'hant');
      localStorage.setItem('yjz.anim-speed', '0');
      return { story: st, beforeGold };
    }
    throw new Error('真实路线未到达北海交谈房间');
  }, roomId);
  assert.equal(fixture.story.gold, fixture.beforeGold + 500);
  await loadSlot(page, 4);
  let s = await state(page);
  assert.deepEqual(s.people, [0, 1, 7, 149]);
  assert.equal(s.walking, 0);
  assert.equal(s.story.gold, fixture.story.gold);
  const actors = () => page.evaluate(() => [...document.querySelectorAll('.actor')].map(e => ({ who: e.dataset.who, x: e.style.left, y: e.style.top, art: e.querySelector('i')?.getAttribute('style') })));
  const layout = await actors();
  for (let repeat = 0; repeat < 2; repeat++) {
    for (const [who, line, face] of [[7, '努力啊．', /faces\/195/], [149, '謝謝你，有劉備支援，徐州就萬無一失了．', /faces\/085/]]) {
      await page.click(`.actor[data-who="${who}"]`);
      await page.waitForSelector('#talk:not([hidden])');
      s = await state(page);
      assert.equal(s.line, line);
      assert.match(s.face, face);
      assert.equal(s.room, false);
      await until(page, roomId);
    }
  }
  await cancelDeparture(page);
  const beforeEscape = (await state(page)).story;
  await page.click('[data-room="continue"]');
  await page.waitForSelector('#talk .ask');
  await page.keyboard.press('Escape');
  await page.waitForSelector('.room-controls');
  assert.deepEqual((await state(page)).story, beforeEscape);
  await saveSlot(page, 4);
  await loadSlot(page, 4);
  s = await state(page);
  assert.deepEqual(s.story, beforeEscape);
  assert.deepEqual(await actors(), layout);
  assert.equal(s.story.roster.taishi_ci, undefined);
  assert.equal(s.story.roster.tao_qian, undefined);
  await page.click('.actor[data-who="1"]');
  await page.waitForSelector('#talk .ask');
  await page.click('#talk .ask button:first-child');
  await page.waitForFunction(() => !document.getElementById('talk').hidden && document.querySelector('#talk p')?.textContent === '快去徐州吧．');
  s = await state(page);
  assert.equal(s.story.roster.taishi_ci.level, 13);
  assert.equal(s.story.roster.tao_qian.level, 10);
  assert.equal(s.room, false);
  await until(page, 'camp');
  s = await state(page);
  assert.match(await page.evaluate(() => document.querySelector('#screen .card').textContent), /徐州 — 出兵準備/);
  assert.equal(s.story.gold, fixture.story.gold);
  assert.deepEqual(s.story.party, fixture.story.party);
  return '北海赠金、孔融和太史慈原文及头像、拒绝与Esc取消、房间存读档、确认后升级与徐州行军';
}

export async function verifyXuzhouRooms(page) {
  const first = 'c1_s1_story6:b6g2', decision = 'c1_s1_story6:b6g3';
  const fixture = await page.evaluate(async first => {
    const { SCRIPT, officers } = await import('/src/data/game.ts');
    const { startStory, nextStep } = await import('/src/story.ts');
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei'] });
    const api = {
      join(s, id) { if (!s.party.includes(id)) s.party.push(id); s.roster[id] ??= { level: officers[id].level, exp: 0, items: [] }; },
      away(s, id) { s.party = s.party.filter(x => x !== id); },
      level(s, id, n) { const r = s.roster[id] ??= { level: officers[id].level, exp: 0, items: [] }; r.level += n; },
    };
    for (let n = 0, step = nextStep(SCRIPT, st, 0, api); step && n < 5000; n++, step = nextStep(SCRIPT, st, 0, api)) {
      if (step.t !== 'room' || step.id !== first) continue;
      for (const id of st.party) st.roster[id] ??= { level: officers[id].level, exp: 0, items: [] };
      const list = JSON.parse(localStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
      list.slots[4] = { story: st, at: Date.now() };
      localStorage.setItem('yjz.saves.v1', JSON.stringify(list));
      localStorage.setItem('yjz.script', 'hant');
      localStorage.setItem('yjz.anim-speed', '0');
      return st;
    }
    throw new Error('真实路线未到达徐州议事厅');
  }, first);
  await loadSlot(page, 4);
  const layout = () => page.evaluate(() => [...document.querySelectorAll('.actor')].map(e => ({ who: e.dataset.who, x: e.style.left, y: e.style.top, art: e.querySelector('i')?.getAttribute('style') })));
  assert.deepEqual((await state(page)).people, [0, 1, 2, 15, 63, 64, 65]);
  const opening = await layout();
  await page.click('.actor[data-who="1"]');
  await page.waitForSelector('#talk:not([hidden])');
  assert.equal((await state(page)).line, '我們能來得及支援，太好了．');
  assert.equal((await state(page)).ask, false, '议论前关羽不能决定路线');
  await until(page, first);
  await saveSlot(page, 4);
  await loadSlot(page, 4);
  assert.deepEqual((await state(page)).story, fixture);
  assert.deepEqual(await layout(), opening);
  await page.click('.actor[data-who="15"]');
  await page.waitForSelector('#talk:not([hidden])');
  assert.equal((await state(page)).line, '曹操軍肯定還會打來，怎麼辦？');
  await until(page, decision);
  assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('[data-room="continue"]')].map(e => e.textContent)), ['與關羽出戰', '派張飛求和']);
  await page.click('.actor[data-who="15"]');
  await page.waitForSelector('#talk:not([hidden])');
  assert.equal((await state(page)).line, '莫非要我投降才是上策？');
  await until(page, decision);
  const before = (await state(page)).story, decidedLayout = await layout();
  for (const [who, text, face] of [[1, '哦，兄長，決定出征了嗎？', /faces\/001/], [2, '大哥，派我去向曹操軍求和嗎？', /faces\/002/]]) {
    for (const escape of [false, true]) {
      await page.click(`.actor[data-who="${who}"]`);
      await page.waitForSelector('#talk .ask');
      const s = await state(page);
      assert.equal(s.line, text);
      assert.match(s.face, face);
      assert.equal(s.room, false);
      if (escape) await page.keyboard.press('Escape');
      else await page.click('#talk .ask button:last-child');
      await page.waitForSelector('.room-controls');
      assert.deepEqual((await state(page)).story, before, '拒绝两条路线均不改变剧情');
      assert.deepEqual(await layout(), decidedLayout);
    }
  }
  await saveSlot(page, 5);
  await loadSlot(page, 5);
  assert.deepEqual((await state(page)).story, before);
  assert.deepEqual(await layout(), decidedLayout);
  await page.click('.actor[data-who="1"]');
  await page.waitForSelector('#talk .ask');
  await page.click('#talk .ask button:first-child');
  await until(page, 'camp');
  let s = await state(page);
  assert.equal(s.story.resume.id, 'c1_s1_b7');
  assert.equal(s.story.flags.orig_f219, 1);
  assert.equal(s.story.flags.orig_route_c1_s1_b6, 0);
  assert.equal(s.story.gold, before.gold);
  assert.match(await page.evaluate(() => document.querySelector('#screen .card').textContent), /小沛/);
  await loadSlot(page, 5);
  await page.click('.actor[data-who="2"]');
  await page.waitForSelector('#talk .ask');
  await page.click('#talk .ask button:first-child');
  await page.waitForFunction(() => !document.getElementById('talk').hidden && document.querySelector('#talk p')?.textContent === '這樣決定了的話就簡單了．好，我馬上就去．');
  assert.equal((await state(page)).story.flags.orig_f219, undefined);
  await until(page, 'section:c1_s1_story8');
  s = await state(page);
  assert.equal(s.story.flags.orig_route_c1_s1_b6, 1);
  assert.ok(!s.people.includes(2), '张飞按原始动作退场');
  await until(page, 'section:c1_s1_story10');
  s = await state(page);
  assert.equal(s.story.flags.orig_f219, undefined);
  assert.equal(s.story.flags.orig_f97, 1);
  assert.equal(s.story.section, 'c1_s1_story10', '求和后直接回徐州议事厅，跳过小沛战斗');
  assert.ok(s.story.party.includes('zhang_fei'), '张飞只是场景退场，不从队伍删除');
  return '徐州两阶段交谈、陶谦议论、关张原文头像、两种取消、存读档、关羽小沛出战与张飞求和路线';
}

export async function verifyXuzhouSecondScene(page) {
  const first = 'c1_s2_story1:b1g1';
  const second = 'c1_s2_story1:b1g2';
  const fixture = await page.evaluate(async ({ first }) => {
    const { SCRIPT, officers } = await import('/src/data/game.ts');
    const { startStory, nextStep } = await import('/src/story.ts');
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei', 'sun_qian'] });
    const api = {
      join(s, id) { if (!s.party.includes(id)) s.party.push(id); s.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] }; },
      away(s, id) { s.party = s.party.filter(x => x !== id); },
      level(s, id, n) { const r = s.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] }; r.level += n; },
      item(s, id) { s.bag.push(Number(id)); },
    };
    for (let n = 0, step = nextStep(SCRIPT, st, 0, api); step && n < 10000; n++, step = nextStep(SCRIPT, st, step.t === 'choice' ? 0 : 0, api)) {
      if (step.t !== 'room' || step.id !== first) continue;
      for (const id of st.party) st.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] };
      const list = JSON.parse(localStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
      list.slots[5] = { story: st, at: Date.now() };
      localStorage.setItem('yjz.saves.v1', JSON.stringify(list));
      localStorage.setItem('yjz.script', 'hant');
      localStorage.setItem('yjz.anim-speed', '0');
      return st;
    }
    throw new Error('真实路线未到达小沛第一组交谈');
  }, { first });
  await loadSlot(page, 5);
  let s = await state(page);
  assert.equal(s.story.resume.id, first);
  assert.deepEqual(s.people, [0, 1, 2, 63, 82]);
  const opening = await page.evaluate(() => ({
    actors: [...document.querySelectorAll('.actor')].map(e => ({
      who: e.dataset.who, x: e.style.left, y: e.style.top, art: e.querySelector('i')?.getAttribute('style'),
    })),
    liuArt: document.querySelector('.actor[data-who="0"] i')?.getAttribute('style'),
  }));

  await page.click('.actor[data-who="1"]');
  await page.waitForSelector('#talk:not([hidden])');
  assert.equal((await state(page)).line, '大哥，請聽簡雍彙報．');
  await until(page, first);
  assert.deepEqual((await state(page)).story, fixture, '闲谈不推进或改变剧情状态');
  await page.click('.actor[data-who="82"]');
  await until(page, second);
  s = await state(page);
  assert.equal(s.story.resume.id, second);
  assert.equal(s.line, '大哥，作出征準備吧．');
  assert.deepEqual(s.people, [0, 1, 2, 63, 82]);
  const secondOpening = await page.evaluate(() => ({
    actors: [...document.querySelectorAll('.actor')].map(e => ({
      who: e.dataset.who, x: e.style.left, y: e.style.top, art: e.querySelector('i')?.getAttribute('style'),
    })),
    liuArt: document.querySelector('.actor[data-who="0"] i')?.getAttribute('style'),
  }));
  await page.click('.actor[data-who="2"]');
  await page.waitForSelector('#talk:not([hidden])');
  assert.match((await state(page)).line, /幾個毛賊/);
  await until(page, second);

  const beforeCancel = (await state(page)).story;
  await page.click('[data-room="continue"]');
  await page.waitForSelector('#talk .ask');
  assert.equal((await state(page)).line, '準備好了嗎？');
  await page.click('#talk .ask button:last-child');
  await page.waitForSelector('.room-controls');
  assert.deepEqual((await state(page)).story, beforeCancel, '取消不换图、不摆放山贼、留在原房间');
  assert.deepEqual(await page.evaluate(() => ({
    actors: [...document.querySelectorAll('.actor')].map(e => ({
      who: e.dataset.who, x: e.style.left, y: e.style.top, art: e.querySelector('i')?.getAttribute('style'),
    })),
    liuArt: document.querySelector('.actor[data-who="0"] i')?.getAttribute('style'),
  })), secondOpening);

  await page.click('.actor[data-who="1"]');
  await page.waitForSelector('#talk .ask');
  await page.click('#talk .ask button:first-child');
  await page.waitForFunction(() => !document.getElementById('talk').hidden &&
    document.querySelector('#talk p')?.textContent === '大哥，去哪裡？');
  s = await state(page);
  assert.equal(s.story.section, 'c1_s2_story1');
  assert.deepEqual(s.people, [0, 223, 228, 230]);
  assert.match(await page.$eval('#screen .scene .backdrop', e => e.getAttribute('src')), /campaign\/000\.png/);
  assert.notEqual(await page.$eval('.actor[data-who="0"] i', e => e.getAttribute('style')), secondOpening.liuArt, '确认后刘备应切换为出征造型');
  await page.click('#talk');
  await page.waitForSelector('#talk .ask');
  assert.deepEqual(await page.$$eval('#talk .ask button', els => els.map(e => e.textContent.trim())),
    ['回小沛城', '去泰山', '去夏丘', '去彭城']);
  return '小沛简雍汇报、两组闲谈、关羽取消/确认、野外山贼摆放与四路线衔接';
}

export async function verifyXuzhouReturnRooms(page) {
  const first = 'c1_s1_story10:b10g1';
  const second = 'c1_s1_story10:b10g2';
  const farewell = 'c1_s1_story11:b11g1';
  const fixture = await page.evaluate(async ({ first }) => {
    const { SCRIPT, officers } = await import('/src/data/game.ts');
    const { startStory, nextStep } = await import('/src/story.ts');
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei', 'zhao_yun'], gold: 733 });
    st.flags.orig_f97 = 1;
    st.bag = [30];
    st.pc = SCRIPT.steps.findIndex(s => s.t === 'stage' && s.id === 'c1_s1_story10') - 1;
    const api = {
      join(s, id) { if (!s.party.includes(id)) s.party.push(id); s.roster[id] ??= { level: officers[id].level, exp: 0, items: [] }; },
      away(s, id) { s.party = s.party.filter(x => x !== id); },
    };
    let step = nextStep(SCRIPT, st, 0, api);
    for (let n = 0; step && n < 100; n++) {
      if (step.t === 'room' && step.id === first) break;
      step = nextStep(SCRIPT, st, 0, api);
    }
    if (!step || step.t !== 'room' || step.id !== first) throw new Error('返回徐州路线未到达第一组交谈');
    for (const id of st.party) st.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] };
    const list = JSON.parse(localStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
    list.slots[5] = { story: st, at: Date.now() };
    localStorage.setItem('yjz.saves.v1', JSON.stringify(list));
    localStorage.setItem('yjz.script', 'hant');
    localStorage.setItem('yjz.anim-speed', '0');
    return st;
  }, { first });
  await loadSlot(page, 5);
  let s = await state(page);
  assert.equal(s.story.resume.id, first);
  assert.deepEqual(s.people, [0, 1, 2, 15, 63, 64, 65]);
  assert.equal(s.story.party.includes('sun_qian'), false, '孙乾须在第二次点击后才入队');
  await page.click('.actor[data-who="15"]');
  await until(page, second);
  s = await state(page);
  assert.equal(s.story.resume.id, second);
  assert.ok(s.story.bag.includes(57), '求和路线应在陶谦交谈后获得雌雄双剑');
  assert.equal(s.story.party.includes('sun_qian'), false);
  assert.deepEqual(s.people, [0, 1, 2, 15, 63, 64, 65]);
  await page.click('.actor[data-who="63"]');
  await until(page, farewell);
  s = await state(page);
  assert.equal(s.story.resume.id, farewell);
  assert.equal(s.story.party.includes('sun_qian'), true, '点击孙乾后才入队');
  assert.equal(s.story.party.includes('zhao_yun'), true);
  assert.deepEqual(s.people, [0, 1, 2, 53, 63]);
  assert.equal(s.story.section, 'c1_s1_story11');
  await page.click('.actor[data-who="53"]');
  await until(page, 'section:c1_s2_story0');
  s = await state(page);
  assert.equal(s.story.party.includes('zhao_yun'), false, '点击赵云后才离队');
  assert.equal(s.story.party.includes('sun_qian'), true);
  return '返回徐州陶谦受托、赠剑、孙乾入队行军、小沛赵云告别';
}

export async function verifyXiaopeiReturnRooms(page) {
  const first = 'c1_s2_story6:b6g1', second = 'c1_s2_story6:b6g2';
  const fixture = await page.evaluate(async first => {
    const { SCRIPT, officers, itemId } = await import('/src/data/game.ts');
    const { startStory, nextStep } = await import('/src/story.ts');
    const st = startStory(SCRIPT, {
      party: ['liu_bei', 'guan_yu', 'zhang_fei', 'sun_qian', 'jian_yong'], gold: 900,
    });
    // 从最后一场夏丘战胜利分支进入：泰山、彭城已经完成，夏丘旗标由战后原脚本设置。
    Object.assign(st.flags, { orig_f8: 1, orig_f9: 1 });
    st.bag = [30];
    st.pc = SCRIPT.steps.findIndex(s => s.t === 'battle' && s.level === 'c1_s2_b5');
    if (st.pc < 0) throw new Error('缺少夏丘战斗入口');
    const api = {
      join(s, id) { if (!s.party.includes(id)) s.party.push(id); },
      item(s, id) { const n = itemId(id); if (n === undefined) throw new Error(`未知道具 ${id}`); s.bag.push(n); },
    };
    const lines = [];
    for (let n = 0, step = nextStep(SCRIPT, st, 0, api); step && n < 400; n++, step = nextStep(SCRIPT, st, 0, api)) {
      if (step.t === 'say' || step.t === 'text') lines.push(step.text);
      if (step.t !== 'room' || step.id !== first) continue;
      for (const id of st.party) st.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] };
      const list = JSON.parse(localStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
      list.slots[5] = { story: st, at: Date.now() };
      localStorage.setItem('yjz.saves.v1', JSON.stringify(list));
      localStorage.setItem('yjz.script', 'hant');
      localStorage.setItem('yjz.anim-speed', '0');
      return { story: st, lines };
    }
    throw new Error('夏丘胜利路线未到达小沛战后第一组交谈');
  }, first);
  assert.equal(fixture.story.flags.orig_f10, 1, '夏丘战后应设置剿匪完成标志');
  assert.equal(fixture.story.gold, 1400);
  assert.deepEqual(fixture.story.bag, [30, 16, 38]);
  assert.equal(fixture.lines.some(line => line.includes('病情惡化')), false, '快使报告不能提前播放');
  const layout = () => page.evaluate(() => ({
    map: document.querySelector('#screen .scene .backdrop')?.getAttribute('src'),
    actors: [...document.querySelectorAll('.actor')].map(e => ({
      who: e.dataset.who, x: e.style.left, y: e.style.top, art: e.querySelector('i')?.getAttribute('style'),
    })),
  }));
  await loadSlot(page, 5);
  let s = await state(page);
  assert.deepEqual(s.people, [0, 1, 2, 63, 82]);
  assert.equal(s.story.resume.id, first);
  const opening = await layout();
  assert.match(opening.map, /story\/pmap-002\.png/);
  for (const [who, line, face] of [
    [1, '我們討完賊，這樣小沛總算安定了．', /faces\/001/],
    [2, '終究那些小毛賊不是我張飛的對手．', /faces\/002/],
    [63, '不可大意，說不定還會有什麼變故．', /faces\/012/],
  ]) {
    await page.click(`.actor[data-who="${who}"]`);
    await page.waitForSelector('#talk:not([hidden])');
    s = await state(page);
    assert.equal(s.line, line);
    assert.match(s.face, face);
    await until(page, first);
    assert.deepEqual((await state(page)).story, fixture.story);
  }
  await saveSlot(page, 5);
  await loadSlot(page, 5);
  assert.deepEqual((await state(page)).story, fixture.story, '第一房间读档不重领奖');
  assert.deepEqual(await layout(), opening);

  await page.click('.actor[data-who="82"]');
  await page.waitForSelector('#talk:not([hidden])');
  assert.equal((await state(page)).line, '主公，好像是快使．');
  await page.click('#talk');
  await page.waitForFunction(() => document.querySelector('#talk p')?.textContent === '劉備，陶謙病情惡化，請馬上去徐州．');
  s = await state(page);
  assert.deepEqual(s.people, [0, 1, 2, 63, 82, 366], '报告时快使进场，关张孙简尚未离场');
  assert.match(s.face, /faces\/221/);
  await until(page, second);
  s = await state(page);
  assert.deepEqual(s.people, [0, 366]);
  assert.equal(s.story.gold, 1400);
  assert.deepEqual(s.story.bag, [30, 16, 38]);
  const afterReport = s.story, reportedLayout = await layout();
  assert.match(reportedLayout.map, /story\/pmap-002\.png/);
  assert.equal(await page.evaluate(() => document.querySelector('[data-room="continue"]')?.textContent), '前往徐州陶謙官邸');
  for (let repeat = 0; repeat < 2; repeat++) {
    await page.click('.actor[data-who="366"]');
    await page.waitForSelector('#talk:not([hidden])');
    assert.equal((await state(page)).line, '劉備，請馬上去徐州官邸，分秒必爭，陶謙快不行了．');
    await until(page, second);
    assert.deepEqual((await state(page)).story, afterReport, '快使催促不推进地点事件');
  }
  await saveSlot(page, 5);
  await loadSlot(page, 5);
  assert.deepEqual((await state(page)).story, afterReport, '第二房间读档不重领奖或重演报告');
  assert.deepEqual(await layout(), reportedLayout);
  assert.equal((await state(page)).walking, 0);

  await page.click('[data-room="continue"]');
  await page.waitForFunction(() => document.querySelector('#talk p')?.textContent === '哦，劉備，你來得正好，快去見我們主公．');
  s = await state(page);
  assert.deepEqual(s.people, [0, 1, 2, 64, 81]);
  assert.match((await layout()).map, /story\/pmap-022\.png/);
  await page.click('#talk');
  await page.waitForFunction(() => document.querySelector('#talk p')?.textContent === '陶謙，請多保重．');
  const liuPosition = await page.evaluate(async () => {
    const { mapPoint } = await import('/src/stage.ts');
    const e = document.querySelector('.actor[data-who="0"]');
    const expected = mapPoint(14, 6);
    return { actual: { x: e.style.left, y: e.style.top }, expected: { x: `${expected.left}px`, y: `${expected.top}px` } };
  });
  assert.deepEqual(liuPosition.actual, liuPosition.expected, '刘备走到原始坐标14,6');
  await page.click('#talk');
  await page.waitForFunction(() => window.__yjz.story.section === 'c1_s2_story7' && !document.getElementById('talk').hidden);
  s = await state(page);
  assert.equal(s.story.gold, 1400);
  assert.deepEqual(s.story.bag, [30, 16, 38]);
  assert.match(s.face, /faces\/189/);
  return '小沛战后真实胜利路线、剿匪奖励、三人闲谈与头像、快使进退场、两房间存读档、赴徐州按钮及陶谦衔接';
}
