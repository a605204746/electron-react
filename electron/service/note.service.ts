import { getDb } from '@main/infra/database'
import { createLogger } from '@main/infra/logger'
import type { Note, CreateNoteInput, UpdateNoteInput } from '@shared/types/note'

const logger = createLogger('note.service')

function toNote(row: Record<string, unknown>): Note {
  return {
    id:        row.id         as number,
    title:     row.title      as string,
    content:   row.content    as string,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  }
}

export const noteService = {
  list(): Note[] {
    return (getDb()
      .prepare('SELECT * FROM notes ORDER BY updated_at DESC')
      .all() as Record<string, unknown>[])
      .map(toNote)
  },

  create(input: CreateNoteInput): Note {
    const row = getDb()
      .prepare('INSERT INTO notes (title, content) VALUES (@title, @content) RETURNING *')
      .get({ title: input.title, content: input.content ?? '' }) as Record<string, unknown>
    logger.info('note created', { id: row.id })
    return toNote(row)
  },

  update(input: UpdateNoteInput): Note {
    const db      = getDb()
    const now     = Math.floor(Date.now() / 1000)
    const clauses = ['updated_at = @now']
    const params: Record<string, unknown> = { now, id: input.id }

    if (input.title   !== undefined) { clauses.push('title = @title');     params.title   = input.title   }
    if (input.content !== undefined) { clauses.push('content = @content'); params.content = input.content }

    const row = db
      .prepare(`UPDATE notes SET ${clauses.join(', ')} WHERE id = @id RETURNING *`)
      .get(params) as Record<string, unknown> | undefined

    if (!row) throw new Error(`Note ${input.id} not found`)
    logger.info('note updated', { id: input.id })
    return toNote(row)
  },

  delete(id: number): void {
    getDb().prepare('DELETE FROM notes WHERE id = ?').run(id)
    logger.info('note deleted', { id })
  },
}
