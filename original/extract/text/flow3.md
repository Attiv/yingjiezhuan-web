# 시나리오 흐름: SNR3D.R3 (원문 포함, 이 컴퓨터에만 둘 것)

## SNR3D.R3 + SNR3M.R3

### 장면 0

제목: 第三章　荊州南部征服戰

- **블록 0**: 이야기; 레코드 2, 그룹 2; 대화 0(잡담 0); 맵: 마을 0, 마을 5
  - r1 삽화 18
  - **r0** run(0) 그룹 0
    - `play_music` song=0
    - `chapter_title` key=第三章　荊州南部征服戰
    - `title`
      > 第三章　荊州南部征服戰
    - `load_map` map=8197
    - `caption`
      > 襄陽議事廳
    - `dialogue`
      > 曹操: 哎！可恨的劉備，可恨的孫權．這個恥辱一定要加倍奉還，一定要加倍奉還．
      > 曹仁: 主公，下一步怎麼辦！
      > 曹操: 我先返回許昌．曹仁，任命你鎮守江陵．你一定要死守江陵，明白了嗎？
      > 曹仁: 遵命！
      > 曹操: 夏侯惇，你去守襄陽城．
      > 夏侯惇: 遵命！
  - **r1** run(0) 그룹 1
    - `show_picture` picture=18 variant=0
    - `narration`
      > 　曹操為了重振軍隊返回許昌．已經成為曹操領地的荊州，由曹仁，夏侯惇鎮守．
      > 　曹操離開後的荊州，成為劉備和孫權爭奪的目標．
    - `load_map` map=8192
    - `play_music` song=11
    - `caption`
      > 吳宮殿
    - `dialogue`
      > 周瑜: 曹操軍在赤壁之戰打了敗仗，已經很疲憊了．
      > 而我軍打了勝仗，士氣高漲．
      > 孫權: 是的．現在正好收取荊州．
      > 周瑜！命令你擔任主帥進攻江陵！
      > 周瑜: 遵命！一定完成任務．
    - `narration`
      > 　孫權命令周瑜攻克荊州，孫權奪取荊州的長年願望即將實現．
      > 　這以後，周瑜和曹仁在江陵展開了激烈的戰鬥．
- **블록 1**: 전투 준비; 레코드 17, 그룹 4; 대화 15(잡담 13); 맵: 마을 3, 지도
  - 전투 설정: 턴 제한 30, 아군 출진 9명, 격파 대상 #142, 퇴각하면 패배 #0
  - 목표 문구: 進行攻打江陵的準備工作．
  - 질문 r15 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - r16 소속: 關羽 → 유비군(합류)
  - r16 레벨 +2: 關羽
  - **r0** run(0) 그룹 0
    - `load_map` map=8195
    - `set_previous_map` map=7 x=28 y=5
    - `caption`
      > 江夏議事廳
    - `narration`
      > 　這裡是江夏的議事廳．得到情報，東吳周瑜正攻打曹仁鎮守的江陵．
      > 　江陵地處荊州中心，位於江夏的西南．
  - **r1** talk(3) [關羽] 그룹 1*
    - `dialogue`
      > 關羽: 兄長，聽到了嗎？周瑜正攻打江陵，而且曹操現在不在江陵．
  - **r2** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 但是，曹操這種人不吃點苦不知天高地厚，給他點顏色，他就老實了．
  - **r3** talk(3) [趙雲] 그룹 1
    - `dialogue`
      > 趙雲: 赤壁之戰，我軍與孫權軍曾聯手抗曹，以後也保持這種關係吧．
  - **r4** talk(3) [劉琦] 그룹 1
    - `dialogue`
      > 劉琦: 叔父，實在對不起．最近我身體有點不太好．
  - **r5** talk(3) [伊籍] 그룹 1
    - `dialogue`
      > 伊籍: 劉琦最近身體不太好，不要緊吧．
  - **r6** talk(3) [關平] 그룹 1
    - `dialogue`
      > 關平: 赤壁之戰，曹操的兵力也削弱了些吧．
  - **r7** talk(3) [孫乾] 그룹 1
    - `dialogue`
      > 孫乾: 曹操不在，在下認為正是奪取荊州的良機．
  - **r8** talk(3) [諸葛亮] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 主公，周瑜乘赤壁大勝之勢，正要把荊州奪到自己手裡．
      > 劉備: 嗯……
      > 諸葛亮: 荊州已經不是劉表的地盤了，是曹操所有．奪取荊州作根本，是與曹操、孫權抗衡的唯一途徑．
      > 劉備: ……
      > 諸葛亮: 單憑此一城，無論曹操和孫權，都能把我們消滅乾淨，主公，請下決心吧！
      > 劉備: 既然如此，奪取荊州！
      > 諸葛亮: 好，主公英明果決，那麼，火速進攻江陵．請準備出征．
    - `dialogue`
      > 劉琦: 叔父，我身體有點不舒服，這次請讓我送您出征吧．
      > 劉備: 好吧，賢侄，好生休養吧．
      > 劉琦: 是．如此，您多費心了．
    - `dialogue`
      > 諸葛亮: 最近劉琦好像身體不行呀．
      > 劉備: 嗯，但願沒什麼事……
      > 諸葛亮: 真讓人擔心．主公，還是請做出征準備吧．
    - `set_objective`
      > 進行攻打江陵的準備工作．
    - `leave_parallel` 
  - **r9** talk(3) [關羽] 그룹 2*
    - `dialogue`
      > 關羽: 兄長，準備好了請告訴軍師，不是告訴我．
  - **r10** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 大哥，再這麼愣著，周瑜就拿下江陵了．
  - **r11** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 聽說現在周瑜正與曹仁出城大戰，江陵城正空虛，的確是好機會．
  - **r12** talk(3) [關平] 그룹 2
    - `dialogue`
      > 關平: 赤壁之戰，曹操的兵力也削弱了些吧．
  - **r13** talk(3) [伊籍] 그룹 2
    - `dialogue`
      > 伊籍: 劉琦最近身體不太好，不要緊吧．
  - **r14** talk(3) [孫乾] 그룹 2
    - `dialogue`
      > 孫乾: 曹操不在，在下認為正是奪取荊州的良機．
  - **r15** talk(3) [諸葛亮] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 出征嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r16** run(0) 그룹 3
    - `play_music` song=12
    - `dialogue`
      > 諸葛亮: 請編組隊伍．
    - `set_allegiance` person=關羽 army=0
    - `add_levels` person=關羽 levels=2
    - `battle_setup` 
    - `dialogue`
      > 諸葛亮: 好吧，兵貴神速，馬上出征．
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 好吧，向江陵進發，江陵在江夏的西南方向．
- **블록 2**: 전투; 레코드 8, 그룹 4; 대화 0(잡담 0); 맵: 전투 맵 27, 지도
  - 적군 명단: 22기
  - 트리거: turn, unit_at_cell, unit_defeated
  - 목표 문구: 一、陳矯的失敗
  - r0 소속: 騎兵隊 → 군 2(이탈)
  - r0 소속: 騎兵隊 → 군 2(이탈)
  - r0 소속: 騎兵隊 → 군 2(이탈)
  - r0 소속: 騎兵隊 → 군 2(이탈)
  - r0 소속: 步兵隊 → 군 2(이탈)
  - r0 소속: 步兵隊 → 군 2(이탈)
  - r5 (turn) → 블록 3
  - r6 아이템: 弓術指南書
  - r7 (unit_defeated) 전투 끝
  - r7 (unit_defeated) → 블록 4
  - 플래그 켬: {199}
  - 플래그 검사: {199}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `set_allegiance` person=騎兵隊 army=2
    - `set_allegiance` person=騎兵隊 army=2
    - `set_allegiance` person=騎兵隊 army=2
    - `set_allegiance` person=騎兵隊 army=2
    - `set_allegiance` person=步兵隊 army=2
    - `set_allegiance` person=步兵隊 army=2
    - `load_map` map=12315
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、陳矯的失敗
    - `dialogue`
      > 陳矯: 什麼？劉備軍來了，可是曹仁正和周瑜交戰，要堅守等到曹仁回來．
      > 諸葛亮: 主公，曹仁正與周瑜交戰，江陵就是一個空城．他們之間的戰鬥結束後，曹仁或周瑜，無論誰取勝都會來江陵．那樣的話，就麻煩了．早點攻下城吧．
    - `play_music` song=9
  - **r3** turn(9) 그룹 3*
    - `dialogue`
      > 諸葛亮: 主公，周瑜打敗曹仁，正趕往這裡，在周瑜到達這裡之前，趕快攻下江陵．
  - **r4** turn(9) 그룹 3
    - `dialogue`
      > 諸葛亮: 主公，也許周瑜馬上就會到達這裡．
      > 如果在我軍攻下江陵之前來到，就不好辦了，趕快！
  - **r5** turn(9) 그룹 3
    - `play_music` song=11
    - `join_battle` person=周瑜
    - `join_battle` person=蔣欽
    - `join_battle` person=徐盛
    - `join_battle` person=丁奉
    - `join_battle` person=甘寧
    - `join_battle` person=周泰
    - `join_battle` person=呂蒙
    - `join_battle` person=凌統
    - `join_battle` person=步兵隊
    - `join_battle` person=步兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `caption`
      > 周瑜軍出現！
    - `goto_block` block=3
  - **r6** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=弓術指南書
    - `set_flag` flag=199 clear=0
  - **r7** unit_defeated(12) [陳矯] 그룹 3
    - `data` kind=4 value=50
    - `dialogue`
      > 陳矯: 哇！
    - `narration`
      > 　打敗陳矯，劉備軍佔領江陵．
    - `play_music` song=11
    - `join_battle` person=周瑜
    - `join_battle` person=蔣欽
    - `join_battle` person=徐盛
    - `join_battle` person=丁奉
    - `join_battle` person=甘寧
    - `join_battle` person=周泰
    - `join_battle` person=呂蒙
    - `join_battle` person=凌統
    - `join_battle` person=步兵隊
    - `join_battle` person=步兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `caption`
      > 周瑜出現！
    - `dialogue`
      > 周瑜: 何事？
      > 甘寧: 周瑜都督，江陵已被劉備軍佔領了．
      > 周瑜: 什麼！我們與曹仁交戰時，他乘機竊取空城，太卑鄙了！我絕不放過他．
      > 呂蒙: 都督，我軍與曹仁交戰，消耗甚大，不該再戰了．我們回去再想對策吧．
      > 周瑜: 啊，真是後悔莫及．就照你所說，撤退！但是，劉備、孔明，你們等著瞧！
    - `play_music` song=7
    - `data` kind=2 value=1000
    - `caption`
      > 得到黃金１０００！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 進入江陵吧．
    - `goto_block` block=4
- **블록 3**: 이야기; 레코드 9, 그룹 3; 대화 0(잡담 0); 맵: 지도
  - 트리거: battle_won, turn, unit_at_cell, unit_contact, unit_defeated
  - 목표 문구: 一、周瑜退卻 / 在江陵談論今後之事．
  - r1 일기토
  - r1 레벨 +1: 趙雲
  - r6 아이템: 弓術指南書
  - r8 (run) 전투 끝
  - r8 소속: 騎兵隊 → 무소속(이탈)
  - r8 소속: 騎兵隊 → 무소속(이탈)
  - r8 소속: 騎兵隊 → 무소속(이탈)
  - r8 소속: 騎兵隊 → 무소속(이탈)
  - r8 소속: 步兵隊 → 무소속(이탈)
  - r8 소속: 步兵隊 → 무소속(이탈)
  - 플래그 켬: {199, 214}
  - 플래그 검사: {199, 214}
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 劉備: 來不及了吧……
      > 周瑜: 何事？
      > 甘寧: 周瑜都督，劉備軍正在攻打江陵．
      > 周瑜: 什麼！想乘我們大戰曹仁之機竊取空城，辦不到！馬上全軍攻打劉備，不能把江陵交給劉備！！
    - `play_music` song=14
    - `set_objective`
      > 一、周瑜退卻
  - **r1** unit_contact(4) [趙雲] 그룹 1*
    - `dialogue`
      > 趙雲: 這裡已經歸我們所有了，你們現在最好趕快回東吳．
      > 甘寧: 吵什麼！忘記赤壁之恩了嗎，看我宰了你！
    - `duel` first=趙雲 second=甘寧
    - `duel_begin` 
    - `dialogue`
      > 甘寧: 大膽！來吧！
      > 趙雲: 你不是對手！
    - `duel_action` person=趙雲 action=1
    - `duel_action` person=趙雲 action=1
    - `duel_action` person=趙雲 action=1
    - `dialogue`
      > 甘寧: 嘿嘿！
      > 趙雲: 有兩下子！
    - `duel_action` person=趙雲 action=1
    - `duel_action` person=趙雲 action=1
    - `dialogue`
      > 甘寧: 沒辦法，打不過！
    - `duel_action` person=甘寧 action=4
    - `duel_end` 
    - `add_levels` person=趙雲 levels=1
    - `caption`
      > 趙雲的等級上升！
  - **r2** unit_defeated(12) [陳矯] 그룹 1
    - `dialogue`
      > 陳矯: 可惡！撤退……
    - `caption`
      > 陳矯撤退了！
    - `set_flag` flag=214 clear=0
  - **r3** turn(9) 그룹 1
    - `dialogue`
      > 周瑜: 劉備、孔明！嘗嘗我的厲害！前進！
  - **r4** turn(9) 그룹 1
  - **r5** turn(9) 그룹 1 — 그룹 넘김
    - `dialogue`
      > 周瑜: 什麼事？現在正忙著！說什麼……兵糧……哦，只準備了和曹仁作戰所需兵糧，嗯，知道了．撤退！但劉備、孔明，此事還沒完！！
    - `dialogue`
      > 劉備: 怎麼了？周瑜撤退了．
      > 諸葛亮: 兵糧沒有了吧？也許是與曹仁作戰，兵糧已耗盡了吧．
      > 劉備: 肯定是……那我們勝利了．
      > 諸葛亮: 正是，主公，恭喜您．
    - `leave_parallel` 
  - **r6** unit_at_cell(6) [(any unit)] 그룹 1
    - `if_flags` 
    - `add_item` item=弓術指南書
    - `set_flag` flag=199 clear=0
  - **r7** battle_won(7) 그룹 1 — 그룹 넘김
    - `dialogue`
      > 周瑜: 可惡！此仇必報！劉備、孔明小心了！
    - `leave_parallel` 
  - **r8** run(0) 그룹 2
    - `play_music` song=7
    - `if_flags` 
    - `dialogue`
      > 陳矯: 連周瑜軍都……劉備軍……唉，撤退！
    - `narration`
      > 　周瑜軍撤退了，劉備佔領了江陵．
    - `data` kind=2 value=1000
    - `caption`
      > 得到黃金１０００！
    - `battle_end` next_map=4096
    - `set_allegiance` person=騎兵隊 army=14
    - `set_allegiance` person=騎兵隊 army=14
    - `set_allegiance` person=騎兵隊 army=14
    - `set_allegiance` person=騎兵隊 army=14
    - `set_allegiance` person=步兵隊 army=14
    - `set_allegiance` person=步兵隊 army=14
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 好吧，入城！
    - `set_objective`
      > 在江陵談論今後之事．
- **블록 4**: 이야기; 레코드 18, 그룹 4; 대화 15(잡담 14); 맵: 마을 0, 마을 5, 마을 7
  - 트리거: location
  - 목표 문구: 會見江夏馬良．
  - **r0** run(0) 그룹 0
    - `load_map` map=8192
    - `play_music` song=11
    - `caption`
      > 東吳宮殿
    - `dialogue`
      > 周瑜: 實在對不起，被劉備竊取了空城似的江陵，我們也曾冒死爭鬥……
      > 孫權: 哼，劉備這傢伙，我們在赤壁替他打敗曹操軍，他連這大恩都忘了！
      > 周瑜: 此仇莫齒難忘，有朝一日，必將劉備宰了！！
      > 孫權: 周瑜！
      > 呂蒙: 都督！
    - `dialogue`
      > 呂蒙: 都督，傷勢不要緊吧．現在還是養傷要緊．
      > 孫權: 是啊，周瑜，無論如何得休養．
      > 周瑜: 讓您掛心，真是……
      > 呂蒙: 都督，這邊請．
    - `dialogue`
      > 孫權: 劉備這個傢伙，把周瑜弄得如此狼狽，光想自己占便宜，辦不到！這次我要親率全軍，進攻江陵，全體將士，準備出發！
    - `dialogue`
      > 魯肅: 主公，且慢．
      > 孫權: 有何事？魯肅．
      > 魯肅: 周瑜都督新敗，我軍正士氣低沉，起兵絕非上策．
      > 孫權: 你說怎麼辦？
      > 魯肅: 我再去見一趟劉備，他對我東吳行無理之事，如果我說明此事，劉備或許會明白，無論如何，等我回來再採取行動．
      > 孫權: 知道了，那，你趕快去見劉備．
      > 魯肅: 是！
  - **r1** run(0) 그룹 1
    - `load_map` map=8197
    - `set_previous_map` map=2 x=25 y=5
    - `play_music` song=5
    - `caption`
      > 江陵議事廳
    - `narration`
      > 　劉備佔領江陵後，也攻下了夏侯惇鎮守的襄陽．自此，荊州北部盡歸劉備所有．
      > 　不久之後，東吳魯肅來到江陵．
    - `dialogue`
      > 關羽: 兄長，東吳魯肅前來拜見．
    - `dialogue`
      > 魯肅: 劉備公，在下魯肅．
  - **r2** talk(3) [關羽] 그룹 2*
    - `dialogue`
      > 關羽: 東吳魯肅前來拜見．
  - **r3** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 東吳的使者嗎？哼，肯定是說客．
  - **r4** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 江陵是我們的地方，好不容易才奪來的，再還回去，沒有道理．
  - **r5** talk(3) [關平] 그룹 2
    - `dialogue`
      > 關平: 東吳若想要這塊地方，憑兵馬來取呀！
  - **r6** talk(3) [伊籍] 그룹 2
    - `dialogue`
      > 伊籍: 為什麼要把荊州給東吳，有必要嗎？劉表有靈也會生氣的．
  - **r7** talk(3) [孫乾] 그룹 2
    - `dialogue`
      > 孫乾: 聽說東吳謀士極多，一定是他們出主意，要我們還荊州吧．
  - **r8** talk(3) [諸葛亮] 그룹 2
    - `dialogue`
      > 諸葛亮: 主公，請放心．我有妙計．
  - **r9** talk(3) [魯肅] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 魯肅: 劉備公，這次的事，我們東吳無法理解．
      > 劉備: 您說是……
      > 魯肅: 當然了，赤壁一戰，是我軍趕走了曹兵，付出了巨大代價，因此應該得到整個荊州．
      > 諸葛亮: 魯肅大人，這樣想可大錯特錯了．
    - `dialogue`
      > 魯肅: 原來是孔明公，您認為我說的不對嗎？
      > 諸葛亮: 這裡既不是我們的土地，更不是你們東吳的，這裡是劉琦的．
      > 魯肅: 啊？……
      > 諸葛亮: 這裡原來歸劉表所有，只是從曹操手裡，替劉琦將它奪回來．
      > 魯肅: 可、可是，赤壁一戰，我軍就白費力了……
      > 諸葛亮: 好了好了．劉琦總是臥病，說不定會發生什麼萬一的情況，到那時，再將這裡交給東吳．目前，就算我們向東吳借這裡暫住吧．
      > 魯肅: 好吧，我向我主轉達此意，先告退了．
    - `leave_parallel` 
  - **r10** talk(3) [關羽] 그룹 3*
    - `dialogue`
      > 關羽: 不愧為軍師，三言兩語把魯肅打發走了．
  - **r11** talk(3) [張飛] 그룹 3
    - `dialogue`
      > 張飛: 哼，憑什麼將這裡交給吳狗．
  - **r12** talk(3) [趙雲] 그룹 3
    - `dialogue`
      > 趙雲: 江陵是我們的地方，好不容易才奪來的，再還回去，沒有道理．
  - **r13** talk(3) [關平] 그룹 3
    - `dialogue`
      > 關平: 東吳若想要這塊地方，憑兵馬來取呀！
  - **r14** talk(3) [伊籍] 그룹 3
    - `dialogue`
      > 伊籍: 為什麼要把荊州給東吳，有必要嗎？劉表有靈也會生氣的．
  - **r15** talk(3) [孫乾] 그룹 3
    - `dialogue`
      > 孫乾: 聽說東吳謀士極多，一定是他們出主意，要逼還荊州吧．
  - **r16** talk(3) [諸葛亮] 그룹 3
    - `dialogue`
      > 諸葛亮: 主公，荊州這裡有個人才，把他請來吧．
      > 劉備: 孔明，你說的是誰？
      > 諸葛亮: 此人名叫馬良，聽說一家人住在江夏，馬家個個都非等閒．
      > 劉備: 馬良？現居江夏……
      > 諸葛亮: 是的，以主公之聲望，他一定會來，主公，請去邀請馬良吧．
    - `set_objective`
      > 會見江夏馬良．
  - **r17** location(2) 그룹 3 — 그룹 넘김
    - `load_map` map=8199
    - `leave_parallel` 
- **블록 5**: 이야기; 레코드 2, 그룹 1; 대화 1(잡담 1); 맵: 마을 9
  - 트리거: location
  - **r0** talk(3) [商人] 그룹 0*
    - `dialogue`
      > 商人: 馬良？啊，是那個白眉人吧，他現在肯定在集會所．
  - **r1** location(2) 그룹 0 — 그룹 넘김
    - `load_map` map=8201
    - `leave_parallel` 
- **블록 6**: 이야기; 레코드 6, 그룹 3; 대화 2(잡담 1)
  - 트리거: condition
  - 목표 문구: 返回江陵．
  - r1 소속: 馬良 → 유비군(합류)
  - 선택지 r2: 「帶馬謖走」 r3 → 진행; 「不帶馬謖走」 r4 → 진행
  - r3 소속: 馬謖 → 유비군(합류)
  - **r0** talk(3) [馬謖] 그룹 0*
    - `dialogue`
      > 馬謖: 啊，我不是馬良，而是他弟弟馬謖．在我身邊的才是馬良．
  - **r1** talk(3) [馬良] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 劉備: 對不起，請教尊姓大名？
      > 馬良: 我嗎？在下馬良．
      > 劉備: 噢，幸會幸會．多有冒犯，在下劉備．
      > 馬良: 啊，您就是劉備？方才不知，多有得罪．
      > 劉備: 哪裡哪裡．久聞大名，特來相會．望一定助我一臂之力．
      > 馬良: 劉備大人相請，安敢拒絕，一定盡力．
      > 劉備: 多謝．
    - `caption`
      > 馬良成為部下．
    - `set_allegiance` person=馬良 army=0
    - `dialogue`
      > 馬良: 還有，沒來得及介紹，旁邊這人乃是馬謖，我的弟弟，是個非常出色的年輕人．
      > 馬謖: 初次相見，在下馬謖．
      > 馬良: 馬謖也想為您效力，不知尊意如何？
    - `leave_parallel` 
  - **r2** condition(1) 그룹 1* — 그룹 넘김
    - `choice`
      > 帶馬謖走
      > 不帶馬謖走
  - **r3** run(0) 그룹 1 — 그룹 넘김
    - `dialogue`
      > 劉備: 嗯，真是年輕有為．以後請你們二位多多出力了．
      > 馬謖: 您言重了．
    - `caption`
      > 馬謖成為部下．
    - `set_allegiance` person=馬謖 army=0
    - `leave_parallel` 
  - **r4** run(0) 그룹 1 — 그룹 넘김
    - `dialogue`
      > 劉備: 呀，看來年紀尚輕，等長大些再用吧．
      > 馬良: 如此……那，劉備大人……沒什麼，主公，走吧．
      > 劉備: 嗯．
    - `leave_parallel` 
  - **r5** run(0) 그룹 2
    - `dialogue`
      > 馬良: 以後全靠你了，我就先往江陵去了．
      > 馬謖: 很遺憾．
    - `set_objective`
      > 返回江陵．
- **블록 7**: 이야기; 레코드 22, 그룹 5; 대화 16(잡담 14); 맵: 마을 5, 지도
  - 트리거: condition, location
  - 목표 문구: 商量今後． / 做出征荊州南部的準備．
  - 질문 r16 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - r17 소속: 關羽 → 무소속(이탈)
  - r17 소속: 張飛 → 무소속(이탈)
  - r17 소속: 趙雲 → 무소속(이탈)
  - 선택지 r18: 「攻打武陵」 r19 → 블록 9; 「攻打零陵」 r20 → 블록 8; 「攻打桂陽」 r21 → 블록 10
  - r19 (run) → 블록 9
  - r20 (run) → 블록 8
  - r21 (run) → 블록 10
  - **r0** location(2) 그룹 0
    - `load_map` map=8197
    - `dialogue`
      > 關羽: 兄長，你回來了．
    - `set_objective`
      > 商量今後．
  - **r1** talk(3) [關羽] 그룹 1*
    - `dialogue`
      > 關羽: 兄長，你回來了．
  - **r2** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 這個叫馬良的傢伙，眉毛真白啊．年紀並不那麼大，真有白眉毛的人啊？
  - **r3** talk(3) [趙雲] 그룹 1
    - `dialogue`
      > 趙雲: 文臣武將增多了，是件大好事．
  - **r4** talk(3) [諸葛亮] 그룹 1
    - `dialogue`
      > 諸葛亮: 主公，馬良加入我們陣營了，太好了．
  - **r5** talk(3) [關平] 그룹 1
    - `dialogue`
      > 關平: 據說馬良熟悉本地情況，一定能提出好建議．
  - **r6** talk(3) [伊籍] 그룹 1
    - `dialogue`
      > 伊籍: 馬良在這個地方是有名人物．兄弟都有才名，馬良最佳．因馬良眉毛是白的，所以人說馬氏五常，白眉最良．其弟馬謖也有才幹．
  - **r7** talk(3) [劉封] 그룹 1
    - `dialogue`
      > 劉封: 主公，怎麼辦呢？
  - **r8** talk(3) [馬良] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 馬良: 今後，請多關照．主公，荊州不光是江陵這塊地方．
      > 劉備: 怎麼說？
      > 馬良: 江陵南面的四郡是指零陵、武陵、桂陽、長沙．把它們變成自己的領土不好嗎？
      > 劉備: 嗯，從哪裡進攻好呢？
      > 馬良: 長沙有個叫黃忠的武將很難對付．先攻打零陵、武陵、桂陽，長沙放在最後再打為好．
    - `dialogue`
      > 諸葛亮: 按馬良所說，先攻打長沙以外的三個郡，最後攻打長沙．
      > 劉備: 三個郡同時進攻嗎？
      > 諸葛亮: 這好辦！主公先率領一軍，向零陵、武陵、桂陽的其中任何一個出征．張飛和趙雲各自打一個郡，而江陵由關羽留守．
      > 劉備: 那麼，關羽、張飛、趙雲和我分別行事．
      > 諸葛亮: 零陵、武陵、桂陽之中，請您挑選所要進攻的一個郡．
    - `set_objective`
      > 做出征荊州南部的準備．
    - `leave_parallel` 
  - **r9** talk(3) [關羽] 그룹 2*
    - `dialogue`
      > 關羽: 兄長，請讓我守衛江陵．
  - **r10** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 大哥，快決定下來．我想去打仗．
  - **r11** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 主公，請從三個郡之中任選一個郡攻打．餘下的郡由張飛和我分擔．
  - **r12** talk(3) [馬良] 그룹 2
    - `dialogue`
      > 馬良: 如果依仗主公的威勢，攻克四個郡是很容易的．
  - **r13** talk(3) [關平] 그룹 2
    - `dialogue`
      > 關平: 下次的戰鬥請一定派我去．
  - **r14** talk(3) [伊籍] 그룹 2
    - `dialogue`
      > 伊籍: 馬良在這個地方是有名人物．兄弟都有才名，馬良最佳．因馬良眉毛是白的，所以人說馬氏五常，白眉最良．其弟馬謖也有才幹．
  - **r15** talk(3) [劉封] 그룹 2
    - `dialogue`
      > 劉封: 下次的戰鬥請一定派我去．
  - **r16** talk(3) [諸葛亮] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 準備好了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r17** run(0) 그룹 3
    - `play_music` song=12
    - `dialogue`
      > 諸葛亮: 出發了．
      > 張飛: 大哥，快決定攻打哪個郡．
      > 趙雲: 我們在主公之後出征．
    - `set_allegiance` person=關羽 army=14
    - `set_allegiance` person=張飛 army=14
    - `set_allegiance` person=趙雲 army=14
    - `load_map` map=4096
    - `play_music` song=11
    - `dialogue`
      > 劉度: 據說劉備軍要攻打零陵？嗯，怎麼辦……
    - `dialogue`
      > 金旋: 哼！劉備軍是對抗曹操的一班愚蠢之徒．武陵不能交出！
    - `dialogue`
      > 趙範: 哈……我不能背叛曹操．可是，桂陽軍也不能取勝．
    - `dialogue`
      > 韓玄: 哼！長沙有黃忠在！只要有黃忠，就沒有必要害怕劉備軍．
    - `play_music` song=3
    - `dialogue`
      > 劉備: 這是荊州南部的四郡嗎？
      > 諸葛亮: 是，馬良已說過，長沙有個叫黃忠的豪傑．長沙放在最後再打．主公，攻打哪個？
  - **r18** condition(1) 그룹 4*
    - `choice`
      > 攻打武陵
      > 攻打零陵
      > 攻打桂陽
  - **r19** run(0) 그룹 4
    - `dialogue`
      > 諸葛亮: 明白了，前往武陵．
    - `goto_block` block=9
  - **r20** run(0) 그룹 4
    - `dialogue`
      > 諸葛亮: 明白了，前往零陵．
    - `goto_block` block=8
  - **r21** run(0) 그룹 4
    - `dialogue`
      > 諸葛亮: 明白了，前往桂陽．
    - `goto_block` block=10
- **블록 8**: 전투; 레코드 10, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 31, 지도
  - 전투 설정: 턴 제한 35, 아군 출진 7명, 격파 대상 #175, 퇴각하면 패배 #0
  - 적군 명단: 15기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact, unit_in_area
  - 목표 문구: 一、劉度的毀滅． 二、敵軍投降．
  - r3 일기토
  - r3 레벨 +1: 關平
  - r5 아이템: 援隊書  
  - r9 (run) 전투 끝
  - r9 (run) → 블록 12
  - 플래그 켬: {77, 165}
  - 플래그 검사: {77, 165}
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 諸葛亮: 請編組隊伍．
    - `play_music` song=12
    - `battle_setup` 
    - `battle_roster` 
    - `load_map` map=12319
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、劉度的毀滅．
      > 二、敵軍投降．
    - `dialogue`
      > 劉度: 好像敵不過劉備．還是乘這個機會，乾脆投降劉備軍算了……
      > 劉賢: 父親，說什麼呀！劉備之流，我去殺死他們給你看．
      > 劉度: 嗯，但是……
      > 諸葛亮: 主公，敵人看見我軍或許就喪失了戰鬥意志．也可以巧妙地去說服．
    - `play_music` song=17
  - **r3** unit_contact(4) [關平] 그룹 3*
    - `dialogue`
      > 關平: 曹操從荊州走了．如果立即投降，可留條性命．
      > 邢道榮: 哈哈哈！想要零陵，就用你的實力奪取．還是害怕吧？！
      > 關平: 說什麼！說的話別忘了！
    - `duel` first=關平 second=邢道榮
    - `duel_begin` 
    - `dialogue`
      > 邢道榮: 什、什麼！這麼樣可……
      > 關平: 看我最後一刀！
    - `duel_action` person=關平 action=10
    - `dialogue`
      > 邢道榮: 哎呀，我不行了．
    - `duel_action` person=邢道榮 action=3
    - `duel_action` person=關平 action=9
    - `duel_action` person=關平 action=5
    - `dialogue`
      > 關平: 哼，口出狂言的傢伙．
    - `duel_end` 
    - `add_levels` person=關平 levels=1
    - `caption`
      > 關平的等級提高了！
  - **r4** turn(9) 그룹 3
  - **r5** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=援隊書  
    - `set_flag` flag=165 clear=0
  - **r6** unit_in_area(11) [(any unit)] 그룹 3
    - `if_flags` 
    - `dialogue`
      > 劉賢: 邢道榮，該出征了．
      > 劉備: 嗯？
    - `join_battle` person=邢道榮
    - `join_battle` person=猛獸師
    - `join_battle` person=猛獸師
    - `join_battle` person=異民族
    - `caption`
      > 敵人的另一路軍出現了！
    - `dialogue`
      > 邢道榮: 好漢們！打死劉備這傢伙．
      > 劉賢: 父親！怎麼樣？我的戰術如何？
      > 劉度: 嗯……好極了……
    - `set_flag` flag=77 clear=0
  - **r7** unit_contact(4) [劉備] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 劉備: 劉度，再打下去也不會有勝利的希望．怎麼樣，投降吧！
      > 劉度: 是，知道了．這塊領土奉送給你．
    - `data` kind=4 value=50
    - `narration`
      > 劉度投降了．劉備軍佔領了零陵．
    - `leave_parallel` 
  - **r8** battle_won(7) 그룹 3 — 그룹 넘김
    - `narration`
      > 劉備軍佔領了零陵．
    - `leave_parallel` 
  - **r9** run(0) 그룹 4
    - `play_music` song=7
    - `data` kind=2 value=1000
    - `caption`
      > 獲得黃金１０００！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 張飛: 打進去了！武陵攻破了！
    - `dialogue`
      > 趙雲: 攻克了桂陽！
    - `dialogue`
      > 諸葛亮: 主公，張飛攻下武陵、趙雲拿下桂陽．
      > 請一同回江陵，研究攻打長沙的計畫．
    - `goto_block` block=12
