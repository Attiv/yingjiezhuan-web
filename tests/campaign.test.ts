import { describe, expect, it } from 'vitest';
import { SCRIPT, hasLevel, level, officers, scene } from '../src/data/game';
import type { Battle, Roster } from '../src/rules/types';
import { doWait, newBattle } from '../src/rules/turn';
import { checkScript, nextStep, startStory, testFlag, type Shown, type StoryApi, type Step } from '../src/story';

/**
 * 整部游戏的剧本数据：从原版盘转出来的 5491 步、610 幕插剧、70 场战斗。
 * 这里不碰画面，只查数据自洽和不点鼠标也能演到底。
 */

/** 剧本里所有出现的插幕名。 */
const scenes = new Map<string, Step[]>();

/** 带记录的剧情推进：武将加入/离队/升级都照做，好在走完之后查结果。
 *  rand 决定每次选择怎么答；返回走过的战斗与最终停在哪。 */
function walk(rand: () => number) {
  const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei'] });
  const log: { joins: string[]; aways: string[]; battles: string[]; levels: number } = { joins: [], aways: [], battles: [], levels: 0 };
  const api: StoryApi = {
    join(st, id) { if (!log.joins.includes(id)) log.joins.push(id); if (!st.party.includes(id)) st.party.push(id); },
    away(st, id) { log.aways.push(id); st.party = st.party.filter((x) => x !== id); },
    level() { log.levels++; },
  };
  let step = nextStep(SCRIPT, st, 0, api) as Shown | null;
  let n = 0;
  for (; step && n < 20000; n++) {
    const s = step as unknown as Step;
    if (s.t === 'battle') log.battles.push(s.level);
    // 选择随便挑一项；战斗多半打赢，偶尔按失败的分支走，两条线都走到
    const a = s.t === 'choice' ? Math.floor(rand() * s.options.length) : s.t === 'battle' ? (rand() < 0.15 ? 1 : 0) : 0;
    step = nextStep(SCRIPT, st, a, api) as Shown | null;
  }
  return { st, log, step, steps: n };
}

/** 固定种子的伪随机，跑多少遍结果都一样。 */
function seeded(seed: number) {
  let r = (seed * 2654435761) % 4294967296;
  return () => (r = (r * 1103515245 + 12345) % 2147483648) / 2147483648;
}

