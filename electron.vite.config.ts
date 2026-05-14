import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const shared = resolve('shared')
const main   = resolve('electron')

export default defineConfig({
  main: {
    build: {
      lib: { entry: resolve('electron/index.ts') }
    },
    resolve: { alias: { '@shared': shared, '@main': main } },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      rollupOptions: {
        input: { index: resolve('electron/preload/index.ts') }
      }
    },
    resolve: { alias: { '@shared': shared } },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: 'frontend',
    build: {
      rollupOptions: {
        input: resolve('frontend/index.html')
      }
    },
    resolve: {
      alias: {
        '@frontend': resolve('frontend/src'),
        '@shared': shared
      }
    },
    plugins: [react()]
  }
})