- **블록 9**: 전투; 레코드 13, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 30, 지도
  - 전투 설정: 턴 제한 35, 아군 출진 7명, 격파 대상 #180, 퇴각하면 패배 #0
  - 적군 명단: 15기
  - 트리거: battle_won, unit_at_cell, unit_contact, unit_defeated
  - 목표 문구: 一、金旋的毀滅． 二、敵軍投降．
  - r3 일기토
  - r3 레벨 +1: 周倉
  - r9 아이템: 發石車
  - r12 (run) 전투 끝
  - r12 소속: 鞏志 → 유비군(합류)
  - r12 (run) → 블록 12
  - 플래그 켬: {80, 81, 137, 141}
  - 플래그 검사: {80, 81, 137, 141}
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 諸葛亮: 請編組隊伍．
    - `play_music` song=12
    - `battle_setup` 
    - `battle_roster` 
    - `load_map` map=12318
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、金旋的毀滅．
      > 二、敵軍投降．
    - `dialogue`
      > 鞏志: 主公，聽說劉備很得民心，為謀求領土安泰，我想應該投降了．
      > 金旋: 你說什麼！你這傢伙和劉備勾結啊！
      > 鞏志: 不是．絕不是這樣的．
      > 金旋: 夠了！我要戰鬥到底！！
      > 諸葛亮: 主公，敵人中有看見我軍就喪失鬥志的人．也可以巧妙地進行說服．
    - `play_music` song=17
  - **r3** unit_contact(4) [周倉] 그룹 3* — 그룹 넘김
    - `dialogue`
      > 周倉: 那是敵人的頭目嗎？好，我要殺死他立功．
      > 金旋: 那是什麼？像是土匪．你以為像土匪那樣的人能勝得了我嗎？好，看看我的厲害！
    - `duel` first=周倉 second=金旋
    - `duel_action` person=周倉 action=8
    - `dialogue`
      > 金旋: 哎呀！
    - `duel_action` person=金旋 action=3
    - `duel_action` person=周倉 action=9
    - `duel_action` person=周倉 action=2
    - `dialogue`
      > 周倉: 打到了！殺死敵人的頭目了！
    - `duel_end` 
    - `add_levels` person=周倉 levels=1
    - `caption`
      > 周倉等級提高了！
    - `narration`
      > 　周倉殺死了金旋．
      > 　劉備軍佔領了武陵．
    - `leave_parallel` 
  - **r4** unit_contact(4) [(any unit)] 그룹 3
    - `if_flags` 
    - `dialogue`
      > 楊彥: 嗯……這是劉備軍的實力……真厲害．吳祖！求你幫我！
      > 吳祖: 真沒本事．好！全體，衝鋒！！
    - `set_flag` flag=141 clear=0
  - **r5** unit_contact(4) [(any unit)] 그룹 3
    - `if_flags` 
    - `dialogue`
      > 吳祖: 像你們這樣的還想打我嗎？哼！讓你們後悔莫及！！
      > 楊彥: 必須援助吳祖．好！全體，衝鋒！！
    - `set_flag` flag=141 clear=0
  - **r6** unit_defeated(12) [楊彥] 그룹 3
    - `if_flags` 
    - `caption`
      > 楊彥撤退了！
    - `if_flags` 
    - `dialogue`
      > 楊彥: 嗯……這是劉備軍的實力嗎？吳祖，以後的事靠你了！！
      > 吳祖: 簡直是個無能的傢伙．溜走了．全體，衝鋒！！
    - `set_flag` flag=141 clear=0
  - **r7** unit_defeated(12) [吳祖] 그룹 3
    - `if_flags` 
    - `caption`
      > 吳祖撤退了！
    - `if_flags` 
    - `dialogue`
      > 吳祖: 我，我也打不過……走為上策，哎呀，不好！！
      > 楊彥: 吳祖被打死了！？他媽的！全體，衝鋒！！
    - `set_flag` flag=141 clear=0
  - **r8** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `data` kind=2 value=500
    - `caption`
      > 獲得黃金５００！
    - `set_flag` flag=80 clear=0
  - **r9** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=發石車
    - `set_flag` flag=81 clear=0
  - **r10** unit_contact(4) [劉備] 그룹 3 — 그룹 넘김
    - `data` kind=4 value=50
    - `play_music` song=11
    - `dialogue`
      > 鞏志: 劉備，我以前是遵照金旋的命令行事的……這好像是我做錯事．這個武陵應歸劉備所有．請暫時等待一下．我去除掉這個害虫．
    - `dialogue`
      > 金旋: 這、這個鞏志！要幹什麼！喔！！
    - `dialogue`
      > 鞏志: 我殺死了金旋！我投降劉備！！
    - `narration`
      > 金旋被殺．劉備軍佔領了武陵．
    - `set_flag` flag=137 clear=0
    - `leave_parallel` 
  - **r11** battle_won(7) 그룹 3 — 그룹 넘김
    - `narration`
      > 劉備軍佔領了武陵．
    - `leave_parallel` 
  - **r12** run(0) 그룹 4
    - `play_music` song=7
    - `data` kind=2 value=1000
    - `caption`
      > 獲得黃金１０００！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `if_flags` 
    - `dialogue`
      > 鞏志: 劉備，今後我跟隨您．請多關照．
    - `caption`
      > 鞏志成為部下．
    - `set_allegiance` person=鞏志 army=0
    - `dialogue`
      > 張飛: 打進去了！攻陷了零陵！！
    - `dialogue`
      > 趙雲: 攻克了桂陽！
    - `dialogue`
      > 諸葛亮: 主公，張飛攻下了零陵、趙雲攻下了桂陽．
      > 請一同回江陵，研究攻打長沙的計畫．
    - `goto_block` block=12
- **블록 10**: 전투; 레코드 9, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 29
  - 전투 설정: 턴 제한 35, 아군 출진 7명, 격파 대상 #178, 퇴각하면 패배 #0
  - 적군 명단: 16기
  - 트리거: battle_won, unit_at_cell, unit_contact, unit_in_area
  - 목표 문구: 一、趙範的毀滅． 二、敵軍投降．
  - r3 일기토
  - r3 레벨 +1: 劉封
  - r6 아이템: 濁流書  
  - r8 (run) 전투 끝
  - 플래그 켬: {142, 166}
  - 플래그 검사: {142, 166}
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 諸葛亮: 請編組隊伍．
    - `play_music` song=12
    - `battle_setup` 
    - `battle_roster` 
    - `load_map` map=12317
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、趙範的毀滅．
      > 二、敵軍投降．
    - `dialogue`
      > 趙範: 無論如何也敵不過劉備軍，乾脆投降算了……
      > 陳應: 主公，說什麼！
      > 鮑龍: 是的！劉備之流，我殺給你看！
      > 趙範: 嗯……但是……
      > 諸葛亮: 主公，或許敵人看見了我軍就喪失了鬥志．也許經說服，可不戰而勝．
    - `play_music` song=17
  - **r3** unit_contact(4) [劉封] 그룹 3*
    - `dialogue`
      > 劉封: 敵將在哪！劉封來挑戰！
      > 鮑龍: 混蛋．劉備軍別自鳴得意！我來對付！
    - `duel` first=劉封 second=鮑龍
    - `duel_begin` 
    - `dialogue`
      > 鮑龍: 有空檔！
    - `duel_action` person=鮑龍 action=1
    - `duel_action` person=劉封 action=10
    - `dialogue`
      > 鮑龍: 完了，完了……我完了……
    - `duel_action` person=鮑龍 action=3
    - `duel_action` person=劉封 action=9
    - `duel_action` person=劉封 action=5
    - `dialogue`
      > 劉封: 好，殺死了敵將！
    - `duel_end` 
    - `add_levels` person=劉封 levels=1
    - `caption`
      > 劉封的等級提高了！
  - **r4** unit_contact(4) [劉備] 그룹 3 — 그룹 넘김
    - `data` kind=4 value=50
    - `dialogue`
      > 劉備: 趙範，再打下去，你也沒有獲勝的希望．怎麼樣，投降吧！
      > 趙範: 是，明白了．這片領土奉送給你．
    - `play_music` song=7
    - `narration`
      > 趙范投降了．劉備軍佔領了桂陽．
    - `leave_parallel` 
  - **r5** battle_won(7) 그룹 3 — 그룹 넘김
    - `play_music` song=7
    - `narration`
      > 劉備軍佔領了桂陽．
    - `leave_parallel` 
  - **r6** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=濁流書  
    - `set_flag` flag=166 clear=0
  - **r7** unit_in_area(11) [(any unit)] 그룹 3
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 趙範: 嗯？那是？
    - `join_battle` person=異民族
    - `join_battle` person=異民族
    - `join_battle` person=異民族
    - `caption`
      > 異民族出現了！
    - `dialogue`
      > 陳應: 那是？主公！請求的援軍來了．和他們通力合作，擊退劉備！
      > 趙範: 嗯．是啊……
    - `set_flag` flag=142 clear=0
    - `play_music` song=17
  - **r8** run(0) 그룹 4
    - `data` kind=2 value=1000
    - `caption`
      > 獲得黃金１０００！
    - `battle_end` next_map=4096
- **블록 11**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 지도
  - **r0** run(0) 그룹 0
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 張飛: 打進去了！攻破了武陵！
    - `dialogue`
      > 趙雲: 攻陷了零陵！
    - `dialogue`
      > 諸葛亮: 主公，張飛攻下了武陵，趙雲攻下了零陵，兩個城都打下來了．那麼，一同回江陵，研究攻打長沙的計畫．
- **블록 12**: 전투 준비; 레코드 17, 그룹 5; 대화 14(잡담 12); 맵: 마을 5, 지도
  - 전투 설정: 턴 제한 40, 아군 출진 11명, 격파 대상 #182, 퇴각하면 패배 #0
  - 목표 문구: 商量所剩長沙之事． / 做出征長沙的準備．
  - r0 소속: 關羽 → 유비군(합류)
  - r0 소속: 張飛 → 유비군(합류)
  - r0 소속: 趙雲 → 유비군(합류)
  - 질문 r15 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - **r0** run(0) 그룹 0
    - `load_map` map=8197
    - `set_previous_map` map=2 x=25 y=5
    - `play_music` song=5
    - `dialogue`
      > 馬良: 主公，佔領了三個郡，真是可喜可賀．
    - `set_allegiance` person=關羽 army=0
    - `set_allegiance` person=張飛 army=0
    - `set_allegiance` person=趙雲 army=0
    - `set_objective`
      > 商量所剩長沙之事．
  - **r1** run(0) 그룹 1
  - **r2** talk(3) [關羽] 그룹 2*
    - `dialogue`
      > 關羽: 主公，你回來了．
  - **r3** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 我來打的話，攻下一個或兩個城，如囊中取物．
  - **r4** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 在新的領地，人民都敬仰主公的聲望．
  - **r5** talk(3) [諸葛亮] 그룹 2
    - `dialogue`
      > 諸葛亮: 四個郡中，已佔領了三郡，就只剩下長沙．
  - **r6** talk(3) [關平] 그룹 2
    - `dialogue`
      > 關平: 已經佔領了三郡，可喜可賀．
  - **r7** talk(3) [劉封] 그룹 2
    - `dialogue`
      > 劉封: 還剩下一個，一旦攻破長沙，荊州全境就成為我們的啦．
  - **r8** talk(3) [馬良] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 馬良: 主公，佔領了三郡，可喜可賀．
      > 劉備: 嗯，後面只剩下長沙，此地如何攻打為好．
      > 馬良: 是呀，把它放在最後，就是因為以前聽說有個叫黃忠的武將，有百步穿楊之能，萬夫不擋之勇．
      > 劉備: 叫黃忠的嗎？
      > 馬良: 黃忠雖已年過六旬，但年輕人卻都抵擋不過．
      > 劉備: 嗯，真是這樣嗎？
      > 諸葛亮: 但是，攻克了此地，荊州全境將歸主公所有．為今後著想，長沙不可不攻．
      > 劉備: 嗯，是呀．出征！
      > 諸葛亮: 那麼，請主公做出征準備．
    - `set_objective`
      > 做出征長沙的準備．
    - `leave_parallel` 
  - **r9** talk(3) [關羽] 그룹 3*
    - `dialogue`
      > 關羽: 兄長，這次請交給我辦．一定把黃忠活捉回來給你們看．
  - **r10** talk(3) [張飛] 그룹 3
    - `dialogue`
      > 張飛: 關羽這傢伙，讓他留守好像委屈了他．有個請求，我也跟著去打．
  - **r11** talk(3) [趙雲] 그룹 3
    - `dialogue`
      > 趙雲: 趕快出征吧！
  - **r12** talk(3) [馬良] 그룹 3
    - `dialogue`
      > 馬良: 你可千萬要留神黃忠．
  - **r13** talk(3) [關平] 그룹 3
    - `dialogue`
      > 關平: 主公，快出征吧！
  - **r14** talk(3) [劉封] 그룹 3
    - `dialogue`
      > 劉封: 攻克長沙，荊州全境就是我們的．
  - **r15** talk(3) [諸葛亮] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 準備好了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r16** run(0) 그룹 4
    - `play_music` song=12
    - `dialogue`
      > 諸葛亮: 請編組隊伍．
    - `battle_setup` 
    - `dialogue`
      > 諸葛亮: 出征長沙．
    - `load_map` map=4096
    - `play_music` song=11
    - `dialogue`
      > 韓玄: 什麼？三個郡陷落了？這些傢伙太軟弱了．我這裡有黃忠．喂，黃忠！
      > 黃忠: 交給我辦，一定不辜負你的期望．
    - `play_music` song=3
    - `dialogue`
      > 劉備: 好！再攻克了長沙，荊州全境將歸我們所有！向長沙進發！
- **블록 13**: 전투; 레코드 11, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 32, 지도
  - 적군 명단: 19기
  - 트리거: battle_won, unit_at_cell, unit_contact, unit_in_area
  - 목표 문구: 一、韓玄的毀滅． 二、敵軍投降．
  - r3 아이템: 英雄之劍
  - r4 아이템: 劍術指南書
  - r9 일기토
  - r9 레벨 +1: 關羽
  - r10 (run) 전투 끝
  - 플래그 켬: {143, 144, 167, 168}
  - 플래그 검사: {143, 144, 167, 168}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12320
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、韓玄的毀滅．
      > 二、敵軍投降．
    - `dialogue`
      > 韓玄: 黃忠，劉備軍究竟怎麼樣，你去打一仗看看．我在這裡觀察戰況．
      > 黃忠: 是，交給我吧．我一定不辜負主公的期望．
      > 魏延: 因為受過韓玄的照顧，所以不得不出征．可是……我不想與劉備戰鬥．黃忠為什麼那麼忠誠於韓玄呢？韓玄是個昏君，卻……
    - `play_music` song=9
  - **r3** unit_at_cell(6) [(any unit)] 그룹 3*
    - `if_flags` 
    - `add_item` item=英雄之劍
    - `set_flag` flag=167 clear=0
  - **r4** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=劍術指南書
    - `set_flag` flag=168 clear=0
  - **r5** unit_in_area(11) [(any unit)] 그룹 3
    - `if_flags` 
    - `dialogue`
      > 劉備: 嗯？那個聲音是什麼？
      > 楊齡: 什麼？河水溢出了……是水計？該死！為什麼不對我說？
    - `caption`
      > 中了敵人的水計！
    - `halve` a=0 b=1
    - `dialogue`
      > 楊齡: 我，我……韓玄，你這個……
    - `dialogue`
      > 劉備: 連自己部隊的生死都不顧就……
      > 韓玄: 哈哈哈……劉備，你嘗到苦頭了吧！
      > 魏延: 韓玄，這是怎麼回事！連自己人都不管了嗎？
      > 韓玄: 什麼？我達到目的就行了，死幾個人有什麼？哈哈哈！
    - `halve` a=1 b=0
    - `set_flag` flag=143 clear=0
  - **r6** unit_in_area(11) [(any unit)] 그룹 3
    - `if_flags` 
    - `dialogue`
      > 魏延: 到底還是劉備軍，真厲害……
      > 韓玄: 哎呀！敵軍已經兵臨城下了．我軍在幹什麼？給我進攻！
    - `set_flag` flag=144 clear=0
  - **r7** unit_contact(4) [劉備] 그룹 3 — 그룹 넘김
    - `data` kind=4 value=50
    - `play_music` song=11
    - `dialogue`
      > 魏延: 嗯？那是……太好了，劉備大人？
      > 劉備: 呀？是誰？
      > 魏延: 劉備大人，我原是劉表的部下，名叫魏延．我的事情以後再談，現在我要去除掉藏在長沙的害人虫．再見！
    - `dialogue`
      > 韓玄: 什，什麼？魏延，你這個叛徒！
      > 魏延: 這不是背叛．這是憤怒的民眾對你的所作所為的回報．去死吧！
      > 韓玄: 啊！！
    - `dialogue`
      > 諸葛亮: 主公，敵人好像投降了．
    - `play_music` song=7
    - `narration`
      > 　韓玄被殺．劉備軍佔領了長沙．
    - `leave_parallel` 
  - **r8** battle_won(7) 그룹 3 — 그룹 넘김
    - `play_music` song=7
    - `narration`
      > 　劉備軍佔領了長沙．
    - `leave_parallel` 
  - **r9** unit_contact(4) [關羽] 그룹 3 — 그룹 넘김
    - `duel` first=關羽 second=黃忠
    - `dialogue`
      > 關羽: 嗯，這個老頭……不像等閒之輩．老頭，報上名來！
      > 黃忠: 匹夫！你休得無禮！我乃黃忠是也！
      > 關羽: 你就是黃忠？我關羽要與你單挑．
      > 黃忠: 嗯，你大概以為我老了就好欺負．年輕人，你打錯算盤了．去死吧！
    - `duel_begin` 
    - `dialogue`
      > 關羽: 打！
    - `duel_action` person=關羽 action=1
    - `duel_action` person=黃忠 action=3
    - `dialogue`
      > 黃忠: 哎呀！
      > 關羽: 怎麼？……戰馬失蹄了……
      > 黃忠: 真倒楣．這也是命嗎？快殺了我吧！
    - `dialogue`
      > 關羽: ……我且饒你性命．快去換馬繼續廝殺．
      > 黃忠: 什麼？太感謝你了，那我去換馬了．
    - `duel_end` 
    - `add_levels` person=關羽 levels=1
    - `caption`
      > 關羽等級上升了！
    - `dialogue`
      > 韓玄: 黃忠！你竟敢通敵！
      > 黃忠: 不要錯怪我．我絕不是那種人．
      > 韓玄: 住口！我看見你與關羽單挑，關羽不殺你反而把你放了回來，這不是通敵的證據是什麼？
      > 黃忠: 不．這……
      > 韓玄: 不聽你辯解！快把這傢伙的頭砍下來！
    - `dialogue`
      > 魏延: 韓玄！全然不記以前的功績，要殺黃忠，這不是君子所為．我要替天行道懲罰你！
      > 韓玄: 啊，魏延！把魏延殺了！快來人呀！啊……
    - `dialogue`
      > 諸葛亮: 主公，敵人好像投降了．
    - `play_music` song=7
    - `narration`
      > 　韓玄被殺．劉備軍佔領了長沙．
    - `leave_parallel` 
  - **r10** run(0) 그룹 4
    - `data` kind=2 value=1000
    - `caption`
      > 獲得黃金１０００！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 那就進長沙城吧．
- **블록 14**: 이야기; 레코드 10, 그룹 3; 대화 8(잡담 7); 맵: 마을 13, 마을 4
  - 트리거: location
  - 목표 문구: 和魏延談話 / 去官邸會見黃忠
  - r4 소속: 魏延 → 유비군(합류)
  - **r0** run(0) 그룹 0
    - `load_map` map=8196
    - `set_previous_map` map=6 x=28 y=5
    - `play_music` song=5
    - `caption`
      > 長沙議事廳
    - `dialogue`
      > 魏延: 劉備主公，我叫魏延．
    - `set_objective`
      > 和魏延談話
  - **r1** talk(3) [諸葛亮] 그룹 1*
    - `dialogue`
      > 諸葛亮: 主公，怎麼處置這個人？
  - **r2** talk(3) [關羽] 그룹 1
    - `dialogue`
      > 關羽: 黃忠儘管年老，但仍然武藝高強．
  - **r3** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 沒能和黃忠交手，真是件憾事．
  - **r4** talk(3) [魏延] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 魏延: 殘餘的長沙軍，向劉備大人投降了．從今以後，我也要為劉備效勞．
      > 諸葛亮: 主公，請等一下．
    - `dialogue`
      > 劉備: 孔明，怎麼了？
      > 諸葛亮: 我不贊成收這個人為部下．
      > 劉備: 為什麼？
      > 諸葛亮: 這個人以前曾為劉表效力過．
      > 魏延: ……是這樣的．
      > 諸葛亮: 劉表一死投向韓玄，現在看見韓玄出現危機，就馬上背叛舊主，改投主公，這樣的人，不知什麼時候就又會投靠別人？
      > 劉備: 可是，孔明，如果拒絕了想投降我的人，今後就沒有人向我投降了．不能這樣做．
      > 諸葛亮: ……我明白了，那麼您看著辦吧．
    - `dialogue`
      > 劉備: 魏延，別放在心上，我會好好對待你，今後要好好工作．
      > 魏延: ……是！是！
    - `caption`
      > 魏延成為部下！
    - `set_allegiance` person=魏延 army=0
    - `dialogue`
      > 劉備: 嗯……怎麼，一直沒見到黃忠？
      > 魏延: 黃忠聽說韓玄死訊後，一直待在家中，不出門見客．
    - `set_objective`
      > 去官邸會見黃忠
    - `leave_parallel` 
  - **r5** talk(3) [諸葛亮] 그룹 2*
    - `dialogue`
      > 諸葛亮: 主公既然有錄用魏延的意思，我沒有意見．
  - **r6** talk(3) [關羽] 그룹 2
    - `dialogue`
      > 關羽: 兄長，去拜訪黃忠吧．這樣的人才可不多見．
  - **r7** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 沒能和黃忠交手，真是件憾事．
  - **r8** talk(3) [魏延] 그룹 2
    - `dialogue`
      > 魏延: 黃忠聽說韓玄死訊後，一直待在家中，不出門見客．
  - **r9** location(2) 그룹 2 — 그룹 넘김
    - `load_map` map=8205
    - `caption`
      > 長沙黃忠家
    - `dialogue`
      > 黃忠: 我不是說了嗎，我誰也不見．
    - `leave_parallel` 
- **블록 15**: 이야기; 레코드 1, 그룹 1; 대화 1(잡담 0)
  - r0 소속: 黃忠 → 유비군(합류)
  - **r0** talk(3) [黃忠] 그룹 0
    - `dialogue`
      > 黃忠: 我說過了，什麼人都不想見．……啊，不像個傭人．
      > 劉備: 突然拜訪，我叫劉備．
      > 黃忠: 什麼？是劉備大人嗎？未曾遠迎，失禮．
      > 劉備: 黃忠，我很需要像你這樣的豪傑．怎麼樣？加入我們軍隊吧．
      > 黃忠: ……我被處死也是應該的，您親自來說……知道了，我黃忠願意為您效勞．
    - `caption`
      > 黃忠成為部下！
    - `set_allegiance` person=黃忠 army=0
    - `dialogue`
      > 劉備: 太好了．那就一起去江陵吧．
      > 黃忠: 是．
    - `play_music` song=8
    - `narration`
      > 　如此南部四郡就被劉備調兵遣將全部平定了．荊州經過一番迂迴曲折，終於成為劉備的領地．

### 장면 1

제목: 第三章　荊州所有權的糾紛

- **블록 0**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 마을 5
  - 목표 문구: 在議事廳商討今後
  - r0 삽화 19
  - **r0** run(0) 그룹 0
    - `play_music` song=0
    - `chapter_title` key=第三章　荊州所有權的糾紛
    - `title`
      > 第三章　荊州所有權的糾紛
    - `show_picture` picture=19 variant=0
    - `narration`
      > 　劉備剛占領南部四郡不久，劉琦就病死了．劉琦的死是荊州的出借期限．
      > 　當然，吳將要劉備歸還荊州．但是，孔明說服吳的使者魯肅接受荊州已從劉琦轉由劉備繼承的事實．
    - `narration`
      > 　這樣下去荊州將弄不到手了．於是周瑜設下美人計，以孫權的妹妹誘騙劉備來吳假結婚，扣住劉備，索要荊州．可是，在孔明和趙雲的策動下，這個計策以大失敗而告終，劉備娶到了孫權之妹為妻．
      > 　可是，吳和周瑜對荊州的野心還沒有破滅．
    - `load_map` map=8197
    - `set_previous_map` map=2 x=25 y=5
    - `play_music` song=5
    - `caption`
      > 江陵議事廳
    - `dialogue`
      > 諸葛亮: 主公，你來得正好．有個部下前來報告情況．
    - `set_objective`
      > 在議事廳商討今後
- **블록 1**: 이야기; 레코드 18, 그룹 3; 대화 18(잡담 15)
  - **r0** talk(3) [關羽] 그룹 0*
    - `dialogue`
      > 關羽: 聽說魯肅又來了．
  - **r1** talk(3) [張飛] 그룹 0
    - `dialogue`
      > 張飛: 但是，吳也太糾纏不休了．好像還沒有受夠教訓．
  - **r2** talk(3) [趙雲] 그룹 0
    - `dialogue`
      > 趙雲: 真是．周瑜想荊州想得入迷了．
  - **r3** talk(3) [馬良] 그룹 0
    - `dialogue`
      > 馬良: 荊州的土地肥沃，人民眾多．吳當然想得到了．
  - **r4** talk(3) [文官] 그룹 0
    - `dialogue`
      > 文官: 魯肅從吳來了．怎麼辦？
  - **r5** talk(3) [諸葛亮] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 主公，聽說魯肅來了．
      > 劉備: 又是為荊州的事吧．這次的來意是什麼？
      > 諸葛亮: 我有辦法．魯肅一提到荊州的事，主公您就哭．
      > 劉備: 哭？光哭行嗎？
      > 諸葛亮: 沒問題．主公哭一會，到了不可收拾的時候，我有良策．
    - `leave_parallel` 
  - **r6** talk(3) [諸葛亮] 그룹 1*
    - `dialogue`
      > 諸葛亮: 您只管哭就行了．那麼請魯肅進來．
  - **r7** talk(3) [關羽] 그룹 1
    - `dialogue`
      > 關羽: 軍師有什麼良策嗎？
  - **r8** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 讓吳斷了得到荊州的念頭．
  - **r9** talk(3) [趙雲] 그룹 1
    - `dialogue`
      > 趙雲: 請魯肅來吧．
  - **r10** talk(3) [馬良] 그룹 1
    - `dialogue`
      > 馬良: 荊州的土地肥沃，人民眾多．吳當然想得到了．
  - **r11** talk(3) [文官] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 劉備: 請魯肅進來．
      > 文官: 是．
    - `dialogue`
      > 魯肅: 劉備大人，好久不見了．
    - `leave_parallel` 
  - **r12** talk(3) [諸葛亮] 그룹 2*
    - `dialogue`
      > 諸葛亮: 與魯肅談談吧．
  - **r13** talk(3) [關羽] 그룹 2
    - `dialogue`
      > 關羽: 兄長，請與魯肅談話．
  - **r14** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 大哥，魯肅等著您呢．
  - **r15** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 主公，請與魯肅談談吧．
  - **r16** talk(3) [馬良] 그룹 2
    - `dialogue`
      > 馬良: 主公，請與魯肅談談吧．
  - **r17** talk(3) [魯肅] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 劉備: 您這次來有何貴幹？
      > 魯肅: 噢，這次來是受我主孫權的吩咐，專為荊州之事．出借荊州已經這麼長時間了，該還給我們了吧．
    - `leave_parallel` 
- **블록 2**: 이야기; 레코드 21, 그룹 5; 대화 5(잡담 4)
  - 트리거: condition
  - 선택지 r0: 「忽視」 r1 → 다시 물음(같은 블록); 「假裝不知」 r2 → 다시 물음(같은 블록); 「哭」 r3 → 진행
  - r1 (run) → 블록 2
  - r2 (run) → 블록 2
  - 선택지 r4: 「忽視」 r5 → 다시 물음(같은 블록); 「假裝不知」 r6 → 다시 물음(같은 블록); 「哭」 r7 → 진행
  - r5 (run) → 블록 2
  - r6 (run) → 블록 2
  - 선택지 r8: 「忽視」 r9 → 다시 물음(같은 블록); 「假裝不知」 r10 → 다시 물음(같은 블록); 「哭」 r11 → 진행
  - r9 (run) → 블록 2
  - r10 (run) → 블록 2
  - 선택지 r12: 「忽視」 r13 → 다시 물음(같은 블록); 「假裝不知」 r14 → 다시 물음(같은 블록); 「哭」 r15 → 진행
  - r13 (run) → 블록 2
  - r14 (run) → 블록 2
  - **r0** condition(1) 그룹 0*
    - `choice`
      > 忽視
      > 假裝不知
      > 哭
  - **r1** run(0) 그룹 0
    - `dialogue`
      > 劉備: ……
      > 魯肅: 劉備大人，事到如今，沈默也沒用．
    - `goto_block` block=2
  - **r2** run(0) 그룹 0
    - `dialogue`
      > 劉備: 您想說什麼？
      > 魯肅: 事到如今，沈默也沒用．劉備大人，請回答．
    - `goto_block` block=2
  - **r3** run(0) 그룹 0 — 그룹 넘김
    - `dialogue`
      > 劉備: 嗚嗚嗚……
      > 魯肅: 劉備大人，你怎麼了？
    - `leave_parallel` 
  - **r4** condition(1) 그룹 1*
    - `choice`
      > 忽視
      > 假裝不知
      > 哭
  - **r5** run(0) 그룹 1
    - `dialogue`
      > 劉備: ……
      > 魯肅: 劉備大人，事到如今，沈默也沒用．
    - `goto_block` block=2
  - **r6** run(0) 그룹 1
    - `dialogue`
      > 劉備: 您想說什麼？
      > 魯肅: 事到如今，沈默也沒用．劉備大人，請回答．
    - `goto_block` block=2
  - **r7** run(0) 그룹 1 — 그룹 넘김
    - `dialogue`
      > 劉備: 嗚嗚嗚……
      > 魯肅: 劉，劉備大人？是哭了嗎？劉備大人？
    - `leave_parallel` 
  - **r8** condition(1) 그룹 2*
    - `choice`
      > 忽視
      > 假裝不知
      > 哭
  - **r9** run(0) 그룹 2
    - `dialogue`
      > 劉備: ……
      > 魯肅: ……？什麼呀，是裝哭啊？你是說謊的騙子．
    - `goto_block` block=2
  - **r10** run(0) 그룹 2
    - `dialogue`
      > 劉備: 嗯……今天的飯不錯．
      > 魯肅: 劉備大人，你嚴肅些．
    - `goto_block` block=2
  - **r11** run(0) 그룹 2 — 그룹 넘김
    - `dialogue`
      > 劉備: 嗚嗚嗚……
      > 魯肅: 沒辦法．這可怎麼辦？
    - `leave_parallel` 
  - **r12** condition(1) 그룹 3*
    - `choice`
      > 忽視
      > 假裝不知
      > 哭
  - **r13** run(0) 그룹 3
    - `dialogue`
      > 劉備: ……
      > 魯肅: ……？什麼呀，是裝哭啊？你是說謊的騙子．
    - `goto_block` block=2
  - **r14** run(0) 그룹 3
    - `dialogue`
      > 劉備: 嗯……．今天的飯不錯．
      > 魯肅: 劉備大人，你嚴肅些．
    - `goto_block` block=2
  - **r15** run(0) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 劉備: 嗚嗚嗚……
      > 魯肅: 劉備大人，您怎麼了？為什麼要哭？
      > 諸葛亮: 我來解釋主公哭的原因．
    - `dialogue`
      > 魯肅: 他為什麼哭？
      > 諸葛亮: 主公本打算一得到益州，就把荊州還給你們．可是益州的劉璋是主公的同宗．進攻同宗對主公而言是痛苦的，因此就哭泣了．
    - `dialogue`
      > 劉備: 嗚嗚嗚……
      > 魯肅: ……說得也是．劉備大人的心情我非常理解．
      > 　那麼，這個方案怎麼樣？
      > 諸葛亮: 什麼方案？
      > 魯肅: 劉備大人不方便進攻劉璋，那我們去替你們拿下益州．只是……
      > 諸葛亮: 什麼？
      > 魯肅: 要進攻益州必須通過江陵．因此希望你們同意我們吳軍通過江陵．
      > 諸葛亮: 我明白了．如果你們替我們打益州，那當然可以通過江陵．我們隨時歡迎．
      > 魯肅: 謝謝．我回去與主公商量一下．劉備大人，告辭了．
    - `leave_parallel` 
  - **r16** talk(3) [關羽] 그룹 4*
    - `dialogue`
      > 關羽: 軍師認為怎樣？
  - **r17** talk(3) [張飛] 그룹 4
    - `dialogue`
      > 張飛: 我每回都想，軍師怎麼能猜中別人的心思呢？
  - **r18** talk(3) [趙雲] 그룹 4
    - `dialogue`
      > 趙雲: 軍師神機妙算．
  - **r19** talk(3) [馬良] 그룹 4
    - `dialogue`
      > 馬良: 吳軍替我們攻打益州，可信嗎？
  - **r20** talk(3) [諸葛亮] 그룹 4 — 그룹 넘김
    - `dialogue`
      > 劉備: 軍師，這件事你看怎樣？
      > 諸葛亮: 這是周瑜的計策．
      > 劉備: 周瑜的？
      > 諸葛亮: 是的．周瑜是想得到通過江陵的許可後，假裝借道，一舉攻占江陵．這是假道滅虢之計．
      > 劉備: 要是這樣該怎麼辦？
      > 諸葛亮: 這是個除掉周瑜的好機會．否則當我們攻打益州時，周瑜是個危險人物．主公，要做好出征準備．得到魯肅的報告後，周瑜會很快出動的．
    - `leave_parallel` 
