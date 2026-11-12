# 流程与关卡框架

引擎和内容是分开的：引擎读下面三种数据，内容怎么填由数据决定。仓库里的示例内容只有一条流程
（`src/data/campaign.ts`，文字自撰）和一关（`src/data/sishui.ts`）。

## 1. 流程脚本（剧情 + 战斗的先后）

一份脚本从头演到尾，对话、旁白、选择、战斗都只是其中一步。类型定义在 `src/story.ts`。

| 步骤 | 写法 | 作用 |
|---|---|---|
| 背景 | `{ t: 'bg', key: 'title' }` | 换背景图，界面按 `public/assets/<key>.png` 找；空串 = 不用背景 |
| 对话 | `{ t: 'say', who: '刘备', text: '…' }` | 头像按说话人名字找，等玩家点一下 |
| 旁白 | `{ t: 'text', text: '…' }` | 没有头像，等玩家点一下 |
| 选择 | `{ t: 'choice', who?, text, options: [{ label, set?, goto? }] }` | 必须点一项；`set` 设标志，`goto` 跳到标签 |
| 设标志 | `{ t: 'set', flag, value }` | 值可以是字符串、数字、布尔 |
| 条件跳转 | `{ t: 'if', flag, is?, goto }` | 标志等于 `is` 就跳；不写 `is` = 标志为真就跳 |
| 标签 / 跳转 | `{ t: 'label', name }`、`{ t: 'goto', label }` | |
| 战斗 | `{ t: 'battle', level: 'sishui', win?, lose? }` | 先出战前说明再开战；胜/败后跳到对应标签。不写 `lose` = 败了重打这一关 |
| 结束 | `{ t: 'end' }` | 走到脚本末尾也算结束 |

- 进度 `Story` 是一个纯数据对象：`{ script, pc, bg, flags, roster, gold }`，存档时原样写入。
- 战斗胜利后，这一战触发过的事件会以 `关卡id.事件名` 记进 `flags`（例如 `sishui.duel`），战后剧情可以用 `if` 分支。
- 装载时 `checkScript()` 会查：标签重复、跳转目标不存在、选择没有选项、战斗引用了没登记的关卡。错了直接报第几步。
- 跳转成环、一直没有等玩家的步骤，`nextStep()` 会报错而不是卡死。

## 2. 关卡

`Level`（`src/rules/turn.ts`）现在全部是数据，没有函数：

```ts
{ id, name, goal, turnLimit, w, h, terrain: number[],   // 地形码逐格，长度 w×h
  units: [{ slot, name, face, cls, level, lead, str, int, x, y, mode, items? }],
  lord, boss, reward,                                   // 撤退即败的槽位、击破即胜的槽位、胜利军资
  triggers: [{ flag, who, at? | next?, effects: [...] }] }
```

- 槽位 0–14 是我方（`mode: 7` 由玩家指挥，其余是友军），15–44 是敌军。
- 触发条件两种：`at: [x, y]` 部队到达某格；`next: '名字'` 行动后与某部队相邻。`who` 是行动部队的名字，`null` = 任意我方部队。每条只触发一次。
- 效果 `effects` 依次执行：`gold`（得金）、`item`（道具给触发的部队）、`talk`（对话）、`duel`（单挑演出）、`levels`（剧情升级）、`retreat`（部队离场）。
- 胜败：`boss` 离场或敌军全灭即胜；`lord` 离场或超过 `turnLimit` 回合即败。
- `registerLevel()` 登记时检查：地形格数、槽位重复、两队同格、站在地图外、兵种不存在、引用了不存在的槽位、触发记录重名。

加一关：做出一个 `Level` 对象，在 `src/main.ts` 开头 `registerLevel()`，再在流程脚本里写一步 `battle`。

## 3. 队伍继承

- 战斗胜利后，玩家指挥的部队（含中途撤退的）按名字记下等级、经验、道具，存在 `Story.roster`；军资累加到 `Story.gold`。
- 下一战开始时，同名的玩家部队带着这些出场，兵力和策略值按新等级回满。友军和敌军始终用关卡数据。
- 这一套是框架自己的约定。原版两战之间保留什么、兵力是否回满，**没有核对过**，不算在规则忠实度里。

## 4. 存档

一个栏位，键 `yjz.save.v2`，内容 `{ story, battle }`。只能在战斗中、我军阶段存；读档回到那一刻，流程进度一并恢复。
旧版只存战斗的档（`yjz.sishui.save.v1`）仍能读，读入时补一份停在该关的流程进度。

## 还没做

- 场景一次只装载一关的地图和棋子图，文件名写死在 `src/scene.ts`；第二关的画面装载要等素材清单（下一步）。
- 战前自由选将和布阵：出场部队目前完全由关卡数据决定。
- 剧情中途存档、多栏位存档、商店、换装备、兵种升级。
