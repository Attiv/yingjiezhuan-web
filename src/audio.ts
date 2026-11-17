/**
 * 音效播放：21 个 WAV，第一次用户手势创建并恢复 Web Audio 设备。
 * 同一个键 45ms 内只放一次，静音开关写 localStorage，刷新后保留。
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
// 加载或恢复设备过慢时丢弃旧动作，避免稍后集中补播脚步和命中声。
const MAX_DELAY_MS = 150;
const htmlCache = new Map<SfxKey, HTMLAudioElement>();
const files = new Map<SfxKey, Promise<ArrayBuffer | null>>();
const buffers = new Map<SfxKey, AudioBuffer>();
const decoding = new Map<SfxKey, Promise<AudioBuffer | null>>();
type Request = { at: number; generation: number };
const last = new Map<SfxKey, Request>();
/** 调试 / 自动化用：最近真正启动过的音效键。 */
const played: SfxKey[] = [];
type ErrorStage = 'context' | 'resume' | 'fetch' | 'decode' | 'play';
type SfxError = { stage: ErrorStage; code: string; key?: SfxKey };
const errors: SfxError[] = [];
let enabled = (() => {
  try { return localStorage.getItem(SAVE_KEY) !== '0'; } catch { return true; }
})();
let unlocked = false;
let generation = 0;
let backend: 'uninitialized' | 'webaudio' | 'htmlaudio' = 'uninitialized';
let context: AudioContext | undefined;
let resuming: Promise<boolean> | undefined;

