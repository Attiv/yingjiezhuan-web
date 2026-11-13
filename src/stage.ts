import RAW from './data/stages.json';

/**
 * 剧情场景：原版每一幕先 `load_map` 换一张等距视角的城郭/宫殿地图，再把人摆到格子上，
 * 对话之间走动、退场（见 `tools/build_stages.py`）。这里只管数据与状态，不碰 DOM。
 *
 * 坐标是原版的瓦片格：地图 32×20 格、每格 16px，人站在 (16x+16, 16y+8) 那个点上。
 * 野外（`field`）那一张底图只铺景不摆人：原版野外会跟着人滚屏，我们只截了一屏。
 */
export interface StageOp {
  /** 这一幕里已经说过几句台词之前，执行这个动作。 */
  at: number;
  op: 'place' | 'move' | 'remove' | 'clear' | 'caption';
  /** 原版 BAKDATA 的人物号。 */
  who?: number;
  x?: number;
  y?: number;
  /** 朝向：0 上、1 右、2 下、3 左。 */
  dir?: number;
  /** 有武将记录的，这里是武将 id。 */
  id?: string;
  /** 地名条的文字（op === 'caption'）。 */
  text?: string;
}

export interface StageInfo {
  /** `palace/003`（宫殿内景）、`field`（野外，只铺景不摆人）或 `battle/012`（战场图，剧情层不画）。 */
  map?: string | null;
  /** 这一幕的台词数：构建时按它把动作对到第几句上（见 `tools/build_stages.py`）。 */
  lines: number;
  ops: StageOp[];
  /** 人物号 → 名字，点击时显示。 */
  names?: Record<string, string>;
  /** 人物号 → 点他时说的话（原版剧本里 `talk` 触发的那几句）。 */
  talks?: Record<string, string[]>;
}

export const STAGES = RAW as unknown as Record<string, StageInfo>;
export const stageOf = (id: string): StageInfo | undefined => (id ? STAGES[id] : undefined);

/** 场上的一个人。 */
export interface Crowd {
  who: number;
  x: number;
  y: number;
  dir: number;
  id?: string;
}

/** 只有宫殿与野外才铺场景；战场里插播的幕还是原来那样盖在战场上。 */
export const isSceneMap = (key?: string | null) => !!key && (key.startsWith('palace/') || key === 'field');
export const mapSrc = (key?: string | null) =>
  !key ? '' : key === 'field' ? '/assets/story/field-00.png' : `/assets/story/${key.replace('palace/', 'pmap-')}.png`;

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

  /** prev：上一幕。同一处场景的后续段（不再 load_map）要接着用上一幕的场面和人。 */
  constructor(info?: StageInfo, prev?: StageScript) {
    this.info = info;
    const map = info?.map ?? (prev && !info?.map ? prev.map : '');
    if (isSceneMap(map)) this.map = map;
    if (prev && !info?.map) {
      this.people = new Map(prev.people);
      this.place = prev.place;
    }
  }

  /** 应用到第 n 句台词之前的调度；返回有没有变化（没变化就不用重画）。 */
  advance(n: number): boolean {
    const ops = this.info?.ops;
    if (!ops?.length) return false;
    let dirty = false;
    while (this.idx < ops.length && ops[this.idx].at <= n) {
      this.run(ops[this.idx++]);
      dirty = true;
    }
    return dirty;
  }

  /** 一幕演完/重开：人全部清掉，地图留着（下一幕常常不重新 load_map）。 */
  reset(): void {
    this.people.clear();
    this.place = '';
    this.idx = 0;
  }

  private run(op: StageOp): void {
    if (op.op === 'caption') {
      this.place = op.text ?? '';
      return;
    }
    if (op.op === 'clear') return void this.people.clear();
    if (op.who === undefined) return;
    if (op.op === 'remove') return void this.people.delete(op.who);
    this.people.set(op.who, {
      who: op.who,
      x: op.x ?? 0,
      y: op.y ?? 0,
      dir: op.dir ?? 2,
      id: op.id ?? this.people.get(op.who)?.id,
    });
  }
}

/** 格坐标 → 舞台上的点（地图按 640×400 铺满舞台，原版 512×320 的 1.25 倍）。 */
export const MAP_W = 512;
export const MAP_H = 320;
export const mapPoint = (x: number, y: number) => ({ left: (16 * x + 16) * 1.25, top: (16 * y + 8) * 1.25 });

/** 人物的棋子帧：站立那一行，列 = 兵种×2 + 阵营（0 我军/友军、1 敌军）。 */
export const tokenFrame = (cls: number, enemy = false) => ({ col: cls * 2 + (enemy ? 1 : 0), row: 0 });
export const TOKEN_COLS = 39;
