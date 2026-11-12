# 素材清单：原版像素还原

所有素材都在 `public/assets/` 下，运行时不加载任何外链。**画面素材逐像素取自自己持有的原版
《三国志英杰传》繁体中文 DOS/V 版（KOEI 1995，第三波发行）**，没有重绘、没有 AI 生成，
也没有引入第三方美术包。原版文件放在本机 `/Users/mac/Downloads/三国英杰传`，不进构建、不进提交。

## 许可提醒

原版游戏的图像、音乐与字体著作权归 KOEI（现光荣特库摩）及中文版发行方所有。本仓库是**个人持有原盘、
本机自用的复刻研究**；替换后的素材**不要公开发布、部署到公网或随仓库分发**。若要公开分享，请先按文末步骤
把 `public/assets/` 换回不含原版素材的 CC0/公有领域版本，或自行取得授权。

## 提取链

原版文件是 DOS 时代的私有格式，直接读不出来。两步把它解成 PNG（工具来自开源项目
[eiketsuden-reloaded](https://github.com/jeiel85/eiketsuden-reloaded)，格式依据其
`docs/reverse-engineering/FORMATS.md`；本机编译的是 `main` 分支）：

```bash
# 1. 逐项解包：LS11/Ls11 容器、TF-DCE 图像压缩、4bpp planar、MAIN.EXE 里的 16 色调色板
hero-tools original extract "原版目录" --out <EXTRACT> --edition chinese-dos
# 2. 按语义打包：640×400 战斗画面框、事件插画、按名字对应的头像
hero-tools original pack "原版目录" --out <PACK> --base <eiketsuden-reloaded>/data/base --edition chinese-dos
# 3. 裁切 + 整数倍放大 + 拼版，生成网页要用的文件
python3 tools/make_original_assets.py <EXTRACT> <PACK>
```

第 3 步只做 `NEAREST` 整数倍放大和拼版，**不改动任何一个原版像素的颜色**。依赖 Pillow。
调色板是 `MAIN.EXE` 文件偏移 `0x37CDA` 处的 9 组 × 16 色（4bit B,R,G 按 VGA DAC 扩成 6bit），
战场/兵种用 slot 1，头像/界面用 slot 0；完整色值存于 `public/assets/palette.json`。

关卡与规则数据本来就是从原版读出来的（`tools/extract.py`），这次只换画面，规则层一行没动。

## 逐项来源

| 文件 | 内容 | 原版来源 | 规格 |
|---|---|---|---|
| `sishui.png` | 汜水关整张战场 | `HEXZMAP.R3` 第 0 项：56×32 个图块索引 + 28×16 地形码；图块来自 `HEXZCHP.R3` 第 0 项（80 块）与第 2 项（175 块） | 原版 896×512（每格 32px），3 倍放大成 2688×1536 |
| `tokens.png` | 12 支部队的棋子，第二行是「本回合已行动」 | `HEXZCHR.R3`：47 个 32×32 双帧兵种图标。按原版选图规则：偶数（橙）= 我军/友军、奇数（绿）= 敌军，刘备用 38 号旗步兵 | 96×96 帧，12 列 × 2 行 |
| `portraits/*.png` | 刘备、关羽、张飞、公孙瓒、陶谦、华雄、李肃、胡轸、赵岑 | `FACEDAT.R3` 的 240 张 TF-DCE 压缩头像，编号由 `BAKDATA.R3` 武将记录 +14 字节给出（0/1/2/107/189/138/139/140/200） | 64×80，原版原尺寸 |
| `portraits/_unknown.png` | 杂兵（无武将记录） | `HEXZCHR.R3` 短兵图标放大 2 倍放进 64×80 框（原版状态窗给杂兵显示的也是兵种图） | 64×80 |
| `title.png` | 标题页底图：金龙纹框、深蓝斜纹、两张事件插画、龙纹 | `PACKGRP.R3` 第 1 项（640×400 战斗画面框）与第 3–33 项（224×144 事件插画） | 640×480 |
| `ui/gold.png` | 金龙纹边框的 3×3 九宫格，CSS `border-image` 用 | `PACKGRP.R3` 第 1 项的四角与四边 | 48×48，slice 16 |
| `ui/blue.png` / `dragon.png` / `titlebar.png` | 深蓝斜纹底纹、右下龙纹、顶部蓝色标题条 | 同上 | 32×32 / 176×112 / 176×24 |
| `battle/scene.png` | 攻击时的战斗特写背景（天空/地平线 + 石地） | `HEXBMAP.R3` 第 0、5 号条带 + `HEXBCHP.R3` 的 224 个背景图块 | 416×160 |
| `battle/unit-N.png` | 旧的静态特写大图（清单配好演员后不再显示，保留作回退） | `HEXBCHR.R3` 各兵种帧组的首帧 | 64×64 |
| `cutin/*.png` | 18 个兵种的战斗特写帧图集，清单 `cutin.actors` 按 `cls兵种号` 引用 | `HEXBCHR.R3` 的兵种帧组：短兵 0–7、长兵 8–15、战车 16–23、弓兵 24–29、连弩 30–35、发石车 36–45、轻骑兵 46–55、重骑兵 56–65、近卫队 66–75、山贼 76–83、恶贼 84–91、义贼 92–99、军乐队 100–108、猛兽 109–114、武术家 115–122、妖术师 123–133、异民族 134–141、运输队 145–153 | 一帧 64×64；发石车 96×64（原版把机器与乘员分成两帧存，这里按脚底对齐合成一帧） |
| `fx/*.png` | 11 张特效贴图（斩痕、箭、火焰、烟、光点、光环、旋涡、迸溅） | `trace_06`/`flame_05`/`flame_06` 取 `HEXBCHR.R3` 169/154/157 号帧的轮廓；其余抽象粒子按原版 16 色硬像素风格用代码画，不再是 Kenney 素材 | 256×256，白色 + alpha，运行时染成调色板色 |
| `fx/original/*.png` | 原版彩色特效帧留档：火、水、石、箭、音符、虎 | `HEXBCHR.R3` 154–175 号 | 64×64 |
| `palette.json` | 原版 9 组 16 色 VGA 调色板 | `MAIN.EXE` 偏移 `0x37CDA` | JSON |
| `font/fusion-pixel-12px-zh_hans.woff2` | 界面像素字体 | **唯一非原版素材**：Fusion Pixel 12px，SIL OFL 1.1（同目录 `OFL.txt`）。原版字库 `ZIKU.16P` 是 Big5 点阵，没有现成的 Unicode 网页字体，故用像素字体逼近 DOS 观感 | woff2 |

界面其余部分（兵力条、高亮格、按钮、飘字、对阵条边框）由 CSS 和运行时绘制，配色全部取自上表调色板：
黑 `#000000`、蓝 `#2045aa`、亮蓝 `#8acfff`、橙 `#ef6500`、绿 `#00ba75`、金 `#ffcf55`、白 `#ffffff`。

## 战斗特写的帧表

原版每个兵种在一组连续帧里演完整套动作，切法一致：

- 开头 1–2 帧站定，作待机循环；
- 接着到「爆发帧」是出手，爆发帧就是命中帧（`attack.impact`），兵力条在这一帧才掉；
- 最后一帧是后仰受击，播完接回待机。

`tools/make_original_assets.py` 里的 `CUTIN_CLASSES` 就是这张表（起始帧、帧数、待机帧数、命中帧）。
脚本生成图集时会把帧表写进 `public/assets/manifest.json` 的 `cutin`，`levels` 一段是手写内容，原样保留。
`cls17 民众` 只有 3 帧走路的样子、没有攻击动作，所以不给演员；这类部队和没配图的关卡一样，退回棋子前冲的演法。

## 上一版遗留文件

`public/assets/` 里还留着上一版「纸本舆图」的 `sishui.jpg`、`title.jpg`、`faces.png`、`tiles.png`、
`units.png`、`fire.png`、`units/*.png`、`font/wenkai-subset.woff2` 及部分 `fx/*.png`。
它们**当前版本不再加载**，只为方便对照/回退而保留，可以安全删除。

## 回到不含原版素材的版本

```bash
# 四样输入：Cartography Pack、Particle Pack、eiketsuden-reloaded 克隆、LXGWWenKai-Medium.ttf
python3 tools/make_assets.py <cartography> <particles> <reloaded> <font.ttf>
```

该脚本会重新生成纸本舆图与古画头像（CC0 / 公有领域），覆盖同名文件。它末尾会把当时的
`docs/assets.md` 拷成 `public/assets/CREDITS.md`，所以公开分发前请按实际使用的素材版本核对署名文件。
