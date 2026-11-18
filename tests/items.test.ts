import { describe, expect, it } from 'vitest';
import { ITEM_SPEC, PROMOTE, classChange, classUse, itemEffect, priceOf, promotion, specOf } from '../src/data/items';
import { upkeep } from '../src/rules/combat';
import { atk, bySlot, def, maxHp, moveBudget, rand } from '../src/rules/core';
import { doDrop, doGive, doItem, doMove, doWait, giveTargets, itemTargets, newBattle, type Level, type UnitInit } from '../src/rules/turn';
import type { Battle } from '../src/rules/types';

/** 道具表来自原版的 items.toml：价格、回复量、装备加成、转职条件都得对得上。 */

const unit = (slot: number, cls: number, level: number, x: number, y: number, extra: Partial<UnitInit> = {}): UnitInit => ({
  slot, name: `u${slot}`, face: '', cls, level, lead: 50, str: 50, int: 50, x, y, mode: slot < 15 ? 7 : 3, ...extra,
});
function level(units: UnitInit[], o: Partial<Level> = {}): Level {
  const w = o.w ?? 6;
  const h = o.h ?? 2;
  return {
    id: 'test', name: '测试', goal: '', turnLimit: 30, w, h, terrain: new Array(w * h).fill(0),
    units, lord: 0, boss: 15, reward: 0, triggers: [], ...o,
  };
}
const start = (units: UnitInit[], seed = 7) => newBattle(level(units), seed).b;

describe('道具表（对照原版 items.toml）', () => {
  it('63 件道具都有名字与类别', () => {
    expect(Object.keys(ITEM_SPEC)).toHaveLength(63);
    for (const [id, s] of Object.entries(ITEM_SPEC)) {
      expect(s.name, `道具 ${id}`).toBeTruthy();
      expect(['weapon', 'armor', 'accessory', 'consumable']).toContain(s.kind);
    }
  });

  it('商店价格照原版：豆 100、酒 120、麦 250、伤药 300、特级酒 400、米 600、中药 700、老酒 800、茶 1200', () => {
    const table: [number, number][] = [[30, 100], [27, 120], [31, 250], [52, 300], [28, 400], [32, 600], [53, 700], [29, 800], [54, 1200]];
    for (const [id, price] of table) expect(priceOf(id), specOf(id)!.name).toBe(price);
  });

  it('武器、铠甲、马、宝物原版不出售', () => {
    for (const id of [9, 10, 58, 60, 5, 7, 8]) expect(priceOf(id), specOf(id)!.name).toBeNull();
  });

  it('装备说明写清加成', () => {
    expect(itemEffect(10)).toBe('攻擊 +20%');
    expect(itemEffect(60)).toBe('防禦 +15%');
    expect(itemEffect(7)).toBe('移動 +3');
    expect(itemEffect(8)).toBe('每回合兵力 +150～250　每回合士氣 +統御÷10＋1～5');
    expect(itemEffect(56)).toBe('每回合兵力 +150～250');
    expect(itemEffect(55)).toBe('每回合士氣 +統御÷10＋1～5');
    expect(itemEffect(54)).toBe('兵力 +1800　士氣 +50');
  });
});

