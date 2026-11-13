// 浏览器实操验证：全程用真实的鼠标点击和键盘操作，不直接改游戏状态。
// 先启动开发服务器（npm run dev -- --port 5273），再运行：node tests/e2e.mjs
// 截图写入 docs/screenshots/。读状态用的 window.__yjz 只在开发模式存在。
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { open } from '../tools/browser.mjs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5273';
const SHOTS = new URL('../docs/screenshots/', import.meta.url).pathname;
const SAVE = 'yjz.save.v3';
mkdirSync(SHOTS, { recursive: true });

let page;
const shot = (name) => page.screenshot({ path: `${SHOTS}${name}.png` });
/** 在舞台左上角的修改器热区连点三下。 */
async function tapCorner() {
  const { x, y } = await page.evaluate(() => {
    const r = document.getElementById('stage').getBoundingClientRect();
    return { x: r.left, y: r.top };
  });
  for (let i = 0; i < 3; i++) await page.mouse.click(x + 8, y + 8);
}
const state = () => page.evaluate(() => JSON.parse(JSON.stringify(window.__yjz.b)));
const mode = () => page.evaluate(() => window.__yjz.mode);
const storyNow = () => page.evaluate(() => JSON.parse(JSON.stringify(window.__yjz.story)));
const unit = async (name) => (await state()).units.find((u) => u.name === name || u.key === name);
const seen = () => page.evaluate(() => ({
  mode: window.__yjz.mode,
  talk: !document.getElementById('talk').hidden,
  ask: !!document.querySelector('#talk:not([hidden]) .ask'),
  chapter: document.querySelector('#screen .chapter')?.textContent ?? '',
  camp: !!document.querySelector('[data-go="camp-go"]'),
  brief: !!document.querySelector('[data-go="deploy"]'),
  deploy: !!document.querySelector('[data-go="battle"]'),
  card: document.querySelector('#screen:not([hidden]) .card')?.textContent ?? '',
}));

/** 一路点下去：章节横幅、对白、询问都点掉，直到营地或战前说明或战场待命。 */
async function advance(limit = 600) {
  for (let i = 0; i < limit; i++) {
    const s = await seen();
    if (s.chapter) { await page.click('#screen'); continue; } // 章节横幅点一下继续
    if (s.ask) { await page.click('#talk .ask button:first-child'); continue; }
    if (s.talk) { await page.click('#talk'); continue; }
    if (s.camp || s.brief || s.mode === 'idle') return s;
    await page.waitForTimeout(20);
  }
  throw new Error('剧情卡住了：既没有对话也没有营地');
}

