import RAW from './data/stages.json';
import type { Step } from './story';

/**
 * 剧情场景：原版每一幕先 `load_map` 换一张等距视角的城郭/宫殿地图，再把人摆到格子上，
 * 对话之间走动、退场（见 `tools/build_stages.py`）。这里只管数据与状态，不碰 DOM。
 *
 * 坐标是原版的交错列步行格：每格 16px，偶数列比奇数列低一格。
 * MAIN 图像偏移 0x1DAA6 / 0x1F0F3：绘制 y = y + (x 为偶数 ? 1 : 0)。
 * 野外（`field`）使用完整行军地图与道路坐标，镜头跟随正在移动的人物。
 */
export interface StageOp {
  /** 这一幕里已经说过几句台词之前，执行这个动作。 */
  at: number;
  op: 'place' | 'move' | 'remove' | 'clear' | 'caption' | 'map' | 'graphic';
  /** record 中途换图，必须在对应台词前清场。 */
  map?: string;
  /** 原版 BAKDATA 的人物号。 */
  who?: number;
  x?: number;
  y?: number;
  /** 朝向：0 上、1 右、2 下、3 左。 */
  dir?: number;
  /** BAKDATA 的城镇人物外观号，对应 SSCCHR2，和战场兵种无关。 */
  sprite?: number;
  /** 有武将记录的，这里是武将 id。 */
  id?: string;
  /** 地名条的文字（op === 'caption'）。 */
  text?: string;
}

export interface RewardCondition {
  flag: string;
  is: number;
  cmp: 'eq' | 'ne' | 'gt' | 'lt';
  n?: number;
  id?: number;
}

export interface LocationTriggerInfo {
  source: { block: number; record: number; trigger: 'location' };
  rawArgs: number[]; // 原始六字节；字段布局和语义尚待核对。
  timeline: Step[];
  /** Current runtime adapter; this does not claim town free-walk support. */
  adapter: 'room_button';
}

export interface StageInfo {
  /** `palace/003`（宫殿内景）、`field`（完整行军地图）或 `battle/012`（战场插剧）。 */
  map?: string | null;
  /** 这一幕的台词数：构建时按它把动作对到第几句上（见 `tools/build_stages.py`）。 */
  lines: number;
  ops: StageOp[];
  /** 人物号 → 名字，点击时显示。 */
  names?: Record<string, string>;
  /** 人物号 → 点他时说的话（原版剧本里 `talk` 触发的那几句）。 */
  talks?: Record<string, string[]>;
  /** 已直接编译原始指令的场景，不再按台词数定位动作。 */
  timeline?: Step[];
  room?: { battle: string; shop: number[]; talks: Record<string, { steps: Step[]; shop?: boolean; depart?: boolean; prompt?: string; after?: Step[] }> };
  /** 舞台动作已交错编入主线，不再按台词数重复执行。 */
  ordered?: boolean;
  /** 原版奖励条件的可审计表示；执行条件仍在 game.json 的 timeline 中。 */
  rewardConditions?: { gold: RewardCondition; items: RewardCondition[] };
  /** 原版地点触发；当前通过 room_button 适配，不是城镇自由行走。 */
  location?: LocationTriggerInfo;
  /** 原版各并行交谈阶段，使用独立房间ID保存和恢复进度。 */
  rooms?: Record<string, {
    after?: { who: string; text: string };
    talks: Record<string, Step[]>;
    next?: { who?: number; label: string; prompt?: { who: string; text: string } };
    shop?: { who: number; items: number[] };
  }>;
  world?: number;
  walk?: Record<string, string[]>;
  routes?: string[];
}

export const STAGES = RAW as unknown as Record<string, StageInfo>;
export const stageOf = (id: string): StageInfo | undefined => (id ? STAGES[id] : undefined);

/** 场上的一个人。 */
export interface Crowd {
  who: number;
  x: number;
  y: number;
  dir: number;
  sprite: number;
  id?: string;
  /** 这一句刚走过一步：待机的两帧交替加快，像原版迈步。 */
  walking?: boolean;
}

