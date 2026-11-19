import { aiOrder, decide, executionTarget } from './ai';
import { castAttack, castSupport, conditionRecovery, physicalAttack, strategyUsable, upkeep, useItem } from './combat';
import { specOf } from '../data/items';
import { strategySpec } from '../data/strategies';
import { TB, attackTargets, bySlot, foes, friendly, itemName, knownStrategies, maxHp, maxMp, moveCost, rand, rangeCells, unitAt } from './core';
import { canStop, reachField, route, type Field } from './move';
import type { Battle, Flag, Roster, Unit } from './types';
import type { Ev } from './types';

export interface UnitInit {
  slot: number;
  requiresFlag?: string; // 原始 battle_setup 的条件参战标志
  key?: string; // 武将 id（原版 officer id）；杂兵没有，按名字认
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
  commander?: boolean; // 敌军主将：胜利条件「击破主将」看这个标记
  group?: string; // 增援组：开战时不在场，事件触发后登场
  off?: boolean; // 开战时不在场（增援）
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
/** 出征名单：最多几支部队、必须出战的人、不能出战的人、摆在哪。 */
export interface Deploy {
  max: number;
  required: string[];
  forbidden: string[];
  slots: [number, number][];
}

/** 胜利条件，任一满足即胜。 */
export type Victory =
  | { kind: 'commander' } // 击破敌军主将
  | { kind: 'all' } // 敌军全灭
  | { kind: 'unit'; target: string } // 击破某支部队
  | { kind: 'reach'; who: string | null; x: number; y: number; radius: number }; // 某部队到达指定格
/** 失败条件，任一满足即败。 */
export type Defeat = { kind: 'unit'; target: string } | { kind: 'turn' };

/** 事件触发方式。 */
export interface EventTrigger {
  type: 'turn_start' | 'adjacent' | 'reach' | 'unit_defeated';
  turn?: number; // turn_start：第几回合
  side?: 'player' | 'ally' | 'enemy'; // turn_start：哪一方的回合开始时
  a?: string; // adjacent：行动部队
  b?: string; // adjacent：相邻的部队
  who?: string | null; // reach：谁到达（null = 任意我方）
  pos?: [number, number]; // reach：目标格
  radius?: number; // reach：半径，0 = 正好这一格
  target?: string; // unit_defeated：哪支部队被击破
}

/** 事件里的一个判断：读战场上的脚本标志。 */
export interface Cond {
  flag: string;
  cmp?: '==' | '!=' | '>' | '<';
  value?: Flag;
}

/** 事件动作。state 变更立即生效，画面演出按顺序排队（drama、retreat、spawn…）。 */
export type BAction =
  | { op: 'drama'; scene: string } // 播一幕剧
  | { op: 'ai'; target: string; mode: number; goal: [number, number] | null; prefer: string | null }
  | { op: 'flag'; flag: string; value: Flag }
  | { op: 'retreat'; target: string }
  | { op: 'level'; target: string; n: number }
  | { op: 'item'; item: string | number }
  | { op: 'gold'; n: number }
  | { op: 'halve'; side: 'player' | 'ally' | 'enemy'; stat: string }
  | { op: 'spawn'; group: string }
  | { op: 'terrain'; x: number; y: number; terrain: string }
  | { op: 'objective'; text: string }
  | { op: 'victory' }
  | { op: 'defeat' }
  | { op: 'when'; when: Cond[]; actions: BAction[] }
  | { op: 'stage'; stage: number };

export interface BattleEvent {
  stage?: number;
  once?: boolean;
  trigger: EventTrigger;
  actions: BAction[];
}

/** 地图上的宝物：谁踩上去就归谁。 */
export interface Treasure {
  x: number;
  y: number;
  item: number | null;
  gold: number;
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
  reward: number;
  /** 地图与棋子的素材键（相对 assets/）；不写就用清单里的。 */
  map?: string;
  tokens?: string;
  /** 这一关的曲子：我军 / 友军阶段与敌军阶段各一首（原版每关都带）。 */
  bgm?: string;
  bgmEnemy?: string;

