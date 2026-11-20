export const SAVE_ARCHIVE_FORMAT = 'yingjiezhuan-save';
export const SAVE_ARCHIVE_VERSION = 1;

export interface SaveArchiveList<T> {
  slots: (T | null)[];
  last: number | null;
  auto: T | null;
}

interface SaveArchive<T> extends SaveArchiveList<T> {
  format: typeof SAVE_ARCHIVE_FORMAT;
  version: typeof SAVE_ARCHIVE_VERSION;
  campaignId: string;
  exportedAt: number;
}

export function makeSaveArchive<T>(campaignId: string, saves: SaveArchiveList<T>, exportedAt = Date.now()): string {
  const archive: SaveArchive<T> = {
    format: SAVE_ARCHIVE_FORMAT,
    version: SAVE_ARCHIVE_VERSION,
    campaignId,
    exportedAt,
    slots: saves.slots,
    last: saves.last,
    auto: saves.auto,
  };
  return JSON.stringify(archive, null, 2);
}

export function parseSaveArchive<T extends { at: number }>(
  text: string,
  campaignId: string,
  validateSave: (entry: Record<string, unknown>) => T | null,
): SaveArchiveList<T> {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error('文件不是有效的 JSON 存档。');
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('存档文件格式无效。');

  const archive = value as Partial<SaveArchive<unknown>>;
  if (archive.format !== SAVE_ARCHIVE_FORMAT || archive.version !== SAVE_ARCHIVE_VERSION) {
    throw new Error('存档文件格式或版本不受支持。');
  }
  if (archive.campaignId !== campaignId) throw new Error('这份存档属于其他剧本，无法导入当前进度。');
  if (!Number.isFinite(archive.exportedAt) || !Array.isArray(archive.slots) || archive.slots.length !== 6) {
    throw new Error('存档文件缺少完整的六个手动档位。');
  }

  const parseEntry = (entry: unknown, label: string): T | null => {
    if (entry === null || entry === undefined) return null;
    if (typeof entry !== 'object' || Array.isArray(entry)) throw new Error(`${label}的数据格式无效。`);
    const save = validateSave(entry as Record<string, unknown>);
    if (!save || !Number.isSafeInteger(save.at) || save.at <= 0) throw new Error(`${label}的数据无效或与当前游戏进度不匹配。`);
    return save;
  };
  const slots = archive.slots.map((entry, i) => parseEntry(entry, `檔${i + 1}`));
  const auto = parseEntry(archive.auto, '自动档');
  if (!slots.some(Boolean) && !auto) throw new Error('存档文件里没有可导入的存档。');

  const last = archive.last;
  if (last === undefined || (last !== null && (!Number.isInteger(last) || last < 0 || last >= slots.length || !slots[last]))) {
    throw new Error('存档文件里的最近档位信息无效。');
  }
  return { slots, last, auto };
}
