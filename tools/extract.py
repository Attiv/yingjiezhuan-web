#!/usr/bin/env python3
"""从自己持有的原版《三国志英杰传》（繁体中文 DOS 版）里读出汜水关一关需要的数据。

    python3 tools/extract.py "research/original/三国英杰传"

输出 src/data/tables.json（数值表）和 src/data/sishui.json（关卡）。只读原版文件，不修改。
容器与剧本格式依据 eiketsuden-reloaded 的 FORMATS.md 自行实现；MAIN.EXE 里各表的位置是
按表内容和读表指令在这份中文版里重新找到的（见 OFFSETS 的注释），所以脚本会先核对文件哈希。
"""
import hashlib
import json
import re
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHA = {  # 这份提取逻辑核对过的文件
    'MAIN.EXE': '45e0b40b34943b3d',
    'BAKDATA.R3': '776e242a65c12f61',
    'HEXZMAP.R3': '6e1ab5d0d5fe53f6',
    'SNR0D.R3': '72d25a2a5292044e',
}
# MAIN.EXE 文件偏移。数据段基址由读移动力表的指令（8A D8 2A FF 8A 87 <表> 88 46 F9）反推。
OFFSETS = {
    'attackBase': (0x37C98, 19), 'defenseBase': (0x37CAC, 19), 'troopBase': (0x37F58, 19), 'troopGrowth': (0x37F6C, 19),
    'move': (0x3A3BA, 19), 'subtype': (0x3A3FE, 19), 'range': (0x3A412, 19), 'moveType': (0x3A426, 19),
    'terrainDef': (0x3A48A, 20), 'strategyCategory': (0x3A848, 36), 'strategyMp': (0x3A86C, 36), 'weatherEnv': (0x3A01E, 6),
}
MOVE_COST = 0x3A43A  # 4 种移动类型 × 20 种地形
STRATEGY_LEVEL = 0x3A890  # 36 种策略 × 19 个兵种的习得等级，255 = 学不会
STRATEGY_TERRAIN = 0x3AB3C  # 火/水/石三系各 4 个可用地形
DIAGONAL, EXTENDED, CARDINAL = 0x3AE6E, 0x3AE7E, 0x3AE8E  # 各 4 组 (dx, dy)
ORDER_MODES = 0x3B10C  # 名单里的 AI 方式 → 内部指令，u16 间隔

# 简体显示名（原版数据是 Big5 繁体，下面只是换字形，顺序与原版 ID 一致）
CLASS_NAMES = ['短兵', '长兵', '战车', '弓兵', '连弩兵', '发石车', '轻骑兵', '重骑兵', '近卫队', '山贼', '恶贼', '义贼',
               '军乐队', '猛兽兵团', '武术家', '妖术师', '异民族', '民众', '运输队']
TERRAIN_NAMES = ['平原', '树林', '山地', '河流', '桥梁', '城墙', '城内', '草地', '村庄', '悬崖', '城门', '荒地', '栅栏',
                 '鹿砦', '兵营', '粮仓', '宝物库', '房舍', '火', '水']
STRATEGY_NAMES = ['焦热', '火龙', '猛火', '大焦热', '大火龙', '漩涡', '浊流', '海啸', '大漩涡', '大浊流', '落石', '山崩', '山洪',
                  '大落石', '大山崩', '假情报', '伪兵', '伪装', '牵制', '挑拨', '欺压', '激励', '支援', '鼓舞', '援助', '补给',
                  '救济', '看护', '治愈', '救命', '大激励', '大支援', '大鼓舞', '大援助', '大补给', '大救济']
SIMPLIFIED = {'劉備': '刘备', '關羽': '关羽', '張飛': '张飞', '公孫瓚': '公孙瓒', '陶謙': '陶谦', '華雄': '华雄', '李肅': '李肃',
              '胡軫': '胡轸', '趙岑': '赵岑', '步兵隊': '步兵队', '青龍偃月刀': '青龙偃月刀', '汜水關': '汜水关'}
simp = lambda s: SIMPLIFIED.get(s, s)


# ---------------------------------------------------------------- LS11 容器 ----
def ls11(data: bytes) -> list[bytes]:
    assert data[:4] in (b'LS11', b'Ls11'), data[:4]
    fmt = '>III' if data[:4] == b'LS11' else '<III'
    table, entries, pos, first = data[0x10:0x110], [], 0x110, None
    while first is None or pos + 12 <= first:
        stored, size, off = struct.unpack_from(fmt, data, pos)
        if stored == 0:
            break
        first = off if first is None else first
        entries.append((stored, size, off))
        pos += 12
    return [data[o:o + s] if s == n else unpack(data[o:o + s], n, table) for s, n, o in entries]


def unpack(raw: bytes, size: int, table: bytes) -> bytes:
    out, pos = bytearray(), 0

    def bit():
        nonlocal pos
        b = (raw[pos >> 3] >> (7 - (pos & 7))) & 1
        pos += 1
        return b

    def number():  # k−1 个 1 加一个 0 的前缀，后跟 k 位数值
        k = 1
        while bit():
            k += 1
        v = 0
        for _ in range(k):
            v = (v << 1) | bit()
        return (1 << k) - 2 + v

    while len(out) < size:
        v = number()
        if v < 256:
            out.append(table[v])
        else:
            dist, length = v - 256, number() + 3
            for _ in range(length):
                out.append(out[-dist])
    return bytes(out)


