import raw from './campaign.json';

/**
 * 章节行军图（campaign.json 由 tools/build_campaign.py 从原版 MMAP.R3 的提取结果转出）。
 *
 * 原版每章开头是整屏行军图 + 章节名。图一共只有四张：序章与第一章共用第一张，
 * 第二章起各用一张，对应 MAIN.EXE 里那张「每章用多大一块」的表
 * （original/extract/maps/campaign.json 的 sizes_by_chapter）。
 */
export interface MarchMap {
  index: number;
  /** public/assets 下的相对路径 */
  image: string;
  /** 原图按 32px 一格算的格数 */
  tiles: [number, number];
}

export interface MarchChapter {
  /** 与关卡 id 的前缀一致：c0 … c4 */
  key: string;
  name: string;
  map: number;
}

interface Data {
  chapters: MarchChapter[];
  maps: MarchMap[];
}

const DATA = raw as unknown as Data;

export const MARCH_CHAPTERS = DATA.chapters;
export const MARCH_MAPS = DATA.maps;

export const marchChapter = (key: string): MarchChapter | undefined =>
  MARCH_CHAPTERS.find((c) => c.key === key);

export const marchMap = (key: string): MarchMap | undefined => {
  const c = marchChapter(key);
  return c === undefined ? undefined : MARCH_MAPS.find((m) => m.index === c.map);
};

/** 章节名 → 章号。「序章」是第 0 章，其余按汉字数字。 */
const NUMERALS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

export const chapterOfName = (name: string): MarchChapter | undefined => {
  if (name.startsWith('序章')) return marchChapter('c0');
  const m = /^第([一二三四五六七八九十]+)章/.exec(name);
  if (!m) return undefined;
  const n = NUMERALS.indexOf(m[1]) + 1;
  return n > 0 ? marchChapter(`c${n}`) : undefined;
};

export interface ChapterTitle {
  chapter?: MarchChapter;
  /** 「序章」「第一章」 */
  name: string;
  /** 章名之外的部分：「群雄起兵討伐董卓」 */
  sub: string;
}

/** 把原版标题拆成「第X章」与副题。原版有的标题没留空格（「第一章界橋之戰」），一并认。 */
export const chapterTitle = (text: string): ChapterTitle => {
  const m = /^(序章|第[一二三四五六七八九十]+章)[\s\u3000]*(.*)$/.exec(text.trim());
  if (!m) return { name: '', sub: text };
  return { chapter: chapterOfName(m[1]), name: m[1], sub: m[2] };
};
