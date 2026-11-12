# 整部游戏的流程与关卡框架

游戏内容全部是数据：引擎读 `src/data/game.json`，那是从自己持有的原版盘里转出来的
**整部《三國志英傑傳》**——5491 步流程、610 幕插剧、70 场战斗、58 张战场地图、129 名武将。
下面说这份数据长什么样、引擎怎么消费它。

```
原版盘 ──hero-tools original extract/pack──▶ original/{extract,pack}
                                              │
                     tools/build_campaign.py  │  剧本 / 战斗 / 武将 / 道具 → JSON
                                              ▼
                                    src/data/game.json  （1.4 MB，前端直接 import）
                                              │
                        src/data/game.ts      │  装配成 Level / Script
                                              ▼
                    src/rules/*（规则）   src/story.ts（流程）   src/main.ts（界面）
```

重新生成：

```bash
python3 tools/build_campaign.py                    # → src/data/game.json
python3 tools/make_full_assets.py <EXTRACT> <PACK> # → public/assets/**（图、音乐）
```

生成脚本只做格式转换（繁中原样保留，只清掉参考包里混进来的韩文模板字），不改台词、不改数值；
输出末尾会自检「缺失标签 / 缺失关卡 / 缺失地图」，都应为 0。

## 1. 流程脚本

一份脚本从头演到尾，对话、旁白、选择、营地、单挑、战斗、结局都只是其中的一步（`src/story.ts`）。

| 步骤 | 写法 | 作用 |
|---|---|---|
| 对话 | `{ t: 'say', who, text }` | 头像按 `who` 查 `faces` 表，等玩家点一下 |
| 旁白 | `{ t: 'text', text }` | 没有头像 |
| 章节 | `{ t: 'title', text }` | 居中横幅（「序章　群雄起兵討伐董卓」） |
| 插画 | `{ t: 'picture', key }` | 原版事件插画 448×288 摆在舞台中央；空串 = 收起 |
| 音乐 | `{ t: 'bgm', key }` | 换 BGM（`public/assets/bgm/<key>.mp3`） |
| 选择 | `{ t: 'choice', who?, text, options: [{ label, set?, goto? }] }` | 必须点一项；`set` 设标志，`goto` 跳标签 |
| 标志 | `{ t: 'set', flag, value }` / `{ t: 'if', flag, is?, cmp?, goto }` | 没设过的标志按原版当 0 |
| 标签 / 跳转 | `{ t: 'label', name }` / `{ t: 'goto', label }` | |
| 队伍 | `{ t: 'join', id }`、`{ t: 'away', id }`、`{ t: 'level', id, n }`、`{ t: 'class', id, cls }`、`{ t: 'item', id }`、`{ t: 'gold', n }` | 加入、离队、剧情升级、转职、得道具、得金 |
| 单挑 | `{ t: 'duel', a, b, acts }` | 整屏两骑对冲，`acts` 是 `charge / strike / fall / back` 的序列 |
| 营地 | `{ t: 'camp', battle, title, shop }` | 出兵准备：编成、道具、商店、存档 |
| 战斗 | `{ t: 'battle', level, win?, lose? }` | 先出战前说明再开战；胜/败后跳到对应标签。不写 `lose` = 败了重打这一关 |
| 结局 | `{ t: 'ending', text }` | |

- 进度 `Story` 是纯数据：`{ script, pc, bg, picture, bgm, cast, flags, roster, party, bag, deploy, gold }`，
  存档原样写入。`pc` 指向正在等玩家的那一步。
- **每幕的标签只在幕内有效**。610 幕拼成一条线后重名极多（`won_1` 出现 40 次），
  `build_campaign.py` 给标签和跳转目标都加上 `幕名~第几次出现:` 前缀（如 `c1_s2_story2~0:ask_1`）。
- 原版剧本里的 `@end`（本幕到此为止）会被转成 `goto 幕末#end` 空标签，接上后面的流程节点。
  早期版本这里漏了转换，进军目标的循环菜单会永远跳不出去。