/** 等到战场可以接受输入；途中遇到对话或询问就点掉。 */
async function settle(answerYes = true) {
  for (let i = 0; i < 6000; i++) {
    const s = await page.evaluate(() => ({
      mode: window.__yjz.mode,
      talk: !document.getElementById('talk').hidden,
      ask: !!document.querySelector('#talk:not([hidden]) .ask'),
      card: !!document.querySelector('#screen:not([hidden]) .card'),
    }));
    if (s.ask) await page.click(answerYes ? '#talk .ask button:first-child' : '#talk .ask button:last-child');
    else if (s.talk) await page.click('#talk');
    else if (s.card || s.mode !== 'busy') return s;
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
 *  policy：bot 稳妥打法；duel 直扑敌将；hunt 直扑最近的敌人；flee 躲远。 */
async function decide(name, policy) {
  return page.evaluate(async ([unitName, how]) => {
    if (how === 'bot') {
      const { plan } = await import('/tests/bot.ts');
      return plan(window.__yjz.b, unitName);
    }
    const { reachField, canStop } = await import('/src/rules/move.ts');
    const { attackTargets, moveCost, unitAt } = await import('/src/rules/core.ts');
    const b = window.__yjz.b;
    const u = b.units.find((v) => v.name === unitName || v.key === unitName);
    const foes = b.units.filter((v) => v.on && v.slot >= 15);
    const f = reachField(b, u);
    const cells = [];
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) if (canStop(b, u, f, x, y)) cells.push([x, y]);
    const boss = b.units.find((v) => v.commander) ?? b.units.find((v) => v.slot === 15);
    // 到敌将的粗略步数：只看地形能不能走，不管中间站着谁（要绕河、过桥）
    const rough = new Int16Array(b.w * b.h).fill(-1);
    const q = [boss.y * b.w + boss.x];
    rough[q[0]] = 0;
    for (let i = 0; i < q.length; i++) {
      const cur = q[i], cx = cur % b.w, cy = (cur - cx) / b.w;
      for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= b.w || ny >= b.h) continue;
        const n = ny * b.w + nx;
        if (rough[n] >= 0 || moveCost(u.cls, b.terrain[n]) === 255) continue;
        rough[n] = rough[cur] + 1;
        q.push(n);
      }
    }
    const near = (x, y) => (rough[y * b.w + x] < 0 ? 999 : rough[y * b.w + x]);
    const nearest = (x, y) => Math.min(...foes.map((t) => near(t.x, t.y) + Math.max(Math.abs(t.x - x), Math.abs(t.y - y))));
    let score;
    if (how === 'flee') score = ([x, y]) => -nearest(x, y);
    else if (how === 'duel') score = ([x, y]) => near(x, y) * 10 - (attackTargets(b, u, x, y).length ? 4 : 0);
    else score = ([x, y]) => nearest(x, y) * 10 - (attackTargets(b, u, x, y).length ? 5 : 0);
    cells.sort((p, q2) => score(p) - score(q2));
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

/** 战前说明 → 部队配置 → 开战（配置画面点「自動配置」按原版出兵位摆好）。 */
async function startBattle(auto = true) {
  if (await page.$('[data-go="deploy"]')) {
    await page.click('[data-go="deploy"]');
    await page.waitForSelector('[data-go="battle"]');
    if (auto) await page.click('[data-go="auto"]');
    await page.click('[data-go="battle"]');
  } else if (await page.$('[data-go="new"]')) await page.click('[data-go="new"]');
}

/** 从标题开新游戏，一路点到战场待命。fast 时对话自动过，只点章节、营地和战前说明。 */
async function start(seed, fast = true) {
  await page.goto(`${BASE}/?seed=${seed}${fast ? '&fast' : ''}`);
  await page.waitForSelector('[data-go="start"]');
  await page.click('[data-go="start"]');
  let s = await advance();
  if (s.camp) {
    await page.click('[data-go="camp-go"]');
    await page.waitForSelector('[data-go="deploy"]');
    s = await seen();
  }
  if (s.brief || s.deploy) await startBattle();
  await page.waitForFunction(() => window.__yjz?.mode === 'idle', null, { timeout: 60000 });
}

const steps = [];
const step = async (title, fn) => {
  await fn();
  steps.push(title);
  console.log('✓', title);
};

const { browser, page: p, errors } = await open(`${BASE}/`);
page = p;

await step('标题画面：原版标题图、繁体菜单，没存档时「讀取存檔」是灰的', async () => {
  await page.waitForSelector('[data-go="start"]');
  assert.match(await page.textContent('#screen h1'), /三國志英傑傳/);
  assert.match(await page.textContent('#screen'), /PC DOS 繁體中文版/);
  assert.equal(await page.evaluate(() => localStorage.getItem('yjz.save.v3')), null);
  assert.equal(await page.isDisabled('[data-go="load"]'), true, '没有存档时读档应不可点');
  await page.waitForFunction(() => !!window.__yjz, null, { timeout: 30000 });
  assert.equal(await page.evaluate(() => window.__yjz.bgm), 'title', '标题应播原版标题曲');
  await shot('01-title');
});

await step('開新遊戲：原版行军图 + 章节横幅 → 原版插画与对白 → 汜水關出兵準備', async () => {
  await page.click('[data-go="start"]');
  await page.waitForSelector('#screen .chapter');
  assert.match(await page.textContent('#screen .chapter'), /序章/);
  assert.match(await page.textContent('#screen .chapter'), /群雄起兵討伐董卓/, '横幅上要有副题');
  // 背景是原版行军图：序章用第一张，图能真的加载出来
  const bg = await page.evaluate(() => getComputedStyle(document.getElementById('screen')).backgroundImage);
  assert.match(bg, /\/assets\/maps\/campaign\/000\.png/, `序章用第一张行军图，实际 ${bg}`);
  assert.equal(await page.evaluate(() => fetch('/assets/maps/campaign/000.png').then((r) => r.status)), 200);
  await page.waitForTimeout(700); // 等横幅淡入完再拍
  await shot('15-chapter');
  await page.keyboard.press('Enter'); // 键盘也能翻页
  await page.waitForSelector('#talk:not([hidden])');
  // 前几句是旁白，往前点几句就会出现原版的事件插画
  let pic = null;
  for (let i = 0; i < 12 && !pic; i++) {
    pic = await page.$('#screen .pic');
    if (!pic) { await page.click('#talk'); await page.waitForTimeout(40); }
  }
  assert.ok(pic, '剧情背景应是原版事件插画');
  assert.match(await pic.getAttribute('src'), /^\/assets\/pictures\//);
  await shot('16-story');
  const s = await advance();
  assert.equal(s.camp, true, '序章演完应到出兵准备');
  const st = await storyNow();
  assert.deepEqual(st.party, ['liu_bei', 'guan_yu', 'zhang_fei'], '开局队伍是刘关张');
  assert.equal(st.flags.orig_f0, 1, '序章的标志应写进流程');
});

await step('营地：500 金（曹操在序章拨的那笔）、三人编成（关张必带）、买豆装给刘备、存档只存流程', async () => {
  const card = await page.textContent('#screen .card');
  assert.match(card, /汜水關 — 出兵準備/);
  assert.match(card, /軍資 500 金/);
  assert.match(card, /出征 3\/3 名/);
  assert.match(card, /關羽[\s\S]*必須/);
  // 情報栏：等级、经验、满编兵力与已学会的策略条数
  assert.match(card, /經驗\d+\/100/);
  assert.match(card, /兵力\d+/);
  assert.match(card, /策略\d+ 條/);
  await page.click('[data-pick="liu_bei"]');
  // 商店价格照原版道具表：豆 100、酒 120、伤药 300
  const shop = await page.textContent('#screen .card');
  assert.match(shop, /豆[\s\S]{0,12}兵力 \+600/);
  assert.match(shop, /傷藥[\s\S]{0,24}300 金/);
  await page.click('[data-buy="30"]');
  assert.equal((await storyNow()).gold, 400);
  assert.deepEqual((await storyNow()).bag, [30]);
  await page.click('[data-bag="30"]'); // 豆装进刘备的包袱
  const st = await storyNow();
  assert.deepEqual(st.roster.liu_bei.items, [30]);
  assert.deepEqual(st.bag, []);
  await page.click('[data-go="camp-save"]');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('yjz.save.v3')));
  assert.equal(saved.battle, undefined, '营地存档只存流程，不存战斗');
  assert.equal(saved.story.gold, 400);
  await shot('02-camp');
  // 修改器：左上角三下 → 密码 1122，在这里拍一张真实队伍（三人）的面板，不改数值
  await tapCorner();
  await page.waitForSelector('#gate:not([hidden])');
  await page.fill('#gate-pass', '1122');
  await page.keyboard.press('Enter');
  await page.waitForSelector('#trainer:not([hidden])');
  assert.match(await page.textContent('.trainer'), /武將（3）/);
  await shot('28-trainer');
  await page.click('[data-tr="close"]');
  await page.click('[data-go="camp-go"]');
});

await step('战前说明 → 部隊配置：自己摆位，開始后按所摆位置开战', async () => {
  await page.waitForSelector('[data-go="deploy"]');
  const brief = await page.textContent('#screen .card');
  assert.match(brief, /汜水關之戰/);
  assert.match(brief, /勝利：一、殲滅華雄/);
  assert.match(brief, /失敗：主將撤退/);
  assert.match(brief, /出征：關羽、張飛、劉備/);
  await shot('17-brief');
  await page.click('[data-go="deploy"]');
  await page.waitForSelector('[data-go="battle"]');
  assert.match(await page.textContent('#screen .card'), /汜水關之戰・部隊配置/);
  assert.equal(await page.isDisabled('[data-go="battle"]'), true, '还没摆人时不能开战');
  const cells = await page.$$eval('.deploy .cell', (els) => els.map((e) => e.dataset.cell));
  assert.equal(cells.length, 3, '本关有 3 个出兵位');
  const at = (c) => `.deploy .cell[data-cell="${c}"]`;
  // 点格子放人，再点一次收回
  await page.click(at(cells[1]));
  assert.equal(await page.$$eval('.deploy .cell.on', (els) => els.length), 1, '摆下一个部队');
  assert.equal(await page.$eval('.deploy .cell.on', (el) => el.dataset.cell), cells[1]);
  await page.click(at(cells[1])); // 再点一次收回
  assert.equal(await page.$$eval('.deploy .cell.on', (els) => els.length), 0);
  assert.equal(await page.isDisabled('[data-go="battle"]'), true);
  // 依次摆到第二、第一、第三个格：出征顺序是关羽、张飞、刘备
  for (const c of [cells[1], cells[0], cells[2]]) await page.click(at(c));
  assert.match(await page.textContent('#screen .card'), /全軍配置完畢/);
  assert.equal(await page.isDisabled('[data-go="battle"]'), false);
  await shot('23-deploy');
  await page.click('[data-go="battle"]');
  await settle(); // 开场的战场插剧要点几下
  await page.waitForFunction(() => window.__yjz?.mode === 'idle');
  const b = await state();
  assert.equal(b.level, 'c0_s0_b5');
  assert.equal(b.round, 1);
  assert.equal(b.stage, 'player');
  assert.equal(b.units.length, 12);
  assert.match(b.objective, /華雄/);
  assert.match(await page.textContent('#turn'), /第1回合/);
  const g = b.units.find((u) => u.name === '關羽');
  assert.deepEqual([g.x, g.y], cells[1].split(',').map(Number), '关羽应站在布阵时指定的格子');
  // 开战换成原版的战斗曲（此前一直没播过 battle.mp3）
  await page.waitForTimeout(400); // 换曲有 160ms 淡出
  assert.equal(await page.evaluate(() => window.__yjz.bgm), 'battle');
  assert.match(await page.evaluate(() => window.__yjz.bgmSrc), /battle\.mp3/);
  await shot('03-battle-start');
});

await step('道具指令：豆可以「给予 / 丢弃」，菜单里只有这三项', async () => {
  const bei = await unit('劉備');
  assert.ok((await unit('劉備')).items.includes(30), '营地买的豆应在刘备身上');
  await clickCell(bei.x, bei.y);
  assert.equal(await mode(), 'unit');
  await clickCell(bei.x, bei.y); // 点自己脚下 = 原地下令
  await settle();
  assert.equal(await mode(), 'menu');
  await menu('道具');
  await page.waitForTimeout(60);
  assert.match(await page.textContent('#menu'), /豆/);
  await page.click('#menu button:has-text("豆")');
  await page.waitForTimeout(60);
  assert.deepEqual(await page.$$eval('#menu button', (bs) => bs.map((b) => b.textContent)), ['使用', '给予', '丢弃']);
  await shot('26-item-menu');
  await page.click('#menu button:has-text("丢弃")');
  await settle();
  assert.equal((await unit('劉備')).items.includes(30), false, '丢弃后豆应离身');
  // 丢掉也算行动过
  assert.equal((await unit('劉備')).acted, true);
});

await step('选中关羽显示移动范围；右键取消；逐帧行走、弹出指令菜单，Esc 退回原位', async () => {
  const g = await unit('關羽');
  await clickCell(g.x, g.y);
  assert.equal(await mode(), 'unit');
  await shot('04-select-move-range');
  await clickCell(g.x + 1, g.y + 3, 'right');
  assert.equal(await mode(), 'idle');

  const plan = await decide('關羽', 'duel');
  // 临时开启动画并每 12ms 采一次棋子帧号：原版走一格是站立 / 迈步两帧交替
  const guan = await unit('關羽');
  await page.evaluate((slot) => {
    const sc = window.__yjz.scene;
    window.__prevSpeed = sc.speed;
    sc.speed = 3; // 放慢一点，既方便采样也方便抓到行走中的那一帧
    window.__walkSeen = [];
    window.__walkShot = null;
    window.__shotBusy = false;
    window.__shotTries = 0;
    window.__walkTimer = setInterval(() => {
      const img = sc.tokens.get(slot);
      const f = Number(img.frame.name);
      window.__walkSeen.push(f);
      if (window.__walkShot || window.__shotBusy || window.__shotTries > 40 || f < 39 || f >= 78) return;
      window.__shotBusy = true;
      window.__shotTries++;
      sc.game.renderer.snapshot((im) => {
        window.__shotBusy = false;
        if (Number(sc.tokens.get(slot).frame.name) >= 39) window.__walkShot = im.src;
      });
    }, 12);
  }, guan.slot);
  await clickCell(g.x, g.y);
  await clickCell(...plan.to);
  await settle();
  const walk = await page.evaluate(() => {
    const sc = window.__yjz.scene;
    clearInterval(window.__walkTimer);
    sc.speed = window.__prevSpeed;
    return { frames: window.__walkSeen, total: sc.textures.get(`tokens:${window.__yjz.b.level}`).frameTotal, png: window.__walkShot };
  });
  assert.ok(walk.png, '应抓到棋子迈步中的一帧');
  writeFileSync(`${SHOTS}25-walking.png`, Buffer.from(walk.png.split(',')[1], 'base64'));
  assert.equal(walk.total, 157, '棋子图集：39 列 × 4 行 + 整图帧');
  const standing = guan.cls * 2;
  assert.ok(walk.frames.includes(standing), `出现站立帧 ${standing}`);
  assert.ok(walk.frames.includes(standing + 39), `出现行走帧 ${standing + 39}`);
  assert.ok(walk.frames.filter((f) => f === standing + 39).length >= 2, '行走帧反复出现（两帧交替）');
  assert.equal(await mode(), 'menu');
  assert.deepEqual([(await unit('關羽')).x, (await unit('關羽')).y], plan.to);
  await shot('05-command-menu');
  await page.keyboard.press('Escape');
  const back = await unit('關羽');
  assert.deepEqual([back.x, back.y, back.moved], [g.x, g.y, false]);
  await page.keyboard.press('Escape');
  assert.equal(await mode(), 'idle');
});

await step('查看敌军状态（不能下令）', async () => {
  const h = await unit('華雄');
  await clickCell(h.x, h.y);
  assert.equal(await mode(), 'idle');
  assert.match(await page.textContent('#unit'), /華雄/);
  assert.match(await page.textContent('#unit'), /轻骑兵/);
  await shot('06-inspect-enemy');
  await clickCell(27, 0); // 点空地收回
});

await step('战斗特写：待机 60 帧呼吸、出手 60 帧、受击 30 帧，全按原版帧表播', async () => {
  // 静态：18 个兵种的图集都是 150 帧，三个动作的帧表与帧率都对得上
  const atlas = await page.evaluate(() => [...window.__yjz.scene.ready.entries()].map(([ac, key]) => {
    const tex = window.__yjz.scene.textures.get(key);
    const anim = (n) => window.__yjz.scene.anims.get(`${key}:${n}`);
    const span = (an) => {
      const n = an.frames.map((f) => f.textureFrame ?? f.frame ?? f.index);
      return [n[0], n[n.length - 1], n.length];
    };
    return { sheet: ac.sheet, sheetFrames: tex.frameTotal - 1, idle: anim('idle'), attack: anim('attack'), hurt: anim('hurt'), span: { idle: span(anim('idle')), attack: span(anim('attack')), hurt: span(anim('hurt')) } };
  }));
  assert.equal(atlas.length, 3, '汜水关用到短兵、弓兵、轻骑兵三个兵种');
  for (const a of atlas) {
    assert.ok(a.sheetFrames >= 150, `${a.sheet} 图集应有 150 帧，实际 ${a.sheetFrames}`);
    assert.deepEqual([a.idle.frames.length, a.idle.frameRate], [60, 30], `${a.sheet} 待机 60 帧 30fps`);
    assert.deepEqual([a.attack.frames.length, a.attack.frameRate], [60, 60], `${a.sheet} 出手 60 帧 60fps`);
    assert.deepEqual([a.hurt.frames.length, a.hurt.frameRate], [30, 30], `${a.sheet} 受击 30 帧 30fps`);
    // 三段帧号首尾相接：0–59 待机、60–119 出手、120–149 受击
    assert.deepEqual(a.span.idle, [0, 59, 60], `${a.sheet} 待机帧号`);
    assert.deepEqual(a.span.attack, [60, 119, 60], `${a.sheet} 出手帧号`);
    assert.deepEqual(a.span.hurt, [120, 149, 30], `${a.sheet} 受击帧号`);
  }
  // 动态：每 16 毫秒记一次特写横幅里左右两个演员正在显示的帧号
  await page.evaluate(() => {
    window.__seen = [];
    window.__rec = setInterval(() => {
      const box = window.__yjz.scene.children.list.find((o) => o.type === 'Container' && o.depth === 20);
      if (!box) return;
      const sp = box.list.filter((o) => o.type === 'Sprite');
      if (sp.length === 2) window.__seen.push(sp.map((s) => Number(s.frame.name)));
    }, 16);
  });
  // 友军在第一回合就会打到前排步兵，特写自然播出：横幅出现时截一张，再让它演完
  await sys('回合结束');
  if (await page.$('#talk .ask')) await page.click('#talk .ask button:first-child');
  await page.waitForFunction(() => window.__seen.length > 0, null, { timeout: 30000 });
  await page.waitForTimeout(620); // 停在待机呼吸/出手的中段
  // 整页截图要几秒，特写早就演完了；直接让 Phaser 把当前这一帧渲成图
  const png = await page.evaluate(() => new Promise((done) => {
    window.__yjz.scene.game.renderer.snapshot((img) => done(img.src));
  }));
  writeFileSync(`${SHOTS}18-cutin.png`, Buffer.from(png.split(',')[1], 'base64'));
  await settle();
  const seenFrames = await page.evaluate(() => (clearInterval(window.__rec), window.__seen));
  assert.ok(seenFrames.length > 60, `特写应持续一会儿，只采到 ${seenFrames.length} 帧`);
  const att = seenFrames.map((f) => f[0]);
  const def = seenFrames.map((f) => f[1]);
  const during = (list, lo, hi) => [...new Set(list.filter((f) => f >= lo && f <= hi))];
  assert.ok(during(att, 0, 59).length >= 8, `攻方待机应播够呼吸帧，实际 ${during(att, 0, 59).length} 帧`);
  assert.ok(during(att, 60, 119).length >= 25, `攻方出手应播到 60~119 帧，实际 ${during(att, 60, 119).length} 帧`);
  assert.ok(during(def, 120, 149).length >= 8, `守方应播受击帧，实际 ${during(def, 120, 149).length} 帧`);
  const firstAttack = att.findIndex((f) => f >= 60);
  const firstHurt = def.findIndex((f) => f >= 120);
  assert.ok(firstAttack > 3, '先待机呼吸，再出手');
  assert.ok(firstHurt > firstAttack, '守方的受击不应早于攻方出手');
  assert.equal((await state()).round, 2);
});

await step('战场存档 → 打两回合 → 读档，状态与存档时完全一致', async () => {
  await sys('存档');
  const saved = await state();
  await command('關羽', 'duel');
  await command('張飛', 'hunt');
  await endTurn();
  assert.ok((await page.evaluate(() => window.__yjz.bgmLog())).includes('enemy'), '敌军阶段应切到「敌将」曲');
  assert.notDeepEqual(await state(), saved);
  await sys('读档');
  await settle();
  assert.deepEqual(await state(), saved, '读档应恢复完整战斗状态（含随机数、回合、行动标记、事件）');
});

/** 一边点对白一边等单挑画面出现；返回是否演过单挑。 */
async function waitDuel(sayings = []) {
  for (let i = 0; i < 120; i++) {
    const s = await page.evaluate(() => ({
      duel: window.__duelSeen > 0,
      talk: !document.getElementById('talk').hidden,
      text: document.querySelector('#talk p')?.textContent ?? '',
      ask: !!document.querySelector('#talk:not([hidden]) .ask'),
      card: !!document.querySelector('#screen:not([hidden]) .card'),
      mode: window.__yjz.mode,
    }));
    if (s.duel) {
      await shot('19-duel');
      // 单挑演完还有几句战后的对白，一并点掉
      await page.waitForFunction(() => document.getElementById('duelplay').hidden, null, { timeout: 180000 });
      await settle();
      return true;
    }
    if (s.card) return false;
    if (s.talk) {
      if (s.text) sayings.push(s.text);
      await page.click(s.ask ? '#talk .ask button:first-child' : '#talk');
    } else if (s.mode !== 'busy') return false;
    await page.waitForTimeout(30);
  }
  return false;
}

/** 关张一起朝华雄走，走到相邻就会插播原版的单挑。返回是否演过单挑。 */
async function closeOnBoss(maxTurns = 14) {
  // 单挑演出很短，用页面里的定时器盯着，别错过
  await page.evaluate(() => {
    window.__duelSeen = 0;
    window.__duelWatch = setInterval(() => {
      if (!document.getElementById('duelplay').hidden) window.__duelSeen++;
    }, 25);
  });
  const sayings = [];
  for (let turn = 0; turn < maxTurns; turn++) {
    if ((await state()).stage !== 'player') return { played: false, sayings };
    for (const name of ['關羽', '張飛']) {
      if ((await state()).stage !== 'player') return { played: false, sayings };
      const u = await unit(name);
      if (!u.on || u.acted) continue;
      const plan = await decide(name, 'duel');
      await clickCell(u.x, u.y);
      await clickCell(...plan.to);
      await settle();
      if ((await mode()) === 'menu') {
        await menu('待命');
        // 单挑前面还有几句对白，点着点着就进单挑了
        if (await waitDuel(sayings)) {
          await page.evaluate(() => clearInterval(window.__duelWatch));
          return { played: true, sayings };
        }
        await settle();
      }
    }
    if ((await state()).stage !== 'player') return { played: false, sayings };
    await endTurn();
  }
  return { played: false, sayings };
}

await step('關羽贴近華雄：单挑演出 → 華雄撤退 → 勝利', async () => {
  const { played, sayings } = await closeOnBoss();
  await page.waitForSelector('#screen:not([hidden]) .card', { timeout: 120000 });
  const b = await state();
  assert.equal(b.stage, 'won', `应当获胜，实际 ${b.stage}（${b.reason}）`);
  if (played) {
    assert.equal(b.reason, b.objective, '单挑取胜时，勝利原因写的是这一关的胜利条件');
    assert.ok(sayings.some((t) => t.includes('單挑')), '单挑前有原版的那几句对白');
  } else assert.fail(`没有演到单挑，沿途对白：${sayings.join(' / ')}`);
  assert.equal((await unit('華雄')).on, false, '华雄撤退');
  assert.equal((await unit('關羽')).level, 2, '单挑后关羽升一级');
  assert.ok((await page.evaluate(() => window.__yjz.bgmLog())).includes('boss'), '单挑应压上「强敌」曲');
  const card = await page.textContent('#screen .card');
  assert.match(card, /勝利/);
  assert.match(card, /華雄/);
  // 结算：军资拆成赏金与拾得，下面是我军各部队的经验与等级
  assert.match(card, /所得軍資/);
  assert.match(card, /賞金 \d+ ＋ 拾得 \d+/);
  assert.match(card, /武將[\s\S]*兵種[\s\S]*等級[\s\S]*經驗[\s\S]*兵力/);
  assert.match(card, /Lv\+1/, '单挑升的那一级标在关羽那行');
  assert.ok((await page.locator('#screen .card table.squad tr').count()) >= 3, '表头之外至少列出出征的两支部队');
  await shot('20-victory');
});

await step('續 → 战后剧情：成长、军资与战场标志带回流程，接着进下一关', async () => {
  await page.click('[data-go="next"]');
  await page.waitForTimeout(120);
  let st = await storyNow();
  assert.equal(st.flags['c0_s0_b5.won'], true, '战后应记下这一关打赢了');
  assert.equal(st.flags.orig_c0_s0_b5_ended, 1, '战场里的事件标志并回流程');
  assert.equal(st.roster.guan_yu.level, 2, '单挑升的级带回流程');
  const s = await advance();
  st = await storyNow();
  assert.ok(s.camp || s.brief, '战后剧情演完应该到下一场战斗的营地或战前说明');
  assert.ok(st.pc > 0);
  // 到下一个营地后存一次档，好在刷新页面后验证成长没丢
  if (s.camp) await page.click('[data-go="camp-save"]');
});

await step('刷新页面 → 讀取存檔：营地、军资、关羽 2 级都还在', async () => {
  const saved = await storyNow();
  await page.reload();
  await page.waitForSelector('[data-go="start"]');
  assert.equal(await page.isDisabled('[data-go="load"]'), false, '有存档时读档可点');
  await page.click('[data-go="load"]');
  const s = await advance();
  assert.ok(s.camp || s.brief, '读档后应接着停在营地或战前说明');
  const st = await storyNow();
  assert.deepEqual(st.roster.guan_yu, saved.roster.guan_yu, '读档后的成长与存档一致');
  assert.equal(st.gold, saved.gold);
  await shot('21-load-camp');
});

await step('系统性失败：全军撤退判负 → 重新開始回到这一关第 1 回合', async () => {
  await start(5);
  await sys('全军撤退');
  await settle(true);
  const lost = await state();
  assert.equal(lost.stage, 'lost');
  assert.equal(lost.reason, '全军撤退');
  assert.match(await page.textContent('#screen .card'), /敗北/);
  assert.match(await page.textContent('#screen .card'), /敗北不計賞金與拾得/, '败北结算不加军资');
  assert.equal(await page.evaluate(() => window.__yjz.bgm), 'defeat', '败北应切败北曲');
  await shot('22-defeat');
  await page.click('[data-go="next"]'); // 重新開始：这一关没有失败分支，退回战前说明
  await page.waitForSelector('[data-go="deploy"]', { timeout: 60000 });
  await startBattle();
  await page.waitForFunction(() => window.__yjz?.mode === 'idle', null, { timeout: 60000 });
  const again = await state();
  assert.deepEqual([again.round, again.stage], [1, 'player'], '重新开始应回到第 1 回合');
  assert.equal(again.units.every((u) => !u.acted), true);
});

await step('策略：等级够时列出可用的回复策略，群体大援助直接施放', async () => {
  // 把关羽临时改成 30 级妖术师，好用上后期才会学到的补助策略（只改这一场的内存数据）
  await page.evaluate(() => {
    const g = window.__yjz.b.units.find((u) => u.on && u.key === 'guan_yu');
    Object.assign(g, { cls: 15, level: 30, int: 90, mp: 90, hp: 100, acted: false, moved: false, confused: false });
  });
  const g = await unit('關羽');
  await clickCell(g.x, g.y);
  await clickCell(g.x, g.y);
  assert.equal(await mode(), 'menu');
  await menu('策略');
  const list = await page.textContent('#menu');
  assert.match(list, /大援助/);
  assert.match(list, /大補給/);
  assert.doesNotMatch(list, /焦熱/, '射程内没有敌人时，攻击策略不该占菜单');
  await shot('24-strategy-menu');
  const before = await unit('關羽');
  await menu('大援助');
  await settle();
  const after = await unit('關羽');
  assert.ok(after.hp > before.hp, '群体补给给自己回了兵');
  assert.equal(after.mp, before.mp - 24, '大援助扣 24 点策略值');
  assert.equal(after.acted, true);
  assert.match(await page.textContent('#log'), /大援助/);
});

await step('音效：21 个资源可加载、按钮与战斗事件有声、静音开关生效', async () => {
  const keys = ['cursor', 'confirm', 'cancel', 'error', 'step', 'hit', 'hit_heavy', 'arrow', 'fire', 'water', 'rock',
    'heal', 'morale_up', 'morale_down', 'confuse', 'levelup', 'retreat', 'treasure', 'phase', 'victory', 'defeat'];
  const codes = await page.evaluate(async (ks) => Promise.all(ks.map(async (k) => (await fetch(`/assets/sfx/${k}.wav`)).status)), keys);
  assert.deepEqual([...new Set(codes)], [200], '21 个音效都能加载');
  const played = await page.evaluate(() => window.__yjz.sfx());
  assert.ok(played.includes('confirm'), '按钮有确认音');
  assert.ok(played.includes('phase'), '回合开始有提示音');
  assert.equal(await page.textContent('#sys [data-sfx]'), '音效 開');
  await page.click('#sys [data-sfx]');
  assert.equal(await page.evaluate(() => window.__yjz.sfxEnabled()), false);
  assert.equal(await page.evaluate(() => localStorage.getItem('yjz.sfx.v1')), '0');
  assert.equal(await page.textContent('#sys [data-sfx]'), '音效 關');
  const before = await page.evaluate(() => window.__yjz.sfx().length);
  await sys('胜利条件'); // 静音后点按钮不该再出声
  const after = await page.evaluate(() => window.__yjz.sfx().length);
  assert.equal(after, before);
  await page.click('#sys [data-sfx]');
  assert.equal(await page.evaluate(() => window.__yjz.sfxEnabled()), true);
  assert.equal(await page.textContent('#sys [data-sfx]'), '音效 開');
});

await step('后期关卡实机：大地图、民众护送、军乐队都能开打并推进回合', async () => {
  // 用正常读档路径跳到指定战斗：把流程进度指向那一步，不直接改战斗状态
  const G = JSON.parse(readFileSync(new URL('../src/data/game.json', import.meta.url), 'utf8'));
  const party = Object.keys(G.officers);
  const roster = Object.fromEntries(Object.entries(G.officers).map(([id, o]) => [id, { level: o.level, exp: 0, items: [] }]));
  for (const lid of ['c1_s0_b6', 'c2_s3_b7', 'c4_s2_b4', 'c1_s0_b13']) {
    const pc = G.steps.findIndex((st) => st.t === 'battle' && st.level === lid);
    assert.ok(pc > 0, `${lid} 应在流程里`);
    const story = { script: 'yingjiezhuan', pc, bg: '', picture: '', bgm: '', cast: [], flags: {}, roster, party, bag: [], deploy: [], gold: 10000 };
    await page.evaluate((st) => localStorage.setItem('yjz.save.v3', JSON.stringify({ story: st })), story);
    await page.reload();
    await page.waitForSelector('[data-go="start"]');
    await page.click('[data-go="load"]');
    await settle();
    await page.waitForSelector('[data-go="deploy"]');
    await page.click('[data-go="deploy"]');
    await page.waitForSelector('[data-go="battle"]');
    await page.click('[data-go="auto"]');
    await page.click('[data-go="battle"]');
    await settle();
    const cur = await state();
    assert.equal(cur.level, lid, `读档应进入 ${lid}`);
    assert.ok(cur.units.filter((u) => u.on).length >= 15, `${lid} 部队数`);
    assert.equal(await page.evaluate(() => window.__yjz.scene.textures.exists(`map:${window.__yjz.b.level}`)), true, `${lid} 地图已加载`);
    for (let i = 0; i < 2; i++) {
      await sys('回合结束');
      await settle();
    }
    const end = await state();
    assert.ok(end.round >= 3 || end.stage === 'won' || end.stage === 'lost', `${lid} 应能推进到第 3 回合`);
    if (lid === 'c1_s0_b13') {
      // 这一关第 3 回合开场有敌军增援，画面上要弹「敵軍增援」横幅
      assert.ok((await page.evaluate(() => window.__yjz.banners())).includes('敵軍增援'), '第 3 回合应有增援横幅');
    }
  }
});

await step('修改器：左上角连点三下 → 密码 1122 → 军资 / 兵种 / 一键装备 / 道具', async () => {
  await tapCorner();
  await page.waitForSelector('#gate:not([hidden])');
  assert.equal(await page.evaluate(() => window.__yjz.gateOpen), true);
  // 错密码留在密码框，不会打开面板
  await page.fill('#gate-pass', '9999');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(120);
  assert.equal(await page.textContent('#gate .err'), '密碼不對。');
  assert.equal(await page.evaluate(() => window.__yjz.trainerOpen), false);
  await page.fill('#gate-pass', '1122');
  await page.keyboard.press('Enter');
  await page.waitForSelector('#trainer:not([hidden])');
  assert.equal(await page.evaluate(() => window.__yjz.trainerOpen), true);

  // 军资：快捷加钱与直接输入
  const gold0 = (await storyNow()).gold;
  await page.click('[data-gold="10000"]');
  assert.equal((await storyNow()).gold, gold0 + 10000);
  await page.fill('#tr-gold', '12345');
  await page.press('#tr-gold', 'Tab');
  assert.equal((await storyNow()).gold, 12345);

  // 战场上的可控部队：改等级与兵种，部队当场跟着变（兵力补满）
  const who = await page.evaluate(() => window.__yjz.b.units.find((u) => u.mode === 7 && u.key)?.key);
  assert.ok(who, '战场上应有一支可控部队');
  const cls0 = await page.evaluate((id) => {
    const u = window.__yjz.b.units.find((x) => x.key === id);
    return window.__yjz.story.roster[id]?.cls ?? u.cls;
  }, who);
  const cls1 = (cls0 + 1) % 19;
  await page.selectOption(`[data-cls="${who}"]`, String(cls1));
  const lv0 = await page.evaluate((id) => window.__yjz.story.roster[id]?.level ?? 1, who);
  await page.fill(`[data-lv="${who}"]`, String(lv0 + 7));
  await page.press(`[data-lv="${who}"]`, 'Tab');
  const unitNow = await page.evaluate((id) => {
    const u = window.__yjz.b.units.find((x) => x.key === id);
    return { cls: u.cls, level: u.level, hp: u.hp };
  }, who);
  assert.equal(unitNow.cls, cls1, '兵种应同步到战场');
  assert.equal(unitNow.level, lv0 + 7, '等级应同步到战场');
  assert.ok(unitNow.hp > 0, '改完等级应补满兵力');

  // 道具：全部各一件 → 一键装备取最好的三件（霸者劍 / 孫子兵法 / 赤兎馬）
  await page.click('[data-tr="give-all"]');
  assert.ok((await storyNow()).bag.length >= 60, '包袱里应有全部道具');
  await page.click(`[data-equip="${who}"]`);
  const items = (await storyNow()).roster[who].items;
  for (const id of [59, 3, 7]) assert.ok(items.includes(id), `一键装备应有 ${id}`);
  assert.match(await page.textContent('.trainer .tr-bag'), /英雄之劍/, '包袱里应还剩没穿上的装备');

  await page.click('[data-tr="close"]');
  assert.equal(await page.evaluate(() => window.__yjz.trainerOpen), false);
});

assert.deepEqual(errors, [], '浏览器控制台不应有报错');
console.log(`\n全部 ${steps.length} 项通过，截图在 docs/screenshots/`);
await browser.close();
