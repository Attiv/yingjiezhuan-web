#!/usr/bin/env python3
"""把原版《三国志英杰传》的道具包（hero-tools original pack 的输出）整理成网页版整部游戏的数据。

输入（都在 original/pack 下，由自己持有的原版盘生成）：
  campaign.toml            367 个流程节点：对话、营地、战斗、分支、结局
  dramas/*.drama           610 幕剧本（繁体中文原文，含选择、跳转、加入、单挑等）
  battles/*.toml           71 场战斗：地图、出征名单、敌军、胜利条件、战场事件、宝箱
  officers.toml            129 名武将的能力与兵种
  rules/items.toml         63 件道具
  original-pack.json       武将 → BAKDATA 记录 → FACEDAT 头像号

输出：
  src/data/game.json       剧本、战斗、武将、人物、头像索引（前端直接 import）
  src/data/items.json      pack 道具 id → 引擎道具号

只做格式转换与少量韩文残留清理（参考包的流程标题里混了韩文），
不改动任何一句原版台词、任何一个数值。
"""
from __future__ import annotations

import json
import re
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACK = ROOT / "original" / "pack"
OUT = ROOT / "src" / "data"

# ---------------------------------------------------------------- 名称清理 ----
# 参考包的流程标题、战斗名和少量选项里混入了韩文（模板文字，不是原版台词）。
KOREAN = [
    ("출진 준비", "出兵準備"),
    ("전투", "之戰"),
    ("유비전", "劉備傳"),
    ("게임 오버", "遊戲結束"),
    ("엔딩", "結局"),
    ("제4장 완료", "第四章 完"),
    ("제3장 완료", "第三章 完"),
    ("제2장 완료", "第二章 完"),
    ("제1장 완료", "第一章 完"),
    ("의", "的"),
    ("에게", ""),
    ("아니오", "否"),
    ("예", "是"),
    ("적장 화웅을 물리쳐라", "擊敗敵將華雄"),
]


def clean(s: str) -> str:
    for a, b in KOREAN:
        s = s.replace(a, b)
    s = re.sub(r"\s+\d+$", "", s)          # “瓦口關Ⅱ 之戰 2” 末尾的重复编号
    s = s.replace(" 之戰", "之戰")
    s = re.sub(r"[ \t]+", " ", s).strip()
    return s


# ---------------------------------------------------------------- 兵种 ----
# pack 的兵种 id → 引擎（原版 MAIN.EXE 顺序）的兵种号
CLASS = {
    "short_infantry": 0, "long_infantry": 1, "chariot": 2, "archer": 3, "crossbow": 4,
    "catapult": 5, "light_cavalry": 6, "heavy_cavalry": 7, "guard_cavalry": 8,
    "bandit": 9, "brigand": 10, "outlaw": 11, "band": 12, "beast": 13, "martial": 14,
    "sorcerer": 15, "tribe": 16, "civilian": 17, "supply": 18,
}

# pack 的 AI 名 → 引擎指令（0 向目标移动、1 攻击最近、2 原地、3 待机、4 只移动）
AI = {"advance": 0, "aggressive": 1, "defensive": 2, "hold": 2, "march": 0, "target": 1}

# pack 道具 id → 引擎道具号（按原版道具表的名字对齐）
ITEM = {
    "occult_book": 0, "medic_book": 1, "drum_kit": 2, "sunzi": 3, "mengde_book": 4,
    "yellow_flash": 5, "dilu": 6, "red_hare": 7, "imperial_seal": 8, "heaven_sword": 9,
    "blue_steel_sword": 10, "seven_star_sword": 11, "green_dragon_blade": 12,
    "three_point_blade": 13, "sky_piercer": 14, "serpent_spear": 15, "archery_guide": 16,
    "riding_guide": 17, "sword_guide": 18, "long_spear": 19, "war_cart": 20, "repeater": 21,
    "stone_thrower": 22, "horse_armor": 23, "guard_armor": 24, "martial_manual": 25,
    "chivalry_manual": 26, "wine": 27, "fine_wine": 28, "baijiu": 29, "bean": 30,
    "wheat": 31, "rice": 32, "bomb": 33, "scroll_rockfall": 34, "scroll_landslide": 35,
    "scroll_mudflow": 36, "scroll_whirlpool": 37, "scroll_torrent": 38, "scroll_tsunami": 39,
    "scroll_scorch": 40, "scroll_fire_dragon": 41, "scroll_hellfire": 42, "scroll_fog": 43,
    "scroll_mirage": 44, "scroll_downpour": 45, "scroll_great_aid": 46,
    "scroll_great_resupply": 47, "scroll_great_relief": 48, "scroll_great_encourage": 49,
    "scroll_great_cheer": 50, "scroll_great_inspire": 51, "salve": 52, "herbal_medicine": 53,
    "tea": 54, "imperial_edict": 55, "relief_report": 56, "twin_swords": 57,
    "hero_sword": 58, "conqueror_sword": 59, "liu_tao": 60, "san_lue": 61, "wuzi": 62,
}


