"""剧情记录与原版操作码的回归验证。"""
import importlib.util
import json
import re
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
        self.assertEqual(farewell["timeline"][pause + 1:], [{"t": "say", "who": "zhao_yun", "text": "劉備，徐州之圍好像已解，我想回公孫瓚那裡．"},
                                                               {"t": "say", "who": "liu_bei", "text": "是嗎？趙雲，這次你幫了大忙，我相信我們還能在一起為朝廷出力．"},
                                                               {"t": "say", "who": "guan_yu", "text": "趙雲，希望再見到你．"},
                                                               {"t": "say", "who": "zhang_fei", "text": "你雖不像我這樣厲害，但也相當了不起，希望還能見到你．"},
                                                               {"t": "say", "who": "zhao_yun", "text": "不勝感謝，我也還想和大家在一起建功立業，請多珍重．"},
                                                               {"t": "say", "who": "zhang_fei", "text": "今晚是趙雲的歡送會，喝！"},
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

    def test_xiaopei_return_keeps_reward_conditions_and_location_boundary(self):
        stages = json.loads((ROOT / "src/data/stages.json").read_text())
        info = stages["c1_s2_story6"]
        scene = build.load_scenarios()[1]["scenes"][2]
        block = next(b for b in scene["blocks"] if b["index"] == 6)
        records = {r["index"]: r for r in block["records"]}
        officers = build.officer_of()

        # R0 returns control after the farmer leaves; f8/f9/f10 indicate
        # completed bandit battles, so only their corresponding rewards apply.
        first = "c1_s2_story6:b6g1"
        first_pause = info["timeline"].index({"t": "room", "id": first})
        expected_opening = build.original_timeline(
            scene, [{**records[0], "code": records[0]["code"][:15]}], officers)
        self.assertEqual(info["timeline"][1:1 + len(expected_opening)], expected_opening)
        self.assertEqual(info["rooms"][first]["source"], {"block": 6, "group": 1})
        self.assertEqual(set(info["rooms"][first]["talks"]), {"1", "2", "63"})
        self.assertEqual(info["rooms"][first]["next"], {"who": 82, "label": "聽快使說明"})

        # Original if_flags means "unless": skip the reward when the completed
        # battle flag is clear. Restore uses room anchors, not these flags.
        before_room = info["timeline"][:first_pause]
        self.assertEqual([s for s in before_room if s["t"] == "if"], [
            {"t": "if", "flag": "orig_f8", "is": 0, "goto": "skip_gold"},
            {"t": "if", "flag": "orig_f9", "is": 0, "goto": "skip_archery_guide"},
            {"t": "if", "flag": "orig_f10", "is": 0, "goto": "skip_scroll_torrent"},
        ])
        self.assertEqual([s for s in before_room if s["t"] == "gold"], [{"t": "gold", "n": 500}])
        self.assertEqual([s for s in before_room if s["t"] == "item"], [
            {"t": "item", "id": "archery_guide"},
            {"t": "item", "id": "scroll_torrent"},
        ])
        self.assertEqual(info["rewardConditions"], {
            "gold": {"flag": "orig_f8", "is": 0, "cmp": "ne", "n": 500},
            "items": [
                {"flag": "orig_f9", "is": 0, "cmp": "ne", "id": 16},
                {"flag": "orig_f10", "is": 0, "cmp": "ne", "id": 38},
            ],
        })

        second = "c1_s2_story6:b6g2"
        second_pause = info["timeline"].index({"t": "room", "id": second})
        self.assertEqual(info["timeline"][first_pause + 1:second_pause],
                         build.original_timeline(scene, [records[4]], officers))
        self.assertEqual(info["rooms"][second]["source"], {"block": 6, "group": 2})
        self.assertEqual(info["rooms"][second]["talks"], {
            "366": build.original_timeline(scene, [records[5]], officers),
        })
        self.assertEqual(info["rooms"][second]["next"], {"label": "前往徐州陶謙官邸"})

        # R6 remains an explicit location trigger: its original target and
        # destination record are data, rather than an implicit auto-transition.
        self.assertEqual(info["location"], {
            "source": {"block": 6, "record": 6, "trigger": "location"},
            "rawArgs": [13, 0, 11, 0, 0, 0],
            "timeline": build.original_timeline(scene, [records[6]], officers),
            "adapter": "room_button",
        })

    def test_lubu_arrival_keeps_three_talk_groups_and_rearranges_hall(self):
        stages = json.loads((ROOT / "src/data/stages.json").read_text())
        info = stages["c1_s2_story8"]
        scene = build.load_scenarios()[1]["scenes"][2]
        block = next(b for b in scene["blocks"] if b["index"] == 8)
        records = {r["index"]: r for r in block["records"]}
        officers = build.officer_of()

        self.assertEqual(info["source"], {"chapter": 1, "scene": 2, "block": 8, "records": [0, 4, 11, 18, 19]})
        self.assertEqual(info["map"], "palace/004")
        timeline = info["timeline"]
        pauses = [timeline.index({"t": "room", "id": f"c1_s2_story8:b8g{i}"}) for i in (1, 2, 3)]
        self.assertEqual(pauses, sorted(pauses))

        opening = timeline[:pauses[0]]
        self.assertEqual(opening[0], {"t": "picture", "key": "orig_07"})
        self.assertIn({"t": "bgm", "key": "peace"}, opening)
        self.assertEqual([s["op"]["who"] for s in opening if s["t"] == "action" and s["op"]["op"] == "place"],
                         [0, 1, 2, 64, 81])
        self.assertIn({"t": "action", "op": {"at": 0, "op": "caption", "text": "徐州議事廳"}}, opening)

        # 点糜竺：原文一句 → 吕布在门口出现并走近，陈宫、张辽随后进场。
        entered = timeline[pauses[0] + 1:pauses[1]]
        self.assertEqual(entered[0], build.original_timeline(scene, [records[4]], officers)[0])
        self.assertEqual([(s["op"]["op"], s["op"]["who"]) for s in entered if s["t"] == "action"],
                         [("place", 4), ("move", 4), ("place", 75), ("place", 79), ("move", 75), ("move", 79)])
        # 点吕布：只有他的原版请求。
        self.assertEqual(timeline[pauses[1] + 1:pauses[2]], build.original_timeline(scene, [records[11]], officers))

        # 再点吕布：接受请求、张飞发作、吕布陈宫退场、关羽与张辽的对话。
        resolved = timeline[pauses[2] + 1:]
        self.assertEqual(resolved[:len(build.original_timeline(scene, [records[18]], officers))],
                         build.original_timeline(scene, [records[18]], officers))
        clear_at = resolved.index({"t": "action", "op": {"at": 0, "op": "clear"}})
        places = [s for s in resolved if s["t"] == "action" and s["op"]["op"] == "place"]
        self.assertEqual([s["op"]["who"] for s in places], [0, 1, 2, 64, 81])
        self.assertEqual(places[0]["op"]["x"], 25)
        self.assertGreater(resolved.index(places[0]), clear_at)

        groups = {1: {"1", "2", "81"}, 2: {"1", "2", "64", "75", "79", "81"}, 3: {"1", "2", "64", "75", "79", "81"}}
        nexts = {1: {"who": 64, "label": "請呂布進來"}, 2: {"who": 4, "label": "聽呂布說明"},
                 3: {"who": 4, "label": "答覆呂布"}}
        for i in (1, 2, 3):
            room = info["rooms"][f"c1_s2_story8:b8g{i}"]
            self.assertEqual(room["source"], {"block": 8, "group": i})
            self.assertEqual(set(room["talks"]), groups[i])
            self.assertEqual(room["next"], nexts[i])
        self.assertEqual(info["rooms"]["c1_s2_story8:b8g1"]["talks"]["81"],
                         build.original_timeline(scene, [records[3]], officers))

    def test_envoy_rooms_keep_four_groups_and_stop_before_battle_setup(self):
        stages = json.loads((ROOT / "src/data/stages.json").read_text())
        info = stages["c1_s2_story9"]
        scene = build.load_scenarios()[1]["scenes"][2]
        block = next(b for b in scene["blocks"] if b["index"] == 9)
        records = {r["index"]: r for r in block["records"]}
        officers = build.officer_of()

        self.assertEqual(info["source"], {"chapter": 1, "scene": 2, "block": 9, "records": [3, 8, 14, 19, 24]})
        # 同一间徐州议事厅：不另写 map，舞台沿用上一幕的地图与五人。
        self.assertIsNone(info["map"])
        timeline = info["timeline"]
        pauses = [timeline.index({"t": "room", "id": f"c1_s2_story9:b9g{i}"}) for i in range(4)]
        self.assertEqual(pauses, sorted(pauses))

        # 糜芳报信 → 孙乾进门。
        self.assertEqual(timeline[pauses[0] + 1:pauses[1]], build.original_timeline(scene, [records[3]], officers))
        # 孙乾说明 → 关羽让进 → 使者进门。
        self.assertEqual(timeline[pauses[1] + 1:pauses[2]], build.original_timeline(scene, [records[8]], officers))
        # 使者宣旨后原路退场。
        self.assertEqual(timeline[pauses[2] + 1:pauses[3]], build.original_timeline(scene, [records[14]], officers))
        # 糜竺议论后接出征对白；battle_setup / 野外换图留给后续营地节点。
        tail = timeline[pauses[3] + 1:]
        self.assertEqual(tail[:3], build.original_timeline(scene, [records[19]], officers))
        self.assertEqual(tail[3:], [{"t": "say", "who": "guan_yu", "text": "準備好了嗎？"},
                                    {"t": "bgm", "key": "camp"},
                                    {"t": "say", "who": "guan_yu", "text": "請點兵派將．"},
                                    {"t": "say", "who": "guan_yu", "text": "出兵．"}])
        self.assertFalse(any(s["t"] == "battle" for s in timeline))

        rooms = {f"c1_s2_story9:b9g{i}": info["rooms"][f"c1_s2_story9:b9g{i}"] for i in range(4)}
        self.assertEqual({k: v["next"] for k, v in rooms.items()}, {
            "c1_s2_story9:b9g0": {"who": 81, "label": "讓孫乾進來"},
            "c1_s2_story9:b9g1": {"who": 63, "label": "聽孫乾說明"},
            "c1_s2_story9:b9g2": {"who": 364, "label": "聽欽差宣旨"},
            "c1_s2_story9:b9g3": {"who": 64, "label": "與糜竺商議"},
        })
        self.assertEqual({k: set(v["talks"]) for k, v in rooms.items()}, {
            "c1_s2_story9:b9g0": {"1", "2", "64"},
            "c1_s2_story9:b9g1": {"1", "2", "64", "81"},
            "c1_s2_story9:b9g2": {"1", "2", "63", "64", "81"},
            "c1_s2_story9:b9g3": {"1", "2", "63", "81"},
        })

    def test_lubu_and_envoy_acts_keep_every_pack_line_in_order(self):
        sections = build.section_lines(ROOT / "original/pack/dramas/original_chapters.drama")
        game = json.loads((ROOT / "src/data/game.json").read_text())
        for sid in ("c1_s2_story7", "c1_s2_story8", "c1_s2_story9"):
            # 地名条在网页里由 caption 动作播放，不是等玩家的文本步。
            want = [build.norm(x) for x in sections[sid] if x.strip() and build.norm(x) != "徐州議事廳"]
            got = [build.norm(s["text"]) for s in game["scenes"][sid]
                   if s["t"] in ("say", "text") and build.norm(s["text"]) != "徐州議事廳"]
            self.assertEqual(got, want, sid)

    def test_bakdata_names_map_to_officer_ids(self):
        officers = build.officer_of()
        # pack 只列改动过的 114 人；刘备、张飞这类要靠姓名补全，否则头像会落到通用像。
        self.assertEqual(officers[0], "liu_bei")
        self.assertEqual(officers[1], "guan_yu")
        self.assertEqual(officers[2], "zhang_fei")
        # 使者是群众角色，没有武将 id，保留显示名而不是误配到别人。
        self.assertNotIn(364, officers)

    def test_xuchang_rooms_keep_two_groups_and_location_adapter(self):
        stages = json.loads((ROOT / "src/data/stages.json").read_text())
        info = stages["c1_s2_story14"]
        scene = build.load_scenarios()[1]["scenes"][2]
        block = next(b for b in scene["blocks"] if b["index"] == 14)
        records = {r["index"]: r for r in block["records"]}
        officers = build.officer_of()
        self.assertEqual(info["source"], {"chapter": 1, "scene": 2, "block": 14, "records": [0, 6, 13, 14]})
        self.assertEqual(info["map"], "palace/005")
        timeline = info["timeline"]
        first = timeline.index({"t": "room", "id": "c1_s2_story14:b14g1"})
        second = timeline.index({"t": "room", "id": "c1_s2_story14:b14g2"})
        # 开场：刘备换成便装、换许昌议事厅、七人站位与曹操第一句。
        opening = build.original_timeline(scene, [records[0]], officers)
        first_say = next(i for i, s in enumerate(opening) if s["t"] == "say")
        opening.insert(first_say, {"t": "bgm", "key": "peace"})
        self.assertEqual(timeline[:first], opening)
        self.assertEqual(timeline[first + 1:second], build.original_timeline(scene, [records[6]], officers))
        # 六位谋士/武将闲谈，推进人物是曹操。
        self.assertEqual(set(info["rooms"]["c1_s2_story14:b14g1"]["talks"]), {"68", "61", "77", "16", "18"})
        self.assertEqual(info["rooms"]["c1_s2_story14:b14g1"]["next"], {"who": 8, "label": "與曹操交談"})
        self.assertEqual(set(info["rooms"]["c1_s2_story14:b14g2"]["talks"]), {"8", "68", "61", "77", "16", "18"})
        self.assertEqual(info["rooms"]["c1_s2_story14:b14g2"]["next"], {"label": "前往官邸"})
        # 官邸仍是 location 触发：原始六字节保留，用房间按钮承接。
        self.assertEqual(info["location"]["rawArgs"], [13, 0, 14, 0, 0, 0])
        self.assertEqual(info["location"]["adapter"], "room_button")
        self.assertEqual(timeline[second + 1:], build.original_timeline(scene, [records[14]], officers))

    def test_generic_group_rooms_match_original_talk_records(self):
        stages = json.loads((ROOT / "src/data/stages.json").read_text())
        sections = build.section_lines(ROOT / "original/pack/dramas/original_chapters.drama")
        sids = ["c1_s3_story3", "c1_s4_story11", "c1_s4_story2", "c1_s4_story3", "c2_s0_story1", "c2_s0_story3",
                "c2_s0_story5", "c2_s0_story6", "c2_s1_story1", "c2_s1_story11", "c2_s1_story14", "c2_s1_story5",
                "c2_s2_story2", "c3_s1_story1", "c3_s1_story11", "c3_s1_story7", "c3_s2_story1", "c3_s2_story4"]
        for sid in sids:
            with self.subTest(section=sid):
                info = stages[sid]
                ch, sy, bi = map(int, build.section_target(sid))
                scene = build.load_scenarios()[ch]["scenes"][sy]
                block = next(b for b in scene["blocks"] if b["index"] == bi)
                officers = build.officer_of()
                groups = {}
                for r in block["records"]:
                    groups.setdefault(r["trigger"]["group"], []).append(r)
                talk_groups = [g for g, rs in groups.items() if any(r["trigger"]["kind_name"] == "talk" for r in rs)]
                self.assertGreaterEqual(len(talk_groups), 2)
                self.assertEqual(list(info["rooms"]), [f"{sid}:b{bi}g{g}" for g in sorted(talk_groups)])
                room_ids = [s["id"] for s in info["timeline"] if s["t"] == "room"]
                self.assertEqual(room_ids, [f"{sid}:b{bi}g{g}" for g in sorted(talk_groups)])
                for g in talk_groups:
                    rs = groups[g]
                    prog = [r for r in rs if any(c["mnemonic"] == "leave_parallel" for c in r["code"])]
                    self.assertEqual(len(prog), 1)
                    room = info["rooms"][f"{sid}:b{bi}g{g}"]
                    self.assertEqual(room["source"], {"block": bi, "group": g})
                    if prog[0]["trigger"]["kind_name"] == "talk":
                        self.assertEqual(room["next"]["who"], prog[0]["trigger"]["args"][0] | prog[0]["trigger"]["args"][1] << 8)
                    else:
                        self.assertEqual(room["next"], {"label": "前往"})
                    self.assertEqual(room["talks"], {
                        str(r["trigger"]["args"][0] | r["trigger"]["args"][1] << 8): build.original_timeline(scene, [r], officers)
                        for r in rs if r["index"] != prog[0]["index"]
                    })
                # 出征段只保留问句与台词，战斗仍由后续营地承担。
                if sid == "c1_s3_story3":
                    self.assertEqual(info["departures"], [{"block": 3, "record": 39, "group": 4,
                                                            "adapter": "room_question"}])
                    tail = [s["text"] for s in info["timeline"] if s["t"] == "say"][-3:]
                    self.assertEqual(tail, ["出兵！", "好，時機來了，除掉呂布．",
                                            "劉備看你的了，我們把部隊埋伏好，如果你勸降成功的話，那我們就一起攻進下邳．"])
                    self.assertFalse(any(s["t"] == "battle" for s in info["timeline"]))
                # 地点推进保留原始触发参数，供后续城镇行走替换按钮。
                located = [r for g in talk_groups for r in groups[g] if r["trigger"]["kind_name"] == "location"]
                self.assertEqual(len(info.get("locations", [])), len(located))
                for loc in info.get("locations", []):
                    self.assertEqual(loc["adapter"], "room_button")
                    self.assertEqual(loc["rawArgs"], next(r for r in located if r["index"] == loc["record"])["trigger"]["args"])
                # 通用规则只在文本逐句对得上时生效。
                caps = {build.norm(s["op"]["text"]) for s in info["timeline"]
                        if s["t"] == "action" and s["op"]["op"] == "caption"}
                got = [build.norm(s["text"]) for s in info["timeline"]
                       if s["t"] in ("say", "text") and build.norm(s["text"]) not in caps]
                want = [build.norm(x) for x in sections[sid] if x.strip() and build.norm(x) not in caps]
                self.assertEqual(got, want)

    def test_choice_scenes_keep_branches_and_gain_talk_pauses(self):
        stages = json.loads((ROOT / "src/data/stages.json").read_text())
        game = json.loads((ROOT / "src/data/game.json").read_text())
        checked = 0
        for sid, info in stages.items():
            if not info.get("ordered") or not info.get("rooms"):
                continue
            steps = game["scenes"].get(sid, [])
            if not any(s["t"] == "choice" for s in steps):
                continue
            checked += 1
            self.assertEqual([s["id"] for s in steps if s["t"] == "room"], list(info["rooms"]), sid)
            # 选项与分支必须原样留在 pack 步骤里。
            self.assertTrue(any(s["t"] == "label" for s in steps), sid)
            for room in info["rooms"].values():
                # 末句在全幕重复时房间改用下一组首句定位。
                self.assertTrue("after" in room or "before" in room, sid)
                self.assertTrue(room["next"].get("who"), sid)
        # 选项幕里能补停顿的都在这里；少一个说明锚点或推进记录退化了。
        self.assertGreaterEqual(checked, 18)
        ordered = [sid for sid, info in stages.items() if info.get("ordered") and info.get("rooms")]
        self.assertGreaterEqual(len(ordered), 53)
        # 徐庶离队这一幕用 ordered 保住 pack 的 away，房间不能改队伍。
        xu = game["scenes"]["c2_s2_story1"]
        self.assertEqual([s for s in xu if s["t"] == "away"], [{"t": "away", "id": "xu_shu"}])
        self.assertEqual([s["id"] for s in xu if s["t"] == "room"], list(stages["c2_s2_story1"]["rooms"]))
        self.assertIn("c1_s3_story5:b5g1", stages["c1_s3_story5"]["rooms"])
        self.assertIn("c4_s0_story4:b4g6", stages["c4_s0_story4"]["rooms"])

    def test_every_story_section_keeps_pack_text_in_order(self):
        """全部 story 幕的正文逐句对齐 pack；只允许出发问句被房间确认框替代。

        这些句子没有丢失：它们作为房间的 prompt 显示在确认框里。序章 story4 的
        四句出征邀请由房间里的「準備好了嗎」确认和环境动作承担，pack 保留原文。
        """
        sections = build.section_lines(ROOT / "original/pack/dramas/original_chapters.drama")
        game = json.loads((ROOT / "src/data/game.json").read_text())
        allowed = {
            "c0_s0_story4": ["我也參加這次作戰也許能幫上忙", "我的部隊也參加一起討伐敵軍", "準備好了嗎？", "出征！"],
            "c1_s0_story2": ["準備好了嗎？"],
            "c1_s0_story5": ["準備好了嗎？"],
            "c1_s0_story8": ["準備好了嗎？"],
            "c1_s1_story4": ["準備好了嗎？"],
            "c1_s1_story6": ["哦兄長決定出征了嗎？", "大哥派我去向曹操軍求和嗎？"],
            "c1_s2_story1": ["準備好了嗎？"],
        }
        checked = 0
        for sid, lines in sections.items():
            if not re.fullmatch(r"c\d+_s\d+_story\d+", sid):
                continue
            self.assertIn(sid, game["scenes"], sid)
            steps = game["scenes"][sid]
            caps = {build.norm(s["op"]["text"]) for s in steps if s["t"] == "action" and s["op"]["op"] == "caption"}
            got = [build.norm(s["text"]) for s in steps if s["t"] in ("say", "text") and build.norm(s["text"]) not in caps]
            want = [build.norm(x) for x in lines if x.strip() and build.norm(x) not in caps]
            missing = allowed.get(sid, [])
            for line in missing:
                self.assertIn(build.norm(line), want, f"{sid} 缺少待替代的原文 {line}")
                want.remove(build.norm(line))  # 只去掉第一处，顺序仍须一致
            self.assertEqual(got, want, f"{sid} 正文与 pack 不一致")
            checked += 1
        self.assertGreaterEqual(checked, 160)

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
