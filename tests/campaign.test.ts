import { describe, expect, it } from 'vitest';
import { SCRIPT, defaultDeploy, hasLevel, level, officers, scene, speakerFaces } from '../src/data/game';
import { StageScript, stageOf } from '../src/stage';
import { MARCH_CHAPTERS, MARCH_MAPS, chapterOfName, chapterTitle, marchMap } from '../src/data/march';
import type { Battle, Roster } from '../src/rules/types';
import { aiStep, doWait, endPhase, newBattle } from '../src/rules/turn';
import { checkScript, currentStep, nextStep, restoreStoryPosition, startStory, testFlag, type Shown, type StoryApi, type Step } from '../src/story';

/**
 * 整部游戏的剧本数据：从原版盘转出来的 5491 步、610 幕插剧、70 场战斗。
 * 这里不碰画面，只查数据自洽和不点鼠标也能演到底。
 */

/** 剧本里所有出现的插幕名。 */
const scenes = new Map<string, Step[]>();

/** 带记录的剧情推进：武将加入/离队/升级都照做，好在走完之后查结果。
 *  rand 决定每次选择怎么答；返回走过的战斗与最终停在哪。 */
function walk(rand: () => number) {
  const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei'] });
  const log: { joins: string[]; aways: string[]; battles: string[]; levels: number } = { joins: [], aways: [], battles: [], levels: 0 };
  const api: StoryApi = {
    join(st, id) { if (!log.joins.includes(id)) log.joins.push(id); if (!st.party.includes(id)) st.party.push(id); },
    away(st, id) { log.aways.push(id); st.party = st.party.filter((x) => x !== id); },
    level() { log.levels++; },
  };
  let step = nextStep(SCRIPT, st, 0, api) as Shown | null;
  let n = 0;
  for (; step && n < 20000; n++) {
    const s = step as unknown as Step;
    if (s.t === 'battle') log.battles.push(s.level);
    // 选择随便挑一项；战斗多半打赢，偶尔按失败的分支走，两条线都走到
    const a = s.t === 'choice' || (s.t === 'room' && s.options?.length) ? Math.floor(rand() * s.options!.length) : s.t === 'battle' ? (rand() < 0.15 ? 1 : 0) : 0;
    step = nextStep(SCRIPT, st, a, api) as Shown | null;
  }
  return { st, log, step, steps: n };
}

/** 固定种子的伪随机，跑多少遍结果都一样。 */
function seeded(seed: number) {
  let r = (seed * 2654435761) % 4294967296;
  return () => (r = (r * 1103515245 + 12345) % 2147483648) / 2147483648;
}

