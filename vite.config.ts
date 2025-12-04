import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Necessário para que o código 'process.env.API_KEY' funcione no navegador
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
      // Polyfill geral para evitar crash se alguma lib usar process.env
      'process.env': {}
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  };
});