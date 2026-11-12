# 原版资源库（`original/`）

这里放的是从自己持有的《三国志英杰传》**繁体中文 DOS/V 版**（KOEI 1995，第三波发行）原盘
`/Users/mac/Downloads/三国英杰传` 提取出的**全部**资源，不止汜水关一关：58 张战场地图、
240 张武将头像、全兵种与战斗动画、大地图/城镇/宫殿、事件插画、界面框、剧本对话和音乐。

网页的 `public/assets/` 只是从这里挑出汜水关需要的一小部分，重新裁切放大后的成品；
这里是**原始提取结果**，按 `hero-tools` 的输出结构原样保留，方便以后做别的关卡或查证。

## 目录

| 路径 | 内容 | 数量 |
|---|---|---|
| `extract/gfx/original/facedat/` | 武将头像，64×80，编号 = `BAKDATA.R3` 武将记录的头像号 | 240 |
| `extract/gfx/original/hexzchr/` | 战场兵种图标，32×64（上下两帧）；偶数橙=我军、奇数绿=敌军 | 47 |
| `extract/gfx/original/hexbchr/` | 战斗特写动画帧，64×64（末尾 12 个是 48×48），按兵种分组 | 181 |
| `extract/gfx/original/hexichr/` | 骑马武将单挑大图，96×96 | 78 |
| `extract/gfx/original/hexzchp/` | 战场图块库：0 号 80 块通用、1/2 号 174/175 块草原/山地 | 3 |
| `extract/gfx/original/hexbchp/` | 战斗特写背景图块（天空、山、地面） | 1 |
| `extract/gfx/original/hexgrp/` | 战斗 UI 图标（packed planar，32×912） | 1 |
| `extract/gfx/original/mmapbgpl/`、`smapbgpl/` | 大地图、城镇/宫殿图块库 | 1 / 2 |
| `extract/gfx/original/sheets/` | 各归档的整表对照图，肉眼核对用 | 9 |
| `extract/gfx/original/maps/battle/` | **58 张完整战场图**（`000.png` = 汜水关 896×512）另加 2 张图块库 | 60 |
| `extract/gfx/original/maps/scene/` | 战斗特写条带：0–4 天空/地平线、5–8 地面 | 9 |
| `extract/gfx/original/maps/campaign/`、`town/` | 章节大地图、城镇与宫殿画面 | 4 / 35 |
| `extract/maps/`、`extract/text/` | 58 关地图数据与地形表、全部剧本/对话文本（UTF-8） | JSON |
| `extract/index.json`、`gfx/original/palettes.json`、`sprites.json` | 提取索引、9 组 16 色 VGA 调色板、每个精灵的几何/分组说明 | JSON |
| `pack/gfx/ui/` | 原版 640×400 战斗画面框、主营画面框、512×320 状态窗 | 3 |
| `pack/gfx/pictures/` | 剧情事件插画，224×144 | 31 |
| `pack/gfx/maps/` | 按关卡 id 命名的战场图 `hexz_NN.png` 与剧情中改变的格子图 | 73 |
| `pack/gfx/units/`、`tiles/`、`duel/` | 按兵种/阵营命名的引擎用图、地形图块、单挑场面（由原版像素重排） | 58+ |
| `pack/gfx/portraits/` | 按武将拼音命名的头像 | 117 |
| `pack/bgm/` | 由原版 OPL 乐谱渲染的 10 首 WAV | 10 |
| `pack/battles/`、`dramas/`、`rules/`、`maps/` | 从原版剧本转换出的关卡、剧情与规则 TOML | — |

**已排除** `pack/gfx/remake/`：那是参考项目自己重绘的地图，不是原版像素，与原版资源无关。

## 格式速查

- `.R3` 多为 `LS11`/`Ls11` 容器（大小写决定目录字节序），头 0x10 起是 256 字节字典，0x110 起是
  `[压缩长度][原长][偏移]` 目录；`FACEDAT.R3`、`PACKGRP.R3` 是 6 字节表容器。
- 图像是 **4bpp 平面格式**：16×16 图块 = 4 平面 × 32 字节 = 128 字节，MSB 是最左像素，
  平面 p 是颜色位 p，颜色 0 透明。头像/插画用 `TFDED.COM` 的 **TF-DCE** 压缩。
- 调色板不在数据文件里，而在 `MAIN.EXE` 偏移 `0x37CDA`：9 组 × 16 色，4bit B,R,G 按 VGA DAC 扩成 6bit。
  战场/兵种用 slot 1，头像/界面用 slot 0。
- **朝向**：`HEXZCHR` 只存了一个方向（骑兵马头一律朝右），游戏运行时靠左右镜像生成反方向。
  网页版在 `src/scene.ts` 里按阵营和移动方向做 `setFlipX`，所以原始 PNG 不要预先翻转。
- 完整规格见参考项目 `docs/reverse-engineering/FORMATS.md`（本仓库未附带，见下方链接）。

## 重新生成

```bash
git clone --depth 1 https://github.com/jeiel85/eiketsuden-reloaded.git /tmp/eiketsuden-reloaded
cargo build --manifest-path /tmp/eiketsuden-reloaded/Cargo.toml --release -p hero-tools
T=/tmp/eiketsuden-reloaded/target/release/hero-tools
GAME="/Users/mac/Downloads/三国英杰传"

$T original extract "$GAME" --out /tmp/yjz-original --edition chinese-dos
$T original pack    "$GAME" --out /tmp/yjz-pack \
      --base /tmp/eiketsuden-reloaded/data/base --edition chinese-dos

rsync -a /tmp/yjz-original/ original/extract/
rsync -a --exclude='/gfx/remake/' /tmp/yjz-pack/ original/pack/
# 再生成网页成品：
python3 tools/make_original_assets.py /tmp/yjz-original /tmp/yjz-pack
```

## 版权

原版图像、音乐与文本著作权归 KOEI（现光荣特库摩）及中文版发行方所有。本目录只是**个人持盘、
本机研究**的提取结果，所在 GitHub 仓库设为**私有**；不要公开发布、转售或再分发。
`pack/bgm/` 是依据原版乐谱渲染的衍生音频，同样受此限制；`pack/gfx/portraits/` 中有少量
参考项目自绘的补充头像（非原版），逐项记录见 `pack/original-pack.json`。