  /* 旧接口：单主将、单敌将、踩格得金。保留给早期关卡，也方便测试直接写小关卡。 */
  lord?: number;
  boss?: number;
  triggers: Trigger[];

  /* 整部游戏的关卡用这一套。 */
  deploy?: Deploy;
  candidates?: Record<string, UnitInit>; // 可出征的武将模板，按 officer id 索引
  victory?: Victory[];
  defeat?: Defeat[];
  events?: BattleEvent[];
  treasures?: Treasure[];
}

const LEVELS: Record<string, Level> = {};
/** 登记一关。关卡是外来的数据，登记时先查一遍，有错直接报出是哪一关的哪一处。 */
export function registerLevel(l: Level): Level {
  const bad = (msg: string) => new Error(`关卡「${l.id}」${msg}`);
  if (l.terrain.length !== l.w * l.h) throw bad(`的地形应有 ${l.w * l.h} 格，实际 ${l.terrain.length} 格`);
  const slots = new Set(l.units.map((u) => u.slot));
  const cells = new Set(l.units.filter((u) => !u.off).map((u) => `${u.x},${u.y}`));
  if (slots.size !== l.units.length) throw bad('有重复的部队槽位');
  if (cells.size !== l.units.filter((u) => !u.off).length) throw bad('有两支部队站在同一格');
  for (const u of l.units) {
    if (u.x < 0 || u.y < 0 || u.x >= l.w || u.y >= l.h) throw bad(`的部队 ${u.name} 站在地图外`);
    if (!TB.classNames[u.cls]) throw bad(`的部队 ${u.name} 兵种 ${u.cls} 不存在`);
  }
  const used = [l.lord, l.boss, ...l.triggers.flatMap((t) => t.effects.flatMap((e) => ('slot' in e ? [e.slot] : 'a' in e ? [e.a, e.d] : [])))];
  for (const s of used) if (s !== undefined && !slots.has(s)) throw bad(`引用了不存在的部队槽位 ${s}`);
  if (new Set(l.triggers.map((t) => t.flag)).size !== l.triggers.length) throw bad('有重名的触发记录');
  return (LEVELS[l.id] = l);
}
export const levelOf = (b: Battle) => LEVELS[b.level];
export const levelById = (id: string): Level | undefined => LEVELS[id];

/** 不合法的行动一律抛错，玩家与 AI 走同一套检查。 */
function need(ok: unknown, msg: string): asserts ok {
  if (!ok) throw new Error(msg);
}

export interface BattleOpts {
  deploy?: string[]; // 出征名单（officer id），按顺序占槽位
  /** 玩家在布阵画面亲手摆的位置：officer id → 格坐标。没给的按关卡自带的出兵位顺序摆。 */
  slots?: Record<string, [number, number]>;
  flags?: Record<string, Flag>; // 从流程带进来的脚本标志
}

/** 按名字或武将 id 找在场部队。 */
const findUnit = (b: Battle, key: string) => b.units.find((u) => u.on && (u.key === key || u.name === key));

/** 增援登场时就近找一个空格。 */
function freeCell(b: Battle, u: Unit): [number, number] | undefined {
  const busy = (x: number, y: number) => b.units.some((o) => o.on && o.x === x && o.y === y);
  for (let r = 1; r < 12; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const [x, y] = [u.x + dx, u.y + dy];
        if (x < 0 || y < 0 || x >= b.w || y >= b.h || busy(x, y)) continue;
        if (moveCost(u.cls, b.terrain[y * b.w + x]) === 255) continue;
        return [x, y];
      }
    }
  }
  return undefined;
}

