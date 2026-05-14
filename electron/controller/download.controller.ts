import { defineIpc } from '@main/utils/ipc'
import { DOWNLOAD_NS } from '@shared/types/download'
import { downloadService } from '@main/service/download.service'

export const downloadController = defineIpc(DOWNLOAD_NS, {
  start:        downloadService.start,
  cancel:       downloadService.cancel,
  getLastEvent: downloadService.getLastEvent,
})
