import { aiOrder, decide, executionTarget } from './ai';
import { castAttack, conditionRecovery, physicalAttack, strategyUsable, upkeep, useRecoverItem } from './combat';
import { TB, attackTargets, bySlot, foes, friendly, itemName, knownStrategies, maxHp, maxMp, rand, rangeCells, unitAt } from './core';
import { canStop, reachField, route, type Field } from './move';
import type { Battle, Ev, Roster, Unit } from './types';

export interface UnitInit {
  slot: number;
  name: string;
  face: string;
  cls: number;
  level: number;
  lead: number;
  str: number;
  int: number;
  x: number;
  y: number;
  mode: number;
  target?: number;
  goal?: [number, number];
  items?: number[];
}

/** 触发后依次执行的效果。全部是数据，关卡文件里不写代码；slot 是部队槽位。 */
export type Effect =
  | { op: 'gold'; n: number } // 得金
  | { op: 'item'; id: number } // 道具给触发的部队
  | { op: 'talk'; who: string; text: string }
  | { op: 'duel'; a: number; d: number } // 单挑演出，不扣兵力
  | { op: 'levels'; slot: number; n: number } // 剧情升级
  | { op: 'retreat'; slot: number };

/** 关卡脚本里的一条触发记录，对应原版的「部队到达格」和「部队相邻」两种。 */
export interface Trigger {
  flag: string; // 触发一次后记下，不再重复
  who: string | null; // 行动部队的名字；null = 任意我方部队
  at?: [number, number]; // 到达格
  next?: string; // 与之相邻的部队名字
  effects: Effect[];
}

export interface Level {
  id: string;
  name: string;
  goal: string;
  turnLimit: number;
  w: number;
  h: number;
  terrain: number[];
  units: UnitInit[];
  lord: number; // 撤退即败的槽位
  boss: number; // 击破即胜的槽位
  reward: number;
  triggers: Trigger[];
}

const LEVELS: Record<string, Level> = {};
/** 登记一关。关卡是外来的数据，登记时先查一遍，有错直接报出是哪一关的哪一处。 */
export function registerLevel(l: Level): Level {
  const bad = (msg: string) => new Error(`关卡「${l.id}」${msg}`);
  if (l.terrain.length !== l.w * l.h) throw bad(`的地形应有 ${l.w * l.h} 格，实际 ${l.terrain.length} 格`);
  const slots = new Set(l.units.map((u) => u.slot));
  const cells = new Set(l.units.map((u) => `${u.x},${u.y}`));
  if (slots.size !== l.units.length) throw bad('有重复的部队槽位');
  if (cells.size !== l.units.length) throw bad('有两支部队站在同一格');
  for (const u of l.units) {
    if (u.x < 0 || u.y < 0 || u.x >= l.w || u.y >= l.h) throw bad(`的部队 ${u.name} 站在地图外`);
    if (!TB.classNames[u.cls]) throw bad(`的部队 ${u.name} 兵种 ${u.cls} 不存在`);
  }
  const used = [l.lord, l.boss, ...l.triggers.flatMap((t) => t.effects.flatMap((e) => ('slot' in e ? [e.slot] : 'a' in e ? [e.a, e.d] : [])))];
  for (const s of used) if (!slots.has(s)) throw bad(`引用了不存在的部队槽位 ${s}`);
  if (new Set(l.triggers.map((t) => t.flag)).size !== l.triggers.length) throw bad('有重名的触发记录');
  return (LEVELS[l.id] = l);
}
export const levelOf = (b: Battle) => LEVELS[b.level];
export const levelById = (id: string): Level | undefined => LEVELS[id];

/** 不合法的行动一律抛错，玩家与 AI 走同一套检查。 */
function need(ok: unknown, msg: string): asserts ok {
  if (!ok) throw new Error(msg);
}