# ---------------------------------------------------------------- BAKDATA ----
def bakdata() -> dict[int, dict]:
    """384 条人物记录：名字、头像号、统御/武力/智力、兵种、等级、道具。

    记录布局见 tools/extract.py：名字 Big5 6 字节，偏移 14 是 FACEDAT 头像号，
    16 是兵种小图，17/18/19 是统御/武力/智力；0x3080 起每 18 字节是初始状态。
    """
    src = Path("/Users/mac/Downloads/三国英杰传/BAKDATA.R3")
    if not src.exists():
        src = ROOT / "original" / "三国英杰传" / "BAKDATA.R3"
    if not src.exists():
        sys.exit("找不到 BAKDATA.R3：请在 tools/build_campaign.py 顶部改成你机器的原版路径")
    bak = src.read_bytes()
    out: dict[int, dict] = {}
    for i in range(384):
        r = bak[0x1100 + i * 21:0x1100 + (i + 1) * 21]
        init = bak[0x3080 + i * 18:0x3080 + (i + 1) * 18]
        try:
            name = r[:6].split(b"\0")[0].decode("big5").strip()
        except UnicodeDecodeError:
            name = f"人物{i}"
        if not name:
            continue
        out[i] = {
            "id": f"person_{i}",
            "name": name,
            "face": f"faces/{r[14] | (r[15] << 8):03d}",
            "portrait": r[14] | (r[15] << 8),
            "cls": init[7] if init[7] < 19 else 0,
            "level": max(1, init[8]),
            "lead": r[17], "str": r[18], "int": r[19],
            "items": [x for x in init[10:18] if x != 255],
        }
    return out


# ---------------------------------------------------------------- 剧本 ----
SPEAKER = re.compile(r"^([A-Za-z0-9_]+|[\u4e00-\u9fff]{1,8}):\s*(.*)$")
CHOICE = re.compile(r"^-\s*(.+?)\s*->\s*([A-Za-z0-9_]+)\s*$")


def parse_drama() -> dict[str, list[dict]]:
    scenes: dict[str, list[dict]] = {}
    for path in sorted((PACK / "dramas").glob("*.drama")):
        cur: list[dict] | None = None
        duel: dict | None = None
        lines = path.read_text(encoding="utf-8").splitlines()
        i = 0
        while i < len(lines):
            raw = lines[i]
            line = raw.rstrip()
            i += 1
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            if line.startswith("== "):
                sid = line[3:].strip()
                cur = scenes.setdefault(sid, [])
                duel = None
                continue
            if cur is None:
                continue
            s = line.strip()
            if s == "@choice":
                options = []
                while i < len(lines):
                    m = CHOICE.match(lines[i].strip())
                    if not m:
                        break
                    options.append({"label": clean(m.group(1)), "goto": m.group(2)})
                    i += 1
                cur.append({"t": "choice", "text": "", "options": options})
                continue
            if s.startswith("@narr"):
                text = s[5:].strip()
                extra = []
                while i < len(lines):
                    nxt = lines[i]
                    if nxt.startswith("    ") and nxt.strip() and not nxt.strip().startswith(("@", "-")):
                        extra.append(nxt.strip())
                        i += 1
                    else:
                        break
                cur.append({"t": "text", "text": "\n".join([text] + extra)})
                continue
            if s.startswith("@title "):
                cur.append({"t": "title", "text": clean(s[7:].strip())})
                continue
            if s.startswith("@picture "):
                key = s[9:].strip()
                cur.append({"t": "picture", "key": "" if key == "none" else key})
                continue
            if s.startswith("@bgm "):
                cur.append({"t": "bgm", "key": s[5:].strip()})
                continue
            if s == "@hide all" or s.startswith("@hide"):
                cur.append({"t": "hide"})
                continue
            if s.startswith("@wait"):
                continue
            if s.startswith("@set "):
                m = re.match(r"@set\s+(\S+)\s*=\s*(-?\d+)", s)
                if m:
                    cur.append({"t": "set", "flag": m.group(1), "value": int(m.group(2))})
                continue
            if s.startswith("@if "):
                m = re.match(r"@if\s+(\S+)\s*(==|!=)\s*(-?\d+)\s*->\s*(\S+)", s)
                if m:
                    cur.append({"t": "if", "flag": m.group(1), "is": int(m.group(3)),
                                "cmp": "eq" if m.group(2) == "==" else "ne", "goto": m.group(4)})
                continue
            if s.startswith("@goto "):
                cur.append({"t": "goto", "label": s[6:].strip()})
                continue
            if s.startswith("@label "):
                cur.append({"t": "label", "name": s[7:].strip()})
                continue
            if s.startswith("@join "):
                cur.append({"t": "join", "id": s[6:].strip()})
                continue
            if s.startswith("@away "):
                cur.append({"t": "away", "id": s[6:].strip()})
                continue
            if s.startswith("@level "):
                parts = s.split()
                cur.append({"t": "level", "id": parts[1], "n": int(parts[2]) if len(parts) > 2 else 1})
                continue
            if s.startswith("@gold "):
                cur.append({"t": "gold", "n": int(s.split()[1])})
                continue
            if s.startswith("@item "):
                cur.append({"t": "item", "id": s.split()[1]})
                continue
            if s.startswith("@class "):
                parts = s.split()
                cur.append({"t": "class", "id": parts[1], "cls": CLASS.get(parts[2], 0)})
                continue
            if s.startswith("@duel "):
                parts = s.split()
                duel = {"t": "duel", "a": parts[1], "b": parts[2], "acts": []}
                cur.append(duel)
                continue
            if s.startswith("@duel_act "):
                parts = s.split()
                if duel is not None:
                    act = {"side": parts[1], "act": parts[2]}
                    if len(parts) > 3:
                        act["n"] = int(parts[3])
                    duel["acts"].append(act)
                continue
            if s == "@duel_end":
                duel = None
                continue
            if s == "@end":
                cur.append({"t": "end"})
                continue
            m = SPEAKER.match(s)
            if m:
                who, text = m.group(1), m.group(2).strip()
                cur.append({"t": "say", "who": who, "text": clean(text)})
                continue
            # 缩进对白续行仍属于同一个 say，保持原文换行及舞台台词计数。
            if cur and (cur[-1]["t"] == "text" or (cur[-1]["t"] == "say" and line[:1].isspace())):
                cur[-1]["text"] += "\n" + clean(s)
    return scenes


