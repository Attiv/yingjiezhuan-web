import { TB, atk, attackTargets, bySlot, def, foes, idiv, inside, isRain, knownStrategies, maxHp, moveBudget, rand, rangeCells, terrainDef, unitAt } from './core';
import { field, trace, type Field } from './move';
import type { Battle, Unit } from './types';

export interface Decision {
  mode: number; // 行动后的指令（可能被改写）
  preferred: number | null;
  dest: number; // 目的格下标
  attack: number | null; // 物理攻击目标槽位
  strategy: number | null; // 改用策略时的策略 ID（目标仍是 attack）
  field: Field;
}

/** 物理攻击的预估分：自己兵力÷6 + 预估伤害（+30 若是指定目标）。不是实际伤害。 */
function targetScore(b: Battle, a: Unit, d: Unit, preferred: number | null): number {
  const ga = idiv(a.cls, 3);
  const gd = idiv(d.cls, 3);
  let dv = def(d);
  if ((ga === 0 && gd === 1) || (ga === 1 && gd === 2) || (ga === 2 && gd === 0)) dv = (dv - (dv >> 2)) & 0xffff;
  if ((gd === 0 && ga === 1) || (gd === 1 && ga === 2) || (gd === 2 && ga === 0)) dv = (dv + (dv >> 2)) & 0xffff;
  const half = dv >> 1;
  const av = atk(a);
  const predict = av > half ? idiv((av - half) * (100 - terrainDef(b.terrain[d.y * b.w + d.x])), 100) : 1;
  return (idiv(a.hp, 6) + (preferred === d.slot ? 30 : 0) + predict) & 0xffff;
}

/** 站在 (x,y) 时最值得打的目标：权重 = 分数>>4 的低 8 位（至少 1），同分保留范围顺序靠前的。 */
function physicalChoice(b: Battle, u: Unit, x: number, y: number, preferred: number | null) {
  let target: number | null = null;
  let weight = 0;
  for (const t of attackTargets(b, u, x, y)) {
    const w = Math.max(1, (targetScore(b, u, t, preferred) >> 4) & 0xff);
    if (w > weight) (target = t.slot), (weight = w);
  }
  return { target, weight };
}

/** 站在 (x,y) 时最值得用的攻击系单体策略。每个候选都会消耗一次随机数，照原版保留。 */
function strategyChoice(b: Battle, u: Unit, x: number, y: number, ids: number[], preferred: number | null) {
  let id: number | null = null;
  let target: number | null = null;
  let weight = 0;
  for (const s of ids) {
    const family = idiv(s, 5);
    const cat = TB.strategyCategory[s];
    for (const [cx, cy] of rangeCells(b, x, y, cat | 0x80)) {
      const d = unitAt(b, cx, cy);
      if (!d || !foes(u, d)) continue;
      const terrain = b.terrain[cy * b.w + cx];
      let score = 0;
      if (!(family === 0 && isRain(b.weather)) && TB.strategyTerrain[family].includes(terrain)) {
        const offense = u.int + idiv(u.level * u.int, 50);
        score = ((((((cat + 1) * 4 + family) * 50 + offense) & 0xffff) * 2 - idiv(d.level * d.int, 50) - d.int) & 0xffff);
        if ((family === 0 && terrain === 1) || (family === 1 && isRain(b.weather))) score = (score + idiv(score, 4)) & 0xffff;
        score = (score + rand(b, idiv(score, 50))) & 0xffff;
      }
      let w = Math.min(255, score >> 4);
      if (w !== 0 && d.slot === preferred) w += 30;
      if (w > weight) (id = s), (target = d.slot), (weight = w & 0xff);
    }
  }
  return { id, target, weight };
}

/**
 * 原版 AI 的一次决策（指令 0–4）。流程：
 * 1. 算出本回合可达范围，以及「站在哪些格能打到敌人」的影响格；
 * 2. 按指令决定是否评估、给哪些格加目标加分；
 * 3. 逐格评分 = 加分 + 最佳攻击权重 + 地形防御÷5（原地 +1），取严格最高的格。
 */
