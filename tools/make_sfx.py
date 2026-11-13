#!/usr/bin/env python3
"""把音效装进 public/assets/sfx/。

原版 DOS 的效果音由 SBOPL2.COM（Sound Blaster BGM Driver 1.01）在 OPL2 的 7/8 通道上
实时合成，音符表走 MAIN.EXE 的 int 65h，目前没有可用的提取器。这里采用开源复刻项目
eiketsuden-reloaded 为同一套引擎挑好的 21 个动作音效（Ninja Adventure，CC0），语义键
与它的引擎 sfx::* 一一对应；**不是原版 DOS 音效**，见 public/assets/CREDITS.md。

    git clone --depth 1 https://github.com/jeiel85/eiketsuden-reloaded.git /tmp/eiketsuden-reloaded
    python3 tools/make_sfx.py [/tmp/eiketsuden-reloaded/data/base/sfx]

只做格式校验与复制，不改采样数据。产物随仓库提交，运行时不依赖临时目录。
"""
from __future__ import annotations

import shutil
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "assets" / "sfx"
KEYS = [
    "cursor", "confirm", "cancel", "error", "step",
    "hit", "hit_heavy", "arrow", "fire", "water", "rock",
    "heal", "morale_up", "morale_down", "confuse", "levelup",
    "retreat", "treasure", "phase", "victory", "defeat",
]


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/tmp/eiketsuden-reloaded/data/base/sfx")
    missing = [k for k in KEYS if not (src / f"{k}.wav").is_file()]
    if missing:
        sys.exit(f"找不到音效：{', '.join(missing)}（源目录 {src}）")
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for k in KEYS:
        p = src / f"{k}.wav"
        with wave.open(str(p)) as w:
            if (w.getnchannels(), w.getsampwidth(), w.getframerate()) != (1, 2, 44100):
                sys.exit(f"{p.name}：需要 16-bit 单声道 44.1kHz，实际 "
                         f"{w.getnchannels()}ch / {w.getsampwidth() * 8}bit / {w.getframerate()}Hz")
        dst = OUT / p.name
        shutil.copyfile(p, dst)
        total += dst.stat().st_size
    print(f"音效 {len(KEYS)} 个 → {OUT}（{total / 1024:.0f} KB）")


if __name__ == "__main__":
    main()
