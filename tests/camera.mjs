// 开发服务器启动后运行：CHROME=/path/to/chrome node tests/camera.mjs
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

export async function verifyCamera(page) {
  return page.evaluate(async () => {
    const { scene } = window.__yjz;
    const { CELL } = await import('/src/scene.ts');
    const cam = scene.cameras.main;
    const saved = { b: scene.b, manifest: scene.manifest, speed: scene.speed, follow: scene.isCameraFollowEnabled(), canPan: scene.canPan, scroll: [cam.scrollX, cam.scrollY] };
    const check = (ok, message) => { if (!ok) throw new Error(message); };
    const b = { ...structuredClone(scene.b), level: 'camera-regression', w: 40, h: 30, terrain: Array(1200).fill(0) };
    b.units = [0, 14, 15].map((slot, i) => ({ ...structuredClone(b.units[0]), slot, mode: slot === 0 ? 7 : 1, x: 2 + i, y: 10, on: true }));
    const visible = (u) => {
      const t = scene.tokens.get(u.slot);
      return t.x - CELL / 2 >= cam.scrollX - 1 && t.x + CELL / 2 <= cam.scrollX + cam.width + 1 &&
        t.y - CELL / 2 >= cam.scrollY - 1 && t.y + CELL / 2 <= cam.scrollY + cam.height + 1;
    };
    const position = (u, x, y) => { Object.assign(u, { x, y }); scene.sync(); };
    const checks = [];
    try {
      scene.manifest = {};
      scene.canPan = () => false; // 与实际自动回合一样，演出期间锁定手动卷屏。
      await scene.setBattle(b);
      scene.setCameraFollow(true);
      for (const follow of [true, false]) {
        scene.setCameraFollow(follow);
        scene.setAnimSpeed(1);
        for (const [x, y, dx, dy] of [[12, 5, -1, 0], [0, 5, 1, 0], [6, 0, 0, 1], [6, 11, 0, -1]]) {
          const u = b.units[0];
          position(u, x, y);
          cam.setScroll(0, 0);
          const animation = scene.play({ t: 'move', slot: u.slot, path: [[x, y], [x + dx, y + dy]] });
          await Promise.resolve();
          const started = scene.moving.has(u.slot);
          await animation;
          check(started, `镜头跟随${follow ? '开启' : '关闭'}时，边缘部队(${x},${y})应直接起步，不等待镜头`);
          check(!cam._follow && !scene.autoFollowing, '边缘移动结束必须释放镜头跟随');
        }
        checks.push(`镜头跟随${follow ? '开启' : '关闭'}时四边部队均立即起步`);
      }
      scene.setCameraFollow(true);
      for (const u of b.units.slice(1)) {
        const side = u.slot >= 15 ? '敌军' : '友军';
        scene.setAnimSpeed(0);
        position(u, 2, 10);
        cam.setScroll(0, 0);
        await scene.play({ t: 'move', slot: u.slot, path: [[2, 10], [28, 22]] });
        check(visible(u), `${side}瞬时移动后终点必须可见`);
        check(!cam._follow && !scene.autoFollowing, '瞬时移动结束必须释放镜头跟随');
        checks.push(`${side}瞬时移动终点可见`);

        position(u, 3, 12);
        cam.setScroll(0, 0);
        scene.setAnimSpeed(0.5);
        let frames = 0, missed = 0;
        const sample = () => {
          const t = scene.tokens.get(u.slot);
          if (t.x <= 3.5 * CELL) return;
          frames++;
          if (!visible(u)) missed++;
        };
        scene.game.events.on('postrender', sample);
        try {
          await scene.play({ t: 'move', slot: u.slot, path: Array.from({ length: 18 }, (_, i) => [3 + i, 12]) });
        } finally { scene.game.events.off('postrender', sample); }
        check(frames > 10 && missed === 0, `${side}逐格移动全程可见：${frames}帧，漏出${missed}帧`);
        check(!cam._follow && !scene.autoFollowing, '移动结束必须释放镜头跟随');
        checks.push(`${side}逐格移动全程可见（${frames}帧）`);

        // 守方已在视野内，攻方在左侧视野外；只检查守方会漏掉这次出手。
        scene.setAnimSpeed(0);
        position(u, 9, 12);
        position(b.units[0], 12, 12);
        cam.setScroll(10 * CELL, 6 * CELL);
        await scene.play({ t: 'hit', a: u.slot, d: 0, dmg: 1, morale: 0, counter: false });
        check(visible(u) && visible(b.units[0]), `${side}攻击时双方必须同时入镜`);
        checks.push(`${side}攻击双方同时入镜`);
      }

      const caster = b.units[2];
      position(caster, 30, 23);
      cam.setScroll(0, 0);
      await scene.play({ t: 'castbegin', slot: caster.slot, id: 0 });
      check(visible(caster), '原地施策起势前必须定位施法者');
      checks.push('原地施策先定位施法者');

      scene.setCameraFollow(false);
      for (const u of b.units.slice(1)) {
        const side = u.slot >= 15 ? '敌军' : '友军';
        for (const speed of [0, 0.5]) {
          scene.setAnimSpeed(speed);
          position(u, 3, 12);
          cam.setScroll(0, 0);
          let frames = 0, missed = 0, following = 0;
          const sample = () => {
            const t = scene.tokens.get(u.slot);
            if (t.x <= 3.5 * CELL) return;
            frames++;
            if (!visible(u)) missed++;
            if (cam._follow || scene.autoFollowing) following++;
          };
          scene.game.events.on('postrender', sample);
          try {
            await scene.play({ t: 'move', slot: u.slot, path: Array.from({ length: 18 }, (_, i) => [3 + i, 12]) });
          } finally { scene.game.events.off('postrender', sample); }
          check(visible(u), `关闭跟随后${side}移动终点仍须可见，速度${speed}`);
          check(!speed || (frames > 10 && missed === 0), `关闭跟随后${side}逐格移动全程可见：${frames}帧，漏出${missed}帧`);
          check(following === 0 && !cam._follow && !scene.autoFollowing, '关闭跟随时只切镜头，不启动持续跟随');
          checks.push(`关闭跟随后${side}${speed ? '逐格' : '瞬时'}移动仍切镜入画`);

          position(u, 25, 20);
          position(b.units[0], 28, 20);
          cam.setScroll(0, 0);
          let impactVisible = false;
          await scene.play({ t: 'hit', a: u.slot, d: 0, dmg: 1, morale: 0, counter: false }, () => {
            impactVisible = visible(u) && visible(b.units[0]);
          });
          check(impactVisible, `关闭跟随后${side}攻击仍须把双方切入视野，速度${speed}`);
          check(!scene.isCameraFollowEnabled(), '行动切镜不能重新打开镜头跟随设置');
          checks.push(`关闭跟随后${side}攻击双方仍入镜（速度${speed}）`);
        }
      }

      scene.setCameraFollow(true);
      b.w = 8; b.h = 6;
      cam.setBounds(0, 0, b.w * CELL, b.h * CELL);
      scene.setAnimSpeed(0);
      await scene.focus(7, 5, true);
      check(cam.scrollX === 0 && cam.scrollY === 0, '小于视野的地图定位不产生负卷动');
      checks.push('小地图镜头边界正确');
      return checks;
    } finally {
      scene.manifest = saved.manifest;
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
    for (const check of await verifyCamera(page)) console.log('✓', check);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
}
