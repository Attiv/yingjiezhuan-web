import type { Roster } from './rules/types';

/**
 * 剧情与流程脚本：一份脚本从头演到尾，对话、旁白、选择、营地、单挑和战斗都只是其中的一步。
 * 这一层只管「下一步是什么」，不碰画面；进度是一个可以直接序列化的对象，存档时原样存下。
 */
export type Flag = string | number | boolean;

/** 单挑演出里的一拍：哪一方、做什么、几次。 */
export interface DuelAct {
  side: 'left' | 'right' | string;
  act: string;
  n?: number;
}

export type Step =
  | { t: 'bg'; key: string } // 换背景：界面层按 key 找图，空串 = 不用背景
  | { t: 'say'; who: string; text: string } // 对话，等玩家点一下
  | { t: 'text'; text: string } // 旁白，等玩家点一下
  | { t: 'title'; text: string } // 章节标题，等玩家点一下
  | { t: 'picture'; key: string } // 事件插画，空串 = 收起
  | { t: 'bgm'; key: string } // 换音乐
  | { t: 'hide' } // 收起场上人物
  | { t: 'choice'; who?: string; text: string; options: { label: string; set?: Record<string, Flag>; goto?: string }[] }
  | { t: 'set'; flag: string; value: Flag }
  | { t: 'if'; flag: string; is?: Flag; cmp?: 'eq' | 'ne' | 'gt' | 'lt'; goto: string }
  | { t: 'label'; name: string }
  | { t: 'goto'; label: string }
  | { t: 'join'; id: string } // 武将加入
  | { t: 'away'; id: string } // 武将离队
  | { t: 'level'; id: string; n: number } // 剧情升级
  | { t: 'gold'; n: number }
  | { t: 'item'; id: string } // 道具进库
  | { t: 'class'; id: string; cls: number } // 转职
  | { t: 'duel'; a: string; b: string; acts: DuelAct[] } // 单挑演出
  | { t: 'camp'; battle: string; title: string; shop: number[] } // 出兵准备（商店 + 编成）
  | { t: 'battle'; level: string; win?: string; lose?: string } // 打一关；胜/败后跳到对应标签，不写 lose = 败了重打
  | { t: 'ending'; text: string }
  | { t: 'end' };

/** 需要界面处理、要等玩家的步骤；其余步骤由 nextStep 自己走完。 */
export type Shown = Extract<Step, { t: 'say' | 'text' | 'title' | 'choice' | 'battle' | 'camp' | 'duel' | 'ending' }>;

export interface Script {
  id: string;
  title: string;
  steps: Step[];
}

/** 剧情层改变队伍时回调界面层（加入、离队、升级、道具、转职要查武将表）。 */
export interface StoryApi {
  join?(st: Story, id: string): void;
  away?(st: Story, id: string): void;
  level?(st: Story, id: string, n: number): void;
  item?(st: Story, id: string): void;
  cls?(st: Story, id: string, cls: number): void;
}

/** 流程进度。pc 指向正在等玩家的那一步，-1 表示还没开始。 */
export interface Story {
  script: string;
  pc: number;
  bg: string;
  picture: string; // 事件插画（assets/pictures/<key>.png），空串 = 没有
  bgm: string; // 当前音乐
  cast: string[]; // 场上人物（最多两个），对话时按出场顺序摆
  flags: Record<string, Flag>;
  roster: Roster; // 跨战斗保留的成长
  party: string[]; // 队伍里的武将 id，顺序即编成顺序
  bag: number[]; // 公共道具库
  deploy: string[]; // 下一战出征名单
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
    if (st.t === 'camp' && !hasLevel(st.battle)) throw bad(i, `营地指向的关卡 ${st.battle} 没有登记`);
  });
  return s;
}

export interface StartOpts {
  party?: string[];
  gold?: number;
  roster?: Roster;
}

export const startStory = (s: Script, o: StartOpts = {}): Story => ({
  script: s.id, pc: -1, bg: '', picture: '', bgm: '', cast: [], flags: {},
  roster: o.roster ?? {}, party: [...(o.party ?? [])], bag: [], deploy: [], gold: o.gold ?? 0,
});

/** 正在等玩家的那一步（读档后从这里接着演）；已演完则为 null。 */
export const currentStep = (s: Script, st: Story) => (s.steps[st.pc] ?? null) as Shown | null;

export type Cmp = 'eq' | 'ne' | 'gt' | 'lt';

/** 判定一个脚本标志。没写 is 就是「有没有这个标志」；写了就按 cmp 比。
 * 原版里没设过的标志一律当 0：`若 f8 不等於 0` 对没设过的 f8 不成立。 */
export function testFlag(flags: Record<string, Flag>, flag: string, is?: Flag, cmp: Cmp = 'eq') {
  const raw = flags[flag];
  if (is === undefined) return cmp === 'ne' ? !raw : !!raw;
  if (typeof is === 'number') {
    const n = typeof raw === 'boolean' ? Number(raw) : typeof raw === 'number' ? raw : 0;
    if (cmp === 'eq') return n === is;
    if (cmp === 'ne') return n !== is;
    return cmp === 'gt' ? n > is : n < is;
  }
  if (cmp === 'eq') return raw === is;
  if (cmp === 'ne') return raw !== is;
  const a = Number(raw ?? 0), b = Number(is);
  return cmp === 'gt' ? a > b : a < b;
}
const condition = (st: Story, flag: string, is: Flag | undefined, cmp: Cmp = 'eq') => testFlag(st.flags, flag, is, cmp);

/**
 * 往下演，返回下一个需要界面处理的步骤（对话、旁白、标题、选择、营地、单挑、战斗、结局）；演完返回 null。
 * 当前步是选择时 answer 是选中的序号；是战斗时 answer 为 0 表示胜、1 表示败。
 */
export function nextStep(s: Script, st: Story, answer = 0, api: StoryApi = {}): Shown | null {
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
    else if (x.t === 'picture') st.picture = x.key;
    else if (x.t === 'bgm') st.bgm = x.key;
    else if (x.t === 'hide') st.cast = [];
    else if (x.t === 'set') st.flags[x.flag] = x.value;
    else if (x.t === 'gold') st.gold += x.n;
    else if (x.t === 'join') api.join?.(st, x.id);
    else if (x.t === 'away') api.away?.(st, x.id);
    else if (x.t === 'level') api.level?.(st, x.id, x.n);
    else if (x.t === 'item') api.item?.(st, x.id);
    else if (x.t === 'class') api.cls?.(st, x.id, x.cls);
    else if (x.t === 'goto') jump(x.label);
    else if (x.t === 'if') condition(st, x.flag, x.is, x.cmp) && jump(x.goto);
    else if (x.t !== 'label') {
      if (x.t === 'say' && x.who && !st.cast.includes(x.who)) {
        st.cast.push(x.who);
        while (st.cast.length > 2) st.cast.shift();
      }
      return x;
    }
  }
  throw new Error(`脚本「${s.id}」在第 ${st.pc + 1} 步附近转圈，一直没有等玩家的步骤`);
}