describe('装备效果', () => {
  const b = (items: number[]): Battle => start([unit(0, 6, 1, 0, 0, { str: 98, items }), unit(15, 0, 1, 5, 1)]);
  const plain = () => start([unit(0, 6, 1, 0, 0, { str: 98, items: [] }), unit(15, 0, 1, 5, 1)]);

  it('青釭剑 +20% 攻击、六韬 +15% 防御、赤兔马 +3 移动', () => {
    const base = plain();
    const a0 = atk(bySlot(base, 0)!);
    expect(atk(bySlot(b([10]), 0)!)).toBe(a0 + Math.trunc((a0 * 20) / 100));
    const d0 = def(bySlot(base, 0)!);
    expect(def(bySlot(b([60]), 0)!)).toBe(d0 + Math.trunc((d0 * 15) / 100));
    expect(moveBudget(bySlot(b([7]), 0)!)).toBe(moveBudget(bySlot(base, 0)!) + 3);
  });

  it('同类宝物只取最高的一件，不叠加', () => {
    const one = atk(bySlot(b([10]), 0)!);
    expect(atk(bySlot(b([10, 11, 12]), 0)!)).toBe(one);
  });

  it('玉玺启用原版恢复：兵力 (rand(11)+15)×10，士气 统御÷10+rand(5)+1', () => {
    for (const lv of [5, 25]) {
      const battle = start([unit(0, 0, lv, 0, 0, { items: [8] }), unit(15, 0, 1, 5, 1)]);
      const u = bySlot(battle, 0)!;
      u.hp = 1;
      u.morale = 50;
      const rng = { rng: battle.rng };
      const hp = (rand(rng, 11) + 15) * 10;
      const morale = Math.trunc(u.lead / 10) + rand(rng, 5) + 1;
      const evs: Parameters<typeof upkeep>[2] = [];
      upkeep(battle, 0, evs);
      expect(u.hp, `Lv${lv} 玉玺回复`).toBe(1 + hp);
      expect(u.morale).toBe(50 + morale);
      expect(battle.rng).toBe(rng.rng);
      expect(evs).toContainEqual({ t: 'recover', slot: 0, hp, morale });
    }
  });

  it('援军报告只回兵力，勅命书只回士气；重复宝物及恢复地形不叠加', () => {
    for (const [items, terrain, heal, rally] of [
      [[56], 0, true, false], [[55], 0, false, true],
      [[8], 0, true, true], [[8, 8, 55, 56], 0, true, true],
      [[8, 55, 56], 8, true, true], [[8, 8], 14, true, true],
    ] as const) {
      const battle = start([unit(0, 0, 25, 0, 0, { items: [...items] }), unit(15, 0, 1, 5, 1)]);
      const u = bySlot(battle, 0)!;
      battle.terrain[0] = terrain;
      u.hp = 1;
      u.morale = 40;
      const rng = { rng: battle.rng };
      const hp = (rand(rng, 11) + 15) * 10;
      const morale = Math.trunc(u.lead / 10) + rand(rng, 5) + 1;
      upkeep(battle, 0, []);
      expect(u.hp, `道具 ${items} 地形 ${terrain}`).toBe(heal ? 1 + hp : 1);
      expect(u.morale).toBe(rally ? 40 + morale : 40);
      expect(battle.rng).toBe(rng.rng);
    }
  });

  it('宝物恢复不超过上限，差不到10补满，满状态不产生虚假恢复事件', () => {
    const battle = start([unit(0, 0, 5, 0, 0, { items: [8] }), unit(15, 0, 1, 5, 1)]);
    const u = bySlot(battle, 0)!;
    const rng = { rng: battle.rng };
    const hp = (rand(rng, 11) + 15) * 10;
    const morale = Math.trunc(u.lead / 10) + rand(rng, 5) + 1;
    u.hp = maxHp(u.cls, u.level) - hp - 5;
    u.morale = 100 - morale - 5;
    upkeep(battle, 0, []);
    expect(u.hp).toBe(maxHp(u.cls, u.level));
    expect(u.morale).toBe(100);
    const evs: Parameters<typeof upkeep>[2] = [];
    upkeep(battle, 0, evs);
    expect(evs).toEqual([]);
    u.hp--;
    u.morale--;
    upkeep(battle, 0, []);
    expect(u.hp).toBe(maxHp(u.cls, u.level));
    expect(u.morale).toBe(100);
  });

  it('地图宝物踩上去就归该部队，回血效果随后每回合生效', () => {
    const { b } = newBattle(level([unit(0, 0, 5, 0, 0), unit(15, 0, 1, 5, 1)], {
      treasures: [{ x: 1, y: 0, item: 8, gold: 0 }],
    }), 5);
    const u = bySlot(b, 0)!;
    doMove(b, 0, 1, 0);
    const evs = doWait(b, 0);
    expect(evs.some((e) => e.t === 'gain' && /玉璽/.test(e.text))).toBe(true);
    expect(u.items).toContain(8);
    u.hp -= 100;
    u.morale = 50;
    const rng = { rng: b.rng };
    rand(rng, 11);
    const morale = Math.trunc(u.lead / 10) + rand(rng, 5) + 1;
    upkeep(b, 0, []);
    expect(u.hp).toBe(maxHp(0, 5));
    expect(u.morale).toBe(50 + morale);
  });
});

