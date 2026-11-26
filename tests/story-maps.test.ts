import { describe, expect, it } from 'vitest';
import { SCRIPT, scene } from '../src/data/game';
import { StageScript, stageOf } from '../src/stage';
import { nextStep, startStory, type Flag, type Script } from '../src/story';

function play(id: string, seed = 0, flags: Record<string, Flag> = {}, previous = 'field') {
  const script: Script = { id, title: '', steps: scene(id) };
  const story = startStory(script);
  Object.assign(story.flags, flags);
  const stage = new StageScript(stageOf(id), new StageScript({ map: previous, lines: 0, ops: [] }));
  const frames: { text: string; map: string; people: number[] }[] = [];
  let line = 0, random = seed + 1;
  let step = nextStep(script, story);
  for (let n = 0; step && n < 1000; n++) {
    if (!stage.info?.ordered && !stage.info?.timeline) stage.advance(line);
    if (step.t === 'action') stage.run(step.op);
    if (step.t === 'say' || step.t === 'text') {
      frames.push({ text: step.text, map: stage.map, people: [...stage.people.keys()] });
      line++;
    }
    random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
    const options = step.t === 'choice' || step.t === 'room' ? step.options : undefined;
    step = nextStep(script, story, options?.length ? random % options.length : 0);
  }
  return { frames, stage };
}

describe('战斗外剧情的文字与地图同步', () => {
  it('下邳战后去见曹操、献帝时，地图与交谈人物同步切换', () => {
    const story = startStory(SCRIPT);
    story.pc = SCRIPT.steps.findIndex(s => s.t === 'battle' && s.level === 'c1_s3_b4');
    let stage = new StageScript(), section = '', line = 0, checked = 0;
    for (let n = 0; n < 500; n++) {
      const step = nextStep(SCRIPT, story);
      if (!step) break;
      if (section !== story.section) {
        section = story.section;
        stage = new StageScript(stageOf(section), stage);
        line = 0;
      }
      if (!stage.info?.ordered && !stage.info?.timeline) stage.advance(line);
      if (step.t === 'action') stage.run(step.op);
      if (step.t === 'say' || step.t === 'text') {
        if (section === 'c1_s4_story2' && step.text.startsWith('劉備，一大早就叫你來')) {
          expect(stage.map).toBe('palace/005');
          expect(stage.people.has(8)).toBe(true);
          checked++;
        }
        if (section === 'c1_s4_story3' && step.text.startsWith('噢，你就是劉備吧')) {
          expect(stage.map).toBe('palace/001');
          expect(stage.people.has(382)).toBe(true);
          checked++;
          break;
        }
        line++;
      }
    }
    expect(checked).toBe(2);
  });

  it.each([
    ['c1_s4_story3', 'palace/001'],
    ['c2_s0_story7', 'palace/013'],
    ['c2_s1_story6', 'palace/002'],
    ['c3_s1_story11', 'palace/005'],
  ])('%s 不在对白结束前提前换图', (id, previous) => {
    expect(play(id, 0, {}, previous).frames[0]?.map).toBe(previous);
  });

  it.each([
    ['c1_s4_story1', '許昌議事廳', 'palace/005'],
    ['c1_s4_story5', '兄長，你回來了．', 'palace/013'],
    ['c1_s4_story8', '大哥，你回來了，聽說你去了曹操那裡，沒事吧．', 'palace/013'],
    ['c1_s4_story9', '劉備，你來得正好，我有話要對你說．', 'palace/005'],
    ['c1_s4_story10', '關羽，張飛，出征！', 'palace/013'],
    ['c1_s4_story14', '下邳議事廳', 'palace/002'],
    ['c1_s4_story16', '鄴城議事廳', 'palace/005'],
    ['c2_s0_story2', '主公，大喜事，就在剛才，一直沒有消息的簡雍和糜芳來了．', 'palace/013'],
    ['c2_s0_story4', '噢，主公，你沒事吧，啊．糜竺回來了．', 'palace/013'],
    ['c2_s0_story10', '穎川在這古城的南面．那麼去穎川吧．', 'field'],
    ['c2_s0_story13', '汝南議事廳', 'palace/004'],
    ['c2_s0_story15', '劉備，逃也沒用！', 'field'],
    ['c2_s1_story8', '劉備有什麼事嗎？', 'palace/004'],
    ['c2_s1_story9', '兄長，剛才間諜報告說，曹操已併吞了袁紹．', 'palace/002'],
    ['c2_s1_story10', '關羽，張飛，現在去隆中．', 'palace/002'],
    ['c2_s1_story13', '孔明草廬', 'palace/021'],
    ['c2_s1_story15', '主公，去南陽吧．', 'field'],
    ['c2_s2_story3', '是誰在那裡？是什麼俗人來了吧．', 'palace/021'],
    ['c2_s3_story8', '江夏議事廳', 'palace/003'],
    ['c3_s0_story1', '江夏議事廳', 'palace/003'],
    ['c3_s0_story12', '主公，佔領了三個郡，真是可喜可賀．', 'palace/005'],
    ['c3_s0_story14', '長沙議事廳', 'palace/004'],
    ['c3_s1_story12', '耒陽縣議事廳', 'palace/002'],
    ['c3_s2_story3', '江陵議事廳', 'palace/005'],
    ['c3_s2_story5', '那麼向雒城進發．', 'field'],
    ['c3_s2_story7', '主公，副軍師因去陣地視察', 'palace/002'],
    ['c3_s2_story9', '涪城議事廳', 'palace/002'],
    ['c3_s2_story13', '據說敵人在葭萌關．那麼趕快出發吧．', 'field'],
    ['c4_s0_story3', '成都議事廳', 'palace/005'],
    ['c4_s0_story6', '那好劉備公，我們去打新野．', 'field'],
    ['c4_s0_story9', '我們先坐山觀蜀魏兩虎相鬥．', 'field'],
  ])('%s 的正文使用当前地点的地图', (id, text, expected) => {
    const frames = Array.from({ length: 12 }, (_, seed) => play(id, seed).frames).flat();
    const matching = frames.filter(frame => frame.text.startsWith(text));
    expect(matching.length, text).toBeGreaterThan(0);
    for (const frame of matching) expect(frame.map, frame.text).toBe(expected);
  });

  it('定军山选择天荡山后，幕尾仍会执行出发换图', () => {
    const result = Array.from({ length: 12 }, (_, seed) => play('c3_s3_story7', seed))
      .find(({ frames }) => frames.some(frame => frame.text === '明白了．那麼向天蕩山進發．'));
    expect(result).toBeDefined();
    expect(result!.stage.map).toBe('field');
  });

  it.each([0, 1])('涪城按庞统生还标志 %i 摆人，条件不影响议事厅换图', (flag) => {
    const frame = play('c3_s2_story9', 0, { orig_f38: flag }).frames
      .find(frame => frame.text === '涪城議事廳');
    expect(frame?.map).toBe('palace/002');
    expect(frame?.people.includes(132)).toBe(flag === 0);
  });
});
