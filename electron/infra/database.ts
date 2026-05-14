import { join } from 'path'
import { mkdirSync } from 'fs'
import Database from 'better-sqlite3'
import { createLogger } from './logger'
import { getDataDir } from './config'

const logger = createLogger('database')

let _db: Database.Database | null = null

const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    content    TEXT    NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`,
]

export function getDb(): Database.Database {
  if (_db) return _db

  const dir  = getDataDir()
  mkdirSync(dir, { recursive: true })
  const file = join(dir, 'app.db')

  _db = new Database(file)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')

  _db.transaction(() => {
    for (const sql of MIGRATIONS) _db!.exec(sql)
  })()

  logger.info('database opened', { file })
  return _db
}

export function closeDb(): void {
  if (_db) {
    _db.close()
    _db = null
    logger.info('database closed')
  }
}
