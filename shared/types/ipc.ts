/** 主进程 handler 的统一响应结构，跨进程序列化时不丢字段 */
export type IpcResponse<T> =
  | { ok: true;  data: T }
  | { ok: false; message: string; code?: string }

/** 渲染进程侧统一抛出的 IPC 错误 */
export class IpcError extends Error {
  code?: string
  constructor(message: string, code?: string) {
    super(message)
    this.name = 'IpcError'
    this.code = code
  }
}

/** 允许 invoke 的频道白名单（渲染进程 → 主进程） */
export const INVOKE_CHANNELS = [
  'system:getInfo',
  'file:readFile',
  'download:start',
  'download:cancel',
  'download:getLastEvent',
  'note:list',
  'note:create',
  'note:update',
  'note:delete',
] as const

/** 允许监听的频道白名单（主进程 → 渲染进程） */
export const LISTEN_CHANNELS = [
  'download:progress',
  'download:done',
  'download:error',
] as const

export type InvokeChannel = (typeof INVOKE_CHANNELS)[number]
export type ListenChannel  = (typeof LISTEN_CHANNELS)[number]
