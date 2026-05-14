import { createApi } from './_ipc'
import { NOTE_NS } from '@shared/types/note'
import type { Note, CreateNoteInput, UpdateNoteInput } from '@shared/types/note'

export const noteApi = createApi<{
  list:   ()                       => Promise<Note[]>
  create: (input: CreateNoteInput) => Promise<Note>
  update: (input: UpdateNoteInput) => Promise<Note>
  delete: (id: number)             => Promise<void>
}>(NOTE_NS)