# ---------------------------------------------------------------- 战斗 ----
def convert_units(battle: dict, officers: dict, persons: dict) -> tuple[list[dict], dict[str, list[dict]]]:
    units, groups = [], {}
    for i, u in enumerate(battle.get("units", [])):
        side = u["side"]
        officer = u.get("officer")
        person = None
        key = officer
        if officer and officer in officers:
            o = officers[officer]
            name = o["name"]
            cls = o["cls"]
            level = o["level"]
            lead, str_, int_ = o["lead"], o["str"], o["int"]
            face = o["face"]
        elif officer and officer.startswith(("person_", "orig_p")):
            pid = int(officer.split("_")[-1])
            person = persons.get(pid)
            name = person["name"] if person else officer
            cls = person["cls"] if person else 0
            level = person["level"] if person else 1
            lead, str_, int_ = (person or {}).get("lead", 50), (person or {}).get("str", 50), (person or {}).get("int", 50)
            face = person["face"] if person else "portraits/_unknown"
            key = f"person_{pid}"
        else:
            name = clean(u.get("name", "部隊"))
            cls = CLASS.get(u.get("class", "short_infantry"), 0)
            level = u.get("level", 1)
            stats = u.get("stats") or [50, 50, 50]
            str_, int_, lead = stats[0], stats[1], stats[2]
            face = f"cls{cls}"
            key = u.get("tag") or name
        # 战斗里显式写的兵种/等级覆盖武将默认值
        if u.get("class"):
            cls = CLASS.get(u["class"], cls)
        if u.get("level"):
            level = u["level"]
        mode = AI.get(u.get("ai", "defensive"), 2)
        goal = u.get("ai_pos")
        target = u.get("ai_target")
        item = {
            "side": side, "key": key, "name": name, "face": face,
            "cls": cls, "level": level, "lead": lead, "str": str_, "int": int_,
            "x": u["pos"][0], "y": u["pos"][1], "mode": mode,
            "goal": goal, "target": target, "commander": bool(u.get("commander")),
            "fixed": side == "player", "items": [],
        }
        if u.get("group"):
            groups.setdefault(u["group"], []).append(item)
        else:
            units.append(item)
    return units, groups


