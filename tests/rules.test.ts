import { describe, expect, it } from 'vitest';
import { aiOrder, decide } from '../src/rules/ai';
import { expGain, physical, setMorale, upkeep } from '../src/rules/combat';
import { atk, attackTargets, bySlot, def, maxHp, maxMp, rand, rangeCells } from '../src/rules/core';
import { canStop, reachField } from '../src/rules/move';
import { aiStep, canCommand, doAttack, doItem, doMove, doWait, endPhase, newBattle, script, undoMove, type Level, type UnitInit } from '../src/rules/turn';
import type { Battle, Ev } from '../src/rules/types';

const P = 0; // 平原
const unit = (slot: number, cls: number, level: number, x: number, y: number, extra: Partial<UnitInit> = {}): UnitInit => ({
  slot, name: `u${slot}`, face: '', cls, level, lead: 50, str: 50, int: 50, x, y, mode: slot < 15 ? 7 : 3, ...extra,
});
/** 小型测试关卡：rows 用数字地形码，缺省全平原。 */
function level(units: UnitInit[], o: Partial<Level> & { rows?: number[][] } = {}): Level {
  const w = o.rows ? o.rows[0].length : (o.w ?? 9);
  const h = o.rows ? o.rows.length : (o.h ?? 9);
  return {
    id: 'test', name: '测试', goal: '', turnLimit: 30, w, h, terrain: o.rows ? o.rows.flat() : new Array(w * h).fill(P),
    units, lord: 0, boss: 15, reward: 100, triggers: [], ...o,
  };
}
const start = (l: Level, seed = 1) => newBattle(l, seed).b;
const cells = (b: Battle, slot: number) => {
  const u = bySlot(b, slot)!;
  const f = reachField(b, u);
  const out: string[] = [];
  for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) if (canStop(b, u, f, x, y)) out.push(`${x},${y}`);
  return out;
};

describe('数值（对照：轩辕春秋 tid=1092 实测表）', () => {
  it('武力 → 基本攻击力 8 组对照值全部吻合', () => {
    // 帖中「基本攻击力」= 攻击力 ÷ (等级+10)，短兵修正为 0；取等级 0 时攻击力应为表值×10
    const table: [number, number][] = [[100, 280], [95, 268], [90, 260], [84, 251], [74, 240], [60, 230], [40, 220], [10, 210]];
    for (const [str, want] of table) {
      const b = start(level([unit(0, 0, 0, 0, 0, { str }), unit(15, 0, 1, 8, 8)]));
      expect(atk(bySlot(b, 0)!), `武力 ${str}`).toBe(want);
    }
  });
  it('关羽 Lv1 轻骑兵 + 青龙偃月刀 = 387；华雄 Lv5 防御 354、兵力 740', () => {
    const b = start(level([unit(0, 6, 1, 0, 0, { str: 98, items: [12] }), unit(15, 6, 5, 8, 8, { lead: 88 })]));
    expect(atk(bySlot(b, 0)!)).toBe(387);
    expect(def(bySlot(b, 15)!)).toBe(354);
    expect(maxHp(6, 5)).toBe(740);
    expect(bySlot(b, 15)!.hp).toBe(740);
  });
  it('策略值 = (等级+10)×智力÷40', () => {
    const b = start(level([unit(0, 0, 1, 0, 0, { int: 64 }), unit(15, 0, 1, 8, 8)]));
    expect(maxMp(bySlot(b, 0)!)).toBe(17);
  });
});

