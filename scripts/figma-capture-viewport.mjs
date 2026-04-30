/**
 * 固定浏览器视口尺寸后打开带 Figma MCP 捕获 hash 的本地页面，便于导出为指定画板大小。
 * 需已运行 `npm run dev`，且已 `npx playwright install chromium`。
 *
 * 用法: node scripts/figma-capture-viewport.mjs <captureId> <width> <height> [path]
 * 例:   node scripts/figma-capture-viewport.mjs <uuid> 1000 600 /community
 */
import { chromium } from 'playwright';

const captureId = process.argv[2];
const width = parseInt(process.argv[3], 10);
const height = parseInt(process.argv[4], 10);
const path = process.argv[5] ?? '/community';

if (!captureId || !Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
  console.error('Usage: node scripts/figma-capture-viewport.mjs <captureId> <width> <height> [path]');
  process.exit(1);
}

const endpoint = `https://mcp.figma.com/mcp/capture/${captureId}/submit`;
const hash = new URLSearchParams({
  figmacapture: captureId,
  figmaendpoint: endpoint,
  figmadelay: '3000',
});
const url = `http://127.0.0.1:51730${path.startsWith('/') ? path : `/${path}`}#${hash.toString()}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width, height });
await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(20000);
await browser.close();
console.log('done', width, height, url);
