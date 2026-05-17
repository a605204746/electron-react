import type { Level } from '@main/infra/logger'

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
  level:   Level
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

import appConfig from '../../app.config.json'

export const DEFAULT_CONFIG: AppConfig = {
  window: appConfig.window,
  tray:   appConfig.tray,
  log:    { ...appConfig.log, level: appConfig.log.level as Level },
  server: appConfig.server,
}