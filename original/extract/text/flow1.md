# 시나리오 흐름: SNR1D.R3 (원문 포함, 이 컴퓨터에만 둘 것)

## SNR1D.R3 + SNR1M.R3

### 장면 0

제목: 第一章界橋之戰

- **블록 0**: 이야기; 레코드 5, 그룹 3; 대화 2(잡담 2); 맵: 마을 2, 지도
  - 트리거: location
  - 목표 문구: 搜集情報
  - r0 삽화 4
  - **r0** run(0) 그룹 0
    - `play_music` song=0
    - `chapter_title` key=第一章界橋之戰
    - `title`
      > 第一章界橋之戰
    - `show_picture` picture=4 variant=0
    - `narration`
      > 為討伐董卓而聚集的群雄，隨著聯軍解散，各自回到了自己的領地．聯軍主帥袁紹，用計奪取了韓馥的冀州，形成了以鄴城為據點的一大勢力．
    - `narration`
      > 袁紹奪得冀州後，又開始盯上公孫瓚的領地．袁紹在位於與公孫瓚領地交界的界橋集結了大量兵力．
    - `load_map` map=4096
    - `play_music` song=11
    - `dialogue`
      > 袁紹: 好，打垮公孫瓚！拿下北平的話，北面的半壁江山就成了我的了．分兵兩路進攻北平，張郃經巨鹿進攻，麴義經清河進攻．
      > 張郃: 是！我馬上進攻巨鹿！
      > 麴義: 那麼我發兵清河．
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 公孫瓚: 袁紹攻過來了！
      > 嚴綱: 是的．從邊境的界橋出發，兵分清河、巨鹿兩路攻過來了．
      > 公孫瓚: 唉……．那麼嚴綱，你率軍去清河，我進軍巨鹿．最終的目標是界橋．殺死袁紹．
      > 嚴綱: 是！
    - `play_music` song=0
    - `narration`
      > 兩軍在清河和巨鹿對峙，互相窺視對方的動態，兩軍隔著邊境對峙的狀態持續了好幾個月．
  - **r1** run(0) 그룹 1
    - `load_map` map=8194
    - `set_previous_map` map=0 x=26 y=6
    - `play_music` song=5
    - `caption`
      > 平原議事廳
    - `dialogue`
      > 關羽: 兄長，公孫瓚軍和袁紹軍已經對峙了很長時間了．
      > 張飛: 就要這樣一直對峙下去？
      > 關羽: 不會的，現在雙方都在展開情報戰，不久就會打起來的．
      > 張飛: 哼，我不懂．
      > 關羽: 蠢貨！作為大將光靠武力不行．智勇雙全的人才是真正的大將，是吧．兄長．
      > 劉備: 當然是．
      > 張飛: 哎，那麼大哥也總是搞那種什麼情報戰？
      > 劉備: 當然．現在我就想去巡視城內，從居民那裡打探些情報．
      > 關羽: 不愧是兄長．好事要快辦．我和張飛看家，有事的話會去叫你．
    - `set_objective`
      > 搜集情報
  - **r2** talk(3) [關羽] 그룹 2*
    - `dialogue`
      > 關羽: 城裡有酒館等居民聚集的地方，想從居民那裡得到情報，還是去人多的地方好．
  - **r3** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 有什麼事的話會去叫你．
  - **r4** location(2) 그룹 2 — 그룹 넘김
    - `load_map` map=8194
    - `dialogue`
      > 關羽: 兄長，來了個叫簡雍的人，說是來見兄長．
    - `leave_parallel` 
- **블록 1**: 이야기; 레코드 3, 그룹 1; 대화 3(잡담 2)
  - r2 소속: 簡雍 → 유비군(합류)
  - **r0** talk(3) [關羽] 그룹 0*
    - `dialogue`
      > 關羽: 請兄長講話．
  - **r1** talk(3) [張飛] 그룹 0
    - `dialogue`
      > 張飛: 我不太清楚，大哥想個辦法吧．
  - **r2** talk(3) [簡雍] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 簡雍: 劉備，我叫簡雍．久仰您的大名，此次特地前來投靠，請您收下我．
    - `caption`
      > 簡雍成為劉備部下！
    - `set_allegiance` person=簡雍 army=0
    - `play_music` song=11
    - `dialogue`
      > 使者: 劉備，突然拜訪．我是公孫瓚派來的使者，請求您派兵支援．
    - `leave_parallel` 
- **블록 2**: 이야기; 레코드 8, 그룹 2; 대화 8(잡담 6)
  - 목표 문구: 去支援公孫瓚
  - 질문 r4 (關羽): 예 답이면 5 명령 실행, 출진 확인 [leave_parallel]
  - **r0** talk(3) [關羽] 그룹 0*
    - `dialogue`
      > 關羽: 請聽使者講話．
  - **r1** talk(3) [張飛] 그룹 0
    - `dialogue`
      > 張飛: 請聽使者講話．
  - **r2** talk(3) [簡雍] 그룹 0
    - `dialogue`
      > 簡雍: 公孫瓚出了什麼事了嗎？
  - **r3** talk(3) [使者] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 劉備: 使者啊！聽說袁紹軍從界橋正不斷向東進軍……
      > 使者: 是的．袁紹軍已經攻佔我們很多領土，現還在向縱深發展．我們主公已從北平出兵了．
      > 劉備: 那麼戰況如何？
      > 使者: 主公率領的主力部隊在界橋作戰，公孫越軍和嚴綱軍分別在巨鹿和清河作戰，但形勢都不太好．劉備，請你支援我們．
      > 張飛: 公孫瓚有危險了，大哥，快去支援吧．
      > 劉備: 唉，使者你回去對公孫瓚說我們馬上就去支援．
      > 使者: 噢，謝謝．
      > 簡雍: 主公，去界橋的話，從平原走有兩條路，一條經過廣川，一條經過信都城．
      > 劉備: 唉，廣川和信都城啊，應該走哪條呢？
      > 簡雍: 走信都城的話，到界橋有些繞遠路，不過有道具屋，補充足一些好．
      > 張飛: 還在說啊，再不快點去支援的話，公孫瓚豈不危險了．大哥快去支援吧．
      > 關羽: 準備好的話叫我一聲，我現在去道具屋買些兵器．
      > 簡雍: 我覺得公孫瓚的據點北平有賣兵器的，北平在平原的北面．
    - `set_objective`
      > 去支援公孫瓚
    - `leave_parallel` 
  - **r4** talk(3) [關羽] 그룹 1* — 그룹 넘김
    - `dialogue`
      > 關羽: 準備好了嗎？
    - `if_answer` answer=0 skip=5
    - `op_3d` value=0
    - `dialogue`
      > 關羽: 那麼出發吧．
    - `play_music` song=12
    - `leave_parallel` 
  - **r5** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 快出發吧．
  - **r6** talk(3) [簡雍] 그룹 1
    - `dialogue`
      > 簡雍: 從這裡去界橋，要路過廣川或信都城中的一個．
  - **r7** talk(3) [使者] 그룹 1
    - `dialogue`
      > 使者: 劉備，請你盡快去支援吧．
- **블록 3**: 전투 준비; 레코드 5, 그룹 3; 대화 0(잡담 0); 맵: 지도
  - 전투 설정: 턴 제한 30, 아군 출진 4명, 격파 대상 #54, 퇴각하면 패배 #0
  - 전투 설정: 턴 제한 30, 아군 출진 7명, 격파 대상 #105, 퇴각하면 패배 #0
  - 트리거: condition
  - 선택지 r1: 「走信都城」 r2 → 진행; 「走廣川」 r3 → 블록 4
  - r3 (run) → 블록 4
  - r4 (run) → 블록 6
  - **r0** run(0) 그룹 0
    - `load_map` map=4096
    - `dialogue`
      > 關羽: 兄長，你要走廣川這條路，還是走信都城這條路？
  - **r1** condition(1) 그룹 1* — 그룹 넘김
    - `choice`
      > 走信都城
      > 走廣川
  - **r2** run(0) 그룹 1 — 그룹 넘김
    - `leave_parallel` 
  - **r3** run(0) 그룹 1
    - `dialogue`
      > 關羽: 那麼走廣川吧，列隊．
    - `battle_setup` 
    - `load_map` map=4096
    - `play_music` song=11
    - `dialogue`
      > 袁紹: 逢紀，你去廣川．擾亂公孫瓚的背後．
      > 逢紀: 是．
      > 逢紀: 將士們，我們繞道公孫瓚背後去，進軍廣川！
    - `dialogue`
      > 公孫瓚: 什麼！袁紹軍要襲擊我們的背後？壞了！如果這樣的話，我們就進攻袁紹的大本營！進攻界橋！
    - `play_music` song=3
    - `dialogue`
      > 關羽: 向廣川進軍吧！
    - `goto_block` block=4
  - **r4** run(0) 그룹 2
    - `dialogue`
      > 關羽: 走信都城吧，列隊！
    - `battle_setup` 
    - `load_map` map=4096
    - `play_music` song=11
    - `dialogue`
      > 袁紹: 淳于瓊，你去信都城，攪亂公孫瓚的背後．
      > 淳于瓊: 是．
      > 淳于瓊: 將士們！我們繞到公孫瓚的背後去攻打信都城！跟上！
    - `dialogue`
      > 公孫瓚: 什麼！袁紹軍要襲擊我們的背後？壞了！如果這樣的話，我們就進攻袁紹的大本營！進攻界橋！
    - `play_music` song=3
    - `dialogue`
      > 關羽: 向信都城進軍吧！
    - `goto_block` block=6
- **블록 4**: 전투; 레코드 3, 그룹 3; 대화 0(잡담 0); 맵: 전투 맵 2
  - 적군 명단: 9기
  - 목표 문구: 一、逢紀的潰敗．
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12290
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、逢紀的潰敗．
    - `caption`
      > 廣川戰場
    - `dialogue`
      > 關羽: 那是？兄長，像是袁紹軍．
      > 簡雍: 什麼，袁紹軍！袁紹軍正與公孫瓚軍打仗呢，為什麼出現在這裡？
      > 張飛: 既然袁紹軍到達這裡，恐怕公孫瓚軍已被打敗了．
      > 逢紀: 什麼，有軍隊？誰的軍隊？噢，原來是平原的劉備軍，是去支援公孫瓚的．本來是在這裡布陣，打公孫瓚的背後．也好就打劉備．將士們，迎擊劉備軍．
      > 張飛: 大哥，袁紹軍打過來了．
      > 關羽: 既然打過來了，就教訓教訓他．
    - `play_music` song=9
- **블록 5**: 이야기; 레코드 14, 그룹 6; 대화 6(잡담 4); 맵: 마을 16, 지도
  - 트리거: battle_won, unit_at_cell, unit_contact
  - 목표 문구: 去支援公孫瓚
  - r0 일기토
  - r0 레벨 +1: 關羽
  - r1 아이템: 豆
  - r4 (run) 전투 끝
  - r5 소속: 韓英 → 유비군(합류)
  - r5 소속: 郭適 → 유비군(합류)
  - r7 상점 목록 설정
  - 질문 r12 (關羽): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - r13 (run) → 블록 10
  - 플래그 켬: {60, 180}
  - 플래그 검사: {60, 180}
  - **r0** unit_contact(4) [關羽] 그룹 0* — 그룹 넘김
    - `dialogue`
      > 關羽: 對面的主將聽著，關羽要與你們決一勝負！
      > 逢紀: 好，放馬過來！
    - `duel` first=關羽 second=逢紀
    - `dialogue`
      > 逢紀: 你叫什麼名字？
      > 關羽: 我叫關羽關雲長．
      > 逢紀: 關羽……？什麼！是關羽？是那個大名遠揚的關羽？
      > 關羽: 噢，知道我的名字啊，那麼某種程度上也知道我的厲害吧．
      > 逢紀: 放屁！殺啊！
    - `duel_begin` 
    - `dialogue`
      > 逢紀: 不愧是擊敗呂布軍的英雄……實在打不過．
      > 關羽: 看刀！
    - `duel_action` person=關羽 action=0
    - `dialogue`
      > 逢紀: 噢！再也堅持不了啦，既然是關羽，我還是快逃吧．
    - `duel_action` person=逢紀 action=4
    - `duel_end` 
    - `add_levels` person=關羽 levels=1
    - `caption`
      > 關羽的等級上升了！
    - `dialogue`
      > 逢紀: 這廣川也只好放棄了．全軍撤退！
    - `leave_parallel` 
  - **r1** unit_at_cell(6) [(any unit)] 그룹 0
    - `if_flags` 
    - `add_item` item=豆
    - `set_flag` flag=60 clear=0
  - **r2** unit_at_cell(6) [(any unit)] 그룹 0
    - `if_flags` 
    - `data` kind=2 value=100
    - `caption`
      > 繳獲了黃金１００！
    - `set_flag` flag=180 clear=0
  - **r3** battle_won(7) 그룹 0 — 그룹 넘김
    - `dialogue`
      > 逢紀: 唉，劉備軍相當厲害！廣川也只好放棄了，全軍撤退！
    - `leave_parallel` 
  - **r4** run(0) 그룹 1
    - `play_music` song=7
    - `narration`
      > 逢紀敗退了，劉備軍打敗了袁紹軍．
    - `data` kind=2 value=200
    - `caption`
      > 繳獲了黃金２００！
    - `battle_end` next_map=4096
  - **r5** run(0) 그룹 2
    - `load_map` map=8208
    - `play_music` song=5
    - `caption`
      > 廣川營帳
    - `dialogue`
      > 關羽: 兄長，袁紹軍好像敗退了．
      > 劉備: 唉，可是袁紹軍都來到這裡了，我看好像不妙啊．
      > 簡雍: 像是不妙，嗯？主公，好像有人來．
    - `dialogue`
      > 韓英: 劉備，請原諒冒昧來訪．我們是信都城的武將，我叫韓英．
      > 郭適: 我叫郭適，初次與你見面．
      > 劉備: 你們為什麼還要到這裡來？
      > 韓英: 信都城被袁紹佔領了，我們倆是奉命守城的．因袁紹軍攻勢猛烈……
      > 郭適: 是被袁紹手下淳于瓊攻陷了．
      > 關羽: 什麼！袁紹都攻到信都城來了？
      > 郭適: 是的，之後我們聽說劉備軍前來支援，所以投奔你們來了．
      > 韓英: 如此讓袁紹為所欲為，也太令人心灰意冷了．劉備，請讓我們加入吧．
      > 韓英: 我一定要報此仇，請讓我們加入吧．
      > 張飛: 大哥就讓他們加入吧．也怪可憐的．
      > 劉備: 你們倆個加入我軍，我們的陣營又強大了．好好幹吧！
      > 韓英: 謝謝．
      > 郭適: 請看我們的表現吧．
    - `caption`
      > 韓英、郭適加入劉備軍！
    - `set_allegiance` person=韓英 army=0
    - `set_allegiance` person=郭適 army=0
  - **r6** run(0) 그룹 3
    - `dialogue`
      > 簡雍: 陣容也強大了，快去救援吧．
      > 劉備: 簡雍，這裡離界橋很近了吧？
      > 簡雍: 還不近，從這裡去界橋有兩條路，一條經過清河，另一條經過巨鹿．
      > 劉備: 清河和巨鹿，走哪條路都通往界橋嗎？
      > 簡雍: 是的．
      > 關羽: 可是，袁紹軍既然已來到了這裡，那裡也會有敵人吧．
      > 張飛: 有就有吧，我來解決他們．
      > 關羽: 快準備出征吧．我叫來了刀匠，你們選用吧．
    - `dialogue`
      > 道具屋: 謝謝關照，需要什麼刀槍，請說吧．
    - `set_objective`
      > 去支援公孫瓚
  - **r7** talk(3) [道具屋] 그룹 4*
    - `set_shop_items` 
    - `nop` 
  - **r8** talk(3) [張飛] 그룹 4
    - `dialogue`
      > 張飛: 大哥，快走吧，我已經憋不住了．
  - **r9** talk(3) [簡雍] 그룹 4
    - `dialogue`
      > 簡雍: 出征前有兩件事要準備，一是買些武器，二是做好記錄．
  - **r10** talk(3) [韓英] 그룹 4
    - `dialogue`
      > 韓英: 我要努力殺敵，下命令吧．
  - **r11** talk(3) [郭適] 그룹 4
    - `dialogue`
      > 郭適: 我要努力殺敵，下命令吧．
  - **r12** talk(3) [關羽] 그룹 4 — 그룹 넘김
    - `dialogue`
      > 關羽: 準備好了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r13** run(0) 그룹 5
    - `dialogue`
      > 關羽: 出發吧！
    - `load_map` map=4096
    - `play_music` song=12
    - `dialogue`
      > 張飛: 大哥，清河和巨鹿去哪裡？快決定．
    - `goto_block` block=10
- **블록 6**: 전투; 레코드 10, 그룹 4; 대화 0(잡담 0); 맵: 전투 맵 3
  - 적군 명단: 10기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact
  - 목표 문구: 一、淳于瓊敗退． 二、劉備到達城門．
  - r5 일기토
  - r5 레벨 +1: 張飛
  - r8 아이템: 酒
  - 플래그 켬: {61, 181}
  - 플래그 검사: {61, 181}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12291
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、淳于瓊敗退．
      > 二、劉備到達城門．
    - `caption`
      > 信都城
    - `dialogue`
      > 藩宮: 就要守不住了……袁紹軍怎麼會在這兒出現．
      > 淳于瓊: 好．信都城快攻下來了，大家再加把勁．
      > 關羽: 兄長，好像是袁紹軍．信都城遭到袁紹軍的襲擊．
      > 簡雍: 袁紹軍怎麼會打到這裡來呢？公孫瓚怎麼樣了呢？
      > 淳于瓊: 唉，那是哪兒的部隊？像是平原劉備的部隊，劉備部隊怎麼來到這裡？不管他，在此殺掉劉備！全軍！向劉備軍出擊．
      > 張飛: 大哥，袁紹軍殺過來了．
      > 關羽: 兄長，救信都城吧．只要能守住信都城，袁紹軍就得撤退．向城門打吧！
    - `play_music` song=9
  - **r3** turn(9) 그룹 3*
  - **r4** turn(9) 그룹 3
  - **r5** unit_contact(4) [張飛] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 張飛: 哪個是主將？喂，我是張飛，哪個與我單挑較量！
      > 淳于瓊: 好，正中下懷．
    - `duel` first=張飛 second=淳于瓊
    - `dialogue`
      > 淳于瓊: 張飛！殺！
    - `duel_begin` 
    - `dialogue`
      > 淳于瓊: 這……！這麼厲害……
      > 張飛: 就這點兒能耐，贏不了我！
    - `duel_action` person=張飛 action=1
    - `dialogue`
      > 淳于瓊: 打不過他．媽的，沒辦法，走為上．
    - `duel_action` person=淳于瓊 action=4
    - `duel_end` 
    - `add_levels` person=張飛 levels=1
    - `caption`
      > 張飛的等級上升了！
    - `leave_parallel` 
  - **r6** battle_won(7) 그룹 3 — 그룹 넘김
    - `leave_parallel` 
  - **r7** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `data` kind=2 value=100
    - `caption`
      > 繳獲黃金１００！
    - `set_flag` flag=61 clear=0
  - **r8** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=酒
    - `set_flag` flag=181 clear=0
  - **r9** unit_at_cell(6) [劉備] 그룹 3 — 그룹 넘김
    - `data` kind=4 value=50
    - `leave_parallel` 
- **블록 7**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 지도
  - 목표 문구: 進信都城
  - r0 (run) 전투 끝
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 淳于瓊: 他媽的，再加把勁就能攻下來，可是只好全軍撤退！
    - `play_music` song=7
    - `narration`
      > 淳于瓊敗退了．劉備軍打敗了袁紹軍．
    - `data` kind=2 value=200
    - `caption`
      > 繳獲黃軍２００！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 關羽: 兄長，袁紹軍好像退兵了．
      > 劉備: 唉，可是袁紹軍竟能派一隻軍隊到這裡，戰況好像不妙啊．
      > 簡雍: 好像不妙，先進信都城吧．
    - `set_objective`
      > 進信都城
- **블록 8**: 이야기; 레코드 5, 그룹 2; 대화 4(잡담 3); 맵: 마을 4
  - 트리거: location
  - 목표 문구: 去支援公孫瓚
  - r0 소속: 藩宮 → 유비군(합류)
  - 질문 r1 (關羽): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - **r0** location(2) 그룹 0
    - `load_map` map=8196
    - `play_music` song=5
    - `caption`
      > 信都議事廳
    - `dialogue`
      > 藩宮: 劉備，您救了信都，太謝謝你了．
      > 劉備: 不用謝．還好，我們正好經過信都．
      > 藩宮: ……
      > 劉備: 我們這是去支援公孫瓚，剛才要從信都過去，發現你這裡受到攻擊．
      > 藩宮: 哦，……劉備，請讓我也加入援軍以報答您救信都之恩．
    - `caption`
      > 藩宮加入了劉備軍！
    - `set_allegiance` person=藩宮 army=0
    - `dialogue`
      > 關羽: 那麼，兄長，我們快去支援吧．準備好的話請說一聲．
    - `set_objective`
      > 去支援公孫瓚
  - **r1** talk(3) [關羽] 그룹 1* — 그룹 넘김
    - `dialogue`
      > 關羽: 準備好了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r2** talk(3) [簡雍] 그룹 1
    - `dialogue`
      > 簡雍: 主公，出發前要不要去打製兵器的道具屋看一看？
  - **r3** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 大哥，再不出發也許就來不及了．
  - **r4** talk(3) [藩宮] 그룹 1
    - `dialogue`
      > 藩宮: 我也參加你們的援軍．
- **블록 9**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 지도
  - **r0** run(0) 그룹 0
    - `load_map` map=4096
    - `play_music` song=12
    - `dialogue`
      > 關羽: 兄長，快去支援吧．
      > 劉備: 簡雍，這裡到界橋很近了吧？
      > 簡雍: 還不近．這裡到界橋有兩條路，一條經過清河，另一條經過巨鹿．
      > 劉備: 清河和巨鹿啊．走哪條路都通過界橋嗎？
      > 簡雍: 是的．
      > 關羽: 可是，袁紹軍既然派兵到了這裡，那裡也會有敵人吧．
      > 張飛: 有就有吧．我來解決他們．大哥，清河和巨鹿，你選擇哪條路？快決定吧．
- **블록 10**: 이야기; 레코드 3, 그룹 1; 대화 0(잡담 0)
  - 트리거: condition
  - 선택지 r0: 「通過巨鹿」 r1 → 블록 13; 「通過清河」 r2 → 진행
  - r1 (run) → 블록 13
  - 플래그 켬: {133}
  - **r0** condition(1) 그룹 0*
    - `choice`
      > 通過巨鹿
      > 通過清河
  - **r1** run(0) 그룹 0
    - `dialogue`
      > 關羽: 明白了，那麼去巨鹿吧．
    - `play_music` song=3
    - `set_flag` flag=133 clear=0
    - `goto_block` block=13
  - **r2** run(0) 그룹 0 — 그룹 넘김
    - `dialogue`
      > 關羽: 明白了，那麼去清河吧．
    - `play_music` song=3
    - `leave_parallel` 
- **블록 11**: 전투; 레코드 9, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 5
  - 전투 설정: 턴 제한 30, 아군 출진 6명, 격파 대상 #60, 퇴각하면 패배 #0
  - 적군 명단: 10기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact
  - 목표 문구: 一、殲滅麴義．
  - r2 일기토
  - r3 일기토
  - r3 레벨 +1: 關羽
  - r6 아이템: 酒
  - r8 (run) 전투 끝
  - 플래그 켬: {62, 182}
  - 플래그 검사: {62, 182}
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 關羽: 好像是敵人，列隊．
    - `battle_setup` 
    - `battle_roster` 
    - `load_map` map=12293
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、殲滅麴義．
    - `dialogue`
      > 嚴綱: 麴義！我嚴綱要和你單挑較量！
      > 麴義: 有膽量，但你要倒霉啦！你還覺得能打贏我麴義？殺啊！
    - `duel` first=麴義 second=嚴綱
    - `duel_begin` 
    - `dialogue`
      > 麴義: 嚴綱，看刀！
    - `duel_action` person=麴義 action=0
    - `dialogue`
      > 嚴綱: 哎呀！
    - `duel_action` person=嚴綱 action=3
    - `duel_end` 
    - `dialogue`
      > 麴義: 公孫瓚的大將嚴綱被斬了！
      > 關羽: 大哥，好像晚了一步嚴綱被斬，清河北平軍潰敗了．
      > 劉備: 晚了一步啊，好！血債要用血來還！
      > 麴義: 嗯？那不是劉備軍嗎？噢，想去支援公孫瓚．我麴義不讓你們去！
    - `play_music` song=14
  - **r3** unit_contact(4) [關羽] 그룹 3* — 그룹 넘김
    - `dialogue`
      > 關羽: 這裡的大將聽著！我要和你單挑較量！
      > 麴義: 什麼？竟還有人敢向我挑戰！好吧，就與你鬥一鬥！
    - `duel` first=關羽 second=麴義
    - `dialogue`
      > 麴義: 讓你也和剛才的嚴綱落個同樣下場！
    - `duel_begin` 
    - `dialogue`
      > 麴義: 好傢伙！好厲害……
      > 關羽: 強中自有強中手，算你倒霉，砍下你的首級．
    - `duel_action` person=關羽 action=6
    - `dialogue`
      > 麴義: 哎……！
    - `duel_action` person=麴義 action=3
    - `dialogue`
      > 關羽: 我的武藝也不夠嫻熟，這麼個小對手竟感到有點難對付……
    - `duel_end` 
    - `add_levels` person=關羽 levels=1
    - `caption`
      > 關羽的等級上升了！
    - `play_music` song=7
    - `narration`
      > 　關羽殺了麴義，
      > 　劉備軍突破了清河．
    - `leave_parallel` 
  - **r4** turn(9) 그룹 3
    - `dialogue`
      > 劉備: 嗯！那是！？
    - `join_battle` person=賊兵
    - `join_battle` person=賊兵
    - `caption`
      > 出現了敵人援軍！
  - **r5** battle_won(7) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 麴義: 喂，劉備！休想從這裡過去．
    - `play_music` song=7
    - `narration`
      > 劉備軍突破了清河．！
    - `leave_parallel` 
  - **r6** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=酒
    - `set_flag` flag=62 clear=0
  - **r7** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `data` kind=2 value=100
    - `caption`
      > 繳獲了黃金１００！
    - `set_flag` flag=182 clear=0
  - **r8** run(0) 그룹 4
    - `data` kind=2 value=200
    - `caption`
      > 繳獲了黃金２００！
    - `battle_end` next_map=4096
