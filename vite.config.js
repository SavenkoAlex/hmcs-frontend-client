import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import svgLoader from 'vite-svg-loader'
const path = require('path')


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    svgLoader()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: ['.mjs', '.ts', '.jsx', '.tsx', '.json', ],
  },
  esbuild: {
    jsxFactory: 'h',
  },
  server: {
    cors: {
      origin: true
    }
  }
})
