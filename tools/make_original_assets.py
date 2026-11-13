#!/usr/bin/env python3
"""把原版《三国志英杰传》（繁体中文 DOS/V 版）的像素素材整理成网页版要用的文件。

素材不是重新画的，而是从自己持有的原版文件里逐像素取出来的。取用两步（见 docs/assets.md）：

    hero-tools original extract <原版目录> --out <EXTRACT> --edition chinese-dos
    hero-tools original pack    <原版目录> --out <PACK> --base <base-pack> --edition chinese-dos
    python3 tools/make_original_assets.py <EXTRACT> <PACK>

EXTRACT 提供 240 张 64×80 头像（FACEDAT）、47 个 32×32 兵种图标（HEXZCHR）、
58 张战场图（HEXZMAP + HEXZCHP）、战斗动画帧（HEXBCHR）和 9 个调色板；
PACK 提供 640×400 的原版战斗画面框（PACKGRP 第 1 项）和事件插画（第 3–33 项）。

本脚本只做裁切、整数倍放大（NEAREST，不插值）和拼版，不改动任何一个原版像素的颜色。
依赖：Pillow。
"""
import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "assets"
RES = 3                 # 与 src/scene.ts 的 RES 一致：画布按 3 倍分辨率画，显示时缩回 1/3
FRAME = 32 * RES        # 一格的画布像素 = 96；原版一格正好 32×32
NEAREST = Image.Resampling.NEAREST

# 武将名 -> BAKDATA.R3 武将记录里的 FACEDAT 头像号（见 tools/extract.py 的 officer()）
PORTRAIT = {
    "liu_bei": 0, "guan_yu": 1, "zhang_fei": 2, "gongsun_zan": 107, "tao_qian": 189,
    "hua_xiong": 138, "li_su": 139, "hu_zhen": 140, "zhao_cen": 200,
}
# HEXBCHR 里各兵种动画帧组的起始编号（FORMATS.md §8.3），做战斗特写用
CLASS_FRAME = [0, 8, 16, 24, 30, 36, 46, 56, 66, 76, 84, 92, 100, 109, 115, 123, 134, 142, 145]

FX_NAMES = ["slash_03", "scratch_01", "trace_06", "flame_05", "flame_06", "smoke_04",
            "star_06", "circle_02", "circle_05", "twirl_01", "scorch_01"]


def rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB")


def up(im: Image.Image, k=RES) -> Image.Image:
    return im.resize((im.width * k, im.height * k), NEAREST)


def ensure_dir(p: Path) -> Path:
    """有些沙箱代理对「已存在的目录 + mkdir(exist_ok=True)」也会报错，所以先判断。"""
    if not p.exists():
        p.mkdir(parents=True)
    return p


# ---------------------------------------------------------------- 战场地图 ----
def make_map(ex: Path) -> Image.Image:
    """HEXZMAP 第 0 项 = 汜水关：56×32 个 16px 图块拼出 896×512，即 28×16 个 32px 格。"""
    im = rgb(ex / "gfx/original/maps/battle/000.png")
    assert im.size == (896, 512), f"汜水关地图尺寸不对：{im.size}"
    big = up(im)
    big.save(OUT / "sishui.png")
    return big


# ---------------------------------------------------------------- 棋子 ----
def token_index(u: dict) -> int:
    """照原版选图标的代码（FORMATS.md §8.2）：偶数是我军橙色、奇数是敌军绿色；
    武将 0（刘备）用 38 号旗步兵，其余按兵种号 ×2 + 阵营。"""
    if u["officer"] == 0:
        return 38
    return u["cls"] * 2 + (1 if u["slot"] >= 15 else 0)


