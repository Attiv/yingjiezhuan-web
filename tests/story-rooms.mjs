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

// 自创小剧本，仅替换开发模式的演示流程。两条路线汇合到同一个存档锚点。
export async function verifyBranchStageSave(page, base) {
  const url = `${base}/?demo`;
  const install = () => page.evaluate(async () => {
    // 复用页面的入口模块，保留 Vite 热更新时附加的版本参数。
    const entry = document.querySelector('script[src*="/src/main.ts"]');
    const { CAMPAIGN } = await import(entry.src);
    const action = (op, fields) => ({ t: 'action', op: { at: 0, op, ...fields } });
    const prompt = { who: '', text: '沿这条路走吗？' };
    CAMPAIGN.steps.splice(0, CAMPAIGN.steps.length,
      { t: 'stage', id: 'save-test-start' },
      action('map', { map: 'palace/000' }),
      { t: 'room', id: 'save-test-crossroads', options: [
        { who: 501, label: '东路', prompt, goto: 'east' },
        { who: 502, label: '西路', prompt, goto: 'west' },
      ] },
      { t: 'label', name: 'east' },
      { t: 'stage', id: 'save-test-east' },
      action('map', { map: 'field' }),
      action('caption', { text: '东路' }),
      action('place', { who: 501, x: 5, y: 5, sprite: 2 }),
      action('place', { who: 502, x: 20, y: 15, sprite: 3 }),
      action('move', { who: 501, x: 25, y: 18, dir: 1 }),
      { t: 'gold', n: 50 },
      { t: 'goto', label: 'stop' },
      { t: 'label', name: 'west' },
      { t: 'stage', id: 'save-test-west' },
      action('map', { map: 'palace/001' }),
      action('place', { who: 503, x: 7, y: 8, sprite: 4 }),
      { t: 'label', name: 'stop' },
      { t: 'room', id: 'save-test-stop' },
      { t: 'end' },
    );
  });
  const stageState = () => page.evaluate(() => ({
    map: document.querySelector('.backdrop').getAttribute('src'),
    place: document.querySelector('.place')?.textContent ?? '',
    camera: document.querySelector('.story-world').style.transform,
    people: [...document.querySelectorAll('.actor')].map(e => [e.dataset.who, e.style.left, e.style.top, e.querySelector('i').className, e.querySelector('i').style.cssText]),
    walking: document.querySelectorAll('.actor.walking').length,
    story: JSON.parse(JSON.stringify(window.__yjz.story)),
  }));
  await page.goto(url);
  await page.waitForSelector('[data-go="start"]');
  await install();
  await page.click('[data-go="start"]');
  await page.click('[data-room="continue"][data-answer="0"]');
  await page.click('#talk .ask button:first-child');
  await until(page, 'save-test-stop');
  const before = await stageState();
  assert.match(before.map, /campaign\/000\.png$/);
  assert.equal(before.camera, 'translate(-700px, -540px)');
  assert.deepEqual(before.people.map(([who]) => who).sort(), ['501', '502']);
  assert.equal(before.story.gold, 50);
  await saveSlot(page, 0);
  await page.reload();
  await page.waitForSelector('[data-go="load"]');
  await install();
  // 标题先于测试剧本装载，用同一个存档面板入口刷新列表。
  await page.evaluate(() => window.__yjz.openSaveList('load'));
  await page.click('#save-list [data-slot="0"][data-act="read"]');
  await page.waitForSelector('.room-controls');
  const after = await stageState();
  assert.equal(after.map, before.map, '读档必须保留所选路线的地图');
  assert.deepEqual(after, before, '同一锚点须恢复实际走过的舞台、镜头与剧情进度');
  return '分支剧情读档后保留地图、人物、镜头和奖励';
}

