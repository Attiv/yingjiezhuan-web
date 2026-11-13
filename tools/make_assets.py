#!/usr/bin/env python3
"""把许可明确的现成素材整理成 public/assets/ 里的「古战图」画面（不含原版游戏的任何图像）。

    python3 tools/make_assets.py <Cartography Pack 目录> <Particle Pack 目录> <eiketsuden-reloaded 目录> <LXGWWenKai-Medium.ttf>

四样输入的来源与许可见 docs/assets.md。依赖：Pillow、numpy、fonttools、brotli。
做的事：在纸色底上按汜水关的地形数据刷淡彩，摆上 Cartography Pack 的手绘墨线符号，拼成一张战场图；
把古画头像裁成圆形棋子；拷贝特效贴图、头像和标题用的古画；把字体裁成只含本作用字的网页字体。
"""
import json
import shutil
import sys
from pathlib import Path

import numpy as np
from fontTools import subset
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "assets"
S = 96  # 每格像素：画布是舞台的 3 倍，高分屏上也不发虚
INK = np.array([38, 29, 22], np.float32) / 255
PAPER = np.array([233, 219, 187], np.float32) / 255
SIDE_COLORS = {"player": (42, 90, 140), "ally": (58, 122, 86), "enemy": (176, 56, 36)}  # 石青、石绿、朱砂
PORTRAITS = {  # 头像文件，以及棋子上取的方块（中心 x、中心 y、边长）
    "刘备": ("liu_bei", 96, 96, 132), "关羽": ("guan_yu", 90, 92, 124), "张飞": ("zhang_fei", 88, 86, 140),
    "公孙瓒": ("gongsun_zan", 94, 96, 124), "陶谦": ("tao_qian", 96, 96, 124), "华雄": ("hua_xiong", 92, 92, 124),
    "李肃": ("li_su", 100, 104, 124), "胡轸": ("hu_zhen", 104, 106, 124), "赵岑": ("zhao_cen", 96, 88, 124),
}
FX = ["slash_03", "scratch_01", "trace_06", "flame_05", "flame_06", "smoke_04", "star_06", "circle_02", "circle_05", "twirl_01", "scorch_01"]
rng = np.random.default_rng(190)  # 初平元年


