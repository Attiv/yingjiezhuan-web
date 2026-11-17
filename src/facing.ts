import { foes } from './rules/core';
import type { Battle, Unit } from './rules/types';

/** 移动后保留最后朝向；旧档 / 开局缺省时面向在场敌军，正好同列时按阵营。 */
export function facesLeft(b: Battle, u: Unit): boolean {
  if (u.facingLeft !== undefined) return u.facingLeft;
  const xs = b.units.filter((v) => v.on && foes(u, v)).map((v) => v.x);
  const dx = xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length - u.x : 0;
  return dx ? dx < 0 : u.slot >= 15;
}