def make_tokens(ex: Path, units: list[dict]) -> None:
    # 早期单关演示用的旧版图集（2 行）。整部游戏的 tokens.png 由 make_full_assets.py
    # 生成 39 列 × 4 行（含 HEXZCHR 的站立 / 迈步两帧），重跑本脚本会覆盖成旧布局。
    sheet = Image.new("RGBA", (FRAME * len(units), FRAME * 2), (0, 0, 0, 0))
    for i, u in enumerate(units):
        n = token_index(u)
        src = rgba(ex / f"gfx/original/hexzchr/{n:03d}.png")
        assert src.size == (32, 64), f"HEXZCHR[{n}] 尺寸不对：{src.size}"
        frame = src.crop((0, 0, 32, 32))          # 上半是第一帧（站立）
        icon = up(frame)                           # 32 → 96，正好铺满一格
        sheet.paste(icon, (i * FRAME, 0))
        # 第二行：本回合已行动。原版没有灰色状态，这里只做去饱和，不改像素形状
        grey = ImageOps.colorize(ImageOps.grayscale(icon.convert("RGB")),
                                 black="#0c1424", white="#7c8aa0").convert("RGBA")
        grey.putalpha(icon.getchannel("A"))
        sheet.paste(grey, (i * FRAME, FRAME))
    sheet.save(OUT / "tokens.png")


# ---------------------------------------------------------------- 头像 ----
def make_portraits(ex: Path) -> None:
    d = ensure_dir(OUT / "portraits")
    for name, n in PORTRAIT.items():
        im = rgb(ex / f"gfx/original/facedat/{n:03d}.png")
        assert im.size == (64, 80), f"FACEDAT[{n}] 尺寸不对：{im.size}"
        im.save(d / f"{name}.png")
    # 杂兵没有武将头像：原版状态窗给他们的就是兵种小图，这里放大 2 倍放进 64×80 框
    soldier = rgba(ex / "gfx/original/hexzchr/000.png").crop((0, 0, 32, 32))
    tile = Image.new("RGB", (64, 80), (0, 0, 0))
    tile.paste(up(soldier, 2).convert("RGB"), (0, 8))
    tile.save(d / "_unknown.png")


# ---------------------------------------------------------------- 原版 UI 零件 ----
def make_ui(pack: Path) -> dict:
    """从 640×400 的原版战斗画面框上裁金龙边框、深蓝斜纹和龙纹装饰。"""
    frame = rgb(pack / "gfx/ui/orig_battle_frame.png")
    assert frame.size == (640, 400)
    ui = ensure_dir(OUT / "ui")

    # border-image 用的 3×3 九宫格（每格 16px）：四角、四条边、中心留空
    slices = [((0, 0, 16, 16), (0, 0)), ((300, 0, 316, 16), (16, 0)), ((624, 0, 640, 16), (32, 0)),
              ((0, 180, 16, 196), (0, 16)), ((624, 180, 640, 196), (32, 16)),
              ((0, 384, 16, 400), (0, 32)), ((300, 384, 316, 400), (16, 32)), ((624, 384, 640, 400), (32, 32))]
    nine = Image.new("RGB", (48, 48), (12, 20, 48))
    for box, at in slices:
        nine.paste(frame.crop(box), at)
    nine.save(ui / "gold.png")
    frame.crop((448, 80, 480, 112)).save(ui / "blue.png")     # 纯深蓝斜纹（避开顶部的金色按钮线）
    frame.crop((448, 272, 624, 384)).save(ui / "dragon.png")   # 右下角龙纹
    frame.crop((224, 2, 400, 26)).save(ui / "titlebar.png")    # 顶部蓝色标题条

    # 标题页底图：斜纹铺底 + 金框 + 两张原版事件插画 + 龙纹
    bg = Image.new("RGB", (640, 480), (12, 20, 48))
    tile = frame.crop((448, 80, 480, 112))
    for y in range(0, 480, 32):
        for x in range(0, 640, 32):
            bg.paste(tile, (x, y))
    for name, box in [("orig_03", (8, 24)), ("orig_12", (408, 24))]:
        pic = rgb(pack / f"gfx/pictures/{name}.png").resize((224 * 2, 144 * 2), NEAREST)
        bg.paste(pic, box)
    bg.paste(frame.crop((448, 272, 624, 384)), (216, 344))
    gold = nine
    for y in range(0, 480, 16):
        bg.paste(gold.crop((0, 16, 16, 32)), (0, y))
        bg.paste(gold.crop((32, 16, 48, 32)), (624, y))
    for x in range(0, 640, 16):
        bg.paste(gold.crop((16, 0, 32, 16)), (x, 0))
        bg.paste(gold.crop((16, 32, 32, 48)), (x, 464))
    for cx, cy, box in [(0, 0, (0, 0, 16, 16)), (624, 0, (32, 0, 48, 16)),
                        (0, 464, (0, 32, 16, 48)), (624, 464, (32, 32, 48, 48))]:
        bg.paste(gold.crop(box), (cx, cy))
    bg.save(OUT / "title.png")
    return {"frame": frame.size, "map": (896, 512)}


