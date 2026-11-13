/**
 * 音乐导演：原版的曲子是跟着场合走的，不是从头到尾一首。
 *
 * 剧本里的 `@bgm` 管剧情（议事、营地、悲叹、败北…）；战斗里的曲子由战斗本身决定——
 * 我军 / 友军阶段用关卡自己的 `bgm`（原版第 18 曲「战斗」），敌军阶段换成 `bgmEnemy`
 * （第 9 曲「敵将」），单挑时压上第 16 曲「强敌出现」，战败立刻切第 4 曲。
 *
 * 这些对应关系来自原版剧本里每首曲子的用法（`docs/assets.md` 有表）：
 * 5 议事厅、12 出兵准备、11 敌营、2 悲叹、4 败北、16 强敌出现、9 敌将台词、18 战斗。
 */
import type { Stage } from './rules/types';

export type BgmKey =
  | 'title' | 'peace' | 'camp' | 'battle' | 'boss'
  | 'enemy' | 'tension' | 'sad' | 'defeat' | 'ending';

/** 网页里真正有的 10 首（`public/assets/bgm/`），顺序与文件一致。 */
export const BGM_KEYS: BgmKey[] = [
  'title', 'peace', 'camp', 'battle', 'boss',
  'enemy', 'tension', 'sad', 'defeat', 'ending',
];

export const DEFAULT_BATTLE_BGM: BgmKey = 'battle';
export const DEFAULT_ENEMY_BGM: BgmKey = 'enemy';
/** 单挑：原版第 16 曲「强敌出现」。 */
export const DUEL_BGM: BgmKey = 'boss';
export const TITLE_BGM: BgmKey = 'title';

/** 关卡里的两条曲子（原版每关都带 `bgm` / `bgm_enemy`）。 */
export interface LevelMusic {
  bgm?: string;
  bgmEnemy?: string;
}

const asKey = (v: string | undefined, fallback: BgmKey): BgmKey =>
  (v && (BGM_KEYS as string[]).includes(v) ? (v as BgmKey) : fallback);

/** 战斗中的曲子：敌军阶段用 `bgmEnemy`，其余（我军、友军）用 `bgm`。 */
export function battleBgm(level: LevelMusic | null | undefined, stage: Stage): BgmKey {
  const own = asKey(level?.bgm, DEFAULT_BATTLE_BGM);
  const foe = asKey(level?.bgmEnemy, DEFAULT_ENEMY_BGM);
  return stage === 'enemy' ? foe : own;
}

/** 战果画面：败北立刻切败北曲；胜利保持战斗曲，交给紧接着的剧本 `@bgm`。 */
export function resultBgm(won: boolean): BgmKey | null {
  return won ? null : 'defeat';
}

/** 是不是还在打（用于「战斗里才换曲」的判断）。 */
export const isFighting = (stage: Stage): boolean =>
  stage === 'player' || stage === 'ally' || stage === 'enemy';
