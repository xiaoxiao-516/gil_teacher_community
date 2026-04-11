/**
 * 生成可粘贴到外部的完整 URL。
 * - 开发：BrowserRouter，路径在 pathname。
 * - 生产：HashRouter + 相对 base，路由在 hash（如 #/community/post-1）。
 */
export function getExternalShareUrl(routePath: string): string {
  const path = routePath.startsWith('/') ? routePath : `/${routePath}`;
  if (import.meta.env.DEV) {
    return `${window.location.origin}${path}`;
  }
  const u = new URL(window.location.href);
  u.hash = path;
  return u.toString();
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}
