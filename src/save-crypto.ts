const ARCHIVE_PREFIX = 'YJZENC1:';
const KEY_MATERIAL = 'yingjiezhuan-web-save-archive-key-v1';
const encoder = new TextEncoder();
const decoder = new TextDecoder();
let cachedKey: Promise<CryptoKey> | undefined;

function subtleCrypto(): SubtleCrypto {
  if (!globalThis.crypto?.subtle) throw new Error('当前浏览器不支持存档加密，请使用 HTTPS 或最新版浏览器。');
  return globalThis.crypto.subtle;
}

function getKey(): Promise<CryptoKey> {
  return cachedKey ??= (async () => {
    const subtle = subtleCrypto();
    const digest = await subtle.digest('SHA-256', encoder.encode(KEY_MATERIAL));
    return subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  })();
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

function fromBase64(text: string): Uint8Array {
  const binary = atob(text);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function isEncryptedSaveText(text: string): boolean {
  return text.startsWith(ARCHIVE_PREFIX);
}

export async function encryptSaveText(plainText: string): Promise<string> {
  const subtle = subtleCrypto();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await subtle.encrypt({ name: 'AES-GCM', iv }, await getKey(), encoder.encode(plainText));
  return ARCHIVE_PREFIX + toBase64(new Uint8Array([...iv, ...new Uint8Array(encrypted)]));
}

export async function decryptSaveText(cipherText: string): Promise<string> {
  if (!isEncryptedSaveText(cipherText)) throw new Error('这不是受支持的加密存档。');
  try {
    const bytes = fromBase64(cipherText.slice(ARCHIVE_PREFIX.length));
    if (bytes.length <= 12) throw new Error('密文长度无效。');
    const iv = bytes.slice(0, 12);
    const payload = bytes.slice(12);
    const plain = await subtleCrypto().decrypt({ name: 'AES-GCM', iv }, await getKey(), payload);
    return decoder.decode(plain);
  } catch {
    throw new Error('存档无法解密或数据已损坏。');
  }
}

export class EncryptedSaveStorage {
  private values = new Map<string, string | null>();
  private ready = false;
  private pending = Promise.resolve();
  private writeError: unknown;
  readonly invalidKeys: string[] = [];

  async initialize(keys: string[]): Promise<void> {
    if (this.ready) return;
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        this.values.set(key, null);
        continue;
      }
      if (isEncryptedSaveText(raw)) {
        try {
          this.values.set(key, await decryptSaveText(raw));
        } catch {
          this.values.set(key, null);
          this.invalidKeys.push(key);
        }
      } else {
        this.values.set(key, raw);
      }
    }
    this.ready = true;
    // Existing plaintext saves remain readable, then are rewritten as ciphertext.
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (raw !== null && !isEncryptedSaveText(raw) && !this.invalidKeys.includes(key)) this.setItem(key, raw);
    }
  }

  getItem(key: string): string | null {
    this.assertReady();
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.assertReady();
    this.values.set(key, value);
    this.enqueue(async () => localStorage.setItem(key, await encryptSaveText(value)));
  }

  removeItem(key: string): void {
    this.assertReady();
    this.values.set(key, null);
    this.enqueue(() => localStorage.removeItem(key));
  }

  async flush(): Promise<void> {
    await this.pending;
    if (this.writeError) {
      const error = this.writeError;
      this.writeError = undefined;
      throw error;
    }
  }

  private enqueue(write: () => Promise<void> | void): void {
    this.pending = this.pending.then(async () => {
      try { await write(); }
      catch (error) { this.writeError = error; }
    });
  }

  private assertReady(): void {
    if (!this.ready) throw new Error('存档加密尚未初始化。');
  }
}
