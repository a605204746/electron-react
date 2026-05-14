import { contextBridge, ipcRenderer } from 'electron'
import { INVOKE_CHANNELS, LISTEN_CHANNELS } from '@shared/types/ipc'

type Fn = (...args: any[]) => void

const invokeSet = new Set<string>(INVOKE_CHANNELS)
const listenSet = new Set<string>(LISTEN_CHANNELS)

// WeakMap 保存包装后的函数引用，确保 removeListener 能找到同一个对象
const wrappers = new WeakMap<Fn, Fn>()

contextBridge.exposeInMainWorld('ipc', {
  invoke: (channel: string, ...args: any[]) => {
    if (!invokeSet.has(channel))
      throw new Error(`[IPC] invoke blocked: "${channel}" is not in allowlist`)
    return ipcRenderer.invoke(channel, ...args)
  },

  on: (channel: string, fn: Fn) => {
    if (!listenSet.has(channel))
      throw new Error(`[IPC] listen blocked: "${channel}" is not in allowlist`)
    const wrapper: Fn = (_, ...args) => fn(...args)
    wrappers.set(fn, wrapper)
    ipcRenderer.on(channel, wrapper)
  },

  off: (channel: string, fn: Fn) => {
    const wrapper = wrappers.get(fn)
    if (wrapper) {
      ipcRenderer.removeListener(channel, wrapper)
      wrappers.delete(fn)
    }
  },
})
