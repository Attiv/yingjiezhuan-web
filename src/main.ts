import * as Phaser from 'phaser';
import './style.css';
import { playSfx, preloadSfx, sfxEnabled, sfxLog, toggleSfx, unlockSfx } from './audio';
import { sfxOf } from './sfx-map';
import { DEMO, DEMO_ACTOR, DEMO_LEVELS, drawDemoActor } from './data/demo';
import { SCRIPT, TITLE, defaultDeploy, faceOf, hasLevel, itemId, level, nameOf, officers, scene as gameScene } from './data/game';
import { PROMOTE, classUse, isEquipment, itemEffect, priceOf, specOf } from './data/items';
import { chapterTitle, marchMap } from './data/march';
import { strategyName, strategySpec } from './data/strategies';
import { DUEL_BGM, TITLE_BGM, battleBgm, isFighting, resultBgm } from './music';
import { tally } from './result';
import { TB, atk, attackTargets, bySlot, def, itemName, knownStrategies, maxHp, maxMp, moveBudget, terrainAt, terrainDef, unitAt, weatherName } from './rules/core';
import { canStop, reachField } from './rules/move';
import { aiStep, autoPhase, canCommand, castTargets, doAttack, doCast, doCastAll, doDrop, doGive, doItem, doItemAll, doMove, doWait, endPhase, giveTargets, harvest, itemTargets, levelById, levelOf, newBattle, registerLevel, undoMove } from './rules/turn';
import type { Battle, Ev, Flag, Unit } from './rules/types';
import { BattleScene, CELL, RES, VIEW_H, VIEW_W, sideOf } from './scene';
import { checkScript, currentStep, nextStep, startStory, testFlag, type Shown, type Story, type StoryApi, type Step } from './story';

const SAVE_KEY = 'yjz.save.v3'; // 流程进度 + 战斗状态
/** 仅开发模式：?demo 换成不带任何图的演示流程，用来验证框架本身。 */
const demo = import.meta.env.DEV && new URLSearchParams(location.search).has('demo');
if (demo) DEMO_LEVELS.forEach(registerLevel);
export const CAMPAIGN = checkScript(demo ? DEMO : SCRIPT, demo ? (id) => !!levelById(id) : hasLevel);
const lvOf = (id: string) => (demo ? levelById(id) : level(id));

const SIDE = [['player', '我军'], ['ally', '友军'], ['enemy', '敌军']] as const;
/** 原版开局就在队里的三人。其余武将按剧本里的「加入」逐步入队。 */
const START_PARTY = ['liu_bei', 'guan_yu', 'zhang_fei'];
const params = new URLSearchParams(location.search);

const $ = (id: string) => document.getElementById(id)!;
const esc = (s: unknown) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
/** 头像路径；杂兵没有武将头像（face 是 clsN），用一张通用像。 */
const faceStyle = (face?: string) => `background-image:url(/assets/${!face || face.startsWith('cls') ? 'portraits/_unknown' : face}.png)`;

let b: Battle;
let story: Story = startStory(CAMPAIGN);
let scene: BattleScene;
/** idle 待选；unit 已选中部队；menu 指令菜单；target 选目标；busy 播放中；over 已结束 */
let mode: 'idle' | 'unit' | 'menu' | 'target' | 'busy' | 'over' = 'busy';
let sel: Unit | null = null;
let shown: Unit | null = null;
let pick: { targets: Unit[]; run: (t: Unit) => Ev[] } | null = null;
let answer: ((i: number) => void) | null = null; // 对话框等待中的回调
let onEsc = 0; // 按 Esc 时回答的选项序号；-1 = 必须自己选
let autoTalk = false; // 仅开发模式的 ?fast：对话不等点击

/** 武将的初始成长：等级取原版数据，其余空白。 */
const blank = (id: string) => ({ level: officers[id]?.level ?? 1, exp: 0, items: [] as number[] });

/** 剧情要改队伍时的落地：加入、离队、升级、得道具、转职。 */
const API: StoryApi = {
  join(st, id) {
    if (!officers[id]) return log(`剧本里的人 ${id} 在武将表里没有，加入这一步略过。`);
    if (!st.party.includes(id)) st.party.push(id);
    st.roster[id] ??= blank(id);
    log(`${nameOf(id)} 加入。`);
  },
  away(st, id) {
    st.party = st.party.filter((x) => x !== id);
    st.deploy = st.deploy.filter((x) => x !== id);
    log(`${nameOf(id)} 离队。`);
  },
  level(st, id, n) {
    const r = (st.roster[id] ??= blank(id));
    r.level = Math.max(1, r.level + n);
    log(`${nameOf(id)} 升到 ${r.level} 级。`);
  },
  item(st, id) {
    const n = itemId(id);
    if (n !== undefined) st.bag.push(n);
  },
  cls(st, id, cls) {
    (st.roster[id] ??= blank(id)).cls = cls;
  },
};

// ---------------------------------------------------------------- 音乐 / 音效 ----
const audio = new Audio();
audio.loop = true;
const BGM_VOLUME = 0.55;
let bgmKey = '';
/** 想放的曲子（即使浏览器暂时不让放也记着，第一次点击后补播）。 */
let bgmWanted = '';
/** 调试 / 自动化用：真正换过的曲目（按顺序）。 */
const bgmLog: string[] = [];
/** 淡入淡出的令牌：换曲时旧的淡出过程不会把新曲的音量再拉回去。 */
let fadeToken = 0;
const fadeTo = (to: number, ms = 220) => {
  const token = ++fadeToken;
  const from = audio.volume;
  const t0 = performance.now();
  return new Promise<void>((done) => {
    const step = () => {
      if (token !== fadeToken) return done();
      const k = ms > 0 ? Math.min(1, (performance.now() - t0) / ms) : 1;
      audio.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if (k < 1) requestAnimationFrame(step);
      else done();
    };
    requestAnimationFrame(step);
  });
};
/** 换曲：先淡出旧的 160ms，再换源从 0 淡入；同一首不重来。 */
function playBgm(key: string, force = false) {
  if (!key) return;
  bgmWanted = key;
  if (!force && key === bgmKey) return;
  bgmKey = key;
  bgmLog.push(key);
  if (bgmLog.length > 300) bgmLog.shift();
  const start = () => {
    if (key !== bgmKey) return; // 淡出期间又换了曲，这一首就不放了
    audio.src = `/assets/bgm/${key}.mp3`;
    audio.volume = 0;
    void audio.play().then(() => fadeTo(BGM_VOLUME)).catch(() => { /* 等第一次点击 */ });
  };
  if (!audio.paused && audio.volume > 0.01) void fadeTo(0, 160).then(start);
  else start();
}
/** 战斗里按阶段对齐曲子；不在战斗里就什么也不做。 */
function syncBattleMusic() {
  if (b && isFighting(b.stage)) playBgm(battleBgm(levelOf(b), b.stage));
}

preloadSfx();
// 第一次手势解锁出声；UI 按钮统一在捕获阶段给一声确认，指令菜单用更轻的光标音
document.addEventListener('pointerdown', (e) => {
  unlockSfx();
  if (bgmWanted && audio.paused) playBgm(bgmWanted, true); // 自动播放被拦下的曲子在这里补上
  const btn = (e.target as HTMLElement).closest('button');
  if (btn && !(btn as HTMLButtonElement).disabled) playSfx(btn.closest('#menu') ? 'cursor' : 'confirm', 0.75);
}, true);
document.addEventListener('keydown', () => unlockSfx(), { once: true });

// ---------------------------------------------------------------- 画面各栏 ----
function renderTurn() {
  const [cls, label] = b.stage === 'ally' ? SIDE[1] : b.stage === 'enemy' ? SIDE[2] : SIDE[0];
  $('turn').innerHTML =
    `<b>第${b.round}回合</b><div style="text-align:right"><div>${weatherName(b.weather)}　限 ${levelOf(b).turnLimit} 回合</div>` +
    `<div class="phase-${cls}">${label}行动</div></div>`;
  for (const el of $('sys').querySelectorAll('button')) if (!el.dataset.sfx) el.disabled = mode !== 'idle';
  syncBattleMusic(); // 回合 / 阶段事件都会走到这里，曲子跟着阶段换
}