- **블록 3**: 이야기; 레코드 2, 그룹 2; 대화 0(잡담 0); 맵: 마을 0, 마을 5, 지도
  - **r0** run(0) 그룹 0
    - `load_map` map=8192
    - `play_music` song=11
    - `caption`
      > 吳宮殿
    - `dialogue`
      > 魯肅: 我魯肅回來了．
      > 孫權: 嗯．那結果呢？
      > 魯肅: 劉備說在沒取得益州之前，不返還荊州．
      > 孫權: 什麼！劉備這小子，劉琦已經死了，怎麼不遵守諾言？
      > 魯肅: 您生氣是當然的．因此我對劉備說，周瑜都督願通過江陵，替他取益州．
      > 周瑜: 嗯．那孔明怎麼說的？
      > 魯肅: 孔明說，當然可以通過江陵．
      > 周瑜: 什麼！孔明是這麼說的！
    - `dialogue`
      > 周瑜: 魯肅，孔明真的允許咱們通過江陵嗎？
      > 魯肅: 是，他確實是這麼說的．
      > 周瑜: 太好了．這回騙過了孔明．
      > 孫權: 怎麼回事？我都糊塗了．
    - `dialogue`
      > 周瑜: 噢，我還沒對主公講呢．是這樣，……
    - `narration`
      > 　周瑜的假道滅虢之計已經被諸葛亮識破．周瑜是想假稱通過江陵取益州，趁劉備未防備之機，一舉攻克江陵．
    - `dialogue`
      > 孫權: 原來如此．劉備、諸葛亮已經中計了，還是周瑜足智多謀啊．
      > 周瑜: 那在孔明察覺前，趕緊行動吧．
      > 孫權: 那就全靠你了，周瑜．
      > 周瑜: 是．
    - `load_map` map=4096
    - `dialogue`
      > 周瑜: 快！不要給孔明思考的時間！
  - **r1** run(0) 그룹 1
    - `load_map` map=8197
    - `set_previous_map` map=2 x=25 y=5
    - `play_music` song=12
    - `caption`
      > 江陵議事廳
    - `narration`
      > 　然而，諸葛亮已經識破了周瑜的計謀，已經開始準備了．
    - `dialogue`
      > 諸葛亮: 主公，準備好了．
- **블록 4**: 전투 준비; 레코드 14, 그룹 3; 대화 13(잡담 11); 맵: 지도
  - 전투 설정: 턴 제한 40, 아군 출진 12명, 격파 대상 #142, 퇴각하면 패배 #0
  - 질문 r12 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - **r0** talk(3) [關羽] 그룹 0*
    - `dialogue`
      > 關羽: 真要和周瑜決戰了嗎？我們一定要戰勝他．
  - **r1** talk(3) [張飛] 그룹 0
    - `dialogue`
      > 張飛: 和吳軍戰鬥是一種樂趣．
  - **r2** talk(3) [趙雲] 그룹 0
    - `dialogue`
      > 趙雲: 荊州不能讓給周瑜．
  - **r3** talk(3) [黃忠] 그룹 0
    - `dialogue`
      > 黃忠: 我雖然歲數大了，也絕不會輸給年輕人．
  - **r4** talk(3) [魏延] 그룹 0
    - `dialogue`
      > 魏延: 這次戰役請一定帶我一起上陣．
  - **r5** talk(3) [諸葛亮] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 主公，周瑜理應已經出征了．已經派出了糜竺當使者，我們也準備吧．
    - `dialogue`
      > 糜竺: 主公，周瑜已經到達了公安．要求咱們去迎接．
      > 張飛: 真沒辦法．去出迎．
      > 諸葛亮: 好吧．請作出征準備．
    - `leave_parallel` 
  - **r6** talk(3) [關羽] 그룹 1*
    - `dialogue`
      > 關羽: 真要和周瑜決戰了嗎？我們一定要戰勝他．
  - **r7** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 和吳軍戰鬥是一種樂趣．
  - **r8** talk(3) [趙雲] 그룹 1
    - `dialogue`
      > 趙雲: 荊州不能讓給周瑜．
  - **r9** talk(3) [黃忠] 그룹 1
    - `dialogue`
      > 黃忠: 我雖然歲數大了，也絕不會輸給年輕人．
  - **r10** talk(3) [魏延] 그룹 1
    - `dialogue`
      > 魏延: 這次戰役請一定帶我一起上陣．
  - **r11** talk(3) [糜竺] 그룹 1
    - `dialogue`
      > 糜竺: 主公，周瑜已經到達了公安．要求咱們去迎接．
  - **r12** talk(3) [諸葛亮] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 出征嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r13** run(0) 그룹 2
    - `dialogue`
      > 諸葛亮: 請編組部隊．
    - `battle_setup` 
    - `dialogue`
      > 諸葛亮: 主公，那麼去公安迎接周瑜吧．
    - `load_map` map=4096
    - `play_music` song=3
- **블록 5**: 전투; 레코드 20, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 28
  - 적군 명단: 26기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact, unit_in_area
  - 목표 문구: 一、周瑜撤退． 二、佔領四個鹿砦． / 一、周瑜撤退． / 一、周瑜撤退．
  - r3 일기토
  - r3 레벨 +1: 關羽
  - r4 (unit_at_cell) → 블록 6
  - r5 (unit_at_cell) → 블록 6
  - r6 (unit_at_cell) → 블록 6
  - r7 (unit_at_cell) → 블록 6
  - r8 (battle_won) → 블록 6
  - r14 아이템: 鼓吹具
  - r15 아이템: 海嘯書  
  - r16 일기토
  - r16 레벨 +1: 關羽
  - r18 아이템: 鼓吹具
  - r19 아이템: 海嘯書  
  - 플래그 켬: {34, 35, 36, 37, 200, 201}
  - 플래그 검사: {34, 35, 36, 37, 200, 201}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12316
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、周瑜撤退．
      > 二、佔領四個鹿砦．
    - `dialogue`
      > 周瑜: 哼．你們看，劉備這個傻瓜來歡迎了．好不容易才騙過孔明．在劉備靠近之前，不許輕舉妄動．但是一旦靠近就發動總攻擊．明白了嗎？
      > 諸葛亮: 主公，周瑜不會從正面進攻的．趁此機會，占領四周的鹿砦．正好前面有森林，以此為屏障，悄悄轉移到鹿砦裡．
      > 劉備: 這麼辦好是好，可是為什麼呢？
      > 諸葛亮: 周瑜自以為計謀得逞，以為咱們沒有戒備．當他知道他的計謀早已被咱們識破時，他受到的震撼足以使他喪失鬥志．
      > 劉備: 我明白了，要占領四周的鹿砦．
      > 諸葛亮: 是的．但是我軍的行動必須要做到不被發覺，否則如果被吳軍發覺，行動就無意義了．所以到森林深處就不要前進了．
    - `play_music` song=14
  - **r3** unit_contact(4) [關羽] 그룹 3*
    - `dialogue`
      > 關羽: 我是關羽關雲長！誰能與我做對手？
      > 呂蒙: 關羽！我呂蒙來也！
      > 關羽: 你的膽子倒不小！看刀！
    - `duel` first=關羽 second=呂蒙
    - `duel_begin` 
    - `dialogue`
      > 關羽: 這傢伙不容易對付……
      > 呂蒙: ……看你以後還敢……
      > 關羽: 看這刀！別發呆．
    - `duel_begin` 
    - `dialogue`
      > 呂蒙: ……打不過，不愧是關羽．關羽，以後再見分曉．
    - `duel_action` person=呂蒙 action=4
    - `dialogue`
      > 關羽: 只有些小破綻，這傢伙不太好對付．以後再見吧．
    - `duel_end` 
    - `add_levels` person=關羽 levels=1
    - `caption`
      > 關羽等級上升了！
  - **r4** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `caption`
      > 劉備軍占領了西北鹿砦！
    - `set_flag` flag=34 clear=0
    - `if_flags` 
    - `data` kind=4 value=50
    - `play_music` song=12
    - `dialogue`
      > 諸葛亮: 嗯．佔領了全部鹿砦．那麼，向各砦武將下命令，讓他們大聲叫喊．
    - `dialogue`
      > 周瑜: 嗯？這是什麼聲音？
      > 甘寧: 周瑜都督，我們好像被包圍了，四面都是喊聲．怎麼辦？
      > 周瑜: 什麼？！又是孔明識破了我的計策！哇……
      > 甘寧: 都督，你怎麼啦？怎麼，流血了……
      > 都督，上次的傷口因激動而綻開了．
      > 周瑜: 不要管它，就這麼點……
      > 甘寧: 都督，你這身體可不能再指揮了．撤退吧，君子報仇十年不晚．
      > 周瑜: 嗯……那麼，甘寧，撤退的事就交給你了．哇……
      > 甘寧: 全軍撤退！
    - `narration`
      > 　周瑜軍撤退了．
    - `goto_block` block=6
  - **r5** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `caption`
      > 劉備占領了東北鹿砦！
    - `set_flag` flag=35 clear=0
    - `if_flags` 
    - `data` kind=4 value=50
    - `play_music` song=12
    - `dialogue`
      > 諸葛亮: 嗯．佔領了全部鹿砦．那麼，向各砦武將下命令，讓他們大聲叫喊．
    - `dialogue`
      > 周瑜: 嗯？這是什麼聲音？
      > 甘寧: 周瑜都督，我們好像被包圍了，四面都是喊聲．怎麼辦？
      > 周瑜: 什麼？！又是孔明識破了我的計策！哇……
      > 甘寧: 都督，你怎麼啦？怎麼，流血了……
      > 都督，上次的傷口因激動而綻開了．
      > 周瑜: 不要管它，就這麼點……
      > 甘寧: 都督，你這身體可不能再指揮了．撤退吧，君子報仇十年不晚．
      > 周瑜: 嗯……那麼，甘寧，撤退的事就交給你了．哇……
      > 甘寧: 全軍撤退！
    - `narration`
      > 　周瑜軍撤退了．
    - `goto_block` block=6
  - **r6** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `caption`
      > 劉備占領了西南鹿砦！
    - `set_flag` flag=36 clear=0
    - `if_flags` 
    - `data` kind=4 value=50
    - `play_music` song=12
    - `dialogue`
      > 諸葛亮: 嗯．佔領了全部鹿砦．那麼，向各砦武將下命令，讓他們大聲叫喊．
    - `dialogue`
      > 周瑜: 嗯？這是什麼聲音？
      > 甘寧: 周瑜都督，我們好像被包圍了，四面都是喊聲．怎麼辦？
      > 周瑜: 什麼？！又是孔明識破了我的計策！哇……
      > 甘寧: 都督，你怎麼啦？怎麼，流血了……
      > 都督，上次的傷口因激動而綻開了．
      > 周瑜: 不要管它，就這麼點……
      > 甘寧: 都督，你這身體可不能再指揮了．撤退吧，君子報仇十年不晚．
      > 周瑜: 嗯……那麼，甘寧，撤退的事就交給你了．哇……
      > 甘寧: 全軍撤退！
    - `narration`
      > 　周瑜軍撤退了．
    - `goto_block` block=6
  - **r7** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `caption`
      > 劉備占領了東南鹿砦！
    - `set_flag` flag=37 clear=0
    - `if_flags` 
    - `data` kind=4 value=50
    - `play_music` song=12
    - `dialogue`
      > 諸葛亮: 嗯．佔領了全部鹿砦．那麼，向各砦武將下命令，讓他們大聲叫喊．
    - `dialogue`
      > 周瑜: 嗯？這是什麼聲音？
      > 甘寧: 周瑜都督，我們好像被包圍了，四面都是喊聲．怎麼辦？
      > 周瑜: 什麼？！又是孔明識破了我的計策！哇……
      > 甘寧: 都督，你怎麼啦？怎麼，流血了……
      > 　都督，上次的傷口因激動而綻開了．
      > 周瑜: 不要管它，就這麼點……
      > 甘寧: 都督，你這身體可不能再指揮了．撤退吧，君子報仇十年不晚．
      > 周瑜: 嗯……那麼，甘寧，撤退的事就交給你了．哇……
      > 甘寧: 全軍撤退！
    - `narration`
      > 　周瑜軍撤退了．
    - `goto_block` block=6
  - **r8** battle_won(7) 그룹 3
    - `dialogue`
      > 周瑜: 孔明，劉備……你們……哇……
      > 甘寧: 都督！不要緊吧！
      > 周瑜: 可恨……撤……撤退……
      > 甘寧: 是！全軍立即撤退！
    - `narration`
      > 　周瑜軍撤退了．
    - `goto_block` block=6
  - **r9** unit_in_area(11) [(any unit)] 그룹 3 — 그룹 넘김
    - `play_music` song=11
    - `dialogue`
      > 周瑜: 哼！劉備軍發動進攻了嗎？孔明，到底讓你識破了，咱們戰場上見輸贏！全軍，向劉備軍進攻！
    - `join_battle` person=孫瑜
    - `join_battle` person=凌統
    - `join_battle` person=陸遜
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=武術家
    - `join_battle` person=弓兵隊
    - `join_battle` person=異民族
    - `join_battle` person=異民族
    - `caption`
      > 敵人援軍出現了！
    - `dialogue`
      > 孫瑜: 周瑜都督，我們來遲了．
      > 周瑜: 這不是孫瑜嗎？來增援我嗎？謝謝．
      > 孫瑜: 我帶援軍趕來了，一同來打垮劉備，奪回荊州！
    - `caption`
      > 周瑜軍轉入攻勢！
    - `play_music` song=14
    - `set_objective`
      > 一、周瑜撤退．
    - `leave_parallel` 
  - **r10** turn(9) 그룹 3
    - `dialogue`
      > 諸葛亮: 主公，據說以孫瑜為大將的敵方援軍正向這裡推進．這支援軍一到，周瑜就準備進攻．形勢對我軍很不利，趕緊占領鹿砦！
  - **r11** turn(9) 그룹 3
    - `dialogue`
      > 諸葛亮: 敵人的行動相當的快．孫瑜很快就要趕到了，要趕緊行動！
  - **r12** turn(9) 그룹 3
    - `dialogue`
      > 諸葛亮: 孫瑜馬上就要到了，主公，行動要快！
  - **r13** turn(9) 그룹 3 — 그룹 넘김
    - `play_music` song=11
    - `join_battle` person=孫瑜
    - `join_battle` person=凌統
    - `join_battle` person=陸遜
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=武術家
    - `join_battle` person=弓兵隊
    - `join_battle` person=異民族
    - `join_battle` person=異民族
    - `caption`
      > 敵方援軍出現了！
    - `dialogue`
      > 孫瑜: 周瑜都督，我們來遲了．
      > 周瑜: 這不是孫瑜嗎？來增援我嗎？謝謝．
      > 孫瑜: 我帶援軍趕來了，一同來打垮劉備，奪回荊州！
    - `caption`
      > 周瑜軍轉入攻勢！
    - `play_music` song=14
    - `set_objective`
      > 一、周瑜撤退．
    - `leave_parallel` 
  - **r14** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=鼓吹具
    - `set_flag` flag=200 clear=0
  - **r15** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=海嘯書  
    - `set_flag` flag=201 clear=0
  - **r16** unit_contact(4) [關羽] 그룹 4*
    - `dialogue`
      > 關羽: 我是關羽關雲長！誰能做我對手？
      > 呂蒙: 關羽！我呂蒙來也！
      > 關羽: 你的膽子倒不小！看刀！
    - `duel` first=關羽 second=呂蒙
    - `duel_begin` 
    - `dialogue`
      > 關羽: 這傢伙不容易對付……
      > 呂蒙: ……看你以後還敢……
      > 關羽: 看這刀！別發呆．
    - `duel_begin` 
    - `dialogue`
      > 呂蒙: ……打不過，不愧是關羽．關羽，以後再見分曉．
    - `duel_action` person=呂蒙 action=4
    - `dialogue`
      > 關羽: 只有些小破綻，這傢伙不太好對付．以後再見吧．
    - `duel_end` 
    - `add_levels` person=關羽 levels=1
    - `caption`
      > 關羽等級上升了！
  - **r17** battle_won(7) 그룹 4 — 그룹 넘김
    - `dialogue`
      > 周瑜: 孔明，劉備……你們……哇……
      > 甘寧: 都督！不要緊吧！
      > 周瑜: 可恨……撤……撤退……
      > 甘寧: 是！全軍立即撤退！
    - `narration`
      > 　周瑜軍撤退了．
    - `leave_parallel` 
  - **r18** unit_at_cell(6) [(any unit)] 그룹 4
    - `if_flags` 
    - `add_item` item=鼓吹具
    - `set_flag` flag=200 clear=0
  - **r19** unit_at_cell(6) [(any unit)] 그룹 4
    - `if_flags` 
    - `add_item` item=海嘯書  
    - `set_flag` flag=201 clear=0
- **블록 6**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 지도
  - r0 (run) 전투 끝
  - **r0** run(0) 그룹 0
    - `play_music` song=7
    - `data` kind=2 value=1100
    - `caption`
      > 得到黃金１１００！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 這下周瑜再也不敢挑釁了，那就回江陵吧．
- **블록 7**: 이야기; 레코드 18, 그룹 4; 대화 17(잡담 14); 맵: 마을 5
  - 목표 문구: 商討今後． / 在荊州尋找人才
  - **r0** run(0) 그룹 0
    - `load_map` map=8197
    - `set_previous_map` map=2 x=25 y=5
    - `play_music` song=5
    - `dialogue`
      > 諸葛亮: 主公，周瑜死了．可喜可賀．
    - `set_objective`
      > 商討今後．
  - **r1** talk(3) [關羽] 그룹 1*
    - `dialogue`
      > 關羽: 兄長，這樣荊州就完全是兄長的了．
  - **r2** talk(3) [馬良] 그룹 1
    - `dialogue`
      > 馬良: 荊州就可放心了．
  - **r3** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 吳也會記取教訓，暫時不敢來攻打吧．
  - **r4** talk(3) [趙雲] 그룹 1
    - `dialogue`
      > 趙雲: 荊州就可放心了．
  - **r5** talk(3) [諸葛亮] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 主公，為了給周瑜最後一擊，我已經給周瑜送信，這就會有結果的……來人了．
    - `dialogue`
      > 文官: 稟報主公．
    - `leave_parallel` 
  - **r6** talk(3) [關羽] 그룹 2*
    - `dialogue`
      > 關羽: 兄長，請聽一下報告．
  - **r7** talk(3) [馬良] 그룹 2
    - `dialogue`
      > 馬良: 暫且聽一下報告．
  - **r8** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 雖說把信送去了，可是結果會怎麼樣呢？我老想著這件事．
  - **r9** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 周瑜在與曹仁交戰時，肩部中箭受傷．據說箭傷還沒痊癒．
  - **r10** talk(3) [諸葛亮] 그룹 2
    - `dialogue`
      > 諸葛亮: 請聽一下結果如何．
  - **r11** talk(3) [文官] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 文官: 剛才接到探子報告，說周瑜死了．
    - `leave_parallel` 
  - **r12** talk(3) [關羽] 그룹 3*
    - `dialogue`
      > 關羽: 周瑜雖是強敵，也不能戰勝疾病．
  - **r13** talk(3) [馬良] 그룹 3
    - `dialogue`
      > 馬良: 作為敵人，是個可怕的對手．和吳的關係將會怎樣？
  - **r14** talk(3) [張飛] 그룹 3
    - `dialogue`
      > 張飛: 周瑜死了？要是這樣，吳國暫時不會攻打來了．
  - **r15** talk(3) [趙雲] 그룹 3
    - `dialogue`
      > 趙雲: 周瑜在與曹仁交戰時，肩部中箭受傷．據說箭傷還沒痊癒．
  - **r16** talk(3) [文官] 그룹 3
    - `dialogue`
      > 文官: 據說周瑜是大量出血死的．
  - **r17** talk(3) [諸葛亮] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 這是預料之中的事．主公，我想去吳吊唁周瑜．
      > 劉備: 啊．可是孔明，由於你的那封信，周瑜才死的．此行太危險了．吳國的武將都恨死你了．
      > 諸葛亮: 不會有事的．周瑜活著我都不怕，更何況他已經死了．只要趙雲跟我去就行了．
      > 劉備: 但是……
      > 諸葛亮: 這件事必須要辦．現在還不能與吳爭鬥．
      > 周瑜雖對我們懷有惡意，可是他的繼承人，我想是魯肅，對我們沒有惡意．應該利用這一點，保持與吳的關係，為此要赴吳國．
      > 劉備: 是這樣……
      > 諸葛亮: 另外我想利用這個機會，在吳國找尋人才．
      > 劉備: 找尋人才？
      > 諸葛亮: 是的．現在世上肯定有人才．我想去尋找．
      > 劉備: ……明白了．那孔明你要多保重．
      > 諸葛亮: 是．請主公在我回來前，也去尋訪人才．趙雲，咱們走．
      > 趙雲: 是．
    - `dialogue`
      > 關羽: 兄長，那就按軍師所說，我也去尋訪人才．
      > 馬良: 我也去．
      > 劉備: 那就辛苦你們了．
    - `set_objective`
      > 在荊州尋找人才
    - `leave_parallel` 
- **블록 8**: 이야기; 레코드 4, 그룹 1; 대화 1(잡담 0); 맵: 마을 5, 마을 7, 마을 8
  - 트리거: location
  - 목표 문구: 讓龐統成為部下
  - r1 (location) → 블록 9
  - r2 (location) → 블록 10
  - r3 (location) → 블록 11
  - 플래그 검사: {149, 150}
  - **r0** talk(3) [張飛] 그룹 0*
    - `dialogue`
      > 張飛: 找人才吧．不過大哥，人才在那裡？有目標嗎？
  - **r1** location(2) 그룹 0
    - `load_map` map=8200
    - `if_flags` 
    - `goto_block` block=9
  - **r2** location(2) 그룹 0
    - `load_map` map=8199
    - `if_flags` 
    - `goto_block` block=10
  - **r3** location(2) 그룹 0
    - `load_map` map=8197
    - `play_music` song=1
    - `dialogue`
      > 張飛: 大哥，有個叫龐統的來了．
    - `set_objective`
      > 讓龐統成為部下
    - `goto_block` block=11
- **블록 9**: 이야기; 레코드 4, 그룹 1; 대화 1(잡담 0); 맵: 마을 5, 마을 7, 마을 8
  - 트리거: location
  - 목표 문구: 讓龐統成為部下
  - r0 (talk) → 블록 9
  - 질문 r0 (蔣琬): 예 답이면 5 명령 실행 [set_allegiance, goto_block]
  - r0 소속: 蔣琬 → 유비군(합류)
  - r0 (talk) → 블록 9
  - r1 (location) → 블록 9
  - r2 (location) → 블록 10
  - r3 (location) → 블록 11
  - 플래그 켬: {149, 156}
  - 플래그 검사: {149, 150, 156}
  - **r0** talk(3) [蔣琬] 그룹 0*
    - `if_flags` 
    - `dialogue`
      > 蔣琬: 今後請多關照．過幾天我要去江陵．
    - `goto_block` block=9
    - `if_flags` 
    - `dialogue`
      > 劉備: 請問您尊姓大名？
      > 蔣琬: 您是問我嗎？我叫蔣琬．您是那位？
      > 劉備: 我叫劉備．
      > 蔣琬: 哦，您就是劉備啊．真沒想到是您，對不起．嗯，劉備大人，冒昧問一句，我能當您的部下嗎？我多少是有用之人．
    - `set_flag` flag=156 clear=0
    - `dialogue`
      > 蔣琬: 我能做您的部下嗎？
    - `if_answer` answer=0 skip=5
    - `dialogue`
      > 蔣琬: 喔，那就謝謝了．今後請多關照．
    - `caption`
      > 蔣琬成為部下！
    - `set_allegiance` person=蔣琬 army=0
    - `set_flag` flag=149 clear=0
    - `goto_block` block=9
    - `dialogue`
      > 蔣琬: 是嗎？……
  - **r1** location(2) 그룹 0
    - `load_map` map=8200
    - `if_flags` 
    - `goto_block` block=9
  - **r2** location(2) 그룹 0
    - `load_map` map=8199
    - `if_flags` 
    - `goto_block` block=10
  - **r3** location(2) 그룹 0
    - `load_map` map=8197
    - `play_music` song=1
    - `dialogue`
      > 張飛: 大哥，有個叫龐統的來了．
    - `set_objective`
      > 讓龐統成為部下
    - `goto_block` block=11
- **블록 10**: 이야기; 레코드 4, 그룹 1; 대화 1(잡담 0); 맵: 마을 5, 마을 7, 마을 8
  - 트리거: location
  - 목표 문구: 讓龐統成為部下
  - r0 (talk) → 블록 10
  - 질문 r0 (費禕): 예 답이면 5 명령 실행 [set_allegiance, goto_block]
  - r0 소속: 費禕 → 유비군(합류)
  - r0 (talk) → 블록 10
  - r1 (location) → 블록 9
  - r2 (location) → 블록 10
  - r3 (location) → 블록 11
  - 플래그 켬: {150, 157}
  - 플래그 검사: {149, 150, 157}
  - **r0** talk(3) [費禕] 그룹 0*
    - `if_flags` 
    - `dialogue`
      > 費禕: 今後請多關照．過幾天我要去江陵．
    - `goto_block` block=10
    - `if_flags` 
    - `dialogue`
      > 劉備: 請問您尊姓大名？
      > 費禕: 您是問我嗎？我叫費禕．您是那位？
      > 劉備: 我叫劉備．
      > 費禕: 哦，您就是劉備啊．真沒想到是您，對不起．嗯，劉備大人，冒昧問一句，我能當您的部下嗎？我多少是有用之人．
    - `set_flag` flag=157 clear=0
    - `dialogue`
      > 費禕: 我能做您的部下嗎？
    - `if_answer` answer=0 skip=5
    - `dialogue`
      > 費禕: 喔，那就謝謝了．今後請多關照．
    - `caption`
      > 費禕成為部下！
    - `set_allegiance` person=費禕 army=0
    - `set_flag` flag=150 clear=0
    - `goto_block` block=10
    - `dialogue`
      > 費禕: 是嗎？……
  - **r1** location(2) 그룹 0
    - `load_map` map=8200
    - `if_flags` 
    - `goto_block` block=9
  - **r2** location(2) 그룹 0
    - `load_map` map=8199
    - `if_flags` 
    - `goto_block` block=10
  - **r3** location(2) 그룹 0
    - `load_map` map=8197
    - `play_music` song=1
    - `dialogue`
      > 張飛: 大哥，有個叫龐統的來了．
    - `set_objective`
      > 讓龐統成為部下
    - `goto_block` block=11
- **블록 11**: 이야기; 레코드 12, 그룹 4; 대화 12(잡담 8); 맵: 마을 5, 지도
  - 목표 문구: 去耒陽縣視察情況
  - **r0** talk(3) [張飛] 그룹 0*
    - `dialogue`
      > 張飛: 怎麼，是個其貌不揚的傢伙．他究竟來幹什麼？
  - **r1** talk(3) [孫乾] 그룹 0
    - `dialogue`
      > 孫乾: 主公，暫且和來客談談吧．
  - **r2** talk(3) [龐統] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 龐統: 初次見面，我叫龐統．
      > 劉備: 您專程來到這裡，辛苦了．今天有什麼事嗎？
      > 龐統: 沒什麼事．我是來這裡謀職的．
      > 劉備: （要說龐統應該是水鏡先生所說的伏龍、鳳雛兩個人之一的鳳雛……）
      > （外貌可不像個奇才，是他嗎？真是個能與孔明相提並論的經綸濟世之才嗎？）
    - `leave_parallel` 
  - **r3** talk(3) [張飛] 그룹 1*
    - `dialogue`
      > 張飛: 怎麼是個連話都不想回答的人，這傢伙是真的了不起嗎？
  - **r4** talk(3) [龐統] 그룹 1
    - `dialogue`
      > 龐統: 要是沒什麼職位我就先告辭了．
      > 劉備: 請您等一下．
  - **r5** talk(3) [孫乾] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 孫乾: 我想起來了，耒陽縣的縣令有個空缺．
    - `leave_parallel` 
  - **r6** talk(3) [張飛] 그룹 2*
    - `dialogue`
      > 張飛: 怎麼是個連話都不想回答的人，這傢伙是真的了不起嗎？
  - **r7** talk(3) [孫乾] 그룹 2
    - `dialogue`
      > 孫乾: 耒陽縣是個小村子，居民很少．
  - **r8** talk(3) [龐統] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 劉備: 耒陽縣缺少一個縣令，您願意去那裡嗎？
      > 龐統: 啊，是嗎？知道了，那我就上任去了．
    - `redraw` 
    - `load_map` map=8197
    - `set_previous_map` map=2 x=25 y=5
    - `narration`
      > 　這以後又過了些日子……
    - `dialogue`
      > 文官: 稟報主公，有百姓報告說，耒陽縣縣令不做事．
    - `leave_parallel` 
  - **r9** talk(3) [孫乾] 그룹 3*
    - `dialogue`
      > 孫乾: 主公，我覺得最好調查一下這件事．
  - **r10** talk(3) [文官] 그룹 3
    - `dialogue`
      > 文官: 報告主公，有百姓報告說，耒陽縣縣令不做事．
  - **r11** talk(3) [張飛] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 張飛: 大哥，這傢伙果然是個腐儒，我去教訓教訓他．
      > 劉備: 三弟，你性子太急，還是跟我一起去吧．
      > 張飛: 那我先去耒陽縣吧．
    - `dialogue`
      > 孫乾: 那就視察去吧．
    - `load_map` map=4096
    - `dialogue`
      > 孫乾: 耒陽縣位於這裡的東北部．
    - `set_objective`
      > 去耒陽縣視察情況
    - `leave_parallel` 
- **블록 12**: 이야기; 레코드 14, 그룹 4; 대화 9(잡담 7); 맵: 0x000b, 마을 2
  - 트리거: campaign_location, location
  - 목표 문구: 到議事廳看審理情況
  - **r0** campaign_location(5) 그룹 0
    - `load_map` map=11
    - `play_music` song=1
    - `caption`
      > 耒陽縣
    - `dialogue`
      > 官差: 劉備大人，歡迎您來耒陽縣．聽張飛吩咐，特在這裡等候．
  - **r1** campaign_location(5) 그룹 1*
    - `load_map` map=11
    - `play_music` song=1
  - **r2** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 官差不願意對我說龐統的事．
  - **r3** talk(3) [孫乾] 그룹 1
    - `dialogue`
      > 孫乾: 主公，咱們先找到龐統，再聽聽他的解釋．
  - **r4** talk(3) [官差] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 劉備: 喂．龐統在那裡？是在辦公地點嗎？
      > 官差: 這……這個……
      > 劉備: 這……這個……你想說什麼？
      > 官差: 那個，這事很難啟齒．縣令上任以來，沒有處理過任何公務．
      > 張飛: 什麼？！
      > 官差: 哎呀！這不關我的事，再說這也是實情啊……
    - `dialogue`
      > 龐統: 這裡喧鬧什麼？怎麼了？
    - `dialogue`
      > 張飛: 這個傢伙！大哥，不管怎樣得教訓教訓他．
    - `leave_parallel` 
  - **r5** campaign_location(5) 그룹 2*
    - `load_map` map=11
    - `play_music` song=1
  - **r6** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 到這裡這麼長時間一件公務也未處理？這可不是鬧著玩．
  - **r7** talk(3) [孫乾] 그룹 2
    - `dialogue`
      > 孫乾: 到這裡一看，才知道官差所說的事是真的．
  - **r8** talk(3) [官差] 그룹 2
    - `dialogue`
      > 官差: 對，對不起！我沒有做到．
  - **r9** talk(3) [龐統] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 龐統: 這不是劉備大人嗎？什麼風把您給吹來了？
      > 劉備: 我聽說你自從上任以來，就不曾處理過公務，因此特來這裡查看．
      > 龐統: 哦，是為這事呀．沒錯，是這樣，來這裡後沒有處理過公務．
    - `dialogue`
      > 張飛: 你說什麼！大哥信任你才讓你作縣令，你怎麼能這樣怠忽職守呢？
      > 龐統: 怠忽職守？像這種鄉村的事務我馬上就可以處理完．現在就讓你們看看．
    - `dialogue`
      > 官差: 縣令，請等一下．
    - `set_objective`
      > 到議事廳看審理情況
    - `leave_parallel` 
  - **r10** campaign_location(5) 그룹 3*
    - `load_map` map=11
    - `play_music` song=1
  - **r11** talk(3) [張飛] 그룹 3
    - `dialogue`
      > 張飛: 大哥，咱們進去看看這個傢伙到底是個什麼貨色．
  - **r12** talk(3) [孫乾] 그룹 3
    - `dialogue`
      > 孫乾: 等看完結果再決定如何處罰他也不遲．
  - **r13** location(2) 그룹 3 — 그룹 넘김
    - `load_map` map=8194
    - `play_music` song=1
    - `caption`
      > 耒陽縣議事廳
    - `leave_parallel` 
