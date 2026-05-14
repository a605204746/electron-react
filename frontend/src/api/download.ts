import { DOWNLOAD_NS } from '@shared/types/download'
import type { DownloadEventMap, LastDownloadEvent } from '@shared/types/download'
import { createApi, createEvents } from './_ipc'

export const downloadApi = createApi<{
  start:        (url: string) => Promise<void>
  cancel:       () => Promise<void>
  getLastEvent: () => Promise<LastDownloadEvent>
}>(DOWNLOAD_NS)

export const downloadEvents = createEvents<DownloadEventMap>(DOWNLOAD_NS)