def convert_events(events: list[dict]) -> list[dict]:
    out = []
    for e in events:
        t = e.get("trigger", {})
        trig = {"type": t.get("type")}
        for k in ("turn", "side", "a", "b", "who", "pos", "radius", "target"):
            if k in t:
                trig[k] = t[k]
        acts = []
        for a in e.get("actions", []):
            typ = a.get("type")
            if typ == "drama":
                acts.append({"op": "drama", "scene": a["scene"]})
            elif typ == "level_up":
                acts.append({"op": "level", "target": a["target"], "n": a.get("amount", 1)})
            elif typ == "retreat":
                acts.append({"op": "retreat", "target": a["target"]})
            elif typ == "set_flag":
                acts.append({"op": "flag", "flag": a["flag"], "value": a.get("value", 1)})
            elif typ == "set_ai":
                acts.append({"op": "ai", "target": a["target"], "mode": AI.get(a.get("ai"), 2),
                             "goal": a.get("ai_pos"), "prefer": a.get("ai_target")})
            elif typ == "spawn":
                acts.append({"op": "spawn", "group": a["group"]})
            elif typ == "set_terrain":
                acts.append({"op": "terrain", "x": a["pos"][0], "y": a["pos"][1],
                             "terrain": a.get("terrain", "plain")})
            elif typ == "set_stage":
                acts.append({"op": "stage", "stage": a["stage"]})
            elif typ == "set_objective":
                acts.append({"op": "objective", "text": clean(a["text"])})
            elif typ == "give_item":
                acts.append({"op": "item", "item": a["item"]})
            elif typ == "give_gold":
                acts.append({"op": "gold", "n": a["amount"]})
            elif typ == "halve":
                acts.append({"op": "halve", "side": a.get("side", "player"), "stat": a.get("stat", "hp")})
            elif typ == "victory":
                acts.append({"op": "victory"})
            elif typ == "defeat":
                acts.append({"op": "defeat"})
            elif typ == "when":
                acts.append({"op": "when", "when": a.get("when", []), "actions": convert_events([{"actions": a.get("actions", [])}])[0]["actions"]})
            else:
                acts.append({"op": "unknown", "type": typ})
        out.append({"stage": e.get("stage", 0), "once": e.get("once", True), "trigger": trig, "actions": acts})
    return out


def convert_battle(bid: str, b: dict, officers: dict, persons: dict) -> dict:
    units, groups = convert_units(b, officers, persons)
    map_id = b["map"]["use"]
    victory = []
    for v in b.get("victory", []):
        typ = v["type"]
        if typ == "defeat_commander":
            victory.append({"kind": "commander"})
        elif typ == "defeat_all":
            victory.append({"kind": "all"})
        elif typ == "reach":
            victory.append({"kind": "reach", "who": v.get("who"), "x": v["pos"][0],
                            "y": v["pos"][1], "radius": v.get("radius", 0)})
        elif typ == "defeat_unit":
            victory.append({"kind": "unit", "target": v["target"]})
    defeat = []
    for d in b.get("defeat", []):
        if d.get("type") == "unit_retreated":
            defeat.append({"kind": "unit", "target": d["target"]})
    treasures = [{"x": t["pos"][0], "y": t["pos"][1],
                  "item": ITEM.get(t.get("item", ""), None), "gold": t.get("gold", 0)}
                 for t in b.get("treasures", [])]
    deploy = b.get("deploy", {})
    out = {
        "id": bid,
        "name": clean(b.get("name", bid)),
        "goal": clean(b.get("objective", "")),
        "turnLimit": b.get("turn_limit", 30),
        "map": map_id,
        "reward": b.get("reward_gold", 0),
        "deploy": {
            "max": min(deploy.get("max", 12), len(deploy.get("slots", []))),
            "required": deploy.get("required", []),
            "forbidden": deploy.get("forbidden", []),
            "slots": deploy.get("slots", []),
        },
        "units": units,
        "groups": groups,
        "victory": victory,
        "defeat": defeat,
        "events": convert_events(b.get("events", [])),
        "treasures": treasures,
        "outro": b.get("outro", ""),
        "intro": b.get("intro", ""),
        "bgm": b.get("bgm", "battle"),
        "bgmEnemy": b.get("bgm_enemy", "enemy"),
    }
    return out


# ---------------------------------------------------------------- 流程 ----
_OCC: dict[str, int] = {}


def scene_steps(scenes: dict[str, list[dict]], sid: str) -> list[dict]:
    """把一幕摊平成前端的故事步骤。

    原版每一幕的标签（won_1、skip_1…）只在幕内有效，整部剧本拼成一条线之后会重名，
    所以这里给标签和目标都加上「幕名~第几次出现:」前缀；幕内的 @end 表示「本幕到此为止」，
    改成跳到幕末的空标签，后面的流程节点照常接上。
    """
    if sid not in scenes:
        return []
    n = _OCC.get(sid, 0)
    _OCC[sid] = n + 1
    pre = lambda name: f"{sid}~{n}:{name}"
    out = [{"t": "stage", "id": sid}]  # 这一幕的场景（地图与场上人物，见 stages.json）
    for st in scenes[sid]:
        st = dict(st)
        t = st["t"]
        if t == "label":
            st["name"] = pre(st["name"])
        elif t == "goto":
            st["label"] = pre(st["label"])
        elif t == "if":
            st["goto"] = pre(st["goto"])
        elif t == "choice" or (t == "room" and st.get("options")):
            st["options"] = [dict(o, goto=pre(o["goto"])) if o.get("goto") else o for o in st["options"]]
        elif t == "end":
            # 幕内的 @end = 本幕到此为止：跳到幕末的 #end 空标签，后面的流程节点照常接上
            st = {"t": "goto", "label": pre("#end")}
            t = "goto"
        if t in ("bgm", "picture", "hide", "title", "text", "say", "choice", "set", "if",
                 "goto", "label", "join", "away", "level", "gold", "item", "class",
                 "duel", "action", "wait", "room"):
            out.append(st)
    if any(s["t"] == "end" for s in scenes[sid]):
        out.append({"t": "label", "name": pre("#end")})
    return out