function renderUnit(u: Unit | null = shown) {
  shown = u;
  if (!u) return void ($('unit').innerHTML = '<p class="empty">把光标移到部队上查看状态。</p>');
  const [cls, label] = SIDE[sideOf(u)];
  const max = maxHp(u.cls, u.level);
  const mpMax = maxMp(u);
  const bar = (kind: string, v: number, m: number) => `<span class="bar ${kind}"><i style="width:${m ? Math.round((100 * v) / m) : 0}%"></i></span>`;
  const notes = [
    u.confused ? '混乱中' : '',
    u.acted && u.mode === 7 ? '本回合已行动' : '',
    u.items.length ? `道具：${u.items.map(itemName).join('、')}` : '',
    u.items.filter(isEquipment).length ? `装备：${u.items.filter(isEquipment).map(itemEffect).join('、')}` : '',
    knownStrategies(u).length ? `策略：${knownStrategies(u).map(strategyName).join('、')}` : '',
  ].filter(Boolean);
  $('unit').innerHTML =
    `<div class="head"><div class="face" style="${faceStyle(u.face)}"></div><div>` +
    `<h2 class="side-${cls}">${esc(u.name)}</h2><div>${label}　${TB.classNames[u.cls]}</div><div>等级 ${u.level}　经验 ${u.exp}</div></div></div>` +
    `<dl><dt>兵力</dt><dd>${bar('hp', u.hp, max)}${u.hp}/${max}</dd>` +
    `<dt>士气</dt><dd>${bar('', u.morale, 100)}${u.morale}</dd>` +
    `<dt>策略值</dt><dd>${bar('mp', u.mp, mpMax)}${u.mp}/${mpMax}</dd></dl>` +
    `<div class="stats"><div><span>攻击</span>${atk(u)}</div><div><span>防御</span>${def(u)}</div><div><span>移动</span>${moveBudget(u)}</div>` +
    `<div><span>武力</span>${u.str}</div><div><span>智力</span>${u.int}</div><div><span>统御</span>${u.lead}</div></div>` +
    notes.map((n) => `<p class="note">${esc(n)}</p>`).join('');
}

function renderTile(x: number, y: number) {
  const t = terrainAt(b, x, y);
  const d = terrainDef(t);
  $('tile').innerHTML = `<div>${TB.terrainNames[t] ?? ''}</div><span>${d === 255 ? '不能进入' : `防御 ${d}%`}</span>`;
}

function log(text: string) {
  const p = document.createElement('p');
  p.textContent = text;
  $('log').append(p);
  while ($('log').children.length > 5) $('log').firstChild!.remove();
}

/** 战场中央的一条短横幅：敌军增援 / 伏兵出现这类一瞬间的提示。 */
const banners: string[] = [];
async function banner(text: string) {
  banners.push(text);
  if (banners.length > 20) banners.shift();
  const el = $('banner');
  el.textContent = text;
  el.hidden = false;
  el.classList.remove('on');
  void el.offsetWidth; // 重启动画
  el.classList.add('on');
  playSfx('phase', 0.9);
  await new Promise<void>((done) => setTimeout(done, Math.max(1, 900 * (scene.speed || 1))));
  el.classList.remove('on');
  el.hidden = true;
}

const name = (slot: number) => bySlot(b, slot)?.name ?? '';

function describe(ev: Ev): string {
  switch (ev.t) {
    case 'round': return `—— 第 ${ev.round} 回合，${weatherName(ev.weather)} ——`;
    case 'stage': return ev.stage === 'ally' ? '友军行动。' : ev.stage === 'enemy' ? '敌军行动。' : '';
    case 'hit': return `${name(ev.a)}${ev.counter ? '反击' : '攻击'}${name(ev.d)}：兵力 -${ev.dmg}${ev.morale ? `，士气 -${ev.morale}` : ''}`;
    case 'cast': return ev.ok
      ? `${name(ev.a)}使出「${strategyName(ev.id)}」：${name(ev.d)}兵力 -${ev.dmg}`
      : `${name(ev.a)}的「${strategyName(ev.id)}」被${name(ev.d)}识破`;
    case 'aid': return ev.ok
      ? `${name(ev.a)}使出「${strategyName(ev.id)}」：${name(ev.d)}${[ev.hp ? `兵力 +${ev.hp}` : '', ev.morale ? `士气 ${ev.morale > 0 ? '+' : ''}${ev.morale}` : ''].filter(Boolean).join('，') || '毫无变化'}`
      : `${name(ev.a)}的「${strategyName(ev.id)}」被${name(ev.d)}识破`;
    case 'exp': return name(ev.slot) + [ev.gain ? `经验 +${ev.gain}` : '', ev.levels ? `升到 ${bySlot(b, ev.slot)!.level} 级` : ''].filter(Boolean).join('，') +
      (ev.learned.length ? `，学会「${ev.learned.map(strategyName).join('、')}」` : '');
    case 'recover': return `${name(ev.slot)}休整：${[ev.hp ? `兵力 +${ev.hp}` : '', ev.morale ? `士气 +${ev.morale}` : ''].filter(Boolean).join('，')}`;
    case 'hp': return `${name(ev.slot)}兵力 ${ev.delta}`;
    case 'confuse': return ev.on ? `${name(ev.slot)}陷入混乱！` : `${name(ev.slot)}恢复了秩序。`;
    case 'retreat': return `${name(ev.slot)}撤退。`;
    case 'spawn': return '敌军增援赶到！';
    case 'objective': return `胜利条件：${ev.text}`;
    case 'gain': return `${name(ev.slot)}${ev.text}`;
    case 'give': return `${name(ev.a)}把「${itemName(ev.item)}」交给${name(ev.d)}。`;
    case 'drop': return `${name(ev.slot)}丢掉了「${itemName(ev.item)}」。`;
    case 'end': return ev.text;
    default: return '';
  }
}

/** 依次播放一批规则事件；对话要等玩家点击。 */
async function present(evs: Ev[]) {
  for (const ev of evs) {
    const fx = sfxOf(ev, b);
    if (fx) playSfx(fx, ev.t === 'move' || ev.t === 'recover' ? 0.5 : 1);
    const text = describe(ev);
    if (text) log(text);
    if (ev.t === 'round' || ev.t === 'stage') renderTurn();
    if (ev.t === 'drama') await playScene(ev.scene);
    else if (ev.t === 'talk') await talk(ev.who, ev.text);
    else if (ev.t === 'spawn') await banner('敵軍增援');
    else if (ev.t === 'hit' && scene.speed) await clash(ev);
    else await scene.play(ev);
  }
  scene.sync();
  renderTurn();
  renderUnit(shown);
}

/** 攻击时地图上方的对阵条：双方头像、名字和兵力，命中的一刻守方兵力条掉下去。 */
async function clash(ev: Extract<Ev, { t: 'hit' }>) {
  const [a, d] = [bySlot(b, ev.a)!, bySlot(b, ev.d)!];
  const before = scene.hpOf(d.slot);
  const side = (u: Unit, hp: number, cls: string) => {
    const max = maxHp(u.cls, u.level);
    return `<div class="${cls}"><div class="face" style="${faceStyle(u.face)}"></div><div class="who">` +
      `<b class="side-${SIDE[sideOf(u)][0]}">${esc(u.name)}</b><span class="bar hp"><i style="width:${Math.round((100 * hp) / max)}%"></i></span>` +
      `<span class="n">${hp}</span></div></div>`;
  };
  const el = $('clash');
  el.innerHTML = side(a, scene.hpOf(a.slot), 'l') + `<em>${ev.counter ? '反击' : '攻击'}</em>` + side(d, before, 'r');
  el.hidden = false;
  const art = scene.manifest.levels?.[b.level]?.static;
  const idx = (u: Unit) => b.units.findIndex((v) => v.slot === u.slot);
  const duel = $('duel');
  if (art) {
    duel.innerHTML = `<img class="scene" src="/assets/${art}/scene.png" alt="">` +
      `<img class="fighter l" src="/assets/${art}/unit-${idx(a)}.png" alt="">` +
      `<img class="fighter r" src="/assets/${art}/unit-${idx(d)}.png" alt="">`;
  }
  duel.hidden = !art || scene.hasCutin(a, d);
  await scene.play(ev, () => {
    const after = before - ev.dmg;
    (el.querySelector('.r .bar i') as HTMLElement).style.width = `${Math.round((100 * after) / maxHp(d.cls, d.level))}%`;
    el.querySelector('.r .n')!.textContent = String(after);
  });
  duel.hidden = true;
  el.hidden = true;
}