/** 开战：双方满兵力、满策略值、士气 100。roster 里有记录的部队带着上一战的等级、经验和道具出场。 */
export function newBattle(level: Level, seed: number, roster: Roster = {}, opts: BattleOpts = {}): { b: Battle; evs: Ev[] } {
  registerLevel(level);
  const mk = (i: UnitInit): Unit => {
    const kept = roster[i.key ?? ''] ?? roster[i.name];
    const lv = kept?.level ?? i.level;
    const cls = kept?.cls ?? i.cls;
    const u: Unit = {
      slot: i.slot, key: i.key ?? i.name, name: i.name, face: i.face, cls, level: lv, exp: kept?.exp ?? 0,
      lead: kept?.lead ?? i.lead, str: kept?.str ?? i.str, int: kept?.int ?? i.int, hp: maxHp(cls, lv), mp: 0, morale: 100,
      x: i.x, y: i.y, on: !i.off, confused: false, confusedTurns: 0, moved: false, acted: false,
      mode: i.mode, target: i.target ?? null, goal: i.goal ?? null, items: [...(kept?.items ?? i.items ?? [])],
      commander: !!i.commander, group: i.group,
    };
    u.mp = maxMp(u);
    return u;
  };
  const units = level.units.filter((u) => !u.requiresFlag || !!opts.flags?.[u.requiresFlag]).map(mk);
  // 出征名单：把我军按顺序摆进出征位，槽位从 0 起
  const picked = (opts.deploy ?? []).slice(0, level.deploy?.max ?? 0);
  picked.forEach((key, i) => {
    const t = level.candidates?.[key];
    const at = opts.slots?.[key] ?? level.deploy?.slots[i];
    if (!t || !at) return;
    units.push(mk({ ...t, slot: i, key, x: at[0], y: at[1], mode: 7 }));
  });
  units.sort((a, c) => a.slot - c.slot);
  const b: Battle = {
    level: level.id, w: level.w, h: level.h, terrain: [...level.terrain], units,
    round: 1, stage: 'player', weather: 1, rng: seed >>> 0, gold: 0, flags: [], vars: { ...(opts.flags ?? {}) },
    objective: level.goal, queue: [], undo: null, reason: '',
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
  events(b, 'turn_start', { side: 'player' }, evs);
  settle(b, evs);
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

// ---------------------------------------------------------------- 战场事件 ----
function cond(b: Battle, c: Cond): boolean {
  const v = b.vars[c.flag];
  const want = c.value ?? true;
  switch (c.cmp ?? '==') {
    case '==': return v === want || (typeof v === 'number' && typeof want === 'number' && v === want);
    case '!=': return v !== want;
    case '>': return Number(v) > Number(want);
    default: return Number(v) < Number(want);
  }
}

/** 一次事件动作。演出类动作按顺序压进 evs；状态变更当场生效。 */
function act(b: Battle, a: BAction, u: Unit | null, evs: Ev[]): void {
  const target = 'target' in a && typeof a.target === 'string' ? findUnit(b, a.target) : undefined;
  switch (a.op) {
    case 'drama': evs.push({ t: 'drama', scene: a.scene }); break;
    case 'flag': b.vars[a.flag] = a.value; break;
    case 'ai':
      if (target) {
        target.mode = a.mode;
        target.goal = a.goal ?? null;
        target.target = a.prefer ? (findUnit(b, a.prefer)?.slot ?? null) : null;
      }
      break;
    case 'retreat': if (target) script.retreat(b, target.slot, evs); break;
    case 'level': if (target) script.levels(target, a.n, evs); break;
    case 'item': {
      const id = typeof a.item === 'number' ? a.item : itemId(a.item);
      const owner = u ?? b.units.find((x) => x.mode === 7 && x.on);
      if (id !== undefined && owner) script.item(owner, id, evs);
      break;
    }
    case 'gold': b.gold += a.n; evs.push({ t: 'gain', slot: (u ?? b.units[0]).slot, text: `得到 ${a.n} 金` }); break;
    case 'halve':
      for (const x of b.units) {
        const side = x.slot >= 15 ? 'enemy' : x.mode === 7 ? 'player' : 'ally';
        if (!x.on || side !== a.side || !x.hp) continue;
        const delta = -Math.floor(x.hp / 2);
        x.hp += delta;
        evs.push({ t: 'hp', slot: x.slot, delta });
      }
      break;
    case 'spawn': {
      const group = b.vars[`__spawned_${a.group}`];
      if (group) break;
      b.vars[`__spawned_${a.group}`] = true;
      const slots = b.units.filter((x) => !x.on && x.group === a.group).map((x) => x.slot);
      for (const s of slots) {
        const x = bySlot(b, s)!;
        x.on = true;
        x.hp = maxHp(x.cls, x.level);
        x.morale = 100;
        // 增援出现的位置若已被占，就近找个空格站
        if (b.units.some((o) => o !== x && o.on && o.x === x.x && o.y === x.y)) {
          const free = freeCell(b, x);
          if (free) (x.x = free[0]), (x.y = free[1]);
        }
      }
      if (slots.length) evs.push({ t: 'spawn', slots });
      break;
    }
    case 'terrain': {
      const code = terrainCode(a.terrain);
      if (a.x >= 0 && a.y >= 0 && a.x < b.w && a.y < b.h) b.terrain[a.y * b.w + a.x] = code;
      evs.push({ t: 'terrain', x: a.x, y: a.y, code });
      break;
    }
    case 'objective': b.objective = a.text; evs.push({ t: 'objective', text: a.text }); break;
    case 'victory': finish(b, true, b.objective || '达成胜利条件', evs); break;
    case 'defeat': finish(b, false, '达成失败条件', evs); break;
    case 'when': if (a.when.every((c) => cond(b, c))) for (const x of a.actions) act(b, x, u, evs); break;
    case 'stage': break; // 原版用于切换行动方，本作由回合流程控制
  }
}

/** 道具名 → 引擎道具号。由数据层在装载时填好。 */
let ITEMS: Record<string, number> = {};
export function setItemTable(t: Record<string, number>): void {
  ITEMS = t;
}
const itemId = (name: string) => (typeof ITEMS[name] === 'number' ? ITEMS[name] : ITEMS[name.replace(/^item_/, '')]);

/** 地形名 → 地形码。由数据层在装载时填好。 */
let TERRAIN: Record<string, number> = {};
export function setTerrainTable(t: Record<string, number>): void {
  TERRAIN = t;
}
const terrainCode = (name: string) => TERRAIN[name] ?? 0;

/** 判断一个触发条件此刻是否成立。 */
function match(b: Battle, t: EventTrigger, kind: 'turn_start' | 'act' | 'unit_defeated', ctx: { side?: string; u?: Unit }): boolean {
  // 相邻与到达都是部队行动结束（act）时查的
  const asked = kind === 'act' ? t.type === 'adjacent' || t.type === 'reach' : t.type === kind;
  if (!asked) return false;
  if (t.type === 'turn_start') {
    if (t.turn !== undefined && t.turn !== b.round) return false;
    return !t.side || t.side === (ctx.side ?? 'player');
  }
  const u = ctx.u;
  if (!u) return false;
  if (t.type === 'unit_defeated') return u.key === t.target || u.name === t.target;
  if (!u.on) return false;
  if (t.type === 'adjacent') {
    const a = t.a ? findUnit(b, t.a) : u;
    const o = t.b ? findUnit(b, t.b) : undefined;
    if (!a || !o || (a !== u && o !== u)) return false;
    return TB.cardinal.some(([dx, dy]) => a.x + dx === o.x && a.y + dy === o.y);
  }
  if (t.who ? !(u.key === t.who || u.name === t.who) : u.mode !== 7) return false;
  const [tx, ty] = t.pos ?? [-1, -1];
  return Math.max(Math.abs(u.x - tx), Math.abs(u.y - ty)) <= (t.radius ?? 0);
}

/** 跑一遍战场事件：回合开始、部队行动后、部队被击破。 */
function events(b: Battle, kind: 'turn_start' | 'act' | 'unit_defeated', ctx: { side?: string; u?: Unit }, evs: Ev[]): void {
  const list = levelOf(b).events ?? [];
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    if (over(b)) return;
    const once = e.once !== false;
    if (once && b.flags.includes(`event:${i}`)) continue;
    if (!match(b, e.trigger, kind, ctx)) continue;
    if (once) b.flags.push(`event:${i}`);
    for (const a of e.actions) act(b, a, ctx.u ?? null, evs);
  }
}

/** 部队刚被打掉（兵力归零离场）时的事件。 */
function defeated(b: Battle, evs: Ev[]): void {
  for (const u of b.units) {
    if (u.on || u.hp > 0 || b.flags.includes(`dead:${u.slot}`)) continue;
    b.flags.push(`dead:${u.slot}`);
    events(b, 'unit_defeated', { u }, evs);
  }
}

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
    // 地图上的宝物：踩上去就归这支部队（原版只有我方会捡）
    if (friendly(u.slot)) {
      for (const tr of lv.treasures ?? []) {
        const key = `loot:${tr.x},${tr.y}`;
        if (b.flags.includes(key) || tr.x !== u.x || tr.y !== u.y) continue;
        b.flags.push(key);
        if (tr.gold) script.gold(b, u, tr.gold, evs);
        else if (tr.item !== null) script.item(u, tr.item, evs);
      }
    }
  }
  events(b, 'act', { u }, evs);
  settle(b, evs);
}