- 装载时 `checkScript()` 查：标签重复、跳转目标不存在、选择没有选项、战斗/营地引用了没登记的关卡。
  跳转成环、一直不等玩家的脚本，`nextStep()` 报错而不是卡死。

## 2. 关卡

```ts
{ id, name, goal, turnLimit, w, h, terrain: number[], units: UnitInit[], reward,
  map?, tokens?,                       // 素材键（相对 assets/）

  // 旧接口：单主将、单敌将、踩格得金，保留给测试里手写的小关卡
  lord?, boss?, triggers: Trigger[],

  // 整部游戏用这一套
  deploy?: { max, required, forbidden, slots: [x, y][] },
  candidates?: Record<officerId, UnitInit>,  // 可出征的武将模板
  victory?: Victory[], defeat?: Defeat[],
  events?: BattleEvent[], treasures?: Treasure[] }
```

- 槽位沿用原版：0–14 我方（我军 `mode: 7` 由玩家指挥，其余是友军），15–44 敌军。
  友军占 0–14 的高位、出征的我军占 0 起的低位；两拨增援夹在中间，互不撞槽。
- 胜利条件 `commander / all / unit / reach`，任一满足即胜；失败条件 `unit / turn`。
  主将撤退按 `key === 'liu_bei'` 认，其次是关卡数据里的 `lord`。
- 宝物 `treasures`：踩上去就归踩的那支部队（原版只有我方会捡）。
- `registerLevel()` 登记时检查：地形格数、槽位重复、两队同格、站在地图外、兵种不存在、
  引用了不存在的槽位、触发记录重名、出征位不足。

## 3. 战场事件

一场战斗的剧本就是一张 `BattleEvent[]`，全部是数据：

```ts
{ stage?, once?, trigger: { type, … }, actions: BAction[] }
```

| 触发 | 字段 | 何时查 |
|---|---|---|
| `turn_start` | `turn`、`side` | 回合开始（我方阶段） |
| `adjacent` | `a`、`b` | 某部队**行动结束**时，二者四邻相接 |
| `reach` | `who`、`pos`、`radius` | 某部队行动结束时站在目标格（或其半径内） |
| `unit_defeated` | `target` | 某部队被击破 |

| 动作 | 作用 |
|---|---|
| `drama` | 播一幕插剧（对话、插画、单挑、选择，见 §1 的步骤） |
| `flag` | 写战场变量 `b.vars`，战后并回流程 `story.flags` |
| `ai` | 改某部队的 AI 指令、目标格、优先目标 |
| `retreat` / `level` / `item` / `gold` | 撤退、剧情升级、给道具、得金 |
| `halve` | 某一阵营全员兵力减半（原版的火计、伏兵） |
| `spawn` | 增援组登场（就近找空格） |
| `terrain` | 改一格地形（火、水攻、落石） |
| `objective` | 改当前胜利条件并提示 |
| `victory` / `defeat` | 立即判胜/判负 |
| `when` | 先判断若干 `Cond`（读 `b.vars`），成立才执行内层动作 |
| `stage` | 原版用来切换行动方，本作由回合流程控制，保留但不生效 |

`once` 默认 true，触发过就记进 `b.flags` 的 `event:<序号>`。所有事件在**部队行动结束**（含待命）
时统一判定——纯移动不触发，这与原版「行动终了时查脚本」一致。

## 4. 出兵准备（营地）

`camp` 步骤给出这一关的关卡、标题和商店货单（道具号），界面把它渲染成两栏：

- 左栏**编成**：队伍全员列出，`required`（必带）锁定，`forbidden`（不能出战）禁用，
  出征人数上限取 `deploy.max`；
- 右栏**道具**：选中的武将的 8 格包袱 ↔ 公共包袱互转；下面是可以买的道具与价钱；
- 底部**存檔**（只存流程）和**出陣**（把名单写进 `story.deploy`，然后进战前说明）。

商店价钱原版道具表里没有，`src/main.ts` 的 `PRICE` 按道具档次自定了一份。

