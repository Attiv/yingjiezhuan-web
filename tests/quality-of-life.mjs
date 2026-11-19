// 启动开发服务器后运行：CHROME=/path/to/chrome node tests/quality-of-life.mjs
import assert from 'node:assert/strict';
import { open } from '../tools/browser.mjs';

const { browser, page, errors } = await open(process.env.BASE ?? 'http://127.0.0.1:5273/?seed=3&fast');
const slots = () => page.evaluate(() => localStorage.getItem('yjz.saves.v1'));
const auto = () => page.evaluate(() => localStorage.getItem('yjz.autosave.v1'));
const notice = () => page.textContent('#save-notice');
async function advance(stop) {
  for (let i = 0; i < 800; i++) {
    if (await stop()) return;
    const s = await page.evaluate(() => ({
      chapter: !!document.querySelector('#screen .chapter'), ask: !!document.querySelector('#talk:not([hidden]) .ask'),
      talk: !document.getElementById('talk').hidden, room: !!document.querySelector('.room-controls'),
      camp: !!document.querySelector('[data-go="camp-go"]'), deploy: !!document.querySelector('[data-go="deploy"]'),
      battle: !!document.querySelector('[data-go="battle"]'),
    }));
    if (s.chapter) await page.click('#screen');
    else if (s.ask) await page.click('#talk .ask button:first-child');
    else if (s.talk) await page.click('#talk');
    else if (s.room) await page.click('.actor[data-who="1"]');
    else if (s.camp) await page.click('[data-go="camp-go"]');
    else if (s.deploy) await page.click('[data-go="deploy"]');
    else if (s.battle) { await page.click('[data-go="auto"]'); await page.click('[data-go="battle"]'); }
    else await page.waitForTimeout(20);
  }
  throw new Error('流程未到达预期画面');
}
async function clickCell(x, y) {
  const p = await page.evaluate(async ([x, y]) => {
    const { scene } = window.__yjz;
    await scene.focus(x, y, true);
    const c = scene.cameras.main, r = scene.game.canvas.getBoundingClientRect();
    return { x: r.left + ((x + .5) * 96 - c.scrollX) * r.width / c.width,
      y: r.top + ((y + .5) * 96 - c.scrollY) * r.height / c.height };
  }, [x, y]);
  await page.mouse.click(p.x, p.y);
}
try {
  await page.waitForSelector('[data-go="start"]');
  await page.click('[data-go="start"]');
  await advance(() => page.$('.room-controls'));
  await page.keyboard.press('s');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('yjz.saves.v1'))?.slots[0]);
  let list = JSON.parse(await slots());
  assert.equal(list.last, 0);
  assert.ok(list.slots[0].storyStage && !list.slots[0].battle);
  assert.match(await notice(), /已快速存入[档檔]一/);
  assert.equal(await page.isVisible('#save-notice'), true);
  await page.screenshot({ path: '/tmp/yjz-quick-save-desktop.png' });
  await page.waitForFunction(() => document.getElementById('save-notice').hidden);
  console.log('✓ 自由房间按S保存档一并弹提示，提示自动消失');

  const beforeTyping = await slots();
  await page.evaluate(() => {
    for (const init of [{ repeat: true }, { ctrlKey: true }, { metaKey: true }, { altKey: true }, { isComposing: true }]) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true, ...init }));
    }
    const input = document.createElement('input'); input.id = 'test-typing'; document.getElementById('stage').append(input); input.focus();
  });
  await page.keyboard.type('s');
  assert.equal(await page.inputValue('#test-typing'), 's');
  assert.equal(await slots(), beforeTyping);
  await page.evaluate(() => document.getElementById('test-typing').remove());
  console.log('✓ 输入文字、长按重复、组合键和输入法组合过程不触发快速存档');

  const drag = await page.evaluate(() => {
    const image = document.querySelector('#screen img');
    const event = new DragEvent('dragstart', { bubbles: true, cancelable: true });
    image.dispatchEvent(event);
    window.__imageDrags = 0;
    document.addEventListener('dragstart', () => { window.__imageDrags++; });
    return { canceled: event.defaultPrevented, style: getComputedStyle(image).getPropertyValue('-webkit-user-drag') };
  });
  assert.equal(drag.canceled, true);
  assert.equal(drag.style, 'none');
  const backdrop = await page.$eval('#screen img', el => { const r = el.getBoundingClientRect(); return { x: r.left + 30, y: r.top + 30 }; });
  await page.mouse.move(backdrop.x, backdrop.y);
  await page.mouse.down(); await page.waitForTimeout(450);
  await page.mouse.move(backdrop.x + 70, backdrop.y + 35, { steps: 5 }); await page.mouse.up();
  assert.equal(await page.evaluate(() => window.__imageDrags), 0);
  assert.ok(await page.$('.room-controls'));
  console.log('✓ 剧情地图真实长按拖动不生成图片拖拽，房间交互保留');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.keyboard.press('S');
  const r = await page.$eval('#save-notice', el => el.getBoundingClientRect().toJSON());
  assert.ok(r.left >= 0 && r.right <= 390 && r.top >= 0);
  await page.screenshot({ path: '/tmp/yjz-quick-save-mobile.png' });
  await page.setViewportSize({ width: 1280, height: 960 });
  console.log('✓ 大写S同样保存，窄屏提示位于可见范围内');

  await advance(() => page.evaluate(() => window.__yjz.mode === 'idle'));
  const autoBefore = await auto();
  await page.evaluate(() => {
    const list = JSON.parse(localStorage.getItem('yjz.saves.v1'));
    list.slots[1] = { ...list.slots[0], at: 1 };
    localStorage.setItem('yjz.saves.v1', JSON.stringify(list));
  });
  const secondSlot = JSON.parse(await slots()).slots[1];
  await page.keyboard.press('s');
  list = JSON.parse(await slots());
  assert.equal(list.last, 0);
  assert.equal(list.slots[0].battle.round, 1);
  assert.deepEqual(list.slots[1], secondSlot);
  assert.equal(await auto(), autoBefore);
  console.log('✓ 战场S覆盖档一、保存完整战况，档二及自动档保持原样');

  const walk = await page.evaluate(async () => {
    const { reachField, canStop } = await import('/src/rules/move.ts');
    const b = window.__yjz.b, u = b.units.find(u => u.on && u.mode === 7);
    const f = reachField(b, u);
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
      if ((x !== u.x || y !== u.y) && canStop(b, u, f, x, y)) return { from: [u.x, u.y], to: [x, y], slot: u.slot };
    }
  });
  await clickCell(...walk.from); await clickCell(...walk.to);
  await page.waitForFunction(() => window.__yjz.mode === 'menu');
  const beforeMoveSave = await slots();
  await page.keyboard.press('s');
  assert.equal(await slots(), beforeMoveSave);
  assert.match(await notice(), /暂不可存档/);
  await page.keyboard.press('Escape');
  const restored = await page.evaluate(slot => window.__yjz.b.units.find(u => u.slot === slot), walk.slot);
  assert.equal(restored.moved, false);
  console.log('✓ 移动未确认时S不覆盖存档，取消后恢复移动资格');

  const unitChecks = await page.evaluate(async () => {
    const { scene } = window.__yjz, original = scene.b, speed = scene.speed;
    const cam = scene.cameras.main, scroll = [cam.scrollX, cam.scrollY];
    const b = { ...structuredClone(original), w: 40, h: 30, terrain: Array(1200).fill(0), stage: 'player' };
    b.units = [0, 1, 2, 3, 4, 14, 15].map((slot, i) => ({ ...structuredClone(original.units[0]),
      slot, mode: slot < 14 ? 7 : 1, x: 3 + 4 * i, y: 8, on: true,
      moved: [1, 4, 14, 15].includes(slot), acted: [2, 4].includes(slot), confused: slot === 3 }));
    const mini = document.createElement('canvas');
    const sampleColors = () => {
      scene.drawMinimap(mini);
      return b.units.map(u => [...mini.getContext('2d').getImageData(u.x * 4 + 2, u.y * 4 + 2, 1, 1).data].slice(0, 3));
    };
    const frames = async () => {
      const seen = b.units.map(() => new Set());
      const sample = () => b.units.forEach((u, i) => seen[i].add(Number(scene.tokens.get(u.slot).frame.name)));
      scene.game.events.on('postrender', sample);
      try { await new Promise(done => setTimeout(done, 950)); }
      finally { scene.game.events.off('postrender', sample); }
      return seen.map(s => s.size);
    };
    try {
      await scene.setBattle(b); scene.setAnimSpeed(1); cam.setScroll(27 * 96, 18 * 96);
      const before = { colors: sampleColors(), frames: await frames() };
      b.units.forEach(u => { u.moved = u.acted = u.confused = false; }); scene.sync();
      const after = { colors: sampleColors(), frames: await frames() };
      return { before, after };
    } finally { await scene.setBattle(original); scene.setAnimSpeed(speed); cam.setScroll(...scroll); }
  });
  assert.deepEqual(unitChecks.before.colors[0], [138, 207, 255]);
  for (let i = 1; i < 7; i++) {
    assert.deepEqual(unitChecks.before.colors[i], [140, 140, 140]);
    assert.equal(unitChecks.before.frames[i], 1, `单位${i}停用呼吸`);
  }
  assert.ok(unitChecks.before.frames[0] >= 2);
  assert.ok(unitChecks.after.frames.every(n => n >= 2));
  assert.deepEqual(unitChecks.after.colors.slice(-2), [[0, 186, 117], [239, 101, 0]]);
  console.log('✓ 移动过、待命、混乱和行动完毕的三方单位小地图标灰且停止呼吸');
  console.log('✓ 恢复移动资格后三方阵营色与呼吸帧一起恢复');
  assert.deepEqual(errors, []);
  console.log('✓ 浏览器无运行错误');
} finally { await browser.close(); }