function settle(b: Battle, evs: Ev[]): void {
  if (over(b)) return;
  const lv = levelOf(b);
  const lord = b.units.find((u) => u.mode === 7 && u.key === 'liu_bei') ?? (lv.lord !== undefined ? bySlot(b, lv.lord) : undefined);
  // 失败：主将撤退、名单上的人撤退、回合数用尽
  for (const d of lv.defeat ?? []) {
    if (d.kind === 'unit') {
      const u = findUnit(b, d.target) ?? b.units.find((x) => x.key === d.target || x.name === d.target);
      if (u && !u.on) return finish(b, false, `${u.name}撤退`, evs);
    }
  }
  if (lord && !lord.on) return finish(b, false, `${lord.name}撤退`, evs);
  const wins = lv.victory ?? [];
  if (wins.some((v) => v.kind === 'commander')) {
    const cmdr = b.units.filter((u) => u.commander && u.slot >= 15);
    const left = cmdr.length ? cmdr : b.units.filter((u) => u.slot === 15);
    if (left.every((u) => !u.on)) return finish(b, true, `击破${left[0]?.name ?? '敌军主将'}`, evs);
  }
  if (wins.some((v) => v.kind === 'unit')) {
    for (const v of wins) {
      if (v.kind !== 'unit') continue;
      const u = b.units.find((x) => x.key === v.target || x.name === v.target);
      if (u && !u.on) return finish(b, true, `击破${u.name}`, evs);
    }
  }
  if (wins.some((v) => v.kind === 'reach')) {
    for (const v of wins) {
      if (v.kind !== 'reach') continue;
      const who = v.who ? findUnit(b, v.who) : b.units.find((u) => u.mode === 7 && u.on);
      if (who && Math.max(Math.abs(who.x - v.x), Math.abs(who.y - v.y)) <= (v.radius ?? 0)) return finish(b, true, `${who.name}到达目的地`, evs);
    }
  }
  // 旧接口：单敌将
  if (lv.boss !== undefined && !bySlot(b, lv.boss)?.on) return finish(b, true, `击破${bySlot(b, lv.boss)?.name}`, evs);
  if (!b.units.some((x) => x.on && x.slot >= 15)) return finish(b, true, '敌军全灭', evs);
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
  b.undo = u.mode === 7 ? { slot: u.slot, x: u.x, y: u.y, facingLeft: u.facingLeft } : null;
  for (let i = 1; i < path.length; i++) {
    const dx = path[i][0] - path[i - 1][0];
    if (dx) u.facingLeft = dx < 0;
  }
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
  u.facingLeft = b.undo.facingLeft;
  u.moved = false;
  b.undo = null;
  return true;
}