- **블록 13**: 이야기; 레코드 5, 그룹 2; 대화 4(잡담 3)
  - r4 소속: 龐統 → 유비군(합류)
  - **r0** run(0) 그룹 0 — 그룹 넘김
    - `dialogue`
      > 龐統: 這位商人，你騙了這位農民，以貴３倍的價錢把鋤頭賣給了他．
      > 商人: 那有這麼回事．不是您聽錯了，就是有人在造謠．
    - `dialogue`
      > 農民: 你說什麼！是你的鄰居告訴我的，要不然我帶證人來．
    - `dialogue`
      > 商人: 什麼！你別找碴兒！
      > 龐統: 肅靜！你們兩人都給我安靜！
    - `dialogue`
      > 龐統: 農民，你過來．本官問你，這個鋤頭你用過了嗎？
      > 農民: 沒，我還沒用過．
      > 龐統: 那就好辦了．把這個鋤頭當作沒賣過，因為它還沒被使用過．農民把鋤頭還給商人，商人把農民付的錢還給他，就這樣．
    - `dialogue`
      > 商人: 那，那……
      > 龐統: 還有什麼要申辯的嗎？
      > 商人: 沒，沒有……
      > 龐統: 那麼這個案子就到此結束．你們兩個要服從判決，否則的話，要打一百個大板．你們下去吧．
      > 農民: 太謝謝了．
      > 商人: ……
    - `dialogue`
      > 張飛: 這個判決很通情達理嘛．
      > 孫乾: 而且也合乎道理．這樣誰也不會有意見．
    - `narration`
      > 　就這樣審判一個接一個地進行．
      > 　到了晚上，就已經把以前積壓的所有案件了結了．
    - `leave_parallel` 
  - **r1** talk(3) [張飛] 그룹 1*
    - `dialogue`
      > 張飛: 我以前從沒見過這樣乾脆利索的審判．
  - **r2** talk(3) [孫乾] 그룹 1
    - `dialogue`
      > 孫乾: 真是讓人驚訝．看來人不可貌相啊．
  - **r3** talk(3) [官差] 그룹 1
    - `dialogue`
      > 官差: 有這麼能幹的人，就沒什麼可擔心的了．
  - **r4** talk(3) [龐統] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 龐統: 劉備大人，怎麼樣？
      > 劉備: 您真是天下少見的奇才，我多有冒犯，失禮失禮．
      > 龐統: 沒有關係．噢，這裡有封信．
      > 劉備: ……？
    - `narration`
      > 信上寫道：
      > 『主公，龐統是能成大事之人，其才十倍於我．主公不可以貌取人，否則將失大賢．請務必收龐統為部下．
      > 　　　　　　　　　　　　　諸葛亮』
    - `dialogue`
      > 劉備: 這不是孔明的信嗎？
      > 龐統: 不錯．孔明來吳時，我碰巧見到了他．
      > 那時他說，一定要把此信交給劉備大人．
      > 劉備: 誤會誤會，為什麼當初你不把信給我呢？否則……
    - `dialogue`
      > 諸葛亮: 主公，你怎麼在這裡？咦，這不是龐統嗎？你怎麼也會在這裡？
      > 龐統: 劉備大人任命我為這裡的縣令．
    - `dialogue`
      > 諸葛亮: 這裡的縣令？你要是當了這裡的縣令，你就有很多時間玩了．主公，您怎麼會只讓龐統當個小小的縣令呢？我信裡不是對您說清楚了嗎？
      > 劉備: 我剛收到這封信．如果早收到，就不會有這種事了．
      > 諸葛亮: 我明白了．可是，把龐統任命為縣令是對人才的浪費．
      > 劉備: 是呀．那麼龐統，從今天起，你就是我的副軍師了．
      > 龐統: 真不敢當．那咱們回江陵吧．
    - `caption`
      > 龐統成為部下！
    - `set_allegiance` person=龐統 army=0
    - `play_music` song=8
    - `narration`
      > 　如此劉備軍的陣容更強大了．以前水鏡先生司馬徽曾對劉備說起過的伏龍（諸葛亮）和鳳雛
      > （龐統）都已經成了劉備的部下．
      > 　劉備大展鴻圖的時機終於到了．
    - `leave_parallel` 

### 장면 2

제목: 第三章　益州攻略戰

- **블록 0**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 마을 5
  - r0 삽화 20
  - r0 삽화 21
  - **r0** run(0) 그룹 0
    - `play_music` song=0
    - `chapter_title` key=第三章　益州攻略戰
    - `title`
      > 第三章　益州攻略戰
    - `show_picture` picture=20 variant=0
    - `narration`
      > 　就在龐統成為劉備部下的時候，曹操為了擴張領土，決定占領西北的被稱為西涼的地方．為此，他暗殺了統治這塊領土的馬騰．
      > 　可是，馬騰的長子馬超十分強悍．
      > 　馬超為了替父親報仇，大舉進攻曹操，兩人在渭水進行了決戰．起初，曹操處於劣勢，可是後來他利用反間計，從內部分裂了馬超軍．
      > 　馬超終於被曹操擊敗，全軍覆沒．
    - `narration`
      > 　馬超後來被迫逃奔漢中．
      > 　於是，曹操統一了中國北方．
    - `show_picture` picture=21 variant=0
    - `narration`
      > 　由於西涼發生的突變，統治著西涼南面的漢中張魯，為了能與曹操對抗，企圖占領位於本國南部的益州．
      > 　益州位於荊州的西部．諸葛亮曾進言劉備，奪取這塊土地．
    - `narration`
      > 　另一方面，益州的劉璋為了能抵禦漢中張魯的進攻，派遣張松為使者，請求曹操的援助．但是張松招致曹操的憤怒，而被驅逐出境．
      > 　於是張松來到了劉備的荊州．
    - `load_map` map=8197
- **블록 1**: 이야기; 레코드 14, 그룹 3; 대화 13(잡담 11)
  - 목표 문구: 會見張松 / 商討今後
  - **r0** run(0) 그룹 0
    - `set_previous_map` map=2 x=25 y=5
    - `play_music` song=5
    - `caption`
      > 江陵議事廳
    - `dialogue`
      > 諸葛亮: 主公，張松從益州來了．
      > 劉備: 從益州來？
      > 諸葛亮: 是的．和張松談談吧．
    - `dialogue`
      > 張松: 這位就是劉備大人嗎？我是益州來的張松．
    - `set_objective`
      > 會見張松
  - **r1** talk(3) [諸葛亮] 그룹 1*
    - `dialogue`
      > 諸葛亮: 和張松談談吧．
  - **r2** talk(3) [龐統] 그룹 1
    - `dialogue`
      > 龐統: 主公，要先招呼客人呀．
  - **r3** talk(3) [關羽] 그룹 1
    - `dialogue`
      > 關羽: 兄長，和張松談談吧．
  - **r4** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 大哥，要先招呼客人．
  - **r5** talk(3) [趙雲] 그룹 1
    - `dialogue`
      > 趙雲: 先與張松談談吧．
  - **r6** talk(3) [馬良] 그룹 1
    - `dialogue`
      > 馬良: 先接見張松吧．
  - **r7** talk(3) [張松] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 劉備: 歡迎歡迎，我是劉備．
      > 張松: 劉備大人，我今天來特有一事相求．
      > 劉備: 有什麼我可以幫忙的嗎？
      > 張松: 我們益州又被稱為蜀．益州現在被外敵所擾，那就是我國北方的漢中張魯．可是我家主公劉璋沒有治理益州的能力．
      > 張松: 我以使者為名前往曹操處，假稱乞求他的援助，實則欲把蜀國獻給他．可是到那裡後看清了他的本質，於是放棄了把國家交給他的打算．如果曹操統治益州，則百姓會永無寧日．
      > 劉備: 嗯……
      > 張松: 在回國的路上，我忽然想到了您，劉備大人．於是順道來到這裡．劉備大人，我願把益州獻給您，請不要辜負我的好意．
      > 劉備: 咦……怎麼突然說出這種話？
      > 張松: 是的，這就是我的來意．回國後，我馬上推薦您來對付漢中張魯．為此，您必須親赴益州，趁機奪取這個國家．
      > 劉備: 可是……，奪取同宗劉璋的基業……
      > 張松: 不要顧慮這些了，成大事者不拘小節．我先回去準備了．
    - `set_objective`
      > 商討今後
    - `leave_parallel` 
  - **r8** talk(3) [龐統] 그룹 2*
    - `dialogue`
      > 龐統: 主公，這不是很好的事嗎？這樣的好事一定要接受．
  - **r9** talk(3) [關羽] 그룹 2
    - `dialogue`
      > 關羽: 為了能與曹操抗衡，一定要得到益州．
  - **r10** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 大哥，這樣的好事錯過太可惜了．
  - **r11** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 如果我們不僅得到了荊州，而且得到了益州，就足以與曹操對抗了．
  - **r12** talk(3) [馬良] 그룹 2
    - `dialogue`
      > 馬良: 荊州確實是兵家用武之地，然而也容易被外敵窺伺．如果只有荊州……
  - **r13** talk(3) [諸葛亮] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 主公，為什麼不馬上答應呢？
      > 劉備: 即使要奪益州，難道沒別的辦法了嗎？
      > 諸葛亮: 劉璋的部下願意幫助，哪裡還有這樣好的機會？
      > 劉備: 可……
      > 諸葛亮: 張松說要推薦主公，咱們就等著益州的使者吧．
    - `leave_parallel` 
- **블록 2**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 마을 1
  - **r0** run(0) 그룹 0
    - `load_map` map=8193
    - `caption`
      > 成都宮殿
    - `narration`
      > 　這裡是益州的州都－成都．益州常被稱做蜀．
      > 　曹操的魏、孫權的吳、以及蜀，這三國鼎立之勢是諸葛亮的戰略－天下三分之計．
      > 　現在這個戰略正在步向實施．
    - `dialogue`
      > 張松: 我張松回來了．
      > 劉璋: 嗯，曹操怎麼回答的？他願不願意幫助我們抵禦漢中的張魯？
      > 張松: 曹操不會幫助我們的．我推薦近鄰荊州的劉備．
      > 劉璋: 是劉備嗎？聽說他有善戰的部下．好，向劉備請求援軍．
      > 張松: 使者由法正擔任最合適．
      > 劉璋: 那麼法正，你去劉備處請求援軍吧．
      > 法正: 是．
    - `dialogue`
      > 黃權: 主公，等等！
      > 劉璋: 怎麼啦？黃權．
      > 黃權: 不能讓劉備到益州來．如果他來的話，這個國家早晚會被他奪走的．
      > 張松: 不會發生這樣的事的．劉備與主公是同宗．再說，沒有援軍怎麼保衛國家？
      > 劉璋: 是這樣沒錯，黃權．此時只能懇求劉備．法正你去吧．我在雒城等候．
      > 法正: 是．
      > 黃權: 主公……
    - `redraw` 
- **블록 3**: 이야기; 레코드 15, 그룹 6; 대화 12(잡담 9); 맵: 마을 5, 지도
  - 목표 문구: 會見法正 / 商討今後
  - r13 소속: 關羽 → 무소속(이탈)
  - r13 소속: 張飛 → 무소속(이탈)
  - r13 소속: 趙雲 → 무소속(이탈)
  - r13 소속: 諸葛亮 → 무소속(이탈)
  - r13 소속: 伊籍 → 무소속(이탈)
  - r13 소속: 簡雍 → 무소속(이탈)
  - r13 소속: 法正 → 유비군(합류)
  - **r0** run(0) 그룹 0
    - `load_map` map=8197
    - `set_previous_map` map=2 x=26 y=5
    - `caption`
      > 江陵議事廳
    - `dialogue`
      > 法正: 劉備大人，初次見面．我叫法正，是張松的好友．
    - `set_objective`
      > 會見法正
  - **r1** talk(3) [諸葛亮] 그룹 1*
    - `dialogue`
      > 諸葛亮: 主公，和法正談談吧．
  - **r2** talk(3) [龐統] 그룹 1
    - `dialogue`
      > 龐統: 既然是張松的好友，那麼就是與張松有同樣想法的人吧．
  - **r3** talk(3) [法正] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 法正: 我想張松已經對您說了，劉璋黯弱，不能抵禦外敵．因此我們想把益州獻給劉備大人．
      > 劉備: 可是，劉璋與我是同宗，我不忍心奪劉璋的基業．
      > 法正: 劉璋的蜀國早晚會讓別人奪走．與其這樣，還不如獻給英主．而這個英主，我們認為就是您劉備．請您不要推辭．
      > 劉備: ……明白了．我想再與孔明和龐統商量一下．今天已經很晚了，您先去驛館休息吧．
      > 法正: 謝謝．
    - `dialogue`
      > 諸葛亮: 我來帶路吧．
    - `redraw` 
    - `set_objective`
      > 商討今後
    - `leave_parallel` 
  - **r4** talk(3) [龐統] 그룹 2
    - `dialogue`
      > 龐統: 主公，有這等好事，為何不行動呢？張松和法正已經把話說明了，您不認為這是天賜之物嗎？
      > 劉備: 嗯……
      > 龐統: 荊州經常被外敵窺伺，而益州四面環山，正是與曹操、孫權爭雄的好地方．
      > 劉備: 我平生最恨曹操．如果我討伐同宗的劉璋，不就與曹操一樣了嗎？
      > 龐統: 如今亂世，只拘泥於同宗就無法生存下去．您的想法只在太平時代行得通．主公，您應該有復興漢室的大志，如果忘了這一點而拘泥於小節，部下會離您而去的．
      > 劉備: ……你說得有道理，我明白了．我會把這些話牢記於心的．謝謝．
      > 龐統: 喔，既然已經下了決心，就集合部下吧．
  - **r5** run(0) 그룹 3
    - `load_map` map=8197
    - `set_previous_map` map=2 x=26 y=5
    - `play_music` song=12
    - `dialogue`
      > 龐統: 人都到齊了嗎？開會了．
  - **r6** talk(3) [龐統] 그룹 4*
    - `dialogue`
      > 龐統: 我要和主公去一趟益州．
  - **r7** talk(3) [關羽] 그룹 4
    - `dialogue`
      > 關羽: 益州是險要之地．要想攻取，必須先做好充分的準備．
  - **r8** talk(3) [張飛] 그룹 4
    - `dialogue`
      > 張飛: 大哥，帶我去打益州吧．
  - **r9** talk(3) [趙雲] 그룹 4
    - `dialogue`
      > 趙雲: 益州雖重要，但荊州也同樣重要，必須要留能征慣戰的武將把守．
  - **r10** talk(3) [黃忠] 그룹 4
    - `dialogue`
      > 黃忠: 主公，我雖然上了年紀，但武藝絲毫未減退．請一定要帶我去益州．
  - **r11** talk(3) [魏延] 그룹 4
    - `dialogue`
      > 魏延: 請務必讓我當先鋒．
  - **r12** talk(3) [馬良] 그룹 4
    - `dialogue`
      > 馬良: 聽從主公的調遣．
  - **r13** talk(3) [諸葛亮] 그룹 4 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 主公，我來守荊州吧．為此，請把關羽、張飛和趙雲留下．
      > 劉備: 好吧．那麼關羽等人留在荊州，伊籍和簡雍也留下．其餘的人跟我去益州．
      > 諸葛亮: 是．守衛荊州的任務交給我吧，我等候著好消息．
    - `set_allegiance` person=關羽 army=14
    - `set_allegiance` person=張飛 army=14
    - `set_allegiance` person=趙雲 army=14
    - `set_allegiance` person=諸葛亮 army=14
    - `set_allegiance` person=伊籍 army=14
    - `set_allegiance` person=簡雍 army=14
    - `dialogue`
      > 法正: 下決心了嗎？那麼就去雒城吧．劉璋正等著我們呢．今後，我也要為劉備大人效力，還要請您多關照．
    - `caption`
      > 法正成為部下！
    - `set_allegiance` person=法正 army=0
    - `leave_parallel` 
  - **r14** run(0) 그룹 5
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 法正: 那麼我帶路去雒城．
- **블록 4**: 이야기; 레코드 17, 그룹 4; 대화 14(잡담 13); 맵: 마을 1, 마을 2
  - 트리거: location
  - 목표 문구: 去涪城 / 商討今後
  - **r0** run(0) 그룹 0
    - `load_map` map=8194
    - `set_previous_map` map=9 x=26 y=6
    - `play_music` song=5
    - `caption`
      > 雒議事廳
    - `dialogue`
      > 法正: 我帶劉備來了．
      > 劉璋: 啊，劉備，我等你多時了．
  - **r1** talk(3) [黃權] 그룹 1*
    - `dialogue`
      > 黃權: 我叫黃權，我不想見到你．
  - **r2** talk(3) [法正] 그룹 1
    - `dialogue`
      > 法正: 劉備大人，請先問候我家主公．
  - **r3** talk(3) [鄧賢] 그룹 1
    - `dialogue`
      > 鄧賢: 哼！你不就是為了益州而來的嗎？
  - **r4** talk(3) [劉貴] 그룹 1
    - `dialogue`
      > 劉貴: 你最好不要在這惹事生非．蜀民可不好惹．
  - **r5** talk(3) [冷苞] 그룹 1
    - `dialogue`
      > 冷苞: 張魯來攻，我們並不怕．總之一句話，我國不需要外來者．
  - **r6** talk(3) [張任] 그룹 1
    - `dialogue`
      > 張任: 遠道而來辛苦了．可是，你為什麼來此呢？
  - **r7** talk(3) [劉璋] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 劉璋: 劉備大人，雖然我的部下七嘴八舌，然而我還是相信你的．
      > 劉備: 我來了，您就放心吧．張魯那邊，由我去對付．
      > 劉璋: 那太感謝了．那麼，請您去北面的涪城整頓兵馬．
    - `set_objective`
      > 去涪城
    - `leave_parallel` 
  - **r8** talk(3) [法正] 그룹 2*
    - `dialogue`
      > 法正: 在這裡行動不自在．快去涪城吧．
  - **r9** talk(3) [鄧賢] 그룹 2
    - `dialogue`
      > 鄧賢: 哼！你不就是為了益州而來的嗎？
  - **r10** talk(3) [劉貴] 그룹 2
    - `dialogue`
      > 劉貴: 你最好不要在這惹事生非．蜀民可不好惹．
  - **r11** talk(3) [冷苞] 그룹 2
    - `dialogue`
      > 冷苞: 張魯來攻，我們並不怕．總之一句話，我國不需要外來者．
  - **r12** talk(3) [黃權] 그룹 2
    - `dialogue`
      > 黃權: 我們的敵人太多了．有外患，有內奸……
  - **r13** talk(3) [張任] 그룹 2
    - `dialogue`
      > 張任: 那就去打張魯吧．
  - **r14** talk(3) [劉璋] 그룹 2
    - `dialogue`
      > 劉璋: 那麼，請您去北面的涪城整頓兵馬．
  - **r15** location(2) 그룹 2 — 그룹 넘김
    - `load_map` map=8193
    - `play_music` song=11
    - `caption`
      > 成都宮殿
    - `narration`
      > 　劉備剛到達涪城，他們的密謀就被在成都的劉璋發覺了．
    - `dialogue`
      > 劉璋: 張松，臨死前你想說什麼？
      > 張松: 您為什麼要殺我？
      > 劉璋: 你還在裝傻！你酒後對你哥哥說，你已經把國家獻給了劉備，你哥哥已經將你告發了．你還說不知道！
      > 張松: ……！哥哥……你難道看不出我這樣做的理由嗎？
      > 劉璋: 來人！把這個叛徒斬首！
      > 張任: 是！
    - `dialogue`
      > 劉貴: 你這個叛徒該死！
      > 張松: 啊……！
    - `redraw` 
    - `leave_parallel` 
  - **r16** run(0) 그룹 3
    - `load_map` map=8194
    - `set_previous_map` map=10 x=26 y=6
    - `caption`
      > 涪城議事廳
    - `narration`
      > 　法正得知張松被殺的消息後，立刻向劉備報告．
    - `dialogue`
      > 法正: 劉備大人，張松被劉璋殺了．
      > 劉備: 什麼？這是真的嗎？
      > 法正: 總之，我們的計畫已經暴露了，怎麼辦？
    - `dialogue`
      > 龐統: 主公，快下決定吧．
    - `set_objective`
      > 商討今後
- **블록 5**: 전투 준비; 레코드 28, 그룹 5; 대화 27(잡담 23); 맵: 지도
  - 전투 설정: 턴 제한 30, 아군 출진 11명, 격파 대상 #193, 퇴각하면 패배 #0
  - 목표 문구: 做出征劉璋軍的準備
  - 질문 r26 (龐統): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - **r0** talk(3) [龐統] 그룹 0*
    - `dialogue`
      > 龐統: 主公，到了這個地步，請下決斷！攻打益州吧．
  - **r1** talk(3) [黃忠] 그룹 0
    - `dialogue`
      > 黃忠: 為了主公，我們百死不辭！
  - **r2** talk(3) [關平] 그룹 0
    - `dialogue`
      > 關平: 主公，一定要把益州拿下！
  - **r3** talk(3) [劉封] 그룹 0
    - `dialogue`
      > 劉封: 主公，如果能奪取益州，就有了與曹操抗衡的力量了．
  - **r4** talk(3) [法正] 그룹 0
    - `dialogue`
      > 法正: 劉備大人，請一定為張松報仇．不能讓張松死的沒有代價！
  - **r5** talk(3) [魏延] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 魏延: 主公，使者來了．
    - `dialogue`
      > 使者: 主公，我從荊州來，帶來了諸葛軍師的話，
    - `leave_parallel` 
  - **r6** talk(3) [龐統] 그룹 1*
    - `dialogue`
      > 龐統: 孔明想說什麼？主公，聽聽使者的話吧．
  - **r7** talk(3) [黃忠] 그룹 1
    - `dialogue`
      > 黃忠: 軍師不知有什麼事．
  - **r8** talk(3) [魏延] 그룹 1
    - `dialogue`
      > 魏延: 先聽聽使者說什麼．
  - **r9** talk(3) [關平] 그룹 1
    - `dialogue`
      > 關平: 是軍師派來的使者嗎？怎麼回事？
  - **r10** talk(3) [劉封] 그룹 1
    - `dialogue`
      > 劉封: 是軍師派來的使者嗎？怎麼回事？
  - **r11** talk(3) [法正] 그룹 1
    - `dialogue`
      > 法正: 劉備大人，請一定要為張松報仇．不能讓張松死的無價值！
  - **r12** talk(3) [使者] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 使者: 孔明捎來的口信說，從星象看，主公不宜出行．
      > 出征的事要謹慎．
    - `leave_parallel` 
  - **r13** talk(3) [黃忠] 그룹 2*
    - `dialogue`
      > 黃忠: 星象？我真不能理解．
  - **r14** talk(3) [魏延] 그룹 2
    - `dialogue`
      > 魏延: 既然軍師這麼說，就不要出征了．
  - **r15** talk(3) [使者] 그룹 2
    - `dialogue`
      > 使者: 軍師是說，出征作戰最好等一下．
  - **r16** talk(3) [關平] 그룹 2
    - `dialogue`
      > 關平: 難道星象真那麼重要嗎？
  - **r17** talk(3) [劉封] 그룹 2
    - `dialogue`
      > 劉封: 我聽人說過，軍師會看星象．
  - **r18** talk(3) [法正] 그룹 2
    - `dialogue`
      > 法正: 劉備大人，請一定要為張松報仇．不能讓張松死的沒有價值！
  - **r19** talk(3) [龐統] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 劉備: 孔明這麼說，龐統你說該怎麼辦？
      > 龐統: ……我卜星象的結果並非不祥，反而是大吉之兆，不必理會這些．現在事已至此，逃回荊州是下策，進攻方為上策．
      > 劉備: 可是……
      > 龐統: 主公，咱們到這裡來幹什麼？不是來奪取益州的嗎？
      > 劉備: 嗯，明白了，出征！
      > 龐統: 您終於下了決心．聽說劉璋軍正在雒城集結．要想攻打下雒城，請主公作好準備．
    - `set_objective`
      > 做出征劉璋軍的準備
    - `leave_parallel` 
  - **r20** talk(3) [黃忠] 그룹 3*
    - `dialogue`
      > 黃忠: 既然決定出征，我聽從就是了．
  - **r21** talk(3) [魏延] 그룹 3
    - `dialogue`
      > 魏延: 出征吧．
  - **r22** talk(3) [使者] 그룹 3
    - `dialogue`
      > 使者: 那我告辭了．
  - **r23** talk(3) [關平] 그룹 3
    - `dialogue`
      > 關平: 主公，出征吧．
  - **r24** talk(3) [劉封] 그룹 3
    - `dialogue`
      > 劉封: 我也要加入戰鬥．
  - **r25** talk(3) [法正] 그룹 3
    - `dialogue`
      > 法正: 劉備大人，請一定要為張松報仇．不能讓張松死的沒有價值！
  - **r26** talk(3) [龐統] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 龐統: 做好準備了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r27** run(0) 그룹 4
    - `play_music` song=12
    - `dialogue`
      > 龐統: 請編組隊伍．
    - `battle_setup` 
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 龐統: 那麼向雒城進發．
- **블록 6**: 전투; 레코드 7, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 33, 지도
  - 적군 명단: 21기
  - 트리거: battle_won, turn, unit_defeated
  - 목표 문구: 一、劉貴的退卻 / 返回涪城
  - r6 (run) 전투 끝
  - 플래그 켬: {38}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12321
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、劉貴的退卻
    - `dialogue`
      > 劉貴: 劉備終於暴露了本性．原來，他還是想奪益州．
      > 吳懿: 是的．看張任的了．
      > 龐統: 主公，若攻下雒城，離成都就不遠了．請您引軍北上，吸引敵人主力．我趁虛而入，偷襲敵城．嗯……
    - `join_battle` person=張任
    - `join_battle` person=鄧賢
    - `join_battle` person=劉循
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=弓兵隊
    - `join_battle` person=賊兵
    - `join_battle` person=猛獸師
    - `caption`
      > 出現敵人伏兵！
    - `dialogue`
      > 張任: 果不出我所料．有敵軍企圖偷越山道．
      > 龐統: 啊……我的計策被識破了．
      > 黃忠: 副軍師！
      > 劉備: 如果沒有龐統，就不能奪得益州．全軍去營救副軍師！
    - `play_music` song=9
  - **r3** unit_defeated(12) [龐統] 그룹 3* — 그룹 넘김
    - `data` kind=4 value=50
    - `play_music` song=2
    - `dialogue`
      > 龐統: 我……我要死在這裡了嗎？……事業未成……我死不瞑目……
    - `caption`
      > 龐統戰死！
    - `set_flag` flag=38 clear=0
    - `dialogue`
      > 黃忠: ……主公，副軍師已經撤退了，我們也退回涪城吧．
      > 劉備: 嗯……那就撤退吧．……龐統，你怎麼樣了？……
    - `narration`
      > 　劉備放棄攻打雒城．
    - `set_country` person=龐統 country=14
    - `leave_parallel` 
  - **r4** turn(9) 그룹 3 — 그룹 넘김
    - `play_music` song=11
    - `dialogue`
      > 張任: ……快出來！
      > 劉備: 什麼！？敵人偷襲我軍軍糧．
      > 黃忠: 主公，這樣會使我軍陷入困境．我們先撤回涪城吧．
      > 劉備: 唉．也只好如此了．
      > 冷苞: 劉貴，敵人好像要撤退．
      > 劉貴: 喔．張任的第二個計謀好像成功了．張任這小子，真行！
    - `narration`
      > 　劉備軍軍糧已盡，撤退了．
    - `leave_parallel` 
  - **r5** battle_won(7) 그룹 3 — 그룹 넘김
    - `play_music` song=11
    - `dialogue`
      > 劉貴: 沒辦法，只有固守城池了．
      > 劉備: 嗯……敵人固守城池了．
      > 黃忠: 那就不好攻打了．我軍軍糧所剩無幾，先撤回涪城吧．
      > 劉備: 好吧．撤回涪城．
    - `narration`
      > 　劉備軍暫停進攻雒城．
    - `data` kind=2 value=1200
    - `caption`
      > 獲得黃金１２００！
    - `leave_parallel` 
  - **r6** run(0) 그룹 4
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `dialogue`
      > 黃忠: 那麼回涪城吧．
    - `set_objective`
      > 返回涪城
- **블록 7**: 이야기; 레코드 5, 그룹 2; 대화 4(잡담 3); 맵: 마을 2
  - 트리거: location
  - 목표 문구: 商討今後
  - r4 소속: 關平 → 무소속(이탈)
  - r4 소속: 周倉 → 무소속(이탈)
  - 플래그 검사: {38}
  - **r0** location(2) 그룹 0
    - `load_map` map=8194
    - `play_music` song=5
    - `if_flags` 
    - `dialogue`
      > 黃忠: 主公，副軍師因去陣地視察，因此不能到這裡來了．特向您致歉．
      > 劉備: 是嗎？剛才我嚇了一跳．萬一龐統有個閃失……
    - `if_flags` 
    - `play_music` song=2
    - `dialogue`
      > 劉備: 龐統怎麼樣了？平安無事吧．
    - `dialogue`
      > 劉封: ……遭到張任伏擊，全身中箭身亡……
      > 劉備: 什，什麼？劉封，消息確實嗎？
      > 劉封: 是……
      > 劉備: 怎麼會這樣！龐統……
    - `set_objective`
      > 商討今後
  - **r1** talk(3) [黃忠] 그룹 1*
    - `dialogue`
      > 黃忠: 主公，重整隊伍，進攻雒城吧，
  - **r2** talk(3) [魏延] 그룹 1
    - `dialogue`
      > 魏延: 話雖如此，可是益州兵比想像得厲害．
  - **r3** talk(3) [劉封] 그룹 1
    - `dialogue`
      > 劉封: 雒城是很難攻下的．
  - **r4** talk(3) [關平] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 關平: 主公，這事最好與孔明商量一下．
      > 劉備: 嗯．你說得不錯．那麼關平，你就辛苦一趟吧．
      > 關平: 好的．我馬上動身．
      > 劉備: 嗯……把周倉也帶去吧．
    - `dialogue`
      > 周倉: 是您叫我嗎？
    - `dialogue`
      > 劉備: 嗯．周倉，你和關平一起去趟江陵，請求孔明派遣援軍．
      > 周倉: 是．我們馬上出發．
      > 關平: 那我們告辭了．
    - `set_allegiance` person=關平 army=14
    - `set_allegiance` person=周倉 army=14
    - `leave_parallel` 
- **블록 8**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 마을 5
  - r0 소속: 張飛 → 유비군(합류)
  - **r0** run(0) 그룹 0
    - `load_map` map=8197
    - `play_music` song=12
    - `caption`
      > 江陵議事廳
    - `dialogue`
      > 關平: ……就是如此這般．軍師，有什麼好主意嗎？
      > 諸葛亮: 我立刻派援軍．嗯，關羽．還有關平、周倉留下，守衛荊州．
      > 關羽: 知道了．荊州就交給我吧．
      > 諸葛亮: 關羽，他們是你的部下，聽從你的調遣．
    - `dialogue`
      > 王甫: 我是王甫．聽從關羽將軍的吩咐．
    - `dialogue`
      > 廖化: 我是廖化．很高興在關羽手下工作．
    - `dialogue`
      > 趙累: 我叫趙累．請多關照．
    - `dialogue`
      > 關羽: 今後請你們多幫助．
    - `dialogue`
      > 諸葛亮: 那麼，張飛、趙雲，你們二人兵分兩路，入川支援主公．
      > 張飛: 知道了．
      > 趙雲: 明白了．
      > 諸葛亮: 那就盡快做好出征準備，趕快去支援．
    - `set_allegiance` person=張飛 army=0