// 两份 JSON 走正式加载入口；在同一测试 origin 验证档位按剧本隔离。
export async function verifyImportedStories(page, base) {
  const launch = query => page.goto(`${base}/${query}`);
  await launch('');
  const fixtures = await roomFixtures(page);
  const originalRoom = 'c1_s0_story0:b0g2';
  await page.evaluate(story => {
    // 独立剧本的存档键带 @剧本id；先清掉，回归才能反复跑，也才算「别的剧本看不到」。
    for (const key of Object.keys(localStorage)) if (key.includes('@')) localStorage.removeItem(key);
    const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
    list.slots[5] = { story, at: Date.now() };
    window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
    localStorage.setItem('yjz.script', 'hans');
  }, fixtures[originalRoom]);
  await loadSlot(page, 5);
  await saveSlot(page, 5);
  await page.waitForSelector('#save-list', { state: 'hidden' });
  const campaignStorage = () => page.evaluate(() => ['yjz.saves.v1', 'yjz.save.v3', 'yjz.autosave.v1'].map(k => localStorage.getItem(k)));
  const original = await campaignStorage();
  assert.ok(original[0] && original[1]);

  const configs = [
    {
      id: 'lantern-station', talker: 502, line: /今夜退潮晚/, firstExit: '.actor[data-who="501"]',
      stop: 'checkpoint', map: '/assets/story/pmap-000.png', ending: /你沿着远处的灯光继续前行/,
      routes: [
        { id: 'water', who: 502, question: /要走水路吗/, gold: 50, place: '潮汐码头', people: [501, 502] },
        { id: 'hill', question: /要走山路吗/, gold: 0, place: '风鸣山口', people: [501, 503] },
      ],
    },
    {
      id: 'watchpost', talker: 602, line: /东边近但路窄/, firstExit: '[data-room="continue"]',
      stop: 'arrival-point', map: '/assets/story/pmap-001.png', ending: /你抵达了北门外的接应处/,
      routes: [
        { id: 'east', who: 602, question: /确定走东道吗/, gold: 30, place: '狭长东道', people: [601] },
        { id: 'west', question: /确定走西道吗/, gold: 0, place: '平坦西道', people: [602] },
      ],
    },
  ];
  const scene = () => page.evaluate(() => ({
    map: document.querySelector('.backdrop').getAttribute('src'),
    place: document.querySelector('.place').textContent,
    camera: document.querySelector('.story-world').style.transform,
    cast: [...document.querySelectorAll('.actor')].map(e => [e.dataset.who, e.style.cssText, e.querySelector('i').style.cssText]),
  }));
  for (const config of configs) {
    await launch(`?story=${config.id}`);
    await page.waitForSelector('#screen [data-go="start"]');
    assert.match(await page.evaluate(() => document.querySelector('#screen .sub').textContent), /独立剧情/, '标题要点明这是哪部独立剧情');
    assert.ok(await page.evaluate(() => document.querySelector('#screen [data-go="load"]').disabled), `${config.id} 不应看到其他剧本的存档`);
    for (const [i, route] of config.routes.entries()) {
      await page.click('#screen [data-go="start"]');
      await until(page, `${config.id}:arrival`);
      if (i === 0) {
        const initial = (await state(page)).story;
        for (let repeat = 0; repeat < 2; repeat++) {
          await page.click(`.actor[data-who="${config.talker}"]`);
          await page.waitForSelector('#talk:not([hidden])');
          const chatting = await state(page);
          assert.match(chatting.line, config.line);
          assert.equal(chatting.room, false);
          await until(page, `${config.id}:arrival`);
          assert.deepEqual((await state(page)).story, initial, '重复闲谈不应改变进度或奖励');
        }
      }
      await page.click(config.firstExit);
      await until(page, `${config.id}:crossroads`);
      const crossroads = (await state(page)).story;
      const choose = route.who ? `.actor[data-who="${route.who}"]` : `[data-room="continue"][data-answer="${i}"]`;
      await page.click(choose);
      await page.waitForSelector('#talk .ask');
      assert.match((await state(page)).line, route.question);
      await page.click('#talk .ask button:last-child');
      await page.waitForSelector('.room-controls');
      assert.deepEqual((await state(page)).story, crossroads, '取消路线不得改变剧情、旗标或军资');
      await page.click(choose);
      await page.click('#talk .ask button:first-child');
      await until(page, `${config.id}:${config.stop}`);
      const before = await state(page);
      const view = await scene();
      assert.equal(before.story.flags.route, route.id);
      assert.equal(before.story.gold, route.gold);
      assert.deepEqual(before.people, route.people);
      assert.equal(view.place, route.place);
      assert.equal(view.map, config.map);
      await saveSlot(page, i);
      await page.waitForSelector('#save-list', { state: 'hidden' });
      assert.deepEqual(await campaignStorage(), original, '独立剧情写档不得碰原战役的手动档、最近档或自动档');
      await loadSlot(page, i);
      assert.deepEqual((await state(page)).story, before.story, '读档须保留所选路线，且奖励不重发');
      assert.deepEqual(await scene(), view, '读档须保留地名、地图、人物外观与镜头');
      await page.click('[data-room="continue"]');
      await page.waitForSelector('[data-go="title"]');
      assert.match(await page.evaluate(() => document.querySelector('#screen .sub').textContent), config.ending);
      await page.click('[data-go="title"]');
    }
  }
  // 第二个剧本用了同样的两个槽位；第一个剧本仍应读出它自己的两条路线。
  await launch('?story=lantern-station');
  for (const [i, route] of configs[0].routes.entries()) {
    await loadSlot(page, i);
    assert.equal((await state(page)).story.flags.route, route.id);
    assert.equal((await state(page)).story.gold, route.gold);
  }
  await launch('');
  await loadSlot(page, 5);
  assert.equal((await state(page)).story.resume.id, originalRoom);
  assert.deepEqual(await campaignStorage(), original);
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
    const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
    const selected = ['c1_s0_story0:b0g2', 'c1_s0_story5:b5g4', 'c1_s0_story8:b8g1', 'c0_s0_story4'];
    selected.forEach((id, n) => { list.slots[n + 2] = { story: fixtures[id], at: Date.now() }; });
    window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
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
      const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
      list.slots[4] = { story: st, at: Date.now() };
      window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
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
      const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
      list.slots[4] = { story: st, at: Date.now() };
      window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
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
      const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
      list.slots[5] = { story: st, at: Date.now() };
      window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
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
  const march = await page.evaluate(() => ({
    map: document.querySelector('#screen .scene .backdrop')?.getAttribute('src'),
    art: document.querySelector('.actor[data-who="0"] i')?.getAttribute('style'),
  }));
  assert.match(march.map, /campaign\/000\.png/);
  assert.ok(march.art);
  assert.notEqual(march.art, secondOpening.liuArt, '确认后刘备应切换为出征造型');
  await page.click('#talk');
  await page.waitForSelector('#talk .ask');
  assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('#talk .ask button')].map(e => e.textContent.trim())),
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
    const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
    list.slots[5] = { story: st, at: Date.now() };
    window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
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
      const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
      list.slots[5] = { story: st, at: Date.now() };
      window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
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

