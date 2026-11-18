import { describe, expect, it } from 'vitest';
import { CAMPAIGN } from '../src/data/campaign';
import { DEMO, DEMO_LEVELS } from '../src/data/demo';
import { SISHUI } from '../src/data/sishui';
import { doAttack, harvest, levelById, newBattle, registerLevel } from '../src/rules/turn';
import { SCRIPT } from '../src/data/game';
import { checkScript, currentStep, nextStep, restoreStoryPosition, startStory, type Script, type Story } from '../src/story';

registerLevel(SISHUI);
const known = (id: string) => !!levelById(id);
/** 一路点下去，遇到选择按 pick 选，直到战斗或结束；返回沿途显示过的文字。 */
function run(s: Script, st: Story, pick: number, answer = 0) {
  const seen: string[] = [];
  for (let step = nextStep(s, st, answer); step; step = nextStep(s, st, step.t === 'choice' ? pick : 0)) {
    if (step.t === 'battle') return { seen, battle: step.level };
    if ('text' in step) seen.push(step.text);
  }
  return { seen, battle: null };
}

describe('剧情脚本', () => {
  it('示例流程通过装载检查', () => {
    expect(() => checkScript(CAMPAIGN, known)).not.toThrow();
  });

  it('选择会设标志、能跳过一段；演到战斗就停下', () => {
    const heard = startStory(CAMPAIGN);
    const a = run(CAMPAIGN, heard, 0);
    expect(a.battle).toBe('sishui');
    expect(heard.flags.briefed).toBe(true);
    expect(a.seen.some((t) => t.includes('左键选择部队'))).toBe(true);

    const skipped = startStory(CAMPAIGN);
    const b = run(CAMPAIGN, skipped, 1);
    expect(b.battle).toBe('sishui');
    expect(skipped.flags.briefed).toBeUndefined();
    expect(b.seen.some((t) => t.includes('左键选择部队'))).toBe(false);
    expect(skipped.bg).toBe('title');
  });

  it('战败且没写 lose：停在同一场战斗；战胜后按战斗里的事件分支，演完返回 null', () => {
    const st = startStory(CAMPAIGN);
    run(CAMPAIGN, st, 1);
    const at = st.pc;
    expect(nextStep(CAMPAIGN, st, 1)).toBe(currentStep(CAMPAIGN, st));
    expect(st.pc).toBe(at);

    const plain = structuredClone(st);
    expect(run(CAMPAIGN, plain, 0).seen[0]).toContain('华雄已退');
    st.flags['sishui.duel'] = true;
    const duel = run(CAMPAIGN, st, 0);
    expect(duel.seen[0]).toContain('好刀法');
    expect(duel.battle).toBeNull();
    expect(currentStep(CAMPAIGN, st)).toBeNull();
  });

  it('小沛第二组交谈以稳定房间锚点暂停，恢复后继续到原始出发提示', () => {
    const roomId = 'c1_s2_story1:b1g2';
    const st = startStory(SCRIPT, { party: ['liu_bei', 'guan_yu', 'zhang_fei', 'sun_qian'] });
    let step = nextStep(SCRIPT, st);
    for (let n = 0; step && n < 20000 && !(step.t === 'room' && step.id === roomId); n++) {
      step = nextStep(SCRIPT, st, 0);
    }
    expect(step).toEqual({ t: 'room', id: roomId });
    expect(st.resume).toEqual({ t: 'room', id: roomId });

    const saved: Story = JSON.parse(JSON.stringify(st));
    expect(restoreStoryPosition(SCRIPT, saved)).toBe(true);
    expect(currentStep(SCRIPT, saved)).toEqual(step);
    expect(saved).toEqual(st);

    const lines: string[] = [];
    for (let n = 0; n < 100; n++) {
      step = nextStep(SCRIPT, saved);
      if (!step) break;
      if (step.t === 'say') lines.push(step.text);
      if (step.t === 'say' && step.text === '大哥，去哪裡？') break;
    }
    expect(lines.filter((text) => text === '大哥，去哪裡？')).toHaveLength(1);
  });

  it('进度是纯数据：序列化再读回，接下去演的内容一样', () => {
    const st = startStory(CAMPAIGN);
    nextStep(CAMPAIGN, st);
    nextStep(CAMPAIGN, st);
    const copy: Story = JSON.parse(JSON.stringify(st));
    expect(run(CAMPAIGN, copy, 0)).toEqual(run(CAMPAIGN, st, 0));
  });

  it('装载时查出坏脚本：缺标签、没登记的关卡、空选择、重复标签', () => {
    const s = (steps: Script['steps']): Script => ({ id: 't', title: '', steps });
    expect(() => checkScript(s([{ t: 'goto', label: 'x' }]), known)).toThrow('找不到标签 x');
    expect(() => checkScript(s([{ t: 'room', id: 'meeting', options: [
      { who: 1, label: '出战', prompt: { who: 'hero', text: '出发吗？' }, goto: 'missing' },
    ] }]), known)).toThrow('找不到标签 missing');
    expect(() => checkScript(s([{ t: 'battle', level: 'nowhere' }]), known)).toThrow('没有登记');
    expect(() => checkScript(s([{ t: 'choice', text: '?', options: [] }]), known)).toThrow('没有选项');
    expect(() => checkScript(s([{ t: 'label', name: 'a' }, { t: 'label', name: 'a' }]), known)).toThrow('重复');
  });

  it('动作、等待和自由交谈各占一步，读档保留房间位置', () => {
    const s: Script = { id: 'timeline', title: '', steps: [
      { t: 'action', op: { at: 0, op: 'move', who: 1, x: 8, y: 5 } },
      { t: 'action', op: { at: 0, op: 'remove', who: 1 } },
      { t: 'wait', ms: 1200 }, { t: 'gold', n: 500 },
      { t: 'room', id: 'tent' }, { t: 'battle', level: 'sishui' },
    ] };
    const st = startStory(s);
    expect(nextStep(s, st)).toMatchObject({ t: 'action', op: { op: 'move' } });
    expect(nextStep(s, st)).toMatchObject({ t: 'action', op: { op: 'remove' } });
    expect(nextStep(s, st)).toEqual({ t: 'wait', ms: 1200 });
    expect(nextStep(s, st)).toEqual({ t: 'room', id: 'tent' });
    expect(st.gold).toBe(500);
    const copy = JSON.parse(JSON.stringify(st));
    expect(currentStep(s, copy)).toEqual({ t: 'room', id: 'tent' });
    expect(copy.resume).toEqual({ t: 'room', id: 'tent' });
    expect(nextStep(s, copy)).toMatchObject({ t: 'battle' });
    expect(copy.gold).toBe(500);
  });

  it('跳转成环、一直不等玩家的脚本会报错而不是卡死', () => {
    const loop: Script = { id: 'loop', title: '', steps: [{ t: 'label', name: 'a' }, { t: 'goto', label: 'a' }] };
    expect(() => nextStep(loop, startStory(loop))).toThrow('转圈');
  });
});

