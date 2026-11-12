// 测试用的代打：替玩家拿主意，规则层模拟和浏览器实操共用。只读状态、只返回打算，不改任何东西。
import { physical } from '../src/rules/combat';
import { TB, attackTargets, bySlot, foes, maxHp, rangeCells } from '../src/rules/core';
import { canStop, field, reachField } from '../src/rules/move';
import type { Battle, Unit } from '../src/rules/types';

export interface Plan {
  to: [number, number];
  target: [number, number] | null; // 要攻击的敌军所在格
}

/** 假设 u 站在 (x,y)，下个敌军阶段大概要挨多少打。原地不动的敌军只算打得到的。 */
function threat(b: Battle, u: Unit, x: number, y: number): number {
  const [ox, oy] = [u.x, u.y];
  let sum = 0;
  for (const e of b.units) {
    if (!e.on || !foes(e, u)) continue;
    const f = e.mode === 2 ? null : reachField(b, e);
    let can = false;
    for (let cy = 0; cy < b.h && !can; cy++) {
      for (let cx = 0; cx < b.w && !can; cx++) {
        const here = cx === e.x && cy === e.y;
        if (!(here || (f && canStop(b, e, f, cx, cy) && !(cx === x && cy === y)))) continue;
        can = rangeCells(b, cx, cy, TB.range[e.cls]).some(([rx, ry]) => rx === x && ry === y);
      }
    }
    if (!can) continue;
    [u.x, u.y] = [x, y];
    sum += physical(b, e, u).dmg;
    [u.x, u.y] = [ox, oy];
  }
  return sum;
}

/**
 * 打法：刘备躲远；关羽、张飞稳着打——优先能击破的，其次伤害高的，少挨打，残血回村庄或鹿砦；
 * 关羽只要走得到华雄身边就直接贴上去（触发单挑）；张飞不碰华雄，把单挑留给关羽。
 */
export function plan(b: Battle, who: string): Plan {
  // who 可以是武将 id（guan_yu）或名字（關羽），两种剧本数据都用得上
  const find = (k: string) => b.units.find((v) => v.key === k || v.name === k);
  const u = find(who)!;
  const at = (x: number, y: number) => y * b.w + x;
  const boss = b.units.find((v) => v.on && v.slot >= 15 && v.commander) ?? bySlot(b, 15)!;
  const guan = find('guan_yu') ?? find('关羽');
  const enemies = b.units.filter((v) => v.on && foes(v, u));
  const leaveBoss = guan?.on && enemies.length > 1 ? enemies.filter((v) => v !== boss) : enemies;
  const prey = u.key === 'guan_yu' || u.name === '关羽' || u.key === 'zhang_fei' || u.name === '张飞' ? leaveBoss : [];
  const walkTo = (t: { x: number; y: number }) => field(b, u, t.x, t.y, 255, -1, true).dist;
  const toFoes = enemies.map(walkTo);
  const f = reachField(b, u);
  const cells: [number, number][] = [];
  for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) if (canStop(b, u, f, x, y)) cells.push([x, y]);
  const nearest = (x: number, y: number) => Math.min(...toFoes.map((d) => d[at(x, y)]));

  if ((u.key === 'guan_yu' || u.name === '关羽') && boss.on) {
    const beside = cells.find(([x, y]) => Math.abs(x - boss.x) + Math.abs(y - boss.y) === 1);
    if (beside) return { to: beside, target: null };
  }
  const heal = [8, 13, 14];
  const healSpots: { x: number; y: number }[] = [];
  b.terrain.forEach((t, i) => heal.includes(t) && healSpots.push({ x: i % b.w, y: Math.floor(i / b.w) }));
  const toHeal = healSpots.map(walkTo);
  const weak = u.hp < maxHp(u.cls, u.level) * 0.5;
  const best = (x: number, y: number) => {
    const [ox, oy] = [u.x, u.y];
    [u.x, u.y] = [x, y];
    let top: { t: Unit; gain: number } | null = null;
    for (const t of attackTargets(b, u)) {
      if (!prey.includes(t)) continue;
      const dmg = physical(b, u, t).dmg;
      const gain = dmg + (dmg >= t.hp ? 600 : 0);
      if (!top || gain > top.gain) top = { t, gain };
    }
    [u.x, u.y] = [ox, oy];
    return top;
  };
  let pick: { cell: [number, number]; score: number; target: Unit | null } | null = null;
  for (const [x, y] of cells) {
    const danger = threat(b, u, x, y);
    const hit = prey.length && !weak ? best(x, y) : null;
    let score = -danger * 1.5 - (danger >= u.hp ? 5000 : 0);
    if (u.key === 'liu_bei' || u.name === '刘备') score += nearest(x, y) * 4;
    else if (weak) score -= Math.min(...toHeal.map((d) => d[at(x, y)])) * 30 - (heal.includes(b.terrain[at(x, y)]) ? 200 : 0);
    else score += (hit?.gain ?? 0) - nearest(x, y) * 6;
    if (!pick || score > pick.score) pick = { cell: [x, y], score, target: hit?.t ?? null };
  }
  return { to: pick!.cell, target: pick!.target ? [pick!.target.x, pick!.target.y] : null };
}

/** 我军的行动顺序：张飞先清路，关羽随后，刘备最后。 */
export const ORDER = ['zhang_fei', 'guan_yu', 'liu_bei'];