describe('战场上用道具', () => {
  const hurt = (items: number[], damage = 1000) => {
    const battle = start([unit(0, 0, 5, 0, 0, { items }), unit(15, 0, 1, 5, 1)]);
    const u = bySlot(battle, 0)!;
    u.hp = Math.max(1, maxHp(0, 5) - damage);
    u.morale = 40;
    return { battle, u };
  };

  it('伤药回 600 兵力 + 30 士气（原版数值，最多一成浮动）', () => {
    const { battle, u } = hurt([52]);
    const before = u.hp;
    doItem(battle, 0, 52, 0);
    expect(u.hp - before).toBeGreaterThanOrEqual(600);
    expect(u.hp - before).toBeLessThanOrEqual(660);
    expect(u.morale - 40).toBeGreaterThanOrEqual(30);
    expect(u.morale - 40).toBeLessThanOrEqual(33);
    expect(u.items).not.toContain(52);
  });

  it('中药 800+35、茶 1800+50、豆只回兵力', () => {
    for (const [id, heal, morale] of [[53, 800, 35], [54, 1800, 50], [30, 600, 0]] as const) {
      const { battle, u } = hurt([id]);
      const [hp0, m0] = [u.hp, u.morale];
      doItem(battle, 0, id, 0);
      expect(u.hp - hp0, `道具 ${id} 兵力`).toBeGreaterThanOrEqual(Math.min(heal, maxHp(0, 5) - hp0));
      expect(u.hp - hp0).toBeLessThanOrEqual(Math.min(heal + Math.trunc(heal / 10), maxHp(0, 5) - hp0));
      if (morale) {
        expect(u.morale - m0).toBeGreaterThanOrEqual(morale);
        expect(u.morale - m0).toBeLessThanOrEqual(morale + Math.trunc(morale / 10));
      } else expect(u.morale).toBe(m0);
    }
  });

  it('兵满、士气满的部队不能再用回复道具', () => {
    const { battle, u } = hurt([30], 0);
    u.morale = 100;
    expect(itemTargets(battle, u, 30)).toHaveLength(0);
  });

  it('武器、转职书不能在战场上使用', () => {
    const { battle, u } = hurt([10, 19, 2]);
    expect(itemTargets(battle, u, 10)).toHaveLength(0);
    expect(itemTargets(battle, u, 19)).toHaveLength(0);
    expect(itemTargets(battle, u, 2)).toHaveLength(0);
  });
});

describe('兵种转职', () => {
  it('短兵 Lv15 + 长枪 → 长兵；等级不够或兵种不对都不行', () => {
    expect(promotion(0, 15, 19)).toBe(1);
    expect(promotion(0, 14, 19)).toBeNull();
    expect(promotion(3, 15, 19)).toBeNull();
    expect(promotion(1, 30, 20)).toBe(2);
    expect(promotion(6, 30, 20)).toBeNull();
  });

  it('8 条升级链都在表里，所需道具存在', () => {
    expect(Object.keys(PROMOTE)).toHaveLength(8);
    for (const [cls, p] of Object.entries(PROMOTE)) {
      expect(p.item, `兵种 ${cls}`).not.toBeNull();
      expect(specOf(p.item!)!.promote, `兵种 ${cls} 的道具`).toBe(true);
      expect(p.to).not.toBe(Number(cls));
    }
  });

  it('转职书直接指定兵种：鼓吹具 → 军乐队、遁甲天书 → 妖术师、弓术指针书 → 弓兵', () => {
    expect(classChange(2)).toBe(12);
    expect(classChange(0)).toBe(15);
    expect(classChange(16)).toBe(3);
    expect(classChange(30)).toBeNull();
    expect(classUse(9, 20, 2)).toBe(12);
  });
});

describe('给予与丢弃（原版道具指令的另外两项）', () => {
  it('给予：把豆交给相邻的友军，两边道具栏同步变化，并消耗这次行动', () => {
    const b = start([unit(0, 0, 5, 1, 0, { items: [30] }), unit(1, 0, 5, 2, 0), unit(2, 0, 5, 4, 0), unit(15, 0, 1, 5, 0)]);
    const u = bySlot(b, 0)!;
    expect(giveTargets(b, u, 30).map((d) => d.slot)).toEqual([1]);
    const evs = doGive(b, 0, 30, 1);
    expect(u.items).toEqual([]);
    expect(bySlot(b, 1)!.items).toEqual([30]);
    expect(evs[0]).toEqual({ t: 'give', a: 0, d: 1, item: 30 });
    expect(u.acted).toBe(true);
  });

  it('隔一格、道具栏已满、敌军都不能给', () => {
    const b = start([
      unit(0, 0, 5, 1, 0, { items: [30] }),
      unit(1, 0, 5, 3, 0), // 隔一格
      unit(2, 0, 5, 2, 0, { items: [30, 30, 30, 30, 30, 30, 30, 30] }), // 满 8 件
      unit(15, 0, 1, 0, 0), // 相邻但是敌军
    ]);
    const u = bySlot(b, 0)!;
    expect(giveTargets(b, u, 30)).toEqual([]);
    expect(() => doGive(b, 0, 30, 1)).toThrow();
  });

  it('丢弃：道具离身，同样消耗这次行动', () => {
    const b = start([unit(0, 0, 5, 2, 0, { items: [30, 31] }), unit(15, 0, 1, 5, 0)]);
    const u = bySlot(b, 0)!;
    const evs = doDrop(b, 0, 30);
    expect(u.items).toEqual([31]);
    expect(evs[0]).toEqual({ t: 'drop', slot: 0, item: 30 });
    expect(u.acted).toBe(true);
  });
});
