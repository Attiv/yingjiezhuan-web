import { foes } from './rules/core';
import type { Battle, Unit } from './rules/types';

/** 部队是否朝左：面向在场敌方的重心。正好同列或敌方已不在场时按阵营，敌军朝左。 */
export function facesLeft(b: Battle, u: Unit): boolean {
  const xs = b.units.filter((v) => v.on && foes(u, v)).map((v) => v.x);
  const dx = xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length - u.x : 0;
  return dx ? dx < 0 : u.slot >= 15;
}
