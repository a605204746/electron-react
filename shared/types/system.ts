export const SYSTEM_NS = 'system' as const

export interface SystemInfo {
  platform: string
  arch: string
  cpus: number
  totalMemory: string
  freeMemory: string
  hostname: string
  nodeVersion: string
  electronVersion: string
  chromeVersion: string
}
