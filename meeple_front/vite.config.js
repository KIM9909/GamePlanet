import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',  // global 객체를 globalThis로 정의
  },
  server: {
    port: 5173,
    proxy: {
      '/ws': {
        target: 'http://localhost:8090',  // 백엔드 서버 포트로 수정
        ws: true,
      }
    }
  }
})
