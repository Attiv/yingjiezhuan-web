import { describe, expect, it } from 'vitest';
import { sfxOf } from '../src/sfx-map';
import type { Battle, Ev } from '../src/rules/types';

/** 音效映射是纯函数：只查事件类型、策略编号和出招兵种，不碰画面与音频设备。 */
const battle = (cls = 0): Battle => ({ units: [{ slot: 0, cls }] } as unknown as Battle);
const fx = (e: Ev, cls = 0) => sfxOf(e, battle(cls));

describe('规则事件 → 音效键', () => {
  it('回合 / 增援响一次提示，阶段切换不重复响，走路是脚步声', () => {
    expect(fx({ t: 'round', round: 2, weather: 0 })).toBe('phase');
    expect(fx({ t: 'spawn', slots: [20] })).toBe('phase');
    expect(fx({ t: 'stage', stage: 'enemy' })).toBeNull();
    expect(fx({ t: 'move', slot: 0, path: [[1, 1], [2, 1]] })).toBe('step');
  });

  it('物理命中：普通重击、反击轻击，弓兵系是箭音', () => {
    expect(fx({ t: 'hit', a: 0, d: 15, dmg: 100, morale: 2, counter: false })).toBe('hit_heavy');
    expect(fx({ t: 'hit', a: 0, d: 15, dmg: 50, morale: 1, counter: true })).toBe('hit');
    expect(fx({ t: 'hit', a: 0, d: 15, dmg: 100, morale: 2, counter: false }, 4)).toBe('arrow');
  });

  it('攻击策略按火 / 水 / 落石分家，爆彈用落石，其余策略用普通命中', () => {
    const cast = (id: number): Ev => ({ t: 'cast', a: 0, d: 15, id, ok: true, dmg: 100, morale: 1 });
    expect(fx(cast(0))).toBe('fire');
    expect(fx(cast(3))).toBe('fire');
    expect(fx(cast(5))).toBe('water');
    expect(fx(cast(9))).toBe('water');
    expect(fx(cast(10))).toBe('rock');
    expect(fx(cast(14))).toBe('rock');
    expect(fx(cast(36))).toBe('rock');
    expect(fx(cast(15))).toBe('hit');
  });

  it('辅助策略：回复、激励、降士气、混乱各归其位，被识破是取消音', () => {
    const aid = (id: number, ok = true): Ev => ({ t: 'aid', a: 0, d: 1, id, ok, hp: 0, morale: 0 });
    expect(fx(aid(24))).toBe('heal');       // 援助
    expect(fx(aid(28))).toBe('heal');       // 治癒（回复 + 士气，以回复为主）
    expect(fx(aid(21))).toBe('morale_up');  // 激勵
    expect(fx(aid(19))).toBe('morale_down'); // 挑撥
    expect(fx(aid(15))).toBe('confuse');    // 假情報
    expect(fx(aid(24, false))).toBe('cancel');
    expect(fx(aid(999))).toBeNull();
  });

  it('升级、恢复、混乱、撤退、地形、宝物、单挑、胜负', () => {
    expect(fx({ t: 'exp', slot: 0, gain: 8, levels: 1, learned: [] })).toBe('levelup');
    expect(fx({ t: 'exp', slot: 0, gain: 8, levels: 0, learned: [] })).toBeNull();
    expect(fx({ t: 'recover', slot: 0, hp: 200, morale: 0 })).toBe('heal');
    expect(fx({ t: 'confuse', slot: 0, on: true })).toBe('confuse');
    expect(fx({ t: 'confuse', slot: 0, on: false })).toBe('heal');
    expect(fx({ t: 'retreat', slot: 15 })).toBe('retreat');
    expect(fx({ t: 'terrain', x: 1, y: 2, code: 3 })).toBe('rock');
    expect(fx({ t: 'gain', slot: 0, text: '得到 100 金' })).toBe('treasure');
    expect(fx({ t: 'duel', a: 0, d: 15 })).toBe('hit_heavy');
    expect(fx({ t: 'end', won: true, text: '勝利' })).toBe('victory');
    expect(fx({ t: 'end', won: false, text: '敗北' })).toBe('defeat');
  });

  it('没有音效的事件返回 null', () => {
    expect(fx({ t: 'objective', text: '殲滅敵軍' })).toBeNull();
    expect(fx({ t: 'talk', who: '', text: '' })).toBeNull();
    expect(fx({ t: 'drama', scene: 'x' })).toBeNull();
  });
});
