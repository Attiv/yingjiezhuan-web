import { describe, expect, it } from 'vitest';
import { BGM_KEYS, DUEL_BGM, TITLE_BGM, battleBgm, isFighting, resultBgm } from '../src/music';
import { SCRIPT, level } from '../src/data/game';

describe('音乐导演', () => {
  it('战斗中的曲子按阶段走：我军 / 友军用关卡自己的 bgm，敌军换成 bgmEnemy', () => {
    const lv = { bgm: 'battle', bgmEnemy: 'enemy' };
    expect(battleBgm(lv, 'player')).toBe('battle');
    expect(battleBgm(lv, 'ally')).toBe('battle');
    expect(battleBgm(lv, 'enemy')).toBe('enemy');
    // 战果画面不再算「战斗阶段」，仍返回我军曲（此时由 showResult 决定换不换）
    expect(battleBgm(lv, 'won')).toBe('battle');
  });

  it('关卡可以指定别的曲子；缺省或写错时落到战斗 / 敌将两首', () => {
    expect(battleBgm({ bgm: 'boss', bgmEnemy: 'tension' }, 'enemy')).toBe('tension');
    expect(battleBgm({}, 'player')).toBe('battle');
    expect(battleBgm(null, 'enemy')).toBe('enemy');
    expect(battleBgm({ bgm: 'nope', bgmEnemy: '' }, 'player')).toBe('battle');
    expect(battleBgm({ bgm: 'nope', bgmEnemy: 'nope' }, 'enemy')).toBe('enemy');
  });

  it('败北立刻切败北曲；胜利不抢剧本的下一首', () => {
    expect(resultBgm(false)).toBe('defeat');
    expect(resultBgm(true)).toBeNull();
  });

  it('单挑与标题各有专属曲，且都在 10 首里', () => {
    expect(DUEL_BGM).toBe('boss');
    expect(TITLE_BGM).toBe('title');
    for (const k of [DUEL_BGM, TITLE_BGM]) expect(BGM_KEYS).toContain(k);
  });

  it('只有我军 / 友军 / 敌军三个阶段算在打', () => {
    expect(isFighting('player')).toBe(true);
    expect(isFighting('ally')).toBe(true);
    expect(isFighting('enemy')).toBe(true);
    expect(isFighting('won')).toBe(false);
    expect(isFighting('lost')).toBe(false);
  });

  it('每首曲子都不重复，10 首正好覆盖 title / peace / camp / battle / boss / enemy / tension / sad / defeat / ending', () => {
    expect(new Set(BGM_KEYS).size).toBe(BGM_KEYS.length);
    expect([...BGM_KEYS].sort()).toEqual(['battle', 'boss', 'camp', 'defeat', 'ending', 'enemy', 'peace', 'sad', 'tension', 'title']);
  });

  it('全部 70 关的 bgm / bgmEnemy 都落在现有的曲子里', () => {
    const ids = SCRIPT.steps.filter((s): s is Extract<typeof s, { t: 'battle' }> => s.t === 'battle').map((s) => s.level);
    expect(ids).toHaveLength(70);
    for (const id of ids) {
      const lv = level(id);
      expect(lv, id).toBeDefined();
      expect(BGM_KEYS, `${id} 的 bgm`).toContain(battleBgm(lv, 'player'));
      expect(BGM_KEYS, `${id} 的 bgmEnemy`).toContain(battleBgm(lv, 'enemy'));
    }
  });
});
