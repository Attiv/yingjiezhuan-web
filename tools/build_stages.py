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
     lines = 这一幕应该有几句；map 动作保留 record 中途换图的时序。

对齐不上的一节就不写，运行时退回原来的纯对话框，不会演错。
"""
from __future__ import annotations

import json
import re
import sys
import tomllib
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
    """BAKDATA 人物号 → 武将 id。

    pack 的 original-pack.json 只列了 114 名有改动记录的武将；其余按 BAKDATA 的汉字名与
    officers.toml 对齐，否则刘备、张飞这类没被 pack 列出的说话人会退化成显示名，
    头像查不到而落到通用像。使者这类群众角色没有武将 id，仍保留显示名。
    """
    out: dict[int, str] = {}
    p = PACK / "original-pack.json"
    if p.exists():
        d = json.loads(p.read_text(encoding="utf-8"))
        out = {o["bakdata"]: o["officer"] for o in d.get("officers", []) if "bakdata" in o}
    spec = PACK / "officers.toml"
    people = EX / "text" / "officers.json"
    if spec.exists() and people.exists():
        table = tomllib.loads(spec.read_text(encoding="utf-8"))["officer"]
        by_name = {(o.get("hanja") or o.get("name")): o["id"] for o in table}
        for person in json.loads(people.read_text(encoding="utf-8")):
            oid = by_name.get(person.get("name"))
            if oid and person["index"] not in out:
                out[person["index"]] = oid
    return out


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
    text_kind: str | None = None  # 续行属于上一句旁白或对话，不增加台词步数。
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.rstrip()
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line.startswith("== "):
            cur = sections.setdefault(line[3:].strip(), [])
            text_kind = None
            continue
        if cur is None:
            continue
        s = line.strip()
        if s.startswith("@narr"):
            cur.append(s[5:].strip())
            text_kind = "narr"
            continue
        if s.startswith("@"):
            text_kind = None
            continue
        if re.match(r"^-\s*.+?\s*->\s*[A-Za-z0-9_]+$", s):
            text_kind = None  # @choice 的选项
            continue
        m = re.match(r"^([A-Za-z0-9_]+|[\u4e00-\u9fff]{1,8}):\s*(.*)$", s)
        if m:
            cur.append(m.group(2).strip())
            text_kind = "say"
        elif cur and (text_kind == "narr" or (text_kind == "say" and line[:1].isspace())):
            cur[-1] += "\n" + s
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
        people = json.loads((EX / "text/officers.json").read_text(encoding="utf-8"))
        for c in rec["code"]:
            m = c["mnemonic"]
            args = {a["name"]: a["value"] for a in c.get("args", [])}
            if m == "load_map":
                key = map_key(args["map"])
                if self.map is None:
                    self.map = key
                pending.append({"op": "map", "map": key})
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
                    if STAGE_OPS[m] in ("place", "move"):
                        op["sprite"] = people[who]["sprite"]
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
        self.recs = recs
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
        target = [norm(line) for line in lines]
        j = pos
        while j < len(section) and [norm(line) for line in section[j:j + len(lines)]] != target:
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
    if sid in ("c3_s4_b0_outro", "c3_s4_b0_defeat"):
        return 3, 4, 1  # pack 用 b0 命名，胜负结算实际位于麦城 block 1。
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
        who = t["args"][0] | t["args"][1] << 8
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
            ops.append({"at": pos, **op})
    return ops


def original_timeline(scene: dict, records: list[dict], officers: dict[int, str]) -> list[dict]:
    """已核对的线性记录直接保留指令先后；未知操作码不猜语义。"""
    people = json.loads((EX / "text/officers.json").read_text(encoding="utf-8"))
    dialogues = {d["offset"]: d["lines"] for d in scene.get("dialogues", [])}
    songs = {2: "sad", 3: "peace", 11: "tension", 12: "camp"}
    out: list[dict] = []
    for rec in records:
        for c in rec["code"]:
            m = c["mnemonic"]
            a = {a["name"]: a["value"] for a in c.get("args", [])}
            resolved = c.get("resolved") or {}
            if m == "input_control" and a["value"] == 0:
                break  # 回到玩家自由交谈，talk records 单独导出
            if m == "dialogue":
                for line in dialogues.get(a["text"], []):
                    out.append({"t": "say", "who": officers.get(line["speaker"], line["speaker_name"].strip()),
                                "text": line["text"].strip()})
            elif m == "narration":
                out.append({"t": "text", "text": "\n".join(s.strip() for s in resolved.get("text", "").splitlines()).strip()})
            elif m == "title":
                out.append({"t": "title", "text": resolved["text"]})
            elif m == "show_picture":
                out.append({"t": "picture", "key": f"orig_{a['picture']:02d}"})
            elif m == "play_music" and a["song"] in songs:
                out.append({"t": "bgm", "key": songs[a["song"]]})
            elif m == "data" and a.get("kind") == 2:
                out.append({"t": "gold", "n": a["value"]})
            elif m == "add_levels":
                out.append({"t": "level", "id": officers[a["person"]], "n": a["levels"]})
            elif m == "set_flag":
                out.append({"t": "set", "flag": f"orig_f{a['flag']}", "value": 0 if a["clear"] else 1})
            elif m == "load_map":
                out += [{"t": "picture", "key": ""}, {"t": "action", "op": {"at": 0, "op": "map", "map": map_key(a["map"])}}]
            elif m == "caption":
                out += [{"t": "action", "op": {"at": 0, "op": "caption", "text": resolved["text"].strip()}},
                        {"t": "wait", "ms": 1200}]
            elif m in STAGE_OPS or m == "set_graphic":
                op: dict = {"at": 0, "op": STAGE_OPS.get(m, "graphic")}
                if "person" in a:
                    op["who"] = a["person"]
                    if op["op"] in ("place", "move", "graphic"):
                        op["sprite"] = a.get("graphic", people[a["person"]]["sprite"])
                    if a["person"] in officers:
                        op["id"] = officers[a["person"]]
                for key in ("x", "y", "dir"):
                    if key in a:
                        op[key] = a[key]
                out.append({"t": "action", "op": op})
    return out


def add_free_rooms(stages: dict, dyn: list[dict], officers: dict[int, str]) -> None:
    """已核对的界桥篇交谈阶段；明确 record/group 边界，不混入下一阶段对白。"""
    scene = dyn[1]["scenes"][0]
    blocks = {b["index"]: b for b in scene["blocks"]}
    dialogues = {d["offset"]: d["lines"] for d in scene["dialogues"]}
    sections = section_lines(PACK / "dramas/original_chapters.drama")
    people = json.loads((EX / "text/officers.json").read_text(encoding="utf-8"))

    def record(b: int, r: int) -> dict:
        return next(x for x in blocks[b]["records"] if x["index"] == r)

    def speech(b: int, r: int) -> list[dict]:
        return [line for c in record(b, r)["code"] if c["mnemonic"] == "dialogue"
                for line in dialogues[next(a["value"] for a in c["args"] if a["name"] == "text")]]

    # 顺序已经人工核对；广川保留现有战斗副作用，只补战后run与出发record的舞台动作。
    for b, records in {0: [0, 1, 4], 1: [2], 2: [3, 4], 5: [4, 5, 6, 12, 13], 8: [0, 1]}.items():
        sid = f"c1_s0_story{b}"
        rec = Merged([Rec(blocks[b], record(b, r), dialogue_map(scene), officers) for r in records])
        at = align(sections[sid], rec)
        if at is None:
            raise ValueError(f"交谈场景 {sid} 原始记录未完整对齐")
        info = stages.setdefault(sid, {})
        ops = [{"at": at[chunk] if chunk < len(at) else len(sections[sid]), **op}
               for chunk, group_ops in rec.groups for op in group_ops]
        info.update(map=rec.map, lines=len(sections[sid]), ops=ops,
                    source={"chapter": 1, "scene": 0, "block": b, "records": records}, ordered=True)
        # 连续房间继承上幕人物，名字也必须能查到；不据此开放过期的talk。
        info["names"] = rec.name | {i: p["name"].strip() for i, p in enumerate(people) if i in {0, 1, 2, 82, 220, 244, 245, 364, 374}}
        info.pop("talks", None)

    # sid/block, 暂停点record, 交谈block/group, 推进人物、文字、确认record。
    phases = [
        (0, 1, 0, 2, None, "繼續劇情", None),
        (0, 4, 1, 0, 82, "與簡雍交談", None),
        (1, 2, 2, 0, 364, "聽使者說明", None),
        (2, 3, 2, 1, 1, "準備出發", 4),
        (5, 6, 5, 4, 1, "準備出發", 12),
        (8, 0, 8, 1, 1, "準備出發", 1),
    ]
    for b, r, talk_block, group, who, label, confirm in phases:
        sid = f"c1_s0_story{b}"
        last = speech(b, r)[-1]
        room = {"after": {"who": officers.get(last["speaker"], last["speaker_name"].strip()), "text": last["text"].strip()},
                "talks": {}, "next": {"label": label}, "source": {"block": talk_block, "group": group}}
        if who is not None:
            room["next"]["who"] = who
        if confirm is not None:
            line = speech(talk_block, confirm)[0]
            room["next"]["prompt"] = {"who": officers.get(line["speaker"], line["speaker_name"].strip()), "text": line["text"].strip()}
        for entry in blocks[talk_block]["records"]:
            trigger = entry["trigger"]
            if trigger["kind_name"] != "talk" or trigger["group"] != group:
                continue
            if any(c["mnemonic"] not in ("dialogue", "end") for c in entry["code"]):
                continue
            person = trigger["args"][0] | trigger["args"][1] << 8
            room["talks"][str(person)] = original_timeline(scene, [entry], officers)
        if b == 5:
            room["shop"] = {"who": 374, "items": next(c["bytes"] for c in record(5, 7)["code"] if c["mnemonic"] == "set_shop_items")}
        stages[sid].setdefault("rooms", {})[f"{sid}:b{talk_block}g{group}"] = room


def add_beihai_room(stages: dict, dyn: list[dict], officers: dict[int, str]) -> None:
    """北海战后：R0致谢赠金 → group1自由交谈 → R4升级友军并行军徐州。"""
    sid = "c1_s1_story4"
    room_id = f"{sid}:b4g1"
    scene = dyn[1]["scenes"][1]
    block = next(b for b in scene["blocks"] if b["index"] == 4)
    records = {r["index"]: r for r in block["records"]}
    before = original_timeline(scene, [records[0]], officers)
    after = original_timeline(scene, [records[4]], officers)
    prompt = original_timeline(scene, [records[3]], officers)[0]
    # 本幕线性且完整核对，直接替换pack片段；500金不再从pack另加一次。
    # song 5仍沿用pack的peace映射，其他已知音乐按原始指令切换。
    timeline = [{"t": "bgm", "key": "peace"}, *before, {"t": "room", "id": room_id}, *after]
    info = stages[sid]
    info.update(timeline=timeline, source={"chapter": 1, "scene": 1, "block": 4, "records": [0, 4]})
    info["rooms"] = {room_id: {
        "after": {k: before[-1][k] for k in ("who", "text")},
        "talks": {str(r["trigger"]["args"][0] | r["trigger"]["args"][1] << 8):
                  original_timeline(scene, [r], officers) for r in (records[1], records[2])},
        "next": {"who": 1, "label": "準備出發", "prompt": {k: prompt[k] for k in ("who", "text")}},
        "source": {"block": 4, "group": 1},
    }}
    info.pop("talks", None)


def add_xuzhou_rooms(stages: dict, dyn: list[dict], officers: dict[int, str]) -> None:
    """徐州R0/R1 → group2点陶谦R7 → group3分别找关羽R12或张飞R13。"""
    sid = "c1_s1_story6"
    scene = dyn[1]["scenes"][1]
    block = next(b for b in scene["blocks"] if b["index"] == 6)
    records = {r["index"]: r for r in block["records"]}

    def steps(r: int, start: int = 0) -> list[dict]:
        return original_timeline(scene, [{**records[r], "code": records[r]["code"][start:]}], officers)

    def room(group: int, last: dict, talk_records: list[int]) -> dict:
        return {"after": {k: last[k] for k in ("who", "text")},
                "talks": {str(records[r]["trigger"]["args"][0] | records[r]["trigger"]["args"][1] << 8):
                          steps(r) for r in talk_records}, "source": {"block": 6, "group": group}}

    first, decision = f"{sid}:b6g2", f"{sid}:b6g3"
    opening = steps(0) + [{"t": "bgm", "key": "peace"}] + steps(1)
    discussion = steps(7)
    options = [{"who": who, "label": label, "prompt": {k: steps(r)[0][k] for k in ("who", "text")},
                "goto": target} for who, label, r, target in
               [(1, "與關羽出戰", 12, "xuzhou_fight"), (2, "派張飛求和", 13, "xuzhou_peace")]]
    info = stages[sid]
    info["timeline"] = [
        {"t": "set", "flag": "orig_route_c1_s1_b6", "value": 0},
        *opening, {"t": "room", "id": first}, *discussion,
        {"t": "room", "id": decision, "options": options},
        {"t": "label", "name": "xuzhou_fight"}, *steps(12, 2),
        {"t": "goto", "label": "xuzhou_done"},
        {"t": "label", "name": "xuzhou_peace"}, *steps(13, 2),
        # 原始goto_block8映射到pack已有路线，人物退场完成后才写入。
        {"t": "set", "flag": "orig_route_c1_s1_b6", "value": 1},
        {"t": "label", "name": "xuzhou_done"},
    ]
    info["rooms"] = {
        first: {**room(2, next(s for s in reversed(opening) if s["t"] == "say"), list(range(2, 7))),
                "next": {"who": 15, "label": "與陶謙議事"}},
        decision: room(3, discussion[-1], list(range(8, 12))),
    }
    info["source"] = {"chapter": 1, "scene": 1, "block": 6, "records": [0, 1, 7, 12, 13],
                      "confirmedCodeStart": {"12": 2, "13": 2}}
    info.pop("talks", None)


def add_xuzhou_second_scene(stages: dict, dyn: list[dict], officers: dict[int, str]) -> None:
    """小沛议事厅：R0开场 → 简雍汇报房间 → 关羽出征确认 → 野外摆放山贼。"""
    sid = "c1_s2_story1"
    scene = dyn[1]["scenes"][2]
    block = next(b for b in scene["blocks"] if b["index"] == 1)
    records = {r["index"]: r for r in block["records"]}
    first, second = f"{sid}:b1g1", f"{sid}:b1g2"

    def steps(r: int, start: int = 0) -> list[dict]:
        rec = records[r]
        return original_timeline(scene, [{**rec, "code": rec["code"][start:]}], officers)

    # R8 的前两条指令是对白与 if_answer；由可取消的房间确认框替代。
    assert records[8]["code"][0]["mnemonic"] == "dialogue"
    assert records[8]["code"][1]["mnemonic"] == "if_answer"
    assert records[8]["code"][1]["args"][0]["value"] == 0
    assert records[8]["code"][1]["args"][1]["value"] == 6
    assert records[9]["trigger"]["kind_name"] == "run"

    first_talks = {str(records[r]["trigger"]["args"][0] | records[r]["trigger"]["args"][1] << 8):
                   steps(r) for r in (1, 2, 3)}
    second_talks = {str(records[r]["trigger"]["args"][0] | records[r]["trigger"]["args"][1] << 8):
                    steps(r) for r in (5, 6, 7)}
    prompt = steps(8)[0]
    timeline = [
        {"t": "bgm", "key": "peace"},
        *steps(0),
        {"t": "room", "id": first},
        *steps(4),
        {"t": "room", "id": second},
        *steps(8, 2),
        *steps(9),
    ]
    names = {}
    for r in (0, 4, 8, 9):
        for code in records[r]["code"]:
            person = (code.get("resolved") or {}).get("person")
            if person:
                args = {a["name"]: a["value"] for a in code.get("args", [])}
                names[args["person"]] = person.strip()

    info = stages[sid]
    info.update(timeline=timeline, rooms={
        first: {"talks": first_talks, "next": {"who": 82, "label": "聽簡雍彙報"},
                "source": {"block": 1, "group": 1}},
        second: {"talks": second_talks,
                 "next": {"who": 1, "label": "準備出征", "prompt": {k: prompt[k] for k in ("who", "text")}},
                 "source": {"block": 1, "group": 2}},
    }, source={"chapter": 1, "scene": 2, "block": 1, "records": [0, 4, 8, 9]}, names=names)
    info.pop("talks", None)


def add_xiaopei_return(stages: dict, dyn: list[dict], officers: dict[int, str]) -> None:
    """小沛山贼战后：条件奖励 → 两组交谈 → 徐州官邸地点触发。

    原版 R6 是 location trigger，而当前网页没有城镇自由行走，
    因此第二房间的「前往徐州官邸」按钮作为明确的临时适配入口；R6 的原始触发数据
    仍单独保存在 location，参数字段语义待核对，后续接入行走时不改舞台记录。
    """
    sid = "c1_s2_story6"
    scene = dyn[1]["scenes"][2]
    block = next(b for b in scene["blocks"] if b["index"] == 6)
    records = {r["index"]: r for r in block["records"]}

    def steps(r: int, start: int = 0, end: int | None = None) -> list[dict]:
        rec = records[r]
        return original_timeline(scene, [{**rec, "code": rec["code"][start:end]}], officers)

    # R0 自动段在 input_control=0 前结束；奖励的 if_flags 必须保留为脚本条件，
    # 不能由生成器在当前存档旗标未知时擅自发放。
    opening = steps(0, 0, 15)
    reward_caption = steps(0, 17, 18)
    farewell = steps(0, 22)
    first, second = f"{sid}:b6g1", f"{sid}:b6g2"
    first_talks = {str(records[r]["trigger"]["args"][0] | records[r]["trigger"]["args"][1] << 8):
                   steps(r) for r in (1, 2, 3)}
    second_talks = {"366": steps(5)}

    # f8/f9/f10 是三处剿匪完成标志；if_flags 为 unless：未完成才跳过奖励。
    # 元数据保存发放条件（非零），timeline 使用相反的跳过条件（等于0）。
    reward_conditions = {
        "gold": {"flag": "orig_f8", "is": 0, "cmp": "ne", "n": 500},
        "items": [
            {"flag": "orig_f9", "is": 0, "cmp": "ne", "id": 16},
            {"flag": "orig_f10", "is": 0, "cmp": "ne", "id": 38},
        ],
    }
    # 原版 add_item 使用道具号16/38；Step 层使用 pack 道具 key。
    item_keys = {16: "archery_guide", 38: "scroll_torrent"}
    reward_steps: list[dict] = [
        {"t": "if", "flag": "orig_f8", "is": 0, "goto": "skip_gold"},
        {"t": "gold", "n": 500},
        *reward_caption,
        {"t": "label", "name": "skip_gold"},
        {"t": "if", "flag": "orig_f9", "is": 0, "goto": "skip_archery_guide"},
        {"t": "item", "id": item_keys[16]},
        {"t": "label", "name": "skip_archery_guide"},
        {"t": "if", "flag": "orig_f10", "is": 0, "goto": "skip_scroll_torrent"},
        {"t": "item", "id": item_keys[38]},
        {"t": "label", "name": "skip_scroll_torrent"},
    ]

    # 尚无格式依据证明六字节的字段语义；保留原始参数，不猜作地点或坐标。
    location = {
        "source": {"block": 6, "record": 6, "trigger": "location"},
        "rawArgs": records[6]["trigger"]["args"].copy(),
        "timeline": steps(6),
        "adapter": "room_button",
    }
    names: dict[int, str] = {}
    for r in (0, 4, 6):
        for code in records[r]["code"]:
            person = (code.get("resolved") or {}).get("person")
            if person:
                args_by_name = {a["name"]: a["value"] for a in code.get("args", [])}
                names[args_by_name["person"]] = person.strip()

    info = stages[sid]
    info.update(
        timeline=[
            {"t": "bgm", "key": "peace"},
            *opening,
            *reward_steps,
            *farewell,
            {"t": "room", "id": first},
            *steps(4),
            {"t": "room", "id": second},
            *steps(6),
        ],
        rooms={
            first: {"talks": first_talks, "next": {"who": 82, "label": "聽快使說明"},
                    "source": {"block": 6, "group": 1}},
            second: {"talks": second_talks, "next": {"label": "前往徐州陶謙官邸"},
                     "source": {"block": 6, "group": 2}},
        },
        rewardConditions=reward_conditions,
        location=location,
        source={"chapter": 1, "scene": 2, "block": 6, "records": [0, 4, 6]},
        names=names,
    )
    info.pop("talks", None)


def add_lubu_arrival(stages: dict, dyn: list[dict], officers: dict[int, str]) -> None:
    """吕布来投：三组点击（糜竺请进 → 吕布说明 → 吕布再请求）后重摆议事厅。

    原版三个 group 各自以 talk record 收尾；这里把每组闲谈放进房间，
    只有指定人物的点击才会推进到下一组，和 story1/story6 的停顿点一致。
    """
    sid = "c1_s2_story8"
    scene = dyn[1]["scenes"][2]
    block = next(b for b in scene["blocks"] if b["index"] == 8)
    records = {r["index"]: r for r in block["records"]}

    def steps(r: int) -> list[dict]:
        return original_timeline(scene, [records[r]], officers)

    opening = steps(0)
    # song 5 在两句旁白之后、地名条之前；映射表没有 5，按 pack 的 @bgm peace 补在这里。
    map_at = next(i for i, step in enumerate(opening) if step["t"] == "action" and step["op"]["op"] == "map")
    opening.insert(map_at, {"t": "bgm", "key": "peace"})
    first, second, third = f"{sid}:b8g1", f"{sid}:b8g2", f"{sid}:b8g3"

    def talks(ids: tuple[int, ...]) -> dict[str, list[dict]]:
        return {str(records[r]["trigger"]["args"][0] | records[r]["trigger"]["args"][1] << 8): steps(r)
                for r in ids}

    names = {}
    for r in (0, 4, 11, 18, 19):
        for code in records[r]["code"]:
            person = (code.get("resolved") or {}).get("person")
            if person:
                names[{a["name"]: a["value"] for a in code.get("args", [])}["person"]] = person.strip()

    info = stages[sid]
    info.update(map="palace/004", timeline=[
        *opening,
        {"t": "room", "id": first},
        *steps(4),
        {"t": "room", "id": second},
        *steps(11),
        {"t": "room", "id": third},
        *steps(18),
        # R19 重摆议事厅，接上下一幕钦差来使。
        {"t": "bgm", "key": "peace"},
        *steps(19),
    ], rooms={
        first: {"talks": talks((1, 2, 3)), "next": {"who": 64, "label": "請呂布進來"},
                "source": {"block": 8, "group": 1}},
        second: {"talks": talks((5, 6, 7, 8, 9, 10)), "next": {"who": 4, "label": "聽呂布說明"},
                 "source": {"block": 8, "group": 2}},
        third: {"talks": talks((12, 13, 14, 15, 16, 17)), "next": {"who": 4, "label": "答覆呂布"},
                "source": {"block": 8, "group": 3}},
    }, source={"chapter": 1, "scene": 2, "block": 8, "records": [0, 4, 11, 18, 19]}, names=names)
    info.pop("talks", None)


def add_envoy_rooms(stages: dict, dyn: list[dict], officers: dict[int, str]) -> None:
    """徐州议事厅钦差到访：糜芳报信 → 孙乾引入 → 使者宣旨 → 糜竺议论 → 出征对白。

    R24 的 if_answer/battle_setup 属于出征准备，营地与战斗由后续节点承担；
    这里只保留「準備好了嗎／請點兵派將／出兵」三句，不重复建战斗。
    """
    sid = "c1_s2_story9"
    scene = dyn[1]["scenes"][2]
    block = next(b for b in scene["blocks"] if b["index"] == 9)
    records = {r["index"]: r for r in block["records"]}

    assert records[24]["code"][1]["mnemonic"] == "if_answer"
    assert records[24]["code"][6]["mnemonic"] == "battle_setup"

    def steps(r: int, end: int | None = None) -> list[dict]:
        return original_timeline(scene, [{**records[r], "code": records[r]["code"][:end]}], officers)

    first, second, third, fourth = (f"{sid}:b9g{i}" for i in range(4))
    talks = lambda ids: {str(records[r]["trigger"]["args"][0] | records[r]["trigger"]["args"][1] << 8): steps(r)
                         for r in ids}
    names = dict(stages["c1_s2_story8"].get("names", {}))
    for r in (3, 8, 14):
        for code in records[r]["code"]:
            person = (code.get("resolved") or {}).get("person")
            if person:
                names[{a["name"]: a["value"] for a in code.get("args", [])}["person"]] = person.strip()

    info = stages[sid]
    # 不写 map：这一幕就在 story8 重摆好的徐州议事厅里接着演，
    # 舞台要沿用上一幕的地图与在场人物（story8 R19 已把五人摆好）。
    info.update(timeline=[
        {"t": "room", "id": first},
        *steps(3),
        {"t": "room", "id": second},
        *steps(8),
        {"t": "room", "id": third},
        *steps(14),
        {"t": "room", "id": fourth},
        *steps(19),
        *steps(24, 9),
    ], rooms={
        first: {"talks": talks((0, 1, 2)), "next": {"who": 81, "label": "讓孫乾進來"},
                "source": {"block": 9, "group": 0}},
        second: {"talks": talks((4, 5, 6, 7)), "next": {"who": 63, "label": "聽孫乾說明"},
                 "source": {"block": 9, "group": 1}},
        third: {"talks": talks((9, 10, 11, 12, 13)), "next": {"who": 364, "label": "聽欽差宣旨"},
                "source": {"block": 9, "group": 2}},
        fourth: {"talks": talks((15, 16, 17, 18)), "next": {"who": 64, "label": "與糜竺商議"},
                 "source": {"block": 9, "group": 3}},
    }, source={"chapter": 1, "scene": 2, "block": 9, "records": [3, 8, 14, 19, 24]}, names=names)
    info.pop("talks", None)


def add_xuzhou_return(stages: dict, dyn: list[dict], officers: dict[int, str]) -> None:
    """返回徐州的两组交谈、求和赠剑、孙乾入队，以及小沛点赵云告别。"""
    scene = dyn[1]["scenes"][1]
    blocks = {b["index"]: {r["index"]: r for r in b["records"]} for b in scene["blocks"]}

    def steps(b: int, r: int, start: int = 0, end: int | None = None) -> list[dict]:
        rec = blocks[b][r]
        return original_timeline(scene, [{**rec, "code": rec["code"][start:end]}], officers)

    def room(b: int, group: int, records: list[int], who: int, label: str) -> dict:
        return {"talks": {str(blocks[b][r]["trigger"]["args"][0] | blocks[b][r]["trigger"]["args"][1] << 8):
                          steps(b, r) for r in records},
                "next": {"who": who, "label": label}, "source": {"block": b, "group": group}}

    # 这两幕没有交谈暂停或剧情副作用分支，直接保留原始出入场顺序。
    for b in (8, 9):
        stages[f"c1_s1_story{b}"]["timeline"] = steps(b, 0)

    sid = "c1_s1_story10"
    first, second = f"{sid}:b10g1", f"{sid}:b10g2"
    # if_flags按原始指令数跳过，而非展开后的对白步数；仅编译已核对的两个条件。
    assert blocks[10][0]["code"][17]["all_set"] == [97] and blocks[10][0]["code"][17]["skip"] == 1
    assert blocks[10][6]["code"][1]["all_set"] == [97] and blocks[10][6]["code"][1]["skip"] == 3
    assert blocks[10][6]["code"][4]["mnemonic"] == "add_item"
    assert blocks[10][6]["code"][4]["args"][0]["value"] == 57
    assert blocks[10][12]["code"][3]["mnemonic"] == "set_allegiance"
    info = stages[sid]
    info.update(map="palace/004", timeline=[
        {"t": "bgm", "key": "peace"}, *steps(10, 0, 0, 17),
        {"t": "if", "flag": "orig_f97", "is": 0, "goto": "xuzhou_thanked"},
        *steps(10, 0, 18), {"t": "label", "name": "xuzhou_thanked"},
        {"t": "room", "id": first},
        {"t": "if", "flag": "orig_f97", "is": 0, "goto": "xuzhou_entrust"},
        *steps(10, 6, 2, 4), {"t": "item", "id": "twin_swords"},
        {"t": "label", "name": "xuzhou_entrust"}, *steps(10, 6, 5),
        {"t": "room", "id": second},
        *steps(10, 12, 0, 3), {"t": "join", "id": "sun_qian"}, *steps(10, 12, 4),
    ], rooms={first: room(10, 1, list(range(1, 6)), 15, "與陶謙交談"),
              second: room(10, 2, list(range(7, 12)), 63, "與孫乾前往小沛")},
                source={"chapter": 1, "scene": 1, "block": 10, "records": [0, 6, 12]})
    info["names"] = {a["value"]: c["resolved"]["person"].strip()
                     for c in blocks[10][0]["code"] if c["mnemonic"] == "place_person"
                     for a in c["args"] if a["name"] == "person"}
    info.pop("talks", None)

    sid = "c1_s1_story11"
    room_id = f"{sid}:b11g1"
    info = stages[sid]
    info.update(map="palace/002", timeline=[*steps(11, 0), {"t": "room", "id": room_id},
                                           *steps(11, 4), {"t": "away", "id": "zhao_yun"}],
                rooms={room_id: room(11, 1, [1, 2, 3], 53, "與趙雲交談")},
                source={"chapter": 1, "scene": 1, "block": 11, "records": [0, 4]})
    info["names"] = {a["value"]: c["resolved"]["person"].strip()
                     for c in blocks[11][0]["code"] if c["mnemonic"] == "place_person"
                     for a in c["args"] if a["name"] == "person"}
    info.pop("talks", None)


def add_original_opening(stages: dict, dyn: list[dict], officers: dict[int, str]) -> None:
    scene = dyn[0]["scenes"][0]
    for block in scene["blocks"][:5]:
        sid = f"c0_s0_story{block['index']}"
        runs = [r for r in block["records"] if r["trigger"]["kind_name"] == "run"]
        info = stages.setdefault(sid, {"map": None, "lines": 0, "ops": []})
        info["timeline"] = original_timeline(scene, runs, officers)
        if block["index"] == 0:
            info["timeline"].append({"t": "picture", "key": ""})
        if block["index"] != 4:
            continue
        talks = {}
        shop = []
        for rec in block["records"]:
            if rec["trigger"]["kind_name"] != "talk":
                continue
            args = rec["trigger"]["args"]
            who = args[0] | args[1] << 8
            entry = {"steps": original_timeline(scene, [rec], officers)}
            if any(c["mnemonic"] == "set_shop_items" for c in rec["code"]):
                shop = next(c["bytes"] for c in rec["code"] if c["mnemonic"] == "set_shop_items")
                entry["shop"] = True
            if any(c["mnemonic"] == "battle_setup" for c in rec["code"]):
                entry["depart"] = True
                entry["prompt"] = entry["steps"][0]["text"]
                entry["after"] = entry["steps"][1:]
                entry["steps"] = []  # 问句由确认框显示，拒绝时不执行后续出征对白
            talks[str(who)] = entry
        info["room"] = {"battle": "c0_s0_b5", "shop": shop, "talks": talks}


def main() -> None:
    dyn = load_scenarios()
    officers = officer_of()
    stages: dict[str, dict] = {}
    failed: list[str] = []
    for path in sorted((PACK / "dramas").glob("*.drama")):
        sections = section_lines(path)
        silent = sum(not lines for lines in sections.values())
        if silent:
            print(f"{path.name}：无对白节点 {silent} 节（跳过舞台对齐）")
        for sid, lines in sections.items():
            if not lines:
                continue
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
            best: tuple[int, object, list[int], list[dict]] | None = None
            for b in scene["blocks"]:
                if b["index"] != block:
                    continue
                choices = candidates(b, dlg, officers)
                if sid == "c4_s1_b7_before":
                    # pack 到黄忠告退为止；record 1 的 code[2] 起是调兵提示及出征换图。
                    before = next(r for r in b["records"] if r["index"] == 1)
                    choices = [Rec(b, {**before, "code": before["code"][:2]}, dlg, officers)]
                for rec in choices:
                    # orig 节名明确带 record 编号，不能用同 block 的相似对白替换。
                    explicit = re.match(r"^orig_c\d+_s\d+_b\d+_(\d+)(?:_|$)", sid)
                    required = {"c3_s4_b0_outro": 8, "c3_s4_b0_defeat": 6}.get(sid)
                    if required is None and explicit:
                        required = int(explicit.group(1))
                    if required is not None and rec.record != required:
                        continue
                    at = align(lines, rec)
                    if at is None:
                        continue
                    # 只按完整台词块匹配选记录；坐标不是 record 身份的依据。
                    cover = sum(len(chunk) for k, chunk in enumerate(rec.chunks) if not rec.optional[k])
                    ops = build_ops(rec, at, lines)
                    if best is None or cover > best[0]:
                        best = (cover, rec, at, ops)
            if best is None:
                failed.append(sid)
                continue
            _, rec, at, ops = best
            source_records = [r.record for r in rec.recs] if isinstance(rec, Merged) else [rec.record]
            stage: dict = {"map": rec.map, "lines": len(lines), "ops": ops,
                           "source": {"chapter": ch, "scene": sy, "block": block, "records": source_records}}
            if sid == "c4_s1_b7_before":
                stage["source"]["codeRange"] = [0, 2]  # 左闭右开，只覆盖 pack 已保留的前置片段。
            onStage = {o["who"] for o in ops if o["op"] == "place"}
            if rec.name and onStage:
                stage["names"] = {w: n for w, n in rec.name.items() if w in onStage}
            talks = block_talks(scene["blocks"][block], dlg) if block < len(scene["blocks"]) else {}
            # 只有真的站在场上、报得出名字的人才点得到，其余的对白删掉（否则数据里全是点不着的台词）
            talks = {w: ls for w, ls in talks.items() if int(w) in onStage}
            if talks:
                stage["talks"] = talks
            stages[sid] = stage
    add_original_opening(stages, dyn, officers)
    add_free_rooms(stages, dyn, officers)
    add_beihai_room(stages, dyn, officers)
    add_xuzhou_rooms(stages, dyn, officers)
    add_xuzhou_second_scene(stages, dyn, officers)
    add_xiaopei_return(stages, dyn, officers)
    add_lubu_arrival(stages, dyn, officers)
    add_envoy_rooms(stages, dyn, officers)
    add_xuzhou_return(stages, dyn, officers)
    towns = json.loads((EX / "maps/town.json").read_text(encoding="utf-8"))["maps"]
    campaign = json.loads((EX / "maps/campaign.json").read_text(encoding="utf-8"))["maps"]
    for sid, info in stages.items():
        chapter = (section_target(sid) or (0, 0, 0))[0]
        info["world"] = min(max(0, chapter - 1), len(campaign) - 1)
        maps = {}
        if sid in ("c1_s0_story1", "c1_s0_story2"):
            maps.update(stages["c1_s0_story0"].get("walk", {}))
        map_ops = info["ops"] + [s["op"] for s in info.get("timeline", []) if s["t"] == "action"]
        for op in map_ops:
            key = op.get("map", "")
            if key.startswith("palace/"):
                i = int(key.split("/")[1])
                m = next((m for m in towns if m["source"] == "PMAP.R3" and m["index"] == i), None)
                if m:
                    maps[key] = m["walk"]
        if maps:
            info["walk"] = maps
        if info.get("map") == "field" or any(o.get("map") == "field" for o in map_ops):
            info["routes"] = campaign[info["world"]]["routes"]
    OUT.write_text(json.dumps(stages, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    maps = sum(1 for s in stages.values() if s["map"] is not None)
    places = sum(1 for s in stages.values() for o in s["ops"] if o["op"] == "place")
    talks = sum(1 for s in stages.values() if s.get("talks"))
    print(f"场景 {len(stages)} 节（有地图 {maps} 节、摆人 {places} 次、能点人说话 {talks} 节），未对齐 {len(failed)} 节")
    if failed:
        print("  未对齐：", " ".join(failed[:10]), "…" if len(failed) > 10 else "")


if __name__ == "__main__":
    sys.exit(main())