def value_noise(w, h, scale):
    """平滑噪声，取值大致在 ±1：低分辨率随机数放大而成。"""
    small = rng.standard_normal((h // scale + 3, w // scale + 3)).astype(np.float32)
    im = Image.fromarray(small, "F").resize((w + 2 * scale, h + 2 * scale), Image.BICUBIC)
    return np.clip(np.asarray(im)[scale:scale + h, scale:scale + w] / 2, -1, 1)


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def make_map(carto: Path, font: Path):
    data = json.loads((ROOT / "src" / "data" / "sishui.json").read_text(encoding="utf-8"))
    w, h = data["w"], data["h"]
    grid = np.array(data["terrain"]).reshape(h, w)
    W, H = w * S, h * S

    # 纸：底色 + 大小两层色斑 + 横向纤维 + 细颗粒
    tone = 1 + 0.035 * value_noise(W, H, 220) + 0.02 * value_noise(W, H, 40) + 0.012 * rng.standard_normal((H, W)).astype(np.float32)
    fibre = np.asarray(Image.fromarray(rng.standard_normal((H, W // 12 + 1)).astype(np.float32), "F").resize((W, H), Image.BILINEAR))
    img = PAPER[None, None, :] * (tone + 0.012 * fibre)[:, :, None]
    wobble = 0.17 * value_noise(W, H, 44) + 0.06 * value_noise(W, H, 11)

    def soft(codes, radius=24):
        """某几种地形的范围：边缘磨圆并带手抖，返回 0–1 的浓度和未取阈值的原值。"""
        m = Image.fromarray(np.isin(grid, codes).astype(np.uint8) * 255).resize((W, H), Image.NEAREST)
        m = np.asarray(m.filter(ImageFilter.GaussianBlur(radius)), np.float32) / 255 + wobble
        return smoothstep(0.42, 0.58, m), m

    def wash(codes, rgb, strength, rim=0.0, outline=0.0, radius=24):
        """淡彩：正片叠底刷一层颜色，边缘颜料略深；outline 是沿边勾的墨线浓度。"""
        nonlocal img
        a, m = soft(codes, radius)
        pool = np.exp(-(((m - 0.5) / 0.1) ** 2)) * (m > 0.42)
        amount = a * strength * (1 + 0.18 * value_noise(W, H, 60)) + rim * pool
        img = img * (1 - np.clip(amount, 0, 1)[:, :, None] * (1 - np.array(rgb, np.float32) / 255))
        if outline:
            line = np.exp(-(((m - 0.5) / 0.035) ** 2)) * outline
            img = img * (1 - line[:, :, None]) + INK * line[:, :, None]

    wash([7], (168, 190, 128), 0.55, rim=0.10)                          # 草地：淡石绿
    wash([1], (120, 160, 110), 0.70, rim=0.16)                          # 树林：石绿
    wash([11], (196, 160, 110), 0.55, rim=0.10)                         # 荒地：赭石
    wash([2], (180, 150, 110), 0.60, rim=0.14)                          # 山地
    wash([9], (164, 150, 128), 0.60, rim=0.22, outline=0.55, radius=18)  # 悬崖：墨赭
    wash([3, 4, 19], (96, 150, 176), 0.78, rim=0.25, outline=0.6)        # 河：石青
    wash([5, 10], (124, 110, 96), 0.78, rim=0.3, outline=0.9, radius=6)  # 城墙

    # 计里画方：极淡的墨线方格
    for x in range(1, w):
        img[:, x * S - 1:x * S + 1] *= 0.93
    for y in range(1, h):
        img[y * S - 1:y * S + 1, :] *= 0.93

    canvas = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
    symbols = {}

    def stamp(name, cx, cy, size, opacity=0.9, flip=False, turn=0, ink=(38, 29, 22)):
        """盖一个墨线符号，中心在 (cx, cy)，长边缩到 size。符号先裁掉四周的空白。"""
        if name not in symbols:
            im = Image.open(carto / "PNG" / "Retina" / f"{name}.png").convert("RGBA")
            symbols[name] = im.crop(im.getbbox())
        im = symbols[name]
        k = size / max(im.size)
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        if flip:
            im = im.transpose(Image.FLIP_LEFT_RIGHT)
        if turn:
            im = im.rotate(90 * turn, expand=True)
        alpha = im.getchannel("A").point(lambda v: int(v * opacity))
        canvas.paste(Image.new("RGB", im.size, ink), (round(cx - im.width / 2), round(cy - im.height / 2)), alpha)

    # 图题占的格子不摆符号
    title_cells = {(x, y) for x in (8,) for y in (1, 2, 3)}
    pick = lambda items: items[rng.integers(len(items))]
    jitter = lambda: rng.integers(-5, 6)
    big = set()  # 被 2×2 大山占掉的格子
    for y in range(h):
        for x in range(w):
            t, cx, cy = grid[y, x], x * S + S // 2, y * S + S // 2
            if (x, y) in title_cells or (x, y) in big:
                continue
            if t == 9:
                block = [(x + dx, y + dy) for dy in (0, 1) for dx in (0, 1)]
                free = all(bx < w and by < h and grid[by, bx] == 9 and (bx, by) not in big and (bx, by) not in title_cells for bx, by in block)
                if free and rng.random() < 0.3:
                    big.update(block)
                    stamp(pick(["rocksMountain", "rocksTall", "rocksA"]), x * S + S + jitter(), y * S + S + jitter(), 164, flip=rng.random() < 0.5)
                else:
                    stamp(pick(["rocksMountain", "rocksTall", "rocksA", "rocksB", "rocks"]), cx + jitter(), cy + jitter(), int(rng.integers(70, 88)), flip=rng.random() < 0.5)
            elif t == 2:
                stamp(pick(["rocks", "rocksA", "rocksB"]), cx + jitter(), cy + jitter(), 80, flip=rng.random() < 0.5)
            elif t == 1:
                stamp(pick(["treePines", "treePines", "treePinesSmall", "treePine"]), cx + jitter(), cy + jitter(), int(rng.integers(74, 88)), flip=rng.random() < 0.5, ink=(30, 50, 32))
            elif t == 7:
                for _ in range(int(rng.integers(2, 5))):
                    stamp("bush", cx + rng.integers(-34, 35), cy + rng.integers(-34, 35), int(rng.integers(18, 28)), 0.7, ink=(44, 78, 40))
            elif t in (3, 19):
                if rng.random() < 0.8:
                    stamp("textureWater", cx + jitter(), cy + jitter(), 76, 0.5, flip=rng.random() < 0.5, ink=(30, 62, 96))
            elif t == 11:
                stamp("textureStone", cx + jitter(), cy + jitter(), 66, 0.5, turn=int(rng.integers(4)), ink=(96, 70, 44))
            elif t == 5:
                # 城墙缺口（关门）两侧立敌楼：上下邻格是平地、右边不再是墙的墙格
                gate = 0 < y < h - 1 and (grid[y - 1, x] == 0 or grid[y + 1, x] == 0) and x + 1 < w and grid[y, x + 1] != 5
                stamp("tower" if gate else "textureBricks", cx, cy, 86 if gate else 78, 0.95 if gate else 0.8)
            elif t == 6:
                stamp("textureStone", cx, cy, 66, 0.4)
            else:
                name = {4: "bridge", 8: "houses", 10: "gate", 12: "fence", 13: "fence", 14: "tent", 15: "stable", 16: "chest", 17: "house"}.get(int(t))
                if name:
                    stamp(name, cx, cy, 82)

    # 图题：竖写的「汜水關」，双线框，下面一方朱印
    d = ImageDraw.Draw(canvas, "RGBA")
    x0, y0, x1, y1 = 8 * S + 12, 1 * S + 10, 9 * S - 12, 4 * S - 14
    d.rectangle((x0, y0, x1, y1), fill=(240, 229, 200, 235), outline=(38, 29, 22, 255), width=3)
    d.rectangle((x0 + 6, y0 + 6, x1 - 6, y1 - 6), outline=(38, 29, 22, 200), width=1)
    title_font = ImageFont.truetype(str(font), 54)
    for i, ch in enumerate("汜水關"):
        d.text(((x0 + x1) / 2, y0 + 44 + i * 62), ch, font=title_font, fill=(38, 29, 22, 240), anchor="mm")
    seal_font = ImageFont.truetype(str(font), 17)
    sx, sy = (x0 + x1) // 2 - 20, y1 - 56
    d.rounded_rectangle((sx, sy, sx + 40, sy + 40), 3, fill=(176, 56, 36, 225))
    for i, ch in enumerate("初平元年"):  # 印文从右往左、从上往下
        d.text((sx + 30 - (i // 2) * 20, sy + 10 + (i % 2) * 20), ch, font=seal_font, fill=(244, 232, 204, 255), anchor="mm")

    canvas.save(OUT / "sishui.jpg", quality=90)
    return data


# 占位棋子（无原版素材时用的演示图）；会覆盖 tokens.png，正式素材请用 make_full_assets.py。
def make_tokens(data, reloaded: Path, font: Path):
    """棋子：一支部队一帧（顺序同 sishui.json 的 units）。有画像的武将是圆形头像加兵种小章，杂兵是一枚兵种字。
    第二行是同一批棋子褪成灰色的样子，给本回合已行动的部队用。"""
    T, K = 112, 4  # 帧边长；先放大 4 倍画再缩小，边缘才平滑
    sheet = Image.new("RGBA", (T * len(data["units"]), T * 2))
    big, small = ImageFont.truetype(str(font), 56 * K), ImageFont.truetype(str(font), 18 * K)
    disc = lambda d, cx, cy, r, fill: d.ellipse(((cx - r) * K, (cy - r) * K, (cx + r) * K, (cy + r) * K), fill=fill)
    for i, u in enumerate(data["units"]):
        side = "enemy" if u["slot"] >= 15 else "player" if u["mode"] == 7 else "ally"
        color, char = SIDE_COLORS[side], "步弓骑"[min(2, u["cls"] // 3)]
        im = Image.new("RGBA", (T * K, T * K))
        shadow = Image.new("L", im.size)
        ImageDraw.Draw(shadow).ellipse((11 * K, 16 * K, 101 * K, 106 * K), fill=150)
        im.putalpha(shadow.filter(ImageFilter.GaussianBlur(3 * K)))
        d = ImageDraw.Draw(im)
        disc(d, 56, 56, 46, (30, 22, 17, 255))
        disc(d, 56, 56, 44, color + (255,))
        disc(d, 56, 56, 35.5, (240, 229, 200, 255))
        disc(d, 56, 56, 34, (30, 22, 17, 255))
        disc(d, 56, 56, 33, (234, 223, 196, 255))
        if u["name"] in PORTRAITS:
            name, cx, cy, size = PORTRAITS[u["name"]]
            face = Image.open(reloaded / "data/base/gfx/portraits" / f"{name}.png").convert("RGB")
            face = face.crop((cx - size // 2, cy - size // 2, cx + size // 2, cy + size // 2)).resize((66 * K, 66 * K), Image.LANCZOS)
            mask = Image.new("L", face.size)
            ImageDraw.Draw(mask).ellipse((0, 0, face.width - 1, face.height - 1), fill=255)
            im.paste(face, (23 * K, 23 * K), mask)
            disc(d, 88, 88, 15.5, (30, 22, 17, 255))
            disc(d, 88, 88, 14, color + (255,))
            d.text((88 * K, 88 * K), char, font=small, fill=(244, 232, 204, 255), anchor="mm")
        else:
            d.text((56 * K, 56 * K), char, font=big, fill=color + (255,), anchor="mm")
        im = im.resize((T, T), Image.LANCZOS)
        sheet.paste(im, (i * T, 0))
        grey = Image.blend(im.convert("LA").convert("RGBA"), Image.new("RGBA", im.size, (120, 112, 100, 255)), 0.3)
        grey.putalpha(im.getchannel("A"))
        sheet.paste(grey, (i * T, T))
    sheet.save(OUT / "tokens.png")


def make_font(font: Path, licence: Path):
    """只留本作出现的字：源码、数据表、页面里的全部字符，加上常用标点和 ASCII。"""
    chars = set(map(chr, range(0x20, 0x7F))) | set("，。！？：；、「」《》—…·％（）　＋－")
    for f in [*ROOT.glob("src/**/*.ts"), *ROOT.glob("src/**/*.css"), ROOT / "index.html"]:
        chars |= set(f.read_text(encoding="utf-8"))
    for f in ROOT.glob("src/data/*.json"):
        chars |= set(json.dumps(json.loads(f.read_text(encoding="utf-8")), ensure_ascii=False))
    (OUT / "font").mkdir(exist_ok=True)
    subset.main([str(font), f"--text={''.join(sorted(c for c in chars if c >= ' '))}", "--flavor=woff2",
                 f"--output-file={OUT / 'font' / 'wenkai-subset.woff2'}"])
    shutil.copy(licence, OUT / "font" / "OFL.txt")


def main():
    if len(sys.argv) != 5:
        sys.exit(__doc__)
    carto, particles, reloaded, font = map(Path, sys.argv[1:])
    for old in ["units", "fx", "font", "portraits"]:
        shutil.rmtree(OUT / old, ignore_errors=True)
    for old in ["sishui.png"]:
        (OUT / old).unlink(missing_ok=True)
    for d in ["fx", "portraits"]:
        (OUT / d).mkdir(parents=True)
    data = make_map(carto, font)
    make_tokens(data, reloaded, font)
    for name in FX:  # 特效贴图：白色带透明度，512 缩到 256，运行时再染色
        Image.open(particles / "PNG (Transparent)" / f"{name}.png").convert("RGBA").resize((256, 256), Image.LANCZOS).save(OUT / "fx" / f"{name}.png")
    for name, *_ in [*PORTRAITS.values(), ("_unknown",)]:
        shutil.copy(reloaded / "data/base/gfx/portraits" / f"{name}.png", OUT / "portraits" / f"{name}.png")
    Image.open(reloaded / "data/base/gfx/bg/castle.png").convert("RGB").save(OUT / "title.jpg", quality=90)  # 清院本《清明上河图》城关一段
    make_font(font, font.parent / "OFL.txt")
    shutil.copy(ROOT / "docs" / "assets.md", OUT / "CREDITS.md")
    print("素材已写入", OUT)


if __name__ == "__main__":
    main()