// ---------------------------------------------------------------- 对话与询问 ----
/** 对话框。who 为空是旁白；给了 options 就得点其中一项，返回它的序号，没给就点任意处继续。 */
function talk(who: string, text: string, options: string[] = [], face = '', esc_ = options.length ? -1 : 0): Promise<number> {
  const el = $('talk');
  el.innerHTML = (who ? `<div class="face" style="${faceStyle(face)}"></div>` : '') + `<div>${who ? `<h3>${esc(who)}</h3>` : ''}<p>${esc(text)}</p>` +
    (options.length ? `<div class="ask">${options.map((o, i) => `<button class="btn" data-i="${i}">${esc(o)}</button>`).join('')}</div>` : '') + '</div>';
  el.hidden = false;
  onEsc = esc_;
  (el.querySelector('button') as HTMLElement | null)?.focus();
  return new Promise((done) => {
    answer = (i) => ((answer = null), (el.hidden = true), done(i));
    if (autoTalk && !options.length) answer(0);
  });
}
$('talk').addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('button');
  if ($('talk').querySelector('.ask') && !btn) return; // 有选项时必须点按钮
  if (!btn) playSfx('cursor', 0.55); // 翻到下一句
  answer?.(Number(btn?.dataset.i ?? 0));
});
const say = (who: string, text: string) => talk(nameOf(who), text, [], faceOf(who) ?? '');
const confirmBox = (text: string) => talk('刘备', text, ['是', '否'], 'faces/038', 1).then((i) => i === 0);

// ---------------------------------------------------------------- 单挑演出 ----
/** 单挑用的两匹马：有专属图集的用专属，其余用原版的通用武将。 */
const DUEL_SHEETS = new Set(['guan_yu', 'zhang_fei', 'lu_bu']);
const DUEL_TERRAIN: Record<number, string> = {
  0: 'plain', 1: 'forest', 2: 'mountain', 3: 'river', 4: 'bridge', 5: 'wall', 6: 'castle', 7: 'grass',
  8: 'village', 9: 'cliff', 10: 'gate', 11: 'wasteland', 12: 'wall', 13: 'fort', 14: 'barracks',
  15: 'granary', 16: 'treasury', 17: 'house',
};
const frameCache = new Map<string, HTMLImageElement>();
function duelImage(key: string): Promise<HTMLImageElement> {
  const cached = frameCache.get(key);
  if (cached) return Promise.resolve(cached);
  return new Promise((done) => {
    const im = new Image();
    im.onload = () => (frameCache.set(key, im), done(im));
    im.onerror = () => done(im);
    im.src = `/assets/duel/${key}.png`;
  });
}
const DFRAME = 96;
const DSCALE = 3;

interface DuelAct { side: 'left' | 'right' | string; act: string; n?: number }

/** 单挑：整屏上两骑对冲，按剧本里的 act 表（charge / strike / fall / back）逐帧演。 */
async function playDuel(aId: string, bId: string, acts: DuelAct[]) {
  const el = $('duelplay');
  playBgm(DUEL_BGM); // 单挑：原版第 16 曲「强敌出现」
  const [aKey, bKey] = [DUEL_SHEETS.has(aId) ? aId : 'left', DUEL_SHEETS.has(bId) ? bId : 'right'];
  const [ia, ib] = await Promise.all([duelImage(aKey), duelImage(bKey)]);
  const terrain = DUEL_TERRAIN[terrainAt(b, Math.floor(b.w / 2), Math.floor(b.h / 2))] ?? 'plain';
  el.innerHTML = `<div class="terrain" style="background-image:url(/assets/duel/terrain_${terrain}.png)"></div>` +
    `<canvas class="left" width="${DFRAME * DSCALE}" height="${DFRAME * DSCALE}"></canvas>` +
    `<canvas class="right" width="${DFRAME * DSCALE}" height="${DFRAME * DSCALE}"></canvas>` +
    `<div class="versus"><b>${esc(bySlot(b, 0) ? nameOf(aId) : aId)}</b><em>單騎決鬥</em><b>${esc(nameOf(bId))}</b></div>` +
    '<div class="spark"></div>';
  el.hidden = false;
  const ctx = (sel: string) => (el.querySelector(sel) as HTMLCanvasElement).getContext('2d')!;
  const [ca, cb] = [ctx('.left'), ctx('.right')];
  const draw = (c: CanvasRenderingContext2D, im: HTMLImageElement, frame: number) => {
    c.clearRect(0, 0, DFRAME * DSCALE, DFRAME * DSCALE);
    c.imageSmoothingEnabled = false;
    c.drawImage(im, frame * DFRAME, 0, DFRAME, DFRAME, 0, 0, DFRAME * DSCALE, DFRAME * DSCALE);
  };
  const wait = (ms: number) => new Promise<void>((done) => setTimeout(done, Math.max(1, ms * (scene.speed || 1))));
  const show = (side: 'left' | 'right', frame: number) => {
    if (side === 'left') draw(ca, ia, frame);
    else draw(cb, ib, frame);
  };
  const play = async (side: 'left' | 'right', frames: number[], step: number, hold = false) => {
    for (const f of frames) {
      show(side, f);
      await wait(step);
    }
    if (!hold) show(side, 0);
  };
  draw(ca, ia, 0);
  draw(cb, ib, 0);
  await wait(700);
  const spark = el.querySelector('.spark') as HTMLElement;
  /** 交锋的火花：重启动画，让连击的每一下都闪一次。 */
  const flash = () => {
    spark.classList.remove('on');
    void spark.offsetWidth;
    spark.classList.add('on');
  };
  const canvasOf = (side: 'left' | 'right') => (side === 'left' ? el.querySelector('.left') : el.querySelector('.right')) as HTMLElement;
  /** 两骑的横向位置：30 = 列阵，105 = 交锋（left 是距左边缘，right 是距右边缘）。 */
  const [HOME, MEET] = [30, 105];
  const shift = (side: 'left' | 'right', px: number, ms: number) => {
    const c = canvasOf(side);
    const d = Math.max(1, ms * (scene.speed || 1));
    c.style.transition = `${side} ${d}ms cubic-bezier(0.2, 0.7, 0.3, 1), top ${d}ms ease-in, opacity ${d}ms linear`;
    c.style.setProperty(side, `${px}px`);
  };
  for (const act of acts) {
    const side = act.side === 'right' ? 'right' : 'left';
    if (act.act === 'charge') {
      // 冲阵：从列阵位置压上去，迈蹄帧同步，蹄声一起
      playSfx('step', 0.7);
      shift(side, MEET, 260);
      await play(side, [2, 3, 4], 90);
    } else if (act.act === 'strike') {
      const n = Math.min(3, Math.max(1, Math.round((act.n ?? 3) / 3)));
      for (let i = 0; i < n; i++) {
        shift(side, MEET, 140); // 没冲过阵的（连续挥击）先压上
        playSfx('hit_heavy', 0.8);
        flash();
        await play(side, [5, 6, 7, 8, 9, 10], 65);
        await wait(60);
      }
      shift(side, HOME, 220); // 收招退回，下一轮再冲
    } else if (act.act === 'fall') {
      // 落马：被击退、人马下沉，最后一帧淡出
      playSfx('retreat', 0.8);
      shift(side, HOME - 22, 420);
      canvasOf(side).style.top = '156px';
      show(side, 11);
      await wait(180);
      show(side, 12);
      await wait(220);
      show(side, 14);
      await wait(320);
      canvasOf(side).style.opacity = '0';
      await wait(240);
    } else if (act.act === 'flee') {
      // 败走：调头跑出画面
      playSfx('retreat', 0.8);
      shift(side, -150, 540);
      canvasOf(side).style.opacity = '0';
      await play(side, [4, 3, 2], 110);
    } else if (act.act === 'back') {
      shift(side, HOME, 240);
      await play(side, [4, 3, 2, 1], 80);
    }
  }
  await wait(500);
  el.hidden = true;
  syncBattleMusic(); // 打完回到战场曲（单挑可能发生在剧情里，那时不动）
}