// 吕布来投与钦差到访：三组／四组真实点击链，议事厅重摆后的舞台继承与中途读档。
export async function verifyLubuEnvoyRooms(page) {
  const first = 'c1_s2_story8:b8g1';
  const fixture = await page.evaluate(async first => {
    const { SCRIPT, officers } = await import('/src/data/game.ts');
    const { startStory, nextStep } = await import('/src/story.ts');
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei', 'sun_qian', 'jian_yong'], gold: 1400 });
    // 三处剿匪都已完成：返城只走交谈，不再发条件奖励。
    Object.assign(st.flags, { orig_f8: 1, orig_f9: 1, orig_f10: 1 });
    st.pc = SCRIPT.steps.findIndex(s => s.t === 'battle' && s.level === 'c1_s2_b5');
    if (st.pc < 0) throw new Error('缺少夏丘战斗入口');
    const api = {
      join(s, id) { if (!s.party.includes(id)) s.party.push(id); },
      away(s, id) { s.party = s.party.filter(x => x !== id); },
      level(s, id, n) {
        const r = (s.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] });
        r.level += n;
      },
    };
    for (let n = 0, step = nextStep(SCRIPT, st, 0, api); step && n < 600; n++, step = nextStep(SCRIPT, st, 0, api)) {
      if (step.t !== 'room' || step.id !== first) continue;
      for (const id of st.party) st.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] };
      const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
      list.slots[5] = { story: st, at: Date.now() };
      window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
      localStorage.setItem('yjz.script', 'hant');
      localStorage.setItem('yjz.anim-speed', '0');
      return st;
    }
    throw new Error('夏丘胜利路线未到达吕布来投第一组交谈');
  }, first);
  assert.ok(fixture.party.includes('mi_zhu') && fixture.party.includes('mi_fang'), '陶谦托付后糜竺、糜芳入队');
  const layout = () => page.evaluate(() => ({
    map: document.querySelector('#screen .scene .backdrop')?.getAttribute('src'),
    place: document.querySelector('.place')?.textContent ?? '',
    actors: [...document.querySelectorAll('.actor')].map(e => `${e.dataset.who}:${e.style.left},${e.style.top}`).sort(),
  }));

  await loadSlot(page, 5);
  let s = await state(page);
  assert.equal(s.story.resume.id, first);
  assert.deepEqual(s.people, [0, 1, 2, 64, 81]);
  const opening = await layout();
  assert.match(opening.map, /story\/pmap-004\.png/);
  assert.equal(opening.place, '徐州議事廳');

  // 闲谈不推进：点张飞说一句，回房间后流程与站位都不变。
  await page.click('.actor[data-who="2"]');
  await page.waitForSelector('#talk:not([hidden])');
  assert.equal((await state(page)).line, '為了陶謙一定要守住徐州，是吧，大哥．');
  await page.click('#talk');
  await until(page, first);
  assert.deepEqual((await state(page)).story, fixture, '闲谈不得改变流程');
  assert.deepEqual(await layout(), opening);

  // 点糜竺：吕布、陈宫、张辽从门口进场。
  await page.click('.actor[data-who="64"]');
  await until(page, 'c1_s2_story8:b8g2');
  assert.deepEqual((await state(page)).people, [0, 1, 2, 4, 64, 75, 79, 81]);
  // 点吕布：只有他原先的请求，不提前接受。
  await page.click('.actor[data-who="4"]');
  await page.waitForSelector('#talk:not([hidden])');
  assert.equal((await state(page)).line, '自從我們敗給曹操以來，長時間到處流浪，當時聽說你在徐州，就來了，請收留我們吧，求求你．');
  await until(page, 'c1_s2_story8:b8g3');

  // 中途存档：读回后仍是重摆前的议事厅与同一组人。
  await saveSlot(page, 5);
  const saved = await layout();
  await loadSlot(page, 5);
  assert.deepEqual(await layout(), saved, '读档保留吕布在場的站位与地名');
  assert.equal((await state(page)).walking, 0);

  // 再点吕布：接受请求；刘备的台词必须用自己的头像，不能再落到通用像。
  await page.click('.actor[data-who="4"]');
  await page.waitForFunction(() => document.querySelector('#talk p')?.textContent === '劉備，請給我們一個好的答覆．');
  assert.match((await state(page)).face, /faces\/148/);
  await page.click('#talk');
  await page.waitForFunction(() => document.querySelector('#talk p')?.textContent === '我知道了，現在允許你在小沛落腳．');
  assert.match((await state(page)).face, /faces\/000/);
  // 张飞发作、吕布陈宫退场、张辽告别，然后 R19 重摆议事厅进入下一幕。
  await until(page, 'c1_s2_story9:b9g0');
  s = await state(page);
  assert.equal(s.story.section, 'c1_s2_story9');
  assert.deepEqual(s.people, [0, 1, 2, 64, 81]);
  const resettled = await layout();
  assert.equal(resettled.place, '徐州議事廳');
  assert.match(resettled.map, /story\/pmap-004\.png/);
  assert.notDeepEqual(resettled.actors, opening.actors, '重摆后刘备换到议事厅主位');

  // 糜芳报信 → 孙乾进门。
  await page.click('.actor[data-who="81"]');
  await until(page, 'c1_s2_story9:b9g1');
  assert.deepEqual((await state(page)).people, [0, 1, 2, 63, 64, 81]);
  // 孙乾说明 → 使者进门。
  await page.click('.actor[data-who="63"]');
  await until(page, 'c1_s2_story9:b9g2');
  assert.deepEqual((await state(page)).people, [0, 1, 2, 63, 64, 81, 364]);
  // 使者宣旨后原路离开。
  await page.click('.actor[data-who="364"]');
  await until(page, 'c1_s2_story9:b9g3');
  assert.deepEqual((await state(page)).people, [0, 1, 2, 63, 64, 81]);

  // 糜竺议论 → 出征对白 → 淮南议事厅。
  await page.click('.actor[data-who="64"]');
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    const now = await page.evaluate(() => ({
      section: window.__yjz.story.section,
      talk: !document.getElementById('talk').hidden,
      ask: !!document.querySelector('#talk:not([hidden]) .ask'),
    }));
    if (now.section === 'c1_s2_story10') break;
    if (now.ask) await page.click('#talk .ask button:first-child');
    else if (now.talk) await page.click('#talk');
    else await page.waitForTimeout(30);
  }
  assert.equal(await page.evaluate(() => window.__yjz.story.section), 'c1_s2_story10', '议论后接淮南议事厅');
  return '吕布来投三组交谈与张飞发作、钦差四组到访、重摆议事厅、舞台继承与中途读档、刘备头像';
}

