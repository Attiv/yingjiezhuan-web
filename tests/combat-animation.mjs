// 开发服务器启动后运行：CHROME=/path/to/chrome node tests/combat-animation.mjs
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

export async function verifyCombatAnimation(page) {
  return page.evaluate(async () => {
    const { scene } = window.__yjz;
    const cam = scene.cameras.main;
    const saved = { b: scene.b, speed: scene.speed, follow: scene.isCameraFollowEnabled(), canPan: scene.canPan, scroll: [cam.scrollX, cam.scrollY] };
    const b = { ...structuredClone(scene.b), level: 'combat-animation-regression' };
    b.units = [0, 15].map((slot, i) => ({ ...b.units[0], slot, x: 5 + i, y: 5, on: true }));
    const checks = [];
    try {
      scene.canPan = () => false;
      await scene.setBattle(b);
      scene.setAnimSpeed(0.15);
      for (const [attackerHp, defenderHp, damage, expected] of [
        [599, 600, 1, [1, 2]],
        [1199, 1200, 1, [2, 3]],
        [1799, 1800, 1, [3, 4]],
        [2399, 2400, 1, [4, 5]],
        [9999, 1, 1, [5, 1]],
      ]) {
        b.units[0].hp = attackerHp;
        b.units[1].hp = defenderHp;
        scene.sync();
        let impactCounts, impactCenter;
        const counts = () => {
          const box = scene.children.list.find(child => child.type === 'Container' && child.depth === 20);
          return box?.list.filter(child => child.type === 'Container').map(group => group.list.length) ?? [];
        };
        const animation = scene.play({ t: 'hit', a: 0, d: 15, dmg: damage, morale: 0, counter: false }, () => {
          impactCounts = counts();
          const box = scene.children.list.find(child => child.type === 'Container' && child.depth === 20);
          impactCenter = box.y + box.list[0].displayHeight / 2;
        });
        await Promise.resolve();
        const initialCounts = counts();
        await animation;
        if (impactCenter !== cam.height / 2) throw new Error('交战特写应在战场画面垂直居中');
        const check = (actual, moment) => {
          if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(
            `${attackerHp}/${defenderHp}兵${moment}应显示${expected}人，实际${JSON.stringify(actual)}`);
        };
        check(initialCounts, '交手前');
        check(impactCounts, '命中时');
        if (scene.children.list.some(child => child.type === 'Container' && child.depth === 20)) throw new Error('特写结束必须销毁双方队形');
        checks.push(`${attackerHp}/${defenderHp}兵显示${expected.join('/')}人，命中与击破不改变本次人数`);
      }
      return checks;
    } finally {
      scene.setAnimSpeed(saved.speed);
      scene.setCameraFollow(saved.follow);
      scene.canPan = saved.canPan;
      await scene.setBattle(saved.b);
      cam.setScroll(...saved.scroll);
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { open } = await import('../tools/browser.mjs');
  const { browser, page, errors } = await open(process.env.BASE ?? 'http://127.0.0.1:5273/?fast');
  try {
    await page.waitForFunction(() => window.__yjz?.scene?.tokens?.size > 0);
    for (const check of await verifyCombatAnimation(page)) console.log('✓', check);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
}