// ---------------------------------------------------------------- 剧情 ----
/** 剧情背景：原版事件插画（224×144）按 2 倍摆进舞台中央。 */
function showPicture(key: string) {
  const el = $('screen');
  el.className = 'story';
  el.hidden = false;
  el.style.backgroundImage = '';
  el.innerHTML = key ? `<img class="pic" src="/assets/pictures/${key}.png" alt="">` : '';
}
function storyFrame() {
  showPicture(story.picture);
  playBgm(story.bgm);
  $('stage').classList.add('story');
}
/** 章节标题：原版行军图铺满舞台（缓慢平移），中间压一条横幅，点一下或按回车继续。 */
function chapter(text: string): Promise<void> {
  const el = $('screen');
  const title = chapterTitle(text);
  const map = title.chapter ? marchMap(title.chapter.key) : undefined;
  el.className = map ? 'story chapter-screen' : 'story';
  el.hidden = false;
  el.style.backgroundImage = map ? `url(/assets/${map.image})` : '';
  if (title.chapter) el.dataset.pan = Number(title.chapter.key.slice(1)) % 2 ? 'rev' : 'fwd';
  const box = document.createElement('div');
  box.className = 'chapter';
  box.innerHTML = `<div class="chapter-band"><b>${esc(title.name)}</b><span>${esc(title.sub || text)}</span></div>` +
    `<div class="chapter-hint">點擊或按 Enter 繼續</div>`;
  el.append(box);
  return new Promise((done) => {
    const end = () => {
      box.remove();
      el.style.backgroundImage = '';
      document.removeEventListener('keydown', key);
      el.removeEventListener('click', end);
      done();
    };
    const key = (e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && end();
    document.addEventListener('keydown', key);
    el.addEventListener('click', end);
    setTimeout(() => autoTalk && end(), 50);
  });
}
function hideStoryFrame() {
  $('screen').hidden = true;
  $('screen').innerHTML = '';
  $('screen').style.backgroundImage = '';
  $('stage').classList.remove('story');
}

/** 战场里插播的一幕：演出、单挑、选项，演完回战场。
 * 这一幕里的标志先读战场变量（b.vars），再读流程标志；set 写进战场变量，战后并回流程。 */
async function playScene(id: string) {
  const steps = gameScene(id);
  if (!steps.length) return;
  const labels = new Map<string, number>();
  steps.forEach((s, i) => s.t === 'label' && labels.set(s.name, i));
  const flags = () => ({ ...story.flags, ...b.vars });
  const el = $('screen');
  el.className = 'story';
  el.hidden = false;
  el.innerHTML = '';
  $('stage').classList.add('story');
  let pc = 0;
  try {
    for (let guard = 0; guard < 4000 && pc >= 0 && pc < steps.length; guard++) {
      const st = steps[pc] as Step;
      // 跳到某个标签；没给标签（或找不到）就是往下走一步
      const to = (label?: string) => { const at = label === undefined ? undefined : labels.get(label); pc = at ?? pc + 1; };
      if (st.t === 'end') break;
      else if (st.t === 'label') { pc++; continue; }
      else if (st.t === 'picture') { st.key ? (el.innerHTML = `<img class="pic" src="/assets/pictures/${st.key}.png" alt="">`) : (el.innerHTML = ''); pc++; }
      else if (st.t === 'bgm') { playBgm(st.key); pc++; }
      else if (st.t === 'text') { await talk('', st.text); pc++; }
      else if (st.t === 'title') { await chapter(st.text); pc++; }
      else if (st.t === 'say') { await say(st.who, st.text); pc++; }
      else if (st.t === 'choice') {
        const i = await talk(st.who ? nameOf(st.who) : '', st.text, st.options.map((o) => o.label));
        const o = st.options[i];
        for (const [k, v] of Object.entries(o?.set ?? {})) b.vars[k] = v;
        to(o?.goto);
      } else if (st.t === 'goto') to(st.label);
      else if (st.t === 'if') to(testFlag(flags(), st.flag, st.is, st.cmp) ? st.goto : undefined);
      else if (st.t === 'set') { b.vars[st.flag] = st.value; pc++; }
      else if (st.t === 'gold') { story.gold += st.n; pc++; }
      else if (st.t === 'join') { API.join?.(story, st.id); pc++; }
      else if (st.t === 'away') { API.away?.(story, st.id); pc++; }
      else if (st.t === 'level') { API.level?.(story, st.id, st.n); pc++; }
      else if (st.t === 'item') { API.item?.(story, st.id); pc++; }
      else if (st.t === 'class') { API.cls?.(story, st.id, st.cls); pc++; }
      else if (st.t === 'duel') { await playDuel(st.a, st.b, st.acts); pc++; }
      else pc++; // bg / hide：这一幕没有场上人物，不用处理
    }
  } finally {
    el.hidden = true;
    el.className = '';
    el.innerHTML = '';
    $('stage').classList.remove('story');
    syncBattleMusic(); // 战场里插播的一幕演完，回到战斗曲；剧情里的幕不动
  }
}

/** 从某一步起把流程演下去：对话、旁白、选择在这里处理；遇到战斗先出战前说明，全部演完回标题。 */
async function playStory(step: Shown | null) {
  mode = 'busy'; // 剧情期间战场不接受操作
  storyFrame();
  while (step) {
    switch (step.t) {
      case 'say': await say(step.who, step.text); break;
      case 'text': await talk('', step.text); break;
      case 'title': await chapter(step.text); break;
      case 'choice': {
        const i = await talk(step.who ? nameOf(step.who) : '', step.text, step.options.map((o) => o.label));
        storyFrame();
        step = nextStep(CAMPAIGN, story, i, API);
        continue;
      }
      case 'duel': await playDuel(step.a, step.b, step.acts); break;
      case 'camp': await camp(step); storyFrame(); step = nextStep(CAMPAIGN, story, 0, API); continue;
      case 'ending': return showEnding(step.text);
      case 'battle': hideStoryFrame(); return showBrief(step.level);
    }
    storyFrame();
    step = nextStep(CAMPAIGN, story, 0, API);
  }
  hideStoryFrame();
  mode = 'over';
  showEnding('');
}

/** 战斗打完，把结果带回流程：胜了记下成长、军资和战斗里的事件，再接着往下演。 */
function afterBattle() {
  const won = b.stage === 'won';
  if (won) {
    Object.assign(story.roster, harvest(b));
    story.gold += b.gold;
  }
  for (const [k, v] of Object.entries(b.vars)) if (!k.startsWith('__')) story.flags[k] = v as Flag;
  story.flags[`${b.level}.${won ? 'won' : 'lost'}`] = true;
  story.deploy = [];
  void playStory(nextStep(CAMPAIGN, story, won ? 0 : 1, API));
}

// ---------------------------------------------------------------- 营地 ----
/** 商店价格来自原版道具表（items.json），不卖的道具按 100 金兜底。 */
const SEED = () => Number(params.get('seed')) || Date.now();

/** 出兵准备：编成、买道具、给武将配道具。出发时把名单记进流程。 */
function camp(step: Extract<Shown, { t: 'camp' }>) {
  const lv = lvOf(step.battle);
  if (!lv) throw new Error(`营地指向的关卡 ${step.battle} 没有数据`);
  const party = story.party.filter((id) => officers[id]);
  if (!story.deploy.length) story.deploy = defaultDeploy(step.battle, party);
  const required = lv.deploy?.required ?? [];
  const forbidden = lv.deploy?.forbidden ?? [];
  const max = lv.deploy?.max ?? party.length;
  let pick = party[0] ?? '';
  const rosterOf = (id: string) => (story.roster[id] ??= blank(id));
  const clsOf = (id: string) => rosterOf(id).cls ?? officers[id].cls;
  const el = $('screen');
  const rows = () => party.map((id) => {
    const o = officers[id];
    const out = story.deploy.includes(id);
    const locked = required.includes(id);
    return `<div class="row${pick === id ? ' on' : ''}"><button class="btn name" data-pick="${id}">` +
      `<b>${esc(o.name)}</b><span>Lv${story.roster[id]?.level ?? o.level}　${TB.classNames[clsOf(id)]}</span>` +
      `<i>${out ? '出陣' : '待命'}${locked ? '（必須）' : ''}</i></button>` +
      `<button class="btn tog" data-toggle="${id}"${locked || forbidden.includes(id) ? ' disabled' : ''}>${out ? '待命' : '出陣'}</button></div>`;
  }).join('');
  const bag = () => {
    const counts = new Map<number, number>();
    for (const id of story.bag) counts.set(id, (counts.get(id) ?? 0) + 1);
    if (!counts.size) return '<p class="note">包袱里沒有道具。</p>';
    return [...counts].map(([id, n]) => `<button class="btn item" data-bag="${id}" title="${esc(itemEffect(id))}">${esc(itemName(id))}×${n}</button>`).join('');
  };
  /** 选中武将随身带的道具：点名字放回包袱；能转职的道具旁边多一个按钮。 */
  const carried = () => {
    const items = rosterOf(pick).items;
    if (!items.length) return '<span class="note">空手</span>';
    const cls = clsOf(pick);
    const level = rosterOf(pick).level;
    return items.map((id, i) => {
      const to = classUse(cls, level, id);
      const p = PROMOTE[String(cls)];
      const need = p && p.item === id ? p.level : 0;
      const up = to !== null
        ? `<button class="btn up" data-up="${i}">轉${esc(TB.classNames[to])}</button>`
        : need > level ? `<span class="need">Lv${need}</span>` : '';
      return `<span class="held" title="${esc(itemEffect(id))}"><button class="btn item" data-drop="${i}">${esc(itemName(id))}</button>${up}</span>`;
    }).join('');
  };
  /** 武將情報：能力、兵种、随身道具与已学会的策略。 */
  const info = () => {
    const o = officers[pick];
    if (!o) return '';
    const r = rosterOf(pick);
    const cls = clsOf(pick);
    const equips = r.items.filter(isEquipment).map(itemName);
    const strs = knownStrategies({ cls, level: r.level });
    return `<h2>情報・${esc(o.name)}</h2><div class="info"><div><span>武力</span>${o.str}</div>` +
      `<div><span>統御</span>${o.lead}</div><div><span>智力</span>${o.int}</div>` +
      `<div><span>等級</span>${r.level}</div><div><span>兵種</span>${esc(TB.classNames[cls])}</div>` +
      `<div><span>經驗</span>${r.exp}/100</div><div><span>兵力</span>${maxHp(cls, r.level)}</div>` +
      `<div><span>策略</span><i title="${esc(strs.map(strategyName).join('、'))}">${strs.length} 條</i></div>` +
      `<div><span>裝備</span>${equips.length ? esc(equips.join('、')) : '—'}</div></div>`;
  };
  const shop = step.shop.map((id) => `<div class="buy"><span>${esc(itemName(id))}<em>${esc(itemEffect(id))}</em></span>` +
    `<button class="btn" data-buy="${id}"${story.gold < (priceOf(id) ?? 100) ? ' disabled' : ''}>${priceOf(id) ?? 100} 金</button></div>`).join('');
  const render = () => {
    // 重画时留住滚动位置：营地比一屏高，买完东西跳回顶部会让人找不着刚才那一行
    const top = el.scrollTop;
    el.className = '';
    el.innerHTML = `<div class="card camp"><h1 style="font-size:24px;line-height:30px">${esc(step.title)}</h1>` +
      `<p class="sub">軍資 ${story.gold} 金　出征 ${story.deploy.length}/${max} 名</p>` +
      `<div class="camp-cols"><section><h2>編成</h2>${rows()}</section>` +
      `<section><h2>道具・${esc(officers[pick]?.name ?? '')}</h2><div class="items">${carried()}</div><h2>包袱</h2><div class="items">${bag()}</div>` +
      `${info()}<h2>商店</h2>${shop}</section></div>` +
      `<div class="row end"><button class="btn" data-go="camp-save">存檔</button>` +
      `<button class="btn" data-go="camp-go"${story.deploy.length ? '' : ' disabled'}>出陣</button></div>`;
    el.hidden = false;
    el.scrollTop = top;
    // 焦点给出陣，但不让它把卡片滚到底
    (el.querySelector('[data-go="camp-go"]') as HTMLElement | null)?.focus({ preventScroll: true });
  };
  render();
  return new Promise<void>((done) => {
    el.onclick = (e) => {
      const t = e.target as HTMLElement;
      const pickId = t.closest<HTMLElement>('[data-pick]')?.dataset.pick;
      const toggle = t.closest<HTMLElement>('[data-toggle]')?.dataset.toggle;
      const buy = t.closest<HTMLElement>('[data-buy]')?.dataset.buy;
      const bagId = t.closest<HTMLElement>('[data-bag]')?.dataset.bag;
      const drop = t.closest<HTMLElement>('[data-drop]')?.dataset.drop;
      const up = t.closest<HTMLElement>('[data-up]')?.dataset.up;
      const go = t.closest<HTMLElement>('[data-go]')?.dataset.go;
      if (pickId) pick = pickId;
      if (toggle) {
        const out = story.deploy.includes(toggle);
        if (out && !required.includes(toggle)) story.deploy = story.deploy.filter((x) => x !== toggle);
        else if (!out && story.deploy.length < max) story.deploy.push(toggle);
      }
      if (buy) {
        const id = Number(buy);
        const price = priceOf(id) ?? 100;
        if (story.gold >= price) {
          story.gold -= price;
          story.bag.push(id);
        }
      }
      if (bagId) {
        const id = Number(bagId);
        const cur = rosterOf(pick);
        if (cur.items.length < 8) {
          cur.items.push(id);
          story.bag.splice(story.bag.indexOf(id), 1);
        }
      }
      if (drop !== undefined) {
        const cur = rosterOf(pick);
        if (cur.items[Number(drop)] !== undefined) story.bag.push(cur.items.splice(Number(drop), 1)[0]);
      }
      if (up !== undefined) {
        const cur = rosterOf(pick);
        const id = cur.items[Number(up)];
        const to = id === undefined ? null : classUse(clsOf(pick), cur.level, id);
        if (to !== null) {
          cur.cls = to;
          cur.items.splice(Number(up), 1);
          log(`${officers[pick].name} 轉職為${TB.classNames[to]}。`);
        }
      }
      if (go === 'camp-go') {
        el.onclick = null;
        el.hidden = true;
        return done();
      }
      if (go === 'camp-save') saveCamp();
      render();
    };
  });
}

// ---------------------------------------------------------------- 指令菜单 ----
interface Item { label: string; on?: () => void }
function openMenu(items: Item[], u: Unit, wide = false) {
  const el = $('menu');
  el.className = wide ? 'list' : '';
  el.replaceChildren(...items.map((it) => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.role = 'menuitem';
    btn.textContent = it.label;
    btn.disabled = !it.on;
    if (it.on) btn.onclick = it.on;
    return btn;
  }));
  el.hidden = false;
  const cam = scene.cameras.main;
  const w = wide ? 132 : 76;
  const cell = CELL / RES; // 菜单按舞台单位摆，贴在部队右侧，放不下就放左侧
  const left = (u.x * CELL - cam.scrollX) / RES + cell + 2;
  el.style.left = `${left + w > VIEW_W ? left - cell - w - 4 : left}px`;
  el.style.top = `${Math.max(0, Math.min(VIEW_H - el.offsetHeight, (u.y * CELL - cam.scrollY) / RES))}px`;
  (el.querySelector('button:not(:disabled)') as HTMLElement | null)?.focus();
}
const closeMenu = () => ($('menu').hidden = true);
$('menu').addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  const btns = [...$('menu').querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
  btns[(btns.indexOf(document.activeElement as HTMLButtonElement) + (e.key === 'ArrowDown' ? 1 : btns.length - 1)) % btns.length]?.focus();
  e.preventDefault();
  e.stopPropagation();
});