// 许昌议事厅：两轮闲谈、曹操两次推进、官邸按钮与谋士议事。
export async function verifyXuchangRoom(page) {
  const first = 'c1_s2_story14:b14g1';
  const fixture = await page.evaluate(async first => {
    const { SCRIPT, officers } = await import('/src/data/game.ts');
    const { startStory, nextStep } = await import('/src/story.ts');
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei', 'sun_qian', 'jian_yong'], gold: 1400 });
    Object.assign(st.flags, { orig_f8: 1, orig_f9: 1, orig_f10: 1 });
    st.pc = SCRIPT.steps.findIndex(s => s.t === 'battle' && s.level === 'c1_s2_b5');
    if (st.pc < 0) throw new Error('缺少夏丘战斗入口');
    const api = {
      join(s, id) { if (!s.party.includes(id)) s.party.push(id); },
      away(s, id) { s.party = s.party.filter(x => x !== id); },
      level(s, id, n) { const r = (s.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] }); r.level += n; },
    };
    for (let n = 0, step = nextStep(SCRIPT, st, 0, api); step && n < 900; n++, step = nextStep(SCRIPT, st, 0, api)) {
      if (step.t !== 'room' || step.id !== first) continue;
      for (const id of st.party) st.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] };
      const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
      list.slots[5] = { story: st, at: Date.now() };
      window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
      localStorage.setItem('yjz.script', 'hant');
      localStorage.setItem('yjz.anim-speed', '0');
      return st;
    }
    throw new Error('胜利路线未到达许昌议事厅');
  }, first);
  assert.ok(fixture.party.includes('sun_qian'));
  const layout = () => page.evaluate(() => ({
    map: document.querySelector('#screen .scene .backdrop')?.getAttribute('src'),
    place: document.querySelector('.place')?.textContent ?? '',
  }));

  await loadSlot(page, 5);
  let s = await state(page);
  assert.equal(s.story.resume.id, first);
  assert.deepEqual(s.people, [0, 8, 16, 18, 61, 68, 77]);
  const opening = await layout();
  assert.match(opening.map, /story\/pmap-005\.png/);
  assert.equal(opening.place, '許昌議事廳');

  await page.click('.actor[data-who="68"]');
  await page.waitForSelector('#talk:not([hidden])');
  assert.equal((await state(page)).line, '這次落難了．');
  await page.click('#talk');
  await until(page, first);
  assert.deepEqual((await state(page)).story, fixture, '闲谈不得改变流程');
  assert.deepEqual(await layout(), opening);

  // 点曹操听落难经过与安置，再进第二轮闲谈。
  await page.click('.actor[data-who="8"]');
  await until(page, 'c1_s2_story14:b14g2');
  s = await state(page);
  assert.deepEqual(s.people, [0, 8, 16, 18, 61, 68, 77]);
  assert.equal(s.story.gold, fixture.gold);
  assert.deepEqual(s.story.flags, fixture.flags, '两轮闲谈之间不改标志');

  // 第二轮点「前往官邸」：清场只留曹操与六名谋士，接谋士议事并进入下一幕。
  await page.click('[data-room="continue"]');
  await page.waitForFunction(() => document.querySelector('#talk p')?.textContent === '主公，劉備可是個有雄才大略的英雄．');
  assert.deepEqual((await state(page)).people, [8, 16, 18, 61, 68, 77], '官邸段刘备不在场');
  assert.match((await layout()).map, /story\/pmap-005\.png/);
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    const now = await page.evaluate(() => ({
      section: window.__yjz.story.section,
      talk: !document.getElementById('talk').hidden,
      ask: !!document.querySelector('#talk:not([hidden]) .ask'),
      chapter: !!document.querySelector('#screen .chapter'),
    }));
    if (now.section === 'c1_s3_story0' && !now.talk) break;
    if (now.ask) await page.click('#talk .ask button:first-child');
    else if (now.talk) await page.click('#talk');
    else if (now.chapter) await page.click('#screen');
    else await page.waitForTimeout(30);
  }
  assert.equal(await page.evaluate(() => window.__yjz.story.section), 'c1_s3_story0');
  return '许昌两轮闲谈、曹操两次推进、官邸按钮、谋士议事与刘备退场';
}

