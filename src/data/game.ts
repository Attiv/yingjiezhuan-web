import { registerLevel, setItemTable, setTerrainTable, type BattleEvent, type Deploy, type Level, type UnitInit } from '../rules/turn';
import type { Script, Step } from '../story';
import raw from './game.json';

/** game.json 的结构：生成脚本的输出，字段按下面的接口读，多出来的键不用管。 */
interface BUnitData {
  side: string; key: string; name: string; face: string; cls: number; level: number; requiresFlag?: string;
  lead: number; str: number; int: number; x: number; y: number; mode: number;
  goal: [number, number] | null; target: string | null; commander: boolean; items: number[];
}
interface BattleEventData {
  trigger: { type: string; turn?: number; side?: string; a?: string; b?: string; who?: string | null; pos?: [number, number]; radius?: number; target?: string };
  actions: BattleActionData[];
}
interface BattleActionData { op: string; scene?: string; actions?: BattleActionData[] }
interface BattleData {
  id: string; name: string; goal: string; turnLimit: number; map: string; reward: number;
  deploy: { max: number; required: string[]; forbidden: string[]; slots: [number, number][] };
  units: BUnitData[]; groups: Record<string, BUnitData[]>;
  victory: unknown[]; defeat: unknown[]; events: BattleEventData[]; treasures: { x: number; y: number; item: number | null; gold: number }[];
  bgm?: string; bgmEnemy?: string;
}
interface GameData {
  title: string; steps: Step[]; scenes: Record<string, Step[]>;
  battles: Record<string, BattleData>;
  maps: Record<string, { w: number; h: number; terrain: number[] }>;
  officers: Record<string, { name: string; face: string; cls: number; level: number; lead: number; str: number; int: number }>;
  persons: Record<string, unknown>;
  speakers: Record<string, string>; faces: Record<string, string>; items: Record<string, number>;
}
const G = raw as unknown as GameData;

/**
 * 整部《三国志英杰传》的数据入口。game.json 由 tools/build_campaign.py 从原版盘的
 * 剧本（campaign.toml + dramas/*.drama + battles/*.toml）转出，这里只做「数据 → 关卡对象」的装配：
 * 槽位排布、出战名单、事件触发、地形名与道具名的对照表。
 */

/** 地形名（原版数据里的英文名）→ 地形码（tables.json 的顺序）。 */
const TERRAIN: Record<string, number> = {
  plain: 0, forest: 1, mountain: 2, river: 3, bridge: 4, wall: 5, castle: 6, grass: 7, village: 8,
  cliff: 9, gate: 10, wasteland: 11, fence: 12, fort: 13, barracks: 14, granary: 15, treasury: 16,
  house: 17, fire: 18, water: 19,
};
setTerrainTable(TERRAIN);
setItemTable(G.items);

type BUnit = BUnitData;

/** 武将 id → 出征模板。带上原版的兵种、等级与能力，出征时按名单取用。 */
const TEMPLATE: Record<string, UnitInit> = Object.fromEntries(
  Object.entries(G.officers).map(([id, o]) => [id, {
    slot: 0, key: id, name: o.name, face: o.face, cls: o.cls, level: o.level,
    lead: o.lead, str: o.str, int: o.int, x: 0, y: 0, mode: 7,
  }]),
);

function init(u: BUnit, slot: number, group?: string): UnitInit {
  return {
    slot, key: u.key, name: u.name, face: u.face, cls: u.cls, level: u.level,
    lead: u.lead, str: u.str, int: u.int, x: u.x, y: u.y, mode: u.mode,
    goal: u.goal ?? undefined, items: u.items,
    commander: u.commander, group, off: !!group, requiresFlag: u.requiresFlag,
  };
}

const built: Record<string, Level> = {};

/** 把一条战斗记录装配成规则层的关卡：友军与我军占 0–14，敌军占 15–44，增援按组挂在后面。 */
export function level(id: string): Level | undefined {
  if (built[id]) return built[id];
  const b = G.battles[id];
  if (!b) return undefined;
  const map = G.maps[b.map];
  if (!map) throw new Error(`战斗「${id}」的地图 ${b.map} 没有地形数据`);
  const ally = b.units.filter((u) => u.side === 'ally');
  const enemy = b.units.filter((u) => u.side === 'enemy');
  const units: UnitInit[] = [];
  // 友军占 0–14 的高位，出征的我军占 0 起的低位；两拨增援夹在中间，互不撞槽
  ally.forEach((u, i) => units.push(init(u, 15 - ally.length + i)));
  let nextFriend = b.deploy.max;
  let nextEnemy = 15 + enemy.length;
  enemy.forEach((u, i) => units.push(init(u, 15 + i)));
  for (const [group, list] of Object.entries(b.groups)) {
    for (const u of list) {
      const it = init(u, u.side === 'enemy' ? nextEnemy++ : nextFriend++, group);
      if (u.side === 'player') it.mode = 7;
      units.push(it);
    }
  }
  const deploy: Deploy = {
    max: Math.min(b.deploy.max, b.deploy.slots.length),
    required: b.deploy.required,
    forbidden: b.deploy.forbidden,
    slots: b.deploy.slots as [number, number][],
  };
  const lv: Level = {
    id, name: b.name, goal: b.goal, turnLimit: b.turnLimit, w: map.w, h: map.h, terrain: map.terrain as number[],
    units, reward: b.reward, map: `maps/${b.map}.png`, tokens: 'tokens.png',
    bgm: b.bgm, bgmEnemy: b.bgmEnemy,
    deploy, candidates: TEMPLATE,
    victory: b.victory as Level['victory'], defeat: b.defeat as Level['defeat'],
    events: b.events as BattleEvent[], treasures: b.treasures, triggers: [],
  };
  registerLevel(lv);
  return (built[id] = lv);
}