/** 开战：双方满兵力、满策略值、士气 100。roster 里有记录的玩家部队带着上一战的等级、经验和道具出场。 */
export function newBattle(level: Level, seed: number, roster: Roster = {}): { b: Battle; evs: Ev[] } {
  registerLevel(level);
  const units = level.units.map((i): Unit => {
    const kept = i.mode === 7 ? roster[i.name] : undefined;
    const lv = kept?.level ?? i.level;
    const u: Unit = {
      slot: i.slot, name: i.name, face: i.face, cls: i.cls, level: lv, exp: kept?.exp ?? 0,
      lead: i.lead, str: i.str, int: i.int, hp: maxHp(i.cls, lv), mp: 0, morale: 100,
      x: i.x, y: i.y, on: true, confused: false, moved: false, acted: false,
      mode: i.mode, target: i.target ?? null, goal: i.goal ?? null, items: [...(kept?.items ?? i.items ?? [])],
    };
    u.mp = maxMp(u);
    return u;
  });
  const b: Battle = {
    level: level.id, w: level.w, h: level.h, terrain: [...level.terrain], units,
    round: 1, stage: 'player', weather: 1, rng: seed >>> 0, gold: 0, flags: [], queue: [], undo: null, reason: '',
  };
  const evs: Ev[] = [];
  beginRound(b, evs);
  return { b, evs };
}

function finish(b: Battle, won: boolean, text: string, evs: Ev[]): void {
  if (b.stage === 'won' || b.stage === 'lost') return;
  b.stage = won ? 'won' : 'lost';
  b.reason = text;
  b.queue = [];
  b.undo = null;
  if (won) b.gold += levelOf(b).reward;
  evs.push({ t: 'end', won, text });
}
const over = (b: Battle) => b.stage === 'won' || b.stage === 'lost';
/** 是否轮到友军或敌军自动行动。 */
export const autoPhase = (b: Battle) => b.stage === 'ally' || b.stage === 'enemy';

/** 回合开始：超过回合上限即败；掷天气；清行动标记；我方 15 个槽位依次做地形恢复和混乱恢复。 */
function beginRound(b: Battle, evs: Ev[]): void {
  if (b.round > levelOf(b).turnLimit) return finish(b, false, `超过 ${levelOf(b).turnLimit} 回合，全军撤退`, evs);
  b.weather = nextWeather(b);
  evs.push({ t: 'round', round: b.round, weather: b.weather });
  for (const u of b.units) (u.moved = false), (u.acted = false);
  for (let s = 0; s < 15; s++) upkeep(b, s, evs);
  for (let s = 0; s < 15; s++) conditionRecovery(b, s, evs);
  b.stage = 'player';
  evs.push({ t: 'stage', stage: 'player' });
}

/** 天气：向 rand(6) 的方向走一步，再把两端 0 和 5 对调（原版如此）。 */
function nextWeather(b: Battle): number {
  const r = rand(b, 6);
  const next = b.weather + (b.weather < r ? 1 : b.weather > r ? -1 : 0);
  return next === 0 ? 5 : next === 5 ? 0 : next;
}

/** 玩家此刻能否指挥这支部队。 */
export const canCommand = (b: Battle, u: Unit) =>
  b.stage === 'player' && u.on && friendly(u.slot) && u.mode === 7 && !u.confused && !u.acted && (!b.undo || b.undo.slot === u.slot);

/** 行动结束后的关卡触发与胜败判定：先「到达格」，再按上右下左查「相邻」，最后看主将与全灭。 */
function hooks(b: Battle, u: Unit, evs: Ev[]): void {
  const lv = levelOf(b);
  const fire = (t: Trigger) => {
    if (over(b) || b.flags.includes(t.flag)) return;
    b.flags.push(t.flag);
    for (const e of t.effects) {
      if (e.op === 'gold') script.gold(b, u, e.n, evs);
      else if (e.op === 'item') script.item(u, e.id, evs);
      else if (e.op === 'talk') evs.push({ t: 'talk', who: e.who, text: e.text });
      else if (e.op === 'duel') evs.push({ t: 'duel', a: e.a, d: e.d });
      else if (e.op === 'levels') script.levels(bySlot(b, e.slot)!, e.n, evs);
      else script.retreat(b, e.slot, evs);
    }
  };
  const mine = (t: Trigger) => (t.who === null ? friendly(u.slot) : t.who === u.name);
  if (u.on) {
    for (const t of lv.triggers) if (t.at && mine(t) && t.at[0] === u.x && t.at[1] === u.y) fire(t);
    for (const [dx, dy] of TB.cardinal) {
      const n = u.on ? unitAt(b, u.x + dx, u.y + dy) : undefined;
      if (n) for (const t of lv.triggers) if (t.next === n.name && mine(t)) fire(t);
    }
  }
  settle(b, evs);
}

