import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { appConfig } from '@main/infra/config'

export function createMainWindow(): BrowserWindow {
  const { window: w } = appConfig.get()
  const win = new BrowserWindow({
    width:     w.width,
    height:    w.height,
    minWidth:  w.minWidth,
    minHeight: w.minHeight,
    show: false,
    autoHideMenuBar: !is.dev,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  win.on('ready-to-show', () => {
    win.show()
    if (is.dev) win.webContents.openDevTools()
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}
