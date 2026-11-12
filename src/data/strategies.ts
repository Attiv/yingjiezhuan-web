import raw from './strategies.json';

/**
 * 原版策略表（strategies.json 由 tools/build_campaign.py 从 strategies.toml 转出）。
 *
 * 编号就是 DOS 的策略编号：0–35 是各兵种按等级学会的 36 条策略，36 是爆彈专用的「爆發」。
 * 威力、士气增减、混乱效果照抄原版；射程码来自原版程序的 strategyCategory。
 * 兵种几级学会哪条策略仍在 tables.json 的 strategyLevel 里（规则层 knownStrategies 用）。
 */
export type StrategyKind = 'attack' | 'heal' | 'support';
export type StrategyArea = 'single' | 'cross' | 'all_in_range';

export interface StrategyEffect {
  type: 'damage' | 'heal' | 'morale' | 'status';
  power?: number;
  amount?: number;
  status?: string;
  turns?: number;
}

export interface StrategySpec {
  key: string;
  name: string;
  kind: StrategyKind;
  mp: number;
  /** 原版范围码：0 周围一圈、1/2 更远、3 群体策略 */
  range: number;
  area: StrategyArea;
  target: 'ally' | 'enemy';
  effects: StrategyEffect[];
}

interface Data {
  strategies: Record<string, StrategySpec>;
  byKey: Record<string, number>;
}

const DATA = raw as unknown as Data;

export const STRATEGIES = DATA.strategies;

export const strategySpec = (id: number): StrategySpec | undefined => STRATEGIES[String(id)];

/** 策略显示名；查不到时给个占位，避免界面出现 undefined。 */
export const strategyName = (id: number): string => strategySpec(id)?.name ?? `策略${id}`;

/** pack 里的策略 key → DOS 编号（爆彈 = blast → 36）。 */
export const strategyId = (key: string): number | undefined => DATA.byKey[key];

/** 这条策略是不是攻击系（有 damage 效果）。 */
export const isAttackStrategy = (id: number): boolean => !!strategySpec(id)?.effects.some((e) => e.type === 'damage');

/** 对友军使用、需要选目标的策略（援助、激励…）；群体策略返回 false，直接施放。 */
export const needsTarget = (id: number): boolean => {
  const s = strategySpec(id);
  return !!s && s.area !== 'all_in_range';
};
