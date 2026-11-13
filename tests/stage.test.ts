import { describe, expect, it } from 'vitest';
import {
  MAP_H,
  MAP_W,
  STAGES,
  StageScript,
  TOKEN_COLS,
  isSceneMap,
  mapPoint,
  mapSrc,
  stageOf,
  tokenFrame,
  type StageInfo,
} from '../src/stage';

describe('剧情舞台：地图', () => {
  it('只有宫殿与野外铺场景，战场图仍然盖在战场上', () => {
    expect(isSceneMap('palace/003')).toBe(true);
    expect(isSceneMap('field')).toBe(true);
    expect(isSceneMap('battle/012')).toBe(false);
    expect(isSceneMap('')).toBe(false);
    expect(isSceneMap(null)).toBe(false);
  });

  it('地图取原版 512×320 的城郭图 / 野外地平', () => {
    expect(mapSrc('palace/000')).toBe('/assets/story/pmap-000.png');
    expect(mapSrc('palace/014')).toBe('/assets/story/pmap-014.png');
    expect(mapSrc('field')).toBe('/assets/story/field-00.png');
    expect(mapSrc('')).toBe('');
    expect([MAP_W, MAP_H]).toEqual([512, 320]);
  });

  it('人站在瓦片 (x, y) 的下沿中点，舞台按 1.25 倍铺开', () => {
    expect(mapPoint(0, 0)).toEqual({ left: 20, top: 10 });
    expect(mapPoint(10, 4)).toEqual({ left: 220, top: 90 }); // 16×10+16 = 176 → 220
    expect(mapPoint(31, 19)).toEqual({ left: 640, top: 390 }); // 右下角那格仍在 640×400 里
  });

  it('棋子取站立行，列 = 兵种×2 + 阵营', () => {
    expect(tokenFrame(0, false)).toEqual({ col: 0, row: 0 });
    expect(tokenFrame(0, true)).toEqual({ col: 1, row: 0 });
    expect(tokenFrame(17, false).col).toBe(34);
    expect(tokenFrame(18, false).col).toBe(36);
    expect(tokenFrame(18, true).col).toBe(37); // 19 个兵种用到第 37 列，第 38 列留给刘备旗步兵
    expect(TOKEN_COLS).toBe(39);
    for (let cls = 0; cls < 19; cls++) for (const enemy of [false, true]) expect(tokenFrame(cls, enemy).col).toBeLessThan(TOKEN_COLS);
  });
});

/** 手写一幕：摆两个人、走一步、退一个人、换地名。 */
const PLAY: StageInfo = {
  map: 'palace/007',
  lines: 4,
  ops: [
    { at: 0, op: 'caption', text: '洛陽宮殿' },
    { at: 0, op: 'place', who: 1, x: 4, y: 5, dir: 2, id: 'liu_bei' },
    { at: 0, op: 'place', who: 2, x: 8, y: 5, dir: 3, id: 'cao_cao' },
    { at: 1, op: 'move', who: 2, x: 6, y: 5, dir: 3, id: 'cao_cao' },
    { at: 2, op: 'remove', who: 1 },
    { at: 3, op: 'clear' },
    { at: 3, op: 'place', who: 3, x: 1, y: 1, dir: 1, id: 'dong_zhuo' },
  ],
};

describe('剧情舞台：一幕的调度', () => {
  it('按台词进度摆人：摆、走、退、清场', () => {
    const s = new StageScript(PLAY);
    expect(s.map).toBe('palace/007');
    expect(s.advance(0)).toBe(true);
    expect(s.place).toBe('洛陽宮殿');
    expect([...s.people.keys()]).toEqual([1, 2]);
    expect(s.people.get(2)).toMatchObject({ x: 8, y: 5, dir: 3, id: 'cao_cao' });

    s.advance(1);
    expect(s.people.get(2)).toMatchObject({ x: 6, y: 5, id: 'cao_cao' }); // 走一步，兵种记号跟着人
    s.advance(2);
    expect(s.people.has(1)).toBe(false);
    s.advance(3);
    expect([...s.people.keys()]).toEqual([3]);
  });

  it('只前进不后退：同一句多喊几次也不重放动作', () => {
    const s = new StageScript(PLAY);
    s.advance(3);
    expect(s.advance(3)).toBe(false); // 已经到第 3 句，没有新动作
    expect(s.advance(0)).toBe(false); // 倒回去也不会把 1 号摆回来
    expect(s.people.has(1)).toBe(false);
    expect([...s.people.keys()]).toEqual([3]);
  });

  it('没有地图的一幕接着上一幕的场面（同一处的后续段不再 load_map）', () => {
    const first = new StageScript(PLAY);
    first.advance(1);
    const next = new StageScript({ lines: 2, ops: [{ at: 0, op: 'move', who: 1, x: 5, y: 5, dir: 1, id: 'liu_bei' }] }, first);
    expect(next.map).toBe('palace/007');
    expect(next.place).toBe('洛陽宮殿');
    expect([...next.people.keys()]).toEqual([1, 2]);
    next.advance(0);
    expect(next.people.get(1)).toMatchObject({ x: 5, y: 5 });
  });

  it('换了一张地图就只画新地图，不带上一幕的人', () => {
    const first = new StageScript(PLAY);
    first.advance(1);
    const next = new StageScript({ map: 'palace/012', lines: 1, ops: [] }, first);
    expect(next.map).toBe('palace/012');
    expect(next.people.size).toBe(0);
  });

  it('战场图不铺场景（那一幕盖在战场上演出）', () => {
    expect(new StageScript({ map: 'battle/004', lines: 1, ops: [] }).map).toBe('');
    expect(new StageScript({ map: 'field', lines: 1, ops: [] }).map).toBe('field');
  });

  it('reset 清人、清地名，保留地图', () => {
    const s = new StageScript(PLAY);
    s.advance(1);
    s.reset();
    expect(s.people.size).toBe(0);
    expect(s.place).toBe('');
    expect(s.map).toBe('palace/007');
    s.advance(1); // 重来一遍还能从头摆
    expect(s.people.has(1)).toBe(true);
  });
});

