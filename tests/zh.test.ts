import { describe, expect, it } from 'vitest';
import { toSimplified } from '../src/zh';

describe('简繁显示：纯转换', () => {
  it('原版剧本里的繁体字转成简体', () => {
    expect(toSimplified('三國志英傑傳')).toBe('三国志英杰传');
    expect(toSimplified('汜水關之戰')).toBe('汜水关之战');
    expect(toSimplified('讀取存檔')).toBe('读取存档');
    expect(toSimplified('劉備、關羽、張飛')).toBe('刘备、关羽、张飞');
    expect(toSimplified('陳留宮殿')).toBe('陈留宫殿');
    expect(toSimplified('勝利：一、殲滅華雄')).toBe('胜利：一、歼灭华雄');
  });

  it('数字、标点、全角空格和已经简体的字保持原样', () => {
    expect(toSimplified('軍資 500 金　出征 3/3 名')).toBe('军资 500 金　出征 3/3 名');
    expect(toSimplified('胜利：一、歼灭华雄')).toBe('胜利：一、歼灭华雄');
    expect(toSimplified('第1回合 100% -12')).toBe('第1回合 100% -12');
  });

  it('不改写标签 / 路径等非中文内容', () => {
    expect(toSimplified('<b>關羽</b>')).toBe('<b>关羽</b>');
    expect(toSimplified('/assets/faces/038.png')).toBe('/assets/faces/038.png');
  });
});
