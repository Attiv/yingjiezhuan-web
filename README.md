# 汜水关之战

《三国志英杰传》（KOEI，1995，PC DOS 版）序章第一战的网页版战斗复刻，非官方。只做这一关：
标题 → 开场剧情 → 战前说明 → 战斗 → 胜利或失败 → 战后剧情。纯前端，本地存档，无后端。
剧情、战斗的先后和关卡本身都是数据，格式见 [docs/framework.md](docs/framework.md)。

关卡数据和数值表直接读自原版文件，核心规则在原版程序里反汇编核对过；证据、状态和已知差异都在
[docs/rules.md](docs/rules.md)。**可玩不等于已对齐原版**：两个状态分开写在那份文档的开头。

## 命令

```bash
npm install
npm run dev -- --port 5273      # 开发服务器 http://127.0.0.1:5273
npm test                        # 规则层与关卡的自动化测试（Vitest）
npm run typecheck               # 类型检查
npm run build                   # 生产构建到 dist/
npm run preview -- --port 5274  # 预览生产构建 http://127.0.0.1:5274
node tests/e2e.mjs              # 浏览器实操验证（需要开发服务器在 5273）
node tests/prod-smoke.mjs       # 生产构建冒烟（需要预览服务器在 5274）
python3 tools/extract.py "<原版目录>"                       # 从自己持有的原版文件重新提取关卡与数值表
python3 tools/make_original_assets.py <EXTRACT> <PACK>     # 从原版提取物组装画面素材，见 docs/assets.md
python3 tools/make_assets.py <四样素材的路径>               # 旧版：换回不含原版素材的 CC0/公有领域画面
```

浏览器脚本用 `~/.cache/ms-playwright` 里的 Chromium；换别的浏览器设环境变量 `CHROME=/path/to/chrome`。

## 操作

- 剧情里点对话框或按回车、空格翻到下一句；遇到选择必须点其中一项。
- 左键点我军部队：选中并显示移动范围。再点范围内的格子移动，点部队自己则原地下令。
- 移动后弹出指令菜单：攻击、策略、道具、待命。没有可选目标的指令是灰的。
- 右键或 Esc：取消。在指令菜单里取消会退回原位，移动作废。
- 点敌军或友军：查看状态和移动范围。
- 方向键卷动地图；回车或右下「回合结束」结束我军阶段。
- 右下还有：胜利条件、全军撤退、存档、读档。存档只有一个栏位，只能在我军阶段、没有部队移动到一半时存。

网址加 `?seed=数字` 可以固定随机种子；开发模式下再加 `&fast` 会跳过动画和对话等待。

## 结构

```
src/rules/     战斗规则，纯 TypeScript，不依赖画面：数值、移动、结算、回合、AI
src/data/      原版数值表 tables.json、原版关卡数据 sishui.json（均由 tools/extract.py 生成）、关卡 sishui.ts、示例流程 campaign.ts
src/story.ts   流程脚本解释器：对话、选择、标志、战斗的先后，纯 TypeScript
src/facing.ts  棋子朝向：面向敌方
src/scene.ts   Phaser 场景：画地图和棋子、播放规则层给出的事件
src/main.ts    操作流程与界面（状态栏、菜单、对话、存读档、整屏）
tests/         自动化测试与浏览器脚本
tools/         原版数据提取、原版像素素材组装（另有旧版素材生成脚本）、浏览器辅助
docs/          规则对照表、素材清单、截图
original/      从原版盘提取的全部资源（58 关地图、240 头像、全兵种/动画/插画/音乐），见 original/README.md
```

玩家和 AI 走同一套行动入口（`src/rules/turn.ts` 里的移动、攻击、策略），合法性检查和结算只有一份。
战斗状态和流程进度都是可以直接 `JSON.stringify` 的对象，存档就是这两样，随机数状态和事件进度都在里面。

## 素材与许可

**画面素材逐像素取自自己持有的原版《三国志英杰传》繁体中文 DOS/V 版**（战场地图、16×16 地形图块、
兵种图标与战斗动画、240 张武将头像、金龙纹界面框与事件插画、16 色 VGA 调色板），
用 `tools/make_original_assets.py` 从原版提取物裁切、整数倍放大拼成网页要用的图，没有重绘。
逐项来源、提取命令和调色板见 [docs/assets.md](docs/assets.md)。界面字体是 OFL 许可的 Fusion Pixel
像素字体（原版 Big5 点阵字库没有现成的 Unicode 网页字体）。

> 原版美术著作权归 KOEI 及中文版发行方所有。这里只是个人持有原盘、本机自用的复刻研究，
> **不要把替换后的素材公开发布、部署到公网或随仓库分发**。若要公开，用 `tools/make_assets.py`
> 换回 CC0/公有领域的「纸本舆图」版本，步骤见 docs/assets.md 末尾。
