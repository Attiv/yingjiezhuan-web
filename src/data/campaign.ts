import type { Script } from '../story';
import { BRIEF } from './sishui';

/** 示例流程：开场 → 汜水关 → 战后。文字全部自撰，不是原作台词；每一种步骤都用到了一次。 */
export const CAMPAIGN: Script = {
  id: 'prologue',
  title: '序章',
  steps: [
    { t: 'bg', key: 'title' },
    ...BRIEF.map((text) => ({ t: 'text' as const, text })),
    { t: 'say', who: '张飞', text: '大哥，华雄那厮连斩联军数将，让俺去会会他！' },
    { t: 'say', who: '关羽', text: '三弟莫急。关墙之内只有一道门，硬冲不得。' },
    {
      t: 'choice', who: '刘备', text: '出阵之前，要不要再听一遍军令？',
      options: [{ label: '听', set: { briefed: true } }, { label: '不必了', goto: 'march' }],
    },
    { t: 'text', text: '左键选择部队、移动、下令；右键或 Esc 取消；方向键卷动地图；回车结束回合。' },
    { t: 'label', name: 'march' },
    { t: 'say', who: '刘备', text: '二弟、三弟，随我出阵。' },
    { t: 'battle', level: 'sishui' }, // 没写 lose：败了重打
    { t: 'bg', key: 'title' },
    { t: 'if', flag: 'sishui.duel', goto: 'duel' }, // 战斗里触发过的事件，战后以「关卡.事件」的名字留在标志里
    { t: 'say', who: '刘备', text: '华雄已退，汜水关拿下了。' },
    { t: 'goto', label: 'after' },
    { t: 'label', name: 'duel' },
    { t: 'say', who: '张飞', text: '二哥好刀法！那华雄竟接不住一合。' },
    { t: 'say', who: '关羽', text: '侥幸而已。' },
    { t: 'label', name: 'after' },
    { t: 'text', text: '联军入关。示例流程到此结束。' },
  ],
};