/** 只有宫殿与野外才铺场景；战场里插播的幕还是原来那样盖在战场上。 */
export const isSceneMap = (key?: string | null) => !!key && (key.startsWith('palace/') || key === 'field');
export const mapSrc = (key?: string | null, world = 0) =>
  !key ? '' : key === 'field' ? `/assets/maps/campaign/${String(world).padStart(3, '0')}.png` : `/assets/story/${key.replace('palace/', 'pmap-')}.png`;

/** 原始道路格为32px；与宫殿保持1.25倍舞台缩放，显示为40px。 */
export const fieldPoint = (x: number, y: number) => ({ left: (x + 0.5) * 40, top: (y + 0.5) * 40 });
export const moveDirection = (from: { x: number; y: number }, to: { x: number; y: number }, field = false) => {
  const a = field ? fieldPoint(from.x, from.y) : mapPoint(from.x, from.y);
  const b = field ? fieldPoint(to.x, to.y) : mapPoint(to.x, to.y);
  return Math.abs(b.left - a.left) > Math.abs(b.top - a.top) ? (b.left > a.left ? 1 : 3) : (b.top > a.top ? 2 : 0);
};

/**
 * 一幕的舞台调度：按台词进度往前走，只前进不后退。
 * `reset()` 回到幕首（重读一幕、收起舞台时用）。
 */
export class StageScript {
  readonly info?: StageInfo;
  map = '';
  /** 左上角的地名条（原版的 caption）。 */
  place = '';
  people = new Map<number, Crowd>();
  private idx = 0;
  private graphics = new Map<number, number>();

  /** 剧情路径走原版网格；宫殿使用交错列的四邻点，行军地图使用道路八邻点。 */
  path(who: number, x: number, y: number): { x: number; y: number }[] {
    const from = this.people.get(who);
    if (!from || (from.x === x && from.y === y)) return [];
    const field = this.map === 'field';
    const grid = field ? this.info?.routes : this.info?.walk?.[this.map];
    const end = `${x},${y}`, start = `${from.x},${from.y}`;
    const queue = [{ x: from.x, y: from.y }];
    const parent = new Map<string, string | null>([[start, null]]);
    for (let i = 0; i < queue.length && i < 20000; i++) {
      const p = queue[i];
      const dirs = field ? [[-1,-1], [0,-1], [1,-1], [-1,0], [1,0], [-1,1], [0,1], [1,1]]
        : [[-1, p.x % 2 === 0 ? 0 : -1], [1, p.x % 2 === 0 ? 0 : -1], [-1, p.x % 2 === 0 ? 1 : 0], [1, p.x % 2 === 0 ? 1 : 0]];
      for (const [dx, dy] of dirs) {
        const n = { x: p.x + dx, y: p.y + dy }, key = `${n.x},${n.y}`;
        if (parent.has(key)) continue;
        if (grid ? grid[n.y]?.[n.x] !== '#' : n.x < 0 || n.y < 0 || n.x > 63 || n.y > 63) continue;
        parent.set(key, `${p.x},${p.y}`);
        if (key === end) {
          const out = [n];
          let k = parent.get(key);
          while (k && k !== start) {
            const [px, py] = k.split(',').map(Number);
            out.push({ x: px, y: py }); k = parent.get(k);
          }
          return out.reverse();
        }
        queue.push(n);
      }
    }
    // 某些脚本终点在门外，不把角色丢掉；保留明确的原始终点。
    return [{ x, y }];
  }

  take(n: number): StageOp[] {
    const out: StageOp[] = [];
    const ops = this.info?.ops ?? [];
    while (this.idx < ops.length && ops[this.idx].at <= n) out.push(ops[this.idx++]);
    return out;
  }

