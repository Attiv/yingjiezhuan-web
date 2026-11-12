import { TB, atk, bySlot, def, friendly, idiv, isRain, knownStrategies, maxHp, rand, terrainAt, terrainDef } from './core';
import type { Battle, Ev, Unit } from './types';

/** 兵种相克：兵种 ID÷3 的前三组（步兵 0、弓兵 1、骑兵 2）循环相克，0 克 1、1 克 2、2 克 0。 */
function adjustedDef(a: Unit, d: Unit): number {
  const ga = idiv(a.cls, 3);
  const gd = idiv(d.cls, 3);
  let v = def(d);
  if ((ga === 0 && gd === 1) || (ga === 1 && gd === 2) || (ga === 2 && gd === 0)) v -= idiv(v, 4);
  if ((gd === 0 && ga === 1) || (gd === 1 && ga === 2) || (gd === 2 && ga === 0)) v += idiv(v, 4);
  return v;
}

/** 物理伤害的确定部分：没有命中判定、没有暴击。counter = 反击（伤害减半）。 */
export function physical(b: Battle, a: Unit, d: Unit, counter = false) {
  let dmg = Math.max(0, atk(a) - idiv(adjustedDef(a, d), 2));
  dmg = idiv(dmg * (100 - terrainDef(terrainAt(b, d.x, d.y))), 100);
  if (counter) dmg = idiv(dmg, 2);
  dmg = Math.min(d.hp, Math.max(1, dmg));
  const morale = dmg === d.hp ? 0 : Math.min(d.morale, Math.max(1, idiv(idiv(dmg, d.level + 5), 3)));
  return { dmg, morale };
}

/**
 * 士气设定：下降后不足 30 时 60% 混乱；上升（或设为 100）时，混乱中的部队按 (统御+士气)÷3 % 恢复。
 * 「不足 30」是无符号比较，请求值为负时不触发，照原版保留。
 */
export function setMorale(b: Battle, u: Unit, requested: number, evs: Ev[]): void {
  const old = u.morale;
  u.morale = Math.max(0, Math.min(100, requested));
  if (old > requested && (requested & 0xffff) < 30 && rand(b, 5) < 3 && !u.confused) {
    u.confused = true;
    evs.push({ t: 'confuse', slot: u.slot, on: true });
  }
  if (old <= requested && (old < requested || requested === 100) && u.confused && u.on) {
    if (rand(b, 100) < idiv(u.lead + u.morale, 3)) {
      u.confused = false;
      evs.push({ t: 'confuse', slot: u.slot, on: false });
    }
  }
}

/** 经验：只有我方（槽位 < 15）获得。击破敌方首位（主将）固定 +48。 */
export function expGain(a: Unit, d: Unit, dmg: number): number {
  if (!friendly(a.slot)) return 0;
  const hit = Math.min(16, d.level < a.level ? 4 : 2 * (d.level - a.level + 3));
  if (dmg !== d.hp) return hit;
  if (d.slot === 15) return hit + 48;
  return hit + (d.level > a.level ? 32 : idiv(64, a.level - d.level + 2));
}

/** 满 100 升一级，不补兵力；99 级不再获得。 */
export function addExp(u: Unit, gain: number, evs: Ev[]): void {
  if (gain <= 0 || u.level >= 99) return;
  const before = knownStrategies(u);
  const total = u.exp + gain;
  const levels = idiv(total, 100);
  u.level += levels;
  u.exp = total % 100;
  const learned = levels ? knownStrategies(u).filter((id) => !before.includes(id)) : [];
  evs.push({ t: 'exp', slot: u.slot, gain, levels, learned });
}

/** 撤退判定：兵力为 0，或混乱且士气为 0。 */
function retire(b: Battle, u: Unit, evs: Ev[]): void {
  if (!u.on || !(u.hp === 0 || (u.confused && u.morale === 0))) return;
  u.on = false;
  // 以它为目标的「向目标移动」部队改为攻击最近敌人
  for (const o of b.units) if (o.mode === 0 && o.target === u.slot) (o.target = null), (o.mode = 1);
  evs.push({ t: 'retreat', slot: u.slot });
}

/**
 * 一次物理攻击的完整结算，顺序照原版：
 * 弓兵系演出用随机数 → 伤害 → 反击掷骰 → 写兵力 → 写士气 → 攻方经验 → 反击（递归）→ 撤退判定。
 */
function strike(b: Battle, a: Unit, d: Unit, counter: boolean, evs: Ev[]): void {
  const sub = counter ? 7 : TB.subtype[a.cls];
  if (!counter && a.cls >= 3 && a.cls <= 5) for (let i = 0; i < 8; i++) rand(b, 16);
  const { dmg, morale } = physical(b, a, d, counter);
  // 只有子类型为 0 的兵种会掷反击骰；先掷再看条件，保持随机数消耗顺序
  const roll = TB.subtype[d.cls] === 0 ? rand(b, 150) : -1;
  const lethal = dmg === d.hp;
  const mayCounter = roll >= 0 && d.str > roll && [0, 2, 5].includes(sub) && !lethal;
  const gain = expGain(a, d, dmg);
  d.hp -= dmg;
  evs.push({ t: 'hit', a: a.slot, d: d.slot, dmg, morale, counter });
  if (!lethal) setMorale(b, d, d.morale - morale, evs);
  addExp(a, gain, evs);
  if (mayCounter && !d.confused) strike(b, d, a, true, evs);
  retire(b, d, evs);
  retire(b, a, evs);
}

