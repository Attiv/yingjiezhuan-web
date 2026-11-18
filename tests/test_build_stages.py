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