function attackUnit(b: Battle, u: Unit, d: Unit | undefined, evs: Ev[]): Ev[] {
  need(d && d.on && attackTargets(b, u).includes(d), '目标不在攻击范围内');
  evs.push(...physicalAttack(b, u, d));
  defeated(b, evs);
  return done(b, u, evs);
}
export const doAttack = (b: Battle, slot: number, target: number) => attackUnit(b, manual(b, slot), bySlot(b, target), []);

/** 待命不改变士气。 */
export const doWait = (b: Battle, slot: number) => done(b, manual(b, slot), []);

/** 策略能选的目标：攻击系要过地形/天气，回复系要确实有东西可回复；
 * 群体策略（大援助、大激励…）只要范围内有友军就能放，哪怕都已经满员。
 * free = true 给策略书 / 爆彈用：不检查是否学会、也不扣策略值。 */
export function castTargets(b: Battle, u: Unit, id: number, free = false): Unit[] {
  const spec = strategySpec(id);
  if (!spec) return [];
  if (!free && (!knownStrategies(u).includes(id) || u.mp < spec.mp)) return [];
  const cells: [number, number][] = spec.area === 'all_in_range'
    ? [[u.x, u.y], ...rangeCells(b, u.x, u.y, spec.range | 0x80)]
    : rangeCells(b, u.x, u.y, spec.range | 0x80);
  const inRange = cells.map(([x, y]) => unitAt(b, x, y)).filter((d): d is Unit => !!d?.on);
  if (spec.target === 'enemy') {
    return inRange.filter((d) => foes(u, d) && (spec.kind !== 'attack' || strategyUsable(b, id, d)));
  }
  return inRange.filter((d) => !foes(u, d) && (spec.area === 'all_in_range' || supportNeeded(d, spec)));
}

