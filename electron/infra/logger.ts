import { app } from 'electron'
import { is } from '@electron-toolkit/utils'
import { createWriteStream, mkdirSync } from 'fs'
import { join } from 'path'
import type { WriteStream } from 'fs'
import appConfigJson from '../../app.config.json'

export type Level = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 }
const MIN_LEVEL: Level = is.dev ? 'debug' : (appConfigJson.log.level as Level)

// ANSI 颜色（终端输出）
const C = {
  debug: '\x1b[36m',
  info:  '\x1b[32m',
  warn:  '\x1b[33m',
  error: '\x1b[31m',
  dim:   '\x1b[2m',
  bold:  '\x1b[1m',
  reset: '\x1b[0m',
} as const

let _stream: WriteStream | null = null

function getStream(): WriteStream | null {
  if (_stream) return _stream
  try {
    // 写到 userData/data/logs/（打包后仍可写）
    const dir = join(app.getPath('userData'), 'data', 'logs')
    mkdirSync(dir, { recursive: true })
    const date = new Date().toISOString().slice(0, 10)
    _stream = createWriteStream(join(dir, `${date}.log`), { flags: 'a' })
    app.on('quit', () => { _stream?.end(); _stream = null })
  } catch {
    // app 未就绪时跳过，下次调用再试
  }
  return _stream
}

function write(level: Level, namespace: string, message: string, meta?: unknown): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) return

  const ts = new Date().toISOString()

  // 终端彩色输出（仅 dev）
  if (is.dev) {
    const color = C[level]
    const parts = [
      `${C.dim}${ts}${C.reset}`,
      `${color}${C.bold}${level.toUpperCase().padEnd(5)}${C.reset}`,
      `${C.dim}[${namespace}]${C.reset}`,
      message,
    ].join(' ')
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
    meta !== undefined ? fn(parts, meta) : fn(parts)
  }

  // 始终写入日志文件（dev + prod）
  const metaStr = meta !== undefined ? ' ' + JSON.stringify(meta) : ''
  const line    = `[${ts}] [${level.toUpperCase().padEnd(5)}] [${namespace}] ${message}${metaStr}\n`
  getStream()?.write(line)

  // prod 同时输出到 stdout（方便容器/systemd 收集）
  if (!is.dev) process.stdout.write(line)
}

export function createLogger(namespace: string) {
  return {
    debug: (msg: string, meta?: unknown) => write('debug', namespace, msg, meta),
    info:  (msg: string, meta?: unknown) => write('info',  namespace, msg, meta),
    warn:  (msg: string, meta?: unknown) => write('warn',  namespace, msg, meta),
    error: (msg: string, meta?: unknown) => write('error', namespace, msg, meta),
  }
}

export type Logger = ReturnType<typeof createLogger>
