import { describe, expect, it } from 'vitest';
import { ITEM_SPEC } from '../src/data/items';
import { level, officers } from '../src/data/game';
import { newBattle } from '../src/rules/turn';
import type { Roster } from '../src/rules/types';
import {
  BEST_OF, EQUIP_SLOTS, TRAINER_PASSWORD, bestInBag, clampExp, clampGold, clampLevel,
  equipBest, equipScore, giveItem, slotOf, syncUnit,
} from '../src/trainer';

/**
 * 修改器的纯逻辑：密码、范围、装备位分类、一键装备与战场同步。
 * 界面（左上角三下、密码框、面板）在 `src/main.ts`，由 e2e 覆盖。
 */

const roster = (): Roster => {
  const r: Roster = {};
  for (const [id, o] of Object.entries(officers)) r[id] = { level: o.level, exp: 0, items: [] };
  return r;
};

describe('修改器', () => {
  it('密码是 1122，数值都有上下限', () => {
    expect(TRAINER_PASSWORD).toBe('1122');
    expect([clampLevel(0), clampLevel(3.6), clampLevel(999)]).toEqual([1, 4, 99]);
    expect([clampExp(-5), clampExp(120), clampExp(Number.NaN)]).toEqual([0, 99, 0]);
    expect([clampGold(-1), clampGold(1234.9), clampGold(1e12)]).toEqual([0, 1234, 9_999_999]);
  });

  it('装备位分类：兵器 / 防具 / 马 / 其他', () => {
    expect(slotOf(59)).toBe('weapon'); // 霸者劍
    expect(slotOf(3)).toBe('armor'); // 孫子兵法
    expect(slotOf(7)).toBe('horse'); // 赤兎馬
    expect(slotOf(8)).toBe('other'); // 玉璽：不加移动，不算马
    expect(slotOf(30)).toBe('other'); // 豆
    // 道具表里每一件武器 / 防具都能归位
    for (const [id, s] of Object.entries(ITEM_SPEC)) {
      if (s.kind === 'weapon') expect(slotOf(Number(id)), `${s.name} 应是兵器`).toBe('weapon');
      if (s.kind === 'armor') expect(slotOf(Number(id)), `${s.name} 应是防具`).toBe('armor');
    }
  });

  it('同类装备按效果比较：兵器比攻击、防具比防御、马比移动', () => {
    expect(equipScore(59)).toBeGreaterThan(equipScore(9)); // 霸者劍 24 > 倚天劍 14
    expect(equipScore(3)).toBeGreaterThan(equipScore(60)); // 孫子兵法 22 > 六韜 15
    expect(equipScore(7)).toBeGreaterThan(equipScore(6)); // 赤兎馬 3 > 的盧 2
    expect(equipScore(8)).toBe(0);
  });

  it('一键装备：包袱空时发最强三件，手里的消耗品与玉璽留着', () => {
    const bag: number[] = [];
    const items = equipBest([30, 8], bag); // 豆、玉璽
    expect(items).toContain(30);
    expect(items).toContain(8);
    for (const slot of EQUIP_SLOTS) expect(items).toContain(BEST_OF[slot]);
    expect(bag).toEqual([]);
  });

  it('一键装备：旧装备放回包袱，包袱里更好的换上来', () => {
    const bag = [59, 3, 7]; // 一套更强的
    const items = equipBest([9, 60, 6], bag); // 倚天劍、六韜、的盧
    expect(items.sort((a, b) => a - b)).toEqual([3, 7, 59].sort((a, b) => a - b));
    expect(bag.sort((a, b) => a - b)).toEqual([6, 9, 60].sort((a, b) => a - b));
  });

  it('一键装备可以连点：已经穿着最好的，不会再发一份', () => {
    const bag: number[] = [];
    const once = equipBest([], bag);
    const twice = equipBest(once, bag);
    expect(twice).toEqual(once);
    expect(bag).toEqual([]);
  });

  it('包袱里挑的是同部位最好的一件，不是第一件', () => {
    const bag = [9, 59, 58]; // 倚天劍、霸者劍、英傑劍
    expect(bestInBag(bag, 'weapon')).toBe(1);
    const items = equipBest([], bag);
    expect(items).toContain(59);
    expect(bag).toEqual([9, 58]); // 另外两把留在包袱里
  });

  it('给道具：一次 1–99 个', () => {
    const bag: number[] = [];
    giveItem(bag, 30, 3);
    giveItem(bag, 30, 0); // 至少 1 个
    giveItem(bag, 30, 500); // 最多 99 个
    expect(bag.filter((id) => id === 30)).toHaveLength(1 + 3 + 99);
  });

  it('战场同步：等级 / 兵种 / 道具照搬，兵力与策略值补满', () => {
    const r = roster();
    const lv = level('c1_s0_b11')!;
    const { b } = newBattle(lv, 1, r, { deploy: ['liu_bei', 'guan_yu'] });
    const u = b.units.find((x) => x.key === 'liu_bei')!;
    u.hp = 1;
    u.mp = 0;
    r.liu_bei = { level: 20, exp: 88, items: [59, 3, 7], cls: 6 };
    syncUnit(u, r.liu_bei);
    expect([u.level, u.exp, u.cls]).toEqual([20, 88, 6]);
    expect(u.items).toEqual([59, 3, 7]);
    expect(u.hp).toBeGreaterThan(1);
    expect(u.mp).toBeGreaterThan(0);
  });
});