- **블록 12**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 지도
  - 목표 문구: 去界橋支援公孫瓚
  - r0 (run) → 블록 15
  - **r0** run(0) 그룹 0
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 張郃: 什麼！清河的麴義被公孫瓚軍突破了，沒辦法．撤回主公坐鎮的界橋！
      > 公孫越: 媽的，我的兵力再強大一點，就能捉住張郃．
    - `dialogue`
      > 關羽: 前面就是袁紹主力所在的界橋！
      > 張飛: 大哥快去界橋吧！
    - `set_objective`
      > 去界橋支援公孫瓚
    - `op_3d` value=1
    - `goto_block` block=15
- **블록 13**: 전투; 레코드 9, 그룹 4; 대화 0(잡담 0); 맵: 전투 맵 4
  - 전투 설정: 턴 제한 30, 아군 출진 9명, 격파 대상 #102, 퇴각하면 패배 #0
  - 적군 명단: 14기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact, unit_in_area
  - 목표 문구: 一﹑張郃敗退． 二﹑劉備到達西面鹿砦．
  - r3 일기토
  - r3 레벨 +1: 張飛
  - r5 (battle_won) 전투 끝
  - r7 (unit_at_cell) 전투 끝
  - r8 아이템: 麥
  - 플래그 켬: {162, 183}
  - 플래그 검사: {162, 183}
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 關羽: 好像是敵人，列隊．
    - `battle_setup` 
    - `battle_roster` 
    - `load_map` map=12292
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一﹑張郃敗退．
      > 二﹑劉備到達西面鹿砦．
    - `dialogue`
      > 顏良: 張郃，快些收拾掉北平軍，趕快和界橋的主力會合吧．
      > 張郃: 唉，可是我聽說公孫瓚的盟友劉備軍打敗了我軍的一支勁旅，正向巨鹿趕來，一定得設法不讓公孫瓚和劉備匯合．
    - `dialogue`
      > 劉備: 公孫越，平原劉備前來助戰．
      > 公孫越: 哦，是劉備，我們有救了．諸位，援軍來了．
      > 張郃: 來了，啊．劉備！我張郃在此擋路，你去不了界橋．
      > 顏良: 關羽！張飛！你們敢與我顏良交戰嗎？
      > 關羽: 大哥，敵人好像比想像的要厲害．現在我們不應該在這裡與敵人廝殺，而要衝開敵人陣地突出去．慶幸的是山下西面有一個鹿砦，如果我們摸到那裡，敵人也就束手無策了．
    - `play_music` song=14
  - **r3** unit_contact(4) [張飛] 그룹 3*
    - `dialogue`
      > 張飛: 噢，看樣子是個很厲害的對手嘛．我去對付他．
      > 顏良: 你是何人？朝這邊來是要和我交戰嗎？好哇，殺！
    - `duel` first=張飛 second=顏良
    - `duel_begin` 
    - `dialogue`
      > 張飛: 好像還有兩下子，碰上我算你倒霉．
      > 顏良: 讓你嚐嚐這一刀．
    - `duel_action` person=顏良 action=0
    - `duel_action` person=顏良 action=1
    - `duel_action` person=顏良 action=0
    - `dialogue`
      > 張飛: 你玩的什麼武藝？這樣還能贏我？
      > 顏良: 唉，連我這一刀也躲過去了，好厲害的傢伙．
      > 張飛: 你就這點本事啊．
    - `duel_action` person=張飛 action=1
    - `duel_action` person=顏良 action=2
    - `dialogue`
      > 顏良: 噢噢！打不過他，逃吧！
    - `duel_action` person=顏良 action=4
    - `duel_end` 
    - `add_levels` person=張飛 levels=1
    - `caption`
      > 張飛等級上升了！
  - **r4** turn(9) 그룹 3
    - `dialogue`
      > 劉備: 唉！那是！？
    - `play_music` song=11
    - `join_battle` person=賊兵
    - `join_battle` person=賊兵
    - `join_battle` person=賊兵
    - `caption`
      > 敵人的援軍來了！
    - `dialogue`
      > 劉備: 什麼？從前面也來了嗎！？
    - `join_battle` person=關純
    - `join_battle` person=耿武
    - `play_music` song=12
    - `dialogue`
      > 關純: 我是關純，原是韓馥的部下．此番前來加入劉備軍．
      > 耿武: 我們的主公韓馥被袁紹詐佔了冀州，此仇難忘，我耿武也前來加入劉備軍．
      > 劉備: 那是哪兒的軍隊？
      > 簡雍: 那的確是關純和耿武，他們是被袁紹詐佔了冀州的韓馥的部下．
      > 劉備: 噢，是要報仇吧．
      > 簡雍: 大概是吧．
      > 張飛: 總之不是敵人吧？那麼就是我們的援軍了．
    - `caption`
      > 耿武、關純來支援！
    - `play_music` song=14
  - **r5** battle_won(7) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 張郃: 媽的！敗給了劉備！撤退！
      > 劉備: 好，我軍勝利了！
    - `play_music` song=7
    - `narration`
      > 　張郃敗退了，劉備軍打敗了袁紹軍．
    - `data` kind=2 value=200
    - `caption`
      > 繳獲了黃金２００！
    - `battle_end` next_map=4096
    - `leave_parallel` 
  - **r6** unit_in_area(11) [劉備] 그룹 3
    - `if_flags` 
    - `dialogue`
      > 張郃: 不能讓劉備突破巨鹿，全軍阻擋劉備！
      > 關羽: 大哥，鹿砦就在眼前，想辦法衝過去吧．
    - `set_flag` flag=162 clear=0
  - **r7** unit_at_cell(6) [劉備] 그룹 3 — 그룹 넘김
    - `data` kind=4 value=50
    - `dialogue`
      > 張郃: 媽的！不能讓劉備過去！
      > 劉備: 好，突破巨鹿了．
    - `play_music` song=7
    - `narration`
      > 　劉備軍突破巨鹿了．
    - `battle_end` next_map=4096
    - `leave_parallel` 
  - **r8** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=麥
    - `set_flag` flag=183 clear=0
- **블록 14**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 지도
  - 목표 문구: 去界橋支援公孫瓚
  - r0 소속: 關純 → 유비군(합류)
  - r0 소속: 耿武 → 유비군(합류)
  - **r0** run(0) 그룹 0
    - `load_map` map=4096
    - `play_music` song=11
    - `dialogue`
      > 麴義: 什麼？巨鹿的張郃被公孫瓚軍突破了？沒辦法，只好返回主公坐鎮的界橋．
      > 嚴綱: 媽的，要是我武力再強點的話，就能捉住麴義了．
    - `play_music` song=3
    - `dialogue`
      > 關純: 劉備，我原是韓馥的下屬，叫關純．
      > 耿武: 我叫耿武．
      > 劉備: 唉．
      > 關純: 我們的主公韓馥，被袁紹奪去了冀州，現在鄉下默默的生活．我們還沒向袁紹報仇雪恨，劉備，請帶我們一起走．
      > 劉備: 明白了，那就跟我走吧．
      > 耿武: 是，謝謝劉備．
    - `caption`
      > 關純、耿武成為劉備下屬！
    - `set_allegiance` person=關純 army=0
    - `set_allegiance` person=耿武 army=0
    - `dialogue`
      > 關羽: 前面就是袁紹主力所在的界橋！
      > 張飛: 大哥，快去界橋吧．
    - `op_3d` value=1
    - `set_objective`
      > 去界橋支援公孫瓚
- **블록 15**: 전투; 레코드 13, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 6
  - 전투 설정: 턴 제한 40, 아군 출진 9명, 격파 대상 #9, 퇴각하면 패배 #0
  - 적군 명단: 19기
  - 적군 명단: 17기
  - 트리거: battle_won, unit_at_cell, unit_contact, unit_in_area
  - 목표 문구: 一、袁紹撤退． 二、劉備奪取兵糧庫．
  - r0 레벨 +4: 公孫瓚
  - r2 일기토
  - r2 일기토
  - r3 일기토
  - r3 레벨 +1: 張飛
  - r8 아이템: 火龍書  
  - r9 아이템: 長槍
  - r10 아이템: 連弩
  - r11 아이템: 麥
  - r12 (run) 전투 끝
  - 플래그 켬: {64, 148, 184, 185, 186, 213}
  - 플래그 검사: {64, 133, 148, 184, 185, 186, 213}
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 關羽: 大哥，到界橋了，請列隊．
    - `add_levels` person=公孫瓚 levels=4
    - `battle_setup` 
    - `if_flags` 
    - `battle_roster` 
    - `if_flags` 
    - `battle_roster` 
    - `load_map` map=12294
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、袁紹撤退．
      > 二、劉備奪取兵糧庫．
    - `dialogue`
      > 袁紹: 敵軍已經不堪一擊．文醜！去取公孫瓚的首級！
      > 文醜: 我乃文醜，公孫瓚，明年的今天就是你的忌日．
      > 公孫瓚: 怎麼搞的！援軍還沒有到啊．
      > 陳蔣: 主公，這交給我吧．文醜來受死吧！
      > 文醜: 噓，無名小卒，快滾回去吧．
    - `duel` first=文醜 second=陳蔣
    - `duel_begin` 
    - `dialogue`
      > 文醜: 殺……
    - `duel_action` person=文醜 action=6
    - `dialogue`
      > 陳蔣: 啊……
    - `duel_action` person=陳蔣 action=3
    - `dialogue`
      > 陳蔣: 太、太厲害了．
      > 文醜: 哈哈哈，怎麼樣！憑你這點兒本事想贏我！
    - `duel_end` 
    - `dialogue`
      > 文醜: 公孫瓚，哪裡走！納命來！
      > 公孫瓚: 看來我命到此休矣！
    - `join_battle` person=趙雲
    - `play_music` song=12
    - `dialogue`
      > 趙雲: 等一下，這次我來戰你．
      > 文醜: 你是何人？
    - `duel` first=趙雲 second=文醜
    - `dialogue`
      > 文醜: 不知死活的傢伙，和公孫瓚一起作我槍下之鬼吧．
    - `duel_begin` 
    - `dialogue`
      > 趙雲: 呸！！
    - `duel_action` person=趙雲 action=1
    - `duel_action` person=文醜 action=2
    - `dialogue`
      > 文醜: 哦！殺啊！媽的，好厲害，先撤吧．
    - `duel_action` person=文醜 action=4
    - `duel_end` 
    - `dialogue`
      > 公孫瓚: 哦，剛才差一點沒了命，真是太感謝你了，讓我說聲謝謝吧，請問大名．
      > 趙雲: 我叫趙雲．
      > 趙雲: 以前跟隨袁紹，我看透了他既不忠君也不愛惜百姓，就要離開他，返回故鄉．
      > 公孫瓚: 袁紹幹了件蠢事啊，怎麼樣，你能不能幫助我．
    - `dialogue`
      > 趙雲: 好！
      > 趙雲: 嗯？公孫瓚，那支軍隊是？
      > 公孫瓚: 噢，那是平原劉備的軍隊啊！諸位，劉備的援軍到了！
      > 張飛: 大哥，好像趕上了．
      > 劉備: 聽說公孫瓚正在打仗，我特地從平原趕來助戰．
      > 關羽: 大哥，敵軍強大，我們去襲擊敵人的糧倉吧．
      > 沮授: 主公，劉備軍來了．
      > 袁紹: 哎呀，是那個劉備軍嗎？
      > 田豐: 主公，怕什麼，不能放過這次機會．
      > 袁紹: ……對了，好，一起殺死他們祭旗！
    - `play_music` song=13
  - **r3** unit_contact(4) [張飛] 그룹 3*
    - `dialogue`
      > 文醜: 剛才因大意受挫，這次不會了，要讓你們看看我的厲害．
      > 張飛: 喂，還有沒有稍微有點骨氣的？唉，我跟你玩玩吧．
    - `duel` first=張飛 second=文醜
    - `duel_begin` 
    - `dialogue`
      > 張飛: 怎麼如此不中用啊．沒意思．
      > 文醜: 不，不應該這麼不爭氣．
      > 張飛: 你回去好啦，懶得和你交手．
      > 文醜: 你這個傢伙！不要侮辱人！
    - `duel_action` person=文醜 action=0
    - `duel_action` person=文醜 action=1
    - `dialogue`
      > 文醜: 哈哈，怎、怎麼樣……
      > 張飛: ……你惹惱了我，別走！
    - `duel_action` person=張飛 action=1
    - `duel_action` person=文醜 action=2
    - `dialogue`
      > 文醜: 噢噢！剛才敗了，這次也敗了．
    - `duel_action` person=文醜 action=4
    - `duel_end` 
    - `add_levels` person=張飛 levels=1
    - `caption`
      > 張飛等級上升了！
  - **r4** battle_won(7) 그룹 3 — 그룹 넘김
    - `leave_parallel` 
  - **r5** unit_in_area(11) [(any unit)] 그룹 3
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 田豐: 主公，敵人那點兒兵力還真頑強啊，好像接近了我們．
      > 袁紹: 哎，他們也不是膿包．好，全軍開始進攻！！
    - `set_flag` flag=213 clear=0
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 田豐: 主公，敵人就那點兒兵力還真頑強啊，好像接近了我們．
      > 袁紹: 哎，他們也不是膿包．好，全軍開始進攻！！
    - `set_flag` flag=213 clear=0
    - `play_music` song=13
  - **r6** unit_in_area(11) [劉備] 그룹 3
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 郭圖: 主公，劉備想要奪取糧倉向我們營地出發了．
      > 袁紹: 什麼！！劉備，你這招真狠啊！急速返回營地！
    - `set_flag` flag=148 clear=0
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 郭圖: 主公，劉備想要奪取糧倉向我們營地出發了．
      > 袁紹: 什麼！！劉備，你這招真狠啊！急速返回營地！
    - `set_flag` flag=148 clear=0
    - `play_music` song=13
  - **r7** unit_at_cell(6) [劉備] 그룹 3 — 그룹 넘김
    - `data` kind=4 value=50
    - `dialogue`
      > 劉備: 好！我們奪取了袁紹的糧倉．
      > 關羽: 噢，兄長．太棒了．
      > 張飛: 這樣袁紹軍就沒有糧食了．
      > 簡雍: 這仗我們贏定了．
    - `leave_parallel` 
  - **r8** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=火龍書  
    - `set_flag` flag=64 clear=0
  - **r9** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=長槍
    - `set_flag` flag=184 clear=0
  - **r10** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=連弩
    - `set_flag` flag=185 clear=0
  - **r11** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=麥
    - `set_flag` flag=186 clear=0
  - **r12** run(0) 그룹 4
    - `dialogue`
      > 袁紹: 唉，劉備這個混帳，你再晚來一步我就可以殺死公孫瓚了……媽的，我不會善罷干休！公孫瓚啊，敗軍之恨，總有一天要報的．全軍撤退！
    - `play_music` song=7
    - `narration`
      > 界橋之戰，公孫瓚取得了勝利．
    - `data` kind=2 value=200
    - `caption`
      > 繳獲黃金２００！
    - `battle_end` next_map=4096
- **블록 16**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 지도
  - **r0** run(0) 그룹 0
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 袁紹: 公孫瓚，我不會認輸的！
    - `dialogue`
      > 公孫瓚: 劉備，你來的正好，這次多虧你來幫我們．
      > 劉備: 哪裡，因為及時趕到了，才能轉敗為勝．
      > 公孫瓚: 哦，對了．劉備，給你介紹一下，這位是趙雲，在我危難之際救了我．趙雲，這位是劉備．
      > 劉備: 我叫劉備字玄德．
      > 趙雲: 你就是劉備啊，大名如雷貫耳．我叫趙雲字子龍．
      > 公孫瓚: 諸位，總之我們打了勝仗．為勝利，乾杯．

### 장면 1

제목: 第一章支援北海‧徐州

- **블록 0**: 이야기; 레코드 11, 그룹 6; 대화 7(잡담 5); 맵: 마을 17, 마을 2, 마을 3, 지도
  - 트리거: location
  - 목표 문구: 與糜竺談話 / 研究下一步問題． / 為求得公孫瓚支援去北平．
  - r0 삽화 5
  - r0 삽화 29
  - **r0** run(0) 그룹 0
    - `play_music` song=0
    - `chapter_title` key=第一章支援北海‧徐州
    - `title`
      > 第一章支援北海‧徐州
    - `show_picture` picture=5 variant=0
    - `narration`
      > 　公孫瓚和袁紹的界橋之戰，由於劉備軍和趙雲的英勇善戰，公孫瓚高奏凱歌．
      > 　可是由於連續幾個月的作戰，士兵非常疲憊．得知此事的董卓，想賣個人情，就以皇帝的名義勸兩人和好．正中兩人下懷，界橋之戰就這樣結束了．
    - `show_picture` picture=29 variant=0
    - `narration`
      > 　之後，在帝都發生了一件大事．呂布刺死了董卓．
      > 　呂布中了王允和貂蟬兩人的連環計，刺死了董卓．隨後呂布在董卓舊部面前吃了敗仗，逃離了帝都．
    - `load_map` map=8209
    - `play_music` song=11
    - `caption`
      > 陳留議事廳
    - `dialogue`
      > 文官: 主公，大事不好！
      > 曹操: 吵鬧什麼？還會有比董卓死了更大的事嗎？急什麼．
      > 文官: 可是……
      > 曹操: 平心靜氣講．
      > 文官: 是，主公的父親曹嵩被陶謙部下殺害了．
      > 曹操: 什麼！？是真的嗎？
    - `dialogue`
      > 曹操: 陶謙為什麼要殺我父親！為什麼！
      > 文官: 根據報告說，令尊在來陳留途中，陶謙招待了他，還派護衛護送他．可是令尊慘遭那護衛殺害．
      > 曹操: 唉……陶謙，我絕不饒你．于禁！
      > 于禁: 是．
    - `dialogue`
      > 曹操: 你馬上率一軍直奔徐州，殺他們以祭父親在天之靈．我將隨後率兵到小沛．你打先鋒．
      > 于禁: 是，倍感榮幸．我馬上奔徐州，取陶謙首級來見你．
  - **r1** run(0) 그룹 1
    - `load_map` map=4096
    - `dialogue`
      > 于禁: 我馬上殺往徐州，為令尊大人報仇．
    - `dialogue`
      > 曹操: 陶謙老朽，我絕不饒你！進軍小沛！
  - **r2** run(0) 그룹 2
    - `load_map` map=8194
    - `set_previous_map` map=0 x=26 y=6
    - `play_music` song=5
    - `caption`
      > 平原議事廳
    - `dialogue`
      > 關羽: 大哥，徐州陶謙的家臣糜竺前來求見．說有話要對大哥講．
    - `set_objective`
      > 與糜竺談話
  - **r3** talk(3) [張飛] 그룹 3*
    - `dialogue`
      > 張飛: 他好像有什麼重要事要講．大哥快聽他講話吧．
  - **r4** talk(3) [關羽] 그룹 3
    - `dialogue`
      > 關羽: 兄長先去和糜竺談話吧．
  - **r5** talk(3) [糜竺] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 糜竺: 劉備，初次見面，請多關照．我是陶謙的家臣，叫糜竺．
      > 劉備: 我和陶謙在討伐董卓的聯軍時也見過面，你這次來有什麼事情？
      > 糜竺: 其實此次前來是有求於劉備．
      > 劉備: 是什麼事？
    - `dialogue`
      > 糜竺: 就在前兩天，曹操的父親經過徐州．我主公在徐州設宴招待了曹操父親，還派人護送．
      > 張飛: 這不是很好嗎？
      > 糜竺: 可是，那個護衛起了反心，殺死了曹操父親，掠去了財寶．曹操知道後驚怒異常，率領大軍攻打徐州．
      > 關羽: 怎麼搞的嘛？原想歡迎，反倒成仇．
    - `dialogue`
      > 糜竺: 所說的有求於劉備就是這件事．可否發兵支援徐州？請您救我們，不，是救徐州．這樣下去的話，我們姑且不說連老百姓都捲進了戰爭．
      > 劉備: ……．明白了．你看我行的話就幫助你們．
      > 糜竺: 哦，謝謝，此恩終生難忘．
      > 劉備: 不客氣．你也長途奔波勞累了，去客房休息吧．
      > 糜竺: 謝謝，那失陪了．
    - `set_objective`
      > 研究下一步問題．
    - `leave_parallel` 
  - **r6** talk(3) [張飛] 그룹 4*
    - `dialogue`
      > 張飛: 大哥，要發兵支援的話，打曹操，我們兵力可不夠啊，怎麼辦？
  - **r7** talk(3) [關羽] 그룹 4 — 그룹 넘김
    - `dialogue`
      > 關羽: 若發兵支援，抗拒曹操，我們現在沒有那麼多兵力啊．
      > 劉備: 嗯，向公孫瓚借些兵吧．
      > 關羽: 這是個好主意．那麼我們快去公孫瓚所在地的北平城吧．
    - `set_objective`
      > 為求得公孫瓚支援去北平．
    - `leave_parallel` 
  - **r8** talk(3) [關羽] 그룹 5*
    - `dialogue`
      > 關羽: 快去北平吧，北平位於平原的北面．
  - **r9** talk(3) [張飛] 그룹 5
    - `dialogue`
      > 張飛: 大哥，快去北平吧．
  - **r10** location(2) 그룹 5 — 그룹 넘김
    - `load_map` map=8195
    - `caption`
      > 北平議事廳
    - `dialogue`
      > 公孫瓚: 哦，劉備，什麼風把你吹來了？
    - `leave_parallel` 
- **블록 1**: 이야기; 레코드 5, 그룹 2; 대화 4(잡담 3); 맵: 마을 2
  - 트리거: location
  - 목표 문구: 返回平原作出兵準備
  - r2 소속: 趙雲 → 유비군(합류)
  - **r0** talk(3) [關羽] 그룹 0*
    - `dialogue`
      > 關羽: 大哥，先跟公孫瓚打個招呼吧．
  - **r1** talk(3) [張飛] 그룹 0
    - `dialogue`
      > 張飛: 我們沒事，但跟公孫瓚還是說一下好．
  - **r2** talk(3) [公孫瓚] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 公孫瓚: 劉備，怎麼了．
      > 劉備: 徐州陶謙派來使者，請求我支援．我想發兵前去支援，但是我這一點兵力恐怕不行．您看能不能借我一些兵？
      > 公孫瓚: 劉備在界橋對我有相助之恩，我很高興借兵給你．
      > 劉備: 謝謝．
      > 公孫瓚: 那就帶他去吧．
    - `dialogue`
      > 趙雲: 您叫我嗎？
      > 公孫瓚: 趙雲，你和劉備去支援徐州．
      > 趙雲: 去徐州？
      > 公孫瓚: 嗯，他們請求劉備支援．趙雲，我想派你同去．
      > 趙雲: 能和劉備一起作戰，我非常高興，我願意去．
    - `caption`
      > 趙雲加入劉備軍！
    - `set_allegiance` person=趙雲 army=0
    - `dialogue`
      > 公孫瓚: 那麼，趙雲讓你辛苦一趟，劉備，祝你成功．
      > 劉備: 謝謝．
    - `set_objective`
      > 返回平原作出兵準備
    - `leave_parallel` 
  - **r3** talk(3) [公孫瓚] 그룹 1*
    - `dialogue`
      > 公孫瓚: 祝你勝利．
  - **r4** location(2) 그룹 1 — 그룹 넘김
    - `load_map` map=8194
    - `caption`
      > 平原議事廳
    - `dialogue`
      > 糜竺: 劉備，我一直在等你．請你準備出兵．
    - `leave_parallel` 
