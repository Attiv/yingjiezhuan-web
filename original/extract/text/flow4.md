# 시나리오 흐름: SNR4D.R3 (원문 포함, 이 컴퓨터에만 둘 것)

## SNR4D.R3 + SNR4M.R3

### 장면 0

제목: 第四章　奪回荊州

- **블록 0**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 마을 5
  - r0 소속: 諸葛亮 → 유비군(합류)
  - r0 소속: 趙雲 → 유비군(합류)
  - r0 소속: 馬超 → 유비군(합류)
  - r0 소속: 馬岱 → 유비군(합류)
  - r0 삽화 26
  - **r0** run(0) 그룹 0
    - `set_allegiance` person=諸葛亮 army=0
    - `set_allegiance` person=趙雲 army=0
    - `set_allegiance` person=馬超 army=0
    - `set_allegiance` person=馬岱 army=0
    - `play_music` song=0
    - `chapter_title` key=第四章　奪回荊州
    - `title`
      > 第四章　奪回荊州
    - `show_picture` picture=26 variant=0
    - `narration`
      > 　劉備為消滅魏國曹丕，已與東吳結為同盟．
      > 　一心想復興漢室的蜀國，與妄想擴張領土的吳國，各懷鬼胎的兩國終於聯手．
      > 　蜀國重臣，集中到成都會議廳，共謀打敗曹魏的大計．
    - `load_map` map=8197
- **블록 1**: 이야기; 레코드 17, 그룹 7; 대화 10(잡담 8)
  - 트리거: condition
  - 목표 문구: 商議今後行動． / 考慮是否派奇襲隊去關中．
  - r1 소속: 張苞 → 유비군(합류)
  - r1 소속: 關興 → 유비군(합류)
  - r1 소속: 劉禪 → 유비군(합류)
  - 질문 r12 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - 선택지 r13: 「派遣奇襲隊」 r14 → 진행; 「不派遣奇襲隊」 r15 → 진행
  - r14 소속: 龐統 → 무소속(이탈)
  - r14 소속: 趙雲 → 무소속(이탈)
  - r14 소속: 馬超 → 무소속(이탈)
  - r14 소속: 魏延 → 무소속(이탈)
  - r14 소속: 簡雍 → 무소속(이탈)
  - r14 소속: 糜竺 → 무소속(이탈)
  - r14 소속: 糜芳 → 무소속(이탈)
  - r14 소속: 伊籍 → 무소속(이탈)
  - r14 소속: 劉封 → 무소속(이탈)
  - r14 소속: 法正 → 무소속(이탈)
  - 플래그 켬: {89}
  - 플래그 검사: {38, 132, 135}
  - **r0** run(0) 그룹 0
    - `set_previous_map` map=0 x=25 y=5
    - `if_flags` 
    - `play_music` song=5
    - `caption`
      > 成都會議廳
  - **r1** run(0) 그룹 1
    - `if_flags` 
    - `dialogue`
      > 諸葛亮: 主公，關羽之子關興，張飛之子張苞來見．
      > 劉備: 哦，快讓進來．
      > 諸葛亮: 是．張苞、關興進來．
    - `dialogue`
      > 張苞: 我是張飛之子張苞，今後想和父親一樣，為主公效命．
      > 關興: 我是關羽之子關興，和張苞一樣，也請主公多關照．
      > 劉備: 你二人，都有乃父之風，以後好好幹吧．
      > 張苞: 是．臣先告退．
    - `caption`
      > 張苞、關興加入我方！
    - `set_allegiance` person=張苞 army=0
    - `set_allegiance` person=關興 army=0
    - `dialogue`
      > 劉禪: 嗯，父親，我已長大成人，也要去打仗嗎？
      > 劉備: 我如果把你編排在部隊裡，當然要去打仗．你不願意嗎？
      > 劉禪: 不，不是！沒那麼想……好吧，我先退下了……真煩人……
    - `caption`
      > 劉禪加入臣下！
    - `set_allegiance` person=劉禪 army=0
    - `dialogue`
      > 劉備: 孔明，如此安排行嗎？
      > 諸葛亮: 以後如不好生培養，恐不能成大器．他好像還不懂得戰爭的嚴酷，主公，我還有要事與您商量……
  - **r2** run(0) 그룹 2
    - `dialogue`
      > 諸葛亮: 已與東吳結盟，這樣就只有魏國是敵人了．
      > 劉備: 嗯，必須伐魏，復興漢室．
    - `set_objective`
      > 商議今後行動．
  - **r3** talk(3) [張飛] 그룹 3*
    - `dialogue`
      > 張飛: 二哥的仇不能忘，但復興漢室是頭等大事，二哥一定也是這麼想的．
  - **r4** talk(3) [馬良] 그룹 3
    - `dialogue`
      > 馬良: 盡快伐魏吧．
  - **r5** talk(3) [黃忠] 그룹 3
    - `dialogue`
      > 黃忠: 決戰的時刻終於到了，請看我一展身手吧．
  - **r6** talk(3) [嚴顏] 그룹 3
    - `dialogue`
      > 嚴顏: 我絕不落在黃忠和其他將軍後面．
  - **r7** talk(3) [諸葛亮] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 到魏國洛陽，有兩條路可走，一條是從荊州的襄陽走，另一條是從漢中取道關中長安．
    - `narration`
      > 　諸葛亮在此所言”關中”，不是指劉備已奪取的漢中，是指漢中再往北．
      > 　有長安和陳倉二處險要．
    - `dialogue`
      > 諸葛亮: 荊州和關中都有魏國精銳把守．
      > 劉備: 當然．孔明，你認為如何攻擊為上？
      > 諸葛亮: 既然已與東吳結盟，從襄陽一路與東吳共同進攻為上．但漢中也會因此而薄弱，得向關中派遣奇襲隊，在那裡絆住魏軍．
      > 劉備: 軍師所言極是．但是，我軍兵力比魏軍少，又如此分兵兩路，豈不危險？
      > 諸葛亮: 我也考慮過．奇襲隊的主帥一定得派精明強悍的人．至於派不派奇襲隊，請主公定奪，宜深思熟慮之．
    - `set_objective`
      > 考慮是否派奇襲隊去關中．
    - `leave_parallel` 
  - **r8** talk(3) [張飛] 그룹 4*
    - `dialogue`
      > 張飛: 向關中派兵是可以，但如果那樣……就得分兵，可是我們哪裡有那麼多人馬可分呀？
  - **r9** talk(3) [馬良] 그룹 4
    - `dialogue`
      > 馬良: 是呀……誠如軍師所言，我也認為有必要分兵．
  - **r10** talk(3) [黃忠] 그룹 4
    - `dialogue`
      > 黃忠: 我想跟隨主公一齊作戰．
  - **r11** talk(3) [嚴顏] 그룹 4
    - `dialogue`
      > 嚴顏: 關中嗎？關中是漢中以北一帶的總稱，陳倉和長安等處也屬關中．
  - **r12** talk(3) [諸葛亮] 그룹 4 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 主公，下決定了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r13** condition(1) 그룹 5* — 그룹 넘김
    - `choice`
      > 派遣奇襲隊
      > 不派遣奇襲隊
  - **r14** run(0) 그룹 5 — 그룹 넘김
    - `if_flags` 
    - `dialogue`
      > 諸葛亮: 奇襲隊的主帥，派龐統是合適人選．
      > 劉備: 嗯，快喚龐統來．
    - `dialogue`
      > 龐統: 主公，找我何事？
    - `dialogue`
      > 劉備: 龐統，你來指揮關中奇襲隊．
      > 龐統: 決定向關中出兵了吧．
      > 劉備: 不錯，你所料極是．
      > 龐統: 得令．我馬上去陽平關．
      > 劉備: 嗯，帶趙雲等人同去吧．
      > 龐統: 是，我先去了．
    - `if_flags` 
    - `dialogue`
      > 諸葛亮: 奇襲隊的主帥，趙雲是合適人選．
      > 劉備: 嗯，快喚趙雲來．
    - `dialogue`
      > 趙雲: 主公，找我何事？
    - `dialogue`
      > 劉備: 趙雲，你來指揮關中奇襲隊．
      > 趙雲: 決定向關中出兵了吧．
      > 劉備: 不錯，你所料極是．
      > 趙雲: 得令．我馬上去陽平關．
      > 劉備: 嗯，帶馬超等人同去吧．
      > 趙雲: 是，我先去了．
    - `set_flag` flag=89 clear=0
    - `set_allegiance` person=龐統 army=14
    - `set_allegiance` person=趙雲 army=14
    - `set_allegiance` person=馬超 army=14
    - `set_allegiance` person=魏延 army=14
    - `set_allegiance` person=簡雍 army=14
    - `set_allegiance` person=糜竺 army=14
    - `set_allegiance` person=糜芳 army=14
    - `set_allegiance` person=伊籍 army=14
    - `set_allegiance` person=劉封 army=14
    - `set_allegiance` person=法正 army=14
    - `leave_parallel` 
  - **r15** run(0) 그룹 5 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 是，全軍進發荊州吧．
    - `leave_parallel` 
  - **r16** run(0) 그룹 6
    - `dialogue`
      > 馬良: 那，去東吳邀請共同發兵吧．
      > 劉備: 嗯，全靠你了．
      > 馬良: 是．
- **블록 2**: 이야기; 레코드 2, 그룹 2; 대화 0(잡담 0); 맵: 마을 0, 마을 4, 지도
  - **r0** run(0) 그룹 0
    - `load_map` map=8192
    - `play_music` song=11
    - `caption`
      > 鄴城宮殿
    - `narration`
      > 　另一方面，在魏國的大本營鄴城，正在商議對付蜀吳同盟．
    - `dialogue`
      > 司馬懿: 陛下，蜀吳已結成同盟，很明顯要共同進攻我們，我們如何應付？
      > 曹丕: 嗯，派援軍去襄陽．那，夏侯惇．
      > 夏侯惇: 在！
    - `dialogue`
      > 曹丕: 馬上率軍增援襄陽，與襄陽守將曹仁協力，頂住蜀軍．
      > 夏侯惇: 遵命，我馬上去！
    - `dialogue`
      > 曹丕: 還有，曹洪、賈詡．
      > 曹洪: 在．
      > 賈詡: 有何吩咐．
    - `dialogue`
      > 曹丕: 曹洪，你去關中向曹真傳命，敵人若攻來就迎擊，否則就增援襄陽．
      > 曹洪: 是．
      > 曹丕: 賈詡去合淝，向張遼也照此傳令．
      > 賈詡: 遵命．
    - `redraw` 
    - `load_map` map=4096
  - **r1** run(0) 그룹 1
    - `load_map` map=8196
    - `caption`
      > 襄陽議事廳
    - `narration`
      > 　夏侯惇遵曹丕之命，已到達曹仁鎮守的襄陽．
    - `dialogue`
      > 夏侯惇: 奉聖上之命，前來增援．
      > 曹仁: 來得太好了，光我們這些兵，根本守不住．
      > 徐晃: 提早禦敵吧．
      > 于禁: 是呀，敵人隨時都可能殺來．
      > 曹仁: 那好，夏侯惇去守宛城．
      > 夏侯惇: 我守最後的關口，好的．
      > 曹仁: 徐晃守南郡，于禁守新野，都要用心防守．
      > 徐晃: 遵命．
      > 于禁: 是．
    - `redraw` 
    - `load_map` map=4096
- **블록 3**: 이야기; 레코드 6, 그룹 2; 대화 5(잡담 4); 맵: 마을 5
  - 목표 문구: 商議今後行動 / 去江陵．
  - 플래그 검사: {135}
  - **r0** run(0) 그룹 0
    - `load_map` map=8197
    - `set_previous_map` map=0 x=25 y=5
    - `if_flags` 
    - `play_music` song=5
    - `caption`
      > 成都議事廳
    - `dialogue`
      > 馬良: 主公，我剛從東吳回來．
    - `set_objective`
      > 商議今後行動
  - **r1** talk(3) [諸葛亮] 그룹 1*
    - `dialogue`
      > 諸葛亮: 先請聽聽馬良的報告吧．
  - **r2** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 大哥，聽聽報告吧．
  - **r3** talk(3) [黃忠] 그룹 1
    - `dialogue`
      > 黃忠: 主公，有沒有東吳參加無所謂，有我在就夠了．
  - **r4** talk(3) [嚴顏] 그룹 1
    - `dialogue`
      > 嚴顏: 與東吳交涉很順利吧．
  - **r5** talk(3) [馬良] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 劉備: 馬良，聯合起兵的事如何了？
      > 馬良: 已大功告成，孫權答應聯合起兵了．
      > 劉備: 哦，真是好消息．
      > 馬良: 孫權要去江陵．
      > 劉備: 好，那我們也去江陵．
      > 諸葛亮: 出發吧．
    - `if_flags` 
    - `if_flags` 
    - `set_objective`
      > 去江陵．
    - `leave_parallel` 
