import * as Phaser from 'phaser';
import './style.css';
import { CAMPAIGN } from './data/campaign';
import { SISHUI } from './data/sishui';
import { TB, atk, attackTargets, bySlot, def, itemName, knownStrategies, maxHp, maxMp, moveBudget, terrainAt, terrainDef, unitAt, weatherName } from './rules/core';
import { canStop, reachField } from './rules/move';
import { aiStep, autoPhase, canCommand, castTargets, doAttack, doCast, doItem, doMove, doWait, endPhase, harvest, itemTargets, levelById, levelOf, newBattle, registerLevel, undoMove } from './rules/turn';
import type { Battle, Ev, Unit } from './rules/types';
import { BattleScene, CELL, RES, VIEW_H, VIEW_W, sideOf } from './scene';
import { checkScript, currentStep, nextStep, startStory, type Shown, type Story } from './story';

const SAVE_KEY = 'yjz.save.v2'; // 流程进度 + 战斗状态
registerLevel(SISHUI);
checkScript(CAMPAIGN, (id) => !!levelById(id));
/** 头像文件：原版 FACEDAT.R3 里各武将的 64×80 像素像；杂兵没有武将记录，用原版兵种图代替。 */
const PORTRAITS: Record<string, string> = {
  刘备: 'liu_bei', 关羽: 'guan_yu', 张飞: 'zhang_fei', 公孙瓒: 'gongsun_zan', 陶谦: 'tao_qian',
  华雄: 'hua_xiong', 李肃: 'li_su', 胡轸: 'hu_zhen', 赵岑: 'zhao_cen',
};
const SIDE = [['player', '我军'], ['ally', '友军'], ['enemy', '敌军']] as const;
const params = new URLSearchParams(location.search);

const $ = (id: string) => document.getElementById(id)!;
const esc = (s: unknown) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const faceStyle = (key: string) => `background-image:url(/assets/portraits/${PORTRAITS[key] ?? '_unknown'}.png)`;

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

