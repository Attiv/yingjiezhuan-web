import * as Phaser from 'phaser';
import './style.css';
import './pwa';
import { playSfx, preloadSfx, sfxDiagnostics, sfxEnabled, sfxLog, toggleSfx, unlockSfx } from './audio';
import { sfxOf } from './sfx-map';
import { DEMO, DEMO_ACTOR, DEMO_LEVELS, drawDemoActor } from './data/demo';
import { SCRIPT, TITLE, battleGuide, defaultDeploy, faceOf, hasLevel, itemId, level, nameOf, officers, scene as gameScene } from './data/game';
import { ITEM_SPEC, PROMOTE, classUse, isEquipment, itemEffect, priceOf, specOf } from './data/items';
import { chapterTitle, marchMap } from './data/march';
import { strategyName, strategySpec } from './data/strategies';
import { DUEL_BGM, TITLE_BGM, battleBgm, isFighting, resultBgm } from './music';
import { tally } from './result';
import { StageScript, isSceneMap, mapPoint, fieldPoint, moveDirection, mapSrc, stageOf, registerStoryStage, actorFrame, type StageOp, type Crowd, type StageSnapshot } from './stage';
import { TRAINER_PASSWORD, clampExp, clampGold, clampLevel, equipBest, giveItem, maxStats, recruitOfficer, syncUnit } from './trainer';
import { TB, atk, attackTargets, bySlot, def, friendly, itemName, knownStrategies, maxHp, maxMp, moveBudget, rangeCells, terrainAt, terrainDef, unitAt, weatherName } from './rules/core';
import { canStop, reachField } from './rules/move';
import { aiStep, autoPhase, canCommand, castTargets, doAttack, doCast, doCastAll, doDrop, doGive, doItem, doItemAll, doMove, doWait, endPhase, giveTargets, harvest, itemTargets, levelById, levelOf, newBattle, registerLevel, undoMove } from './rules/turn';
import type { Battle, Ev, Flag, Unit } from './rules/types';
import { BattleScene, CELL, RES, VIEW_H, VIEW_W, sideOf } from './scene';
import { checkScript, currentStep, nextStep, restoreStoryPosition, startStory, testFlag, type Shown, type Story, type StoryApi, type Step } from './story';
import { initScript, scriptLabel, toggleScript } from './zh';
import { compileStory } from './story-source';
import { makeSaveArchive, parseSaveArchive } from './save-archive';
import { decryptSaveText, encryptSaveText, EncryptedSaveStorage, isEncryptedSaveText } from './save-crypto';