describe('剧情舞台：从原版剧本转出来的数据', () => {
  it('序章第一幕就摆了陈留宫殿的十个人', () => {
    const s = stageOf('c0_s0_story1');
    expect(s?.map).toBe('palace/000');
    expect(Object.keys(s?.names ?? {})).toHaveLength(10);
    const sc = new StageScript(s);
    sc.advance(0);
    expect(sc.place).toBe('陳留宮殿');
    expect(sc.people.size).toBeGreaterThanOrEqual(8);
    // 人名都能报出来（不是无名占位）
    for (const p of sc.people.values()) expect(s?.names?.[p.who]).toBeTruthy();
    expect(Object.values(s?.names ?? {})).toContain('董卓');
  });

  it('点人说的话取自原版剧本的 talk 记录', () => {
    const s = stageOf('c0_s0_story4');
    expect(s?.map).toBe('palace/014');
    const talks = Object.entries(s?.talks ?? {});
    expect(talks.length).toBeGreaterThanOrEqual(5);
    const yuan = talks.find(([who]) => s?.names?.[who] === '袁紹');
    expect(yuan).toBeTruthy();
    expect(yuan![1].join('')).toMatch(/華雄/);
  });

  it('整部剧本的舞台数据都自洽：地图、地名、人名、坐标、动作都对得上', () => {
    const ids = Object.keys(STAGES);
    expect(ids.length).toBeGreaterThan(400);
    let placed = 0;
    let withPeople = 0;
    let withTalks = 0;
    for (const id of ids) {
      const info = STAGES[id];
      const palace = (info.map ?? '').startsWith('palace/');
      let mine = 0;
      expect(info.lines).toBeGreaterThanOrEqual(0);
      for (const op of info.ops) {
        expect(op.at).toBeGreaterThanOrEqual(0);
        expect(op.at).toBeLessThanOrEqual(Math.max(info.lines, 0) + 1);
        if (op.op === 'place' || op.op === 'move') {
          placed++;
          mine++;
          expect(op.who).toBeTypeOf('number');
          // 宫殿图是 32×20 瓦片、走格 31×20；落到图外的坐标说明配错了 record，构建时已经筛掉
          expect(op.x).toBeGreaterThanOrEqual(0);
          expect(op.x).toBeLessThan(palace ? 31 : 32);
          expect(op.y).toBeGreaterThanOrEqual(0);
          expect(op.y).toBeLessThan(20);
          expect(op.dir ?? 0).toBeGreaterThanOrEqual(0);
          expect(op.dir ?? 0).toBeLessThan(4);
        }
        if (op.op === 'caption') expect(op.text).toBeTruthy();
      }
      // 野外那一张底图装不下原版野外的坐标系（原版会跟着人滚屏），只铺景不摆人
      if (info.map === 'field') expect(mine).toBe(0);
      // 场上有人才谈得上「点他说话」，报得出名字的人才点得到
      if (mine) withPeople++;
      if (info.talks) {
        withTalks++;
        expect(mine).toBeGreaterThan(0);
      }
      for (const who of Object.keys(info.talks ?? {})) expect(info.names?.[who]).toBeTruthy();
      if (palace) expect(info.map).toMatch(/^palace\/\d{3}$/);
    }
    expect(placed).toBeGreaterThan(300);
    expect(withPeople).toBeGreaterThan(40); // 四十多幕摆得出人
    expect(withTalks).toBeGreaterThan(15); // 十几幕的人身上挂着原版台词
  });
});
