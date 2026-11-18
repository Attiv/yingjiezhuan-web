import { describe, expect, it } from 'vitest';
import { scene } from '../src/data/game';
import {
  MAP_H,
  MAP_W,
  STAGES,
  StageScript,
  ACTOR_COLS,
  ACTOR_ROWS,
  isSceneMap,
  mapPoint,
  mapSrc,
  stageOf,
  actorFrame,
  fieldPoint,
  moveDirection,
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

  it('宫殿使用原版城郭图，野外使用完整行军图', () => {
    expect(mapSrc('palace/000')).toBe('/assets/story/pmap-000.png');
    expect(mapSrc('palace/014')).toBe('/assets/story/pmap-014.png');
    expect(mapSrc('field')).toBe('/assets/maps/campaign/000.png');
    expect(mapSrc('field', 2)).toBe('/assets/maps/campaign/002.png');
    expect(mapSrc('')).toBe('');
    expect([MAP_W, MAP_H]).toEqual([512, 320]);
  });

  it('复现 MAIN 0x1DAA6 的交错列及 SSCCHR2 底部锚点', () => {
    expect(mapPoint(0, 0)).toEqual({ left: 20, top: 30 });
    expect(mapPoint(10, 4)).toEqual({ left: 220, top: 110 });
    expect(mapPoint(31, 19)).toEqual({ left: 640, top: 390 });
    // 陈留宫殿：献帝在奇数列；董卓在偶数列，必须额外下移 20px。
    expect(mapPoint(25, 6)).toEqual({ left: 520, top: 130 });
    expect(mapPoint(16, 11)).toEqual({ left: 340, top: 250 });
    // 营帐：袁绍与曹操相邻列，原版的列交错不能抹平。
    expect(mapPoint(23, 7)).toEqual({ left: 480, top: 150 });
    expect(mapPoint(20, 7)).toEqual({ left: 420, top: 170 });
  });

  it('人物用 SSCCHR2 外观号、正背面两向与左右镜像，和兵种无关', () => {
    expect(actorFrame(0, 2)).toEqual({ col: 0, row: 0, flip: false }); // 下：正面
    expect(actorFrame(16, 0)).toEqual({ col: 16, row: 2, flip: false }); // 上：背面
    expect(actorFrame(8, 1)).toEqual({ col: 8, row: 2, flip: true }); // 右：背面 + 镜像
    expect(actorFrame(28, 3)).toEqual({ col: 28, row: 0, flip: true }); // 左：正面 + 镜像
    // step=1 是同朝向的迈步帧，四帧都要用得上，不能只定格在两帧上
    expect(actorFrame(0, 2, 1)).toEqual({ col: 0, row: 1, flip: false });
    expect(actorFrame(16, 0, 1)).toEqual({ col: 16, row: 3, flip: false });
    expect(ACTOR_COLS).toBe(29);
    expect(ACTOR_ROWS).toBe(4);
    const sc = new StageScript(stageOf('c0_s0_story1'));
    sc.advance(0);
    expect(sc.people.get(382)?.sprite).toBe(16); // 獻帝
    expect(sc.people.get(3)?.sprite).toBe(8); // 董卓
    expect(sc.people.get(6)?.sprite).toBe(12); // 李儒
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

  it('刚走一步的人切到迈步帧，下一句收回站立姿态', () => {
    const s = new StageScript(PLAY);
    s.advance(0);
    expect(s.people.get(2)?.walking).toBeFalsy();
    s.advance(1);
    expect(s.people.get(2)?.walking).toBe(true);
    s.advance(1); // 这一句没有新动作，但迈出去的那一步已经演完
    expect(s.people.get(2)?.walking).toBe(false);
    expect(s.people.get(1)?.walking).toBeFalsy(); // 站着的人始终不迈步
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

  it('同一幕中途换图时清场，野外原始坐标不会混进宫殿', () => {
    const s = new StageScript({ map: 'palace/005', lines: 2, ops: [
      { at: 0, op: 'place', who: 3, x: 23, y: 7 },
      { at: 1, op: 'map', map: 'field' },
      { at: 1, op: 'place', who: 5, x: 1, y: 26 },
      { at: 2, op: 'map', map: 'palace/014' },
      { at: 2, op: 'place', who: 8, x: 23, y: 7 },
    ] });
    s.advance(0);
    expect(s.people.has(3)).toBe(true);
    s.advance(1);
    expect(s.map).toBe('field');
    expect([...s.people.keys()]).toEqual([5]);
    expect(s.people.get(5)).toMatchObject({ x: 1, y: 26 });
    s.advance(2);
    expect(s.map).toBe('palace/014');
    expect([...s.people.keys()]).toEqual([8]);
  });

  it('逐条取动作可在移动完成后再退场，不能提前删除人物', () => {
    const s = new StageScript({ map: 'palace/007', lines: 1, ops: [
      { at: 0, op: 'place', who: 1, x: 4, y: 5 },
      { at: 1, op: 'move', who: 1, x: 8, y: 5 },
      { at: 1, op: 'remove', who: 1 },
    ] });
    s.take(0).forEach((op) => s.run(op));
    const [move, remove] = s.take(1);
    const path = s.path(1, move.x!, move.y!);
    expect(path.length).toBeGreaterThan(1);
    expect(path.at(-1)).toEqual({ x: 8, y: 5 });
    expect(s.people.has(1)).toBe(true);
    s.run(move);
    expect(s.people.get(1)).toMatchObject({ x: 8, y: 5 });
    s.run(remove);
    expect(s.people.has(1)).toBe(false);
    expect(s.take(1)).toEqual([]);
  });

  it('行军道路路径不穿过非道路格，镜头坐标使用原始32px格', () => {
    const info = stageOf('c0_s0_story3')!;
    const s = new StageScript(info);
    s.run({ at: 0, op: 'map', map: 'field' });
    s.run({ at: 0, op: 'place', who: 8, x: 1, y: 26 });
    const path = s.path(8, 15, 33);
    expect(path.length).toBeGreaterThan(1);
    expect(path.at(-1)).toEqual({ x: 15, y: 33 });
    for (const p of path) expect(info.routes?.[p.y]?.[p.x]).toBe('#');
    expect(fieldPoint(1, 26)).toEqual({ left: 60, top: 1060 });
    expect(moveDirection({ x: 1, y: 1 }, { x: 2, y: 1 }, true)).toBe(1);
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
  it('白帝城托孤对白保留缩进续行，仍按同一个说话步骤对齐', () => {
    const steps = scene('c3_s4_story7');
    expect(steps).toContainEqual({
      t: 'say', who: 'liu_bei',
      text: '孔明，多虧了你，我才能奪得漢中，才有今天這樣的局面．\n這次，我沒聽你的勸告而去討伐東吳，以致遭到如此慘敗，這是報應啊．',
    });
    const stage = stageOf('c3_s4_story7');
    expect(stage).toMatchObject({
      map: 'palace/022',
      lines: steps.filter((step) => step.t === 'say' || step.t === 'text').length,
      source: { chapter: 3, scene: 4, block: 7, records: [0] },
    });
    expect(stage?.ops).toContainEqual(expect.objectContaining({ at: 5, op: 'move', who: 125, x: 14, y: 6 }));
  });

  it('麦城胜负结算精确定位 block 1 的各自记录', () => {
    expect(stageOf('c3_s4_b0_outro')).toMatchObject({
      lines: 2, source: { chapter: 3, scene: 4, block: 1, records: [8] },
    });
    expect(stageOf('c3_s4_b0_defeat')).toMatchObject({
      lines: 2, source: { chapter: 3, scene: 4, block: 1, records: [6] },
    });
  });

  it('许昌前置对白只覆盖原记录前段，不提前加载出征战场', () => {
    expect(stageOf('c4_s1_b7_before')).toMatchObject({
      map: null, lines: 11, ops: [],
      source: { chapter: 4, scene: 1, block: 7, records: [1], codeRange: [0, 2] },
    });
    expect(scene('c4_s1_b7_before').filter((step) => step.t === 'say' || step.t === 'text')).toHaveLength(11);
  });

  it('只有控制指令的无对白节点不生成伪舞台', () => {
    const silent = [
      'c1_s0_b6_outro', 'c1_s1_b7_before', 'c3_s2_b10_outro', 'c3_s2_b10_before',
      'c3_s4_b4_before', 'c4_s1_b6_before', 'orig_c4_s0_b5_6_2',
    ];
    for (const id of silent) {
      expect(scene(id).length).toBeGreaterThan(0);
      expect(scene(id).filter((step) => step.t === 'say' || step.t === 'text')).toEqual([]);
      expect(stageOf(id)).toBeUndefined();
    }
  });

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

  it('原始序章有序执行动作，交谈效果与自动对白分离', () => {
    for (let i = 0; i < 5; i++) expect(stageOf(`c0_s0_story${i}`)?.timeline?.length).toBeGreaterThan(0);
    const info = stageOf('c0_s0_story4')!;
    expect(info.timeline?.some((s) => s.t === 'set' && ['orig_f0', 'orig_f1'].includes(s.flag))).toBe(false);
    expect(info.room?.shop).toEqual([27, 28, 29, 30, 31, 32, 52, 53, 54]);
    expect(info.room?.talks['12'].steps).toContainEqual({ t: 'set', flag: 'orig_f0', value: 1 });
    expect(info.room?.talks['15'].steps).toContainEqual({ t: 'set', flag: 'orig_f1', value: 1 });
    expect(info.room?.talks['374'].shop).toBe(true);
    expect(info.room?.talks['1'].depart).toBe(true);
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
          expect(op.sprite).toBeTypeOf('number');
          expect(op.sprite).toBeGreaterThanOrEqual(0);
          expect(op.sprite).toBeLessThan(ACTOR_COLS);
          // 保留原版字节坐标，包括退场和野外；不能以图内范围判断记录是否正确。
          expect(op.x).toBeGreaterThanOrEqual(0);
          expect(op.x).toBeLessThan(256);
          expect(op.y).toBeGreaterThanOrEqual(0);
          expect(op.y).toBeLessThan(256);
          expect(op.dir ?? 0).toBeGreaterThanOrEqual(0);
          expect(op.dir ?? 0).toBeLessThan(4);
        }
        if (op.op === 'caption') expect(op.text).toBeTruthy();
      }
      // 野外保留原始道路坐标，运行时由完整行军地图承载并滚屏。
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
