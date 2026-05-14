import { defineIpc } from '@main/utils/ipc'
import { SYSTEM_NS } from '@shared/types/system'
import { systemService } from '@main/service/system.service'

export const systemController = defineIpc(SYSTEM_NS, {
  getInfo: systemService.getInfo,
})
