// 生产构建冒烟：先 npm run build && npm run preview -- --port 5274，再 node tests/prod-smoke.mjs
// 生产包里没有调试钩子，所以这里只用画面上看得见的东西判断。
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

export async function verifyProduction(page, base = 'http://127.0.0.1:5274') {
const exists = selector => page.evaluate(s => !!document.querySelector(s), selector);
const text = selector => page.evaluate(s => document.querySelector(s)?.textContent ?? '', selector);
await page.goto(`${base}/?seed=3`);
await page.waitForSelector('[data-go="start"]');
const pwa = await page.evaluate(async () => {
  const manifest = await (await fetch('/manifest.webmanifest')).json();
  await navigator.serviceWorker.ready;
  return { display: manifest.display, icons: manifest.icons.map(icon => icon.sizes), hasWorker: !!navigator.serviceWorker.controller };
});
assert.equal(pwa.display, 'standalone', '应用 manifest 应声明独立窗口模式');
assert.ok(pwa.icons.includes('192x192') && pwa.icons.includes('512x512'), '应提供安装所需图标尺寸');
await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 60000 });
await page.reload();
await page.waitForSelector('[data-go="start"]');
const cachedAssets = await page.evaluate(async () => {
  const keys = await caches.keys();
  const cache = await caches.open(keys.find(key => key.startsWith('yingjiezhuan-')));
  return {
    shell: !!await cache.match('/index.html'),
    title: !!await cache.match('/assets/title.png'),
    music: !!await cache.match('/assets/bgm/title.mp3'),
  };
});
assert.deepEqual(cachedAssets, { shell: true, title: true, music: true }, '离线缓存应包含应用壳、游戏图像和音乐');
await page.context().setOffline(true);
await page.reload();
await page.waitForSelector('[data-go="start"]');
assert.match(await text('#screen h1'), /三国志英杰传/);
await page.context().setOffline(false);
// 主流程按原版繁体断言；默认简体与切换另由 e2e 覆盖。
await page.evaluate(() => localStorage.setItem('yjz.script', 'hant'));
await page.reload();
await page.waitForSelector('[data-go="start"]');
assert.equal(await page.evaluate(() => typeof window.__yjz), 'undefined', '生产包不应带调试钩子');
assert.match(await text('#screen h1'), /三國志英傑傳/);

await page.click('[data-go="start"]');
// 点完自动开场，停在原版自由交谈房间。
for (let i = 0; i < 5000; i++) {
  if (await exists('#screen .chapter')) { await page.click('#screen'); continue; }
  if (await exists('.room-controls')) break;
  if (await exists('#talk .ask')) { await page.click('#talk .ask button:first-child'); continue; }
  if (await exists('#talk:not([hidden])')) { await page.click('#talk'); continue; }
  await page.waitForTimeout(20);
}
await page.waitForSelector('.room-controls');
assert.equal(await page.evaluate(() => document.querySelectorAll('.actor').length), 10, '自由房间保留原始十名人物');
await page.click('.actor[data-who="1"]');
await page.waitForSelector('#talk .ask');
assert.match(await text('#talk'), /準備好了嗎？/);
await page.click('#talk .ask button:last-child');
await page.waitForSelector('.room-controls');
await page.click('.actor[data-who="374"]');
await page.waitForSelector('[data-go="camp-go"]');
assert.match(await text('#screen .card'), /汜水關之戰 — 出兵準備/);
assert.match(await text('#screen .card'), /軍資 500 金/); // 曹操在序章拨的那 500
await page.click('[data-buy="30"]'); // 买一袋豆（原版 100 金），看看商店与军资
assert.match(await text('#screen .card'), /軍資 400 金/);
await page.click('[data-go="camp-go"]');
await page.waitForSelector('.room-controls');
await page.click('.actor[data-who="1"]');
await page.waitForSelector('#talk .ask');
await page.click('#talk .ask button:first-child');
await page.waitForSelector('#talk:not([hidden])');
assert.match(await text('#talk'), /出征！/);
await page.click('#talk');

await page.waitForSelector('[data-go="deploy"]');
assert.match(await text('#screen .card'), /汜水關之戰/);
await page.click('[data-go="deploy"]');
await page.waitForSelector('[data-go="battle"]');
assert.match(await text('#screen .card'), /部隊配置/);
await page.click('[data-go="auto"]'); // 按原版出兵位摆好
await page.click('[data-go="battle"]');
// 开场插剧要点几下
for (let i = 0; i < 300; i++) {
  if (await exists('#talk .ask')) { await page.click('#talk .ask button:first-child'); continue; }
  if (await exists('#talk:not([hidden])')) { await page.click('#talk'); continue; }
  if ((await text('#log')).includes('目标')) break;
  await page.waitForTimeout(20);
}
assert.match(await text('#turn'), /第1回合/);
assert.match(await text('#log'), /目标：一、殲滅華雄/);
const autoStart = await page.evaluate(() => localStorage.getItem('yjz.autosave.v1'));
assert.ok(autoStart?.startsWith('YJZENC1:'), '生产版自动档应以 AES-GCM 密文保存');

// 结束回合：先确认（还有部队没行动），敌军行动完进入第 2 回合
await page.click('#sys button:has-text("回合结束")');
if (await exists('#talk .ask')) await page.click('#talk .ask button:first-child');
await page.waitForFunction((previous) => {
  const current = localStorage.getItem('yjz.autosave.v1');
  return document.getElementById('turn').textContent.includes('第2回合') && current?.startsWith('YJZENC1:') && current !== previous;
}, autoStart, { timeout: 90000 });
const autoNext = await page.evaluate(() => localStorage.getItem('yjz.autosave.v1'));
assert.ok(autoNext?.startsWith('YJZENC1:'), '新回合自动档应继续以密文保存');
assert.notEqual(autoNext, autoStart, '新回合应更新随机向量和密文');
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

return '生产构建冒烟通过：标题 → 序章动作 → 自由交谈 → 商店购买并返回 → 关羽确认出征 → 汜水關之戰 → 第 2 回合；' +
  '独立自动档从第 1 回合更新至第 2 回合；21 个音效、10 首 BGM、4 张行军图与 28 张剧情场景图可加载';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { open } = await import('../tools/browser.mjs');
  const base = process.env.BASE ?? 'http://127.0.0.1:5274';
  const { browser, page, errors } = await open(base);
  try {
    console.log(await verifyProduction(page, base));
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
}