export function physicalAttack(b: Battle, a: Unit, d: Unit): Ev[] {
  const evs: Ev[] = [];
  strike(b, a, d, false, evs);
  return evs;
}

/** 策略能否对该格的敌军使用：攻击系（0–14）受地形限制，火系雨天不可用。 */
export function strategyUsable(b: Battle, id: number, d: Unit): boolean {
  if (id > 14) return false; // 本关只可能出现攻击系单体策略
  const family = idiv(id, 5);
  if (family === 0 && isRain(b.weather)) return false;
  return TB.strategyTerrain[family].includes(terrainAt(b, d.x, d.y));
}

/**
 * 攻击系单体策略的结算：成功判定 rand(施计方策略力) > 受计方策略力÷4（军乐队、妖术师、运输队加倍并伤害减半），
 * 伤害 = 基础威力 + 2×(智 + 等级×智÷50) − (对方智 + 对方等级×对方智÷50)，树林里的火计、雨天的水计 +25%，再加 0..伤害÷50 的随机值。
 */
export function castAttack(b: Battle, a: Unit, d: Unit, id: number): Ev[] {
  const evs: Ev[] = [];
  const family = idiv(id, 5);
  const tier = TB.strategyCategory[id];
  const bound = a.int + idiv(a.level * a.int, 100);
  let threshold = idiv(d.int + idiv(d.level * d.int, 100), 4);
  let dmg = (2 * (a.int + idiv(a.level * a.int, 50)) - (d.int + idiv(d.level * d.int, 50)) + (4 * tier + family + 2) * 100) & 0xffff;
  if ([12, 15, 18].includes(d.cls)) (threshold = (threshold * 2) & 0xffff), (dmg = idiv(dmg, 2));
  if ((family === 0 && terrainAt(b, d.x, d.y) === 1) || (family === 1 && isRain(b.weather))) dmg += idiv(dmg, 4);
  const ok = (rand(b, bound) & 0xff) > threshold;
  const jitter = rand(b, idiv(dmg & 0xffff, 50)); // 失败也照样消耗这次随机数
  const amount = ok ? Math.min(d.hp, dmg + jitter) : 0;
  const lethal = amount === d.hp;
  const morale = lethal ? 0 : Math.min(d.morale, amount === 0 ? 0 : Math.max(1, idiv(amount, 100)));
  const gain = ok ? expGain(a, d, amount) : 0;
  d.hp -= amount;
  evs.push({ t: 'cast', a: a.slot, d: d.slot, id, ok, dmg: amount, morale });
  if (ok && !lethal) setMorale(b, d, d.morale - morale, evs);
  addExp(a, gain, evs);
  retire(b, d, evs);
  a.mp = (a.mp - TB.strategyMp[id]) & 0xff;
  return evs;
}

/** 回合开始的地形恢复：村庄、鹿砦回兵力和士气，兵营只回兵力。两次随机数无论是否在场都会消耗。 */
export function upkeep(b: Battle, slot: number, evs: Ev[]): void {
  const troopRoll = rand(b, 11);
  const moraleRoll = rand(b, 5);
  const u = bySlot(b, slot);
  if (!u || !u.on) return;
  const terrain = terrainAt(b, u.x, u.y);
  const flags = terrain === 8 || terrain === 13 ? 3 : terrain === 14 ? 1 : 0;
  if (!flags) return;
  const max = maxHp(u.cls, u.level);
  let hpGain = (troopRoll + 15) * 10;
  let moraleGain = idiv(u.lead, 10) + moraleRoll + 1;
  // 回完只差不到 10 就直接补满
  if (max > u.hp + hpGain && u.hp + hpGain + 10 > max) hpGain = max - u.hp;
  if (u.morale + moraleGain < 100 && u.morale + moraleGain + 10 > 100) moraleGain = 100 - u.morale;
  const hp0 = u.hp;
  const m0 = u.morale;
  if (flags & 1) u.hp = Math.min(max, u.hp + hpGain);
  if (flags & 2) setMorale(b, u, u.morale + moraleGain, evs);
  if (u.hp !== hp0 || u.morale !== m0) evs.push({ t: 'recover', slot, hp: u.hp - hp0, morale: u.morale - m0 });
}

/** 阶段开始时的混乱恢复判定。 */
export function conditionRecovery(b: Battle, slot: number, evs: Ev[]): void {
  const u = bySlot(b, slot);
  if (!u || !u.on || !u.confused) return;
  if (rand(b, 100) < idiv(u.lead + u.morale, 3)) {
    u.confused = false;
    evs.push({ t: 'confuse', slot, on: false });
  }
}

/** 回复类道具（豆/麦/米 回兵力，酒系回士气）：没有施计者加成，基础值加一成以内的随机数。 */
export function useRecoverItem(b: Battle, d: Unit, tier: number, kind: number, evs: Ev[]): void {
  const hp0 = d.hp;
  const m0 = d.morale;
  if (kind & 1) {
    const base = (tier + 1) * 600;
    const max = maxHp(d.cls, d.level);
    d.hp = Math.min(max, d.hp + Math.min(base + rand(b, idiv(base, 10)), max - d.hp));
  }
  if (kind & 2) {
    const base = (tier + 3) * 10;
    setMorale(b, d, d.morale + Math.min(100 - d.morale, base + rand(b, idiv(base, 10))), evs);
  }
  evs.push({ t: 'recover', slot: d.slot, hp: d.hp - hp0, morale: d.morale - m0 });
}
