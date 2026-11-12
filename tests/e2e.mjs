// 浏览器实操验证：全程用真实的鼠标点击和键盘操作，不直接改游戏状态。
// 先启动开发服务器（npm run dev -- --port 5273），再运行：node tests/e2e.mjs
// 截图写入 docs/screenshots/。读状态用的 window.__yjz 只在开发模式存在。
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { open } from '../tools/browser.mjs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5273';
const SHOTS = new URL('../docs/screenshots/', import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });

let page;
const shot = (name) => page.screenshot({ path: `${SHOTS}${name}.png` });
const state = () => page.evaluate(() => JSON.parse(JSON.stringify(window.__yjz.b)));
const mode = () => page.evaluate(() => window.__yjz.mode);
const unit = async (name) => (await state()).units.find((u) => u.name === name);

/** 等到游戏可以接受输入；途中遇到对话就点掉，遇到询问按 answers 回答。 */
async function settle(answerYes = true) {
  for (let i = 0; i < 4000; i++) {
    const s = await page.evaluate(() => ({
      mode: window.__yjz.mode,
      talk: !document.getElementById('talk').hidden,
      ask: !!document.querySelector('#talk:not([hidden]) .ask'),
      screen: !!document.querySelector('#screen:not([hidden]) .card'), // 整屏卡片（标题、战前说明、胜败）；剧情背景不算
    }));
    if (s.ask) await page.click(answerYes ? '#talk .ask button:first-child' : '#talk .ask button:last-child');
    else if (s.talk) await page.click('#talk');
    else if (s.screen || s.mode !== 'busy') return s;
    await page.waitForTimeout(15);
  }
  throw new Error('等待超时：游戏一直处于播放状态');
}

/** 点击地图上的一格（先把镜头移过去，这只是视角，不改战斗状态）。 */
async function clickCell(x, y, button = 'left') {
  const p = await page.evaluate(([cx, cy]) => {
    const { scene } = window.__yjz;
    scene.focus(cx, cy, true);
    const cam = scene.cameras.main;
    const r = document.querySelector('#map canvas').getBoundingClientRect();
    const cell = cam.width / 13; // 视野宽 13 格
    const s = r.width / cam.width;
    return { x: r.left + ((cx + 0.5) * cell - cam.scrollX) * s, y: r.top + ((cy + 0.5) * cell - cam.scrollY) * s };
  }, [x, y]);
  await page.mouse.move(p.x, p.y);
  await page.mouse.click(p.x, p.y, { button });
  await page.waitForTimeout(20);
}
const menu = (label) => page.click(`#menu button:has-text("${label}")`);
const sys = (label) => page.click(`#sys button:has-text("${label}")`);

/** 机器人替玩家拿主意（用页面里同一套规则模块算可达格和可打目标），再用真实点击执行。
 *  policy：bot 稳妥打法；hunt 直扑最近的敌人（莽）；duel 直扑华雄；flee 躲远。 */
async function decide(name, policy) {
  return page.evaluate(async ([unitName, how]) => {
    if (how === 'bot') {
      // 稳妥打法：与规则层整场模拟共用 tests/bot.ts
      const { plan } = await import('/tests/bot.ts');
      return plan(window.__yjz.b, unitName);
    }
    const { reachField, canStop, field } = await import('/src/rules/move.ts');
    const { attackTargets, unitAt } = await import('/src/rules/core.ts');
    const b = window.__yjz.b;
    const u = b.units.find((v) => v.name === unitName);
    const foes = b.units.filter((v) => v.on && v.slot >= 15);
    const f = reachField(b, u);
    const cells = [];
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) if (canStop(b, u, f, x, y)) cells.push([x, y]);
    // 到某个敌人的实际路程（绕河、过桥都算上），不是直线距离
    const walk = (t) => field(b, u, t.x, t.y, 255, -1, true).dist;
    const boss = b.units.find((v) => v.slot === 15);
    const toBoss = walk(boss);
    const toFoes = foes.map(walk);
    const nearest = (x, y) => Math.min(...toFoes.map((d) => d[y * b.w + x]));
    let score;
    if (how === 'flee') score = ([x, y]) => -nearest(x, y);
    // 华雄被自己人和关墙堵在里面、走不到时，先去打最近的敌人开路
    else if (how === 'duel' && cells.some(([x, y]) => toBoss[y * b.w + x] !== 255))
      score = ([x, y]) => toBoss[y * b.w + x] * 10 - (attackTargets(b, u, x, y).length ? 1 : 0);
    else score = ([x, y]) => nearest(x, y) * 10 - (attackTargets(b, u, x, y).length ? 5 : 0);
    cells.sort((p, q) => score(p) - score(q));
    const [x, y] = cells[0];
    const targets = attackTargets(b, u, x, y).filter((t) => t !== unitAt(b, x, y));
    targets.sort((p, q) => p.hp - q.hp);
    return { from: [u.x, u.y], to: [x, y], target: how === 'flee' || !targets.length ? null : [targets[0].x, targets[0].y] };
  }, [name, policy]);
}

