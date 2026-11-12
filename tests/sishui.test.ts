import { describe, expect, it } from 'vitest';
import { SISHUI } from '../src/data/sishui';
import { TB, atk, def, moveCost } from '../src/rules/core';
import { field } from '../src/rules/move';
import { aiStep, autoPhase, doAttack, doItem, doMove, doWait, endPhase, itemTargets, newBattle } from '../src/rules/turn';
import type { Battle, Unit } from '../src/rules/types';
import { ORDER, plan } from './bot';

const start = (seed = 1) => newBattle(SISHUI, seed).b;
const named = (b: Battle, name: string) => b.units.find((u) => u.name === name)!;
const at = (x: number, y: number) => y * SISHUI.w + x;
const cell = (reward: 'gold' | 'item') => SISHUI.triggers.find((t) => t.at && (reward === 'gold') === (t.flag === 'cell6,7'))!.at!;

describe('汜水关关卡数据（原版文件提取；对照：情报总汇 #2 楼）', () => {
  it('28×16 格，12 支部队，各自站在本兵种能进入的地形上且互不重叠', () => {
    const b = start();
    expect([b.w, b.h, b.terrain.length]).toEqual([28, 16, 448]);
    expect(b.units).toHaveLength(12);
    expect(new Set(b.units.map((u) => at(u.x, u.y))).size).toBe(12);
    for (const u of b.units) expect(moveCost(u.cls, b.terrain[at(u.x, u.y)]), u.name).not.toBe(255);
  });
  it('30 回合；名单、兵种、等级与情报总汇一致；敌军按原版名单顺序占槽位 15 起', () => {
    const b = start();
    expect(SISHUI.turnLimit).toBe(30);
    const row = (u: Unit) => `${u.name} ${TB.classNames[u.cls]} Lv${u.level}`;
    expect(b.units.filter((u) => u.slot >= 15).map(row)).toEqual([
      '华雄 轻骑兵 Lv5', '李肃 弓兵 Lv2', '胡轸 短兵 Lv2', '赵岑 短兵 Lv2', '步兵队 短兵 Lv1', '步兵队 短兵 Lv1', '步兵队 短兵 Lv1',
    ]);
    expect(b.units.filter((u) => u.slot < 15 && u.mode !== 7).map(row)).toEqual(['公孙瓒 轻骑兵 Lv4', '陶谦 短兵 Lv4']);
    expect(b.units.filter((u) => u.mode === 7).map(row)).toEqual(['刘备 短兵 Lv1', '关羽 轻骑兵 Lv1', '张飞 轻骑兵 Lv1']);
    expect([named(b, '华雄').x, named(b, '华雄').y]).toEqual([3, 9]);
  });
  it('原版 AI 指令：华雄原地不动（2），其余敌军待机（3），友军攻击最近（1）', () => {
    const b = start();
    expect(b.units.map((u) => u.mode)).toEqual([7, 7, 7, 1, 1, 2, 3, 3, 3, 3, 3, 3]);
  });
  it('开局数值：关羽攻 387、刘备攻 265、华雄防 354 兵 740，全员满兵满士气', () => {
    const b = start();
    expect(atk(named(b, '关羽'))).toBe(387);
    expect(atk(named(b, '刘备'))).toBe(265);
    expect(def(named(b, '华雄'))).toBe(354);
    expect(named(b, '华雄').hp).toBe(740);
    expect(b.units.every((u) => u.morale === 100 && u.on)).toBe(true);
  });
  it('地势：高台是悬崖走不上去，过河只有一座桥；(11,8) 是鹿砦', () => {
    const b = start();
    const g = named(b, '关羽');
    const all = field(b, g, g.x, g.y, 255, -1, true).dist;
    expect([b.terrain[at(0, 0)], b.terrain[at(0, 15)], b.terrain[at(11, 8)], b.terrain[at(17, 10)]]).toEqual([9, 9, 13, 4]);
    expect(all[at(16, 10)]).not.toBe(255); // 过桥到西岸
    b.terrain[at(17, 10)] = 3; // 把桥拆掉
    expect(field(b, g, g.x, g.y, 255, -1, true).dist[at(16, 10)]).toBe(255);
  });
  it('华雄守在关口里：唯一的入口被胡轸挡着，胡轸离开后才走得到', () => {
    const b = start();
    const g = named(b, '关羽');
    const boss = named(b, '华雄');
    expect(field(b, g, boss.x, boss.y, 255, g.y * b.w + g.x, true).stopped).toBe(false);
    named(b, '胡轸').on = false;
    expect(field(b, g, boss.x, boss.y, 255, g.y * b.w + g.x, true).stopped).toBe(true);
  });
  it('宝物库在 (6,7) 给 100 金，粮仓在 (12,6) 给豆', () => {
    expect([cell('gold'), cell('item')]).toEqual([[6, 7], [12, 6]]);
    expect([SISHUI.terrain[at(6, 7)], SISHUI.terrain[at(12, 6)]]).toEqual([16, 15]);
  });
});