/** 单体回复 / 激励的对象是否还有东西可回：兵力没满、士气没满或处于混乱。 */
function supportNeeded(d: Unit, spec: ReturnType<typeof strategySpec>): boolean {
  if (!spec) return false;
  const heal = spec.effects.some((e) => e.type === 'heal') && d.hp < maxHp(d.cls, d.level);
  const morale = spec.effects.some((e) => e.type === 'morale' && (e.amount ?? 0) > 0) && (d.morale < 100 || d.confused);
  const status = spec.effects.some((e) => e.type === 'status');
  return heal || morale || status;
}

/** 结算一条策略（不校验目标、不记已行动），攻击系走 castAttack，其余走 castSupport。 */
function castInto(b: Battle, u: Unit, id: number, d: Unit | undefined, evs: Ev[], free: boolean): Ev[] {
  const spec = strategySpec(id)!;
  if (spec.kind === 'attack') {
    evs.push(...castAttack(b, u, d!, id));
    defeated(b, evs);
  } else {
    evs.push(...castSupport(b, u, d, id));
  }
  if (!free) u.mp = (u.mp - spec.mp) & 0xff;
  return evs;
}
function castAt(b: Battle, u: Unit, id: number, d: Unit | undefined, evs: Ev[], free = false): Ev[] {
  need(d && castTargets(b, u, id, free).includes(d), '不能对该目标使用这个策略');
  return done(b, u, castInto(b, u, id, d, evs, free));
}
export const doCast = (b: Battle, slot: number, id: number, target: number) => castAt(b, manual(b, slot), id, bySlot(b, target), []);

/** 群体策略：不用选目标，对自己周围的所有友军一起施放。 */
export function doCastAll(b: Battle, slot: number, id: number): Ev[] {
  const u = manual(b, slot);
  const spec = strategySpec(id);
  need(spec?.area === 'all_in_range' && castTargets(b, u, id).length, '现在不能使用这个策略');
  return done(b, u, castInto(b, u, id, undefined, [], false));
}