// ---------------------------------------------------------------- 画面各栏 ----
function renderTurn() {
  const [cls, label] = b.stage === 'ally' ? SIDE[1] : b.stage === 'enemy' ? SIDE[2] : SIDE[0];
  $('turn').innerHTML =
    `<b>第${b.round}回合</b><div style="text-align:right"><div>${weatherName(b.weather)}　限 ${levelOf(b).turnLimit} 回合</div>` +
    `<div class="phase-${cls}">${label}行动</div></div>`;
  for (const el of $('sys').querySelectorAll('button')) el.disabled = mode !== 'idle';
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
    knownStrategies(u).length ? `策略：${knownStrategies(u).map((id) => TB.strategyNames[id]).join('、')}` : '',
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

const name = (slot: number) => bySlot(b, slot)?.name ?? '';
function describe(ev: Ev): string {
  switch (ev.t) {
    case 'round': return `—— 第 ${ev.round} 回合，${weatherName(ev.weather)} ——`;
    case 'stage': return ev.stage === 'ally' ? '友军行动。' : ev.stage === 'enemy' ? '敌军行动。' : '';
    case 'hit': return `${name(ev.a)}${ev.counter ? '反击' : '攻击'}${name(ev.d)}：兵力 -${ev.dmg}${ev.morale ? `，士气 -${ev.morale}` : ''}`;
    case 'cast': return ev.ok
      ? `${name(ev.a)}使出「${TB.strategyNames[ev.id]}」：${name(ev.d)}兵力 -${ev.dmg}`
      : `${name(ev.a)}的「${TB.strategyNames[ev.id]}」被${name(ev.d)}识破`;
    case 'exp': return name(ev.slot) + [ev.gain ? `经验 +${ev.gain}` : '', ev.levels ? `升到 ${bySlot(b, ev.slot)!.level} 级` : ''].filter(Boolean).join('，') +
      (ev.learned.length ? `，学会「${ev.learned.map((id) => TB.strategyNames[id]).join('、')}」` : '');
    case 'recover': return `${name(ev.slot)}休整：${[ev.hp ? `兵力 +${ev.hp}` : '', ev.morale ? `士气 +${ev.morale}` : ''].filter(Boolean).join('，')}`;
    case 'confuse': return ev.on ? `${name(ev.slot)}陷入混乱！` : `${name(ev.slot)}恢复了秩序。`;
    case 'retreat': return `${name(ev.slot)}撤退。`;
    case 'gain': return `${name(ev.slot)}${ev.text}`;
    case 'end': return ev.text;
    default: return '';
  }
}

/** 依次播放一批规则事件；对话要等玩家点击。 */
async function present(evs: Ev[]) {
  for (const ev of evs) {
    const text = describe(ev);
    if (text) log(text);
    if (ev.t === 'round' || ev.t === 'stage') renderTurn();
    if (ev.t === 'talk') await talk(ev.who, ev.text);
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
  // 原版攻击时会切到战斗特写：这里用原版的天空/地面条带和双方兵种大图盖在战场上
  const idx = (u: Unit) => b.units.findIndex((v) => v.slot === u.slot);
  const duel = $('duel');
  duel.innerHTML = '<img class="scene" src="/assets/battle/scene.png" alt="">' +
    `<img class="fighter l" src="/assets/battle/unit-${idx(a)}.png" alt="">` +
    `<img class="fighter r" src="/assets/battle/unit-${idx(d)}.png" alt="">`;
  duel.hidden = false;
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
function talk(who: string, text: string, options: string[] = [], esc_ = options.length ? -1 : 0): Promise<number> {
  const el = $('talk');
  el.innerHTML = (who ? `<div class="face" style="${faceStyle(who)}"></div>` : '') + `<div>${who ? `<h3>${esc(who)}</h3>` : ''}<p>${esc(text)}</p>` +
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
  answer?.(Number(btn?.dataset.i ?? 0));
});
const confirmBox = (text: string) => talk('刘备', text, ['是', '否'], 1).then((i) => i === 0);

// ---------------------------------------------------------------- 剧情 ----
/** 从某一步起把流程演下去：对话、旁白、选择在这里处理；遇到战斗先出战前说明，全部演完回标题。 */
async function playStory(step: Shown | null) {
  mode = 'busy'; // 剧情期间战场不接受操作
  $('stage').classList.add('story');
  while (step && step.t !== 'battle') {
    const el = $('screen');
    el.className = 'story';
    el.replaceChildren();
    el.style.backgroundImage = story.bg ? `url(/assets/${encodeURIComponent(story.bg)}.png)` : '';
    el.hidden = false;
    const picked = step.t === 'choice' ? await talk(step.who ?? '', step.text, step.options.map((o) => o.label)) : await talk(step.t === 'say' ? step.who : '', step.text);
    step = nextStep(CAMPAIGN, story, picked);
  }
  $('stage').classList.remove('story');
  if (step) return showBrief();
  mode = 'over';
  screen(`<h1>${esc(CAMPAIGN.title)} 完</h1><div class="row"><button class="btn" data-go="title">回到标题</button></div>`);
}
/** 战斗打完，把结果带回流程：胜了记下成长、军资和战斗里触发过的事件，再接着往下演。 */
function afterBattle() {
  const won = b.stage === 'won';
  if (won) {
    Object.assign(story.roster, harvest(b));
    story.gold += b.gold;
    for (const f of b.flags) story.flags[`${b.level}.${f}`] = true;
  }
  void playStory(nextStep(CAMPAIGN, story, won ? 0 : 1));
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
  sel = u;
  pick = null;
  mode = 'unit';
  closeMenu();
  scene.mark(u.moved ? [[u.x, u.y]] : reachCells(u), 'move');
  renderUnit(u);
  renderTurn();
}

/** 指令菜单：攻击 / 策略 / 道具 / 待命。没有可选目标的指令置灰。 */
function openCommand() {
  const u = sel!;
  mode = 'menu';
  pick = null;
  scene.unmark();
  renderTurn();
  const foes = attackTargets(b, u);
  const strategies = knownStrategies(u);
  openMenu([
    { label: '攻击', on: foes.length ? () => aim(foes, 'attack', (t) => doAttack(b, u.slot, t.slot)) : undefined },
    { label: '策略', on: strategies.length ? () => openMenu(strategies.map((id) => {
        const ts = castTargets(b, u, id);
        return { label: `${TB.strategyNames[id]}　${TB.strategyMp[id]}`, on: ts.length ? () => aim(ts, 'attack', (t) => doCast(b, u.slot, id, t.slot)) : undefined };
      }), u, true) : undefined },
    { label: '道具', on: u.items.length ? () => openMenu(u.items.map((id) => {
        const ts = itemTargets(b, u, id);
        return { label: itemName(id), on: ts.length ? () => aim(ts, 'aid', (t) => doItem(b, u.slot, id, t.slot)) : undefined };
      }), u, true) : undefined },
    { label: '待命', on: () => act(doWait(b, u.slot)) },
  ], u);
}
function aim(targets: Unit[], kind: 'attack' | 'aid', run: (t: Unit) => Ev[]) {
  mode = 'target';
  pick = { targets, run };
  closeMenu();
  scene.mark(cellsOf(targets), kind);
  log(kind === 'aid' ? '选择使用对象。' : '选择目标。');
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
  deselect();
  scene.mark(reachCells(t), 'move');
  renderUnit(t);
}

// ---------------------------------------------------------------- 存档 ----
function save() {
  if (mode !== 'idle' || b.stage !== 'player' || b.undo) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ story, battle: b }));
    log('已存档。');
  } catch {
    log('存档失败：浏览器不允许写入本地存储。');
  }
}
function readSave(): { story: Story; battle: Battle } | null {
  try {
    let d = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null');
    // 旧版存档只有战斗本身：补一份停在这一关的流程进度，旧档还能接着打
    const old = !d && JSON.parse(localStorage.getItem('yjz.sishui.save.v1') ?? 'null');
    if (old) d = { story: { ...startStory(CAMPAIGN), pc: CAMPAIGN.steps.findIndex((s) => s.t === 'battle' && s.level === old.level) }, battle: old };
    const bt = d?.battle;
    const step = CAMPAIGN.steps[d?.story?.pc];
    const ok = bt && d.story.script === CAMPAIGN.id && step?.t === 'battle' && step.level === bt.level && levelById(bt.level) &&
      Array.isArray(bt.units) && Array.isArray(bt.terrain) && bt.terrain.length === bt.w * bt.h && typeof bt.rng === 'number' && bt.stage === 'player';
    return ok ? d : null;
  } catch {
    return null;
  }
}
function load() {
  const d = readSave();
  if (!d) return log('没有可用的存档。'), false;
  story = d.story;
  begin(d.battle);
  log('已读档。');
  return true;
}