- **블록 2**: 전투 준비; 레코드 5, 그룹 2; 대화 4(잡담 3); 맵: 지도
  - 전투 설정: 턴 제한 30, 아군 출진 9명, 격파 대상 #216, 퇴각하면 패배 #0
  - 질문 r3 (糜竺): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - **r0** talk(3) [關羽] 그룹 0*
    - `dialogue`
      > 關羽: 兄長，糜竺在等我們．
  - **r1** talk(3) [張飛] 그룹 0
    - `dialogue`
      > 張飛: 大哥，糜竺等得著急了．
  - **r2** talk(3) [趙雲] 그룹 0
    - `dialogue`
      > 趙雲: 主公，聽你吩咐．
  - **r3** talk(3) [糜竺] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 糜竺: 準備好了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r4** run(0) 그룹 1
    - `play_music` song=12
    - `dialogue`
      > 糜竺: 那麼快往徐州吧．
    - `battle_setup` 
    - `redraw` 
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 糜竺: 徐州在這個平原的南面，快速行軍吧．
    - `dialogue`
      > 張飛: 嗯？好像情況不對啊，怎麼回事？
    - `dialogue`
      > 管亥: 哈哈哈，進攻進攻！再攻一會兒城池就歸我了．
      > 太史慈: 再這樣的話，北海就要被攻陷了，孔融，請你出城逃走吧．
      > 孔融: 不，這不行！我雖不願意看到城池陷落，但我更不願意棄城逃走．
      > 太史慈: ……
      > 管亥: 衝啊！衝啊！金銀財寶就在那裡！
    - `dialogue`
      > 關羽: 看來好像是草寇作亂．
      > 糜竺: 這裡是北海，是孔融治理的地方．
      > 劉備: 是孔融啊，孔融也參加了反董卓的聯軍啊．
      > 簡雍: 主公，怎麼辦？就這樣置之不理嗎？
      > 劉備: 不，不能這樣置之不理．糜竺，對不起，要繞些路了．
      > 糜竺: 沒辦法，沒有你劉備這樣好的人．
      > 趙雲: 不愧是劉備，他才是我佩服的人．
- **블록 3**: 전투; 레코드 9, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 7, 지도
  - 적군 명단: 13기
  - 트리거: battle_won, unit_at_cell, unit_contact, unit_in_area
  - 목표 문구: 一、管亥的潰敗． / 在北海城見孔融．
  - r0 소속: 太史慈 → 군 13(이탈)
  - r0 소속: 孟肅 → 군 13(이탈)
  - r3 일기토
  - r3 레벨 +1: 趙雲
  - r6 아이템: 特級酒
  - r7 아이템: 平氣書  
  - r8 (run) 전투 끝
  - 플래그 켬: {68, 163, 187}
  - 플래그 검사: {68, 163, 187}
  - **r0** run(0) 그룹 0
    - `set_allegiance` person=太史慈 army=13
    - `set_allegiance` person=孟肅 army=13
    - `battle_roster` 
    - `load_map` map=12295
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、管亥的潰敗．
    - `dialogue`
      > 管亥: 哈哈哈．這個城就等於到手了．混蛋們，把城裡的金銀財寶統統給我拿來．
      > 孔融: 難道我就這樣完了．
      > 太史慈: 只因我們軍力不足．嗯，我們有救了．
      > 關羽: 大哥，再不快點，這個城就落到山賊手裡啦．
      > 張飛: 山賊竟敢襲擊城鎮，膽子好大啊，碰上我們算他運氣不好．
      > 劉備: 好，刻不容緩，消滅山賊．
      > 管亥: 嗯？你們是幹什麼的？想和我們作對嗎？哈哈哈，有意思．笨蛋們，調過頭來打，給他們點苦頭．
    - `play_music` song=14
  - **r3** unit_contact(4) [趙雲] 그룹 3* — 그룹 넘김
    - `dialogue`
      > 趙雲: 那是山賊的大將，在劉備面前也顯示一下我的本領．
      > 管亥: 哎呀，哈哈哈，真是蠢貨，好像他還覺得能打贏我，沒辦法，我就陪你玩玩吧．
    - `duel` first=趙雲 second=管亥
    - `duel_action` person=管亥 action=2
    - `dialogue`
      > 管亥: 我是管亥，讓你去陰曹地府……
      > 趙雲: 有破綻．
    - `duel_action` person=趙雲 action=7
    - `dialogue`
      > 管亥: 啊！
    - `duel_action` person=管亥 action=3
    - `dialogue`
      > 趙雲: 豈能寬容你這坑害百姓的草寇．
    - `duel_end` 
    - `add_levels` person=趙雲 levels=1
    - `caption`
      > 趙雲等級上升了！
    - `play_music` song=7
    - `narration`
      > 趙雲殺了管亥，劉備軍打敗了草寇．
    - `leave_parallel` 
  - **r4** battle_won(7) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 管亥: 倒霉！你們再晚一點來，這個城就成我的了．
    - `play_music` song=7
    - `narration`
      > 劉備軍打敗了草寇．
    - `leave_parallel` 
  - **r5** unit_in_area(11) [(any unit)] 그룹 3
    - `if_flags` 
    - `dialogue`
      > 太史慈: 主公，不知道來的是什麼人，但我們現在應該殺出去配合他們．
      > 孔融: 唉，好．打開城門！我們也殺出去．
      > 孟肅: 是．
    - `set_map_chip` x=2 y=2 chip=0
    - `caption`
      > 城門打開，孔融軍殺了出去！
    - `set_flag` flag=163 clear=0
  - **r6** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=特級酒
    - `set_flag` flag=68 clear=0
  - **r7** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=平氣書  
    - `set_flag` flag=187 clear=0
  - **r8** run(0) 그룹 4
    - `data` kind=2 value=300
    - `caption`
      > 繳獲黃金３００！
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 太史慈: 雖素不相識，但深感大德，能否請教尊姓大名．
      > 劉備: 我叫劉備．
      > 太史慈: 噢，您就是平原的劉備啊．救我於危難之際，非常感謝，請您一定要進城，也請您見一下孔融．
    - `set_objective`
      > 在北海城見孔融．
- **블록 4**: 전투 준비; 레코드 5, 그룹 3; 대화 3(잡담 2); 맵: 마을 2, 지도
  - 전투 설정: 턴 제한 30, 아군 출진 11명, 퇴각하면 패배 #0
  - 목표 문구: 去徐州支援陶謙．
  - 질문 r3 (關羽): 예 답이면 3 명령 실행, 출진 확인 [leave_parallel]
  - r4 레벨 +4: 太史慈
  - r4 레벨 +6: 陶謙
  - **r0** run(0) 그룹 0
    - `load_map` map=8194
    - `set_previous_map` map=10 x=26 y=6
    - `play_music` song=5
    - `caption`
      > 北海議事廳
    - `dialogue`
      > 太史慈: 主公，我把劉備請出來了．
      > 孔融: 噢，劉備．你救了北海，太感謝了．
    - `dialogue`
      > 孔融: 孔融感激不盡．
      > 劉備: 不用多禮．我們這是因糜竺請求，正在趕往徐州．
      > 孔融: 去徐州？去支援嗎？我也聽說曹操在攻打徐州．
      > 劉備: 是的．我們路過這裡時發現太史慈正受到攻擊，所以助他一臂之力．
      > 孔融: 是嗎？那樣的話，我撥給你一些糧草，也表示一下對這次幫助的感謝．
    - `data` kind=2 value=500
    - `caption`
      > 得到黃金５００！
    - `dialogue`
      > 關羽: 大哥，再不趕路就要誤事啦．
      > 劉備: 是啊．那麼，孔融，我們還急著趕路，告辭了．
      > 孔融: 祝你馬到成功．
      > 太史慈: 非常感謝．
      > 關羽: 準備出征．
    - `set_objective`
      > 去徐州支援陶謙．
  - **r1** talk(3) [孔融] 그룹 1*
    - `dialogue`
      > 孔融: 努力啊．
  - **r2** talk(3) [太史慈] 그룹 1
    - `dialogue`
      > 太史慈: 謝謝你，有劉備支援，徐州就萬無一失了．
  - **r3** talk(3) [關羽] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 關羽: 準備好了嗎？
    - `if_answer` answer=0 skip=3
    - `op_3d` value=0
    - `leave_parallel` 
  - **r4** run(0) 그룹 2
    - `play_music` song=12
    - `add_levels` person=太史慈 levels=4
    - `add_levels` person=陶謙 levels=6
    - `battle_setup` 
    - `dialogue`
      > 糜竺: 快去徐州吧．
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 糜竺: 劉備，徐州在北海的南面，快去吧．
- **블록 5**: 전투; 레코드 10, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 8
  - 적군 명단: 17기
  - 트리거: battle_won, turn, unit_contact, unit_in_area
  - 목표 문구: 一、全數殲滅敵人． 二、劉備進入徐州城．
  - r4 (unit_in_area) 전투 끝
  - r4 (unit_in_area) → 블록 6
  - r5 (battle_won) 전투 끝
  - r5 (battle_won) → 블록 6
  - r6 일기토
  - r6 레벨 +1: 關羽
  - r8 (unit_in_area) 전투 끝
  - r9 (battle_won) 전투 끝
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12296
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、全數殲滅敵人．
      > 二、劉備進入徐州城．
    - `dialogue`
      > 于禁: 說什麼？劉備攻過來了？有多少兵？……不好．一定設法等夏侯淵的到來．
      > 夏侯淵: 大家快走，去支援于禁！
      > 趙雲: 敵人的援軍已來到附近．我們不要戀戰，快進徐州城吧．
    - `play_music` song=9
  - **r3** turn(9) 그룹 3*
    - `play_music` song=12
    - `join_battle` person=太史慈
    - `dialogue`
      > 太史慈: 劉備，遵孔融之命，太史慈前來助你．
    - `caption`
      > 太史慈前來支援！
    - `play_music` song=9
  - **r4** unit_in_area(11) [劉備] 그룹 3
    - `data` kind=4 value=50
    - `play_music` song=7
    - `dialogue`
      > 劉備: 好，放他進徐州城．大家不要打硬仗，退進城去．
    - `narration`
      > 劉備軍後退了．
    - `battle_end` next_map=4096
    - `goto_block` block=6
  - **r5** battle_won(7) 그룹 3
    - `dialogue`
      > 張飛: 太棒了，大哥．
      > 關羽: 趁敵人援軍沒到之前，我們快進城吧．
    - `play_music` song=7
    - `narration`
      > 　劉備軍打敗了曹操軍，進了徐州城．
    - `data` kind=2 value=300
    - `caption`
      > 得到黃金３００！
    - `battle_end` next_map=4096
    - `goto_block` block=6
  - **r6** unit_contact(4) [關羽] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 關羽: 我就是關羽關雲長，有武將的話就出來．
      > 于禁: 無名小卒休得猖狂，我來了．
    - `duel` first=關羽 second=于禁
    - `duel_begin` 
    - `dialogue`
      > 關羽: 不愧是曹操的手下大將．只是憑你的武藝勝不了我．
      > 于禁: 情況不妙！關羽，我記住你了．
    - `duel_action` person=于禁 action=4
    - `duel_end` 
    - `add_levels` person=關羽 levels=1
    - `caption`
      > 關羽的等級上升了！
    - `leave_parallel` 
  - **r7** turn(9) 그룹 4*
    - `play_music` song=12
    - `join_battle` person=太史慈
    - `dialogue`
      > 太史慈: 劉備，遵孔融之命，太史慈前來助你．
    - `caption`
      > 太史慈前來支援！
    - `play_music` song=9
  - **r8** unit_in_area(11) [劉備] 그룹 4 — 그룹 넘김
    - `data` kind=4 value=50
    - `play_music` song=7
    - `dialogue`
      > 劉備: 好，放他進徐州城．大家不要打硬仗，退進城去．
    - `narration`
      > 　劉備軍退進了徐州城內．
    - `battle_end` next_map=4096
    - `leave_parallel` 
  - **r9** battle_won(7) 그룹 4 — 그룹 넘김
    - `dialogue`
      > 張飛: 太棒了，大哥．
      > 關羽: 趁敵人援軍沒到之前，我們快進城吧．
    - `play_music` song=7
    - `narration`
      > 　劉備軍打敗了曹操軍，進了徐州城．
    - `data` kind=2 value=300
    - `caption`
      > 得到黃金３００！
    - `battle_end` next_map=4096
    - `leave_parallel` 
- **블록 6**: 전투 준비; 레코드 14, 그룹 4; 대화 12(잡담 9); 맵: 마을 16, 마을 4, 지도
  - 전투 설정: 턴 제한 30, 아군 출진 10명, 격파 대상 #8, 퇴각하면 패배 #0
  - 목표 문구: 與陶謙討論今後的事． / 決定是和曹操作戰還是派張飛求和？
  - 질문 r12 (關羽): 예 답이면 18 명령 실행, 출진 확인 [battle_setup, leave_parallel]
  - 질문 r13 (張飛): 예 답이면 6 명령 실행, 출진 확인 [goto_block]
  - r13 (talk) → 블록 8
  - 플래그 켬: {219}
  - **r0** run(0) 그룹 0
    - `load_map` map=8208
    - `play_music` song=11
    - `caption`
      > 曹操軍營帳
    - `dialogue`
      > 于禁: 對不起．雖然讓我當先鋒，可是沒打好……
      > 曹操: 我不想聽你道歉．為什麼沒捉到陶謙？我軍不應該敗給陶謙．
      > 于禁: 由於平原的劉備來支援徐州，所以沒捉到陶謙．
      > 曹操: 什麼！那個劉備嗎？唉，可是劉備為什麼支援陶謙呢？
      > 于禁: 這個我一點也不知道．
      > 曹操: 嗯，既然幫助陶謙，那麼劉備也是敵人！我絕不寬恕！這次我親自出征．
  - **r1** run(0) 그룹 1
    - `load_map` map=8196
    - `set_previous_map` map=11 x=28 y=5
    - `play_music` song=5
    - `caption`
      > 徐州議事廳
    - `dialogue`
      > 糜竺: 我回來了．
      > 陶謙: 哦，糜竺，這次你勸說劉備勸得好．劉備，久違了．
      > 劉備: 我們能來得及支援，太好了．
      > 陶謙: 非常感謝．
    - `set_objective`
      > 與陶謙討論今後的事．
  - **r2** talk(3) [關羽] 그룹 2*
    - `dialogue`
      > 關羽: 我們能來得及支援，太好了．
  - **r3** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 呀，大哥，時間好緊啊，再晚一點就危險了．
  - **r4** talk(3) [糜竺] 그룹 2
    - `dialogue`
      > 糜竺: 劉備，太謝謝你了．
  - **r5** talk(3) [孫乾] 그룹 2
    - `dialogue`
      > 孫乾: 如果劉備不來，我們都要遭殺身之禍．
  - **r6** talk(3) [陳登] 그룹 2
    - `dialogue`
      > 陳登: 可是，雖然初戰告捷，但敵人很強大，他們不會就此罷休的．
  - **r7** talk(3) [陶謙] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 陶謙: 曹操軍肯定還會打來，怎麼辦？
      > 劉備: 曹操是個頭腦清醒、明白事理的人，我們請求他停戰吧．
      > 孫乾: 可是事情能否那麼順利呢？
      > 張飛: 試一試看，不行再說．這交給我好啦．
      > 關羽: 我認為應出兵作戰，只有作戰才能稱為武將．
    - `dialogue`
      > 張飛: 哎，關羽，少見呀．竟比我還想打仗．
      > 關羽: 只有和強敵交鋒才能稱為武將．敵人是曹操軍的話，豈不正合我意．兄長，是派張飛去求和，還是作戰，你想選擇哪個？請兄長決定！你想好的話，跟張飛或我說一下．
    - `set_objective`
      > 決定是和曹操作戰還是派張飛求和？
    - `leave_parallel` 
  - **r8** talk(3) [糜竺] 그룹 3*
    - `dialogue`
      > 糜竺: 曹操軍非常強大，以正面與他交鋒是下策．還是派張飛去求和吧．
  - **r9** talk(3) [孫乾] 그룹 3
    - `dialogue`
      > 孫乾: 我選擇交戰．盡管對方強大，但我方在士氣上沒有輸．
  - **r10** talk(3) [陳登] 그룹 3
    - `dialogue`
      > 陳登: 敵軍強大，他們是不會善罷甘休的．還是派張飛去求和吧．
  - **r11** talk(3) [陶謙] 그룹 3
    - `dialogue`
      > 陶謙: 莫非要我投降才是上策？
  - **r12** talk(3) [關羽] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 關羽: 哦，兄長，決定出征了嗎？
    - `if_answer` answer=0 skip=18
    - `op_3d` value=0
    - `set_flag` flag=219 clear=0
    - `play_music` song=12
    - `dialogue`
      > 關羽: 快做出征準備吧．
    - `battle_setup` 
    - `dialogue`
      > 關羽: 快出征吧．
      > 陶謙: 既然你們決定了，我們也出征．聽說敵人現在在小沛．
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 陶謙: 從這裡向西南，有個地方叫小沛．曹操軍就在那裡扎營．
      > 關羽: 曹操軍有什麼了不起？兄長，快進軍小沛吧．
    - `leave_parallel` 
  - **r13** talk(3) [張飛] 그룹 3
    - `dialogue`
      > 張飛: 大哥，派我去向曹操軍求和嗎？
    - `if_answer` answer=0 skip=6
    - `op_3d` value=0
    - `dialogue`
      > 張飛: 這樣決定了的話就簡單了．好，我馬上就去．
    - `goto_block` block=8
- **블록 7**: 전투; 레코드 9, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 9, 지도
  - 적군 명단: 22기
  - 트리거: battle_won, turn, unit_contact
  - 목표 문구: 一、曹操退兵
  - r0 레벨 +1: 陶謙
  - r0 레벨 +1: 孫乾
  - r0 레벨 +1: 糜芳
  - r3 일기토
  - r3 레벨 +1: 張飛
  - r6 (turn) 전투 끝
  - r7 (battle_won) 전투 끝
  - r8 (run) → 블록 10
  - **r0** run(0) 그룹 0
    - `add_levels` person=陶謙 levels=1
    - `add_levels` person=孫乾 levels=1
    - `add_levels` person=糜芳 levels=1
    - `battle_roster` 
    - `load_map` map=12297
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、曹操退兵
    - `dialogue`
      > 曹操: 劉備小兒，與我仇敵為友，我絕不寬恕你．殺盡劉備軍．
      > 關羽: 曹操軍確實是大軍啊．但是以我們的士氣也不會輸給他們．大哥，現在拼死應戰吧．
    - `play_music` song=10
  - **r3** unit_contact(4) [張飛] 그룹 3*
    - `dialogue`
      > 張飛: 出來一戰吧！廢話少說！有膽子的出來．
      > 夏侯淵: 相當威風啊，我去戰他吧．
      > 張飛: 走！
    - `duel` first=張飛 second=夏侯淵
    - `duel_begin` 
    - `dialogue`
      > 張飛: 看槍！
      > 夏侯淵: 你也吃我一刀．
      > 張飛: 再來一刺，接著．
    - `duel_action` person=張飛 action=0
    - `duel_action` person=張飛 action=1
    - `dialogue`
      > 夏侯淵: 噯，好厲害．勝不了他．
    - `duel_action` person=夏侯淵 action=4
    - `dialogue`
      > 張飛: 要逃嗎，太狡猾了．乾脆認輸吧．
    - `duel_end` 
    - `add_levels` person=張飛 levels=1
    - `caption`
      > 張飛的等級上升了．
  - **r4** turn(9) 그룹 3
    - `play_music` song=11
    - `dialogue`
      > 曹操: 哼，這種戰鬥力還能打仗嗎？再狠狠地給我殺．
    - `play_music` song=10
  - **r5** turn(9) 그룹 3
    - `play_music` song=11
    - `dialogue`
      > 曹操: 不陪你們玩了，眾將士，全面出擊！
      > 劉備: 噯，不愧是曹操軍……
    - `play_music` song=10
  - **r6** turn(9) 그룹 3 — 그룹 넘김
    - `play_music` song=11
    - `dialogue`
      > 曹操: 什麼！陳留遭呂布偷襲！壞了，忘了呂布的事．噯，沒辦法．全軍撤退！陶謙、劉備暫且留著你們的命！
    - `play_music` song=7
    - `narration`
      > 　曹操軍撤退了．
    - `battle_end` next_map=4096
    - `leave_parallel` 
  - **r7** battle_won(7) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 曹操: 混蛋！再組織進攻！什麼！陳留遭呂布偷襲！壞了！看來使陳留防守空虛是下策．噯……沒辦法．全軍撤退！陶謙、劉備暫且留著你們的命！
    - `play_music` song=7
    - `narration`
      > 　曹操軍撤退了．
    - `data` kind=2 value=300
    - `caption`
      > 得到黃金３００．
    - `battle_end` next_map=4096
    - `leave_parallel` 
  - **r8** run(0) 그룹 4
    - `load_map` map=4096
    - `play_music` song=11
    - `dialogue`
      > 曹操: 全軍馬上折回，保住陳留！快！
    - `play_music` song=3
    - `dialogue`
      > 張飛: 噯？曹操怎麼突然逃跑了？
      > 劉備: 不知道．不過，徐州得救可是真的．先回徐州吧．
    - `goto_block` block=10
- **블록 8**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 마을 16
  - **r0** run(0) 그룹 0
    - `load_map` map=8208
    - `play_music` song=11
    - `caption`
      > 曹操軍營帳
    - `dialogue`
      > 武官: 主公，不得了啦．呂布進攻陳留了．
      > 曹操: 什麼？怎麼會這樣．壞了，太大意了．呂布這個畜生，乘我不在來偷襲．
    - `dialogue`
      > 文官: 一個叫張飛的人前來請求停戰，怎麼辦？
      > 曹操: 張飛？劉備的那個盟弟呀．劉備請求停戰？噯，真是天助我也．告訴張飛，我接受停戰．好，快速返回陳留，把呂布從陳留趕出去．
- **블록 9**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 지도
  - 플래그 켬: {97}
  - **r0** run(0) 그룹 0
    - `load_map` map=4096
    - `dialogue`
      > 曹操: 不能讓呂布把陳留奪去．快速返回！
    - `play_music` song=3
    - `dialogue`
      > 張飛: 不過，曹操為什麼撤退了？要是我的話就絕對進攻啦．
      > 劉備: 不知道，可是徐州得救是實實在在的．還是回城吧．
    - `set_flag` flag=97 clear=0
- **블록 10**: 이야기; 레코드 13, 그룹 3; 대화 12(잡담 10); 맵: 마을 4, 지도
  - 목표 문구: 與陶謙等談話．
  - r6 아이템: 雌雄雙劍    
  - r12 소속: 孫乾 → 유비군(합류)
  - 플래그 검사: {97}
  - **r0** run(0) 그룹 0
    - `load_map` map=8196
    - `set_previous_map` map=11 x=28 y=5
    - `play_music` song=5
    - `caption`
      > 徐州議事廳
    - `dialogue`
      > 陶謙: 劉備，這次你實在幫了大忙．
    - `if_flags` 
    - `dialogue`
      > 劉備: 不，我們什麼忙也沒幫，只是曹操折回去了．
      > 陶謙: 不不，來支援我們的只有你，我現在心情非常高興．
    - `set_objective`
      > 與陶謙等談話．
  - **r1** talk(3) [糜竺] 그룹 1*
    - `dialogue`
      > 糜竺: 謝謝，這樣徐州得救了．
  - **r2** talk(3) [陳登] 그룹 1
    - `dialogue`
      > 陳登: 劉備，謝謝．
  - **r3** talk(3) [孫乾] 그룹 1
    - `dialogue`
      > 孫乾: 能有今天多虧了劉備．
  - **r4** talk(3) [關羽] 그룹 1
    - `dialogue`
      > 關羽: 徐州得救太好了．
  - **r5** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 還是幫助別人心裡舒服．
  - **r6** talk(3) [陶謙] 그룹 1 — 그룹 넘김
    - `if_flags` 
    - `dialogue`
      > 陶謙: 劉備，這是我的一點心意，請你收下．
    - `dialogue`
      > 劉備: 這是？
      > 陶謙: 這是我們徐州自古傳下來的兵器，叫雌雄雙劍．
      > 劉備: 您是說把這樣貴重的東西給我？
      > 陶謙: 我們拿著他也沒有意義，因為不能熟練使用，我希望把劍送給真正有用的人使用，請您一定收下．
    - `add_item` item=雌雄雙劍    
    - `dialogue`
      > 陶謙: 劉備，其實我有事相託．
      > 劉備: 只要我能辦到的就一定全力以赴，請您吩咐．
      > 陶謙: 謝謝，我想把小沛託給你治理．
      > 劉備: 什麼？我這樣的人實在擔不起如此大任．
      > 陶謙: 不，這是要臣們商量的結果，希望你能幫助徐州的百姓，請接受吧．
      > 劉備: 我明白，那就恭敬不如從命了．
      > 陶謙: 您接受了，好，你帶孫乾去，孫乾很有才幹，你可以用他．
    - `leave_parallel` 
  - **r7** talk(3) [糜竺] 그룹 2*
    - `dialogue`
      > 糜竺: 小沛就拜託你們了．
  - **r8** talk(3) [陳登] 그룹 2
    - `dialogue`
      > 陳登: 劉備，謝謝．
  - **r9** talk(3) [陶謙] 그룹 2
    - `dialogue`
      > 陶謙: 帶孫乾去小沛好啦．
  - **r10** talk(3) [關羽] 그룹 2
    - `dialogue`
      > 關羽: 大哥，那就去小沛吧．
  - **r11** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 大哥，那就去小沛吧．
  - **r12** talk(3) [孫乾] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 孫乾: 劉備，不，主公，今後請多關照．
    - `caption`
      > 孫乾成為劉備部下！
    - `set_allegiance` person=孫乾 army=0
    - `dialogue`
      > 孫乾: 馬上去小沛吧，小沛是徐州西南的一個小鎮．
    - `load_map` map=4096
    - `dialogue`
      > 孫乾: 我帶你們去小沛．
    - `leave_parallel` 
