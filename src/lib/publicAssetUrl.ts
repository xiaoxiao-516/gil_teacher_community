/**
 * 引用 public/ 下文件的 URL。需与 Vite `import.meta.env.BASE_URL` 一致。
 * GitHub Actions 部署 Pages 时会设置 VITE_BASE=/<repo>/；本地未设置时多为 `./`。
 */
export function publicAssetUrl(path: string): string {
  const raw = path.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL;
  if (!base || base === '/') {
    return `/${raw}`;
  }
  return `${base}${raw}`;
}
