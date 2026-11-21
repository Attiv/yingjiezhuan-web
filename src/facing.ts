import { foes } from './rules/core';
import type { Battle, Unit } from './rules/types';

/** 出手时优先面向目标，同列保留朝向；旧档 / 开局缺省时面向在场敌军。 */
export function facesLeft(b: Battle, u: Unit, target?: Unit): boolean {
  if (target && target.x !== u.x) return target.x < u.x;
  if (u.facingLeft !== undefined) return u.facingLeft;
  const xs = b.units.filter((v) => v.on && foes(u, v)).map((v) => v.x);
  const dx = xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length - u.x : 0;
  return dx ? dx < 0 : u.slot >= 15;
}
