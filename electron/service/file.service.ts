import fs from 'fs/promises'

export const fileService = {
  readFile: async (filePath: string): Promise<string> => {
    return fs.readFile(filePath, 'utf-8')
  }
}
