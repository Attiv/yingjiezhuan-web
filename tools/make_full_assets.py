#!/usr/bin/env python3
"""生成整部《三国志英杰传》网页版要用的素材（从自己持有的原版盘提取）。

    hero-tools original extract <原版目录> --out <EXTRACT> --edition chinese-dos
    hero-tools original pack    <原版目录> --out <PACK> --base <base-pack> --edition chinese-dos
    python3 tools/make_full_assets.py <EXTRACT> <PACK>

产出：
  maps/           58 张战场图（3 倍整数放大）+ 15 张地形被改变时的补丁图
  faces/          240 张 64×80 武将头像（FACEDAT 原样）
  tokens.png      39 列 × 4 行，各 96×96：站立 / 行走 / 已行动站立 / 已行动行走
                  （原版 HEXZCHR 每个兵种图标是 32×64 上下两帧，正好是走路的交替帧）
  pictures/       31 张事件插画
  duel/           单挑动画图（15 帧 96×96）与 10 张单挑地形背景
  cutin/          战斗特写：每兵种 60 帧待机（呼吸）+ 60 帧出手 + 30 帧受击，60fps 播放
  bgm/            10 首原版音乐（转成 mp3，网页可直接播）

只做裁切、整数倍放大（NEAREST）与逐像素拼版，不改动任何原版像素的颜色。
依赖：Pillow、ffmpeg（仅音乐转码用）。
"""
from __future__ import annotations

import json
import math
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "assets"
RES = 3
NEAREST = Image.Resampling.NEAREST

# HEXBCHR 里各兵种的动作帧组：兵种号、文件名、起始帧、帧数、待机帧数、命中帧局部号
CUTIN = [
    (0, "sword", 0, 8, 2, 6), (1, "spear", 8, 8, 1, 5), (2, "chariot", 16, 8, 2, 6),
    (3, "archer", 24, 6, 1, 4), (4, "crossbow", 30, 6, 1, 4), (5, "catapult", 36, 5, 1, 3),
    (6, "light-cavalry", 46, 10, 2, 8), (7, "heavy-cavalry", 56, 10, 2, 8),
    (8, "guard-cavalry", 66, 10, 2, 8), (9, "bandit", 76, 8, 2, 6), (10, "brigand", 84, 8, 2, 6),
    (11, "outlaw", 92, 8, 2, 6), (12, "band", 100, 9, 2, 7), (13, "beast", 109, 6, 1, 4),
    (14, "martial", 115, 8, 2, 6), (15, "sorcerer", 123, 11, 2, 9), (16, "barbarian", 134, 8, 2, 6),
    (18, "transport", 145, 9, 2, 7),
]
RANGED = {3, 4, 5}


def ensure(p: Path) -> Path:
    if not p.exists():
        p.mkdir(parents=True)
    return p


def rgba(p: Path) -> Image.Image:
    return Image.open(p).convert("RGBA")


def frame_canvas(im: Image.Image, canvas: tuple[int, int], dx=0, dy=0,
                 breath=0, pivot=0) -> Image.Image:
    """把一帧放进画布居中；breath 只抬起 pivot 以上的躯干，脚下不动。

    上下两块重叠 2 像素，避免呼吸时在腰部出现一条透明缝。
    """
    W, H = canvas
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ox, oy = (W - im.width) // 2, H - im.height - 8
    if breath and pivot:
        top = im.crop((0, 0, im.width, pivot))
        bot = im.crop((0, max(0, pivot - 2), im.width, im.height))
        out.alpha_composite(top, (ox, oy + breath))
        out.alpha_composite(bot, (ox, oy + pivot - 2))
    else:
        out.alpha_composite(im, (ox + dx, oy + dy))
    return out


