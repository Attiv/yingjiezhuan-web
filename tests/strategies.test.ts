import { describe, expect, it } from 'vitest';
import { STRATEGIES, strategyName, strategySpec } from '../src/data/strategies';
import { knownStrategies, maxHp, maxMp } from '../src/rules/core';
import { bySlot } from '../src/rules/core';
import { conditionRecovery } from '../src/rules/combat';
import { aiStep, castTargets, doCast, doCastAll, doItem, doItemAll, itemTargets, newBattle, type Level, type UnitInit } from '../src/rules/turn';
import type { Battle, Ev } from '../src/rules/types';
import { ITEM_SPEC, specOf } from '../src/data/items';

/** 策略表来自原版 strategies.toml：射程、目标、威力、士气增减、混乱都要对得上。 */

const unit = (slot: number, cls: number, level: number, x: number, y: number, extra: Partial<UnitInit> = {}): UnitInit => ({
  slot, name: `u${slot}`, face: '', cls, level, lead: 50, str: 50, int: 50, x, y, mode: slot < 15 ? 7 : 3, ...extra,
});
function level(units: UnitInit[], o: Partial<Level> = {}): Level {
  const w = o.w ?? 7;
  const h = o.h ?? 6;
  return {
    id: 'test', name: '测试', goal: '', turnLimit: 30, w, h, terrain: new Array(w * h).fill(0),
    units, lord: 0, boss: 15, reward: 0, triggers: [], ...o,
  };
}
const start = (units: UnitInit[], seed = 7, o: Partial<Level> = {}) => newBattle(level(units, o), seed).b;
const hurt = (b: Battle, slot: number, hp: number, morale = 100) => {
  const u = bySlot(b, slot)!;
  u.hp = hp;
  u.morale = morale;
};

describe('策略表（对照原版 strategies.toml）', () => {
  it('施策朝向所选目标，群体施策保留朝向', () => {
    for (const dx of [-1, 1]) {
      const b = start([unit(0, 15, 20, 3, 2, { int: 100 }), unit(15, 0, 20, 3 + dx, 2)]);
      bySlot(b, 0)!.facingLeft = dx > 0;
      doCast(b, 0, 0, 15);
      expect(bySlot(b, 0)!.facingLeft).toBe(dx < 0);
    }
    const b = start([unit(0, 18, 30, 3, 2), unit(1, 6, 30, 2, 2), unit(15, 0, 1, 6, 5)]);
    hurt(b, 1, 100);
    bySlot(b, 0)!.facingLeft = false;
    doCast(b, 0, 24, 1);
    expect(bySlot(b, 0)!.facingLeft).toBe(true);
    bySlot(b, 0)!.acted = false;
    bySlot(b, 0)!.facingLeft = false;
    doCastAll(b, 0, 33);
    expect(bySlot(b, 0)!.facingLeft).toBe(false);
  });
  it('36 条可学策略 + 爆彈，编号与 DOS 一致', () => {
    expect(Object.keys(STRATEGIES)).toHaveLength(37);
    for (let id = 0; id <= 36; id++) {
      const s = strategySpec(id);
      expect(s, `策略 ${id}`).toBeTruthy();
      expect(s!.name).toBeTruthy();
      expect(s!.effects.length).toBeGreaterThan(0);
    }
    expect(strategyName(0)).toBe('焦熱');
    expect(strategyName(2)).toBe('猛火');
    expect(strategyName(15)).toBe('假情報');
    expect(strategyName(24)).toBe('援助');
    expect(strategyName(35)).toBe('大救濟');
    expect(strategyName(36)).toBe('爆發');
  });

  it('回复与士气策略的数值、范围、目标类型照原版', () => {
    const aid = strategySpec(24)!;
    expect([aid.mp, aid.area, aid.target, aid.effects[0].power]).toEqual([6, 'single', 'ally', 600]);
    const cheer = strategySpec(22)!;
    expect([cheer.mp, cheer.effects[0].amount]).toEqual([8, 40]);
    const cure = strategySpec(28)!;
    expect(cure.effects.map((e) => [e.type, e.power ?? e.amount])).toEqual([['heal', 1200], ['morale', 40]]);
    const great = strategySpec(35)!;
    expect([great.mp, great.area, great.range]).toEqual([40, 'all_in_range', 3]);
    expect(strategySpec(17)!.area).toBe('cross'); // 偽裝：十字
    expect(strategySpec(36)!.effects[0].power).toBe(1500); // 爆彈
  });

  it('19 件策略书都指向有效策略', () => {
    const books = Object.values(ITEM_SPEC).filter((s) => s.strategy);
    expect(books).toHaveLength(19);
    for (const s2 of books) {
      expect(s2.strategyId, s2.name).toBeTypeOf('number');
      expect(strategySpec(s2.strategyId!), s2.name).toBeTruthy();
    }
  });

  it('各兵种按等级学会：运输队 Lv1 援助、军乐队 Lv1 激励、妖术师 Lv8 挑拨', () => {
    const b = start([unit(0, 18, 1, 0, 0), unit(1, 12, 1, 1, 0), unit(2, 15, 8, 2, 0), unit(15, 0, 1, 5, 5)]);
    expect(knownStrategies(bySlot(b, 0)!)).toContain(24);
    expect(knownStrategies(bySlot(b, 1)!)).toContain(21);
    expect(knownStrategies(bySlot(b, 2)!)).toContain(19);
  });
});