- **블록 9**: 전투 준비; 레코드 21, 그룹 6; 대화 19(잡담 14); 맵: 마을 2, 지도
  - 전투 설정: 턴 제한 40, 아군 출진 13명, 격파 대상 #193, 퇴각하면 패배 #0
  - 목표 문구: 作出征雒城的準備
  - r14 소속: 嚴顏 → 유비군(합류)
  - 질문 r18 (龐統): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - 질문 r19 (黃忠): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - 플래그 검사: {38}
  - **r0** run(0) 그룹 0
    - `load_map` map=8194
    - `set_previous_map` map=10 x=26 y=6
    - `if_flags` 
    - `caption`
      > 涪城議事廳
    - `dialogue`
      > 武官: 報告大人，張飛的援軍到了．
  - **r1** talk(3) [龐統] 그룹 1*
    - `dialogue`
      > 龐統: 因為我沒有做好準備，就冒然進攻，竟落到如此結果．
  - **r2** talk(3) [黃忠] 그룹 1
    - `dialogue`
      > 黃忠: 好像是軍師很快採取措施了．
  - **r3** talk(3) [魏延] 그룹 1
    - `dialogue`
      > 魏延: 能這麼快地長驅直入，不愧是猛張飛呀．
  - **r4** talk(3) [武官] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 劉備: 快叫張飛來．
      > 武官: 是！
    - `dialogue`
      > 劉備: 來得真快呀！從荊州到蜀的這一路上都有蜀軍把守吧．
      > 黃忠: 是呀……哎，主公，張飛到了．
    - `dialogue`
      > 張飛: 大哥，我來了．
      > 劉備: 嗯，張飛，你可來了！你後面的人是誰？
      > 張飛: 這位是嚴顏，一路上多虧有他給我們帶路．
    - `leave_parallel` 
  - **r5** talk(3) [龐統] 그룹 2*
    - `dialogue`
      > 龐統: 張飛不但有勇，而且有謀，不愧是主公義弟呀！
  - **r6** talk(3) [黃忠] 그룹 2
    - `dialogue`
      > 黃忠: 是嚴顏嗎？看上去也是員老將．
  - **r7** talk(3) [魏延] 그룹 2
    - `dialogue`
      > 魏延: 黃忠和嚴顏真可謂老當益壯．
  - **r8** talk(3) [嚴顏] 그룹 2
    - `dialogue`
      > 嚴顏: 您好．我叫嚴顏．
  - **r9** talk(3) [張飛] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 張飛: 按照軍師的命令，軍師、趙雲和我分三路入川．在途中，我說服了守城的老將軍嚴顏．後來，嚴顏為我軍做嚮導，所以很快就到達了．
    - `leave_parallel` 
  - **r10** talk(3) [龐統] 그룹 3*
    - `dialogue`
      > 龐統: 張飛不但有勇，而且有謀，不愧是主公義弟呀！能說服敵人武將，不是只憑武力所能做到的．
  - **r11** talk(3) [黃忠] 그룹 3
    - `dialogue`
      > 黃忠: 是嚴顏嗎？看上去也是員老將．
  - **r12** talk(3) [魏延] 그룹 3
    - `dialogue`
      > 魏延: 黃忠和嚴顏真可謂老當益壯．
  - **r13** talk(3) [張飛] 그룹 3
    - `dialogue`
      > 張飛: 大哥，向嚴顏道謝吧．
  - **r14** talk(3) [嚴顏] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 劉備: 蒙您給張飛帶路，我劉備特向您道謝．
      > 嚴顏: 不，不敢當．您太客氣了．
      > 劉備: 今後，請全力支持．
      > 嚴顏: 那是當然，謝謝您讓我加入．
    - `caption`
      > 嚴顏成為部下！
    - `set_allegiance` person=嚴顏 army=0
    - `dialogue`
      > 嚴顏: 劉備主公，益州的武將，也就是我的同仁，也有為益州的前途擔憂的．如果向他們說清楚，我想會有向您投誠的．
      > 劉備: 太好了．還要請嚴顏多多協助．
      > 嚴顏: 是．我雖然歲數大了，但一定會盡全力的．
    - `set_objective`
      > 作出征雒城的準備
    - `leave_parallel` 
  - **r15** talk(3) [張飛] 그룹 4*
    - `dialogue`
      > 張飛: 大哥，我來了．您就放心吧．
  - **r16** talk(3) [魏延] 그룹 4
    - `dialogue`
      > 魏延: 援軍到了，該出征了．
  - **r17** talk(3) [嚴顏] 그룹 4
    - `dialogue`
      > 嚴顏: 我雖然歲數大了，但一定會盡力的．
  - **r18** talk(3) [龐統] 그룹 4 — 그룹 넘김
    - `dialogue`
      > 龐統: 那麼出征嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r19** talk(3) [黃忠] 그룹 4 — 그룹 넘김
    - `dialogue`
      > 黃忠: 那麼出征嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r20** run(0) 그룹 5
    - `dialogue`
      > 黃忠: 重編隊伍吧．
    - `battle_setup` 
    - `dialogue`
      > 黃忠: 這次一定要攻克雒城，
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 張飛: 雒城就在前面吧．大哥，快走！
- **블록 10**: 전투; 레코드 16, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 33
  - 적군 명단: 23기
  - 트리거: battle_won, turn, unit_contact, unit_in_area
  - 목표 문구: 一、劉貴的毀滅
  - r0 소속: 諸葛亮 → 유비군(합류)
  - r0 소속: 趙雲 → 유비군(합류)
  - r0 소속: 伊籍 → 유비군(합류)
  - r0 소속: 簡雍 → 유비군(합류)
  - r4 일기토
  - r4 레벨 +1: 張飛
  - r10 레벨 +1: 劉備
  - r11 레벨 +1: 劉備
  - r12 레벨 +1: 劉備
  - r13 레벨 +1: 劉備
  - r14 레벨 +1: 劉備
  - 플래그 켬: {39, 40, 41, 42, 43, 158, 161}
  - 플래그 검사: {39, 40, 41, 42, 43, 158, 161}
  - **r0** run(0) 그룹 0
    - `set_allegiance` person=諸葛亮 army=0
    - `set_allegiance` person=趙雲 army=0
    - `set_allegiance` person=伊籍 army=0
    - `set_allegiance` person=簡雍 army=0
  - **r1** run(0) 그룹 1
    - `battle_roster` 
    - `load_map` map=12321
  - **r2** run(0) 그룹 2
    - `begin_battle` 
  - **r3** run(0) 그룹 3
    - `play_music` song=11
    - `set_objective`
      > 一、劉貴的毀滅
    - `dialogue`
      > 劉貴: 劉備不顧打了敗仗，又打來了．各位，為了劉璋主公好好打！
      > 吳蘭: ……
      > 雷銅: 為了劉璋，唉……
    - `play_music` song=9
  - **r4** unit_contact(4) [張飛] 그룹 4*
    - `dialogue`
      > 張飛: 誰敢與我張飛交手？出來吧．
      > 張任: 什麼？是張飛？如果我能打敗張飛，會大大提高我軍士氣．好吧，張飛．我張任來與你交手．
      > 張飛: 張任？誰都行．過來吧．
    - `duel` first=張飛 second=張任
    - `duel_begin` 
    - `dialogue`
      > 張任: 好傢伙，真打不過他．
      > 張飛: 別在那裡發呆！
    - `duel_action` person=張飛 action=1
    - `duel_action` person=張任 action=2
    - `dialogue`
      > 張飛: 你不是我的對手．
      > 張任: ……你在幹什麼？快過來交手？
      > 張飛: 殺死你真是易如反掌．我說，劉璋大勢已去，你不如投降我們，勝於白白送死．
      > 張任: ……你在說什麼？想要我投降？不！我寧死不降．
      > 張飛: 你真是個忠臣，我了解你．那麼，我只有殺死你了！
      > 張任: 哎呀！
      > 張飛: ……哼！
    - `duel_action` person=張飛 action=7
    - `dialogue`
      > 張任: 殺死我吧……謝謝……
    - `duel_action` person=張任 action=3
    - `dialogue`
      > 張飛: ……真可惜．這小子是個武將！
    - `duel_end` 
    - `add_levels` person=張飛 levels=1
    - `caption`
      > 張飛等級上升了！
  - **r5** turn(9) 그룹 4
    - `dialogue`
      > 劉備: 不好……這次又要苦戰了．
      > 哎！那是誰？
    - `play_music` song=12
    - `join_battle` person=趙雲
    - `join_battle` person=伊籍
    - `join_battle` person=簡雍
    - `join_battle` person=諸葛亮
    - `dialogue`
      > 趙雲: 我是趙雲，支援您來了！諸位，跟我來！
      > 諸葛亮: 主公，我來遲了一步．我馬上來助戰！
      > 劉備: 噢！趙雲、孔明、伊籍、簡雍，你們都來了！
    - `play_music` song=9
  - **r6** turn(9) 그룹 4
    - `set_flag` flag=161 clear=0
  - **r7** turn(9) 그룹 4
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 趙雲: 那是……敵人援軍嗎？
    - `join_battle` person=楊懷
    - `join_battle` person=高沛
    - `join_battle` person=李嚴
    - `join_battle` person=費觀
    - `dialogue`
      > 楊懷: 劉備軍終於來了．諸位，為了蜀國，勇敢地戰鬥啊！
      > 高沛: 努力啊，我們趕到了！
      > 李嚴: ……這一戰有什麼意義呢？
      > 費觀: ……
    - `caption`
      > 敵人援軍出現！
    - `play_music` song=9
    - `set_flag` flag=158 clear=0
  - **r8** unit_in_area(11) [(any unit)] 그룹 4
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 趙雲: 那是……敵人援軍嗎？
    - `join_battle` person=楊懷
    - `join_battle` person=高沛
    - `join_battle` person=李嚴
    - `join_battle` person=費觀
    - `caption`
      > 敵人援軍出現！
    - `dialogue`
      > 楊懷: 劉備軍終於來了．諸位，為了蜀國，勇敢地戰鬥啊！
      > 高沛: 努力啊，我們趕到了！
      > 李嚴: ……這一戰有什麼意義呢？
      > 費觀: ……
    - `play_music` song=9
    - `set_flag` flag=158 clear=0
  - **r9** unit_in_area(11) [(any unit)] 그룹 4
    - `if_flags` 
    - `dialogue`
      > 劉貴: 什麼？部分敵人越過山道，逼近城池了？
      > 張任: 劉備這小子怎麼又來了……嗯！？
    - `join_battle` person=楊懷
    - `join_battle` person=高沛
    - `join_battle` person=李嚴
    - `join_battle` person=費觀
    - `dialogue`
      > 楊懷: 劉備軍終於來了．諸位，為了蜀國，勇敢地戰鬥啊！
      > 高沛: 努力啊，我們趕到了！
      > 李嚴: ……這一戰有什麼意義呢？
      > 費觀: ……
    - `caption`
      > 敵人援軍出現！
    - `play_music` song=9
    - `set_flag` flag=158 clear=0
  - **r10** unit_contact(4) [劉備] 그룹 4
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 劉備: 吳懿，連嚴顏都投降我們了，你又為什麼要白白流血呢？怎麼樣，投降我們吧？
      > 吳懿: ……明白了，我願為劉備效力．
    - `caption`
      > 吳懿成為部下！
    - `dialogue`
      > 吳懿: 不過，我不想跟以前的同伴交戰，我先撤退了．
    - `set_flag` flag=39 clear=0
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備等級上升了！
    - `play_music` song=9
  - **r11** unit_contact(4) [劉備] 그룹 4
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 劉備: 吳蘭，不想建設新益州嗎？與我們一起努力吧．
      > 吳蘭: ……有道理．聽說嚴顏也加入了……好吧，我願意加入你們．
    - `caption`
      > 吳蘭成為部下！
    - `set_country` person=吳蘭 country=0
    - `set_flag` flag=40 clear=0
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備等級上升了！
    - `play_music` song=9
  - **r12** unit_contact(4) [劉備] 그룹 4
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 劉備: 雷銅，我不是來這裡搶掠的．而是因為劉璋黯弱，不能抵禦曹操．怎麼樣，與我一起抵禦曹操好嗎？
      > 雷銅: 嗯，確實是這樣．劉璋不知何時就會被打垮，不如……好吧，我雷銅從今天起就是劉備的部下了．
    - `caption`
      > 雷銅成為部下！
    - `dialogue`
      > 雷銅: 不過，我不忍與過去的朋友交手，我先走了．
    - `set_flag` flag=41 clear=0
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備等級上升了！
    - `play_music` song=9
  - **r13** unit_contact(4) [劉備] 그룹 4
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 劉備: 李嚴，益州的歸屬已定，不如老老實實的投降，勝於白白送死．
      > 李嚴: 嗯……
      > 劉備: 怎麼樣？李嚴，協助我建設蜀國吧．
      > 李嚴: 建設蜀國？太好了，我願意投降．
    - `caption`
      > 李嚴成為部下！
    - `set_country` person=李嚴 country=0
    - `set_flag` flag=42 clear=0
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備等級上升了！
    - `play_music` song=9
  - **r14** unit_contact(4) [劉備] 그룹 4
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 劉備: 費觀，同嚴顏一樣，其他的武將都投降了．你投不投降？
      > 費觀: 說的不錯．連嚴顏都加入了你們，他是不會看錯人的．好吧，我投降．
    - `caption`
      > 費觀成為部下！
    - `dialogue`
      > 費觀: 那麼，打完仗再見．
    - `set_flag` flag=43 clear=0
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備等級上升了！
    - `play_music` song=9
  - **r15** battle_won(7) 그룹 4 — 그룹 넘김
    - `leave_parallel` 
- **블록 11**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 지도
  - 목표 문구: 在雒城商討今後
  - r0 (run) 전투 끝
  - r0 소속: 吳懿 → 유비군(합류)
  - r0 소속: 雷銅 → 유비군(합류)
  - r0 소속: 費觀 → 유비군(합류)
  - r0 소속: 諸葛亮 → 유비군(합류)
  - r0 소속: 趙雲 → 유비군(합류)
  - r0 소속: 伊籍 → 유비군(합류)
  - r0 소속: 簡雍 → 유비군(합류)
  - 플래그 검사: {39, 41, 43}
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 劉備: 好，城內幾乎沒有敵人了．各位，一鼓作氣攻陷雒城！
    - `play_music` song=7
    - `narration`
      > 　劉備軍占領了雒城．
    - `data` kind=2 value=1200
    - `caption`
      > 繳獲了１２００黃金！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 主公，該進雒城了．
    - `if_flags` 
    - `set_allegiance` person=吳懿 army=0
    - `if_flags` 
    - `set_allegiance` person=雷銅 army=0
    - `if_flags` 
    - `set_allegiance` person=費觀 army=0
    - `set_allegiance` person=諸葛亮 army=0
    - `set_allegiance` person=趙雲 army=0
    - `set_allegiance` person=伊籍 army=0
    - `set_allegiance` person=簡雍 army=0
    - `set_objective`
      > 在雒城商討今後
- **블록 12**: 이야기; 레코드 4, 그룹 4; 대화 0(잡담 0); 맵: 마을 1, 마을 17, 마을 2, 지도
  - 플래그 검사: {38}
  - **r0** run(0) 그룹 0
    - `load_map` map=8193
    - `play_music` song=11
    - `caption`
      > 成都宮殿
    - `dialogue`
      > 武官: 報告！我軍在雒城吃了大敗仗，主要將領全部陣亡！
      > 劉璋: 什麼！我沒有將軍了，怎麼辦才好呢？
      > 黃權: 當初，我苦勸您不要讓劉備入川，您不聽．現在……
      > 劉璋: 唉……該怎麼辦呢……
      > 黃權: 現在只有求助於張魯，請他派兵，進攻劉備的後方．
      > 劉璋: 可是我與張魯有世仇，他會答應嗎？
      > 黃權: 所以只有提出，如果張魯把劉備打敗，把蜀的一半割讓給他．這樣的話，張魯不會不派兵吧．
      > 劉璋: 唉，也只有如此了．快派人去！喂，你快去吧！
      > 武官: 是．
  - **r1** run(0) 그룹 1
    - `load_map` map=8209
    - `caption`
      > 漢中議事廳
    - `dialogue`
      > 武官: ……就是這樣，請張魯大人一定要同意．
      > 張魯: 我明白了．我要考慮一下，你先去休息吧．
      > 武官: 好的．
    - `dialogue`
      > 張魯: 怎麼辦？對劉璋採取什麼態度？
      > 張衛: 以前與我們打仗的事，您難道忘了嗎？
      > 楊松: 嗯．如果讓劉璋和劉備互相爭鬥，那就再好不過了．
      > 張魯: 是啊……
    - `dialogue`
      > 馬超: 張魯大人，聽說劉璋派人請求援軍是嗎？
      > 張魯: 不錯．我們正在考慮如何答覆．
      > 馬超: 如果出兵的話，請一定帶我一起上陣．
      > 遭曹操所敗投奔到此的我，受到這麼週到的照顧，因此我要報恩．
      > 張魯: 嗯……有馬超就放心了．好吧，我決定出兵！馬超，看你的了！
      > 馬超: 噢，太謝謝了．
  - **r2** run(0) 그룹 2
    - `load_map` map=4096
    - `dialogue`
      > 張魯: 好！那麼，向蜀國邊境上的葭萌關進發！
  - **r3** run(0) 그룹 3
    - `load_map` map=8194
    - `set_previous_map` map=9 x=26 y=6
    - `if_flags` 
    - `caption`
      > 雒議事廳
    - `dialogue`
      > 諸葛亮: 主公，祝賀您攻取雒城．使者來了．
- **블록 13**: 전투 준비; 레코드 22, 그룹 4; 대화 21(잡담 18); 맵: 지도
  - 전투 설정: 턴 제한 30, 아군 출진 10명, 격파 대상 #204, 퇴각하면 패배 #0
  - 목표 문구: 做出征張魯的準備．
  - r13 소속: 諸葛亮 → 무소속(이탈)
  - 질문 r20 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - **r0** talk(3) [諸葛亮] 그룹 0*
    - `dialogue`
      > 諸葛亮: 主公，先聽聽使者說什麼．
  - **r1** talk(3) [龐統] 그룹 0
    - `dialogue`
      > 龐統: 主公，先聽聽使者說什麼．
  - **r2** talk(3) [黃忠] 그룹 0
    - `dialogue`
      > 黃忠: 發生了什麼事？
  - **r3** talk(3) [魏延] 그룹 0
    - `dialogue`
      > 魏延: 主公，聽聽使者的匯報吧．
  - **r4** talk(3) [張飛] 그룹 0
    - `dialogue`
      > 張飛: 怎麼回事？這時候會有什麼事？
  - **r5** talk(3) [趙雲] 그룹 0
    - `dialogue`
      > 趙雲: 猜不出來發生了什麼事．還是先聽聽報告吧．
  - **r6** talk(3) [使者] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 使者: 主公，大事不好！益州北邊的漢中張魯，發兵攻打我們．
      > 劉備: 什麼！
      > 使者: 在張魯軍中，還有曾敗於曹操的西涼馬超．敵人已經開始攻打雒城北面的葭萌關！
      > 劉備: 聽說馬超在與曹操作戰時勢均力敵，是員勇將．
      > 使者: 是的．主公，怎麼辦？
    - `set_objective`
      > 做出征張魯的準備．
    - `leave_parallel` 
  - **r7** talk(3) [龐統] 그룹 1*
    - `dialogue`
      > 龐統: 果然來了．這大概是劉璋策劃的．
  - **r8** talk(3) [黃忠] 그룹 1
    - `dialogue`
      > 黃忠: 趕快制定對策．
  - **r9** talk(3) [魏延] 그룹 1
    - `dialogue`
      > 魏延: 馬上就要進攻蜀都了，又遇見了麻煩．
  - **r10** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 聽說馬超很厲害．大哥，務必帶我去．
  - **r11** talk(3) [趙雲] 그룹 1
    - `dialogue`
      > 趙雲: 徵求一下軍師的意見．
  - **r12** talk(3) [使者] 그룹 1
    - `dialogue`
      > 使者: 張魯軍人數不少．
  - **r13** talk(3) [諸葛亮] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 這是劉璋的策略．劉璋想讓張魯插入我背後，形成對我軍的夾擊．而且，有馬超在，對我軍是個威脅．因此必須迎擊張魯．
      > 劉備: 孔明，馬超真的這麼厲害嗎？
      > 諸葛亮: 是的．聽說曹操曾被馬超殺得割鬚棄袍，咱們不能小看他．
      > 劉備: 嗯……那就派援軍吧．可是，讓誰在這裡抗拒劉璋呢？
      > 諸葛亮: 那麼我留守在這裡吧．請主公親自率兵，對付張魯．請做好出征的準備．
    - `set_allegiance` person=諸葛亮 army=14
    - `leave_parallel` 
  - **r14** talk(3) [龐統] 그룹 2*
    - `dialogue`
      > 龐統: 主公，請做好準備．
  - **r15** talk(3) [黃忠] 그룹 2
    - `dialogue`
      > 黃忠: 聽說馬超是個武藝出眾的人．可是主公，沒人能打敗我．
  - **r16** talk(3) [魏延] 그룹 2
    - `dialogue`
      > 魏延: 馬上就要進攻蜀都了，又遇見了麻煩．
  - **r17** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 聽說馬超很厲害．大哥，一定要帶我去．
  - **r18** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 主公，請做好出征的準備．
  - **r19** talk(3) [使者] 그룹 2
    - `dialogue`
      > 使者: 張魯軍人數不少．
  - **r20** talk(3) [諸葛亮] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 主公，準備好了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r21** run(0) 그룹 3
    - `play_music` song=12
    - `battle_setup` 
    - `dialogue`
      > 諸葛亮: 那麼，早點出發吧．
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 劉備: 據說敵人在葭萌關．那麼趕快出發吧．
- **블록 14**: 전투; 레코드 8, 그룹 4; 대화 0(잡담 0); 맵: 전투 맵 37
  - 적군 명단: 20기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact, unit_in_area
  - 목표 문구: 一、張魯撤退
  - r3 아이템: 援軍報告
  - r6 일기토
  - r6 레벨 +1: 張飛
  - 플래그 켬: {169, 170}
  - 플래그 검사: {169, 170}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12325
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、張魯撤退
    - `dialogue`
      > 張魯: 那是劉備軍嗎？如果能打敗他，益州的一半就歸我了．各位，衝啊！
      > 劉備: 張魯後方被曹操牽制著，如果在此地擊退他，他就暫時不敢動了．好了，把張魯從葭萌關趕出去！
    - `play_music` song=13
  - **r3** unit_at_cell(6) [(any unit)] 그룹 3*
    - `if_flags` 
    - `add_item` item=援軍報告
    - `set_flag` flag=169 clear=0
  - **r4** turn(9) 그룹 3
  - **r5** unit_in_area(11) [(any unit)] 그룹 3
    - `if_flags` 
    - `dialogue`
      > 張魯: 馬超怎麼還不來？嗯，終於來了．
    - `play_music` song=11
    - `join_battle` person=馬超
    - `join_battle` person=馬岱
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `caption`
      > 馬超軍出現了！
    - `dialogue`
      > 馬超: 張魯好像陷入了苦戰．我要讓劉備知道知道我馬超的厲害！走，跟我來！
      > 劉備: 嗯？那就是馬超嗎？早就聽說他是員勇將，但究竟是何等人物啊……
    - `set_flag` flag=170 clear=0
  - **r6** unit_contact(4) [張飛] 그룹 3
    - `duel` first=張飛 second=馬超
    - `dialogue`
      > 馬超: 在那裡的看樣子是有名的武將，我是馬超，敵將通名！
      > 張飛: 我乃張飛是也！你就是馬超嗎？
      > 馬超: 張飛？沒聽說過．山野村夫我可沒聽過．
      > 張飛: 什麼？！你敢如此無禮！我要殺了你！
    - `duel_begin` 
    - `dialogue`
      > 張飛: 這，挺厲害．這小子還有兩下子．
      > 馬超: 他還挺能打．不過越是勇將，能殺死他越過癮．
    - `duel_begin` 
    - `dialogue`
      > 馬超: ……好了，今天就打到這裡，收兵！
      > 張飛: 什麼？你想逃跑嗎？
      > 馬超: 日後再分勝負吧！
    - `duel_action` person=馬超 action=4
    - `duel_end` 
    - `add_levels` person=張飛 levels=1
    - `caption`
      > 張飛等級上升了！
  - **r7** battle_won(7) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 張魯: 沒打贏，收兵吧！
    - `leave_parallel` 
- **블록 15**: 전투 준비; 레코드 30, 그룹 7; 대화 25(잡담 21); 맵: 마을 14, 마을 2, 지도
  - 전투 설정: 턴 제한 40, 아군 출진 9명, 격파 대상 #188, 퇴각하면 패배 #0
  - 트리거: condition
  - 목표 문구: 商討今後 / 做出征成都的準備
  - r0 (run) 전투 끝
  - r0 소속: 諸葛亮 → 유비군(합류)
  - r14 소속: 馬超 → 유비군(합류)
  - r14 소속: 馬岱 → 유비군(합류)
  - 질문 r22 (馬超): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - 선택지 r23: 「交給馬超辦」 r24 → 블록 17; 「不交給馬超辦」 r25 → 진행
  - r24 아이템: 黃爪飛龍
  - r24 (run) → 블록 17
  - 질문 r28 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - 플래그 검사: {38}
  - **r0** run(0) 그룹 0
    - `play_music` song=7
    - `narration`
      > 　張魯軍退卻．
    - `data` kind=2 value=1200
    - `caption`
      > 得到了１２００黃金．
    - `battle_end` next_map=4096
    - `load_map` map=8206
    - `if_flags` 
    - `play_music` song=5
    - `dialogue`
      > 諸葛亮: 主公，您辛苦了．
      > 劉備: 嗯？這不是孔明嗎？你怎麼來了？
      > 諸葛亮: 我不放心戰況，因此趕到這裡，想商量一下馬超的事．
    - `set_allegiance` person=諸葛亮 army=0
    - `set_objective`
      > 商討今後
  - **r1** talk(3) [龐統] 그룹 1*
    - `dialogue`
      > 龐統: 孔明來了．
  - **r2** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 大哥，軍師來了．
  - **r3** talk(3) [趙雲] 그룹 1
    - `dialogue`
      > 趙雲: 軍師來了，與他談談吧．
  - **r4** talk(3) [黃忠] 그룹 1
    - `dialogue`
      > 黃忠: 軍師駕到．
  - **r5** talk(3) [魏延] 그룹 1
    - `dialogue`
      > 魏延: 軍師駕到．
  - **r6** talk(3) [諸葛亮] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 聽說馬超是一員虎將．
      > 劉備: 是呀．成為敵手真可惜．
      > 諸葛亮: 那麼，我去說服他投降．
      > 劉備: 真的！行得通嗎？
      > 諸葛亮: 我想可以．馬超雖被張魯收留，但是得不到信任，如果我們利用這一點……
      > 劉備: 我明白了．孔明，祝你成功！
    - `narration`
      > 　諸葛亮看清了馬超只是被作為工具來使用的事實，著手說服馬超．
      > 　起初馬超不願投降，可是，當說到真正的敵人是曹操時，他心動了．馬超決定跟隨劉備．
    - `load_map` map=8206
    - `if_flags` 
    - `dialogue`
      > 諸葛亮: 主公，馬超來投降了．馬超，請進．
    - `dialogue`
      > 馬超: 我是馬超．我馬超和旁邊的馬岱，願意一起投效您，劉備．
    - `leave_parallel` 
  - **r7** talk(3) [諸葛亮] 그룹 2*
    - `dialogue`
      > 諸葛亮: 主公，馬超投降來了．
  - **r8** talk(3) [龐統] 그룹 2
    - `dialogue`
      > 龐統: 馬超可以成為我軍中少有的勇猛之將，從而大大增強我軍戰鬥力．
  - **r9** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 是個勇將，可以大增戰鬥力．
  - **r10** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 能這樣增強戰鬥力是一件大好事．
  - **r11** talk(3) [黃忠] 그룹 2
    - `dialogue`
      > 黃忠: 看上去，他還是個年輕人，我應該比他強．
  - **r12** talk(3) [魏延] 그룹 2
    - `dialogue`
      > 魏延: 我雖然也算強者，可是在劉備軍中，確實有不少勇將．
  - **r13** talk(3) [馬岱] 그룹 2
    - `dialogue`
      > 馬岱: 我是馬超的親戚，名叫馬岱．
  - **r14** talk(3) [馬超] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 劉備: 歡迎你，馬超．
      > 馬超: 您能原諒曾與您交戰的我，真是太感謝了．
      > 劉備: 沒什麼，都是過去的事了．不過今後你可要立功．
      > 馬超: 今後請多關照我和馬岱．
    - `caption`
      > 馬超和馬岱成為部下！
    - `set_allegiance` person=馬超 army=0
    - `set_allegiance` person=馬岱 army=0
    - `dialogue`
      > 馬超: 劉備主公，我願意去說服劉璋，作為歸順的見面禮．
      > 劉備: 勸說劉璋？
      > 馬超: 是的，就交給我吧．
      > 張魯也已經撤回漢中，劉璋已失去得力部下，我想一定能說服他．
    - `dialogue`
      > 劉備: 孔明，你怎麼看？
      > 諸葛亮: 馬超說的不錯，現在可以使劉璋不戰而降．不過，你要是想用武力征服他，也是可行的．
      > 劉備: 嗯……那怎麼辦呢？
    - `leave_parallel` 
  - **r15** talk(3) [諸葛亮] 그룹 3*
    - `dialogue`
      > 諸葛亮: 馬超說的不錯，現在可以使劉璋不戰而降．不過，你要是想用武力征服他，也是可行的．
  - **r16** talk(3) [龐統] 그룹 3
    - `dialogue`
      > 龐統: 劉璋已無戰鬥力．不論降伏還是打敗他，都不是件困難事．
  - **r17** talk(3) [張飛] 그룹 3
    - `dialogue`
      > 張飛: 我寧願選擇戰爭．
  - **r18** talk(3) [趙雲] 그룹 3
    - `dialogue`
      > 趙雲: 到底選擇那個，您看著辦吧．
  - **r19** talk(3) [黃忠] 그룹 3
    - `dialogue`
      > 黃忠: 我想戰．軍人就應該戰爭．
  - **r20** talk(3) [魏延] 그룹 3
    - `dialogue`
      > 魏延: 聽從主公的意願．
  - **r21** talk(3) [馬岱] 그룹 3
    - `dialogue`
      > 馬岱: 我們西涼人是馬上民族，與叫做羌族的異族有血緣關係．
  - **r22** talk(3) [馬超] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 馬超: 下決心了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r23** condition(1) 그룹 4*
    - `choice`
      > 交給馬超辦
      > 不交給馬超辦
  - **r24** run(0) 그룹 4
    - `dialogue`
      > 馬超: 啊！能得到批准，太感謝了．那我們就去成都了．馬岱，走吧．
      > 馬岱: 是．
    - `redraw` 
    - `load_map` map=4096
    - `dialogue`
      > 諸葛亮: 那麼主公，我們回雒城吧．
    - `narration`
      > 　馬超去說服劉璋．
      > 　劉璋已經既無戰鬥力，也無得力部下．
      > 　劉璋為了避免流血，接受了馬超的勸降．
    - `load_map` map=8194
    - `if_flags` 
    - `dialogue`
      > 馬超: 劉備主公，恭喜你！劉璋同意投降．
      > 劉備: 啊！太好了．
      > 馬超: 這是劉璋歸降的證據，我帶了過來，請收下吧．
    - `add_item` item=黃爪飛龍
    - `dialogue`
      > 馬超: 劉璋現在正在成都等候您，請速去成都．
      > 諸葛亮: 馬超，謝謝你．那麼主公，快去成都吧．
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 馬超: 劉璋在成都等候，快點走吧．
    - `goto_block` block=17
  - **r25** run(0) 그룹 4 — 그룹 넘김
    - `dialogue`
      > 馬超: 是嗎……那我願意為您在沙場上建立功勳．
    - `dialogue`
      > 諸葛亮: 據說劉璋據守成都．做好出征準備．
      > 張飛: 好．那麼大哥，我們先去做準備了．
      > 諸葛亮: 不必在這裡做準備，去涪城吧．
    - `load_map` map=8194
    - `set_previous_map` map=10 x=26 y=6
    - `play_music` song=12
    - `caption`
      > 涪城議事廳
    - `dialogue`
      > 諸葛亮: 主公，其他武將已經整裝待發，請您也做好準備．
    - `set_objective`
      > 做出征成都的準備
    - `leave_parallel` 
  - **r26** talk(3) [馬超] 그룹 5*
    - `dialogue`
      > 馬超: 馳騁疆場，建立功勳．
  - **r27** talk(3) [馬岱] 그룹 5
    - `dialogue`
      > 馬岱: 請多關照我和馬超．
  - **r28** talk(3) [諸葛亮] 그룹 5 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 準備好了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r29** run(0) 그룹 6
    - `play_music` song=12
    - `battle_setup` 
    - `dialogue`
      > 諸葛亮: 出征．
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 成都是在南方的大城市．向成都進發吧．
- **블록 16**: 전투; 레코드 14, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 34, 지도
  - 적군 명단: 22기
  - 트리거: battle_won, unit_at_cell, unit_contact
  - 목표 문구: 一、劉璋投降．
  - r3 레벨 +1: 劉備
  - r4 레벨 +1: 劉備
  - r5 레벨 +1: 劉備
  - r6 레벨 +1: 劉備
  - r7 레벨 +1: 劉備
  - r8 레벨 +1: 劉備
  - r9 아이템: 發石車
  - r10 아이템: 步兵車
  - r13 (run) 전투 끝
  - 플래그 켬: {44, 45, 46, 47, 48, 49, 202, 203}
  - 플래그 검사: {44, 45, 46, 47, 48, 49, 202, 203}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12322
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、劉璋投降．
    - `dialogue`
      > 劉璋: 劉備打過來了！各位，你們要好好保護我．
      > 孟達: 唉！劉璋還是不能護衛國家呀！
      > 法正: 劉備，在敵軍裡的孟達是我和張松的至友，請一定設法救出他．
      > 諸葛亮: 主公，敵人已經喪失了鬥志，如果能夠說明道理，敵將也許會歸降．
    - `play_music` song=14
  - **r3** unit_contact(4) [劉備] 그룹 3*
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 孟達: 您就是劉備嗎？我是張松和法正的至友，名叫孟達．我也想像他們那樣，做您的部下．
    - `caption`
      > 孟達成為部下！
    - `set_country` person=孟達 country=0
    - `set_flag` flag=44 clear=0
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備等級上升了！
    - `play_music` song=14
  - **r4** unit_contact(4) [劉備] 그룹 3
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 黃權: 劉璋不聽我的忠言，才落到今天這個境地．劉備大人，我相信你能挽救益州．
    - `caption`
      > 黃權成為部下！
    - `set_country` person=黃權 country=0
    - `set_flag` flag=45 clear=0
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備等級上升了！
    - `play_music` song=14
  - **r5** unit_contact(4) [劉備] 그룹 3
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 霍峻: 劉備大人，請收我做部下．
    - `caption`
      > 霍峻成為部下！
    - `set_country` person=霍峻 country=0
    - `set_flag` flag=46 clear=0
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備等級上升了！
    - `play_music` song=14
  - **r6** unit_contact(4) [劉備] 그룹 3
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 吳班: 劉備大人，我願做您的部下．
    - `caption`
      > 吳班成為部下！
    - `set_country` person=吳班 country=0
    - `set_flag` flag=47 clear=0
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備等級上升了！
    - `play_music` song=14
  - **r7** unit_contact(4) [劉備] 그룹 3
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 陳式: 我已經對劉璋失去了信心．劉備大人，請收下我做部下吧．
    - `caption`
      > 陳式成為部下！
    - `set_country` person=陳式 country=0
    - `set_flag` flag=48 clear=0
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備等級上升了！
    - `play_music` song=14
  - **r8** unit_contact(4) [劉備] 그룹 3
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 沙摩可: 我是劉璋用錢雇用來的．但是，劉璋已經不能再付我錢了．那樣的話，我與其戰死還不如歸降您．
    - `caption`
      > 沙摩可成為部下！
    - `set_country` person=沙摩可 country=0
    - `set_flag` flag=49 clear=0
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備等級上升了！
    - `play_music` song=14
  - **r9** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=發石車
    - `set_flag` flag=202 clear=0
  - **r10** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=步兵車
    - `set_flag` flag=203 clear=0
  - **r11** unit_contact(4) [劉備] 그룹 3 — 그룹 넘김
    - `data` kind=4 value=50
    - `leave_parallel` 
  - **r12** battle_won(7) 그룹 3 — 그룹 넘김
    - `leave_parallel` 
  - **r13** run(0) 그룹 4
    - `dialogue`
      > 劉璋: 唉……益州的武將和民眾都已經離開我了嗎？沒辦法，投降吧……
    - `play_music` song=7
    - `narration`
      > 　劉璋投降了，劉備軍占領了成都．
    - `data` kind=2 value=1200
    - `caption`
      > 得到了１２００黃金！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 那麼，就進成都吧．
