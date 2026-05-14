import { useState, useEffect, useRef } from 'react'
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons'
import { noteApi } from '../api/note'
import type { Note } from '@shared/types/note'

export default function NotePage() {
  const [notes,    setNotes]    = useState<Note[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)

  const active = notes.find(n => n.id === activeId) ?? null

  useEffect(() => {
    noteApi.list().then(list => { setNotes(list); setLoading(false) })
  }, [])

  const createNote = async () => {
    const note = await noteApi.create({ title: '新笔记', content: '' })
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
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        background: '#07101e',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 14px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 13 }}>笔记</div>
              <div style={{ color: '#2d3d55', fontSize: 10, marginTop: 2 }}>SQLite · better-sqlite3</div>
            </div>
            <button onClick={createNote} style={iconBtnStyle('#34d399')}>
              <PlusOutlined style={{ fontSize: 12 }} />
            </button>
          </div>
        </div>

        {/* Note list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 8px' }} className="scroll-thin">
          {loading && (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#2d3d55', fontSize: 12 }}>加载中…</div>
          )}
          {!loading && notes.length === 0 && (
            <div style={{ padding: '24px 8px', textAlign: 'center', color: '#2d3d55', fontSize: 12 }}>
              暂无笔记<br />
              <span style={{ fontSize: 10 }}>点击 + 新建</span>
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
            <EditOutlined style={{ fontSize: 36, color: '#1e2d40' }} />
            <div style={{ color: '#2d3d55', fontSize: 13 }}>选择一条笔记，或新建</div>
            <button onClick={createNote} style={{
              padding: '7px 18px', borderRadius: 8, border: '1px solid rgba(52,211,153,0.3)',
              background: 'rgba(52,211,153,0.08)', color: '#34d399', fontSize: 13, cursor: 'pointer',
            }}>
              <PlusOutlined style={{ marginRight: 6, fontSize: 11 }} />新建笔记
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
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '9px 10px', borderRadius: 8, marginBottom: 3, cursor: 'pointer',
        background: active ? 'rgba(34,211,168,0.08)' : hov ? 'rgba(255,255,255,0.03)' : 'transparent',
        border: `1px solid ${active ? 'rgba(34,211,168,0.2)' : 'transparent'}`,
        display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.12s',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: active ? '#22d3a8' : '#94a3b8', fontSize: 12, fontWeight: active ? 600 : 400,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{note.title || '(无标题)'}</div>
        <div style={{
          color: '#2d3d55', fontSize: 10, marginTop: 2,
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
  const [title,   setTitle]   = useState(note.title)
  const [content, setContent] = useState(note.content)
  const dirty = title !== note.title || content !== note.content

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleAutoSave = (t: string, c: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSave(note.id, t, c), 800)
  }

  const changeTitle = (v: string) => { setTitle(v); scheduleAutoSave(v, content) }
  const changeContent = (v: string) => { setContent(v); scheduleAutoSave(title, v) }

  const saveNow = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    onSave(note.id, title, content)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 28px' }}>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <input
          value={title}
          onChange={e => changeTitle(e.target.value)}
          placeholder="笔记标题"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#e2e8f0', fontSize: 20, fontWeight: 700,
            borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 8,
          }}
        />
        <button
          onClick={saveNow}
          disabled={!dirty || saving}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500,
            background: dirty ? 'rgba(52,211,153,0.12)' : 'transparent',
            border: `1px solid ${dirty ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.06)'}`,
            color: dirty ? '#34d399' : '#2d3d55',
            cursor: dirty ? 'pointer' : 'default', transition: 'all 0.15s',
          }}
        >
          <CheckOutlined style={{ fontSize: 11 }} />
          {saving ? '保存中…' : dirty ? '保存' : '已保存'}
        </button>
      </div>

      {/* Meta */}
      <div style={{ color: '#1e2d40', fontSize: 10, marginBottom: 16, fontFamily: 'monospace' }}>
        ID: {note.id} · 创建: {fmtTs(note.createdAt)} · 更新: {fmtTs(note.updatedAt)}
      </div>

      {/* Content */}
      <textarea
        value={content}
        onChange={e => changeContent(e.target.value)}
        placeholder="在这里记录内容…"
        style={{
          flex: 1, background: '#060b14',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
          padding: '14px 16px', color: '#94a3b8', fontSize: 13, lineHeight: '1.7',
          outline: 'none', resize: 'none', fontFamily: "'Consolas', monospace",
        }}
      />

      {/* IPC hint */}
      <div style={{
        marginTop: 12, padding: '10px 14px',
        background: 'rgba(255,255,255,0.02)', borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.04)',
        color: '#1e2d40', fontSize: 10, lineHeight: '1.6',
      }}>
        <span style={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>数据链路</span>
        {'  '}noteApi.update() → ipcRenderer.invoke → ipcMain.handle → noteService → better-sqlite3 → app.db
      </div>
    </div>
  )
}

function fmtTs(unix: number): string {
  return new Date(unix * 1000).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function iconBtnStyle(color: string): React.CSSProperties {
  return {
    width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: `rgba(${hexToRgb(color)},0.1)`, border: `1px solid rgba(${hexToRgb(color)},0.25)`,
    borderRadius: 6, color, cursor: 'pointer', flexShrink: 0, transition: 'all 0.12s',
  }
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