const SAVE_KEY = 'yjz.save.v3'; // 流程进度 + 战斗状态
const CAMERA_FOLLOW_KEY = 'yjz.camera-follow';
const readCameraFollow = () => localStorage.getItem(CAMERA_FOLLOW_KEY) !== '0';
let cameraFollow = readCameraFollow();
/** 演出时长倍率：越小走得越快，0 = 省去演出。系统菜单里循环切换并记住选择。 */
const ANIM_SPEED_KEY = 'yjz.anim-speed';
const ANIM_SPEEDS = [
  { v: 0, label: '瞬时' },
  { v: 0.5, label: '很快' },
  { v: 1, label: '标准' },
  { v: 1.6, label: '慢' },
  { v: 2.5, label: '很慢' },
] as const;
const readAnimSpeed = () => {
  const raw = localStorage.getItem(ANIM_SPEED_KEY);
  if (raw === null) return 2; // 没设过就是标准；Number(null) 是 0，别落到「瞬时」档
  const saved = Number(raw);
  const i = ANIM_SPEEDS.findIndex((s) => s.v === saved);
  return i < 0 ? 2 : i;
};
let animSpeedIndex = readAnimSpeed();
/** 仅开发模式：?demo 换成不带任何图的演示流程，用来验证框架本身。 */
const requestedStory = import.meta.env.DEV ? new URLSearchParams(location.search).get('story') : null;
const storyModules = import.meta.glob('/stories/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;
const importedStories = new Map<string, ReturnType<typeof compileStory>>();
const storyImportErrors = new Map<string, string>();
for (const [path, data] of Object.entries(storyModules)) {
  const name = path.replace(/^.*\//, '').replace(/\.json$/, '');
  try {
    const compiled = compileStory(data);
    if (importedStories.has(compiled.script.id)) {
      console.warn(`剧情文件 ${path} 与已载入的剧本同 ID（${compiled.script.id}），本份忽略`);
      continue;
    }
    Object.entries(compiled.stages).forEach(([id, stage]) => registerStoryStage(id, stage));
    importedStories.set(compiled.script.id, compiled);
  } catch (error) {
    // 一份数据写错不该拖垮原战役：记下原因，按 ID 点名时才报出来。
    const message = `剧情文件 ${path} 导入失败：${error instanceof Error ? error.message : String(error)}`;
    storyImportErrors.set(name, message);
    console.warn(message);
  }
}
const selectedStory = requestedStory ? importedStories.get(requestedStory) : undefined;
if (requestedStory && !selectedStory) throw new Error(storyImportErrors.get(requestedStory) ?? `找不到独立剧情：${requestedStory}`);
const demo = import.meta.env.DEV && !selectedStory && new URLSearchParams(location.search).has('demo');
if (demo) DEMO_LEVELS.forEach(registerLevel);
export const CAMPAIGN = checkScript(selectedStory?.script ?? (demo ? DEMO : SCRIPT), selectedStory ? () => false : demo ? (id) => !!levelById(id) : hasLevel);
const lvOf = (id: string) => (demo ? levelById(id) : level(id));

const SIDE = [['player', '我军'], ['ally', '友军'], ['enemy', '敌军']] as const;
/** 原版开局就在队里的三人。其余武将按剧本里的「加入」逐步入队。 */
const START_PARTY = ['liu_bei', 'guan_yu', 'zhang_fei'];
const params = new URLSearchParams(location.search);

const $ = (id: string) => document.getElementById(id)!;
$('stage').addEventListener('dragstart', (e) => e.preventDefault());
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
let aside = false; // 正在点人问话：此时的点击只翻那一句

/** 武将的初始成长：等级取原版数据，其余空白。 */
const blank = (id: string) => ({
  level: officers[id]?.level ?? 1, exp: 0, items: [] as number[],
  lead: officers[id]?.lead ?? 0, str: officers[id]?.str ?? 0, int: officers[id]?.int ?? 0,
});

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

let shownTerrain: number | undefined;
function renderTile(x: number, y: number) {
  const t = terrainAt(b, x, y);
  if (t === shownTerrain) return;
  shownTerrain = t;
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
    // 行走、攻击和单挑由画面在每一步 / 命中时触发，避免音效提前响完。
    if (fx && ev.t !== 'move' && ev.t !== 'hit' && ev.t !== 'duel') playSfx(fx, ev.t === 'recover' ? 0.5 : 1);
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
  const hide = () => { duel.hidden = true; el.hidden = true; };
  try {
    await scene.play(ev, () => {
      const after = before - ev.dmg;
      (el.querySelector('.r .bar i') as HTMLElement).style.width = `${Math.round((100 * after) / maxHp(d.cls, d.level))}%`;
      el.querySelector('.r .n')!.textContent = String(after);
    }, hide);
  } finally { hide(); }
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
  if (aside) return; // 点人问话时，这一下只用来翻那一句
  const btn = (e.target as HTMLElement).closest('button');
  if ($('talk').querySelector('.ask') && !btn) return; // 有选项时必须点按钮
  if (!btn) playSfx('cursor', 0.55); // 翻到下一句
  answer?.(Number(btn?.dataset.i ?? 0));
});
// 整屏点击转给当前对白，捕获阶段拦住后面的场景人物和按钮。
document.addEventListener('click', (e) => {
  const el = $('talk');
  if (!e.isTrusted || el.hidden || el.contains(e.target as Node) || gateOpen || trainerOpen || guideOpen || saveListEl()?.hidden === false) return;
  e.preventDefault();
  e.stopPropagation();
  el.click();
}, true);
const say = (who: string, text: string) => {
  speaking = nameOf(who);
  spotSpeaker();
  return talk(speaking, text, [], faceOf(who) ?? '');
};
const confirmBox = (text: string) => talk('刘备', text, ['是', '否'], faceOf('liu_bei') ?? '', 1).then((i) => i === 0);

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
/** 这一幕的舞台：地图、站在格子上的人、点人说话。原版的剧情画面就是这个。 */
let stageScript = new StageScript();
let stageSection = ''; // 当前幕的 id
let stageLine = 0; // 旧场景按台词数调度；原始 timeline 按指令逐条播放
let storyRun = 0;
let roomDone: ((answer?: number) => void) | null = null;
let roomBusy = false;
let storyCamera = { x: 0, y: 0 };
const storyPoint = (p: { x: number; y: number }) => stageScript.map === 'field' ? fieldPoint(p.x, p.y) : mapPoint(p.x, p.y);
const storyPause = (ms: number) => new Promise<void>((r) => setTimeout(r, autoTalk ? 0 : ms * ANIM_SPEEDS[animSpeedIndex].v));

function followStory(p?: Crowd) {
  if (stageScript.map !== 'field' || !p) return;
  const at = storyPoint(p);
  const routes = stageScript.info?.routes;
  const w = (routes?.[0]?.length ?? 48) * 40, h = (routes?.length ?? 48) * 40;
  storyCamera = { x: Math.max(0, Math.min(w - 640, at.left - 320)), y: Math.max(0, Math.min(h - 400, at.top - 200)) };
  const world = $('screen').querySelector<HTMLElement>('.story-world');
  if (world) world.style.transform = `translate(${-storyCamera.x}px, ${-storyCamera.y}px)`;
}

/** 动作串行执行；下一句和 remove 必须等可见的逐格行走完成。 */
async function playStageOp(op: StageOp, run = storyRun) {
  if (run !== storyRun) return;
  const p = op.who === undefined ? undefined : stageScript.people.get(op.who);
  if (op.op !== 'move' || !p || op.x === undefined || op.y === undefined) {
    stageScript.run(op);
    if (op.op === 'map') storyCamera = { x: 0, y: 0 };
    if (op.op === 'place') followStory(stageScript.people.get(op.who!));
    renderStoryView();
    return;
  }
  const path = stageScript.path(p.who, op.x, op.y);
  const speed = autoTalk ? 0 : ANIM_SPEEDS[animSpeedIndex].v;
  p.walking = true;
  renderStoryView();
  for (const to of path) {
    if (run !== storyRun) return;
    const from = { x: p.x, y: p.y };
    p.dir = moveDirection(from, to, stageScript.map === 'field');
    const actor = $('screen').querySelector<HTMLElement>(`.actor[data-who="${p.who}"]`);
    const art = actor?.querySelector<HTMLElement>('i');
    if (art) { art.style.cssText = actorStyle(p); art.classList.toggle('flip', actorFrame(p.sprite, p.dir).flip); }
    const ms = 100 * speed;
    if (ms) await new Promise<void>((done) => {
      const start = performance.now();
      const frame = (now: number) => {
        if (run !== storyRun) return done();
        const k = Math.min(1, (now - start) / ms);
        p.x = from.x + (to.x - from.x) * k;
        p.y = from.y + (to.y - from.y) * k;
        // 宫殿的交错列位置须在两个端点之间插值，不能对小数列取奇偶。
        const a = storyPoint(from), b = storyPoint(to);
        if (actor) { actor.style.left = `${a.left + (b.left - a.left) * k}px`; actor.style.top = `${a.top + (b.top - a.top) * k}px`; }
        followStory(p);
        if (k < 1) requestAnimationFrame(frame); else done();
      };
      requestAnimationFrame(frame);
    });
    if (run !== storyRun) return;
    p.x = to.x; p.y = to.y;
    followStory(p);
  }
  if (run !== storyRun) return;
  stageScript.run(op);
  stageScript.people.get(p.who)!.walking = false;
  renderStoryView();
}

/**
 * 剧情人物使用 BAKDATA 指定的 SSCCHR2 外观，不读取战场兵种。
 * 原版每个外观有「站立 / 迈步」两帧，静止时慢速交替（呼吸），刚走一步时快速交替；
 * 相位按人物号错开，同一外观的几个人不会整齐地摆同一个姿势。
 */
function actorStyle(p: Crowd): string {
  const a = actorFrame(p.sprite, p.dir, 0);
  const b = actorFrame(p.sprite, p.dir, 1);
  const at = (f: { col: number; row: number }) => `${-f.col * 40}px ${-f.row * 50}px`;
  return `--p0:${at(a)};--p1:${at(b)};--delay:${-((p.who % 9) * 130)}ms`;
}

/** 画剧情场景：有事件插画就整屏插画（原版 show_picture），否则铺地图并摆人。 */
function renderStoryView() {
  const el = $('screen');
  if (story.picture) {
    el.innerHTML = `<img class="pic" src="/assets/pictures/${story.picture}.png" alt="">`;
    return;
  }
  const map = stageScript.map;
  if (!isSceneMap(map)) {
    el.innerHTML = '';
    return;
  }
  const names = stageScript.info?.names ?? {};
  const people = [...stageScript.people.values()].sort((a, b) => storyPoint(a).top - storyPoint(b).top || a.x - b.x);
  const place = stageScript.place ? `<div class="place">${esc(stageScript.place)}</div>` : '';
  const field = map === 'field';
  const w = field ? (stageScript.info?.routes?.[0]?.length ?? 48) * 40 : 640;
  const h = field ? (stageScript.info?.routes?.length ?? 48) * 40 : 400;
  el.innerHTML = `<div class="scene${field ? ' field' : ''}"><div class="story-world" style="width:${w}px;height:${h}px;transform:translate(${-storyCamera.x}px,${-storyCamera.y}px)">` +
    `<img class="backdrop" src="${mapSrc(map, stageScript.info?.world)}" alt="" style="width:${w}px;height:${h}px">` +
    people.map((p) => {
      const { left, top } = storyPoint(p);
      const { flip } = actorFrame(p.sprite, p.dir);
      return `<button class="actor${p.walking ? ' walking' : ''}" data-who="${p.who}" title="${esc(names[p.who] ?? '')}" aria-label="${esc(names[p.who] ?? '人物')}"` +
        ` style="left:${left}px;top:${top}px"><i class="${flip ? 'flip' : ''}" style="${actorStyle(p)}"></i></button>`;
    }).join('') + '</div>' + place + (roomDone && !roomBusy ? roomControls() : '') + '</div>';
  el.querySelectorAll<HTMLElement>('[data-room]').forEach((button) => (button.onclick = (e) => {
    e.stopPropagation();
    if (roomBusy || !roomDone) return;
    if (button.dataset.room === 'save') openSaveList('save');
    else if (button.dataset.room === 'continue') void continueRoom(Number(button.dataset.answer ?? 0));
    else void roomCamp();
  }));
  el.querySelectorAll<HTMLElement>('.actor').forEach((b) => (b.onclick = (e) => (e.stopPropagation(), talkTo(Number(b.dataset.who)))));
  spotSpeaker();
}

/** 说话的人身上亮一圈金光，其余人恢复常态。 */
let speaking = '';
function spotSpeaker(): void {
  $('screen').querySelectorAll<HTMLElement>('.actor').forEach((b) => {
    b.classList.toggle('on', !!speaking && stageScript.info?.names?.[Number(b.dataset.who)] === speaking);
  });
}

/** 剧情推进到下一句：按「本幕已说过几句」把舞台调度走一步。 */
async function storyFrame(run: number) {
  if (run !== storyRun) return;
  if (story.section !== stageSection) {
    stageScript = new StageScript(stageOf(story.section), stageScript);
    stageSection = story.section;
    stageLine = 0;
    storyCamera = { x: 0, y: 0 };
  }
  if (!stageScript.info?.timeline && !stageScript.info?.ordered) for (const op of stageScript.take(stageLine)) {
    if (run !== storyRun) return;
    await playStageOp(op, run);
  }
  if (run !== storyRun) return;
  const el = $('screen');
  el.className = 'story';
  el.hidden = false;
  el.style.backgroundImage = '';
  renderStoryView();
  playBgm(story.bgm);
  $('stage').classList.add('story');
}

/** 点场上的人：原版剧本里记着每个人这一幕会说的话（talk 触发），有就说一句，没有就报个名字。 */
async function talkTo(who: number): Promise<void> {
  const info = stageScript.info;
  const name = info?.names?.[who] ?? '';
  if (info?.timeline || (info?.ordered && info.rooms)) {
    if (roomDone && !roomBusy) await roomTalk(who);
    return;
  }
  if (!name) return;
  const lines = info?.talks?.[who] ?? [];
  const box = $('talk');
  if (aside) return;
  aside = true;
  const saved = box.hidden ? '' : box.innerHTML;
  const wasHidden = box.hidden;
  box.hidden = false;
  playSfx('cursor', 0.5);
  const face = info?.ops.find((o) => o.who === who)?.id;
  try {
    for (const line of lines.length ? lines : [`（${name}）`]) {
      box.innerHTML = `<div class="face" style="${faceStyle(face ? officers[face]?.face : '')}"></div>` +
        `<div><h3>${esc(name)}</h3><p>${esc(line)}</p></div>`;
      await new Promise<void>((done) => {
        const off = () => (box.removeEventListener('click', off), document.removeEventListener('keydown', key), done());
        const key = (e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && off();
        box.addEventListener('click', off);
        document.addEventListener('keydown', key);
      });
    }
  } finally {
    aside = false;
    if (wasHidden) box.hidden = true;
    else box.innerHTML = saved;
  }
}
function activeRoom() {
  const step = currentStep(CAMPAIGN, story);
  return step?.t === 'room' ? stageScript.info?.rooms?.[step.id] : undefined;
}

function roomControls() {
  const room = activeRoom(), step = currentStep(CAMPAIGN, story);
  const options = step?.t === 'room' ? step.options : undefined;
  return '<div class="room-controls"><span>點選人物交談</span>' +
    (options?.length ? options.map((o, i) => `<button class="btn" data-room="continue" data-answer="${i}">${esc(o.label)}</button>`).join('') :
      room?.next ? `<button class="btn" data-room="continue">${esc(room.next.label)}</button>` :
        room ? '' : '<button class="btn" data-room="prepare">編成・道具</button>') +
    '<button class="btn" data-room="save">存檔</button></div>';
}

async function continueRoom(answer = 0) {
  const room = activeRoom(), step = currentStep(CAMPAIGN, story);
  const next = step?.t === 'room' && step.options?.length ? step.options[answer] : room?.next;
  if (!next || !roomDone || roomBusy) return;
  roomBusy = true;
  renderStoryView();
  const run = storyRun;
  try {
    const prompt = next.prompt;
    const yes = !prompt || await talk(nameOf(prompt.who), prompt.text, ['是', '否'], faceOf(prompt.who) ?? '', 1) === 0;
    if (run === storyRun && yes) roomDone?.(answer);
  } finally {
    if (run === storyRun) { roomBusy = false; speaking = ''; renderStoryView(); }
  }
}

async function roomSteps(steps: Step[]) {
  const script = { id: 'room-talk', title: '', steps };
  const local = { ...story, pc: -1, cast: [...story.cast] };
  let step: Shown | null;
  const run = storyRun;
  while (run === storyRun && (step = nextStep(script, local, 0, API))) {
    Object.assign(story, { flags: local.flags, gold: local.gold, roster: local.roster, party: local.party, bag: local.bag, deploy: local.deploy, bgm: local.bgm });
    playBgm(local.bgm);
    if (step.t === 'say') await say(step.who, step.text);
    else if (step.t === 'text') await talk('', step.text);
    else if (step.t === 'action') await playStageOp(step.op);
    else if (step.t === 'wait') await storyPause(step.ms);
  }
  if (run === storyRun) {
    Object.assign(story, { flags: local.flags, gold: local.gold, roster: local.roster, party: local.party, bag: local.bag, deploy: local.deploy, bgm: local.bgm });
    playBgm(local.bgm);
  }
}

async function roomCamp() {
  const room = stageScript.info?.room;
  if (!room || roomBusy || !roomDone) return;
  roomBusy = true;
  const run = storyRun;
  await camp({ t: 'camp', battle: room.battle, title: `${lvOf(room.battle)?.name ?? ''} — 出兵準備`, shop: room.shop }, true);
  if (run !== storyRun) return;
  roomBusy = false;
  $('screen').className = 'story';
  $('screen').hidden = false;
  renderStoryView();
}

async function roomShop(items: number[]) {
  if (roomBusy || !roomDone) return;
  roomBusy = true;
  const run = storyRun;
  await camp({ t: 'camp', battle: '', title: '道具屋', shop: items }, true, true);
  if (run !== storyRun) return;
  roomBusy = false;
  $('screen').className = 'story';
  $('screen').hidden = false;
  renderStoryView();
}

async function roomTalk(who: number) {
  if (!roomDone || roomBusy) return;
  const free = activeRoom();
  const step = currentStep(CAMPAIGN, story);
  const answer = step?.t === 'room' ? step.options?.findIndex(o => o.who === who) ?? -1 : -1;
  if (answer >= 0) return continueRoom(answer);
  if (free?.next?.who === who) return continueRoom();
  if (free?.shop?.who === who) return roomShop(free.shop.items);
  const info = stageScript.info, entry = info?.room?.talks[String(who)] ??
    (free?.talks[String(who)] ? { steps: free.talks[String(who)] } : undefined);
  if (!entry) return;
  roomBusy = true;
  renderStoryView();
  const run = storyRun;
  try {
    await roomSteps(entry.steps);
    if (run !== storyRun) return;
    if (entry.shop) {
      roomBusy = false;
      return await roomCamp();
    }
    if (entry.depart) {
      const name = info?.names?.[who] ?? '關羽';
      const i = await talk(name, entry.prompt ?? '準備好了嗎？', ['是', '否'], faceOf('guan_yu') ?? '', 1);
      if (run !== storyRun) return;
      if (i === 0) {
        await roomSteps(entry.after ?? []);
        if (run !== storyRun) return;
        if (!story.deploy.length) story.deploy = defaultDeploy(info!.room!.battle, story.party);
        roomDone?.();
      }
    }
  } finally {
    if (run === storyRun) { roomBusy = false; speaking = ''; renderStoryView(); }
  }
}

function enterRoom(): Promise<number> {
  roomBusy = false;
  speaking = '';
  return new Promise((done) => {
    roomDone = (answer = 0) => { roomDone = null; done(answer); };
    renderStoryView();
  });
}

interface StoryStageSave {
  section: string;
  line: number;
  camera: { x: number; y: number };
  scene: StageSnapshot;
}

function restoreSavedStoryStage(saved?: StoryStageSave): boolean {
  if (!saved || typeof saved.section !== 'string' ||
    (saved.section && !CAMPAIGN.steps.some((step) => step.t === 'stage' && step.id === saved.section)) ||
    !Number.isInteger(saved.line) || saved.line < 0 ||
    !saved.camera || ![saved.camera.x, saved.camera.y].every(Number.isFinite)) return false;
  const restored = StageScript.fromSnapshot(stageOf(saved.section), saved.scene);
  if (!restored) return false;
  // 分支可从不同的幕跳到同一个房间。锚点定位步骤，存档里的幕用于继续演出。
  stageSection = story.section = saved.section;
  stageLine = saved.line;
  storyCamera = { ...saved.camera };
  stageScript = restored;
  speaking = '';
  return true;
}

/** 兼容无舞台快照的旧档：只重建舞台动作，不重复发军资、设标志或播放对白。 */
function rebuildStoryStage() {
  stageScript = new StageScript(); stageSection = ''; stageLine = 0;
  for (let i = 0; i <= story.pc; i++) {
    const step = CAMPAIGN.steps[i];
    if (step.t === 'stage') {
      stageScript = new StageScript(stageOf(step.id), stageScript);
      stageSection = step.id; stageLine = 0;
    } else if (step.t === 'action') stageScript.run(step.op);
    else if (!stageScript.info?.timeline && !stageScript.info?.ordered && (step.t === 'say' || step.t === 'text')) stageScript.advance(stageLine++);
  }
  for (const p of stageScript.people.values()) p.walking = false;
  storyCamera = { x: 0, y: 0 };
  followStory([...stageScript.people.values()].at(-1));
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
  stageScript = new StageScript(); // 收起舞台：下一幕从干净的一场开始
  stageSection = '';
  speaking = '';
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
  el.className = 'story over-battle'; // 战场插剧：透出战场，只把对话框浮在上面
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

/** 地名条（原版 caption）：画面上只打一行字，停一下自己过去，也可以点掉。 */
async function captionBeat(): Promise<void> {
  const el = $('screen');
  playSfx('cursor', 0.4);
  await new Promise<void>((done) => {
    let timer = 0;
    const off = () => {
      window.clearTimeout(timer);
      el.removeEventListener('click', off);
      document.removeEventListener('keydown', key);
      done();
    };
    const key = (e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && off();
    el.addEventListener('click', off);
    document.addEventListener('keydown', key);
    // 有人正在点场上的人问话时先等着，别把对话框抢回去
    const tick = () => (aside ? (timer = window.setTimeout(tick, 120)) : off());
    timer = window.setTimeout(tick, autoTalk ? 60 : 1200);
  });
}

/** 从某一步起把流程演下去：对话、旁白、选择在这里处理；遇到战斗先出战前说明，全部演完回标题。 */
async function playStory(step: Shown | null) {
  const run = ++storyRun;
  const previousRoom = roomDone; roomDone = null; previousRoom?.();
  roomBusy = false;
  mode = 'busy'; // 剧情期间战场不接受操作
  while (step && run === storyRun) {
    while (aside) await new Promise((r) => setTimeout(r, 80)); // 正在点人问话：等他问完再往下演
    await storyFrame(run);
    if (run !== storyRun) return;
    switch (step.t) {
      case 'action': await playStageOp(step.op); break;
      case 'wait': await storyPause(step.ms); break;
      case 'room': {
        const answer = await enterRoom();
        if (run !== storyRun) return;
        step = nextStep(CAMPAIGN, story, answer, API);
        continue;
      }
      case 'say': await say(step.who, step.text); stageLine++; break;
      case 'text': {
        // 地名条不是台词：画面上已经写在左上角，停一下就走，不占对话框
        if (stageScript.place && step.text === stageScript.place) await captionBeat();
        else await talk('', step.text);
        stageLine++;
        break;
      }
      case 'title': await chapter(step.text); break;
      case 'choice': {
        const i = await talk(step.who ? nameOf(step.who) : '', step.text, step.options.map((o) => o.label));
        if (run !== storyRun) return;
        step = nextStep(CAMPAIGN, story, i, API);
        continue;
      }
      case 'duel': await playDuel(step.a, step.b, step.acts); break;
      case 'camp': await camp(step); if (run !== storyRun) return; step = nextStep(CAMPAIGN, story, 0, API); continue;
      case 'ending': return showEnding(step.text);
      case 'battle': hideStoryFrame(); return showBrief(step.level);
    }
    if (run !== storyRun) return;
    step = nextStep(CAMPAIGN, story, 0, API);
  }
  if (run !== storyRun) return;
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
function camp(step: Extract<Shown, { t: 'camp' }>, returnToRoom = false, shopOnly = false) {
  const lv = lvOf(step.battle);
  if (!lv && !shopOnly) throw new Error(`营地指向的关卡 ${step.battle} 没有数据`);
  let party = story.party.filter((id) => officers[id]);
  if (!shopOnly && !story.deploy.length) story.deploy = defaultDeploy(step.battle, party);
  const required = lv?.deploy?.required ?? [];
  const forbidden = lv?.deploy?.forbidden ?? [];
  const max = lv?.deploy?.max ?? party.length;
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
      `${shopOnly ? '' : `<i>${out ? '出陣' : '待命'}${locked ? '（必須）' : ''}</i>`}</button>` +
      (shopOnly ? '' : `<button class="btn tog" data-toggle="${id}"${locked || forbidden.includes(id) ? ' disabled' : ''}>${out ? '待命' : '出陣'}</button>`) + '</div>';
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
    return `<h2>情報・${esc(o.name)}</h2><div class="info"><div><span>武力</span>${r.str ?? o.str}</div>` +
      `<div><span>統御</span>${r.lead ?? o.lead}</div><div><span>智力</span>${r.int ?? o.int}</div>` +
      `<div><span>等級</span>${r.level}</div><div><span>兵種</span>${esc(TB.classNames[cls])}</div>` +
      `<div><span>經驗</span>${r.exp}/100</div><div><span>兵力</span>${maxHp(cls, r.level)}</div>` +
      `<div><span>策略</span><i title="${esc(strs.map(strategyName).join('、'))}">${strs.length} 條</i></div>` +
      `<div><span>裝備</span>${equips.length ? esc(equips.join('、')) : '—'}</div></div>`;
  };
  const shop = step.shop.map((id) => `<div class="buy"><span>${esc(itemName(id))}<em>${esc(itemEffect(id))}</em></span>` +
    `<button class="btn" data-buy="${id}"${story.gold < (priceOf(id) ?? 100) ? ' disabled' : ''}>${priceOf(id) ?? 100} 金</button></div>`).join('');
  const render = () => {
    party = story.party.filter((id) => officers[id]);
    // 重画时留住滚动位置：营地比一屏高，买完东西跳回顶部会让人找不着刚才那一行
    const old = document.querySelector<HTMLElement>('.card.camp');
    const y = old?.scrollTop ?? 0;          // 1. 渲染前记录

    // const top = el.scrollTop;
    el.className = '';
    el.innerHTML = `<div class="card camp"><h1 style="font-size:24px;line-height:30px">${esc(step.title)}</h1>` +
      `<p class="sub">軍資 ${story.gold} 金${shopOnly ? '' : `　出征 ${story.deploy.length}/${max} 名`}</p>` +
      `<div class="camp-cols"><section><h2>${shopOnly ? '武將' : '編成'}</h2>${rows()}</section>` +
      `<section><h2>道具・${esc(officers[pick]?.name ?? '')}</h2><div class="items">${carried()}</div><h2>包袱</h2><div class="items">${bag()}</div>` +
      `${info()}<h2>商店</h2>${shop}</section></div>` +
      `<div class="row end"><button class="btn" data-go="camp-save">存檔</button>` +
      `<button class="btn" data-go="camp-go"${story.deploy.length || returnToRoom ? '' : ' disabled'}>${returnToRoom ? '返回' : '出陣'}</button></div>`;
    el.hidden = false;
    
    const cur = document.querySelector<HTMLElement>('.card.camp');
    if (cur) cur.scrollTop = y;
    // el.scrollTop = top;
    // 焦点给出陣，但不让它把卡片滚到底
    (el.querySelector('[data-go="camp-go"]') as HTMLElement | null)?.focus({ preventScroll: true });
  };
  render();
  uiRefresh = render; // 修改器改军资 / 等级 / 兵种后，营地跟着重画
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
        uiRefresh = null;
        return done();
      }
      if (go === 'camp-save') openSaveList('save');
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
  const w = el.offsetWidth;
  const cell = CELL / RES; // 菜单按舞台单位摆，贴在部队右侧，放不下就放左侧
  const left = (u.x * CELL - cam.scrollX) / RES + cell + 2;
  el.style.left = `${Math.max(8, Math.min(VIEW_W - w - 8, left + w > VIEW_W ? left - cell - w - 4 : left))}px`;
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

/**
 * 选中这支部队时「站过去就能打到」的格子：从当前位置和每个能停的格子出发，
 * 按兵种的攻击范围铺开，去掉移动范围内的格子（那些已经画成蓝的）。
 * 原版选人时也是一蓝一橙两片，玩家能一眼看出这一步走完能不能打到人。
 */
function threatCells(u: Unit, move: [number, number][]): [number, number][] {
  const walk = new Set(move.map(([x, y]) => `${x},${y}`));
  const out = new Map<string, [number, number]>();
  for (const [x, y] of [[u.x, u.y] as [number, number], ...move]) {
    for (const [cx, cy] of rangeCells(b, x, y, TB.range[u.cls])) {
      const k = `${cx},${cy}`;
      if (!walk.has(k) && !out.has(k)) out.set(k, [cx, cy]);
    }
  }
  return [...out.values()];
}

function deselect() {
  sel = null;
  pick = null;
  mode = 'idle';
  closeMenu();
  scene.unmark();
  renderTurn();
}
let rangeHint = false; // 每场战斗第一次选人时说明一次蓝橙两片格子的含义
function select(u: Unit) {
  playSfx('cursor', 0.6);
  sel = u;
  pick = null;
  mode = 'unit';
  closeMenu();
  if (u.moved) scene.mark([[u.x, u.y]], 'move', { cells: cellsOf(attackTargets(b, u)), kind: 'attack' });
  else {
    const move = reachCells(u);
    scene.mark(move, 'move', { cells: threatCells(u, move), kind: 'attack' });
  }
  if (!rangeHint) {
    rangeHint = true;
    log('藍格：可移動。　橙格：走過去能攻擊到的範圍。');
  }
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
  await writeAutoSave(); // 结算完成后先确保自动档密文落盘，再恢复玩家操作。
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
/** 独立剧情与原战役共用这套存档逻辑，但键名各带剧本 id：写档不会覆盖别人的六格表。 */
const scopedKey = (key: string) => (selectedStory ? `${key}@${CAMPAIGN.id}` : key);
const SAVE_LIST_KEY = scopedKey('yjz.saves.v1'); // 六格存档表；SAVE_KEY 仍作「最近存档」镜像，兼容旧版
const AUTO_SAVE_KEY = scopedKey('yjz.autosave.v1'); // 独立只读槽：仅由新战斗 / 新回合写入
const SAVE_SLOTS = 6;
const SLOT_NAMES = ['一', '二', '三', '四', '五', '六'];

interface SaveData { story: Story; battle?: Battle; storyStage?: StoryStageSave }
interface SaveEntry extends SaveData { at: number } // 存档时间，只用于列表显示
interface SaveList { slots: (SaveEntry | null)[]; last: number | null }

/** 坏档不让读：流程要对得上，带战斗的还要对得上关卡、地形尺寸和随机数。 */
function validSave(d: SaveData | null | undefined): SaveData | null {
  const st = d?.story;
  if (!st || st.script !== CAMPAIGN.id || !Array.isArray(st.party)) return null;
  const bt = d?.battle;
  if (!restoreStoryPosition(CAMPAIGN, st, bt?.level)) return null;
  const position = CAMPAIGN.steps[st.pc];
  if (!bt) return d!;
  const step = position;
  const ok = step?.t === 'battle' && step.level === bt.level && lvOf(bt.level) &&
    Array.isArray(bt.units) && Array.isArray(bt.terrain) && bt.terrain.length === bt.w * bt.h &&
    typeof bt.rng === 'number' && bt.stage === 'player' && !!bt.vars;
  return ok ? d! : null;
}

const blankList = (): SaveList => ({ slots: Array(SAVE_SLOTS).fill(null), last: null });
const saveStorage = new EncryptedSaveStorage();
let saveListCache = blankList();
let autoSaveCache: SaveEntry | null = null;

function parseStoredList(text: string | null): SaveList {
  const list = blankList();
  if (!text) return list;
  try {
    const raw = JSON.parse(text) as Partial<SaveList> | null;
    if (raw && Array.isArray(raw.slots)) {
      for (let i = 0; i < SAVE_SLOTS; i++) {
        const entry = raw.slots[i] as SaveEntry | null | undefined;
        list.slots[i] = entry && typeof entry === 'object'
          ? { ...entry, at: Number(entry.at) || Date.now() }
          : null;
      }
      list.last = Number.isInteger(raw.last) && raw.last! >= 0 && raw.last! < SAVE_SLOTS && list.slots[raw.last!] ? raw.last! : null;
    }
  } catch { /* 坏表当空表，不挡着玩 */ }
  return list;
}

async function initializeSaveStorage() {
  await encryptSaveText(''); // Fail early when Web Crypto is unavailable instead of silently saving plaintext.
  const mirrorKey = scopedKey(SAVE_KEY);
  await saveStorage.initialize([SAVE_LIST_KEY, mirrorKey, AUTO_SAVE_KEY]);
  saveListCache = parseStoredList(saveStorage.getItem(SAVE_LIST_KEY));
  if (!readSaveList().slots.some(Boolean)) {
    try {
      const legacy = validSave(JSON.parse(saveStorage.getItem(mirrorKey) ?? 'null') as SaveData | null);
      if (legacy) {
        saveListCache.slots[0] = { ...legacy, at: Date.now() };
        saveListCache.last = 0;
        await writeSaveList(saveListCache);
      }
    } catch { /* 坏的旧版单槽存档按空档处理 */ }
  }
  try {
    const entry = JSON.parse(saveStorage.getItem(AUTO_SAVE_KEY) ?? 'null') as SaveEntry | null;
    autoSaveCache = entry?.battle && validSave(entry) ? entry : null;
  } catch { autoSaveCache = null; }
  await saveStorage.flush();
}

async function writeSaveList(list: SaveList) {
  const snapshot = JSON.parse(JSON.stringify(list)) as SaveList;
  const mirrorKey = scopedKey(SAVE_KEY);
  const before = [saveStorage.getItem(SAVE_LIST_KEY), saveStorage.getItem(mirrorKey)];
  const current = snapshot.last === null ? null : snapshot.slots[snapshot.last];
  saveStorage.setItem(SAVE_LIST_KEY, JSON.stringify(snapshot));
  if (current) saveStorage.setItem(mirrorKey, JSON.stringify({ story: current.story, battle: current.battle, storyStage: current.storyStage }));
  else saveStorage.removeItem(mirrorKey);
  try {
    await saveStorage.flush();
    saveListCache = snapshot;
  } catch (error) {
    before.forEach((value, i) => value === null ? saveStorage.removeItem([SAVE_LIST_KEY, mirrorKey][i]!) : saveStorage.setItem([SAVE_LIST_KEY, mirrorKey][i]!, value));
    try { await saveStorage.flush(); } catch { /* best-effort restore */ }
    throw error;
  }
}

/** 读取当前页面初始化时解密并校验过的手动档缓存。 */
function readSaveList(): SaveList {
  const list = blankList();
  for (let i = 0; i < SAVE_SLOTS; i++) {
    const entry = saveListCache.slots[i];
    const valid = entry && validSave(entry);
    list.slots[i] = valid ? { ...valid, at: Number(entry!.at) || Date.now() } : null;
  }
  const last = saveListCache.last;
  list.last = last !== null && list.slots[last] ? last : null;
  return list;
}

/** 自动档只在初始化时解密；手动保存不会更改它。 */
function readAutoSave(): SaveEntry | null {
  return autoSaveCache;
}

async function writeAutoSave() {
  if (b.stage !== 'player' || b.undo) return;
  const entry = JSON.parse(JSON.stringify({ story, battle: b, at: Date.now() })) as SaveEntry;
  saveStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(entry));
  try {
    await saveStorage.flush();
    autoSaveCache = entry;
  } catch { log('自动存档失败：浏览器存储不可用。'); }
}
const hasSaves = () => !!readAutoSave() || readSaveList().slots.some(Boolean);
const saveSummary = (e: SaveEntry) => {
  const where = e.battle ? `${esc(lvOf(e.battle.level)?.name ?? e.battle.level)} · 第${e.battle.round}回合` : '出兵準備 / 劇情';
  const when = new Date(e.at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  return `${where}<br><span>${e.story.gold} 金 · ${e.story.party.length} 名武將　${esc(when)}</span>`;
};

function archiveSaveEntry(entry: Record<string, unknown>): SaveEntry | null {
  const at = entry.at;
  if (typeof at !== 'number' || !Number.isSafeInteger(at) || at <= 0) return null;
  const data = { ...entry };
  delete data.at;
  const save = validSave(data as unknown as SaveData);
  return save ? { ...save, at } : null;
}

async function exportSaves() {
  try {
    await saveStorage.flush();
    const list = readSaveList();
    const archive = makeSaveArchive(CAMPAIGN.id, { slots: list.slots, last: list.last, auto: readAutoSave() });
    const cipherText = await encryptSaveText(archive);
    const blob = new Blob([cipherText], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    const name = CAMPAIGN.id.replace(/[^a-z0-9_-]+/gi, '-') || 'campaign';
    anchor.href = url;
    anchor.download = `yingjiezhuan-${name}-saves-${stamp}.yjzsave`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    showSaveNotice('加密存档已导出。');
  } catch (error) {
    showSaveNotice(error instanceof Error ? `导出失败：${error.message}` : '导出失败：浏览器存储不可用。');
  }
}

async function importSaves(file: File) {
  try {
    if (file.size > 10 * 1024 * 1024) throw new Error('存档文件不能超过 10 MB。');
    const fileText = await file.text();
    const archiveText = isEncryptedSaveText(fileText) ? await decryptSaveText(fileText) : fileText;
    const archive = parseSaveArchive<SaveEntry>(archiveText, CAMPAIGN.id, archiveSaveEntry);
    if (archive.auto && !archive.auto.battle) throw new Error('自动档缺少有效的战斗进度。');
    const wasOpen = saveListEl()?.hidden === false;
    const previousMode = saveMode;
    if (hasSaves()) {
      closeSaveList();
      const replace = await confirmBox('导入存档会覆盖当前手动档和自动档，继续吗？');
      if (!replace) {
        if (wasOpen) openSaveList(previousMode);
        return;
      }
    }

    const keys = [SAVE_LIST_KEY, scopedKey(SAVE_KEY), AUTO_SAVE_KEY];
    const previous = keys.map((key) => saveStorage.getItem(key));
    const oldAuto = autoSaveCache;
    try {
      await writeSaveList({ slots: archive.slots, last: archive.last });
      if (archive.auto) saveStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(archive.auto));
      else saveStorage.removeItem(AUTO_SAVE_KEY);
      await saveStorage.flush();
      autoSaveCache = archive.auto;
    } catch (error) {
      keys.forEach((key, i) => previous[i] === null ? saveStorage.removeItem(key) : saveStorage.setItem(key, previous[i]!));
      autoSaveCache = oldAuto;
      try { await saveStorage.flush(); } catch { /* best-effort restore */ }
      saveListCache = parseStoredList(previous[0]);
      throw error;
    }
    if (wasOpen) openSaveList(previousMode);
    showSaveNotice('加密存档已导入。');
    log('已导入存档文件。');
  } catch (error) {
    showSaveNotice(error instanceof Error ? `导入失败：${error.message}` : '导入失败：文件内容无效。');
  }
}

/** 战斗档保存战况，营地和房间档同时保存流程与舞台。 */
function currentSaveData(): SaveData | null {
  if (mode === 'over') return null;
  if (mode === 'idle' && b.stage === 'player' && !b.undo) return { story, battle: b };
  const step = currentStep(CAMPAIGN, story);
  if (step?.t !== 'camp' && step?.t !== 'room') return null;
  if (roomBusy && !$('screen').querySelector('.camp')) return null;
  return { story, storyStage: {
    section: stageSection, line: stageLine, camera: { ...storyCamera }, scene: stageScript.snapshot(),
  } };
}
async function writeSlot(i: number): Promise<boolean> {
  if (!Number.isInteger(i) || i < 0 || i >= SAVE_SLOTS) return false;
  const data = currentSaveData();
  if (!data) return false;
  try {
    const list = readSaveList();
    list.slots[i] = { ...data, at: Date.now() };
    list.last = i;
    await writeSaveList(list);
    log(`已存入檔${SLOT_NAMES[i]}。`);
    return true;
  } catch (error) {
    log(error instanceof Error ? `存档失败：${error.message}` : '存档失败：浏览器本地存储不可用。');
    return false;
  }
}
let saveNoticeTimer = 0;
function showSaveNotice(text: string) {
  clearTimeout(saveNoticeTimer);
  const el = $('save-notice');
  el.textContent = text;
  el.hidden = false;
  saveNoticeTimer = window.setTimeout(() => { el.hidden = true; }, 1800);
}

async function quickSave() {
  if (answer || saveListEl()?.hidden === false) return;
  if (!currentSaveData()) return showSaveNotice('当前状态暂不可存档。');
  showSaveNotice(await writeSlot(0) ? '已快速存入檔一。' : '存档失败，请检查浏览器本地存储。');
}

async function deleteSlot(i: number) {
  if (!Number.isInteger(i) || i < 0 || i >= SAVE_SLOTS) return false;
  try {
    const list = readSaveList();
    list.slots[i] = null;
    if (list.last === i) { const next = list.slots.findIndex(Boolean); list.last = next < 0 ? null : next; }
    await writeSaveList(list);
    log(`已刪除檔${SLOT_NAMES[i]}。`);
    return true;
  } catch { log('删除失败：浏览器本地存储不可用。'); return false; }
}
function loadSlot(i: number | 'auto'): boolean {
  const stored = validSave(i === 'auto' ? readAutoSave() : readSaveList().slots[i]);
  const d = stored ? JSON.parse(JSON.stringify(stored)) as SaveData : null;
  if (!d) return log('没有可用的存档。'), false;
  if (d.battle) {
    storyRun++;
    const previousRoom = roomDone; roomDone = null; previousRoom?.();
    answer = null; $('talk').hidden = true;
  }
  story = d.story;
  if (d.battle) { begin(d.battle); log('已读档。'); }
  else {
    $('screen').hidden = true;
    $('screen').onclick = null;
    if (!restoreSavedStoryStage(d.storyStage)) rebuildStoryStage();
    void playStory(currentStep(CAMPAIGN, story));
  }
  return true;
}

// ---- 存档列表：独立浮层，不占 #screen（剧情 / 章节横幅还在用它的点击） ----
let saveMode: 'save' | 'load' = 'load';
let pendingDelete: number | null = null;
const saveListEl = () => document.getElementById('save-list');

function renderSaveList() {
  const el = saveListEl();
  if (!el) return;
  const list = readSaveList();
  const canSave = !!currentSaveData();
  const auto = readAutoSave();
  const hasExport = !!auto || list.slots.some(Boolean);
  const autoRow = `<div class="save-slot auto-slot${auto ? '' : ' empty'}"><span class="slot-no">自动</span>` +
    `<span class="slot-info">${auto ? saveSummary(auto) : '— 尚无自动存档 —'}<br><span>每回合开始自动更新 · 不可手动覆盖或删除</span></span>` +
    `<button class="btn" data-slot="auto" data-act="read"${auto ? '' : ' disabled'}>读取</button></div>`;
  el.innerHTML = `<div class="card saves"><h1>${saveMode === 'save' ? '存檔' : '讀取存檔'}</h1>` +
    `<p class="sub">${saveMode === 'save' ? '選一個檔位寫入（已有存檔會被覆蓋）' : '選一個檔位讀取'}　${SAVE_SLOTS} 个手动档 + 1 个自动档</p>` +
    `<div class="save-slots">${autoRow}${list.slots.map((e, i) => {
      const del = pendingDelete === i;
      return `<div class="save-slot${e ? '' : ' empty'}"><span class="slot-no">檔 ${SLOT_NAMES[i]}</span>` +
        `<span class="slot-info">${e ? saveSummary(e) : '— 空 —'}</span>` +
        (saveMode === 'save'
          ? `<button class="btn" data-slot="${i}" data-act="write"${canSave ? '' : ' disabled'}>${e ? '覆蓋' : '存檔'}</button>`
          : `<button class="btn" data-slot="${i}" data-act="read"${e ? '' : ' disabled'}>讀取</button>`) +
        (e ? `<button class="btn del${del ? ' sure' : ''}" data-slot="${i}" data-act="delete">${del ? '確認刪除' : '刪除'}</button>` : '') +
        '</div>';
    }).join('')}</div>` +
    '<p class="archive-note">本地与备份文件均以 AES-GCM 加密，无需密码；密钥随游戏程序公开，主要避免直接阅读 JSON，不能防止主动解密或篡改。旧版 JSON 备份仍可导入；不同剧本的存档不能互换。</p>' +
    '<input class="archive-file" type="file" accept=".yjzsave,.json,application/json" aria-label="选择存档文件">' +
    '<div class="row end archive-actions"><button class="btn" data-act="export"' + (hasExport ? '' : ' disabled') + '>导出存档</button>' +
    '<button class="btn" data-act="import">导入存档</button><button class="btn" data-act="close">返回</button></div></div>';
  const fileInput = el.querySelector<HTMLInputElement>('.archive-file');
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    fileInput.value = '';
    if (file) void importSaves(file);
  });
}
function closeSaveList() { const el = saveListEl(); if (el) el.hidden = true; }
function openSaveList(use: 'save' | 'load') {
  saveMode = use;
  pendingDelete = null;
  let el = saveListEl();
  if (!el) {
    // 浮层挂在舞台里才跟着等比缩放；万一舞台节点不在（旧页面缓存、被外部脚本挪走），
    // 退到 body 也不能让整个读档入口直接抛错、画面一动不动。
    const host = document.getElementById('stage') ?? document.body;
    if (!host) return;
    if (host === document.body) console.warn('[save] 找不到 #stage，存档浮层挂到 body');
    el = document.createElement('div');
    el.id = 'save-list';
    host.appendChild(el);
    el.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-act]');
      if (!btn) return;
      const act = btn.dataset.act;
      const i = Number(btn.dataset.slot);
      if (act === 'close') return closeSaveList();
      if (act === 'export') return exportSaves();
      if (act === 'import') return btn.closest<HTMLElement>('#save-list')?.querySelector<HTMLInputElement>('.archive-file')?.click();
      if (act === 'delete') {
        if (pendingDelete !== i) { pendingDelete = i; return renderSaveList(); }
        void deleteSlot(i).then(() => { pendingDelete = null; renderSaveList(); }); return;
      }
      if (act === 'write') { void writeSlot(i).then((ok) => { if (ok) closeSaveList(); }); return; }
      if (act === 'read') { closeSaveList(); if (!loadSlot(btn.dataset.slot === 'auto' ? 'auto' : i)) showTitle('没有可用的存档。'); return; }
    });
  }
  el.hidden = false;
  renderSaveList();
}