- **블록 4**: 전투 준비; 레코드 28, 그룹 8; 대화 22(잡담 18); 맵: 마을 5, 지도
  - 전투 설정: 턴 제한 40, 아군 출진 14명, 격파 대상 #18, 퇴각하면 패배 #0
  - 트리거: condition, location
  - 목표 문구: 與孫權等人商議今後的事． / 考慮是否請孫權派奇襲隊． / 進行出征準備．
  - 질문 r17 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - 선택지 r18: 「請孫權攻合淝」 r19 → 진행; 「不邀請」 r20 → 진행
  - 질문 r26 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - r27 레벨 +6: 陸遜
  - r27 레벨 +11: 甘寧
  - r27 레벨 +11: 凌統
  - r27 레벨 +11: 徐盛
  - r27 레벨 +11: 丁奉
  - 플래그 켬: {90}
  - 플래그 검사: {135, 136}
  - **r0** location(2) 그룹 0
    - `load_map` map=8197
    - `if_flags` 
    - `caption`
      > 江陵議事廳
    - `dialogue`
      > 馬良: 主公，孫權到達江陵了．
      > 劉備: 是嗎，請到這裡來．
      > 馬良: 是．
    - `dialogue`
      > 劉備: 東吳……．關羽遭東吳毒手時，哪裡想到今日會與孫權聯合攻曹魏．
      > 諸葛亮: 主公的英明決斷，才造成今日的有利局勢．主公，孫權好像已經到了．
    - `dialogue`
      > 孫權: 劉備公，幸會幸會．
    - `set_objective`
      > 與孫權等人商議今後的事．
  - **r1** talk(3) [諸葛亮] 그룹 1*
    - `dialogue`
      > 諸葛亮: 先聽孫權公妙策吧．
  - **r2** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 大哥，先問客人吧．
  - **r3** talk(3) [黃忠] 그룹 1
    - `dialogue`
      > 黃忠: 主公，先聽孫權公妙策吧．
  - **r4** talk(3) [嚴顏] 그룹 1
    - `dialogue`
      > 嚴顏: 主公，先聽孫權公妙策吧．
  - **r5** talk(3) [孫權] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 孫權: 我率部來此，只為伐魏．我先介紹一下我軍統帥陸遜．陸遜，有請．
    - `dialogue`
      > 陸遜: 在下陸遜，大家一回生，二回熟．
      > 劉備: 孫權公，陸遜公，我們一起伐魏，共誅國賊吧．
      > 孫權: 好吧．消滅了曹丕，天下也就太平了．
    - `leave_parallel` 
  - **r6** talk(3) [孫權] 그룹 2*
    - `dialogue`
      > 孫權: 我們也會盡力伐魏．
  - **r7** talk(3) [陸遜] 그룹 2
    - `dialogue`
      > 陸遜: 一同伐魏吧．
  - **r8** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 要與東吳一起作戰？在此之前，想都不敢想．
  - **r9** talk(3) [黃忠] 그룹 2
    - `dialogue`
      > 黃忠: 一同伐魏吧．
  - **r10** talk(3) [嚴顏] 그룹 2
    - `dialogue`
      > 嚴顏: 一同伐魏吧．
  - **r11** talk(3) [諸葛亮] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 請孫權派奇襲隊，分散敵軍兵力為好．
      > 劉備: 讓奇襲隊進攻何處呢？
      > 諸葛亮: 東吳之北是合淝，由張遼鎮守．如果進攻合淝，張遼就不能抽身增援他處．請主公熟思決斷．
    - `set_objective`
      > 考慮是否請孫權派奇襲隊．
    - `leave_parallel` 
  - **r12** talk(3) [孫權] 그룹 3*
    - `dialogue`
      > 孫權: 我們也會盡力伐魏．
  - **r13** talk(3) [陸遜] 그룹 3
    - `dialogue`
      > 陸遜: 一同伐魏吧．
  - **r14** talk(3) [張飛] 그룹 3
    - `dialogue`
      > 張飛: 要與東吳一起作戰？在此之前，想都不敢想．
  - **r15** talk(3) [黃忠] 그룹 3
    - `dialogue`
      > 黃忠: 一同伐魏吧．
  - **r16** talk(3) [嚴顏] 그룹 3
    - `dialogue`
      > 嚴顏: 一同伐魏吧．
  - **r17** talk(3) [諸葛亮] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 主公，考慮得如何了？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r18** condition(1) 그룹 4* — 그룹 넘김
    - `choice`
      > 請孫權攻合淝
      > 不邀請
  - **r19** run(0) 그룹 4 — 그룹 넘김
    - `dialogue`
      > 劉備: 孫權公，派奇襲隊如何？
      > 孫權: 奇襲隊？
      > 劉備: 想請您進攻東吳北面的合淝．
      > 孫權: 讓我牽制敵軍．好，我發兵合淝．
    - `set_flag` flag=90 clear=0
    - `dialogue`
      > 孫權: 那好，我馬上回去，做發兵合淝的準備．
    - `leave_parallel` 
  - **r20** run(0) 그룹 4 — 그룹 넘김
    - `dialogue`
      > 孫權: 我軍想資助些軍需，請笑納．
    - `data` kind=2 value=2000
    - `caption`
      > 接受了東吳２０００黃金的援助！
    - `dialogue`
      > 孫權: 以後有什麼事，請吩咐陸遜．那我先告退．
    - `leave_parallel` 
  - **r21** run(0) 그룹 5
    - `dialogue`
      > 諸葛亮: 那我們也準備出征吧．
    - `set_objective`
      > 進行出征準備．
  - **r22** talk(3) [張飛] 그룹 6*
    - `dialogue`
      > 張飛: 要與東吳一起作戰？在此之前，想都不敢想．
  - **r23** talk(3) [黃忠] 그룹 6
    - `dialogue`
      > 黃忠: 一同伐魏吧．
  - **r24** talk(3) [嚴顏] 그룹 6
    - `dialogue`
      > 嚴顏: 一同伐魏吧．
  - **r25** talk(3) [陸遜] 그룹 6
    - `dialogue`
      > 陸遜: 一同伐魏吧．
  - **r26** talk(3) [諸葛亮] 그룹 6 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 出征嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r27** run(0) 그룹 7
    - `play_music` song=12
    - `dialogue`
      > 諸葛亮: 請編組部隊．
    - `if_flags` 
    - `add_levels` person=陸遜 levels=6
    - `add_levels` person=甘寧 levels=11
    - `add_levels` person=凌統 levels=11
    - `add_levels` person=徐盛 levels=11
    - `add_levels` person=丁奉 levels=11
    - `battle_setup` 
    - `dialogue`
      > 諸葛亮: 首先進攻離此最近的襄陽吧．
    - `load_map` map=4096
    - `play_music` song=3
- **블록 5**: 전투; 레코드 14, 그룹 6; 대화 0(잡담 0); 맵: 전투 맵 24, 지도
  - 적군 명단: 28기
  - 트리거: battle_won, unit_at_cell, unit_contact, unit_in_area
  - 목표 문구: 一、曹仁的結局 / 在襄陽討論下一步行動． / 在襄陽商議下一步行動
  - r3 아이템: 茶
  - r4 아이템: 馬術指南書
  - r5 아이템: 青囊書
  - r7 (battle_won) 전투 끝
  - r7 (battle_won) → 블록 6
  - r8 아이템: 茶
  - r9 아이템: 馬術指南書
  - r10 아이템: 青囊書
  - r11 일기토
  - r13 (run) 전투 끝
  - 플래그 켬: {98, 99, 100}
  - 플래그 검사: {58, 98, 99, 100}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12312
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、曹仁的結局
    - `dialogue`
      > 曹仁: 蜀軍就要攻來了！一定要擋住他們！
      > 諸葛亮: 聽說敵軍主將是曹仁．攻下襄陽，再奪回荊州．
      > 陸遜: 大家不要落在蜀軍後面！向天下顯示吳軍的實力！
    - `play_music` song=9
  - **r3** unit_at_cell(6) [(any unit)] 그룹 3*
    - `if_flags` 
    - `add_item` item=茶
    - `set_flag` flag=98 clear=0
  - **r4** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=馬術指南書
    - `set_flag` flag=99 clear=0
  - **r5** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=青囊書
    - `set_flag` flag=100 clear=0
  - **r6** unit_in_area(11) [(any unit)] 그룹 3 — 그룹 넘김
    - `play_music` song=11
    - `join_battle` person=滿寵
    - `join_battle` person=牛金
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `caption`
      > 敵人的援軍到達！
    - `dialogue`
      > 曹仁: 哦，援軍來了嗎？大家加把勁！援軍已到，一鼓作氣殺回去！
      > 劉備: 沒想到……敵人的援軍到了．
    - `if_flags` 
    - `play_music` song=12
    - `join_battle` person=？？？
    - `dialogue`
      > ？？？: 不能讓魏國長期霸佔荊州．
    - `play_music` song=9
    - `leave_parallel` 
  - **r7** battle_won(7) 그룹 3
    - `narration`
      > 此作戰勝利是檢測遊戲用的，一般若遊戲至此，表示遊戲過程有錯誤．
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 進襄陽城吧．
    - `set_objective`
      > 在襄陽討論下一步行動．
    - `goto_block` block=6
  - **r8** unit_at_cell(6) [(any unit)] 그룹 4*
    - `if_flags` 
    - `add_item` item=茶
    - `set_flag` flag=98 clear=0
  - **r9** unit_at_cell(6) [(any unit)] 그룹 4
    - `if_flags` 
    - `add_item` item=馬術指南書
    - `set_flag` flag=99 clear=0
  - **r10** unit_at_cell(6) [(any unit)] 그룹 4
    - `if_flags` 
    - `add_item` item=青囊書
    - `set_flag` flag=100 clear=0
  - **r11** unit_contact(4) [？？？] 그룹 4 — 그룹 넘김
    - `dialogue`
      > ？？？: 曹仁，久違了．
      > 曹仁: 哦，何人？你……，是你！還活著！？
      > ？？？: 我怎會這麼容易就死，現在我要雪荊州之恨！
      > 曹仁: 哼！來吧！
    - `duel` first=？？？ second=曹仁
    - `dialogue`
      > 曹仁: 我來也！
      > ？？？: 好小子！你哪裡是我的對手！
    - `duel_begin` 
    - `dialogue`
      > ？？？: 不陪你玩了！先宰了再說！！
    - `duel_action` person=？？？ action=0
    - `dialogue`
      > 曹仁: 哇！
    - `duel_action` person=曹仁 action=3
    - `duel_end` 
    - `caption`
      > 神祕武將殺了曹仁！
    - `dialogue`
      > 劉備: 怎麼？發生了什麼事？
      > 諸葛亮: 敵人內鬨了？一定要抓住這個時機！
      > 劉備: 好，猛勁殺過去！
    - `data` kind=4 value=50
    - `leave_parallel` 
  - **r12** battle_won(7) 그룹 4 — 그룹 넘김
    - `dialogue`
      > 曹仁: 可、可惡……劉備小兒！哇！！
      > 劉備: 好，殺了曹仁！
    - `leave_parallel` 
  - **r13** run(0) 그룹 5
    - `play_music` song=7
    - `narration`
      > 　殺了曹仁，劉備軍佔領了襄陽．
    - `if_flags` 
    - `play_music` song=2
    - `dialogue`
      > ？？？: ……我哪有面目去見兄長……
    - `caption`
      > 神祕武將走了．
    - `dialogue`
      > 劉備: 嗯！那是……？莫非……
      > 張飛: 大哥，怎麼了？
      > 劉備: 奇怪……沒什麼……
      > 張飛: 大哥，不舒服嗎？高興點．
      > 劉備: 是呀．（肯定是看花眼了，莫非……）好，進襄陽吧！
    - `play_music` song=7
    - `data` kind=2 value=1500
    - `caption`
      > 得到黃金１５００！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 那就進襄陽城吧．
    - `set_objective`
      > 在襄陽商議下一步行動
- **블록 6**: 전투 준비; 레코드 23, 그룹 9; 대화 16(잡담 12); 맵: 마을 4, 지도
  - 전투 설정: 턴 제한 40, 아군 출진 10명, 격파 대상 #62, 퇴각하면 패배 #0
  - 전투 설정: 턴 제한 40, 아군 출진 10명, 격파 대상 #62, 퇴각하면 패배 #0
  - 전투 설정: 턴 제한 40, 아군 출진 10명, 격파 대상 #78, 퇴각하면 패배 #0
  - 트리거: condition, location
  - 목표 문구: 請陸遜援手，攻打新野或南郡． / 進行出征準備．
  - 질문 r15 (陸遜): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - 선택지 r16: 「請陸遜去攻打南郡」 r17 → 진행; 「請陸遜去攻打新野」 r18 → 진행
  - 질문 r20 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - r22 (run) → 블록 8
  - 플래그 켬: {92}
  - 플래그 검사: {92, 135}
  - **r0** location(2) 그룹 0
    - `load_map` map=8196
    - `if_flags` 
    - `play_music` song=5
    - `caption`
      > 襄陽議事廳
    - `dialogue`
      > 諸葛亮: 恭喜主公，終於又奪回了襄陽．
  - **r1** talk(3) [陸遜] 그룹 1*
    - `dialogue`
      > 陸遜: 雖然打敗了曹仁，但若要打到洛陽，還得先攻下宛城，於路上，敵人也會嚴陣以待．
  - **r2** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 大哥，二哥雖已過世，但總覺得他還活著．
  - **r3** talk(3) [黃忠] 그룹 1
    - `dialogue`
      > 黃忠: 賀喜主公，能重奪襄陽．
  - **r4** talk(3) [甘寧] 그룹 1
    - `dialogue`
      > 甘寧: 初次相見，我乃東吳之臣甘寧．以後，我們會相處的很好的．
  - **r5** talk(3) [諸葛亮] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 要去洛陽，必須先通過新野或南郡，然後過宛城．
      > 劉備: 嗯，若不攻下新野和南郡，有在宛城被夾擊的危險．
      > 諸葛亮: 正是，應該請陸遜支援，同時進攻新野和南郡．
    - `leave_parallel` 
  - **r6** talk(3) [諸葛亮] 그룹 2*
    - `dialogue`
      > 諸葛亮: 正是，應該請陸遜支援，同時進攻新野和南郡．
  - **r7** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 大哥，二哥雖已過世，但總覺得他還活著．
  - **r8** talk(3) [黃忠] 그룹 2
    - `dialogue`
      > 黃忠: 賀喜主公，能重奪襄陽．
  - **r9** talk(3) [甘寧] 그룹 2
    - `dialogue`
      > 甘寧: 我們東吳之臣也願與蜀軍合力對付魏國．
  - **r10** talk(3) [陸遜] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 陸遜: 你們的話，我都聽到了．我是去打新野還是南郡？決定後告訴我．
    - `set_objective`
      > 請陸遜援手，攻打新野或南郡．
    - `leave_parallel` 
  - **r11** talk(3) [諸葛亮] 그룹 3*
    - `dialogue`
      > 諸葛亮: 聽說于禁鎮守新野，徐晃鎮守南郡．
  - **r12** talk(3) [張飛] 그룹 3
    - `dialogue`
      > 張飛: 大哥，二哥雖已過世，但總覺得他還活著．
  - **r13** talk(3) [黃忠] 그룹 3
    - `dialogue`
      > 黃忠: 賀喜主公，能重奪襄陽．
  - **r14** talk(3) [甘寧] 그룹 3
    - `dialogue`
      > 甘寧: 如果拿下新野和南郡，後面就只剩下宛城了．
  - **r15** talk(3) [陸遜] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 陸遜: 考慮的如何了？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r16** condition(1) 그룹 4* — 그룹 넘김
    - `choice`
      > 請陸遜去攻打南郡
      > 請陸遜去攻打新野
  - **r17** run(0) 그룹 4 — 그룹 넘김
    - `set_flag` flag=92 clear=0
    - `dialogue`
      > 陸遜: 好吧，那我就去打南郡．
    - `battle_setup` 
    - `leave_parallel` 
  - **r18** run(0) 그룹 4 — 그룹 넘김
    - `dialogue`
      > 陸遜: 好吧，那我就去打新野．
    - `battle_setup` 
    - `leave_parallel` 
  - **r19** run(0) 그룹 5
    - `dialogue`
      > 諸葛亮: 我們也出發吧，準備好了，請告訴我．
      > 黃忠: 那我們先準備去．
    - `if_flags` 
    - `if_flags` 
    - `set_objective`
      > 進行出征準備．
  - **r20** talk(3) [諸葛亮] 그룹 6* — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 準備好了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r21** run(0) 그룹 7
    - `play_music` song=12
    - `dialogue`
      > 諸葛亮: 請編組部隊．
    - `load_map` map=4096
    - `play_music` song=3
  - **r22** run(0) 그룹 8
    - `if_flags` 
    - `dialogue`
      > 陸遜: 那好劉備公，我們去打南郡．
      > 劉備: 嗯，拜託了．
      > 諸葛亮: 我們也向新野出發吧．
    - `if_flags` 
    - `dialogue`
      > 陸遜: 那好劉備公，我們去打新野．
      > 劉備: 嗯，拜託了．
      > 諸葛亮: 我們也向南郡出發吧．
    - `goto_block` block=8
- **블록 7**: 전투; 레코드 9, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 47
  - 적군 명단: 22기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact
  - 목표 문구: 一、于禁的撤退． 二、自軍部隊奪取糧倉．
  - r3 아이템: 勇氣書  
  - r6 일기토
  - r6 레벨 +1: 張飛
  - r8 (run) 전투 끝
  - r8 (run) → 블록 9
  - 플래그 켬: {101}
  - 플래그 검사: {101}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12335
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、于禁的撤退．
      > 二、自軍部隊奪取糧倉．
    - `dialogue`
      > 于禁: 別放劉備軍過去，一個兵也不行．
      > 諸葛亮: 新野的敵方守將是于禁．攻下這裡，就能以此為根據進攻宛城．
    - `play_music` song=9
  - **r3** unit_at_cell(6) [(any unit)] 그룹 3*
    - `if_flags` 
    - `add_item` item=勇氣書  
    - `set_flag` flag=101 clear=0
  - **r4** turn(9) 그룹 3
    - `play_music` song=11
    - `join_battle` person=許褚
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `caption`
      > 敵人援軍到達！
    - `dialogue`
      > 許褚: 別放劉備軍過去，將其趕回江陵！
      > 于禁: 啊，援軍！兄弟們，援軍來了！大家堅守住！
    - `play_music` song=9
  - **r5** unit_at_cell(6) [(any unit)] 그룹 3 — 그룹 넘김
    - `data` kind=4 value=50
    - `play_music` song=11
    - `dialogue`
      > 于禁: 什麼？糧倉丟了！如此，怎麼守城！可惡，撤到宛城！
    - `leave_parallel` 
  - **r6** unit_contact(4) [張飛] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 張飛: 對面可是于禁！敢與我張飛一戰！
    - `duel` first=張飛 second=于禁
    - `dialogue`
      > 于禁: 壞了！張飛！！哇！
      > 張飛: 為我二哥關羽報仇！你等死吧！我來也！
    - `duel_begin` 
    - `dialogue`
      > 張飛: 如何！你不是我對手！
      > 于禁: 可惡！活命要緊！張飛，後會有期！！
      > 張飛: 呸！別跑！這豈是大將所為！
    - `duel_action` person=于禁 action=4
    - `duel_end` 
    - `add_levels` person=張飛 levels=1
    - `caption`
      > 張飛的等級上升！
    - `dialogue`
      > 于禁: 撤退！快回宛城！
    - `leave_parallel` 
  - **r7** battle_won(7) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 于禁: 可、可惡！撤退！回宛城！
    - `leave_parallel` 
  - **r8** run(0) 그룹 4
    - `play_music` song=7
    - `narration`
      > 　于禁撤退了，劉備軍佔領新野．
    - `dialogue`
      > 劉備: 幹得好！如此，再攻下宛城，就直逼洛陽了！
    - `data` kind=2 value=1500
    - `caption`
      > 得到黃金１５００！
    - `battle_end` next_map=4096
    - `goto_block` block=9
