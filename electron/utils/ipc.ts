import { ipcMain, BrowserWindow } from 'electron'
import { createLogger } from '@main/infra/logger'
import type { IpcResponse } from '@shared/types/ipc'

const logger = createLogger('ipc')

type Emitter<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => void ? (...args: A) => void : never
}

/** 渲染进程 → 主进程：注册 invoke handler，自动包装结构化响应 */
export function defineIpc<T extends Record<string, (...args: any[]) => any>>(
  namespace: string,
  handlers: T,
): T {
  Object.entries(handlers).forEach(([method, fn]) => {
    const channel = `${namespace}:${method}`

    if (ipcMain.listenerCount(channel) > 0) {
      logger.warn(`duplicate handler: ${channel}, replacing`)
      ipcMain.removeHandler(channel)
    }

    ipcMain.handle(channel, async (_, ...args) => {
      try {
        const data = await fn(...args)
        return { ok: true, data } satisfies IpcResponse<unknown>
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        logger.error(`handler error: ${channel}`, { message: err.message, code: (err as any).code })
        return {
          ok: false,
          message: err.message,
          code: (err as any).code,
        } satisfies IpcResponse<unknown>
      }
    })
  })
  return handlers
}

/** 主进程 → 渲染进程：创建类型安全的推送器，支持广播和定向发送 */
export function defineEmitter<T extends object>(namespace: string): {
  broadcast: Emitter<T>
  to: (win: BrowserWindow) => Emitter<T>
} {
  const makeProxy = (getTargets: () => BrowserWindow[]): Emitter<T> =>
    new Proxy({} as Emitter<T>, {
      get: (_, event: string) =>
        (...args: any[]) =>
          getTargets()
            .filter(w => !w.isDestroyed())
            .forEach(w => w.webContents.send(`${namespace}:${event}`, ...args)),
    })

  return {
    broadcast: makeProxy(() => BrowserWindow.getAllWindows()),
    to: (win: BrowserWindow) => makeProxy(() => [win]),
  }
}