// ---------------------------------------------------------------- 修改器 ----
/** 舞台左上角的热区（舞台坐标）：在这里连点三下打开密码框。 */
const TRAINER_ZONE = 44;
/** 三下之间允许的最长间隔。 */
const TRAINER_TAP_MS = 1400;
let taps: number[] = [];
let gateOpen = false;
let trainerOpen = false;
let guideOpen = false;
/** 营地的重画回调：修改器改完数值后让营地跟着刷新（不在营地时为空）。 */
let uiRefresh: (() => void) | null = null;

/** 左上角热区里的三下点击。挂在 document 捕获阶段，不挡战场本身的点击。 */
document.addEventListener('pointerdown', (e) => {
  if (gateOpen || trainerOpen) return;
  const r = $('stage').getBoundingClientRect();
  if (!r.width) return;
  const s = r.width / 640;
  const x = (e.clientX - r.left) / s;
  const y = (e.clientY - r.top) / s;
  if (x < 0 || y < 0 || x > TRAINER_ZONE || y > TRAINER_ZONE) return;
  const now = performance.now();
  taps = taps.filter((t) => now - t < TRAINER_TAP_MS);
  taps.push(now);
  if (taps.length < 3) return;
  taps = [];
  openGate();
}, true);

function openGate() {
  gateOpen = true;
  const el = $('gate');
  el.innerHTML = '<div class="card gate"><h1>修改器</h1><p class="sub">請輸入密碼</p>' +
    '<input id="gate-pass" type="password" inputmode="numeric" autocomplete="off" maxlength="8" aria-label="密碼">' +
    '<p class="err"></p><div class="row"><button class="btn" data-gate="ok">確定</button>' +
    '<button class="btn" data-gate="no">取消</button></div></div>';
  el.hidden = false;
  const card = el.querySelector('.card') as HTMLElement;
  const input = el.querySelector('#gate-pass') as HTMLInputElement;
  const err = el.querySelector('.err') as HTMLElement;
  const submit = () => {
    if (input.value.trim() !== TRAINER_PASSWORD) {
      err.textContent = '密碼不對。';
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
      input.select();
      return;
    }
    closeGate();
    openTrainer();
  };
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      submit();
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      ev.stopPropagation();
      closeGate();
    }
  });
  el.onclick = (ev) => {
    const btn = (ev.target as HTMLElement).closest<HTMLElement>('[data-gate]');
    if (!btn) return;
    if (btn.dataset.gate === 'ok') submit();
    else closeGate();
  };
  input.focus();
}

