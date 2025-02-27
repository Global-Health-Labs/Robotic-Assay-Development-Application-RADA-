import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Create a development env-config.js if it doesn't exist
const createDevEnvConfig = () => {
  const envConfigPath = path.resolve(__dirname, 'public/env-config.js');
  if (!fs.existsSync(envConfigPath)) {
    const content = `window._env_ = {
  VITE_BACKEND_URL: "${process.env.VITE_BACKEND_URL || 'http://localhost:8080'}"
}`;
    fs.writeFileSync(envConfigPath, content);
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'development') {
    createDevEnvConfig();
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        // Exclude env-config.js from the build
        external: ['/env-config.js'],
      },
    },
  };
});
