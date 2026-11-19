import type { StageInfo, StageOp } from './stage';
import type { Cmp, Flag, Script, Step } from './story';

type Fields = Record<string, unknown>;
type Room = Extract<Step, { t: 'room' }>;

function invalid(path: string, message: string): never {
  throw new Error(`${path}：${message}`);
}

function fields(value: unknown, path: string, allowed?: string[]): Fields {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(path, '应为对象');
  const data = value as Fields;
  for (const key of Object.keys(data)) {
    if (allowed && !allowed.includes(key)) invalid(`${path}.${key}`, '不认识的字段');
  }
  return data;
}

function text(value: unknown, path: string): string {
  if (typeof value !== 'string' || !value.trim()) invalid(path, '应为非空字符串');
  return value;
}

function key(value: unknown, path: string): string {
  const id = text(value, path);
  if (!/^[a-z][a-z0-9_-]*$/.test(id)) invalid(path, '应以小写字母开头，只用小写字母、数字、下划线或连字符');
  return id;
}

function integer(value: unknown, path: string, min: number, max = Number.MAX_SAFE_INTEGER): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) {
    invalid(path, `应为 ${min} 至 ${max} 的整数`);
  }
  return value;
}

function flagValue(value: unknown, path: string): Flag {
  if (typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) return value;
  return invalid(path, '应为字符串、布尔值或有限数字');
}

function list(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) invalid(path, '应为数组');
  return value;
}