# ---------------------------------------------------------------- 特效 ----
def silhouette(path: Path) -> Image.Image:
    """原版彩色帧 -> 白色剪影（保留 alpha），这样运行时仍能按颜料色染。"""
    im = rgba(path)
    white = Image.new("RGBA", im.size, (255, 255, 255, 255))
    white.putalpha(im.getchannel("A"))
    return white.resize((256, 256), NEAREST)


def pixel_fx(kind: str) -> Image.Image:
    """没有原版对应帧的抽象粒子，用 64×64 的硬像素画出来，不引入第三方素材。"""
    im = Image.new("RGBA", (64, 64), (255, 255, 255, 0))
    d = ImageDraw.Draw(im)
    W = (255, 255, 255, 255)
    if kind == "star":
        d.polygon([(32, 2), (37, 26), (62, 32), (37, 38), (32, 62), (27, 38), (2, 32), (27, 26)], fill=W)
    elif kind == "ring":
        d.ellipse((6, 6, 58, 58), outline=W, width=4)
    elif kind == "ring2":
        d.ellipse((2, 2, 62, 62), outline=W, width=3)
        d.ellipse((16, 16, 48, 48), outline=W, width=3)
    elif kind == "slash":
        d.arc((2, -10, 62, 74), 15, 165, fill=W, width=6)
        d.arc((10, -2, 54, 66), 15, 165, fill=W, width=2)
    elif kind == "scratch":
        for i in range(3):
            d.line((8 + i * 14, 8, 28 + i * 14, 56), fill=W, width=3)
    elif kind == "smoke":
        for cx, cy, r in [(18, 40, 11), (32, 28, 14), (46, 40, 11), (32, 48, 9)]:
            d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=W, width=3)
    elif kind == "scorch":
        for a in range(0, 360, 30):
            t = math.radians(a)
            d.line((32 + math.cos(t) * 10, 32 + math.sin(t) * 10,
                    32 + math.cos(t) * 30, 32 + math.sin(t) * 30), fill=W, width=4)
        d.ellipse((24, 24, 40, 40), fill=W)
    elif kind == "twirl":
        for i in range(46):
            t, r = i / 46 * 4 * math.pi, 2 + i * 0.62
            x, y = 32 + math.cos(t) * r, 32 + math.sin(t) * r
            d.ellipse((x - 2, y - 2, x + 2, y + 2), fill=W)
    return im.resize((256, 256), NEAREST)


def make_fx(ex: Path) -> None:
    d = ensure_dir(OUT / "fx")
    h = ex / "gfx/original/hexbchr"
    # 有原版原型的：箭、两种火焰帧；其余是程序画的像素形状，全部 256×256 白色带 alpha
    sources = {
        "slash_03": lambda: pixel_fx("slash"),
        "scratch_01": lambda: pixel_fx("scratch"),
        "trace_06": lambda: silhouette(h / "169.png"),   # 原版箭矢
        "flame_05": lambda: silhouette(h / "154.png"),   # 原版火焰
        "flame_06": lambda: silhouette(h / "157.png"),   # 原版火焰（另一帧）
        "smoke_04": lambda: pixel_fx("smoke"),
        "star_06": lambda: pixel_fx("star"),
        "circle_02": lambda: pixel_fx("ring"),
        "circle_05": lambda: pixel_fx("ring2"),
        "twirl_01": lambda: pixel_fx("twirl"),
        "scorch_01": lambda: pixel_fx("scorch"),
    }
    for name in FX_NAMES:
        sources[name]().save(d / f"{name}.png")
    # 原版彩色特效帧，留给战斗特写/文档核对
    orig = ensure_dir(d / "original")
    for label, n in [("fire", 154), ("fire2", 157), ("water", 160), ("rock", 166),
                     ("arrow", 169), ("note", 173), ("tiger", 175)]:
        rgba(h / f"{n:03d}.png").save(orig / f"{label}.png")