- **블록 11**: 이야기; 레코드 5, 그룹 2; 대화 4(잡담 3); 맵: 마을 2
  - 목표 문구: 與趙雲等探討今後之事．
  - r4 소속: 趙雲 → 무소속(이탈)
  - **r0** run(0) 그룹 0
    - `load_map` map=8194
    - `set_previous_map` map=12 x=26 y=6
    - `caption`
      > 小沛議事廳
    - `set_objective`
      > 與趙雲等探討今後之事．
  - **r1** talk(3) [張飛] 그룹 1*
    - `dialogue`
      > 張飛: 大哥，城主說我們接受此城太好了，這樣我們也有城了．
  - **r2** talk(3) [關羽] 그룹 1
    - `dialogue`
      > 關羽: 兄長，我們都很高興，終於有了一個自己的城．
  - **r3** talk(3) [孫乾] 그룹 1
    - `dialogue`
      > 孫乾: 主公，今後請多關照．
  - **r4** talk(3) [趙雲] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 趙雲: 劉備，徐州之圍好像已解，我想回公孫瓚那裡．
      > 劉備: 是嗎？趙雲，這次你幫了大忙，我相信我們還能在一起為朝廷出力．
    - `dialogue`
      > 關羽: 趙雲，希望再見到你．
      > 張飛: 你雖不像我這樣厲害，但也相當了不起，希望還能見到你．
      > 趙雲: 不勝感謝，我也還想和大家在一起建功立業，請多珍重．
      > 張飛: 今晚是趙雲的歡送會，喝！
    - `set_allegiance` person=趙雲 army=14
    - `leave_parallel` 

### 장면 2

제목: 第一章　餓虎呂布來訪

- **블록 0**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 마을 2
  - r0 삽화 6
  - **r0** run(0) 그룹 0
    - `play_music` song=0
    - `chapter_title` key=第一章　餓虎呂布來訪
    - `title`
      > 第一章　餓虎呂布來訪
    - `show_picture` picture=6 variant=0
    - `narration`
      > 　劉備在小沛落腳時，呂布和曹操正在陳留打仗，呂布想拿下陳留，作為自己的落腳之處．可是，最初的形勢雖然對呂布有利，但在曹操的計謀下，呂布又吃了敗仗，呂布軍又成了流浪軍．
    - `load_map` map=8194
- **블록 1**: 이야기; 레코드 10, 그룹 4; 대화 8(잡담 6); 맵: 지도
  - 목표 문구: 聽簡雍彙報． / 掃平山賊．
  - 질문 r8 (關羽): 예 답이면 6 명령 실행, 출진 확인 [leave_parallel]
  - **r0** run(0) 그룹 0
    - `set_previous_map` map=12 x=26 y=6
    - `play_music` song=5
    - `caption`
      > 小沛議事廳
    - `dialogue`
      > 關羽: 大哥，曹操打敗了呂布，呂布好像四處流浪．
      > 張飛: 他活該，這是對他以前在漢都花天酒地的報應．
      > 孫乾: 可是，呂布今後怎麼辦呢？他又沒有自己的領地．
      > 劉備: ……
    - `dialogue`
      > 簡雍: 主公，我視察完城內回來了．
    - `set_objective`
      > 聽簡雍彙報．
  - **r1** talk(3) [關羽] 그룹 1*
    - `dialogue`
      > 關羽: 大哥，請聽簡雍彙報．
  - **r2** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 大哥，請聽簡雍彙報．
  - **r3** talk(3) [孫乾] 그룹 1
    - `dialogue`
      > 孫乾: 大哥，請聽簡雍彙報．
  - **r4** talk(3) [簡雍] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 簡雍: 據城內百姓說，小沛這個地方經常有山賊出沒．
      > 孫乾: 是這樣沒錯，我們也幾次想掃平這群山賊．
      > 簡雍: 我們來此地時間尚短，要想得到民心，其中之一就是掃平附近的山賊．
      > 劉備: 正是，那麼草寇躲在哪裡？孫乾，你知道些什麼？
    - `dialogue`
      > 孫乾: 山賊躲在泰山﹑夏丘﹑彭城三個地方．
      > 劉備: 是泰山﹑夏丘﹑彭城，好，出兵去掃平山賊．
      > 關羽: 大哥，作出征準備吧．
    - `set_objective`
      > 掃平山賊．
    - `leave_parallel` 
  - **r5** talk(3) [張飛] 그룹 2*
    - `dialogue`
      > 張飛: 大哥，快出征吧，幾個毛賊要是遇到我，不費吹灰之力就可以收拾他們．
  - **r6** talk(3) [孫乾] 그룹 2
    - `dialogue`
      > 孫乾: 盡管是山賊草寇，也不可大意，敗給他們可難堪了．
  - **r7** talk(3) [簡雍] 그룹 2
    - `dialogue`
      > 簡雍: 不能讓山賊草寇如此猖獗，平賊刻不容緩．
  - **r8** talk(3) [關羽] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 關羽: 準備好了嗎？
    - `if_answer` answer=0 skip=6
    - `op_3d` value=0
    - `load_map` map=4096
    - `leave_parallel` 
  - **r9** run(0) 그룹 3
    - `play_music` song=3
    - `dialogue`
      > 關羽: 大哥，去哪裡？
- **블록 2**: 이야기; 레코드 6, 그룹 2; 대화 0(잡담 0)
  - 트리거: condition
  - 선택지 r0: 「回小沛城」 r1 → 다시 물음(같은 블록); 「去泰山」 r2 → 블록 3; 「去夏丘」 r3 → 블록 5; 「去彭城」 r4 → 블록 4
  - r1 (run) → 블록 2
  - 질문 r1: 아니오 답이면 2 명령 실행 [goto_block]
  - r1 (run) → 블록 2
  - r2 (run) → 블록 3
  - r3 (run) → 블록 5
  - r4 (run) → 블록 4
  - r5 (run) → 블록 6
  - 플래그 검사: {8, 9, 10}
  - **r0** condition(1) 그룹 0* — 그룹 넘김
    - `choice`
      > 回小沛城
      > 去泰山
      > 去夏丘
      > 去彭城
  - **r1** run(0) 그룹 0 — 그룹 넘김
    - `if_flags` 
    - `dialogue`
      > 關羽: 大哥，一個草寇都沒消滅，我們快掃平草寇吧．
    - `goto_block` block=2
    - `dialogue`
      > 關羽: 大哥，草寇沒消滅乾淨，行嗎？
    - `if_answer` answer=1 skip=2
    - `dialogue`
      > 關羽: 請再一次選定進軍目標．
    - `goto_block` block=2
    - `if_flags` 
    - `leave_parallel` 
    - `if_flags` 
    - `leave_parallel` 
    - `if_flags` 
    - `leave_parallel` 
  - **r2** run(0) 그룹 0
    - `if_flags` 
    - `dialogue`
      > 關羽: 明白了，去泰山．
    - `goto_block` block=3
    - `dialogue`
      > 關羽: 泰山草寇已被掃平了，我們去打別的地方吧．
  - **r3** run(0) 그룹 0
    - `if_flags` 
    - `dialogue`
      > 關羽: 明白了，去夏丘．
    - `goto_block` block=5
    - `dialogue`
      > 關羽: 夏丘草寇已被掃平了，我們去打別的地方吧．
  - **r4** run(0) 그룹 0
    - `if_flags` 
    - `dialogue`
      > 關羽: 明白了，去彭城．
    - `goto_block` block=4
    - `dialogue`
      > 關羽: 彭城草寇已被掃平了，我們去打別的地方吧．
  - **r5** run(0) 그룹 1
    - `goto_block` block=6
- **블록 3**: 전투; 레코드 9, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 10, 지도
  - 전투 설정: 턴 제한 40, 아군 출진 7명, 퇴각하면 패배 #0
  - 적군 명단: 12기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact
  - 목표 문구: 一、全數殲滅敵人． 二、敵軍投降． / 掃平山賊．
  - r4 레벨 +1: 劉備
  - r5 아이템: 落石書  
  - r6 아이템: 炸彈
  - r8 (run) 전투 끝
  - r8 (run) → 블록 6
  - r8 (run) → 블록 2
  - 플래그 켬: {8, 11, 12, 188}
  - 플래그 검사: {9, 10, 12, 188}
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 關羽: 請列隊．
    - `play_music` song=12
    - `battle_setup` 
    - `battle_roster` 
    - `load_map` map=12298
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、全數殲滅敵人．
      > 二、敵軍投降．
    - `dialogue`
      > 李明: 怎麼要和劉備打仗？這將釀成我的終身錯事，還是投降吧．
      > 張飛: 賊將們，快出來讓我消遣一下，最近我身體都有些不靈活了．
    - `play_music` song=19
  - **r3** turn(9) 그룹 3*
    - `dialogue`
      > 孫乾: 主公，據說此地賊兵是由一女將率領．
      > 張飛: 什麼？是女人？
      > 劉備: 你是說女賊首？真勇敢．
      > 張飛: 大哥你去勸降，設法交個朋友，嘿嘿！
      > 劉備: 你在想什麼？
      > 李明: 即使來人是鼎鼎大名的劉備，我也要擺出首領的架子，給我打．
  - **r4** unit_contact(4) [劉備] 그룹 3 — 그룹 넘김
    - `play_music` song=11
    - `dialogue`
      > 李明: 哦，不行，我還是不能向劉備動手，我想歸順你們，劉備，剛才我錯了．
    - `caption`
      > 李明加入劉備軍！
    - `set_country` person=李明 country=0
    - `set_flag` flag=11 clear=0
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備的等級上昇了．
    - `leave_parallel` 
  - **r5** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=落石書  
    - `set_flag` flag=12 clear=0
  - **r6** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=炸彈
    - `set_flag` flag=188 clear=0
  - **r7** battle_won(7) 그룹 3 — 그룹 넘김
    - `leave_parallel` 
  - **r8** run(0) 그룹 4
    - `play_music` song=7
    - `narration`
      > 　劉備軍掃平泰山草寇．
    - `data` kind=2 value=400
    - `caption`
      > 繳獲了黃金４００．
    - `battle_end` next_map=4096
    - `set_flag` flag=8 clear=0
    - `load_map` map=4096
    - `if_flags` 
    - `if_flags` 
    - `play_music` song=3
    - `if_flags` 
    - `dialogue`
      > 關羽: 大哥，現在賊兵全部掃平，我們回小沛吧．
    - `goto_block` block=6
    - `op_3d` value=1
    - `dialogue`
      > 關羽: 大哥，去哪裡？
    - `set_objective`
      > 掃平山賊．
    - `goto_block` block=2
- **블록 4**: 전투; 레코드 7, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 12, 지도
  - 전투 설정: 턴 제한 30, 아군 출진 7명, 퇴각하면 패배 #0
  - 적군 명단: 12기
  - 트리거: battle_won, unit_at_cell, unit_contact
  - 목표 문구: 一、全數殲滅敵人． 二、敵軍投降． / 掃平山賊．
  - r3 레벨 +1: 劉備
  - r4 아이템: 劍術指南書
  - r6 (run) 전투 끝
  - r6 (run) → 블록 6
  - r6 (run) → 블록 2
  - 플래그 켬: {9, 13, 14}
  - 플래그 검사: {8, 10, 14}
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 關羽: 請列隊．
    - `play_music` song=12
    - `battle_setup` 
    - `battle_roster` 
    - `load_map` map=12300
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、全數殲滅敵人．
      > 二、敵軍投降．
    - `dialogue`
      > 趙何: 劉備是從平定黃巾之亂時開始強大的，現在還是乖乖地投降他好．
      > 關羽: 大哥，賊也是人，如果對他們曉之以理或許會改邪歸正．
      > 劉備: 知道了，試試看吧．
    - `play_music` song=19
  - **r3** unit_contact(4) [劉備] 그룹 3* — 그룹 넘김
    - `play_music` song=11
    - `dialogue`
      > 趙何: 劉備，以兵刃相見，對不起了，今後我想改過自新，追隨您．
    - `caption`
      > 趙何加入劉備軍！
    - `set_country` person=趙何 country=0
    - `set_flag` flag=13 clear=0
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備的等級上昇了．
    - `leave_parallel` 
  - **r4** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=劍術指南書
    - `set_flag` flag=14 clear=0
  - **r5** battle_won(7) 그룹 3 — 그룹 넘김
    - `leave_parallel` 
  - **r6** run(0) 그룹 4
    - `play_music` song=7
    - `narration`
      > 　劉備軍討伐彭城之賊．
    - `data` kind=2 value=400
    - `caption`
      > 繳獲了黃金４００．
    - `battle_end` next_map=4096
    - `set_flag` flag=9 clear=0
    - `load_map` map=4096
    - `if_flags` 
    - `if_flags` 
    - `play_music` song=3
    - `if_flags` 
    - `dialogue`
      > 關羽: 大哥，現在賊兵全部消滅了，我們回小沛吧．
    - `goto_block` block=6
    - `op_3d` value=1
    - `dialogue`
      > 關羽: 大哥，我們去哪裡？
    - `set_objective`
      > 掃平山賊．
    - `goto_block` block=2
- **블록 5**: 전투; 레코드 7, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 11, 지도
  - 전투 설정: 턴 제한 30, 아군 출진 7명, 퇴각하면 패배 #0
  - 적군 명단: 12기
  - 트리거: battle_won, unit_at_cell, unit_contact
  - 목표 문구: 一、全數殲滅敵人． 二、敵軍投降． / 掃平山賊．
  - r3 레벨 +1: 劉備
  - r4 아이템: 漩渦書  
  - r6 (run) 전투 끝
  - r6 (run) → 블록 6
  - r6 (run) → 블록 2
  - 플래그 켬: {10, 15, 16}
  - 플래그 검사: {8, 9, 16}
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 關羽: 請點派軍隊．
    - `play_music` song=12
    - `battle_setup` 
    - `battle_roster` 
    - `load_map` map=12299
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、全數殲滅敵人．
      > 二、敵軍投降．
    - `dialogue`
      > 董梁: 不妙，如果是陶謙的軍隊還可以打贏．可是劉備的軍隊不好對付，別打了，還是投降吧．
      > 簡雍: 主公，討賊吧，只有這樣才能消滅這些害人精．
    - `play_music` song=19
  - **r3** unit_contact(4) [劉備] 그룹 3* — 그룹 넘김
    - `play_music` song=11
    - `dialogue`
      > 董梁: 壞了，怎麼會是令人聞風喪膽的劉備？我實在是打不了，劉備，我投降．
    - `caption`
      > 董梁加入劉備軍！
    - `set_country` person=董梁 country=0
    - `set_flag` flag=15 clear=0
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備的等級上昇了．
    - `leave_parallel` 
  - **r4** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=漩渦書  
    - `set_flag` flag=16 clear=0
  - **r5** battle_won(7) 그룹 3 — 그룹 넘김
    - `leave_parallel` 
  - **r6** run(0) 그룹 4
    - `play_music` song=7
    - `narration`
      > 　劉備部隊掃平夏丘草寇．
    - `data` kind=2 value=400
    - `caption`
      > 繳獲黃金４００．
    - `battle_end` next_map=4096
    - `set_flag` flag=10 clear=0
    - `load_map` map=4096
    - `if_flags` 
    - `if_flags` 
    - `play_music` song=3
    - `if_flags` 
    - `dialogue`
      > 關羽: 大哥，賊兵已全部消滅，我們回小沛吧．
    - `goto_block` block=6
    - `op_3d` value=1
    - `dialogue`
      > 關羽: 大哥，去哪裡呢？
    - `set_objective`
      > 掃平山賊．
    - `goto_block` block=2
- **블록 6**: 이야기; 레코드 7, 그룹 3; 대화 5(잡담 4); 맵: 마을 2, 마을 22
  - 트리거: location
  - 목표 문구: 與關羽等談話． / 去徐州陶謙官邸看望陶謙．
  - r0 아이템: 弓術指南書
  - r0 아이템: 濁流書  
  - 플래그 검사: {8, 9, 10}
  - **r0** run(0) 그룹 0
    - `load_map` map=8194
    - `set_previous_map` map=12 x=26 y=6
    - `play_music` song=5
    - `caption`
      > 小沛議事廳
    - `dialogue`
      > 關羽: 小沛的百姓說要謝謝大哥．
    - `dialogue`
      > 農民: 劉備，您為我們消滅了山賊，謝謝，現在我們可以放心地外出走動了．這是我們本地百姓的一點意思，請笑納．
    - `if_flags` 
    - `data` kind=2 value=500
    - `caption`
      > 得到了黃金５００．
    - `if_flags` 
    - `add_item` item=弓術指南書
    - `if_flags` 
    - `add_item` item=濁流書  
    - `dialogue`
      > 農民: 劉備，請您以後繼續保護小沛，那我告辭了．
    - `set_objective`
      > 與關羽等談話．
  - **r1** talk(3) [關羽] 그룹 1*
    - `dialogue`
      > 關羽: 我們討完賊，這樣小沛總算安定了．
  - **r2** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 終究那些小毛賊不是我張飛的對手．
  - **r3** talk(3) [孫乾] 그룹 1
    - `dialogue`
      > 孫乾: 不可大意，說不定還會有什麼變故．
  - **r4** talk(3) [簡雍] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 簡雍: 主公，好像是快使．
    - `dialogue`
      > 文官: 劉備，陶謙病情惡化，請馬上去徐州．
      > 張飛: 什麼？陶謙病重了．
      > 孫乾: 知道了，我們馬上就去．
      > 文官: 是，陶謙在徐州官邸，請快些．
      > 關羽: 大哥，快去吧．
    - `set_objective`
      > 去徐州陶謙官邸看望陶謙．
    - `leave_parallel` 
  - **r5** talk(3) [文官] 그룹 2*
    - `dialogue`
      > 文官: 劉備，請馬上去徐州官邸，分秒必爭，陶謙快不行了．
  - **r6** location(2) 그룹 2 — 그룹 넘김
    - `load_map` map=8214
    - `play_music` song=2
    - `caption`
      > 徐州陶謙官邸
    - `dialogue`
      > 糜竺: 哦，劉備，你來得正好，快去見我們主公．
    - `dialogue`
      > 劉備: 陶謙，請多保重．
    - `leave_parallel` 
- **블록 7**: 이야기; 레코드 2, 그룹 2; 대화 0(잡담 0)
  - r1 레벨 +3: 糜竺
  - r1 소속: 糜竺 → 유비군(합류)
  - r1 레벨 +4: 糜芳
  - r1 레벨 +3: 糜芳
  - r1 소속: 糜芳 → 유비군(합류)
  - 플래그 검사: {219}
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 陶謙: 哦，你來得正是時候，劉備，我有話對你講，我快不行了，所以有件事想求你．
      > 劉備: 什麼事？
      > 陶謙: 你能不能擔任徐州太守呢？
      > 劉備: 這是什麼話．
    - `dialogue`
      > 糜竺: 你覺得很突然吧，然而這是要臣們商量決定的．
      > 糜芳: 劉備，您是當我們主公最合適的人選，請您保護徐州．
    - `dialogue`
      > 關羽: 兄長，有什麼可猶豫的，你就要擁有自己的領地了．
    - `dialogue`
      > 張飛: 陶謙一直在勸你，大哥，快決定吧．
    - `dialogue`
      > 糜竺: 徐州是四面受攻之地，我們覺得與其被敵人奪走，還不如把徐州託付給劉備．
    - `dialogue`
      > 糜芳: 劉備，我們求您了．
  - **r1** run(0) 그룹 1 — 그룹 넘김
    - `dialogue`
      > 陶謙: 如能接受我的請求，我也就沒什麼可牽掛的了，劉備，請你一定要接受．
      > 劉備: 明白了，劉備不才，願接受．
      > 陶謙: 您接受了，謝謝，這樣我也沒有牽掛了．糜竺，告別了．
      > 糜竺: 主公！
    - `narration`
      > 　陶謙去世了．
    - `dialogue`
      > 糜竺: 劉備，您就是我們的主公了．
      > 糜芳: 請多關照．
    - `caption`
      > 糜竺和糜芳加入．
    - `add_levels` person=糜竺 levels=3
    - `set_allegiance` person=糜竺 army=0
    - `if_flags` 
    - `add_levels` person=糜芳 levels=4
    - `if_flags` 
    - `add_levels` person=糜芳 levels=3
    - `set_allegiance` person=糜芳 army=0
    - `dialogue`
      > 糜竺: 不能悲痛得無法自拔，劉備，我們先去議事廳，請您也要來．
    - `dialogue`
      > 糜芳: 主公，我先走了．
    - `dialogue`
      > 關羽: 我們也去議事廳吧，張飛，走．
      > 張飛: 好．
    - `leave_parallel` 
- **블록 8**: 이야기; 레코드 20, 그룹 5; 대화 18(잡담 15); 맵: 마을 4
  - 목표 문구: 去議事廳研究今後的對策． / 研究今後的對策．
  - r0 삽화 7
  - **r0** run(0) 그룹 0
    - `show_picture` picture=7 variant=1
    - `narration`
      > 　此時曹操肅清董卓餘黨，救出獻帝，從洛陽遷都許昌，獻帝除曹操外別無所依，默默地聽從曹操的意見，曹操把持皇帝於手中．
    - `narration`
      > 　對正處於旭日東昇之勢的曹操來說，也有令其擔心的人，那就是呂布和劉備．
    - `load_map` map=8196
    - `set_previous_map` map=11 x=28 y=5
    - `play_music` song=5
    - `caption`
      > 徐州議事廳
    - `set_objective`
      > 去議事廳研究今後的對策．
  - **r1** talk(3) [關羽] 그룹 1*
    - `dialogue`
      > 關羽: 失去一個很可惜的人．
  - **r2** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 為了陶謙一定要守住徐州，是吧，大哥．
  - **r3** talk(3) [糜芳] 그룹 1
    - `dialogue`
      > 糜芳: 徐州四面被敵人包圍，是個難守的地方．
  - **r4** talk(3) [糜竺] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 糜竺: 主公，呂布來了．
    - `play_music` song=11
    - `dialogue`
      > 呂布: 呀，劉備，久違了，我有點事想要求您．
    - `leave_parallel` 
  - **r5** talk(3) [關羽] 그룹 2*
    - `dialogue`
      > 關羽: 是呂布嗎？我反對收留呂布．
  - **r6** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 大哥，對方是那個呂布嗎？考慮都不要考慮，呂布之流，見面都沒必要．
  - **r7** talk(3) [糜竺] 그룹 2
    - `dialogue`
      > 糜竺: 主公，呂布想說的話大概你也知道，我覺得不理他對徐州有利．
  - **r8** talk(3) [糜芳] 그룹 2
    - `dialogue`
      > 糜芳: 雖然我也同情呂布現在的狀況，但此人毫無信義．
  - **r9** talk(3) [陳宮] 그룹 2
    - `dialogue`
      > 陳宮: 劉備，請你一定要幫助我們．
  - **r10** talk(3) [張遼] 그룹 2
    - `dialogue`
      > 張遼: 劉備，我們正等著你的好回音．
  - **r11** talk(3) [呂布] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 呂布: 自從我們敗給曹操以來，長時間到處流浪，當時聽說你在徐州，就來了，請收留我們吧，求求你．
    - `leave_parallel` 
  - **r12** talk(3) [關羽] 그룹 3*
    - `dialogue`
      > 關羽: 呂布嗎？雖然我不想違背大哥的意願，但我還是反對．
  - **r13** talk(3) [張飛] 그룹 3
    - `dialogue`
      > 張飛: 大哥，對方是那個呂布嗎？考慮都不要考慮，呂布之流，見面都沒必要．
  - **r14** talk(3) [糜竺] 그룹 3
    - `dialogue`
      > 糜竺: 主公，呂布想說的話大概你也知道，我覺得不理他對徐州有利．
  - **r15** talk(3) [糜芳] 그룹 3
    - `dialogue`
      > 糜芳: 雖然我也同情呂布現在的狀況，但此人毫無信義．
  - **r16** talk(3) [陳宮] 그룹 3
    - `dialogue`
      > 陳宮: 劉備，請您幫助我們．
  - **r17** talk(3) [張遼] 그룹 3
    - `dialogue`
      > 張遼: 劉備，請給我們一個好的答覆．
  - **r18** talk(3) [呂布] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 呂布: 劉備，請給我們一個好的答覆．
      > 劉備: 我知道了，現在允許你在小沛落腳．
      > 呂布: 啊，謝謝，沒想到會得到如此好的答覆，徐州被曹操攻打時，也正因為我們攻打陳留，才能使你穩坐徐州，如此說來，這也是緣份，哈哈！
      > 張飛: 胡說什麼？
    - `dialogue`
      > 呂布: 張飛！
      > 張飛: 你說我大哥和你有緣，胡說八道，我們有這徐州，難道還多虧你，呂布，我們馬上決出勝負．
    - `dialogue`
      > 關羽: 張飛，住手．
      > 張飛: 不要攔我，關羽，我要除掉此害．
      > 關羽: 張飛，你先出去．
    - `dialogue`
      > 劉備: 對不起，我弟弟現在情緒很激動，沒事的，請去小沛吧．
      > 呂布: 那我們馬上按您的話去小沛．
      > 陳宮: 謝謝．
    - `dialogue`
      > 關羽: 你不是張遼嗎？
      > 張遼: 關羽，有什麼事？
      > 關羽: 我還記得你在虎牢關作戰時的英姿，盡管你我是敵人，但你的作戰風格讓我佩服，可是如此了不起的你怎麼會追隨呂布呢．
      > 張遼: 事態的變化造成的，可是一旦決定了主人就不能輕易改變，想必這你也知道吧．
      > 關羽: 但是，如果主人有顆正直的心那還行，你覺得呂布有此心嗎？
      > 張遼: 我沒辦法影響呂布，現在也只能做到這樣．
      > 關羽: 這樣我也無話可說．
    - `narration`
      > 　於是呂布駐紮在小沛，可是這種選擇果真正確嗎？
    - `leave_parallel` 
  - **r19** run(0) 그룹 4
    - `load_map` map=8196
    - `set_previous_map` map=11 x=28 y=5
    - `play_music` song=5
    - `caption`
      > 徐州議事廳
    - `set_objective`
      > 研究今後的對策．
