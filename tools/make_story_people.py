#!/usr/bin/env python3
"""从自己持有的 DOS 原版提取剧情人物，和 HEXZCHR 战场棋子分开。

python3 tools/make_story_people.py <原版游戏目录>
SSCCHR2.R3：29 项，每项 2560 字节，四个独立的 32×40 planar 帧。
帧 0/1 为正面两步，帧 2/3 为背面两步；不是一张 64×80 planar 图。
人物编号来自 BAKDATA 的 sprite 字段，不能用战场兵种号替代。
"""
import json
import sys
from pathlib import Path

from PIL import Image
from extract import ls11

ROOT = Path(__file__).resolve().parent.parent


def make_story_people(source: Path) -> Path:
    entries = ls11((source / "SSCCHR2.R3").read_bytes())
    assert len(entries) == 29
    colors = json.loads((ROOT / "original/extract/gfx/original/palettes.json").read_text())["slots"][0]
    palette = [tuple(bytes.fromhex(c[1:])) for c in colors]
    sheet = Image.new("RGBA", (29 * 32, 4 * 40))
    for person, raw in enumerate(entries):
        assert len(raw) == 2560, (person, len(raw))
        for frame in range(4):
            data = raw[frame * 640:(frame + 1) * 640]
            im = Image.new("RGBA", (32, 40))
            pixels = im.load()
            for y in range(40):
                for x in range(32):
                    byte, shift = y * 4 + x // 8, 7 - x % 8
                    index = sum(((data[p * 160 + byte] >> shift) & 1) << p for p in range(4))
                    if index:
                        pixels[x, y] = (*palette[index], 255)
            sheet.paste(im, (person * 32, frame * 40))
    output = ROOT / "public/assets/story/people.png"
    assert output.parent.is_dir()
    sheet.save(output)
    return output


if __name__ == "__main__":
    print(make_story_people(Path(sys.argv[1])))
