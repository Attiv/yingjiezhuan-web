import { TB, foes, friendly, inside, moveBudget, moveCost, unitAt } from './core';
import type { Battle, Unit } from './types';

export interface Field {
  dist: Uint8Array; // 255 = 未到达
  order: number[]; // 赋值顺序（格子下标），首个是起点
  stopped: boolean; // 是否因到达 stop 格而提前结束
}

/** 该格四邻是否有敌对部队（原版的「停止格」判定）。 */
export function hostileAdjacent(b: Battle, u: Unit, x: number, y: number): boolean {
  return TB.cardinal.some(([dx, dy]) => {
    const o = unitAt(b, x + dx, y + dy);
    return !!o && friendly(o.slot) !== friendly(u.slot);
  });
}

/**
 * 原版的距离层扫描（不是最短路）：按「当前层」逐行逐列扫格子，向上右下左扩散，
 * 每格只在第一次被碰到时赋值；下一层取本轮新赋值里的最小值，本轮没有新赋值就结束。
 * 所以难易地形混杂时会出现走不满移动力的「受限格」，这是原版行为，照搬不修。
 * 敌军格不可进入；友军格可穿过；除起点外，贴着敌军的格不再向外扩散。
 */
export function field(b: Battle, u: Unit, sx: number, sy: number, limit: number, stop = -1, ignoreZoc = false): Field {
  const dist = new Uint8Array(b.w * b.h).fill(255);
  const seed = sy * b.w + sx;
  const order = [seed];
  dist[seed] = 0;
  if (moveCost(u.cls, b.terrain[seed]) === 255) return { dist, order, stopped: false };
  let level = 0;
  while (level < limit) {
    let changed = false;
    let next = 255;
    for (let y = 0; y < b.h; y++) {
      for (let x = 0; x < b.w; x++) {
        const cur = y * b.w + x;
        if (dist[cur] !== level) continue;
        if (cur !== seed && !ignoreZoc && hostileAdjacent(b, u, x, y)) continue;
        for (const [dx, dy] of TB.cardinal) {
          const nx = x + dx;
          const ny = y + dy;
          if (!inside(b, nx, ny)) continue;
          const n = ny * b.w + nx;
          if (dist[n] !== 255) continue;
          const c = moveCost(u.cls, b.terrain[n]);
          if (c === 255 || level + c > limit) continue;
          const o = unitAt(b, nx, ny);
          if (o && foes(o, u)) continue;
          dist[n] = level + c;
          order.push(n);
          changed = true;
          next = Math.min(next, level + c);
          if (n === stop) return { dist, order, stopped: true };
        }
      }
    }
    if (!changed) break;
    level = next;
  }
  return { dist, order, stopped: false };
}

/**
 * 原版的回溯：从 from 出发，每步在四邻里挑距离值最小且严格更小的那个（同值取方向顺序靠前的），
 * 途中跳过贴着敌军的格（终点除外），直到走到 toward 或走不动。
 */
export function trace(b: Battle, u: Unit, f: Field, from: number, toward: number, budget = 255) {
  const path = [from];
  let cur = from;
  let left = budget;
  while (cur !== toward) {
    let best = -1;
    let bestD = f.dist[cur];
    let bestC = 0;
    const x = cur % b.w;
    const y = (cur - x) / b.w;
    for (const [dx, dy] of TB.cardinal) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inside(b, nx, ny)) continue;
      const n = ny * b.w + nx;
      if (n !== toward && hostileAdjacent(b, u, nx, ny)) continue;
      if (f.dist[n] >= bestD) continue;
      const c = moveCost(u.cls, b.terrain[n]);
      if (c > left) continue;
      best = n;
      bestD = f.dist[n];
      bestC = c;
    }
    if (best < 0) return { path, complete: false };
    cur = best;
    left -= bestC;
    path.push(cur);
  }
  return { path, complete: true };
}

/** 部队本回合的可达范围。 */
export const reachField = (b: Battle, u: Unit) => field(b, u, u.x, u.y, u.confused ? 0 : moveBudget(u));

/** 能停下的格子：在范围内，且没有别的部队（自己脚下算）。 */
export function canStop(b: Battle, u: Unit, f: Field, x: number, y: number): boolean {
  if (!inside(b, x, y) || f.dist[y * b.w + x] === 255) return false;
  const o = unitAt(b, x, y);
  return !o || o === u;
}

/** 从部队当前位置到目标格的行走路径（含起点）；走不到返回 null。 */
export function route(b: Battle, u: Unit, f: Field, x: number, y: number): [number, number][] | null {
  const from = u.y * b.w + u.x;
  const to = y * b.w + x;
  if (to === from) return [[u.x, u.y]];
  if (f.dist[to] === 255) return null;
  const t = trace(b, u, f, to, from);
  if (!t.complete) return null;
  return t.path.reverse().map((i) => [i % b.w, Math.floor(i / b.w)] as [number, number]);
}
