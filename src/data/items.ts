import raw from './items.json';

/**
 * 原版道具表（items.json 由 tools/build_campaign.py 从原版的 items.toml 转出）。
 *
 * 原版把道具分成四类：武器（攻击力百分比）、铠甲/兵书（防御力百分比）、马（移动力格数）、
 * 消耗品（回复兵力/士气、或用一次策略）。数值全部照抄原版，没有自行权衡。
 */
export type ItemKind = 'weapon' | 'armor' | 'accessory' | 'consumable';

export interface ItemSpec {
  key: string;
  name: string;
  kind: ItemKind;
  /** 攻击力加成百分比，如 14 = 攻击力 +14% */
  atk: number;
  /** 防御力加成百分比 */
  def: number;
  /** 移动力加成格数 */
  move: number;
  /** 每回合恢复的兵力 / 士气 */
  regenHp: number;
  regenMorale: number;
  /** 商店价格；null = 原版不卖（武器、铠甲、马、宝物、转职书） */
  price: number | null;
  /** 能否在战场上使用 */
  battle: boolean;
  /** 回复量（原版数值，带一成以内的随机浮动） */
  heal: number;
  morale: number;
  /** 兵种升级道具：用掉后按兵种表升到下一级 */
  promote: boolean;
  /** 转职道具：用掉后直接变成这个兵种 */
  to: number | null;
  strategy: string | null;
}

interface Data {
  items: Record<string, ItemSpec>;
  /** 兵种号 → 升到哪一级、要几级、要哪个道具 */
  promote: Record<string, { to: number; level: number; item: number | null }>;
}

const DATA = raw as unknown as Data;

export const ITEM_SPEC = DATA.items;
export const PROMOTE = DATA.promote;

export const specOf = (id: number): ItemSpec | undefined => ITEM_SPEC[String(id)];

/** 商店价；原版不卖的返回 null。 */
export const priceOf = (id: number): number | null => specOf(id)?.price ?? null;

/** 拿在手里就生效的装备（武器 / 铠甲 / 马 / 宝物），用完不会消失。 */
export const isEquipment = (id: number): boolean => {
  const k = specOf(id)?.kind;
  return k === 'weapon' || k === 'armor' || k === 'accessory';
};

/** 装备的一行说明，如「攻擊 +14%」「移動 +3」「每回合兵力 +10」。 */
export function itemEffect(id: number): string {
  const s = specOf(id);
  if (!s) return '';
  const out: string[] = [];
  if (s.atk) out.push(`攻擊 +${s.atk}%`);
  if (s.def) out.push(`防禦 +${s.def}%`);
  if (s.move) out.push(`移動 +${s.move}`);
  if (s.regenHp) out.push(`每回合兵力 +${s.regenHp}`);
  if (s.regenMorale) out.push(`每回合士氣 +${s.regenMorale}`);
  if (s.heal) out.push(`兵力 +${s.heal}`);
  if (s.morale) out.push(`士氣 +${s.morale}`);
  if (s.promote) out.push('兵種升級');
  if (s.to !== null) out.push('轉職');
  return out.join('　');
}

/** 兵种升级：等级够、兵种对、道具对，返回升到的兵种号。 */
export function promotion(cls: number, level: number, item: number): number | null {
  const p = PROMOTE[String(cls)];
  if (!p || p.item !== item || level < p.level) return null;
  return p.to;
}

/** 转职道具（指南书、遁甲天书之类）直接指定的兵种；不是这类道具返回 null。 */
export const classChange = (item: number): number | null => specOf(item)?.to ?? null;

/** 这件道具对这名武将能做什么：升级 / 转职 / 都不能。 */
export function classUse(cls: number, level: number, item: number): number | null {
  return promotion(cls, level, item) ?? classChange(item);
}