- **블록 9**: 전투 준비; 레코드 25, 그룹 5; 대화 25(잡담 20); 맵: 지도
  - 전투 설정: 턴 제한 30, 아군 출진 9명, 퇴각하면 패배 #0
  - 목표 문구: 進軍淮南，討伐袁術．
  - 질문 r24 (關羽): 예 답이면 13 명령 실행, 출진 확인 [battle_setup, leave_parallel]
  - **r0** talk(3) [關羽] 그룹 0*
    - `dialogue`
      > 關羽: 兄長，我不相信呂布．
  - **r1** talk(3) [張飛] 그룹 0
    - `dialogue`
      > 張飛: 絕對不同意，你為什麼把這種人留在徐州？
  - **r2** talk(3) [糜竺] 그룹 0
    - `dialogue`
      > 糜竺: 呂布連自己的義父都殺，沒有信義．
  - **r3** talk(3) [糜芳] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 糜芳: 哦，主公，孫乾來了．
    - `leave_parallel` 
  - **r4** talk(3) [關羽] 그룹 1*
    - `dialogue`
      > 關羽: 孫乾來會有什麼事情？
  - **r5** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 絕對不同意，大哥，你為什麼把那種人安置在徐州．
  - **r6** talk(3) [糜竺] 그룹 1
    - `dialogue`
      > 糜竺: 孫乾來了，聽聽他的意見吧．
  - **r7** talk(3) [糜芳] 그룹 1
    - `dialogue`
      > 糜芳: 先聽聽孫乾的意見吧．
  - **r8** talk(3) [孫乾] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 孫乾: 主公，有欽差來了，怎麼辦？
      > 關羽: 欽差，會有什麼事呢？大哥，先讓到裡面吧．
      > 劉備: 裡面請．
      > 孫乾: 是．
    - `leave_parallel` 
  - **r9** talk(3) [關羽] 그룹 2*
    - `dialogue`
      > 關羽: 大哥，請聽欽差講．
  - **r10** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 絕對不能同意．
  - **r11** talk(3) [糜竺] 그룹 2
    - `dialogue`
      > 糜竺: 主公，請聽欽差講．
  - **r12** talk(3) [糜芳] 그룹 2
    - `dialogue`
      > 糜芳: 主公，先聽欽差講吧．
  - **r13** talk(3) [孫乾] 그룹 2
    - `dialogue`
      > 孫乾: 我沒事，先聽欽差講吧．
  - **r14** talk(3) [使者] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 使者: 你是劉備嗎？我是朝廷派來的欽差．
      > 劉備: 是．
      > 使者: 皇帝有旨，命討伐淮南袁術，可以嗎？
      > 劉備: 是，遵旨．
      > 使者: 那麼，我還有其他事，就此告辭了．
    - `leave_parallel` 
  - **r15** talk(3) [關羽] 그룹 3*
    - `dialogue`
      > 關羽: 按大哥的意思辦．
  - **r16** talk(3) [張飛] 그룹 3
    - `dialogue`
      > 張飛: 袁術不足掛齒，大哥，決定了就快出兵吧．
  - **r17** talk(3) [糜芳] 그룹 3
    - `dialogue`
      > 糜芳: 我們都是首次參戰，讓我們奮力殺敵吧．
  - **r18** talk(3) [孫乾] 그룹 3
    - `dialogue`
      > 孫乾: 可是，皇帝為什麼現在要下旨討伐袁術呢？
  - **r19** talk(3) [糜竺] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 糜竺: 主公，這道聖旨裡面會不會有問題？
      > 劉備: 大概這是曹操的主意，現在皇帝在曹操的庇護下，所以可以理解為這是曹操的命令．但聖旨難違呀．
      > 糜竺: 是啊，著手準備出兵吧．
    - `set_objective`
      > 進軍淮南，討伐袁術．
    - `leave_parallel` 
  - **r20** talk(3) [張飛] 그룹 4*
    - `dialogue`
      > 張飛: 袁術不足掛齒，大哥，決定了就快出兵吧．
  - **r21** talk(3) [孫乾] 그룹 4
    - `dialogue`
      > 孫乾: 既然決定出兵，也只好服從了．
  - **r22** talk(3) [糜竺] 그룹 4
    - `dialogue`
      > 糜竺: 準備出兵了．
  - **r23** talk(3) [糜芳] 그룹 4
    - `dialogue`
      > 糜芳: 我們都是首次參戰，讓我們奮力殺敵吧．
  - **r24** talk(3) [關羽] 그룹 4 — 그룹 넘김
    - `dialogue`
      > 關羽: 準備好了嗎？
    - `if_answer` answer=0 skip=13
    - `op_3d` value=0
    - `play_music` song=12
    - `dialogue`
      > 關羽: 請點兵派將．
    - `battle_setup` 
    - `dialogue`
      > 關羽: 出兵．
    - `load_map` map=4096
    - `play_music` song=3
    - `leave_parallel` 
- **블록 10**: 이야기; 레코드 2, 그룹 2; 대화 0(잡담 0); 맵: 마을 2
  - r1 삽화 9
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 張飛: 好，進軍袁術所在的淮南，我的胳膊都癢了．
  - **r1** run(0) 그룹 1
    - `load_map` map=8194
    - `play_music` song=11
    - `caption`
      > 淮南議事廳
    - `show_picture` picture=9 variant=1
    - `narration`
      > 　皇帝宣旨討伐袁術是有其原因的，因為袁術自封皇帝．袁術拿到了皇帝的玉璽，自封為皇帝，在淮南過著奢侈糜爛的生活．
    - `dialogue`
      > 紀靈: 劉備軍已經打過來了，主公，怎麼辦？
      > 袁術: 劉備小兒也想奪我的領土，也太狂妄自大了吧，袁胤，有何良策？
    - `dialogue`
      > 袁胤: 有．
      > 袁術: 哦，是什麼？快說．
      > 袁胤: 是，現在呂布受劉備保護，駐紮在小沛，所以讓呂布襲擊劉備的背後．
      > 袁術: 什麼？你說挑動呂布？可是呂布會像你說的那樣做嗎？他不是正受劉備的照顧嗎？
      > 袁胤: 可是，如我們說服得好，呂布肯定會動手的．
    - `dialogue`
      > 紀靈: 對，因為董卓那麼照顧他，他都背叛了．
      > 袁術: 好，快安排吧，馬上派使者送信去．
      > 袁胤: 是．
- **블록 11**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 마을 2
  - **r0** run(0) 그룹 0
    - `load_map` map=8194
    - `play_music` song=11
    - `caption`
      > 小沛議事廳
    - `dialogue`
      > 魏續: 袁術來信是怎麼講的？
      > 呂布: 唉．
    - `narration`
      > 『原只是個農民的劉備，鬼迷心竅想占領我的領地，您不會允許吧，您應該從此賊手中奪回徐州，讓這個狂妄自大的傢伙知道自己的愚蠢．定當以厚禮相贈．
      > 　　　　　　　　　　　　　　袁術』
    - `dialogue`
      > 宋憲: 送一封這樣的信來，袁術好像很慌亂．
      > 張遼: 這封信口氣好像很專橫，看來事到如此境地，還擺什麼臭架子．
      > 陳宮: 可是，主公，此事應仔細考慮呀．
      > 呂布: 什麼？怎麼回事？
    - `dialogue`
      > 陳宮: 現在徐州空虛，我們應乘此間隙奪取徐州，在那裡組建精銳部隊．
      > 呂布: 可是，劉備收留了我們，那樣會……
      > 陳宮: 時為戰亂之秋，主公，要得到天下，這可是不會再有的機會了．
      > 呂布: 明白了．集合部隊，去徐州．
    - `dialogue`
      > 張遼: 可是，劉備於我們有恩，這不是背叛嗎？
    - `dialogue`
      > 陳宮: 那你是說讓主公作為劉備的客人渡過一生．
    - `dialogue`
      > 宋憲: 對呀，和主公一起打天下吧．
      > 張遼: ……
      > 呂布: 不必再說，全軍馬上向徐州進發．
    - `dialogue`
      > 侯成: ……張遼，你的心情我知道，然而這是戰亂之秋，沒辦法．
    - `dialogue`
      > 張遼: 戰亂之秋……
- **블록 12**: 전투; 레코드 9, 그룹 4; 대화 0(잡담 0); 맵: 전투 맵 13
  - 적군 명단: 22기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact, unit_in_area
  - 목표 문구: 一、全數殲滅敵人． / 一、全數殲滅敵人． 二、劉備到達西北鹿砦．
  - r4 (battle_won) 전투 끝
  - r6 (unit_at_cell) 전투 끝
  - r7 아이템: 猛火書  
  - r8 일기토
  - r8 레벨 +1: 關羽
  - 플래그 켬: {70, 151}
  - 플래그 검사: {70, 151}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12301
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、全數殲滅敵人．
    - `dialogue`
      > 紀靈: 哼，我家主公豈能被劉備這販履小兒輕視，讓他看看我的厲害．
      > 關羽: 袁術好像沒有親征，小心他耍什麼花招．
    - `play_music` song=10
  - **r3** turn(9) 그룹 3*
    - `play_music` song=11
    - `dialogue`
      > 糜竺: 主公，剛才徐州來人急報，說徐州已被呂布占領．
      > 張飛: 什麼？畜生，呂布你這個混蛋，竟然恩將仇報，我決不饒你．大哥，讓我去戰呂布，我一定殺了這個混蛋．
      > 關羽: 兄長，呂布軍來了．
    - `join_battle` person=陳宮
    - `join_battle` person=張遼
    - `join_battle` person=魏續
    - `join_battle` person=宋憲
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=騎兵隊
    - `join_battle` person=武術家
    - `join_battle` person=步兵隊
    - `join_battle` person=賊兵
    - `caption`
      > 出現了呂布軍．
    - `dialogue`
      > 陳宮: 這場戰爭，將影響到主公的一生，眾將，向劉備發動總攻．
      > 張遼: ……
      > 紀靈: 好，此戰必勝．
      > 關羽: 大哥，寡不敵眾，沒法打，現在只好撤退．
      > 孫乾: 先去許昌投靠曹操吧．
      > 簡雍: 如果逃往許昌的路上，敵人就不會追過來了，去西北的鹿砦吧．
    - `set_objective`
      > 一、全數殲滅敵人．
      > 二、劉備到達西北鹿砦．
    - `play_music` song=10
  - **r4** battle_won(7) 그룹 3 — 그룹 넘김
    - `play_music` song=7
    - `narration`
      > 　劉備打破紀靈率領的袁術軍．
    - `data` kind=2 value=400
    - `caption`
      > 繳獲黃金４００．
    - `battle_end` next_map=4096
    - `leave_parallel` 
  - **r5** unit_in_area(11) [劉備] 그룹 3
    - `if_flags` 
    - `dialogue`
      > 劉備: 簡雍說的鹿砦就是這個吧，馬上就到了，總算逃出去了．
    - `set_flag` flag=151 clear=0
  - **r6** unit_at_cell(6) [劉備] 그룹 3 — 그룹 넘김
    - `data` kind=4 value=50
    - `play_music` song=4
    - `narration`
      > 　劉備軍逃離的戰場．
    - `battle_end` next_map=4096
    - `leave_parallel` 
  - **r7** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=猛火書  
    - `set_flag` flag=70 clear=0
  - **r8** unit_contact(4) [關羽] 그룹 3
    - `dialogue`
      > 關羽: 張遼，呂布作出如此下流之事，難道你還想追隨他？
      > 張遼: 不必多言，關羽，來吧！
      > 關羽: 沒辦法，此人雖然殺之可惜……
    - `duel` first=關羽 second=張遼
    - `dialogue`
      > 關羽: 我來了，張遼．
      > 張遼: 啊！
    - `duel_begin` 
    - `dialogue`
      > 關羽: 不愧是張遼，但此招躲得過嗎？
    - `duel_action` person=關羽 action=0
    - `dialogue`
      > 張遼: 噢，不愧是關羽，今天我算敗給你了．
      > 關羽: 張遼，想逃跑嗎？站住！
    - `duel_action` person=張遼 action=4
    - `duel_end` 
    - `add_levels` person=關羽 levels=1
    - `caption`
      > 關羽的等級上昇了．
    - `dialogue`
      > 張遼: 撤退，我不想和關羽交戰．
- **블록 13**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 지도
  - **r0** run(0) 그룹 0
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 張飛: 呂布，這個畜生，大哥，關羽，我馬上返回徐州，去殺呂布．
      > 關羽: 不可，現在返回徐州就得打仗，敵人的精兵強將，我們打不過．兄長，現今還是去許昌投靠曹操吧．
      > 劉備: 也只好這樣了，去許昌．
- **블록 14**: 이야기; 레코드 15, 그룹 4; 대화 12(잡담 11); 맵: 마을 5
  - 트리거: location
  - 목표 문구: 與曹操就今後問題進行研究． / 在官邸休息．
  - **r0** run(0) 그룹 0
    - `load_map` map=8197
    - `set_previous_map` map=14 x=25 y=5
    - `play_music` song=5
    - `caption`
      > 許昌議事廳
    - `dialogue`
      > 曹操: 哦，劉備，這次落難了．
    - `set_objective`
      > 與曹操就今後問題進行研究．
  - **r1** talk(3) [荀彧] 그룹 1*
    - `dialogue`
      > 荀彧: 這次落難了．
  - **r2** talk(3) [郭嘉] 그룹 1
    - `dialogue`
      > 郭嘉: 我很體諒你失去徐州的心情．
  - **r3** talk(3) [程昱] 그룹 1
    - `dialogue`
      > 程昱: 那是一場很艱苦的作戰吧．
  - **r4** talk(3) [夏侯惇] 그룹 1
    - `dialogue`
      > 夏侯惇: 被呂布出賣了吧，呂布簡直是個毫無信義的人．
  - **r5** talk(3) [曹仁] 그룹 1
    - `dialogue`
      > 曹仁: 呂布和袁術不敢打到這裡來．
  - **r6** talk(3) [曹操] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 曹操: 聽起來，你是被呂布出賣了，徐州也丟了，我很同情你的處境，關羽怎麼樣了？
      > 劉備: 關羽和張飛都在城外候著，我們現在連住處都沒有，是含羞前來投靠，請您關照．
      > 曹操: 唉，你們放心地住在許昌吧，大家長途跋涉很累了吧，快去官邸休息吧．
    - `set_objective`
      > 在官邸休息．
    - `leave_parallel` 
  - **r7** talk(3) [曹操] 그룹 2*
    - `dialogue`
      > 曹操: 不要客氣，快去官邸休息吧．
  - **r8** talk(3) [荀彧] 그룹 2
    - `dialogue`
      > 荀彧: 這次落難了．
  - **r9** talk(3) [郭嘉] 그룹 2
    - `dialogue`
      > 郭嘉: 我很體諒你失去徐州的心情．
  - **r10** talk(3) [程昱] 그룹 2
    - `dialogue`
      > 程昱: 官邸在城內．
  - **r11** talk(3) [夏侯惇] 그룹 2
    - `dialogue`
      > 夏侯惇: 被呂布出賣了吧，呂布簡直是個毫無信義的人．
  - **r12** talk(3) [曹仁] 그룹 2
    - `dialogue`
      > 曹仁: 呂布和袁術不敢打到這裡來．
  - **r13** location(2) 그룹 2 — 그룹 넘김
    - `leave_parallel` 
  - **r14** run(0) 그룹 3
    - `load_map` map=8197
    - `play_music` song=11
    - `dialogue`
      > 程昱: 主公，劉備可是個有雄才大略的英雄．
      > 荀彧: 我想還是趁此機會除掉劉備．
      > 曹仁: 關羽和張飛都不在呂布之下，他們也許會成為後患．
      > 曹操: ……
      > 郭嘉: 不行，我反對這一想法，今若殺掉劉備世人會如何說主公呢？
      > 夏侯惇: 對呀，殺前來投奔之人，會影響主公的威望．
      > 曹操: 說得好，莫如對處於逆境的劉備施以恩德．
      > 荀彧: 不過，主公，劉備毫無疑問是個危險人物，一但有機會，最好除掉他．
      > 曹操: 我知道，劉備最怕的是我．

### 장면 3

제목: 第一章　討伐呂布之戰

- **블록 0**: 전투 준비; 레코드 14, 그룹 6; 대화 10(잡담 4); 맵: 마을 2, 지도
  - 전투 설정: 턴 제한 30, 아군 출진 10명, 격파 대상 #79, 퇴각하면 패배 #0
  - 전투 설정: 턴 제한 30, 아군 출진 10명, 격파 대상 #72, 퇴각하면 패배 #0
  - 목표 문구: 與曹操等就下一步作戰研究．
  - r0 삽화 8
  - 질문 r12 (荀彧): 예 답이면 18 명령 실행, 출진 확인 [battle_setup, goto_block]
  - r12 (talk) → 블록 1
  - 질문 r13 (郭嘉): 예 답이면 18 명령 실행, 출진 확인 [battle_setup, goto_block]
  - r13 (talk) → 블록 2
  - **r0** run(0) 그룹 0
    - `play_music` song=0
    - `chapter_title` key=第一章　討伐呂布之戰
    - `title`
      > 第一章　討伐呂布之戰
    - `show_picture` picture=8 variant=0
    - `narration`
      > 　劉備寄身於曹操之下，圖謀再起，可是劉備的這種處境，只是曹操害怕劉備和呂布聯手所策劃的一個計謀．
    - `load_map` map=4096
    - `narration`
      > 　敵人只剩下呂布一個了，曹操非常高興，便馬上動身討伐呂布，曹操和劉備聯軍攻克了小沛，在小沛又開始研究下一步作戰．
  - **r1** run(0) 그룹 1
    - `load_map` map=8194
    - `play_music` song=11
    - `caption`
      > 徐州議事廳
    - `narration`
      > 　丟掉小沛的呂布，在徐州研究今後的對策．
    - `dialogue`
      > 呂布: 唉，不只曹操，還有劉備也攻過來了，陳宮，如何是好？
    - `dialogue`
      > 陳宮: 現在整頓兵馬，首先在通往徐州的路上布置兵馬．
      > 呂布: 嗯，布署在夏丘和彭城，是嗎？
      > 陳宮: 對，在那裡布署兵馬，我們要爭取時間．另外，徐州不適合防守，所以要把大本營移至位於徐州南面的下邳．
      > 呂布: 下邳？
      > 陳宮: 是的，下邳非常堅固，四周有很深的護城河，我們在那裡對抗曹操軍．
      > 呂布: 知道了，我們就移往下邳，還有，張遼！高順！
      > 張遼: 在！
      > 高順: 在！
    - `dialogue`
      > 呂布: 張遼，你去夏丘，按陳宮的吩咐阻止曹操軍前進．
      > 張遼: 遵令！
      > 呂布: 高順去彭城，好，去吧．
      > 高順: 遵令！
    - `dialogue`
      > 陳宮: 主公，快去下邳吧．
      > 呂布: 這雖然很好，但怎麼派援軍給他們呢？
      > 陳宮: 援軍，他們不需要援軍．
      > 呂布: 什麼？那不行，只靠他們的部隊阻擋不了曹操軍．
      > 陳宮: 完全正確，所以他們是被扔掉的棋子，在他們為我們贏得的時間裡，我們要轉移到下邳，否則無法瓦解曹操軍的追擊．
      > 呂布: 可，可是？
      > 陳宮: 主公，要成為人上人就不能有私情，他們的本意也是能為主公效勞嗎？
      > 呂布: 哦？唉！
      > 侯成: ……（怎麼搞的？我怎麼會跟著他到現在？）
  - **r2** run(0) 그룹 2
    - `load_map` map=4096
    - `play_music` song=11
    - `dialogue`
      > 張遼: 那麼，我們在夏丘阻止曹操軍．
      > 高順: 我們在彭城保護主公，放心吧，肯定有援軍的．
      > 呂布: 那麼，我們去下邳吧．
  - **r3** run(0) 그룹 3
    - `load_map` map=8194
    - `set_previous_map` map=12 x=26 y=6
    - `play_music` song=5
    - `caption`
      > 小沛議事廳
    - `dialogue`
      > 曹操: 哦，劉備，能奪回小沛，首先要祝賀你．
      > 劉備: 謝謝．
    - `set_objective`
      > 與曹操等就下一步作戰研究．
  - **r4** talk(3) [關羽] 그룹 4*
    - `dialogue`
      > 關羽: 請對曹操講．
  - **r5** talk(3) [張飛] 그룹 4
    - `dialogue`
      > 張飛: 太想念這裡了，覺得好像終於回到了家．
  - **r6** talk(3) [荀彧] 그룹 4
    - `dialogue`
      > 荀彧: 這仗打得真漂亮啊，終於奪回了小沛．
  - **r7** talk(3) [郭嘉] 그룹 4
    - `dialogue`
      > 郭嘉: 乾脆乘勢進攻，消滅呂布．
  - **r8** talk(3) [曹操] 그룹 4 — 그룹 넘김
    - `dialogue`
      > 曹操: 劉備，此次進攻徐州，我想與你分路進軍．
      > 劉備: 分成夏丘和彭城兩路．
      > 曹操: 對，敵人好像已在夏丘和彭城準備好等著我們，劉備，我分一支援軍給你，如果你攻夏丘就帶荀彧，攻彭城就帶郭嘉，我跟他倆講好了．
    - `leave_parallel` 
  - **r9** talk(3) [關羽] 그룹 5*
    - `dialogue`
      > 關羽: 選擇哪條路由大哥定，可是，守夏丘的是張遼，張遼可非尋常之輩．
  - **r10** talk(3) [張飛] 그룹 5
    - `dialogue`
      > 張飛: 哪條路都行，大哥，快奪回徐州吧．
  - **r11** talk(3) [曹操] 그룹 5
    - `dialogue`
      > 曹操: 如果往夏丘進軍就帶荀彧，往彭城就帶郭嘉．
  - **r12** talk(3) [荀彧] 그룹 5
    - `dialogue`
      > 荀彧: 要進攻夏丘嗎？
    - `if_answer` answer=0 skip=18
    - `op_3d` value=0
    - `play_music` song=12
    - `dialogue`
      > 荀彧: 請編組部隊．
    - `battle_setup` 
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 荀彧: 出兵．
      > 曹操: 那麼我們就向彭城進軍吧，劉備，夏丘方面就交給你了．
    - `goto_block` block=1
  - **r13** talk(3) [郭嘉] 그룹 5
    - `dialogue`
      > 郭嘉: 要進攻彭城嗎？
    - `if_answer` answer=0 skip=18
    - `op_3d` value=0
    - `play_music` song=12
    - `dialogue`
      > 郭嘉: 請編組部隊．
    - `battle_setup` 
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 郭嘉: 出兵．
      > 曹操: 那麼我們就向夏丘進軍，劉備，彭城方面就交給你了．
    - `goto_block` block=2