# ---------------------------------------------------------------- 战斗特写 ----
def make_duel(ex: Path, units: list[dict]) -> None:
    """攻击时用的原版战斗场面：天空/地面条带 + 双方兵种大图（HEXBCHR 各兵种待机帧）。"""
    d = ensure_dir(OUT / "battle")
    # 背景：010 号天空/地平线 736×80 与 005 号石地 1056×128 各取一段，拼成 416×160
    sky = rgb(ex / "gfx/original/maps/scene/000.png").crop((0, 0, 416, 80))
    ground = rgb(ex / "gfx/original/maps/scene/005.png").crop((0, 0, 416, 80))
    bg = Image.new("RGB", (416, 160))
    bg.paste(sky, (0, 0))
    bg.paste(ground, (0, 80))
    bg.save(d / "scene.png")     # 416×160，HTML 覆盖层按 1:1 CSS 像素显示，保持像素锐利

    # 12 支部队各一张 64×64 待机大图，按 tokens 的同一顺序编号
    for i, u in enumerate(units):
        n = CLASS_FRAME[u["cls"]]
        im = rgba(ex / f"gfx/original/hexbchr/{n:03d}.png")
        im.save(d / f"unit-{i}.png")


# ---------------------------------------------------------------- 战斗特写帧表 ----
# 每个兵种在 HEXBCHR 里的连续帧（分组见 FORMATS.md §8.3）：
# (兵种号, 文件名, 起始帧, 输出帧数, 待机帧数, 命中帧的局部号)
# 原版每组排法一致：开头 1–2 帧站定，接着是出手，带爆发的帧算命中，最后一帧是后仰受击。
# 兵种号即 tables.json 的 classNames 下标，与 HEXBCHR 的分组顺序一一对应。
CUTIN_CLASSES = [
    (0, "sword", 0, 8, 2, 6),
    (1, "spear", 8, 8, 1, 5),
    (2, "chariot", 16, 8, 2, 6),
    (3, "archer", 24, 6, 1, 4),
    (4, "crossbow", 30, 6, 1, 4),
    (5, "catapult", 36, 5, 1, 3),        # 机器与乘员分两帧存，这里合成一帧
    (6, "light-cavalry", 46, 10, 2, 8),
    (7, "heavy-cavalry", 56, 10, 2, 8),
    (8, "guard-cavalry", 66, 10, 2, 8),
    (9, "bandit", 76, 8, 2, 6),
    (10, "brigand", 84, 8, 2, 6),
    (11, "outlaw", 92, 8, 2, 6),
    (12, "band", 100, 9, 2, 7),
    (13, "beast", 109, 6, 1, 4),
    (14, "martial", 115, 8, 2, 6),
    (15, "sorcerer", 123, 11, 2, 9),
    (16, "barbarian", 134, 8, 2, 6),
    (18, "transport", 145, 9, 2, 7),
]
# 17 民众只有 3 帧走路的样子，没有攻击动作，不给演员（特写退回棋子前冲的演法）


