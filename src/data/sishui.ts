import { script, type Level, type Trigger } from '../rules/turn';
import D from './sishui.json';

/**
 * 序章第一战「汜水关之战」。地形、站位、兵种等级、能力、AI 指令、触发格都来自原版数据文件
 * （sishui.json 由 tools/extract.py 生成）；这里只把原版剧本里的触发记录接到规则层。
 */
const slotOf = (officer: number) => D.units.find((u) => u.officer === officer)!.slot;
const nameOf = (officer: number) => D.units.find((u) => u.officer === officer)!.name;
const boss = slotOf(D.winOfficer);

const cells: Trigger[] = D.cells.map((c) => ({
  flag: `cell${c.x},${c.y}`,
  who: null, // 原版记录是「任意我方部队」
  at: [c.x, c.y],
  run: (b, unit, evs) => (c.gold ? script.gold(b, unit, c.gold, evs) : script.item(unit, c.item!, evs)),
}));

export const SISHUI: Level = {
  id: 'sishui',
  name: `${D.name}之战`,
  goal: `歼灭${nameOf(D.winOfficer)}`,
  turnLimit: D.turnLimit,
  w: D.w,
  h: D.h,
  terrain: D.terrain,
  lord: slotOf(D.loseOfficer),
  boss,
  reward: 100, // 战斗结束后的剧本块给 100 金
  // 友军在原版要战前对话才出场（needsTalk）；本作固定为已对话
  units: D.units.map((u) => ({
    slot: u.slot, name: u.name, face: u.officer >= 256 ? '士兵' : u.name, cls: u.cls, level: u.level,
    lead: u.lead, str: u.str, int: u.int, x: u.x, y: u.y, mode: u.mode, items: u.items,
  })),
  triggers: [
    ...cells,
    {
      // 原版记录：行动方关羽与华雄相邻 → 单挑，关羽升级，华雄离场
      flag: 'duel', who: nameOf(D.contact.actor), next: nameOf(D.contact.next),
      run: (b, unit, evs) => {
        evs.push({ t: 'talk', who: unit.name, text: '华雄！关某来取你首级！' });
        evs.push({ t: 'talk', who: nameOf(D.contact.next), text: '无名小卒，也敢在此叫阵！' });
        evs.push({ t: 'duel', a: unit.slot, d: slotOf(D.contact.removes) });
        script.levels(b.units.find((v) => v.name === nameOf(D.contact.levelsTo))!, D.contact.levels, evs);
        script.retreat(b, slotOf(D.contact.removes), evs);
        evs.push({ t: 'talk', who: unit.name, text: '华雄已斩。' });
      },
    },
  ],
};

/** 战前说明（自撰，非原作台词）。 */
export const BRIEF = [
  '初平元年，关东诸侯起兵讨伐董卓。董卓麾下骁将华雄据守汜水关，连斩联军数将。',
  '刘备率关羽、张飞出阵，公孙瓒与陶谦的部队从旁助战。',
];