/** 编译一份独立剧情。输出沿用正式流程的 Script、Step 和房间定义。 */
export function compileStory(input: unknown): { script: Script; stage: StageInfo; stages: Record<string, StageInfo> } {
  const root = fields(input, '剧本', ['id', 'title', 'entry', 'actors', 'sprites', 'phases', 'map']);
  const id = key(root.id, '剧本.id');
  const title = text(root.title, `${id}.title`);
  const map = root.map ?? 'palace/000';
  if (typeof map !== 'string' || !/^(field|palace\/\d{3})$/.test(map)) invalid(`${id}.map`, '应为 field 或 palace/000 格式的地图编号');
  const entry = key(root.entry, `${id}.entry`);
  const actors = fields(root.actors ?? {}, `${id}.actors`);
  const sprites = fields(root.sprites ?? {}, `${id}.sprites`);
  const phases = fields(root.phases, `${id}.phases`);
  const names: Record<string, string> = {};
  const graphics: Record<string, number> = {};
  for (const [number, sprite] of Object.entries(sprites)) {
    const path = `${id}.sprites.${number}`;
    const who = integer(Number(number), path, 0, 65535);
    if (String(who) !== number || !Object.hasOwn(actors, number)) invalid(path, '外观必须对应已声明的人物编号');
    graphics[number] = integer(sprite, path, 0, 28);
  }
  for (const [number, name] of Object.entries(actors)) {
    const path = `${id}.actors.${number}`;
    const who = integer(Number(number), path, 0, 65535);
    if (String(who) !== number) invalid(path, '应使用十进制人物编号');
    names[number] = text(name, path);
  }
  const actor = (value: unknown, path: string) => {
    const who = integer(value, path, 0, 65535);
    if (!Object.hasOwn(names, who)) invalid(path, `未声明人物 ${who}`);
    return who;
  };
  const target = (value: unknown, path: string) => {
    const phase = key(value, path);
    if (!Object.hasOwn(phases, phase)) invalid(path, `找不到阶段 ${phase}`);
    return `phase:${phase}`;
  };
  const dialogue = (data: Fields, path: string) => ({
    who: text(data.who, `${path}.who`), text: text(data.text, `${path}.text`),
  });

  let conditionCount = 0;
  const commands = (value: unknown, path: string, talkOnly = false): Step[] => {
    const out: Step[] = [];
    for (const [i, raw] of list(value, path).entries()) {
      const at = `${path}[${i}]`;
      const t = fields(raw, at).t;
      if (t === 'say') {
        out.push({ t, ...dialogue(fields(raw, at, ['t', 'who', 'text']), at) });
      } else if (t === 'text') {
        out.push({ t, text: text(fields(raw, at, ['t', 'text']).text, `${at}.text`) });
      } else if (talkOnly) {
        invalid(at, `闲聊只接受 say 或 text，收到 ${String(t)}`);
      } else if (t === 'caption') {
        out.push({ t: 'action', op: { at: 0, op: t, text: text(fields(raw, at, ['t', 'text']).text, `${at}.text`) } });
      } else if (t === 'place' || t === 'move' || t === 'remove' || t === 'clear') {
        const position = t === 'place' || t === 'move';
        const data = fields(raw, at, position ? ['t', 'who', 'x', 'y', 'dir'] : t === 'remove' ? ['t', 'who'] : ['t']);
        const op: StageOp = { at: 0, op: t };
        if (t !== 'clear') op.who = actor(data.who, `${at}.who`);
        if (position) {
          op.x = integer(data.x, `${at}.x`, 0, 30);
          op.y = integer(data.y, `${at}.y`, 0, 17);
          if (data.dir !== undefined) op.dir = integer(data.dir, `${at}.dir`, 0, 3);
        }
        if (t === 'place' && graphics[String(op.who)] !== undefined) op.sprite = graphics[String(op.who)];
        out.push({ t: 'action', op });
      } else if (t === 'wait') {
        out.push({ t, ms: integer(fields(raw, at, ['t', 'ms']).ms, `${at}.ms`, 0, 10000) });
      } else if (t === 'gold') {
        out.push({ t, n: integer(fields(raw, at, ['t', 'n']).n, `${at}.n`, 0) });
      } else if (t === 'set') {
        const data = fields(raw, at, ['t', 'flag', 'value']);
        out.push({ t, flag: key(data.flag, `${at}.flag`), value: flagValue(data.value, `${at}.value`) });
      } else if (t === 'when') {
        const data = fields(raw, at, ['t', 'flag', 'is', 'cmp', 'then']);
        const cmp = data.cmp ?? 'eq';
        if (cmp !== 'eq' && cmp !== 'ne' && cmp !== 'gt' && cmp !== 'lt') invalid(`${at}.cmp`, '应为 eq、ne、gt 或 lt');
        const inverse: Record<Cmp, Cmp> = { eq: 'ne', ne: 'eq', gt: 'lt', lt: 'gt' };
        const flag = key(data.flag, `${at}.flag`);
        const is = flagValue(data.is, `${at}.is`);
        const skip = `condition:${conditionCount++}`;
        if (cmp === 'gt' || cmp === 'lt') {
          const enter = `${skip}:then`;
          out.push({ t: 'if', flag, is, cmp, goto: enter }, { t: 'goto', label: skip }, { t: 'label', name: enter });
        } else out.push({ t: 'if', flag, is, cmp: inverse[cmp], goto: skip });
        out.push(...commands(data.then, `${at}.then`), { t: 'label', name: skip });
      } else invalid(at, `不认识的指令 ${String(t)}`);
    }
    return out;
  };

  const stages: Record<string, StageInfo> = {};
  const steps: Step[] = [{ t: 'stage', id: `story:${id}` }, { t: 'goto', label: target(entry, `${id}.entry`) }];
  for (const [name, raw] of Object.entries(phases)) {
    const path = `${id}.phases.${name}`;
    key(name, path);
    const phase = fields(raw, path, ['enter', 'room', 'next', 'end']);
    if (['room', 'next', 'end'].filter((field) => Object.hasOwn(phase, field)).length !== 1) {
      invalid(path, '必须且只能声明 room、next 或 end 中的一项');
    }
    steps.push({ t: 'label', name: `phase:${name}` }, ...commands(phase.enter ?? [], `${path}.enter`));
    if (Object.hasOwn(phase, 'next')) {
      steps.push({ t: 'goto', label: target(phase.next, `${path}.next`) });
      continue;
    }
    if (Object.hasOwn(phase, 'end')) {
      steps.push({ t: 'ending', text: text(phase.end, `${path}.end`) });
      continue;
    }
    const roomPath = `${path}.room`;
    const room = fields(phase.room, roomPath, ['talks', 'exits']);
    const talks: Record<string, Step[]> = {};
    const used = new Set<number>();
    for (const [who, lines] of Object.entries(fields(room.talks ?? {}, `${roomPath}.talks`))) {
      const talkPath = `${roomPath}.talks.${who}`;
      const number = actor(Number(who), talkPath);
      if (String(number) !== who) invalid(talkPath, '应使用十进制人物编号');
      talks[who] = commands(lines, talkPath, true);
      if (!talks[who].length) invalid(talkPath, '至少需要一句闲谈');
      used.add(number);
    }
    const options: NonNullable<Room['options']> = list(room.exits, `${roomPath}.exits`).map((rawExit, i) => {
      const at = `${roomPath}.exits[${i}]`;
      const exit = fields(rawExit, at, ['who', 'label', 'to', 'confirm']);
      const who = exit.who === undefined ? undefined : actor(exit.who, `${at}.who`);
      if (who !== undefined) {
        if (used.has(who)) invalid(`${at}.who`, `人物 ${who} 在此房间有重复触发`);
        used.add(who);
      }
      return {
        ...(who === undefined ? {} : { who }),
        label: text(exit.label, `${at}.label`),
        goto: target(exit.to, `${at}.to`),
        prompt: exit.confirm === undefined ? undefined : dialogue(fields(exit.confirm, `${at}.confirm`, ['who', 'text']), `${at}.confirm`),
      };
    });
    if (!options.length) invalid(`${roomPath}.exits`, '至少需要一个出口');
    const roomId = `${id}:${name}`;
    const stageRooms = stages[`story:${id}`]?.rooms ?? {};
    stageRooms[roomId] = { talks };
    stages[`story:${id}`] = {
      ...stages[`story:${id}`], map: map as string, lines: 0, ops: [], ordered: true, names, rooms: stageRooms,
    };
    steps.push({ t: 'room', id: roomId, options });
  }
  const stage = { map: map as string, lines: 0, ops: [], ordered: true, names };
  if (!stages[`story:${id}`]) stages[`story:${id}`] = stage;
  return { script: { id, title, steps }, stage: stages[`story:${id}`], stages };
}
