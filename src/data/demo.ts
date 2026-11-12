import type { Level } from '../rules/turn';
import type { Actor } from '../scene';
import type { Script } from '../story';

/**
 * 演示用的两场小战斗和一条流程，全部自撰，只在开发模式下用 ?demo 打开。
 * 没有配任何图：用来验证多关卡、队伍继承和占位画法，不依赖美术素材。
 */
const P = 0; // 平原
const F = 1; // 树林
const level = (id: string, name: string, w: number, rows: number[][], units: Level['units']): Level => ({
  id, name, goal: '击破靶子', turnLimit: 10, w, h: rows.length, terrain: rows.flat(), units, lord: 0, boss: 15, reward: 50, triggers: [],
});
const hero = { slot: 0, name: '先锋', face: '先锋', cls: 6, lead: 90, str: 99, int: 50, mode: 7 };
const dummy = { slot: 15, name: '靶子', face: '靶子', cls: 0, level: 1, lead: 30, str: 30, int: 30, mode: 2 };

export const DEMO_LEVELS: Level[] = [
  level('demo1', '演武一', 8, [
    [P, P, P, P, P, P, F, F],
    [P, P, P, P, P, P, P, F],
    [P, P, P, P, P, P, P, P],
    [F, P, P, P, P, P, P, P],
  ], [{ ...hero, level: 30, x: 3, y: 2, items: [27] }, { ...dummy, x: 4, y: 2 }]),
  level('demo2', '演武二', 10, [
    [F, F, P, P, P, P, P, P, P, P],
    [P, P, P, P, P, P, P, P, P, P],
    [P, P, P, P, P, P, P, P, F, F],
    [P, P, P, P, P, P, P, F, F, F],
  ], [
    { ...hero, level: 1, x: 5, y: 1 }, // 关卡数据写的是 1 级：实际出场等级来自上一战
    { slot: 1, name: '援军', face: '援军', cls: 0, level: 3, lead: 50, str: 50, int: 50, mode: 1, x: 5, y: 0 },
    { ...dummy, x: 4, y: 1 },
  ]),
];

export const DEMO: Script = {
  id: 'demo',
  title: '演示',
  steps: [
    { t: 'text', text: '演示流程：两场小战斗，中间一段对话，画面全部是占位图。' },
    { t: 'battle', level: 'demo1' },
    { t: 'say', who: '先锋', text: '第一阵拿下，带着这一战的等级和道具去下一阵。' },
    { t: 'battle', level: 'demo2' },
    { t: 'text', text: '演示结束。' },
  ],
};

/** 演示用的特写演员：6 帧，每帧 64×64。0–1 待机，2–4 出手（第 4 帧命中），5 受击。 */
export const DEMO_ACTOR: Actor = {
  sheet: 'demo-actor', frameWidth: 64, frameHeight: 64,
  anims: { idle: { frames: [0, 1], fps: 3 }, attack: { frames: [2, 3, 4], fps: 8, impact: 2 }, hurt: { frames: [5, 0], fps: 6 } },
};
/** 把上面那 6 帧画出来：一个圆头方身的小人举着一根长杆，朝右。只是为了看得出帧在变。 */
export function drawDemoActor(g: CanvasRenderingContext2D) {
  const pole = [-1.2, -1.05, -1.5, -0.6, 0, -1.2]; // 各帧长杆的角度（弧度，0 = 平举向右）
  pole.forEach((angle, i) => {
    g.save();
    g.translate(i * 64 + 26, 40 + (i === 1 ? 2 : 0));
    if (i === 5) g.rotate(-0.35); // 受击：向后仰
    g.fillStyle = i === 5 ? '#d8562e' : '#d9d2c0';
    g.fillRect(-9, -8, 18, 28);
    g.beginPath();
    g.arc(0, -18, 9, 0, Math.PI * 2);
    g.fill();
    g.rotate(angle);
    g.fillStyle = '#3a3a3a';
    g.fillRect(0, -2, 34 + (i === 4 ? 4 : 0), 4);
    g.restore();
  });
}
