import { afterEach, describe, expect, it, vi } from 'vitest';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

async function settle() {
  // 只清空资源加载、解码和恢复设备产生的微任务，不推进播放时钟。
  for (let i = 0; i < 20; i++) await Promise.resolve();
}

async function setup(webAudio = true, saved: string | null = null) {
  vi.resetModules();
  let now = 100;
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  const storage = { getItem: vi.fn(() => saved), setItem: vi.fn() };
  vi.stubGlobal('localStorage', storage);
  const htmlPlay = vi.fn(() => Promise.resolve());
  const htmlElements: FakeAudio[] = [];
  class FakeAudio {
    preload = '';
    volume = 1;
    load = vi.fn();
    pause = vi.fn();
    play = htmlPlay;
    cloneNode() { return new FakeAudio(); }
    constructor() { htmlElements.push(this); }
  }
  class FakeSource {
    buffer: AudioBuffer | null = null;
    onended: (() => void) | null = null;
    connect = vi.fn();
    disconnect = vi.fn();
    start = vi.fn(() => {
      if (contexts[0].state !== 'running') throw new DOMException('设备尚未恢复', 'InvalidStateError');
    });
  }
  const sources: FakeSource[] = [];
  const gains: { gain: { value: number }; connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];
  const contexts: FakeContext[] = [];
  const buffer = {} as AudioBuffer;
  class FakeContext {
    state = 'suspended';
    destination = {};
    resume = vi.fn(async () => { this.state = 'running'; });
    decodeAudioData = vi.fn(async (_data: ArrayBuffer) => buffer);
    createBufferSource() {
      const source = new FakeSource();
      sources.push(source);
      return source;
    }
    createGain() {
      const gain = { gain: { value: 1 }, connect: vi.fn(), disconnect: vi.fn() };
      gains.push(gain);
      return gain;
    }
    constructor() { contexts.push(this); }
  }
  const fetchAudio = vi.fn(async (_url: string) => ({
    ok: true, status: 200, arrayBuffer: async () => new ArrayBuffer(8),
  }));
  vi.stubGlobal('fetch', fetchAudio);
  vi.stubGlobal('Audio', FakeAudio);
  vi.stubGlobal('AudioContext', webAudio ? FakeContext : undefined);
  vi.stubGlobal('webkitAudioContext', undefined);
  return {
    audio: await import('../src/audio'), htmlPlay, htmlElements, storage,
    contexts, sources, gains, fetchAudio, buffer, FakeContext,
    advance: (ms: number) => { now += ms; },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Web Audio 音效', () => {
  it('手势前可预加载，用户手势立即创建并恢复设备，然后使用已缓存的资源', async () => {
    const { audio, contexts, fetchAudio, htmlPlay } = await setup();
    audio.preloadSfx();
    await settle();
    expect(contexts).toHaveLength(0);
    expect(fetchAudio).toHaveBeenCalledTimes(21);
    audio.playSfx('hit');
    expect(audio.sfxLog()).toEqual([]);
    audio.unlockSfx();
    expect(contexts).toHaveLength(1);
    expect(contexts[0].resume).toHaveBeenCalledOnce();
    await settle();
    expect(audio.sfxDiagnostics()).toMatchObject({ backend: 'webaudio', contextState: 'running', errors: [] });
    expect(audio.sfxDiagnostics().ready).toHaveLength(21);
    audio.unlockSfx();
    audio.preloadSfx();
    audio.playSfx('hit');
    expect(audio.sfxLog()).toEqual(['hit']);
    expect(fetchAudio).toHaveBeenCalledTimes(21);
    expect(contexts[0].decodeAudioData).toHaveBeenCalledTimes(21);
    expect(htmlPlay).not.toHaveBeenCalled();
  });

  it('短音效可并发，保留同键 45ms 节流和音量，结束后释放连接', async () => {
    const { audio, sources, gains, advance } = await setup();
    audio.unlockSfx();
    await settle();
    audio.playSfx('step', 0.5);
    audio.playSfx('hit');
    advance(44);
    audio.playSfx('step');
    expect(audio.sfxLog()).toEqual(['step', 'hit']);
    advance(1);
    audio.playSfx('step', 9);
    expect(audio.sfxLog()).toEqual(['step', 'hit', 'step']);
    expect(sources).toHaveLength(3);
    expect(sources.every((source) => source.start.mock.calls.length === 1)).toBe(true);
    expect(gains.map((gain) => gain.gain.value)).toEqual([0.31, 0.62, 1]);
    expect(sources[0].disconnect).not.toHaveBeenCalled();
    sources[0].onended?.();
    expect(sources[0].disconnect).toHaveBeenCalledOnce();
    expect(gains[0].disconnect).toHaveBeenCalledOnce();
  });

  it('播放时设备被挂起，恢复完成以前既不启动声源也不写成功日志', async () => {
    const { audio, contexts, sources } = await setup();
    audio.unlockSfx();
    await settle();
    const resumed = deferred<void>();
    contexts[0].state = 'suspended';
    contexts[0].resume.mockImplementationOnce(() => resumed.promise.then(() => { contexts[0].state = 'running'; }));
    audio.playSfx('hit');
    audio.playSfx('step');
    await settle();
    expect(sources).toHaveLength(0);
    expect(audio.sfxLog()).toEqual([]);
    expect(contexts[0].resume).toHaveBeenCalledTimes(2);
    resumed.resolve();
    await settle();
    expect(audio.sfxLog()).toEqual(['hit', 'step']);
    expect(sources).toHaveLength(2);
  });

  it('自动恢复仍在等手势时，新手势会真正再次调用 resume', async () => {
    const { audio, contexts } = await setup();
    audio.unlockSfx();
    await settle();
    contexts[0].state = 'suspended';
    const waitingForGesture = deferred<void>();
    contexts[0].resume.mockImplementationOnce(() => waitingForGesture.promise);
    audio.playSfx('hit');
    await settle();
    expect(audio.sfxLog()).toEqual([]);
    audio.unlockSfx();
    expect(contexts[0].resume).toHaveBeenCalledTimes(3);
    waitingForGesture.resolve();
    await settle();
    expect(audio.sfxLog()).toEqual(['hit']);
  });

  it('恢复被拒绝有诊断且不记成功，后续手势可重试', async () => {
    const { audio, contexts, sources, advance } = await setup();
    audio.unlockSfx();
    await settle();
    contexts[0].state = 'suspended';
    contexts[0].resume.mockRejectedValueOnce(new DOMException('不保留错误正文', 'NotAllowedError'));
    audio.playSfx('hit');
    await settle();
    expect(sources).toHaveLength(0);
    expect(audio.sfxLog()).toEqual([]);
    expect(audio.sfxDiagnostics().errors).toEqual([{ stage: 'resume', code: 'NotAllowedError' }]);
    audio.unlockSfx();
    await settle();
    advance(45);
    audio.playSfx('hit');
    expect(audio.sfxLog()).toEqual(['hit']);
  });

  it('异步解码只播放仍有效的请求，不在资源到达时补播过期或被替代的动作', async () => {
    const { audio, contexts, sources, advance } = await setup();
    const decoded = deferred<AudioBuffer>();
    audio.unlockSfx();
    contexts[0].decodeAudioData.mockReturnValue(decoded.promise);
    audio.playSfx('hit');
    audio.playSfx('step');
    await settle();
    advance(200);
    audio.playSfx('step', 0.5);
    decoded.resolve({} as AudioBuffer);
    await settle();
    expect(audio.sfxLog()).toEqual(['step']);
    expect(sources).toHaveLength(1);
    audio.playSfx('hit');
    expect(audio.sfxLog()).toEqual(['step', 'hit']);
    expect(contexts[0].decodeAudioData).toHaveBeenCalledTimes(21);
  });

  it('静音使待播请求失效，重新打开也不补播，设置写入存储', async () => {
    const { audio, contexts, storage, advance } = await setup();
    const decoded = deferred<AudioBuffer>();
    audio.unlockSfx();
    contexts[0].decodeAudioData.mockReturnValue(decoded.promise);
    audio.playSfx('hit');
    await settle();
    expect(audio.setSfxEnabled(false)).toBe(false);
    audio.playSfx('step');
    expect(audio.toggleSfx()).toBe(true);
    decoded.resolve({} as AudioBuffer);
    await settle();
    expect(audio.sfxLog()).toEqual([]);
    expect(storage.setItem).toHaveBeenCalledWith('yjz.sfx.v1', '0');
    expect(storage.setItem).toHaveBeenCalledWith('yjz.sfx.v1', '1');
    advance(45);
    audio.playSfx('hit');
    expect(audio.sfxLog()).toEqual(['hit']);
  });

  it('资源请求或解码失败可诊断，下一次动作能重试且只记录成功启动', async () => {
    const { audio, contexts, fetchAudio, advance } = await setup();
    fetchAudio.mockImplementationOnce(async () => ({
      ok: false, status: 404, arrayBuffer: async () => new ArrayBuffer(0),
    }));
    audio.unlockSfx();
    contexts[0].decodeAudioData.mockRejectedValueOnce(new DOMException('不保留资源详情', 'EncodingError'));
    audio.playSfx('cursor');
    audio.playSfx('confirm');
    await settle();
    expect(audio.sfxLog()).toEqual([]);
    expect(audio.sfxDiagnostics().errors).toEqual([
      { stage: 'fetch', code: 'HTTP_404', key: 'cursor' },
      { stage: 'decode', code: 'EncodingError', key: 'confirm' },
    ]);
    advance(45);
    audio.playSfx('cursor');
    audio.playSfx('confirm');
    await settle();
    expect(audio.sfxLog().sort()).toEqual(['confirm', 'cursor']);
    expect(fetchAudio).toHaveBeenCalledTimes(22);
  });

  it('设备恢复过慢时丢弃旧动作，下一次动作仍能正常发声', async () => {
    const { audio, contexts, sources, advance } = await setup();
    audio.unlockSfx();
    await settle();
    const resumed = deferred<void>();
    contexts[0].state = 'suspended';
    contexts[0].resume.mockImplementationOnce(() => resumed.promise.then(() => { contexts[0].state = 'running'; }));
    audio.playSfx('hit');
    advance(200);
    resumed.resolve();
    await settle();
    expect(audio.sfxLog()).toEqual([]);
    expect(sources).toHaveLength(0);
    audio.playSfx('hit');
    expect(audio.sfxLog()).toEqual(['hit']);
  });

  it('声源启动抛错时释放连接并只记错误，诊断和日志返回独立快照', async () => {
    const { audio, contexts, sources, gains, advance } = await setup();
    audio.unlockSfx();
    await settle();
    const createSource = contexts[0].createBufferSource.bind(contexts[0]);
    vi.spyOn(contexts[0], 'createBufferSource').mockImplementationOnce(() => {
      const source = createSource();
      source.start.mockImplementation(() => { throw new DOMException('启动失败', 'InvalidStateError'); });
      return source;
    });
    audio.playSfx('hit');
    expect(audio.sfxLog()).toEqual([]);
    expect(sources[0].disconnect).toHaveBeenCalledOnce();
    expect(gains[0].disconnect).toHaveBeenCalledOnce();
    const diagnostics = audio.sfxDiagnostics();
    expect(diagnostics.errors).toEqual([{ stage: 'play', code: 'InvalidStateError', key: 'hit' }]);
    diagnostics.errors[0].code = '已修改';
    diagnostics.ready.length = 0;
    expect(audio.sfxDiagnostics().errors[0].code).toBe('InvalidStateError');
    expect(audio.sfxDiagnostics().ready).toHaveLength(21);
    advance(45);
    audio.playSfx('hit');
    audio.sfxLog().push('step');
    expect(audio.sfxLog()).toEqual(['hit']);
  });

  it('沿用存储的静音设置', async () => {
    const { audio, sources } = await setup(true, '0');
    audio.unlockSfx();
    await settle();
    audio.playSfx('hit');
    expect(audio.sfxEnabled()).toBe(false);
    expect(audio.sfxLog()).toEqual([]);
    expect(sources).toHaveLength(0);
  });
});

