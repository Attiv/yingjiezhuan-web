import { TB, friendly, maxHp } from './rules/core';
import type { Battle } from './rules/types';

/**
 * 战斗结算：把打完的战场折成一张成绩单。
 *
 * 原版的「戰鬥結果」只报三件事——军资、各部队的经验与升级、以及这一战打了多少回合。
 * 这里照这三样算，不自行加奖励；军资的账要和 `afterBattle()` 完全对得上：
 * 胜利才把 `b.gold` 加进军资，其中关卡赏金来自关卡数据（`reward`），其余是战场拾得
 * （宝箱、事件里给的金）。败北两者都不入账。
 */
export interface ResultRow {
  /** 武将 id；杂兵退回名字，只用来定位 */
  key: string;
  name: string;
  cls: number;
  className: string;
  level: number;
  /** 0–99，满 100 升级（原版存档就是这么记的） */
  exp: number;
  hp: number;
  maxHp: number;
  /** false = 这一战撤退了 */
  on: boolean;
  /** 相比开战涨了几级；没有开战记录时为 0 */
  up: number;
}

export interface ResultTally {
  won: boolean;
  /** 这一战加进军资的总额 */
  gold: number;
  /** 其中来自关卡赏金的部分 */
  reward: number;
  /** 其中来自战场拾得（宝箱、事件给的金）的部分 */
  found: number;
  rows: ResultRow[];
  rounds: number;
}

export interface TallyOpts {
  /** 关卡数据里的赏金 */
  reward: number;
  /** 关卡回合上限，结算显示不超过它 */
  turnLimit: number;
  /** 开战时各武将的等级，用来标「升了几级」；读档接手的战斗没有这份记录 */
  before?: Record<string, number>;
}

export function tally(b: Battle, o: TallyOpts): ResultTally {
  const won = b.stage === 'won';
  const gold = won ? b.gold : 0;
  const reward = won ? o.reward : 0;
  const rows = b.units
    .filter((u) => u.mode === 7 && friendly(u.slot))
    // 还没登场的增援不算「撤退」：它们本来就没进场
    .filter((u) => !u.group || !!b.vars[`__spawned_${u.group}`])
    .map((u) => {
      const key = u.key ?? u.name;
      return {
        key, name: u.name, cls: u.cls, className: TB.classNames[u.cls] ?? '',
        level: u.level, exp: u.exp, hp: u.on ? u.hp : 0, maxHp: maxHp(u.cls, u.level),
        on: u.on, up: Math.max(0, u.level - (o.before?.[key] ?? u.level)),
      };
    });
  return { won, gold, reward, found: Math.max(0, gold - reward), rows, rounds: Math.min(b.round, o.turnLimit) };
}
