/**
 * 规则事件 → 音效键的映射。抽成纯函数，方便单测逐条核对，画面层只管按顺序播放。
 *
 * 键名沿用参考项目引擎的 sfx::*；21 个 WAV 的来源与「非原版音效」的说明见
 * public/assets/CREDITS.md。
 */
import { strategySpec } from './data/strategies';
import { bySlot } from './rules/core';
import type { SfxKey } from './audio';
import type { Battle, Ev } from './rules/types';

export function sfxOf(ev: Ev, b: Battle): SfxKey | null {
  switch (ev.t) {
    case 'round':
    case 'spawn': return 'phase';
    case 'stage': return null; // 一个回合只响一次，不在阶段切换时反复播
    case 'move': return 'step';
    case 'hit': {
      const a = bySlot(b, ev.a);
      return ev.counter ? 'hit' : a && a.cls >= 3 && a.cls <= 5 ? 'arrow' : 'hit_heavy';
    }
    case 'cast': {
      if (ev.id === 36) return 'rock'; // 爆彈
      if (ev.id > 14) return 'hit';
      return (['fire', 'water', 'rock'] as const)[Math.trunc(ev.id / 5)];
    }
    case 'aid': {
      const s = strategySpec(ev.id);
      if (!s) return null;
      if (!ev.ok) return 'cancel'; // 被识破
      if (s.effects.some((e) => e.type === 'status')) return 'confuse';
      const m = s.effects.find((e) => e.type === 'morale');
      if (m && (m.amount ?? 0) < 0) return 'morale_down';
      if (s.effects.some((e) => e.type === 'heal')) return 'heal';
      return 'morale_up';
    }
    case 'exp': return ev.levels ? 'levelup' : null;
    case 'recover': return 'heal';
    case 'confuse': return ev.on ? 'confuse' : 'heal';
    case 'retreat': return 'retreat';
    case 'terrain': return 'rock';
    case 'gain': return 'treasure';
    case 'give': return 'treasure';
    case 'drop': return 'cancel';
    case 'duel': return 'hit_heavy';
    case 'end': return ev.won ? 'victory' : 'defeat';
    default: return null;
  }
}