describe('整部剧本的数据', () => {
  it('装载检查通过：每个跳转目标都有标签，70 场战斗都有关卡数据', () => {
    expect(() => checkScript(SCRIPT, hasLevel)).not.toThrow();
    const battles = SCRIPT.steps.filter((s): s is Extract<Step, { t: 'battle' }> => s.t === 'battle');
    expect(battles).toHaveLength(70);
    for (const b of battles) expect(level(b.level), b.level).toBeDefined();
  });

  it('平原议事厅按原始阶段交谈，不提前让简雍和使者登场或入队', () => {
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei'], gold: 733 });
    st.pc = SCRIPT.steps.findIndex((s) => s.t === 'stage' && s.id === 'c1_s0_story0') - 1;
    let stage = new StageScript(), section = '';
    const rooms: { id: string; people: number[]; party: string[]; guan: unknown }[] = [];
    const joins: string[] = [];
    for (let i = 0; i < 300; i++) {
      const step = nextStep(SCRIPT, st, 0, { join(st, id) { joins.push(id); st.party.push(id); } });
      if (!step || step.t === 'camp') break;
      if (section !== st.section) { section = st.section; stage = new StageScript(stageOf(section), stage); }
      if (step.t === 'action') stage.run(step.op);
      if (step.t === 'room') rooms.push({ id: step.id, people: [...stage.people.keys()].sort((a, b) => a - b), party: [...st.party], guan: stage.people.get(1) });
    }
    expect(rooms.map((r) => r.id)).toEqual(['c1_s0_story0:b0g2', 'c1_s0_story0:b1g0', 'c1_s0_story1:b2g0', 'c1_s0_story2:b2g1']);
    expect(rooms[0].people).toEqual([0, 1, 2]);
    expect(rooms[0].party).not.toContain('jian_yong');
    expect(rooms[1].people).toEqual([0, 1, 2, 82]);
    expect(rooms[1].guan).toMatchObject({ x: 6, y: 15, dir: 1 });
    expect(rooms[1].party).not.toContain('jian_yong');
    expect(rooms[2].people).toEqual([0, 1, 2, 82, 364]);
    expect(rooms[2].party).toContain('jian_yong');
    expect(joins).toEqual(['jian_yong']);
    expect(st.gold).toBe(733);
    const first = stageOf('c1_s0_story0')!.rooms!;
    expect(first['c1_s0_story0:b0g2'].talks).toEqual({
      '1': [{ t: 'say', who: 'guan_yu', text: '城裡有酒館等居民聚集的地方，想從居民那裡得到情報，還是去人多的地方好．' }],
      '2': [{ t: 'say', who: '張飛', text: '有什麼事的話會去叫你．' }],
    });
    expect(first['c1_s0_story0:b1g0'].talks['1']).toEqual([{ t: 'say', who: 'guan_yu', text: '請兄長講話．' }]);
    expect(stageOf('c1_s0_story1')!.rooms!['c1_s0_story1:b2g0'].next?.who).toBe(364);
    expect(stageOf('c1_s0_story2')!.rooms!['c1_s0_story2:b2g1'].talks['364']).toEqual([{ t: 'say', who: '使者', text: '劉備，請你盡快去支援吧．' }]);
  });

  it('广川和信都的交谈暂停保留真实在场人物，出发问句由确认框承担', () => {
    for (const [sid, roomId, expected] of [
      ['c1_s0_story5', 'c1_s0_story5:b5g4', [0, 1, 2, 82, 244, 245, 374]],
      ['c1_s0_story8', 'c1_s0_story8:b8g1', [0, 1, 2, 82, 220]],
    ] as const) {
      const info = stageOf(sid)!, room = info.rooms![roomId];
      const sc = new StageScript(info);
      const steps = scene(sid);
      for (const step of steps) {
        if (step.t === 'room') break;
        if (step.t === 'action') sc.run(step.op);
      }
      expect([...sc.people.keys()].sort((a, b) => a - b), sid).toEqual(expected);
      for (const who of Object.keys(room.talks)) expect(sc.people.has(Number(who))).toBe(true);
      expect(room.next?.prompt).toEqual({ who: 'guan_yu', text: '準備好了嗎？' });
      expect(steps.some((s) => s.t === 'say' && s.text === '準備好了嗎？')).toBe(false);
    }
    expect(stageOf('c1_s0_story5')!.rooms!['c1_s0_story5:b5g4'].shop?.who).toBe(374);
  });

  it('北海战后停留交谈，孔融赠金只执行一次，出发后才升级友军并行军徐州', () => {
    const id = 'c1_s1_story4', roomId = `${id}:b4g1`;
    const info = stageOf(id)!;
    const room = info.rooms?.[roomId];
    expect(room, '北海须有独立交谈阶段').toBeDefined();
    expect(room!.talks).toEqual({
      '7': [{ t: 'say', who: 'kong_rong', text: '努力啊．' }],
      '149': [{ t: 'say', who: 'taishi_ci', text: '謝謝你，有劉備支援，徐州就萬無一失了．' }],
    });
    expect(room!.next).toMatchObject({ who: 1, prompt: { who: 'guan_yu', text: '準備好了嗎？' } });
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei'], gold: 733 });
    st.pc = SCRIPT.steps.findIndex(s => s.t === 'stage' && s.id === id) - 1;
    const stage = new StageScript(info), upgrades: [string, number][] = [];
    const api: StoryApi = { level(s, who, n) {
      upgrades.push([who, n]);
      const r = (s.roster[who] ??= { level: officers[who].level, exp: 0, items: [] });
      r.level += n;
    } };
    let step: Shown | null = null;
    for (let i = 0; i < 100; i++) {
      step = nextStep(SCRIPT, st, 0, api);
      if (step?.t === 'action') stage.run(step.op);
      if (!step || step.t === 'room' || step.t === 'camp') break;
    }
    expect(step).toEqual({ t: 'room', id: roomId });
    expect(st.gold).toBe(1233);
    expect(upgrades).toEqual([]);
    expect(stage.map).toBe('palace/002');
    expect([...stage.people.keys()].sort((a, b) => a - b)).toEqual([0, 1, 7, 149]);
    expect(stage.people.get(0)).toMatchObject({ x: 7, y: 15, sprite: 2 });
    expect(stage.people.get(1)).toMatchObject({ x: 8, y: 16, dir: 3 });
    expect(stage.people.get(7)).toMatchObject({ x: 8, y: 15, dir: 2 });
    expect(stage.people.get(149)).toMatchObject({ x: 14, y: 13, dir: 2 });
    const saved = structuredClone(st);
    saved.pc = -200;
    expect(restoreStoryPosition(SCRIPT, saved)).toBe(true);
    expect(saved).toEqual(st);
    expect(currentStep(SCRIPT, saved)).toEqual(step);
    // 闲谈使用独立步骤，不推进主线，也不能重复奖励或升级。
    for (let repeat = 0; repeat < 2; repeat++) for (const steps of Object.values(room!.talks)) {
      const local = { ...saved, pc: -1 };
      const script = { id: 'talk', title: '', steps };
      while (nextStep(script, local, 0, api)) { /* 读完闲谈 */ }
      expect(local.gold).toBe(1233);
    }
    expect(upgrades).toEqual([]);
    const after: string[] = [];
    for (let i = 0; i < 100; i++) {
      step = nextStep(SCRIPT, saved, 0, api);
      if (!step || step.t === 'camp') break;
      if (step.t === 'action') stage.run(step.op);
      if (step.t === 'say') {
        after.push(step.text);
        expect(upgrades).toEqual([['taishi_ci', 4], ['tao_qian', 6]]);
      }
    }
    expect(step).toMatchObject({ t: 'camp', battle: 'c1_s1_b5' });
    expect(after).toEqual(['快去徐州吧．', '劉備，徐州在北海的南面，快去吧．']);
    expect(stage.map).toBe('field');
    expect(stage.people.get(0)).toMatchObject({ x: 40, y: 24, dir: 2, sprite: 3 });
    expect(saved.gold).toBe(1233);
    expect(saved.party).toEqual(st.party);
    const b = newBattle(level('c1_s1_b5')!, 1, saved.roster).b;
    expect(b.units.find(u => u.key === 'tao_qian')!.level).toBe(10);
    expect(b.units.find(u => u.key === 'taishi_ci')!.level).toBe(13);
  });

  it('徐州先点陶谦议论，再由关羽或张飞确认路线，存读档保留阶段', () => {
    const id = 'c1_s1_story6', first = `${id}:b6g2`, decision = `${id}:b6g3`;
    const info = stageOf(id)!;
    expect(info.rooms?.[first], '致谢后须先交还控制，点陶谦才议论').toBeDefined();
    expect(info.rooms?.[first].next?.who).toBe(15);
    expect(info.rooms?.[first].talks['1']).toEqual([{ t: 'say', who: 'guan_yu', text: '我們能來得及支援，太好了．' }]);
    expect(info.rooms?.[decision].talks['15']).toEqual([{ t: 'say', who: 'tao_qian', text: '莫非要我投降才是上策？' }]);
    for (const route of [0, 1]) {
      const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei'], gold: 733 });
      st.pc = SCRIPT.steps.findIndex(s => s.t === 'stage' && s.id === id) - 1;
      const stage = new StageScript(info), lines: string[] = [];
      let step: Shown | null;
      const advance = () => {
        for (let n = 0; n < 150; n++) {
          step = nextStep(SCRIPT, st, route);
          if (step?.t === 'action') stage.run(step.op);
          if (step?.t === 'say') lines.push(step.text);
          if (!step || step.t === 'room' || step.t === 'camp' || st.section !== id) return step;
        }
        throw new Error('徐州阶段未结束');
      };
      expect(advance()).toEqual({ t: 'room', id: first });
      expect(lines.at(-1)).toBe('非常感謝．');
      expect(stage.map).toBe('palace/004');
      expect([...stage.people.keys()].sort((a, b) => a - b)).toEqual([0, 1, 2, 15, 63, 64, 65]);
      expect(stage.people.get(64)).toMatchObject({ x: 11, y: 9, dir: 1 });
      expect(stage.people.get(2)).toMatchObject({ x: 5, y: 14, dir: 0 });
      const restore = () => {
        const saved = structuredClone(st);
        st.pc = -200;
        expect(restoreStoryPosition(SCRIPT, st)).toBe(true);
        expect(st).toEqual(saved);
      };
      restore();
      const choice = advance();
      expect(choice).toMatchObject({ t: 'room', id: decision, options: [
        { who: 1, prompt: { who: 'guan_yu', text: '哦，兄長，決定出征了嗎？' } },
        { who: 2, prompt: { who: '張飛', text: '大哥，派我去向曹操軍求和嗎？' } },
      ] });
      expect(lines.at(-1)).toContain('你想好的話，跟張飛或我說一下．');
      expect(stage.people.get(2)).toMatchObject({ x: 5, y: 14, dir: 1 });
      expect(st.flags.orig_f219).toBeUndefined();
      expect(st.flags.orig_route_c1_s1_b6).toBe(0);
      restore();
      const next = advance();
      expect(st.gold).toBe(733);
      expect(st.party).toEqual(['liu_bei', 'guan_yu', 'zhang_fei']);
      if (route === 0) {
        expect(next).toMatchObject({ t: 'camp', battle: 'c1_s1_b7' });
        expect(st.flags.orig_f219).toBe(1);
        expect(st.flags.orig_route_c1_s1_b6).toBe(0);
        expect(stage.map).toBe('field');
        expect(stage.people.get(0)).toMatchObject({ x: 32, y: 30, dir: 3, sprite: 3 });
        expect(stage.people.get(8)).toMatchObject({ x: 32, y: 30, dir: 2 });
        expect(lines).not.toContain('這樣決定了的話就簡單了．好，我馬上就去．');
      } else {
        expect(st.section).toBe('c1_s1_story8');
        expect(st.flags.orig_f219).toBeUndefined();
        expect(st.flags.orig_route_c1_s1_b6).toBe(1);
        expect(stage.people.has(2)).toBe(false);
        expect(lines).toContain('這樣決定了的話就簡單了．好，我馬上就去．');
        expect(lines).not.toContain('快做出征準備吧．');
      }
    }
  });

  it('返回徐州先点陶谦受托，再点孙乾入队，求和奖励只发一次，抵达小沛后点赵云告别', () => {
    const id = 'c1_s1_story10', first = `${id}:b10g1`, second = `${id}:b10g2`, farewell = 'c1_s1_story11:b11g1';
    const info = stageOf(id)!;
    expect(info.rooms?.[first], '返回徐州须恢复交谈与原始站位').toBeDefined();
    expect(info.rooms?.[first].next?.who).toBe(15);
    expect(info.rooms?.[second].next?.who).toBe(63);
    expect(info.rooms?.[first].talks['64']).toEqual([{ t: 'say', who: 'mi_zhu', text: '謝謝，這樣徐州得救了．' }]);
    expect(info.rooms?.[second].talks['64']).toEqual([{ t: 'say', who: 'mi_zhu', text: '小沛就拜託你們了．' }]);
    for (const peace of [0, 1]) {
      const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei', 'zhao_yun'], gold: 733 });
      st.flags.orig_f97 = peace;
      st.bag = [30];
      st.pc = SCRIPT.steps.findIndex(s => s.t === 'stage' && s.id === id) - 1;
      let stage = new StageScript(), section = '';
      const lines: string[] = [], effects: string[] = [];
      const api: StoryApi = {
        item(s, item) { effects.push(`item:${item}`); if (item === 'twin_swords') s.bag.push(57); },
        join(s, who) { effects.push(`join:${who}`); if (!s.party.includes(who)) s.party.push(who); },
        away(s, who) { effects.push(`away:${who}`); s.party = s.party.filter(x => x !== who); },
      };
      const advance = () => {
        for (let n = 0; n < 200; n++) {
          const step = nextStep(SCRIPT, st, 0, api);
          if (section !== st.section) { section = st.section; stage = new StageScript(stageOf(section), stage); }
          if (step?.t === 'action') stage.run(step.op);
          if (step?.t === 'say') lines.push(step.text);
          if (!step || step.t === 'room' || st.section === 'c1_s2_story0') return step;
        }
        throw new Error('徐州返回阶段未结束');
      };
      const restore = () => {
        const expected = structuredClone(st), before = [...effects];
        st.pc = -999;
        expect(restoreStoryPosition(SCRIPT, st)).toBe(true);
        expect(st).toEqual(expected);
        expect(effects).toEqual(before);
      };
      expect(advance()).toEqual({ t: 'room', id: first });
      expect([...stage.people.keys()].sort((a, b) => a - b)).toEqual([0, 1, 2, 15, 63, 64, 65]);
      expect(stage.map).toBe('palace/004');
      expect(stage.people.get(0)).toMatchObject({ x: 9, y: 14, dir: 0, sprite: 2 });
      expect(stage.people.get(64)).toMatchObject({ x: 15, y: 7, dir: 1 });
      expect(lines).toHaveLength(peace ? 3 : 1);
      expect(effects).toEqual([]);
      restore();
      expect(advance()).toEqual({ t: 'room', id: second });
      expect(st.bag).toEqual(peace ? [30, 57] : [30]);
      expect(effects).toEqual(peace ? ['item:twin_swords'] : []);
      expect(st.party).not.toContain('sun_qian');
      expect(lines.some(s => s.includes('雌雄雙劍'))).toBe(!!peace);
      restore();
      expect(advance()).toEqual({ t: 'room', id: farewell });
      expect(st.party).toContain('sun_qian');
      expect(st.party).toContain('zhao_yun');
      expect(stage.map).toBe('palace/002');
      expect([...stage.people.keys()].sort((a, b) => a - b)).toEqual([0, 1, 2, 53, 63]);
      expect(stage.people.get(53)).toMatchObject({ x: 12, y: 13, dir: 2 });
      expect(stageOf('c1_s1_story11')!.rooms![farewell].next?.who).toBe(53);
      restore();
      advance();
      expect(st.section).toBe('c1_s2_story0');
      expect(st.party).not.toContain('zhao_yun');
      expect(effects).toEqual([...(peace ? ['item:twin_swords'] : []), 'join:sun_qian', 'away:zhao_yun']);
      expect(st.gold).toBe(733);
    }
  });

  it('序章自由房间与后续69个营地都指向有出兵位的战斗', () => {
    const camps = SCRIPT.steps.filter((s): s is Extract<Step, { t: 'camp' }> => s.t === 'camp');
    expect(camps).toHaveLength(69);
    const rooms = SCRIPT.steps.filter((s) => s.t === 'room');
    expect(rooms).toHaveLength(13);
    expect(rooms).toContainEqual({ t: 'room', id: 'c0_s0_story4' });
    expect(new Set(rooms.map((s) => s.id)).size).toBe(rooms.length);
    for (const c of camps) {
      const lv = level(c.battle);
      expect(lv, c.battle).toBeDefined();
      expect(lv!.deploy!.slots.length).toBeGreaterThan(0);
      expect(c.shop.length).toBeGreaterThan(0);
    }
  });

  it('610 幕插剧：幕内标签不重名，跳转目标都在，缺的插幕数 = 0', () => {
    const ids = SCRIPT.steps.filter((s): s is Extract<Step, { t: 'battle' }> => s.t === 'battle').map((s) => s.level);
    for (const id of ids) {
      const lv = level(id)!;
      for (const ev of lv.events ?? []) {
        for (const a of ev.actions) if (a.op === 'drama') scenes.set(a.scene, scene(a.scene));
      }
    }
    expect(scenes.size).toBeGreaterThan(300);
    for (const [id, steps] of scenes) {
      expect(steps.length, `${id} 缺内容`).toBeGreaterThan(0);
      const labels = new Set<string>();
      for (const s of steps) {
        if (s.t !== 'label') continue;
        expect(labels.has(s.name), `${id} 标签 ${s.name} 重复`).toBe(false);
        labels.add(s.name);
      }
      steps.forEach((s, i) => {
        const targets = s.t === 'goto' ? [s.label] : s.t === 'if' ? [s.goto]
          : s.t === 'choice' || s.t === 'room' ? (s.options ?? []).map((o) => o.goto) : [];
        for (const t of targets) expect(t === undefined || labels.has(t), `${id} 第 ${i + 1} 步找不到标签 ${t}`).toBe(true);
        if (s.t === 'say') expect(typeof s.text === 'string' && s.text.length > 0, `${id} 第 ${i + 1} 步空台词`).toBe(true);
      });
    }
  });

  it('不点鼠标也能一路演到底：每遍都会结束，不会绕死在分支里', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 120; seed++) {
      const { st, log, step, steps } = walk(seeded(seed));
      expect(step, `第 ${seed} 遍停在第 ${st.pc} 步`).toBeNull();
      expect(steps, `第 ${seed} 遍步数`).toBeLessThan(20000);
      expect(log.battles.length).toBeGreaterThan(0);
      for (const id of log.battles) seen.add(id);
      if (seed === 1) {
        expect(log.joins.length).toBeGreaterThan(3); // 沿途不断有人加入
        expect(log.levels).toBeGreaterThan(0);
        expect(st.party.length).toBeGreaterThan(3);
      }
    }
    // 原版有分支（投奔谁、走哪条路），一遍走不完全部；多跑几遍能覆盖绝大多数关卡
    expect(seen.size).toBeGreaterThanOrEqual(60);
    const all = new Set(SCRIPT.steps.filter((s): s is Extract<Step, { t: 'battle' }> => s.t === 'battle').map((s) => s.level));
    for (const id of seen) expect(all.has(id)).toBe(true);
  });

  it('除刘备外，武将和说话人头像不会错误回退成刘备', () => {
    const liuFaces = new Set(['liu_bei', '劉備']);
    const wrongOfficers = Object.entries(officers)
      .filter(([id, o]) => o.face === 'faces/000' && !liuFaces.has(id))
      .map(([id, o]) => `${id}:${o.name}`);
    expect(wrongOfficers).toEqual([]);
    const wrongSpeakers = Object.entries(speakerFaces)
      .filter(([who, face]) => face === 'faces/000' && !liuFaces.has(who))
      .map(([who]) => who);
    expect(wrongSpeakers).toEqual([]);
  });

  it('70 场战斗都能按关卡数据开打：出征名单不空、槽位不撞、地形对得上', () => {    const roster: Roster = {};
    for (const [id, o] of Object.entries(officers)) roster[id] = { level: o.level, exp: 0, items: [] };
    const battles = SCRIPT.steps.filter((s): s is Extract<Step, { t: 'battle' }> => s.t === 'battle').map((s) => s.level);
    battles.forEach((id, n) => {
      const lv = level(id)!;
      const deploy = [...lv.deploy!.required, ...Object.keys(roster)].filter((k) => lv.candidates![k]).slice(0, lv.deploy!.max);
      expect(deploy.length, `${id} 出征名单`).toBeGreaterThan(0);
      const { b } = newBattle(lv, n + 1, roster, { deploy });
      expect(b.units.filter((u) => u.on && !u.group && u.mode === 7).length, `${id} 出征人数`).toBe(deploy.length);
      expect(b.terrain.length).toBe(b.w * b.h);
      const cells = b.units.filter((u) => u.on && !u.group).map((u) => u.y * b.w + u.x);
      expect(new Set(cells).size, `${id} 有部队重叠`).toBe(cells.length);
      for (const u of b.units) expect(b.terrain[u.y * b.w + u.x], `${id} ${u.name} 站在界内`).toBeDefined();
      expect(b.objective.length, `${id} 胜利条件`).toBeGreaterThan(0);
    });
  });

  it('布阵：玩家指定的格子优先，没指定的按关卡自带的出兵位', () => {
    const lv = level('c0_s0_b5')!;
    const [ax, ay] = lv.deploy!.slots[0];
    const { b } = newBattle(lv, 1, {}, { deploy: ['guan_yu', 'zhang_fei'], slots: { guan_yu: [ax + 1, ay + 1] } });
    const guan = b.units.find((u) => u.key === 'guan_yu')!;
    expect([guan.x, guan.y]).toEqual([ax + 1, ay + 1]);
    const zhang = b.units.find((u) => u.key === 'zhang_fei')!;
    expect([zhang.x, zhang.y]).toEqual(lv.deploy!.slots[1]);
  });
});