describe('物理攻击', () => {
  const duel = (aCls: number, dCls: number, terrain = P) =>
    start(level([unit(0, aCls, 1, 0, 0), unit(15, dCls, 1, 1, 0)], { rows: [[P, terrain, P]] }));
  it('攻击实际目标时覆盖移动朝向，战后和存档都保留出手方向', () => {
    for (const dx of [-1, 1]) {
      const b = start(level([unit(0, 0, 20, 3, 3), unit(15, 0, 20, 3 + dx, 3)]));
      bySlot(b, 0)!.facingLeft = dx > 0;
      doAttack(b, 0, 15);
      expect(bySlot(b, 0)!.facingLeft).toBe(dx < 0);
      const saved: Battle = JSON.parse(JSON.stringify(b));
      expect(bySlot(saved, 0)!.facingLeft).toBe(dx < 0);
    }
  });
  it('反击者也面向实际目标，同列出手保持已有朝向', () => {
    const b = start(level([unit(0, 9, 20, 3, 3), unit(15, 9, 20, 4, 3, { str: 100 })]));
    bySlot(b, 15)!.facingLeft = false;
    const evs = doAttack(b, 0, 15);
    expect(evs.some((e) => e.t === 'hit' && e.counter)).toBe(true);
    expect(bySlot(b, 15)!.facingLeft).toBe(true);
    for (const left of [false, true]) {
      const vertical = start(level([unit(0, 0, 20, 3, 3), unit(15, 0, 20, 3, 4)]));
      bySlot(vertical, 0)!.facingLeft = left;
      doAttack(vertical, 0, 15);
      expect(bySlot(vertical, 0)!.facingLeft).toBe(left);
    }
  });
  it('关羽 → 华雄（平原，同为骑兵）伤害 210', () => {
    const b = start(level([unit(0, 6, 1, 0, 0, { str: 98, items: [12] }), unit(15, 6, 5, 1, 0, { lead: 88 })], { w: 3, h: 1 }));
    expect(physical(b, bySlot(b, 0)!, bySlot(b, 15)!).dmg).toBe(210);
  });
  it('相克：步兵打弓兵对方防御 −1/4，步兵打骑兵对方防御 +1/4', () => {
    const neutral = physical(duel(0, 0), ...pair(duel(0, 0))).dmg;
    const b1 = duel(0, 3);
    const b2 = duel(0, 6);
    // 防御各按兵种系数算，再做 ±1/4 修正
    const d1 = def(bySlot(b1, 15)!);
    const d2 = def(bySlot(b2, 15)!);
    const a = atk(bySlot(b1, 0)!);
    expect(physical(b1, ...pair(b1)).dmg).toBe(a - Math.trunc((d1 - Math.trunc(d1 / 4)) / 2));
    expect(physical(b2, ...pair(b2)).dmg).toBe(a - Math.trunc((d2 + Math.trunc(d2 / 4)) / 2));
    expect(neutral).toBe(a - Math.trunc(def(bySlot(duel(0, 0), 15)!) / 2));
  });
  it('地形防御按百分比减伤；伤害不超过现有兵力、至少为 1', () => {
    const open = duel(0, 0);
    const forest = duel(0, 0, 1);
    const base = physical(open, ...pair(open)).dmg;
    expect(physical(forest, ...pair(forest)).dmg).toBe(Math.trunc((base * 80) / 100));
    bySlot(open, 15)!.hp = 7;
    expect(physical(open, ...pair(open)).dmg).toBe(7);
    const weak = start(level([unit(0, 12, 1, 0, 0, { str: 1 }), unit(15, 2, 50, 1, 0, { lead: 100 })], { w: 3, h: 1 }));
    expect(physical(weak, ...pair(weak)).dmg).toBe(1);
  });
  it('士气损失 = 伤害÷(对方等级+5)÷3，至少 1；致死时不改士气', () => {
    const b = duel(0, 0);
    const { dmg, morale } = physical(b, ...pair(b));
    expect(morale).toBe(Math.max(1, Math.trunc(Math.trunc(dmg / 6) / 3)));
    bySlot(b, 15)!.hp = 1;
    expect(physical(b, ...pair(b)).morale).toBe(0);
  });
  it('攻击后对方掉兵掉士气，本方记为已行动；本关兵种不触发反击', () => {
    const b = duel(0, 0);
    const evs = doAttack(b, 0, 15);
    expect(evs.filter((e) => e.t === 'hit')).toHaveLength(1);
    expect(bySlot(b, 15)!.hp).toBeLessThan(500);
    expect(bySlot(b, 15)!.morale).toBeLessThan(100);
    expect(bySlot(b, 0)!.acted).toBe(true);
    expect(bySlot(b, 0)!.hp).toBe(500);
  });
});
const pair = (b: Battle) => [bySlot(b, 0)!, bySlot(b, 15)!] as const;