- **블록 8**: 전투; 레코드 15, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 46
  - 적군 명단: 20기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact
  - 목표 문구: 一、徐晃的撤退． 二、佔領兩個鹿砦． / 一、徐晃的撤退．
  - r3 일기토
  - r3 레벨 +1: 張苞
  - r4 아이템: 海嘯書  
  - r5 아이템: 援隊書  
  - r14 (run) 전투 끝
  - 플래그 켬: {102, 103, 104, 105, 106, 110}
  - 플래그 검사: {102, 103, 104, 105, 106, 110}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12334
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、徐晃的撤退．
      > 二、佔領兩個鹿砦．
    - `dialogue`
      > 徐晃: 劉備雖來了！但是絕不讓他們過去，我們用水攻．
      > 諸葛亮: 此……！主公！此處危險！
      > 劉備: 何出此言？
      > 諸葛亮: 此處想必原是舊河床！敵軍肯定在上流建堤攔住水流！一旦放水而下，我軍將完全被激流吞沒！
      > 劉備: 可是，陸遜正在新野作戰，我們如果撤退，陸遜將孤立無援．
      > 諸葛亮: 那就奪取敵軍城堡吧，除此別無他法．
      > 劉備: 好吧，全軍迅速攻取敵軍城堡！
    - `play_music` song=9
  - **r3** unit_contact(4) [張苞] 그룹 3*
    - `dialogue`
      > 張苞: 我乃張飛之子張苞是也！來將可敢與我單打獨鬥！
      > 夏侯尚: 原來是張飛之子．我夏侯尚不以為怪，來得好，先打再說吧！
    - `duel` first=張苞 second=夏侯尚
    - `duel_begin` 
    - `dialogue`
      > 夏侯尚: 打就打吧……
      > 張苞: 哼！剛才不知天高地厚，現在後悔了吧！
    - `duel_action` person=張苞 action=7
    - `dialogue`
      > 夏侯尚: 啊！不、不愧為張飛之……子……
    - `duel_action` person=夏侯尚 action=3
    - `duel_action` person=張苞 action=9
    - `duel_action` person=張苞 action=2
    - `dialogue`
      > 張苞: 夏侯尚，俺張苞送你見閻王！
    - `duel_end` 
    - `add_levels` person=張苞 levels=1
    - `caption`
      > 張苞的等級上升！
  - **r4** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=海嘯書  
    - `set_flag` flag=102 clear=0
  - **r5** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=援隊書  
    - `set_flag` flag=103 clear=0
  - **r6** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `data` kind=2 value=2000
    - `caption`
      > 得到黃金２０００！
    - `set_flag` flag=104 clear=0
  - **r7** unit_at_cell(6) [(any unit)] 그룹 3 — 그룹 넘김
    - `if_flags` 
    - `caption`
      > 佔領北面城堡！
    - `set_flag` flag=105 clear=0
    - `if_flags` 
    - `data` kind=4 value=50
    - `play_music` song=7
    - `dialogue`
      > 劉備: 幹得漂亮！佔領了城堡，無須擔心敵人水攻了．一口氣擊垮徐晃！
      > 徐晃: 什麼！城堡被佔領了！哼，我的妙計不成，沒辦法，回軍宛城！
    - `leave_parallel` 
  - **r8** unit_at_cell(6) [(any unit)] 그룹 3 — 그룹 넘김
    - `if_flags` 
    - `caption`
      > 佔領南面城堡！
    - `set_flag` flag=106 clear=0
    - `if_flags` 
    - `data` kind=4 value=50
    - `play_music` song=7
    - `dialogue`
      > 劉備: 幹得漂亮！佔領了城堡，無須擔心敵人水攻了．一口氣擊垮徐晃！
      > 徐晃: 什麼！城堡被佔領了！哼，我的妙計不成，沒辦法，回軍宛城！
    - `leave_parallel` 
  - **r9** turn(9) 그룹 3
    - `play_music` song=11
    - `dialogue`
      > 徐晃: 太好了，現在馬上決堤，放水淹劉備軍．
    - `halve` a=0 b=1
    - `halve` a=0 b=0
    - `dialogue`
      > 諸葛亮: 來不及了……
      > 徐晃: 哈哈哈！劉備小兒，活該！全軍進攻劉備軍．
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `set_objective`
      > 一、徐晃的撤退．
    - `set_flag` flag=105 clear=0
    - `set_flag` flag=106 clear=0
    - `set_flag` flag=110 clear=0
    - `play_music` song=9
  - **r10** turn(9) 그룹 3
  - **r11** turn(9) 그룹 3
  - **r12** turn(9) 그룹 3
  - **r13** battle_won(7) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 徐晃: 可惡！先撤退再說！回宛城！
    - `play_music` song=7
    - `leave_parallel` 
  - **r14** run(0) 그룹 4
    - `narration`
      > 　徐晃撤退了，劉備軍佔領了南郡．
    - `dialogue`
      > 劉備: 幹得漂亮！此去陷落宛城，洛陽就在眼前了！
    - `data` kind=2 value=1500
    - `caption`
      > 得到黃金１５００！
    - `battle_end` next_map=4096
- **블록 9**: 전투 준비; 레코드 12, 그룹 4; 대화 9(잡담 8); 맵: 마을 16, 지도
  - 전투 설정: 턴 제한 40, 아군 출진 10명, 격파 대상 #79, 퇴각하면 패배 #0
  - 전투 설정: 턴 제한 50, 아군 출진 11명, 격파 대상 #16, 퇴각하면 패배 #0
  - 목표 문구: 進行出征準備
  - r1 소속: 甘寧 → 유비군(합류)
  - r1 소속: 凌統 → 유비군(합류)
  - r1 소속: 凌統 → 유비군(합류)
  - r1 소속: 徐盛 → 유비군(합류)
  - r1 소속: 丁奉 → 유비군(합류)
  - 질문 r10 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - r11 레벨 +6: 關羽
  - r11 레벨 +6: 關平
  - r11 레벨 +6: 周倉
  - r11 레벨 +6: 王甫
  - r11 레벨 +6: 趙累
  - r11 레벨 +6: 廖化
  - r11 (run) → 블록 11
  - 플래그 검사: {90, 132, 135, 136}
  - **r0** run(0) 그룹 0
    - `load_map` map=8208
    - `if_flags` 
    - `play_music` song=5
    - `caption`
      > 新野營帳
    - `narration`
      > 　這裡是劉備軍的營帳，劉備軍為進攻宛城，陳兵於新野，謀劃今後的對策．
  - **r1** run(0) 그룹 1
    - `dialogue`
      > 劉備: 陸遜大人，辛苦了．
      > 陸遜: 此須小事，何足掛齒．蜀軍如此強大，也讓人驚奇．劉備公，我主有令，命我返回，實在對不起……
      > 劉備: 好吧，那就請代我向孫權致意．
      > 陸遜: 多謝．那我留下他們留在這裡幫忙．
    - `if_flags` 
    - `dialogue`
      > 甘寧: 奉陸遜都督之命，我與凌統、徐盛、丁奉留在這裡與劉備公並肩作戰，聽從您的調遣．
    - `caption`
      > 甘寧、凌統、徐盛、丁奉加入！
    - `set_allegiance` person=甘寧 army=0
    - `set_allegiance` person=凌統 army=0
    - `if_flags` 
    - `dialogue`
      > 凌統: 奉陸遜都督之命，我與甘寧、徐盛、丁奉留在這裡與劉備公並肩作戰，聽從您的調遣．
    - `caption`
      > 甘寧、凌統、徐盛、丁奉加入！
    - `set_allegiance` person=凌統 army=0
    - `if_flags` 
    - `dialogue`
      > 徐盛: 奉陸遜都督之命，我與丁奉留在這裡與劉備公並肩作戰，聽從您的調遣．
    - `caption`
      > 徐盛、丁奉加入！
    - `set_allegiance` person=徐盛 army=0
    - `set_allegiance` person=丁奉 army=0
    - `dialogue`
      > 劉備: 哦，這下有倚仗了．陸遜都督，多謝了．
      > 陸遜: 那我先走一步．
    - `dialogue`
      > 陸遜: （劉備、還有孔明……與之為敵不會有好下場．如果主公也不了解我的苦心……）
    - `dialogue`
      > 諸葛亮: 那就乘勢進攻宛城吧，請作出征準備．
    - `set_objective`
      > 進行出征準備
  - **r2** talk(3) [張飛] 그룹 2*
    - `dialogue`
      > 張飛: 大哥，早做準備．
  - **r3** talk(3) [黃忠] 그룹 2
    - `dialogue`
      > 黃忠: 主公，請讓我出征吧．
  - **r4** talk(3) [嚴顏] 그룹 2
    - `dialogue`
      > 嚴顏: 主公，請讓我出征吧．
  - **r5** talk(3) [馬良] 그룹 2
    - `dialogue`
      > 馬良: 主公，請作出征準備．
  - **r6** talk(3) [甘寧] 그룹 2
    - `dialogue`
      > 甘寧: 劉備公，以後請多關照．
  - **r7** talk(3) [凌統] 그룹 2
    - `dialogue`
      > 凌統: 劉備公，以後請多關照．
  - **r8** talk(3) [徐盛] 그룹 2
    - `dialogue`
      > 徐盛: 劉備公，以後請多關照．
  - **r9** talk(3) [丁奉] 그룹 2
    - `dialogue`
      > 丁奉: 劉備公，以後請多關照．
  - **r10** talk(3) [諸葛亮] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 準備好了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r11** run(0) 그룹 3
    - `play_music` song=12
    - `dialogue`
      > 諸葛亮: 請編組部隊．
    - `add_levels` person=關羽 levels=6
    - `add_levels` person=關平 levels=6
    - `add_levels` person=周倉 levels=6
    - `add_levels` person=王甫 levels=6
    - `add_levels` person=趙累 levels=6
    - `add_levels` person=廖化 levels=6
    - `if_flags` 
    - `battle_setup` 
    - `if_flags` 
    - `battle_setup` 
    - `dialogue`
      > 諸葛亮: 現在進兵宛城吧．
    - `load_map` map=4096
    - `if_flags` 
    - `play_music` song=3
    - `dialogue`
      > 孫權: 我軍攻打合淝，絆住張遼，全軍！出發！
    - `dialogue`
      > 張遼: 哎呀！不能去增援夏侯惇了，可惡！
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 孫權: 我們先坐山觀蜀魏兩虎相鬥．憑什麼幫劉備，對我來說，最好兩敗俱傷．
    - `play_music` song=3
    - `if_flags` 
    - `goto_block` block=11
    - `play_music` song=11
    - `dialogue`
      > 張遼: 吳軍不來進攻合淝，太好了，全軍馬上行動，襲擊劉備軍側翼．
- **블록 10**: 전투; 레코드 11, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 48, 지도
  - 적군 명단: 23기
  - 전투 설정: 턴 제한 30, 아군 출진 11명, 격파 대상 #16, 퇴각하면 패배 #0
  - 트리거: battle_won, turn, unit_at_cell, unit_contact
  - 목표 문구: 一、張遼的撤退
  - r3 아이템: 援隊書  
  - r4 아이템: 猛火書  
  - r5 아이템: 炸彈
  - r8 일기토
  - r8 레벨 +1: 張飛
  - r10 (run) 전투 끝
  - 플래그 켬: {107, 108, 109}
  - 플래그 검사: {107, 108, 109}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12336
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、張遼的撤退
    - `dialogue`
      > 張遼: 太好了，好像來得及，全軍注意，突擊劉備軍側翼．
      > 諸葛亮: 主公，遭到攻擊．合淝的張遼軍急襲至此．
      > 劉備: 嗯……全軍迎擊張遼，把他趕回去！
    - `play_music` song=9
  - **r3** unit_at_cell(6) [(any unit)] 그룹 3*
    - `if_flags` 
    - `add_item` item=援隊書  
    - `set_flag` flag=107 clear=0
  - **r4** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=猛火書  
    - `set_flag` flag=108 clear=0
  - **r5** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=炸彈
    - `set_flag` flag=109 clear=0
  - **r6** turn(9) 그룹 3
    - `play_music` song=11
    - `join_battle` person=樂進
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `caption`
      > 張遼的援軍到達！
    - `dialogue`
      > 樂進: 張遼！別鬆勁！樂進來了！
      > 張遼: 哦，樂進來了！好不容易趕來吧！太棒了，援軍來了！
    - `play_music` song=9
  - **r7** turn(9) 그룹 3
    - `play_music` song=11
    - `join_battle` person=李典
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `caption`
      > 張遼的援軍到達！
    - `dialogue`
      > 李典: 張遼，抱歉，來晚了！
      > 張遼: 哦，李典終於來了！好，發動總攻擊！
    - `play_music` song=9
  - **r8** unit_contact(4) [張飛] 그룹 3 — 그룹 넘김
    - `duel` first=張飛 second=張遼
    - `dialogue`
      > 張飛: 張遼，好久不見了！
      > 張遼: 張飛嗎？來得好！單挑！
      > 張飛: 哼，輸給你，我就不是張飛！來吧，張遼！
    - `duel_begin` 
    - `dialogue`
      > 張飛: 喂，你不行了吧！
      > 張遼: 呀，還是你厲害！
      > 張飛: 看槍！！
    - `duel_action` person=張飛 action=1
    - `duel_action` person=張遼 action=2
    - `dialogue`
      > 張遼: 哇！哼，沒辦法，全軍撤退！張飛，後會有期！
    - `duel_action` person=張遼 action=4
    - `duel_end` 
    - `add_levels` person=張飛 levels=1
    - `caption`
      > 張飛的等級上升！
    - `dialogue`
      > 張飛: 呸，跑得倒快．哈，呂布一死，我就無敵於天下了！
    - `leave_parallel` 
  - **r9** battle_won(7) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 張遼: 哼，沒辦法，撤退！快撤！
    - `leave_parallel` 
  - **r10** run(0) 그룹 4
    - `play_music` song=7
    - `narration`
      > 　張遼軍撤退了．
    - `data` kind=2 value=1500
    - `caption`
      > 得到黃金１５００！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 劉備: 終於頂住了，好，全軍重新整編，馬上進攻宛城．
    - `op_3d` value=1
    - `dialogue`
      > 諸葛亮: 請編組部隊．
    - `battle_setup` 