describe('战场事件', () => {
  it('相邻事件：关羽站到华雄旁边待命，演单挑、升一级、华雄撤退、直接胜利', () => {
    const lv = level('c0_s0_b5')!;
    const { b } = newBattle(lv, 3, {}, { deploy: ['guan_yu', 'zhang_fei'] });
    const guan = b.units.find((u) => u.key === 'guan_yu')!;
    const boss = b.units.find((u) => u.commander)!;
    // 直接挪到旁边，省掉走路；判定走的是和玩家点击完全一样的一套
    guan.x = boss.x + 1;
    guan.y = boss.y;
    const evs = doWait(b, guan.slot);
    expect(evs.some((e) => e.t === 'drama' && e.scene === 'orig_c0_s0_b5_5'), '应插播单挑').toBe(true);
    expect(b.stage).toBe('won');
    expect(b.reason).toBe(b.objective);
    expect(boss.on).toBe(false);
    expect(b.units.find((u) => u.key === 'guan_yu')!.level).toBe(2);
    expect(b.vars.orig_c0_s0_b5_ended).toBe(1);
  });

  it('到达事件：刘备走到指定格，插播剧情后按事件判胜', () => {
    const lv = level('c1_s1_b5')!;
    const { b } = newBattle(lv, 1, {}, { deploy: ['liu_bei'] });
    const lord = b.units.find((u) => u.key === 'liu_bei')!;
    const reach = lv.events!.find((e) => e.trigger.type === 'reach' && e.trigger.who === 'liu_bei')!;
    const [x, y] = reach.trigger.pos!;
    lord.x = x;
    lord.y = y;
    const evs = doWait(b, lord.slot);
    expect(evs.some((e) => e.t === 'drama')).toBe(true);
    expect(b.stage).toBe('won');
    expect(b.vars.orig_c1_s1_b5_ended).toBe(1);
  });

  it('相邻事件只在我方行动结束时查，不会因为对面自家人挨着就误触发', () => {
    const lv = level('c0_s0_b5')!;
    const { b } = newBattle(lv, 5, {}, { deploy: ['guan_yu', 'zhang_fei'] });
    const zhang = b.units.find((u) => u.key === 'zhang_fei')!;
    const boss = b.units.find((u) => u.commander)!;
    zhang.x = boss.x + 1;
    zhang.y = boss.y;
    doWait(b, zhang.slot); // 张飞挨着华雄不算「关羽对华雄」的单挑
    expect(b.stage).toBe('player');
    expect(boss.on).toBe(true);
  });
});