- **블록 1**: 전투; 레코드 9, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 11, 지도
  - 적군 명단: 13기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact
  - 목표 문구: 一、張遼撤退．
  - r8 (run) 전투 끝
  - r8 (run) → 블록 3
  - 플래그 켬: {72}
  - 플래그 검사: {72}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12299
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、張遼撤退．
    - `dialogue`
      > 荀彧: 好，兩面夾擊敵人．
      > 劉備: 只等著開打了．
      > 關羽: 敵軍大將好像是張遼，張遼是有忠義之心的一員武將．
      > 張遼: 追隨呂布看來是錯了．
    - `play_music` song=14
  - **r3** turn(9) 그룹 3*
  - **r4** turn(9) 그룹 3
    - `dialogue`
      > 關羽: 大哥，注意後面．
    - `join_battle` person=步兵隊
    - `join_battle` person=弓兵隊
    - `join_battle` person=騎兵隊
    - `caption`
      > 敵人的奇襲隊出現了．
    - `dialogue`
      > 劉備: 張遼派奇襲隊抄我後路．
      > 關羽: 真知用兵之妙．
      > 張遼: 好，全軍總攻．
  - **r5** unit_contact(4) [關羽] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 關羽: 對面的可是張遼，你追隨呂布，難道不後悔嗎？
      > 張遼: 唉！
      > 關羽: 呂布是個視背叛如同兒戲的惡棍，決不是什麼英雄，這點你不會不知吧．
      > 張遼: 唉！
    - `dialogue`
      > 張遼: 全軍撤退！
    - `data` kind=4 value=50
    - `leave_parallel` 
  - **r6** battle_won(7) 그룹 3 — 그룹 넘김
    - `leave_parallel` 
  - **r7** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `data` kind=2 value=400
    - `caption`
      > 繳獲了黃金４００．
    - `set_flag` flag=72 clear=0
  - **r8** run(0) 그룹 4
    - `play_music` song=7
    - `narration`
      > 　張遼撤退，劉備和曹操聯軍打敗了呂布軍．
    - `data` kind=2 value=500
    - `caption`
      > 繳獲了黃金５００．
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 荀彧: 劉備，主公剛派使者來，說他的部隊已占領徐州，我們去徐州吧．
    - `goto_block` block=3
- **블록 2**: 전투; 레코드 9, 그룹 5; 대화 0(잡담 0); 맵: 전투 맵 12, 지도
  - 적군 명단: 14기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact
  - 목표 문구: 一、高順撤退．
  - r3 일기토
  - r3 레벨 +1: 張飛
  - r6 아이템: 馬鎧
  - r8 (run) 전투 끝
  - r8 (run) → 블록 3
  - 플래그 켬: {73}
  - 플래그 검사: {73}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12300
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、高順撤退．
    - `dialogue`
      > 高順: 可惡，這樣打下去贏不了，呂布將軍還沒有回話嗎？呂布是叫我去送死．
      > 關羽: 據說彭城由高順把守，我們不能落在曹操軍的後面．
    - `play_music` song=13
  - **r3** unit_contact(4) [張飛] 그룹 3* — 그룹 넘김
    - `dialogue`
      > 張飛: 城中大將，出來，我要一雪徐州之恥．
      > 高順: 張飛，我來與你單挑較量．
    - `duel` first=張飛 second=高順
    - `duel_begin` 
    - `dialogue`
      > 高順: 下馬受死．
      > 張飛: 與呂布狼狽為奸，不管是誰，我都要一槍刺死他．
    - `duel_action` person=張飛 action=1
    - `duel_action` person=張飛 action=1
    - `duel_action` person=高順 action=2
    - `dialogue`
      > 高順: 不行，實在打不過他．
    - `duel_action` person=高順 action=4
    - `duel_end` 
    - `add_levels` person=張飛 levels=1
    - `caption`
      > 張飛的等級上昇了．
    - `dialogue`
      > 高順: 媽的！撤退！
    - `leave_parallel` 
  - **r4** turn(9) 그룹 3
  - **r5** turn(9) 그룹 3
  - **r6** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=馬鎧
    - `set_flag` flag=73 clear=0
  - **r7** battle_won(7) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 高順: 可惡！撤退！
    - `leave_parallel` 
  - **r8** run(0) 그룹 4
    - `play_music` song=7
    - `narration`
      > 　高順撤退了，劉備和曹操聯軍打敗了．
    - `data` kind=2 value=500
    - `caption`
      > 繳獲了黃金５００．
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 郭嘉: 劉備，主公派來使者，說他的部隊已經占領了徐州，我們去徐州吧．
    - `goto_block` block=3
- **블록 3**: 전투 준비; 레코드 41, 그룹 6; 대화 39(잡담 35); 맵: 마을 4, 지도
  - 전투 설정: 턴 제한 45, 아군 출진 14명, 격파 대상 #4, 퇴각하면 패배 #0
  - 목표 문구: 與曹操就下一步研究． / 出征呂布駐守的下邳．
  - 질문 r39 (關羽): 예 답이면 8 명령 실행, 출진 확인 [battle_setup, leave_parallel]
  - **r0** run(0) 그룹 0
    - `load_map` map=8196
    - `set_previous_map` map=11 x=26 y=6
    - `play_music` song=5
    - `caption`
      > 徐州議事廳
    - `dialogue`
      > 曹操: 劉備，果然名不虛傳啊，你辛苦了．呂布好像逃到了下邳．
      > 劉備: 下邳？
      > 曹操: 你大概也知道吧，此城堅固，現苦無攻城良策．
    - `set_objective`
      > 與曹操就下一步研究．
  - **r1** talk(3) [關羽] 그룹 1*
    - `dialogue`
      > 關羽: 大哥，先向曹操報告一下吧．
  - **r2** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 大哥，還是徐州好呀，好像回到家似的．
  - **r3** talk(3) [荀彧] 그룹 1
    - `dialogue`
      > 荀彧: 下邳城特別難攻，假如呂布又逃到那裡，破城就難上加難了．
  - **r4** talk(3) [郭嘉] 그룹 1
    - `dialogue`
      > 郭嘉: 呂布逃進了下邳，我們差一點就抓到這條猛虎．
  - **r5** talk(3) [夏侯惇] 그룹 1
    - `dialogue`
      > 夏侯惇: 剩下的只是下邳了，呂布也該完蛋了．
  - **r6** talk(3) [夏侯淵] 그룹 1
    - `dialogue`
      > 夏侯淵: 呂布很快就會完蛋，這樣社會也能安寧些．
  - **r7** talk(3) [曹仁] 그룹 1
    - `dialogue`
      > 曹仁: 呂布在下邳城，這樣會難攻些．
  - **r8** talk(3) [曹洪] 그룹 1
    - `dialogue`
      > 曹洪: 即使攻破下邳，呂布一個人也很難對付，必須小心．
  - **r9** talk(3) [曹操] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 曹操: 劉備，該怎麼打呀？噢，來人是誰？
    - `dialogue`
      > 陳登: 劉備大人，我是陳登，是徐州的豪門之士．
      > 劉備: 以前在徐州議事廳見過面．
      > 陳登: 呂布占領徐州後，屈從呂布，現在想將呂布軍的事情稟報大人．
      > 曹操: 對了，陳登有話跟你說．你去聽他怎麼說．
    - `leave_parallel` 
  - **r10** talk(3) [關羽] 그룹 2*
    - `dialogue`
      > 關羽: 大哥，你聽陳登講．
  - **r11** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 呀，大哥，還是徐州好呀，像回到家鄉．
  - **r12** talk(3) [荀彧] 그룹 2
    - `dialogue`
      > 荀彧: 劉備，請聽陳登講．
  - **r13** talk(3) [郭嘉] 그룹 2
    - `dialogue`
      > 郭嘉: 呂布逃進了下邳城，我們差一點就抓住了這條猛虎．
  - **r14** talk(3) [夏侯惇] 그룹 2
    - `dialogue`
      > 夏侯惇: 只剩下邳了，呂布快完蛋了．
  - **r15** talk(3) [夏侯淵] 그룹 2
    - `dialogue`
      > 夏侯淵: 呂布馬上就完了，這樣也好安寧些．
  - **r16** talk(3) [曹仁] 그룹 2
    - `dialogue`
      > 曹仁: 呂布在下邳，這樣也許難攻些．
  - **r17** talk(3) [曹洪] 그룹 2
    - `dialogue`
      > 曹洪: 即使攻破下邳，但呂布一人也很難對付．
  - **r18** talk(3) [曹操] 그룹 2
    - `dialogue`
      > 曹操: 劉備，聽陳登講．
  - **r19** talk(3) [陳登] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 陳登: 其實我原是呂布的下屬，如果有人勸降順利，侯成﹑魏續﹑宋憲三人也許會倒戈獻城．
      > 陳登: 大概此三人都在下邳城外把守，如能與他們化敵為友，下邳城則很容易攻破．
    - `leave_parallel` 
  - **r20** talk(3) [關羽] 그룹 3*
    - `dialogue`
      > 關羽: 大哥，一定要勸降此三人．
  - **r21** talk(3) [張飛] 그룹 3
    - `dialogue`
      > 張飛: 遊說勸降不在行，勸降就由大哥來吧．
  - **r22** talk(3) [荀彧] 그룹 3
    - `dialogue`
      > 荀彧: 言之有理，陳登之言非常重要．
  - **r23** talk(3) [郭嘉] 그룹 3
    - `dialogue`
      > 郭嘉: 呂布逃進了下邳，差一點我們就捉到這頭猛虎．
  - **r24** talk(3) [陳登] 그룹 3
    - `dialogue`
      > 陳登: 劉備，一定要讓侯成﹑魏續﹑宋憲倒戈，如果成功，這場仗必勝無疑．
  - **r25** talk(3) [夏侯惇] 그룹 3
    - `dialogue`
      > 夏侯惇: 只剩下下邳了，呂布也快完蛋了．
  - **r26** talk(3) [夏侯淵] 그룹 3
    - `dialogue`
      > 夏侯淵: 呂布馬上就會完蛋，這樣這個社會也能安寧些．
  - **r27** talk(3) [曹仁] 그룹 3
    - `dialogue`
      > 曹仁: 呂布在下邳，這也許會使攻城變得難一點．
  - **r28** talk(3) [曹洪] 그룹 3
    - `dialogue`
      > 曹洪: 即使攻破了下邳，只呂布也很難對付啊．
  - **r29** talk(3) [曹操] 그룹 3 — 그룹 넘김
    - `dialogue`
      > 曹操: 劉備，依計而行吧，現在我們就去攻下邳，屆時劉備勸降侯成﹑魏續﹑宋憲三人，如能成功，下邳則很快得以攻克，劉備，看你的了．
    - `set_objective`
      > 出征呂布駐守的下邳．
    - `leave_parallel` 
  - **r30** talk(3) [張飛] 그룹 4*
    - `dialogue`
      > 張飛: 遊說不在行，有勞大哥辦了．
  - **r31** talk(3) [荀彧] 그룹 4
    - `dialogue`
      > 荀彧: 陳登說的非常重要．
  - **r32** talk(3) [郭嘉] 그룹 4
    - `dialogue`
      > 郭嘉: 下邳城四周有護城河，所以易守難攻，只要攻下城門吊橋，就好辦了．
  - **r33** talk(3) [陳登] 그룹 4
    - `dialogue`
      > 陳登: 劉備，請你一定要勸降侯成﹑魏續﹑宋憲，如能成功，則這場仗必勝無疑．
  - **r34** talk(3) [夏侯惇] 그룹 4
    - `dialogue`
      > 夏侯惇: 只剩下下邳了，呂布也快完蛋了．
  - **r35** talk(3) [夏侯淵] 그룹 4
    - `dialogue`
      > 夏侯淵: 呂布馬上就會完蛋，這樣這個社會也能安寧些．
  - **r36** talk(3) [曹仁] 그룹 4
    - `dialogue`
      > 曹仁: 呂布在下邳，這也許會使攻城困難一點．
  - **r37** talk(3) [曹洪] 그룹 4
    - `dialogue`
      > 曹洪: 即使攻破了下邳，只呂布也很難對付啊．
  - **r38** talk(3) [曹操] 그룹 4
    - `dialogue`
      > 曹操: 劉備，就看你的了．
  - **r39** talk(3) [關羽] 그룹 4 — 그룹 넘김
    - `dialogue`
      > 關羽: 出兵嗎？
    - `if_answer` answer=0 skip=8
    - `op_3d` value=0
    - `play_music` song=12
    - `dialogue`
      > 關羽: 列隊！
    - `battle_setup` 
    - `dialogue`
      > 關羽: 出兵！
      > 曹操: 好，時機來了，除掉呂布．
    - `leave_parallel` 
  - **r40** run(0) 그룹 5
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 曹操: 劉備看你的了，我們把部隊埋伏好，如果你勸降成功的話，那我們就一起攻進下邳．
- **블록 4**: 전투; 레코드 15, 그룹 6; 대화 0(잡담 0); 맵: 전투 맵 14, 지도
  - 적군 명단: 23기
  - 트리거: battle_won, turn, unit_at_cell, unit_contact
  - 목표 문구: 一、放吊橋． / 一、擊潰呂布． / 一、擊潰呂布． / 去下邳的議事廳． / 去下邳議事廳．
  - r4 일기토
  - r4 레벨 +1: 劉備
  - r5 일기토
  - r5 레벨 +1: 劉備
  - r6 일기토
  - r6 레벨 +1: 劉備
  - r9 (battle_won) 전투 끝
  - r9 (battle_won) → 블록 5
  - r10 일기토
  - r10 레벨 +1: 關羽
  - r11 아이템: 赤兔馬
  - r12 아이템: 方天畫戟
  - r13 (battle_won) 전투 끝
  - 플래그 켬: {17, 18, 19, 74, 164}
  - 플래그 검사: {17, 18, 19, 74, 164}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12302
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、放吊橋．
    - `dialogue`
      > 呂布: 哼，不管曹操和劉備如何進攻，這座城依然固若金湯．
      > 關羽: 大哥，你看這樣行嗎？如陳登所說，說服侯成﹑魏續﹑宋憲背叛呂布，讓他們放下吊橋．
      > 侯成: 原來呂布讓我們在城外廝殺，自己待在城裡，這樣，士兵也不聽話了，怎麼辦呢？
      > 魏續: 在這裡打敗仗的話，我們會被呂布砍頭的，這也好，可……
      > 宋憲: 呂布將軍對自己的女人和孩子挺好，卻不把我們當人看，他不值得我們追隨．
    - `play_music` song=16
  - **r3** turn(9) 그룹 3* — 그룹 넘김
    - `play_music` song=9
    - `set_map_chip` x=11 y=11 chip=2
    - `set_map_chip` x=11 y=12 chip=2
    - `set_map_chip` x=12 y=11 chip=2
    - `set_map_chip` x=12 y=12 chip=2
    - `set_map_chip` x=13 y=11 chip=2
    - `set_map_chip` x=13 y=12 chip=2
    - `caption`
      > 吊橋放下來了．
    - `dialogue`
      > 劉備: 怎麼啦？是吊橋降下來了嗎？
    - `join_battle` person=曹操
    - `join_battle` person=荀彧
    - `join_battle` person=郭嘉
    - `join_battle` person=夏侯惇
    - `join_battle` person=夏侯淵
    - `join_battle` person=曹仁
    - `join_battle` person=曹洪
    - `caption`
      > 曹操軍援兵出現．
    - `dialogue`
      > 荀彧: 主公，吊橋好像放下來了．
      > 曹操: 唉，可能劉備也成不了氣候，這點離間計也不會用，預先讓陳登潛入城內是正確的，好，必能活擒呂布．
    - `play_music` song=16
    - `set_objective`
      > 一、擊潰呂布．
    - `leave_parallel` 
  - **r4** unit_contact(4) [劉備] 그룹 3
    - `dialogue`
      > 侯成: 是劉備嗎？好哇，我跟你打．
      > 劉備: 侯成，聽我說．
    - `duel` first=劉備 second=侯成
    - `dialogue`
      > 劉備: 侯成，現在呂布已經孤立，軍心離散，就像你一樣．
      > 侯成: 胡說，我不會有二心的．
      > 劉備: 不要對自己撒謊，難道你甘心白白送死．
      > 侯成: 唉……
      > 劉備: 如果你看不透這點的話，就在這裡葬送自己好了．
      > 侯成: 我還沒在這個世上留名，還不能死．
      > 劉備: 那麼，能否幫我們放下下邳的吊橋？
      > 侯成: 明白了，那麼，你到吊橋前時我們就放下去，現在我回去著手準備．
    - `duel_action` person=侯成 action=4
    - `duel_end` 
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備的等級上昇了．
    - `set_flag` flag=17 clear=0
  - **r5** unit_contact(4) [劉備] 그룹 3
    - `duel` first=劉備 second=魏續
    - `dialogue`
      > 劉備: 魏續，呂布氣數已盡，不要再打無謂的仗了．
      > 魏續: 我等自以前就追隨呂布將軍，可是呂布只想著自己的家眷，對我等下屬毫無恩賜，現在我投靠你，這就去放吊橋．
    - `duel_action` person=魏續 action=4
    - `duel_end` 
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備的等級上昇了．
    - `set_flag` flag=18 clear=0
  - **r6** unit_contact(4) [劉備] 그룹 3
    - `duel` first=劉備 second=宋憲
    - `dialogue`
      > 宋憲: ……劉備，我們以前怎麼一直跟著，這樣一個人啊．
      > 劉備: 宋憲，現在覺醒也不遲．
      > 宋憲: 唉，好吧，我現在就投靠你們，劉備，我現在馬上回城去放吊橋．
    - `duel_action` person=宋憲 action=4
    - `duel_end` 
    - `add_levels` person=劉備 levels=1
    - `caption`
      > 劉備的等級上昇了．
    - `set_flag` flag=19 clear=0
  - **r7** turn(9) 그룹 3
    - `dialogue`
      > 呂布: 城外士兵為何慢吞吞的，讓他們加強進攻．
      > 侯成: 哪裡慢了？
      > 魏續: 是啊，讓前線部隊進攻敵人．
      > 宋憲: 敵人很強，曹操軍還整裝待發，這些呂布將軍是應該知道的呀，他怎麼這麼說，讓我們去送命呀．
  - **r8** unit_at_cell(6) [劉備] 그룹 3 — 그룹 넘김
    - `if_flags` 
    - `play_music` song=9
    - `set_map_chip` x=11 y=11 chip=2
    - `set_map_chip` x=11 y=12 chip=2
    - `set_map_chip` x=12 y=11 chip=2
    - `set_map_chip` x=12 y=12 chip=2
    - `set_map_chip` x=13 y=11 chip=2
    - `set_map_chip` x=13 y=12 chip=2
    - `caption`
      > 吊橋放下來了．
    - `dialogue`
      > 侯成: 劉備，快請入城．
      > 劉備: 這是侯成的聲音，是他幫我們放吊橋．
      > 呂布: 什麼？侯成﹑魏續﹑宋憲三人背叛了我，放了吊橋，這幾個無義之徒，我決不饒恕他們．
    - `join_battle` person=曹操
    - `join_battle` person=荀彧
    - `join_battle` person=郭嘉
    - `join_battle` person=夏侯惇
    - `join_battle` person=夏侯淵
    - `join_battle` person=曹仁
    - `join_battle` person=曹洪
    - `caption`
      > 出現了曹操軍援軍．
    - `dialogue`
      > 荀彧: 主公，吊橋好像放下來了．
      > 曹操: 看來劉備的離間計奏效了，好，全軍突擊，一定要活捉呂布．
    - `play_music` song=16
    - `set_objective`
      > 一、擊潰呂布．
    - `leave_parallel` 
    - `dialogue`
      > 劉備: 是嗎？真的不放吊橋就沒辦法進城嗎？要想辦法放下吊橋．
  - **r9** battle_won(7) 그룹 3
    - `narration`
      > 　此次戰鬥的勝利是除錯用的，程序有此斷點，遊戲玩到這裡就是有錯．
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 關羽: 我們進入下邳吧．
    - `set_objective`
      > 去下邳的議事廳．
    - `goto_block` block=5
  - **r10** unit_contact(4) [關羽] 그룹 4*
    - `dialogue`
      > 關羽: 張遼，快投降，呂布氣數已盡，你已為他盡力了．
      > 張遼: ……現在不必多言，舉起刀來．
    - `duel` first=關羽 second=張遼
    - `duel_begin` 
    - `dialogue`
      > 關羽: 殺呀！
      > 張遼: 殺呀！
    - `duel_action` person=關羽 action=8
    - `dialogue`
      > 張遼: 呼哧，不愧是關羽，好厲害，啊！
    - `duel_action` person=張遼 action=3
    - `duel_action` person=關羽 action=9
    - `duel_action` person=關羽 action=5
    - `dialogue`
      > 關羽: 還不是致死命的傷，殺死這個漢子有點可惜．
    - `duel_end` 
    - `add_levels` person=關羽 levels=1
    - `caption`
      > 關羽的等級上昇了．
  - **r11** unit_at_cell(6) [(any unit)] 그룹 4
    - `if_flags` 
    - `add_item` item=赤兔馬
    - `set_flag` flag=74 clear=0
  - **r12** unit_at_cell(6) [(any unit)] 그룹 4
    - `if_flags` 
    - `add_item` item=方天畫戟
    - `set_flag` flag=164 clear=0
  - **r13** battle_won(7) 그룹 4 — 그룹 넘김
    - `dialogue`
      > 呂布: 唉，完了，
    - `play_music` song=7
    - `narration`
      > 　呂布被捉，劉備和曹操聯軍擊破了呂布軍．
    - `data` kind=2 value=500
    - `caption`
      > 繳獲了黃金５００！
    - `battle_end` next_map=4096
    - `leave_parallel` 
  - **r14** run(0) 그룹 5
    - `load_map` map=4096
    - `play_music` song=5
    - `dialogue`
      > 關羽: 那就進下邳城吧．
    - `set_objective`
      > 去下邳議事廳．
- **블록 5**: 이야기; 레코드 18, 그룹 6; 대화 12(잡담 10); 맵: 마을 2, 지도
  - 트리거: condition, location
  - 목표 문구: 決定對呂布的處置．
  - 선택지 r13: 「寬恕呂布」 r14 → 진행; 「不寬恕呂布」 r15 → 진행
  - r16 소속: 張遼 → 군 1(이탈)
  - **r0** location(2) 그룹 0
    - `load_map` map=8194
    - `play_music` song=5
    - `caption`
      > 下邳議事廳
    - `dialogue`
      > 曹操: 劉備，現在正要決定對呂布如何處置．
    - `set_objective`
      > 決定對呂布的處置．
  - **r1** talk(3) [關羽] 그룹 1*
    - `dialogue`
      > 關羽: 毫無同情的餘地，應馬上處死他．
  - **r2** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 快點把他砍頭吧，要不然我來行刑．
  - **r3** talk(3) [荀彧] 그룹 1
    - `dialogue`
      > 荀彧: 留下呂布的命將留下後患．
  - **r4** talk(3) [郭嘉] 그룹 1
    - `dialogue`
      > 郭嘉: 可是，呂布此人相當了得，只他一人就讓我們吃了這麼多苦頭．
  - **r5** talk(3) [呂布] 그룹 1
    - `dialogue`
      > 呂布: 劉備，在戰場上我還不會輸的，作為武將，輔助主公，天下可定也．
  - **r6** talk(3) [曹操] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 曹操: 劉備，你想一想，對他如何處置好？
    - `leave_parallel` 
  - **r7** talk(3) [關羽] 그룹 2*
    - `dialogue`
      > 關羽: 毫無同情的餘地，應馬上處死他．
  - **r8** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 快點砍下他的腦袋．
  - **r9** talk(3) [荀彧] 그룹 2
    - `dialogue`
      > 荀彧: 留下呂布的命將留下後患．
  - **r10** talk(3) [郭嘉] 그룹 2
    - `dialogue`
      > 郭嘉: 呂布確實很英勇，但考慮到對主公好，還是……
  - **r11** talk(3) [曹操] 그룹 2
    - `dialogue`
      > 曹操: 劉備，怎麼辦好呢？
  - **r12** talk(3) [呂布] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 呂布: 劉備，你忘了我們在徐州曾一起相處過嗎？請你無論如何保住我的命啊！
      > 曹操: 劉備，你看怎麼辦？把你的看法講給我聽．
    - `leave_parallel` 
  - **r13** condition(1) 그룹 3* — 그룹 넘김
    - `choice`
      > 寬恕呂布
      > 不寬恕呂布
  - **r14** run(0) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 劉備: 呂布確實反叛無常，但其所處境遇也有令人同情之處，而且，殺掉此人很可惜呀．
      > 呂布: 啊！對！是這樣沒錯！劉備！謝謝你！曹操，饒我一命吧！
      > 曹操: 唉，劉備，你那麼認為嗎？我卻不那麼認為，此人不可救藥，先殺義父投奔董卓，接著又背叛了董卓，還殺了他，我不想步其後塵，呂布，你死定了．
      > 呂布: 等一下，我不想死！
      > 張飛: 大哥，這次我也贊成曹操的意見，呂布，我來給你行刑．
    - `leave_parallel` 
  - **r15** run(0) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 劉備: 呂布是個容易背叛之徒，也背叛了董卓，即便現在曹操你想留住他，不久他也將背叛你．
      > 曹操: 唉，決定了，呂布處以死刑，拉下去砍啦．
      > 呂布: 等一下，我不想死．
      > 張飛: 死到臨頭了還這副樣子，我來行刑．
    - `leave_parallel` 
  - **r16** run(0) 그룹 4
    - `dialogue`
      > 呂布: 喂，張飛，住手！
    - `dialogue`
      > 呂布: 哎呀！
    - `dialogue`
      > 曹操: 好！帶下一個．
    - `dialogue`
      > 曹操: 張遼，如果不追隨呂布小兒的話，可以留住你的命，怎麼樣？今後跟隨我，來補償你以前的過錯．
      > 張遼: 哼，我以前的過錯就是沒親手殺死你，現在既然已不能實現，活著也沒意思，快殺我吧．
      > 曹操: 誰聽你胡言亂語．
    - `dialogue`
      > 關羽: 刀下留人！
      > 張遼: 關羽……
      > 關羽: 此人忠義，雖有愚魯之處，但實為難得人才，願以關羽自身性命相保．
      > 曹操: 我是開玩笑，難道我看不出？張遼，你自由了，隨你便，去哪裡都行．
      > 張遼: 您說什麼？您寬恕我了嗎？真有氣度！呂布卻……，我過去錯了，曹操，不，曹操仁公，你寬大為懷，我感激不盡，請讓我在你麾下效勞．
      > 曹操: 你是說要跟隨我，張遼，我能得到你這樣的下屬，也是我的福氣．
      > 張遼: 多謝！
    - `set_allegiance` person=張遼 army=1
    - `dialogue`
      > 曹操: 那麼，劉備，戰場也打掃完了，回許昌吧．
      > 劉備: 好吧．
  - **r17** run(0) 그룹 5
    - `load_map` map=4096
    - `dialogue`
      > 關羽: 大哥，那就回許昌吧．

