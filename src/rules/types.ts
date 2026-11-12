/** 一支部队。槽位沿用原版：0–14 我方（我军 + 友军），15–44 敌军。 */
export interface Unit {
  slot: number;
  name: string;
  face: string; // 头像与棋子素材键
  cls: number; // 兵种 ID（原版 0–18）
  level: number;
  exp: number;
  lead: number; // 统御
  str: number; // 武力
  int: number; // 智力
  hp: number; // 兵力
  mp: number; // 策略值
  morale: number; // 士气
  x: number;
  y: number;
  on: boolean; // 在场
  confused: boolean;
  moved: boolean;
  acted: boolean;
  mode: number; // 7 = 玩家手动；0 向目标移动，1 攻击最近敌人，2 原地不动，3 待机，4 只移动不攻击
  target: number | null; // AI 目标部队槽位
  goal: [number, number] | null; // AI 目标格
  items: number[]; // 最多 8 件
}

export type Stage = 'player' | 'ally' | 'enemy' | 'won' | 'lost';

/** 完整战斗状态：整个对象可直接 JSON 序列化，就是存档内容。 */
export interface Battle {
  level: string;
  w: number;
  h: number;
  terrain: number[];
  units: Unit[];
  round: number; // 当前回合（从 1 开始）
  stage: Stage;
  weather: number; // 原版天气索引 0–5
  rng: number; // 随机数状态
  gold: number;
  flags: string[]; // 已发生的一次性事件
  queue: number[]; // 本阶段尚未行动的 AI 槽位
  undo: { slot: number; x: number; y: number } | null; // 已移动未行动部队的原位
  reason: string; // 结束原因
}

/** 规则层发给画面的事件。画面只负责按顺序播放，不参与结算。 */
export type Ev =
  | { t: 'round'; round: number; weather: number }
  | { t: 'stage'; stage: Stage }
  | { t: 'move'; slot: number; path: [number, number][] }
  | { t: 'hit'; a: number; d: number; dmg: number; morale: number; counter: boolean }
  | { t: 'cast'; a: number; d: number; id: number; ok: boolean; dmg: number; morale: number }
  | { t: 'exp'; slot: number; gain: number; levels: number; learned: number[] }
  | { t: 'recover'; slot: number; hp: number; morale: number }
  | { t: 'confuse'; slot: number; on: boolean }
  | { t: 'retreat'; slot: number }
  | { t: 'duel'; a: number; d: number }
  | { t: 'gain'; slot: number; text: string }
  | { t: 'talk'; who: string; text: string }
  | { t: 'end'; won: boolean; text: string };