describe('标志判定', () => {
  it('没写 is 只看有没有；写了按 eq/ne/gt/lt 比', () => {
    const f = { a: 1, b: 3, c: 'x', d: true as const };
    expect(testFlag(f, 'a')).toBe(true);
    expect(testFlag(f, 'zz')).toBe(false);
    expect(testFlag(f, 'zz', undefined, 'ne')).toBe(true);
    expect(testFlag(f, 'a', 1)).toBe(true);
    expect(testFlag(f, 'a', 2, 'ne')).toBe(true);
    expect(testFlag(f, 'b', 2, 'gt')).toBe(true);
    expect(testFlag(f, 'b', 3, 'gt')).toBe(false);
    expect(testFlag(f, 'a', 2, 'lt')).toBe(true);
    expect(testFlag(f, 'c', 'x')).toBe(true);
    expect(testFlag(f, 'd')).toBe(true);
  });

  it('没设过的标志当 0：原版的「若 f8 不等於 0」对没设过的 f8 不成立', () => {
    const f = {};
    expect(testFlag(f, 'f8', 0, 'neq' as never)).toBe(false); // 写成 ne 的老脚本也照 0 比
    expect(testFlag(f, 'f8', 0, 'ne')).toBe(false);
    expect(testFlag(f, 'f8', 0, 'eq')).toBe(true);
    expect(testFlag(f, 'f8', 1, 'gt')).toBe(false);
    expect(testFlag({ f9: true }, 'f9', 1, 'eq')).toBe(true);
    expect(testFlag({ f9: false }, 'f9', 0, 'eq')).toBe(true);
  });
});