- **블록 11**: 전투; 레코드 12, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 49
  - 적군 명단: 25기
  - 트리거: battle_won, unit_at_cell, unit_contact, unit_in_area
  - 목표 문구: 一、夏侯惇的撤退
  - r3 아이템: 遁甲天書
  - r4 아이템: 馬術指南書
  - r5 아이템: 劍術指南書
  - r7 일기토
  - r7 레벨 +1: 張飛
  - r9 일기토
  - r9 레벨 +1: 關羽
  - r11 (run) 전투 끝
  - 플래그 켬: {111, 112, 113, 215, 216}
  - 플래그 검사: {58, 111, 112, 113, 215, 216}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12337
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、夏侯惇的撤退
    - `dialogue`
      > 夏侯惇: 劉備，你太得意了！我夏侯惇要讓你見識一下魏軍的真正實力．
      > 諸葛亮: 主公，如果佔領宛城，洛陽就在眼前了．快進攻吧！
    - `play_music` song=10
  - **r3** unit_at_cell(6) [(any unit)] 그룹 3*
    - `if_flags` 
    - `add_item` item=遁甲天書
    - `set_flag` flag=111 clear=0
  - **r4** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=馬術指南書
    - `set_flag` flag=112 clear=0
  - **r5** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=劍術指南書
    - `set_flag` flag=113 clear=0
  - **r6** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `dialogue`
      > 劉備: 好！降下吊橋！
    - `set_map_chip` x=14 y=16 chip=2
    - `set_map_chip` x=14 y=17 chip=2
    - `set_map_chip` x=15 y=16 chip=2
    - `set_map_chip` x=15 y=17 chip=2
    - `set_map_chip` x=16 y=16 chip=2
    - `set_map_chip` x=16 y=17 chip=2
    - `caption`
      > 吊橋降下來了！
    - `dialogue`
      > 徐晃: 什麼，吊橋被降下來了！？哼，于禁這傢伙真靠不住！唉！以後再跟你算帳，迎擊！
    - `set_flag` flag=216 clear=0
  - **r7** unit_contact(4) [張飛] 그룹 3
    - `dialogue`
      > 張飛: 徐晃！明年今日就是你的忌日！碰上我，你算完了！
      > 徐晃: 放屁！你也想嘗嘗關羽一樣的下場嗎？
      > 張飛: 放肆！不容你猖獗，看槍！
    - `duel` first=張飛 second=徐晃
    - `duel_begin` 
    - `dialogue`
      > 張飛: 嗨！嗨！
    - `duel_action` person=張飛 action=1
    - `duel_action` person=張飛 action=0
    - `duel_action` person=張飛 action=1
    - `dialogue`
      > 徐晃: 啊！太，太強了！
      > 張飛: 哼，你以為能贏我嗎？看槍！死吧！
    - `duel_action` person=張飛 action=1
    - `dialogue`
      > 徐晃: 嗚……
    - `duel_action` person=徐晃 action=3
    - `dialogue`
      > 徐晃: 後，後悔莫及……
    - `duel_end` 
    - `add_levels` person=張飛 levels=1
    - `caption`
      > 張飛的等級上升！
  - **r8** unit_in_area(11) [(any unit)] 그룹 3
    - `if_flags` 
    - `dialogue`
      > 夏侯惇: 進城裡來了嗎，哈哈哈，按我的計謀上當了，也不想想，為什麼特意留一座橋，那裡進退不自如．機會來了！一口氣衝垮敵人！！
    - `set_flag` flag=215 clear=0
  - **r9** unit_in_area(11) [(any unit)] 그룹 3 — 그룹 넘김
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 夏侯惇: 大膽劉備軍！竟敢來此！
    - `play_music` song=12
    - `join_battle` person=關羽
    - `dialogue`
      > 關羽: 聽說兄長處境艱難，關羽特來參見！想要命的，離我遠點！
      > 劉備: 噢……！我沒認錯吧！關羽，是你吧！
      > 關羽: 夏侯惇，俺關羽特來會你！
    - `dialogue`
      > 夏侯惇: 你，你是關羽！你沒死！
      > 關羽: 魏國不亡，我還不能死．我從閻王那裡又回來了．
      > 夏侯惇: 那好，我再把你送回去！
    - `duel` first=關羽 second=夏侯惇
    - `duel_begin` 
    - `dialogue`
      > 夏侯惇: 你這個死不了的，再宰死你．
      > 關羽: 你這兩下子，不足為敵！
    - `duel_action` person=關羽 action=1
    - `duel_action` person=夏侯惇 action=2
    - `dialogue`
      > 夏侯惇: 噢！
      > 關羽: 夏侯惇！小心！
    - `duel_action` person=關羽 action=0
    - `dialogue`
      > 夏侯惇: 哇！！
    - `duel_action` person=夏侯惇 action=3
    - `dialogue`
      > 關羽: 哼……夏侯惇，再見了……
    - `duel_end` 
    - `add_levels` person=關羽 levels=1
    - `caption`
      > 關羽的等級上升！
    - `leave_parallel` 
  - **r10** battle_won(7) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 夏侯惇: 你，你們……我雖死，魏國也不會亡！嗷！嗷！
    - `leave_parallel` 
  - **r11** run(0) 그룹 4
    - `play_music` song=7
    - `data` kind=2 value=1500
    - `caption`
      > 得到黃金１５００！
    - `narration`
      > 　劉備軍擊斃夏侯惇，佔領宛城．
      > 　洛陽就在眼前，劉備兄弟的夢想，漢室再興也……
    - `battle_end` next_map=4096

### 장면 1

제목: 第四章　中原決死戰

- **블록 0**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 지도
  - r0 삽화 33
  - r0 삽화 32
  - r0 (run) → 블록 4
  - 플래그 검사: {89, 90}
  - **r0** run(0) 그룹 0
    - `play_music` song=0
    - `chapter_title` key=第四章　中原決死戰
    - `title`
      > 第四章　中原決死戰
    - `show_picture` picture=33 variant=0
    - `narration`
      > 　對魏國來說，宛城陷落無疑是巨大打擊，
      > 　曹丕在許昌集結重兵，以防備蜀軍的進攻．
    - `load_map` map=4096
    - `play_music` song=11
    - `dialogue`
      > 曹丕: 去許昌！在許昌迎擊敵軍！
    - `if_flags` 
    - `play_music` song=0
    - `show_picture` picture=32 variant=1
    - `narration`
      > 　造成宛城陷落這樣的結果的重要原因，是蜀和吳同時對魏作戰．
      > 　由於東吳進攻合淝，魏的兵力被分散．在合淝的張遼等人被牽制住，所以在宛城魏國不能集中充份的戰鬥力．
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 曹真: 曹丕皇上危險！在洛陽頂住劉備軍！
    - `goto_block` block=4
- **블록 1**: 전투 준비; 레코드 4, 그룹 3; 대화 2(잡담 1); 맵: 마을 14, 마을 4, 지도
  - 전투 설정: 턴 제한 30, 아군 출진 10명, 격파 대상 #242, 퇴각하면 패배 #132
  - 전투 설정: 턴 제한 30, 아군 출진 9명, 격파 대상 #242, 퇴각하면 패배 #53
  - 목표 문구: 談論今後的話．
  - r0 소속: 關羽 → 유비군(합류)
  - r0 소속: 關平 → 유비군(합류)
  - r0 소속: 周倉 → 유비군(합류)
  - r0 소속: 趙累 → 유비군(합류)
  - r0 소속: 廖化 → 유비군(합류)
  - r0 소속: 王甫 → 유비군(합류)
  - r3 소속: 龐統 → 유비군(합류)
  - r3 소속: 趙雲 → 유비군(합류)
  - r3 소속: 馬超 → 유비군(합류)
  - r3 소속: 魏延 → 유비군(합류)
  - r3 소속: 簡雍 → 유비군(합류)
  - r3 소속: 糜竺 → 유비군(합류)
  - r3 소속: 糜芳 → 유비군(합류)
  - r3 소속: 伊籍 → 유비군(합류)
  - r3 소속: 劉封 → 유비군(합류)
  - r3 소속: 法正 → 유비군(합류)
  - 플래그 검사: {38, 58}
  - **r0** run(0) 그룹 0
    - `load_map` map=8196
    - `set_previous_map` map=7 x=28 y=5
    - `if_flags` 
    - `play_music` song=5
    - `caption`
      > 宛議事廳
    - `if_flags` 
    - `set_allegiance` person=關羽 army=0
    - `set_allegiance` person=關平 army=0
    - `set_allegiance` person=周倉 army=0
    - `set_allegiance` person=趙累 army=0
    - `set_allegiance` person=廖化 army=0
    - `set_allegiance` person=王甫 army=0
    - `dialogue`
      > 關羽: 兄長，失了荊州，本無面目見人，聽說兄長在此廝殺，甘冒矢石來與您相見．
      > 劉備: 瞧你說的，我只聽到你還活著就足夠了，荊州也奪回來了，沒什麼好惦記的，一起完成伐魏大業吧．
      > 關羽: 啊！多謝兄長．
    - `dialogue`
      > 張飛: 二哥，今日暢飲一番！來，舉杯！
    - `dialogue`
      > 關羽: 很久沒和你喝酒了，今日不醉不休！
      > 張飛: 這樣對嘍，好吧，兄長，我等你．
    - `dialogue`
      > 馬良: 主公，魏國丟掉這個宛城，肯定會驚惶失措．一口氣進攻吧．
      > 諸葛亮: 此言極是，但是，現在還是等關中的奇襲隊吧，如果不與他們會合，很難戰勝魏軍精銳．
    - `if_flags` 
    - `dialogue`
      > 劉備: 龐統他們不會出什麼事吧……
    - `if_flags` 
    - `dialogue`
      > 劉備: 趙雲他們不會出什麼事吧……
    - `set_objective`
      > 談論今後的話．
  - **r1** talk(3) [馬良] 그룹 1*
    - `dialogue`
      > 馬良: 奇襲隊早點到達才好．
  - **r2** talk(3) [諸葛亮] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 等奇襲隊吧．
    - `op_3d` value=1
    - `leave_parallel` 
  - **r3** run(0) 그룹 2
    - `load_map` map=8206
    - `if_flags` 
    - `if_flags` 
    - `play_music` song=12
    - `caption`
      > 陽平關帥帳
    - `narration`
      > 　話說兩頭，在漢中的陽平關，劉備軍奇襲隊已佈下陣勢．
    - `if_flags` 
    - `dialogue`
      > 龐統: 大概主力部隊正順利進攻洛陽，如果這樣下去，將在許昌決戰吧．
      > 趙雲: 軍師，我們也別晚了，趕快去與主力部隊會合吧．
      > 馬超: 是啊，已完成虛攻的任務，已沒有必要待在這裡了？
      > 龐統: 可是，不能放著關中、長安魏軍不管，否則，主力部隊的背後就會遭到襲擊．能打擊多少就打擊多少吧．
      > 趙雲: 那，趕快出擊吧．
      > 龐統: 嗯，但是別太浪費時間，與主力部隊會合才是最重要的．
      > 馬超: 是．
    - `battle_setup` 
    - `set_allegiance` person=龐統 army=0
    - `if_flags` 
    - `dialogue`
      > 趙雲: 大概主力部隊正順利進攻洛陽，如果這樣下去，將在許昌決戰吧．
      > 馬超: 趙將軍，我們也別晚了，趕快去與主力部隊會合吧．
      > 魏延: 是啊，已完成虛攻的任務，已沒有必要待在這裡了？
      > 趙雲: 可是，不能放著關中、長安魏軍不管，否則，主力部隊的背後就會遭到襲擊．能打擊多少就打擊多少吧．
      > 馬超: 出擊吧．
      > 趙雲: 嗯，但是別太浪費時間，與主力部隊會合才是最重要的．
      > 魏延: 知道了．
    - `battle_setup` 
    - `set_allegiance` person=趙雲 army=0
    - `set_allegiance` person=馬超 army=0
    - `set_allegiance` person=魏延 army=0
    - `set_allegiance` person=簡雍 army=0
    - `set_allegiance` person=糜竺 army=0
    - `set_allegiance` person=糜芳 army=0
    - `set_allegiance` person=伊籍 army=0
    - `set_allegiance` person=劉封 army=0
    - `set_allegiance` person=法正 army=0
    - `load_map` map=4096
    - `play_music` song=3
- **블록 2**: 전투; 레코드 15, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 52
  - 적군 명단: 25기
  - 트리거: battle_lost, battle_won, turn, unit_at_cell, unit_contact
  - 목표 문구: 一、郝昭的結局
  - r3 일기토
  - r3 레벨 +1: 魏延
  - r4 아이템: 六韜
  - r5 아이템: 弓術指南書
  - r6 아이템: 三略
  - r8 레벨 +1: 馬超
  - r9 레벨 +1: 馬超
  - r10 레벨 +1: 馬超
  - r11 (turn) 전투 끝
  - r11 (turn) → 블록 4
  - r12 (battle_lost) 전투 끝
  - r12 (battle_lost) → 블록 4
  - r14 (run) 전투 끝
  - 플래그 켬: {93, 94, 114, 115, 116, 117}
  - 플래그 검사: {38, 94, 114, 115, 116, 117}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12340
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、郝昭的結局
    - `dialogue`
      > 郝昭: 蜀軍終於攻來了，但是別想從陳倉這裡過去，有種的過來一戰！
    - `if_flags` 
    - `dialogue`
      > 龐統: 陳倉乃咽喉要地，別浪費時間！火速攻下！
    - `if_flags` 
    - `dialogue`
      > 趙雲: 陳倉乃咽喉要地，別浪費時間！火速攻下！
    - `dialogue`
      > 姜維: 魏軍乃逆賊．我是不是助紂為虐了．
    - `play_music` song=9
  - **r3** unit_contact(4) [魏延] 그룹 3* — 그룹 넘김
    - `dialogue`
      > 魏延: 來將可是敵方統帥．來得正好，單挑！
      > 郝昭: 可惡……！讓你們打到這裡，只有決一勝負！
    - `duel` first=魏延 second=郝昭
    - `duel_begin` 
    - `dialogue`
      > 魏延: 不愧是統帥！好厲害！
      > 郝昭: 嘿……！
    - `duel_begin` 
    - `dialogue`
      > 魏延: 哈、哈……
      > 郝昭: 看招！
      > 魏延: 啊！不好！
    - `duel_action` person=郝昭 action=0
    - `duel_action` person=魏延 action=2
    - `dialogue`
      > 魏延: 哇啊！……，……，……？我還活著嗎？
      > 郝昭: 啊！心，心臟……在這種……地方……犯老病……．
      > 魏延: 怎麼回事？
    - `duel_action` person=郝昭 action=3
    - `dialogue`
      > 郝昭: 不好……．因病……倒下……．
      > 魏延: 好險啊！
    - `duel_end` 
    - `add_levels` person=魏延 levels=1
    - `caption`
      > 魏延的等級上升！
    - `play_music` song=7
    - `narration`
      > 　劉備軍奇襲隊擊斃郝昭，
      > 　佔領陳倉．
    - `leave_parallel` 
  - **r4** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=六韜
    - `set_flag` flag=115 clear=0
  - **r5** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=弓術指南書
    - `set_flag` flag=116 clear=0
  - **r6** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=三略
    - `set_flag` flag=117 clear=0
  - **r7** unit_contact(4) [(any unit)] 그룹 3
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 姜維: 不能再待在魏軍了！我姜維現在加入蜀軍！
    - `caption`
      > 姜維加入我方！
    - `set_country` person=姜維 country=0
    - `set_flag` flag=94 clear=0
    - `play_music` song=9
  - **r8** unit_contact(4) [馬超] 그룹 3
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 馬超: 你們可是羌族人？為何跟著魏軍，阻擋我軍前進！
      > 張獲: 啊，您是馬超將軍！聽說您被魏軍殺害了，看來平安無事呀！
      > 馬超: 當然，哪能那麼容易就死了．
      > 張獲: 我們不打算與馬超將軍作對，現在我們羌族加入您那一方．
    - `set_country` person=張獲 country=0
    - `set_country` person=程德 country=0
    - `set_country` person=高蒼 country=0
    - `caption`
      > 異民族羌族加入我方！
    - `set_flag` flag=114 clear=0
    - `add_levels` person=馬超 levels=1
    - `caption`
      > 馬超的等級上升！
    - `play_music` song=9
  - **r9** unit_contact(4) [馬超] 그룹 3
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 馬超: 你們可是羌族人？為何跟著魏軍，阻擋我軍前進！
      > 程德: 啊，您是馬超將軍！聽說您被魏軍殺害了，看來平安無事呀！
      > 馬超: 當然，哪能那麼容易就死了．
      > 程德: 我們不打算與馬超將軍作對，現在我們羌族加入您那一方．
    - `set_country` person=張獲 country=0
    - `set_country` person=程德 country=0
    - `set_country` person=高蒼 country=0
    - `caption`
      > 異民族羌族加入我方！
    - `set_flag` flag=114 clear=0
    - `add_levels` person=馬超 levels=1
    - `caption`
      > 馬超的等級上升！
    - `play_music` song=9
  - **r10** unit_contact(4) [馬超] 그룹 3
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 馬超: 你們可是羌族人？為何跟著魏軍，阻擋我軍前進！
      > 高蒼: 啊，您是馬超將軍！聽說您被魏軍殺害了，看來平安無事呀！
      > 馬超: 當然，哪能那麼容易就死了．
      > 高蒼: 我們不打算與馬超將軍作對，現在我們羌族加入您那一方．
    - `set_country` person=張獲 country=0
    - `set_country` person=程德 country=0
    - `set_country` person=高蒼 country=0
    - `caption`
      > 異民族羌族加入我方！
    - `set_flag` flag=114 clear=0
    - `add_levels` person=馬超 levels=1
    - `caption`
      > 馬超的等級上升！
    - `play_music` song=9
  - **r11** turn(9) 그룹 3
    - `play_music` song=11
    - `if_flags` 
    - `dialogue`
      > 龐統: 不行，要趕不上決戰了！全軍，加速前進！
    - `if_flags` 
    - `dialogue`
      > 趙雲: 不行，要趕不上決戰了！全軍，加速前進！
    - `battle_end` next_map=4096
    - `set_flag` flag=93 clear=0
    - `goto_block` block=4
  - **r12** battle_lost(8) 그룹 3
    - `play_music` song=11
    - `if_flags` 
    - `dialogue`
      > 龐統: 可惡！這樣趕不上決戰了！
    - `if_flags` 
    - `dialogue`
      > 趙雲: 可惡！這樣趕不上決戰了！
    - `battle_end` next_map=4096
    - `set_flag` flag=93 clear=0
    - `goto_block` block=4
  - **r13** battle_won(7) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 郝昭: 可惡．擋不住劉備軍，我與陣地共存亡．
    - `play_music` song=7
    - `narration`
      > 　劉備軍奇襲隊擊斃郝昭，
      > 　佔領陳倉．
    - `leave_parallel` 
  - **r14** run(0) 그룹 4
    - `data` kind=2 value=1600
    - `caption`
      > 得到黃金１６００！
    - `if_flags` 
    - `dialogue`
      > 龐統: 好，快進攻長安！
    - `if_flags` 
    - `dialogue`
      > 趙雲: 好，快進攻長安！
    - `battle_end` next_map=4096
