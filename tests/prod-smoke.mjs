// 生产构建冒烟：先 npm run build && npm run preview -- --port 5274，再 node tests/prod-smoke.mjs
// 生产包里没有调试钩子，所以这里只用画面上看得见的东西判断。
import assert from 'node:assert/strict';
import { open } from '../tools/browser.mjs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5274';
const { browser, page, errors } = await open(`${BASE}/?seed=3`);
await page.waitForSelector('#screen button');
assert.equal(await page.evaluate(() => typeof window.__yjz), 'undefined', '生产包不应带调试钩子');
await page.click('button:has-text("开始新游戏")');
// 点完开场剧情：有选项点第一项，没有就点对话框，直到出现战前说明
while (!(await page.$('button:has-text("出阵")'))) await page.click((await page.$('#talk .ask button')) ? '#talk .ask button:first-child' : '#talk');
await page.click('button:has-text("出阵")');
await page.waitForFunction(() => document.getElementById('log').textContent.includes('目标'));
assert.match(await page.textContent('#turn'), /第1回合/);
// 点击刘备所在格：开局镜头尽量以他为中心，地图东缘卡住后他落在视窗 (240,192) 处
const r = await page.evaluate(() => { const c = document.querySelector('#map canvas').getBoundingClientRect(); return { x: c.left + (c.width * 240) / 416, y: c.top + c.height / 2 }; });
await page.mouse.click(r.x, r.y);
await page.waitForFunction(() => document.getElementById('unit').textContent.includes('刘备'));
await page.keyboard.press('Escape');
await page.click('#sys button:has-text("回合结束")');
await page.click('#talk .ask button:first-child');
await page.waitForFunction(() => document.getElementById('turn').textContent.includes('第2回合'), null, { timeout: 60000 });
await page.screenshot({ path: new URL('../docs/screenshots/13-production-build.png', import.meta.url).pathname });
assert.deepEqual(errors, []);
console.log('生产构建冒烟通过：进入战斗、选中刘备、结束回合后进入第 2 回合，控制台无报错');
await browser.close();
