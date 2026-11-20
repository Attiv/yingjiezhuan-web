import { afterEach, describe, expect, it, vi } from 'vitest';
import { decryptSaveText, encryptSaveText, EncryptedSaveStorage, isEncryptedSaveText } from '../src/save-crypto';

const values = new Map<string, string>();
const localStore = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, String(value)); },
  removeItem: (key: string) => { values.delete(key); },
  clear: () => values.clear(),
  key: (index: number) => [...values.keys()][index] ?? null,
  get length() { return values.size; },
} as Storage;

afterEach(() => {
  vi.unstubAllGlobals();
  values.clear();
});

describe('无密码存档加密', () => {
  it('用 AES-GCM 加密并完整解密 Unicode JSON', async () => {
    const plaintext = JSON.stringify({ gold: 500, chapter: '汜水关', units: ['刘备', '关羽'] });
    const ciphertext = await encryptSaveText(plaintext);
    expect(ciphertext).not.toContain('汜水关');
    expect(ciphertext).not.toContain('刘备');
    expect(isEncryptedSaveText(ciphertext)).toBe(true);
    expect(await decryptSaveText(ciphertext)).toBe(plaintext);
  });

  it('随机初始化向量让每份密文不同，篡改后拒绝解密', async () => {
    const first = await encryptSaveText('{"slot":1}');
    const second = await encryptSaveText('{"slot":1}');
    expect(first).not.toBe(second);
    const bytes = Uint8Array.from(atob(first.slice('YJZENC1:'.length)), (char) => char.charCodeAt(0));
    bytes[bytes.length - 1] ^= 1;
    const tampered = `YJZENC1:${btoa(String.fromCharCode(...bytes))}`;
    await expect(decryptSaveText(tampered)).rejects.toThrow('无法解密');
  });

  it('读取旧明文存档后自动改写为密文，页面缓存读取仍透明', async () => {
    vi.stubGlobal('localStorage', localStore);
    localStore.setItem('yjz.saves.v1', '{"slots":[],"last":null}');
    const storage = new EncryptedSaveStorage();
    await storage.initialize(['yjz.saves.v1']);
    expect(storage.getItem('yjz.saves.v1')).toBe('{"slots":[],"last":null}');
    await storage.flush();
    const raw = localStore.getItem('yjz.saves.v1')!;
    expect(isEncryptedSaveText(raw)).toBe(true);
    expect(raw).not.toContain('slots');

    const nextPage = new EncryptedSaveStorage();
    await nextPage.initialize(['yjz.saves.v1']);
    expect(nextPage.getItem('yjz.saves.v1')).toBe('{"slots":[],"last":null}');
  });
});
