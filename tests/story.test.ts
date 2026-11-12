import { describe, expect, it } from 'vitest';
import { CAMPAIGN } from '../src/data/campaign';
import { DEMO, DEMO_LEVELS } from '../src/data/demo';
import { SISHUI } from '../src/data/sishui';
import { doAttack, harvest, levelById, newBattle, registerLevel } from '../src/rules/turn';
import { checkScript, currentStep, nextStep, startStory, type Script, type Story } from '../src/story';

registerLevel(SISHUI);
const known = (id: string) => !!levelById(id);
/** 一路点下去，遇到选择按 pick 选，直到战斗或结束；返回沿途显示过的文字。 */
function run(s: Script, st: Story, pick: number, answer = 0) {
  const seen: string[] = [];
  for (let step = nextStep(s, st, answer); step; step = nextStep(s, st, step.t === 'choice' ? pick : 0)) {
    if (step.t === 'battle') return { seen, battle: step.level };
    seen.push(step.text);
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
    expect(() => checkScript(s([{ t: 'battle', level: 'nowhere' }]), known)).toThrow('没有登记');
    expect(() => checkScript(s([{ t: 'choice', text: '?', options: [] }]), known)).toThrow('没有选项');
    expect(() => checkScript(s([{ t: 'label', name: 'a' }, { t: 'label', name: 'a' }]), known)).toThrow('重复');
  });

  it('跳转成环、一直不等玩家的脚本会报错而不是卡死', () => {
    const loop: Script = { id: 'loop', title: '', steps: [{ t: 'label', name: 'a' }, { t: 'goto', label: 'a' }] };
    expect(() => nextStep(loop, startStory(loop))).toThrow('转圈');
  });
});

describe('多关卡与队伍继承', () => {
  it('上一战的等级、经验、道具带进下一战；友军和敌军不受影响', () => {
    const first = newBattle(SISHUI, 1).b;
    const guan = first.units.find((u) => u.name === '关羽')!;
    Object.assign(guan, { level: 4, exp: 37 });
    guan.items.push(30);
    const roster = harvest(first);
    expect(Object.keys(roster).sort()).toEqual(['关羽', '刘备', '张飞'].sort());

    const second = newBattle(SISHUI, 2, roster).b;
    const g = second.units.find((u) => u.name === '关羽')!;
    expect([g.level, g.exp, g.items]).toEqual([4, 37, [12, 30]]);
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