// ---------------------------------------------------------------- 整屏 ----
function screen(html: string, veil = false) {
  const el = $('screen');
  el.className = veil ? 'veil' : 'scroll';
  el.style.backgroundImage = '';
  el.innerHTML = `<div class="card">${html}</div>`;
  el.hidden = false;
  (el.querySelector('button') as HTMLElement | null)?.focus();
}
$('screen').addEventListener('click', (e) => {
  const go = (e.target as HTMLElement).closest('button')?.dataset.go;
  if (go === 'start') (story = startStory(CAMPAIGN)), void playStory(nextStep(CAMPAIGN, story));
  if (go === 'new') ($('screen').hidden = true), begin(null);
  if (go === 'next') afterBattle();
  if (go === 'load') ($('screen').hidden = !!readSave()), load() || showTitle('没有可用的存档。');
  if (go === 'title') showTitle();
});

function showTitle(note = '') {
  mode = 'over';
  screen(
    '<div class="seal">非官方<br>复刻</div><h1>汜水关之战</h1>' +
    '<p class="sub">《三国志英杰传》PC DOS 版 序章第一战</p>' +
    '<p class="credit">画面取自原版《三国志英杰传》DOS 版的战场、兵种、头像与界面，逐像素还原。详见 docs/assets.md。</p>' +
    `<div class="row"><button class="btn" data-go="start">开始新游戏</button><button class="btn" data-go="load"${readSave() ? '' : ' disabled'}>读取存档</button></div>` +
    (note ? `<p class="sub" style="margin:10px 0 0">${esc(note)}</p>` : ''));
}
/** 战前说明：流程停在一个战斗步骤上时，按那一关的数据列出胜败条件。 */
function showBrief() {
  mode = 'over';
  const lv = levelById((currentStep(CAMPAIGN, story) as Extract<Shown, { t: 'battle' }>).level)!;
  screen(
    `<h1 style="font-size:24px;line-height:28px">${esc(lv.name)}</h1>` +
    `<ul><li>胜利：${esc(lv.goal)}</li><li>失败：${esc(lv.units.find((u) => u.slot === lv.lord)!.name)}撤退，或 ${lv.turnLimit} 回合内未能取胜</li></ul>` +
    '<p class="sub" style="margin:0">左键选择部队、移动、下令；右键或 Esc 取消；方向键卷动地图；回车结束回合。</p>' +
    '<div class="row"><button class="btn" data-go="new">出阵</button></div>');
}
function showResult() {
  mode = 'over';
  renderTurn();
  const won = b.stage === 'won';
  screen(
    `<h1 class="${won ? '' : 'lost'}">${won ? '胜利' : '败北'}</h1><p class="sub">${esc(b.reason)}</p>` +
    `<p>历时 ${Math.min(b.round, levelOf(b).turnLimit)} 回合${won ? `，所得军资 ${b.gold} 金` : ''}。</p>` +
    `<div class="row"><button class="btn" data-go="next">${won || (currentStep(CAMPAIGN, story) as Extract<Shown, { t: 'battle' }>).lose !== undefined ? '继续' : '重新开始'}</button>` +
    (won ? '' : '<button class="btn" data-go="title">回到标题</button>') + '</div>', true);
}