describe('首战：汜水關', () => {
  const first = (): Battle => newBattle(level('c0_s0_b5')!, 1, {}, { deploy: ['guan_yu', 'zhang_fei'] }).b;

  it('关张二人从东侧出兵位出发，华雄在西，30 回合上限', () => {
    const b = first();
    expect([b.w, b.h, level('c0_s0_b5')!.turnLimit]).toEqual([28, 16, 30]);
    expect(b.units.filter((u) => u.mode === 7).map((u) => u.name)).toEqual(['關羽', '張飛']);
    expect(b.units.find((u) => u.commander)!.name).toBe('華雄');
    expect(b.objective).toContain('華雄');
  });

  it('交谈标志决定公孙瓒、陶谦是否实际参战', () => {
    const lv = level('c0_s0_b5')!;
    const allies = (flags: Record<string, number>) => newBattle(lv, 1, {}, { deploy: ['guan_yu', 'zhang_fei'], flags }).b.units
      .filter((u) => u.on && u.slot < 15 && u.mode !== 7).map((u) => u.key);
    expect(allies({})).toEqual([]);
    expect(allies({ orig_f0: 1 })).toEqual(['gongsun_zan']);
    expect(allies({ orig_f1: 1 })).toEqual(['tao_qian']);
    expect(allies({ orig_f0: 1, orig_f1: 1 })).toEqual(['gongsun_zan', 'tao_qian']);
  });

  it('第一回合开场有插剧、关羽靠近华雄有单挑——两条事件都挂在关卡上', () => {
    const evs = level('c0_s0_b5')!.events!;
    expect(evs.some((e) => e.trigger.type === 'turn_start' && e.trigger.turn === 1)).toBe(true);
    const duel = evs.find((e) => e.trigger.type === 'adjacent')!;
    expect(duel.actions.map((a) => a.op)).toContain('drama');
    expect(duel.actions.some((a) => a.op === 'victory')).toBe(true);
  });
});

