import { IpcError } from '@shared/types/ipc'
import type { IpcResponse } from '@shared/types/ipc'

declare global {
  interface Window {
    ipc: {
      invoke: (channel: string, ...args: any[]) => Promise<IpcResponse<any>>
      on:  (channel: string, fn: (...args: any[]) => void) => void
      off: (channel: string, fn: (...args: any[]) => void) => void
    }
  }
}

/** 渲染进程 → 主进程：请求-响应，自动解包结构化响应，失败时抛出 IpcError */
export function createApi<T extends Record<string, (...args: any[]) => Promise<any>>>(
  namespace: string,
): T {
  return new Proxy({} as T, {
    get(_, method: string) {
      return async (...args: any[]) => {
        const res = await window.ipc.invoke(`${namespace}:${method}`, ...args)
        if (!res.ok) throw new IpcError(res.message, res.code)
        return res.data
      }
    },
  })
}

export type EventHandle<T> = {
  [K in keyof T]: {
    on:   (fn: T[K]) => void
    off:  (fn: T[K]) => void
    once: (fn: T[K]) => void
  }
}

/**
 * 主进程 → 渲染进程：事件订阅
 * Proxy 内部缓存每个事件的 handle 对象，确保 `events.xxx` 引用稳定，
 * 可以安全放入 useEffect 依赖数组。
 */
export function createEvents<T extends object>(namespace: string): EventHandle<T> {
  const cache = new Map<string, EventHandle<T>[keyof T]>()

  return new Proxy({} as EventHandle<T>, {
    get(_, event: string) {
      if (!cache.has(event)) {
        const channel = `${namespace}:${event}`
        cache.set(event, {
          on:  (fn: any) => window.ipc.on(channel, fn),
          off: (fn: any) => window.ipc.off(channel, fn),
          once: (fn: any) => {
            const wrapper = (...args: any[]) => {
              fn(...args)
              window.ipc.off(channel, wrapper)
            }
            window.ipc.on(channel, wrapper)
          },
        })
      }
      return cache.get(event)!
    },
  })
}