- **블록 17**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 마을 1
  - 플래그 검사: {38}
  - **r0** run(0) 그룹 0
    - `load_map` map=8193
    - `if_flags` 
    - `play_music` song=5
    - `caption`
      > 成都宮殿
    - `dialogue`
      > 劉璋: 那麼，這是統治益州的證物印綬，請收下它吧．
      > 劉備: 嗯……，劉璋，我這樣做是為了與曹操鬥爭到底，恢復漢朝威嚴，我希望你能了解我．
      > 劉璋: 我很了解．
      > 諸葛亮: 那麼，劉璋，我已經在荊州為你準備了住處，請到那裡去住吧．
      > 劉璋: 好的．
    - `dialogue`
      > 劉備: 那麼今後益州由我劉備治理．諸位，你們要更加努力把國家建設好！
    - `play_music` song=8
    - `narration`
      > 　於是，劉備占領了益州．
      > 　劉備占領益州和荊州後，進而圖謀中原，再展鴻圖．

### 장면 3

제목: 第三章　漢中攻防戰

- **블록 0**: 이야기; 레코드 4, 그룹 4; 대화 0(잡담 0); 맵: 마을 0, 마을 17, 지도
  - r0 삽화 22
  - **r0** run(0) 그룹 0
    - `play_music` song=0
    - `chapter_title` key=第三章　漢中攻防戰
    - `title`
      > 第三章　漢中攻防戰
    - `show_picture` picture=22 variant=0
    - `narration`
      > 　曹操為了能對抗取得益州的劉備，決定先進攻漢中．曹操希望能先於劉備奪取漢中，並以此地為根據地，進攻劉備．
      > 　於是，開始實施進攻劉備的計畫．
    - `load_map` map=8192
    - `play_music` song=11
    - `caption`
      > 鄴城宮殿
    - `dialogue`
      > 曹操: 陛下，請給我們下達出擊的命令．
      > 獻帝: ……朕對這次戰爭不能……
      > 曹操: 啊？你說什麼？
      > 獻帝: ……
      > 曹操: 劉備窺伺許昌，企圖推翻我－陛下的忠臣，不是逆賊是什麼？現在我要興兵討逆，你為什麼不同意？
      > 獻帝: 劉備不會與朕作對！劉備也絕不是逆賊！真正的逆賊是……
      > 曹操: 陛下，你還有利用價值．我可以用你來給所有反對我的人戴上逆賊的臭名，就是這樣．可是假如是一個孩子已經玩膩了的玩具，他會怎樣對待它呢？你猜得出來嗎？
      > 獻帝: ……
      > 曹操: 陛下，你可不要做讓我不喜歡你的事呀．
      > 獻帝: ……那你看著辦吧．
      > 曹操: 哈哈哈！
    - `dialogue`
      > 曹操: 那麼，我替陛下向全軍下達出擊的命令．曹洪聽令！
      > 曹洪: 曹洪在！
    - `dialogue`
      > 曹操: 命你為漢中主將，指揮全軍，夏侯淵為副將，一定要把逆賊劉備殺死！
      > 曹洪: 是！遵命！
    - `dialogue`
      > 獻帝: 皇叔……對不起……
  - **r1** run(0) 그룹 1
    - `load_map` map=4096
    - `dialogue`
      > 曹洪: 好．在漢中召開軍事會議！
  - **r2** run(0) 그룹 2
    - `load_map` map=8209
    - `caption`
      > 漢中議事廳
    - `dialogue`
      > 曹洪: 諸位將軍，我要分派任務了．夏侯淵聽令！
      > 夏侯淵: 在！
    - `dialogue`
      > 曹洪: 夏侯淵，命你鎮守定軍山．此山位於蜀國邊境，是很重要的軍事陣地．
      > 夏侯淵: 明白了．那麼我走了．
      > 曹洪: 嗯．
    - `dialogue`
      > 曹洪: 夏侯德聽令！
      > 夏侯德: 在！
    - `dialogue`
      > 曹洪: 命你鎮守天蕩山，此處與定軍山一樣，都是邊境重地．
      > 夏侯德: 明白了！
    - `dialogue`
      > 曹洪: 其餘的人作為預備隊留守這裡．要注意觀察劉備的動向，隨時準備投入戰鬥．
    - `dialogue`
      > 張郃: 將軍，咱們就在這裡靜觀戰局嗎？
      > 曹洪: 是的．
      > 張郃: 那豈不是太消極了嗎？
      > 曹洪: 不，不能小看了劉備．是在這裡注意劉備軍的動向．
      > 張郃: ……那麼，請撥給我一支部隊，我當先鋒，進攻劉備．
      > 曹洪: 不！這樣可不行．要緊的是，這樣會脫離統率，不能冒昧行事．
      > 張郃: 將軍，你這樣說，是不是害怕劉備？
      > 曹洪: 什麼！張郃，在我面前，你不得無禮！……好吧，你既然這麼說，我答應你，給你一支部隊．不過，若是失敗，以軍法處置！
      > 張郃: 哈哈……那你就在此等著劉備的首級吧．再見．
  - **r3** run(0) 그룹 3
    - `load_map` map=4096
    - `dialogue`
      > 夏侯淵: 好啦，向定軍山進發！
      > 夏侯德: 咱們去天蕩山！前進！
    - `dialogue`
      > 張郃: 哼！劉備的情況，我以前在袁紹手下時就知道，劉備沒什麼可怕的！我們向瓦口關出擊，在瓦口關消滅他們！
- **블록 1**: 전투 준비; 레코드 15, 그룹 4; 대화 13(잡담 11); 맵: 마을 1, 지도
  - 전투 설정: 턴 제한 40, 아군 출진 12명, 격파 대상 #102, 퇴각하면 패배 #0
  - 목표 문구: 做出征瓦口關的準備．
  - 질문 r13 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - 플래그 검사: {38}
  - **r0** run(0) 그룹 0
    - `load_map` map=8193
    - `set_previous_map` map=12 x=24 y=3
    - `if_flags` 
    - `caption`
      > 成都宮殿
    - `dialogue`
      > 諸葛亮: 主公，你聽說了嗎？曹操已經占領了漢中．
      > 劉備: 嗯．曹操占領漢中是想最終占領蜀．
      > 諸葛亮: 是呀，確實是這樣，而且曹操已經行動了……主公，好像來了使者．
    - `dialogue`
      > 武官: 稟報主公．
  - **r1** talk(3) [張飛] 그룹 1*
    - `dialogue`
      > 張飛: 怎麼啦？曹操要進攻我們嗎？
  - **r2** talk(3) [趙雲] 그룹 1
    - `dialogue`
      > 趙雲: 主公，先聽聽報告吧．
  - **r3** talk(3) [馬超] 그룹 1
    - `dialogue`
      > 馬超: 以前，我曾敗於曹軍．要在這一戰中報此仇，雪先父之恨．
  - **r4** talk(3) [黃忠] 그룹 1
    - `dialogue`
      > 黃忠: 說實話，我是第一次與曹軍交戰，很想打一仗．
  - **r5** talk(3) [龐統] 그룹 1
    - `dialogue`
      > 龐統: 奪取益州後，我軍士氣高昂．現在正是與曹操交手的時候．
  - **r6** talk(3) [諸葛亮] 그룹 1
    - `dialogue`
      > 諸葛亮: 先聽聽報告吧．
  - **r7** talk(3) [武官] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 武官: 報告，曹操部下武將張郃，率軍入侵瓦口關．
      > 趙雲: 怎麼？說來就來了？
      > 張飛: 是張郃？大哥，我跟你一起去，把他打得落花流水．
      > 武官: 我先走了．
    - `set_objective`
      > 做出征瓦口關的準備．
    - `leave_parallel` 
  - **r8** talk(3) [張飛] 그룹 2*
    - `dialogue`
      > 張飛: 大哥，交給我吧．
  - **r9** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 不能只讓張飛立功，我也要去．
  - **r10** talk(3) [馬超] 그룹 2
    - `dialogue`
      > 馬超: 以前，我曾敗於曹軍．要在這一戰中報此仇，雪先父之恨．
  - **r11** talk(3) [黃忠] 그룹 2
    - `dialogue`
      > 黃忠: 說實話，我是第一次與曹軍交戰，很想打一仗．
  - **r12** talk(3) [龐統] 그룹 2
    - `dialogue`
      > 龐統: 奪取益州後，我軍士氣高昂．現在正是與曹操交手的時候．
  - **r13** talk(3) [諸葛亮] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 出征嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r14** run(0) 그룹 3
    - `play_music` song=12
    - `dialogue`
      > 諸葛亮: 請點兵派將．
    - `battle_setup` 
    - `dialogue`
      > 諸葛亮: 那麼，向瓦口關進發．
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 瓦口關位於葭萌關東面．快點出發吧．
- **블록 2**: 전투; 레코드 15, 그룹 9; 대화 0(잡담 0); 맵: 전투 맵 35
  - 적군 명단: 15기
  - 전투 설정: 턴 제한 40, 아군 출진 12명, 격파 대상 #102, 퇴각하면 패배 #0
  - 적군 명단: 14기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact
  - 목표 문구: 一、張郃的敗退 / 一、張郃的撤退
  - r0 소속: 張郃 → 군 1(이탈)
  - r3 일기토
  - r6 (run) 전투 끝
  - r9 일기토
  - r11 아이템: 赦命書
  - r12 아이템: 猛火書  
  - r14 (run) 전투 끝
  - 플래그 켬: {171, 204}
  - 플래그 검사: {171, 204}
  - **r0** run(0) 그룹 0
    - `set_allegiance` person=張郃 army=1
    - `battle_roster` 
    - `load_map` map=12323
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、張郃的敗退
    - `dialogue`
      > 張郃: 到底打來了，劉備啊！我知道你虎視眈眈．會打進漢中來．我先來一步打你們．將士們，劉備在哪裡，全體進攻！
      > 諸葛亮: 有點怪呀！進攻兵力不多……怎麼回事？原來另有安排．
    - `join_battle` person=步兵隊
    - `join_battle` person=步兵隊
    - `join_battle` person=弓兵隊
    - `join_battle` person=弓兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=猛獸師
    - `caption`
      > 出現敵軍伏兵！
    - `play_music` song=19
  - **r3** unit_contact(4) [雷銅] 그룹 3*
    - `dialogue`
      > 雷銅: 魏軍，還想得隴望蜀．我雷銅把你們打垮了．
      > 張郃: 好大膽，你膽敢和我張郃較量！有意思，我來逗逗你．過來！
    - `duel` first=張郃 second=雷銅
    - `duel_begin` 
    - `dialogue`
      > 張郃: 一招，兩招……怎麼樣？
      > 雷銅: 還殺不了你，再砍過一刀．
    - `duel_action` person=雷銅 action=0
    - `duel_action` person=雷銅 action=1
    - `dialogue`
      > 雷銅: 不行！殺不過他！
      > 張郃: 這麼點本事，還想殺我．看我一刺．
    - `duel_action` person=張郃 action=1
    - `dialogue`
      > 雷銅: 哎呀！
    - `duel_action` person=雷銅 action=2
    - `dialogue`
      > 雷銅: 好厲害，打不過他．……逃吧．
    - `duel_action` person=雷銅 action=4
    - `dialogue`
      > 張郃: 嘿嘿！蜀軍都不經一打．
    - `duel_end` 
    - `caption`
      > 雷銅敗退了！
  - **r4** turn(9) 그룹 3
    - `dialogue`
      > 張郃: 劉備，你已被四面包圍，束手待斃．我來取你首級！好！全軍前進！
  - **r5** battle_won(7) 그룹 3 — 그룹 넘김
    - `play_music` song=11
    - `dialogue`
      > 張郃: 好傢伙！劉備的兵不好打．退兵，回瓦口關防守敵人．
    - `leave_parallel` 
  - **r6** run(0) 그룹 4
    - `play_music` song=7
    - `dialogue`
      > 諸葛亮: 主公，敵軍退回瓦口關了．我們追擊敵軍吧！
    - `battle_setup` 
    - `battle_roster` 
    - `battle_end` next_map=12324
  - **r7** run(0) 그룹 5
    - `begin_battle` 
  - **r8** run(0) 그룹 6
    - `play_music` song=11
    - `set_objective`
      > 一、張郃的撤退
    - `dialogue`
      > 張郃: 剛才沒有打好仗，這次能好好打了．而且已給漢中的曹洪去信，要求派兵支援．劉備，來攻打吧！
      > 諸葛亮: 主公，往上看那是瓦口關．我們要把張郃趕出瓦口關．
    - `play_music` song=19
  - **r9** unit_contact(4) [雷銅] 그룹 7*
    - `dialogue`
      > 雷銅: 魏軍，還想得隴望蜀．我雷銅把你們打垮了．
      > 張郃: 好大膽，你膽敢和我張郃較量！有意思，我來逗逗你．過來！
    - `duel` first=張郃 second=雷銅
    - `duel_begin` 
    - `dialogue`
      > 張郃: 一招，兩招……怎麼樣？
      > 雷銅: 還殺不了你，再砍過一刀．
    - `duel_action` person=雷銅 action=0
    - `duel_action` person=雷銅 action=1
    - `dialogue`
      > 雷銅: 不行！殺不過他！
      > 張郃: 這麼點本事，還想殺我．看我一刺．
    - `duel_action` person=張郃 action=7
    - `dialogue`
      > 雷銅: 哎呀！
    - `duel_action` person=雷銅 action=2
    - `dialogue`
      > 雷銅: 好厲害，打不過他．……逃吧．
    - `duel_action` person=雷銅 action=4
    - `dialogue`
      > 張郃: 嘿嘿！蜀軍都不經一打．
    - `duel_end` 
    - `caption`
      > 雷銅敗退了！
  - **r10** turn(9) 그룹 7
    - `play_music` song=11
    - `dialogue`
      > 張郃: 來了，援兵？什麼，不派援兵來了．為什麼？原來主帥對上次的爭吵抱有成見．還記仇啊！這就不好打了．
    - `play_music` song=19
  - **r11** unit_at_cell(6) [(any unit)] 그룹 7
    - `if_flags` 
    - `add_item` item=赦命書
    - `set_flag` flag=171 clear=0
  - **r12** unit_at_cell(6) [(any unit)] 그룹 7
    - `if_flags` 
    - `add_item` item=猛火書  
    - `set_flag` flag=204 clear=0
  - **r13** battle_won(7) 그룹 7 — 그룹 넘김
    - `dialogue`
      > 張郃: 可！可沒有想到劉備軍這麼兇，撤……，撤退！
    - `play_music` song=7
    - `narration`
      > 　張郃軍撤退了．
    - `leave_parallel` 
  - **r14** run(0) 그룹 8
    - `data` kind=2 value=1300
    - `caption`
      > 得到黃金１３００！
    - `battle_end` next_map=4096
- **블록 3**: 이야기; 레코드 12, 그룹 4; 대화 7(잡담 6); 맵: 마을 16, 지도
  - 트리거: condition
  - 목표 문구: 請選擇是向葭萌關派援軍，還是進攻定軍山．
  - 질문 r8 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - 선택지 r9: 「增援葭萌關」 r10 → 블록 4; 「進攻定軍山」 r11 → 블록 6
  - r10 (run) → 블록 4
  - r11 (run) → 블록 6
  - 플래그 검사: {38}
  - **r0** run(0) 그룹 0
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 雖然擊退了張郃，可是曹操是不會善罷干休的，他一定還會採取什麼軍事行動．
    - `play_music` song=11
    - `dialogue`
      > 曹洪: 什麼？！張郃被劉備打敗了，我立即報告曹操大人．徐晃，你速去天蕩山，命令夏侯德立即進攻葭萌關，天蕩山就轉由你來鎮守．
      > 徐晃: 遵命．我馬上去天蕩山．
    - `dialogue`
      > 徐晃: 夏侯德將軍，曹洪有令，命你立即進攻葭萌關．
      > 夏侯德: 遵命．全軍向葭萌關進發．
  - **r1** run(0) 그룹 1
    - `load_map` map=8208
    - `if_flags` 
    - `play_music` song=12
    - `caption`
      > 瓦口關營帳
    - `dialogue`
      > 武官: 劉備大人，剛剛收到葭萌關的報告，說曹軍進攻，要求速派援軍．
      > 趙雲: 說到曹操，曹操就來了．
      > 張飛: 又來了，敗仗還沒吃夠嗎？
      > 黃忠: 主公，那就作出征準備吧．
    - `dialogue`
      > 諸葛亮: 主公，我們有兩個對策，一個是派援軍；另一個是乾脆進攻定軍山．葭萌關的曹軍是由夏侯德指揮，定軍山是由夏侯淵鎮守．
    - `set_objective`
      > 請選擇是向葭萌關派援軍，還是進攻定軍山．
  - **r2** talk(3) [龐統] 그룹 2*
    - `dialogue`
      > 龐統: 葭萌關有夏侯德，定軍山有夏侯淵．
  - **r3** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 大哥，究竟向那裡派兵，快決定吧．
  - **r4** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 定軍山，顧名思義，一定山勢險要，是兵家必爭之地．要攻克定軍山，需要選派適合山地戰的部隊．
  - **r5** talk(3) [馬超] 그룹 2
    - `dialogue`
      > 馬超: 以前我進攻過葭萌關，我覺得那是個易守難攻的關隘．
  - **r6** talk(3) [黃忠] 그룹 2
    - `dialogue`
      > 黃忠: 主公，快決定吧．管他是夏侯德還是夏侯淵，我去提來首級獻給主公．
  - **r7** talk(3) [武官] 그룹 2
    - `dialogue`
      > 武官: 夏侯德在葭萌關前布下了幾道複雜的陣勢．據偵察其中有許多寶物庫．
  - **r8** talk(3) [諸葛亮] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 決定了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r9** condition(1) 그룹 3*
    - `choice`
      > 增援葭萌關
      > 進攻定軍山
  - **r10** run(0) 그룹 3
    - `dialogue`
      > 諸葛亮: 明白了．那就增援葭萌關．
    - `load_map` map=4096
    - `play_music` song=3
    - `goto_block` block=4
  - **r11** run(0) 그룹 3
    - `dialogue`
      > 諸葛亮: 好．那就攻打定軍山．
    - `load_map` map=4096
    - `play_music` song=3
    - `play_music` song=11
    - `dialogue`
      > 徐晃: 什麼，劉備軍去攻打定軍山了？我立即去援救夏侯淵．
    - `dialogue`
      > 夏侯德: 怎麼回事？劉備不來救援葭萌關，反而去進攻定軍山．如果被他得逞，那漢中就危險了．全軍停止進攻，速返回天蕩山，加強那裡的防守．
    - `goto_block` block=6
- **블록 4**: 전투; 레코드 13, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 38
  - 전투 설정: 턴 제한 35, 아군 출진 10명, 격파 대상 #210, 퇴각하면 패배 #0
  - 적군 명단: 25기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact
  - 목표 문구: 一、夏侯德的潰滅
  - r6 아이템: 海嘯書  
  - r7 아이템: 米
  - r8 아이템: 老酒
  - r9 아이템: 近衛鎧
  - r10 일기토
  - r10 레벨 +1: 嚴顏
  - r12 (run) 전투 끝
  - 플래그 켬: {53, 54, 55, 56, 57}
  - 플래그 검사: {53, 54, 55, 56}
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 諸葛亮: 請編排部隊．
    - `battle_setup` 
    - `battle_roster` 
    - `load_map` map=12326
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、夏侯德的潰滅
    - `dialogue`
      > 夏侯德: 又派了援兵？沒什麼，我把他們打垮．
      > 諸葛亮: 主公，請注意進攻路上左右的樹林，夏侯德可能在那裡埋下了伏兵．
    - `play_music` song=9
  - **r3** turn(9) 그룹 3*
    - `join_battle` person=異民族
    - `join_battle` person=異民族
    - `join_battle` person=武術家
    - `caption`
      > 出現敵人伏兵．
    - `dialogue`
      > 劉備: 果然如孔明所料．大家要鎮靜，不要驚慌，敵人出現一批就打垮他一批．
  - **r4** turn(9) 그룹 3
    - `join_battle` person=異民族
    - `join_battle` person=異民族
    - `join_battle` person=武術家
    - `caption`
      > 出現敵人伏兵．
    - `dialogue`
      > 劉備: 還有埋伏的敵兵．夏侯德真會用兵．
  - **r5** turn(9) 그룹 3
    - `join_battle` person=猛獸師
    - `join_battle` person=猛獸師
    - `join_battle` person=武術家
    - `caption`
      > 出現敵人伏兵．
    - `dialogue`
      > 劉備: 怎麼還有伏兵？究竟埋伏了多少伏兵？
  - **r6** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=海嘯書  
    - `set_flag` flag=53 clear=0
  - **r7** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=米
    - `set_flag` flag=54 clear=0
  - **r8** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=老酒
    - `set_flag` flag=55 clear=0
  - **r9** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=近衛鎧
    - `set_flag` flag=56 clear=0
  - **r10** unit_contact(4) [嚴顏] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 嚴顏: 來將是夏侯德嗎？我嚴顏要與你單挑．
      > 夏侯德: 你這個老傢伙，膽敢侵略我國，我絕不饒你！
    - `duel` first=嚴顏 second=夏侯德
    - `duel_begin` 
    - `dialogue`
      > 嚴顏: 看招！
    - `duel_action` person=嚴顏 action=0
    - `duel_action` person=嚴顏 action=1
    - `duel_action` person=嚴顏 action=0
    - `dialogue`
      > 夏侯德: 噢，不好．招架不住了．
      > 嚴顏: 敵人露出了破綻．
    - `duel_action` person=嚴顏 action=6
    - `dialogue`
      > 夏侯德: 啊……
    - `duel_action` person=夏侯德 action=3
    - `dialogue`
      > 嚴顏: 我殺死了敵將夏侯德．
    - `duel_end` 
    - `add_levels` person=嚴顏 levels=1
    - `caption`
      > 嚴顏等級上升了．
    - `play_music` song=7
    - `narration`
      > 　嚴顏殺死了夏侯德，曹操軍敗退了．
    - `leave_parallel` 
  - **r11** battle_won(7) 그룹 3 — 그룹 넘김
    - `play_music` song=7
    - `narration`
      > 　劉備軍打敗了夏侯德率領的曹操軍．
    - `leave_parallel` 
  - **r12** run(0) 그룹 4
    - `set_flag` flag=57 clear=0
    - `data` kind=2 value=1300
    - `caption`
      > 繳獲了黃金１３００．
    - `battle_end` next_map=4096
- **블록 5**: 이야기; 레코드 10, 그룹 3; 대화 6(잡담 5); 맵: 마을 16, 지도
  - 트리거: condition
  - 목표 문구: 請選擇是進攻定軍山還是進攻天蕩山．
  - 질문 r6 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - 선택지 r7: 「進攻定軍山」 r8 → 블록 6; 「進攻天蕩山」 r9 → 블록 10
  - r8 (run) → 블록 6
  - r9 (run) → 블록 10
  - 플래그 검사: {38}
  - **r0** run(0) 그룹 0
    - `load_map` map=8208
    - `if_flags` 
    - `play_music` song=12
    - `caption`
      > 葭萌關營帳
    - `dialogue`
      > 諸葛亮: 主公，打敗了敵軍，士氣正旺．乘此時機一舉攻下漢中．漢中的路上還有定軍山、天蕩山和漢水，都有敵將把守．
    - `dialogue`
      > 諸葛亮: 那麼，我們是進攻定軍山還是進攻天蕩山，請主公選擇．定軍山由夏侯淵把守，天蕩山由徐晃把守．
    - `set_objective`
      > 請選擇是進攻定軍山還是進攻天蕩山．
  - **r1** talk(3) [龐統] 그룹 1*
    - `dialogue`
      > 龐統: 天蕩山有徐晃，定軍山有夏侯淵．
  - **r2** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 大哥，究竟進攻那裡，請趕快決定吧．
  - **r3** talk(3) [趙雲] 그룹 1
    - `dialogue`
      > 趙雲: 定軍山、天蕩山都是險山峻嶺，要進攻需要注意選擇適合山地作戰的部隊．
  - **r4** talk(3) [馬超] 그룹 1
    - `dialogue`
      > 馬超: 我曾與徐晃交過手，他是個厲害的對手．
  - **r5** talk(3) [黃忠] 그룹 1
    - `dialogue`
      > 黃忠: 主公，快下決心吧．管他是徐晃還是夏侯淵，我都能把他們砍落馬下．
  - **r6** talk(3) [諸葛亮] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 究竟進攻那一個，決定了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r7** condition(1) 그룹 2*
    - `choice`
      > 進攻定軍山
      > 進攻天蕩山
  - **r8** run(0) 그룹 2
    - `dialogue`
      > 諸葛亮: 遵命．那就進攻定軍山．
    - `load_map` map=4096
    - `play_music` song=3
    - `redraw` 
    - `play_music` song=11
    - `dialogue`
      > 徐晃: 蜀軍進攻定軍山了，快去支援夏侯淵．
    - `goto_block` block=6
  - **r9** run(0) 그룹 2
    - `dialogue`
      > 諸葛亮: 遵命．那就進攻天蕩山．
    - `load_map` map=4096
    - `play_music` song=3
    - `play_music` song=11
    - `dialogue`
      > 夏侯淵: 蜀軍進攻天蕩山了，快去支援徐晃．
    - `goto_block` block=10
- **블록 6**: 전투; 레코드 11, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 39
  - 전투 설정: 턴 제한 35, 아군 출진 13명, 격파 대상 #17, 퇴각하면 패배 #0
  - 적군 명단: 25기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact
  - 목표 문구: 一、夏侯淵的潰滅
  - r3 일기토
  - r3 레벨 +1: 黃忠
  - r5 레벨 +1: 劉備
  - r7 아이템: 青囊書
  - r9 아이템: 山洪書    
  - r10 (run) 전투 끝
  - 플래그 켬: {134, 205, 206, 207}
  - 플래그 검사: {134, 205, 206, 207}
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 諸葛亮: 請編排部隊．
    - `battle_setup` 
    - `battle_roster` 
    - `load_map` map=12327
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、夏侯淵的潰滅
    - `dialogue`
      > 夏侯淵: 不能讓劉備奪取漢中．竭盡全力制止劉備的進攻．
    - `play_music` song=9
  - **r3** unit_contact(4) [黃忠] 그룹 3* — 그룹 넘김
    - `dialogue`
      > 黃忠: 來將像是夏侯淵．我黃忠來單挑結果你！
      > 夏侯淵: 你這幫蜀國鄉巴佬，膽敢犯我疆土，看我大刀！
      > 黃忠: 我黃忠寶刀未老，你就做我的刀下鬼吧．
    - `duel` first=黃忠 second=夏侯淵
    - `duel_begin` 
    - `dialogue`
      > 黃忠: 吃這一刀！
    - `duel_action` person=黃忠 action=1
    - `dialogue`
      > 夏侯淵: 不好！哎喲……
    - `duel_action` person=夏侯淵 action=3
    - `dialogue`
      > 黃忠: 我殺死了敵將夏侯淵．
    - `duel_end` 
    - `add_levels` person=黃忠 levels=1
    - `caption`
      > 黃忠的等級上升了．
    - `play_music` song=7
    - `narration`
      > 　黃忠殺死了夏侯淵，
      > 　劉備軍佔領了定軍山．
    - `leave_parallel` 
  - **r4** turn(9) 그룹 3
    - `dialogue`
      > 劉備: 嗯，這些兵是……？
    - `play_music` song=11
    - `join_battle` person=徐晃
    - `join_battle` person=王平
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=步兵隊
    - `join_battle` person=弓兵隊
    - `caption`
      > 敵人援軍出現了．
    - `dialogue`
      > 徐晃: 夏侯淵將軍，我來幫你把劉備趕出定軍山．
      > 王平: ……
      > 夏侯淵: 噢，徐晃你來了．好，全軍向劉備軍衝鋒！我軍要夾擊劉備軍．
    - `play_music` song=9
  - **r5** unit_contact(4) [劉備] 그룹 3
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 王平: 劉備大人，我想向劉備軍投降，請收容我．
    - `caption`
      > 王平倒戈了．
    - `set_country` person=王平 country=0
    - `set_flag` flag=134 clear=0
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備的等級上升了．
    - `play_music` song=9
  - **r6** battle_won(7) 그룹 3 — 그룹 넘김
    - `play_music` song=7
    - `narration`
      > 　劉備軍佔領了定軍山．
    - `leave_parallel` 
  - **r7** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=青囊書
    - `set_flag` flag=205 clear=0
  - **r8** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `data` kind=2 value=800
    - `caption`
      > 獲得了黃金８００．
    - `set_flag` flag=206 clear=0
  - **r9** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=山洪書    
    - `set_flag` flag=207 clear=0
  - **r10** run(0) 그룹 4
    - `data` kind=2 value=1300
    - `caption`
      > 繳獲了黃金１３００．
    - `battle_end` next_map=4096
- **블록 7**: 이야기; 레코드 12, 그룹 5; 대화 6(잡담 5); 맵: 마을 16, 지도
  - 트리거: condition
  - 목표 문구: 請決定是進攻天蕩山，還是進攻漢水． / 做進攻漢水的準備．
  - 질문 r7 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - r8 (run) → 블록 12
  - 선택지 r9: 「進攻天蕩山」 r10 → 블록 8; 「進攻漢水」 r11 → 블록 12
  - r10 (run) → 블록 8
  - r11 (run) → 블록 12
  - 플래그 검사: {38, 57}
  - **r0** run(0) 그룹 0
    - `load_map` map=4096
    - `if_flags` 
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 這樣，只要渡過漢水就可以佔領漢中了，可是……
    - `play_music` song=11
    - `dialogue`
      > 曹操: 劉備小兒，趁我不在偷襲漢中，我絕不饒你！
      > 曹彰: 父親，我來幫你．
      > 曹操: 噢，曹彰，如果有敵人進攻漢水，你就去支援那裡．我在陽平關觀察敵人的動靜．
      > 曹彰: 是．
  - **r1** run(0) 그룹 1
    - `load_map` map=8208
    - `if_flags` 
    - `play_music` song=12
    - `caption`
      > 定軍山營帳
    - `if_flags` 
    - `dialogue`
      > 諸葛亮: 那麼，是進攻天蕩山還是進攻漢水，請主公定奪．漢水是由曹洪把守，天蕩山是由夏侯德把守．
    - `set_objective`
      > 請決定是進攻天蕩山，還是進攻漢水．
    - `if_flags` 
    - `dialogue`
      > 諸葛亮: 那就進攻漢水吧．請做好進攻漢水的準備．
    - `set_objective`
      > 做進攻漢水的準備．
  - **r2** talk(3) [龐統] 그룹 2*
    - `if_flags` 
    - `dialogue`
      > 龐統: 漢水有曹洪，天蕩山有夏侯德把守．
    - `if_flags` 
    - `dialogue`
      > 龐統: 漢水是由曹洪把守．
  - **r3** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 大哥，快出征吧．
  - **r4** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 聽說漢水是有條大河的平原，可以集結快速部隊．
  - **r5** talk(3) [馬超] 그룹 2
    - `dialogue`
      > 馬超: 我與曹洪交過幾次手，這個傢伙脾氣暴躁．
  - **r6** talk(3) [黃忠] 그룹 2
    - `dialogue`
      > 黃忠: 主公，快出發吧．
  - **r7** talk(3) [諸葛亮] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 準備好了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r8** run(0) 그룹 3
    - `if_flags` 
    - `dialogue`
      > 諸葛亮: 那就進攻漢水．
    - `load_map` map=4096
    - `play_music` song=11
    - `dialogue`
      > 曹彰: 什麼，劉備進攻漢水？我們快去支援那裡．
    - `goto_block` block=12
    - `dialogue`
      > 諸葛亮: 究竟進攻那裡，請選擇．
  - **r9** condition(1) 그룹 4*
    - `choice`
      > 進攻天蕩山
      > 進攻漢水
  - **r10** run(0) 그룹 4
    - `dialogue`
      > 諸葛亮: 明白了．那麼向天蕩山進發．
    - `load_map` map=4096
    - `play_music` song=3
    - `goto_block` block=8
  - **r11** run(0) 그룹 4
    - `dialogue`
      > 諸葛亮: 是，進攻漢水．
    - `load_map` map=4096
    - `play_music` song=3
    - `play_music` song=11
    - `dialogue`
      > 曹彰: 什麼，劉備進攻漢水？我們快去支援那裡．
    - `goto_block` block=12
