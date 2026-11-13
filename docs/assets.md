# 素材清单：原版像素还原

所有素材都在 `public/assets/` 下，运行时不加载任何外链。**画面与音乐逐像素/逐字节取自自己持有的原版
《三國志英傑傳》繁体中文 DOS/V 版（KOEI 1995，第三波发行）**，没有重绘、没有 AI 生成，
也没有引入第三方美术包。原版文件放在本机 `/Users/mac/Downloads/三国英杰传`，不进构建、不进提交。

## 许可提醒

原版游戏的图像、音乐与字体著作权归 KOEI（现光荣特库摩）及中文版发行方所有。本仓库是**个人持有原盘、
本机自用的复刻研究**；替换后的素材**不要公开发布、部署到公网或随仓库分发**。若要公开分享，请先按文末步骤
把 `public/assets/` 换回不含原版素材的 CC0/公有领域版本，或自行取得授权。

## 提取链

原版文件是 DOS 时代的私有格式，直接读不出来。三步把它解成网页要用的 PNG/MP3（工具来自开源项目
[eiketsuden-reloaded](https://github.com/jeiel85/eiketsuden-reloaded)，格式依据其
`docs/reverse-engineering/FORMATS.md`；本机编译的是 `main` 分支）：

```bash
# 1. 逐项解包：LS11/Ls11 容器、TF-DCE 图像压缩、4bpp planar、MAIN.EXE 里的 16 色调色板
hero-tools original extract "原版目录" --out <EXTRACT> --edition chinese-dos
# 2. 按语义打包：640×400 战斗画面框、事件插画、按名字对应的头像
hero-tools original pack "原版目录" --out <PACK> --base <eiketsuden-reloaded>/data/base --edition chinese-dos
# 3. 裁切 + 整数倍放大 + 拼版 + 音乐转码，生成整部游戏要用的文件
python3 tools/make_full_assets.py <EXTRACT> <PACK>
```

第 3 步只做 `NEAREST` 整数倍放大、逐像素拼版与 mp3 转码，**不改动任何一个原版像素的颜色**。
依赖 Pillow、numpy、ffmpeg。调色板是 `MAIN.EXE` 文件偏移 `0x37CDA` 处的 9 组 × 16 色
（4bit B,R,G 按 VGA DAC 扩成 6bit），战场/兵种用 slot 1，头像/界面用 slot 0；完整色值存于 `public/assets/palette.json`。

## 逐项来源

| 文件 | 内容 | 原版来源 | 规格 |
|---|---|---|---|
| `maps/*.png` | 58 张战场地图（整部游戏） | `HEXZMAP.R3` 的各条记录：图块索引 + 地形码；图块来自 `HEXZCHP.R3` | 原版 896×512（每格 32px），3 倍放大成 2688×1536 |
| `maps/<map>_p<i>.png` | 15 张地形补丁（火、水攻、落石、桥断等） | `HEXZMAP.R3` 同一条记录里的地形变体 | 同上 |
| `tokens.png` | 39 列棋子（19 兵种 × 2 阵营 + 刘备旗步兵）× 4 行：站立、迈步、已行动站立、已行动迈步；后两行去饱和 | `HEXZCHR.R3`：47 个 32×64 双帧兵种图标（**上半站立、下半迈步**，原版走路时两帧交替）；按原版选图规则偶数（橙）= 我军/友军、奇数（绿）= 敌军 | 96×96 帧，39 列 × 4 行（156 帧） |
| `faces/*.png` | 240 张武将头像 | `FACEDAT.R3` 的 240 张 TF-DCE 压缩头像，编号由 `BAKDATA.R3` 武将记录 +14 字节给出 | 64×80，原版原尺寸 |
| `portraits/_unknown.png` | 杂兵（无武将记录） | `HEXZCHR.R3` 短兵图标放大 2 倍放进 64×80 框（原版状态窗给杂兵显示的也是兵种图） | 64×80 |
| `pictures/*.png` | 31 张事件插画 | `PACKGRP.R3` 第 3–33 项 | 224×144，界面按 2 倍摆进舞台 |
| `maps/campaign/000–003.png` | 4 张章节行军图（序章与第一章共用第一张，其后每章一张） | `MMAP.R3`（调色板用 `MMAPBGPL.R3` 第 0 项）；哪章用哪张由 `MAIN.EXE` 的每章尺寸表对出 | 原 1536² 到 1920×1408，缩到长边 1024 后量化 64 色，共 1.1MB |
| `title.png` | 标题页底图：金龙纹框、深蓝斜纹、两张事件插画、龙纹 | `PACKGRP.R3` 第 1 项（640×400 战斗画面框）与第 3–33 项 | 640×480 |
| `ui/gold.png` | 金龙纹边框的 3×3 九宫格，CSS `border-image` 用 | `PACKGRP.R3` 第 1 项的四角与四边 | 48×48，slice 16 |
| `ui/blue.png` / `dragon.png` / `titlebar.png` | 深蓝斜纹底纹、右下龙纹、顶部蓝色标题条 | 同上 | 32×32 / 176×112 / 176×24 |
| `battle/scene.png` | 攻击时的战斗特写背景（天空/地平线 + 石地） | `HEXBMAP.R3` 第 0、5 号条带 + `HEXBCHP.R3` 的 224 个背景图块 | 416×160 |
| `battle/unit-N.png` | 旧的静态特写大图（配好帧动画演员后不再显示，保留作回退） | `HEXBCHR.R3` 各兵种帧组的首帧 | 64×64 |
| `cutin/*.png` | 18 个兵种的战斗特写帧图集 | `HEXBCHR.R3` 的兵种帧组，每个兵种取 150 帧连续帧 | 一帧 80×80；16 列网格（10 行，共 1280×800） |
| `duel/guan_yu.png`、`zhang_fei.png`、`lu_bu.png` | 单挑专属图集 | `HEXBCHR.R3` 里三名武将的骑马帧 | 15 帧，96×96 一行（1440×96） |
| `duel/left.png`、`right.png` | 通用单挑骑将（其余武将共用） | 同上，取两套通用骑将帧 | 15 帧，96×96 |
| `duel/terrain_*.png` | 10 张单挑地形背景（平原、树林、山、河、桥、城墙、城、草地、村庄、荒地…） | `HEXBMAP.R3` 的战场条带按地形拼成 | 416×208 |
| `bgm/*.mp3` | 10 首原版 BGM：title / peace / camp / battle / boss / enemy / tension / sad / defeat / ending | 原版 BGM 数据（`hero-tools` 解出的音轨），ffmpeg 转 mp3 | 44.1kHz 单声道 |
| `sfx/*.wav` | 21 个动作音效：cursor / confirm / cancel / error / step / hit / hit_heavy / arrow / fire / water / rock / heal / morale_up / morale_down / confuse / levelup / retreat / treasure / phase / victory / defeat | **非原版**：CC0 的 Ninja Adventure，经 eiketsuden-reloaded 的 `build_audio.py` 裁切淡出；原版效果音由 `SBOPL2.COM` 在 OPL2 上实时合成，乐谱经 `int 66h`（`ah=0`，`ds:dx` 指向数据）送出，尚无提取器 | 16-bit 单声道 44.1kHz，共 959KB |
| `fx/*.png` | 11 张特效贴图（斩痕、箭、火焰、烟、光点、光环、旋涡、迸溅） | `trace_06`/`flame_05`/`flame_06` 取 `HEXBCHR.R3` 169/154/157 号帧的轮廓；其余抽象粒子按原版 16 色硬像素风格用代码画 | 256×256，白色 + alpha，运行时染成调色板色 |
| `fx/original/*.png` | 原版彩色特效帧留档：火、水、石、箭、音符、虎 | `HEXBCHR.R3` 154–175 号 | 64×64 |
| `palette.json` | 原版 9 组 16 色 VGA 调色板 | `MAIN.EXE` 偏移 `0x37CDA` | JSON |
| `font/fusion-pixel-12px-zh_hans.woff2` | 界面像素字体 | **非原版素材之一**：Fusion Pixel 12px，SIL OFL 1.1（同目录 `OFL.txt`）。原版字库 `ZIKU.16P` 是 Big5 点阵，没有现成的 Unicode 网页字体，故用像素字体逼近 DOS 观感 | woff2 |

**非原版素材只有两处**：上面的像素字体和 `sfx/*.wav` 音效，其余画面与音乐都逐像素 / 逐音符取自原版盘。
音效的授权、来源与「为什么不是原版」写在 `public/assets/CREDITS.md`。

界面其余部分（兵力条、高亮格、按钮、飘字、对阵条边框）由 CSS 和运行时绘制，配色全部取自上表调色板：
黑 `#000000`、蓝 `#2045aa`、亮蓝 `#8acfff`、橙 `#ef6500`、绿 `#00ba75`、金 `#ffcf55`、白 `#ffffff`。

## 战斗特写的帧表

每个兵种的 150 帧切成三段，切法统一，由 `tools/make_full_assets.py` 的 `CUTIN` 表给出
（兵种号、文件名、原版起始帧、待机帧数、出手帧数、命中帧）：

| 段 | 帧号 | 帧率 | 说明 |
|---|---|---|---|
| 待机 | 0–59（60 帧） | 30fps | 循环播放，**呼吸**：pivot(46) 以上的躯干逐帧抬 1px 再落下 |
| 出手 | 60–119（60 帧） | **60fps** | 播一遍；第 107 帧（局部第 47 帧）是命中帧 |
| 受击 | 120–149（30 帧） | 30fps | 命中帧由守方播，播完接回待机 |

- 图集排成 **16 列网格**而不是一行 150 帧。150×80=12000px 超过显卡/软件渲染的 8192 上限，
  整张图会变黑块——这是早期版本「特写横幅两团黑」的原因。
- 帧号仍按行优先连续排，`manifest.json` 的 `cutin.actors` 里 `frames` 与三段动作的帧号都不变，
  换排布不影响帧表。
- 段长与原版一致：原版每个兵种的「站立—出手—受击」是同一组连续帧，这里按同样的顺序切，
  只是把待机段补齐到 60 帧以做出呼吸循环。
- `cls17 民众` 只有 3 帧走路的样子、没有攻击动作，所以不给演员；这类部队和没配图的关卡一样，退回棋子前冲的演法。

## 单挑演出

- 图集是 15 帧一行（96×96）：0 待机、1–4 冲锋、5–10 攻击（多段连击）、11/12/14 落马、4/3/2/1 回马。
- `acts` 表决定演出顺序：`charge`（2,3,4）、`strike`（5…10 循环，次数由 `n` 决定）、
  `fall`（11→12→14）、`back`（4,3,2,1）。
- 背景按战场中心格的地形取 `duel/terrain_*.png`，所以平地、桥、城下打起来背景不同。

## 上一版遗留文件

`public/assets/` 里还留着上一版「纸本舆图」与早期单关演示的文件：`sishui.png`、`sishui.jpg`、`title.jpg`、
`faces.png`、`tiles.png`、`units.png`、`fire.png`、顶层 `units/*.png`、`portraits/` 下除 `_unknown.png` 之外的旧头像，
以及 `font/wenkai-subset.woff2`。它们**当前版本不再加载**，只为方便对照/回退而保留，可以安全删除。
`manifest.json` 的 `levels` 段只剩汜水关一条旧记录（现在关卡由 `Level.map` 直接指定素材）。

## 回到不含原版素材的版本

```bash
# 四样输入：Cartography Pack、Particle Pack、eiketsuden-reloaded 克隆、LXGWWenKai-Medium.ttf
python3 tools/make_assets.py <cartography> <particles> <reloaded> <font.ttf>
```

该脚本会重新生成纸本舆图与古画头像（CC0 / 公有领域），覆盖同名文件。它末尾会把当时的
`docs/assets.md` 拷成 `public/assets/CREDITS.md`，所以公开分发前请按实际使用的素材版本核对署名文件。
