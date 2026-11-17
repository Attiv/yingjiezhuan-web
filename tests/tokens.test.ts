import { describe, expect, it } from 'vitest';
import game from '../src/data/game.json';
import { tokenColumn, TOKEN_COLUMNS } from '../src/token-art';

const icon = (key: string, cls: number, enemy = false) => tokenColumn({ key, name: key, cls, slot: enemy ? 15 : 0 });

describe('原版 HEXZCHR 战场形象全量映射', () => {
  it('保留47列原始编号，刘备按三个步兵兵种选旗兵，转其他兵种用对应通用形象', () => {
    expect(TOKEN_COLUMNS).toBe(47);
    expect([0, 1, 2].map((cls) => icon('liu_bei', cls))).toEqual([38, 39, 40]);
    expect(icon('liu_bei', 6)).toBe(12);
  });
  it('吕布与曹操在不同兵种及阵营中都使用原版专属棋子', () => {
    for (const cls of [6, 7, 8]) for (const enemy of [false, true]) {
      expect(icon('lu_bu', cls, enemy)).toBe(45);
      expect(icon('cao_cao', cls, enemy)).toBe(46);
    }
  });
  it('旧档缺少key可用原版简繁人名识别，已有明确key不被同名覆盖', () => {
    for (const name of ['呂布', '吕布']) expect(tokenColumn({ name, cls: 7, slot: 15 })).toBe(45);
    for (const name of ['劉備', '刘备']) expect(tokenColumn({ name, cls: 1, slot: 0 })).toBe(39);
    expect(tokenColumn({ key: 'another', name: '吕布', cls: 7, slot: 15 })).toBe(15);
  });
  it('19种普通兵种两阵营逐一对应0–37列，不误取特效/状态列', () => {
    for (let cls = 0; cls < 19; cls++) {
      expect(icon('generic', cls)).toBe(cls * 2);
      expect(icon('generic', cls, true)).toBe(cls * 2 + 1);
    }
  });
  it('逐一检查129份武将模板与70关全部出场及增援，所有映射有效且专属列正确', () => {
    expect(Object.keys(game.officers)).toHaveLength(129);
    expect(Object.keys(game.battles)).toHaveLength(70);
    const verify = (u: { key: string; name: string; cls: number; slot: number }) => {
      const col = tokenColumn(u);
      expect(Number.isInteger(col) && col >= 0 && col < TOKEN_COLUMNS, `${u.key}/${u.cls}`).toBe(true);
      expect([41, 42, 43, 44]).not.toContain(col);
      if (u.key === 'lu_bu') expect(col).toBe(45);
      if (u.key === 'cao_cao') expect(col).toBe(46);
    };
    for (const [key, u] of Object.entries(game.officers)) verify({ ...u, key, slot: 0 });
    let count = 0;
    for (const battle of Object.values(game.battles)) {
      for (const u of [...battle.units, ...Object.values(battle.groups).flat()]) {
        verify({ ...u, slot: u.side === 'enemy' ? 15 : 0 });
        count++;
      }
    }
    expect(count).toBe(1499);
  });
});