/** 剧本里出现的战斗都登记上（标题画面背后、存档校验要用）。 */
export const hasLevel = (id: string) => !!G.battles[id];

export const TITLE = G.title;
export const SCRIPT: Script = { id: 'yingjiezhuan', title: G.title, steps: G.steps };
/** 战场中间插播的一幕剧。 */
export const scene = (id: string): Step[] => G.scenes[id] ?? [];

/** 说话人头像（相对 assets 的路径）。查不到就没有头像。 */
export const faceOf = (who: string): string | undefined => G.faces[who];
/** 所有已生成的说话人头像映射，供数据校验使用。 */
export const speakerFaces = G.faces;
/** 说话人显示名：剧本里写的是 id，显示时换成中文名。 */
export const nameOf = (who: string): string => G.speakers[who] ?? who;

export interface DuelGuide {
  a: string;
  b: string;
  trigger: string;
}
export interface BattleGuide {
  name: string;
  goal: string;
  turnLimit: number;
  duels: DuelGuide[];
}

const displayTrigger = (trigger: BattleEventData['trigger']): string => {
  switch (trigger.type) {
    case 'turn_start':
      return `第 ${trigger.turn ?? '?'} 回合${trigger.side === 'player' ? '我军' : trigger.side === 'ally' ? '友军' : '敌军'}行动开始时`;
    case 'adjacent':
      return `${nameOf(trigger.a ?? '我军武将')}与${nameOf(trigger.b ?? '敌将')}相邻时`;
    case 'reach': {
      const [x, y] = trigger.pos ?? [0, 0];
      return `${trigger.who ? nameOf(trigger.who) : '我方部队'}到达坐标（${x}，${y}）时`;
    }
    case 'unit_defeated':
      return `击破${nameOf(trigger.target ?? '指定敌将')}时`;
    default:
      return '剧情推进时';
  }
};

/** 从关卡事件引用的剧情场景中提取实际单挑步骤，不手工维护重复名单。 */
export function battleGuide(id: string): BattleGuide | undefined {
  const battle = G.battles[id];
  if (!battle) return undefined;
  const duels: DuelGuide[] = [];
  const seen = new Set<string>();
  const scenesIn = (actions: BattleActionData[]): string[] => actions.flatMap((action) => [
    ...(action.op === 'drama' && action.scene ? [action.scene] : []),
    ...(action.actions ? scenesIn(action.actions) : []),
  ]);
  for (const event of battle.events) {
    for (const sceneId of scenesIn(event.actions)) {
      for (const step of G.scenes[sceneId] ?? []) {
        if (step.t !== 'duel') continue;
        const trigger = displayTrigger(event.trigger);
        const key = `${step.a}:${step.b}:${trigger}`;
        if (seen.has(key)) continue;
        seen.add(key);
        duels.push({ a: nameOf(step.a), b: nameOf(step.b), trigger });
      }
    }
  }
  return { name: battle.name, goal: battle.goal, turnLimit: battle.turnLimit, duels };
}

/** 默认出征名单：必带的先排，再按队伍顺序补满。 */
export function defaultDeploy(id: string, party: string[]): string[] {
  const lv = level(id);
  if (!lv?.deploy) return [];
  const { max, required, forbidden } = lv.deploy;
  const out = [...required.filter((k) => TEMPLATE[k])];
  for (const k of party) {
    if (out.length >= max) break;
    if (forbidden.includes(k) || out.includes(k) || !TEMPLATE[k]) continue;
    out.push(k);
  }
  return out.slice(0, max);
}

/** 所有可编成的武将（有原版数据的）。 */
export const officers = TEMPLATE;

/** 剧本里写的是道具名（如 bean），转成道具表里的编号。 */
export const itemId = (key: string): number | undefined => G.items[key];