export function decide(b: Battle, u: Unit): Decision {
  const here = u.y * b.w + u.x;
  let mode = u.mode;
  let preferred = u.target;
  if (u.confused || u.acted) return { mode, preferred, dest: here, attack: null, strategy: null, field: field(b, u, u.x, u.y, 0) };
  if (preferred !== null && !bySlot(b, preferred)?.on) (preferred = null), (mode = 1);

  const budget = moveBudget(u);
  // 影响格：按槽位升序，用「自己的」攻击范围套在每个敌人身上
  const influence: (number | null)[] = new Array(b.w * b.h).fill(null);
  for (const o of [...b.units].sort((p, q) => p.slot - q.slot)) {
    if (!o.on || !foes(o, u)) continue;
    for (const [cx, cy] of rangeCells(b, o.x, o.y, TB.range[u.cls])) influence[cy * b.w + cx] = o.slot;
  }
  const firstInfluence = (f: Field) => f.order.slice(1).map((i) => influence[i]).find((s) => s !== null) ?? null;

  const f = field(b, u, u.x, u.y, mode === 2 ? 0 : budget);
  const trigger = firstInfluence(f);
  const needsRecovery = u.hp <= idiv(maxHp(u.cls, u.level), 5) * 2 || u.morale < 40;
  const base = new Uint8Array(b.w * b.h);
  if (needsRecovery) b.terrain.forEach((t, i) => ([8, 13, 14].includes(t) ? (base[i] = 50) : 0));

  /** 目标加分向四周递减 20，只写入能站人的空格，且每格只写一次。 */
  const addGoalBonus = (x: number, y: number, strength: number): void => {
    if (strength <= 0 || !inside(b, x, y)) return;
    const i = y * b.w + x;
    if (terrainDef(b.terrain[i]) !== 255 && base[i] === 0 && !unitAt(b, x, y)) base[i] = strength & 0xff;
    for (const [dx, dy] of TB.cardinal) addGoalBonus(x + dx, y + dy, strength - 20);
  };
  /** 朝某格靠近：从目标反向铺距离，再从自己顺着递减方向走到移动力用尽，给落脚点加分。 */
  const approach = (x: number, y: number): boolean => {
    const p = y * b.w + x;
    if (!inside(b, x, y) || p === here) return false;
    const rev = field(b, u, x, y, 255, here, true);
    if (!rev.stopped) return false;
    const t = trace(b, u, rev, here, p, budget);
    if (!t.complete) {
      const end = t.path[t.path.length - 1];
      const ex = end % b.w;
      const ey = Math.floor(end / b.w);
      addGoalBonus(ex, ey, unitAt(b, ex, ey) ? 50 : 30);
    }
    return true;
  };
  const aggressive = (): boolean => {
    if (trigger !== null) return true;
    const slot = firstInfluence(field(b, u, u.x, u.y, 255));
    const t = slot === null ? undefined : bySlot(b, slot);
    return t ? approach(t.x, t.y) : false;
  };

  let evaluate = true;
  if (mode === 0 || mode === 4) {
    const t = preferred !== null ? bySlot(b, preferred)! : null;
    const [gx, gy] = t ? [t.x, t.y] : (u.goal ?? [0, 0]);
    if (preferred !== null && trigger === preferred) addGoalBonus(gx, gy, 50);
    else {
      addGoalBonus(gx, gy, 30);
      if (!approach(gx, gy)) evaluate = aggressive();
    }
  } else if (mode === 1) evaluate = aggressive();
  else if (mode === 3) evaluate = trigger !== null;

  let dest = here;
  let bestWeight = 0;
  let attack: number | null = null;
  let strategy: number | null = null;
  if (evaluate) {
    const ids = mode === 4 ? [] : knownStrategies(u).filter((id) => TB.strategyMp[id] <= u.mp && id <= 14 && id % 5 < 3);
    for (const i of f.order) {
      const x = i % b.w;
      const y = Math.floor(i / b.w);
      if (i !== here && unitAt(b, x, y)) continue;
      let w = base[i];
      let phys = { target: null as number | null, weight: 0 };
      if (mode !== 4 && (i === here || influence[i] !== null)) phys = physicalChoice(b, u, x, y, preferred);
      const strat = ids.length ? strategyChoice(b, u, x, y, ids, preferred) : { id: null, target: null, weight: 0 };
      w = (w + Math.max(phys.weight, strat.weight)) & 0xff;
      w += Math.min(idiv(terrainDef(b.terrain[i]), 5), 255 - w);
      if (i === here) w += Math.min(1, 255 - w);
      base[i] = w;
      if (w > bestWeight) {
        bestWeight = w;
        dest = i;
        if (strat.weight > phys.weight) (strategy = strat.id), (attack = strat.target);
        else (strategy = null), (attack = phys.target);
      }
    }
  }
  // 到达坐标目标后，「向目标移动」变成「待机」
  if (preferred === null && (mode === 0 || mode === 4) && u.goal && dest === u.goal[1] * b.w + u.goal[0]) mode = 3;
  if (mode === 4) attack = null;
  return { mode, preferred, dest, attack, strategy, field: f };
}

/** 执行时的目标：选中的还在射程内就打它，否则打射程内按范围顺序的最后一个。 */
export function executionTarget(b: Battle, u: Unit, selected: number | null): Unit | undefined {
  const ts = attackTargets(b, u);
  return ts.find((t) => t.slot === selected) ?? ts[ts.length - 1];
}

/** 敌/友军行动顺序：先恢复地形上的，再兵力不足四成或士气不足 40 的，再其余；同档按槽位。 */
export function aiOrder(b: Battle, enemy: boolean): number[] {
  const tier = (u: Unit) => {
    if ([8, 13, 14].includes(b.terrain[u.y * b.w + u.x])) return 0;
    return u.hp <= idiv(maxHp(u.cls, u.level), 5) * 2 || u.morale < 40 ? 1 : 2;
  };
  return b.units
    .filter((u) => u.on && u.slot >= 15 === enemy && u.mode !== 7)
    .map((u) => ({ slot: u.slot, tier: tier(u) }))
    .sort((p, q) => p.tier - q.tier || p.slot - q.slot)
    .map((c) => c.slot);
}