describe('HTMLAudio 降级', () => {
  it('Web Audio 创建设备失败时可降级，诊断不包含任意错误正文', async () => {
    const { audio, htmlPlay } = await setup();
    vi.stubGlobal('AudioContext', class {
      constructor() { throw new Error('包含不应暴露的浏览器细节'); }
    });
    audio.unlockSfx();
    audio.playSfx('hit');
    await settle();
    expect(htmlPlay).toHaveBeenCalledOnce();
    expect(audio.sfxLog()).toEqual(['hit']);
    expect(audio.sfxDiagnostics()).toMatchObject({
      backend: 'htmlaudio', errors: [{ stage: 'context', code: 'Error' }],
    });
  });

  it('尚未开始或被浏览器拒绝时不报告播放成功，并提供固定错误码', async () => {
    const { audio, htmlPlay } = await setup(false);
    const blocked = deferred<void>();
    htmlPlay.mockReturnValue(blocked.promise);
    audio.unlockSfx();
    audio.playSfx('hit');
    expect(audio.sfxLog()).toEqual([]);
    blocked.reject(new DOMException('不保留错误正文', 'NotAllowedError'));
    await settle();
    expect(audio.sfxLog()).toEqual([]);
    expect(audio.sfxDiagnostics()).toMatchObject({
      backend: 'htmlaudio', contextState: 'unavailable',
      errors: [{ stage: 'play', code: 'NotAllowedError', key: 'hit' }],
    });
  });

  it('仅在 HTMLAudio 确认启动后记录，并保留音量', async () => {
    const { audio, htmlPlay, htmlElements } = await setup(false);
    const started = deferred<void>();
    htmlPlay.mockReturnValue(started.promise);
    audio.unlockSfx();
    audio.playSfx('step', 0.5);
    expect(audio.sfxLog()).toEqual([]);
    started.resolve();
    await settle();
    expect(audio.sfxLog()).toEqual(['step']);
    expect(htmlElements.at(-1)?.volume).toBe(0.31);
  });
});
