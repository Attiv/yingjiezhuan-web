import { describe, expect, it } from 'vitest';
import { SCRIPT, defaultDeploy, level, officers } from '../src/data/game';
import { tally } from '../src/result';
import { newBattle } from '../src/rules/turn';
import type { Roster } from '../src/rules/types';

/**
 * 战斗结算：军资怎么拆、谁上榜、升了几级、回合数怎么截。
 * 这里只管算，不管画面；画面在 `src/main.ts` 的 `showResult()`。
 */

const roster = (): Roster => {
  const r: Roster = {};
  for (const [id, o] of Object.entries(officers)) r[id] = { level: o.level, exp: 0, items: [] };
  return r;
};

describe('战斗结算', () => {
  it('胜利：军资 = 关卡赏金 + 战场拾得，两笔分开报', () => {
    const lv = level('c1_s0_b11')!; // 原版赏金 200
    const { b } = newBattle(lv, 1, roster(), { deploy: ['liu_bei', 'guan_yu'] });
    b.stage = 'won';
    b.gold = 500; // 赏金 200 在判胜时已加进来，另外 300 是宝箱与事件给的
    const t = tally(b, { reward: lv.reward, turnLimit: lv.turnLimit });
    expect([t.gold, t.reward, t.found]).toEqual([500, 200, 300]);
    expect(t.won).toBe(true);
  });

  it('败北：赏金与拾得都不入账，军资一分不加', () => {
    const lv = level('c1_s0_b11')!;
    const { b } = newBattle(lv, 1, roster(), { deploy: ['liu_bei'] });
    b.stage = 'lost';
    b.gold = 300; // 路上捡的，败了不算
    const t = tally(b, { reward: lv.reward, turnLimit: lv.turnLimit });
    expect([t.gold, t.reward, t.found]).toEqual([0, 0, 0]);
    expect(t.won).toBe(false);
  });

  it('只有我军上榜：撤退的也列出来，兵力记 0', () => {
    const lv = level('c1_s0_b11')!;
    const { b } = newBattle(lv, 1, roster(), { deploy: ['liu_bei', 'guan_yu'] });
    b.stage = 'won';
    const guan = b.units.find((u) => u.key === 'guan_yu')!;
    guan.on = false;
    const t = tally(b, { reward: lv.reward, turnLimit: lv.turnLimit });
    expect(t.rows.map((r) => r.name)).toEqual(['劉備', '關羽']);
    expect(t.rows.map((r) => r.on)).toEqual([true, false]);
    expect(t.rows[1].hp).toBe(0);
    expect(t.rows[0].hp).toBeGreaterThan(0);
  });

  it('升级：和开战时的等级比，涨几级就标几级', () => {
    const lv = level('c1_s0_b11')!;
    const { b } = newBattle(lv, 1, roster(), { deploy: ['liu_bei', 'guan_yu'] });
    b.stage = 'won';
    const guan = b.units.find((u) => u.key === 'guan_yu')!;
    guan.level += 2;
    const t = tally(b, { reward: lv.reward, turnLimit: lv.turnLimit, before: { guan_yu: guan.level - 2, liu_bei: 1 } });
    expect(t.rows.find((r) => r.key === 'guan_yu')!.up).toBe(2);
    expect(t.rows.find((r) => r.key === 'liu_bei')!.up).toBe(0);
  });

  it('没有开战记录（读档接手的战斗）时，不标升级', () => {
    const lv = level('c1_s0_b11')!;
    const { b } = newBattle(lv, 1, roster(), { deploy: ['guan_yu'] });
    const t = tally(b, { reward: lv.reward, turnLimit: lv.turnLimit });
    expect(t.rows.map((r) => r.up)).toEqual([0]);
  });

  it('回合数不超过关卡上限（打到加时也按上限报）', () => {
    const lv = level('c0_s0_b5')!;
    const { b } = newBattle(lv, 1, roster(), { deploy: ['guan_yu'] });
    b.round = lv.turnLimit + 5;
    expect(tally(b, { reward: lv.reward, turnLimit: lv.turnLimit }).rounds).toBe(lv.turnLimit);
    b.round = 3;
    expect(tally(b, { reward: lv.reward, turnLimit: lv.turnLimit }).rounds).toBe(3);
  });

  it('70 场战斗都能算：上榜人数等于出征人数，兵种名与等级对得上', () => {
    const ids = SCRIPT.steps.filter((s) => s.t === 'battle').map((s) => (s as { level: string }).level);
    const r = roster();
    for (const [n, id] of ids.entries()) {
      const lv = level(id)!;
      const deploy = defaultDeploy(id, Object.keys(r).filter((k) => lv.candidates?.[k]));
      const { b } = newBattle(lv, n + 1, r, { deploy });
      b.stage = 'won';
      const t = tally(b, { reward: lv.reward, turnLimit: lv.turnLimit });
      expect(t.rows.length, `${id} 上榜人数`).toBe(deploy.length);
      for (const row of t.rows) {
        expect(row.className.length, `${id} ${row.name} 兵种`).toBeGreaterThan(0);
        expect(row.level, `${id} ${row.name} 等级`).toBeGreaterThan(0);
        expect(row.maxHp, `${id} ${row.name} 兵力上限`).toBeGreaterThan(0);
      }
      expect(t.reward, `${id} 赏金`).toBe(lv.reward);
    }
  });
});
