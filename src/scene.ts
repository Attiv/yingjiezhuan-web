import * as Phaser from 'phaser';
import { facesLeft } from './facing';
import { TB, bySlot } from './rules/core';
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
  private hp = new Map<number, number>(); // 画面上显示的兵力：事件一条条播，数字跟着一步步变
  private marks!: Phaser.GameObjects.Graphics;
  private cursor!: Phaser.GameObjects.Graphics;
  private keys!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('battle');
  }

  preload() {
    this.load.image('map', 'assets/sishui.png'); // 原版汜水关：896×512 的 16px 图块拼图，3 倍整数放大
    this.load.spritesheet('tokens', 'assets/tokens.png', { frameWidth: CELL, frameHeight: CELL }); // 原版 HEXZCHR 兵种图标；一支部队一帧，第二行是本回合已行动
    for (const key of FX) this.load.image(key, `assets/fx/${key}.png`);
  }

  create() {
    this.add.image(0, 0, 'map').setOrigin(0); // 整张战场是一幅预先拼好的图
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

  /** 换一场战斗（开局或读档）：重摆全部棋子。 */
  setBattle(b: Battle) {
    this.b = b;
    this.tweens.killAll();
    this.tokens.forEach((s) => s.destroy());
    this.tokens.clear();
    this.marks.clear();
    b.units.forEach((u, i) => this.tokens.set(u.slot, this.add.image(0, 0, 'tokens', i)));
    this.cameras.main.setBounds(0, 0, b.w * CELL, b.h * CELL);
    this.sync();
  }

  private tk(slot: number) {
    return this.tokens.get(slot)!;
  }

  /** 把棋子对齐到当前状态：位置、是否在场；我军已行动的换成灰色那一帧，混乱的歪倒并发紫。 */
  sync() {
    const n = this.b.units.length;
    this.b.units.forEach((u, i) => {
      const done = u.acted && this.b.stage === 'player' && u.mode === 7;
      const s = this.tk(u.slot).setFrame(done ? i + n : i).setPosition(mid(u.x), mid(u.y)).setDepth(2 + u.y / 100).setVisible(u.on).setAlpha(1).setScale(1);
      s.setAngle(u.confused ? -16 : 0).setFlipX(facesLeft(this.b, u)).setTintMode(Phaser.TintModes.MULTIPLY);
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

  /** 一次出手：近战先收后冲，落下一道墨色斩痕；弓兵放三支箭。命中时对方被震退、闪白，画面轻晃。 */
  private async strike(a: Unit, d: Unit, onImpact?: () => void) {
    const [sa, sd] = [this.tk(a.slot), this.tk(d.slot)];
    const [dx, dy] = [sd.x - sa.x, sd.y - sa.y];
    const len = Math.hypot(dx, dy) || 1;
    if (dx) { sa.setFlipX(dx < 0); sd.setFlipX(dx > 0); } // 出手瞬间双方转身面对面，之后由 sync() 复位
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
        s.setFlipX(dx < 0 ? true : dx > 0 ? false : facesLeft(b, u));
        await this.tween({ targets: s, scale: 1.1, duration: 70 });
        for (const [x, y] of ev.path.slice(1)) await this.tween({ targets: s, x: mid(x), y: mid(y), duration: 105, ease: 'Linear' });
        await this.tween({ targets: s, scale: 1, duration: 90, ease: 'Bounce.easeOut' });
        s.setFlipX(facesLeft(b, u)); // 站定后转回面向敌方（棋子图本身朝右，朝左靠镜像）
        s.setDepth(2 + ev.path[ev.path.length - 1][1] / 100);
        this.cameras.main.stopFollow();
        break;
      }
      case 'hit': {
        const [a, d] = [unit(ev.a), unit(ev.d)];
        this.hp.set(d.slot, this.hpOf(d.slot) - ev.dmg);
        await this.focus(d.x, d.y);
        if (this.speed) await this.strike(a, d, onImpact);
        else onImpact?.();
        await this.float(d, `-${ev.dmg}`, '#ffcf55');
        break;
      }
      case 'cast': {
        const d = unit(ev.d);
        const s = this.tk(d.slot);
        this.hp.set(d.slot, this.hpOf(d.slot) - ev.dmg);
        await this.focus(d.x, d.y);
        await Promise.all([
          ...[-22, 4, 24, -6].map((dx, i) =>
            this.puff(i % 2 ? 'flame_06' : 'flame_05', s.x + dx, s.y + 26, i % 2 ? 0xd9731f : CINNABAR, { scale: 0.32 }, { y: s.y - 56, scale: 0.72, alpha: 0 }, 560, i * 90)),
          this.puff('smoke_04', s.x, s.y - 10, INK, { scale: 0.25, alpha: 0.5 }, { y: s.y - 70, scale: 0.6, alpha: 0 }, 700, 260),
          ev.ok && this.tween({ targets: s, x: s.x + 6, duration: 50, yoyo: true, repeat: 3 }),
        ]);
        await this.float(d, ev.ok ? `-${ev.dmg}` : '识破', ev.ok ? '#ffcf55' : '#8acfff');
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
      case 'stage':
        await this.wait(260);
        break;
    }
  }
}
