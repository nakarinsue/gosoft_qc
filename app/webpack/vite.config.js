
import { defineConfig, loadEnv } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {"@": path.resolve(__dirname, "./src"),
      },},
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('recharts')) return 'recharts-vendor';
              if (id.includes('lucide-react')) return 'icons-vendor';
              return 'vendor';
            }
          }
        }
      }
    },

    server: {
      host: true,
      port: 4001,
      proxy: {
        '/API': {
          target: 'http://localhost:8000/API/V1', 
          changeOrigin: true,
        rewrite: (path) => path.replace(/^\/API/, '')
        },
        '/V2': {
        target: 'http://localhost:8001', // โดเมนของ Backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/V2/, '')
        },
        '/V1': {
        target: 'http://localhost:8005', // โดเมนของ Backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/V2/, '')
        },
      },
    },
    preview: {
      host: true,
      port: 4001,
      proxy: {
        '/API': {
          target: 'http://localhost:8000/API/V1', 
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/API/, '')
        },
        '/V2': {
        target: 'http://localhost:8001', // โดเมนของ Backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/V2/, '')
        },
      },
    },
  }
})