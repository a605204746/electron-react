import os from 'os'
import type { SystemInfo } from '@shared/types/system'

export const systemService = {
  getInfo: (): SystemInfo => ({
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2),
    freeMemory: (os.freemem() / 1024 / 1024 / 1024).toFixed(2),
    hostname: os.hostname(),
    nodeVersion: process.versions.node,
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome
  })
}