function closeGate() {
  gateOpen = false;
  const el = $('gate');
  el.hidden = true;
  el.innerHTML = '';
  el.onclick = null;
}

function openTrainer() {
  trainerOpen = true;
  renderTrainer();
  $('trainer').hidden = false;
}

function closeTrainer() {
  trainerOpen = false;
  const el = $('trainer');
  el.hidden = true;
  el.innerHTML = '';
  el.onclick = null;
  el.onchange = null;
  uiRefresh?.();
}

/** 修改器里的道具分组：兵器 / 防具 / 马 / 其他（消耗品、书、玉璽）。 */
function trainerItems(): [string, number[]][] {
  const groups: Record<string, number[]> = { 兵器: [], 防具: [], 馬: [], 其他道具: [] };
  for (const [k, s] of Object.entries(ITEM_SPEC)) {
    const id = Number(k);
    const key = s.kind === 'weapon' ? '兵器' : s.kind === 'armor' ? '防具'
      : s.kind === 'accessory' && s.move > 0 ? '馬' : '其他道具';
    groups[key].push(id);
  }
  return Object.entries(groups).map(([k, v]) => [k, v.sort((a, b) => a - b)]);
}

/** 改完一名武将后，战场上的同一支部队跟着变（等级、兵种、道具，兵力与策略值补满）。 */
function syncBattleUnit(id: string) {
  const r = story.roster[id];
  if (!r || !b?.units) return;
  for (const u of b.units) if (u.key === id && friendly(u.slot) && (!r.trainerCopy || u.trainerCopy)) syncUnit(u, r);
}