### 장면 4

제목: 第一章　徐州攻防戰

- **블록 0**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 마을 13
  - 목표 문구: 與關羽等討論今後之事．
  - r0 삽화 10
  - **r0** run(0) 그룹 0
    - `play_music` song=0
    - `chapter_title` key=第一章　徐州攻防戰
    - `title`
      > 第一章　徐州攻防戰
    - `show_picture` picture=10 variant=0
    - `narration`
      > 　呂布被殺，曹操顧忌的強大敵人沒有了，曹操開始隨心所欲地操縱朝廷．一天，曹操勸獻帝去打獵，在獵場，曹操冷不防奪過獻帝手中的弓箭，並射中了獵物．
    - `narration`
      > 　百官以為獵物是獻帝射中的，曹操為顯示是自己射的，從獻帝手中奪去了獵物，這一舉動使皇帝丟盡了面子，曹操這一蔑視獻帝的舉動，招致了忠臣們的反感．
    - `load_map` map=8205
    - `set_previous_map` map=14 x=16 y=7
    - `play_music` song=5
    - `caption`
      > 許昌劉備官邸
    - `set_objective`
      > 與關羽等討論今後之事．
- **블록 1**: 이야기; 레코드 6, 그룹 2; 대화 5(잡담 4); 맵: 마을 5
  - 트리거: location
  - 목표 문구: 去議事廳見曹操． / 與曹操談話．
  - **r0** talk(3) [關羽] 그룹 0*
    - `dialogue`
      > 關羽: 我還以為呂布一死，害聖上的人就沒有了，我豈能容忍曹操這樣對聖上．
  - **r1** talk(3) [張飛] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 張飛: 啊，大哥，你們起來得真早呀，嗯，大哥，好像有人來了．
    - `dialogue`
      > 使者: 劉備，對不起．
    - `leave_parallel` 
  - **r2** talk(3) [關羽] 그룹 1*
    - `dialogue`
      > 關羽: 你是曹操派來的使者嗎？有什麼事嗎？
  - **r3** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 不行，我還沒睡醒呢，大哥，什麼都別聽．
  - **r4** talk(3) [使者] 그룹 1
    - `dialogue`
      > 使者: 劉備，曹操在議事廳，請你馬上去議事廳．
    - `set_objective`
      > 去議事廳見曹操．
  - **r5** location(2) 그룹 1 — 그룹 넘김
    - `load_map` map=8197
    - `caption`
      > 許昌議事廳
    - `dialogue`
      > 曹操: 噢，劉備，我一直在等你．
    - `set_objective`
      > 與曹操談話．
    - `leave_parallel` 
- **블록 2**: 이야기; 레코드 14, 그룹 2; 대화 13(잡담 12); 맵: 마을 1
  - 트리거: location
  - 목표 문구: 去宮殿見獻帝．
  - **r0** talk(3) [荀彧] 그룹 0*
    - `dialogue`
      > 荀彧: 劉備，早好，休息得好嗎？
  - **r1** talk(3) [郭嘉] 그룹 0
    - `dialogue`
      > 郭嘉: 我去對他說．
  - **r2** talk(3) [夏侯惇] 그룹 0
    - `dialogue`
      > 夏侯惇: 我去對他說吧．
  - **r3** talk(3) [夏侯淵] 그룹 0
    - `dialogue`
      > 夏侯淵: 我去對他說吧．
  - **r4** talk(3) [曹仁] 그룹 0
    - `dialogue`
      > 曹仁: 我去對他說吧．
  - **r5** talk(3) [曹洪] 그룹 0
    - `dialogue`
      > 曹洪: 我去對他說吧．
  - **r6** talk(3) [曹操] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 曹操: 劉備，一大早就叫你來，對不起，其實今天我想晉見聖上，在與呂布作戰中你表現得很英勇，我想把你引薦給聖上，你去不去？
      > 劉備: 那當然要去．
      > 曹操: 那就馬上走吧，去聖上起居的宮殿，我先進去請奏聖上．
    - `set_objective`
      > 去宮殿見獻帝．
    - `leave_parallel` 
  - **r7** talk(3) [荀彧] 그룹 1*
    - `dialogue`
      > 荀彧: 請早點回來．
  - **r8** talk(3) [郭嘉] 그룹 1
    - `dialogue`
      > 郭嘉: 在聖上面前要注意禮節．
  - **r9** talk(3) [夏侯惇] 그룹 1
    - `dialogue`
      > 夏侯惇: 晉見聖上是頭一次吧，要注意禮節．
  - **r10** talk(3) [夏侯淵] 그룹 1
    - `dialogue`
      > 夏侯淵: 快進宮殿吧．
  - **r11** talk(3) [曹仁] 그룹 1
    - `dialogue`
      > 曹仁: 快進宮殿吧．
  - **r12** talk(3) [曹洪] 그룹 1
    - `dialogue`
      > 曹洪: 快進宮殿吧．
  - **r13** location(2) 그룹 1 — 그룹 넘김
    - `load_map` map=8193
    - `play_music` song=8
    - `caption`
      > 許昌宮殿
    - `dialogue`
      > 曹操: 陛下，他就是劉備．
      > 獻帝: 噢，劉備，平身．
    - `dialogue`
      > 董承: 劉備，我是皇帝內臣，叫董承，初次見面，請多關照．
    - `leave_parallel` 
- **블록 3**: 이야기; 레코드 12, 그룹 3; 대화 11(잡담 9); 맵: 마을 13
  - 트리거: location
  - 목표 문구: 在官邸休息． / 去皇宮見獻帝．
  - **r0** talk(3) [曹操] 그룹 0*
    - `dialogue`
      > 曹操: 劉備，快拜見陛下．
  - **r1** talk(3) [董承] 그룹 0
    - `dialogue`
      > 董承: 劉備，我心裡一直盼望著能見到你．
  - **r2** talk(3) [宮吏  ] 그룹 0
    - `dialogue`
      > 宮吏  : 陛下座前，請行大禮．
  - **r3** talk(3) [獻帝] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 獻帝: 噢，你就是劉備吧，聽說你和曹操一起討伐了呂布，謝謝了，……對了，你也姓劉？
      > 劉備: 是．
      > 獻帝: 朕姓劉，名劉協，你與朕有什麼關係嗎？你的祖先是誰？
      > 劉備: 臣聽家母講，臣的祖先是皇帝．
      > 獻帝: 你說什麼？是真的嗎？來人，取家譜查查．
    - `leave_parallel` 
  - **r4** talk(3) [曹操] 그룹 1*
    - `dialogue`
      > 曹操: 沒想到劉備是漢室宗族．
  - **r5** talk(3) [董承] 그룹 1
    - `dialogue`
      > 董承: 劉備若是漢室宗族，對皇帝也是一件喜事，我也很高興．
  - **r6** talk(3) [獻帝] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 獻帝: 如果劉備與朕是同宗的話，那可太好了．
    - `dialogue`
      > 宮吏  : 剛查過，劉備是陛下的叔叔輩．
      > 獻帝: 是這樣啊，那麼，劉備，你是朕的叔叔了，既然如此，朕叫你皇叔，可以嗎？皇叔．
      > 劉備: 這對我來說實在是無上殊榮．
    - `set_objective`
      > 在官邸休息．
    - `leave_parallel` 
  - **r7** talk(3) [曹操] 그룹 2*
    - `dialogue`
      > 曹操: 劉備，恭喜你，這樣你以後謁見陛下就容易了．
  - **r8** talk(3) [董承] 그룹 2
    - `dialogue`
      > 董承: 劉備，不，劉皇叔，以後就靠你了．
  - **r9** talk(3) [宮吏  ] 그룹 2
    - `dialogue`
      > 宮吏  : 劉皇叔，好響亮啊．
  - **r10** talk(3) [獻帝] 그룹 2
    - `dialogue`
      > 獻帝: 你可以退下了，剛打完仗，在家裡好好休息吧．
  - **r11** location(2) 그룹 2 — 그룹 넘김
    - `load_map` map=8205
    - `play_music` song=5
    - `dialogue`
      > 關羽: 大哥，你回來了．
    - `dialogue`
      > 劉備: 剛才我晉見了聖上．
      > 張飛: 噢，大哥，恭喜你，都說了些什麼？
      > 劉備: ……
      > 關羽: 嗯，大哥，好像是侍從．
    - `dialogue`
      > 宮吏  : 劉皇叔，我是從皇宮來的．
    - `set_objective`
      > 去皇宮見獻帝．
    - `leave_parallel` 
- **블록 4**: 이야기; 레코드 4, 그룹 1; 대화 3(잡담 3); 맵: 마을 1
  - 트리거: location
  - **r0** talk(3) [關羽] 그룹 0*
    - `dialogue`
      > 關羽: 大哥，皇宮使者又來了．
  - **r1** talk(3) [張飛] 그룹 0
    - `dialogue`
      > 張飛: 又來了，大哥，我接他嫌麻煩．
  - **r2** talk(3) [宮吏  ] 그룹 0
    - `dialogue`
      > 宮吏  : 皇叔，聖上有旨，請您再進皇宮一趟．
  - **r3** location(2) 그룹 0 — 그룹 넘김
    - `load_map` map=8193
    - `play_music` song=8
    - `dialogue`
      > 獻帝: 噢，皇叔，朕一直等你．
    - `leave_parallel` 
- **블록 5**: 이야기; 레코드 6, 그룹 3; 대화 5(잡담 3); 맵: 마을 13
  - 트리거: location
  - 목표 문구: 在官邸休息．
  - **r0** talk(3) [宮吏  ] 그룹 0*
    - `dialogue`
      > 宮吏  : 皇叔，請您來好多次，實在辛苦了．
  - **r1** talk(3) [宮吏  ] 그룹 0
    - `dialogue`
      > 宮吏  : 近來聖上非常疲憊，好像有什麼不順心的事．
  - **r2** talk(3) [獻帝] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 獻帝: 噢，皇叔，經常叫你來，對不起．
      > 劉備: 哪裡？只要陛下叫我來我就來，有什麼事嗎？
      > 獻帝: 嗯，這個嘛，其他人退下．
    - `leave_parallel` 
  - **r3** talk(3) [獻帝] 그룹 1
    - `dialogue`
      > 劉備: 是什麼事？
      > 獻帝: ……皇叔，我很相信你，所以賜給你這條玉帶，你拿回家後仔細看一下，就這件事情．
      > 劉備: ……謝陛下，臣小心收好，那麼臣告辭了．
    - `set_objective`
      > 在官邸休息．
  - **r4** talk(3) [獻帝] 그룹 2*
    - `dialogue`
      > 獻帝: 皇叔，現在你已經是我最大的依靠，拜託你了．
  - **r5** location(2) 그룹 2 — 그룹 넘김
    - `load_map` map=8205
    - `play_music` song=5
    - `dialogue`
      > 關羽: 兄長，你回來了．
    - `leave_parallel` 
- **블록 6**: 이야기; 레코드 5, 그룹 2; 대화 4(잡담 2); 맵: 마을 8
  - 트리거: location
  - 목표 문구: 在許昌城內散步． / 在許昌城內散步． / 去曹操官邸見曹操．
  - **r0** talk(3) [關羽] 그룹 0* — 그룹 넘김
    - `dialogue`
      > 關羽: 大哥，聖上有什麼事？
      > 劉備: 沒什麼？只是賜給我這條玉帶．
      > 關羽: 奇怪，專程叫去只為一條玉帶．
    - `set_objective`
      > 在許昌城內散步．
    - `leave_parallel` 
  - **r1** talk(3) [張飛] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 張飛: 大哥，陛下有什麼事？
      > 劉備: 沒什麼？只是賜給我這條玉帶．
      > 張飛: 怎麼搞得嘛，要是沒有別的事情，賜條玉帶可以叫剛才的使者帶來．
    - `set_objective`
      > 在許昌城內散步．
    - `leave_parallel` 
  - **r2** talk(3) [關羽] 그룹 1*
    - `dialogue`
      > 關羽: 大哥，不要想那麼多，不如到外面轉轉，散散心．
  - **r3** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 大哥，可以繫上那條玉帶，難得的御賜玉帶呀．
  - **r4** location(2) 그룹 1 — 그룹 넘김
    - `load_map` map=8200
    - `set_objective`
      > 去曹操官邸見曹操．
    - `leave_parallel` 
- **블록 7**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0)
  - **r0** run(0) 그룹 0
    - `dialogue`
      > 許褚: 劉備，您在這裡呀，我乃曹操的屬下許褚，主公想見您，請您去主公的官邸，就在您官邸的旁邊．
- **블록 8**: 이야기; 레코드 18, 그룹 7; 대화 1(잡담 1); 맵: 마을 12, 마을 13, 마을 18
  - 트리거: condition, location
  - 목표 문구: 回到自己的官邸． / 與關羽等談關於今後的事．
  - 선택지 r1: 「讓」 r2 → 진행; 「不讓」 r3 → 진행
  - 선택지 r4: 「讓」 r5 → 진행; 「不讓」 r6 → 진행
  - 선택지 r8: 「自己」 r9 → 진행; 「曹操」 r10 → 진행; 「袁紹」 r11 → 다시 물음; 「袁術」 r12 → 다시 물음; 「公孫瓚」 r13 → 다시 물음; 「不知道」 r14 → 진행
  - 플래그 켬: {20, 21}
  - 플래그 끔: {20}
  - 플래그 검사: {20, 21}
  - **r0** location(2) 그룹 0
    - `load_map` map=8210
    - `caption`
      > 許昌曹操官邸
    - `dialogue`
      > 曹操: 劉備，你來得正好．
    - `dialogue`
      > 曹操: 我叫你來是因為聽了些傳言．
      > 劉備: 傳言？
      > 曹操: 好像你從聖上那裡得到了一條玉帶，是不是你身上繫的這條？果真有這回事嗎？
      > 劉備: 對，確有此事．
      > 曹操: 能否讓我看一下？
      > 劉備: 請看．
      > 曹操: 嗯，劉備，怎麼樣啊？這條玉帶可否給我？
  - **r1** condition(1) 그룹 1* — 그룹 넘김
    - `choice`
      > 讓
      > 不讓
  - **r2** run(0) 그룹 1 — 그룹 넘김
    - `dialogue`
      > 劉備: 好，玉帶就送給你吧．
      > 曹操: 不不，開玩笑，這可是御賜的東西．不過我還是想要，劉備，此話當真？真要把玉帶讓給我嗎？
    - `leave_parallel` 
  - **r3** run(0) 그룹 1 — 그룹 넘김
    - `dialogue`
      > 劉備: 啊，這個，因為這是御賜的東西……
      > 曹操: 劉備，別這麼說，是不是肯把這條玉帶讓給我？
    - `leave_parallel` 
  - **r4** condition(1) 그룹 2* — 그룹 넘김
    - `choice`
      > 讓
      > 不讓
  - **r5** run(0) 그룹 2 — 그룹 넘김
    - `dialogue`
      > 劉備: 既然你如此想要，就送你了．
      > 曹操: 真的嗎？那我就不客氣了．
    - `set_flag` flag=20 clear=0
    - `leave_parallel` 
  - **r6** run(0) 그룹 2 — 그룹 넘김
    - `dialogue`
      > 劉備: 對不起，盡管你想要，可是……
      > 曹操: 呀，不要介意，我是開玩笑，我想看看你為難的表情．
    - `leave_parallel` 
  - **r7** run(0) 그룹 3
    - `dialogue`
      > 曹操: 那麼，既然好不容易請你來一趟，一起喝點酒吧．
    - `load_map` map=8204
    - `set_previous_map` map=14 x=12 y=5
    - `play_music` song=1
    - `caption`
      > 庭院
    - `dialogue`
      > 曹操: 劉備，這邊請．
      > 劉備: 好，謝謝．
    - `narration`
      > 　劉備盡管感到與曹操說話很危險，但還是決定與曹操一起飲酒，喝了一會以後……
    - `dialogue`
      > 曹操: 劉備，說起當世英雄，該推誰呢？
      > 劉備: 這個問題有些突然．
      > 曹操: 偌大的世界不會連一個英雄都沒有，你見識過各種各樣的人，難道其中就沒有具備英雄素質的人？或者是……
      > 劉備: ……
      > 曹操: 回答我，劉備，你覺得誰是英雄？
  - **r8** condition(1) 그룹 4* — 그룹 넘김
    - `choice`
      > 自己
      > 曹操
      > 袁紹
      > 袁術
      > 公孫瓚
      > 不知道
  - **r9** run(0) 그룹 4 — 그룹 넘김
    - `dialogue`
      > 曹操: 哼哼哼！對，劉備有英雄的素質，正因為如此，對他不能掉以輕心，否則後患無窮．
    - `set_flag` flag=21 clear=0
    - `leave_parallel` 
  - **r10** run(0) 그룹 4 — 그룹 넘김
    - `dialogue`
      > 曹操: 哼哼哼！哈哈哈！你那麼認為，我也那麼認為，是這樣啊，你是這麼想的啊，其實，我還覺得你劉備同樣是英雄，對，和我一樣是英雄．
      > 劉備: 你說什麼呀，我可不是什麼英雄．
      > 曹操: 你覺得自己是凡夫俗子，我能和你交往嗎？劉備，我可怕你呀．
    - `set_flag` flag=21 clear=0
    - `leave_parallel` 
  - **r11** run(0) 그룹 4
    - `dialogue`
      > 曹操: 袁紹嘛，的確名門出身，部下又出類拔萃，但袁紹自己優柔寡斷，這種人又沒什麼威信，談不上是英雄．
  - **r12** run(0) 그룹 4
    - `dialogue`
      > 曹操: 袁術嘛，他只考慮自己的利益，不過是蠢豬，我不久就要消滅他，你說袁術是英雄？不要撒謊．
  - **r13** run(0) 그룹 4
    - `dialogue`
      > 曹操: 公孫瓚嘛，劉備你以前和他交情很好，這樣可能對你不太好，但這個傢伙對形勢過於疏忽，不是能駕御這個亂世的人．
  - **r14** run(0) 그룹 4 — 그룹 넘김
    - `dialogue`
      > 曹操: 你是說當世沒有英雄吧，我認為不對，當世之英雄是你我，至少我這樣認為．
      > 劉備: 這？不要開玩笑．
      > 曹操: 哈哈！這是玩笑嗎？是這樣沒錯．
    - `leave_parallel` 
  - **r15** run(0) 그룹 5
    - `dialogue`
      > 劉備: ……
    - `if_flags` 
    - `dialogue`
      > 曹操: 今天很高興，什麼時候我二人再喝個通宵．
      > 劉備: 那麼我告辭了．
    - `if_flags` 
    - `dialogue`
      > 曹操: 今天很高興，這條玉帶我就收起來了．
      > 劉備: 那麼我告辭了．
    - `set_flag` flag=20 clear=1
    - `if_flags` 
    - `dialogue`
      > 曹操: 啊，今天很高興，這條玉帶我就收起來了．
      > 劉備: 那麼我告辭了．
    - `play_music` song=5
    - `set_objective`
      > 回到自己的官邸．
  - **r16** talk(3) [曹操] 그룹 6*
    - `dialogue`
      > 曹操: 你請回吧，慢走．
  - **r17** location(2) 그룹 6 — 그룹 넘김
    - `load_map` map=8205
    - `dialogue`
      > 關羽: 大哥，你回來了，聽說你去了曹操那裡，沒事吧．
    - `set_objective`
      > 與關羽等談關於今後的事．
    - `leave_parallel` 
- **블록 9**: 이야기; 레코드 14, 그룹 6; 대화 9(잡담 6); 맵: 마을 5
  - 트리거: condition, location
  - 목표 문구: 請求曹操准許離開．
  - r0 게임 오버
  - 선택지 r6: 「讓他看」 r7 → 진행; 「不讓他看」 r8 → 다시 물음
  - 플래그 검사: {20}
  - **r0** run(0) 그룹 0
    - `if_flags` 
    - `play_music` song=11
    - `dialogue`
      > 夏侯惇: 劉備，你要死在我刀下．
      > 關羽: 大哥，危險．
      > 張飛: 啊！大哥！
    - `dialogue`
      > 劉備: 哇！
    - `play_music` song=4
    - `dialogue`
      > 許褚: 在玉帶發現了密書，上面寫著殺死曹操．．
      > 夏侯惇: 所以我們才先發制人的．
      > 曹仁: 這叫自作自受，主公早已把他視作危險人物，他卻不知道，還口吐狂言，以致有這樣的下場．
    - `narration`
      > 　劉備被殺了，劉備重振漢室聲威的夢想也同時破滅了．
    - `game_over` 
  - **r1** talk(3) [張飛] 그룹 1*
    - `dialogue`
      > 張飛: 大哥，在曹操那裡都說了些什麼？我擔心曹操耍什麼陰謀．
  - **r2** talk(3) [關羽] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 關羽: 兄長，你要小心些，曹操那裡可不能去．好像有人來了．
    - `dialogue`
      > 董承: 劉皇叔，失禮了，您忘了嗎？我是剛才與聖上在一起的董承．
    - `leave_parallel` 
  - **r3** talk(3) [關羽] 그룹 2*
    - `dialogue`
      > 關羽: 原來是董承大人，有什麼事？
  - **r4** talk(3) [張飛] 그룹 2
    - `dialogue`
      > 張飛: 大哥，去陪客人了．
  - **r5** talk(3) [董承] 그룹 2 — 그룹 넘김
    - `dialogue`
      > 董承: 突然造訪，對不起，皇叔是否得到一條陛下御賜的玉帶，可否讓我看一下？
    - `leave_parallel` 
  - **r6** condition(1) 그룹 3* — 그룹 넘김
    - `choice`
      > 讓他看
      > 不讓他看
  - **r7** run(0) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 董承: 噢，確實是玉帶，其實我也同樣得到一條玉帶，而且這條玉帶實際上是……
    - `narration`
      > 　董承用劍割開玉帶，裡面掉出了一張紙片．
    - `dialogue`
      > 劉備: 啊呀！裡面有紙片！這是什麼？寫的是血書，上面寫著殺死曹操．．
      > 董承: 對，這是聖上用血寫的．真可歎呀！
      > 劉備: 如此說來，聖上好像下了決心了．
      > 董承: 是的，曹操最初還裝成忠臣的樣子，可是最近其言行好像自己是皇帝似的．
      > 董承: 他經常不把聖上當回事，聖上是流著眼淚賜我這條玉帶的，我為報答陛下以前對我的恩典，策劃討伐曹操．
      > 董承: 皇叔，請你也參加吧．如果你參加，我們就更有信心了．我求你．
      > 劉備: 董承，我也是聖上的臣子，我參加．
      > 董承: 噢，多謝了，那我去聯繫別的志士．
    - `leave_parallel` 
  - **r8** run(0) 그룹 3
    - `dialogue`
      > 董承: 皇叔，不要隱瞞了，玉帶的事我聽說了，來，交給我．
  - **r9** talk(3) [張飛] 그룹 4*
    - `dialogue`
      > 張飛: 好哇，我聽到你們剛才說的話了，這才是我的大哥，太好了！
  - **r10** talk(3) [關羽] 그룹 4 — 그룹 넘김
    - `dialogue`
      > 關羽: 兄長，我和張飛都很高興，看來不管在什麼時候都有忠臣呀！但我們待在這裡總被曹操盯著，實在難以倒戈，現在最好研究一下離開這裡，去徐州商量一下舉兵起事的計畫．
      > 劉備: 好啊，那我馬上去徐州，可是得有曹操的准許，好，我去見曹操．
    - `set_objective`
      > 請求曹操准許離開．
    - `leave_parallel` 
  - **r11** talk(3) [張飛] 그룹 5*
    - `dialogue`
      > 張飛: 如果那樣決定了的話，我們就馬上返回徐州吧．
  - **r12** talk(3) [關羽] 그룹 5
    - `dialogue`
      > 關羽: 注意千萬別被他們發現，曹操可是個狡滑的傢伙．
  - **r13** location(2) 그룹 5 — 그룹 넘김
    - `load_map` map=8197
    - `dialogue`
      > 曹操: 劉備，你來得正好，我有話要對你說．
      > 劉備: 對我說？
      > 劉備: （什麼事呢？不會是那個計畫吧，怎麼會呢？）
      > 曹操: 聽滿寵說吧．
    - `leave_parallel` 