def save_sheet(frames: list[Image.Image], path: Path) -> None:
    """把等大的帧拼成 16 列的网格，存成带透明索引的调色板 PNG（颜色与像素完全不变）。

    早先拼成一行（150 帧 × 80 = 12000 像素宽）超过了部分显卡/软件渲染 8192 的纹理上限，
    贴图上传失败会画成黑块，所以改成多行网格；帧号仍按行优先排列，前端不用改。
    """
    w, h = frames[0].size
    cols = min(16, len(frames))
    rows = math.ceil(len(frames) / cols)
    sheet = Image.new("RGBA", (w * cols, h * rows), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        sheet.alpha_composite(f, ((i % cols) * w, (i // cols) * h))
    # 收集颜色，建立 0 = 透明的调色板
    arr = np.asarray(sheet)
    colors = {}
    for y in range(0, arr.shape[0], 1):
        row = arr[y]
        for px in row:
            if px[3] < 128:
                continue
            key = (int(px[0]), int(px[1]), int(px[2]))
            colors.setdefault(key, len(colors) + 1)
    pal = [(0, 0, 0)] * 256
    for rgb, idx in colors.items():
        if idx < 256:
            pal[idx] = rgb
    out = Image.new("P", sheet.size, 0)
    out.putpalette([c for rgb in pal for c in rgb])
    idx = np.zeros((arr.shape[0], arr.shape[1]), dtype=np.uint8)
    for rgb, i in colors.items():
        m = (arr[:, :, 0] == rgb[0]) & (arr[:, :, 1] == rgb[1]) & (arr[:, :, 2] == rgb[2]) & (arr[:, :, 3] >= 128)
        idx[m] = i
    out.putdata(idx.flatten())
    out.save(path, transparency=0, optimize=True)


# ---------------------------------------------------------------- 地图 ----
def make_maps(pack: Path) -> int:
    src = pack / "gfx/maps"
    dst = ensure(OUT / "maps")
    n = 0
    for f in sorted(src.glob("*.png")):
        im = Image.open(f).convert("RGB")
        # 完整战场图 896×512 放大 3 倍；被改变的地形补丁 32×32 同样放大
        big = im.resize((im.width * RES, im.height * RES), NEAREST)
        big.save(dst / f.name)
        n += 1
    return n


# ---------------------------------------------------------------- 头像 ----
def make_faces(ex: Path) -> int:
    dst = ensure(OUT / "faces")
    n = 0
    for f in sorted((ex / "gfx/original/facedat").glob("*.png")):
        Image.open(f).convert("RGB").save(dst / f.name)
        n += 1
    return n


# ---------------------------------------------------------------- 棋子 ----
def make_tokens(ex: Path) -> None:
    """39 列 × 4 行：cls×2+阵营（0–37），第 38 帧是刘备的旗步兵。

    原版 HEXZCHR 每个图标是 32×64，上下各一帧：上半是站立、下半是迈步，
    棋盘上移动时两帧交替显示。以前只裁了上半帧，部队只能靠位移「滑」过去。
    这里把两帧都保留，并各配一份「本回合已行动」的去饱和版：
        行 0 站立　　行 1 行走　　行 2 站立(灰)　　行 3 行走(灰)
    """
    S = 32 * RES
    cols = 39
    idle, walk = [], []
    for i in range(cols):
        src = rgba(ex / f"gfx/original/hexzchr/{i:03d}.png")
        assert src.size == (32, 64), f"HEXZCHR[{i}] 尺寸不对：{src.size}"
        idle.append(src.crop((0, 0, 32, 32)).resize((S, S), NEAREST))
        walk.append(src.crop((0, 32, 32, 64)).resize((S, S), NEAREST))

    def grey(im: Image.Image) -> Image.Image:
        g = im.convert("L").point(lambda v: int(28 + v * 0.45))
        return Image.merge("RGBA", (g, g, g, im.getchannel("A")))

    sheet = Image.new("RGBA", (S * cols, S * 4), (0, 0, 0, 0))
    for i, (a, w) in enumerate(zip(idle, walk)):
        sheet.paste(a, (i * S, 0))
        sheet.paste(w, (i * S, S))
        sheet.paste(grey(a), (i * S, S * 2))
        sheet.paste(grey(w), (i * S, S * 3))
    sheet.save(OUT / "tokens.png")


# ---------------------------------------------------------------- 插画 ----
def make_pictures(pack: Path) -> int:
    dst = ensure(OUT / "pictures")
    n = 0
    for f in sorted((pack / "gfx/pictures").glob("*.png")):
        shutil.copyfile(f, dst / f.name)
        n += 1
    return n


# ---------------------------------------------------------------- 单挑 ----
def make_duel(pack: Path) -> int:
    dst = ensure(OUT / "duel")
    n = 0
    for f in (pack / "gfx/duel").glob("*.png"):
        shutil.copyfile(f, dst / f.name)
        n += 1
    return n


# ---------------------------------------------------------------- 战斗特写 ----
def cutin_frames(ex: Path, start: int, n: int, idle: int, impact: int,
                 pair: bool, ranged: bool) -> tuple[list[Image.Image], int]:
    """60 帧待机（呼吸）+ 60 帧出手 + 30 帧受击。

    待机：抬起 pivot 以上的躯干 1 像素，60 帧一个来回，脚下不动。
    出手：原版关键帧按时间铺满 60 帧，另把整体前冲/后坐的位移逐帧画进画布，
          因此 60 帧都是独立画面，播放时不会有两个剑影。
    """
    h = ex / "gfx/original/hexbchr"
    keys: list[Image.Image] = []
    if pair:
        for i in range(n):
            f = Image.new("RGBA", (96, 64), (0, 0, 0, 0))
            f.alpha_composite(rgba(h / f"{start + i * 2:03d}.png"), (0, 0))
            f.alpha_composite(rgba(h / f"{start + i * 2 + 1:03d}.png"), (52, 16))
            keys.append(f)
        canvas = (112, 80)
    else:
        keys = [rgba(h / f"{start + i:03d}.png") for i in range(n)]
        canvas = (80, 80)
    pivot = int(keys[0].height * 0.68) if not pair else 0

    idle_frames = []
    base = keys[0]
    for t in range(60):
        # 吸气占前 45%，屏住 10%，呼气占 45%
        phase = (t / 60) * 2 * math.pi
        breath = -1 if math.sin(phase) > 0.15 else 0
        idle_frames.append(frame_canvas(base, canvas, breath=breath, pivot=pivot))
        if pair:  # 机器不呼吸，只让整台车轻轻一晃
            idle_frames[-1] = frame_canvas(base, canvas, dx=1 if math.sin(phase) > 0.15 else 0)

    attack_keys = keys[idle:impact + 1]
    m = len(attack_keys)
    # 权重：起手稍慢，命中前稍慢，中间快
    weights = [1.35] + [1.0] * max(0, m - 2) + [1.25]
    weights = weights[:m]
    total = sum(weights)
    durations = [max(3, round(60 * w / total)) for w in weights]
    while sum(durations) < 60:
        durations[durations.index(min(durations))] += 1
    while sum(durations) > 60:
        durations[durations.index(max(durations))] -= 1
    idxframes = []
    for i, d in enumerate(durations):
        idxframes += [i] * d
    idxframes = idxframes[:60]

    impact_out = sum(durations[:m - 1])
    attack_frames = []
    for f, k in enumerate(idxframes):
        p = f / 59
        if ranged:
            lunge = -round(5 * math.sin(math.pi * min(1, p / 0.8)))
        else:
            lunge = round(12 * (p ** 1.4))
        hop = -2 if 0.55 < p < 0.8 else 0
        attack_frames.append(frame_canvas(attack_keys[k], canvas, dx=lunge, dy=hop))

    hurt_frames = []
    last = keys[min(n - 1, impact + 1)] if impact + 1 < n else keys[-1]
    for f in range(30):
        p = f / 29
        back = -round(10 * (1 - p) ** 2)
        hurt_frames.append(frame_canvas(last, canvas, dx=back, dy=round(2 * (1 - p))))

    return idle_frames + attack_frames + hurt_frames, impact_out


def make_cutin(ex: Path) -> dict:
    dst = ensure(OUT / "cutin")
    actors = {}
    for cls, slug, start, n, idle, impact in CUTIN:
        frames, impact_out = cutin_frames(ex, start, n, idle, impact, slug == "catapult", cls in RANGED)
        save_sheet(frames, dst / f"{slug}.png")
        actors[f"cls{cls}"] = {
            "sheet": f"cutin/{slug}.png",
            "frameWidth": frames[0].width,
            "frameHeight": frames[0].height,
            "frames": len(frames),
            "anims": {
                "idle": {"frames": list(range(0, 60)), "fps": 30},
                "attack": {"frames": list(range(60, 120)), "fps": 60, "impact": impact_out},
                "hurt": {"frames": list(range(120, 150)), "fps": 30},
            },
        }
        if slug == "catapult":
            actors[f"cls{cls}"]["scale"] = 4
    return actors


# ---------------------------------------------------------------- 音乐 ----
def make_bgm(pack: Path) -> int:
    dst = ensure(OUT / "bgm")
    n = 0
    for f in sorted((pack / "bgm").glob("*.wav")):
        out = dst / f"{f.stem}.mp3"
        if out.exists() and out.stat().st_mtime >= f.stat().st_mtime:
            n += 1
            continue
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(f), "-c:a", "libmp3lame",
                        "-b:a", "48k", "-ac", "1", "-ar", "22050", str(out)], check=True)
        n += 1
    return n


# ---------------------------------------------------------------- 行军图 ----
def make_campaign(ex: Path) -> int:
    """章节标题画面用的原版行军图（MMAP.R3）。原图 1536² 到 1920×1408，缩到长边 1024
    再量化成 64 色：舞台上只显示 640×480，缩一半看不出差别，体积却只剩零头。"""
    src = ex / "maps" / "campaign.json"
    if not src.exists():
        return 0
    meta = json.loads(src.read_text(encoding="utf-8"))
    dst = ensure(OUT / "maps" / "campaign")
    n = 0
    for m in meta["maps"]:
        im = Image.open(ex / m["image"]).convert("RGB")
        w, h = im.size
        scale = 1024 / max(w, h)
        if scale < 1:
            im = im.resize((round(w * scale), round(h * scale)), Image.Resampling.LANCZOS)
        im = im.quantize(colors=64, method=Image.Quantize.MEDIANCUT).convert("P")
        im.save(dst / f"{m['index']:03d}.png", optimize=True)
        n += 1
    return n


# ---------------------------------------------------------------- 剧情场景 ----
def make_story(ex: Path) -> int:
    """剧情页的场景底图（原版 `load_map` 的那几张图）。

    宫殿 = PMAP.R3 的 23 张 32×20 瓦片图（512×320，等距视角的内景），
          剧情里「陳留宮殿」「洛陽宮殿」这类场面就站在这上面。
    野外 = 0x1000 号地图：原版没有单独的图，就是战场那套「天空 + 地平线 + 地面」条带
          拼出来的野外地平（HEXBMAP.R3），照 512×320 拼成 5 种天色。
    两张都按 2 倍整数放大，和界面一样保持硬像素。"""
    dst = ensure(OUT / "story")
    n = 0
    for f in sorted((ex / "gfx/original/maps/town").glob("pmap-*.png")):
        im = Image.open(f).convert("RGB")
        im.resize((im.width * 2, im.height * 2), NEAREST).save(dst / f.name)
        n += 1
    scene = ex / "gfx/original/maps/scene"
    skies = sorted(scene.glob("00[0-4].png"))
    ground = Image.open(scene / "005.png").convert("RGB")
    for i, sky in enumerate(skies):
        im = Image.open(sky).convert("RGB")
        canvas = Image.new("RGB", (512, 320), (0, 0, 0))
        canvas.paste(im.resize((512, 128), NEAREST), (0, 0))
        canvas.paste(ground.resize((512, 192), NEAREST), (0, 128))
        canvas.resize((1024, 640), NEAREST).save(dst / f"field-{i:02d}.png")
        n += 1
    return n


# ---------------------------------------------------------------- 清单 ----
def write_manifest(actors: dict) -> None:
    p = OUT / "manifest.json"
    m = json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}
    m["cutin"] = {"background": "battle/scene.png", "actors": actors}
    p.write_text(json.dumps(m, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    ex, pack = Path(sys.argv[1]), Path(sys.argv[2])
    if not (pack / "gfx/maps/hexz_00.png").exists():
        sys.exit(f"找不到 {pack}/gfx/maps，请先跑 hero-tools original pack")

    print(f"地图 {make_maps(pack)} 张（含地形补丁）")
    print(f"头像 {make_faces(ex)} 张")
    make_tokens(ex)
    print(f"插画 {make_pictures(pack)} 张、单挑图 {make_duel(pack)} 张")
    print(f"行军图 {make_campaign(ex)} 张")
    print(f"剧情场景 {make_story(ex)} 张（23 座宫殿 + 5 张野外地平）")
    actors = make_cutin(ex)
    write_manifest(actors)
    print(f"特写 {len(actors)} 个兵种 × 150 帧（60 待机 + 60 出手 + 30 受击）")
    print(f"音乐 {make_bgm(pack)} 首")
    total = sum(f.stat().st_size for f in OUT.rglob("*") if f.is_file())
    print(f"素材总量 {total / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