- **블록 3**: 전투; 레코드 10, 그룹 4; 대화 0(잡담 0); 맵: 전투 맵 53, 지도
  - 전투 설정: 턴 제한 60, 아군 출진 14명, 격파 대상 #241, 퇴각하면 패배 #132
  - 전투 설정: 턴 제한 60, 아군 출진 14명, 격파 대상 #241, 퇴각하면 패배 #53
  - 적군 명단: 25기
  - 트리거: battle_lost, battle_won, turn, unit_at_cell, unit_contact, unit_in_area
  - 목표 문구: 一、曹真的結局
  - r3 아이템: 援軍書  
  - r6 일기토
  - r6 레벨 +1: 趙雲
  - r7 (turn) 전투 끝
  - r8 (battle_lost) 전투 끝
  - r9 (battle_won) 전투 끝
  - 플래그 켬: {93, 95, 119, 217}
  - 플래그 검사: {38, 95, 119, 217}
  - **r0** run(0) 그룹 0
    - `load_map` map=4096
    - `play_music` song=3
    - `if_flags` 
    - `battle_setup` 
    - `if_flags` 
    - `battle_setup` 
    - `battle_roster` 
    - `load_map` map=12341
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、曹真的結局
    - `dialogue`
      > 曹真: 在這裡箝制住蜀軍！不能讓蜀軍再為所欲為了．
    - `if_flags` 
    - `dialogue`
      > 龐統: 越過長安，馬上就到洛陽了．大家再加把勁！
    - `if_flags` 
    - `dialogue`
      > 趙雲: 越過長安，馬上就到洛陽了．大家再加把勁！
    - `dialogue`
      > 徐庶: 當初玄德公的實力何其渺小，現在如此壯大……我的眼光果然沒錯．
    - `play_music` song=17
  - **r3** unit_at_cell(6) [(any unit)] 그룹 3*
    - `if_flags` 
    - `add_item` item=援軍書  
    - `set_flag` flag=119 clear=0
  - **r4** unit_in_area(11) [(any unit)] 그룹 3
    - `if_flags` 
    - `dialogue`
      > 曹真: 已經打進城裡了！各軍要迎擊敵軍！！不惜一切要阻止敵軍去許昌與主力會合！
    - `set_flag` flag=217 clear=0
  - **r5** unit_contact(4) [(any unit)] 그룹 3
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 徐庶: 且慢，不要打！我乃徐庶，現在回歸蜀軍．
    - `caption`
      > 徐庶加入我方！
    - `set_country` person=徐庶 country=0
    - `set_flag` flag=95 clear=0
    - `play_music` song=17
  - **r6** unit_contact(4) [趙雲] 그룹 3
    - `dialogue`
      > 趙雲: 那邊可是張郃！
      > 張郃: 趙雲嗎？久違了，有何事指教？來勸降？別開這種玩笑．
      > 趙雲: 張郃，乾脆投降吧！魏國亡定了．
      > 張郃: 別逗了，我自棄袁紹效力曹公，絕不會再投降了．
      > 趙雲: 那就打吧！
    - `duel` first=趙雲 second=張郃
    - `duel_begin` 
    - `dialogue`
      > 趙雲: 看招！
    - `duel_action` person=趙雲 action=1
    - `dialogue`
      > 張郃: 啊！不愧……是……趙雲，我不行了！
    - `duel_action` person=張郃 action=3
    - `dialogue`
      > 趙雲: ……張郃，真乃義士．
    - `duel_end` 
    - `add_levels` person=趙雲 levels=1
    - `caption`
      > 趙雲的等級上升！
  - **r7** turn(9) 그룹 3 — 그룹 넘김
    - `play_music` song=11
    - `if_flags` 
    - `dialogue`
      > 龐統: 不好，趕不上決戰了！全軍，加速前進！
    - `if_flags` 
    - `dialogue`
      > 趙雲: 不好，趕不上決戰了！全軍，加速前進！
    - `battle_end` next_map=4096
    - `set_flag` flag=93 clear=0
    - `leave_parallel` 
  - **r8** battle_lost(8) 그룹 3 — 그룹 넘김
    - `play_music` song=11
    - `if_flags` 
    - `dialogue`
      > 龐統: 糟了！這樣要趕不上決戰了．
    - `if_flags` 
    - `dialogue`
      > 趙雲: 糟了！這樣要趕不上決戰了．
    - `battle_end` next_map=4096
    - `set_flag` flag=93 clear=0
    - `leave_parallel` 
  - **r9** battle_won(7) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 曹真: 蜀軍太厲害了……！啊！
    - `play_music` song=7
    - `narration`
      > 　劉備軍奇襲隊擊斃曹真，
      > 　佔領長安．
    - `data` kind=2 value=1600
    - `caption`
      > 得到黃金１６００！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `if_flags` 
    - `dialogue`
      > 龐統: 好，馬上進軍洛陽！
    - `if_flags` 
    - `dialogue`
      > 趙雲: 好，馬上進軍洛陽！
    - `leave_parallel` 
- **블록 4**: 전투 준비; 레코드 12, 그룹 4; 대화 9(잡담 8); 맵: 마을 4, 지도
  - 전투 설정: 턴 제한 40, 아군 출진 15명, 격파 대상 #213, 퇴각하면 패배 #0
  - 전투 설정: 턴 제한 40, 아군 출진 10명, 격파 대상 #241, 퇴각하면 패배 #0
  - 목표 문구: 進行出征準備．
  - r0 소속: 關羽 → 유비군(합류)
  - r1 소속: 龐統 → 무소속(이탈)
  - r1 소속: 趙雲 → 무소속(이탈)
  - r1 소속: 馬超 → 무소속(이탈)
  - r1 소속: 魏延 → 무소속(이탈)
  - r1 소속: 簡雍 → 무소속(이탈)
  - r1 소속: 糜竺 → 무소속(이탈)
  - r1 소속: 糜芳 → 무소속(이탈)
  - r1 소속: 伊籍 → 무소속(이탈)
  - r1 소속: 劉封 → 무소속(이탈)
  - r1 소속: 法正 → 무소속(이탈)
  - r1 소속: 姜維 → 무소속(이탈)
  - r1 소속: 姜維 → 무소속(이탈)
  - r1 소속: 張獲 → 무소속(이탈)
  - r1 소속: 程德 → 무소속(이탈)
  - r1 소속: 高蒼 → 무소속(이탈)
  - r1 소속: 徐庶 → 무소속(이탈)
  - 질문 r10 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - r11 (run) → 블록 7
  - r11 (run) → 블록 6
  - r11 (run) → 블록 5
  - 플래그 검사: {38, 58, 89, 93, 135}
  - **r0** run(0) 그룹 0
    - `load_map` map=8196
    - `set_previous_map` map=7 x=26 y=5
    - `if_flags` 
    - `if_flags` 
    - `if_flags` 
    - `if_flags` 
    - `play_music` song=5
    - `caption`
      > 宛議事廳
    - `narration`
      > 　劉備等人在宛城的議事廳召開會議，商議伐魏．
    - `if_flags` 
    - `dialogue`
      > 馬良: 主公，關中的魏軍已移動到洛陽．
      > 諸葛亮: 敵人要在洛陽防守．
      > 劉備: 已經打到這裡，沒有可猶豫的，進軍洛陽！
    - `if_flags` 
    - `dialogue`
      > 馬良: 奇襲隊還沒任何消息，大概被魏軍絆住了．
      > 諸葛亮: 如果再等奇襲隊來，只會給敵人時間加固設防．
      > 劉備: 正是，很遺憾，但也別無他法．他們不久就會趕到，曹丕在許昌，我們先發兵許昌．
    - `if_flags` 
    - `dialogue`
      > 馬良: 主公，剛接到報告，奇襲隊已達到洛陽．
      > 諸葛亮: 好樣的，馬上與奇襲隊合兵一處，一口氣直攻許昌．
      > 劉備: 好！全軍準備出征，直指許昌！
    - `if_flags` 
    - `dialogue`
      > 關羽: 現在正是雪荊州之恥的時候．
      > 張飛: 抖擻精神準備出征吧！兄長，我們先準備！
    - `set_allegiance` person=關羽 army=0
  - **r1** run(0) 그룹 1
    - `if_flags` 
    - `set_allegiance` person=龐統 army=14
    - `set_allegiance` person=趙雲 army=14
    - `set_allegiance` person=馬超 army=14
    - `set_allegiance` person=魏延 army=14
    - `set_allegiance` person=簡雍 army=14
    - `set_allegiance` person=糜竺 army=14
    - `set_allegiance` person=糜芳 army=14
    - `set_allegiance` person=伊籍 army=14
    - `set_allegiance` person=劉封 army=14
    - `set_allegiance` person=法正 army=14
    - `set_allegiance` person=姜維 army=14
    - `set_allegiance` person=姜維 army=14
    - `set_allegiance` person=張獲 army=14
    - `set_allegiance` person=程德 army=14
    - `set_allegiance` person=高蒼 army=14
    - `set_allegiance` person=徐庶 army=14
    - `set_objective`
      > 進行出征準備．
  - **r2** talk(3) [龐統] 그룹 2*
    - `dialogue`
      > 龐統: 終於要與魏決戰了，請進行出征準備．
  - **r3** talk(3) [關羽] 그룹 2
    - `dialogue`
      > 關羽: 兄長，終於要與魏決戰了．我等兄弟的夢想，就要實現了．
  - **r4** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 大哥，派我吧！沒多久，我們的夢想就實現了．
  - **r5** talk(3) [趙雲] 그룹 2
    - `dialogue`
      > 趙雲: 完成伐魏大業吧．
  - **r6** talk(3) [馬超] 그룹 2
    - `dialogue`
      > 馬超: 想早日報殺父之仇．
  - **r7** talk(3) [黃忠] 그룹 2
    - `dialogue`
      > 黃忠: 我也想為主公拼了我這把老骨頭．
  - **r8** talk(3) [魏延] 그룹 2
    - `dialogue`
      > 魏延: 快點出征吧！
  - **r9** talk(3) [馬良] 그룹 2
    - `dialogue`
      > 馬良: 終於要與魏國決戰了．
  - **r10** talk(3) [諸葛亮] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 準備好了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r11** run(0) 그룹 3
    - `play_music` song=12
    - `if_flags` 
    - `dialogue`
      > 諸葛亮: 順路去洛陽與奇襲隊會合，在那裡重新編排部隊吧．
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 劉備: 奇襲隊眾將士，辛苦了．想必大家很疲勞，但還得一口氣進攻許昌！
    - `dialogue`
      > 諸葛亮: 進兵許昌吧！
    - `goto_block` block=7
    - `if_flags` 
    - `dialogue`
      > 諸葛亮: 請分派部隊．
    - `battle_setup` 
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 進兵許昌吧！
    - `goto_block` block=6
    - `if_flags` 
    - `dialogue`
      > 諸葛亮: 請分派部隊．
    - `battle_setup` 
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 諸葛亮: 去洛陽吧．
    - `goto_block` block=5
- **블록 5**: 전투; 레코드 9, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 54, 지도
  - 적군 명단: 26기
  - 전투 설정: 턴 제한 40, 아군 출진 10명, 격파 대상 #213, 퇴각하면 패배 #0
  - 트리거: battle_won, unit_at_cell, unit_contact
  - 목표 문구: 一、曹真的結局
  - r3 아이템: 援軍書  
  - r6 일기토
  - r6 레벨 +1: 張飛
  - r7 (battle_won) 전투 끝
  - 플래그 켬: {95, 120, 121}
  - 플래그 검사: {95, 120, 121}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12342
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、曹真的結局
    - `dialogue`
      > 曹真: 此戰關係到魏國的命運，決不能輸！
      > 諸葛亮: 主公，聽說洛陽這裡的守將是曹真．
      > 劉備: 嗯，可是以我軍實力，拿下這裡易如反掌．
      > 諸葛亮: 大意不得呀，小心進攻吧．
      > 徐庶: 當初玄德公的實力多麼渺小，現在如此壯大……我的眼光果然沒錯．
    - `play_music` song=17
  - **r3** unit_at_cell(6) [(any unit)] 그룹 3*
    - `if_flags` 
    - `add_item` item=援軍書  
    - `set_flag` flag=120 clear=0
  - **r4** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `data` kind=2 value=2000
    - `caption`
      > 得到黃金２０００！
    - `set_flag` flag=121 clear=0
  - **r5** unit_contact(4) [(any unit)] 그룹 3
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 徐庶: 且慢，不要打！我乃徐庶，現在回歸蜀軍．
    - `caption`
      > 徐庶加入我方！
    - `set_country` person=徐庶 country=0
    - `set_flag` flag=95 clear=0
    - `play_music` song=17
  - **r6** unit_contact(4) [張飛] 그룹 3
    - `dialogue`
      > 張飛: 那邊可是張郃！
      > 張郃: 張飛嗎，久違了，有何指教？來勸降嗎？別開這樣的玩笑．
      > 張飛: 張郃，乾脆投降吧，魏國亡定了．
      > 張郃: 別逗了，我自棄袁紹效力曹公，絕不會再投降了．
      > 張飛: 既然如此，只有打了！
    - `duel` first=張飛 second=張郃
    - `duel_begin` 
    - `dialogue`
      > 張飛: 看招！
    - `duel_action` person=張飛 action=1
    - `dialogue`
      > 張郃: 啊！不愧……是……張飛，我不行了！
    - `duel_action` person=張郃 action=3
    - `dialogue`
      > 張飛: ……真乃義士，令人敬佩．
    - `duel_end` 
    - `add_levels` person=張飛 levels=1
    - `caption`
      > 張飛的等級上升！
  - **r7** battle_won(7) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 曹真: 劉備軍如此強大……哎呀！
    - `play_music` song=7
    - `narration`
      > 　劉備軍擊斃曹真，佔領洛陽．
    - `data` kind=2 value=1600
    - `caption`
      > 得到黃金１６００！
    - `dialogue`
      > 諸葛亮: 主公，乘勢一鼓作氣進攻許昌吧！
      > 劉備: 好，重新調兵遣將！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `leave_parallel` 
  - **r8** run(0) 그룹 4
    - `op_3d` value=1
    - `battle_setup` 
    - `dialogue`
      > 劉備: 全軍，進兵許昌．