describe('整部剧本的数据', () => {
  it('装载检查通过：每个跳转目标都有标签，70 场战斗都有关卡数据', () => {
    expect(() => checkScript(SCRIPT, hasLevel)).not.toThrow();
    const battles = SCRIPT.steps.filter((s): s is Extract<Step, { t: 'battle' }> => s.t === 'battle');
    expect(battles).toHaveLength(70);
    for (const b of battles) expect(level(b.level), b.level).toBeDefined();
  });

  it('70 个营地都指向同一场战斗，且那场战斗有出兵位', () => {
    const camps = SCRIPT.steps.filter((s): s is Extract<Step, { t: 'camp' }> => s.t === 'camp');
    expect(camps).toHaveLength(70);
    for (const c of camps) {
      const lv = level(c.battle);
      expect(lv, c.battle).toBeDefined();
      expect(lv!.deploy!.slots.length).toBeGreaterThan(0);
      expect(c.shop.length).toBeGreaterThan(0);
    }
  });

  it('610 幕插剧：幕内标签不重名，跳转目标都在，缺的插幕数 = 0', () => {
    const ids = SCRIPT.steps.filter((s): s is Extract<Step, { t: 'battle' }> => s.t === 'battle').map((s) => s.level);
    for (const id of ids) {
      const lv = level(id)!;
      for (const ev of lv.events ?? []) {
        for (const a of ev.actions) if (a.op === 'drama') scenes.set(a.scene, scene(a.scene));
      }
    }
    expect(scenes.size).toBeGreaterThan(300);
    for (const [id, steps] of scenes) {
      expect(steps.length, `${id} 缺内容`).toBeGreaterThan(0);
      const labels = new Set<string>();
      for (const s of steps) {
        if (s.t !== 'label') continue;
        expect(labels.has(s.name), `${id} 标签 ${s.name} 重复`).toBe(false);
        labels.add(s.name);
      }
      steps.forEach((s, i) => {
        const targets = s.t === 'goto' ? [s.label] : s.t === 'if' ? [s.goto]
          : s.t === 'choice' ? s.options.map((o) => o.goto) : [];
        for (const t of targets) expect(t === undefined || labels.has(t), `${id} 第 ${i + 1} 步找不到标签 ${t}`).toBe(true);
        if (s.t === 'say') expect(typeof s.text === 'string' && s.text.length > 0, `${id} 第 ${i + 1} 步空台词`).toBe(true);
      });
    }
  });

  it('不点鼠标也能一路演到底：每遍都会结束，不会绕死在分支里', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 120; seed++) {
      const { st, log, step, steps } = walk(seeded(seed));
      expect(step, `第 ${seed} 遍停在第 ${st.pc} 步`).toBeNull();
      expect(steps, `第 ${seed} 遍步数`).toBeLessThan(20000);
      expect(log.battles.length).toBeGreaterThan(0);
      for (const id of log.battles) seen.add(id);
      if (seed === 1) {
        expect(log.joins.length).toBeGreaterThan(3); // 沿途不断有人加入
        expect(log.levels).toBeGreaterThan(0);
        expect(st.party.length).toBeGreaterThan(3);
      }
    }
    // 原版有分支（投奔谁、走哪条路），一遍走不完全部；多跑几遍能覆盖绝大多数关卡
    expect(seen.size).toBeGreaterThanOrEqual(60);
    const all = new Set(SCRIPT.steps.filter((s): s is Extract<Step, { t: 'battle' }> => s.t === 'battle').map((s) => s.level));
    for (const id of seen) expect(all.has(id)).toBe(true);
  });

  it('70 场战斗都能按关卡数据开打：出征名单不空、槽位不撞、地形对得上', () => {    const roster: Roster = {};
    for (const [id, o] of Object.entries(officers)) roster[id] = { level: o.level, exp: 0, items: [] };
    const battles = SCRIPT.steps.filter((s): s is Extract<Step, { t: 'battle' }> => s.t === 'battle').map((s) => s.level);
    battles.forEach((id, n) => {
      const lv = level(id)!;
      const deploy = [...lv.deploy!.required, ...Object.keys(roster)].filter((k) => lv.candidates![k]).slice(0, lv.deploy!.max);
      expect(deploy.length, `${id} 出征名单`).toBeGreaterThan(0);
      const { b } = newBattle(lv, n + 1, roster, { deploy });
      expect(b.units.filter((u) => u.on && !u.group && u.mode === 7).length, `${id} 出征人数`).toBe(deploy.length);
      expect(b.terrain.length).toBe(b.w * b.h);
      const cells = b.units.filter((u) => u.on && !u.group).map((u) => u.y * b.w + u.x);
      expect(new Set(cells).size, `${id} 有部队重叠`).toBe(cells.length);
      for (const u of b.units) expect(b.terrain[u.y * b.w + u.x], `${id} ${u.name} 站在界内`).toBeDefined();
      expect(b.objective.length, `${id} 胜利条件`).toBeGreaterThan(0);
    });
  });

  it('布阵：玩家指定的格子优先，没指定的按关卡自带的出兵位', () => {
    const lv = level('c0_s0_b5')!;
    const [ax, ay] = lv.deploy!.slots[0];
    const { b } = newBattle(lv, 1, {}, { deploy: ['guan_yu', 'zhang_fei'], slots: { guan_yu: [ax + 1, ay + 1] } });
    const guan = b.units.find((u) => u.key === 'guan_yu')!;
    expect([guan.x, guan.y]).toEqual([ax + 1, ay + 1]);
    const zhang = b.units.find((u) => u.key === 'zhang_fei')!;
    expect([zhang.x, zhang.y]).toEqual(lv.deploy!.slots[1]);
  });
});