function syncBattleStats(id: string) {
  const r = story.roster[id];
  if (!r || !b?.units) return;
  for (const u of b.units) if (u.key === id && friendly(u.slot) && (!r.trainerCopy || u.trainerCopy)) {
    u.lead = r.lead ?? u.lead;
    u.str = r.str ?? u.str;
    u.int = r.int ?? u.int;
  }
}

/** 数值改完：营地重画、战场信息栏重画、棋子按新兵种重绘。 */
function syncAfterTrainer() {
  uiRefresh?.();
  if (mode !== 'over' && b?.units?.length) {
    renderTurn();
    renderUnit(shown);
    scene?.sync();
  }
}

function renderTrainer(notice = '') {
  if (!trainerOpen) return;
  const el = $('trainer');
  // 重画时留住滚动位置：武将多的时候列表很长，点一次「一鍵裝備」不该跳回顶部
  const oldCard = el.querySelector('.card.trainer') as HTMLElement | null;
  const oldList = el.querySelector('.tr-officers') as HTMLElement | null;
  const [cardTop, listTop] = [oldCard?.scrollTop ?? 0, oldList?.scrollTop ?? 0];
  const party = story.party.filter((id) => officers[id]);
  const clsOptions = (cur: number) => TB.classNames.map((n, i) => `<option value="${i}"${i === cur ? ' selected' : ''}>${esc(n)}</option>`).join('');
  const rows = party.map((id) => {
    const o = officers[id];
    const r = (story.roster[id] ??= blank(id));
    return `<div class="tr-row"><b>${esc(o.name)}</b>` +
      `<label>Lv<input type="number" min="1" max="99" value="${r.level}" data-lv="${id}"></label>` +
      `<label>經驗<input type="number" min="0" max="99" value="${r.exp}" data-exp="${id}"></label>` +
      `<select data-cls="${id}" aria-label="兵種">${clsOptions(r.cls ?? o.cls)}</select>` +
      `<button class="btn" data-equip="${id}" title="兵器 / 防具 / 馬取最強，並補一件玉璽">一鍵裝備</button></div>`;
  }).join('') || '<p class="note">先開始遊戲或讀取存檔，才有武將可改。</p>';
  const options = trainerItems().map(([label, list]) => `<optgroup label="${label}">` +
    list.map((id) => `<option value="${id}">${esc(itemName(id))}${itemEffect(id) ? `（${esc(itemEffect(id))}）` : ''}</option>`).join('') +
    '</optgroup>').join('');
  const counts = new Map<number, number>();
  for (const id of story.bag) counts.set(id, (counts.get(id) ?? 0) + 1);
  const bag = counts.size ? [...counts].map(([id, n]) => `${esc(itemName(id))}×${n}`).join('　') : '（空）';
  // 「我軍補滿」只在真的站在战场上时给：营地、剧情、结算画面背后也挂着一场背景战，不能算
  const fighting = !!b?.units?.length && isFighting(b.stage) && $('screen').hidden;
  const canRecruit = story.pc >= 0 && (!fighting || mode === 'idle' && b.stage === 'player');
  const recruits = Object.entries(officers).filter(([id]) => !story.party.includes(id));
  el.innerHTML = '<div class="card trainer"><div class="tr-head"><h1>修改器</h1>' +
    '<button class="btn tr-x" data-tr="close" aria-label="關閉">✕</button></div>' +
    `<h2>軍資</h2><div class="tr-gold"><input id="tr-gold" type="number" min="0" max="9999999" value="${story.gold}"> 金` +
    '<button class="btn" data-gold="1000">＋1000</button><button class="btn" data-gold="10000">＋10000</button>' +
    '<button class="btn" data-gold="0">歸零</button></div>' +
    '<h2>加入武將</h2><div class="tr-give"><select id="tr-recruit" aria-label="選擇加入我方的武將">' +
    recruits.map(([id, o]) => `<option value="${id}">${esc(o.name)}</option>`).join('') +
    `</select><button class="btn" data-tr="recruit"${canRecruit && recruits.length ? '' : ' disabled'}>複製到我方</button></div>` +
    `<p class="note" role="status">${esc(notice || (!recruits.length ? '所有武將均已在我方隊伍中。' : canRecruit ? '保留原武將；有空位時立即登場，並可存檔、編成出陣。' : fighting ? '請在我軍待命時加入武將。' : '開始遊戲或讀取存檔後可加入武將。'))}</p>` +
    `<h2>武將（${party.length}）</h2><div class="tr-officers">${rows}</div>` +
    '<div class="tr-acts"><button class="btn" data-tr="equip-all" title="每人兵器 / 防具 / 馬取最強，並各補一件玉璽">全隊一鍵裝備</button>' +
    '<button class="btn" data-tr="stats-all" title="武力、智力、統率全部設為 100">全隊三項能力 100</button>' +
    '<button class="btn" data-tr="level-all">全隊 +10 級</button>' +
    (fighting ? '<button class="btn" data-tr="heal">我軍補滿</button>' : '') + '</div>' +
    `<h2>道具</h2><div class="tr-give"><select id="tr-item">${options}</select>` +
    '<input id="tr-count" type="number" min="1" max="99" value="1"><button class="btn" data-tr="give">放入包袱</button></div>' +
    '<div class="tr-acts"><button class="btn" data-tr="give-all">全部道具各 1</button>' +
    '<button class="btn" data-tr="give-consum">消耗品各 10</button>' +
    '<button class="btn" data-tr="clear-bag">清空包袱</button></div>' +
    `<p class="tr-bag">包袱：${bag}</p>` +
    '<p class="note">左上角連點三下再開（密碼 1122）。改動立刻生效，存檔時一併寫入。</p></div>';
  const newCard = el.querySelector('.card.trainer') as HTMLElement | null;
  const newList = el.querySelector('.tr-officers') as HTMLElement | null;
  if (newCard) newCard.scrollTop = cardTop;
  if (newList) newList.scrollTop = listTop;
  el.onchange = (ev) => {
    const t = ev.target as HTMLInputElement;
    const id = t.dataset.lv ?? t.dataset.exp ?? t.dataset.cls;
    if (id) {
      const r = (story.roster[id] ??= blank(id));
      if (t.dataset.lv) r.level = clampLevel(Number(t.value));
      else if (t.dataset.exp) r.exp = clampExp(Number(t.value));
      else r.cls = Math.max(0, Math.min(TB.classNames.length - 1, Number(t.value)));
      t.value = String(t.dataset.lv ? r.level : t.dataset.exp ? r.exp : r.cls);
      syncBattleUnit(id);
      syncAfterTrainer();
      return;
    }
    if (t.id === 'tr-gold') {
      story.gold = clampGold(Number(t.value));
      t.value = String(story.gold);
      syncAfterTrainer();
    }
  };
  el.onclick = async (ev) => {
    const t = ev.target as HTMLElement;
    const tr = t.closest<HTMLElement>('[data-tr]')?.dataset.tr;
    const equip = t.closest<HTMLElement>('[data-equip]')?.dataset.equip;
    const gold = t.closest<HTMLElement>('[data-gold]')?.dataset.gold;
    if (equip) {
      const r = (story.roster[equip] ??= blank(equip));
      r.items = equipBest(r.items, story.bag);
      syncBattleUnit(equip);
      syncAfterTrainer();
      renderTrainer();
      (el.querySelector(`[data-equip="${equip}"]`) as HTMLElement | null)?.focus({ preventScroll: true });
      return;
    }
    if (gold !== undefined) {
      story.gold = gold === '0' ? 0 : clampGold(story.gold + Number(gold));
      syncAfterTrainer();
      renderTrainer();
      return;
    }
    if (!tr) return;
    if (tr === 'close') return closeTrainer();
    if (tr === 'recruit') {
      const id = (el.querySelector('#tr-recruit') as HTMLSelectElement).value;
      if (!canRecruit || !id) return;
      const button = t.closest('button')!;
      button.disabled = true;
      try {
        const copy = recruitOfficer(story, id, fighting ? b : undefined);
        if (copy) { await scene.setBattle(b); await scene.focus(copy.x, copy.y, true); shown = copy; }
        syncAfterTrainer();
        const message = `${officers[id].name} 已加入我方。${copy ? '已在我軍附近登場。' : fighting ? '本關暫無法部署，可在下次出陣時編成。' : '可在編成中選擇出陣。'}`;
        log(message);
        renderTrainer(message);
      } catch (error) {
        renderTrainer(error instanceof Error ? error.message : '武將加入失敗。');
      }
      return;
    }
    if (tr === 'stats-all') {
      for (const id of story.party) {
        const r = (story.roster[id] ??= blank(id));
        maxStats(r);
        syncBattleStats(id);
      }
    } else if (tr === 'equip-all') {
      for (const id of story.party) {
        const r = (story.roster[id] ??= blank(id));
        r.items = equipBest(r.items, story.bag);
        syncBattleUnit(id);
      }
    } else if (tr === 'level-all') {
      for (const id of story.party) {
        const r = (story.roster[id] ??= blank(id));
        r.level = clampLevel(r.level + 10);
        syncBattleUnit(id);
      }
    } else if (tr === 'heal') {
      for (const u of b?.units ?? []) if (friendly(u.slot) && u.on) {
        u.hp = maxHp(u.cls, u.level);
        u.mp = maxMp(u);
        u.morale = 100;
        u.confused = false;
      }
    } else if (tr === 'give') {
      const sel = el.querySelector('#tr-item') as HTMLSelectElement | null;
      const cnt = el.querySelector('#tr-count') as HTMLInputElement | null;
      if (sel) giveItem(story.bag, Number(sel.value), Number(cnt?.value ?? 1));
    } else if (tr === 'give-all') {
      for (const id of Object.keys(ITEM_SPEC)) story.bag.push(Number(id));
    } else if (tr === 'give-consum') {
      for (const [k, s] of Object.entries(ITEM_SPEC)) if (s.kind === 'consumable') giveItem(story.bag, Number(k), 10);
    } else if (tr === 'clear-bag') {
      story.bag.length = 0;
    }
    syncAfterTrainer();
    renderTrainer();
  };
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
    story = startStory(CAMPAIGN, { party: selectedStory ? [] : [...START_PARTY] });
    // 开局一分钱没有：原版序章里曹操当场拨 500 金（剧本的 @gold 500），
    // 那笔钱正好赶在第一次进道具屋之前，所以这里不再另给。
    void playStory(nextStep(CAMPAIGN, story, 0, API));
  }
  if (go === 'new') ($('screen').hidden = true), begin(null);
  if (go === 'guide') {
    const step = currentStep(CAMPAIGN, story) as Extract<Shown, { t: 'battle' }> | null;
    if (step) openGuide(step.level);
  }
  if (go === 'deploy') {
    const step = currentStep(CAMPAIGN, story) as Extract<Shown, { t: 'battle' }> | null;
    if (step) showDeploy(step.level);
  }
  if (go === 'next') afterBattle();
  if (go === 'load') openSaveList('load');
  if (go === 'import') openSaveList('load');
  if (go === 'script') toggleScriptMode();
  if (go === 'title') showTitle();
});

