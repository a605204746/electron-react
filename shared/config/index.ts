export interface WindowConfig {
  width:     number
  height:    number
  minWidth:  number
  minHeight: number
}

export interface TrayConfig {
  enabled: boolean
  tooltip: string
}

export interface LogConfig {
  /** 最低记录级别；生产包默认 'info' */
  level: 'debug' | 'info' | 'warn' | 'error'
  /** 日志文件保留天数（仅生产包） */
  maxDays: number
}

export interface ServerConfig {
  port: number
}

export interface AppConfig {
  window: WindowConfig
  tray:   TrayConfig
  log:    LogConfig
  server: ServerConfig
}

export const DEFAULT_CONFIG: AppConfig = {
  window: { width: 900, height: 640, minWidth: 680, minHeight: 480 },
  tray:   { enabled: false, tooltip: 'Electron App' },
  log:    { level: 'info', maxDays: 7 },
  server: { port: 3000 },
}
