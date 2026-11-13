import * as Phaser from 'phaser';
import { facesLeft } from './facing';
import { strategySpec } from './data/strategies';
import { TB, bySlot } from './rules/core';
import { levelOf } from './rules/turn';
import type { Battle, Ev, Unit } from './rules/types';

/** 画布像素与舞台单位之比：战场按 3 倍分辨率画，再缩回舞台里的 416×384，放大后仍然清晰。 */
export const RES = 3;
export const CELL = 32 * RES;
export const VIEW_W = 416; // 舞台单位
export const VIEW_H = 384;
const [VW, VH] = [VIEW_W * RES, VIEW_H * RES];
const FONT = { fontFamily: '"Pixel", monospace', fontSize: '36px', stroke: '#000000', strokeThickness: 6 };
const FX = ['slash_03', 'scratch_01', 'trace_06', 'flame_05', 'flame_06', 'smoke_04', 'star_06', 'circle_02', 'circle_05', 'twirl_01', 'scorch_01'];
/** 原版 MAIN.EXE 的 16 色 VGA 调色板（slot 1）：黑、橙、绿、金、亮蓝。特效贴图是白色剪影，运行时染成这几种原版色。 */
const [INK, CINNABAR, GREEN, GOLD, PURPLE] = [0x000000, 0xef6500, 0x00ba75, 0xffcf55, 0x8acfff];
/** 策略演出用的补充色：水蓝、土黄、紫、火药的橙黄。 */
const [WATER, EARTH, VIOLET, BLAST] = [0x4f9fd8, 0xa48a62, 0xb07be0, 0xffa53d];

/** 策略的演出家族。原版一条策略一个花样，这里按效果归成八类，每类一套固定的起势与命中演出。 */
export type CastMood = 'fire' | 'water' | 'rock' | 'mind' | 'rally' | 'gloom' | 'heal' | 'blast';

/** 由策略数据推演出家族：攻击系按编号分火/水/石，其余按效果分扰心、振气、丧气、回复，爆彈单独一类。 */
export function castMood(id: number): CastMood {
  if (id === 36) return 'blast';
  const s = strategySpec(id);
  if (!s) return 'fire';
  if (s.effects.some((e) => e.type === 'damage')) return (['fire', 'water', 'rock'] as const)[Math.trunc(id / 5)] ?? 'fire';
  if (s.effects.some((e) => e.type === 'status')) return 'mind';
  if (s.effects.some((e) => e.type === 'heal')) return 'heal';
  const m = s.effects.find((e) => e.type === 'morale');
  return m && (m.amount ?? 0) < 0 ? 'gloom' : 'rally';
}
const MOOD_TINT: Record<CastMood, number> = { fire: CINNABAR, water: WATER, rock: EARTH, mind: VIOLET, rally: GOLD, gloom: 0x9a4a4a, heal: GREEN, blast: BLAST };

/** 画面素材清单 public/assets/manifest.json：每一关用哪张地图、哪张棋子图（相对 assets/）。 */
export interface Manifest {
  /** static：这一关的静态特写图目录（scene.png + unit-N.png），配好帧动画演员时不会显示。 */
  levels?: Record<string, { map?: string; tokens?: string; static?: string }>;
  /** 战斗特写：攻击时盖在战场上的一条横幅，左攻右守，各一个按帧表播放的演员。不写就没有特写。 */
  cutin?: { background?: string; actors: Record<string, Actor> }; // 演员按部队名字、`cls兵种号`、`*` 的顺序找
}
/** 特写里的一个演员：一张等宽等高的帧图集（图本身朝右），加三个动作各自的帧序列。 */
export interface Actor {
  sheet: string; // 图集文件（相对 assets/）
  frameWidth: number;
  frameHeight: number;
  scale?: number; // 显示倍数；不写就放大到横幅高度的八成
  anims: Record<'idle' | 'attack' | 'hurt', { frames: number[]; fps: number; impact?: number }>; // impact：attack 的第几帧算命中，不写 = 最后一帧
}
/** 清单里没有图的关卡用占位画法，这是各地形码的底色（平原、树林、山地、河流、桥梁、城墙…）。 */
const TERRAIN_TINT = ['#cdbb8a', '#5f8f4e', '#9a7b55', '#4f86c6', '#b08a5a', '#77777f', '#b9b4a8', '#a9c078', '#d9a05a', '#6d5a48',
  '#8f8f99', '#c2a878', '#a58a5c', '#8a6f48', '#c9b38a', '#d6b95a', '#e0c040', '#c8a070', '#d8562e', '#3f6fb0'];