function showTitle(note = '') {
  mode = 'over';
  bgmKey = '';
  playBgm(TITLE_BGM, true);
  screen(
    '<div class="seal">非官方<br>復刻</div><h1>三國志英傑傳</h1>' +
    `<p class="sub">${selectedStory ? `獨立劇情：${esc(CAMPAIGN.title)}` : 'PC DOS 繁體中文版 全流程復刻'}</p>` +
    '<p class="credit">畫面、劇本、地圖、兵種、頭像與音樂均取自原版《三國志英傑傳》DOS 版，逐像素還原。詳見 docs/assets.md。</p>' +
    `<div class="row"><button class="btn" data-go="start">開始新遊戲</button><button class="btn" data-go="load"${hasSaves() ? '' : ' disabled'}>讀取存檔</button>` +
    '<button class="btn" data-go="import">导入存档</button>' +
    `<button class="btn" data-go="script" data-script-label>${scriptLabel()}</button></div>` +
    (note ? `<p class="sub" style="margin:10px 0 0">${esc(note)}</p>` : ''));
}
function closeGuide() {
  guideOpen = false;
  const el = $('guide');
  el.hidden = true;
  el.innerHTML = '';
  el.onclick = null;
  fit();
}

function openGuide(levelId?: string) {
  const step = currentStep(CAMPAIGN, story);
  const id = levelId ?? (b?.units?.length && isFighting(b.stage) && $('screen').hidden
    ? b.level
    : step?.t === 'battle' ? step.level : b?.level);
  const levelData = id ? lvOf(id) : undefined;
  const guide = (id ? battleGuide(id) : undefined) ?? (levelData ? {
    name: levelData.name, goal: levelData.goal, turnLimit: levelData.turnLimit, duels: [],
  } : undefined);
  if (!guide || !levelData) return;
  const currentBattle = b?.level === id && $('screen').hidden ? b : undefined;
  const enemies = currentBattle
    ? currentBattle.units.filter((unit) => unit.slot >= 15 && unit.on)
    : levelData.units.filter((unit) => unit.slot >= 15 && !unit.off);
  const commander = enemies.find((unit) => unit.commander);
  const objective = currentBattle?.objective || guide.goal || '击破敌军主将';
  const el = $('guide');
  const duels = guide.duels.length
    ? `<ul class="guide-duels">${guide.duels.map((duel) =>
      `<li><b>${esc(duel.a)}　VS　${esc(duel.b)}</b><span>${esc(duel.trigger)}</span></li>`).join('')}</ul>`
    : '<p class="guide-empty">关卡资料未收录单挑事件；按当前胜利目标推进即可。</p>';
  el.innerHTML = '<section class="card guide-card" role="dialog" aria-modal="true" aria-labelledby="guide-title">' +
    `<div class="guide-head"><h1 id="guide-title">${esc(guide.name)}・攻略</h1>` +
    '<button class="btn guide-close" data-guide="close" aria-label="关闭攻略">✕</button></div>' +
    `<p class="guide-objective"><b>胜利目标</b><span>${esc(objective)}</span></p>` +
    `<p class="guide-limit">${currentBattle ? `当前第 ${currentBattle.round} 回合　` : ''}回合上限：${guide.turnLimit}</p>` +
    `<p class="guide-enemy">敌军 ${enemies.length} 队${commander ? `；主将：${esc(commander.name)}` : ''}</p>` +
    '<h2>本关单挑</h2>' + duels +
    (guide.duels.length ? '<p class="guide-note">单挑按列表条件触发；让指定武将与对手相邻，或满足所列剧情条件。</p>' : '') +
    '</section>';
  el.hidden = false;
  guideOpen = true;
  fit();
  el.onclick = (event) => {
    const target = event.target as HTMLElement;
    if (target === el || target.closest('[data-guide="close"]')) closeGuide();
  };
  (el.querySelector('[data-guide="close"]') as HTMLButtonElement | null)?.focus();
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
    '<div class="row"><button class="btn" data-go="guide">本关攻略</button><button class="btn" data-go="deploy">部隊配置</button></div>');
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
  // 读档可能从标题 / 战报 / 剧情舞台进来，那些整屏卡片必须收起，否则战场在下面开打、画面却纹丝不动。
  const frame = $('screen');
  frame.hidden = true;
  frame.innerHTML = '';
  frame.className = '';
  $('stage').classList.remove('story');
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
  rangeHint = false; // 换一场战斗就重新提示一次蓝橙格
  mode = 'busy';
  playBgm(battleBgm(lv, b.stage), true); // 开战：原版的战斗曲
  renderUnit(null);
  renderTile(0, 0);
  const lord = bySlot(b, lv.lord ?? -1) ?? b.units.find((u) => u.mode === 7) ?? b.units[0];
  void scene.setBattle(b).then(() => (void scene.focus(lord.x, lord.y, true), present(evs))).then(() => {
    mode = 'idle';
    renderTurn();
    if (!d) { writeAutoSave(); log(`目标：${b.objective}`); }
  });
}