const cellsOf = (us: Unit[]) => us.map((u) => [u.x, u.y] as [number, number]);
function reachCells(u: Unit): [number, number][] {
  const f = reachField(b, u);
  const out: [number, number][] = [];
  for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) if (canStop(b, u, f, x, y)) out.push([x, y]);
  return out;
}

function deselect() {
  sel = null;
  pick = null;
  mode = 'idle';
  closeMenu();
  scene.unmark();
  renderTurn();
}
function select(u: Unit) {
  playSfx('cursor', 0.6);
  sel = u;
  pick = null;
  mode = 'unit';
  closeMenu();
  scene.mark(u.moved ? [[u.x, u.y]] : reachCells(u), 'move');
  renderUnit(u);
  renderTurn();
}

/** 指令菜单：攻击 / 策略 / 道具 / 待命。只在菜单里列出现在真能用的东西，
 * 目标离开了范围或策略值不够的条目就不占地方（武将栏里仍能看到已学会的全部策略）。 */
function openCommand() {
  const u = sel!;
  mode = 'menu';
  pick = null;
  scene.unmark();
  renderTurn();
  const foes = attackTargets(b, u);
  const casts = knownStrategies(u).flatMap((id) => {
    const ts = castTargets(b, u, id);
    if (!ts.length) return [];
    const spec = strategySpec(id);
    // 群体策略不用选目标，直接对周围友军施放
    const run = spec?.area === 'all_in_range'
      ? () => act(doCastAll(b, u.slot, id))
      : () => aim(ts, spec?.target === 'ally' ? 'aid' : 'attack', (t) => doCast(b, u.slot, id, t.slot));
    return [{ label: `${strategyName(id)}　${spec?.mp ?? 0}`, on: run }];
  });
  const bag = u.items.map((id) => {
    const st = strategySpec(specOf(id)?.strategyId ?? -1);
    return { label: st ? `${itemName(id)}・${st.name}` : itemName(id), on: () => openItemMenu(u, id) };
  });
  openMenu([
    { label: '攻击', on: foes.length ? () => aim(foes, 'attack', (t) => doAttack(b, u.slot, t.slot)) : undefined },
    { label: '策略', on: casts.length ? () => openMenu(casts, u, true) : undefined },
    { label: '道具', on: bag.length ? () => openMenu(bag, u, true) : undefined },
    { label: '待命', on: () => act(doWait(b, u.slot)) },
  ], u);
}

