import { defineIpc } from '@main/utils/ipc'
import { noteService } from '@main/service/note.service'
import { NOTE_NS } from '@shared/types/note'
import type { CreateNoteInput, UpdateNoteInput } from '@shared/types/note'

defineIpc(NOTE_NS, {
  list:   ()                        => noteService.list(),
  create: (input: CreateNoteInput)  => noteService.create(input),
  update: (input: UpdateNoteInput)  => noteService.update(input),
  delete: (id: number)              => noteService.delete(id),
})