describe('AI 接管有军师的关卡', () => {
  it('军乐队 / 运输队出场时，自动行动也能在回合上限内结束，不会卡死', () => {
    const roster: Roster = {};
    for (const [id, o] of Object.entries(officers)) roster[id] = { level: o.level, exp: 0, items: [] };
    for (const id of ['c1_s0_b6', 'c1_s0_b11', 'c1_s1_b5']) {
      const lv = level(id)!;
      const deploy = defaultDeploy(id, Object.keys(roster).filter((k) => lv.candidates?.[k]));
      const { b } = newBattle(lv, 7, roster, { deploy });
      let n = 0;
      while (b.stage !== 'won' && b.stage !== 'lost' && n++ < 1200) {
        if (b.stage === 'player') endPhase(b);
        else aiStep(b);
      }
      expect(['won', 'lost'], `${id} 应该在回合上限内结束`).toContain(b.stage);
      expect(n, `${id} 行动步数`).toBeLessThan(1200);
    }
  });
});

describe('整部战役的战斗推进', () => {
  it('70 场战斗各推进 3 回合：事件、增援、AI 与数值都不出错', () => {
    const roster: Roster = {};
    for (const [id, o] of Object.entries(officers)) roster[id] = { level: o.level, exp: 0, items: [] };
    const ids = SCRIPT.steps.filter((s) => s.t === 'battle').map((s) => (s as { level: string }).level);
    const problems: string[] = [];
    for (const [n, id] of ids.entries()) {
      const lv = level(id)!;
      const deploy = defaultDeploy(id, Object.keys(roster).filter((k) => lv.candidates?.[k]));
      try {
        const { b } = newBattle(lv, n + 1, roster, { deploy });
        let steps = 0;
        while (b.stage !== 'won' && b.stage !== 'lost' && b.round <= 3 && steps++ < 3000) {
          if (b.stage === 'player') endPhase(b);
          else aiStep(b);
        }
        if (steps >= 3000) problems.push(`${id} 步数超限`);
        if (!Number.isFinite(b.rng)) problems.push(`${id} 随机数状态异常`);
        for (const u of b.units) {
          if (!Number.isFinite(u.hp) || !Number.isFinite(u.mp) || !Number.isFinite(u.morale)) problems.push(`${id} ${u.name} 数值异常`);
        }
      } catch (e) {
        problems.push(`${id} ${String(e).slice(0, 120)}`);
      }
    }
    expect(problems, `${ids.length} 关全部推进`).toEqual([]);
  });
});