// 通用规则编出的房间：用稳定锚点直接载入，验证闲谈、人物推进与地点按钮换景。
export async function verifyGenericGroupRoom(page) {
  const first = 'c2_s0_story1:b1g1', second = 'c2_s0_story1:b1g2';
  const fixture = await page.evaluate(async first => {
    const { SCRIPT, officers } = await import('/src/data/game.ts');
    const { startStory, restoreStoryPosition } = await import('/src/story.ts');
    const st = startStory(SCRIPT, { party: ['liu_bei', 'sun_qian', 'mi_zhu'], gold: 800 });
    st.resume = { t: 'room', id: first };
    st.pc = -1;
    if (!restoreStoryPosition(SCRIPT, st)) throw new Error(`锚点 ${first} 无法定位`);
    for (const id of st.party) st.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] };
    const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
    list.slots[5] = { story: st, at: Date.now() };
    window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
    localStorage.setItem('yjz.script', 'hant');
    localStorage.setItem('yjz.anim-speed', '0');
    return st;
  }, first);

  await loadSlot(page, 5);
  let s = await state(page);
  assert.equal(s.story.resume.id, first);
  assert.deepEqual(s.people, [0, 63, 64]);
  assert.deepEqual(s.story, fixture);

  // 糜竺只是闲谈，不改流程。
  await page.click('.actor[data-who="64"]');
  await page.waitForSelector('#talk:not([hidden])');
  assert.equal((await state(page)).line, '主公，不用那麼擔心，關羽和張飛一定還在什麼地方活著．');
  await page.click('#talk');
  await until(page, first);
  assert.deepEqual((await state(page)).story, fixture);

  // 点孙乾：报文与糜竺离场，进入只有按钮的第二组。
  await page.click('.actor[data-who="63"]');
  await until(page, second);
  s = await state(page);
  assert.deepEqual(s.people, [0, 63]);

  // 「前往」由地点触发承接：换白马议事厅、摆八人、袁绍开口。
  await page.click('[data-room="continue"]');
  await page.waitForFunction(() => document.querySelector('#talk p')?.textContent === '是劉備嗎，哼，你來得正好．');
  s = await state(page);
  assert.deepEqual(s.people, [0, 9, 50, 52, 54, 91, 92, 102]);
  assert.equal(await page.evaluate(() => document.querySelector('.place')?.textContent), '白馬議事廳');
  assert.match(await page.evaluate(() => document.querySelector('.backdrop')?.getAttribute('src')), /story\/pmap-002\.png/);

  // 演完后接下一幕（白马议事厅的质询）。
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    const now = await page.evaluate(() => ({ section: window.__yjz.story.section, talk: !document.getElementById('talk').hidden }));
    if (now.section === 'c2_s0_story2' && now.talk) break;
    if (now.talk) await page.click('#talk');
    else await page.waitForTimeout(30);
  }
  assert.equal(await page.evaluate(() => window.__yjz.story.section), 'c2_s0_story2');
  return '通用房间：闲谈、孙乾推进、糜竺离场、地点按钮换景与下一幕衔接';
}

// 出征房间：最后一组问「出兵嗎？」，确认后列队、出兵，接下一场营地。
export async function verifyDepartureRoom(page) {
  const first = 'c1_s3_story3:b3g4';
  const fixture = await page.evaluate(async first => {
    const { SCRIPT, officers } = await import('/src/data/game.ts');
    const { startStory, restoreStoryPosition } = await import('/src/story.ts');
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei'], gold: 1000 });
    st.resume = { t: 'room', id: first };
    st.pc = -1;
    if (!restoreStoryPosition(SCRIPT, st)) throw new Error(`锚点 ${first} 无法定位`);
    for (const id of st.party) st.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] };
    const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
    list.slots[5] = { story: st, at: Date.now() };
    window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
    localStorage.setItem('yjz.script', 'hant');
    localStorage.setItem('yjz.anim-speed', '0');
    return st;
  }, first);

  await loadSlot(page, 5);
  assert.equal((await state(page)).story.resume.id, first);
  await page.click('.actor[data-who="1"]');
  await page.waitForFunction(() => document.querySelector('#talk p')?.textContent === '出兵嗎？');

  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    const now = await page.evaluate(() => ({
      camp: !!document.querySelector('[data-go="camp-go"]'),
      talk: !document.getElementById('talk').hidden,
      chapter: !!document.querySelector('.chapter'),
    }));
    if (now.camp) break;
    if (now.talk) await page.click('#talk');
    else if (now.chapter) await page.click('#screen');
    else await page.waitForTimeout(30);
  }
  assert.ok(await page.evaluate(() => !!document.querySelector('[data-go="camp-go"]')), '问句之后应进入下邳营地');
  assert.match(await page.evaluate(() => document.querySelector('#screen .card').textContent), /下邳/);
  const s = await state(page);
  assert.deepEqual(s.story.resume, { t: 'camp', id: 'c1_s3_b4' });
  assert.equal(s.story.gold, fixture.gold, '出征不能顺手发军资');
  return '出征房间：问句、列队、出兵与下邳营地衔接';
}

