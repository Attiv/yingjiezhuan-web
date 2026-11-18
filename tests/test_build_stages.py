"""剧情记录与原版操作码的回归验证。"""
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("build_stages", ROOT / "tools/build_stages.py")
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)


class StageGenerationTests(unittest.TestCase):
    def test_complete_dialogue_chunk_must_match(self):
        rec = type("Record", (), {"chunks": [["第一句", "第二句"]], "optional": [False]})()
        self.assertIsNone(build.align(["第一句", "错误的下一句"], rec))
        self.assertEqual(build.align(["第一句", "第二句"], rec), [0])

    def test_first_chapter_rooms_keep_original_record_groups(self):
        stages = json.loads((ROOT / "src/data/stages.json").read_text())
        scene = build.load_scenarios()[1]["scenes"][0]
        for sid in ["c1_s0_story0", "c1_s0_story1", "c1_s0_story2", "c1_s0_story5", "c1_s0_story8"]:
            info = stages[sid]
            for room in info["rooms"].values():
                source = room["source"]
                block = next(b for b in scene["blocks"] if b["index"] == source["block"])
                expected = {}
                for rec in block["records"]:
                    t = rec["trigger"]
                    if t["kind_name"] == "talk" and t["group"] == source["group"] and all(c["mnemonic"] in ("dialogue", "end") for c in rec["code"]):
                        who = str(t["args"][0] | t["args"][1] << 8)
                        expected[who] = build.original_timeline(scene, [rec], build.officer_of())
                self.assertEqual(room["talks"], expected, sid)
        self.assertEqual(stages["c1_s0_story0"]["source"]["records"], [0, 1, 4])
        self.assertEqual(stages["c1_s0_story5"]["rooms"]["c1_s0_story5:b5g4"]["shop"]["items"], [27, 30, 52])

    def test_beihai_room_keeps_original_pause_and_departure_order(self):
        stages = json.loads((ROOT / "src/data/stages.json").read_text())
        info = stages["c1_s1_story4"]
        timeline = info["timeline"]
        room_id = "c1_s1_story4:b4g1"
        pause = timeline.index({"t": "room", "id": room_id})
        scene = build.load_scenarios()[1]["scenes"][1]
        block = next(b for b in scene["blocks"] if b["index"] == 4)
        records = {r["index"]: r for r in block["records"]}
        officers = build.officer_of()
        self.assertEqual(timeline[1:pause], build.original_timeline(scene, [records[0]], officers))
        self.assertEqual(timeline[pause + 1:], build.original_timeline(scene, [records[4]], officers))
        room = info["rooms"][room_id]
        self.assertEqual(room["source"], {"block": 4, "group": 1})
        self.assertEqual(room["talks"], {"7": build.original_timeline(scene, [records[1]], officers),
                                         "149": build.original_timeline(scene, [records[2]], officers)})
        self.assertEqual(room["next"]["prompt"], {"who": "guan_yu", "text": "準備好了嗎？"})
        self.assertEqual([s for s in timeline if s["t"] == "gold"], [{"t": "gold", "n": 500}])
        self.assertFalse(any(s["t"] == "level" for s in timeline[:pause]))
        self.assertEqual([s for s in timeline[pause + 1:] if s["t"] == "level"],
                         [{"t": "level", "id": "taishi_ci", "n": 4}, {"t": "level", "id": "tao_qian", "n": 6}])
        self.assertFalse(any(s.get("text") == "準備好了嗎？" for s in timeline))
        expected = []
        for r in [records[0], records[4]]:
            for c in r["code"]:
                if c["mnemonic"] in ("place_person", "move_person", "set_graphic"):
                    a = {a["name"]: a["value"] for a in c["args"]}
                    expected.append((build.STAGE_OPS.get(c["mnemonic"], "graphic"), a["person"],
                                     a.get("x"), a.get("y"), a.get("dir"), a.get("graphic")))
        actual = [(s["op"]["op"], s["op"]["who"], s["op"].get("x"), s["op"].get("y"),
                   s["op"].get("dir"), s["op"].get("sprite") if s["op"]["op"] == "graphic" else None)
                  for s in timeline if s["t"] == "action" and s["op"]["op"] in ("place", "move", "graphic")]
        self.assertEqual(actual, expected)

    def test_xuzhou_phases_and_both_confirmed_routes_keep_original_records(self):
        info = json.loads((ROOT / "src/data/stages.json").read_text())["c1_s1_story6"]
        timeline = info["timeline"]
        scene = build.load_scenarios()[1]["scenes"][1]
        records = {r["index"]: r for b in scene["blocks"] if b["index"] == 6 for r in b["records"]}
        officers = build.officer_of()
        first = next(i for i, s in enumerate(timeline) if s.get("id") == "c1_s1_story6:b6g2")
        decision = next(i for i, s in enumerate(timeline) if s.get("id") == "c1_s1_story6:b6g3")
        self.assertEqual(timeline[1:first], build.original_timeline(scene, [records[0]], officers) +
                         [{"t": "bgm", "key": "peace"}] + build.original_timeline(scene, [records[1]], officers))
        self.assertEqual(timeline[first + 1:decision], build.original_timeline(scene, [records[7]], officers))
        for group in [2, 3]:
            expected = {str(r["trigger"]["args"][0] | r["trigger"]["args"][1] << 8):
                        build.original_timeline(scene, [r], officers) for r in records.values()
                        if r["trigger"]["kind_name"] == "talk" and r["trigger"]["group"] == group and
                        all(c["mnemonic"] in ("dialogue", "end") for c in r["code"])}
            self.assertEqual(info["rooms"][f"c1_s1_story6:b6g{group}"]["talks"], expected)
        self.assertEqual(info["rooms"]["c1_s1_story6:b6g2"]["next"]["who"], 15)
        for option, r in zip(timeline[decision]["options"], [12, 13]):
            prompt = build.original_timeline(scene, [records[r]], officers)[0]
            self.assertEqual(option["prompt"], {k: prompt[k] for k in ("who", "text")})
            self.assertEqual(option["who"], records[r]["trigger"]["args"][0])
            start = next(i for i, s in enumerate(timeline) if s.get("name") == option["goto"]) + 1
            expected = build.original_timeline(scene, [{**records[r], "code": records[r]["code"][2:]}], officers)
            self.assertEqual(timeline[start:start + len(expected)], expected)
            self.assertFalse(any(s.get("text") == option["prompt"]["text"] for s in timeline))
        # 议论前不旋转张飞，不提前设置出战旗标，更不能提前移动或退场。
        self.assertFalse(any(s.get("flag") == "orig_f219" for s in timeline[:decision]))
        self.assertEqual([s["op"]["dir"] for s in timeline[:first] if s["t"] == "action" and s["op"].get("who") == 2], [0])
        self.assertEqual(timeline[-2], {"t": "set", "flag": "orig_route_c1_s1_b6", "value": 1})
        campaign = json.loads((ROOT / "original/extract/maps/campaign.json").read_text())["maps"]
        self.assertEqual(info["routes"], campaign[0]["routes"], '分支内换野外地图也须带道路网格')

    def test_xuzhou_return_rooms_gate_gift_and_party_changes_at_original_talks(self):
        stages = json.loads((ROOT / "src/data/stages.json").read_text())
        info = stages["c1_s1_story10"]
        first = info["rooms"]["c1_s1_story10:b10g1"]
        second = info["rooms"]["c1_s1_story10:b10g2"]
        # record 6 is the progression record triggered by clicking Tao Qian; it is
        # the room's next trigger, not a free-talk entry.
        self.assertEqual(set(first["talks"]), {"64", "65", "63", "1", "2"})
        self.assertEqual(first["next"]["who"], 15)
        self.assertNotIn("advanceWho", first)
        self.assertEqual(set(second["talks"]), {"64", "65", "15", "1", "2"})
        self.assertEqual(second["next"]["who"], 63)
        self.assertEqual(info["routes"], json.loads((ROOT / "original/extract/maps/campaign.json").read_text())["maps"][0]["routes"])
        timeline = info["timeline"]
        first_pause = timeline.index({"t": "room", "id": "c1_s1_story10:b10g1"})
        second_pause = timeline.index({"t": "room", "id": "c1_s1_story10:b10g2"})
        self.assertTrue(any(s.get("flag") == "orig_f97" and s.get("is") == 0 for s in timeline))
        self.assertEqual([s for s in timeline[first_pause + 1:second_pause] if s["t"] == "item"], [{"t": "item", "id": "twin_swords"}])
        self.assertEqual([s for s in timeline[second_pause + 1:] if s["t"] == "join"], [{"t": "join", "id": "sun_qian"}])
        farewell = stages["c1_s1_story11"]
        room_id = "c1_s1_story11:b11g1"
        self.assertEqual(farewell["rooms"][room_id]["next"]["who"], 53)
        pause = farewell["timeline"].index({"t": "room", "id": room_id})
        self.assertEqual(farewell["timeline"][pause + 1:], [{"t": "say", "who": "趙雲", "text": "劉備，徐州之圍好像已解，我想回公孫瓚那裡．"},
                                                               {"t": "say", "who": "劉備", "text": "是嗎？趙雲，這次你幫了大忙，我相信我們還能在一起為朝廷出力．"},
                                                               {"t": "say", "who": "guan_yu", "text": "趙雲，希望再見到你．"},
                                                               {"t": "say", "who": "張飛", "text": "你雖不像我這樣厲害，但也相當了不起，希望還能見到你．"},
                                                               {"t": "say", "who": "趙雲", "text": "不勝感謝，我也還想和大家在一起建功立業，請多珍重．"},
                                                               {"t": "say", "who": "張飛", "text": "今晚是趙雲的歡送會，喝！"},
                                                               {"t": "away", "id": "zhao_yun"}])

    def test_xuzhou_second_scene_keeps_two_rooms_and_confirmed_field_departure(self):
        stages = json.loads((ROOT / "src/data/stages.json").read_text())
        info = stages["c1_s2_story1"]
        scene = build.load_scenarios()[1]["scenes"][2]
        records = {r["index"]: r for r in next(b for b in scene["blocks"] if b["index"] == 1)["records"]}
        officers = build.officer_of()
        first, second = "c1_s2_story1:b1g1", "c1_s2_story1:b1g2"
        first_pause = info["timeline"].index({"t": "room", "id": first})
        second_pause = info["timeline"].index({"t": "room", "id": second})

        # R0 自动段只包含议事厅开场；group 1 由点击人物触发，简雍才是推进人物。
        self.assertEqual(info["source"], {"chapter": 1, "scene": 2, "block": 1, "records": [0, 4, 8, 9]})
        self.assertEqual(info["timeline"][1:first_pause], build.original_timeline(scene, [records[0]], officers))
        self.assertEqual(info["rooms"][first]["source"], {"block": 1, "group": 1})
        self.assertEqual(info["rooms"][first]["talks"], {
            str(records[r]["trigger"]["args"][0]): build.original_timeline(scene, [records[r]], officers)
            for r in [1, 2, 3]
        })
        self.assertEqual(info["rooms"][first]["next"], {"who": 82, "label": "聽簡雍彙報"})
        self.assertEqual(info["timeline"][first_pause + 1:second_pause], build.original_timeline(scene, [records[4]], officers))

        # group 2 的三名闲谈不推进；关羽点击才弹出原版确认问句。
        self.assertEqual(info["rooms"][second]["source"], {"block": 1, "group": 2})
        self.assertEqual(info["rooms"][second]["talks"], {
            str(records[r]["trigger"]["args"][0]): build.original_timeline(scene, [records[r]], officers)
            for r in [5, 6, 7]
        })
        self.assertEqual(info["rooms"][second]["next"], {
            "who": 1, "label": "準備出征", "prompt": {"who": "guan_yu", "text": "準備好了嗎？"},
        })
        self.assertFalse(any(s.get("text") == "準備好了嗎？" for s in info["timeline"]))

        confirmed = info["timeline"][second_pause + 1:]
        expected_confirmed = build.original_timeline(
            scene, [{**records[8], "code": records[8]["code"][2:]}], officers)
        expected_confirmed += build.original_timeline(scene, [records[9]], officers)
        self.assertEqual(confirmed, expected_confirmed)
        self.assertEqual([s["op"]["map"] for s in confirmed if s["t"] == "action" and s["op"]["op"] == "map"], ["field"])
        self.assertEqual([s["op"]["sprite"] for s in confirmed if s["t"] == "action" and s["op"]["op"] == "graphic"], [3])
        self.assertEqual([(s["op"]["who"], s["op"]["x"], s["op"]["y"]) for s in confirmed
                          if s["t"] == "action" and s["op"]["op"] == "place"],
                         [(0, 32, 30), (230, 29, 24), (223, 36, 30), (228, 36, 25)])
        self.assertEqual(confirmed[-1], {"t": "say", "who": "guan_yu", "text": "大哥，去哪裡？"})

        game = json.loads((ROOT / "src/data/game.json").read_text())
        main_scene = game["scenes"]["c1_s2_story1"]
        self.assertEqual([s["id"] for s in main_scene if s["t"] == "room"], [first, second])
        self.assertEqual([s for s in main_scene if s.get("text") == "準備好了嗎？"], [])
        self.assertEqual([s for s in main_scene if s.get("text") == "大哥，去哪裡？"],
                         [{"t": "say", "who": "guan_yu", "text": "大哥，去哪裡？"}])

        route = game["scenes"]["c1_s2_story2"]
        self.assertFalse(any(s.get("text") == "大哥，去哪裡？" for s in route))
        route_start = next(i for i, s in enumerate(game["steps"])
                           if s == {"t": "label", "name": "c1_s2_story2"})
        choice = next(s for s in game["steps"][route_start:] if s["t"] == "choice")
        self.assertEqual([o["label"] for o in choice["options"]], ["回小沛城", "去泰山", "去夏丘", "去彭城"])

    def test_prologue_records_and_all_coordinate_operations_survive(self):
        stages = json.loads((ROOT / "src/data/stages.json").read_text())
        scene = build.load_scenarios()[0]["scenes"][0]
        for sid, block, records in [("c0_s0_story1", 1, [0]),
                                     ("c0_s0_story2", 2, [0]),
                                     ("c0_s0_story3", 3, [0, 1]),
                                     ("c0_s0_story4", 4, [0, 1])]:
            with self.subTest(section=sid):
                stage = stages[sid]
                self.assertEqual(stage["source"]["records"], records)
                expected = []
                for record in scene["blocks"][block]["records"]:
                    if record["index"] not in records:
                        continue
                    for code in record["code"]:
                        if code["mnemonic"] not in ("place_person", "move_person"):
                            continue
                        args = {a["name"]: a["value"] for a in code["args"]}
                        expected.append((build.STAGE_OPS[code["mnemonic"]], args["person"], args["x"], args["y"], args["dir"]))
                actual = [(o["op"], o["who"], o["x"], o["y"], o["dir"])
                          for o in stage["ops"] if o["op"] in ("place", "move")]
                self.assertEqual(actual, expected)
        third = stages["c0_s0_story3"]
        self.assertEqual([o["map"] for o in third["ops"] if o["op"] == "map"],
                         ["palace/005", "field"])
        self.assertTrue(any(o.get("y") == 33 for o in third["ops"]))


if __name__ == "__main__":
    unittest.main()
