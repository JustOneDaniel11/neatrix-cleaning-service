import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        admin: path.resolve(__dirname, 'admin.html')
      }
    }
  },
  server: {
    port: 5174,
    strictPort: true,
    open: '/admin.html',
    fs: {
      // Allow importing files from the project root and shared directory
      allow: [
        path.resolve(__dirname, '..'),
        path.resolve(__dirname, '../shared')
      ]
    }
  },
  clearScreen: false,
  root: '.',
  // Configure error overlay
  hmr: {
    overlay: {
      errors: true,
      warnings: false
    }
  }
})