/** 回复道具的使用范围：自己 + 周围一圈；档位高的多一圈（原版豆/麦/米、酒三档、伤药三类）。
 * 返回 null 表示这件道具在战场上用不了（武器、兵书、转职书）。 */
function recoverSpec(id: number): { tier: number; heal: boolean; morale: boolean } | null {
  const s = specOf(id);
  if (!s || !s.battle || (!s.heal && !s.morale)) return null;
  const tier = id >= 27 && id <= 32 ? id % 3 : id >= 52 && id <= 54 ? id - 52 : 0;
  return { tier, heal: !!s.heal, morale: !!s.morale };
}

/** 道具可用对象：策略书按策略的范围选目标，回复道具按自己 + 周围的范围选有东西可回的我方部队。 */
export function itemTargets(b: Battle, u: Unit, id: number): Unit[] {
  const it = specOf(id);
  if (!it || !u.items.includes(id)) return [];
  if (it.strategyId != null) return castTargets(b, u, it.strategyId, true);
  const spec = recoverSpec(id);
  if (!spec) return [];
  const cells: [number, number][] = [[u.x, u.y], ...rangeCells(b, u.x, u.y, spec.tier | 0x80)];
  return cells
    .map(([x, y]) => unitAt(b, x, y))
    .filter((d): d is Unit => !!d && !foes(u, d) &&
      ((spec.heal && d.hp < maxHp(d.cls, d.level)) || (spec.morale && (d.morale < 100 || d.confused))));
}
export function doItem(b: Battle, slot: number, id: number, target: number): Ev[] {
  const u = manual(b, slot);
  const d = bySlot(b, target);
  need(d && itemTargets(b, u, id).includes(d), '不能对该目标使用这个道具');
  const it = specOf(id)!;
  const evs: Ev[] = [];
  // 火龍書、援隊書这类「用一次策略」的道具：不扣策略值，也不算学会
  if (it.strategyId != null) castInto(b, u, it.strategyId, d, evs, true);
  else useItem(b, d!, it, evs);
  u.items.splice(u.items.indexOf(id), 1);
  return done(b, u, evs);
}

/** 群体策略书（援隊書、大激勵書…）：不用选目标，直接施放。 */
export function doItemAll(b: Battle, slot: number, id: number): Ev[] {
  const u = manual(b, slot);
  const it = specOf(id);
  const sid = it?.strategyId;
  need(sid != null && u.items.includes(id) && strategySpec(sid)?.area === 'all_in_range' && castTargets(b, u, sid, true).length, '现在不能使用这个道具');
  const evs: Ev[] = [];
  castInto(b, u, sid!, undefined, evs, true);
  u.items.splice(u.items.indexOf(id), 1);
  return done(b, u, evs);
}

/** 一支部队最多带 8 件道具：原版存档记录里道具就是 8 个槽。 */
export const MAX_ITEMS = 8;

/** 给予的对象：身边一圈（含斜角）的友军，且道具栏没满。 */
export function giveTargets(b: Battle, u: Unit, id: number): Unit[] {
  if (!u.items.includes(id)) return [];
  return b.units.filter((d) => d.on && d.slot !== u.slot && !foes(u, d) &&
    Math.max(Math.abs(d.x - u.x), Math.abs(d.y - u.y)) === 1 && d.items.length < MAX_ITEMS);
}

/** 给予：把一件道具交给身边的友军。和「使用」一样算一次行动。 */
export function doGive(b: Battle, slot: number, id: number, target: number): Ev[] {
  const u = manual(b, slot);
  const d = bySlot(b, target);
  need(d && giveTargets(b, u, id).includes(d), '不能把道具交给这支部队');
  u.items.splice(u.items.indexOf(id), 1);
  d!.items.push(id);
  return done(b, u, [{ t: 'give', a: u.slot, d: d!.slot, item: id }]);
}