/** 用真实点击让一支部队行动一次：选中 → 移动 → 攻击或待命。 */
async function command(name, policy) {
  const u = await unit(name);
  if (!u.on || u.acted || u.confused) return;
  const plan = await decide(name, policy);
  await clickCell(u.x, u.y);
  assert.equal(await mode(), 'unit', `${name} 应处于选中状态`);
  await clickCell(...plan.to); // 点自己脚下 = 原地下令
  await settle();
  assert.equal(await mode(), 'menu', `${name} 移动后应弹出指令菜单`);
  if (plan.target) {
    await menu('攻击');
    await clickCell(...plan.target);
  } else await menu('待命');
  await settle();
}

async function endTurn() {
  if ((await mode()) !== 'idle') return;
  await sys('回合结束');
  await settle();
}

async function start(seed, fast = true) {
  await page.goto(`${BASE}/?seed=${seed}${fast ? '&fast' : ''}`);
  await page.waitForSelector('#screen button');
  await page.click('button:has-text("开始新游戏")');
  await settle(); // 点完开场剧情（选择一律选第一项），停在战前说明
  await page.click('button:has-text("出阵")');
  await settle();
}

const steps = [];
const step = async (title, fn) => {
  await fn();
  steps.push(title);
  console.log('✓', title);
};

const { browser, page: p, errors } = await open(`${BASE}/`);
page = p;

await step('标题 → 开场剧情 → 战前说明 → 进入战斗', async () => {
  await page.waitForSelector('#screen button');
  await shot('01-title');
  await page.click('button:has-text("开始新游戏")');
  await page.waitForSelector('#talk:not([hidden])');
  await shot('15-story');
  await page.keyboard.press('Enter'); // 键盘也能翻对话
  await settle();
  assert.equal((await page.evaluate(() => window.__yjz.story.flags.briefed)), true, '选择「听」应记下标志');
  await shot('02-brief');
  await start(20261111);
  const b = await state();
  assert.equal(b.round, 1);
  assert.equal(b.stage, 'player');
  assert.equal(b.units.length, 12);
  await shot('03-battle-start');
});

await step('选中关羽显示移动范围；右键取消', async () => {
  const g = await unit('关羽');
  await clickCell(g.x, g.y);
  assert.equal(await mode(), 'unit');
  await shot('04-select-move-range');
  await clickCell(g.x + 1, g.y + 3, 'right');
  assert.equal(await mode(), 'idle');
});

await step('移动后弹出指令菜单；Esc 取消则退回原位', async () => {
  const g = await unit('关羽');
  const plan = await decide('关羽', 'duel');
  await clickCell(g.x, g.y);
  await clickCell(...plan.to);
  await settle();
  assert.equal(await mode(), 'menu');
  assert.deepEqual([(await unit('关羽')).x, (await unit('关羽')).y], plan.to);
  await shot('05-command-menu');
  await page.keyboard.press('Escape');
  const back = await unit('关羽');
  assert.deepEqual([back.x, back.y, back.moved], [g.x, g.y, false]);
  await page.keyboard.press('Escape');
  assert.equal(await mode(), 'idle');
});

await step('查看敌军状态与移动范围（不能下令）', async () => {
  const h = await unit('华雄');
  await clickCell(h.x, h.y);
  assert.equal(await mode(), 'idle');
  assert.match(await page.textContent('#unit'), /华雄/);
  await shot('06-inspect-enemy');
});

await step('存档 → 继续打两回合 → 读档，状态与存档时完全一致', async () => {
  await clickCell(27, 0); // 点空地取消查看
  await sys('存档');
  const saved = await state();
  await command('关羽', 'duel');
  await command('张飞', 'hunt');
  await endTurn();
  await endTurn();
  assert.notDeepEqual(await state(), saved);
  await sys('读档');
  await settle();
  assert.deepEqual(await state(), saved, '读档应恢复完整战斗状态（含随机数、回合、行动标记、事件）');
});