describe('存档位置恢复', () => {
  const script = (steps: Script['steps']): Script => ({ id: 'restore', title: '', steps });
  const camp = (battle: string): Script['steps'][number] => ({ t: 'camp', battle, title: '', shop: [] });

  it.each([false, true])('新增步骤后按保存标志恢复两条营地路线：%s，且重复调用幂等', (east) => {
    const old = script([
      { t: 'stage', id: 'meeting' }, { t: 'if', flag: 'east', is: true, goto: 'east' },
      { t: 'goto', label: 'west' },
      { t: 'label', name: 'east' }, camp('east-battle'), { t: 'battle', level: 'east-battle' },
      { t: 'label', name: 'west' }, camp('west-battle'), { t: 'battle', level: 'west-battle' },
    ]);
    const st = startStory(old, { party: ['hero'], gold: 800 });
    st.flags = { east, rewarded: true };
    let step = nextStep(old, st);
    while (step && step.t !== 'camp') step = nextStep(old, st);
    delete st.resume;
    const before = structuredClone(st);
    const flags = st.flags, party = st.party;
    const updated = script([
      { t: 'stage', id: 'meeting' },
      { t: 'set', flag: 'east', value: !east }, { t: 'set', flag: 'rewarded', value: false },
      { t: 'gold', n: 500 }, { t: 'join', id: 'new-hero' }, { t: 'away', id: 'hero' },
      { t: 'level', id: 'hero', n: 1 }, { t: 'item', id: 'sword' }, { t: 'class', id: 'hero', cls: 2 },
      { t: 'room', id: 'new-room' }, { t: 'say', who: 'hero', text: '新增对白' },
      { t: 'if', flag: 'east', is: true, goto: 'east' }, { t: 'goto', label: 'west' },
      { t: 'label', name: 'east' }, { t: 'stage', id: 'east-stage' }, camp('east-battle'),
      { t: 'battle', level: 'east-battle' },
      { t: 'label', name: 'west' }, { t: 'stage', id: 'west-stage' }, camp('west-battle'),
      { t: 'battle', level: 'west-battle' },
    ]);
    expect(restoreStoryPosition(updated, st)).toBe(true);
    const route = east ? 'east' : 'west';
    expect(currentStep(updated, st)).toEqual(camp(`${route}-battle`));
    expect(st.pc).not.toBe(before.pc);
    expect(st).toEqual({ ...before, pc: st.pc, section: `${route}-stage`, resume: { t: 'camp', id: `${route}-battle` } });
    expect(st.flags).toBe(flags);
    expect(st.party).toBe(party);
    const restored = structuredClone(st);
    expect(restoreStoryPosition(updated, st)).toBe(true);
    expect(st).toEqual(restored);
  });

  it.each(['battle', 'camp', 'room'] as const)('按 %s 锚点恢复并刷新实际舞台', (t) => {
    const s = script([
      { t: 'stage', id: 'actual' }, { t: 'gold', n: 100 },
      { t: 'room', id: 'same' }, camp('same'), { t: 'battle', level: 'same' },
    ]);
    const st = startStory(s, { gold: 100 });
    Object.assign(st, { pc: 999, section: 'stale', resume: { t, id: 'same' } });
    expect(restoreStoryPosition(s, st)).toBe(true);
    expect(currentStep(s, st)?.t).toBe(t);
    expect(st.section).toBe('actual');
    expect(st.gold).toBe(100);
    const copy = structuredClone(st);
    expect(restoreStoryPosition(s, st)).toBe(true);
    expect(st).toEqual(copy);
    if (t === 'room') {
      expect(nextStep(s, st)?.t).toBe('camp');
      expect(st.gold).toBe(100);
    }
  });

  it('战斗 ID 优先于坏 resume；坏战斗 ID 不回退到有效 resume', () => {
    const s = script([{ t: 'stage', id: 'battle-stage' }, { t: 'battle', level: 'battle' }, camp('camp')]);
    const st = startStory(s);
    st.resume = { t: 'room', id: 'missing' };
    expect(restoreStoryPosition(s, st, 'battle')).toBe(true);
    expect(st.resume).toEqual({ t: 'battle', id: 'battle' });
    expect(st.section).toBe('battle-stage');
    const before = structuredClone(st);
    expect(restoreStoryPosition(s, st, 'missing')).toBe(false);
    expect(st).toEqual(before);
  });

  it.each([0, 1])('鄴城重复战后片段按保存的变体标志汇合到唯一营地：%s', (variant) => {
    for (const n of [2, 3]) {
      const st = startStory(SCRIPT, { party: ['liu_bei'], gold: 765 });
      Object.assign(st, { pc: -200, section: `c4_s2_b${n}_outro`, flags: { orig_f218: variant } });
      const before = structuredClone(st);
      const battle = `c4_s2_b${n + 1}${variant ? '_f218' : ''}`;
      expect(restoreStoryPosition(SCRIPT, st)).toBe(true);
      expect(currentStep(SCRIPT, st)).toMatchObject({ t: 'camp', battle });
      expect(st).toEqual({ ...before, pc: st.pc, resume: { t: 'camp', id: battle } });
      const restored = structuredClone(st);
      expect(restoreStoryPosition(SCRIPT, st)).toBe(true);
      expect(st).toEqual(restored);
    }
  });

  it('重复舞台若通向不同营地则拒绝，不凭数组位置猜路线', () => {
    const s = script([
      { t: 'stage', id: 'saved' }, camp('east'), { t: 'battle', level: 'east' },
      { t: 'stage', id: 'saved' }, camp('west'), { t: 'battle', level: 'west' },
    ]);
    const st = { ...startStory(s), section: 'saved', pc: 1 };
    const before = structuredClone(st);
    expect(restoreStoryPosition(s, st)).toBe(false);
    expect(st).toEqual(before);
  });

  it('真实 SCRIPT 随机路线的无锚点旧营地档恢复到原营地', () => {
    const reached = new Map<string, Story>();
    for (let seed = 1; seed <= 300; seed++) {
      let state = seed;
      const random = () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
      const st = startStory(SCRIPT);
      let step = nextStep(SCRIPT, st);
      for (let n = 0; step && n < 20000; n++) {
        if (step.t === 'camp' && !reached.has(step.battle)) reached.set(step.battle, structuredClone(st));
        const answer = step.t === 'choice' || (step.t === 'room' && step.options?.length) ? Math.floor(random() * step.options!.length) : 0;
        step = nextStep(SCRIPT, st, answer);
      }
    }
    expect(reached.size).toBeGreaterThanOrEqual(60);
    for (const [battle, saved] of reached) {
      const expectedSection = saved.section;
      delete saved.resume;
      saved.pc = -200;
      const before = structuredClone(saved);
      expect(restoreStoryPosition(SCRIPT, saved), `${battle} section=${saved.section} flags=${JSON.stringify(saved.flags)}`).toBe(true);
      expect(currentStep(SCRIPT, saved), battle).toMatchObject({ t: 'camp', battle });
      expect(saved.section, battle).toBe(expectedSection);
      expect(saved, `${battle} 不重放剧情效果`).toEqual({ ...before, pc: saved.pc, resume: { t: 'camp', id: battle } });
      const restored = structuredClone(saved);
      expect(restoreStoryPosition(SCRIPT, saved)).toBe(true);
      expect(saved, `${battle} 重复恢复幂等`).toEqual(restored);
    }
  });

  it.each(['c0_s0_story0', 'c0_s0_story1', 'c0_s0_story2', 'c0_s0_story3', 'c0_s0_story4', 'c0_s0_b5_before'])(
    '真实序章旧档 %s 回到自由房间且不重复奖励', (section) => {
      const st = startStory(SCRIPT, { party: ['liu_bei'], gold: 1200 });
      Object.assign(st, { pc: 98, section, flags: { orig_f0: 1 } });
      const before = structuredClone(st);
      expect(restoreStoryPosition(SCRIPT, st)).toBe(true);
      expect(currentStep(SCRIPT, st)).toEqual({ t: 'room', id: 'c0_s0_story4' });
      expect(st).toEqual({ ...before, pc: st.pc, section: 'c0_s0_story4', resume: { t: 'room', id: 'c0_s0_story4' } });
      const restored = structuredClone(st);
      expect(restoreStoryPosition(SCRIPT, st)).toBe(true);
      expect(st).toEqual(restored);
    },
  );

  it.each([
    { t: 'room', id: 'missing' }, { t: 'camp', id: '' }, { t: 'stage', id: 'saved' }, null,
  ])('坏锚点不回退到 section 或碰巧有效的 pc：%j', (resume) => {
    const s = script([{ t: 'stage', id: 'saved' }, camp('valid')]);
    const st = { ...startStory(s), section: 'saved', pc: 1, resume } as Story;
    const before = structuredClone(st);
    expect(restoreStoryPosition(s, st)).toBe(false);
    expect(st).toEqual(before);
  });

  it.each<Script['steps']>([
    [{ t: 'goto', label: 'missing' }],
    [{ t: 'label', name: 'loop' }, { t: 'goto', label: 'loop' }],
    [{ t: 'choice', text: '路线', options: [{ label: '东', set: { route: true } }, { label: '西', set: { route: false } }] }],
    [{ t: 'battle', level: 'previous' }],
    [{ t: 'end' }],
    [{ t: 'ending', text: '结束' }],
    [{ t: 'goto', label: 'duplicate' }, { t: 'label', name: 'duplicate' }, { t: 'label', name: 'duplicate' }],
  ])('无法可靠解析旧档时原样拒绝：%j', (...middle) => {
    const s = script([{ t: 'stage', id: 'saved' }, ...middle, camp('valid')]);
    const st = { ...startStory(s), section: 'saved', pc: s.steps.length - 1 };
    const before = structuredClone(st);
    expect(restoreStoryPosition(s, st)).toBe(false);
    expect(st).toEqual(before);
  });

  it('缺失场景、剧本不匹配、无营地和重复稳定锚点均拒绝', () => {
    const s = script([{ t: 'stage', id: 'saved' }, camp('duplicate'), camp('duplicate')]);
    const cases: Story[] = [
      { ...startStory(s), section: 'missing', pc: 1 },
      { ...startStory(s), section: '', pc: 1 },
      { ...startStory(s), script: 'other', resume: { t: 'camp', id: 'duplicate' } },
      { ...startStory(s), section: 'saved' },
      { ...startStory(s), resume: { t: 'camp', id: 'duplicate' } },
      { ...startStory(s), section: 'c0_s0_story4' },
    ];
    for (const st of cases) {
      const before = structuredClone(st);
      expect(restoreStoryPosition(s, st)).toBe(false);
      expect(st).toEqual(before);
    }
    const empty = script([{ t: 'stage', id: 'saved' }]);
    expect(restoreStoryPosition(empty, { ...startStory(empty), section: 'saved' })).toBe(false);
  });
});

