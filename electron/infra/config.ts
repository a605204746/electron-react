import { app } from 'electron'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { createLogger } from './logger'
import type { AppConfig } from '@shared/config'
import { DEFAULT_CONFIG } from '@shared/config'

const logger = createLogger('config')

/** 统一数据目录：使用 userData 路径，打包后仍可写 */
export function getDataDir(): string {
  return join(app.getPath('userData'), 'data')
}

function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const result = { ...base }
  for (const key in override) {
    const val = override[key]
    if (val !== null && val !== undefined && typeof val === 'object' && !Array.isArray(val)) {
      result[key] = deepMerge(base[key] as object, val as object) as T[typeof key]
    } else if (val !== undefined) {
      result[key] = val as T[typeof key]
    }
  }
  return result
}

let _config: AppConfig = structuredClone(DEFAULT_CONFIG)

export const appConfig = {
  load(): AppConfig {
    try {
      const dir  = getDataDir()
      const file = join(dir, 'app.config.json')
      mkdirSync(dir, { recursive: true })

      if (!existsSync(file)) {
        writeFileSync(file, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8')
        logger.info('config created with defaults', { file })
      } else {
        const raw = JSON.parse(readFileSync(file, 'utf-8'))
        _config = deepMerge(DEFAULT_CONFIG, raw)
        logger.info('config loaded', { file })
      }
    } catch (e) {
      logger.warn('config load failed, using defaults', e)
    }
    return _config
  },

  get(): AppConfig {
    return _config
  },

  save(patch: Partial<AppConfig>): void {
    _config = deepMerge(_config, patch)
    try {
      const file = join(getDataDir(), 'app.config.json')
      writeFileSync(file, JSON.stringify(_config, null, 2), 'utf-8')
      logger.info('config saved')
    } catch (e) {
      logger.error('config save failed', e)
    }
  },
}