await step('刷新页面后从标题读取存档', async () => {
  const saved = JSON.parse(await page.evaluate(() => localStorage.getItem('yjz.save.v2'))).battle;
  await page.reload();
  await page.waitForSelector('#screen button');
  await page.click('button:has-text("读取存档")');
  await settle();
  assert.deepEqual(await state(), saved);
});

await step('正常游玩通关：关羽贴近华雄触发单挑', async () => {
  await start(20261111);
  let attacked = false;
  for (let turn = 0; turn < 30; turn++) {
    const before = await state();
    if (before.stage !== 'player') break;
    for (const [name, policy] of [['张飞', 'bot'], ['关羽', 'bot'], ['刘备', 'bot']]) {
      if ((await state()).stage !== 'player') break;
      if (!attacked && name === '张飞') {
        const plan = await decide('张飞', 'bot');
        if (plan.target) {
          // 截一张选择攻击目标的画面
          const z = await unit('张飞');
          await clickCell(z.x, z.y);
          await clickCell(...plan.to);
          await settle();
          await menu('攻击');
          await shot('07-attack-target');
          await clickCell(...plan.target);
          await settle();
          attacked = true;
          await shot('08-after-attack');
          continue;
        }
      }
      await command(name, policy);
    }
    if ((await state()).stage === 'player') await endTurn();
    if (turn === 0) await shot('09-after-enemy-phase');
  }
  const b = await state();
  assert.equal(b.stage, 'won', `应当获胜，实际 ${b.stage}（${b.reason}）`);
  assert.equal(b.units.find((u) => u.name === '华雄').on, false);
  assert.equal(b.units.find((u) => u.name === '关羽').level, 2, '单挑后关羽升一级');
  assert.ok(b.flags.includes('duel'));
  assert.ok(b.gold >= 100, '胜利奖励 100 金');
  await shot('10-victory');
  console.log(`  通关：第 ${b.round} 回合，${b.reason}，军资 ${b.gold}`);
});

await step('胜利后继续：成长、军资和战斗里的事件带回流程，战后剧情演完回到标题', async () => {
  await page.click('button:has-text("继续")');
  await settle();
  const st = await page.evaluate(() => JSON.parse(JSON.stringify(window.__yjz.story)));
  assert.equal(st.roster['关羽'].level, 2);
  assert.ok(st.gold >= 100);
  assert.equal(st.flags['sishui.duel'], true);
  assert.match(await page.textContent('#screen .card'), /序章 完/);
  await page.click('button:has-text("回到标题")');
  await page.waitForSelector('button:has-text("开始新游戏")');
});

await step('正常游玩失败：刘备孤军深入被击破', async () => {
  await start(42);
  assert.equal((await unit('关羽')).level, 1, '新游戏不带上一局的成长');
  for (let turn = 0; turn < 30 && (await state()).stage === 'player'; turn++) {
    await command('刘备', 'hunt');
    if ((await state()).stage === 'player') await endTurn();
  }
  const b = await state();
  assert.equal(b.stage, 'lost', `应当失败，实际 ${b.stage}`);
  assert.match(b.reason, /刘备撤退/);
  await shot('11-defeat');
  console.log(`  失败：第 ${b.round} 回合，${b.reason}`);
  await page.click('button:has-text("回到标题")');
  await page.waitForSelector('button:has-text("开始新游戏")');
});

await step('系统指令「全军撤退」：询问后判负；败了重新开始，回到这一关第 1 回合的初始状态', async () => {
  await start(5);
  await sys('全军撤退');
  await settle(true);
  assert.equal((await state()).stage, 'lost');
  await shot('12-retreat');
  await page.click('button:has-text("重新开始")');
  await page.click('button:has-text("出阵")');
  await settle();
  const b = await state();
  assert.deepEqual([b.round, b.stage, b.gold, b.flags.length], [1, 'player', 0, 0]);
  assert.ok(b.units.every((u) => u.on && u.morale === 100));
});

await step('回合上限：30 回合内未取胜判负（全程只按回合结束）', async () => {
  await start(9);
  // 让我军躲到东北角，避免先被击破；之后每回合只结束回合
  for (let turn = 0; turn < 31 && (await state()).stage === 'player'; turn++) {
    for (const name of ['刘备', '关羽', '张飞']) if ((await state()).stage === 'player') await command(name, 'flee');
    if ((await state()).stage === 'player') await endTurn();
  }
  const b = await state();
  console.log(`  结果：${b.stage}，第 ${b.round} 回合，${b.reason}`);
  assert.equal(b.stage, 'lost');
});