describe('经验（对照：社区值 38 / 25 / 40 / 上限 48）', () => {
  const g = (aLv: number, dLv: number, kill: boolean, dSlot = 16) => {
    const b = start(level([unit(0, 0, aLv, 0, 0), unit(15, 0, 1, 5, 5), unit(dSlot === 15 ? 17 : dSlot, 0, dLv, 1, 0)]));
    const d = dSlot === 15 ? { ...bySlot(b, 17)!, slot: 15 } : bySlot(b, dSlot)!;
    return expGain(bySlot(b, 0)!, d, kill ? d.hp : 1);
  };
  it('击破同级 38、低一级 25、高一级 40、高很多封顶 48', () => {
    expect(g(5, 5, true)).toBe(38);
    expect(g(5, 4, true)).toBe(25);
    expect(g(5, 6, true)).toBe(40);
    expect(g(1, 20, true)).toBe(48);
  });
  it('只命中：同级 6，对方等级低 4，上限 16；击破敌方首位 +48', () => {
    expect(g(5, 5, false)).toBe(6);
    expect(g(5, 2, false)).toBe(4);
    expect(g(1, 20, false)).toBe(16);
    expect(g(1, 5, true, 15)).toBe(14 + 48);
  });
  it('满 100 升级，兵力上限上升但现有兵力不补', () => {
    const b = start(level([unit(0, 0, 1, 0, 0), unit(15, 0, 1, 5, 5)]));
    const evs: Ev[] = [];
    script.levels(bySlot(b, 0)!, 1, evs);
    expect(bySlot(b, 0)!.level).toBe(2);
    expect(bySlot(b, 0)!.hp).toBe(500);
    expect(maxHp(0, 2)).toBe(550);
  });
});

describe('移动（原版距离层扫描）', () => {
  it('空旷平原上是菱形范围；友军可穿过不可停，敌军格不可进', () => {
    const b = start(level([unit(0, 0, 1, 4, 4), unit(1, 0, 1, 5, 4), unit(15, 0, 1, 4, 0), unit(16, 0, 1, 8, 8)]));
    const c = cells(b, 0);
    expect(c).toContain('4,4');
    expect(c).toContain('8,4'); // 穿过 (5,4) 的友军走满 4 格
    expect(c).not.toContain('5,4');
    expect(c).not.toContain('4,0');
    expect(c).toContain('4,1');
    expect(c.every((s) => Math.abs(+s.split(',')[0] - 4) + Math.abs(+s.split(',')[1] - 4) <= 4)).toBe(true);
  });
  it('贴着敌军的格能进但不能再往外走（起点除外）', () => {
    const b = start(level([unit(0, 6, 1, 0, 0), unit(15, 0, 1, 2, 1)], { w: 7, h: 1 + 1 }));
    const c = cells(b, 0);
    expect(c).toContain('2,0'); // 敌军正上方：停止格
    expect(c).not.toContain('3,0'); // 过不去
  });
  it('地形消耗：骑兵进不了树林，荒地 2、村庄 2、粮仓 3；步兵荒地 1', () => {
    const rows = [[P, 11, 11, 11, P, P, P], [1, P, P, P, P, P, P], [15, P, P, P, P, P, P], [P, P, P, P, P, P, P]];
    const enemy = unit(15, 0, 1, 6, 3);
    const horse = start(level([unit(0, 6, 1, 0, 0), enemy], { rows }));
    const f = reachField(horse, bySlot(horse, 0)!);
    expect(f.dist[1]).toBe(2);
    expect(f.dist[7]).toBe(255); // 树林
    const foot = start(level([unit(0, 0, 1, 0, 0), enemy], { rows }));
    expect(reachField(foot, bySlot(foot, 0)!).dist[1]).toBe(1);
    expect(reachField(foot, bySlot(foot, 0)!).dist[7]).toBe(1);
    const horse2 = start(level([unit(0, 6, 1, 0, 1), enemy], { rows: [[P, P], [P, P], [15, P], [P, P]].map((r) => [...r, P, P, P, P, P]) }));
    expect(reachField(horse2, bySlot(horse2, 0)!).dist[14]).toBe(3);
  });
  it('受限格（轩辕春秋 tid=305686）：唯一的易行邻格是停止格时，难行地形只能踏进一格', () => {
    // 骑兵在 (2,2)，东边平原贴着敌军（停止格），其余三面荒地（消耗 2），移动力 6 本可走 3 格荒地
    const W = 11;
    const rows = [
      [W, W, W, W, W, W],
      [W, W, W, W, W, W],
      [W, W, P, P, P, W],
      [W, W, W, W, W, W],
      [W, W, W, W, W, W],
    ];
    const blocked = start(level([unit(0, 6, 1, 2, 2), unit(15, 0, 1, 4, 2)], { rows }));
    expect(cells(blocked, 0).sort()).toEqual(['1,2', '2,1', '2,2', '2,3', '3,2'].sort());
    // 对照：把敌军挪远，东边不再是停止格，荒地就能继续走
    const open = start(level([unit(0, 6, 1, 2, 2), unit(15, 0, 1, 5, 4)], { rows }));
    expect(cells(open, 0)).toContain('2,0');
  });
  it('移动一次后可取消回原位；行动后不能再移动', () => {
    const b = start(level([unit(0, 0, 1, 0, 0), unit(15, 0, 1, 8, 8)]));
    expect(doMove(b, 0, 2, 0)[0]).toMatchObject({ t: 'move', path: [[0, 0], [1, 0], [2, 0]] });
    expect(() => doMove(b, 0, 3, 0)).toThrow();
    expect(undoMove(b)).toBe(true);
    expect([bySlot(b, 0)!.x, bySlot(b, 0)!.moved]).toEqual([0, false]);
    doMove(b, 0, 1, 0);
    doWait(b, 0);
    expect(undoMove(b)).toBe(false);
    expect(() => doMove(b, 0, 2, 0)).toThrow();
    expect(canCommand(b, bySlot(b, 0)!)).toBe(false);
  });
});

