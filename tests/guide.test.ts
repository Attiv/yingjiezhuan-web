import { describe, expect, it } from 'vitest';
import { battleGuide } from '../src/data/game';

describe('关卡攻略数据', () => {
  it('从关卡事件读取单挑双方和触发条件', () => {
    const guide = battleGuide('c0_s0_b5');
    expect(guide).toMatchObject({ name: '汜水關之戰' });
    expect(guide?.duels).toEqual([
      expect.objectContaining({ a: '關羽', b: '華雄', trigger: '關羽与華雄相邻时' }),
    ]);
  });

  it('同关多场单挑保留各自出场顺序且合并重复事件', () => {
    const guide = battleGuide('c1_s0_b11');
    expect(guide?.duels).toEqual([
      expect.objectContaining({ a: '麴義', b: '嚴綱', trigger: '第 1 回合我军行动开始时' }),
      expect.objectContaining({ a: '關羽', b: '麴義', trigger: '關羽与麴義相邻时' }),
    ]);
  });

  it('没有登记单挑的关卡仍提供攻略基础信息', () => {
    expect(battleGuide('c1_s0_b4')).toMatchObject({
      name: '廣川之戰',
      turnLimit: expect.any(Number),
      duels: [],
    });
  });
});
