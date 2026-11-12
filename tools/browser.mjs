// 无头浏览器辅助：tests/e2e.mjs 和手动截图都用它。
import { chromium } from 'playwright-core';
import { readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const cache = join(homedir(), '.cache', 'ms-playwright');
// 没装 Playwright 自带的 Chromium 时，允许用 CHROME 指向系统浏览器
const dir = existsSync(cache) ? readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().pop() : null;
export const executablePath = process.env.CHROME ?? (dir && join(cache, dir, 'chrome-linux64', 'chrome'));

export async function open(url, { width = 1280, height = 960 } = {}) {
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(url);
  return { browser, page, errors };
}
