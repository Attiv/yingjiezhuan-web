import type { Roster } from './rules/types';

/**
 * 剧情与流程脚本：一份脚本从头演到尾，对话、旁白、选择和战斗都只是其中的一步。
 * 这一层只管「下一步是什么」，不碰画面；进度是一个可以直接序列化的对象，存档时原样存下。
 */
export type Flag = string | number | boolean;

export type Step =
  | { t: 'bg'; key: string } // 换背景：界面层按 key 找图，空串 = 不用背景
  | { t: 'say'; who: string; text: string } // 对话，等玩家点一下
  | { t: 'text'; text: string } // 旁白，等玩家点一下
  | { t: 'choice'; who?: string; text: string; options: { label: string; set?: Record<string, Flag>; goto?: string }[] }
  | { t: 'set'; flag: string; value: Flag }
  | { t: 'if'; flag: string; is?: Flag; goto: string } // 标志等于 is 就跳转；不写 is = 标志为真就跳转
  | { t: 'label'; name: string }
  | { t: 'goto'; label: string }
  | { t: 'battle'; level: string; win?: string; lose?: string } // 打一关；胜/败后跳到对应标签，不写 lose = 败了重打
  | { t: 'end' };

/** 需要界面处理、要等玩家的步骤；其余步骤由 nextStep 自己走完。 */
export type Shown = Extract<Step, { t: 'say' | 'text' | 'choice' | 'battle' }>;

export interface Script {
  id: string;
  title: string;
  steps: Step[];
}

/** 流程进度。pc 指向正在等玩家的那一步，-1 表示还没开始。 */
export interface Story {
  script: string;
  pc: number;
  bg: string;
  flags: Record<string, Flag>;
  roster: Roster; // 跨战斗保留的成长
  gold: number;
}

/** 脚本是外来的数据，装载时先查一遍：跳转目标都得存在，要打的关卡都得已登记。 */
export function checkScript(s: Script, hasLevel: (id: string) => boolean): Script {
  const bad = (i: number, msg: string) => new Error(`脚本「${s.id}」第 ${i + 1} 步：${msg}`);
  const labels = new Set<string>();
  s.steps.forEach((st, i) => {
    if (st.t !== 'label') return;
    if (labels.has(st.name)) throw bad(i, `标签 ${st.name} 重复`);
    labels.add(st.name);
  });
  s.steps.forEach((st, i) => {
    const targets = st.t === 'goto' ? [st.label] : st.t === 'if' ? [st.goto] : st.t === 'battle' ? [st.win, st.lose]
      : st.t === 'choice' ? st.options.map((o) => o.goto) : [];
    for (const t of targets) if (t !== undefined && !labels.has(t)) throw bad(i, `找不到标签 ${t}`);
    if (st.t === 'choice' && !st.options.length) throw bad(i, '选择没有选项');
    if (st.t === 'battle' && !hasLevel(st.level)) throw bad(i, `关卡 ${st.level} 没有登记`);
  });
  return s;
}

export const startStory = (s: Script): Story => ({ script: s.id, pc: -1, bg: '', flags: {}, roster: {}, gold: 0 });

/** 正在等玩家的那一步（读档后从这里接着演）；已演完则为 null。 */
export const currentStep = (s: Script, st: Story) => (s.steps[st.pc] ?? null) as Shown | null;

/**
 * 往下演，返回下一个需要界面处理的步骤（对话、旁白、选择、战斗）；演完返回 null。
 * 当前步是选择时 answer 是选中的序号；是战斗时 answer 为 0 表示胜、1 表示败。
 */
export function nextStep(s: Script, st: Story, answer = 0): Shown | null {
  const jump = (label?: string) => {
    if (label !== undefined) st.pc = s.steps.findIndex((x) => x.t === 'label' && x.name === label);
  };
  const cur = s.steps[st.pc];
  if (cur?.t === 'choice') {
    const o = cur.options[answer];
    if (!o) throw new Error(`脚本「${s.id}」第 ${st.pc + 1} 步：没有第 ${answer + 1} 个选项`);
    Object.assign(st.flags, o.set);
    jump(o.goto);
  } else if (cur?.t === 'battle') {
    if (answer === 0) jump(cur.win);
    else if (cur.lose === undefined) return cur; // 败了重打：停在这一步
    else jump(cur.lose);
  }
  // 连续的不等人步骤一口气走完；走的步数超过脚本长度的若干倍，只可能是跳转成了环
  for (let budget = s.steps.length * 4 + 16; budget > 0; budget--) {
    const x = s.steps[++st.pc];
    if (!x || x.t === 'end') return (st.pc = s.steps.length), null;
    if (x.t === 'bg') st.bg = x.key;
    else if (x.t === 'set') st.flags[x.flag] = x.value;
    else if (x.t === 'goto') jump(x.label);
    else if (x.t === 'if') (x.is === undefined ? st.flags[x.flag] : st.flags[x.flag] === x.is) && jump(x.goto);
    else if (x.t !== 'label') return x;
  }
  throw new Error(`脚本「${s.id}」在第 ${st.pc + 1} 步附近转圈，一直没有等玩家的步骤`);
}
