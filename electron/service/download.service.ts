import { defineEmitter } from '@main/utils/ipc'
import { createLogger } from '@main/infra/logger'
import { DOWNLOAD_NS } from '@shared/types/download'
import type { DownloadEventMap, DownloadProgress, LastDownloadEvent } from '@shared/types/download'

const logger = createLogger('download.service')
const emit   = defineEmitter<DownloadEventMap>(DOWNLOAD_NS)

let cancelFlag = false
let lastEvent: LastDownloadEvent = null

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatSpeed(bps: number): string {
  return formatBytes(bps) + '/s'
}

function parseFilename(url: string): string {
  try { return new URL(url).pathname.split('/').pop() || 'file.zip' }
  catch { return 'file.zip' }
}

export const downloadService = {
  start: (url: string): void => {
    cancelFlag = false
    lastEvent  = null
    logger.info('download started', { url })

    const totalBytes = 50 * 1024 * 1024
    let downloaded = 0

    const tick = () => {
      if (cancelFlag) {
        const msg = '已取消'
        logger.info('download cancelled')
        emit.broadcast.error(msg)
        lastEvent = { type: 'error', payload: msg }
        return
      }

      const speedBps = (Math.random() * 2000 + 500) * 1024
      const chunk    = Math.min(speedBps / 5, totalBytes - downloaded)
      downloaded    += chunk

      const payload: DownloadProgress = {
        percent:    Math.floor((downloaded / totalBytes) * 100),
        speed:      formatSpeed(speedBps),
        downloaded: formatBytes(downloaded),
        total:      formatBytes(totalBytes),
      }
      emit.broadcast.progress(payload)

      if (downloaded >= totalBytes) {
        const filePath = `C:\\Users\\Demo\\Downloads\\${parseFilename(url)}`
        logger.info('download done', { filePath })
        emit.broadcast.done(filePath)
        lastEvent = { type: 'done', payload: filePath }
      } else {
        setTimeout(tick, 200)
      }
    }

    setTimeout(tick, 100)
  },

  cancel: (): void => {
    logger.info('download cancel requested')
    cancelFlag = true
  },

  getLastEvent: (): LastDownloadEvent => lastEvent,
}