- **블록 6**: 전투; 레코드 10, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 50, 지도
  - 적군 명단: 22기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact, unit_in_area
  - 목표 문구: 一、司馬懿的撤退
  - r0 소속: 龐統 → 유비군(합류)
  - r0 소속: 趙雲 → 유비군(합류)
  - r0 소속: 馬超 → 유비군(합류)
  - r0 소속: 魏延 → 유비군(합류)
  - r0 소속: 簡雍 → 유비군(합류)
  - r0 소속: 糜竺 → 유비군(합류)
  - r0 소속: 糜芳 → 유비군(합류)
  - r0 소속: 伊籍 → 유비군(합류)
  - r0 소속: 劉封 → 유비군(합류)
  - r0 소속: 法正 → 유비군(합류)
  - r0 소속: 姜維 → 유비군(합류)
  - r0 소속: 張獲 → 유비군(합류)
  - r0 소속: 程德 → 유비군(합류)
  - r0 소속: 高蒼 → 유비군(합류)
  - r0 소속: 徐庶 → 유비군(합류)
  - r3 일기토
  - r3 레벨 +1: 關興
  - r4 아이템: 弓術指南書
  - r5 아이템: 劍術指南書
  - r9 (run) 전투 끝
  - 플래그 켬: {122, 123, 131, 172}
  - 플래그 검사: {38, 89, 93, 94, 95, 118, 122, 123, 131, 172}
  - **r0** run(0) 그룹 0
    - `if_flags` 
    - `set_allegiance` person=龐統 army=0
    - `set_allegiance` person=趙雲 army=0
    - `set_allegiance` person=馬超 army=0
    - `set_allegiance` person=魏延 army=0
    - `set_allegiance` person=簡雍 army=0
    - `set_allegiance` person=糜竺 army=0
    - `set_allegiance` person=糜芳 army=0
    - `set_allegiance` person=伊籍 army=0
    - `set_allegiance` person=劉封 army=0
    - `set_allegiance` person=法正 army=0
    - `if_flags` 
    - `set_allegiance` person=姜維 army=0
    - `if_flags` 
    - `set_allegiance` person=張獲 army=0
    - `set_allegiance` person=程德 army=0
    - `set_allegiance` person=高蒼 army=0
    - `if_flags` 
    - `set_allegiance` person=徐庶 army=0
    - `battle_roster` 
    - `load_map` map=12338
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、司馬懿的撤退
    - `dialogue`
      > 司馬懿: 蜀軍，別那麼得意，我司馬懿想讓你們嘗嘗魏軍的厲害．
      > 諸葛亮: 主公，敵軍統帥司馬懿是個對手，不能大意．請多留神．
    - `play_music` song=9
  - **r3** unit_contact(4) [關興] 그룹 3*
    - `if_flags` 
    - `dialogue`
      > 關興: 我乃關羽之子關興！有誰敢與我單挑？
      > 許褚: 哦，關羽的兒子嗎？如此，打起來也帶勁．好吧！我許褚與你單挑．
      > 關興: 成全你了！來吧！
    - `duel` first=關興 second=許褚
    - `duel_begin` 
    - `dialogue`
      > 關興: 嘿，是許褚！有點真本事！
      > 許褚: 哈哈哈！我許褚還不老，不會輕易敗陣！來吧！
    - `duel_action` person=許褚 action=1
    - `duel_action` person=許褚 action=0
    - `duel_action` person=許褚 action=1
    - `duel_action` person=許褚 action=0
    - `dialogue`
      > 關興: 嘿嘿嘿……！這刀如何！
    - `duel_action` person=關興 action=0
    - `duel_action` person=關興 action=1
    - `duel_action` person=關興 action=0
    - `dialogue`
      > 許褚: 喂，且住！哈哈，還是年輕人體力足……我得撤了．
      > 關興: 想逃跑！留下首級！
      > 許褚: 關興，以後再見！
    - `duel_action` person=許褚 action=4
    - `duel_end` 
    - `add_levels` person=關興 levels=1
    - `caption`
      > 關興的等級上升！
    - `set_flag` flag=172 clear=0
  - **r4** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=弓術指南書
    - `set_flag` flag=122 clear=0
  - **r5** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=劍術指南書
    - `set_flag` flag=123 clear=0
  - **r6** turn(9) 그룹 3
    - `play_music` song=12
    - `if_flags` 
    - `join_battle` person=龐統
    - `if_flags` 
    - `join_battle` person=趙雲
    - `join_battle` person=馬超
    - `join_battle` person=魏延
    - `if_flags` 
    - `join_battle` person=姜維
    - `if_flags` 
    - `dialogue`
      > 馬超: 馬上趕去！還來得及參戰！
      > 劉備: 什麼？敵人的援軍？
      > 諸葛亮: 主公，奇襲隊總算及時趕到了．
      > 劉備: 好，全軍總攻擊．
    - `set_flag` flag=131 clear=0
    - `play_music` song=9
  - **r7** unit_in_area(11) [(any unit)] 그룹 3 — 그룹 넘김
    - `leave_parallel` 
  - **r8** battle_won(7) 그룹 3 — 그룹 넘김
    - `leave_parallel` 
  - **r9** run(0) 그룹 4
    - `dialogue`
      > 司馬懿: 蜀軍好厲害呀！全軍先退回城裡！在城內消滅敵軍！
    - `play_music` song=7
    - `narration`
      > 　司馬懿率領魏軍向城內撤退了．
    - `data` kind=2 value=1600
    - `caption`
      > 得到黃金１６００！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `if_flags` 
    - `dialogue`
      > 諸葛亮: 大概魏軍要據守城池，怎麼辦？
      > 劉備: 嗯，一口氣攻下這？孔明，那邊是？
    - `dialogue`
      > 諸葛亮: 哦，主公，好像奇襲隊趕到了．
      > 劉備: 如此甚好，全軍突擊許昌！
    - `if_flags` 
    - `dialogue`
      > 諸葛亮: 大概魏軍要據守城池，怎麼辦？
      > 劉備: 好，全軍突擊許昌！
    - `if_flags` 
    - `dialogue`
      > 諸葛亮: 大概魏軍要據守城池，怎麼辦？
      > 劉備: 好，全軍突擊許昌！
- **블록 7**: 전투; 레코드 13, 그룹 6; 대화 0(잡담 0); 맵: 전투 맵 51
  - 전투 설정: 턴 제한 40, 아군 출진 15명, 격파 대상 #213, 퇴각하면 패배 #0
  - 적군 명단: 28기
  - 트리거: battle_won, unit_at_cell, unit_contact
  - 목표 문구: 一、我軍部隊到達內城城門． / 一、司馬懿的撤退
  - r0 소속: 龐統 → 유비군(합류)
  - r0 소속: 趙雲 → 유비군(합류)
  - r0 소속: 馬超 → 유비군(합류)
  - r0 소속: 魏延 → 유비군(합류)
  - r0 소속: 簡雍 → 유비군(합류)
  - r0 소속: 糜竺 → 유비군(합류)
  - r0 소속: 糜芳 → 유비군(합류)
  - r0 소속: 伊籍 → 유비군(합류)
  - r0 소속: 劉封 → 유비군(합류)
  - r0 소속: 法正 → 유비군(합류)
  - r0 소속: 姜維 → 유비군(합류)
  - r0 소속: 張獲 → 유비군(합류)
  - r0 소속: 程德 → 유비군(합류)
  - r0 소속: 高蒼 → 유비군(합류)
  - r0 소속: 徐庶 → 유비군(합류)
  - r1 소속: 黃忠 → 무소속(이탈)
  - r1 소속: 嚴顏 → 무소속(이탈)
  - r4 소속: 張遼 → 유비군(합류)
  - r4 레벨 +1: 關羽
  - r7 아이템: 玉璽
  - r8 (battle_won) → 블록 8
  - r9 소속: 張遼 → 유비군(합류)
  - r9 레벨 +1: 關羽
  - r11 아이템: 玉璽
  - 플래그 켬: {173, 212, 218}
  - 플래그 끔: {218}
  - 플래그 검사: {38, 94, 95, 118, 173, 212}
  - **r0** run(0) 그룹 0
    - `play_music` song=12
    - `if_flags` 
    - `set_allegiance` person=龐統 army=0
    - `set_allegiance` person=趙雲 army=0
    - `set_allegiance` person=馬超 army=0
    - `set_allegiance` person=魏延 army=0
    - `set_allegiance` person=簡雍 army=0
    - `set_allegiance` person=糜竺 army=0
    - `set_allegiance` person=糜芳 army=0
    - `set_allegiance` person=伊籍 army=0
    - `set_allegiance` person=劉封 army=0
    - `set_allegiance` person=法正 army=0
    - `if_flags` 
    - `set_allegiance` person=姜維 army=0
    - `if_flags` 
    - `set_allegiance` person=張獲 army=0
    - `set_allegiance` person=程德 army=0
    - `set_allegiance` person=高蒼 army=0
    - `if_flags` 
    - `set_allegiance` person=徐庶 army=0
  - **r1** run(0) 그룹 1
    - `dialogue`
      > 黃忠: 主公，請一定帶我去．讓您看看我這把老骨頭，還能上戰場廝殺．
      > 嚴顏: 黃忠將軍，我也同去．主公，我倆去建奇功．
      > 劉備: 嗯，如此甚好．
      > 諸葛亮: 主公且慢．
      > 劉備: 怎麼了，孔明？
      > 諸葛亮: 他們有點意氣太高，萬一有個閃失，會傷害全軍的銳氣．
      > 劉備: ……
      > 黃忠: 軍師，瞧您說的．黃忠為了主公，萬死不辭．
      > 嚴顏: 一定讓我們參戰吧．
      > 劉備: 就如軍師所說．二位的心情我了解，這回還是多歇歇吧．
      > 黃忠: 主公！……知道了，從命．
    - `op_3d` value=1
    - `dialogue`
      > 諸葛亮: 請調兵遣將．
    - `set_allegiance` person=黃忠 army=14
    - `set_allegiance` person=嚴顏 army=14
    - `battle_setup` 
    - `battle_roster` 
    - `load_map` map=12339
  - **r2** run(0) 그룹 2
    - `begin_battle` 
  - **r3** run(0) 그룹 3
    - `play_music` song=11
    - `set_objective`
      > 一、我軍部隊到達內城城門．
    - `dialogue`
      > 曹丕: 劉備之流，與朕作對！朕身為大魏皇帝，這種態度，絕不容許！
      > 司馬懿: 陛下，這座許昌城，不適合防守，請暫時撤退到鄴城吧．
      > 曹丕: 司馬懿，朕如此狼狽，你要負責！
      > 司馬懿: 真愧對陛下．可是，現在不是責臣的時候，請……
      > 曹丕: 好吧，朕先去鄴城．司馬懿，你斷後，不要讓我見到蜀軍．
      > 司馬懿: 哈哈……
      > 諸葛亮: 許昌城很大，易於進攻．一鼓作氣拿下城中心！
    - `set_flag` flag=218 clear=0
    - `play_music` song=10
  - **r4** unit_contact(4) [關羽] 그룹 4*
    - `if_flags` 
    - `dialogue`
      > 關羽: 文遠，又見面了．
      > 張遼: 關將軍，看來我好像跟錯主君了，董卓、呂布、還有……曹丕．曹丕哪像是曹操主公的兒子？竟然拋下臣子，簡直就像呂布……
      > 關羽: 既然知錯，投降我們如何？
      > 張遼: 什麼……？
      > 關羽: 下邳之戰，我被曹軍圍困於土山，正在絕望之際，你來見我，陳說利害．要死很容易，但什麼也解決不了．眼光放長遠些吧．
      > 張遼: ……
      > 關羽: 當年我被你說的話打動，忍辱投降曹操．這次，我也用那話勸你．
      > 張遼: ……
      > 關羽: 文遠，……意下如何？
      > 張遼: ……好吧，投降．
    - `caption`
      > 張遼加入我方！
    - `dialogue`
      > 張遼: 可是，讓我稍微平靜一下心緒．現在不想打了．
      > 關羽: 好吧，你先撤退．
      > 張遼: 抱歉．
    - `set_flag` flag=218 clear=1
    - `set_allegiance` person=張遼 army=0
    - `add_levels` person=關羽 levels=1
    - `caption`
      > 關羽的等級上升！
  - **r5** unit_at_cell(6) [曹丕] 그룹 4
    - `play_music` song=11
    - `dialogue`
      > 曹丕: 劉備，我會報此仇的！
    - `set_flag` flag=173 clear=0
    - `play_music` song=10
  - **r6** unit_at_cell(6) [(any unit)] 그룹 4 — 그룹 넘김
    - `dialogue`
      > 劉備: 什麼？城門沒開？嗯，如何是好……
    - `play_music` song=12
    - `join_battle` person=黃忠
    - `join_battle` person=嚴顏
    - `dialogue`
      > 嚴顏: 黃忠老將軍，很容易就混進城了．
      > 黃忠: 是呀，因為能看見魏軍從這裡逃走，我想說不定能混進來．可惜沒捉到魏軍大將．
      > 嚴顏: 可惜．捉住魏兵了嗎？
      > 黃忠: 嗯，盤問魏兵，讓他招出如何從城門內側開門．如果打開城門，就是首功．軍師也會對我等另眼相看．
      > 嚴顏: 好，趕快去好嗎？
      > 黃忠: 走，嚴老將軍！
    - `set_map_chip` x=13 y=9 chip=0
    - `dialogue`
      > 嚴顏: 太好了，城門打開了！
      > 黃忠: 主公，快請入城！
      > 劉備: 黃忠！嚴顏！你們為何在此？
      > 黃忠: 見到敵軍從城中逃走，從他們逃出的地方進城的．
      > 嚴顏: 城門已打開，請進來吧！
      > 劉備: 黃忠、嚴顏，你們幹得漂亮！
      > 黃忠: 哈哈哈哈！人雖老了，但也不輸給年輕後生……！！
    - `play_music` song=11
    - `join_battle` person=弓兵隊
    - `join_battle` person=弓兵隊
    - `join_battle` person=弓兵隊
    - `dialogue`
      > 弓兵隊: 快射敵將！
      > 黃忠: 啊，沒想……到！有……伏兵！
      > 劉備: 黃忠！嚴顏！不要緊吧！
      > 嚴顏: 不礙事．主公，快……
      > 劉備: 好吧，別擔心！好好養傷！黃忠！嚴顏！來人，照看好二位老將軍！
    - `play_music` song=10
    - `set_objective`
      > 一、司馬懿的撤退
    - `leave_parallel` 
  - **r7** unit_at_cell(6) [(any unit)] 그룹 4
    - `if_flags` 
    - `add_item` item=玉璽
    - `set_flag` flag=212 clear=0
  - **r8** battle_won(7) 그룹 4
    - `narration`
      > 此作戰勝利是測試遊戲用的．如果遊戲進行到此，是遊戲的錯誤．
    - `play_music` song=7
    - `narration`
      > 　司馬懿撤退了，劉備軍佔領許昌．
    - `dialogue`
      > 諸葛亮: 主公，我們勝利了！
      > 劉備: 嗯！黃忠！黃忠怎麼樣了？嚴顏呢？
      > 諸葛亮: 還活著，不過……
      > 劉備: 什麼！黃忠在哪？馬上去看黃忠！
    - `goto_block` block=8
  - **r9** unit_contact(4) [關羽] 그룹 5*
    - `if_flags` 
    - `dialogue`
      > 關羽: 文遠，又見面了．
      > 張遼: 關將軍，看來我好像跟錯主君了，董卓、呂布、還有……曹丕．曹丕哪像是曹操主公的兒子？竟然拋下臣子，簡直就像呂布……
      > 關羽: 既然知錯，投降我們如何？
      > 張遼: 什麼……？
      > 關羽: 下邳之戰，我被曹軍圍困於土山，正在絕望之際，你來見我，陳說利害．要死很容易，但什麼也解決不了．眼光放長遠些吧．
      > 張遼: ……
      > 關羽: 當年我被你說的話打動，忍辱投降曹操．這次，我也用那話勸你．
      > 張遼: ……
      > 關羽: 文遠，……意下如何？
      > 張遼: ……好吧，投降．
    - `caption`
      > 張遼加入我方！
    - `dialogue`
      > 張遼: 可是，讓我稍微平靜一下心緒．現在不想打了．
      > 關羽: 好吧，你先撤退．
      > 張遼: 抱歉．
    - `set_flag` flag=218 clear=1
    - `set_allegiance` person=張遼 army=0
    - `add_levels` person=關羽 levels=1
    - `caption`
      > 關羽的等級上升！
  - **r10** unit_at_cell(6) [曹丕] 그룹 5
    - `play_music` song=11
    - `dialogue`
      > 曹丕: 劉備，我會報此仇的！
    - `set_flag` flag=173 clear=0
    - `play_music` song=10
  - **r11** unit_at_cell(6) [(any unit)] 그룹 5
    - `if_flags` 
    - `add_item` item=玉璽
    - `set_flag` flag=212 clear=0
  - **r12** battle_won(7) 그룹 5 — 그룹 넘김
    - `dialogue`
      > 司馬懿: 啊！蜀軍如此厲害……向鄴城撤退！
    - `play_music` song=7
    - `narration`
      > 　司馬懿撤退了，劉備軍佔領許昌．
    - `data` kind=2 value=1600
    - `caption`
      > 得到黃金１６００！
    - `dialogue`
      > 諸葛亮: 主公，我們勝利了！
      > 劉備: 嗯！黃忠！黃忠怎麼樣了？嚴顏呢？
      > 諸葛亮: 還活著，不過……
      > 劉備: 什麼！黃忠在哪？馬上去看黃忠！
    - `leave_parallel` 