/** 丢弃：把一件道具扔掉。也算一次行动，腾出道具栏。 */
export function doDrop(b: Battle, slot: number, id: number): Ev[] {
  const u = manual(b, slot);
  need(u.items.includes(id), '没有这件道具');
  u.items.splice(u.items.indexOf(id), 1);
  return done(b, u, [{ t: 'drop', slot: u.slot, item: id }]);
}

/** 结束我军阶段，进入友军行动。 */
export function endPhase(b: Battle): Ev[] {
  need(b.stage === 'player', '现在不是我军阶段');
  undoMove(b);
  b.queue = aiOrder(b, false);
  b.stage = 'ally';
  const evs: Ev[] = [];
  events(b, 'turn_start', { side: 'ally' }, evs);
  settle(b, evs);
  evs.push({ t: 'stage', stage: 'ally' });
  return evs;
}

/** AI 的补给 / 干扰判断：有伤得较重或士气低落的友军（含自己）时先用回复策略；
 * 智力够高的军师会远远地对智力最低的敌军放混乱 / 士气策略。
 * 只原地施放，不参与走位评估。 */
function aiSupport(b: Battle, u: Unit): Ev[] | null {
  if (u.confused) return null;
  const ids = knownStrategies(u).filter((id) => {
    const s = strategySpec(id);
    return !!s && s.target === 'ally' && s.kind !== 'attack' && u.mp >= s.mp;
  });
  let best: { id: number; target: Unit | null; score: number } | null = null;
  for (const id of ids) {
    const spec = strategySpec(id)!;
    for (const t of castTargets(b, u, id)) {
      const missing = 1 - t.hp / maxHp(t.cls, t.level);
      const score = missing * 100 + (100 - t.morale) * 0.5;
      if (score < 35) continue;
      if (!best || score > best.score) best = { id, target: spec.area === 'all_in_range' ? null : t, score };
    }
  }
  if (best) return best.target ? castAt(b, u, best.id, best.target, []) : done(b, u, castInto(b, u, best.id, undefined, [], false));

  // 军师（智力 65 以上）优先用混乱 / 降士气策略，而不是上去肉搏
  if (u.int < 65) return null;
  let bad: { id: number; target: Unit; score: number } | null = null;
  for (const id of knownStrategies(u)) {
    const spec = strategySpec(id);
    if (!spec || spec.target !== 'enemy' || spec.kind !== 'support' || u.mp < spec.mp) continue;
    for (const t of castTargets(b, u, id)) {
      const status = spec.effects.some((e) => e.type === 'status');
      if (status && t.confused) continue;
      const drop = spec.effects.some((e) => e.type === 'morale' && (e.amount ?? 0) < 0);
      if (drop && t.morale === 0) continue;
      const score = (100 - t.int) * 0.6 + (drop ? t.morale * 0.3 : 0);
      if (score < 30) continue;
      if (!bad || score > bad.score) bad = { id, target: t, score };
    }
  }
  return bad ? castAt(b, u, bad.id, bad.target, []) : null;
}

/** 推进一步自动行动：一支 AI 部队行动一次，或切换到下一阶段 / 下一回合。 */
export function aiStep(b: Battle): Ev[] {
  need(b.stage === 'ally' || b.stage === 'enemy', '现在没有自动行动');
  const evs: Ev[] = [];
  while (b.queue.length) {
    const u = bySlot(b, b.queue.shift()!);
    if (!u || !u.on || u.mode === 7 || u.acted) continue;
    const healed = aiSupport(b, u);
    if (healed) return healed;
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
    events(b, 'turn_start', { side: 'enemy' }, evs);
    settle(b, evs);
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
  Object.fromEntries(b.units.filter((u) => u.mode === 7 && friendly(u.slot)).map((u) => [u.key ?? u.name, {
    level: u.level, exp: u.exp, items: [...u.items], cls: u.cls, lead: u.lead, str: u.str, int: u.int,
  }]));