/** 一件道具的子菜单：使用 / 给予 / 丢弃。原版的道具指令也是这三项（让渡即给予）。
 * 装备类道具不能「使用」，但可以交给身边的友军或扔掉。 */
function openItemMenu(u: Unit, id: number) {
  const it = specOf(id);
  const ts = itemTargets(b, u, id);
  const st = it?.strategyId != null ? strategySpec(it.strategyId) : undefined;
  const use = !it?.battle || !ts.length ? undefined
    : st?.area === 'all_in_range' ? () => act(doItemAll(b, u.slot, id))
    : () => aim(ts, st?.target === 'ally' ? 'aid' : 'attack', (t) => doItem(b, u.slot, id, t.slot));
  const mates = giveTargets(b, u, id);
  openMenu([
    { label: '使用', on: use },
    { label: '给予', on: mates.length ? () => aim(mates, 'aid', (t) => doGive(b, u.slot, id, t.slot), '选择给予对象。') : undefined },
    { label: '丢弃', on: () => act(doDrop(b, u.slot, id)) },
  ], u);
}
function aim(targets: Unit[], kind: 'attack' | 'aid', run: (t: Unit) => Ev[], hint?: string) {
  mode = 'target';
  pick = { targets, run };
  closeMenu();
  scene.mark(cellsOf(targets), kind);
  log(hint ?? (kind === 'aid' ? '选择使用对象。' : '选择目标。'));
}

async function act(evs: Ev[]) {
  mode = 'busy';
  sel = null;
  pick = null;
  closeMenu();
  scene.unmark();
  renderTurn();
  await present(evs);
  await settle();
}

/** 一次行动结束后：判胜败；我军全部行动完就询问是否结束回合。 */
async function settle() {
  if (b.stage === 'won' || b.stage === 'lost') return showResult();
  mode = 'idle';
  renderTurn();
  if (b.stage === 'player' && !b.units.some((u) => canCommand(b, u))) {
    mode = 'busy';
    const yes = await confirmBox('全部队行动完毕。结束本回合吗？');
    mode = 'idle';
    if (yes) return endTurn(true);
    renderTurn();
  }
}

async function endTurn(confirmed = false) {
  if (mode !== 'idle' || b.stage !== 'player') return;
  mode = 'busy';
  if (!confirmed && b.units.some((u) => canCommand(b, u)) && !(await confirmBox('还有部队没有行动。结束本回合吗？'))) {
    mode = 'idle';
    return;
  }
  renderTurn();
  await present(endPhase(b));
  while (autoPhase(b)) await present(aiStep(b));
  await settle();
}

function cancel() {
  if (answer) return void (onEsc >= 0 && answer(onEsc));
  if (mode !== 'over') playSfx('cancel', 0.6);
  if (mode === 'target') return openCommand();
  if (mode === 'menu') {
    const u = sel!;
    closeMenu();
    if (undoMove(b)) scene.sync();
    return canCommand(b, u) ? select(u) : deselect();
  }
  if (mode === 'unit' || mode === 'idle') deselect();
}

async function onCell(x: number, y: number) {
  if (answer || mode === 'busy' || mode === 'over' || mode === 'menu') return;
  const t = unitAt(b, x, y);
  if (mode === 'target' && pick) {
    if (t && pick.targets.includes(t)) await act(pick.run(t));
    return;
  }
  if (mode === 'unit' && sel) {
    if (t === sel) return openCommand();
    if (!t && !sel.moved && canStop(b, sel, reachField(b, sel), x, y)) {
      mode = 'busy';
      scene.unmark();
      await present(doMove(b, sel.slot, x, y));
      return openCommand();
    }
  }
  if (!t) return deselect();
  if (canCommand(b, t)) return select(t);
  // 不能下令的部队（敌军、友军、已行动）：只查看状态和移动范围
  playSfx('cursor', 0.5);
  deselect();
  scene.mark(reachCells(t), 'move');
  renderUnit(t);
}

// ---------------------------------------------------------------- 存档 ----
function saveCamp() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ story }));
    log('已存档。');
  } catch {
    log('存档失败：浏览器不允许写入本地存储。');
  }
}
function save() {
  if (mode !== 'idle' || b.stage !== 'player' || b.undo) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ story, battle: b }));
    log('已存档。');
  } catch {
    log('存档失败：浏览器不允许写入本地存储。');
  }
}
interface SaveData { story: Story; battle?: Battle }
function readSave(): SaveData | null {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null') as SaveData | null;
    const st = d?.story;
    if (!st || st.script !== CAMPAIGN.id || !Array.isArray(st.party)) return null;
    const bt = d.battle;
    if (!bt) return d;
    const step = CAMPAIGN.steps[st.pc];
    const ok = step?.t === 'battle' && step.level === bt.level && lvOf(bt.level) &&
      Array.isArray(bt.units) && Array.isArray(bt.terrain) && bt.terrain.length === bt.w * bt.h &&
      typeof bt.rng === 'number' && bt.stage === 'player' && !!bt.vars;
    return ok ? d : null;
  } catch {
    return null;
  }
}
function load() {
  const d = readSave();
  if (!d) return log('没有可用的存档。'), false;
  story = d.story;
  if (d.battle) {
    begin(d.battle);
    log('已读档。');
  } else {
    $('screen').hidden = true;
    void playStory(currentStep(CAMPAIGN, story));
  }
  return true;
}

// ---------------------------------------------------------------- 整屏 ----
function screen(html: string, veil = false, cls = '') {
  const el = $('screen');
  el.className = veil ? 'veil' : 'scroll';
  el.style.backgroundImage = '';
  el.innerHTML = `<div class="card${cls ? ` ${cls}` : ''}">${html}</div>`;
  el.hidden = false;
  (el.querySelector('button') as HTMLElement | null)?.focus();
}
$('screen').addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('button');
  const go = btn?.dataset.go;
  if (!btn) playSfx('cursor', 0.55); // 章节横幅：点一下继续
  if (go === 'start') {
    story = startStory(CAMPAIGN, { party: [...START_PARTY] });
    // 开局一分钱没有：原版序章里曹操当场拨 500 金（剧本的 @gold 500），
    // 那笔钱正好赶在第一次进道具屋之前，所以这里不再另给。
    void playStory(nextStep(CAMPAIGN, story, 0, API));
  }
  if (go === 'new') ($('screen').hidden = true), begin(null);
  if (go === 'deploy') {
    const step = currentStep(CAMPAIGN, story) as Extract<Shown, { t: 'battle' }> | null;
    if (step) showDeploy(step.level);
  }
  if (go === 'next') afterBattle();
  if (go === 'load') ($('screen').hidden = !!readSave()), load() || showTitle('没有可用的存档。');
  if (go === 'title') showTitle();
});