function settle(b: Battle, evs: Ev[]): void {
  const lv = levelOf(b);
  if (!bySlot(b, lv.lord)?.on) return finish(b, false, `${bySlot(b, lv.lord)?.name}撤退`, evs);
  if (!bySlot(b, lv.boss)?.on) return finish(b, true, `击破${bySlot(b, lv.boss)?.name}`, evs);
  if (!b.units.some((x) => x.on && !friendly(x.slot))) finish(b, true, '敌军全灭', evs);
}

function done(b: Battle, u: Unit, evs: Ev[]): Ev[] {
  u.acted = true;
  b.undo = null;
  hooks(b, u, evs);
  return evs;
}

function manual(b: Battle, slot: number): Unit {
  const u = bySlot(b, slot);
  need(u && canCommand(b, u), '这支部队现在不能下令');
  return u;
}

/** 移动（玩家）。移动后必须接着行动或取消。 */
export function doMove(b: Battle, slot: number, x: number, y: number): Ev[] {
  const u = manual(b, slot);
  need(!u.moved, '本回合已经移动过');
  const f = reachField(b, u);
  need(canStop(b, u, f, x, y), '不能移动到那里');
  return step(b, u, f, x, y);
}

/** 玩家与 AI 共用的移动落地。 */
function step(b: Battle, u: Unit, f: Field, x: number, y: number): Ev[] {
  const path = route(b, u, f, x, y);
  need(path && canStop(b, u, f, x, y), '没有可走的路线');
  if (path.length < 2) return [];
  b.undo = u.mode === 7 ? { slot: u.slot, x: u.x, y: u.y } : null;
  u.x = x;
  u.y = y;
  u.moved = true;
  return [{ t: 'move', slot: u.slot, path }];
}

/** 取消指令菜单：退回原位，移动作废。 */
export function undoMove(b: Battle): boolean {
  const u = b.undo && bySlot(b, b.undo.slot);
  if (!b.undo || !u || u.acted) return false;
  u.x = b.undo.x;
  u.y = b.undo.y;
  u.moved = false;
  b.undo = null;
  return true;
}

function attackUnit(b: Battle, u: Unit, d: Unit | undefined, evs: Ev[]): Ev[] {
  need(d && d.on && attackTargets(b, u).includes(d), '目标不在攻击范围内');
  evs.push(...physicalAttack(b, u, d));
  return done(b, u, evs);
}
export const doAttack = (b: Battle, slot: number, target: number) => attackUnit(b, manual(b, slot), bySlot(b, target), []);

/** 待命不改变士气。 */
export const doWait = (b: Battle, slot: number) => done(b, manual(b, slot), []);

/** 策略能打到的敌军（范围、地形、天气都合格）。 */
export function castTargets(b: Battle, u: Unit, id: number): Unit[] {
  if (!knownStrategies(u).includes(id) || u.mp < TB.strategyMp[id]) return [];
  return rangeCells(b, u.x, u.y, TB.strategyCategory[id] | 0x80)
    .map(([x, y]) => unitAt(b, x, y))
    .filter((d): d is Unit => !!d && foes(u, d) && strategyUsable(b, id, d));
}
function castAt(b: Battle, u: Unit, id: number, d: Unit | undefined, evs: Ev[]): Ev[] {
  need(d && castTargets(b, u, id).includes(d), '不能对该目标使用这个策略');
  evs.push(...castAttack(b, u, d, id));
  return done(b, u, evs);
}
export const doCast = (b: Battle, slot: number, id: number, target: number) => castAt(b, manual(b, slot), id, bySlot(b, target), []);

/** 回复道具的规格：[等级, 种类]，种类 1 兵力、2 士气。豆麦米 = 30–32，酒系 = 27–29。 */
const recoverSpec = (id: number): [number, number] | null => (id >= 27 && id <= 32 ? [id % 3, id >= 30 ? 1 : 2] : null);

