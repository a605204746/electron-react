import { defineIpc } from '@main/utils/ipc'
import { FILE_NS } from '@shared/types/file'
import { fileService } from '@main/service/file.service'

export const fileController = defineIpc(FILE_NS, {
  readFile: fileService.readFile,
})
