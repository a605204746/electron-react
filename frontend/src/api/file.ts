import { FILE_NS } from '@shared/types/file'
import { createApi } from './_ipc'

export const fileApi = createApi<{
  readFile: (filePath: string) => Promise<string>
}>(FILE_NS)