/** 我军 0、友军 1、敌军 2。 */
export const sideOf = (u: Unit) => (u.slot >= 15 ? 2 : u.mode === 7 ? 0 : 1);
const mid = (c: number) => c * CELL + CELL / 2;

/** 战场画面：只负责画地图、棋子和播放规则层给出的事件，不做任何结算。 */
export class BattleScene extends Phaser.Scene {
  b!: Battle;
  speed = 1; // 动画时长倍率；系统要求减少动效时为 0
  onCell: (x: number, y: number) => void = () => {};
  onHover: (x: number, y: number) => void = () => {};
  onCancel: () => void = () => {};
  private tokens = new Map<number, Phaser.GameObjects.Image>();
  manifest: Manifest = {};
  private ready = new Map<Actor, string>(); // 图集已装好、帧表查过的演员 → 贴图键
  private map?: Phaser.GameObjects.Image;
  private mirror = true; // 棋子图本身朝右，朝左靠镜像；占位棋子上写着字，不镜像
  private perUnit = false; // 占位棋子按部队序号取帧；原版棋子图按兵种与阵营取帧
  private static readonly TOKENS = 39; // tokens.png 每行 39 帧（兵种×2+阵营）；行 0/2 站立、行 1/3 行走
  private hp = new Map<number, number>(); // 画面上显示的兵力：事件一条条播，数字跟着一步步变
  private marks!: Phaser.GameObjects.Graphics;
  private cursor!: Phaser.GameObjects.Graphics;
  private keys!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('battle');
  }

  preload() {
    this.load.json('manifest', 'assets/manifest.json');
    for (const key of FX) this.load.image(key, `assets/fx/${key}.png`);
  }

  create() {
    this.manifest = this.cache.json.get('manifest') ?? {};
    this.marks = this.add.graphics().setDepth(1);
    this.cursor = this.add.graphics().setDepth(1.5);
    this.keys = this.input.keyboard!.createCursorKeys();
    this.input.mouse?.disableContextMenu();
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.rightButtonDown()) return this.onCancel();
      this.onCell(Math.floor(p.worldX / CELL), Math.floor(p.worldY / CELL));
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.hover(Math.floor(p.worldX / CELL), Math.floor(p.worldY / CELL)));
    this.events.emit('ready');
  }

  update() {
    const cam = this.cameras.main;
    const step = 8 * RES;
    if (this.keys.left.isDown) cam.scrollX -= step;
    if (this.keys.right.isDown) cam.scrollX += step;
    if (this.keys.up.isDown) cam.scrollY -= step;
    if (this.keys.down.isDown) cam.scrollY += step;
  }

  /**
   * 换一场战斗（开局或读档）：按清单装载这一关的图，重摆全部棋子。
   * 地图是一整张图，拉伸到 w×h 格；棋子图每格 CELL 见方，按「兵种×2+阵营」取帧，
   * 站立 / 行走 / 已行动各占一行。没有图时退化成每支部队一张占位图。
   */
  async setBattle(b: Battle) {
    this.b = b;
    this.tweens.killAll();
    const [mapKey, tokKey] = [`map:${b.level}`, `tokens:${b.level}`];
    const art = this.manifest.levels?.[b.level];
    const lv = levelOf(b);
    const mapPath = art?.map ?? lv?.map;
    const tokPath = art?.tokens ?? lv?.tokens;
    const actors = [...new Set(b.units.map((u) => this.actorOf(u)))].filter((ac): ac is Actor => !!ac && !this.ready.has(ac));
    const bg = this.manifest.cutin?.background;
    let loading = false;
    const want = (key: string, queue: () => void) => this.textures.exists(key) || (queue(), (loading = true));
    if (mapPath) want(mapKey, () => this.load.image(mapKey, `assets/${mapPath}`));
    if (tokPath) want(tokKey, () => this.load.spritesheet(tokKey, `assets/${tokPath}`, { frameWidth: CELL, frameHeight: CELL }));
    if (bg) want('cutin:bg', () => this.load.image('cutin:bg', `assets/${bg}`));
    for (const ac of actors) want(`actor:${ac.sheet}`, () => this.load.spritesheet(`actor:${ac.sheet}`, `assets/${ac.sheet}`, { frameWidth: ac.frameWidth, frameHeight: ac.frameHeight }));
    if (loading) await new Promise<void>((done) => (this.load.once('complete', () => done()), this.load.start()));
    if (this.b !== b) return; // 装载期间又换了一场
    actors.forEach((ac) => this.prepare(ac));
    this.mirror = this.textures.exists(tokKey);
    this.perUnit = !this.mirror;
    this.placeholders(b, mapKey, tokKey);
    this.map?.destroy();
    this.map = this.add.image(0, 0, mapKey).setOrigin(0).setDisplaySize(b.w * CELL, b.h * CELL);
    this.tokens.forEach((s) => s.destroy());
    this.tokens.clear();
    this.marks.clear();
    b.units.forEach((u) => this.tokens.set(u.slot, this.add.image(0, 0, tokKey, this.frameOf(u, false))));
    this.cameras.main.setBounds(0, 0, b.w * CELL, b.h * CELL);
    this.sync();
  }

  /** 清单里没有图（或图没装上）的关卡：地图按地形涂色并写上地形名的头一个字，棋子是阵营色圆片加名字的头一个字。 */
  private placeholders(b: Battle, mapKey: string, tokKey: string) {
    if (!this.textures.exists(mapKey)) {
      const t = this.textures.createCanvas(mapKey, b.w * 32, b.h * 32)!;
      const g = t.getContext();
      Object.assign(g, { font: '15px sans-serif', textAlign: 'center', textBaseline: 'middle' });
      b.terrain.forEach((code, i) => {
        const [x, y] = [(i % b.w) * 32, Math.floor(i / b.w) * 32];
        g.fillStyle = TERRAIN_TINT[code] ?? '#888888';
        g.fillRect(x, y, 32, 32);
        g.strokeStyle = 'rgba(0, 0, 0, 0.18)';
        g.strokeRect(x + 0.5, y + 0.5, 31, 31);
        g.fillStyle = 'rgba(0, 0, 0, 0.6)';
        if (code) g.fillText((TB.terrainNames[code] ?? '?')[0], x + 16, y + 17);
      });
      t.refresh();
    }
    if (!this.textures.exists(tokKey)) {
      const n = b.units.length;
      const t = this.textures.createCanvas(tokKey, n * CELL, 2 * CELL)!;
      const g = t.getContext();
      Object.assign(g, { font: `${CELL * 0.44}px sans-serif`, textAlign: 'center', textBaseline: 'middle', lineWidth: 5, strokeStyle: '#151515' });
      b.units.forEach((u, i) => [0, 1].forEach((row) => {
        const [cx, cy] = [i * CELL + CELL / 2, row * CELL + CELL / 2];
        g.fillStyle = row ? '#8c8c8c' : ['#2f6fd0', '#2f9a5a', '#c8442e'][sideOf(u)];
        g.beginPath();
        g.arc(cx, cy, CELL * 0.42, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.fillStyle = '#ffffff';
        g.fillText(u.name[0], cx, cy + 3);
        t.add(i + row * n, 0, i * CELL, row * CELL, CELL, CELL);
      }));
      t.refresh();
    }
  }

  private actorOf(u: Unit): Actor | undefined {
    const all = this.manifest.cutin?.actors;
    return all?.[u.name] ?? all?.[`cls${u.cls}`] ?? all?.['*'];
  }
  /** 清单是外来的数据：帧表里的帧号都得在图集里，查过了才登记动画；不对就报错并退回没有特写的演法。 */
  private prepare(ac: Actor) {
    const key = `actor:${ac.sheet}`;
    const total = this.textures.exists(key) ? this.textures.get(key).frameTotal - 1 : 0; // 不算整图那一帧
    for (const name of ['idle', 'attack', 'hurt'] as const) {
      const an = ac.anims?.[name];
      if (!an?.frames?.length || !(an.fps > 0) || an.frames.some((f) => !Number.isInteger(f) || f < 0 || f >= total))
        return console.error(`战斗特写：图集 ${ac.sheet}（共 ${total} 帧）的 ${name} 动作帧表不对`);
    }
    for (const name of ['idle', 'attack', 'hurt'] as const) {
      const an = ac.anims[name];
      if (!this.anims.exists(`${key}:${name}`))
        this.anims.create({ key: `${key}:${name}`, frames: this.anims.generateFrameNumbers(key, { frames: an.frames }), frameRate: an.fps, repeat: name === 'idle' ? -1 : 0 });
    }
    this.ready.set(ac, key);
  }
  /** 这两支部队交手时有没有特写可播。 */
  hasCutin = (a: Unit, d: Unit) => [a, d].every((u) => this.ready.has(this.actorOf(u)!));

  /** 战斗特写：横幅盖在战场上，左攻右守。攻方播 attack，到命中帧时回调并让守方播 hurt，然后各自回到 idle。 */
  private async cutin(a: Unit, d: Unit, onImpact?: () => void) {
    const [top, h] = [88 * RES, 160 * RES];
    const box = this.add.container(0, top).setDepth(20);
    box.add(this.textures.exists('cutin:bg') ? this.add.image(0, 0, 'cutin:bg').setOrigin(0).setDisplaySize(VW, h) : this.add.rectangle(0, 0, VW, h, 0x10141c, 0.94).setOrigin(0));
    const actor = (u: Unit, left: boolean) => {
      const ac = this.actorOf(u)!;
      const key = this.ready.get(ac)!;
      const s = this.add.sprite(VW * (left ? 0.28 : 0.72), h - 4 * RES, key).setOrigin(0.5, 1).setScale(ac.scale ?? Math.max(2, Math.round((h * 1.05) / ac.frameHeight))).setFlipX(!left);
      s.anims.timeScale = 1 / this.speed;
      s.play(`${key}:idle`);
      box.add(s);
      return { s, key, ac };
    };
    const [att, def] = [actor(a, true), actor(d, false)];
    box.setScrollFactor(0, 0, true); // 钉在画面上，不跟地图卷动
    // 待机：两个演员都在喘气（60 帧循环），让玩家先看清双方的架势
    await this.wait(900);
    await new Promise<void>((done) => {
      const at = att.ac.anims.attack.impact ?? att.ac.anims.attack.frames.length - 1;
      let hit = false;
      const impact = () => {
        if (hit) return;
        hit = true;
        onImpact?.();
        def.s.play(`${def.key}:hurt`).chain(`${def.key}:idle`);
      };
      att.s.on('animationupdate', (_an: unknown, frame: Phaser.Animations.AnimationFrame) => frame.index - 1 >= at && impact());
      att.s.once('animationcomplete', () => (impact(), att.s.play(`${att.key}:idle`), done()));
      att.s.play(`${att.key}:attack`);
      if (at <= 0) impact();
    });
    // 收招后回到待机，继续呼吸一会儿再收起横幅
    await this.wait(620);
    box.destroy();
  }

  private tk(slot: number) {
    return this.tokens.get(slot)!;
  }

  /** 棋子帧号：原版 HEXZCHR 每个兵种是站立 / 行走两帧，图集按行铺开：
   * 0 站立、1 行走、2 已行动站立、3 已行动行走。列 = 兵种×2+阵营。 */
  private frameOf(u: Unit, acted: boolean, walking = false) {
    if (this.perUnit) return this.b.units.findIndex((v) => v.slot === u.slot) + (acted ? this.b.units.length : 0);
    const row = (acted ? 2 : 0) + (walking ? 1 : 0);
    return row * BattleScene.TOKENS + u.cls * 2 + (u.slot >= 15 ? 1 : 0);
  }

  /** 把棋子对齐到当前状态：位置、是否在场；我军已行动的换成灰色那一帧，混乱的歪倒并发紫。 */
  sync() {
    this.b.units.forEach((u) => {
      const done = u.acted && this.b.stage === 'player' && u.mode === 7;
      const s = this.tk(u.slot).setFrame(this.frameOf(u, done)).setPosition(mid(u.x), mid(u.y)).setDepth(2 + u.y / 100).setVisible(u.on).setAlpha(1).setScale(1);
      s.setAngle(u.confused ? -16 : 0).setFlipX(this.mirror && facesLeft(this.b, u)).setTintMode(Phaser.TintModes.MULTIPLY);
      if (u.confused) s.setTint(0x8acfff);
      else s.clearTint();
      this.hp.set(u.slot, u.hp);
    });
  }
  /** 画面上这支部队此刻显示的兵力（事件还没播到的扣减不算）。 */
  hpOf = (slot: number) => this.hp.get(slot) ?? 0;

  private hover(x: number, y: number) {
    this.cursor.clear();
    if (!this.b || x < 0 || y < 0 || x >= this.b.w || y >= this.b.h) return;
    this.cursor.lineStyle(6, GOLD, 1).strokeRect(x * CELL + 3, y * CELL + 3, CELL - 6, CELL - 6);
    this.onHover(x, y);
  }

  /** 高亮一批格子：移动范围用原版亮蓝，攻击/策略范围用橙，道具对象用绿。直角方框，和原版光标一致。 */
  mark(cells: [number, number][], kind: 'move' | 'attack' | 'aid') {
    const color = { move: 0x8acfff, attack: CINNABAR, aid: GREEN }[kind];
    this.marks.clear();
    for (const [x, y] of cells) {
      this.marks.fillStyle(color, 0.28).fillRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4);
      this.marks.lineStyle(4, color, 0.95).strokeRect(x * CELL + 3, y * CELL + 3, CELL - 6, CELL - 6);
    }
  }
  unmark() {
    this.marks.clear();
  }

  /** 镜头移到能看见该格的位置。 */
  focus(x: number, y: number, instant = false): Promise<void> {
    const cam = this.cameras.main;
    const tx = Phaser.Math.Clamp(mid(x) - VW / 2, 0, this.b.w * CELL - VW);
    const ty = Phaser.Math.Clamp(mid(y) - VH / 2, 0, this.b.h * CELL - VH);
    const visible = x * CELL >= cam.scrollX + CELL && x * CELL <= cam.scrollX + VW - 2 * CELL && y * CELL >= cam.scrollY + CELL && y * CELL <= cam.scrollY + VH - 2 * CELL;
    if (visible) return Promise.resolve();
    if (instant || !this.speed) return cam.setScroll(tx, ty), Promise.resolve();
    return this.tween({ targets: cam, scrollX: tx, scrollY: ty, duration: 300, ease: 'Sine.easeInOut' });
  }

  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    return new Promise((done) =>
      this.tweens.add({ ...config, duration: Math.max(1, ((config.duration as number) ?? 200) * this.speed), onComplete: () => done() }));
  }
  private wait(ms: number): Promise<void> {
    return new Promise((done) => this.time.delayedCall(Math.max(1, ms * this.speed), done));
  }

  /** 头顶飘字。 */
  private async float(u: Unit, text: string, color: string) {
    const s = this.tk(u.slot);
    const t = this.add.text(s.x, s.y - 30, text, { ...FONT, color }).setOrigin(0.5, 1).setDepth(9).setScale(0.6);
    await this.tween({ targets: t, y: t.y - 44, scale: 1, duration: 420, ease: 'Back.easeOut' });
    await this.tween({ targets: t, alpha: 0, duration: 260, delay: 180 });
    t.destroy();
  }
  /** 一笔特效：一张染色的贴图从 from 的样子变到 to 的样子，然后消失。关掉动效时不画。 */
  private async puff(key: string, x: number, y: number, tint: number, from: { scale: number; alpha?: number; angle?: number }, to: Record<string, unknown>, duration: number, delay = 0) {
    if (!this.speed) return;
    if (delay) await this.wait(delay);
    const im = this.add.image(x, y, key).setTint(tint).setDepth(8).setScale(from.scale).setAlpha(from.alpha ?? 1).setAngle(from.angle ?? 0);
    // 形状先快后慢地展开，透明度反过来先慢后快：一开始看得清，收尾才淡掉
    await this.tween({ targets: im, ease: 'Cubic.easeOut', ...to, ...('alpha' in to && { alpha: { value: to.alpha, ease: 'Cubic.easeIn' } }), duration });
    im.destroy();
  }
  /** 几颗光点从棋子四周升起（恢复、升级）。 */
  private sparkle(u: Unit, tint: number) {
    const s = this.tk(u.slot);
    return Promise.all([
      this.puff('circle_02', s.x, s.y, tint, { scale: 0.25, alpha: 0.9 }, { scale: 0.62, alpha: 0 }, 520),
      ...[-30, -8, 14, 32].map((dx, i) =>
        this.puff('star_06', s.x + dx, s.y + 18 - (i % 2) * 20, tint, { scale: 0.12 }, { y: s.y - 52 - (i % 2) * 14, scale: 0.3, alpha: 0 }, 560, i * 70)),
    ]);
  }

  /** 施法者的起势：脚下亮起家族色的法阵，头顶旋起一小圈光，身体轻轻一抬。一次施法只画一遍。 */
  private async castBegin(u: Unit, id: number) {
    const s = this.tk(u.slot);
    const tint = MOOD_TINT[castMood(id)];
    await Promise.all([
      this.puff('circle_02', s.x, s.y + 24, tint, { scale: 0.24, alpha: 0.9 }, { scale: 0.82, alpha: 0 }, 460),
      this.puff('twirl_01', s.x, s.y - 8, tint, { scale: 0.16, angle: 0 }, { scale: 0.46, angle: 150, alpha: 0 }, 480, 80),
      this.tween({ targets: s, y: s.y - 5, duration: 150, yoyo: true, ease: 'Quad.easeOut' }),
    ]);
  }

  /**
   * 受术：按策略家族各画一套，不再一律是同一簇火花。
   * 火往上烧、水从脚下冲起、石从头顶砸落、扰心是紫色旋涡、振气金光上升、丧气压顶而下、回复绿光、火药大爆。
   */
  private async castHit(d: Unit, id: number, ok: boolean) {
    const s = this.tk(d.slot);
    const mood = castMood(id);
    const tint = MOOD_TINT[mood];
    const jobs: Promise<unknown>[] = [];
    switch (mood) {
      case 'fire':
        jobs.push(
          ...[-26, 2, 26, -10, 14].map((dx, i) =>
            this.puff(i % 2 ? 'flame_06' : 'flame_05', s.x + dx, s.y + 28, i % 2 ? 0xd9731f : CINNABAR, { scale: 0.4 }, { y: s.y - 64, scale: 0.9, alpha: 0 }, 640, i * 80)),
          this.puff('smoke_04', s.x, s.y - 10, INK, { scale: 0.3, alpha: 0.55 }, { y: s.y - 82, scale: 0.75, alpha: 0 }, 760, 240));
        break;
      case 'water':
        jobs.push(
          this.puff('circle_05', s.x, s.y + 30, tint, { scale: 0.3, alpha: 0.95 }, { y: s.y - 74, scale: 1.05, alpha: 0 }, 700),
          ...[-24, 0, 24].map((dx, i) =>
            this.puff('twirl_01', s.x + dx, s.y + 22, 0x9fd8f5, { scale: 0.26, angle: 0 }, { y: s.y - 50, scale: 0.85, angle: 320, alpha: 0 }, 720, i * 90)));
        break;
      case 'rock':
        jobs.push(
          ...[-30, 0, 26].map((dx, i) =>
            this.puff('scorch_01', s.x + dx, s.y - 220, 0x6b5a45, { scale: 0.9, alpha: 1 }, { y: s.y + 14, scale: 1, alpha: 0.15 }, 560, i * 130)),
          this.puff('circle_05', s.x, s.y + 6, 0xcbb894, { scale: 0.25, alpha: 0.9 }, { scale: 1.15, alpha: 0 }, 520, 380),
          this.puff('smoke_04', s.x, s.y, INK, { scale: 0.4, alpha: 0.5 }, { y: s.y - 52, scale: 0.9, alpha: 0 }, 640, 340));
        if (this.speed) this.cameras.main.shake(180 * this.speed, 0.007);
        break;
      case 'mind':
        jobs.push(
          this.puff('twirl_01', s.x, s.y - 24, tint, { scale: 0.34, angle: 0 }, { scale: 0.95, angle: 360, alpha: 0 }, 760),
          this.puff('twirl_01', s.x, s.y + 6, tint, { scale: 0.28, angle: 360 }, { scale: 0.85, angle: -40, alpha: 0 }, 760, 120),
          this.puff('circle_05', s.x, s.y, tint, { scale: 0.3, alpha: 0.85 }, { scale: 1, alpha: 0 }, 640));
        break;
      case 'gloom':
        jobs.push(
          this.puff('circle_05', s.x, s.y - 92, tint, { scale: 1.1, alpha: 0.85 }, { y: s.y + 16, scale: 0.9, alpha: 0 }, 700),
          this.puff('smoke_04', s.x - 18, s.y - 6, INK, { scale: 0.5, alpha: 0.65 }, { y: s.y - 56, scale: 1, alpha: 0 }, 700, 100),
          this.puff('smoke_04', s.x + 20, s.y + 8, INK, { scale: 0.44, alpha: 0.55 }, { y: s.y - 46, scale: 0.9, alpha: 0 }, 680, 240));
        break;
      case 'rally':
      case 'heal':
        jobs.push(this.sparkle(d, mood === 'heal' ? GREEN : GOLD));
        break;
      case 'blast':
        jobs.push(
          this.puff('circle_05', s.x, s.y, BLAST, { scale: 0.3, alpha: 1 }, { scale: 1.6, alpha: 0 }, 420),
          this.puff('scorch_01', s.x, s.y, CINNABAR, { scale: 0.4, alpha: 1 }, { scale: 1.5, alpha: 0 }, 520),
          this.puff('smoke_04', s.x, s.y - 20, INK, { scale: 0.4, alpha: 0.8 }, { y: s.y - 110, scale: 1.1, alpha: 0 }, 760, 160));
        if (this.speed) this.cameras.main.shake(260 * this.speed, 0.012);
        break;
    }
    if (ok) jobs.push(this.tween({ targets: s, x: s.x + 6, duration: 50, yoyo: true, repeat: 3 }));
    await Promise.all(jobs);
  }

  /** 一次出手：近战先收后冲，落下一道墨色斩痕；弓兵放三支箭。命中时对方被震退、闪白，画面轻晃。 */
  private async strike(a: Unit, d: Unit, onImpact?: () => void) {
    const [sa, sd] = [this.tk(a.slot), this.tk(d.slot)];
    const [dx, dy] = [sd.x - sa.x, sd.y - sa.y];
    const len = Math.hypot(dx, dy) || 1;
    if (dx && this.mirror) { sa.setFlipX(dx < 0); sd.setFlipX(dx > 0); } // 出手瞬间双方转身面对面，之后由 sync() 复位
    const [ux, uy] = [dx / len, dy / len];
    const angle = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
    const ranged = TB.range[a.cls] >= 2 && TB.range[a.cls] !== 255;
    const [hx, hy] = [sa.x, sa.y];
    sa.setDepth(7);
    if (ranged) {
      await this.tween({ targets: sa, x: hx - ux * 8, y: hy - uy * 8, duration: 110, ease: 'Quad.easeOut' });
      void this.tween({ targets: sa, x: hx, y: hy, duration: 160, ease: 'Back.easeOut' });
      // trace_06 是竖着的一道细痕，转 90° 让它顺着飞行方向
      await Promise.all([-9, 0, 9].map((off, i) =>
        this.puff('trace_06', sa.x - uy * off, sa.y + ux * off, INK, { scale: 0.34, angle: angle + 90 }, { x: sd.x - uy * off, y: sd.y + ux * off, ease: 'Quad.easeIn' }, 190, i * 45)));
    } else {
      await this.tween({ targets: sa, x: hx - ux * 12, y: hy - uy * 12, duration: 120, ease: 'Quad.easeOut' });
      await this.tween({ targets: sa, x: hx + ux * CELL * 0.42, y: hy + uy * CELL * 0.42, duration: 90, ease: 'Cubic.easeIn' });
    }
    onImpact?.();
    this.cameras.main.shake(110 * this.speed, 0.004);
    sd.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    this.time.delayedCall(70, () => sd.clearTint().setTintMode(Phaser.TintModes.MULTIPLY));
    await Promise.all([
      // slash_03 是一道朝右鼓的弧，转到出手方向上
      ranged || this.puff('slash_03', sd.x - ux * 10, sd.y - uy * 10, INK, { scale: 0.42, angle: angle - 28 }, { scale: 0.86, angle: angle + 22, alpha: 0 }, 320),
      this.puff('scorch_01', sd.x, sd.y, CINNABAR, { scale: 0.24, alpha: 0.95 }, { scale: 0.7, alpha: 0 }, 300),
      this.tween({ targets: sd, x: sd.x + ux * 10, y: sd.y + uy * 10, duration: 60, yoyo: true, repeat: 1, ease: 'Quad.easeOut' }),
      ranged || this.tween({ targets: sa, x: hx, y: hy, duration: 200, delay: 60 * this.speed, ease: 'Quad.easeOut' }),
    ]);
    sa.setDepth(2 + a.y / 100);
  }

  /** 播放一个规则事件。onImpact 在命中的那一刻回调（界面层用它同步对阵条上的兵力）。 */
  async play(ev: Ev, onImpact?: () => void): Promise<void> {
    const b = this.b;
    const unit = (slot: number) => bySlot(b, slot)!;
    switch (ev.t) {
      case 'move': {
        const s = this.tk(ev.slot);
        const u = unit(ev.slot);
        await this.focus(ev.path[0][0], ev.path[0][1]);
        this.cameras.main.startFollow(s, false, 0.2, 0.2);
        s.setDepth(7); // 走子时提起来，压在别的棋子上面
        // 按第一步的横向位移转身，不会倒退着移动；纯上下移动保持面向敌方
        const dx = ev.path.length > 1 ? ev.path[1][0] - ev.path[0][0] : 0;
        s.setFlipX(this.mirror && (dx < 0 ? true : dx > 0 ? false : facesLeft(b, u)));
        await this.tween({ targets: s, scale: 1.1, duration: 70 });
        // 原版棋盘上走一格是两帧交替：前半格迈步（略微抬起），后半格落脚回站立帧
        for (const [x, y] of ev.path.slice(1)) {
          const [tx, ty] = [mid(x), mid(y)];
          const [x0, y0] = [s.x, s.y];
          s.setFrame(this.frameOf(u, false, true));
          await this.tween({ targets: s, x: (x0 + tx) / 2, y: (y0 + ty) / 2 - 2 * RES, duration: 52, ease: 'Linear' });
          s.setFrame(this.frameOf(u, false, false));
          await this.tween({ targets: s, x: tx, y: ty, duration: 53, ease: 'Linear' });
        }
        s.setFrame(this.frameOf(u, false, false));
        await this.tween({ targets: s, scale: 1, duration: 90, ease: 'Bounce.easeOut' });
        s.setFlipX(this.mirror && facesLeft(b, u)); // 站定后转回面向敌方（棋子图本身朝右，朝左靠镜像）
        s.setDepth(2 + ev.path[ev.path.length - 1][1] / 100);
        this.cameras.main.stopFollow();
        break;
      }
      case 'hit': {
        const [a, d] = [unit(ev.a), unit(ev.d)];
        this.hp.set(d.slot, this.hpOf(d.slot) - ev.dmg);
        await this.focus(d.x, d.y);
        if (!this.speed) onImpact?.();
        else if (this.hasCutin(a, d)) await this.cutin(a, d, onImpact);
        else await this.strike(a, d, onImpact);
        await this.float(d, `-${ev.dmg}`, '#ffcf55');
        break;
      }
      case 'castbegin':
        await this.castBegin(unit(ev.slot), ev.id);
        break;
      case 'cast': {
        const d = unit(ev.d);
        this.hp.set(d.slot, this.hpOf(d.slot) - ev.dmg);
        await this.focus(d.x, d.y);
        await Promise.all([this.castHit(d, ev.id, ev.ok), this.float(d, ev.ok ? `-${ev.dmg}` : '识破', ev.ok ? '#ffcf55' : '#8acfff')]);
        break;
      }
      case 'duel': {
        // 单挑：你来我往三个回合，不扣兵力
        const [a, d] = [unit(ev.a), unit(ev.d)];
        await this.focus(d.x, d.y);
        if (!this.speed) break;
        await this.strike(d, a);
        await this.strike(a, d);
        await this.strike(a, d);
        break;
      }
      case 'retreat':
        await this.tween({ targets: this.tk(ev.slot), alpha: 0, scale: 0.6, duration: 360, ease: 'Quad.easeIn' });
        this.tk(ev.slot).setVisible(false);
        break;
      case 'recover':
        this.hp.set(ev.slot, this.hpOf(ev.slot) + ev.hp);
        await Promise.all([this.sparkle(unit(ev.slot), GREEN), this.float(unit(ev.slot), ev.hp ? `+${ev.hp}` : `士气+${ev.morale}`, '#00ba75')]);
        break;
      case 'aid': {
        // 策略补给：命中后按家族画一遍受术（回复绿光 / 振气金光 / 扰心紫旋 / 丧气压顶），再飘数值
        const d = unit(ev.d);
        if (ev.ok) this.hp.set(d.slot, this.hpOf(d.slot) + ev.hp);
        await this.focus(d.x, d.y);
        if (ev.ok) {
          const label = ev.hp ? `+${ev.hp}` : ev.morale ? `士气${ev.morale > 0 ? '+' : ''}${ev.morale}` : '回復';
          const bright = ev.hp > 0 || ev.morale > 0;
          await Promise.all([this.castHit(d, ev.id, true), this.float(d, label, bright ? '#00ba75' : '#8acfff')]);
        } else await this.float(d, '识破', '#8acfff');
        break;
      }
      case 'confuse': {
        const s = this.tk(ev.slot);
        if (ev.on) void this.puff('twirl_01', s.x, s.y - 30, PURPLE, { scale: 0.3 }, { angle: 360, alpha: 0 }, 700);
        await this.float(unit(ev.slot), ev.on ? '混乱' : '恢复', '#8acfff');
        break;
      }
      case 'exp':
        if (ev.levels) await Promise.all([this.sparkle(unit(ev.slot), GOLD), this.float(unit(ev.slot), '升级', '#ffcf55')]);
        break;
      case 'gain':
        await this.float(unit(ev.slot), '获得', '#ffcf55');
        break;
      case 'hp': {
        this.hp.set(ev.slot, Math.max(0, this.hpOf(ev.slot) + ev.delta));
        await this.float(unit(ev.slot), String(ev.delta), '#ef6500');
        break;
      }
      case 'spawn': {
        this.sync();
        await Promise.all(ev.slots.map((slot) => {
          const s = this.tk(slot);
          return this.puff('circle_05', s.x, s.y, CINNABAR, { scale: 0.2, alpha: 0.9 }, { scale: 0.9, alpha: 0 }, 480);
        }));
        break;
      }
      case 'terrain': {
        // 地形被改：在原图上盖一块同尺寸的色块，标出火烧/水攻改过的格子
        const t = this.add.rectangle(ev.x * CELL, ev.y * CELL, CELL, CELL, 0xef6500, 0.45).setOrigin(0).setDepth(0.5);
        await this.tween({ targets: t, alpha: 0.18, duration: 400 });
        break;
      }
      case 'stage':
        await this.wait(260);
        break;
      default:
        break; // objective / drama / talk 由界面层处理
    }
  }
}
