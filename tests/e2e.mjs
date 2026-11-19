// 浏览器实操验证：全程用真实的鼠标点击和键盘操作，不直接改游戏状态。
// 先启动开发服务器（npm run dev -- --port 5273），再运行：node tests/e2e.mjs
// 截图写入 docs/screenshots/。读状态用的 window.__yjz 只在开发模式存在。
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { open } from '../tools/browser.mjs';
import { verifyBeihaiRoom, verifyRooms, verifyXuzhouRooms, verifyXuzhouSecondScene, verifyXuzhouReturnRooms, verifyXiaopeiReturnRooms, verifyBranchStageSave, verifyImportedStories, verifyLubuEnvoyRooms, verifyXuchangRoom, verifyGenericGroupRoom, verifyDepartureRoom, verifyChoiceRoom, verifyXuShuRooms, verifyActionRoomPause, verifyMergedTailRoom, verifyLongChoiceRoom } from './story-rooms.mjs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5273';
// 截图默认写进 docs/screenshots/；SHOTS 指向别处时只出图不碰仓库里的参考图。
const SHOTS = (process.env.SHOTS ?? new URL('../docs/screenshots/', import.meta.url).pathname).replace(/\/?$/, '/');
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
  room: !!document.querySelector('.room-controls'),
  brief: !!document.querySelector('[data-go="deploy"]'),
  deploy: !!document.querySelector('[data-go="battle"]'),
  card: document.querySelector('#screen:not([hidden]) .card')?.textContent ?? '',
}));

