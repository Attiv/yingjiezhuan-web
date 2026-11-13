#!/usr/bin/env python3
"""把原版剧本里的「场景地图 + 场上人物」抽出来，生成 src/data/stages.json。

原版的剧情不是「一张插画 + 对话框」：每一幕先 `load_map` 换一张等距视角的城郭/宫殿地图，
再用 `place_person` 把人摆到格子上，对话之间用 `move_person` / `remove_person` 走动、退场。
参考包（hero-tools original pack）导出的 .drama 只留了文字，这些舞台调度全丢了，
所以剧情页一直是空画面。这个脚本从 `original/extract/text/snr*.json` 的操作码里把它们捞回来。

做法：
  1. .drama 的每一节（`c0_s0_story1` / `c0_s0_b5_outro` / `orig_c0_s0_b5_5`）对应剧本里
     某个 block 的某条 record；按 id 先定位 block，再用台词顺序对齐到具体 record。
  2. 走一遍 record 的操作码，把 load_map / place_person / move_person / remove_person /
     clear_persons 记成「在这一幕的第几句台词之前发生」。
  3. 输出 { section: { map, ops: [{at, op, ...}], lines } }：at = 这一幕里已经说过几句台词，
     lines = 这一幕应该有几句（运行时拿它对账，数目不符就不摆人，免得错位）。

对齐不上的一节就不写，运行时退回原来的纯对话框，不会演错。
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EX = ROOT / "original" / "extract"
PACK = ROOT / "original" / "pack"
OUT = ROOT / "src" / "data" / "stages.json"

# place_person 的 dir 是朝向：0 上、1 右、2 下、3 左（原版只有这四个方向）。
STAGE_OPS = {
    "place_person": "place",
    "move_person": "move",
    "remove_person": "remove",
    "clear_persons": "clear",
}
# load_map 的编号：0x1000 野外地平、0x2xxx 宫殿（PMAP 第 xxx 张）、0x3xxx 战场图。
def map_key(n: int | None) -> str | None:
    if n is None:
        return None
    if 0x2000 <= n < 0x3000:
        return f"palace/{n - 0x2000:03d}"
    if n >= 0x3000:
        return f"battle/{n - 0x3000:03d}"
    return "field"  # 0x1000 与几个小号（原版的特殊近景）都当地平用


def officer_of() -> dict[int, str]:
    """BAKDATA 人物号 → 武将 id（原版 pack 里的对照表，只有 114 名有记录的武将）。"""
    p = PACK / "original-pack.json"
    if not p.exists():
        return {}
    d = json.loads(p.read_text(encoding="utf-8"))
    return {o["bakdata"]: o["officer"] for o in d.get("officers", []) if "bakdata" in o}


def norm(s: str) -> str:
    """比对台词用：去掉空白、句点、全角空格，只留字。"""
    return re.sub(r"[\s．.、，,。　·…\-—―]", "", s)


def load_scenarios() -> list[dict]:
    out = []
    for i in range(5):
        p = EX / "text" / f"snr{i}.json"
        if p.exists():
            out.append(json.loads(p.read_text(encoding="utf-8")))
    return out


def section_lines(path: Path) -> dict[str, list[str]]:
    """读出 .drama 每一节的台词行（say / @narr 的正文），保持顺序。

    只有 say 与 @narr 会变成等玩家的文本步骤（@choice / @title / @duel 都不是），
    所以这里也只数这两种，运行时按「已经说过几句」对齐舞台调度。
    """
    sections: dict[str, list[str]] = {}
    cur: list[str] | None = None
    narr = False  # 上一行是不是 @narr（续行只接旁白，不接对话）
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.rstrip()
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line.startswith("== "):
            cur = sections.setdefault(line[3:].strip(), [])
            narr = False
            continue
        if cur is None:
            continue
        s = line.strip()
        if s.startswith("@narr"):
            cur.append(s[5:].strip())
            narr = True
            continue
        if s.startswith("@"):
            narr = False
            continue
        if re.match(r"^-\s*.+?\s*->\s*[A-Za-z0-9_]+$", s):
            narr = False  # @choice 的选项
            continue
        m = re.match(r"^([A-Za-z0-9_]+|[\u4e00-\u9fff]{1,8}):\s*(.*)$", s)
        if m:
            cur.append(m.group(2).strip())
            narr = False
        elif cur and narr:
            cur[-1] += "\n" + s  # 旁白的续行
    return sections


class Rec:
    """一条 record 的操作码走查结果：舞台动作 + 台词块。"""

    def __init__(self, block: dict, rec: dict, dialogues: dict[int, list[str]], officers: dict[int, str]):
        self.block = block["index"]
        self.record = rec["index"]
        self.trigger = rec["trigger"]["kind_name"]
        self.groups: list[tuple[int, list[dict]]] = []  # (台词块号, 动作)
        self.chunks: list[list[str]] = []
        self.optional: list[bool] = []  # 对不上也能跳过（地名条这种）
        self.map: str | None = None
        self.name: dict[int, str] = {}
        self.officers = officers
        self._walk(rec, dialogues)

    def _walk(self, rec: dict, dialogues: dict[int, list[str]]) -> None:
        pending: list[dict] = []
        for c in rec["code"]:
            m = c["mnemonic"]
            args = {a["name"]: a["value"] for a in c.get("args", [])}
            if m == "load_map":
                self.map = map_key(args["map"])
                pending.append({"op": "map", "id": self.map})
            elif m == "caption":
                # 地名条：原版在画面左上角打一行字，剧本里也留成了 @narr，所以它自己算一个台词块
                text = (c.get("resolved") or {}).get("text", "").strip()
                if pending:
                    self.groups.append((len(self.chunks), pending))
                    pending = []
                self.groups.append((len(self.chunks), [{"op": "caption", "text": text}]))
                self.chunks.append([text])
                self.optional.append(True)
            elif m in STAGE_OPS:
                op = {"op": STAGE_OPS[m]}
                if "person" in args:
                    who = args["person"]
                    op["who"] = who
                    name = (c.get("resolved") or {}).get("person")
                    if name:
                        self.name[who] = name.strip()
                    if who in self.officers:
                        op["id"] = self.officers[who]
                if "x" in args:
                    op["x"], op["y"] = args["x"], args["y"]
                if "dir" in args:
                    op["dir"] = args["dir"]
                pending.append(op)
            elif m in ("dialogue", "narration"):
                lines = dialogues.get(args["text"], [])
                if m == "narration" and not lines:
                    lines = [(c.get("resolved") or {}).get("text", "")]
                if not lines:
                    continue
                if pending:
                    self.groups.append((len(self.chunks), pending))
                    pending = []
                self.chunks.append(lines)
                self.optional.append(False)
        if pending:
            self.groups.append((len(self.chunks), pending))


def dialogue_map(scene: dict) -> dict[int, list[str]]:
    """message offset → 那一段的台词行（一段里连说几句就是几行）。"""
    out: dict[int, list[str]] = {}
    for d in scene.get("dialogues", []):
        out[d["offset"]] = [ln["text"] for ln in d.get("lines", [])]
    return out


class Merged:
    """把同一 block 的几条 run record 接成一条：一章的剧情幕常常跨好几条 record。"""

    def __init__(self, recs: list["Rec"]):
        self.chunks: list[list[str]] = []
        self.optional: list[bool] = []
        self.groups: list[tuple[int, list[dict]]] = []
        self.map = next((r.map for r in recs if r.map), None)
        self.name: dict[int, str] = {}
        self.record = -1
        for r in recs:
            base = len(self.chunks)
            self.chunks += r.chunks
            self.optional += r.optional
            self.groups += [(base + chunk, ops) for chunk, ops in r.groups]
            self.name.update(r.name)


def candidates(block: dict, dlg: dict[int, list[str]], officers: dict[int, str]) -> list:
    """一条一条 record，外加把 run 都接起来的那一条。"""
    recs = [Rec(block, r, dlg, officers) for r in block["records"]]
    out: list = list(recs)
    runs = [r for r in recs if r.trigger == "run"]
    if len(runs) > 1:
        out.append(Merged(runs))
    return out


def align(section: list[str], rec) -> list[int] | None:
    """把 record 的每个台词块对到 section 里的行号；对不齐就返回 None。

    地名条（caption）这种可有可无的块对不上就跳过——原版有些 caption 被剧本写成了
    别的措辞，为了它把整幕的站位丢掉不划算。
    """
    if not rec.chunks:
        return None
    at: list[int] = []
    pos = 0
    for k, lines in enumerate(rec.chunks):
        target = norm(lines[0])
        j = pos
        while j < len(section) and norm(section[j]) != target:
            j += 1
        if j >= len(section):
            if rec.optional[k]:
                at.append(min(pos, len(section)))
                continue
            return None
        at.append(j)
        pos = j + len(lines)  # 这一块的其余行应该紧跟着
    return at


def section_target(sid: str) -> tuple[int, int, int] | None:
    """从节的 id 猜 (章, 场, block)。三种命名：cX_sY_storyN / cX_sY_bN_xxx / orig_cX_sY_bN_R。"""
    m = re.match(r"^(?:orig_)?c(\d+)_s(\d+)_(?:story(\d+)|b(\d+))", sid)
    if not m:
        return None
    return int(m.group(1)), int(m.group(2)), int(m.group(3) if m.group(3) is not None else m.group(4))


def block_talks(block: dict, dlg: dict[int, list[str]]) -> dict[str, list[str]]:
    """这一幕里「点某个人会说一句」的那些话：原版把谈话写成 trigger=talk、args[0]=人物号 的 record。"""
    out: dict[str, list[str]] = {}
    for r in block["records"]:
        t = r["trigger"]
        if t["kind_name"] != "talk":
            continue
        who = t["args"][0]
        lines: list[str] = []
        for c in r["code"]:
            if c["mnemonic"] != "dialogue":
                continue
            args = {a["name"]: a["value"] for a in c.get("args", [])}
            lines += dlg.get(args["text"], [])
        if lines and str(who) not in out:
            out[str(who)] = lines
    return out


def build_ops(rec, at: list[int], lines: list[str]) -> list[dict]:
    """把一条 record 的动作按台词位置摊平：第 0 块之前的动作在开口之前，其余压在那句话之前。"""
    ops: list[dict] = []
    for chunk, group in rec.groups:
        # 第一块之前的动作（换地图、摆人）在开口之前；之后的动作压在那句话之前；
        # 最后一块之后的动作演完之后才有
        pos = 0 if chunk == 0 else (at[chunk] if chunk < len(at) else len(lines))
        for op in group:
            if op["op"] == "map":
                continue  # 地图单独放顶层
            ops.append({"at": pos, **op})
    return ops


GRID_W, GRID_H = 31, 20  # 宫殿图 32×20 瓦片，人能站的走格是 31×20


def fits(ops: list[dict]) -> bool:
    """摆人的坐标是不是在这张图上：落到图外的多半是配错了 record（宫殿与野外的坐标系不一样）。"""
    return all(0 <= o.get("x", 0) < GRID_W and 0 <= o.get("y", 0) < GRID_H
               for o in ops if o["op"] in ("place", "move"))


def main() -> None:
    dyn = load_scenarios()
    officers = officer_of()
    stages: dict[str, dict] = {}
    failed: list[str] = []
    for path in sorted((PACK / "dramas").glob("*.drama")):
        for sid, lines in section_lines(path).items():
            tgt = section_target(sid)
            if not tgt or tgt[0] >= len(dyn):
                failed.append(sid)
                continue
            ch, sy, block = tgt
            scenes = dyn[ch]["scenes"]
            if sy >= len(scenes):
                failed.append(sid)
                continue
            scene = scenes[sy]
            dlg = dialogue_map(scene)
            best: tuple[bool, int, object, list[int], list[dict]] | None = None
            for b in scene["blocks"]:
                if b["index"] != block:
                    continue
                for rec in candidates(b, dlg, officers):
                    at = align(lines, rec)
                    if at is None:
                        continue
                    # 对上的台词越多越可信：一场戏往往横跨好几条 record。
                    # 人全落在图外的一律不选：那多半是同 block 里别的场景的 record。
                    cover = sum(len(rec.chunks[k]) for k in range(len(at)))
                    ops = build_ops(rec, at, lines)
                    ok = fits(ops) or not (rec.map or "").startswith("palace/")
                    if best is None or (ok, cover) > (best[0], best[1]):
                        best = (ok, cover, rec, at, ops)
            if best is None:
                failed.append(sid)
                continue
            _, _, rec, at, ops = best
            if (rec.map or "").startswith("palace/"):
                ops = [o for o in ops if o["op"] not in ("place", "move", "remove", "clear") or fits([o])]
            else:
                # 野外的坐标系比一张底图大（原版这里会跟着人滚屏），我们只铺底图，不摆人
                ops = [o for o in ops if o["op"] not in ("place", "move", "remove", "clear")]
            stage: dict = {"map": rec.map, "lines": len(lines), "ops": ops}
            onStage = {o["who"] for o in ops if o["op"] == "place"}
            if rec.name and onStage:
                stage["names"] = {w: n for w, n in rec.name.items() if w in onStage}
            talks = block_talks(scene["blocks"][block], dlg) if block < len(scene["blocks"]) else {}
            # 只有真的站在场上、报得出名字的人才点得到，其余的对白删掉（否则数据里全是点不着的台词）
            talks = {w: ls for w, ls in talks.items() if int(w) in onStage}
            if talks:
                stage["talks"] = talks
            stages[sid] = stage
    OUT.write_text(json.dumps(stages, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    maps = sum(1 for s in stages.values() if s["map"] is not None)
    places = sum(1 for s in stages.values() for o in s["ops"] if o["op"] == "place")
    talks = sum(1 for s in stages.values() if s.get("talks"))
    print(f"场景 {len(stages)} 节（有地图 {maps} 节、摆人 {places} 次、能点人说话 {talks} 节），未对齐 {len(failed)} 节")
    if failed:
        print("  未对齐：", " ".join(failed[:10]), "…" if len(failed) > 10 else "")


if __name__ == "__main__":
    sys.exit(main())