await step('正常速度（带动画）下的一次移动与攻击', async () => {
  await start(20261111, false);
  // 汜水关用到 3 个兵种（短兵 0、弓兵 3、轻骑兵 6）：清单里的原版帧表都该验过并登记
  const actors = await page.evaluate(() => [...window.__yjz.scene.ready.values()]);
  assert.equal(actors.length, 3, '三个兵种都应有特写演员');
  assert.ok(actors.every((k) => k.startsWith('actor:cutin/')), '演员应来自原版帧图集');
  await command('关羽', 'duel');
  await command('张飞', 'hunt');
  // 友军第一回合就会打到前排步兵：对阵条出现时截一张
  const clash = page.waitForSelector('#clash:not([hidden])').then(() => page.waitForTimeout(260)).then(() => shot('14-attack-banner'));
  await endTurn();
  await clash;
  assert.equal((await state()).round, 2);
});

await step('演示流程（不配图）：两场战斗用占位画法，第二场带着第一场的成长', async () => {
  await page.goto(`${BASE}/?demo&fast&seed=1`);
  await page.waitForSelector('#screen button');
  await page.click('button:has-text("开始新游戏")');
  for (const level of ['demo1', 'demo2']) {
    await settle();
    await page.click('button:has-text("出阵")');
    await settle();
    const b = await state();
    assert.equal(b.level, level);
    assert.ok(await page.evaluate((l) => window.__yjz.scene.textures.get(`map:${l}`).source[0].isCanvas, level), '没有配图的关卡应使用占位地图');
    const [hero, dummy] = [b.units[0], b.units.find((u) => u.slot === 15)];
    if (level === 'demo2') {
      assert.ok(hero.level >= 30, '第二场应带着第一场的等级');
      assert.deepEqual(hero.items, [27]);
      await shot('16-placeholder-level');
    }
    await clickCell(hero.x, hero.y);
    await clickCell(hero.x, hero.y); // 再点自己 = 原地下令
    await menu('攻击');
    await clickCell(dummy.x, dummy.y);
    await settle();
    assert.equal((await state()).stage, 'won');
    await page.click('button:has-text("继续")');
  }
  await settle();
  assert.match(await page.textContent('#screen .card'), /演示 完/);
});

await step('战斗特写（演示演员，正常速度）：攻方逐帧出手，到命中帧守方才播受击', async () => {
  await page.goto(`${BASE}/?demo&seed=1`);
  await page.waitForSelector('#screen button');
  await page.click('button:has-text("开始新游戏")');
  await settle();
  await page.click('button:has-text("出阵")');
  await settle();
  const b = await state();
  const [hero, dummy] = [b.units[0], b.units.find((u) => u.slot === 15)];
  // 每 16 毫秒记一次特写里左右两个演员正在显示的帧号
  await page.evaluate(() => {
    window.__seen = [];
    window.__rec = setInterval(() => {
      const box = window.__yjz.scene.children.list.find((o) => o.type === 'Container');
      if (box) window.__seen.push(box.list.filter((o) => o.type === 'Sprite').map((sp) => Number(sp.frame.name)));
    }, 16);
  });
  await clickCell(hero.x, hero.y);
  await clickCell(hero.x, hero.y);
  await menu('攻击');
  await clickCell(dummy.x, dummy.y);
  await page.waitForFunction(() => window.__seen.length > 0);
  await page.waitForTimeout(380);
  await shot('17-cutin');
  await settle();
  const seen = await page.evaluate(() => (clearInterval(window.__rec), window.__seen));
  const [att, def] = [seen.map((f) => f[0]), seen.map((f) => f[1])];
  for (const f of [0, 1, 2, 3, 4]) assert.ok(att.includes(f), `攻方应显示过第 ${f} 帧`);
  assert.ok(def.includes(5), '守方应播受击帧');
  assert.ok(def.indexOf(5) >= att.indexOf(4), '守方的受击不应早于攻方的命中帧');
  assert.equal((await state()).stage, 'won');
});

assert.deepEqual(errors, [], '浏览器控制台不应有报错');
console.log(`\n全部 ${steps.length} 项通过，截图在 docs/screenshots/`);
await browser.close();