function showTitle(note = '') {
  mode = 'over';
  bgmKey = '';
  playBgm(TITLE_BGM, true);
  screen(
    '<div class="seal">非官方<br>復刻</div><h1>三國志英傑傳</h1>' +
    '<p class="sub">PC DOS 繁體中文版 全流程復刻</p>' +
    '<p class="credit">畫面、劇本、地圖、兵種、頭像與音樂均取自原版《三國志英傑傳》DOS 版，逐像素還原。詳見 docs/assets.md。</p>' +
    `<div class="row"><button class="btn" data-go="start">開始新遊戲</button><button class="btn" data-go="load"${readSave() ? '' : ' disabled'}>讀取存檔</button></div>` +
    (note ? `<p class="sub" style="margin:10px 0 0">${esc(note)}</p>` : ''));
}
/** 战前说明：列出这一关的胜利条件、失败条件与出征名单。 */
function showBrief(levelId: string) {
  mode = 'over';
  const lv = lvOf(levelId)!;
  const deploy = story.deploy.length ? story.deploy : defaultDeploy(levelId, story.party);
  const who = deploy.map((id) => officers[id]?.name ?? id).join('、') || '—';
  const lose = '主將撤退，或超過回合上限';
  // 敌情：开战就在场的敌军有几队、主将是谁（增援组不算在里面）
  const foes = lv.units.filter((u) => u.slot >= 15 && !u.off);
  const boss = foes.find((u) => u.commander);
  const intel = `敵軍 ${foes.length} 隊${boss ? `・主將 ${boss.name}` : ''}　回合上限 ${lv.turnLimit}`;
  screen(
    `<h1 style="font-size:24px;line-height:28px">${esc(lv.name)}</h1>` +
    `<ul><li>勝利：${esc(lv.goal || '擊破敵軍主將')}</li><li>失敗：${esc(lose)}</li><li>出征：${esc(who)}</li>` +
    `<li>敵情：${esc(intel)}</li></ul>` +
    '<p class="sub" style="margin:0">左键选择部队、移动、下令；右键或 Esc 取消；方向键卷动地图；回车结束回合。</p>' +
    '<div class="row"><button class="btn" data-go="deploy">部隊配置</button></div>');
}

/** 布阵：把出征的各部队亲手摆进出兵位（原版的「部隊配置」），摆完才开战。
 * 地图比舞台大（最大 40×24 格），这里取一块装得下所有出兵位的视野，按整格显示。 */
function showDeploy(levelId: string) {
  mode = 'over';
  const lv = lvOf(levelId)!;
  const order = [...(story.deploy.length ? story.deploy : defaultDeploy(levelId, story.party))];
  const slots = lv.deploy?.slots ?? [];
  const placed: Record<string, [number, number]> = {};
  const el = $('screen');
  const at = (x: number, y: number) => Object.keys(placed).find((k) => placed[k][0] === x && placed[k][1] === y);
  const next = () => order.find((k) => !placed[k]);
  const UNIT = CELL / RES; // 一格 32px
  const xs = slots.length ? slots.map(([x]) => x) : [Math.floor(lv.w / 2)];
  const ys = slots.length ? slots.map(([, y]) => y) : [Math.floor(lv.h / 2)];
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
  const [minY, maxY] = [Math.min(...ys), Math.max(...ys)];
  // 视野：至少 13×12 格；出兵位铺得更开就取到装得下为止
  const vw = Math.min(lv.w, Math.max(13, maxX - minX + 1));
  const vh = Math.min(lv.h, Math.max(12, maxY - minY + 1));
  const x0 = Math.max(0, Math.min(lv.w - vw, Math.round((minX + maxX + 1) / 2 - vw / 2)));
  const y0 = Math.max(0, Math.min(lv.h - vh, Math.round((minY + maxY + 1) / 2 - vh / 2)));
  const s = Math.min(416 / (vw * UNIT), 384 / (vh * UNIT));
  const size = UNIT * s;
  const [bgx, bgy] = [208 - (x0 + vw / 2) * size, 192 - (y0 + vh / 2) * size];
  const px = (x: number) => Number((x * size + bgx).toFixed(2));
  const py = (y: number) => Number((y * size + bgy).toFixed(2));
  const render = () => {
    el.className = '';
    const marks = slots.map(([x, y]) => {
      const who = at(x, y);
      return `<button class="cell${who ? ' on' : ''}" data-cell="${x},${y}" style="left:${px(x)}px;top:${py(y)}px;width:${size}px;height:${size}px">` +
        `${who ? `<b>${esc(officers[who]?.name ?? who)}</b>` : ''}</button>`;
    }).join('');
    const left = next();
    el.innerHTML = `<div class="card deploy"><h1 style="font-size:18px;line-height:22px">${esc(lv.name)}・部隊配置</h1>` +
      `<p class="sub">${left ? `點藍色格擺放「${esc(officers[left]?.name ?? left)}」，點已擺好的部隊收回。` : '全軍配置完畢。'}　${Object.keys(placed).length}/${order.length}</p>` +
      `<div class="deploy-body"><div class="grid" style="background-image:url(/assets/${lv.map});background-size:${lv.w * size}px ${lv.h * size}px;background-position:${bgx}px ${bgy}px">${marks}</div>` +
      `<div class="queue">${order.map((id) => `<div class="row${placed[id] ? ' on' : ''}"><span>${esc(officers[id]?.name ?? id)}</span>` +
        `<i>${placed[id] ? `${placed[id][0]},${placed[id][1]}` : '未配置'}</i></div>`).join('')}</div></div>` +
      `<div class="row end"><button class="btn" data-go="auto">自動配置</button>` +
      `<button class="btn" data-go="battle"${Object.keys(placed).length === order.length ? '' : ' disabled'}>開始</button></div>`;
    el.hidden = false;
    (el.querySelector('[data-go="battle"]') as HTMLElement | null)?.focus();
  };
  render();
  el.onclick = (e) => {
    const t = e.target as HTMLElement;
    const cell = t.closest<HTMLElement>('[data-cell]')?.dataset.cell;
    const go = t.closest<HTMLElement>('[data-go]')?.dataset.go;
    if (cell) {
      const [x, y] = cell.split(',').map(Number);
      const who = at(x, y);
      if (who) delete placed[who];
      else {
        const k = next();
        if (k) placed[k] = [x, y];
      }
    }
    if (go === 'auto') {
      for (const k of Object.keys(placed)) delete placed[k];
      order.forEach((k, i) => { const s = slots[i]; if (s) placed[k] = s; });
    }
    if (go === 'battle') {
      el.onclick = null;
      el.hidden = true;
      return begin(null, placed);
    }
    render();
  };
}
/**
 * 开战前各武将的等级：成长只在战后（`afterBattle`）写回 `story.roster`，
 * 所以战斗进行中读到的 roster 就是开战时的等级——读档接手的战斗也算得对。
 */
const levelBeforeBattle = () => Object.fromEntries(
  Object.entries(officers).map(([id, o]) => [id, story.roster[id]?.level ?? o.level]),
);

/**
 * 战斗结果：原版的「戰鬥結果」只报三样——军资、各部队的经验与升级、打了多少回合。
 * 数值全部从战场状态与关卡数据算（`src/result.ts`），版面是网页版自己的深蓝面板。
 */
