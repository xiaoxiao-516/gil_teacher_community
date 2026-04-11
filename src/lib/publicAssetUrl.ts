/**
 * 引用 public/ 下文件的 URL。子路径部署（如 GitHub Pages `/<repo>/`）时不能用站点根路径 `/xxx`，
 * 需与 Vite 的 `base` 一致：开发为 `/`，生产构建当前为 `./`。
 */
export function publicAssetUrl(path: string): string {
  const raw = path.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL;
  if (!base || base === '/') {
    return `/${raw}`;
  }
  return `${base}${raw}`;
}