- **블록 8**: 전투; 레코드 6, 그룹 4; 대화 0(잡담 0); 맵: 전투 맵 40
  - 전투 설정: 턴 제한 40, 아군 출진 10명, 격파 대상 #210, 퇴각하면 패배 #0
  - 적군 명단: 16기
  - 트리거: battle_won, unit_at_cell, unit_contact
  - 목표 문구: 一、殲滅夏侯德
  - r3 아이템: 中藥  
  - r4 일기토
  - r4 레벨 +1: 嚴顏
  - 플래그 켬: {174}
  - 플래그 검사: {174}
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 諸葛亮: 請列隊．
    - `battle_setup` 
    - `battle_roster` 
    - `load_map` map=12328
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、殲滅夏侯德
    - `dialogue`
      > 夏侯德: 讓敵人佔領天蕩山，我軍的糧草就沒了！無論如何我們也要守住天蕩山！
      > 劉備: 敵人的兵力不多！一鼓作氣攻下它！
    - `play_music` song=9
  - **r3** unit_at_cell(6) [(any unit)] 그룹 3*
    - `if_flags` 
    - `add_item` item=中藥  
    - `set_flag` flag=174 clear=0
  - **r4** unit_contact(4) [嚴顏] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 嚴顏: 夏侯德，我嚴顏要和你單挑！
      > 夏侯德: 你這個老朽，膽敢侵佔我們領土！殺呀！！
    - `duel` first=嚴顏 second=夏侯德
    - `duel_begin` 
    - `dialogue`
      > 嚴顏: 殺！
    - `duel_action` person=嚴顏 action=0
    - `duel_action` person=嚴顏 action=1
    - `duel_action` person=嚴顏 action=0
    - `dialogue`
      > 夏侯德: 嗯、嗯……！不……好了！
      > 嚴顏: 納命來！
    - `duel_action` person=嚴顏 action=0
    - `dialogue`
      > 夏侯德: 啊……！
    - `duel_action` person=夏侯德 action=3
    - `dialogue`
      > 嚴顏: 敵將夏侯德，被我嚴顏殺了！！
    - `duel_end` 
    - `add_levels` person=嚴顏 levels=1
    - `caption`
      > 嚴顏的等級上升了！
    - `play_music` song=7
    - `narration`
      > 　嚴顏殺了夏侯德，曹操軍敗退了．
    - `leave_parallel` 
  - **r5** battle_won(7) 그룹 3 — 그룹 넘김
    - `play_music` song=7
    - `narration`
      > 　劉備軍打敗了夏侯德率領的曹操軍．
    - `leave_parallel` 
- **블록 9**: 이야기; 레코드 9, 그룹 4; 대화 6(잡담 5); 맵: 마을 16, 지도
  - 목표 문구: 準備進軍漢水．
  - r0 (run) 전투 끝
  - 질문 r7 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - r8 (run) → 블록 12
  - 플래그 켬: {57}
  - 플래그 검사: {38}
  - **r0** run(0) 그룹 0
    - `data` kind=2 value=1300
    - `caption`
      > 得到黃金１３００！
    - `battle_end` next_map=4096
    - `set_flag` flag=57 clear=0
  - **r1** run(0) 그룹 1
    - `load_map` map=8208
    - `if_flags` 
    - `play_music` song=12
    - `caption`
      > 天蕩山營帳
    - `dialogue`
      > 諸葛亮: 再過了漢水就是漢中了．進軍漢水．
    - `set_objective`
      > 準備進軍漢水．
  - **r2** talk(3) [龐統] 그룹 2*
    - `dialogue`
      > 龐統: 漢水是曹洪把守．
  - **r3** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 大哥，快出兵吧．
  - **r4** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 聽說漢水是個有一條大河的平原，可以集結快速部隊．
  - **r5** talk(3) [馬超] 그룹 2
    - `dialogue`
      > 馬超: 我和曹洪交過幾次手，這個傢伙脾氣暴躁．
  - **r6** talk(3) [黃忠] 그룹 2
    - `dialogue`
      > 黃忠: 主公，快些出兵吧．
  - **r7** talk(3) [諸葛亮] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 準備好了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r8** run(0) 그룹 3
    - `dialogue`
      > 諸葛亮: 出發吧．
    - `load_map` map=4096
    - `play_music` song=3
    - `play_music` song=11
    - `dialogue`
      > 曹彰: 什麼，劉備軍到了漢水？我們馬上去漢水．
    - `goto_block` block=12
- **블록 10**: 전투; 레코드 8, 그룹 4; 대화 0(잡담 0); 맵: 전투 맵 40
  - 전투 설정: 턴 제한 40, 아군 출진 12명, 격파 대상 #78, 퇴각하면 패배 #0
  - 적군 명단: 25기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact
  - 목표 문구: 一、徐晃敗退
  - r3 아이템: 中藥  
  - r4 레벨 +1: 劉備
  - r6 일기토
  - r6 레벨 +1: 黃忠
  - 플래그 켬: {134, 175}
  - 플래그 검사: {134, 175}
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 諸葛亮: 請列好隊．
    - `battle_setup` 
    - `battle_roster` 
    - `load_map` map=12328
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、徐晃敗退
    - `dialogue`
      > 徐晃: 守不住這裡，漢中也就丟了！將士們，無論如何得守住這個天蕩山！
    - `play_music` song=9
  - **r3** unit_at_cell(6) [(any unit)] 그룹 3*
    - `if_flags` 
    - `add_item` item=中藥  
    - `set_flag` flag=175 clear=0
  - **r4** unit_contact(4) [劉備] 그룹 3
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 王平: 劉皇叔，我遭徐晃忌恨，所以我想投降劉皇叔．今後請您多關照．
    - `caption`
      > 王平倒戈到這裡！
    - `set_country` person=王平 country=0
    - `set_flag` flag=134 clear=0
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備的等級上升了！
    - `play_music` song=9
  - **r5** turn(9) 그룹 3
    - `dialogue`
      > 劉備: 嗯！那莫非是？
    - `play_music` song=11
    - `join_battle` person=夏侯淵
    - `join_battle` person=張郃
    - `join_battle` person=夏侯尚
    - `join_battle` person=杜襲
    - `join_battle` person=步兵隊
    - `join_battle` person=步兵隊
    - `join_battle` person=騎兵隊
    - `caption`
      > 敵人援軍出現了！
    - `dialogue`
      > 夏侯淵: 救出徐晃！把劉備軍趕出天蕩山！
      > 張郃: 剛才由於天意讓你們佔了便意，這次不會啦！劉備軍，你們準備受死吧！
      > 徐晃: 嘔！是夏侯淵！好，出擊的時候到了！！全軍，向劉備軍突擊！！
    - `play_music` song=9
  - **r6** unit_contact(4) [黃忠] 그룹 3
    - `dialogue`
      > 黃忠: 喂，夏侯淵！我黃忠與你單挑！！
      > 夏侯淵: 你們這些鄉巴佬，竟敢來搶佔我們領土！我豈能饒你！
      > 黃忠: 哈哈，我黃忠雖已年邁，但還不至於敗給你這鼠輩．
    - `duel` first=黃忠 second=夏侯淵
    - `duel_begin` 
    - `dialogue`
      > 黃忠: 看刀！
    - `duel_action` person=黃忠 action=1
    - `dialogue`
      > 夏侯淵: 啊……！！
    - `duel_action` person=夏侯淵 action=3
    - `dialogue`
      > 黃忠: 我殺死了敵將夏侯淵！
    - `duel_end` 
    - `add_levels` person=黃忠 levels=1
    - `caption`
      > 黃忠的等級上升了！
  - **r7** battle_won(7) 그룹 3 — 그룹 넘김
    - `play_music` song=7
    - `narration`
      > 　劉備軍佔領了天蕩山．
    - `leave_parallel` 
- **블록 11**: 이야기; 레코드 9, 그룹 4; 대화 6(잡담 5); 맵: 마을 16, 지도
  - 목표 문구: 做進攻漢水的準備．
  - r0 (run) 전투 끝
  - 질문 r7 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - 플래그 검사: {38}
  - **r0** run(0) 그룹 0
    - `data` kind=2 value=1300
    - `caption`
      > 繳獲了黃金１３００！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 這樣，只要渡過漢水就可以佔領漢中了，可是……
    - `play_music` song=11
    - `dialogue`
      > 曹操: 劉備小兒，趁我不在偷襲漢中，我絕不饒你！
      > 曹彰: 父親，我來幫你．
      > 曹操: 噢，曹彰，如果有敵人進攻漢水，你就去支援那裡．我在陽平關觀察敵人的動靜．
      > 曹彰: 是．
  - **r1** run(0) 그룹 1
    - `load_map` map=8208
    - `if_flags` 
    - `play_music` song=12
    - `caption`
      > 天蕩山營帳
    - `dialogue`
      > 諸葛亮: 曹操終於出來了．那麼主公，我軍進攻漢水吧．漢水是由曹洪把守．
    - `set_objective`
      > 做進攻漢水的準備．
  - **r2** talk(3) [龐統] 그룹 2*
    - `dialogue`
      > 龐統: 漢水是由曹洪把守．
  - **r3** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 大哥，快出征吧．
  - **r4** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 聽說漢水是有條大河的平原，可以集結快速部隊．
  - **r5** talk(3) [馬超] 그룹 2
    - `dialogue`
      > 馬超: 我與曹洪交過幾次手，這個傢伙脾氣暴躁．
  - **r6** talk(3) [黃忠] 그룹 2
    - `dialogue`
      > 黃忠: 主公，快出發吧．
  - **r7** talk(3) [諸葛亮] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 準備好了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r8** run(0) 그룹 3
    - `dialogue`
      > 諸葛亮: 出征．
    - `load_map` map=4096
    - `play_music` song=3
    - `play_music` song=11
    - `dialogue`
      > 曹彰: 什麼，劉備進攻漢水？我們快去支援那裡．
- **블록 12**: 전투; 레코드 8, 그룹 4; 대화 0(잡담 0); 맵: 전투 맵 41
  - 전투 설정: 턴 제한 40, 아군 출진 13명, 격파 대상 #19, 퇴각하면 패배 #0
  - 적군 명단: 28기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact
  - 목표 문구: 一、曹洪的敗退．
  - r3 일기토
  - r4 아이템: 茶
  - 플래그 켬: {85, 86}
  - 플래그 검사: {85, 86}
  - **r0** run(0) 그룹 0
    - `battle_setup` 
    - `battle_roster` 
    - `load_map` map=12329
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、曹洪的敗退．
    - `dialogue`
      > 曹洪: 在這裡阻住劉備軍．萬一這裡失守，則漢中危矣！各位將軍，一定要死守這裡！
    - `play_music` song=16
  - **r3** unit_contact(4) [吳蘭] 그룹 3*
    - `dialogue`
      > 吳蘭: 我是蜀將吳蘭！誰敢與我單挑？
      > 曹彰: 你能贏我嗎？我來了．
    - `duel` first=曹彰 second=吳蘭
    - `duel_begin` 
    - `dialogue`
      > 吳蘭: 這是……
      > 曹彰: 怎麼了，不想打了？如果這樣我曹彰就不殺你了．
      > 吳蘭: 你是曹彰？那麼你是曹操的兒子？
      > 曹彰: 正是．
      > 吳蘭: ……好，我要取你首級立功！曹彰，接招！
    - `duel_action` person=吳蘭 action=1
    - `duel_action` person=吳蘭 action=0
    - `dialogue`
      > 曹彰: 哈哈哈．你這點本事還能贏我？該我了，接招！
    - `duel_action` person=曹彰 action=0
    - `duel_action` person=曹彰 action=1
    - `duel_action` person=曹彰 action=0
    - `duel_action` person=曹彰 action=1
    - `dialogue`
      > 吳蘭: 噢……
      > 曹彰: 嚇傻了吧．我的本事還沒完全使出來呢．
      > 吳蘭: ……看來是勝不了他了……真不該輕敵．沒辦法，撤吧．
    - `duel_action` person=吳蘭 action=4
    - `dialogue`
      > 曹彰: 哼，勝得太容易了．還有沒有人敢與我交手？
    - `duel_end` 
    - `caption`
      > 吳蘭退卻了！
  - **r4** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=茶
    - `set_flag` flag=85 clear=0
  - **r5** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `data` kind=2 value=1000
    - `caption`
      > 得到了黃金１０００！
    - `set_flag` flag=86 clear=0
  - **r6** turn(9) 그룹 3
    - `dialogue`
      > 曹洪: 劉備小兒，的確厲害……嗯？！
    - `play_music` song=11
    - `join_battle` person=曹彰
    - `join_battle` person=步兵隊
    - `join_battle` person=弓兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `caption`
      > 敵人援軍出現了！
    - `dialogue`
      > 曹彰: 不能讓蜀軍再猖狂了．我來讓你們知道我的厲害！
      > 曹洪: 噢，曹彰公子來了．哼，劉備小兒，我要報仇了．
    - `play_music` song=9
  - **r7** battle_won(7) 그룹 3 — 그룹 넘김
    - `play_music` song=7
    - `narration`
      > 　劉備軍打敗了曹洪率領的曹操軍．
    - `leave_parallel` 
- **블록 13**: 전투 준비; 레코드 9, 그룹 4; 대화 6(잡담 5); 맵: 마을 16, 지도
  - 전투 설정: 턴 제한 45, 아군 출진 14명, 격파 대상 #8, 퇴각하면 패배 #0
  - r0 (run) 전투 끝
  - 질문 r7 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - 플래그 검사: {38}
  - **r0** run(0) 그룹 0
    - `data` kind=2 value=1300
    - `caption`
      > 繳獲了黃金１３００！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=11
    - `dialogue`
      > 曹操: 唉……既然如此，在陽平關迎擊敵人！
  - **r1** run(0) 그룹 1
    - `load_map` map=8208
    - `if_flags` 
    - `play_music` song=12
    - `caption`
      > 漢水營帳
    - `dialogue`
      > 諸葛亮: 主公，曹操到陽平關以後好像就不前進了．咱們進軍陽平關吧．
  - **r2** talk(3) [龐統] 그룹 2*
    - `dialogue`
      > 龐統: 陽平關是天險，易守難攻，我們派精銳去那裡吧．
  - **r3** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 大哥，只要拿下陽平關，漢中就是我們的了．
  - **r4** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 曹操軍此次前來，其陣容之強大前所未見，咱們要當心．
  - **r5** talk(3) [馬超] 그룹 2
    - `dialogue`
      > 馬超: 我要親手取曹操的首級，主公，請派我出征吧．
  - **r6** talk(3) [黃忠] 그룹 2
    - `dialogue`
      > 黃忠: 主公，我還是很有用的，到時候看我的吧．
  - **r7** talk(3) [諸葛亮] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 準備好了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r8** run(0) 그룹 3
    - `dialogue`
      > 諸葛亮: 請編隊．
    - `battle_setup` 
    - `dialogue`
      > 諸葛亮: 在陽平關擊潰曹操！
    - `load_map` map=4096
    - `play_music` song=3
- **블록 14**: 전투; 레코드 23, 그룹 9; 대화 12(잡담 10); 맵: 마을 17, 전투 맵 42, 지도
  - 적군 명단: 28기
  - 트리거: battle_won, unit_at_cell, unit_contact, unit_in_area
  - 목표 문구: 一、曹操的敗退
  - r3 일기토
  - r3 레벨 +1: 馬超
  - r6 아이템: 馬術指南書
  - r8 (run) 전투 끝
  - 질문 r21 (諸葛亮): 예 답이면 2 명령 실행 [leave_parallel]
  - 플래그 켬: {145, 146, 176, 208}
  - 플래그 검사: {38, 145, 146, 176, 208}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12330
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、曹操的敗退
    - `dialogue`
      > 曹操: 大膽的劉備！你竟敢背叛漢朝！我曹操要把你千刀萬剮！
      > 劉備: 住口！你欺辱皇帝，侮辱漢朝，是想取而代之吧．你才是叛逆，你才該千刀萬剮．
    - `play_music` song=10
  - **r3** unit_contact(4) [馬超] 그룹 3*
    - `if_flags` 
    - `dialogue`
      > 馬超: 龐德！再好好想一下．
      > 龐德: ……不要再說了．戰鬥吧．
    - `if_flags` 
    - `dialogue`
      > 馬超: 龐德，你不是龐德嗎？你還活著．
      > 龐德: ……馬超將軍……
      > 馬超: 為什麼你在曹操軍中？
      > 龐德: 你離開張魯投奔劉備後，曹……曹丞相進攻漢中……
      > 馬超: 曹丞相？你怎麼會……
      > 龐德: 是的．我投降了曹丞相，現在是曹軍中的一員．
      > 馬超: 什麼！你怎麼如此糊塗？你不知道曹操的惡行嗎？
      > 龐德: ……我被張魯疑忌．在走投無路之時，曹丞相熱情歡迎我，還委我以重任．……此恩不報，我義氣又何在呢？
      > 馬超: 你胡說什麼？現在你要重新開始．怎麼樣，與我一起去見劉皇叔吧．
      > 龐德: ……馬超將軍，過去我雖是您的部下，但現在卻是敵人，你怎麼說都沒用，還是與我戰鬥吧．
      > 馬超: 你這個糊塗蟲！
    - `duel` first=馬超 second=龐德
    - `duel_begin` 
    - `dialogue`
      > 馬超: 龐德，你再想一下．
      > 龐德: 不要再說了．……馬超將軍，再見．
      > 馬超: 龐德，等一下！
    - `duel_action` person=龐德 action=4
    - `dialogue`
      > 馬超: 龐德……
    - `duel_end` 
    - `add_levels` person=馬超 levels=1
    - `caption`
      > 馬超等級上升了！
    - `set_flag` flag=176 clear=0
  - **r4** unit_in_area(11) [(any unit)] 그룹 3
    - `if_flags` 
    - `dialogue`
      > 張郃: 好，讓我當先鋒，我一定不辜負曹丞相的厚望，衝啊！
      > 龐德: 是．
      > 曹彰: 不要落在張郃後面．我們也往前衝！
      > 夏侯惇: 快要開戰了，我們再向前一些，以便及早投入戰鬥．
    - `set_flag` flag=145 clear=0
  - **r5** unit_in_area(11) [(any unit)] 그룹 3
    - `if_flags` 
    - `dialogue`
      > 司馬懿: 媽的，劉備．不能讓他們再靠近陽平關．大家跟我來！
      > 諸葛亮: 主公，這夥敵人中有個叫司馬懿的，據說相當有才幹，對他要當心．
    - `set_flag` flag=146 clear=0
  - **r6** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=馬術指南書
    - `set_flag` flag=208 clear=0
  - **r7** battle_won(7) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 曹操: 唉……沒辦法，撤回長安．
    - `play_music` song=7
    - `narration`
      > 　曹操放棄了漢中，劉備佔領了漢中．
    - `leave_parallel` 
  - **r8** run(0) 그룹 4
    - `data` kind=2 value=1300
    - `caption`
      > 繳獲了黃金１３００！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=11
    - `dialogue`
      > 曹操: 撤回長安．劉備，我會再找你算這次和赤壁那筆帳的！
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 主公，終於佔領了漢中，恭喜．那麼，進漢中城吧．
  - **r9** run(0) 그룹 5
    - `load_map` map=8209
    - `if_flags` 
    - `play_music` song=5
    - `caption`
      > 漢中議事廳
    - `dialogue`
      > 諸葛亮: 主公，您終於得到了漢中，這樣我三分天下的戰略就實現了．這也是您實力的表現．
  - **r10** talk(3) [龐統] 그룹 6*
    - `dialogue`
      > 龐統: 這樣，魏、蜀、吳三足鼎立之勢就形成了．
  - **r11** talk(3) [張飛] 그룹 6
    - `dialogue`
      > 張飛: 大哥，恭喜你．我高興得……
  - **r12** talk(3) [趙雲] 그룹 6
    - `dialogue`
      > 趙雲: 我從很久以前就跟隨主公，可是這麼高興還是第一次．
  - **r13** talk(3) [馬超] 그룹 6
    - `dialogue`
      > 馬超: 主公，恭喜您把曹操趕出了漢中，也雪了家父之恨．
  - **r14** talk(3) [黃忠] 그룹 6
    - `dialogue`
      > 黃忠: 主公，您給我這個老朽留下了如此輝煌的回憶，太謝謝了．
  - **r15** talk(3) [諸葛亮] 그룹 6 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 主公，請進位漢中王．
      > 劉備: 什麼？漢中王？……不行，這可不行．
      > 諸葛亮: ……主公介意的是名分吧．可是您如果不稱王，我們這些文臣武將可絕不答應．
      > 劉備: 這……
      > 諸葛亮: 我們這些部下都跟隨您多年，都希望您能夠有強大的實力，就像現在這樣．如果您不想稱王，就等於說您不想再強大了，那我們跟隨您還有什麼意義呢？
      > 劉備: ……
      > 諸葛亮: 而且，聽說曹操已經自立為魏王，為了能與曹操對抗，以示天下，也要請主公同意進位漢中王．
      > 劉備: ……
      > 諸葛亮: 您決定後，請告訴我．
    - `leave_parallel` 
  - **r16** talk(3) [龐統] 그룹 7*
    - `dialogue`
      > 龐統: 主公，即使您稱了漢中王，也不是什麼大不了的事．您就不要推辭了．
  - **r17** talk(3) [張飛] 그룹 7
    - `dialogue`
      > 張飛: 大哥在漢中稱王，二哥在荊州也會高興了．大哥你就同意稱漢中王吧．
  - **r18** talk(3) [趙雲] 그룹 7
    - `dialogue`
      > 趙雲: 大家都同意您稱王，我更是不例外．
  - **r19** talk(3) [馬超] 그룹 7
    - `dialogue`
      > 馬超: 不能默認曹操稱魏王，主公稱漢中王也是為了對抗曹操．
  - **r20** talk(3) [黃忠] 그룹 7
    - `dialogue`
      > 黃忠: 主公，您就同意稱漢中王吧，就別讓老臣空等了．
  - **r21** talk(3) [諸葛亮] 그룹 7 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 您決定稱漢中王了嗎？
    - `if_answer` answer=0 skip=2
    - `leave_parallel` 
    - `dialogue`
      > 諸葛亮: 主公，請下決心吧．這不光為您自己，也是為大家．
  - **r22** run(0) 그룹 8
    - `dialogue`
      > 諸葛亮: 噢，您同意了！
      > 劉備: 唉……我當漢中王．諸位，這樣行嗎？
      > 張飛: 誰會反對呢？啊，大家都贊成．
      > 趙雲: 大家當然都贊成．請漢中王今後多關照我們．
      > 黃忠: 漢中王萬歲！
      > 馬超: 恭喜您．家父在九泉之下，也會高興的．
    - `if_flags` 
    - `dialogue`
      > 龐統: 我們會更忠心地跟隨您．
    - `play_music` song=8
    - `narration`
      > 　劉備從曹操手裡奪取了漢中．這樣，劉備據有了荊州、益州和漢中，成為強大的蜀之主．孔明在隆中為劉備設計的魏、蜀、吳三分天下之計成功了．從此，劉備做了漢中王．

### 장면 4

제목: 第三章　蜀漢建國

- **블록 0**: 전투; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 전투 맵 45
  - 전투 설정: 턴 제한 50, 아군 출진 6명, 퇴각하면 패배 #1
  - 적군 명단: 16기
  - r0 소속: 關羽 → 유비군(합류)
  - r0 소속: 關平 → 유비군(합류)
  - r0 소속: 周倉 → 유비군(합류)
  - r0 소속: 王甫 → 유비군(합류)
  - r0 소속: 廖化 → 유비군(합류)
  - r0 소속: 趙累 → 유비군(합류)
  - r0 삽화 23
  - r0 삽화 24
  - r0 레벨 +10: 關羽
  - r0 레벨 +9: 關平
  - r0 레벨 +9: 周倉
  - r0 소속: 曹仁 → 군 1(이탈)
  - r0 소속: 滿寵 → 군 1(이탈)
  - r0 소속: 徐晃 → 군 1(이탈)
  - r0 소속: 呂建 → 군 1(이탈)
  - r0 소속: 徐商 → 군 1(이탈)
  - r0 소속: 弓兵隊 → 군 1(이탈)
  - r0 소속: 步兵隊 → 군 1(이탈)
  - r0 소속: 騎兵隊 → 군 1(이탈)
  - r0 소속: 騎兵隊 → 군 1(이탈)
  - **r0** run(0) 그룹 0
    - `op_3d` value=1
    - `play_music` song=11
    - `chapter_title` key=第三章　蜀漢建國
    - `title`
      > 第三章　蜀漢建國
    - `set_allegiance` person=關羽 army=0
    - `set_allegiance` person=關平 army=0
    - `set_allegiance` person=周倉 army=0
    - `set_allegiance` person=王甫 army=0
    - `set_allegiance` person=廖化 army=0
    - `set_allegiance` person=趙累 army=0
    - `show_picture` picture=23 variant=0
    - `narration`
      > 　曹操在聽說劉備自立為漢中王後，馬上派使者拜見吳主孫權，想與東吳共同出兵奪取關羽守衛的荊州．
      > 　孫權接受了曹操的建議．這就是魏吳同盟．
    - `show_picture` picture=24 variant=0
    - `narration`
      > 　曹操的動向很快被孔明知道了．根據孔明的策畫，關羽去攻打曹仁把守的樊城．
      > 　然而就在關羽即將拿下樊城時，東吳的呂蒙和陸遜趁虛佔領了荊州和江陵．
    - `narration`
      > 　關羽想奪回江陵，但在遭到呂蒙和曹仁的兩面夾擊後，連襄陽也被曹仁奪走了．
      > 　無立身之地的關羽在襄陽附近的麥城處於極端危險的境地．
    - `add_levels` person=關羽 levels=10
    - `add_levels` person=關平 levels=9
    - `add_levels` person=周倉 levels=9
    - `battle_setup` 
    - `battle_roster` 
    - `set_allegiance` person=曹仁 army=1
    - `set_allegiance` person=滿寵 army=1
    - `set_allegiance` person=徐晃 army=1
    - `set_allegiance` person=呂建 army=1
    - `set_allegiance` person=徐商 army=1
    - `set_allegiance` person=弓兵隊 army=1
    - `set_allegiance` person=步兵隊 army=1
    - `set_allegiance` person=騎兵隊 army=1
    - `set_allegiance` person=騎兵隊 army=1
    - `load_map` map=12333
- **블록 1**: 전투 준비; 레코드 10, 그룹 4; 대화 0(잡담 0)
  - 트리거: battle_lost, battle_won, turn, unit_at_cell
  - 목표 문구: 一、全殲敵人． 二、關羽到達西面鹿砦．
  - r3 아이템: 援軍書  
  - r4 아이템: 茶
  - r5 아이템: 援軍書  
  - r9 (run) 전투 끝
  - r9 소속: 關羽 → 무소속(이탈)
  - r9 소속: 關平 → 무소속(이탈)
  - r9 소속: 周倉 → 무소속(이탈)
  - r9 소속: 廖化 → 무소속(이탈)
  - r9 소속: 王甫 → 무소속(이탈)
  - r9 소속: 趙累 → 무소속(이탈)
  - r9 소속: 步兵隊 → 무소속(이탈)
  - r9 소속: 騎兵隊 → 무소속(이탈)
  - r9 소속: 騎兵隊 → 무소속(이탈)
  - r9 소속: 弓兵隊 → 무소속(이탈)
  - 플래그 켬: {58, 209, 210, 211}
  - 플래그 검사: {209, 210, 211}
  - **r0** run(0) 그룹 0
    - `begin_battle` 
  - **r1** run(0) 그룹 1
    - `play_music` song=11
    - `set_objective`
      > 一、全殲敵人．
      > 二、關羽到達西面鹿砦．
    - `dialogue`
      > 趙累: 關羽將軍，現在沒別的辦法，只有退回成都以求東山再起．到那時再讓他們交還荊州．
      > 王甫: 即使我們都死了，關羽將軍也要逃出去．只要能逃到西面的鹿砦就沒事了．
      > 關平: 曹操軍馬上就要追來了．父親，快離開這片樹林吧．
      > 周倉: 我一定拼死護衛您！
      > 關羽: 唉……，大家都不能死，要活著離開這裡！
      > 呂蒙: 不能讓他們活著逃離樹林．否則我們就動不了手了．一定要在他們離開樹林前消滅他們！
    - `play_music` song=16
  - **r2** turn(9) 그룹 2*
    - `dialogue`
      > 關羽: 嗯！追兵來了！
    - `join_battle` person=曹仁
    - `join_battle` person=滿寵
    - `join_battle` person=徐晃
    - `join_battle` person=呂建
    - `join_battle` person=徐商
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=弓兵隊
    - `join_battle` person=步兵隊
    - `caption`
      > 曹操軍出現了！
    - `dialogue`
      > 曹仁: 不能讓吳把功勞搶走了，關羽的首級就由我們來取吧！
      > 呂蒙: 那可不行．關羽的首級要由吳來取！
  - **r3** unit_at_cell(6) [(any unit)] 그룹 2
    - `if_flags` 
    - `add_item` item=援軍書  
    - `set_flag` flag=209 clear=0
  - **r4** unit_at_cell(6) [(any unit)] 그룹 2
    - `if_flags` 
    - `add_item` item=茶
    - `set_flag` flag=210 clear=0
  - **r5** unit_at_cell(6) [(any unit)] 그룹 2
    - `if_flags` 
    - `add_item` item=援軍書  
    - `set_flag` flag=211 clear=0
  - **r6** battle_lost(8) 그룹 2 — 그룹 넘김
    - `play_music` song=4
    - `dialogue`
      > 關羽: 兄長，自從桃園結義以來，我一直跟隨著你．可是今天我命將休矣．請你替我實現沒能完成的夢想．……兄長，三弟，永別了！
    - `narration`
      > 　關羽被活捉後斬首．
    - `leave_parallel` 
  - **r7** unit_at_cell(6) [關羽] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 呂蒙: 完了！被關羽逃走了，這樣將後患無窮．決不能讓關羽跑掉！
    - `play_music` song=2
    - `narration`
      > 　關羽逃離了戰場．
    - `set_flag` flag=58 clear=0
    - `leave_parallel` 
  - **r8** battle_won(7) 그룹 2 — 그룹 넘김
    - `dialogue`
      > 關羽: 趁敵人援軍還沒趕到之前，快走．
    - `play_music` song=7
    - `narration`
      > 　關羽逃離了戰場．
    - `set_flag` flag=58 clear=0
    - `leave_parallel` 
  - **r9** run(0) 그룹 3
    - `battle_end` next_map=4096
    - `set_allegiance` person=關羽 army=14
    - `set_allegiance` person=關平 army=14
    - `set_allegiance` person=周倉 army=14
    - `set_allegiance` person=廖化 army=14
    - `set_allegiance` person=王甫 army=14
    - `set_allegiance` person=趙累 army=14
    - `set_allegiance` person=步兵隊 army=14
    - `set_allegiance` person=騎兵隊 army=14
    - `set_allegiance` person=騎兵隊 army=14
    - `set_allegiance` person=弓兵隊 army=14