/** 一路点下去：章节横幅、对白、询问都点掉，直到营地或战前说明或战场待命。 */
async function advance(limit = 5000) {
  for (let i = 0; i < limit; i++) {
    const s = await seen();
    if (s.chapter) { await page.click('#screen'); continue; } // 章节横幅点一下继续
    if (s.ask) { await page.click('#talk .ask button:first-child'); continue; }
    if (s.talk) { await page.click('#talk'); continue; }
    if (s.room) {
      await page.click(await page.$('[data-room="continue"]') ? '[data-room="continue"]' : '.actor[data-who="1"]');
      continue;
    }
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

/** 一格在屏幕上的中心坐标；顺便把镜头移过去（只是视角，不改战斗状态）。 */
async function cellPoint(x, y) {
  return page.evaluate(([cx, cy]) => {
    const { scene } = window.__yjz;
    scene.focus(cx, cy, true);
    const cam = scene.cameras.main;
    const r = document.querySelector('#map canvas').getBoundingClientRect();
    const cell = cam.width / 13; // 视野宽 13 格
    const s = r.width / cam.width;
    return { x: r.left + ((cx + 0.5) * cell - cam.scrollX) * s, y: r.top + ((cy + 0.5) * cell - cam.scrollY) * s };
  }, [x, y]);
}
/** 点地图上的一格（先把镜头移过去，这只是视角，不改战斗状态）。 */
async function clickCell(x, y, button = 'left') {
  const p = await cellPoint(x, y);
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
// 主流程的文案断言沿用原版 DOS 繁体；默认简体与简繁切换放到最后一项单独验证。
await page.waitForSelector('#stage');
await page.evaluate(() => localStorage.setItem('yjz.script', 'hant'));
await page.reload();

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
  await page.evaluate(() => {
    window.__storyTrace = [];
    window.__traceStory = true;
    const sample = () => {
      if (!window.__traceStory) return;
      const moving = document.querySelector('.actor.walking');
      const backdrop = document.querySelector('.scene.field .backdrop');
      if ((moving || backdrop) && window.__storyTrace.length < 10000) window.__storyTrace.push({
        section: window.__yjz.story.section, pc: window.__yjz.story.pc,
        who: moving?.dataset.who, x: moving?.style.left, y: moving?.style.top,
        field: backdrop?.getAttribute('src'), camera: document.querySelector('.story-world')?.style.transform,
      });
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
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
  /** 往前演一步：有对白就点对话框（有选项就选第一项），没有就按回车（章节横幅、地名条都认回车）。 */
  const next = async () => {
    if (await page.evaluate(() => !!document.querySelector('#talk:not([hidden]) .ask'))) await page.click('#talk .ask button:first-child');
    else if (await page.evaluate(() => !document.getElementById('talk').hidden)) await page.click('#talk');
    else await page.keyboard.press('Enter');
    await page.waitForTimeout(40);
  };
  // 前几句是旁白，往前点几句就会出现原版的事件插画；再往后是原版剧情的舞台：地图 + 场上的人
  let pic = null;
  let stage = null;
  for (let i = 0; i < 40 && !(pic && stage); i++) {
    const now = await page.evaluate(() => {
      const sc = document.querySelector('#screen .scene');
      return {
        pic: document.querySelector('#screen .pic')?.getAttribute('src') ?? '',
        talk: !document.getElementById('talk').hidden,
        speaker: document.querySelector('#talk h3')?.textContent ?? '',
        scene: sc && {
          src: sc.querySelector('.backdrop')?.getAttribute('src') ?? '',
          place: sc.querySelector('.place')?.textContent ?? '',
          actors: [...sc.querySelectorAll('.actor')].map((a) => a.title),
          art: [...sc.querySelectorAll('.actor i')].map((a) => getComputedStyle(a).backgroundImage),
          pose: [...sc.querySelectorAll('.actor i')].map((a) => {
            const cs = getComputedStyle(a);
            return { p0: cs.getPropertyValue('--p0').trim(), p1: cs.getPropertyValue('--p1').trim(),
              delay: cs.getPropertyValue('--delay').trim(), flip: a.classList.contains('flip') };
          }),
          lit: [...sc.querySelectorAll('.actor.on')].map((a) => a.title),
        },
      };
    });
    if (now.pic) pic = now.pic;
    // 只在有对白等点击时抓：这一刻点人才安全，不会把剧情演飞
    if (now.scene?.actors.length && now.talk) stage = { ...now.scene, speaker: now.speaker };
    if (!(pic && stage)) await next();
  }
  assert.ok(pic, '剧情背景应是原版事件插画');
  assert.match(pic, /^\/assets\/pictures\//);
  await shot('16-story');
  // 剧情画面不是一个空屏：铺原版地图（宫殿图 / 野外地平），场上站着人，左上角有地名条
  assert.ok(stage, '剧情应铺出原版地图并摆上人物');
  assert.match(stage.src, /^\/assets\/story\/(pmap-\d{3}|field-\d{2})\.png$/, `地图来源 ${stage.src}`);
  assert.equal(await page.evaluate((u) => fetch(u).then((r) => r.status), stage.src), 200, '地图文件真能加载');
  assert.equal(stage.place, '陳留宮殿', `这一幕的地名条，实际「${stage.place}」`);
  assert.ok(stage.actors.length >= 8, `陳留宮殿应站着原版的 10 个人，实际 ${stage.actors.length}`);
  for (const n of stage.actors) assert.ok(n, '每个人都要报得出名字（不是无名占位）');
  if (stage.speaker) assert.ok(stage.lit.includes(stage.speaker), `说话的人要亮着，实际 ${stage.lit}`);
  for (const art of stage.art) assert.match(art, /\/assets\/story\/people\.png/, '剧情人物必须用 SSCCHR2，不能回退到战斗棋子');
  // 四帧都要用得上：每个人有站立/迈步两个位置，朝左右的人镜像，相位按人物号错开
  assert.equal(stage.pose.length, stage.actors.length);
  assert.ok(stage.pose.some((p) => p.flip), '朝左 / 朝右的人应按原版做水平镜像');
  assert.ok(stage.pose.some((p) => !p.flip), '朝上 / 朝下的人保持原帧');
  assert.ok(new Set(stage.pose.map((p) => p.delay)).size > 1, '同一外观的几个人要错开呼吸相位');
  for (const p of stage.pose) {
    assert.match(p.p0, /^-?\d+px -?\d+px$/, `站立帧位置 ${p.p0}`);
    assert.match(p.p1, /^-?\d+px -?\d+px$/, `迈步帧位置 ${p.p1}`);
    assert.notEqual(p.p0, p.p1, '站立帧与迈步帧不能是同一张图');
  }
  // 光有 CSS 变量不算数：隔一会儿真的要有人从站立帧切到迈步帧
  const poseMotion = await page.evaluate(async () => {
    const read = () => [...document.querySelectorAll('#screen .scene .actor i')].map((a) => getComputedStyle(a).backgroundPosition);
    const a = read();
    await new Promise((r) => setTimeout(r, 620));
    const b = read();
    return { n: a.length, changed: a.filter((v, i) => v !== b[i]).length };
  });
  assert.ok(poseMotion.n >= 8 && poseMotion.changed > 0, `剧情人物应交替两帧，实际 ${JSON.stringify(poseMotion)}`);
  await shot('29-story-stage');
  // 一路演到「陳留營帳」的第一句对白：这一幕的原版记录里，每个人身上都挂着台词
  let tent = null;
  for (let i = 0; i < 2000 && !tent; i++) {
    tent = await page.evaluate(() => {
      if (window.__yjz.story.section !== 'c0_s0_story4') return null;
      if (document.getElementById('talk').hidden) return null; // 还在地名条上，等它过去
      const sc = document.querySelector('#screen .scene');
      if (!sc) return null;
      return {
        place: sc.querySelector('.place')?.textContent ?? '',
        actors: [...sc.querySelectorAll('.actor')].map((a) => a.title),
        speaker: document.querySelector('#talk h3')?.textContent ?? '',
        line: document.querySelector('#talk p')?.textContent ?? '',
      };
    });
    if (!tent) await next();
  }
  assert.ok(tent, '应演到陳留營帳的对白');
  assert.equal(tent.place, '陳留營帳', `这一幕的地名条，实际「${tent.place}」`);
  assert.ok(tent.actors.includes('袁紹'), `陳留營帳应站着袁紹，实际 ${tent.actors}`);
  // 自动对白结束后进入自由交谈，不在自动演出期间插播talk记录。
  for (let i = 0; i < 1000 && !(await page.$('.room-controls')); i++) await next();
  await page.waitForSelector('.room-controls');
  const trace = await page.evaluate(() => { window.__traceStory = false; return window.__storyTrace; });
  assert.ok(trace.some((f) => f.x && (!Number.isInteger(parseFloat(f.x)) || !Number.isInteger(parseFloat(f.y)))), '移动应有可见的中间帧');
  const fieldTrace = trace.filter((f) => f.field);
  assert.ok(fieldTrace.length > 0 && fieldTrace.every((f) => f.field === '/assets/maps/campaign/000.png'), '野外应铺完整原版行军图');
  assert.ok(new Set(fieldTrace.map((f) => f.camera)).size > 2, '野外镜头应随人物移动');
  assert.equal((await storyNow()).flags.orig_f0, undefined);
  assert.equal((await storyNow()).flags.orig_f1, undefined);
  // 点场上的人：执行原始talk记录，说完留在房间。
  // 棋子高过一格、彼此压着，先找一个真能点到他身上的点（原版也是这样点头脸）
  const spot = await page.evaluate(() => {
    const el = document.querySelector('#screen .scene .actor[title="袁紹"]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    for (let dy = 3; dy < r.height; dy += 3) {
      for (let dx = 2; dx < r.width; dx += 3) {
        const hit = document.elementFromPoint(r.left + dx, r.top + dy);
        if (hit === el || el.contains(hit)) return { x: r.left + dx, y: r.top + dy };
      }
    }
    return null;
  });
  assert.ok(spot, '袁紹应能点得到（没被别人整个挡住）');
  await page.mouse.click(spot.x, spot.y);
  await page.waitForTimeout(120);
  const heard = await page.evaluate(() => ({
    who: document.querySelector('#talk h3')?.textContent ?? '',
    line: document.querySelector('#talk p')?.textContent ?? '',
  }));
  assert.equal(heard.who, '袁紹', '点谁就报谁的名');
  assert.match(heard.line, /華雄乃勇猛之人/, `说的是原版剧本里袁紹这一句，实际「${heard.line}」`);
  await page.click('#talk');
  await page.waitForSelector('.room-controls');
  await page.click('.actor[data-who="1"]');
  await page.waitForSelector('#talk .ask');
  await page.click('#talk .ask button:last-child');
  await page.waitForSelector('.room-controls');
  assert.equal((await storyNow()).section, 'c0_s0_story4', '拒绝出征留在房间');
  for (const who of [12, 15]) {
    await page.click(`.actor[data-who="${who}"]`);
    await page.waitForSelector('#talk:not([hidden])');
    await page.click('#talk');
    await page.waitForSelector('.room-controls');
  }
  await page.click('.actor[data-who="374"]');
  await page.waitForSelector('[data-go="camp-go"]');
  const st = await storyNow();
  assert.deepEqual(st.party, ['liu_bei', 'guan_yu', 'zhang_fei'], '开局队伍是刘关张');
  assert.equal(st.flags.orig_f0, 1, '序章的标志应写进流程');
});

await step('营地：500 金（曹操在序章拨的那笔）、三人编成（关张必带）、买豆装给刘备、存档只存流程', async () => {
  const card = await page.textContent('#screen .card');
  assert.match(card, /汜水關之戰 — 出兵準備/);
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
  // 存档列表：六个槽位，空槽显示为空，营地存档只写流程
  await page.waitForSelector('#save-list:not([hidden]) .save-slot');
  assert.equal(await page.$$eval('#save-list .save-slot', (els) => els.length), 7, '存档应有六个槽位');
  assert.equal(await page.$$eval('#save-list .save-slot:not(.auto-slot) [data-act="read"]', (els) => els.length), 0, '存档模式只给写入按钮');
  await page.click('#save-list [data-slot="0"][data-act="write"]');
  assert.equal(await page.evaluate(() => document.getElementById('save-list').hidden), true, '存档后列表收起');
  const saved = await page.evaluate(() => ({
    mirror: JSON.parse(localStorage.getItem('yjz.save.v3')),
    list: JSON.parse(localStorage.getItem('yjz.saves.v1')),
  }));
  assert.equal(saved.mirror.battle, undefined, '营地存档只存流程，不存战斗');
  assert.equal(saved.mirror.story.gold, 400);
  assert.equal(saved.list.slots.length, 6);
  assert.equal(saved.list.last, 0, '最近存档指向檔一');
  assert.equal(saved.list.slots[0].story.gold, 400);
  assert.equal(saved.list.slots[1], null, '其余槽位仍是空的');
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
  await page.waitForSelector('.room-controls');
  await page.reload();
  await page.waitForSelector('[data-go="load"]');
  await page.click('[data-go="load"]');
  await page.waitForSelector('#save-list:not([hidden])');
  await page.click('#save-list [data-slot="0"][data-act="read"]');
  await page.waitForSelector('.room-controls');
  assert.equal((await storyNow()).gold, 400, '房间读档不重复发放军资');
  assert.equal((await storyNow()).flags.orig_f1, 1);
  assert.equal(await page.$$eval('.actor', (els) => els.length), 10, '读档重建原始舞台人物');
  await page.click('.actor[data-who="1"]');
  await advance();
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
  // 刘备在原版里是专属旗步兵（图集第 39 帧），不能退回普通短兵那一列
  const liuSlot = b.units.find((u) => u.name === '劉備').slot;
  const frames = await page.evaluate(([a, b2]) => ({
    liu: Number(window.__yjz.scene.tokens.get(a).frame.name),
    guan: Number(window.__yjz.scene.tokens.get(b2).frame.name),
  }), [liuSlot, g.slot]);
  // 待机会在站立 / 迈步两帧间切换，所以只看列号（47 帧一行）
  assert.equal(frames.liu % 47, 38, `刘备应取第 39 列旗步兵，实际帧 ${frames.liu}`);
  assert.equal(frames.guan % 47, g.cls * 2, '其他武将仍按兵种取帧');
  await step('战场拖动与小地图：短按保留点选，拖动无误触，点击/拖框可定位且不越界', async () => {
    const before = await page.evaluate(() => {
      const s = window.__yjz.scene;
      s.panTo(300, 120);
      return { scroll: [s.cameras.main.scrollX, s.cameras.main.scrollY], mode: window.__yjz.mode,
        mini: [document.querySelector('#minimap').width, document.querySelector('#minimap').height],
        viewport: [document.querySelector('#minimap-box').clientWidth, document.querySelector('#minimap-box').clientHeight] };
    });
    assert.ok(before.mini[0] > 0 && before.mini[1] > 0, '小地图已渲染战场图');
    const canvas = await page.$eval('#map canvas', (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width * 0.55, y: r.top + r.height * 0.55 }; });
    await page.mouse.move(canvas.x, canvas.y);
    await page.mouse.down();
    await page.mouse.move(canvas.x - 35, canvas.y - 22, { steps: 4 });
    await page.mouse.up();
    const dragged = await page.evaluate(() => ({ scroll: [window.__yjz.scene.cameras.main.scrollX, window.__yjz.scene.cameras.main.scrollY], mode: window.__yjz.mode }));
    assert.ok(dragged.scroll[0] > before.scroll[0] && dragged.scroll[1] > before.scroll[1], `拖动应反向平移镜头：${JSON.stringify(dragged)}`);
    assert.equal(dragged.mode, 'idle', '拖动松开不执行点选');
    await page.click('#minimap');
    const jumped = await page.evaluate(() => { const s = window.__yjz.scene; return [s.cameras.main.scrollX, s.cameras.main.scrollY]; });
    assert.ok(jumped[0] !== dragged.scroll[0] || jumped[1] !== dragged.scroll[1], '点击小地图强制定位');
    await clickCell(g.x, g.y);
    assert.equal(await mode(), 'unit', '未拖动的短按仍然选中单位');
    await page.evaluate(() => window.__yjz.scene.onCancel());
    const min = await page.evaluate(() => { const s = window.__yjz.scene; s.panTo(-10000, -10000); return [s.cameras.main.scrollX, s.cameras.main.scrollY]; });
    assert.deepEqual(min, [0, 0], '镜头不能卷出地图左上边界');
    const max = await page.evaluate(() => { const s = window.__yjz.scene; s.panTo(100000, 100000); return [s.cameras.main.scrollX, s.cameras.main.scrollY, s.b.w * 96 - 1248, s.b.h * 96 - 1152]; });
    assert.equal(max[0], Math.max(0, max[2]));
    assert.equal(max[1], Math.max(0, max[3]));
    await page.evaluate(() => window.__yjz.scene.panTo(300, 120));
    // 视野框拖动保持按下偏移，不会在金框内跳到指针中心。
    const rect = await page.$eval('#minimap', (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    await page.mouse.move(rect.x + rect.w * 0.35, rect.y + rect.h * 0.5);
    await page.mouse.down();
    await page.mouse.move(rect.x + rect.w * 0.45, rect.y + rect.h * 0.55, { steps: 3 });
    await page.mouse.up();
    const boxDrag = await page.evaluate(() => [window.__yjz.scene.cameras.main.scrollX, window.__yjz.scene.cameras.main.scrollY]);
    assert.ok(boxDrag[0] > 300 && boxDrag[1] > 120, `拖动视野框移动相机：${boxDrag}`);
  });
  // 开战换成原版的战斗曲（此前一直没播过 battle.mp3）
  await page.waitForTimeout(400); // 换曲有 160ms 淡出
  assert.equal(await page.evaluate(() => window.__yjz.bgm), 'battle');
  assert.match(await page.evaluate(() => window.__yjz.bgmSrc), /battle\.mp3/);
  // 镜头跟随可在战场设置中关闭；关闭后角色演出不接管镜头，但画布边缘仍可卷屏。
  assert.equal(await page.evaluate(() => window.__yjz.scene.isCameraFollowEnabled()), true);
  await sys('镜头跟随 开');
  assert.deepEqual(await page.evaluate(() => ({ enabled: window.__yjz.scene.isCameraFollowEnabled(), saved: localStorage.getItem('yjz.camera-follow') })), { enabled: false, saved: '0' });
  const edge = await page.$eval('#map canvas', (canvas) => {
    const r = canvas.getBoundingClientRect();
    return { x: r.right - 2, y: r.top + r.height / 2 };
  });
  const beforeEdgeScroll = await page.evaluate(() => window.__yjz.scene.cameras.main.scrollX);
  await page.mouse.move(edge.x, edge.y);
  await page.waitForTimeout(180);
  const edgeScroll = { before: beforeEdgeScroll, after: await page.evaluate(() => window.__yjz.scene.cameras.main.scrollX) };
  assert.ok(edgeScroll.after > edgeScroll.before, `关闭跟随后鼠标靠近右边界仍应卷屏，实际 ${JSON.stringify(edgeScroll)}`);
  await sys('镜头跟随 关');
  assert.deepEqual(await page.evaluate(() => ({ enabled: window.__yjz.scene.isCameraFollowEnabled(), saved: localStorage.getItem('yjz.camera-follow') })), { enabled: true, saved: '1' });
  // 角色移动速度：循环切换并记住选择，切回标准再继续后面的战斗流程
  const speedBtn = '#sys button[data-speed="1"]';
  const speedState = () => page.evaluate(() => ({
    label: document.querySelector('#sys button[data-speed="1"]').textContent.trim(),
    v: window.__yjz.scene.getAnimSpeed(), saved: localStorage.getItem('yjz.anim-speed'),
  }));
  const speed0 = await speedState();
  assert.equal(speed0.label, '移动速度 标准', '默认标准速度');
  assert.equal(speed0.v, 1);
  assert.ok(speed0.saved === null || speed0.saved === '1', '没改过时不该有别的速度档');
  await page.click(speedBtn);
  assert.deepEqual(await speedState(), { label: '移动速度 慢', v: 1.6, saved: '1.6' });
  await page.click(speedBtn);
  assert.deepEqual(await speedState(), { label: '移动速度 很慢', v: 2.5, saved: '2.5' });
  await page.click(speedBtn);
  assert.deepEqual(await speedState(), { label: '移动速度 瞬时', v: 0, saved: '0' });
  // 再点两下回到标准：瞬时 → 很快 → 标准
  for (let i = 0; i < 2; i++) await page.click(speedBtn);
  assert.deepEqual(await speedState(), { label: '移动速度 标准', v: 1, saved: '1' });
  await shot('03-battle-start');
});

await step('手机触屏：横屏布局、单指拖镜头、小地图定位、取消和系统菜单、竖屏旋转提示', async () => {
  const session = await page.context().newCDPSession(page);
  const desktop = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio }));
  // 截图器会采用 Playwright 记录的视口，须与底层设备仿真同步，避免截图后恢复桌面尺寸。
  await page.setViewportSize({ width: 844, height: 390 });
  await session.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 2, mobile: true });
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await page.evaluate(() => dispatchEvent(new Event('resize')));
  await page.waitForFunction(() => document.body.classList.contains('compact-battle') &&
    Math.abs(visualViewport.width - 844) < 1 && Math.abs(visualViewport.height - 390) < 1);
  const layout = await page.evaluate(() => ({
    stage: document.querySelector('#stage').getBoundingClientRect().toJSON(),
    controls: [...document.querySelectorAll('#touch-controls button')].map((el) => el.getBoundingClientRect().toJSON()),
  }));
  assert.ok(layout.stage.left >= 0 && layout.stage.right <= 844 && layout.stage.bottom <= 334.1, '横屏战场留出触控条空间');
  assert.ok(layout.controls.every((r) => r.width >= 44 && r.height >= 44 && r.bottom <= 390), '触屏操作键至少44px');
  const touch = async (type, x, y) => session.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x, y }] });
  const canvas = await page.$eval('#map canvas', (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.evaluate(() => window.__yjz.scene.panTo(350, 100));
  await touch('touchStart', canvas.x, canvas.y);
  await touch('touchMove', canvas.x - 50, canvas.y - 20);
  await touch('touchEnd', canvas.x - 50, canvas.y - 20);
  await page.waitForFunction(() => window.__yjz.scene.cameras.main.scrollX > 350);
  assert.equal(await mode(), 'idle', '触屏拖动结束不点选格子');
  const mini = await page.$eval('#minimap', (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width * 0.2, y: r.top + r.height * 0.25 }; });
  await touch('touchStart', mini.x, mini.y); await touch('touchEnd', mini.x, mini.y);
  const at = await page.evaluate(() => window.__yjz.scene.cameras.main.scrollX);
  assert.ok(at < 350, '触摸小地图跳到指定位置');
  const g = await unit('關羽');
  const p = await cellPoint(g.x, g.y);
  await touch('touchStart', p.x, p.y); await touch('touchEnd', p.x, p.y);
  await page.waitForFunction(() => window.__yjz.mode === 'unit');
  await page.click('#touch-cancel');
  assert.equal(await mode(), 'idle', '触屏取消可退回待选');
  await page.click('#touch-system');
  assert.equal(await page.getAttribute('#touch-system', 'aria-expanded'), 'true');
  const sysRects = await page.$$eval('#sys button', (els) => els.map((el) => el.getBoundingClientRect().toJSON()));
  assert.ok(sysRects.every((r) => r.height >= 44 && r.width >= 44), '系统指令触控尺寸至少44px');
  await page.click('#touch-cancel');
  assert.equal(await page.getAttribute('#touch-system', 'aria-expanded'), 'false');
  const mobileShot = async (name, width, height) => {
    // 旋转后字体可能重新栅格化；等字体与两帧布局绘制完成再保存截图。
    await page.evaluate(() => document.fonts.ready.then(() =>
      new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null))))));
    const png = await shot(name);
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [width, height], '手机截图使用对应 CSS 视口');
    const viewport = await page.evaluate(() => [visualViewport.width, visualViewport.height]);
    assert.ok(Math.abs(viewport[0] - width) < 1 && Math.abs(viewport[1] - height) < 1, '截图不应恢复桌面视口');
  };
  await mobileShot('32-mobile-landscape', 844, 390);
  await page.setViewportSize({ width: 390, height: 844 });
  await session.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await page.evaluate(() => dispatchEvent(new Event('resize')));
  await page.waitForFunction(() => document.body.classList.contains('portrait') &&
    !document.body.classList.contains('compact-battle') &&
    Math.abs(visualViewport.width - 390) < 1 && Math.abs(visualViewport.height - 844) < 1);
  assert.equal(await page.isVisible('#rotate-hint'), true);
  const portrait = await page.evaluate(() => {
    const r = document.querySelector('#stage').getBoundingClientRect();
    const v = visualViewport;
    const controls = [...document.querySelectorAll('#touch-controls button')].map((el) => el.getBoundingClientRect().toJSON());
    return { rect: r.toJSON(), viewport: [v?.width ?? innerWidth, v?.height ?? innerHeight], controls };
  });
  assert.ok(portrait.rect.left >= 0 && portrait.rect.top >= 0 && portrait.rect.right <= portrait.viewport[0] + 0.1 && portrait.rect.bottom <= portrait.viewport[1] + 0.1,
    `竖屏画面需完整留在可视视口中：${JSON.stringify(portrait)}`);
  assert.ok(portrait.rect.width >= 389 && Math.abs(portrait.rect.width / portrait.rect.height - 4 / 3) < 0.01, '竖屏完整显示4:3舞台并利用屏幕宽度');
  assert.ok(portrait.controls.every((r) => r.width >= 44 && r.height >= 44 && r.bottom <= 844), '竖屏操作键至少44px且不溢出');
  await mobileShot('33-mobile-portrait', 390, 844);
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: false, maxTouchPoints: 1 });
  await page.setViewportSize({ width: desktop.width, height: desktop.height });
  await session.send('Emulation.setDeviceMetricsOverride', { width: desktop.width, height: desktop.height, deviceScaleFactor: desktop.dpr, mobile: false });
  await session.detach();
  await page.evaluate(() => dispatchEvent(new Event('resize')));
  await page.waitForFunction(() => !document.body.classList.contains('touch') && document.querySelector('#sys').parentElement.id === 'side');
});