## 5. 队伍继承

- 战斗胜利后，`harvest()` 把玩家指挥过的部队按武将 id 记下等级、经验、道具、兵种，存在 `Story.roster`；
  军资累加进 `Story.gold`。
- 下一战开始时，`deploy` 名单里的武将带着这些出场（兵力和策略值按等级回满）；友军和敌军始终用关卡数据。
- 剧情里的 `join / away / level / class / item` 由 `main.ts` 的 `StoryApi` 落到 `party / roster / bag` 上。
  129 名武将里在剧本中登场的那批就是靠这一套逐章入队的。

## 6. 存档

一个栏位，键 `yjz.save.v3`，内容 `{ story, battle? }`：

- 营地里存 = 只存流程；战斗中、我军阶段存 = 连战斗状态（含随机数种子、回合、行动标记、已触发事件）一起存。
- 读档时校验脚本 id、关卡、地形格数、`stage === 'player'`，不合格就当没有存档。
- 旧键 `yjz.save.v2` / `yjz.sishui.save.v1` 不再识别。

## 7. 画面

- **地图**：`public/assets/maps/<map>.png`，原版 896×512 三倍放大成 2688×1536；地形被事件改变时
  用同目录的地形补丁图叠上去。清单 `manifest.json` 的 `levels` 只有汜水关一条旧记录，
  其余关卡直接由 `Level.map` 指定。
- **棋子**：`tokens.png`，一格 96×96。第一行按「兵种×2+阵营」排（19 兵种 × 2 + 刘备旗步兵 = 39 帧），
  第二行是同帧的去饱和版（本回合已行动）。棋子图本身朝右，朝左由引擎镜像。
- **头像**：`faces/*.png`（240 张，原版 64×80）；杂兵用 `portraits/_unknown.png`。
- **事件插画**：`pictures/*.png`（31 张，原版 224×144，按 2 倍摆进舞台）。
- **战斗特写**：`cutin/<兵种>.png`，每个兵种 150 帧 × 80×80：0–59 待机（呼吸）、60–119 出手（60fps）、
  120–149 受击。见 `docs/assets.md`。
- **单挑**：`duel/`——关羽、张飞、吕布三张专属图集（15 帧 96×96），其余用 `left.png`/`right.png`；
  背景按战场中点地形取 `terrain_*.png`（10 张）。
- **音乐**：`bgm/` 10 首原版曲目转成 mp3，`bgm` 步骤切换，标题/战斗/结局各有曲目。

## 8. 测试与验证

| 检查 | 内容 |
|---|---|
| `npx vitest run`（73 项） | 规则公式与原版对照、汜水关整场模拟、剧情脚本、**整部剧本数据**（装载检查、70 关都能开打、120 遍随机走查不卡死、战场事件触发） |
| `npm run typecheck` / `npm run build` | 类型与生产构建 |
| `node tests/e2e.mjs`（12 项） | 真实鼠标键盘：标题 → 序章 → 营地（买豆、装道具、存档）→ 战前说明 → 战场 → 战斗特写逐帧 → 存档读档 → 单挑斩华雄 → 胜利 → 战后剧情 → 下一关 → 刷新读档 → 败北重开 |
| `node tests/prod-smoke.mjs` | 生产构建里跑一遍「标题 → 序章 → 营地 → 汜水關之戰 → 第 2 回合」 |

## 9. 已知差异 / 还没做

- 我军的**布阵**还不能自选格子：出征名单可选，站位用关卡数据里的出兵位按顺序分配。
- 道具指令只有「使用」，没有「给予 / 丢弃」；策略只实现了攻击系单体。
- 战场上的部队只用站立帧，靠位移表现移动（原版有逐帧行走动画）。
- 单挑的招式映射是按 `acts` 表驱动的固定演出，不是原版逐帧脚本。
- 音乐是整曲循环，没有按战场形势切换。
- 没有实机运行过原版做逐帧对比（规则依据见 `docs/rules.md` §4）。