- **블록 8**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0)
  - r0 (run) 전투 끝
  - **r0** run(0) 그룹 0
    - `play_music` song=4
    - `narration`
      > 　劉備等人，收起了佔領許昌的欣喜，立刻趕到黃忠和嚴顏的身邊探視．
      > 　黃忠和嚴顏，由於遭突襲而受重傷，危在旦夕．
      > 　沒有生還的希望了……
    - `dialogue`
      > 劉備: 黃忠！嚴顏！許昌攻下來了，多虧你二人之力！
      > 嚴顏: 哦，主公，恭喜……
      > 黃忠: 哦，曹丕……？殺了曹丕嗎？
      > 劉備: 嗯……殺了．
      > 諸葛亮: ……
      > 黃忠: 哦，太好了……如此，我死也瞑目了．
      > 劉備: 哪裡話！復興漢室的大業還沒完，以後還仰仗二位！打起精神！這點箭傷沒什麼大礙！
      > 嚴顏: 主公……您能用我這老兵，太感謝您了．我們為主公盡力到最後，心中很寬慰．
      > 黃忠: 怎麼樣……主公．和平的……沒有戰爭……盛世……
      > 劉備: ……！黃忠！嚴顏！聽到我的聲音嗎？回答我！！
    - `narration`
      > 　劉備軍終於攻下許昌，但是為了勝利，也付出了巨大犧牲……
      > 　然而，魏國還沒有被消滅．曹丕，還有司馬懿，正一步一步準備，欲與蜀國進行最後的決戰．
    - `battle_end` next_map=4096

### 장면 2

제목: 第四章　蜀魏最後決戰

- **블록 0**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 지도
  - r0 삽화 27
  - **r0** run(0) 그룹 0
    - `play_music` song=0
    - `chapter_title` key=第四章　蜀魏最後決戰
    - `title`
      > 第四章　蜀魏最後決戰
    - `show_picture` picture=27 variant=0
    - `narration`
      > 　曹丕丟掉許昌後，在魏國最後的堡壘－鄴城集結全部兵馬，決心在此與蜀一決雌雄．
      > 　另一方面，劉備在許昌重新派兵點將，蜀魏的最後決戰終於展開了．
    - `load_map` map=4096
    - `play_music` song=11
    - `dialogue`
      > 曹丕: 在鄴城決戰！全軍向鄴城集結！絕不把魏國交給劉備之流！
- **블록 1**: 전투 준비; 레코드 4, 그룹 4; 대화 1(잡담 0); 맵: 마을 1, 지도
  - 전투 설정: 턴 제한 40, 아군 출진 15명, 격파 대상 #212, 퇴각하면 패배 #0
  - 목표 문구: 進行出征準備．
  - 질문 r2 (諸葛亮): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - 플래그 검사: {38, 58, 135}
  - **r0** run(0) 그룹 0
    - `load_map` map=8193
    - `set_previous_map` map=8 x=24 y=3
    - `if_flags` 
    - `if_flags` 
    - `if_flags` 
    - `play_music` song=12
    - `caption`
      > 許昌皇宮
    - `dialogue`
      > 馬良: 主公，向您報告．曹丕在鄴城集結了全部兵力，大概要與我軍決戰．
      > 劉備: 嗯，這一時刻終於來了．
    - `dialogue`
      > 魏延: 既然這樣，已經什麼都不想了，只等廝殺！
    - `dialogue`
      > 馬超: 是的！重振漢王朝的威嚴．
    - `dialogue`
      > 趙雲: 復興漢室！平息戰亂！
    - `if_flags` 
    - `dialogue`
      > 張飛: 大哥，我們多年來的夢想就要實現了．
    - `if_flags` 
    - `dialogue`
      > 關羽: 正如三弟所說，兄長，我等三人的夢想就要成真了．
    - `if_flags` 
    - `dialogue`
      > 龐統: 主公，請快下令出征吧！
  - **r1** run(0) 그룹 1
    - `dialogue`
      > 諸葛亮: 主公，現在眾將士氣高漲，正是出擊的絕好機會．
      > 劉備: 嗯……往事不堪回首，一路苦難．我從平黃巾之亂起拯救亂世，與關、張二弟聯手，那時至今已歷多年．現在，終於到了結束這亂世的時候了．好不容易實現夙願．
      > 諸葛亮: 主公，還不能鬆懈，為復興漢室，還有最後的大事．
      > 劉備: 嗯……好！全體將士，開始準備出征．
    - `narration`
      > 噢！
    - `dialogue`
      > 馬良: 主公，再加把勁，討伐曹丕，復興漢室．
    - `dialogue`
      > 魏延: 多謝您能用我這樣新來乍到的人，以後也請您多提攜．
    - `dialogue`
      > 馬超: 殺了曹丕，報亡父之仇，也為萬民報仇．願將其首級祭於亡父靈前．下命令吧！
    - `dialogue`
      > 趙雲: 吾與主公患難相隨，今後也將榮辱與共．這最後一戰，願冒死當先．
    - `if_flags` 
    - `dialogue`
      > 張飛: 大哥，關鍵時刻到了．怎麼身子有些發顫！
      > 劉備: 怎麼了？還怕嗎？
      > 張飛: 瞧您說的！我這是精神抖擻，讓我出征！
    - `if_flags` 
    - `dialogue`
      > 關羽: 兄長，我等夙願就要實現了．
      > 劉備: 是啊！說實話，當時聽說二弟你敗走荊州時，我以為你以不在了……現在真好！
      > 關羽: 兄長說哪兒話，我等不是發誓寧願同死嗎？俺關羽絕不背棄誓言．兄長，我先準備準備．
    - `if_flags` 
    - `dialogue`
      > 龐統: 主公，我也準備去了．
      > 劉備: 龐統，若沒有你，有不會迎來今日，多謝了．
      > 龐統: 哪裡哪裡，實不敢當．我也蒙受主公知遇之恩，欣喜異常．好吧，我先去準備出征．
    - `dialogue`
      > 劉備: 太好了．我也該準備……？
    - `dialogue`
      > 黃忠: 主公，就在此一戰了．
      > 嚴顏: 我們隨時接應．
      > 劉備: 黃忠！嚴顏！
    - `dialogue`
      > 諸葛亮: ……？主公，怎麼了？
      > 劉備: 嗨！……此時此刻，彷彿黃忠和嚴顏二位老將軍還在……
      > 諸葛亮: ……．主公，請進去準備吧．
    - `set_objective`
      > 進行出征準備．
  - **r2** talk(3) [諸葛亮] 그룹 2* — 그룹 넘김
    - `dialogue`
      > 諸葛亮: 準備好了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r3** run(0) 그룹 3
    - `dialogue`
      > 諸葛亮: 請調兵派將．
    - `battle_setup` 
    - `dialogue`
      > 諸葛亮: 向鄴城進軍！
    - `load_map` map=4096
    - `play_music` song=3
- **블록 2**: 전투; 레코드 8, 그룹 4; 대화 0(잡담 0); 맵: 전투 맵 55
  - 적군 명단: 30기 (플래그 조건 1기)
  - 트리거: battle_won, unit_at_cell, unit_contact
  - 목표 문구: 一、曹丕的結局
  - r3 일기토
  - r3 레벨 +1: 張苞
  - r4 일기토
  - r4 레벨 +1: 關興
  - r5 아이템: 援軍書  
  - r6 아이템: 霸王之劍
  - 플래그 켬: {124, 125}
  - 플래그 검사: {124, 125}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12343
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、曹丕的結局
    - `dialogue`
      > 曹丕: 你們這些東西，侵犯朕的領土．這個國家是父親傳給我的，比什麼都重要，不能交給任何人．
      > 諸葛亮: 曹丕已來到城外決戰了，奮勇進攻吧！
    - `play_music` song=16
  - **r3** unit_contact(4) [張苞] 그룹 3*
    - `dialogue`
      > 張苞: 來將可是曹彰？喂，那個黃毛小子！速來與我決戰！
      > 曹彰: 呸，少廢話，我曹彰可不是吃素的！
    - `duel` first=張苞 second=曹彰
    - `duel_begin` 
    - `dialogue`
      > 曹彰: 真是對手，看我一戟？
    - `duel_action` person=曹彰 action=1
    - `duel_action` person=曹彰 action=0
    - `duel_action` person=曹彰 action=1
    - `dialogue`
      > 張苞: 哦，這……
      > 曹彰: 招傢伙！
    - `duel_action` person=曹彰 action=0
    - `duel_action` person=張苞 action=2
    - `dialogue`
      > 張苞: 好險！
      > 曹彰: 好小子！躲過去了！
      > 張苞: 該我的了．
    - `duel_action` person=張苞 action=7
    - `dialogue`
      > 曹彰: 哎呀！可惜……
    - `duel_action` person=曹彰 action=3
    - `duel_action` person=張苞 action=9
    - `dialogue`
      > 張苞: 刺中了！幹掉這小子！
    - `duel_end` 
    - `add_levels` person=張苞 levels=1
    - `caption`
      > 張苞的等級上升！
  - **r4** unit_contact(4) [關興] 그룹 3
    - `dialogue`
      > 關興: 曹氏兄弟也親自出征了，好吧，看我宰了你！曹植，小心了！
      > 曹植: 啊……既然如此，不戰也不行了．
    - `duel` first=關興 second=曹植
    - `dialogue`
      > 關興: 我乃關羽之子關興，曹植，你死定了！
      > 曹植: 打就打吧！
    - `duel_action` person=關興 action=8
    - `dialogue`
      > 曹植: 啊！
    - `duel_action` person=曹植 action=3
    - `duel_action` person=關興 action=9
    - `duel_action` person=關興 action=2
    - `dialogue`
      > 關興: 曹植，宰你的是我關興！
    - `duel_end` 
    - `add_levels` person=關興 levels=1
    - `caption`
      > 關興的等級上升！
  - **r5** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=援軍書  
    - `set_flag` flag=124 clear=0
  - **r6** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=霸王之劍
    - `set_flag` flag=125 clear=0
  - **r7** battle_won(7) 그룹 3 — 그룹 넘김
    - `play_music` song=7
    - `dialogue`
      > 曹丕: 哎呀！你們要幹什麼？朕可是大魏皇帝！
      > 劉備: 殺了你，拯救亂世！準備受死吧！
      > 曹丕: 朕知道，可是朕還不想死！我投降！這總可以吧？
      > 劉備: 這也是曹操的兒子嗎？可悲，可嘆……
    - `play_music` song=11
    - `join_battle` person=司馬懿
    - `dialogue`
      > 曹丕: 哦，司馬懿！你去哪裡了？來，快殺了這群傢伙！
      > 司馬懿: 是，如您所望，殺給你看……
      > 曹丕: 嗯？司、司馬懿！你瘋了嗎？敵人在對面！為何以劍指朕？
      > 劉備: 怎麼？發生了什麼事？
      > 司馬懿: 你這不成器的傢伙，玷汙了曹操主公一世盛名！我替他老人家懲罰你！
      > 曹丕: 喂！司馬懿！住手！哇啊！！
    - `caption`
      > 司馬懿手刃了曹丕！
    - `dialogue`
      > 司馬懿: 劉備！曹丕雖死，但魏國不會滅亡，我將繼承曹操主公的意志！我在城內等你！
    - `play_music` song=3
    - `dialogue`
      > 劉備: 究竟怎麼回事？
      > 諸葛亮: 不知道．能說的就是，大戰還沒結束．進攻城內吧！
    - `leave_parallel` 
