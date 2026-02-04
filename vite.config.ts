import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Konfigurasi ini bertugas "menerjemahkan" process.env agar bisa dibaca oleh browser/HP
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    }
  };
});