/** 脚本标志：原版流程里的开关，存档原样保存。 */
export type Flag = string | number | boolean;

/** 一支部队。槽位沿用原版：0–14 我方（我军 + 友军），15–44 敌军。 */
export interface Unit {
  slot: number;
  key?: string; // 武将 id；杂兵与名字相同
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
  commander?: boolean; // 敌军主将
  group?: string; // 增援组的名字，开战前不在场
}

/** 跨战斗保留的成长：按武将 id 记等级、经验和道具（转职还记兵种）。 */
export type Roster = Record<string, { level: number; exp: number; items: number[]; cls?: number }>;

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
  flags: string[]; // 已发生的一次性事件（含旧式触发记录、已捡的宝物、已阵亡的槽位）
  vars: Record<string, Flag>; // 战场脚本标志，战后带回流程
  objective: string; // 当前胜利条件（事件可以改）
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
  | { t: 'hp'; slot: number; delta: number }
  | { t: 'confuse'; slot: number; on: boolean }
  | { t: 'retreat'; slot: number }
  | { t: 'spawn'; slots: number[] }
  | { t: 'terrain'; x: number; y: number; code: number }
  | { t: 'objective'; text: string }
  | { t: 'drama'; scene: string }
  | { t: 'duel'; a: number; d: number }
  | { t: 'gain'; slot: number; text: string }
  | { t: 'talk'; who: string; text: string }
  | { t: 'end'; won: boolean; text: string };
