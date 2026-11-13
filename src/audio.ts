/**
 * 音效播放：21 个 WAV（键名沿用参考项目引擎的 sfx::*），按动作触发。
 *
 * 浏览器在第一次用户手势前不允许出声，所以启动时挂一次性的 unlock 监听；
 * 为避免 ?fast 把一整串战斗事件挤在同一毫秒里，同一个键 45ms 内只放一次。
 * 静音开关写 localStorage，刷新后保留。
 */
export type SfxKey =
  | 'cursor' | 'confirm' | 'cancel' | 'error' | 'step'
  | 'hit' | 'hit_heavy' | 'arrow' | 'fire' | 'water' | 'rock'
  | 'heal' | 'morale_up' | 'morale_down' | 'confuse' | 'levelup'
  | 'retreat' | 'treasure' | 'phase' | 'victory' | 'defeat';

export const SFX_KEYS: SfxKey[] = [
  'cursor', 'confirm', 'cancel', 'error', 'step',
  'hit', 'hit_heavy', 'arrow', 'fire', 'water', 'rock',
  'heal', 'morale_up', 'morale_down', 'confuse', 'levelup',
  'retreat', 'treasure', 'phase', 'victory', 'defeat',
];

const SAVE_KEY = 'yjz.sfx.v1';
const THROTTLE_MS = 45;
const cache = new Map<SfxKey, HTMLAudioElement>();
const last = new Map<SfxKey, number>();
/** 调试 / 自动化用：最近真正播过的音效键。 */
const played: SfxKey[] = [];
let enabled = (() => {
  try { return localStorage.getItem(SAVE_KEY) !== '0'; } catch { return true; }
})();
let unlocked = false;

function el(key: SfxKey): HTMLAudioElement {
  let a = cache.get(key);
  if (!a) {
    a = new Audio(`/assets/sfx/${key}.wav`);
    a.preload = 'auto';
    cache.set(key, a);
  }
  return a;
}

/** 预热：把 21 个短音效都拉进浏览器缓存，第一次触发时不会卡一下。 */
export function preloadSfx(): void {
  for (const k of SFX_KEYS) el(k).load();
}

/** 第一次点击 / 按键后调用，之后才真正出声。 */
export function unlockSfx(): void {
  unlocked = true;
}

/** 播一次音效；同一键短时间内的重复请求会被丢掉。volume 是 0–1 的相对音量。 */
export function playSfx(key: SfxKey, volume = 1): void {
  if (!enabled || !unlocked) return;
  const now = performance.now();
  if (now - (last.get(key) ?? -1e9) < THROTTLE_MS) return;
  last.set(key, now);
  played.push(key);
  if (played.length > 1000) played.shift();
  const a = el(key).cloneNode() as HTMLAudioElement;
  a.volume = Math.min(1, 0.62 * volume);
  void a.play().catch(() => {}); // 浏览器限制时静音进行，不影响游戏
}

export const sfxLog = (): SfxKey[] => [...played];

export const sfxEnabled = (): boolean => enabled;

export function setSfxEnabled(on: boolean): boolean {
  enabled = on;
  try { localStorage.setItem(SAVE_KEY, on ? '1' : '0'); } catch { /* 隐私模式忽略 */ }
  return enabled;
}

export const toggleSfx = (): boolean => setSfxEnabled(!enabled);