# ---------------------------------------------------------------- 剧本 ----
LENGTHS = {0x00: 2, 0x01: 5, 0x02: 1, 0x03: 0x119, 0x04: 0, 0x05: 0, 0x06: 0, 0x07: 2, 0x08: 2, 0x09: 2, 0x0A: 5, 0x0B: 2,
           0x0C: 4, 0x0D: 2, 0x0E: 2, 0x0F: 1, 0x10: 4, 0x11: 2, 0x12: 0, 0x13: 0, 0x14: 2, 0x15: 2, 0x16: 4, 0x17: 1,
           0x18: 2, 0x1A: 2, 0x1B: 1, 0x1C: 5, 0x1D: 4, 0x1E: 0, 0x1F: 0, 0x22: 0x187, 0x23: 0, 0x24: 3, 0x25: 2,
           0x26: 3, 0x27: 3, 0x28: 3, 0x29: 0, 0x2A: 1, 0x2B: 3, 0x2C: 0, 0x2D: 2, 0x2E: 5, 0x2F: 3, 0x30: 2, 0x31: 0,
           0x33: 0, 0x34: 0, 0x35: 3, 0x36: 0, 0x37: 3, 0x38: 1, 0x39: 3, 0x3A: 3, 0x3B: 2, 0x3C: 2, 0x3D: 1}


def script(block: bytes, pos: int) -> list[tuple[int, bytes]]:
    out = []
    while block[pos] != 0xFF:
        code = block[pos]
        if code == 0x20:
            n = 1 + (block[pos + 1] & 0x7F)
        elif code == 0x21:
            flags_on = block[pos + 2]
            n = 3 + flags_on + block[pos + 3 + flags_on]
        elif code == 0x32:
            n = 1 + block[pos + 1]
        else:
            n = LENGTHS[code]
        out.append((code, block[pos + 1:pos + 1 + n]))
        pos += 1 + n
    return out


def blocks(scene: bytes) -> list[bytes]:
    offs, pos = [], 0
    while (o := struct.unpack_from('<H', scene, pos)[0]) != 0xFFFF:
        offs.append(o)
        pos += 2
    return [scene[o:(offs[i + 1] if i + 1 < len(offs) else len(scene))] for i, o in enumerate(offs)]


def records(block: bytes) -> list[dict]:
    out, pos = [], 0
    while block[pos:pos + 10] != b'\xff' * 10:
        kind, group, a, b, c, so = struct.unpack_from('<BBHHHH', block, pos)
        out.append({'kind': kind & 0x7F, 'a': a, 'b': b, 'row': block[pos + 4], 'col': block[pos + 5], 'script': script(block, so)})
        pos += 10
    return out