def convert_campaign(scenes: dict[str, list[dict]], battles: dict[str, dict]) -> tuple[list[dict], str]:
    data = tomllib.loads((PACK / "campaign.toml").read_text(encoding="utf-8"))
    nodes = data["node"]
    steps: list[dict] = []

    for n in nodes:
        typ = n["type"]
        steps.append({"t": "label", "name": n["id"]})
        if typ == "drama":
            steps += scene_steps(scenes, n["scene"])
            if n.get("next"):
                steps.append({"t": "goto", "label": n["next"]})
            else:
                steps.append({"t": "end"})
        elif typ == "camp":
            if n["id"] != "c0_s0_b5_camp":
                steps.append({"t": "camp", "battle": n["battle"], "title": clean(n.get("title", "")),
                              "shop": [ITEM[x] for x in n.get("shop", []) if x in ITEM]})
            steps.append({"t": "goto", "label": n["next"]})
        elif typ == "battle":
            b = battles.get(n["battle"])
            if b and b.get("intro"):
                steps += scene_steps(scenes, b["intro"])
            steps.append({"t": "battle", "level": n["battle"]})
            if b and b.get("outro") and b["outro"] in scenes:
                steps += scene_steps(scenes, b["outro"])
            if n.get("next"):
                steps.append({"t": "goto", "label": n["next"]})
            else:
                steps.append({"t": "end"})
        elif typ == "branch":
            cmp = "eq" if n.get("cmp") == "Eq" else "ne"
            steps.append({"t": "if", "flag": n["flag"], "is": n.get("value", 1),
                          "cmp": cmp, "goto": n["then"]})
            steps.append({"t": "goto", "label": n["else"]})
        elif typ == "ending":
            steps.append({"t": "ending", "text": clean(n.get("title", "完"))})
        else:
            steps.append({"t": "goto", "label": n.get("next")} if n.get("next") else {"t": "end"})
    return steps, data.get("start", "")


def load_maps() -> dict[str, dict]:
    """58 张战场图的地形表：每 2×2 个 16px 图块算一格，32px 网格。"""
    out = {}
    for f in sorted((ROOT / "original/extract/maps/battle").glob("*.json")):
        d = json.loads(f.read_text(encoding="utf-8"))
        w, h = d["size_cells"]
        rows = d["terrain"]
        assert len(rows) == h and all(len(r) == w for r in rows), f"{f.name} 地形尺寸不对"
        out[f"hexz_{d['index']:02d}"] = {
            "w": w, "h": h, "name": clean(d.get("name", "")), "terrain": [c for r in rows for c in r],
        }
    return out


# ---------------------------------------------------------------- 策略 ----
# tables.json 里 strategyNames 的顺序就是 DOS 的策略编号 0–35。这里按同一顺序列出
# pack 的 strategy id 与繁体显示名（原版中文版的实际写法，和 pack 的韩文汉名略有出入，
# 例如「業火」在原版中文里叫「猛火」、「應援」叫「支援」）。
STRATEGY_KEYS = [
    "scorch", "fire_dragon", "hellfire", "great_scorch", "great_fire_dragon",
    "whirlpool", "torrent", "tsunami", "great_whirlpool", "great_torrent",
    "rockfall", "landslide", "mudflow", "great_rockfall", "great_landslide",
    "false_report", "false_troops", "disguise",
    "harass", "provoke", "intimidate",
    "encourage", "cheer", "inspire",
    "aid", "resupply", "relief", "nurse", "cure", "revive",
    "great_encourage", "great_cheer", "great_inspire", "great_aid", "great_resupply", "great_relief",
]
STRATEGY_NAMES = [
    "焦熱", "火龍", "猛火", "大焦熱", "大火龍",
    "漩渦", "濁流", "海嘯", "大漩渦", "大濁流",
    "落石", "山崩", "山洪", "大落石", "大山崩",
    "假情報", "偽兵", "偽裝",
    "牽制", "挑撥", "欺壓",
    "激勵", "支援", "鼓舞",
    "援助", "補給", "救濟", "看護", "治癒", "救命",
    "大激勵", "大支援", "大鼓舞", "大援助", "大補給", "大救濟",
]
BLAST_ID = 36  # 爆彈專用策略：不在学习表里，只有道具能用


