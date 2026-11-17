import type { Unit } from './rules/types';

/** 原版 HEXZCHR 完整47列。41/42为火水特效，43/44为混乱状态，不作为兵种。 */
export const TOKEN_COLUMNS = 47;
type TokenUnit = Pick<Unit, 'name' | 'cls' | 'slot'> & Pick<Partial<Unit>, 'key'>;
const LEGACY_KEYS: Record<string, string> = {
  '劉備': 'liu_bei', '刘备': 'liu_bei', '呂布': 'lu_bu', '吕布': 'lu_bu', '曹操': 'cao_cao',
};

/** 编号逐像素对照 original/pack/gfx/units/units.toml 及 HEXZCHR 原图。 */
export function tokenColumn(u: TokenUnit): number {
  const key = u.key ?? LEGACY_KEYS[u.name];
  if (key === 'lu_bu') return 45;
  if (key === 'cao_cao') return 46;
  if (key === 'liu_bei' && u.cls >= 0 && u.cls <= 2) return 38 + u.cls;
  return u.cls * 2 + (u.slot >= 15 ? 1 : 0);
}
