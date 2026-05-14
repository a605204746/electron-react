export const NOTE_NS = 'note' as const

export interface Note {
  id:        number
  title:     string
  content:   string
  createdAt: number
  updatedAt: number
}

export interface CreateNoteInput {
  title:    string
  content?: string
}

export interface UpdateNoteInput {
  id:       number
  title?:   string
  content?: string
}