describe('战场事件', () => {
  it('相邻事件：关羽站到华雄旁边待命，演单挑、升一级、华雄撤退、直接胜利', () => {
    const lv = level('c0_s0_b5')!;
    const { b } = newBattle(lv, 3, {}, { deploy: ['guan_yu', 'zhang_fei'] });
    const guan = b.units.find((u) => u.key === 'guan_yu')!;
    const boss = b.units.find((u) => u.commander)!;
    // 直接挪到旁边，省掉走路；判定走的是和玩家点击完全一样的一套
    guan.x = boss.x + 1;
    guan.y = boss.y;
    const evs = doWait(b, guan.slot);
    expect(evs.some((e) => e.t === 'drama' && e.scene === 'orig_c0_s0_b5_5'), '应插播单挑').toBe(true);
    expect(b.stage).toBe('won');
    expect(b.reason).toBe(b.objective);
    expect(boss.on).toBe(false);
    expect(b.units.find((u) => u.key === 'guan_yu')!.level).toBe(2);
    expect(b.vars.orig_c0_s0_b5_ended).toBe(1);
  });

  it('到达事件：刘备走到指定格，插播剧情后按事件判胜', () => {
    const lv = level('c1_s1_b5')!;
    const { b } = newBattle(lv, 1, {}, { deploy: ['liu_bei'] });
    const lord = b.units.find((u) => u.key === 'liu_bei')!;
    const reach = lv.events!.find((e) => e.trigger.type === 'reach' && e.trigger.who === 'liu_bei')!;
    const [x, y] = reach.trigger.pos!;
    lord.x = x;
    lord.y = y;
    const evs = doWait(b, lord.slot);
    expect(evs.some((e) => e.t === 'drama')).toBe(true);
    expect(b.stage).toBe('won');
    expect(b.vars.orig_c1_s1_b5_ended).toBe(1);
  });

  it('相邻事件只在我方行动结束时查，不会因为对面自家人挨着就误触发', () => {
    const lv = level('c0_s0_b5')!;
    const { b } = newBattle(lv, 5, {}, { deploy: ['guan_yu', 'zhang_fei'] });
    const zhang = b.units.find((u) => u.key === 'zhang_fei')!;
    const boss = b.units.find((u) => u.commander)!;
    zhang.x = boss.x + 1;
    zhang.y = boss.y;
    doWait(b, zhang.slot); // 张飞挨着华雄不算「关羽对华雄」的单挑
    expect(b.stage).toBe('player');
    expect(boss.on).toBe(true);
  });
});

describe('标志判定', () => {
  it('没写 is 只看有没有；写了按 eq/ne/gt/lt 比', () => {
    const f = { a: 1, b: 3, c: 'x', d: true as const };
    expect(testFlag(f, 'a')).toBe(true);
    expect(testFlag(f, 'zz')).toBe(false);
    expect(testFlag(f, 'zz', undefined, 'ne')).toBe(true);
    expect(testFlag(f, 'a', 1)).toBe(true);
    expect(testFlag(f, 'a', 2, 'ne')).toBe(true);
    expect(testFlag(f, 'b', 2, 'gt')).toBe(true);
    expect(testFlag(f, 'b', 3, 'gt')).toBe(false);
    expect(testFlag(f, 'a', 2, 'lt')).toBe(true);
    expect(testFlag(f, 'c', 'x')).toBe(true);
    expect(testFlag(f, 'd')).toBe(true);
  });

  it('没设过的标志当 0：原版的「若 f8 不等於 0」对没设过的 f8 不成立', () => {
    const f = {};
    expect(testFlag(f, 'f8', 0, 'neq' as never)).toBe(false); // 写成 ne 的老脚本也照 0 比
    expect(testFlag(f, 'f8', 0, 'ne')).toBe(false);
    expect(testFlag(f, 'f8', 0, 'eq')).toBe(true);
    expect(testFlag(f, 'f8', 1, 'gt')).toBe(false);
    expect(testFlag({ f9: true }, 'f9', 1, 'eq')).toBe(true);
    expect(testFlag({ f9: false }, 'f9', 0, 'eq')).toBe(true);
  });
});

describe('首战：汜水關', () => {
  const first = (): Battle => newBattle(level('c0_s0_b5')!, 1, {}, { deploy: ['guan_yu', 'zhang_fei'] }).b;

  it('关张二人从东侧出兵位出发，华雄在西，30 回合上限', () => {
    const b = first();
    expect([b.w, b.h, level('c0_s0_b5')!.turnLimit]).toEqual([28, 16, 30]);
    expect(b.units.filter((u) => u.mode === 7).map((u) => u.name)).toEqual(['關羽', '張飛']);
    expect(b.units.find((u) => u.commander)!.name).toBe('華雄');
    expect(b.objective).toContain('華雄');
  });

  it('第一回合开场有插剧、关羽靠近华雄有单挑——两条事件都挂在关卡上', () => {
    const evs = level('c0_s0_b5')!.events!;
    expect(evs.some((e) => e.trigger.type === 'turn_start' && e.trigger.turn === 1)).toBe(true);
    const duel = evs.find((e) => e.trigger.type === 'adjacent')!;
    expect(duel.actions.map((a) => a.op)).toContain('drama');
    expect(duel.actions.some((a) => a.op === 'victory')).toBe(true);
  });
});
