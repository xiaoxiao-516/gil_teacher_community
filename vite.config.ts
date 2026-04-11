import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  /** 生产包用相对路径，整夹拷贝到任意目录或 U 盘仍可加载资源 */
  base: command === 'build' ? './' : '/',
  plugins: [react()],
  /** 开发/预览时绑定 0.0.0.0，同网段设备可用本机局域网 IP 访问 */
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
}));
