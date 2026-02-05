
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Menggunakan default node process atau empty string jika undefined
  const currentDir = (process as any).cwd ? (process as any).cwd() : '';
  const env = loadEnv(mode, currentDir, '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    }
  };
});