- **블록 3**: 전투; 레코드 13, 그룹 4; 대화 0(잡담 0); 맵: 전투 맵 56
  - 전투 설정: 턴 제한 40, 아군 출진 15명, 격파 대상 #213, 퇴각하면 패배 #0
  - 적군 명단: 30기 (플래그 조건 1기)
  - 트리거: battle_won, turn, unit_at_cell
  - 목표 문구: 一、司馬懿的結局
  - r0 (run) 전투 끝
  - r3 아이템: 援軍書  
  - r4 아이템: 援軍書  
  - r5 아이템: 勇氣書  
  - r6 아이템: 勇氣書  
  - r11 게임 오버
  - 플래그 켬: {126, 127, 128, 129}
  - 플래그 검사: {126, 127, 128, 129}
  - **r0** run(0) 그룹 0
    - `battle_setup` 
    - `battle_roster` 
    - `battle_end` next_map=12344
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、司馬懿的結局
    - `dialogue`
      > 司馬懿: 哈哈！如此魏國不會滅亡了！蜀軍，來受死吧！
    - `halve` a=1 b=1
    - `halve` a=0 b=1
    - `dialogue`
      > 劉備: 哦，怎麼？在自家城裡放火！
      > 諸葛亮: 敵人好像孤注一擲了，要麼徹底勝利，要麼寧為玉碎．
      > 劉備: 什麼？自家軍隊被火燒，也是預料之中？
      > 諸葛亮: 是的，這座城也保不住了，如果不撤退……啊！城門！
    - `set_map_chip` x=22 y=23 chip=1
    - `dialogue`
      > 劉備: 可惡！怎麼連退路都沒有！
      > 司馬懿: 哈哈哈！燒死才好！曹操主公，來世再追隨您！
      > 諸葛亮: 主公，只有衝了．司馬懿肯定準備好了逃跑的路．
      > 劉備: 好，全體將士，捉住司馬懿！
    - `play_music` song=9
  - **r3** unit_at_cell(6) [(any unit)] 그룹 3*
    - `if_flags` 
    - `add_item` item=援軍書  
    - `set_flag` flag=126 clear=0
  - **r4** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=援軍書  
    - `set_flag` flag=127 clear=0
  - **r5** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=勇氣書  
    - `set_flag` flag=128 clear=0
  - **r6** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=勇氣書  
    - `set_flag` flag=129 clear=0
  - **r7** turn(9) 그룹 3
    - `play_music` song=11
    - `dialogue`
      > 諸葛亮: 主公，危險！請趕快吧！
    - `play_music` song=9
  - **r8** turn(9) 그룹 3
    - `play_music` song=11
    - `dialogue`
      > 諸葛亮: 主公，請趕快！
    - `play_music` song=9
  - **r9** turn(9) 그룹 3
    - `play_music` song=11
    - `dialogue`
      > 諸葛亮: 主公，趕快！
    - `play_music` song=9
  - **r10** turn(9) 그룹 3
    - `play_music` song=11
    - `dialogue`
      > 諸葛亮: 主公，請趕快！城牆已不堅固了，危險！
    - `play_music` song=9
  - **r11** turn(9) 그룹 3
    - `play_music` song=11
    - `dialogue`
      > 司馬懿: 時候到了．劉備，再見了．和鄴城一起毀滅吧．
      > 諸葛亮: 主公，城崩塌了．
      > 劉備: 什麼！啊！
    - `narration`
      > 　鄴城被燒毀．
      > 　劉備軍中了司馬懿的火計，全軍覆沒．
    - `game_over` 
  - **r12** battle_won(7) 그룹 3 — 그룹 넘김
    - `play_music` song=7
    - `dialogue`
      > 司馬懿: 可惡……即使竭我之力，也無法遏制蜀軍……
      > 劉備: 司馬懿，等死吧！
      > 司馬懿: 呀！
    - `play_music` song=11
    - `narration`
      > 　司馬懿再堅持一下．
    - `dialogue`
      > 劉備: 嗯？什麼聲音？
      > 司馬懿: 此聲……呀，但是，絕不……
    - `narration`
      > 　司馬懿還要堅持．只要有我在……
    - `play_music` song=10
    - `join_battle` person=曹操
    - `dialogue`
      > 曹操: 司馬懿，還沒結束！
      > 司馬懿: 哦，曹操主公！
      > 劉備: 什麼！是曹操！為何曹操……
      > 曹操: 劉備，你把魏國折騰得夠苦，也就到此為止了．我正在此等著你，你運氣還可以．但是，打到我這裡……哈哈哈！
    - `play_music` song=3
    - `dialogue`
      > 司馬懿: 曹操主公，請稍等！
      > 劉備: 怎麼回事？難道曹操沒死？
      > 諸葛亮: 我也不知，可是……
      > 劉備: 可是什麼？
      > 諸葛亮: 現在看到的，也不是在夢裡吧？
      > 劉備: 嗯……說曹操進去了，走，除了到裡面瞧瞧．也別無他法．
    - `dialogue`
      > 諸葛亮: 是，那我們進去吧．
    - `leave_parallel` 
- **블록 4**: 전투; 레코드 22, 그룹 4; 대화 0(잡담 0); 맵: 전투 맵 57
  - 전투 설정: 턴 제한 50, 아군 출진 15명, 격파 대상 #8, 퇴각하면 패배 #0
  - 적군 명단: 30기 (플래그 조건 1기)
  - 트리거: battle_won, turn, unit_contact
  - 목표 문구: 一、曹操的滅亡
  - r0 (run) 전투 끝
  - r3 일기토
  - r3 레벨 +1: 張飛
  - r4 일기토
  - r4 레벨 +1: 關羽
  - r5 일기토
  - r5 레벨 +1: 趙雲
  - r6 일기토
  - r6 레벨 +1: 馬超
  - 플래그 검사: {58, 218}
  - **r0** run(0) 그룹 0
    - `battle_setup` 
    - `battle_roster` 
    - `battle_end` next_map=12345
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、曹操的滅亡
    - `dialogue`
      > 劉備: 曹操，沒想到吧！你不是就要完了嗎！
      > 曹操: 連曹丕、司馬懿等人都被騙了，你一定不知道，好吧，我為你解釋一下．
      > 曹操: 魏、蜀、吳這三國，關係微妙，勢均力敵，互相牽制．如果這種狀況持續下去，我無法統一天下．所以，我決定詐死．
      > 劉備: 詐死？
      > 曹操: 正是．如果我死了，料想三國的平衡就打破了．接著，我播下了禍種，先殺了關羽，把責任推給東吳，想讓吳蜀相爭．
    - `dialogue`
      > 諸葛亮: 什麼！如此說，吳、蜀相爭竟是曹操的圈套．
      > 曹操: 正是．那時我已不在了，東吳可以安心與蜀作戰．就是那麼想的，可真沒想到蜀吳會結成同盟．劉備，你能容忍東吳，我萬沒想到．
      > 劉備: ……
      > 曹操: 蜀吳兩敗俱傷，不論哪家滅亡了，剩下的另一家都已元氣大傷．那時再出擊，可輕易取勝，於是，魏國就可統一天下．這正是我的如意算盤，……沒想到我錯了．
      > 曹操: 而且，將國家交給曹丕等人也是大錯，這個國家輕易地毀在那傢伙手裡．這座美麗的城市，也如此狼狽．
      > 劉備: ……
      > 曹操: 但是，還不會就這麼結束！打敗你，合併魏、蜀兩國，再統一天下．劉備，不要妨礙我的夢想的實現．
      > 劉備: 曹操，你那樣的想法製造了世上的戰亂，是萬民塗炭的元兇！董卓、呂布、袁紹、袁術……，這些人，都只顧自己．曹操，你也和他們一樣．
      > 曹操: 什麼！說我與董卓之流一樣！混蛋……！
      > 劉備: 曹操，天下人已容不下你！亂國害君，你不死無以謝天下．
    - `play_music` song=10
  - **r3** unit_contact(4) [張飛] 그룹 3*
    - `dialogue`
      > 張飛: 來將可是許褚．張飛在此，特來送你見閻王，許褚，一決勝負．
      > 許褚: 呸！張飛，過來受死！
    - `duel` first=張飛 second=許褚
    - `dialogue`
      > 張飛: 呀！
    - `duel_begin` 
    - `dialogue`
      > 許褚: 哦，果然有兩下子！
    - `duel_begin` 
    - `dialogue`
      > 張飛: 看不出，你還有兩手！呀！
    - `duel_begin` 
    - `dialogue`
      > 許褚: 難決勝負．張飛，這刀結束你算了．
      > 張飛: 來呀！
      > 許褚: 看招！
    - `duel_action` person=許褚 action=1
    - `dialogue`
      > 張飛: 不過如此！
    - `duel_action` person=張飛 action=0
    - `duel_action` person=許褚 action=2
    - `dialogue`
      > 張飛: 真可惜．
      > 許褚: 殺了我吧．
      > 張飛: 死吧！
    - `duel_action` person=張飛 action=6
    - `dialogue`
      > 許褚: 啊……！
    - `duel_action` person=許褚 action=3
    - `duel_action` person=張飛 action=9
    - `duel_action` person=張飛 action=5
    - `dialogue`
      > 張飛: ……剛才真驚險．
    - `duel_end` 
    - `add_levels` person=張飛 levels=1
    - `caption`
      > 張飛的等級上升！
  - **r4** unit_contact(4) [關羽] 그룹 3
    - `if_flags` 
    - `dialogue`
      > 關羽: 張遼……
      > 張遼: 關羽……
      > 關羽: 張遼，我和你勢必一戰……
      > 張遼: 什麼也別說了．來吧，亮武器吧！
      > 關羽: ……
    - `duel` first=關羽 second=張遼
    - `duel_begin` 
    - `dialogue`
      > 張遼: 關羽！別愣著！好好打！不然，會被我殺了！來吧！
    - `duel_action` person=張遼 action=1
    - `duel_action` person=張遼 action=0
    - `duel_action` person=張遼 action=1
    - `dialogue`
      > 張遼: 哈哈……
      > 關羽: 張遼，死定了！
    - `duel_action` person=關羽 action=7
    - `dialogue`
      > 張遼: 哎呀！！不好！
    - `duel_action` person=張遼 action=3
    - `dialogue`
      > 關羽: 張遼……
      > 張遼: 別那麼傷心．現在，我感覺很清爽，為了我所效忠的君主……而死．士為知己者死，這是我的夢想……沒想到現在實現了．
      > 關羽: 可是，我……發生了這樣的結果……
      > 張遼: 關羽，如果當年在下邳沒有你，也到不了今日．有……禮了，多……謝了！
      > 關羽: 張遼……為什麼？注定要如此悲慘的結局！嗚！！
    - `duel_end` 
    - `add_levels` person=關羽 levels=1
    - `caption`
      > 關羽的等級上升了！
  - **r5** unit_contact(4) [趙雲] 그룹 3
    - `dialogue`
      > 趙雲: 李典！與我決一死戰！
      > 李典: 既然如此，我也無計可施．趙雲，放馬過來！
    - `duel` first=趙雲 second=李典
    - `dialogue`
      > 李典: 啊！
    - `duel_action` person=趙雲 action=8
    - `duel_action` person=趙雲 action=5
    - `duel_action` person=李典 action=3
    - `dialogue`
      > 李典: 啊，魏國也要亡了……
    - `duel_end` 
    - `add_levels` person=趙雲 levels=1
    - `caption`
      > 趙雲的等級上升了！
  - **r6** unit_contact(4) [馬超] 그룹 3
    - `dialogue`
      > 馬超: 樂進！在渭水多蒙你”關照”！現在在此，我要報仇雪恨！看招！
      > 樂進: 嘿！
    - `duel` first=馬超 second=樂進
    - `duel_begin` 
    - `dialogue`
      > 馬超: 呀！
    - `duel_action` person=馬超 action=1
    - `duel_action` person=馬超 action=0
    - `duel_action` person=馬超 action=1
    - `dialogue`
      > 樂進: 哇！
      > 馬超: 嘿！
    - `duel_action` person=馬超 action=7
    - `dialogue`
      > 樂進: 啊！
    - `duel_action` person=樂進 action=3
    - `duel_action` person=馬超 action=9
    - `duel_action` person=馬超 action=2
    - `dialogue`
      > 馬超: 哼！渭水之恨，稍稍得雪！
    - `duel_end` 
    - `add_levels` person=馬超 levels=1
    - `caption`
      > 馬超的等級上升了！
  - **r7** turn(9) 그룹 3
    - `play_music` song=11
    - `dialogue`
      > 曹操: 我要出征了．
    - `caption`
      > 城內起火了！
    - `dialogue`
      > 曹操: 太好了，哈哈哈……劉備，沒想到我預先在城中做了手腳．啊，火啊，著得好！用火打斷劉備軍！
    - `play_music` song=10
  - **r8** turn(9) 그룹 3
  - **r9** turn(9) 그룹 3
    - `play_music` song=11
    - `dialogue`
      > 諸葛亮: 哦，主公，前面路上！
      > 劉備: 什麼事……
      > 曹操: 哈哈哈！燒吧，燒吧！用火攻，將你們打斷！
    - `play_music` song=10
  - **r10** turn(9) 그룹 3
  - **r11** turn(9) 그룹 3
  - **r12** turn(9) 그룹 3
  - **r13** turn(9) 그룹 3
  - **r14** turn(9) 그룹 3
    - `play_music` song=11
    - `dialogue`
      > 劉備: 啊！還有火！
      > 司馬懿: 別管城中之事了！打敗你們這些人，天下就盡歸曹公了！劉備！孔明！為了曹公，一定消滅你們！
      > 曹操: 正是如此，司馬懿，這是最後決戰，在這裡只許勝不准敗．
    - `play_music` song=10
  - **r15** turn(9) 그룹 3
  - **r16** turn(9) 그룹 3
  - **r17** turn(9) 그룹 3
  - **r18** turn(9) 그룹 3
  - **r19** turn(9) 그룹 3
    - `play_music` song=11
    - `dialogue`
      > 曹操: 劉備，當年，在許昌的花園煮酒論英雄，那時的話還記得嗎？當時說到最後，只有兩個英雄，就是你我二人……我的眼力還是沒有錯．
      > 曹操: 如果你不背叛我，與我同舟共濟的話，我也許走的是另一條路吧．或者還是……嗨，現在說這些都晚了．
      > 曹操: 劉備，不管怎麼說，我二人相爭已是天命，現在就是決定命運的時候，你來得正好！
    - `play_music` song=10
  - **r20** turn(9) 그룹 3
  - **r21** battle_won(7) 그룹 3 — 그룹 넘김
    - `play_music` song=11
    - `dialogue`
      > 曹操: 哼！劉、劉備……！你把我的夢想……都攪亂了……！啊！！
    - `play_music` song=7
    - `narration`
      > 　劉備打敗了曹操，率軍佔領了鄴城．
    - `dialogue`
      > 劉備: 成功了，終於打敗曹操！
      > 諸葛亮: 主公，大功告成了．
    - `if_flags` 
    - `dialogue`
      > 關羽: 大哥，恭喜您了，實現了多年的願望，真不容易．
      > 張飛: 啊，等太久了．
    - `dialogue`
      > 趙雲: 去迎接聖上吧！
      > 劉備: 好！高奏凱歌回洛陽！
    - `leave_parallel` 
- **블록 5**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 마을 0, 지도
  - r0 (run) 전투 끝
  - r0 엔딩
  - r0 엔딩
  - r0 엔딩
  - 플래그 검사: {38, 58, 135}
  - **r0** run(0) 그룹 0
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=12
    - `narration`
      > 　曹操的夢想破滅了．
      > 　在這裡，隨著曹操的滅亡……
      > 　結了魏、蜀、吳三國時代．
    - `load_map` map=8192
    - `if_flags` 
    - `if_flags` 
    - `if_flags` 
    - `play_music` song=5
    - `caption`
      > 洛陽宮殿
    - `narration`
      > 　在鄴城取得勝利、凱旋回洛陽的劉備等人，再次迎回被逐出京都的獻帝．
    - `dialogue`
      > 獻帝: 沒想到真的又能回到這裡了，這一切都多虧了皇叔，謝皇叔．
      > 劉備: 哪裡，臣來遲了，萬望恕罪．陛下，請登寶座．
      > 獻帝: 好．
    - `if_flags` 
    - `if_flags` 
    - `if_flags` 
    - `dialogue`
      > 獻帝: 今後還望大家為了天下萬民，更加努力為朝廷效力．
      > 劉備: 是．
    - `play_music` song=7
    - `narration`
      > 　劉備終於成就復興漢室的大業，時年２２４年，從聯盟討董卓，至今歷時３４年．
    - `op_3d` value=1
    - `if_flags` 
    - `ending` ending=2
    - `if_flags` 
    - `ending` ending=1
    - `if_flags` 
    - `ending` ending=0