// 选项幕：闲谈房间之后仍是原版选项，选「不是關羽」走生路。
export async function verifyChoiceRoom(page) {
  const first = 'c2_s0_story2:b2g0';
  const fixture = await page.evaluate(async first => {
    const { SCRIPT, officers } = await import('/src/data/game.ts');
    const { startStory, restoreStoryPosition } = await import('/src/story.ts');
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei'], gold: 600 });
    st.resume = { t: 'room', id: first };
    st.pc = -1;
    if (!restoreStoryPosition(SCRIPT, st)) throw new Error(`锚点 ${first} 无法定位`);
    for (const id of st.party) st.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] };
    const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
    list.slots[5] = { story: st, at: Date.now() };
    window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
    localStorage.setItem('yjz.script', 'hant');
    localStorage.setItem('yjz.anim-speed', '0');
    return st;
  }, first);

  await loadSlot(page, 5);
  assert.equal((await state(page)).story.resume.id, first);
  await page.click('.actor[data-who="50"]');
  await page.waitForSelector('#talk:not([hidden])');
  assert.match((await state(page)).line, /顏良被關羽殺了/);
  await page.click('#talk');
  await until(page, first);
  assert.deepEqual((await state(page)).story, fixture, '闲谈不改变流程');

  // 点袁绍：他先说完指控，再出现原版选项。
  await page.click('.actor[data-who="9"]');
  await page.waitForSelector('#talk .ask');
  const labels = await page.evaluate(() => [...document.querySelectorAll('#talk .ask button')].map(b => b.textContent));
  assert.deepEqual(labels, ['是，那人是關羽！', '不，那人不是關羽．']);
  await page.click('#talk .ask button:nth-child(2)');
  await page.waitForFunction(() => document.querySelector('#talk p')?.textContent === '什麼，你說不是關羽？');
  const s = await state(page);
  assert.equal(s.story.gold, fixture.gold);
  assert.equal(s.story.flags['c2_s0_story2.won'], undefined);

  // 下邳处置吕布：宽恕分支同样保留原版选项。
  const trial = 'c1_s3_story5:b5g1';
  const trialFixture = await page.evaluate(async trial => {
    const { SCRIPT, officers } = await import('/src/data/game.ts');
    const { startStory, restoreStoryPosition } = await import('/src/story.ts');
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei'], gold: 600 });
    st.resume = { t: 'room', id: trial };
    st.pc = -1;
    if (!restoreStoryPosition(SCRIPT, st)) throw new Error(`锚点 ${trial} 无法定位`);
    for (const id of st.party) st.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] };
    const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
    list.slots[5] = { story: st, at: Date.now() };
    window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
    return st;
  }, trial);
  await loadSlot(page, 5);
  assert.equal((await state(page)).story.resume.id, trial);
  await page.click('.actor[data-who="4"]');
  await page.waitForSelector('#talk:not([hidden])');
  assert.match((await state(page)).line, /戰場上我還不會輸/);
  await page.click('#talk');
  await until(page, trial);
  assert.deepEqual((await state(page)).story, trialFixture, '吕布闲谈不改变流程');
  // 第一个房间用按钮推进（曹操不在场上），吕布说完后再点他一次进选项。
  await page.click('[data-room="continue"]');
  await until(page, 'c1_s3_story5:b5g2');
  await page.click('.actor[data-who="4"]');
  for (let i = 0; i < 30; i++) {
    const now = await page.evaluate(() => ({
      ask: !!document.querySelector('#talk:not([hidden]) .ask'),
      talk: !document.getElementById('talk').hidden,
    }));
    if (now.ask) break;
    if (now.talk) await page.click('#talk');
    else await page.waitForTimeout(50);
  }
  await page.waitForSelector('#talk .ask');
  assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('#talk .ask button')].map(b => b.textContent)),
    ['寬恕呂布', '不寬恕呂布']);
  await page.click('#talk .ask button:nth-child(1)');
  await page.waitForFunction(() => document.querySelector('#talk p')?.textContent?.startsWith('呂布確實反叛無常'));
  return '选项幕：袁绍指控与生路分支、下邳宽恕吕布';
}

// 有序停顿的另一类：徐庶离队这一幕保留 pack 的 away，房间不碰队伍。
export async function verifyXuShuRooms(page) {
  const first = 'c2_s2_story1:b1g1';
  const fixture = await page.evaluate(async first => {
    const { SCRIPT, officers } = await import('/src/data/game.ts');
    const { startStory, restoreStoryPosition } = await import('/src/story.ts');
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei', 'sun_qian', 'jian_yong', 'xu_shu'], gold: 700 });
    st.resume = { t: 'room', id: first };
    st.pc = -1;
    if (!restoreStoryPosition(SCRIPT, st)) throw new Error(`锚点 ${first} 无法定位`);
    for (const id of st.party) st.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] };
    const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
    list.slots[5] = { story: st, at: Date.now() };
    window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
    localStorage.setItem('yjz.script', 'hant');
    localStorage.setItem('yjz.anim-speed', '0');
    return st;
  }, first);

  await loadSlot(page, 5);
  let s = await state(page);
  assert.equal(s.story.resume.id, first);
  assert.ok(s.story.party.includes('xu_shu'));

  // 徐庶离队前有四段告别（原版就是这样），每段都是点击推进；away 仍由 pack 执行。
  await page.click('[data-room="continue"]');
  const deadline = Date.now() + 45000;
  let seen = '', left = false;
  const visited = [];
  while (Date.now() < deadline) {
    const now = await page.evaluate(() => ({
      line: document.querySelector('#talk p')?.textContent ?? '',
      talk: !document.getElementById('talk').hidden,
      ask: !!document.querySelector('#talk:not([hidden]) .ask'),
      party: window.__yjz.story.party,
      room: document.querySelector('.room-controls') ? window.__yjz.story.resume?.id : '',
    }));
    if (now.line.includes('請您一定要請孔明來')) seen = now.line;
    if (!now.party.includes('xu_shu')) { left = true; break; }
    if (now.ask) await page.click('#talk .ask button:first-child');
    else if (now.talk) await page.click('#talk');
    else if (now.room) {
      if (visited.at(-1) !== now.room) visited.push(now.room);
      await page.click('[data-room="continue"]');
    } else await page.waitForTimeout(30);
  }
  assert.match(seen, /孔明/);
  assert.ok(left, '告别后徐庶离队');
  assert.ok(visited.length >= 2, `离队前应有多段告别：${JSON.stringify(visited)}`);
  s = await state(page);
  assert.equal(s.story.gold, fixture.gold);
  return '徐庶离队：有序房间推进、pack 的 away 保留、军资不变';
}