describe('回复策略', () => {
  it('援助：回复量 = 600 + 智力×等级÷20，再加 10% 以内的随机值；扣 6 点策略值、得 8 经验', () => {
    const b = start([unit(0, 1, 30, 2, 2, { int: 90 }), unit(1, 6, 30, 3, 2), unit(15, 0, 1, 6, 5)]);
    hurt(b, 1, 100);
    const caster = bySlot(b, 0)!;
    const before = caster.mp;
    expect(castTargets(b, caster, 24)).toContain(bySlot(b, 1));
    const evs = doCast(b, 0, 24, 1);
    const aid = evs.find((e) => e.t === 'aid')!;
    expect(aid.t).toBe('aid');
    if (aid.t === 'aid') {
      expect(aid.ok).toBe(true);
      expect(aid.hp).toBeGreaterThanOrEqual(735);
      expect(aid.hp).toBeLessThanOrEqual(807);
    }
    expect(bySlot(b, 1)!.hp).toBe(100 + (aid.t === 'aid' ? aid.hp : 0));
    expect(caster.mp).toBe(before - 6);
    expect(caster.acted).toBe(true);
    const exp = evs.find((e) => e.t === 'exp');
    expect(exp?.t === 'exp' ? exp.gain : 0).toBe(8);
  });

  it('回复不超过兵力上限', () => {
    const b = start([unit(0, 18, 30, 2, 2, { int: 90 }), unit(1, 0, 5, 3, 2), unit(15, 0, 1, 6, 5)]);
    hurt(b, 1, 10);
    doCast(b, 0, 24, 1);
    expect(bySlot(b, 1)!.hp).toBe(maxHp(0, 5));
  });

  it('满兵力的友军不能选为单体援助目标；满士气且不混乱也不能激励', () => {
    const b = start([unit(0, 18, 30, 2, 2), unit(1, 6, 30, 3, 2), unit(2, 6, 30, 2, 3), unit(3, 12, 30, 3, 3), unit(15, 0, 1, 6, 5)]);
    expect(castTargets(b, bySlot(b, 0)!, 24)).toEqual([]);
    expect(castTargets(b, bySlot(b, 3)!, 21)).toEqual([]);
    bySlot(b, 2)!.confused = true;
    expect(castTargets(b, bySlot(b, 3)!, 21)).toContain(bySlot(b, 2));
  });

  it('激励：基本 30 + 等级÷10，再加 10% 以内的随机值', () => {
    const b = start([unit(0, 12, 30, 2, 2), unit(1, 6, 30, 3, 2), unit(15, 0, 1, 6, 5)]);
    hurt(b, 1, 100, 40);
    const evs = doCast(b, 0, 21, 1);
    const aid = evs.find((e) => e.t === 'aid')!;
    if (aid.t === 'aid') {
      expect(aid.morale).toBeGreaterThanOrEqual(33);
      expect(aid.morale).toBeLessThanOrEqual(35);
    }
    expect(bySlot(b, 1)!.morale).toBeGreaterThanOrEqual(73);
  });

  it('军乐队 / 运输队的单体补给得 12 点经验，群体补给一律 8 点', () => {
    const b = start([unit(0, 18, 30, 2, 2), unit(1, 6, 30, 3, 2), unit(15, 0, 1, 6, 5)]);
    hurt(b, 1, 100);
    const evs = doCast(b, 0, 24, 1);
    const exp = evs.find((e) => e.t === 'exp');
    expect(exp?.t === 'exp' ? exp.gain : 0).toBe(12);
  });

  it('大援助：范围内所有友军（含自己）一起回复，策略值只扣一次', () => {
    const b = start([unit(0, 18, 30, 2, 2, { int: 80 }), unit(1, 6, 30, 3, 2), unit(2, 6, 30, 2, 3), unit(15, 0, 1, 6, 5)]);
    hurt(b, 0, 100);
    hurt(b, 1, 100);
    hurt(b, 2, 100);
    const caster = bySlot(b, 0)!;
    const mp = caster.mp;
    expect(caster.mp).toBeGreaterThanOrEqual(24);
    expect(castTargets(b, caster, 33)).toHaveLength(3);
    const evs = doCastAll(b, 0, 33);
    expect(evs.filter((e) => e.t === 'aid')).toHaveLength(3);
    expect(caster.mp).toBe(mp - 24);
    expect(bySlot(b, 1)!.hp).toBeGreaterThan(100);
    expect(bySlot(b, 2)!.hp).toBeGreaterThan(100);
    // 群体补给：一份 8 点经验，不是每个目标各算一次
    expect(evs.filter((e) => e.t === 'exp')).toHaveLength(1);
  });
});

