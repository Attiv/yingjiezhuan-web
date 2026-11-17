// 生产构建冒烟：先 npm run build && npm run preview -- --port 5274，再 node tests/prod-smoke.mjs
// 生产包里没有调试钩子，所以这里只用画面上看得见的东西判断。
import assert from 'node:assert/strict';
import { open } from '../tools/browser.mjs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5274';
const { browser, page, errors } = await open(`${BASE}/?seed=3`);
await page.waitForSelector('[data-go="start"]');
// 主流程按原版繁体断言；默认简体与切换另由 e2e 覆盖。
await page.evaluate(() => localStorage.setItem('yjz.script', 'hant'));
await page.reload();
await page.waitForSelector('[data-go="start"]');
assert.equal(await page.evaluate(() => typeof window.__yjz), 'undefined', '生产包不应带调试钩子');
assert.match(await page.textContent('#screen h1'), /三國志英傑傳/);

await page.click('[data-go="start"]');
// 点完开场：章节横幅、对白一路点掉，直到出兵准备
for (let i = 0; i < 400; i++) {
  if (await page.$('#screen .chapter')) { await page.click('#screen'); continue; }
  if (await page.$('[data-go="camp-go"]')) break;
  if (await page.$('#talk .ask')) { await page.click('#talk .ask button:first-child'); continue; }
  if (await page.$('#talk:not([hidden])')) { await page.click('#talk'); continue; }
  await page.waitForTimeout(20);
}
assert.match(await page.textContent('#screen .card'), /汜水關 — 出兵準備/);
assert.match(await page.textContent('#screen .card'), /軍資 500 金/); // 曹操在序章拨的那 500
await page.click('[data-buy="30"]'); // 买一袋豆（原版 100 金），看看商店与军资
assert.match(await page.textContent('#screen .card'), /軍資 400 金/);
await page.click('[data-go="camp-go"]');

await page.waitForSelector('[data-go="deploy"]');
assert.match(await page.textContent('#screen .card'), /汜水關之戰/);
await page.click('[data-go="deploy"]');
await page.waitForSelector('[data-go="battle"]');
assert.match(await page.textContent('#screen .card'), /部隊配置/);
await page.click('[data-go="auto"]'); // 按原版出兵位摆好
await page.click('[data-go="battle"]');
// 开场插剧要点几下
for (let i = 0; i < 300; i++) {
  if (await page.$('#talk .ask')) { await page.click('#talk .ask button:first-child'); continue; }
  if (await page.$('#talk:not([hidden])')) { await page.click('#talk'); continue; }
  if ((await page.textContent('#log')).includes('目标')) break;
  await page.waitForTimeout(20);
}
assert.match(await page.textContent('#turn'), /第1回合/);
assert.match(await page.textContent('#log'), /目标：一、殲滅華雄/);
const autoStart = await page.evaluate(() => JSON.parse(localStorage.getItem('yjz.autosave.v1')));
assert.equal(autoStart.battle.round, 1, '生产版开战即写独立自动档');
assert.equal(autoStart.battle.stage, 'player');

// 结束回合：先确认（还有部队没行动），敌军行动完进入第 2 回合
await page.click('#sys button:has-text("回合结束")');
if (await page.$('#talk .ask')) await page.click('#talk .ask button:first-child');
await page.waitForFunction(() => document.getElementById('turn').textContent.includes('第2回合') &&
  JSON.parse(localStorage.getItem('yjz.autosave.v1'))?.battle.round === 2, null, { timeout: 90000 });
const autoNext = await page.evaluate(() => JSON.parse(localStorage.getItem('yjz.autosave.v1')));
assert.equal(autoNext.battle.level, autoStart.battle.level);
assert.equal(autoNext.battle.stage, 'player', '生产版新回合完成结算后更新自动档');
assert.ok(autoNext.at >= autoStart.at);
await page.screenshot({ path: new URL('../docs/screenshots/13-production-build.png', import.meta.url).pathname });

// 生产包里 21 个音效都在（运行时不依赖开发态调试对象）
const keys = ['cursor', 'confirm', 'cancel', 'error', 'step', 'hit', 'hit_heavy', 'arrow', 'fire', 'water', 'rock',
  'heal', 'morale_up', 'morale_down', 'confuse', 'levelup', 'retreat', 'treasure', 'phase', 'victory', 'defeat'];
const codes = await page.evaluate(async (ks) => Promise.all(ks.map(async (k) => (await fetch(`/assets/sfx/${k}.wav`)).status)), keys);
assert.deepEqual([...new Set(codes)], [200], '21 个音效都在生产包里');

// 四张章节行军图也都在
const maps = await page.evaluate(async () => Promise.all(['000', '001', '002', '003']
  .map(async (n) => (await fetch(`/assets/maps/campaign/${n}.png`)).status)));
assert.deepEqual([...new Set(maps)], [200], '4 张行军图都在生产包里');

// 10 首原版 BGM 也都在（战斗曲 / 敌将曲 / 单挑曲都靠它们）
const bgm = await page.evaluate(async (ks) => Promise.all(ks.map(async (k) => (await fetch(`/assets/bgm/${k}.mp3`)).status)),
  ['title', 'peace', 'camp', 'battle', 'boss', 'enemy', 'tension', 'sad', 'defeat', 'ending']);
assert.deepEqual([...new Set(bgm)], [200], '10 首 BGM 都在生产包里');

// 剧情舞台用的宫殿图与野外地平：23 + 5 张，一张不缺
const story = await page.evaluate(async () => {
  const files = [...Array(23)].map((_, i) => `pmap-${String(i).padStart(3, '0')}.png`)
    .concat([...Array(5)].map((_, i) => `field-${String(i).padStart(2, '0')}.png`));
  return Promise.all(files.map(async (f) => (await fetch(`/assets/story/${f}`)).status));
});
assert.deepEqual([...new Set(story)], [200], '28 张剧情场景图都在生产包里');

assert.deepEqual(errors, []);
console.log('生产构建冒烟通过：标题 → 序章（含舞台式剧情）→ 营地 → 汜水關之戰 → 第 2 回合，' +
  '独立自动档从第 1 回合更新至第 2 回合；21 个音效、10 首 BGM、4 张行军图与 28 张剧情场景图可加载，控制台无报错');
await browser.close();