def cutin_sheet(ex: Path, start: int, n: int, pair: bool) -> Image.Image:
    """把一组原版帧拼成一行的图集。pair = 机器/乘员两帧合成一帧（投石车）。"""
    h = ex / "gfx/original/hexbchr"
    if pair:
        w, fh = 96, 64
        sheet = Image.new("RGBA", (w * n, fh), (0, 0, 0, 0))
        for i in range(n):
            frame = Image.new("RGBA", (w, fh), (0, 0, 0, 0))
            frame.alpha_composite(rgba(h / f"{start + i * 2:03d}.png"), (0, 0))            # 机器
            frame.alpha_composite(rgba(h / f"{start + i * 2 + 1:03d}.png"), (52, 16))      # 乘员站在机器右侧
            sheet.paste(frame, (i * w, 0))
        return sheet
    w, fh = rgba(h / f"{start:03d}.png").size
    sheet = Image.new("RGBA", (w * n, fh), (0, 0, 0, 0))
    for i in range(n):
        sheet.paste(rgba(h / f"{start + i:03d}.png"), (i * w, 0))
    return sheet


def make_cutin(ex: Path) -> dict:
    """每个兵种一张帧图集，并生成清单里 cutin.actors 的帧表。"""
    d = ensure_dir(OUT / "cutin")
    actors = {}
    for cls, slug, start, n, idle, impact in CUTIN_CLASSES:
        sheet = cutin_sheet(ex, start, n, pair=slug == "catapult")
        sheet.save(d / f"{slug}.png")
        actor = {
            "sheet": f"cutin/{slug}.png",
            "frameWidth": sheet.width // n,
            "frameHeight": sheet.height,
            "anims": {
                "idle": {"frames": list(range(idle)), "fps": 3},
                "attack": {"frames": list(range(idle, impact + 1)), "fps": 10, "impact": impact - idle},
                "hurt": {"frames": [n - 1, 0], "fps": 6},
            },
        }
        if slug == "catapult":
            actor["scale"] = 5       # 96 宽的机器加乘员，放大窄一点才不跟对面撞上
        actors[f"cls{cls}"] = actor
    return actors


def write_manifest(actors: dict) -> None:
    """把特写帧表写进素材清单；levels 一段是手写内容，原样保留。"""
    p = OUT / "manifest.json"
    m = json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}
    m["cutin"] = {"background": "battle/scene.png", "actors": actors}
    p.write_text(json.dumps(m, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    ex, pack = Path(sys.argv[1]), Path(sys.argv[2])
    for p in (ex / "gfx/original/maps/battle/000.png", pack / "gfx/ui/orig_battle_frame.png"):
        if not p.exists():
            sys.exit(f"找不到 {p}\n请先用 hero-tools original extract / original pack 生成缓存目录。")
    units = json.loads((ROOT / "src/data/sishui.json").read_text(encoding="utf-8"))["units"]

    make_map(ex)
    make_tokens(ex, units)
    make_portraits(ex)
    info = make_ui(pack)
    make_fx(ex)
    make_duel(ex, units)
    actors = make_cutin(ex)
    write_manifest(actors)

    palettes = json.loads((ex / "gfx/original/palettes.json").read_text(encoding="utf-8"))
    (OUT / "palette.json").write_text(json.dumps({
        "source": "MAIN.EXE 的 9 组 16 色 VGA 调色板（4bit B,R,G 扩展为 6bit DAC）",
        "offset": palettes["offset"],
        "slots": palettes["slots"],
        "used": {"map/units/battle": 1, "faces/ui": 0},
    }, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    print(f"已生成原版素材到 {OUT}")
    print(f"  战场 {info['map'][0]}×{info['map'][1]} → {info['map'][0]*RES}×{info['map'][1]*RES}（{RES} 倍整数放大）")
    print(f"  棋子 {len(units)} 支部队 × 2 行，帧 {FRAME}×{FRAME}；头像 {len(PORTRAIT)} 张 64×80")
    print(f"  UI 框 {info['frame']}、特效 {len(FX_NAMES)} 张、战斗特写 {len(units)} 帧")
    print(f"  战斗特写帧表：{len(actors)} 个兵种（{len(CUTIN_CLASSES)} 组动作）→ {'/'.join(['cutin'])}/")


if __name__ == "__main__":
    main()
