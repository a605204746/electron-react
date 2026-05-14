import { SYSTEM_NS } from '@shared/types/system'
import type { SystemInfo } from '@shared/types/system'
import { createApi } from './_ipc'

export const systemApi = createApi<{
  getInfo: () => Promise<SystemInfo>
}>(SYSTEM_NS)
