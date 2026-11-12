import T from '../data/tables.json';
import type { Battle, Unit } from './types';

export const TB = T;

/** 原版整数除法：向零截断。 */
export const idiv = (a: number, b: number) => Math.trunc(a / b);
const u16 = (v: number) => v & 0xffff;

/** 原版随机数：ANSI C 线性同余，取高 15 位再取模；上界为 0 时不推进状态。 */
export function rand(b: { rng: number }, bound: number): number {
  if (bound <= 0) return 0;
  b.rng = (Math.imul(b.rng, 0x41c64e6d) + 0x3039) >>> 0;
  return ((b.rng >>> 16) & 0x7fff) % bound;
}

export const friendly = (slot: number) => slot < 15;
export const foes = (a: Unit, b: Unit) => friendly(a.slot) !== friendly(b.slot);
export const inside = (b: Battle, x: number, y: number) => x >= 0 && y >= 0 && x < b.w && y < b.h;
export const unitAt = (b: Battle, x: number, y: number) => b.units.find((u) => u.on && u.x === x && u.y === y);
export const bySlot = (b: Battle, slot: number) => b.units.find((u) => u.slot === slot);
export const terrainAt = (b: Battle, x: number, y: number) => (inside(b, x, y) ? b.terrain[y * b.w + x] : 255);

/** 同类宝物只取效果最大的一件，不叠加。类别：0 武器(攻%)，4 马(移动)，5 兵书(防%)。 */
export function bestItem(u: Unit, category: number): number {
  let best = 0;
  for (const id of u.items) {
    const it = TB.items[id];
    if (it && it.category === category) best = Math.max(best, it.value);
  }
  return best;
}
export const itemName = (id: number) => TB.items[id]?.name ?? `道具${id}`;

/** 攻击力 / 防御力：(兵种系数×2 + 士气 + 4000÷(140−能力)) × (等级+10) ÷ 10，再加宝物百分比。 */
export function stat(u: Unit, attack: boolean): number {
  const base = (attack ? TB.attackBase : TB.defenseBase)[u.cls];
  const q = idiv(4000, 140 - (attack ? u.str : u.lead));
  let r = idiv((base * 2 + u.morale + q) * (u.level + 10), 10);
  r += idiv(r * bestItem(u, attack ? 0 : 5), 100);
  return u16(Math.max(1, r));
}
export const atk = (u: Unit) => stat(u, true);
export const def = (u: Unit) => stat(u, false);

export const maxHp = (cls: number, level: number) =>
  u16(u16(10 * TB.troopBase[cls] + TB.troopGrowth[cls] * (level - 1)) * 10);

export function maxMp(u: Unit): number {
  const q = idiv(u16((u.level + 10) * 5 * u.int), 200);
  return (q > 256 ? 255 : q) & 0xff;
}

export const moveBudget = (u: Unit) => (TB.move[u.cls] + bestItem(u, 4)) & 0xff;

/** 进入某地形的移动消耗，255 = 不能进入。 */
export const moveCost = (cls: number, terrain: number) =>
  terrain < TB.terrainDef.length ? TB.moveCost[TB.moveType[cls]][terrain] : 255;

export const terrainDef = (terrain: number) => (terrain < TB.terrainDef.length ? TB.terrainDef[terrain] : 255);

/**
 * 范围码展开成格子，顺序即原版顺序（AI 选目标时同分取先、执行时兜底取最后一个都依赖它）。
 * 兵种攻击范围：0 上下左右，1 周围 8 格，2 弓兵，3 连弩，4 发石车，255 无。
 * 策略把范围码加上 0x80：多一圈，并且总包含上下左右。
 */
export function rangeCells(b: Battle, x: number, y: number, raw: number): [number, number][] {
  if (raw === 255) return [];
  const ext = (raw & 128) !== 0;
  const r = (raw & 127) + (ext ? 1 : 0);
  const o: number[][] = [];
  if (r <= 1 || ext) o.push(...TB.cardinal);
  if (r >= 1) o.push(...TB.diagonal);
  if (r === 2) o.push(...TB.extended.map(([dx, dy]) => [dx * 2, dy * 2]));
  if (r >= 3) {
    for (let i = -1; i <= 1; i++) o.push([i, -2], [i, 2]);
    for (let i = -1; i <= 1; i++) o.push([2, i], [-2, i]);
  }
  if (r === 4) {
    o.push(...TB.extended.map(([dx, dy]) => [dx * 3, dy * 3]));
    o.push(...TB.diagonal.map(([dx, dy]) => [dx * 2, dy * 2]));
  }
  return o.map(([dx, dy]) => [x + dx, y + dy] as [number, number]).filter(([cx, cy]) => inside(b, cx, cy));
}

/** 普通攻击能打到的敌军（按原版范围顺序）。 */
export function attackTargets(b: Battle, u: Unit, x = u.x, y = u.y): Unit[] {
  const out: Unit[] = [];
  for (const [cx, cy] of rangeCells(b, x, y, TB.range[u.cls])) {
    const t = unitAt(b, cx, cy);
    if (t && foes(u, t)) out.push(t);
  }
  return out;
}

/** 该部队当前等级已学会的策略 ID（升序）。 */
export function knownStrategies(u: Unit): number[] {
  const out: number[] = [];
  for (let id = 0; id < 36; id++) {
    if (TB.strategyLevel[id][u.cls] <= u.level) out.push(id); // 255 = 学不会
  }
  return out;
}

export const weatherName = (w: number) => ['晴', '阴', '雨'][TB.weatherEnv[w] ?? 0];
export const isRain = (w: number) => TB.weatherEnv[w] === 2;
