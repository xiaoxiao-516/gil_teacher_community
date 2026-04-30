import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** 生产 base：未设置 VITE_BASE 时用 `./` 便于整夹拷贝；GitHub Pages 在 CI 里设 VITE_BASE=/<repo>/ 避免无尾斜杠入口页把 `./` 资源解析到域名根导致 404 */
function productionBase(): string {
  const v = process.env.VITE_BASE?.trim();
  if (v) {
    return v.endsWith('/') ? v : `${v}/`;
  }
  return './';
}

export default defineConfig(({ command }) => ({
  base: command === 'build' ? productionBase() : '/',
  plugins: [react()],
  /** 开发/预览时绑定 0.0.0.0，同网段设备可用本机局域网 IP 访问 */
  /**
   * 与 Vite 默认 5173 错开：本机若先跑「学生管理平台」等，5173 会指向别的仓库，
   * 浏览器打开 localhost:5173 永远不是本项目的社区页。
   * strictPort: false — 若 51730 被占用，终端里会打印实际端口（请用该 URL）。
   */
  server: { host: true, port: 51730, strictPort: false },
  preview: { host: true, port: 4173 },
}));
