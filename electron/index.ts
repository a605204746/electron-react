import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { appConfig } from './infra/config'
import { closeDb } from './infra/database'
import { createMainWindow } from './window/mainWindow'
import appConfigJson from '../app.config.json'

// Vite dev 模式需要 unsafe-eval，关掉 Electron 的安全提示避免噪音
if (is.dev) process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

// 自动加载 controller 目录下所有 controller（Vite 构建时展开）
import.meta.glob('./controller/*.controller.ts', { eager: true })

// dev 模式：启动时杀掉上一个实例，避免重复开窗口
if (is.dev) {
  const pidFile = join(app.getPath('temp'), 'electron-xianyu.pid')
  if (existsSync(pidFile)) {
    try {
      const oldPid = parseInt(readFileSync(pidFile, 'utf-8').trim(), 10)
      if (oldPid && oldPid !== process.pid) process.kill(oldPid)
    } catch { /* 进程已退出，忽略 */ }
  }
  writeFileSync(pidFile, String(process.pid))
  app.on('quit', () => { try { unlinkSync(pidFile) } catch {} })
}

app.whenReady().then(() => {
  appConfig.load()

  electronApp.setAppUserModelId(appConfigJson.branding.appUserModelId)
  app.on('browser-window-created', (_, win) => { optimizer.watchWindowShortcuts(win) })

  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  closeDb()
  if (process.platform !== 'darwin') app.quit()
})