// ---------------------------------------------------------------- 启动 ----
let sfxBtn: HTMLButtonElement | null = null;
let cameraBtn: HTMLButtonElement | null = null;
let speedBtn: HTMLButtonElement | null = null;
let scriptBtn: HTMLButtonElement | null = null;
const syncSfxButton = () => { if (sfxBtn) sfxBtn.textContent = sfxEnabled() ? '音效 開' : '音效 關'; };
const syncCameraButton = () => { if (cameraBtn) cameraBtn.textContent = cameraFollow ? '镜头跟随 开' : '镜头跟随 关'; };
const syncSpeedButton = () => { if (speedBtn) speedBtn.textContent = `移动速度 ${ANIM_SPEEDS[animSpeedIndex].label}`; };
/** 右下系统菜单和标题上的按钮都标出当前字形；标签本身用简体写，不参与转换。 */
const syncScriptButton = () => {
  if (scriptBtn) scriptBtn.textContent = scriptLabel();
  document.querySelectorAll<HTMLElement>('[data-script-label]').forEach((el) => (el.textContent = scriptLabel()));
};
const toggleScriptMode = () => { toggleScript(); syncScriptButton(); playSfx('confirm', 0.75); };
const cycleAnimSpeed = () => {
  animSpeedIndex = (animSpeedIndex + 1) % ANIM_SPEEDS.length;
  localStorage.setItem(ANIM_SPEED_KEY, String(ANIM_SPEEDS[animSpeedIndex].v));
  scene.setAnimSpeed(ANIM_SPEEDS[animSpeedIndex].v);
  syncSpeedButton();
  playSfx('confirm', 0.75);
};
const toggleCameraFollow = () => {
  cameraFollow = !cameraFollow;
  localStorage.setItem(CAMERA_FOLLOW_KEY, cameraFollow ? '1' : '0');
  scene.setCameraFollow(cameraFollow);
  syncCameraButton();
  playSfx('confirm', 0.75);
};
const sysButtons: [string, string, () => void][] = [
  ['回合结束', '', () => void endTurn()],
  [sfxEnabled() ? '音效 開' : '音效 關', '', () => { toggleSfx(); syncSfxButton(); playSfx('confirm', 0.75); }],
  [cameraFollow ? '镜头跟随 开' : '镜头跟随 关', 'camera-toggle', toggleCameraFollow],
  [`移动速度 ${ANIM_SPEEDS[animSpeedIndex].label}`, 'speed-toggle', cycleAnimSpeed],
  [scriptLabel(), 'script-toggle', toggleScriptMode],
  ['本关攻略', 'guide-toggle', () => openGuide()],
  ['胜利条件', '', () => void talk('', `胜利：${b.objective}。失败：主将撤退，或 ${levelOf(b).turnLimit} 回合内未能取胜。`)],
  ['全军撤退', '', async () => {
    if (mode !== 'idle') return;
    mode = 'busy';
    if (await confirmBox('全军撤退，放弃这一战吗？')) return (b.stage = 'lost'), (b.reason = '全军撤退'), showResult();
    mode = 'idle';
  }],
  ['存档', '', () => openSaveList('save')],
  ['读档', '', () => mode === 'idle' && openSaveList('load')],
];
$('sys').replaceChildren(...sysButtons.map(([label, cls, on]) => {
  const btn = document.createElement('button');
  btn.className = `btn ${cls}`;
  btn.textContent = label;
  btn.onclick = on;
  if (label.startsWith('音效')) (btn.dataset.sfx = '1'), (sfxBtn = btn);
  if (label.startsWith('镜头跟随')) (btn.dataset.camera = '1'), (cameraBtn = btn);
  if (label.startsWith('移动速度')) (btn.dataset.speed = '1'), (speedBtn = btn);
  if (label.startsWith('文字')) (btn.dataset.script = '1'), (scriptBtn = btn);
  return btn;
}));