describe('汜水关事件（以下为改动局面后的专项测试，不是正常游玩）', () => {
  it('关羽行动后贴着华雄：单挑，华雄离场，关羽升一级，胜利并得 100 金', () => {
    const b = start();
    named(b, '胡轸').on = false;
    const g = named(b, '关羽');
    [g.x, g.y] = [5, 9];
    const evs = [...doMove(b, g.slot, 4, 9), ...doWait(b, g.slot)];
    expect(evs.map((e) => e.t)).toContain('duel');
    expect([named(b, '华雄').on, g.level, g.exp, b.stage, b.gold]).toEqual([false, 2, 0, 'won', 100]);
  });
  it('别人贴着华雄不触发单挑：张飞行动后相邻，战斗照常继续', () => {
    const b = start();
    named(b, '胡轸').on = false;
    const z = named(b, '张飞');
    [z.x, z.y] = [5, 9];
    doMove(b, z.slot, 4, 9);
    doWait(b, z.slot);
    expect(b.flags).not.toContain('duel');
    expect(b.stage).toBe('player');
  });
  it('华雄原地不动：身边没人就不出手，贴上来才打，位置始终不变', () => {
    const b = start();
    for (let i = 0; i < 3; i++) {
      endPhase(b);
      while (autoPhase(b)) aiStep(b);
    }
    expect([named(b, '华雄').x, named(b, '华雄').y]).toEqual([3, 9]);
    named(b, '胡轸').on = false;
    const z = named(b, '张飞');
    [z.x, z.y, z.hp] = [4, 9, 500];
    endPhase(b);
    while (autoPhase(b)) aiStep(b);
    expect([named(b, '华雄').x, named(b, '华雄').y]).toEqual([3, 9]);
    expect(z.hp).toBeLessThan(500);
  });
  it('宝物库与粮仓各只触发一次；敌军踩上去不算；拿到的豆当场能用', () => {
    const b = start();
    const z = named(b, '张飞');
    const [gold, bean] = [cell('gold'), cell('item')];
    const foe = named(b, '赵岑');
    [foe.x, foe.y] = [bean[0], bean[1] + 1];
    foe.mode = 0;
    foe.goal = bean;
    endPhase(b);
    while (b.stage !== 'player') aiStep(b);
    expect([foe.x, foe.y]).toEqual(bean);
    expect(b.flags).toEqual([]);
    foe.on = false;
    [z.x, z.y] = bean;
    doWait(b, z.slot);
    expect(z.items).toContain(30);
    [z.x, z.y, z.acted] = [gold[0], gold[1], false];
    doWait(b, z.slot);
    expect(b.gold).toBe(100);
    z.acted = false;
    doWait(b, z.slot);
    expect([b.gold, z.items.filter((i) => i === 30).length]).toEqual([100, 1]);
    z.hp = 100;
    z.acted = false;
    expect(itemTargets(b, z, 30)).toContain(z);
    doItem(b, z.slot, 30, z.slot);
    expect(z.hp).toBe(500); // 600 以上的恢复量被兵力上限截住
  });
});

/** 用 tests/bot.ts 的代打策略在规则层里打完一整场。 */
function autoplay(b: Battle, maxRounds = 30) {
  for (let i = 0; i < maxRounds && b.stage === 'player'; i++) {
    for (const name of ORDER) {
      const u = named(b, name);
      if (b.stage !== 'player' || !u.on || u.confused) continue;
      const p = plan(b, name);
      doMove(b, u.slot, ...p.to);
      if (b.stage !== 'player') break;
      const t = p.target && b.units.find((v) => v.on && v.x === p.target![0] && v.y === p.target![1]);
      t ? doAttack(b, u.slot, t.slot) : doWait(b, u.slot);
    }
    if (b.stage === 'player') endPhase(b);
    while (autoPhase(b)) aiStep(b);
  }
  return b;
}

describe('整场模拟（规则层，不经画面）', () => {
  it('同一种子两次模拟结果逐字节相同', () => {
    expect(JSON.stringify(autoplay(start(20261111)))).toBe(JSON.stringify(autoplay(start(20261111))));
  });
  it('代打策略在多个种子下都能在 30 回合内取胜，并且有以关羽单挑结束的', () => {
    const results = [1, 7, 42, 20261111, 987654321].map((seed) => autoplay(start(seed)));
    for (const b of results) expect([b.stage, b.reason]).toEqual(['won', '击破华雄']);
    expect(results.filter((b) => b.flags.includes('duel')).length).toBeGreaterThan(0);
  });
  it('第一回合：我军不动时，敌军全员原地不动（都够不着）', () => {
    const b = start(3);
    for (const u of b.units) if (u.slot < 15 && u.mode !== 7) u.on = false; // 去掉会主动上前的友军
    const before = b.units.filter((u) => u.slot >= 15).map((u) => [u.x, u.y]);
    endPhase(b);
    while (b.stage !== 'player') aiStep(b);
    expect(b.units.filter((u) => u.slot >= 15).map((u) => [u.x, u.y])).toEqual(before);
    expect(b.round).toBe(2);
  });
  it('中途存档（JSON 往返）不改变之后的进程', () => {
    const a = start(99);
    autoplay(a, 3);
    const copy: Battle = JSON.parse(JSON.stringify(a));
    expect(JSON.stringify(autoplay(copy))).toBe(JSON.stringify(autoplay(a)));
  });
});
