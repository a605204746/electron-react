import { useState, useEffect, useRef } from 'react'
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons'
import { noteApi } from '../api/note'
import type { Note } from '@shared/types/note'
import { useTheme } from '../infra/theme'
import { useLang } from '../infra/i18n'

export default function NotePage() {
  const { t } = useTheme()
  const { tr } = useLang()
  const [notes,    setNotes]    = useState<Note[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)

  const active = notes.find(n => n.id === activeId) ?? null

  useEffect(() => {
    noteApi.list().then(list => { setNotes(list); setLoading(false) })
  }, [])

  const createNote = async () => {
    const note = await noteApi.create({ title: tr.note.newNote, content: '' })
    setNotes(prev => [note, ...prev])
    setActiveId(note.id)
  }

  const deleteNote = async (id: number) => {
    await noteApi.delete(id)
    setNotes(prev => prev.filter(n => n.id !== id))
    if (activeId === id) setActiveId(notes.find(n => n.id !== id)?.id ?? null)
  }

  const saveNote = async (id: number, title: string, content: string) => {
    setSaving(true)
    try {
      const updated = await noteApi.update({ id, title, content })
      setNotes(prev => prev.map(n => n.id === id ? updated : n))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-enter" style={{ display: 'flex', height: '100%', padding: 0 }}>

      {/* ── List panel ── */}
      <div style={{
        width: 220, flexShrink: 0,
        borderRight: `1px solid ${t.borderSubtle}`,
        display: 'flex', flexDirection: 'column',
        background: t.bgSidebar,
        transition: 'background 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 14px 12px', borderBottom: `1px solid ${t.borderSubtle}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: t.text, fontWeight: 700, fontSize: 14 }}>{tr.note.title}</div>
              <div style={{ color: t.textFaint, fontSize: 10, marginTop: 2 }}>SQLite · better-sqlite3</div>
            </div>
            <button onClick={createNote} style={iconBtnStyle('#34d399')}>
              <PlusOutlined style={{ fontSize: 12 }} />
            </button>
          </div>
        </div>

        {/* Note list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 8px' }} className="scroll-thin">
          {loading && (
            <div style={{ padding: '24px 0', textAlign: 'center', color: t.textFaint, fontSize: 12 }}>{tr.note.loading}</div>
          )}
          {!loading && notes.length === 0 && (
            <div style={{ padding: '24px 8px', textAlign: 'center', color: t.textFaint, fontSize: 12 }}>
              {tr.note.empty}<br />
              <span style={{ fontSize: 10 }}>{tr.note.emptyHint}</span>
            </div>
          )}
          {notes.map(note => (
            <NoteItem
              key={note.id}
              note={note}
              active={note.id === activeId}
              onSelect={() => setActiveId(note.id)}
              onDelete={() => deleteNote(note.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Editor panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {active ? (
          <Editor key={active.id} note={active} saving={saving} onSave={saveNote} />
        ) : (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <EditOutlined style={{ fontSize: 36, color: t.textFaint, opacity: 0.4 }} />
            <div style={{ color: t.textSub, fontSize: 13 }}>{tr.note.selectHint}</div>
            <button onClick={createNote} style={{
              padding: '7px 18px', borderRadius: 8, border: '1px solid rgba(52,211,153,0.3)',
              background: 'rgba(52,211,153,0.08)', color: '#34d399', fontSize: 13, cursor: 'pointer', outline: 'none',
            }}>
              <PlusOutlined style={{ marginRight: 6, fontSize: 11 }} />{tr.note.newNote}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function NoteItem({ note, active, onSelect, onDelete }: {
  note: Note; active: boolean
  onSelect: () => void; onDelete: () => void
}) {
  const { t } = useTheme()
  const { tr } = useLang()
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '9px 10px', borderRadius: 8, marginBottom: 3, cursor: 'pointer',
        background: active ? t.navActiveBg : hov ? t.navHoverBg : 'transparent',
        border: `1px solid ${active ? t.navActiveColor + '33' : 'transparent'}`,
        display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.12s',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: active ? t.navActiveColor : t.textSub, fontSize: 13, fontWeight: active ? 600 : 400,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{note.title || tr.note.untitled}</div>
        <div style={{
          color: t.textFaint, fontSize: 10, marginTop: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {note.content ? note.content.slice(0, 30) : '—'}
        </div>
      </div>
      {(hov || active) && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          style={iconBtnStyle('#f87171')}
        >
          <DeleteOutlined style={{ fontSize: 10 }} />
        </button>
      )}
    </div>
  )
}

function Editor({ note, saving, onSave }: {
  note: Note; saving: boolean
  onSave: (id: number, title: string, content: string) => void
}) {
  const { t } = useTheme()
  const { tr } = useLang()
  const [title,   setTitle]   = useState(note.title)
  const [content, setContent] = useState(note.content)
  const dirty = title !== note.title || content !== note.content

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleAutoSave = (ti: string, c: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSave(note.id, ti, c), 800)
  }

  const changeTitle = (v: string) => { setTitle(v); scheduleAutoSave(v, content) }
  const changeContent = (v: string) => { setContent(v); scheduleAutoSave(title, v) }

  const saveNow = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    onSave(note.id, title, content)
  }

  const saveLabel = saving ? tr.note.saving : dirty ? tr.note.save : tr.note.saved

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 28px' }}>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <input
          value={title}
          onChange={e => changeTitle(e.target.value)}
          placeholder={tr.note.titlePlaceholder}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: t.text, fontSize: 20, fontWeight: 700,
            borderBottom: `1px solid ${t.border}`, paddingBottom: 8,
          }}
        />
        <button
          onClick={saveNow}
          disabled={!dirty || saving}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500,
            background: dirty ? 'rgba(52,211,153,0.12)' : 'transparent',
            border: `1px solid ${dirty ? 'rgba(52,211,153,0.3)' : t.border}`,
            color: dirty ? '#34d399' : t.textFaint,
            cursor: dirty ? 'pointer' : 'default', transition: 'all 0.15s', outline: 'none',
          }}
        >
          <CheckOutlined style={{ fontSize: 11 }} />
          {saveLabel}
        </button>
      </div>

      {/* Meta */}
      <div style={{ color: t.textFaint, fontSize: 10, marginBottom: 16, fontFamily: 'monospace' }}>
        ID: {note.id} · {fmtMeta(note.createdAt, note.updatedAt, tr.note.locale)}
      </div>

      {/* Content */}
      <textarea
        value={content}
        onChange={e => changeContent(e.target.value)}
        placeholder={tr.note.contentPlaceholder}
        style={{
          flex: 1, background: t.bgDeep,
          border: `1px solid ${t.border}`, borderRadius: 10,
          padding: '14px 16px', color: t.textSub, fontSize: 13, lineHeight: '1.7',
          outline: 'none', resize: 'none', fontFamily: "'Consolas', monospace",
        }}
      />

      {/* IPC hint */}
      <div style={{
        marginTop: 12, padding: '10px 14px',
        background: t.bgCard, borderRadius: 8,
        border: `1px solid ${t.borderSubtle}`,
        color: t.textFaint, fontSize: 10, lineHeight: '1.6',
      }}>
        <span style={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{tr.note.dataFlow}</span>
        {'  '}noteApi.update() → ipcRenderer.invoke → ipcMain.handle → noteService → better-sqlite3 → app.db
      </div>
    </div>
  )
}

function fmtTs(unix: number, locale: string): string {
  return new Date(unix * 1000).toLocaleString(locale, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function fmtMeta(createdAt: number, updatedAt: number, locale: string): string {
  if (locale === 'zh-CN') {
    return `创建: ${fmtTs(createdAt, locale)} · 更新: ${fmtTs(updatedAt, locale)}`
  }
  return `Created: ${fmtTs(createdAt, locale)} · Updated: ${fmtTs(updatedAt, locale)}`
}

function iconBtnStyle(color: string): React.CSSProperties {
  return {
    width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: `rgba(${hexToRgb(color)},0.1)`, border: `1px solid rgba(${hexToRgb(color)},0.25)`,
    borderRadius: 6, color, cursor: 'pointer', flexShrink: 0, transition: 'all 0.12s', outline: 'none',
  }
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