/** 开始一场战斗：d 为读档数据；null 表示新开流程当前停着的那一关，带上此前的成长。 */
function begin(d: Battle | null) {
  $('log').replaceChildren();
  let evs: Ev[] = [];
  if (d) b = d;
  else ({ b, evs } = newBattle(levelById((currentStep(CAMPAIGN, story) as Extract<Shown, { t: 'battle' }>).level)!, Number(params.get('seed')) || Date.now(), story.roster));
  const lv = levelOf(b);
  scene.setBattle(b);
  shown = sel = pick = null;
  mode = 'busy';
  renderUnit(null);
  renderTile(0, 0);
  const lord = bySlot(b, lv.lord)!;
  void scene.focus(lord.x, lord.y, true);
  void present(evs).then(() => {
    mode = 'idle';
    renderTurn();
    if (!d) log(`目标：${lv.goal}。`);
  });
}

// ---------------------------------------------------------------- 启动 ----
const sysButtons: [string, string, () => void][] = [
  ['回合结束', 'wide', () => void endTurn()],
  ['胜利条件', '', () => void talk('', `胜利：${levelOf(b).goal}。失败：${bySlot(b, levelOf(b).lord)!.name}撤退，或 ${levelOf(b).turnLimit} 回合内未能取胜。`)],
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
      Object.assign(window, { __yjz: { get b() { return b; }, get story() { return story; }, get mode() { return mode; }, scene } });
    }
    b = newBattle(SISHUI, 1).b; // 标题画面背后的静态战场
    scene.setBattle(b);
    renderUnit(null);
    fit();
    void document.fonts.load('12px Pixel').then(() => showTitle());
  };
  scene.sys.settings.status >= Phaser.Scenes.RUNNING ? start() : scene.events.once('ready', start);
});