describe('攻击范围（对照：轩辕春秋 tid=1092 范围图）', () => {
  const b = start(level([unit(0, 0, 1, 4, 4), unit(15, 0, 1, 0, 0)]));
  const set = (code: number) => rangeCells(b, 4, 4, code).map(([x, y]) => `${x - 4},${y - 4}`).sort();
  it('短兵/轻骑兵：上下左右', () => expect(set(0)).toEqual(['-1,0', '0,-1', '0,1', '1,0']));
  it('弓兵：斜角 4 格 + 直线第 2 格，打不到正邻格', () =>
    expect(set(2)).toEqual(['-1,-1', '-1,1', '-2,0', '0,-2', '0,2', '1,-1', '1,1', '2,0'].sort()));
  it('策略「焦热」范围 = 周围 8 格', () => expect(set(0x80)).toHaveLength(8));
  it('超出范围不能攻击', () => {
    const far = start(level([unit(0, 0, 1, 0, 0), unit(15, 0, 1, 2, 0)]));
    expect(attackTargets(far, bySlot(far, 0)!)).toHaveLength(0);
    expect(() => doAttack(far, 0, 15)).toThrow();
  });
});

describe('士气、混乱与恢复（概率项只验证分布）', () => {
  it('士气跌破 30 时约 60% 混乱；30 及以上不会', () => {
    let n = 0;
    for (let seed = 1; seed <= 2000; seed++) {
      const b = start(level([unit(0, 0, 1, 0, 0), unit(15, 0, 1, 8, 8)]), seed);
      setMorale(b, bySlot(b, 0)!, 29, []);
      if (bySlot(b, 0)!.confused) n++;
      const c = start(level([unit(0, 0, 1, 0, 0), unit(15, 0, 1, 8, 8)]), seed);
      setMorale(c, bySlot(c, 0)!, 30, []);
      expect(bySlot(c, 0)!.confused).toBe(false);
    }
    expect(n / 2000).toBeGreaterThan(0.56);
    expect(n / 2000).toBeLessThan(0.64);
  });
  it('混乱部队不能下令；回合开始按 (统御+士气)÷3 % 恢复', () => {
    let cured = 0;
    for (let seed = 1; seed <= 2000; seed++) {
      const b = start(level([unit(0, 0, 1, 0, 0, { lead: 60 }), unit(15, 2, 1, 8, 8, { mode: 2 })]), seed);
      const u = bySlot(b, 0)!;
      u.confused = true;
      u.morale = 30;
      expect(canCommand(b, u)).toBe(false);
      endPhase(b);
      while (b.stage !== 'player') aiStep(b);
      if (!u.confused) cured++;
    }
    expect(cured / 2000).toBeGreaterThan(0.26); // (60+30)÷3 = 30%
    expect(cured / 2000).toBeLessThan(0.34);
  });
  it('村庄回兵力 150–250 并回士气；兵营只回兵力；平原不回', () => {
    for (const [terrain, hp, morale] of [[8, true, true], [14, true, false], [P, false, false]] as const) {
      const b = start(level([unit(0, 0, 1, 0, 0), unit(15, 0, 1, 2, 0)], { rows: [[terrain, P, P]] }));
      const u = bySlot(b, 0)!;
      u.hp = 100;
      u.morale = 50;
      upkeep(b, 0, []);
      expect(u.hp > 100).toBe(hp);
      if (hp) expect(u.hp - 100).toBeGreaterThanOrEqual(150), expect(u.hp - 100).toBeLessThanOrEqual(250);
      expect(u.morale > 50).toBe(morale);
    }
  });
  it('豆恢复兵力 600–659（对照：情报总汇附件）', () => {
    const seen = new Set<number>();
    for (let seed = 1; seed <= 400; seed++) {
      const b = start(level([unit(0, 2, 30, 0, 0, { items: [30] }), unit(15, 0, 1, 8, 8)]), seed);
      bySlot(b, 0)!.hp = 100;
      doItem(b, 0, 30, 0);
      seen.add(bySlot(b, 0)!.hp - 100);
      expect(bySlot(b, 0)!.items).toEqual([]);
    }
    expect(Math.min(...seen)).toBe(600);
    expect(Math.max(...seen)).toBe(659);
  });
  it('随机数：同一种子序列相同，上界为 0 不推进', () => {
    const a = { rng: 42 };
    const b = { rng: 42 };
    expect([rand(a, 100), rand(a, 100), rand(a, 0), rand(a, 100)]).toEqual([rand(b, 100), rand(b, 100), 0, rand(b, 100)]);
  });
});