- **블록 10**: 이야기; 레코드 17, 그룹 3; 대화 12(잡담 11); 맵: 마을 13
  - 트리거: condition, location
  - 목표 문구: 為討伐袁術進軍廣陵． / 去皇宮見獻帝．
  - 선택지 r6: 「為了討伐袁紹想出征」 r7 → 다시 물음; 「為討伐袁術想出征」 r8 → 진행; 「想拜謁公孫瓚的墓碑」 r9 → 다시 물음
  - **r0** talk(3) [曹操] 그룹 0*
    - `dialogue`
      > 曹操: 劉備，詳細情況你問滿寵吧．
  - **r1** talk(3) [夏侯惇] 그룹 0
    - `dialogue`
      > 夏侯惇: 聽滿寵講．
  - **r2** talk(3) [夏侯淵] 그룹 0
    - `dialogue`
      > 夏侯淵: 聽滿寵講．
  - **r3** talk(3) [曹仁] 그룹 0
    - `dialogue`
      > 曹仁: 聽滿寵講．
  - **r4** talk(3) [曹洪] 그룹 0
    - `dialogue`
      > 曹洪: 聽滿寵講．
  - **r5** talk(3) [滿寵] 그룹 0 — 그룹 넘김
    - `dialogue`
      > 劉備: 滿寵，你想說什麼？
      > 滿寵: 對您可能是個悲傷的消息．
      > 劉備: ……（該不是那個計畫吧？）
      > 滿寵: 公孫瓚被袁紹消滅了．
      > 劉備: 什麼？公孫瓚？
      > 滿寵: 是的，袁紹消滅了公孫瓚，建立一個強大的領地．
      > 劉備: 是嗎？
      > 滿寵: 還有，據說袁術聽到這個消息後，為保住自己，正趕向袁紹所在的鄴城，如果袁紹和袁術攜手起來，就誰也不能戰勝他們．
      > 劉備: ……（對，利用這句話好擺脫曹操．）
    - `dialogue`
      > 劉備: 曹操，我有一個請求……
      > 曹操: 什麼請求？
    - `leave_parallel` 
  - **r6** condition(1) 그룹 1*
    - `choice`
      > 為了討伐袁紹想出征
      > 為討伐袁術想出征
      > 想拜謁公孫瓚的墓碑
  - **r7** run(0) 그룹 1
    - `dialogue`
      > 劉備: 不能任袁紹這樣驕橫跋扈，我想出征討伐袁紹，請求您批准我討伐袁紹．
      > 曹操: 是啊…………不過，現在袁紹的實力大增，以你手裡的兵力不能取勝，因此不能讓你出征．最近我要和袁紹有個了斷，劉備，到那時你再出力吧
      > 劉備: ……
  - **r8** run(0) 그룹 1 — 그룹 넘김
    - `dialogue`
      > 劉備: 剛才滿寵說袁術已經動身了，請允許我討伐袁術．
      > 曹操: 劉備，你要出征嗎？
      > 劉備: 這樣既可阻止袁紹與袁術會合，又可為公孫瓚報仇．
      > 曹操: 好．……嗯，準戰．
      > 劉備: 那我馬上去作出征準備．
    - `dialogue`
      > 滿寵: 劉備，聽說袁術正在廣陵駐紮．
      > 劉備: 在廣陵，我知道了，那我告辭了．
      > 曹操: 祝你凱旋回來．
    - `set_objective`
      > 為討伐袁術進軍廣陵．
    - `leave_parallel` 
  - **r9** run(0) 그룹 1
    - `dialogue`
      > 劉備: 以前公孫瓚十分照顧我，真遺憾，現在已沒機會報答他的恩情了，我想至少該去北平拜謁一下他的陵墓．
      > 曹操: 這是你的真心話，北平現在已是袁紹的領地了，去那裡太危險，打消這個念頭吧．
      > 劉備: ……
  - **r10** talk(3) [曹操] 그룹 2*
    - `dialogue`
      > 曹操: 要徹底打垮袁術！
  - **r11** talk(3) [夏侯惇] 그룹 2
    - `dialogue`
      > 夏侯惇: 劉備，你是為什麼投奔到這裡來的？
  - **r12** talk(3) [夏侯淵] 그룹 2
    - `dialogue`
      > 夏侯淵: 區區袁術小兒，根本用不著我出征．
  - **r13** talk(3) [曹仁] 그룹 2
    - `dialogue`
      > 曹仁: 不可大意，因為不知道會出現什麼事情的．
  - **r14** talk(3) [曹洪] 그룹 2
    - `dialogue`
      > 曹洪: 袁術是個自封為皇帝的假皇帝，劉備，該殺死這個假皇帝．
  - **r15** talk(3) [滿寵] 그룹 2
    - `dialogue`
      > 滿寵: 聽說袁術在廣陵，祝你勝利．
  - **r16** location(2) 그룹 2 — 그룹 넘김
    - `load_map` map=8205
    - `dialogue`
      > 劉備: 關羽，張飛，出征！
      > 張飛: 這麼突然，搞什麼名堂？
      > 劉備: 我找到擺脫曹操的藉口了，聽說袁術現在廣陵，我們去打他．
      > 關羽: 對啦，是不是討伐袁術後就不回許昌了，去徐州，曹操沒懷疑吧？
      > 劉備: 沒有懷疑．
      > 張飛: 好哇，呀，我還一直擔心就得這樣在許昌待下去了，太好了，要打仗了，我手都癢了．那麼，我去告訴簡雍他們．
    - `dialogue`
      > 關羽: 兄長，出兵廣陵前你是不是該去見一下聖上．
      > 劉備: 是的，那我去一下皇宮就回來．
      > 關羽: 我們趁這個時間裡作出征準備．
    - `set_objective`
      > 去皇宮見獻帝．
    - `leave_parallel` 
- **블록 11**: 전투 준비; 레코드 6, 그룹 3; 대화 4(잡담 3); 맵: 마을 1, 마을 13
  - 전투 설정: 턴 제한 30, 아군 출진 7명, 격파 대상 #11, 퇴각하면 패배 #0
  - 트리거: location
  - 목표 문구: 為討伐袁術出兵廣陵．
  - 질문 r5 (關羽): 예 답이면 7 명령 실행, 출진 확인 [battle_setup, leave_parallel]
  - **r0** talk(3) [關羽] 그룹 0*
    - `dialogue`
      > 關羽: 進攻廣陵之前，兄長該去見一下皇帝吧？我們作出征準備．
  - **r1** location(2) 그룹 0 — 그룹 넘김
    - `load_map` map=8193
    - `play_music` song=8
    - `dialogue`
      > 獻帝: 噢，皇叔，剛才董承上奏朕了．朕很高興．
      > 董承: 陛下，您聲音太大，小心些，皇叔此來有什麼事？
      > 劉備: 其實這次是因為討伐袁術，要離開許昌．
      > 獻帝: 什麼？那樣的話，不是長時間見不到皇叔了嗎？這……
    - `dialogue`
      > 董承: 劉備，現在你不在了，我們的誓約？
      > 劉備: 我正是為了誓約而來．
      > 董承: 嗯．
      > 劉備: 誓約我沒有忘，可是在許昌總是被曹操盯著，與其這樣，我還不如利用這次出征機會離開許昌，擺脫曹操．
      > 董承: 確實如此，而且我們見面太多，也會加重曹操的疑心．好吧，我對聖上說，你放心吧．
    - `dialogue`
      > 董承: 陛下，其實……
      > 獻帝: 什麼？嗯嗯，確實如此，是啊，不愧是皇叔，我知道了，那麼，皇叔就慢慢地擴充實力展翅高飛吧．
      > 劉備: 明白了，臣告辭了．
    - `set_objective`
      > 為討伐袁術出兵廣陵．
    - `leave_parallel` 
  - **r2** talk(3) [獻帝] 그룹 1*
    - `dialogue`
      > 獻帝: 皇叔，你慢慢擴充實力吧．
  - **r3** talk(3) [董承] 그룹 1
    - `dialogue`
      > 董承: 劉備，我們期待著你．
  - **r4** location(2) 그룹 1 — 그룹 넘김
    - `load_map` map=8205
    - `play_music` song=5
    - `dialogue`
      > 關羽: 兄長，我們在等你，已準備好了，趕快出發吧．
    - `leave_parallel` 
  - **r5** talk(3) [關羽] 그룹 2* — 그룹 넘김
    - `dialogue`
      > 關羽: 出發嗎？
    - `if_answer` answer=0 skip=7
    - `op_3d` value=0
    - `play_music` song=12
    - `battle_setup` 
    - `dialogue`
      > 關羽: 那就出發吧，如果讓曹操知道了我們的真實意圖就慘了．
    - `leave_parallel` 
- **블록 12**: 이야기; 레코드 1, 그룹 1; 대화 0(잡담 0); 맵: 지도
  - **r0** run(0) 그룹 0
    - `load_map` map=4096
    - `play_music` song=11
    - `narration`
      > 　且說袁術這裡，袁術自封為皇帝後，過著極其奢侈的生活，他終於被民眾拋棄了．
      > 　袁術支撐不下去了，他現在去投奔哥哥袁紹，奔冀州而來．
      > 　袁術的隊伍可以說是他過去搜刮的集大成，金銀財寶列成長蛇陣，百姓哀聲不絕於耳．
    - `dialogue`
      > 袁術: 喂！快走！想讓劉備抓住我嗎？快！
      > 農民: 唉，饒命．
      > 袁術: 誰再慢吞吞就殺了他，擋我前進之路的就殺了他．
    - `play_music` song=3
    - `dialogue`
      > 關羽: 兄長，快向廣陵進軍吧．
      > 簡雍: 廣陵在許昌的東面，主公，我們進軍吧．
- **블록 13**: 전투; 레코드 7, 그룹 4; 대화 0(잡담 0); 맵: 전투 맵 15, 지도
  - 적군 명단: 12기
  - 트리거: battle_won, unit_at_cell, unit_contact
  - 목표 문구: 一、袁術的潰敗． / 在下邳研究今後的對策．
  - r3 일기토
  - r3 아이템: 三尖刀
  - r4 (battle_won) 전투 끝
  - r5 아이템: 七星劍  
  - 플래그 켬: {189, 190}
  - 플래그 검사: {189, 190}
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12303
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `play_music` song=11
    - `set_objective`
      > 一、袁術的潰敗．
    - `dialogue`
      > 袁術: 說什麼？劉備來了，嗯，可惡的賣蓆小兒，可惡，全軍攻擊劉備．
      > 劉備: 好哇，要殺死那個壞蛋，進攻袁術．
    - `play_music` song=13
  - **r3** unit_contact(4) [張飛] 그룹 3*
    - `dialogue`
      > 張飛: 你們這些國賊，膽敢隨意自封皇帝，為所欲為，我來殺你！
      > 紀靈: 誰聽你的胡言亂語！張飛！看我殺你！
    - `duel` first=張飛 second=紀靈
    - `duel_begin` 
    - `dialogue`
      > 紀靈: 看我一刀！
    - `duel_action` person=紀靈 action=0
    - `duel_action` person=紀靈 action=1
    - `dialogue`
      > 張飛: 啊呀呀，好險呀！這次輪到我給你一槍！
    - `duel_action` person=張飛 action=1
    - `duel_action` person=張飛 action=0
    - `duel_action` person=張飛 action=1
    - `dialogue`
      > 紀靈: 媽呀！
      > 張飛: 中槍了！
    - `duel_action` person=張飛 action=7
    - `dialogue`
      > 紀靈: 啊！
    - `duel_action` person=紀靈 action=3
    - `duel_action` person=張飛 action=5
    - `dialogue`
      > 張飛: 這還痛快些，噢，紀靈這傢伙的武器還不錯，作為戰利品拿回去．
    - `duel_end` 
    - `add_item` item=三尖刀
  - **r4** battle_won(7) 그룹 3 — 그룹 넘김
    - `dialogue`
      > 袁術: 唉，我怎麼會敗給劉備小兒？
    - `play_music` song=7
    - `narration`
      > 　殺了袁術，劉備軍大破袁術軍．
    - `data` kind=2 value=600
    - `caption`
      > 繳獲黃金６００．
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 張飛: 沒想到袁術也太不中用了．
      > 關羽: 我們進下邳吧，進了下邳，就是曹操來，也能守住．
      > 孫乾: 是啊，聽說曹操的心腹車冑在徐州，徐州是個隱患．
      > 劉備: 知道了，那麼就進駐下邳吧．在那裡研究一下對付曹操的策略．
    - `set_objective`
      > 在下邳研究今後的對策．
    - `leave_parallel` 
  - **r5** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `add_item` item=七星劍  
    - `set_flag` flag=189 clear=0
  - **r6** unit_at_cell(6) [(any unit)] 그룹 3
    - `if_flags` 
    - `data` kind=2 value=400
    - `caption`
      > 繳獲了黃金４００！
    - `set_flag` flag=190 clear=0
- **블록 14**: 전투 준비; 레코드 16, 그룹 6; 대화 13(잡담 10); 맵: 마을 1, 마을 2, 지도
  - 전투 설정: 턴 제한 50, 아군 출진 9명, 격파 대상 #8, 퇴각하면 패배 #0
  - 트리거: location
  - 목표 문구: 研究今後對策．
  - r7 삽화 11
  - 질문 r15 (關羽): 예 답이면 20 명령 실행, 출진 확인 [set_allegiance, set_allegiance, battle_setup, leave_parallel]
  - r15 소속: 關羽 → 무소속(이탈)
  - r15 소속: 張飛 → 무소속(이탈)
  - **r0** location(2) 그룹 0
    - `load_map` map=8194
    - `play_music` song=5
    - `caption`
      > 下邳議事廳
    - `play_music` song=11
    - `dialogue`
      > 糜芳: 主公，不好啦！
    - `set_objective`
      > 研究今後對策．
  - **r1** talk(3) [關羽] 그룹 1*
    - `dialogue`
      > 關羽: 糜芳有話說，請聽他講．
  - **r2** talk(3) [張飛] 그룹 1
    - `dialogue`
      > 張飛: 剛打了勝仗，還能有什麼事．
  - **r3** talk(3) [孫乾] 그룹 1
    - `dialogue`
      > 孫乾: 請聽糜芳說．
  - **r4** talk(3) [簡雍] 그룹 1
    - `dialogue`
      > 簡雍: 先聽糜芳說吧．
  - **r5** talk(3) [糜竺] 그룹 1
    - `dialogue`
      > 糜竺: 請聽聽我弟弟說什麼．
  - **r6** talk(3) [糜芳] 그룹 1 — 그룹 넘김
    - `dialogue`
      > 糜芳: 主公，剛剛聽到消息，董承等人被曹操殺害了．
      > 劉備: 什麼？被殺了，怎麼被殺的？
    - `leave_parallel` 
  - **r7** run(0) 그룹 2
    - `load_map` map=8193
    - `show_picture` picture=11 variant=1
    - `narration`
      > 　董承等人策劃暗殺曹操的計畫，在付諸實施的前一刻，走漏了消息，曹操得到消息後大怒，殘殺了董承等首謀並誅連九族，被殺者達７００餘人．
    - `caption`
      > 許昌宮殿
    - `dialogue`
      > 曹操: 聖上大概不至於知道這個暗殺計畫吧．
      > 獻帝: 這個，朕不知道．
      > 曹操: 那就好，呀，請聖上寬恕臣的失禮．
      > 獻帝: ……（董承，朕對不起你．）
    - `dialogue`
      > 曹操: 可是，我決不能饒恕劉備，以前他從淮南遇難逃出來時，我保護他，他卻忘恩負義．全軍，準備出征，我親自出馬．
      > 夏侯惇: 遵命！
      > 曹操: 還有，傳令徐州的車冑，討伐下邳的劉備．
  - **r8** run(0) 그룹 3
    - `load_map` map=8194
    - `set_previous_map` map=17 x=25 y=5
    - `caption`
      > 下邳議事廳
    - `dialogue`
      > 糜芳: 這樣一來，主公參與謀殺曹操的事情也暴露了．聽說曹操已命令徐州的車冑，討伐我們．
  - **r9** talk(3) [關羽] 그룹 4*
    - `dialogue`
      > 關羽: 怎麼會呢？這麼快就暴露了．
  - **r10** talk(3) [張飛] 그룹 4
    - `dialogue`
      > 張飛: 不過，大哥，只要堅守這裡就沒問題．
  - **r11** talk(3) [孫乾] 그룹 4
    - `dialogue`
      > 孫乾: 主公，怎麼辦？
  - **r12** talk(3) [簡雍] 그룹 4
    - `dialogue`
      > 簡雍: 遭了，如果曹操親統大軍前來，我們打不過的．
  - **r13** talk(3) [糜芳] 그룹 4
    - `dialogue`
      > 糜芳: 據說曹操已率大軍殺往徐州．
  - **r14** talk(3) [糜竺] 그룹 4 — 그룹 넘김
    - `dialogue`
      > 糜竺: 以我軍的力量，實在打不過曹操軍．
      > 劉備: 嗯．
    - `dialogue`
      > 武官: 報告，徐州的車冑正著手準備進攻這裡．
      > 關羽: 什麼？車冑也要進攻這裡．
      > 孫乾: 主公，我們與其在這裡等死，還不如去攻佔徐州，然後在小沛、徐州、下邳三城迎擊曹操軍，這樣還可以分散曹操軍的兵力．
      > 張飛: 好主意，小沛我來守．我這就去．
    - `dialogue`
      > 關羽: 張飛，這個急性子，也不商量就走．
    - `dialogue`
      > 關羽: 兄長，剩下的兩座城由誰來把守？
    - `dialogue`
      > 劉備: 嗯，是啊，關羽，你守這座城．
      > 關羽: 是．
      > 劉備: 其餘的人就奇襲徐州的車冑，快做準備吧．
    - `leave_parallel` 
  - **r15** talk(3) [關羽] 그룹 5* — 그룹 넘김
    - `dialogue`
      > 關羽: 出征嗎？
    - `if_answer` answer=0 skip=20
    - `op_3d` value=0
    - `play_music` song=12
    - `dialogue`
      > 關羽: 編成部隊．
    - `set_allegiance` person=關羽 army=14
    - `set_allegiance` person=張飛 army=14
    - `battle_setup` 
    - `dialogue`
      > 關羽: 兄長，多保重．
      > 劉備: 你也要牢牢守住這座城．
      > 關羽: 我死守此城．
    - `load_map` map=4096
    - `play_music` song=3
    - `dialogue`
      > 孫乾: 向徐州進軍．
    - `leave_parallel` 
- **블록 15**: 전투; 레코드 8, 그룹 7; 대화 0(잡담 0); 맵: 0x0005, 전투 맵 8, 지도
  - 적군 명단: 28기
  - 트리거: battle_won, unit_at_cell, unit_defeated, unit_in_area
  - 목표 문구: 一、車冑的毀滅． / 一、劉備進入徐州． / 一、曹操撤退． 二、劉備到達西南村． / 去鄴城見袁紹．
  - r7 (run) 전투 끝
  - **r0** run(0) 그룹 0
    - `battle_roster` 
    - `load_map` map=12296
  - **r1** run(0) 그룹 1
    - `begin_battle` 
  - **r2** run(0) 그룹 2
    - `set_objective`
      > 一、車冑的毀滅．
    - `play_music` song=11
    - `dialogue`
      > 車冑: 各位，我們雖然人少，但曹操一定會派援兵的，援兵來之前，我們要守住．
      > 孫乾: 主公，我們在這裡一磨蹭，曹操就會到的，我們盡快消滅車冑吧．
    - `play_music` song=9
  - **r3** unit_defeated(12) [車冑] 그룹 3
    - `play_music` song=7
    - `dialogue`
      > 車冑: 喂，劉備，你忘了主公的恩情了．全軍撤退．
    - `caption`
      > 車冑軍全軍撤退．
    - `dialogue`
      > 糜芳: 好像已經沒有敵人了，主公，我們進城吧．
    - `play_music` song=9
    - `set_objective`
      > 一、劉備進入徐州．
  - **r4** unit_in_area(11) [劉備] 그룹 4
    - `dialogue`
      > 劉備: 嗯？怎麼回事？這些馬蹄聲？怎麼會呢？
    - `play_music` song=11
    - `join_battle` person=曹操
    - `join_battle` person=夏侯惇
    - `join_battle` person=荀彧
    - `join_battle` person=郭嘉
    - `join_battle` person=夏侯淵
    - `join_battle` person=曹仁
    - `join_battle` person=曹洪
    - `join_battle` person=于禁
    - `join_battle` person=李典
    - `join_battle` person=許褚
    - `join_battle` person=荀攸
    - `join_battle` person=程昱
    - `join_battle` person=弓兵隊
    - `join_battle` person=弓兵隊
    - `join_battle` person=弓兵隊
    - `join_battle` person=猛獸師
    - `join_battle` person=賊兵
    - `join_battle` person=賊兵
    - `join_battle` person=運輸隊
    - `caption`
      > 曹操出現．
    - `dialogue`
      > 曹操: 哼！劉備！你想跑也跑不掉了！你最好知道想殺我的人有什麼下場！
      > 孫乾: 主公，我們完全被包圍了．
      > 簡雍: 主公，小沛被攻克了．
      > 糜竺: 主公，下邳被曹操進攻，我們被包圍了．
      > 劉備: 嗯，曹操果然厲害，真是兵貴神速．
      > 孫乾: 主公，現在無計可施了，去鄴城投袁紹吧，在那裡謀求東山再起，先逃到西南的村落再想辦法．總之，現在要離開這裡．
    - `play_music` song=10
    - `set_objective`
      > 一、曹操撤退．
      > 二、劉備到達西南村．
  - **r5** unit_at_cell(6) [劉備] 그룹 5* — 그룹 넘김
    - `data` kind=4 value=50
    - `play_music` song=4
    - `dialogue`
      > 劉備: 別人怎麼樣了？
    - `narration`
      > 　劉備逃離了戰場．
    - `leave_parallel` 
  - **r6** battle_won(7) 그룹 5 — 그룹 넘김
    - `dialogue`
      > 曹操: 噢，劉備這個傢伙，還算厲害，暫且退兵，重新編組全軍．
      > 劉備: 好像是暫時退兵，不過看樣子很快還會進攻，為了脫身，去鄴城吧．
    - `play_music` song=7
    - `narration`
      > 　曹操退兵了，劉備衝出曹操軍的包圍．
    - `data` kind=2 value=600
    - `caption`
      > 繳獲了黃金６００．
    - `leave_parallel` 
  - **r7** run(0) 그룹 6
    - `battle_end` next_map=4096
    - `load_map` map=4096
    - `play_music` song=5
    - `dialogue`
      > 孫乾: 主公！
      > 劉備: 噢！孫乾，沒事吧．其他人怎麼樣？
      > 孫乾: 不知道，我也是九死一生，沒有簡雍等人的消息．
      > 劉備: 是嗎？關羽和張飛怎麼樣了？也不知道是死是活？
      > 孫乾: 憑他們的二人的英勇，不會有事的，暫且去鄴城吧．
    - `dialogue`
      > 劉備: 關羽，張飛，也不知道是死是活？那是誰？
      > 糜竺: 啊呀！
    - `dialogue`
      > 劉備: 噢，糜竺，你沒事吧？糜竺，看見其他人了嗎？
      > 糜竺: 沒有，我只能顧自己跑了．
      > 劉備: 是這樣．好吧，投奔袁紹去．現在也只有這條路了．
      > 孫乾: 是．
    - `load_map` map=5
    - `set_objective`
      > 去鄴城見袁紹．
- **블록 16**: 이야기; 레코드 6, 그룹 2; 대화 5(잡담 0); 맵: 마을 5
  - 트리거: location
  - **r0** location(2) 그룹 0
    - `load_map` map=8197
    - `caption`
      > 鄴城議事廳
  - **r1** talk(3) [田豐] 그룹 1*
    - `dialogue`
      > 田豐: 先請我們主公講話．
  - **r2** talk(3) [沮授] 그룹 1
    - `dialogue`
      > 沮授: 聽說是被曹操追趕來的，想必這次很落魄吧．
  - **r3** talk(3) [郭圖] 그룹 1
    - `dialogue`
      > 郭圖: 哼，這個喪家犬，殺了主公的弟弟，卻敢跑到這裡來．
  - **r4** talk(3) [審配] 그룹 1
    - `dialogue`
      > 審配: 雖然戰敗，曹操也追不到這裡，現在這塊領地畢竟勢力還很強大．
  - **r5** talk(3) [袁紹] 그룹 1
    - `dialogue`
      > 袁紹: 劉備，歡迎你來，聽說你被曹操打得很慘．你到我這裡可以放心了，我也很擔心曹操最近的態度，你在這裡養精蓄銳，我們一起討伐曹操吧．
    - `end_event` 