await step('道具指令：豆可以「给予 / 丢弃」，菜单里只有这三项', async () => {
  const bei = await unit('劉備');
  assert.ok((await unit('劉備')).items.includes(30), '营地买的豆应在刘备身上');
  await clickCell(bei.x, bei.y);
  if ((await mode()) !== 'unit') {
    // 刚把视口从手机尺寸切回来时，Phaser 的画布尺寸可能晚一帧生效，点到的格子会偏。
    await page.waitForTimeout(150);
    const again = await unit('劉備');
    await clickCell(again.x, again.y);
  }
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

await step('选中关羽：蓝格能走、橙格能打到，站着的部队会呼吸；右键取消；逐帧行走、指令菜单，Esc 退回原位', async () => {
  const g = await unit('關羽');
  const at = await cellPoint(g.x, g.y);
  await page.mouse.move(at.x, at.y); // 先把光标停在同一格，免得悬停框混进下面的对比
  // 冻结呼吸，好逐像素比出「选中」到底多画了什么
  await page.evaluate(() => {
    const sc = window.__yjz.scene;
    sc.speed = 0;
    window.__pixels = () => new Promise((done) => sc.game.renderer.snapshot((img) => {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      done(ctx.getImageData(0, 0, c.width, c.height).data);
    }));
  });
  await page.evaluate(async () => (window.__plain = await window.__pixels()));
  await page.mouse.click(at.x, at.y);
  await page.waitForTimeout(60);
  assert.equal(await mode(), 'unit');
  const tint = await page.evaluate(async () => {
    const a = window.__plain;
    const b = await window.__pixels();
    let blue = 0;
    let orange = 0;
    for (let i = 0; i < a.length; i += 4) {
      const [dr, dg, db] = [b[i] - a[i], b[i + 1] - a[i + 1], b[i + 2] - a[i + 2]];
      if (Math.abs(dr) + Math.abs(dg) + Math.abs(db) < 15) continue; // 没变的
      if (db >= dr && db >= dg && db > 6) blue++; // 亮蓝 0x8acfff
      else if (dr > dg && dr > db && dr > 6) orange++; // 朱 0xef6500
    }
    return { blue, orange };
  });
  // 一片格子 92×92 像素：真画出来就是成千上万的像素，不是几个残余
  assert.ok(tint.blue > 4000, `选中部队应亮出蓝色移动格，实际蓝 ${tint.blue} 像素`);
  assert.ok(tint.orange > 4000, `还应亮出橙色攻击范围，实际橙 ${tint.orange} 像素`);
  await shot('04-select-move-range');
  // 待机呼吸：站着的棋子一直在轻轻起伏，原版就是这样喘气
  const breath = await page.evaluate(async () => {
    const sc = window.__yjz.scene;
    sc.speed = 1;
    const sample = () => [...sc.tokens.values()].filter((s) => s.visible).map((s) => [s.frame.index, s.frame.name, s.texture.key, s.textureFrame, s.scaleX, s.scaleY]);
    const samples = [sample()];
    for (let i = 0; i < 6; i++) {
      await new Promise((r) => setTimeout(r, 150));
      samples.push(sample());
    }
    const first = samples[0];
    const changed = first.map((v, i) => samples.slice(1).some((row) => row[i][0] !== v[0] || row[i][1] !== v[1] || row[i][3] !== v[3]));
    const last = samples.at(-1);
    return { n: first.length, changed: changed.filter(Boolean).length, scales: [...last.map((v) => Math.abs(v[4] - 1)), ...last.map((v) => Math.abs(v[5] - 1))] };
  });
  assert.ok(breath.n >= 10, `场上应有十来支部队，实际 ${breath.n}`);
  assert.ok(breath.changed >= 5, `站着的部队应交替原版待机帧，实际只变了 ${breath.changed} 支，调试 ${JSON.stringify(breath)}`);
  assert.ok(breath.scales.every((v) => v === 0), `原版待机不拉伸棋子，实际缩放偏差 ${Math.max(...breath.scales)}`);
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
      if (window.__walkShot || window.__shotBusy || window.__shotTries > 40 || f < 47 || f >= 94) return;
      window.__shotBusy = true;
      window.__shotTries++;
      sc.game.renderer.snapshot((im) => {
        window.__shotBusy = false;
        if (Number(sc.tokens.get(slot).frame.name) >= 47) window.__walkShot = im.src;
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
  assert.equal(walk.total, 189, '棋子图集：47 列 × 4 行 + 整图帧');
  const standing = guan.cls * 2;
  assert.ok(walk.frames.includes(standing), `出现站立帧 ${standing}`);
  assert.ok(walk.frames.includes(standing + 47), `出现行走帧 ${standing + 47}`);
  assert.ok(walk.frames.filter((f) => f === standing + 47).length >= 2, '行走帧反复出现（两帧交替）');
  assert.equal(await mode(), 'menu');
  assert.deepEqual([(await unit('關羽')).x, (await unit('關羽')).y], plan.to);
  await shot('05-command-menu');
  await page.keyboard.press('Escape');
  const back = await unit('關羽');
  assert.deepEqual([back.x, back.y, back.moved], [g.x, g.y, false]);
  await page.keyboard.press('Escape');
  assert.equal(await mode(), 'idle');
});

await step('战场全部角色映射：47列原图，刘备三兵种、吕布、曹操与所有关卡单位', async () => {
  const result = await page.evaluate(async () => {
    const { default: game } = await import('/src/data/game.json');
    const sc = window.__yjz.scene;
    const rows = Object.values(game.battles).flatMap((b) => [...b.units, ...Object.values(b.groups).flat()]);
    const check = (u) => {
      const unit = { ...u, slot: u.side === 'enemy' ? 15 : 0 };
      return [u.key, u.cls, sc.frameOf(unit, false) % 47];
    };
    return { columns: sc.tokenColumns, rows: rows.map(check), specials: [
      ...[0, 1, 2].map((cls) => check({ key: 'liu_bei', cls })),
      check({ key: 'lu_bu', cls: 6, side: 'enemy' }), check({ key: 'cao_cao', cls: 8, side: 'enemy' }),
    ] };
  });
  assert.equal(result.columns, 47);
  assert.equal(result.rows.length, 1499);
  assert.deepEqual(result.specials.map((r) => r[2]), [38, 39, 40, 45, 46]);
  for (const [key, cls, col] of result.rows) {
    assert.ok(col >= 0 && col < 47 && ![41, 42, 43, 44].includes(col), `${key}/${cls}形象有效`);
    if (key === 'lu_bu') assert.equal(col, 45);
    if (key === 'cao_cao') assert.equal(col, 46);
  }
});

await step('移动逐格转向并逐步发声：先竖走后转弯，也不能倒退', async () => {
  const r = await page.evaluate(async () => {
    const sc = window.__yjz.scene;
    const u = sc.b.units.find((u) => u.on && u.mode === 7);
    const s = sc.tokens.get(u.slot);
    const speed = sc.speed;
    const tween = sc.tween.bind(sc);
    const directions = [];
    sc.tween = (cfg) => {
      if (cfg.targets === s && typeof cfg.x === 'number' && Math.abs(cfg.x - s.x) > 1)
        directions.push({ dx: cfg.x - s.x, left: s.flipX });
      return tween(cfg);
    };
    sc.speed = 0.8;
    const before = window.__yjz.sfx().filter((k) => k === 'step').length;
    try {
      await sc.play({ t: 'move', slot: u.slot, path: [[u.x, u.y], [u.x, u.y - 1], [u.x - 1, u.y - 1], [u.x - 1, u.y], [u.x, u.y]] });
      return { directions, sounds: window.__yjz.sfx().filter((k) => k === 'step').length - before };
    } finally { sc.tween = tween; sc.speed = speed; sc.sync(); }
  });
  assert.equal(r.sounds, 4, '移动四格启动四次脚步声');
  assert.ok(r.directions.some((d) => d.dx < 0) && r.directions.some((d) => d.dx > 0));
  assert.ok(r.directions.every((d) => d.left === (d.dx < 0)), '每个水平位移必须与图像朝向一致');
});

await step('鼠标同格响应：只刷新一次，镜头卷动后按新格更新', async () => {
  const result = await page.evaluate(() => {
    const sc = window.__yjz.scene;
    let calls = 0;
    const fn = sc.onHover;
    sc.onHover = () => calls++;
    sc.hoverCell = '';
    const t = performance.now();
    for (let i = 0; i < 100; i++) sc.hover(3, 2);
    const ms = performance.now() - t;
    sc.onHover = fn;
    return { calls, ms };
  });
  assert.equal(result.calls, 1, '同格100次鼠标移动只能刷新一次信息栏');
  console.log(`    同格100次光标事件 ${result.ms.toFixed(2)}ms`);
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
    const summary = (n) => ({ frames: anim(n).frames.map((f) => f.textureFrame), frameRate: anim(n).frameRate });
    return { sheet: ac.sheet, sheetFrames: tex.frameTotal - 1, idle: summary('idle'), attack: summary('attack'), hurt: summary('hurt'), span: { idle: span(anim('idle')), attack: span(anim('attack')), hurt: span(anim('hurt')) } };
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
    window.__impactSounds = [];
    const sc = window.__yjz.scene;
    const originalPlay = sc.play.bind(sc);
    window.__restorePlay = () => { sc.play = originalPlay; };
    sc.play = (ev, onImpact) => {
      if (ev.t !== 'hit') return originalPlay(ev, onImpact);
      const hitSounds = () => window.__yjz.sfx().filter((k) => ['hit', 'hit_heavy', 'arrow'].includes(k)).length;
      const before = hitSounds();
      return originalPlay(ev, () => {
        window.__impactSounds.push(hitSounds() - before);
        onImpact?.();
      });
    };
    window.__rec = setInterval(() => {
      const box = window.__yjz.scene.children.list.find((o) => o.type === 'Container' && o.depth === 20);
      if (!box) return;
      const sp = box.list.filter((o) => o.type === 'Sprite');
      if (sp.length === 2) window.__seen.push([...sp.map((s) => Number(s.frame.name)), performance.now()]);
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
  const seenFrames = await page.evaluate(() => (clearInterval(window.__rec), window.__restorePlay(), window.__seen));
  const impactSounds = await page.evaluate(() => window.__impactSounds);
  assert.ok(impactSounds.length > 0 && impactSounds.every((n) => n === 1), `每次命中必须同步启动一个攻击音效，实际 ${impactSounds}`);
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
  // 亮相到出手不该干等：以前滑入 280ms + 站桩 780ms，玩家会觉得「等了一会儿才打」
  const lead = seenFrames[firstAttack][2] - seenFrames[0][2];
  console.log(`    特写亮相 → 出手 ${Math.round(lead)}ms`);
  assert.ok(lead < 700, `特写亮相到挥刀应紧凑，实际 ${Math.round(lead)}ms`);
  assert.ok(firstHurt > firstAttack, '守方的受击不应早于攻方出手');
  assert.equal((await state()).round, 2);
});

await step('存档列表：多槽写入、概要、覆盖、删除 → 读指定档恢复完整战况', async () => {
  const autoBefore = await page.evaluate(() => localStorage.getItem('yjz.autosave.v1'));
  assert.equal(JSON.parse(autoBefore).battle.round, 2, '每回合应保存新回合开局');
  await sys('存档');
  assert.equal(await page.$$eval('.auto-slot [data-act="write"], .auto-slot [data-act="delete"]', (els) => els.length), 0, '自动档不可手动覆盖或删除');
  await page.waitForSelector('#save-list:not([hidden]) .save-slot');
  // 檔一还留着营地存档；这次写到檔二，两个槽互不影响
  await page.click('#save-list [data-slot="1"][data-act="write"]');
  const saved = await state();
  let list = await page.evaluate(() => JSON.parse(localStorage.getItem('yjz.saves.v1')));
  assert.equal(await page.evaluate(() => localStorage.getItem('yjz.autosave.v1')), autoBefore, '手动保存不得覆盖自动档');
  assert.equal(list.last, 1, '最近存档指向檔二');
  assert.equal(list.slots[0].battle, undefined, '檔一仍是只含流程的营地存档');
  assert.equal(list.slots[1].battle.level, saved.level, '檔二带完整战况');
  // 概要里要能看出是哪一关、第几回合，而不是一片空白
  await sys('存档');
  await page.waitForSelector('#save-list:not([hidden]) .save-slot');
  const text = await page.textContent('#save-list .save-slot:nth-child(3) .slot-info');
  assert.match(text, /第\d+回合/, `槽位应显示关卡与回合，实际「${text}」`);
  assert.match(text, /金/, '槽位应显示军资');
  await shot('30-save-list');
  await page.click('#save-list [data-slot="2"][data-act="write"]'); // 再占一格，用来验证删除
  await sys('存档');
  await page.waitForSelector('#save-list:not([hidden]) .save-slot');
  assert.equal(await page.$$eval('#save-list .save-slot', (els) => els.length), 7);
  await page.click('#save-list [data-slot="2"][data-act="delete"]'); // 第一下只是变「確認刪除」
  assert.match(await page.textContent('#save-list [data-slot="2"][data-act="delete"]'), /確認刪除/);
  await page.click('#save-list [data-slot="2"][data-act="delete"]'); // 第二下才真的删
  list = await page.evaluate(() => JSON.parse(localStorage.getItem('yjz.saves.v1')));
  assert.equal(list.slots[2], null, '確認后檔三被删掉');
  assert.equal(list.slots[1].battle.level, saved.level, '删别的槽不动檔二');
  await page.keyboard.press('Escape'); // Esc 也能收起列表
  assert.equal(await page.evaluate(() => document.getElementById('save-list').hidden), true);

  await command('關羽', 'duel');
  await command('張飛', 'hunt');
  await endTurn();
  assert.ok((await page.evaluate(() => window.__yjz.bgmLog())).includes('enemy'), '敌军阶段应切到「敌将」曲');
  assert.notDeepEqual(await state(), saved);
  await sys('读档');
  await page.waitForSelector('#save-list:not([hidden]) .save-slot');
  assert.equal(await page.isDisabled('#save-list [data-slot="0"][data-act="read"]'), false, '有存档的槽可读');
  assert.equal(await page.isEnabled('#save-list [data-slot="3"][data-act="read"]'), false, '空槽不可读');
  await page.click('#save-list [data-slot="1"][data-act="read"]'); // 明确选檔二，不是「最近一个」
  await settle();
  assert.deepEqual(await state(), saved, '读档应恢复完整战斗状态（含随机数、回合、行动标记、事件）');
  const automatic = await page.evaluate(() => JSON.parse(localStorage.getItem('yjz.autosave.v1')).battle);
  assert.ok(automatic.round > 2, '下一回合自动更新自动档');
  await sys('读档');
  await page.click('#save-list [data-slot="auto"][data-act="read"]');
  await settle();
  assert.deepEqual(await state(), automatic, '独立自动档可恢复完整战况');
  await sys('读档');
  await page.click('#save-list [data-slot="1"][data-act="read"]');
  await settle();
});

await step('从标题读战斗档：标题卡片必须收起，直接回到战场原状态', async () => {
  // 回归：begin() 以前只开战、不收起 #screen，从标题读战斗档会停在标题画面一动不动。
  const disk = await page.evaluate(() => JSON.parse(localStorage.getItem('yjz.saves.v1')).slots[1].battle);
  await page.reload();
  await page.waitForSelector('[data-go="start"]');
  await page.click('[data-go="load"]');
  await page.waitForSelector('#save-list:not([hidden]) .save-slot');
  await page.click('#save-list [data-slot="1"][data-act="read"]');
  await page.waitForFunction(() => window.__yjz?.mode === 'idle', null, { timeout: 60000 });
  assert.equal(await page.evaluate(() => document.getElementById('screen').hidden), true, '标题卡片应已收起，不能盖住战场');
  assert.equal(await page.evaluate(() => document.getElementById('save-list').hidden), true, '读档列表也应收起');
  assert.match(await page.textContent('#turn'), /第2回合/);
  assert.deepEqual(await state(), disk, '从标题读战斗档应恢复存档里的完整战况');
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
  // 到下一个营地后覆盖檔一，好在刷新页面后验证成长没丢
  if (s.camp) {
    await page.click('[data-go="camp-save"]');
    await page.waitForSelector('#save-list:not([hidden]) .save-slot');
    await page.click('#save-list [data-slot="0"][data-act="write"]');
  }
});

await step('刷新页面 → 讀取存檔：营地、军资、关羽 2 级都还在', async () => {
  const saved = await storyNow();
  await page.reload();
  await page.waitForSelector('[data-go="start"]');
  assert.equal(await page.isDisabled('[data-go="load"]'), false, '有存档时读档可点');
  await page.click('[data-go="load"]');
  await page.waitForSelector('#save-list:not([hidden]) .save-slot');
  assert.match(await page.textContent('#save-list h1'), /讀取存檔/);
  await page.click('#save-list [data-slot="0"][data-act="read"]');
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
  const diagnostics = await page.evaluate(() => window.__yjz.sfxDiagnostics());
  assert.equal(diagnostics.contextState, 'running', '音效设备应在第一次用户手势后真正解锁');
  assert.equal(diagnostics.ready.length, 21, '21个音效应已解码，可立即播放');
  assert.deepEqual(diagnostics.errors, [], '音效不可静默播放失败');
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
    const story = { script: 'yingjiezhuan', pc, bg: '', picture: '', bgm: '', cast: [], flags: {}, roster, party, bag: [], deploy: [], gold: 10000, resume: { t: 'battle', id: lid } };
    await page.evaluate((st) => {
      localStorage.setItem('yjz.saves.v1', JSON.stringify({ slots: [{ story: st, at: Date.now() }], last: 0 }));
      localStorage.setItem('yjz.save.v3', JSON.stringify({ story: st }));
    }, story);
    await page.reload();
    await page.waitForSelector('[data-go="start"]');
    await page.click('[data-go="load"]');
    await page.waitForSelector('#save-list:not([hidden]) .save-slot');
    await page.click('#save-list [data-slot="0"][data-act="read"]');
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

  // 道具：全部各一件 → 一键装备取最好的三件（霸者劍 / 孫子兵法 / 赤兎馬），另补一件玉璽
  await page.click('[data-tr="give-all"]');
  assert.ok((await storyNow()).bag.length >= 60, '包袱里应有全部道具');
  await page.click(`[data-equip="${who}"]`);
  const items = (await storyNow()).roster[who].items;
  for (const id of [59, 3, 7, 8]) assert.ok(items.includes(id), `一键装备应有 ${id}`);
  assert.equal(items.filter((id) => id === 8).length, 1, '玉璽只带一件');
  assert.match(await page.textContent('.trainer .tr-bag'), /英雄之劍/, '包袱里应还剩没穿上的装备');

  await page.click('[data-tr="close"]');
  assert.equal(await page.evaluate(() => window.__yjz.trainerOpen), false);
});

await step('简繁切换：默认简体，一键还原原版繁体，对白 / 菜单 / 标题一起变', async () => {
  await page.evaluate(() => localStorage.removeItem('yjz.script'));
  // 前面的战斗用例带 ?fast，reload 会继承自动跳过对白；文案检查须回到普通模式。
  await page.goto(`${BASE}/`);
  assert.equal(await page.evaluate(() => new URLSearchParams(location.search).has('fast')), false);
  await page.waitForSelector('[data-go="start"]');
  const hans = await page.evaluate(() => ({
    title: document.querySelector('#screen h1').textContent,
    body: document.querySelector('#screen').innerText,
    pageTitle: document.title,
    label: document.querySelector('[data-go="script"]').textContent.trim(),
  }));
  assert.match(hans.title, /三国志英杰传/, `默认应显示简体，实际「${hans.title}」`);
  assert.doesNotMatch(hans.title, /[國傑傳]/);
  assert.match(hans.body, /开始新游戏/);
  assert.match(hans.body, /读取存档/);
  assert.match(hans.pageTitle, /三国志英杰传/, '浏览器标签也跟着转');
  assert.equal(hans.label, '文字 简体');
  const allPlain = await page.evaluate(async () => {
    const { toSimplified } = await import('/src/zh.ts');
    const t = document.querySelector('#screen').innerText;
    return { text: t, plain: toSimplified(t) === t };
  });
  assert.ok(allPlain.plain, `简体模式整个标题卡片都不该残留繁体字，实际「${allPlain.text}」`);
  await shot('31-title-hans');

  // 切回繁体：原文还在 WeakMap 里，是无损还原而不是反向猜
  await page.click('[data-go="script"]');
  const hant = await page.evaluate(() => ({
    title: document.querySelector('#screen h1').textContent,
    body: document.querySelector('#screen').innerText,
    label: document.querySelector('[data-go="script"]').textContent.trim(),
    saved: localStorage.getItem('yjz.script'),
  }));
  assert.match(hant.title, /三國志英傑傳/);
  assert.match(hant.body, /開始新遊戲/);
  assert.equal(hant.saved, 'hant');
  assert.equal(hant.label, '文字 繁体');

  // 再切回简体，进游戏检查章节横幅与对白
  await page.click('[data-go="script"]');
  await page.click('[data-go="start"]');
  await page.waitForSelector('#screen .chapter');
  const plain = await page.evaluate(async () => {
    const { toSimplified } = await import('/src/zh.ts');
    return [document.querySelector('#screen .chapter-band').innerText, document.querySelector('#sys').innerText]
      .map((t) => ({ text: t, plain: toSimplified(t) === t }));
  });
  assert.ok(plain.every((p) => p.plain), `简体模式下横幅与菜单不应还有繁体字，实际 ${JSON.stringify(plain)}`);
  // 点掉章节横幅 / 地名条，直到对白出现；不用 Enter，免得焦点还留在标题按钮上又触发一次点击
  for (let i = 0; i < 16 && !(await page.$('#talk:not([hidden])')); i++) {
    if (await page.$('#talk .ask')) await page.click('#talk .ask button:first-child');
    else if (await page.evaluate(() => !document.getElementById('talk').hidden)) break;
    else await page.click('#screen');
    await page.waitForTimeout(60);
  }
  await page.waitForSelector('#talk:not([hidden])');
  const talkPlain = await page.evaluate(async () => {
    const { toSimplified } = await import('/src/zh.ts');
    const t = document.querySelector('#talk').innerText;
    return { text: t, plain: toSimplified(t) === t };
  });
  assert.ok(talkPlain.plain, `对白应为简体，实际「${talkPlain.text}」`);

  // 战场系统菜单里是同一个开关
  await page.evaluate(() => document.querySelector('#sys [data-script="1"]').click());
  assert.equal(await page.evaluate(() => localStorage.getItem('yjz.script')), 'hant', '系统菜单也能切换');
  assert.match(await page.textContent('#sys [data-script="1"]'), /文字 繁体/);
});

await step('旧档迁移：信都营地保留已选分支，旧战斗档按关卡定位', async () => {
  const G = JSON.parse(readFileSync(new URL('../src/data/game.json', import.meta.url), 'utf8'));
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('yjz.autosave.v1')));
  assert.ok(saved?.battle, '前序战斗应留下完整自动档');
  const campPc = G.steps.findIndex((s) => s.t === 'camp' && s.battle === 'c1_s0_b6');
  const oldStory = await page.evaluate(async () => {
    const { SCRIPT } = await import('/src/data/game.ts');
    const { startStory, nextStep } = await import('/src/story.ts');
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei'] });
    for (let step = nextStep(SCRIPT, st); step; step = nextStep(SCRIPT, st)) {
      if (step.t === 'camp' && step.battle === 'c1_s0_b6') {
        delete st.resume;
        st.pc = -200;
        st.gold = 765;
        return st;
      }
    }
    throw new Error('真实路线未到达信都营地');
  });
  const oldBattle = JSON.parse(JSON.stringify(saved));
  oldBattle.story.pc = -1;
  delete oldBattle.story.resume;
  await page.evaluate(({ oldStory, oldBattle }) => {
    localStorage.setItem('yjz.saves.v1', JSON.stringify({ slots: [{ story: oldStory, at: Date.now() }, oldBattle], last: 0 }));
  }, { oldStory, oldBattle });
  await page.reload();
  await page.waitForSelector('[data-go="load"]');
  await page.click('[data-go="load"]');
  await page.click('#save-list [data-slot="0"][data-act="read"]');
  await page.waitForSelector('[data-go="camp-go"]');
  assert.match(await page.textContent('#screen .card'), /信都 — 出兵準備/);
  assert.equal((await storyNow()).gold, 765);
  assert.equal((await storyNow()).pc, campPc);
  // 营地里加载旧战斗档，校验场景恢复且旧剧情不再覆盖战场。
  await page.evaluate(() => window.__yjz.openSaveList('load'));
  await page.click('#save-list [data-slot="1"][data-act="read"]');
  await page.waitForFunction(() => window.__yjz.mode === 'idle');
  assert.equal((await state()).level, oldBattle.battle.level);
  assert.equal(await page.evaluate(() => document.querySelector('#screen').hidden), true);
});

await step('读档浮层兜底：即使舞台节点被挪走，点开列表也不能抛错', async () => {
  // 回归：曾出现 `$('stage')` 取不到时 openSaveList 抛 TypeError，浮层没插进去、画面毫无反应。
  const r = await page.evaluate(() => {
    document.getElementById('save-list')?.remove(); // 逼它走「首次创建」那条分支
    const stage = document.getElementById('stage');
    stage.id = 'stage-moved';
    let msg = '';
    try { window.__yjz.openSaveList('load'); } catch (e) { msg = String(e && e.message); }
    const list = document.getElementById('save-list');
    const out = { msg, ok: !!list && !list.hidden, parent: list?.parentElement?.tagName ?? '', slots: list?.querySelectorAll('.save-slot').length ?? 0 };
    stage.id = 'stage';
    if (list) list.hidden = true;
    return out;
  });
  assert.equal(r.msg, '', `打开列表不应抛错，实际「${r.msg}」`);
  assert.deepEqual([r.ok, r.parent, r.slots], [true, 'BODY', 7], `浮层应挂到 body 并列出六格，实际 ${JSON.stringify(r)}`);
});

await step('界桥篇六阶段房间：人物、头像、商店、存档与出发分支', async () => {
  await page.goto(`${BASE}/`); // 保持手动对白模式，逐阶段检查点击
  const { results } = await verifyRooms(page);
  assert.equal(results.length, 4);
});

await step('北海议事厅：赠金、原文闲谈、取消出发、存读档与徐州行军', async () => {
  await page.goto(`${BASE}/`);
  assert.match(await verifyBeihaiRoom(page), /北海/);
});

await step('徐州议事厅：陶谦议论、两阶段交谈、关张路线确认与存读档', async () => {
  await page.goto(`${BASE}/`);
  assert.match(await verifyXuzhouRooms(page), /徐州/);
});

await step('小沛议事厅：简雍汇报、关羽取消/确认出征与山贼路线', async () => {
  await page.goto(`${BASE}/`);
  assert.match(await verifyXuzhouSecondScene(page), /小沛/);
});

await step('返回徐州：陶谦赠剑、孙乾入队行军与赵云告别', async () => {
  await page.goto(`${BASE}/`);
  assert.match(await verifyXuzhouReturnRooms(page), /赠剑/);
});

await step('小沛战后：剿匪奖励、快使报告、两房间存档与赴徐州', async () => {
  await page.goto(`${BASE}/`);
  assert.match(await verifyXiaopeiReturnRooms(page), /小沛战后/);
});

await step('分支房间读档保留地图、人物、镜头与奖励', async () => {
  await verifyBranchStageSave(page, BASE);
});

await step('吕布来投与钦差到访：三组/四组交谈、重摆议事厅与刘备头像', async () => {
  await page.goto(`${BASE}/`);
  assert.match(await verifyLubuEnvoyRooms(page), /钦差/);
});

await step('许昌议事厅：两轮闲谈、官邸按钮与谋士议事', async () => {
  await page.goto(`${BASE}/`);
  assert.match(await verifyXuchangRoom(page), /许昌/);
});

await step('通用房间：多组闲谈、人物推进与地点按钮换景', async () => {
  await page.goto(`${BASE}/`);
  assert.match(await verifyGenericGroupRoom(page), /地点按钮/);
});

await step('出征房间：问句、列队、出兵与下邳营地', async () => {
  await page.goto(`${BASE}/`);
  assert.match(await verifyDepartureRoom(page), /下邳/);
});

await step('选项幕：闲谈停顿后仍是原版选项与生路分支', async () => {
  await page.goto(`${BASE}/`);
  assert.match(await verifyChoiceRoom(page), /生路/);
});

await step('徐庶离队：有序房间推进并保留 pack 的 away', async () => {
  await page.goto(`${BASE}/`);
  assert.match(await verifyXuShuRooms(page), /徐庶离队/);
});

await step('进退场幕：三段房间按原顺序推进，不被走位打断', async () => {
  await page.goto(`${BASE}/`);
  assert.match(await verifyActionRoomPause(page), /鲁肃引荐/);
});

await step('幕尾闲谈并入上一个房间：单停顿点、按钮推进接下一幕', async () => {
  await page.goto(`${BASE}/`);
  assert.match(await verifyMergedTailRoom(page), /单停顿点/);
});

await step('三顾茅庐：两段房间、合并闲谈与原版选项', async () => {
  await page.goto(`${BASE}/`);
  assert.match(await verifyLongChoiceRoom(page), /三顾茅庐/);
});

await step('两份独立剧情：只加数据即可运行，分支奖励与存档互不覆盖', async () => {
  await verifyImportedStories(page, BASE);
});

assert.deepEqual(errors, [], '浏览器控制台不应有报错');
console.log(`\n全部 ${steps.length} 项通过，截图在 ${SHOTS}`);
await browser.close();