describe('回合、胜败与事件', () => {
  it('我军 → 友军 → 敌军 → 下一回合，行动标记清零', () => {
    const b = start(level([unit(0, 0, 1, 0, 0), unit(1, 0, 1, 0, 1, { mode: 1 }), unit(15, 0, 1, 8, 8, { mode: 2 })]));
    doWait(b, 0);
    const seen: string[] = [b.stage];
    endPhase(b);
    while (b.stage !== 'player') (seen.push(b.stage), aiStep(b));
    expect([...new Set(seen)]).toEqual(['player', 'ally', 'enemy']);
    expect(b.round).toBe(2);
    expect(bySlot(b, 0)!.acted).toBe(false);
    expect(bySlot(b, 1)!.x).toBeGreaterThan(0); // 友军自动向敌人靠近
  });
  it('超过回合上限判负', () => {
    const b = start(level([unit(0, 0, 1, 0, 0), unit(15, 0, 1, 8, 8, { mode: 2 })], { turnLimit: 2 }));
    for (let i = 0; i < 2; i++) {
      endPhase(b);
      while (b.stage === 'ally' || b.stage === 'enemy') aiStep(b);
    }
    expect(b.stage).toBe('lost');
    expect(b.reason).toContain('回合');
  });
  it('击破主将获胜并得奖励；主公撤退判负', () => {
    const win = start(level([unit(0, 6, 30, 0, 0, { str: 100 }), unit(15, 3, 1, 1, 0)], { w: 3, h: 1 }));
    expect(doAttack(win, 0, 15).some((e) => e.t === 'end' && e.won)).toBe(true);
    expect([win.stage, win.gold]).toEqual(['won', 100]);
    const lose = start(level([unit(0, 3, 1, 1, 0), unit(15, 6, 30, 0, 0, { str: 100, mode: 1 })], { w: 3, h: 1 }));
    endPhase(lose);
    while (lose.stage === 'ally' || lose.stage === 'enemy') aiStep(lose);
    expect(lose.stage).toBe('lost');
  });
  it('到达格与相邻触发各只发生一次', () => {
    const l = level([unit(0, 0, 1, 0, 0), unit(15, 0, 1, 4, 0, { mode: 2 })], {
      w: 6, h: 1,
      triggers: [
        { flag: 'granary', who: null, at: [1, 0], effects: [{ op: 'item', id: 30 }] },
        { flag: 'duel', who: 'u0', next: 'u15', effects: [{ op: 'retreat', slot: 15 }] },
      ],
    });
    const b = start(l);
    doMove(b, 0, 1, 0);
    expect(doWait(b, 0).some((e) => e.t === 'gain')).toBe(true);
    expect(bySlot(b, 0)!.items).toEqual([30]);
    endPhase(b);
    while (b.stage !== 'player') aiStep(b);
    expect(doWait(b, 0).some((e) => e.t === 'gain')).toBe(false);
    endPhase(b);
    while (b.stage !== 'player') aiStep(b);
    doMove(b, 0, 3, 0);
    doWait(b, 0);
    expect(b.stage).toBe('won');
  });
});

