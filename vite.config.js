import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import svgLoader from 'vite-svg-loader'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import fs from 'fs'

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
    }),
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
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/taro.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/taro.cert'))
    },
    cors: {
      origin: false
    },
    proxy: {
      '/api' : {
        target: 'https://192.168.0.110:8887',
        changeOrigin: true,
      },
      '/janus': {
        target: 'https://192.168.0.115',
        secure: false
      }
    },
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
  },
})