describe('多关卡与队伍继承', () => {
  it('上一战的等级、经验、道具带进下一战；友军和敌军不受影响', () => {
    const first = newBattle(SISHUI, 1).b;
    const guan = first.units.find((u) => u.name === '关羽')!;
    Object.assign(guan, { level: 4, exp: 37, cls: 7 });
    guan.items.push(30);
    const roster = harvest(first);
    expect(Object.keys(roster).sort()).toEqual(['关羽', '刘备', '张飞'].sort());

    const second = newBattle(SISHUI, 2, roster).b;
    const g = second.units.find((u) => u.name === '关羽')!;
    expect([g.level, g.exp, g.items, g.cls]).toEqual([4, 37, [12, 30], 7]);
    expect(g.hp).toBeGreaterThan(newBattle(SISHUI, 2).b.units.find((u) => u.name === '关羽')!.hp); // 满兵力按新等级算
    expect(second.units.find((u) => u.name === '公孙瓒')!.level).toBe(4);
    expect(second.units.find((u) => u.name === '华雄')!.level).toBe(5);
  });

  it('演示流程：两场战斗各一击取胜，第二场带着第一场的等级和道具', () => {
    DEMO_LEVELS.forEach(registerLevel);
    expect(() => checkScript(DEMO, known)).not.toThrow();
    const one = newBattle(DEMO_LEVELS[0], 1).b;
    doAttack(one, 0, 15);
    expect(one.stage).toBe('won');
    const two = newBattle(DEMO_LEVELS[1], 1, harvest(one)).b;
    expect(two.units[0].level).toBeGreaterThanOrEqual(30);
    expect(two.units[0].items).toEqual([27]);
    doAttack(two, 0, 15);
    expect(two.stage).toBe('won');
  });

  it('登记关卡时查出坏数据', () => {
    expect(() => registerLevel({ ...SISHUI, id: 'bad1', terrain: SISHUI.terrain.slice(1) })).toThrow('地形应有');
    expect(() => registerLevel({ ...SISHUI, id: 'bad2', boss: 44 })).toThrow('不存在的部队槽位 44');
    expect(() => registerLevel({ ...SISHUI, id: 'bad3', units: SISHUI.units.map((u) => ({ ...u, x: 0, y: 0 })) })).toThrow('同一格');
    expect(levelById('bad1')).toBeUndefined();
  });
});
