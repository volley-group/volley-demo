import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import unfonts from 'unplugin-fonts/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const stage = loadEnv(mode, process.cwd()).VITE_STAGE;
  const apiUrl = `https://b4bd5w7k5n3jqfd4cxqxvpyhum0jyojq.lambda-url.us-east-1.on.aws`;
  console.log('apiUrl', apiUrl);

  return {
    plugins: [
      TanStackRouterVite(),
      react(),
      unfonts({
        custom: {
          families: [
            {
              name: 'Geist',
              src: './src/assets/fonts/geist/variable/Geist[wght].ttf',
            },
            {
              name: 'Roboto Mono',
              src: [
                './src/assets/fonts/roboto_mono/RobotoMono-VariableFont_wght.ttf',
                './src/assets/fonts/roboto_mono/RobotoMono-Italic-VariableFont_wght.ttf',
              ],
            },
          ],
        },
      }),
    ],
    server: {
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          cookiePathRewrite: {
            '*': '/',
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