function showResult() {
  mode = 'over';
  renderTurn();
  const lv = levelOf(b);
  const t = tally(b, { reward: lv.reward, turnLimit: lv.turnLimit, before: levelBeforeBattle() });
  const music = resultBgm(t.won);
  if (music) playBgm(music, true); // 败北曲立刻压上；胜利保持战斗曲，剧本接手
  const step = currentStep(CAMPAIGN, story) as Extract<Shown, { t: 'battle' }> | null;
  const rows = t.rows.map((r) =>
    `<tr${r.on ? '' : ' class="off"'}><td>${esc(r.name)}${r.up ? `<i class="up">Lv+${r.up}</i>` : ''}</td>` +
    `<td>${esc(r.className)}</td><td>${r.level}</td><td>${r.exp}<span>/100</span></td>` +
    `<td>${r.on ? `${r.hp}<span>/${r.maxHp}</span>` : '撤退'}</td></tr>`).join('');
  const money = t.won
    ? `<div class="tally"><span>所得軍資</span><b>${t.gold}</b>金` +
      `<em>賞金 ${t.reward} ＋ 拾得 ${t.found}</em></div>`
    : `<div class="tally"><span>軍資</span><b>${story.gold}</b>金<em>敗北不計賞金與拾得</em></div>`;
  const tail = t.won
    ? `歷時 ${t.rounds} 回合<em>軍資 ${story.gold} → ${story.gold + t.gold}</em>`
    : `歷時 ${t.rounds} 回合<em>上限 ${lv.turnLimit} 回合</em>`;
  screen(
    `<h1 class="${t.won ? '' : 'lost'}">${t.won ? '勝利' : '敗北'}</h1><p class="sub">${esc(b.reason)}</p>` +
    money +
    `<table class="squad"><tr><th>武將</th><th>兵種</th><th>等級</th><th>經驗</th><th>兵力</th></tr>${rows}</table>` +
    `<p class="rounds">${tail}</p>` +
    `<div class="row"><button class="btn" data-go="next">${t.won || step?.lose !== undefined ? '續' : '重新開始'}</button>` +
    (t.won ? '' : '<button class="btn" data-go="title">回標題</button>') + '</div>', true, 'result');
}
function showEnding(text: string) {
  mode = 'over';
  hideStoryFrame();
  playBgm('ending');
  screen(
    `<h1>${esc(TITLE)} 完</h1><p class="sub">${esc(text || '全劇終。')}</p>` +
    `<p>歷時 ${story.gold} 金軍資，${story.party.length} 名武將。</p>` +
    '<div class="row"><button class="btn" data-go="title">回到標題</button></div>');
}

/** 开始一场战斗：d 为读档数据；null 表示新开流程当前停着的那一关，带上此前的成长与布阵。 */
function begin(d: Battle | null, slots?: Record<string, [number, number]>) {
  $('log').replaceChildren();
  let evs: Ev[] = [];
  const step = currentStep(CAMPAIGN, story) as Extract<Shown, { t: 'battle' }> | null;
  if (d) b = d;
  else {
    if (!step) throw new Error('流程没有停在战斗上');
    const lv = lvOf(step.level)!;
    const deploy = story.deploy.length ? story.deploy : defaultDeploy(step.level, story.party);
    ({ b, evs } = newBattle(lv, SEED(), story.roster, { deploy, flags: story.flags, slots }));
  }
  const lv = levelOf(b);
  shown = sel = pick = null;
  mode = 'busy';
  playBgm(battleBgm(lv, b.stage), true); // 开战：原版的战斗曲
  renderUnit(null);
  renderTile(0, 0);
  const lord = bySlot(b, lv.lord ?? -1) ?? b.units.find((u) => u.mode === 7) ?? b.units[0];
  void scene.setBattle(b).then(() => (void scene.focus(lord.x, lord.y, true), present(evs))).then(() => {
    mode = 'idle';
    renderTurn();
    if (!d) log(`目标：${b.objective}`);
  });
}

// ---------------------------------------------------------------- 启动 ----
let sfxBtn: HTMLButtonElement | null = null;
const syncSfxButton = () => { if (sfxBtn) sfxBtn.textContent = sfxEnabled() ? '音效 開' : '音效 關'; };
const sysButtons: [string, string, () => void][] = [
  ['回合结束', '', () => void endTurn()],
  [sfxEnabled() ? '音效 開' : '音效 關', '', () => { toggleSfx(); syncSfxButton(); playSfx('confirm', 0.75); }],
  ['胜利条件', '', () => void talk('', `胜利：${b.objective}。失败：主将撤退，或 ${levelOf(b).turnLimit} 回合内未能取胜。`)],
  ['全军撤退', '', async () => {
    if (mode !== 'idle') return;
    mode = 'busy';
    if (await confirmBox('全军撤退，放弃这一战吗？')) return (b.stage = 'lost'), (b.reason = '全军撤退'), showResult();
    mode = 'idle';
  }],
  ['存档', '', save],
  ['读档', '', () => mode === 'idle' && load()],
];
$('sys').replaceChildren(...sysButtons.map(([label, cls, on]) => {
  const btn = document.createElement('button');
  btn.className = `btn ${cls}`;
  btn.textContent = label;
  btn.onclick = on;
  if (label.startsWith('音效')) (btn.dataset.sfx = '1'), (sfxBtn = btn);
  return btn;
}));

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cancel();
  else if ((e.key === 'Enter' || e.key === ' ') && answer && !$('talk').querySelector('.ask')) answer(0); // 键盘翻对话
  else if (e.key === 'Enter' && !answer && mode === 'idle' && !(document.activeElement instanceof HTMLButtonElement)) void endTurn();
});

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'map',
  width: VIEW_W * RES,
  height: VIEW_H * RES,
  scale: { zoom: 1 / RES }, // 画布按 3 倍分辨率画，显示成舞台里的 416×384
  backgroundColor: '#0c1430',
  banner: false,
  scene: BattleScene,
});

/** 舞台等比放大到撑满窗口并居中；缩放后让 Phaser 重新量画布，输入坐标才对得上。 */
function fit() {
  const s = Math.min(innerWidth / 640, innerHeight / 480);
  const st = $('stage').style;
  st.transform = `scale(${s})`;
  st.left = `${(innerWidth - 640 * s) / 2}px`;
  st.top = `${(innerHeight - 480 * s) / 2}px`;
  game.scale.refresh();
}
addEventListener('resize', fit);

game.events.once('ready', () => {
  scene = game.scene.getScene('battle') as BattleScene;
  const start = () => {
    scene.onCell = (x, y) => void onCell(x, y);
    scene.onCancel = cancel;
    scene.onHover = (x, y) => (renderTile(x, y), renderUnit(unitAt(b, x, y) ?? sel ?? shown));
    scene.speed = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1;
    if (import.meta.env.DEV) {
      // 仅开发模式：供调试与自动化测试读取状态
      if (params.has('fast')) (scene.speed = 0), (autoTalk = true);
      Object.assign(window, { __yjz: { get b() { return b; }, get story() { return story; }, get mode() { return mode; }, get bgm() { return bgmKey; }, get bgmSrc() { return audio.src; }, bgmLog: () => [...bgmLog], banners: () => [...banners], scene, level: lvOf, sfx: sfxLog, sfxEnabled, duel: playDuel, banner } });
    }
    if (demo) {
      // 演示流程的特写演员是现画的一张图集，直接放进贴图缓存，清单里按键引用
      const t = scene.textures.createCanvas(`actor:${DEMO_ACTOR.sheet}`, 6 * DEMO_ACTOR.frameWidth, DEMO_ACTOR.frameHeight)!;
      drawDemoActor(t.getContext());
      for (let i = 0; i < 6; i++) t.add(i, 0, i * DEMO_ACTOR.frameWidth, 0, DEMO_ACTOR.frameWidth, DEMO_ACTOR.frameHeight);
      t.refresh();
      scene.manifest = { cutin: { actors: { '*': DEMO_ACTOR } } };
    }
    // 开局先找到第一场战斗，把它的地图摆在标题画面背后
    const first = CAMPAIGN.steps.find((s) => s.t === 'battle') as Extract<Step, { t: 'battle' }>;
    const lv = lvOf(first.level)!;
    b = newBattle(lv, 1).b;
    void scene.setBattle(b);
    renderUnit(null);
    fit();
    void document.fonts.load('12px Pixel').then(() => showTitle());
  };
  scene.sys.settings.status >= Phaser.Scenes.RUNNING ? start() : scene.events.once('ready', start);
});
