import { describe, expect, it } from 'vitest';
import { makeSaveArchive, parseSaveArchive } from '../src/save-archive';

interface TestSave { at: number; marker: string }
const valid = (entry: Record<string, unknown>): TestSave | null =>
  typeof entry.at === 'number' && Number.isSafeInteger(entry.at) && typeof entry.marker === 'string'
    ? { at: entry.at, marker: entry.marker }
    : null;
const saves = {
  slots: [{ at: 123, marker: 'campaign save' }, null, null, null, null, null],
  last: 0,
  auto: { at: 456, marker: 'automatic save' },
};

describe('存档归档', () => {
  it('导出并恢复六格手动档、最近档位与自动档', () => {
    const text = makeSaveArchive('campaign-a', saves, 789);
    expect(parseSaveArchive(text, 'campaign-a', valid)).toEqual(saves);
  });

  it('拒绝其他剧本的存档', () => {
    const text = makeSaveArchive('campaign-a', saves, 789);
    expect(() => parseSaveArchive(text, 'campaign-b', valid)).toThrow('其他剧本');
  });

  it('坏档、缺档位与无存档文件均不进入游戏', () => {
    expect(() => parseSaveArchive('{broken', 'campaign-a', valid)).toThrow('JSON');
    const unsupported = JSON.parse(makeSaveArchive('campaign-a', saves, 789));
    unsupported.version = 99;
    expect(() => parseSaveArchive(JSON.stringify(unsupported), 'campaign-a', valid)).toThrow('版本');
    const malformed = JSON.parse(makeSaveArchive('campaign-a', saves, 789));
    malformed.slots[0] = { at: 123, marker: 4 };
    expect(() => parseSaveArchive(JSON.stringify(malformed), 'campaign-a', valid)).toThrow('檔1');
    malformed.slots = [];
    expect(() => parseSaveArchive(JSON.stringify(malformed), 'campaign-a', valid)).toThrow('六个');
    const empty = makeSaveArchive('campaign-a', { slots: Array(6).fill(null), last: null, auto: null }, 789);
    expect(() => parseSaveArchive(empty, 'campaign-a', valid)).toThrow('没有可导入的存档');
  });

  it('最近档位必须指向一个有效手动档', () => {
    const malformed = JSON.parse(makeSaveArchive('campaign-a', saves, 789));
    malformed.last = 1;
    expect(() => parseSaveArchive(JSON.stringify(malformed), 'campaign-a', valid)).toThrow('最近档位');
  });
});