const contextConstructor = (): typeof AudioContext | undefined =>
  globalThis.AudioContext ?? (globalThis as typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

function errorCode(error: unknown): string {
  const name = error instanceof Error ? error.name : '';
  return ['NotAllowedError', 'NotSupportedError', 'InvalidStateError', 'AbortError', 'EncodingError', 'NetworkError'].includes(name)
    ? name : 'Error';
}

function report(stage: ErrorStage, code: string, key?: SfxKey): void {
  errors.push({ stage, code, ...(key ? { key } : {}) });
  if (errors.length > 50) errors.shift();
}

function record(key: SfxKey): void {
  played.push(key);
  if (played.length > 1000) played.shift();
}

function el(key: SfxKey): HTMLAudioElement {
  let a = htmlCache.get(key);
  if (!a) {
    a = new Audio(`/assets/sfx/${key}.wav`);
    a.preload = 'auto';
    htmlCache.set(key, a);
  }
  return a;
}

function loadFile(key: SfxKey): Promise<ArrayBuffer | null> {
  let pending = files.get(key);
  if (!pending) {
    pending = Promise.resolve().then(async () => {
      const response = await fetch(`/assets/sfx/${key}.wav`);
      if (!response.ok) {
        report('fetch', `HTTP_${response.status}`, key);
        files.delete(key);
        return null;
      }
      return response.arrayBuffer();
    }).catch((error: unknown) => {
      report('fetch', errorCode(error), key);
      files.delete(key);
      return null;
    });
    files.set(key, pending);
  }
  return pending;
}

function decode(key: SfxKey): Promise<AudioBuffer | null> {
  const cached = buffers.get(key);
  if (cached) return Promise.resolve(cached);
  let pending = decoding.get(key);
  if (!pending) {
    const device = context!;
    pending = loadFile(key).then(async (data) => {
      if (!data) return null;
      // decodeAudioData 会转移原始数据，保留副本以便解码失败后重试。
      const buffer = await device.decodeAudioData(data.slice(0));
      buffers.set(key, buffer);
      files.delete(key);
      return buffer;
    }).catch((error: unknown) => {
      report('decode', errorCode(error), key);
      return null;
    }).finally(() => { decoding.delete(key); });
    decoding.set(key, pending);
  }
  return pending;
}

function resumeContext(fromGesture = false): Promise<boolean> {
  const device = context!;
  if (device.state === 'running') return Promise.resolve(true);
  if (resuming && !fromGesture) return resuming;
  try {
    // 新手势必须再次调用 resume，旧的自动恢复可能还在等待用户激活。
    const pending = device.resume().then(() => {
      if (device.state === 'running') return true;
      report('resume', 'InvalidStateError');
      return false;
    }).catch((error: unknown) => {
      report('resume', errorCode(error));
      return false;
    }).finally(() => { if (resuming === pending) resuming = undefined; });
    resuming = pending;
    return pending;
  } catch (error) {
    report('resume', errorCode(error));
    return Promise.resolve(false);
  }
}

/** 可在手势前拉取 WAV；设备创建后再解码，同一资源只加载一次。 */
export function preloadSfx(): void {
  for (const key of SFX_KEYS) {
    if (backend === 'htmlaudio' || !contextConstructor()) {
      try { el(key).load(); } catch (error) { report('fetch', errorCode(error), key); }
    } else if (context) {
      void decode(key);
    } else {
      void loadFile(key);
    }
  }
}

/** 第一次点击 / 按键后调用；恢复设备在本次手势内同步发起。 */
export function unlockSfx(): void {
  unlocked = true;
  const firstUnlock = backend === 'uninitialized';
  if (firstUnlock) {
    const Context = contextConstructor();
    if (Context) {
      try {
        context = new Context();
        backend = 'webaudio';
      } catch (error) {
        report('context', errorCode(error));
        backend = 'htmlaudio';
      }
    } else {
      backend = 'htmlaudio';
    }
  }
  if (context) void resumeContext(true);
  if (firstUnlock) preloadSfx();
}

function current(key: SfxKey, request: Request): boolean {
  return enabled && generation === request.generation && last.get(key) === request
    && performance.now() - request.at <= MAX_DELAY_MS;
}

function startBuffer(key: SfxKey, buffer: AudioBuffer, request: Request, volume: number): void {
  const device = context!;
  if (!current(key, request) || device.state !== 'running') return;
  let source: AudioBufferSourceNode | undefined;
  let gain: GainNode | undefined;
  try {
    source = device.createBufferSource();
    gain = device.createGain();
    source.buffer = buffer;
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(device.destination);
    const voice = source;
    const level = gain;
    source.onended = () => { voice.disconnect(); level.disconnect(); };
    source.start();
    record(key);
  } catch (error) {
    source?.disconnect();
    gain?.disconnect();
    report('play', errorCode(error), key);
  }
}

async function waitAndPlay(key: SfxKey, request: Request, volume: number): Promise<void> {
  const ready = resumeContext();
  const [buffer, running] = await Promise.all([decode(key), ready]);
  if (buffer && running) startBuffer(key, buffer, request, volume);
}

/** 播一次音效；同一键短时间内的重复请求会被丢掉。volume 是 0–1 的相对音量。 */
export function playSfx(key: SfxKey, volume = 1): void {
  if (!enabled || !unlocked) return;
  const now = performance.now();
  if (now - (last.get(key)?.at ?? -1e9) < THROTTLE_MS) return;
  const request = { at: now, generation };
  last.set(key, request);
  const level = Number.isFinite(volume) ? Math.max(0, Math.min(1, 0.62 * volume)) : 0;
  if (context) {
    const buffer = buffers.get(key);
    if (buffer && context.state === 'running') startBuffer(key, buffer, request, level);
    else void waitAndPlay(key, request, level);
  } else {
    try {
      const a = el(key).cloneNode() as HTMLAudioElement;
      a.volume = level;
      void a.play().then(() => {
        if (current(key, request)) record(key);
        else a.pause();
      }).catch((error: unknown) => { report('play', errorCode(error), key); });
    } catch (error) {
      report('play', errorCode(error), key);
    }
  }
}

export const sfxLog = (): SfxKey[] => [...played];

/** 仅包含状态、音效键和固定错误码，不记录浏览器错误正文或用户数据。 */
export const sfxDiagnostics = () => ({
  backend,
  contextState: context?.state ?? 'unavailable',
  enabled,
  unlocked,
  ready: [...buffers.keys()],
  loading: decoding.size,
  errors: errors.map((error) => ({ ...error })),
});

export const sfxEnabled = (): boolean => enabled;

export function setSfxEnabled(on: boolean): boolean {
  if (!on) generation++;
  enabled = on;
  try { localStorage.setItem(SAVE_KEY, on ? '1' : '0'); } catch { /* 隐私模式忽略 */ }
  return enabled;
}

export const toggleSfx = (): boolean => setSfxEnabled(!enabled);
