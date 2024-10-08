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
  server: process.env.NODE_ENV === 'production' ? {} : {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/taro.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/taro.cert'))
    },
    cors: {
      origin: false
    },
    proxy: {
      '/api' : {
        target: 'https://localhost:3000',
        changeOrigin: false,
        secure: false
      },
      '/janus': {
        target: 'https://192.168.0.115',
        secure: false
      },
      '/rtmp': {
        target: 'https://192.168.0.115:1935/live',
        secure: true  
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