describe('混乱与士气系策略', () => {
  it('假情报：高智对低智多数成功，成功后对方混乱、扣 8 点策略值', () => {
    let ok = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const b = start([unit(0, 15, 20, 2, 2, { int: 100 }), unit(15, 0, 1, 2, 3, { int: 10 })], seed);
      const evs = doCast(b, 0, 15, 15);
      const aid = evs.find((e) => e.t === 'aid')!;
      if (aid.t === 'aid' && aid.ok) {
        ok++;
        expect(bySlot(b, 15)!.confused).toBe(true);
        expect(evs.some((e) => e.t === 'confuse' && e.on)).toBe(true);
      }
      expect(bySlot(b, 0)!.mp).toBe(maxMp(bySlot(b, 0)!) - 8);
    }
    expect(ok).toBeGreaterThan(30);
  });

  it('低智对高智容易被识破，识破时不混乱', () => {
    let fail = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const b = start([unit(0, 15, 8, 2, 2, { int: 20 }), unit(15, 0, 40, 2, 3, { int: 100 })], seed);
      const evs = doCast(b, 0, 15, 15);
      const aid = evs.find((e) => e.t === 'aid')!;
      if (aid.t === 'aid' && !aid.ok) {
        fail++;
        expect(bySlot(b, 15)!.confused).toBe(false);
      }
    }
    expect(fail).toBeGreaterThan(15);
  });

  it('伪装是十字范围：目标与上下左右的敌军各判定一次，斜角不受影响', () => {
    const b = start([
      unit(0, 15, 20, 2, 2, { int: 100 }),
      unit(15, 0, 1, 2, 3, { int: 10 }), unit(16, 0, 1, 1, 3, { int: 10 }),
      unit(17, 0, 1, 3, 3, { int: 10 }), unit(18, 0, 1, 2, 4, { int: 10 }),
      unit(19, 0, 1, 1, 4, { int: 10 }),
    ]);
    const evs = doCast(b, 0, 17, 15);
    const aids = evs.filter((e) => e.t === 'aid');
    expect(aids.map((e) => (e.t === 'aid' ? e.d : -1)).sort((p, q) => p - q)).toEqual([15, 16, 17, 18]);
    expect(bySlot(b, 19)!.confused).toBe(false);
  });

  it('挑拨降士气：成功后按等级与随机值扣，识破则不变', () => {
    const b = start([unit(0, 15, 20, 2, 2, { int: 100 }), unit(15, 0, 1, 2, 3, { int: 10 })], 3);
    hurt(b, 15, 500, 80);
    const evs = doCast(b, 0, 19, 15);
    const aid = evs.find((e) => e.t === 'aid')!;
    if (aid.t === 'aid' && aid.ok) {
      // 基本 30 + 20÷10 = 32，随机 0–3
      expect(aid.morale).toBeLessThanOrEqual(-32);
      expect(aid.morale).toBeGreaterThanOrEqual(-35);
      expect(bySlot(b, 15)!.morale).toBeLessThan(80);
    }
  });

  it('混乱按策略表的 turns 计：假情报 2 个阶段后必定恢复', () => {
    let b: Battle | undefined;
    for (let seed = 1; seed <= 40 && !b; seed++) {
      const t = start([unit(0, 15, 20, 2, 2, { int: 100 }), unit(15, 0, 1, 2, 3, { int: 10 })], seed);
      const aid = doCast(t, 0, 15, 15).find((e) => e.t === 'aid');
      if (aid?.t === 'aid' && aid.ok) b = t;
    }
    const u = bySlot(b!, 15)!;
    expect([u.confused, u.confusedTurns]).toEqual([true, 2]);
    // 统御和士气都压到 0，恢复掷骰永远失败，只有时限到点才会解除
    u.lead = 0;
    u.morale = 0;
    const evs: Ev[] = [];
    conditionRecovery(b!, 15, evs);
    expect([u.confused, u.confusedTurns, evs.length]).toEqual([true, 1, 0]);
    conditionRecovery(b!, 15, evs);
    expect([u.confused, u.confusedTurns]).toEqual([false, 0]);
    expect(evs).toContainEqual({ t: 'confuse', slot: 15, on: false });
  });

  it('士气跌落的混乱没有时限，不会数到 0 就自己恢复', () => {
    const b = start([unit(0, 6, 10, 0, 0), unit(15, 0, 1, 2, 3)]);
    const u = bySlot(b, 15)!;
    u.confused = true;
    u.confusedTurns = 0;
    u.lead = 0;
    u.morale = 0;
    const evs: Ev[] = [];
    for (let i = 0; i < 5; i++) conditionRecovery(b, 15, evs);
    expect(u.confused).toBe(true);
    expect(evs).toHaveLength(0);
  });

  it('一次施法只在开头起势一次，单体与群体都一样', () => {
    const one = start([unit(0, 15, 20, 2, 2, { int: 100 }), unit(15, 0, 1, 2, 3, { int: 10 })]);
    const solo = doCast(one, 0, 0, 15);
    expect(solo[0]).toEqual({ t: 'castbegin', slot: 0, id: 0 });
    expect(solo.filter((e) => e.t === 'castbegin')).toHaveLength(1);

    const all = start([unit(0, 18, 30, 2, 2), unit(1, 6, 30, 3, 2), unit(2, 6, 30, 2, 3), unit(15, 0, 1, 6, 5)]);
    hurt(all, 0, 100);
    hurt(all, 1, 100);
    const group = doCastAll(all, 0, 33);
    expect(group[0]).toEqual({ t: 'castbegin', slot: 0, id: 33 });
    expect(group.filter((e) => e.t === 'castbegin')).toHaveLength(1);
  });
});