/** 道具可用对象：自己和周围 8 格内、确实有东西可回复的我方部队。 */
export function itemTargets(b: Battle, u: Unit, id: number): Unit[] {
  const spec = recoverSpec(id);
  if (!spec || !u.items.includes(id)) return [];
  const cells: [number, number][] = [[u.x, u.y], ...rangeCells(b, u.x, u.y, spec[0] | 0x80)];
  return cells
    .map(([x, y]) => unitAt(b, x, y))
    .filter((d): d is Unit => !!d && !foes(u, d) && (spec[1] === 1 ? d.hp < maxHp(d.cls, d.level) : d.morale < 100 || d.confused));
}
export function doItem(b: Battle, slot: number, id: number, target: number): Ev[] {
  const u = manual(b, slot);
  const d = bySlot(b, target);
  need(d && itemTargets(b, u, id).includes(d), '不能对该目标使用这个道具');
  const evs: Ev[] = [];
  const [tier, kind] = recoverSpec(id)!;
  useRecoverItem(b, d, tier, kind, evs);
  u.items.splice(u.items.indexOf(id), 1);
  return done(b, u, evs);
}

/** 结束我军阶段，进入友军行动。 */
export function endPhase(b: Battle): Ev[] {
  need(b.stage === 'player', '现在不是我军阶段');
  undoMove(b);
  b.queue = aiOrder(b, false);
  b.stage = 'ally';
  return [{ t: 'stage', stage: 'ally' }];
}

/** 推进一步自动行动：一支 AI 部队行动一次，或切换到下一阶段 / 下一回合。 */
export function aiStep(b: Battle): Ev[] {
  need(b.stage === 'ally' || b.stage === 'enemy', '现在没有自动行动');
  const evs: Ev[] = [];
  while (b.queue.length) {
    const u = bySlot(b, b.queue.shift()!);
    if (!u || !u.on || u.mode === 7 || u.acted) continue;
    const d = decide(b, u);
    if (d.dest !== u.y * b.w + u.x) evs.push(...step(b, u, d.field, d.dest % b.w, Math.floor(d.dest / b.w)));
    u.mode = d.mode;
    u.target = d.preferred;
    if (d.strategy !== null && d.attack !== null) return castAt(b, u, d.strategy, bySlot(b, d.attack), evs);
    const t = d.mode === 4 ? undefined : executionTarget(b, u, d.attack);
    if (t) return attackUnit(b, u, t, evs);
    if (u.moved) hooks(b, u, evs);
    if (evs.length || over(b)) return evs;
  }
  if (b.stage === 'ally') {
    for (let s = 15; s < 45; s++) (upkeep(b, s, evs), conditionRecovery(b, s, evs));
    b.queue = aiOrder(b, true);
    b.stage = 'enemy';
    evs.push({ t: 'stage', stage: 'enemy' });
  } else {
    b.round++;
    beginRound(b, evs);
  }
  return evs;
}

/** 关卡脚本用的小动作。 */
export const script = {
  /** 道具给触发的部队，放进第一个空位；8 格全满则放弃。 */
  item(u: Unit, id: number, evs: Ev[]) {
    if (u.items.length < 8) u.items.push(id);
    evs.push({ t: 'gain', slot: u.slot, text: u.items.includes(id) ? `得到「${itemName(id)}」` : `道具已满，放弃了「${itemName(id)}」` });
  },
  gold(b: Battle, u: Unit, n: number, evs: Ev[]) {
    b.gold += n;
    evs.push({ t: 'gain', slot: u.slot, text: `得到 ${n} 金` });
  },
  /** 剧情升级：直接加等级（到 99 为止），经验不变。 */
  levels(u: Unit, n: number, evs: Ev[]) {
    const before = knownStrategies(u);
    const levels = Math.min(n, 99 - u.level);
    u.level += levels;
    evs.push({ t: 'exp', slot: u.slot, gain: 0, levels, learned: knownStrategies(u).filter((id) => !before.includes(id)) });
  },
  retreat(b: Battle, slot: number, evs: Ev[]) {
    const u = bySlot(b, slot);
    if (u?.on) (u.on = false), evs.push({ t: 'retreat', slot });
  },
};

/** 战后把玩家部队的成长记下来，带进下一战（撤退的也算）。 */
export const harvest = (b: Battle): Roster =>
  Object.fromEntries(b.units.filter((u) => u.mode === 7 && friendly(u.slot)).map((u) => [u.name, { level: u.level, exp: u.exp, items: [...u.items] }]));