describe('敌军行动', () => {
  it('待机（指令 3）：够不着时原地不动，够得着就上前攻击', () => {
    const far = start(level([unit(0, 0, 1, 0, 0), unit(15, 0, 1, 8, 0)], { w: 9, h: 1 }));
    expect(decide(far, bySlot(far, 15)!).dest).toBe(8);
    const near = start(level([unit(0, 0, 1, 0, 0), unit(15, 0, 1, 4, 0)], { w: 9, h: 1 }));
    const d = decide(near, bySlot(near, 15)!);
    expect([d.dest, d.attack]).toEqual([1, 0]);
  });
  it('不动（指令 2）：只打身边的；攻击最近（指令 1）：够不着也会靠近', () => {
    const hold = start(level([unit(0, 0, 1, 0, 0), unit(15, 0, 1, 3, 0, { mode: 2 })], { w: 9, h: 1 }));
    expect(decide(hold, bySlot(hold, 15)!)).toMatchObject({ dest: 3, attack: null });
    bySlot(hold, 0)!.x = 2;
    expect(decide(hold, bySlot(hold, 15)!)).toMatchObject({ dest: 3, attack: 0 });
    const chase = start(level([unit(0, 0, 1, 0, 0), unit(15, 0, 1, 8, 0, { mode: 1 })], { w: 9, h: 1 }));
    expect(decide(chase, bySlot(chase, 15)!).dest).toBe(4);
  });
  it('对照轩辕春秋 tid=12345 观察 1：攻击位全被自己人占住时，去附近的高防御地形；没有就原地休息', () => {
    // 我军在 (0,0)，唯一攻击位 (1,0) 被敌方同伴占着；(3,0) 是树林
    const mk = (mid: number) =>
      start(level([unit(0, 0, 1, 0, 0), unit(16, 0, 1, 1, 0, { mode: 2 }), unit(15, 0, 1, 4, 0, { mode: 1 })], { rows: [[P, P, P, mid, P]] }));
    expect(decide(mk(1), bySlot(mk(1), 15)!)).toMatchObject({ dest: 3, attack: null });
    expect(decide(mk(P), bySlot(mk(P), 15)!)).toMatchObject({ dest: 4, attack: null });
  });
  it('对照轩辕春秋 tid=12345 观察 2：最近的敌人站在自己进不去的地形上时原地休息，旁边有高防御地形也不去', () => {
    // 骑兵进不了树林；我军站在树林 (0,0)，攻击位 (1,0) 要走不止一回合；骑兵身边 (8,0) 就是鹿砦（防御 30%）
    const rows = [[1, P, P, P, P, P, P, P, 13, P]];
    const b = start(level([unit(0, 0, 1, 0, 0), unit(15, 6, 1, 9, 0, { mode: 1 })], { rows }));
    expect(decide(b, bySlot(b, 15)!)).toMatchObject({ dest: 9, attack: null });
    // 对照：同样的距离，我军站在平原上，就会朝它靠近
    const open = start(level([unit(0, 0, 1, 0, 0), unit(15, 6, 1, 9, 0, { mode: 1 })], { rows: [[P, ...rows[0].slice(1)]] }));
    expect(decide(open, bySlot(open, 15)!).dest).toBeLessThan(9);
  });
  it('行动顺序：恢复地形上的先动，其次残兵或低士气，再按槽位', () => {
    const b = start(level([unit(0, 0, 1, 0, 0), unit(15, 0, 1, 5, 0), unit(16, 0, 1, 6, 0), unit(17, 0, 1, 7, 0)], { rows: [[P, P, P, P, P, P, P, 8]] }));
    bySlot(b, 16)!.hp = 100;
    expect(aiOrder(b, true)).toEqual([17, 16, 15]);
  });
});

describe('存档', () => {
  it('JSON 往返后继续推进，结果与不存档完全一致（含随机数与事件进度）', () => {
    const l = level([unit(0, 0, 1, 0, 0), unit(1, 6, 4, 0, 2, { mode: 1 }), unit(15, 6, 5, 6, 1, { mode: 1 }), unit(16, 3, 2, 6, 3, { mode: 1 })], {
      rows: [[P, P, P, 8, P, P, P], [P, 7, P, P, P, 1, P], [P, P, P, 14, P, P, P], [P, P, P, P, P, P, P]],
    });
    const a = start(l, 777);
    doMove(a, 0, 1, 0);
    const copy: Battle = JSON.parse(JSON.stringify(a));
    const play = (b: Battle) => {
      doWait(b, 0);
      for (let i = 0; i < 6 && b.stage !== 'won' && b.stage !== 'lost'; i++) {
        if (b.stage === 'player') endPhase(b);
        while (b.stage === 'ally' || b.stage === 'enemy') aiStep(b);
      }
      return JSON.stringify(b);
    };
    expect(copy.undo).toEqual({ slot: 0, x: 0, y: 0 });
    expect(play(copy)).toBe(play(a));
  });
});