// 推进组自带进退场：房间插在动作之前，流程照原顺序走完，不被走位打断。
export async function verifyActionRoomPause(page) {
  const first = 'c2_s3_story8:b8g1';
  const fixture = await page.evaluate(async first => {
    const { SCRIPT, officers } = await import('/src/data/game.ts');
    const { startStory, restoreStoryPosition } = await import('/src/story.ts');
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei', 'zhuge_liang'], gold: 1200 });
    st.resume = { t: 'room', id: first };
    st.pc = -1;
    if (!restoreStoryPosition(SCRIPT, st)) throw new Error(`锚点 ${first} 无法定位`);
    for (const id of st.party) st.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] };
    const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
    list.slots[5] = { story: st, at: Date.now() };
    window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
    localStorage.setItem('yjz.script', 'hant');
    localStorage.setItem('yjz.anim-speed', '0');
    return st;
  }, first);

  await loadSlot(page, 5);
  let s = await state(page);
  assert.equal(s.story.resume.id, first);
  assert.ok(s.people.includes(0), '刘备在场上');

  // 这一幕的推进人（刘琦、鲁肃）在原版没有立绘，靠房间按钮推进；记下沿途台词以核对顺序。
  const seen = [];
  const walk = async target => {
    const deadline = Date.now() + 45000;
    while (Date.now() < deadline) {
      const now = await page.evaluate(() => ({
        room: document.querySelector('.room-controls') ? window.__yjz.story.resume?.id : '',
        line: document.querySelector('#talk p')?.textContent ?? '',
        talk: !document.getElementById('talk').hidden,
        ask: !!document.querySelector('#talk:not([hidden]) .ask'),
        chapter: !!document.querySelector('.chapter'),
      }));
      if (now.line && now.line !== seen.at(-1)) seen.push(now.line);
      if (now.room === target) return;
      if (now.ask) await page.click('#talk .ask button:first-child');
      else if (now.talk) await page.click('#talk');
      else if (now.chapter) await page.click('#screen');
      else if (now.room) await page.click('[data-room="continue"]');
      else await page.waitForTimeout(30);
    }
    throw new Error(`未到达 ${target}`);
  };

  await walk('c2_s3_story8:b8g2');
  await walk('c2_s3_story8:b8g3');
  // 最后一段接下一幕。
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    const now = await page.evaluate(() => ({
      section: window.__yjz.story.section,
      line: document.querySelector('#talk p')?.textContent ?? '',
      talk: !document.getElementById('talk').hidden,
      ask: !!document.querySelector('#talk:not([hidden]) .ask'),
      room: !!document.querySelector('.room-controls'),
    }));
    if (now.line && now.line !== seen.at(-1)) seen.push(now.line);
    if (now.section === 'c2_s3_story9') break;
    if (now.ask) await page.click('#talk .ask button:first-child');
    else if (now.talk) await page.click('#talk');
    else if (now.room) await page.click('[data-room="continue"]');
    else await page.waitForTimeout(30);
  }
  assert.equal(await page.evaluate(() => window.__yjz.story.section), 'c2_s3_story9', '三段房间后接下一幕');

  // 锚点在第一段之后，所以只核对后两段的先后：鲁肃告退 → 众人议论。
  const at = text => seen.findIndex(l => l.includes(text));
  const leave = at('我告辭了'), doubt = at('孫權真被說服');
  assert.ok(leave >= 0 && doubt > leave, `台词顺序应保持原样：${JSON.stringify(seen.slice(0, 8))}`);
  assert.equal((await state(page)).story.gold, fixture.gold, '交谈不发军资');
  return '进退场幕：三段房间按原顺序推进，鲁肃引荐→告退→诸葛亮应答，末段接下一幕';
}

// 幕尾没有台词的闲谈组并进上一个房间：只出现一个停顿点，流程照原顺序走完。
export async function verifyMergedTailRoom(page) {
  const first = 'c2_s1_story4:b4g0';
  const fixture = await page.evaluate(async first => {
    const { SCRIPT, officers } = await import('/src/data/game.ts');
    const { startStory, restoreStoryPosition } = await import('/src/story.ts');
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei'], gold: 900 });
    st.resume = { t: 'room', id: first };
    st.pc = -1;
    if (!restoreStoryPosition(SCRIPT, st)) throw new Error(`锚点 ${first} 无法定位`);
    for (const id of st.party) st.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] };
    const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
    list.slots[5] = { story: st, at: Date.now() };
    window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
    localStorage.setItem('yjz.script', 'hant');
    localStorage.setItem('yjz.anim-speed', '0');
    return st;
  }, first);

  await loadSlot(page, 5);
  let s = await state(page);
  assert.equal(s.story.resume.id, first, '幕尾闲谈不另开房间');
  assert.ok(s.people.length > 0, '房间里有可见人物');

  // 点「與劉封交談」推进：他没有立绘，按钮承接同样的动作。
  await page.click('[data-room="continue"]');
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    const now = await page.evaluate(() => ({
      section: window.__yjz.story.section,
      talk: !document.getElementById('talk').hidden,
      ask: !!document.querySelector('#talk:not([hidden]) .ask'),
    }));
    if (now.section === 'c2_s1_story5') break;
    if (now.ask) await page.click('#talk .ask button:first-child');
    else if (now.talk) await page.click('#talk');
    else await page.waitForTimeout(30);
  }
  assert.equal(await page.evaluate(() => window.__yjz.story.section), 'c2_s1_story5', '幕尾并入后仍接下一幕');
  assert.equal((await state(page)).story.gold, fixture.gold, '交谈不发军资');
  return '幕尾闲谈并入上一个房间：单停顿点、按钮推进、接下一幕';
}