// 简繁显示：之后所有 DOM 文本（对白、菜单、状态栏、浮层）都自动按当前设置转换。
initScript();

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && guideOpen) return closeGuide();
  if (e.key === 'Escape' && saveListEl()?.hidden === false) return closeSaveList();
  if (e.key === 'Escape' && trainerOpen) return closeTrainer();
  if (gateOpen || trainerOpen || guideOpen) return; // 浮层打开时不把按键传给战场
  if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const target = e.target;
    if (e.repeat || e.isComposing || target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select'))) return;
    e.preventDefault();
    return quickSave();
  }
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

/** 仍用原版内部坐标；安全区、浏览器工具栏和触屏操作条只影响外层可用空间。 */
const touchLayout = matchMedia('(pointer: coarse)');
function closeTouchSystem() {
  document.body.classList.remove('system-open');
  $('touch-system').setAttribute('aria-expanded', 'false');
}
$('touch-log').onclick = () => {
  const open = document.body.classList.toggle('log-open');
  $('touch-log').setAttribute('aria-expanded', String(open));
};
$('touch-system').onclick = () => {
  const open = document.body.classList.toggle('system-open');
  $('touch-system').setAttribute('aria-expanded', String(open));
};
$('touch-cancel').onclick = () => {
  if (document.body.classList.contains('system-open')) return closeTouchSystem();
  if (saveListEl()?.hidden === false) return closeSaveList();
  if (trainerOpen) return closeTrainer();
  if (guideOpen) return closeGuide();
  cancel();
};
$('sys').addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('button:not(:disabled)')) closeTouchSystem(); });
function fit() {
  const v = visualViewport;
  const [width, height, x, y] = [v?.width ?? innerWidth, v?.height ?? innerHeight, v?.offsetLeft ?? 0, v?.offsetTop ?? 0];
  const safe = getComputedStyle($('safe-area'));
  const [left, right, top, bottom] = [safe.paddingLeft, safe.paddingRight, safe.paddingTop, safe.paddingBottom].map(parseFloat);
  const touch = touchLayout.matches;
  document.body.classList.toggle('touch', touch);
  document.body.classList.toggle('portrait', touch && height > width);
  const sys = $('sys');
  if (touch && sys.parentElement !== document.body) document.body.append(sys);
  else if (!touch && sys.parentElement !== $('side')) { $('side').append(sys); closeTouchSystem(); }
  const availableW = Math.max(1, width - left - right);
  const availableH = Math.max(1, height - top - bottom - (touch ? 56 : 0) - (touch && height > width ? 32 : 0));
  const compact = touch && width > height && $('screen').hidden && $('duelplay').hidden && saveListEl()?.hidden !== false && !trainerOpen && !guideOpen && !gateOpen;
  document.body.classList.toggle('compact-battle', compact);
  const stageH = compact ? 384 : 480;
  const s = Math.min(availableW / 640, availableH / stageH);
  const st = $('stage').style;
  st.setProperty('--stage-scale', String(s));
  st.setProperty('--touch-size', `${44 / s}px`);
  st.setProperty('--touch-font', `${14 / s}px`);
  st.transform = `scale(${s})`;
  st.left = `${x + left + (availableW - 640 * s) / 2}px`;
  st.top = `${y + top + (availableH - stageH * s) / 2}px`;
  game.scale.refresh();
}
addEventListener('resize', fit);
visualViewport?.addEventListener('resize', fit);
visualViewport?.addEventListener('scroll', fit);
touchLayout.addEventListener('change', fit);
let fitQueued = false;
new MutationObserver(() => {
  if (fitQueued) return;
  fitQueued = true;
  requestAnimationFrame(() => { fitQueued = false; fit(); });
}).observe($('stage'), { attributes: true, subtree: true, attributeFilter: ['hidden'] });

/** 小地图坐标取显示矩形，独立于舞台与高分辨率画布的缩放。 */
const minimap = $('minimap') as HTMLCanvasElement;
let mapGesture: { id: number; dx: number; dy: number } | undefined;
const minimapPoint = (e: PointerEvent) => {
  const r = minimap.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width * b.w * CELL, y: (e.clientY - r.top) / r.height * b.h * CELL };
};
minimap.addEventListener('pointerdown', (e) => {
  if (e.button !== 0 || mapGesture || !scene.canPan()) return;
  e.preventDefault();
  const p = minimapPoint(e), cam = scene.cameras.main;
  const inside = p.x >= cam.scrollX && p.x <= cam.scrollX + cam.width && p.y >= cam.scrollY && p.y <= cam.scrollY + cam.height;
  mapGesture = { id: e.pointerId, dx: inside ? p.x - cam.scrollX : cam.width / 2, dy: inside ? p.y - cam.scrollY : cam.height / 2 };
  minimap.setPointerCapture(e.pointerId);
  // 金框内按下保留抓取偏移，点按松手时仍强制以该点居中。
  if (!inside) scene.panTo(p.x - mapGesture.dx, p.y - mapGesture.dy);
});
let mapMoved = false;
minimap.addEventListener('pointermove', (e) => {
  if (mapGesture?.id !== e.pointerId) return;
  mapMoved = true;
  const p = minimapPoint(e);
  scene.panTo(p.x - mapGesture.dx, p.y - mapGesture.dy);
});
minimap.addEventListener('pointerup', (e) => {
  if (mapGesture?.id !== e.pointerId) return;
  if (!mapMoved) { const p = minimapPoint(e), cam = scene.cameras.main; scene.panTo(p.x - cam.width / 2, p.y - cam.height / 2); }
  mapGesture = undefined;
  mapMoved = false;
  if (minimap.hasPointerCapture(e.pointerId)) minimap.releasePointerCapture(e.pointerId);
});
const clearMapGesture = () => { mapGesture = undefined; mapMoved = false; };
minimap.addEventListener('pointercancel', clearMapGesture);
minimap.addEventListener('lostpointercapture', clearMapGesture);
addEventListener('blur', clearMapGesture);
minimap.addEventListener('keydown', (e) => {
  const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
  if (!d) return;
  e.preventDefault();
  e.stopPropagation();
  const cam = scene.cameras.main;
  scene.panTo(cam.scrollX + d[0] * CELL * 2, cam.scrollY + d[1] * CELL * 2);
});

game.events.once('ready', () => {
  scene = game.scene.getScene('battle') as BattleScene;
  const start = () => {
    scene.onCell = (x, y) => void onCell(x, y);
    scene.onCancel = cancel;
    // 下令菜单、对白与演出进行中锁定手动镜头，避免菜单脱离部队或抢过自动跟随。
    scene.canPan = () => (mode === 'idle' || mode === 'unit' || mode === 'target') && !answer && !trainerOpen && !gateOpen && $('screen').hidden && saveListEl()?.hidden !== false && !document.body.classList.contains('system-open');
    scene.onCameraChange = () => scene.drawMinimap(minimap);
    let minimapAt = 0;
    scene.events.on('postupdate', () => {
      if (scene.time.now - minimapAt < 80) return;
      minimapAt = scene.time.now;
      scene.drawMinimap(minimap);
    });
    scene.onHover = (x, y) => {
      renderTile(x, y);
      const u = unitAt(b, x, y) ?? sel ?? shown;
      if (u !== shown) renderUnit(u);
    };
    scene.setAnimSpeed(matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ANIM_SPEEDS[animSpeedIndex].v);
    scene.setCameraFollow(cameraFollow);
    if (import.meta.env.DEV) {
      // 仅开发模式：供调试与自动化测试读取状态
      if (params.has('fast')) (scene.speed = 0), (autoTalk = true);
      Object.assign(window, { __yjz: { get b() { return b; }, get story() { return story; }, get mode() { return mode; }, get bgm() { return bgmKey; }, get bgmSrc() { return audio.src; }, bgmLog: () => [...bgmLog], banners: () => [...banners], scene, level: lvOf, sfx: sfxLog, sfxDiagnostics, sfxEnabled, duel: playDuel, banner, openSaveList, saveStorage: { getItem: (key: string) => saveStorage.getItem(key), setItem: (key: string, value: string) => { saveStorage.setItem(key, value); if (key === SAVE_LIST_KEY) saveListCache = parseStoredList(value); if (key === AUTO_SAVE_KEY) { try { const entry = JSON.parse(value) as SaveEntry; autoSaveCache = entry?.battle && validSave(entry) ? entry : null; } catch { autoSaveCache = null; } } return saveStorage.flush(); }, removeItem: (key: string) => { saveStorage.removeItem(key); if (key === SAVE_LIST_KEY) saveListCache = blankList(); if (key === AUTO_SAVE_KEY) autoSaveCache = null; return saveStorage.flush(); }, flush: () => saveStorage.flush() }, get trainerOpen() { return trainerOpen; }, get gateOpen() { return gateOpen; } } });
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
    const first = CAMPAIGN.steps.find((s) => s.t === 'battle') as Extract<Step, { t: 'battle' }> | undefined;
    const lv = (first ? lvOf(first.level) : level('sishui')) ?? DEMO_LEVELS[0];
    b = newBattle(lv, 1).b;
    void scene.setBattle(b);
    renderUnit(null);
    fit();
    void Promise.all([document.fonts.load('12px Pixel'), initializeSaveStorage()])
      .then(() => showTitle(saveStorage.invalidKeys.length ? '检测到无法解密的本地存档；可尝试导入备份。' : ''))
      .catch((error) => showTitle(error instanceof Error ? `存档加密初始化失败：${error.message}` : '存档加密初始化失败。'));
  };
  scene.sys.settings.status >= Phaser.Scenes.RUNNING ? start() : scene.events.once('ready', start);
});
