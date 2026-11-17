/**
 * 修改器（作弊面板）的纯逻辑：密码、数值范围、一键装备、战场同步。
 * 界面在 main.ts，这一层不碰 DOM，单测直接调。
 */
import { specOf } from './data/items';
import { maxHp, maxMp } from './rules/core';
import type { Roster, Unit } from './rules/types';

/** 左上角连点三下后要输入的密码。 */
export const TRAINER_PASSWORD = '1122';

export type EquipSlot = 'weapon' | 'armor' | 'horse';
export const EQUIP_SLOTS: EquipSlot[] = ['weapon', 'armor', 'horse'];

/** 一键装备兜底的最强三件：霸者劍、孫子兵法、赤兎馬（包袱里没有时才发）。 */
export const BEST_OF: Record<EquipSlot, number> = { weapon: 59, armor: 3, horse: 7 };

/** 一键装备顺带补齐的宝物：玉璽（每回合 +10 兵力 +10 士气）。宝物不占三个装备位，可与兵器铠甲马同带。 */
export const BEST_TREASURE = 8;

/** 这件道具算哪个装备位。马是原版的「移动力加成」类饰品（玉璽、勅命書不算）。 */
export function slotOf(id: number): EquipSlot | 'other' {
  const s = specOf(id);
  if (!s) return 'other';
  if (s.kind === 'weapon') return 'weapon';
  if (s.kind === 'armor') return 'armor';
  if (s.kind === 'accessory' && s.move > 0) return 'horse';
  return 'other';
}

/** 同类装备的比较值：兵器比攻击、防具比防御、马比移动。 */
export function equipScore(id: number): number {
  const s = specOf(id);
  if (!s) return 0;
  switch (slotOf(id)) {
    case 'weapon': return s.atk;
    case 'armor': return s.def;
    case 'horse': return s.move;
    default: return 0;
  }
}

export const clampLevel = (n: number) => Math.max(1, Math.min(99, Math.round(Number.isFinite(n) ? n : 1)));
export const clampExp = (n: number) => Math.max(0, Math.min(99, Math.round(Number.isFinite(n) ? n : 0)));
export const clampGold = (n: number) => Math.max(0, Math.min(9_999_999, Math.floor(Number.isFinite(n) ? n : 0)));

/** 包袱里该部位最好的一件；没有返回 -1。 */
export function bestInBag(bag: number[], slot: EquipSlot): number {
  let at = -1;
  let best = -1;
  bag.forEach((id, i) => {
    if (slotOf(id) !== slot) return;
    const score = equipScore(id);
    if (score > best) {
      best = score;
      at = i;
    }
  });
  return at;
}

/**
 * 一键装备：身上每个部位留最好的一件，其余装备放回包袱；
 * 再从包袱里挑更好的换上，包袱里没有这一部位就发最强的那件；
 * 顺带补齐玉璽（只留一件，多出来的回包袱）。
 * 已经穿着最好的装备时不会重复发（连点两次不会刷出一堆霸者劍）。
 */
export function equipBest(items: number[], bag: number[]): number[] {
  const keep: number[] = [];
  const worn: Partial<Record<EquipSlot, number>> = {};
  let seal = false;
  for (const id of items) {
    if (id === BEST_TREASURE) {
      if (seal) bag.push(id); // 多的玉璽回包袱，留着给别人
      seal = true;
      continue;
    }
    const slot = slotOf(id);
    if (slot === 'other') {
      keep.push(id);
      continue;
    }
    const cur = worn[slot];
    if (cur === undefined || equipScore(id) > equipScore(cur)) {
      if (cur !== undefined) bag.push(cur);
      worn[slot] = id;
    } else {
      bag.push(id);
    }
  }
  for (const slot of EQUIP_SLOTS) {
    const at = bestInBag(bag, slot);
    const fromBag = at >= 0 ? equipScore(bag[at]) : -1;
    const now = worn[slot] === undefined ? -1 : equipScore(worn[slot]!);
    if (now >= fromBag && now >= 0) continue;
    if (at >= 0) {
      if (worn[slot] !== undefined) bag.push(worn[slot]!); // 换下来的旧装备回包袱
      worn[slot] = bag.splice(at, 1)[0];
    } else {
      worn[slot] = BEST_OF[slot];
    }
  }
  // 玉璽不占装备位：包袱里有就拿来，没有就发一件（同一件宝物只带一次）
  if (!seal) {
    const at = bag.indexOf(BEST_TREASURE);
    if (at >= 0) bag.splice(at, 1);
  }
  return [...keep, ...EQUIP_SLOTS.map((s) => worn[s]).filter((v): v is number => v !== undefined), BEST_TREASURE];
}

/** 往包袱里塞 n 个同类道具（1–99）。 */
export function giveItem(bag: number[], id: number, n = 1): void {
  const k = Math.max(1, Math.min(99, Math.floor(n) || 1));
  for (let i = 0; i < k; i++) bag.push(id);
}

/**
 * 把修改后的成长同步到战场上这支部队：等级、兵种、经验、道具，
 * 兵力与策略值按新的上限补满（修改器不讲究「慢慢养」）。
 */
export function syncUnit(u: Unit, r: Roster[string]): void {
  u.level = r.level;
  u.exp = r.exp;
  if (r.cls !== undefined) u.cls = r.cls;
  u.items = [...r.items];
  u.hp = maxHp(u.cls, u.level);
  u.mp = maxMp(u);
}