// 三顾茅庐：两段房间之后仍是原版选项；中间闲谈组已经并进第二个房间。
export async function verifyLongChoiceRoom(page) {
  const first = 'c2_s2_story3:b3g0', second = 'c2_s2_story3:b3g1';
  const fixture = await page.evaluate(async first => {
    const { SCRIPT, officers } = await import('/src/data/game.ts');
    const { startStory, restoreStoryPosition } = await import('/src/story.ts');
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei'], gold: 500 });
    st.resume = { t: 'room', id: first };
    st.pc = -1;
    if (!restoreStoryPosition(SCRIPT, st)) throw new Error(`锚点 ${first} 无法定位`);
    for (const id of st.party) st.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] };
    const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
    list.slots[5] = { story: st, at: Date.now() };
    window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
    localStorage.setItem('yjz.script', 'hant');
    localStorage.setItem('yjz.anim-speed', '0');
    return st;
  }, first);

  await loadSlot(page, 5);
  assert.equal((await state(page)).story.resume.id, first);

  // 有立绘就点人，没有就用房间按钮——两者在原版里是同一个触发。
  const advance = async (target) => {
    const deadline = Date.now() + 60000;
    while (Date.now() < deadline) {
      const now = await page.evaluate(() => ({
        room: document.querySelector('.room-controls') ? window.__yjz.story.resume?.id : '',
        talk: !document.getElementById('talk').hidden,
        ask: !!document.querySelector('#talk:not([hidden]) .ask'),
        choice: !!document.querySelector('#talk .ask'),
      }));
      if (now.room === target) return;
      if (now.choice) return;
      if (now.talk) await page.click('#talk');
      else if (now.room) await page.click('[data-room="continue"]');
      else await page.waitForTimeout(30);
    }
    throw new Error(`未到达 ${target}`);
  };

  await advance(second);
  const s = await state(page);
  assert.equal(s.story.resume.id, second);
  assert.equal(s.story.gold, fixture.gold, '房间不发放军资');

  // 第二个房间合并了两组幕尾闲谈，点关羽推进后进入原版选项。
  await advance('choice');
  const labels = await page.evaluate(() => [...document.querySelectorAll('#talk .ask button')].map(b => b.textContent));
  assert.ok(labels.length >= 2, `应保留原版选项：${JSON.stringify(labels)}`);
  return '三顾茅庐：两段房间、合并闲谈与原版选项';
}

// 原版按触发人各录一版的对白：点谁播谁那一版，不重复、不串台。
export async function verifyBranchOptionRooms(page) {
  const room = 'c1_s4_story6:b6g0';
  const open = async who => {
    await page.evaluate(async ({ room }) => {
      const { SCRIPT, officers } = await import('/src/data/game.ts');
      const { startStory, restoreStoryPosition } = await import('/src/story.ts');
      const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei'], gold: 700 });
      st.resume = { t: 'room', id: room };
      st.pc = -1;
      if (!restoreStoryPosition(SCRIPT, st)) throw new Error(`锚点 ${room} 无法定位`);
      for (const id of st.party) st.roster[id] ??= { level: officers[id]?.level ?? 1, exp: 0, items: [] };
      const list = JSON.parse(window.__yjz.saveStorage.getItem('yjz.saves.v1') ?? '{"slots":[],"last":null}');
      list.slots[5] = { story: st, at: Date.now() };
      window.__yjz.saveStorage.setItem('yjz.saves.v1', JSON.stringify(list));
      localStorage.setItem('yjz.script', 'hant');
      localStorage.setItem('yjz.anim-speed', '0');
    }, { room });
    await loadSlot(page, 5);
    assert.equal((await state(page)).story.resume.id, room);
  };

  await open();
  const labels = await page.evaluate(() => [...document.querySelectorAll('[data-room="continue"]')].map(b => b.textContent));
  assert.deepEqual(labels, ['與關羽交談', '與張飛交談'], '两个分支各自成选项');

  // 走完所选分支，沿途记下台词。
  const walk = async pick => {
    await open();
    await page.click(`[data-room="continue"][data-answer="${pick}"]`);
    const seen = [];
    const deadline = Date.now() + 45000;
    while (Date.now() < deadline) {
      const now = await page.evaluate(() => ({
        line: document.querySelector('#talk p')?.textContent ?? '',
        talk: !document.getElementById('talk').hidden,
        ask: !!document.querySelector('#talk:not([hidden]) .ask'),
        section: window.__yjz.story.section,
      }));
      if (now.line && now.line !== seen.at(-1)) seen.push(now.line);
      if (now.section !== 'c1_s4_story6') break;
      if (now.talk) await page.click('#talk');
      else if (now.ask) await page.click('#talk .ask button:first-child');
      else await page.waitForTimeout(30);
    }
    return seen;
  };

  const guan = await walk(0);
  assert.ok(guan.some(l => l.includes('聖上有什麼事')), `关羽版应出现：${JSON.stringify(guan)}`);
  assert.ok(!guan.some(l => l.includes('陛下有什麼事')), '关羽分支不应播张飞版');

  const zhang = await walk(1);
  assert.ok(zhang.some(l => l.includes('陛下有什麼事')), `张飞版应出现：${JSON.stringify(zhang)}`);
  assert.ok(!zhang.some(l => l.includes('聖上有什麼事')), '张飞分支不应播关羽版');
  return '衣带诏：关羽/张飞两版互斥，各播三句且不重复';
}