  /** prev：上一幕。同一处场景的后续段（不再 load_map）要接着用上一幕的场面和人。 */
  constructor(info?: StageInfo, prev?: StageScript) {
    this.info = info;
    const map = info?.map ?? (prev && !info?.map ? prev.map : '');
    if (isSceneMap(map)) this.map = map;
    if (prev && !info?.map) {
      this.people = new Map([...prev.people].map(([who, p]) => [who, { ...p }]));
      this.graphics = new Map(prev.graphics);
      this.place = prev.place;
    }
  }

  /** 应用到第 n 句台词之前的调度；返回有没有变化（没变化就不用重画）。 */
  advance(n: number): boolean {
    const ops = this.info?.ops;
    if (!ops?.length) return false;
    let dirty = false;
    // 上一句迈出去的那一步已经演完，先收回站立姿态，再执行这一句的新动作。
    for (const p of this.people.values()) if (p.walking) { p.walking = false; dirty = true; }
    while (this.idx < ops.length && ops[this.idx].at <= n) {
      this.run(ops[this.idx++]);
      dirty = true;
    }
    return dirty;
  }

  /** 一幕演完/重开：人全部清掉，地图留着（下一幕常常不重新 load_map）。 */
  reset(): void {
    this.people.clear();
    this.graphics.clear();
    this.place = '';
    if (this.info?.map) this.map = isSceneMap(this.info.map) ? this.info.map : '';
    this.idx = 0;
  }

  run(op: StageOp): void {
    if (op.op === 'map') {
      this.map = isSceneMap(op.map) ? op.map! : '';
      this.people.clear();
      this.place = '';
      return;
    }
    if (op.op === 'caption') {
      this.place = op.text ?? '';
      return;
    }
    if (op.op === 'clear') return void this.people.clear();
    if (op.who === undefined) return;
    if (op.op === 'graphic') {
      this.graphics.set(op.who, op.sprite ?? 0);
      const p = this.people.get(op.who);
      if (p) p.sprite = op.sprite ?? 0;
      return;
    }
    if (!this.map) return;
    if (op.op === 'remove') return void this.people.delete(op.who);
    this.people.set(op.who, {
      who: op.who,
      x: op.x ?? 0,
      y: op.y ?? 0,
      dir: op.dir ?? 2,
      sprite: this.graphics.get(op.who) ?? op.sprite ?? this.people.get(op.who)?.sprite ?? 0,
      id: op.id ?? this.people.get(op.who)?.id,
      walking: op.op === 'move',
    });
  }
}

/** 格坐标 → 舞台上的点（地图按 640×400 铺满舞台，原版 512×320 的 1.25 倍）。 */
export const MAP_W = 512;
export const MAP_H = 320;
// MAIN 0x1EF8 按 16px 单元定位 32×48 绘制框；SSCCHR2 的 40px 图像在框顶。
// CSS 采用底部中心锚点，须减去框底的 8px，并保留偶数列的交错偏移。
export const mapPoint = (x: number, y: number) => ({
  left: (16 * x + 16) * 1.25,
  top: (16 * (y + (x % 2 === 0 ? 1 : 0)) + 8) * 1.25,
});

/**
 * SSCCHR2 每个外观有 4 帧：行 0/1 是正面站立 / 迈步，行 2/3 是背面站立 / 迈步。
 * 原版只存「朝向观察者」和「背对观察者」两向，左右靠运行时水平镜像（见 sprites.json 的 note）。
 * place_person 的 dir：0 上、1 右、2 下、3 左；上 / 右取背面，下 / 左取正面，右 / 左再镜像。
 * step=1 取同朝向的迈步帧，走动时与站立帧交替。
 */
export const actorFrame = (sprite: number, dir: number, step = 0) => {
  const back = dir === 0 || dir === 1;
  return { col: sprite, row: (back ? 2 : 0) + (step ? 1 : 0), flip: dir === 1 || dir === 3 };
};
export const ACTOR_COLS = 29;
export const ACTOR_ROWS = 4;