def main(game: Path):
    files = {}
    for name, want in SHA.items():
        files[name] = (game / name).read_bytes()
        got = hashlib.sha256(files[name]).hexdigest()
        assert got.startswith(want), f'{name} 不是核对过的那份文件（{got[:16]}）'
    exe, bak = files['MAIN.EXE'], files['BAKDATA.R3']

    # 数据段基址：读移动力表的指令里的位移，对上表在文件里的位置
    m = re.search(rb'\x8a\xd8\x2a\xff\x8a\x87(..)\x88\x46\xf9', exe, re.S)
    ds = OFFSETS['move'][0] - struct.unpack('<H', m.group(1))[0]

    tables = {name: list(exe[o:o + n]) for name, (o, n) in OFFSETS.items()}
    pairs = lambda o: [list(struct.unpack_from('<hh', exe, o + i * 4)) for i in range(4)]
    order_modes = [struct.unpack_from('<H', exe, ORDER_MODES + i * 2)[0] for i in range(7)]
    items = []
    for i in range(64):
        r = bak[0xD00 + i * 16:0xD00 + (i + 1) * 16]
        items.append({'name': simp(r[:13].split(b'\0')[0].decode('big5').strip()), 'category': r[15], 'value': r[14]})
    tables_out = {
        '_source': f'tools/extract.py 读自原版 MAIN.EXE（sha256 {SHA["MAIN.EXE"]}…，数据段文件偏移 {ds:#x}）与 BAKDATA.R3',
        'classNames': CLASS_NAMES, 'terrainNames': TERRAIN_NAMES, 'strategyNames': STRATEGY_NAMES,
        **tables,
        'moveCost': [list(exe[MOVE_COST + t * 20:MOVE_COST + t * 20 + 20]) for t in range(4)],
        'cardinal': pairs(CARDINAL), 'diagonal': pairs(DIAGONAL), 'extended': pairs(EXTENDED),
        'strategyTerrain': [list(exe[STRATEGY_TERRAIN + f * 4:STRATEGY_TERRAIN + f * 4 + 4]) for f in range(3)],
        'strategyLevel': [list(exe[STRATEGY_LEVEL + s * 19:STRATEGY_LEVEL + s * 19 + 19]) for s in range(36)],
        'items': items,
    }

    def officer(i: int) -> dict:
        r = bak[0x1100 + i * 21:0x1100 + (i + 1) * 21]
        init = bak[0x3080 + i * 18:0x3080 + (i + 1) * 18]
        return {'officer': i, 'name': simp(r[:6].split(b'\0')[0].decode('big5')), 'lead': r[17], 'str': r[18], 'int': r[19],
                'affiliation': init[0] & 31, 'cls': init[7], 'level': init[8], 'items': [x for x in init[10:18] if x != 255]}

    # 地图：HEXZMAP 第 0 项 = [宽][高][宽×高 个图块][(宽/2)×(高/2) 个地形码]，名字在第 58 项
    maps = ls11(files['HEXZMAP.R3'])
    w, h = maps[0][0], maps[0][1]
    terrain = list(maps[0][2 + w * h:])
    assert len(terrain) == (w // 2) * (h // 2)
    map_name = simp(maps[58].split(b'\n')[0].decode('big5').strip())

    # 剧本：序章场景 0，块 4 是出阵设置（关羽对话里的 battle_setup），块 5 是战斗
    scene = blocks(ls11(files['SNR0D.R3'])[0])
    setup = next(d for r in records(scene[4]) for c, d in r['script'] if c == 0x03)
    battle = records(scene[5])
    roster = next(d for r in battle for c, d in r['script'] if c == 0x22)
    assert roster[0] == 0, '名单应为敌军'
    turn_limit, win_officer, lose_officer = setup[1], struct.unpack_from('<H', setup, 5)[0], struct.unpack_from('<H', setup, 9)[0]

    units = []
    for i in range(30):  # 我方槽位 0–14
        s = setup[11 + i * 9:20 + i * 9]
        oid = struct.unpack_from('<H', s)[0]
        if oid == 0xFFFF:
            continue
        o = officer(oid)
        # 刘备军（所属 0）由玩家指挥，其余我方部队是「攻击最近的敌人」
        units.append({**o, 'slot': len(units), 'x': s[2], 'y': s[3], 'mode': 7 if o['affiliation'] == 0 else 1,
                      'needsTalk': bool(s[5])})
    enemies = 0
    for i in range(30):  # 敌方槽位 15 起，按名单顺序
        s = roster[1 + i * 13:14 + i * 13]
        oid = struct.unpack_from('<H', s)[0]
        if oid == 0xFFFF:
            continue
        o = officer(oid)
        units.append({**o, 'slot': 15 + enemies, 'x': s[2], 'y': s[3], 'cls': s[11], 'level': s[12], 'items': [],
                      'mode': order_modes[s[8]], 'rawMode': s[8]})
        enemies += 1

    cells, contact = [], None
    for r in battle:
        codes = [c for c, _ in r['script']]
        if r['kind'] == 6:  # 部队到达格：记录里先行后列；0x400 = 任意我方部队
            assert r['a'] == 0x400
            reward = {}
            for c, d in r['script']:
                if c == 0x2B and d[0] == 2:
                    reward['gold'] = struct.unpack_from('<H', d, 1)[0]
                if c == 0x1B:
                    reward['item'] = d[0]
            cells.append({'x': r['col'], 'y': r['row'], **reward})
        if r['kind'] == 4:  # 部队相邻：行动方 a，邻居 b
            levels = next(d for c, d in r['script'] if c == 0x39)
            removed = next(struct.unpack('<H', d)[0] for c, d in r['script'] if c == 0x18)
            assert 0x10 in codes and removed == r['b']
            contact = {'actor': r['a'], 'next': r['b'], 'levelsTo': struct.unpack_from('<H', levels)[0], 'levels': levels[2], 'removes': removed}

    level_out = {
        '_source': f'tools/extract.py 读自原版 HEXZMAP.R3 第 0 项、SNR0D.R3 序章块 4–5、BAKDATA.R3',
        'name': map_name, 'w': w // 2, 'h': h // 2, 'terrain': terrain,
        'turnLimit': turn_limit, 'winOfficer': win_officer, 'loseOfficer': lose_officer,
        'units': units, 'cells': cells, 'contact': contact,
    }
    data = ROOT / 'src' / 'data'
    (data / 'tables.json').write_text(json.dumps(tables_out, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    (data / 'sishui.json').write_text(json.dumps(level_out, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'{map_name} {w // 2}×{h // 2}，{turn_limit} 回合，我方 {len(units) - enemies} 队，敌军 {enemies} 队')
    for u in units:
        print(f"  槽 {u['slot']:2d} {u['name']:<4s} {CLASS_NAMES[u['cls']]} Lv{u['level']} ({u['x']},{u['y']}) 指令 {u['mode']}"
              f" 统{u['lead']} 武{u['str']} 智{u['int']} 道具 {[items[i]['name'] for i in u['items']]}")
    print('  到达格：', cells, '\n  相邻：', contact)


if __name__ == '__main__':
    main(Path(sys.argv[1]))
