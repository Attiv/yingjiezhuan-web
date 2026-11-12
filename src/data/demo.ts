import type { Level } from '../rules/turn';
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
