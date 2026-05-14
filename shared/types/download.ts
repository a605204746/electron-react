export const DOWNLOAD_NS = 'download' as const

export interface DownloadProgress {
  percent: number
  speed: string
  downloaded: string
  total: string
}

export interface DownloadEventMap {
  progress: (payload: DownloadProgress) => void
  done:     (filePath: string) => void
  error:    (message: string) => void
}

export type LastDownloadEvent =
  | { type: 'done';  payload: string }
  | { type: 'error'; payload: string }
  | null
