/**
 * 简繁显示层。原版 DOS 的剧本、武将名、道具、地名全是繁体，数据文件与存档保持原样，
 * 只在显示时按用户选择转成简体。每个文本节点都记下原文，切回繁体是无损还原而不是反向猜。
 *
 * 注意：原版像素图里烧死的字（标题图、按钮框、章节横幅背景）不在 DOM 里，改不了。
 */
import { Converter } from 'opencc-js/t2cn';

const toHans = Converter({ from: 't', to: 'cn' });
export type Script = 'hans' | 'hant';
const SCRIPT_KEY = 'yjz.script';

/** 纯转换函数，不读设置，方便单独测试。 */
export const toSimplified = (text: string): string => toHans(text);

export function currentScript(): Script {
  try { return localStorage.getItem(SCRIPT_KEY) === 'hant' ? 'hant' : 'hans'; }
  catch { return 'hans'; }
}
export function setScript(s: Script): void {
  try { localStorage.setItem(SCRIPT_KEY, s); } catch { /* 隐私模式记不住也照常显示 */ }
}
/** 当前模式下这段文本该怎么显示；繁体模式原样返回。 */
export function convert(text: string): string {
  return currentScript() === 'hans' ? toHans(text) : text;
}
/** 按钮标签统一用简体写法，免得自己也被转换。 */
export const scriptLabel = (): string => (currentScript() === 'hans' ? '文字 简体' : '文字 繁体');

const ATTRS = ['title', 'placeholder', 'alt', 'aria-label'] as const;
type AttrName = (typeof ATTRS)[number];
const rawText = new WeakMap<Text, string>();
const rawAttrs = new WeakMap<Element, Partial<Record<AttrName, string>>>();
const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT']);

function applyText(node: Text): void {
  if (node.parentElement && SKIP.has(node.parentElement.tagName)) return;
  if (!rawText.has(node)) rawText.set(node, node.nodeValue ?? '');
  const out = convert(rawText.get(node)!);
  if (out !== node.nodeValue) node.nodeValue = out;
}

function applyAttrs(el: Element): void {
  let saved = rawAttrs.get(el);
  if (!saved) { saved = {}; rawAttrs.set(el, saved); }
  for (const name of ATTRS) {
    if (!el.hasAttribute(name)) continue;
    if (!(name in saved)) saved[name] = el.getAttribute(name) ?? '';
    const out = convert(saved[name]!);
    if (out !== el.getAttribute(name)) el.setAttribute(name, out);
  }
}

function applyNode(node: Node): void {
  if (node.nodeType === Node.TEXT_NODE) return applyText(node as Text);
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as Element;
  if (SKIP.has(el.tagName)) return;
  applyAttrs(el);
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n: Node | null;
  while ((n = tw.nextNode())) {
    if (n.nodeType === Node.TEXT_NODE) applyText(n as Text);
    else if (!SKIP.has((n as Element).tagName)) applyAttrs(n as Element);
  }
}

/** 切换后把已经显示出来的文字按新模式重算一遍。 */
export function refreshScript(): void {
  applyNode(document.body);
  document.title = convert('三國志英傑傳');
}

/** 启动时挂一次：此后对白、菜单、状态栏、浮层等任何 DOM 更新都会自动套用当前模式。 */
export function initScript(): void {
  const mo = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'characterData') applyText(r.target as Text);
      else if (r.type === 'attributes') applyAttrs(r.target as Element);
      else for (const n of r.addedNodes) applyNode(n);
    }
  });
  mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] });
  refreshScript();
}

export function toggleScript(): Script {
  const next: Script = currentScript() === 'hans' ? 'hant' : 'hans';
  setScript(next);
  refreshScript();
  return next;
}
