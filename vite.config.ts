import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 本地开发：前端请求 /api/* → https://api.celing.cc/*（避免浏览器 CORS）
      '/api': {
        target: 'https://api.celing.cc',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
})