def strategy_specs() -> dict:
    """策略表：把 pack 的 strategies.toml 转成 DOS 编号下的规格。

    威力 / 士气 / 混乱效果照抄原版；射程用 tables.json 的 strategyCategory
    （原版程序里的范围码，群体策略是 3，比单体最远的 2 还大一圈）。
    """
    src = tomllib.loads((PACK / "rules" / "strategies.toml").read_text(encoding="utf-8"))["strategy"]
    by_key = {s["id"]: s for s in src}
    cats = json.loads((OUT / "tables.json").read_text(encoding="utf-8"))["strategyCategory"]

    def convert(s: dict, rng: int) -> dict:
        effects = []
        for e in s.get("effects") or []:
            eff = {"type": e["type"]}
            for k in ("power", "amount", "status", "turns"):
                if k in e:
                    eff[k] = e[k]
            effects.append(eff)
        return {
            "key": s["id"],
            "name": s.get("hanja") or s.get("name", s["id"]),
            "kind": s.get("kind", "attack"),
            "mp": s.get("mp", 0),
            "range": rng,
            "area": s.get("area", "single"),
            "target": s.get("target", "enemy"),
            "effects": effects,
        }

    out: dict[str, dict] = {}
    for i, key in enumerate(STRATEGY_KEYS):
        out[str(i)] = convert(by_key[key], cats[i])
        out[str(i)]["name"] = STRATEGY_NAMES[i]
    out[str(BLAST_ID)] = convert(by_key["blast"], 1)
    out[str(BLAST_ID)]["name"] = "爆發"
    return {"strategies": out, "byKey": {k: i for i, k in enumerate(STRATEGY_KEYS)} | {"blast": BLAST_ID}}


STRATEGY_ID = {key: i for i, key in enumerate(STRATEGY_KEYS)} | {"blast": BLAST_ID}


# ---------------------------------------------------------------- 道具 ----
# 原版包里不标价的道具（武器、铠甲、马、宝物、转职书）价格被填成 3820，这里当作「不出售」。
NO_PRICE = 3000


def item_specs() -> dict:
    """道具表与兵种转职表：把 pack 的 items.toml / classes.toml 转成引擎编号下的数值。

    原版的 atk_pct / def_pct 是百分比整数（120 = 攻击力 ×1.20），这里换成增量（+20），
    和 tables.json 里 weapons 的 value 一致；价格、回复量、转职条件都照抄，不做改动。
    """
    items = tomllib.loads((PACK / "rules" / "items.toml").read_text(encoding="utf-8"))["item"]
    classes = tomllib.loads((PACK / "rules" / "classes.toml").read_text(encoding="utf-8"))["class"]
    out: dict[str, dict] = {}
    for it in items:
        num = ITEM.get(it["id"])
        if num is None:
            continue
        effects = it.get("effects") or []
        heal = max([e.get("power", 0) for e in effects if e.get("type") == "heal"] or [0])
        morale = max([e.get("amount", 0) for e in effects if e.get("type") == "morale"] or [0])
        promote = any(e.get("type") == "promote" for e in effects)
        to = next((CLASS.get(e.get("to")) for e in effects if e.get("type") == "change_class"), None)
        price = it.get("price", NO_PRICE)
        out[str(num)] = {
            "key": it["id"],
            "name": it.get("hanja") or clean(it.get("name", "")),
            "kind": it.get("kind", "consumable"),
            # 武器是攻击力百分比、铠甲（兵书）是防御力百分比、马是移动力格数
            "atk": (it.get("atk_pct") or 100) - 100,
            "def": (it.get("def_pct") or 100) - 100,
            "move": it.get("move_bonus", 0),
            # 保留参考 pack 的字段；非零标记被动恢复，10 不代表回复点数或百分比。
            # 原版程序以道具 8/55/56 启用地形恢复位，实际公式见 combat.upkeep。
            "regenHp": it.get("regen_hp", 0),
            "regenMorale": it.get("regen_morale", 0),
            "price": None if price >= NO_PRICE else price,
            "battle": bool(it.get("battle_use")),
            "heal": heal,
            "morale": morale,
            "promote": promote,
            "to": to,
            "strategy": it.get("strategy"),
            "strategyId": STRATEGY_ID.get(it.get("strategy") or ""),
        }
    promote: dict[str, dict] = {}
    for c in classes:
        p = c.get("promote") or {}
        if p:
            promote[str(CLASS[c["id"]])] = {
                "to": CLASS[p["to"]], "level": p.get("level", 1), "item": ITEM.get(p.get("item")),
            }
    return {"items": out, "promote": promote}


# ---------------------------------------------------------------- 行军图 ----
# 原版 MMAP.R3 的四张行军图，MAIN.EXE 里另有一张「每章用多大一块」的表
# （original/extract/maps/campaign.json 的 sizes_by_chapter）。序章与第一章
# 尺寸相同，用的也是同一张图，所以 5 章只对应 4 张图。
CHAPTER_NAMES = ["序章", "第一章", "第二章", "第三章", "第四章"]


