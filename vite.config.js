import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import svgLoader from 'vite-svg-loader'
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import amd from 'rollup-plugin-amd';

const path = require('path')


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    svgLoader(),
    commonjs(),
    resolve({
      exportConditions: ['node']
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: ['.mjs', '.ts', '.jsx', '.tsx', '.json', '.svg'],
  },
  esbuild: {
    jsxFactory: 'h',
  },
  server: {
    cors: {
      origin: true
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/reset.scss";`
      }
    }
  },
  optpimizeDeps: {
    include: ['node_modules']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      esmExternals: true
    },
    rollupOptions: {
      /*
      external: [
        'global/window', 
        'global/document', 
        'safe-json-parse/tuple', 
        '@videojs/vhs-utils/es/byte-helpers',
        '@videojs/vhs-utils/es/id3-helpers',
        '@videojs/vhs-utils/es/resolve-url',
        '@videojs/vhs-utils/es/media-groups',
        '@videojs/vhs-utils/es/decode-b64-to-uint8-array',
        'mux.js/lib/tools/parse-sidx',
        'mux.js/lib/utils/clock',
        '@videojs/vhs-utils/es/containers'
      ]
      */
    },
  },
})
