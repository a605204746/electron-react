type Level = 'debug' | 'info' | 'warn' | 'error'

const IS_DEV = import.meta.env.DEV

const LEVEL_ORDER: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 }
const MIN_LEVEL: Level = IS_DEV ? 'debug' : 'info'

// 浏览器 console CSS 样式
const LEVEL_STYLE: Record<Level, string> = {
  debug: 'color:#22d3ea;font-weight:700',
  info:  'color:#4ade80;font-weight:700',
  warn:  'color:#facc15;font-weight:700',
  error: 'color:#f87171;font-weight:700',
}
const TS_STYLE = 'color:#475569;font-size:10px'
const NS_STYLE = 'color:#94a3b8'
const RESET    = 'color:inherit;font-weight:normal'

function write(level: Level, namespace: string, message: string, meta?: unknown): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) return

  const ts    = new Date().toISOString()
  const label = level.toUpperCase().padEnd(5)

  const fmt = `%c${ts}%c [${label}] %c[${namespace}]%c ${message}`
  const styles = [TS_STYLE, LEVEL_STYLE[level], NS_STYLE, RESET]

  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  meta !== undefined ? fn(fmt, ...styles, meta) : fn(fmt, ...styles)
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