describe('章节行军图', () => {
  it('五章各配一张原版图：序章与第一章共用第一张，其余依次', () => {
    expect(MARCH_CHAPTERS.map((c) => c.name)).toEqual(['序章', '第一章', '第二章', '第三章', '第四章']);
    expect(MARCH_CHAPTERS.map((c) => c.map)).toEqual([0, 0, 1, 2, 3]);
    expect(MARCH_MAPS.map((m) => m.index)).toEqual([0, 1, 2, 3]);
  });

  it('尺寸与「每章用多大一块」的表对得上，图片路径指向 maps/campaign', () => {
    const sizes = [[96, 96], [96, 96], [72, 112], [120, 88], [112, 128]];
    for (const c of MARCH_CHAPTERS) {
      const m = marchMap(c.key);
      if (!m) throw new Error(`${c.name} 没有行军图`);
      expect(m.tiles, c.name).toEqual(sizes[Number(c.key.slice(1))]);
      expect(m.image).toBe(`maps/campaign/${String(m.index).padStart(3, '0')}.png`);
    }
  });

  it('原版标题拆成章名与副题（有的标题没留空格）', () => {
    expect(chapterTitle('第一章界橋之戰')).toMatchObject({ name: '第一章', sub: '界橋之戰' });
    expect(chapterTitle('序章　群雄起兵討伐董卓')).toMatchObject({ name: '序章', sub: '群雄起兵討伐董卓' });
    expect(chapterTitle('第四章\u3000中原決死戰').chapter?.key).toBe('c4');
    expect(chapterOfName('第三章')?.key).toBe('c3');
    expect(chapterTitle('隨便一句').chapter).toBeUndefined();
  });

  it('剧本里每一处章节标题都能落到一张图上', () => {
    const titles = SCRIPT.steps.filter((s) => s.t === 'title') as { t: 'title'; text: string }[];
    expect(titles.length).toBeGreaterThanOrEqual(18);
    const bad = titles.filter((s) => {
      const t = chapterTitle(s.text);
      return !t.name || !t.sub || !t.chapter || !marchMap(t.chapter.key);
    });
    expect(bad.map((s) => s.text)).toEqual([]);
  });
});