- **블록 2**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 마을 22
  - r0 삽화 25
  - **r0** run(0) 그룹 0
    - `load_map` map=8214
    - `play_music` song=11
    - `narration`
      > 　後來，曹操生病的消息傳得到處都知道了．……這裡是鄴城曹操的官邸．
    - `caption`
      > 鄴城曹操官邸
    - `dialogue`
      > 曹操: ……要統一天下談何容易啊．我擁有如此強大的實力……也沒有做到．
      > 曹洪: 您說什麼，不要氣餒啊．
      > 曹操: 我快不行了．我死以後，……曹丕繼承我的位子．曹丕，到這裡來．
      > 曹丕: 是．
    - `dialogue`
      > 曹操: 你來繼承我的位子．我死以後，吳蜀必然要發生衝突，這時你千萬不要輕舉妄動．等他們分出勝負後，再慢慢收拾那個勝利的國家．你一定要記住，千萬不要做錯！否則滅亡的是我們．
      > 曹丕: 我記住了．我一定不辜負父親厚望．
      > 曹操: ……如果你做錯了，我不會放過你．我會從陰曹地府中回來找你的．
      > 曹丕: 是！是！
      > 曹操: 唉，……那我就放心地去了．各位，多保重……
    - `dialogue`
      > 賈詡: 主公！嗚嗚……
      > 司馬懿: ……
    - `dialogue`
      > 曹丕: 那麼從今天起，國家就由我來執掌．你們要像對我父親那樣向我盡忠．
      > 曹洪: 是．
    - `show_picture` picture=25 variant=1
    - `narration`
      > 　隨後，繼承父親曹操之位的曹丕實現了他的篡位野心．
      > 　獻帝被廢除後流放了．漢朝到此就滅亡了，從而結束了其長達四個世紀的歷史．
- **블록 3**: 전투 준비; 레코드 21, 그룹 10; 대화 12(잡담 9); 맵: 마을 5, 지도
  - 전투 설정: 턴 제한 40, 아군 출진 12명, 격파 대상 #41, 퇴각하면 패배 #0
  - 트리거: condition
  - 목표 문구: 商討今後 / 回答諸葛瑾的結盟提案
  - 질문 r13 (諸葛瑾): 예 답이면 4 명령 실행, 출진 확인 [leave_parallel]
  - 선택지 r14: 「結盟」 r15 → 다시 물음; 「不結盟」 r16 → 진행
  - r15 아이템: 孫子兵法    
  - r18 소속: 趙雲 → 무소속(이탈)
  - r18 소속: 諸葛亮 → 무소속(이탈)
  - r18 소속: 馬超 → 무소속(이탈)
  - r18 소속: 馬岱 → 무소속(이탈)
  - r19 소속: 張飛 → 무소속(이탈)
  - 플래그 켬: {132, 135}
  - 플래그 검사: {58}
  - **r0** run(0) 그룹 0
    - `load_map` map=8197
    - `set_previous_map` map=12 x=25 y=5
    - `caption`
      > 成都議事廳
    - `narration`
      > 　關羽情況危急的消息已經傳到了蜀的首府成都．由於劉備得到消息後舉棋不定，以致造成了關羽敗走麥城的惡果．
  - **r1** run(0) 그룹 1
    - `play_music` song=2
    - `if_flags` 
    - `dialogue`
      > 使者: 稟報主公，大勢不好！關羽被呂蒙打敗，關將軍據說已被害．
      > 劉備: 什麼！……
      > 張飛: 你這個混蛋，不許胡說，二哥不會死．
      > 使者: 可，可是這是千真萬確的事實……
    - `if_flags` 
    - `dialogue`
      > 使者: 稟報主公，關羽的荊州軍被呂蒙擊潰了．
      > 劉備: 什麼！……
      > 張飛: 關羽怎麼樣？
      > 使者: 這……還沒有確切的消息．雖沒有看見遺體，恐怕也……
    - `dialogue`
      > 張飛: 關羽絕不會死！那不可能，那不可能……
    - `dialogue`
      > 張飛: 大哥，你也這麼認為吧．
      > 劉備: ……
      > 張飛: 大哥，你就說是這麼想的吧……東吳狗賊，竟敢對二哥……
      > 劉備: 張飛……我與你一樣，但是現在需要冷靜．
      > 張飛: 東吳狗賊，我要讓你們付出代價！
      > 劉備: 什麼……關羽……這不是真的……
      > 使者: 那我先退下去了．
    - `dialogue`
      > 劉備: 關羽……你怎麼能這樣就……我們不是對天起過誓嗎？你怎麼這麼快就去了？……
    - `play_music` song=11
    - `dialogue`
      > 武官: 主公，我剛從許昌回來，有大事稟報．
    - `set_objective`
      > 商討今後
  - **r2** talk(3) [諸葛亮] 그룹 2*
    - `dialogue`
      > 諸葛亮: 許昌發生了什麼事，聽聽使者報告吧．
  - **r3** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 畜生！東吳狗賊！孫權混蛋！大哥，什麼時候出師伐吳？我一定要去！
  - **r4** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 雖然我們丟失了荊州，但現在需要冷靜，不要太激動了．
  - **r5** talk(3) [武官] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 劉備: 不要著急．發生了什麼事？
      > 武官: 首先是曹操死了，他的長子曹丕繼位．
      > 劉備: 什麼？曹操死了？！……還有什麼事？
      > 武官: 曹丕繼位後，廢掉了獻帝，自己當上皇帝，改國號為“魏”．
      > 劉備: 什麼！那獻帝怎麼樣了？
      > 武官: ……據說被趕出了許昌，放逐到荒郊，寂寞度日．
    - `dialogue`
      > 劉備: 豈有此理……難道我畢生的奮鬥目標重振漢室就這樣毀於曹丕之手嗎？只因我力量不夠啊……
      > 武官: 那我先退了．
    - `dialogue`
      > 劉備: 我，還有關羽終生追求的重振漢室的理想難道實現不了了嗎？怎麼會這樣？
    - `dialogue`
      > 文官: 主公，諸葛瑾來了．
      > 劉備: 誰？好吧，叫他進來．
      > 文官: 是．
    - `dialogue`
      > 張飛: 是東吳的使者？偷襲了關羽，現在還到這裡來幹什麼？大哥，殺了他吧．
      > 劉備: ……不能這樣．先問問他想說什麼，再殺他也不遲．
      > 張飛: 媽的！還敢厚著臉皮來啊！
    - `dialogue`
      > 諸葛瑾: 諸葛瑾作為吳國特使前來求見．
    - `narration`
      > 　現在出現的諸葛瑾，是諸葛亮的哥哥．年齡比諸葛亮大很多．在孔明很小的時候就開始為吳國效力．
      > 　孫權非常信任他．這次派他來蜀國，就證明了這點．
    - `dialogue`
      > 張飛: 嗤！吳國狗賊，派我們軍師的哥哥來當使者，太卑鄙了．這樣我可不好下手了．
      > 諸葛亮: ……先聽聽我哥哥說什麼吧．
    - `leave_parallel` 
  - **r6** talk(3) [諸葛亮] 그룹 3*
    - `dialogue`
      > 諸葛亮: 主公，我很了解你的心情，可是請看在我的面子上不要殺了我哥哥．
  - **r7** talk(3) [張飛] 그룹 3
    - `dialogue`
      > 張飛: 畜生，孫權狗賊！派使者來幹什麼？
      > 如果不是軍師的哥哥，我早就把他殺了．
  - **r8** talk(3) [趙雲] 그룹 3
    - `dialogue`
      > 趙雲: 主公，現在請控制情緒，不要感情用事．
  - **r9** talk(3) [諸葛瑾] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 劉備: 諸葛瑾，你來有何貴幹？
      > 諸葛瑾: 曹丕稱帝的消息想必皇叔已經知道了．這種事我們也難以容忍．我此次來，就是想與魏廢除盟約，而與蜀國結盟．如果締結了盟約，我們打算奉還荊州．請您能給我一個滿意的答覆．
    - `set_objective`
      > 回答諸葛瑾的結盟提案
    - `leave_parallel` 
  - **r10** talk(3) [諸葛亮] 그룹 4*
    - `dialogue`
      > 諸葛亮: 我認為不應與吳作戰．如果我們與吳國交戰，得利的是魏國．現在應忘記荊州和關羽，與吳結盟．
  - **r11** talk(3) [張飛] 그룹 4
    - `dialogue`
      > 張飛: 不要聽他胡說．二哥如此慘遭殺害，這豈能忘掉．大哥，決不能結盟．
  - **r12** talk(3) [趙雲] 그룹 4
    - `dialogue`
      > 趙雲: 我覺得應該與吳結盟．伐吳是主公的私事，不會得到天下人的響應．
  - **r13** talk(3) [諸葛瑾] 그룹 4 — 그룹 넘김
    - `dialogue`
      > 諸葛瑾: 您作出決定了嗎？
    - `if_answer` answer=0 skip=4
    - `op_3d` value=0
    - `dialogue`
      > 諸葛瑾: 那就請您答覆．
    - `leave_parallel` 
  - **r14** condition(1) 그룹 5*
    - `choice`
      > 結盟
      > 不結盟
  - **r15** run(0) 그룹 5
    - `dialogue`
      > 諸葛瑾: 噢，謝謝．我馬上去向吳侯報喜訊．這是吳國的一點心意，請您笑納．
    - `add_item` item=孫子兵法    
    - `dialogue`
      > 諸葛瑾: 那我馬上回去報告我家主公．
    - `dialogue`
      > 諸葛亮: 主公，您作出了正確的決斷．但您內心一定很痛苦吧．
      > 劉備: ……吳國確實可恨，但現在不能與吳爭鬥．應先討伐曹丕，重興漢室．張飛，請你諒解我．
      > 張飛: ……以前我信任大哥，……今後也會．
      > 劉備: 張飛，謝謝．
    - `set_flag` flag=132 clear=0
    - `set_flag` flag=135 clear=0
    - `end_event` 
  - **r16** run(0) 그룹 5 — 그룹 넘김
    - `play_music` song=12
    - `dialogue`
      > 劉備: 你回去對孫權說，我忘不了奪去荊州和殺害關羽的仇恨．想結盟，做夢！
      > 諸葛瑾: 這……，劉備大人，請您三思……
      > 諸葛亮: 是的．現在與吳作戰，只會讓曹丕高興．請……
      > 劉備: 住口，孔明！你能體會到手足被害的心情嗎？
      > 諸葛亮: ……
      > 劉備: 你馬上回去傳話吧，蜀選擇戰爭．如果你不是諸葛軍師的哥哥，我不會讓你活著回去．
    - `leave_parallel` 
  - **r17** run(0) 그룹 6
    - `if_flags` 
    - `dialogue`
      > 張飛: 到底是我的大哥！我馬上就去準備．
      > 劉備: 張飛，不要太著急．
      > 張飛: 已經等了這麼長時間，不能再慢吞吞了．大哥也快點準備吧．
    - `if_flags` 
    - `dialogue`
      > 張飛: 大哥，下令出征吧．
    - `set_flag` flag=135 clear=0
  - **r18** run(0) 그룹 7
    - `dialogue`
      > 諸葛亮: ……
      > 劉備: 孔明，對不起．剛才我過分了．
      > 諸葛亮: 沒有關係．我也有錯．
      > 劉備: 孔明，應該怎樣伐吳？
      > 諸葛亮: 先攻下西陵城，再以那裡為據點，然後再進軍．
      > 劉備: 嗯，孔明，你留下抵禦曹丕，趙雲、馬超輔佐你．
    - `set_allegiance` person=趙雲 army=14
    - `set_allegiance` person=諸葛亮 army=14
    - `set_allegiance` person=馬超 army=14
    - `set_allegiance` person=馬岱 army=14
    - `dialogue`
      > 劉備: 出征．
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 馬良: 西陵在去江陵的路上，快出發吧．
  - **r19** run(0) 그룹 8
    - `if_flags` 
    - `dialogue`
      > 劉備: 要為關羽報仇……嗯，那不是吳班嗎？
      > 吳班: 主公……
      > 劉備: 怎麼啦？神色慌張，出什麼事了？
    - `play_music` song=4
    - `dialogue`
      > 吳班: 稟報主公，……張飛被部下范疆、張達殺害了．
      > 劉備: 什麼！這次出師，最高興的就是張飛．那抓到范疆、張達了嗎？
      > 吳班: 他們都逃到東吳去了．
      > 劉備: 關羽、張飛，你們都離我而去了．可是……，關羽、張飛，我不會失敗，一定會為你們報仇．
    - `set_allegiance` person=張飛 army=14
    - `if_flags` 
    - `dialogue`
      > 劉備: 要為關羽報仇．噢，張飛來了啊．
      > 張飛: 大哥，對不起，我來晚了．我回去做了些準備，時間就過了．
      > 劉備: 好，現在人到齊了．進軍西陵！
    - `op_3d` value=1
    - `dialogue`
      > 馬良: 主公，請編隊．
    - `battle_setup` 
    - `play_music` song=3
    - `dialogue`
      > 劉備: 向西陵進軍．
  - **r20** run(0) 그룹 9
    - `load_map` map=8197
    - `play_music` song=11
    - `caption`
      > 江陵議事廳
    - `narration`
      > 　此時，已經擔任東吳都督的陸遜正在江陵向武將們講解自己的策略．
      > 　東吳歷任都督是周瑜、魯肅、呂蒙，現在是陸遜．陸遜以前從未指揮過戰役，這次任命是破格提拔．
    - `narration`
      > 　使關羽失去荊州的主要原因不是呂蒙，而是陸遜．陸遜向呂蒙講授了如何使關羽疏忽大意，並趁機奪取荊州的計謀．呂蒙對陸遜的睿智深為驚異，並舉薦他為自己的後任．
    - `dialogue`
      > 韓當: 嗯，都督，您不打算增援西陵了？
      > 陸遜: 西陵並不重要，我想那裡的守將孫桓應該知道這一點．放棄西陵並不是失敗．
      > 韓當: 什麼！我不同意！
      > 陸遜: 我是吳侯親自任命的都督，你要聽我的命令，決不能出征．
      > 韓當: 媽的……怕死的膽小鬼……
      > 陸遜: 你說什麼？
      > 韓當: 沒有，我什麼也沒說．
      > 陸遜: 是嗎？那樣最好．諸位將軍也要服從我的命令，我的話完了．
- **블록 4**: 전투; 레코드 7, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 43, 지도
  - 적군 명단: 20기
  - 트리거: battle_won, unit_contact
  - 목표 문구: 一、孫桓敗退． / 進西陵城
  - r0 소속: 關興 → 유비군(합류)
  - r0 소속: 張苞 → 유비군(합류)
  - r0 소속: 劉禪 → 유비군(합류)
  - r3 일기토
  - r3 레벨 +1: 張苞
  - r4 일기토
  - r4 레벨 +1: 關興
  - r6 (run) 전투 끝
  - **r0** run(0) 그룹 0
    - `set_allegiance` person=關興 army=0
    - `set_allegiance` person=張苞 army=0
    - `set_allegiance` person=劉禪 army=0
    - `battle_roster` 
    - `load_map` map=12331
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、孫桓敗退．
    - `dialogue`
      > 劉備: 眾將官，要為關羽報仇，向孫權軍雪恨！
      > 孫桓: 哎呀呀……大家一定要守住，等待援軍的到來．
    - `play_music` song=12
    - `join_battle` person=關興
    - `dialogue`
      > 關興: 主公，我來遲了，對不起．我是關羽的兒子關興．
      > 我此次來是為了報父仇，請讓我加入戰鬥．
    - `join_battle` person=張苞
    - `dialogue`
      > 張苞: 我豈能落在關興後面？主公，我是張飛之子張苞，此次作戰我也要參加．
    - `join_battle` person=劉禪
    - `dialogue`
      > 劉禪: 父親，請帶我去．不過，刀箭很可怕呀．
    - `caption`
      > 劉禪、張苞、關興成為部下！
    - `play_music` song=14
  - **r3** unit_contact(4) [張苞] 그룹 3*
    - `dialogue`
      > 張苞: 敵將何在！我是張飛之子張苞！
      > 謝旌: 喔，你就是張飛的兒子．我來教訓你！
    - `duel` first=張苞 second=謝旌
    - `duel_begin` 
    - `dialogue`
      > 張苞: 殺！
    - `duel_action` person=張苞 action=10
    - `dialogue`
      > 謝旌: 哎呀！
    - `duel_action` person=謝旌 action=3
    - `duel_action` person=張苞 action=9
    - `duel_action` person=張苞 action=2
    - `dialogue`
      > 張苞: 殺死了敵將！
    - `duel_end` 
    - `add_levels` person=張苞 levels=1
    - `caption`
      > 張苞等級上升了！
  - **r4** unit_contact(4) [關興] 그룹 3
    - `dialogue`
      > 關興: 我是關羽的兒子關興，誰敢與我單挑！
      > 李異: 黃毛小兒，休得猖狂！我來了！
    - `duel` first=關興 second=李異
    - `dialogue`
      > 李異: 你就是關興？還在想爸爸吧．
      > 關興: 住口！你給我過來！
      > 李異: 過去又怎樣．
    - `duel_action` person=關興 action=8
    - `dialogue`
      > 李異: 一刀結果你……
    - `duel_action` person=李異 action=3
    - `duel_action` person=關興 action=9
    - `duel_action` person=關興 action=5
    - `dialogue`
      > 關興: 這種對手也敢口出狂言？
    - `duel_end` 
    - `add_levels` person=關興 levels=1
    - `caption`
      > 關興等級上升了！
  - **r5** battle_won(7) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 孫桓: 混蛋！……撤退！
    - `leave_parallel` 
  - **r6** run(0) 그룹 4
    - `play_music` song=7
    - `narration`
      > 　劉備軍大敗孫桓軍．
    - `data` kind=2 value=1400
    - `caption`
      > 繳獲黃金１４００！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 馬良: 那麼進西陵城吧．
    - `set_objective`
      > 進西陵城
- **블록 5**: 전투 준비; 레코드 20, 그룹 6; 대화 14(잡담 12); 맵: 마을 4, 마을 5, 지도
  - 전투 설정: 턴 제한 50, 아군 출진 15명, 격파 대상 #150, 퇴각하면 패배 #0
  - 트리거: condition
  - 목표 문구: 回答諸葛瑾的結盟提案
  - 질문 r15 (諸葛瑾): 예 답이면 4 명령 실행, 출진 확인 [leave_parallel]
  - 선택지 r16: 「結盟」 r17 → 다시 물음; 「不結盟」 r18 → 진행
  - r17 아이템: 吳子兵法    
  - 플래그 켬: {136}
  - 플래그 검사: {135}
  - **r0** run(0) 그룹 0
    - `load_map` map=8197
    - `play_music` song=11
    - `caption`
      > 江陵議事廳
    - `dialogue`
      > 武官: 孫桓軍被劉備擊敗，正往這裡退卻．
      > 陸遜: 孫桓怎麼樣？
      > 武官: 他沒什麼事．
      > 陸遜: 是嗎？那太好了．你辛苦了．
      > 武官: 我退下去了．
    - `dialogue`
      > 韓當: 有什麼好的，是我們吃敗仗啊！
      > 陸遜: 這次失敗在我預料之中．第一，劉備軍進攻士氣正旺，勢不可擋．硬要抗拒他們，我軍會有很大傷亡．
      > 韓當: ……
      > 陸遜: 與其與他們正面對抗，不如靜觀其動向，他們不久就會疲憊的．那時我們再進攻，必能打敗他們．
      > 韓當: 那會是什麼時候？
      > 陸遜: 不知道．可能兩年，也可能三年．
      > 韓當: 都督閣下！
      > 陸遜: 哈哈哈．我開玩笑．不久劉備軍就會等得不耐煩，而前來進攻江陵，那時候就是我們進攻的時候．
      > 韓當: ……
  - **r1** run(0) 그룹 1
    - `load_map` map=8196
    - `set_previous_map` map=23 x=28 y=5
    - `if_flags` 
    - `play_music` song=5
    - `caption`
      > 西陵議事廳
    - `dialogue`
      > 馬良: 主公，諸葛瑾來求見．
      > 劉備: 他又來了．讓他進來．
      > 馬良: 是．
    - `dialogue`
      > 諸葛瑾: 劉備大人，我諸葛瑾又來了．
    - `set_objective`
      > 回答諸葛瑾的結盟提案
  - **r2** talk(3) [劉禪] 그룹 2*
    - `dialogue`
      > 劉禪: 父親，這個地方不舒服．
  - **r3** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 大哥，答覆其實早有了．
  - **r4** talk(3) [張苞] 그룹 2
    - `if_flags` 
    - `dialogue`
      > 張苞: 關興的父親被東吳殺了，不能就此罷休．
    - `if_flags` 
    - `dialogue`
      > 張苞: 父親是死於東吳之手，決不能放過他們．
  - **r5** talk(3) [關興] 그룹 2
    - `dialogue`
      > 關興: 殺父之仇，不共戴天．主公，請允許我殺了這個傢伙．
      > 劉備: 不可，他畢竟是孔明的哥哥，你要忍忍．
  - **r6** talk(3) [黃忠] 그룹 2
    - `dialogue`
      > 黃忠: 最近年輕人生龍活虎，屢立戰功，難道我老了，不中用了……
  - **r7** talk(3) [馬良] 그룹 2
    - `dialogue`
      > 馬良: 主公，請與諸葛瑾交談．
  - **r8** talk(3) [諸葛瑾] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 劉備: 又是為結盟而來的吧．
    - `if_flags` 
    - `dialogue`
      > 諸葛瑾: 是的，我家主公願意把謀害張飛的兇手交還給蜀國，並且願意歸還荊州．希望與蜀國結盟修好，今後不斷加深兩國的友誼，劉備大人，你意下如何？
      > 劉備: ……
    - `if_flags` 
    - `dialogue`
      > 諸葛瑾: 我家主公非常後悔與魏國結盟，所以想與魏國絕交，改與蜀國結盟修好，今後不斷加深兩國的友誼，劉備大人，你意下如何？
      > 劉備: ……
    - `leave_parallel` 
  - **r9** talk(3) [劉禪] 그룹 3*
    - `dialogue`
      > 劉禪: 父親，這個地方不舒服．
  - **r10** talk(3) [張飛] 그룹 3
    - `dialogue`
      > 張飛: 大哥，答覆其實早有了．
  - **r11** talk(3) [張苞] 그룹 3
    - `if_flags` 
    - `dialogue`
      > 張苞: 關興的父親被東吳殺了，不能就此罷休．
    - `if_flags` 
    - `dialogue`
      > 張苞: 父親是死於東吳之手，決不能放過他們．
  - **r12** talk(3) [關興] 그룹 3
    - `dialogue`
      > 關興: 殺父之仇，不共戴天．主公，請允許我殺了這個傢伙．
      > 劉備: 不可，他畢竟是孔明的哥哥，你要忍忍．
  - **r13** talk(3) [黃忠] 그룹 3
    - `dialogue`
      > 黃忠: 最近年輕人生龍活虎，屢立戰功，難道我老了，不中用了……
  - **r14** talk(3) [馬良] 그룹 3
    - `dialogue`
      > 馬良: 主公，我們大敗孫桓率領的孫權軍，應該說，在某種程度上已經雪恨了，如果再處死那些叛逆，就再也沒有仇恨了．所以，我覺得應該與吳結盟．
  - **r15** talk(3) [諸葛瑾] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 諸葛瑾: 劉備大人，您決定了嗎？
    - `if_answer` answer=0 skip=4
    - `op_3d` value=0
    - `dialogue`
      > 諸葛瑾: 劉備大人，您將做何答覆？
    - `leave_parallel` 
  - **r16** condition(1) 그룹 4*
    - `choice`
      > 結盟
      > 不結盟
  - **r17** run(0) 그룹 4
    - `dialogue`
      > 諸葛瑾: 噢，謝謝．我馬上去向吳侯報喜訊．這是吳國的一點心意，請您笑納．
    - `add_item` item=吳子兵法    
    - `dialogue`
      > 諸葛瑾: 那我馬上回去報告我家主公．
    - `dialogue`
      > 馬良: 主公，您作出了正確的決斷．但您內心一定很痛苦吧．
      > 劉備: ……吳國確實可恨，但現在沒時間為關羽悲傷．現在應該討伐曹丕，重興漢室．
    - `set_flag` flag=136 clear=0
    - `end_event` 
  - **r18** run(0) 그룹 4 — 그룹 넘김
    - `play_music` song=12
    - `dialogue`
      > 劉備: 諸葛瑾，我的答覆沒有變，你還是回去吧．
      > 諸葛瑾: 劉備大人，請您慎重考慮一下．
      > 劉備: 這不能說服我，你回去吧．
    - `leave_parallel` 
  - **r19** run(0) 그룹 5
    - `dialogue`
      > 馬良: 主公，現在應該與他們修好．
      > 劉備: 不要再說了，我意已決．
      > 馬良: ……我知道了．那就考慮進攻吧．聽說吳國都督是陸遜．
      > 劉備: 陸遜？沒聽說過呀．
      > 馬良: 雖然他名聲不大，但我聽說此人深有謀略，主公不可小看他．
    - `dialogue`
      > 馬良: 請列隊．
    - `battle_setup` 
    - `dialogue`
      > 劉備: 出征．
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 劉備: 敵人在江陵，快跟上！
    - `play_music` song=11
    - `dialogue`
      > 陸遜: 什麼！劉備出動了．我等候他多時了．現在正是擊潰劉備的最好時機，全軍，進軍彝陵！
- **블록 6**: 전투; 레코드 8, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 44, 지도
  - 적군 명단: 30기
  - 트리거: battle_lost, battle_won, turn, unit_contact
  - 목표 문구: 一、陸遜敗退．
  - r3 일기토
  - r3 소속: 沙摩可 → 무소속(이탈)
  - r5 (battle_won) 전투 끝
  - r5 (battle_won) → 블록 8
  - r6 (battle_lost) 전투 끝
  - 플래그 검사: {135}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12332
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、陸遜敗退．
    - `dialogue`
      > 陸遜: 呵呵呵．孔明不在這裡真乃天助我也，只有他才能識破我的戰略．劉備真是個糊塗蟲，竟敢率軍冒然突進．看來劉備的氣數已盡．
      > 韓當: 都督，起風了．
      > 陸遜: 好啊．這裡是通風之處，而且地勢狹窄，我就在這裡等候劉備．
      > 韓當: 都督所言極是．……都督，你有如此妙計，我卻對您無禮，實在對不起．
      > 陸遜: 行了，等打完這一仗再說這事也不遲．好，放火！燒盡劉備軍！
    - `dialogue`
      > 馬良: 主，主公．大事不好！敵人用火攻了．
      > 劉備: 唉……現在我軍眾多倒成為累贅了．前方道路越來越窄了．
    - `halve` a=0 b=1
    - `halve` a=0 b=1
    - `halve` a=0 b=0
    - `dialogue`
      > 陸遜: 取勝的時機到了！不要放走了劉備！吳國的命運在此一戰！
    - `play_music` song=10
  - **r3** unit_contact(4) [周泰] 그룹 3*
    - `dialogue`
      > 周泰: 怎麼？這支部隊是？主將是誰？
      > 沙摩可: 我就是主將．
      > 周泰: 嚇，是蠻族啊，一看你就知道是蠻族，我還是第一次見到蠻族．好，與我單挑吧．
      > 沙摩可: 好，來吧！
    - `duel` first=周泰 second=沙摩可
    - `duel_begin` 
    - `dialogue`
      > 周泰: 招！怎麼只有招架之功．
    - `duel_begin` 
    - `dialogue`
      > 沙摩可: 唉呀……太累了……
      > 周泰: 你怎麼了，動作這麼慢？
    - `duel_action` person=周泰 action=1
    - `duel_action` person=周泰 action=0
    - `dialogue`
      > 沙摩可: 嘿！這幾下怎麼樣？
    - `duel_action` person=沙摩可 action=0
    - `duel_action` person=沙摩可 action=1
    - `dialogue`
      > 沙摩可: 哈哈……
      > 周泰: 你好像累了，我送你去歇歇．
    - `duel_action` person=周泰 action=7
    - `dialogue`
      > 沙摩可: 啊……！
    - `duel_action` person=沙摩可 action=3
    - `dialogue`
      > 沙摩可: 我命休矣……
    - `duel_end` 
    - `set_allegiance` person=沙摩可 army=14
  - **r4** turn(9) 그룹 3
    - `dialogue`
      > 陸遜: 哈哈哈．機不可失！全軍總攻！劉備，這次你休想逃脫．
  - **r5** battle_won(7) 그룹 3
    - `dialogue`
      > 陸遜: 真倒霉！好不容易有此良機……全軍撤退！
    - `play_music` song=7
    - `narration`
      > 　陸遜敗退了，劉備軍戰勝了陸遜軍．
    - `data` kind=2 value=1400
    - `caption`
      > 繳獲了黃金１４００！
    - `battle_end` next_map=4096
    - `goto_block` block=8
  - **r6** battle_lost(8) 그룹 3 — 그룹 넘김
    - `play_music` song=4
    - `dialogue`
      > 劉備: 唉，難道我要死在這裡嗎……
      > 關興: 主公，不要氣餒！我們撤到白帝城吧．
      > 張苞: 我們來殿後．主公，快撤！
      > 劉備: 喔，關興，張苞．好吧，撤退回白帝城．
      > 陸遜: 劉備怎麼了？看見他了嗎？什麼！被他跑掉了……算了，劉備再也沒有實力了，現在我最擔心的是魏國．好，全軍馬上去防備魏軍．
    - `narration`
      > 　劉備退到了白帝城．
    - `battle_end` next_map=4096
    - `leave_parallel` 
  - **r7** run(0) 그룹 4
    - `load_map` map=4096
    - `if_flags` 
    - `dialogue`
      > 張飛: 大哥，你沒事吧．
      > 劉備: 是你呀，張飛．對不起……我沒能給關羽報仇．
      > 張飛: 大哥，不要害怕！關羽還活著！
      > 劉備: 唉……唉……哇！
      > 張飛: 啊，大哥，振作些！
    - `if_flags` 
    - `dialogue`
      > 劉備: 關羽，張飛，對不起．沒能殺死你們的仇人，請原諒你們的大哥……
- **블록 7**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 마을 22
  - r0 엔딩
  - 플래그 검사: {58, 135}
  - **r0** run(0) 그룹 0
    - `load_map` map=8214
    - `if_flags` 
    - `play_music` song=2
    - `op_3d` value=1
    - `if_flags` 
    - `dialogue`
      > 劉備: 張飛，對不起．關羽的仇沒能報……
      > 張飛: 說什麼呀！大哥，求求你！不要讓我一個人留下．
      > 劉備: 哈哈哈……到什麼時候你都還是急脾氣……張飛，我的天壽也到盡頭了．
      > 張飛: 大哥，振作些！
    - `dialogue`
      > 劉備: 孔明，多虧了你，我才能奪得漢中，才有今天這樣的局面．
      > 這次，我沒聽你的勸告而去討伐東吳，以致遭到如此慘敗，這是報應啊．
    - `if_flags` 
    - `dialogue`
      > 諸葛亮: 主公，不要再想這些了．我心裡連一次都沒報怨過你．
      > 劉備: 唉．……孔明，我有一事相求．
      > 諸葛亮: 什麼事啊？
      > 劉備: 老天已經在召喚我啦．我是想讓劉禪繼位．可是劉禪不成器，必要的時候請你取而代之．孔明，只有你才能消滅曹丕．
      > 諸葛亮: 主公，不要那麼想，我孔明誓死效忠蜀國．嗚嗚……
      > 劉備: 謝謝．……趙雲，我們同甘共苦到今天，我在這裡與你告別很傷感啊．
      > 趙雲: 主，主公……
    - `if_flags` 
    - `dialogue`
      > 劉備: 希望大家盡力輔佐劉禪．
      > 諸葛亮: 主公！主公……！
      > 趙雲: 嗚……，嗚……！
    - `if_flags` 
    - `dialogue`
      > 張飛: 大哥！為什麼把我扔在一邊都不理我！
    - `if_flags` 
    - `dialogue`
      > 劉備: ……對不起，讓我一個人靜一靜，我有些累了……
      > 諸葛亮: ……是，臣告退……
    - `dialogue`
      > 劉備: 呼呼……．…………嗯？是誰？
    - `dialogue`
      > 關羽: 兄長，我來接你了．
      > 劉備: 噢，關羽！你還活著啊！
      > 關羽: 不，我已經死了．張飛也……
    - `dialogue`
      > 張飛: 大哥，我和關羽已先來到這裡．大哥也累了吧．怎麼樣？來不來這裡？
      > 劉備: 是啊……．好吧……．
    - `dialogue`
      > 諸葛亮: 噢，怎麼回事！怎麼會是……關羽？還有張飛！
    - `dialogue`
      > 關羽: 兄長，走吧……
      > 諸葛亮: 等一等！關羽求求你，先別把主公從這個世界上帶走！
    - `dialogue`
      > 張飛: 大哥，我們在等著你呢……．
      > 諸葛亮: 主公！！
    - `dialogue`
      > 諸葛亮: 主公！你要好好考慮！
      > 劉備: 關羽、張飛，現在走吧……．
      > 諸葛亮: ……！主公！！主公……！！
    - `narration`
      > 　公元２２３年，劉備沒有完成恢復漢室的大業便駕崩了．
    - `op_3d` value=1
    - `ending` ending=3
- **블록 8**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 지도
  - **r0** run(0) 그룹 0
    - `load_map` map=4096
    - `play_music` song=11
    - `dialogue`
      > 陸遜: 什麼，曹丕打過來了？不好！我們還沒消滅蜀國．看來這次也得派使者與蜀國結盟了．快返回吳！
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 劉備: 很危險啊．陸遜這個人不可小看啊．
      > 馬良: 主公，陸遜也撤走了，我們回成都吧．然後再按丞相的意思與吳國結盟如何？
      > 劉備: 由於我這一怒之下犯了大錯，以致失去了那麼多愛將．……與吳結盟吧．
    - `end_event` 