describe('敌军军师会补给', () => {
  it('运输队受伤后，轮到它行动时先给自己回兵', () => {
    const b = start([unit(0, 6, 10, 0, 0), unit(15, 18, 30, 5, 5, { int: 80 })]);
    hurt(b, 15, 100);
    const mp = bySlot(b, 15)!.mp;
    b.stage = 'enemy';
    b.queue = [15];
    const evs = aiStep(b);
    const aid = evs.find((e) => e.t === 'aid');
    expect(aid?.t).toBe('aid');
    expect(bySlot(b, 15)!.hp).toBeGreaterThan(600);
    expect(bySlot(b, 15)!.mp).toBeLessThan(mp);
    expect(bySlot(b, 15)!.acted).toBe(true);
  });

  it('敌军妖术师会远远地对低智部队放牵制 / 假情报', () => {
    const b = start([unit(0, 0, 10, 2, 2, { int: 30 }), unit(15, 15, 20, 3, 3, { int: 90 })]);
    const mp = bySlot(b, 15)!.mp;
    b.stage = 'enemy';
    b.queue = [15];
    const evs = aiStep(b);
    const aid = evs.find((e) => e.t === 'aid');
    expect(aid?.t === 'aid' ? aid.d : -1).toBe(0);
    expect(bySlot(b, 15)!.mp).toBeLessThan(mp);
    expect(bySlot(b, 15)!.acted).toBe(true);
  });
});

describe('策略书与爆彈', () => {
  it('火龍書：用一次火龍，不扣策略值、不需要学会', () => {
    const b = start([unit(0, 0, 1, 2, 2, { int: 100, items: [41] }), unit(15, 0, 1, 2, 4)]);
    const caster = bySlot(b, 0)!;
    const mp = caster.mp;
    expect(itemTargets(b, caster, 41)).toContain(bySlot(b, 15));
    const evs = doItem(b, 0, 41, 15);
    const cast = evs.find((e) => e.t === 'cast')!;
    expect(cast.t === 'cast' && cast.id).toBe(1);
    expect(caster.mp).toBe(mp);
    expect(caster.items).not.toContain(41);
  });

  it('援隊書：群体大援助，范围内友军一起回复', () => {
    const b = start([unit(0, 0, 1, 2, 2, { items: [46] }), unit(1, 6, 30, 3, 2), unit(15, 0, 1, 6, 5)]);
    hurt(b, 1, 100);
    const evs = doItemAll(b, 0, 46);
    expect(evs.filter((e) => e.t === 'aid')).toHaveLength(2); // 自己 + 友军
    expect(bySlot(b, 1)!.hp).toBeGreaterThan(100);
    expect(bySlot(b, 0)!.items).not.toContain(46);
  });

  it('爆彈：固定 1500 上下，无视地形防御与智力', () => {
    const b = start([unit(0, 0, 1, 2, 2, { int: 1, items: [33] }), unit(15, 0, 1, 2, 4, { int: 100 })], 7);
    bySlot(b, 15)!.hp = 5000;
    const evs = doItem(b, 0, 33, 15);
    const cast = evs.find((e) => e.t === 'cast')!;
    if (cast.t === 'cast') {
      expect(cast.ok).toBe(true);
      expect(cast.dmg).toBeGreaterThanOrEqual(1500);
      expect(cast.dmg).toBeLessThan(1530);
    }
    expect(bySlot(b, 15)!.hp).toBeLessThan(3501);
    expect(specOf(33)!.strategyId).toBe(36);
  });
});