def campaign_specs() -> dict:
    src = ROOT / "original" / "extract" / "maps" / "campaign.json"
    if not src.exists():
        return {"chapters": [], "maps": []}
    d = json.loads(src.read_text(encoding="utf-8"))
    maps = [
        {
            "index": m["index"],
            "image": f"maps/campaign/{m['index']:03d}.png",
            "tiles": m["size_tiles"],
        }
        for m in d["maps"]
    ]
    # 尺寸相同的章节共用一张图：按「这张图第几次出现」定位
    first_seen: dict[tuple[int, int], int] = {}
    chapters = []
    for i, size in enumerate(d.get("sizes_by_chapter") or []):
        key = (size[0], size[1])
        if key not in first_seen:
            same = [m["index"] for m in maps if tuple(m["tiles"]) == key]
            if not same:
                continue
            first_seen[key] = same[0]
        chapters.append({
            "key": f"c{i}",
            "name": CHAPTER_NAMES[i] if i < len(CHAPTER_NAMES) else f"第{i}章",
            "map": first_seen[key],
        })
    return {"chapters": chapters, "maps": maps}


# ---------------------------------------------------------------- 主流程 ----
def main() -> None:
    officers_toml = tomllib.loads((PACK / "officers.toml").read_text(encoding="utf-8"))["officer"]
    pack_json = json.loads((PACK / "original-pack.json").read_text(encoding="utf-8"))
    face_of = {p["officer"]: p["portrait"] for p in pack_json.get("portraits", [])}

    persons = bakdata()
    pack_officer = {o["officer"]: o for o in pack_json.get("officers", [])}
    officers: dict[str, dict] = {}
    for o in officers_toml:
        oid = o["id"]
        portrait = face_of.get(oid)
        # 新增的原版人物没有独立的 portraits 记录，但 pack 仍保留了其 BAKDATA 编号。
        # 按该编号回查原始 FACEDAT；不能把缺失映射误当成头像 000（刘备）。
        if portrait is None:
            raw_id = pack_officer.get(oid, {}).get("bakdata")
            portrait = persons.get(raw_id, {}).get("portrait") if raw_id is not None else None
        officers[oid] = {
            "id": oid,
            "name": o.get("hanja") or clean(o.get("name", oid)),
            "cls": CLASS.get(o.get("class", "short_infantry"), 0),
            "level": o.get("level", 1),
            "lead": o.get("lead", 50), "str": o.get("str", 50), "int": o.get("int", 50),
            "face": f"faces/{portrait:03d}" if portrait is not None else "portraits/_unknown",
            "portrait": portrait,
        }

    scenes = parse_drama()
    # 序章直接消费原始record编译的时间线；先生成舞台数据，避免依赖陈旧JSON。
    from build_stages import main as build_stages
    build_stages()
    stages = json.loads((OUT / "stages.json").read_text(encoding="utf-8"))
    for sid, info in stages.items():
        if "timeline" in info:
            scenes[sid] = info["timeline"] + ([{"t": "room", "id": sid}] if info.get("room") else [])
        if info.get("ordered"):
            # 保留pack里的奖励、入队与分支，只将已核对的动作交错写入时间线。
            # 暂停插在上一句之后，下一段动作等玩家继续才开始。
            out, line, op_index = [], 0, 0
            ops = info["ops"]
            rooms = info.get("rooms", {})
            inserted = set()
            for step in scenes[sid]:
                if step["t"] in ("say", "text"):
                    while op_index < len(ops) and ops[op_index]["at"] <= line:
                        out.append({"t": "action", "op": ops[op_index]})
                        op_index += 1
                    line += 1
                # 原版出发问句由房间的确认框承担，取消时留在原处。
                prompts = [room["next"].get("prompt") for room in rooms.values()]
                if not any(p and step == {"t": "say", **p} for p in prompts):
                    out.append(step)
                for room_id, room in rooms.items():
                    if step == {"t": "say", **room["after"]}:
                        if room_id in inserted:
                            raise ValueError(f"自由交谈停顿点 {room_id} 不唯一")
                        inserted.add(room_id)
                        out.append({"t": "room", "id": room_id})
            if inserted != set(rooms):
                raise ValueError(f"自由交谈停顿点 {sid} 缺少对应主线对白")
            out.extend({"t": "action", "op": op} for op in ops[op_index:])
            scenes[sid] = out
    # 出征问答和出兵准备现在在room内完成，保留旧节点标签作为稳定流程锚点。
    scenes["c0_s0_b5_before"] = []
    battle_files = sorted((PACK / "battles").glob("*.toml"))
    battles: dict[str, dict] = {}
    for f in battle_files:
        b = tomllib.loads(f.read_text(encoding="utf-8"))
        if b["id"] == "p1_sishui":       # 参考包的序章演示战，不在正篇流程里
            continue
        battles[b["id"]] = convert_battle(b["id"], b, officers, persons)

    # 原始首战setup的条件参战字段，不能把两名友军无条件加入。
    source = json.loads((ROOT / "original/extract/text/snr0.json").read_text(encoding="utf-8"))
    setup = next(c for r in source["scenes"][0]["blocks"][4]["records"] for c in r["code"] if c["mnemonic"] == "battle_setup")
    officer_ids = {o["bakdata"]: o["officer"] for o in pack_json.get("officers", [])}
    required = {officer_ids[u["person"]]: f"orig_f{u['requires_flag']}" for u in setup["units"] if "requires_flag" in u}
    for u in battles["c0_s0_b5"]["units"]:
        if u["key"] in required:
            u["requiresFlag"] = required[u["key"]]
    maps = load_maps()
    steps, start = convert_campaign(scenes, battles)

    # 剧本里出现的说话人：能查到名字的就记下，查不到的原样显示
    # 剧本里的说话人：id → 显示名；中文名（董卓、獻帝…）按名字反查人物头像
    by_name = {}
    for p in persons.values():
        by_name.setdefault(p["name"], p["face"])
    for o in officers.values():
        if o.get("face"):
            by_name.setdefault(o["name"], o["face"])
    speakers, faces = {}, {}
    spoken_scenes = list(scenes.values())
    for info in stages.values():
        spoken_scenes.extend(entry["steps"] for entry in info.get("room", {}).get("talks", {}).values())
        for room in info.get("rooms", {}).values():
            spoken_scenes.extend(room["talks"].values())
    for sc in spoken_scenes:
        for st in sc:
            if st["t"] != "say":
                continue
            w = st["who"]
            if w in officers:
                speakers[w] = officers[w]["name"]
                faces[w] = officers[w]["face"]
            elif w.startswith(("person_", "orig_p")):
                pid = int(w.split("_")[-1])
                speakers[w] = persons.get(pid, {}).get("name", w)
                faces[w] = persons.get(pid, {}).get("face", "portraits/_unknown")
            else:
                speakers[w] = w
                if w in by_name:
                    faces[w] = by_name[w]

    # 战场事件里的插话（drama 动作）不并进主流程，单独存一份，战斗里按 id 播放
    all_scenes = {sid: scene_steps(scenes, sid) for sid in scenes}

    game = {
        "title": "三國志英傑傳",
        "start": start,
        "steps": steps,
        "scenes": all_scenes,
        "battles": battles,
        "maps": maps,
        "officers": officers,
        "persons": {str(k): v for k, v in persons.items()},
        "speakers": speakers,
        "faces": faces,
        "items": ITEM,
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "game.json").write_text(json.dumps(game, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    specs = item_specs()
    (OUT / "items.json").write_text(json.dumps(specs, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    sold = sum(1 for s in specs["items"].values() if s["price"] is not None)
    print(f"道具 {len(specs['items'])} 件（商店有价的 {sold} 件）、兵种转职 {len(specs['promote'])} 条")

    strats = strategy_specs()
    (OUT / "strategies.json").write_text(json.dumps(strats, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"策略 {len(strats['strategies'])} 条（可学 36、爆彈 1）")

    camp = campaign_specs()
    (OUT / "campaign.json").write_text(json.dumps(camp, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"行军图 {len(camp['maps'])} 张、{len(camp['chapters'])} 章（" +
          "、".join(f"{c['name']}→{c['map']}" for c in camp["chapters"]) + "）")

    print(f"流程步骤 {len(steps)}（标签 {sum(1 for s in steps if s['t'] == 'label')}）")
    print(f"剧本 {len(scenes)} 幕、战斗 {len(battles)} 场、地图 {len(maps)} 张、武将 {len(officers)}、人物 {len(persons)}")
    print(f"输出 {(OUT / 'game.json').stat().st_size / 1024:.0f} KB → src/data/game.json")
    # 校验：所有 goto/if/battle 目标都存在
    labels = {s["name"] for s in steps if s["t"] == "label"}
    missing = {s.get("label") or s.get("goto") for s in steps
               if s["t"] in ("goto", "if") and (s.get("label") or s.get("goto")) not in labels}
    bad_battles = {s["level"] for s in steps if s["t"] == "battle" and s["level"] not in battles}
    print(f"缺失标签 {len(missing)}、缺失关卡 {len(bad_battles)}")
    if missing:
        print("  ", list(missing)[:10])
    if bad_battles:
        print("  ", list(bad_battles)[:10])
    bad_maps = {b["map"] for b in battles.values() if b["map"] not in maps}
    print(f"缺失地图 {len(bad_maps)}")
    if bad_maps:
        print("  ", list(bad_maps)[:10])


if __name__ == "__main__":
    main()
