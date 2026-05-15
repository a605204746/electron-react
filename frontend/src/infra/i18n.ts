import { createContext, useContext } from 'react'

export type Lang = 'en' | 'zh'

export interface Translations {
  nav: {
    home: string;     homeSub: string
    counter: string;  counterSub: string
    system: string;   systemSub: string
    file: string;     fileSub: string
    download: string; downloadSub: string
    note: string;     noteSub: string
    section: string
  }
  theme: { toDark: string; toLight: string }
  welcome: {
    title: string; subtitle: string
    sectionLabel: string; ipcArch: string; github: string
    features: Record<string, { title: string; tag: string; desc: string }>
  }
  counter: { badge: string; desc: string; reset: string }
  system: {
    badge: string; desc: string; refresh: string
    os: string; arch: string; cpuCores: string
    totalMemory: string; freeMemory: string
    hostname: string; nodejs: string; electron: string; chrome: string
    coreSuffix: string
  }
  file: {
    badge: string; pathLabel: string; readBtn: string
    readFailed: string; emptyHint: string
    lineChar: (lines: number, chars: number) => string
  }
  download: {
    badge: string; desc: string; urlLabel: string
    progressLabel: string
    speed: string; downloaded: string; total: string
    done: string; ipcFlow: string
    cancel: string; reset: string; start: string; calculating: string
  }
  note: {
    title: string; loading: string; empty: string; emptyHint: string
    untitled: string; contentPlaceholder: string; titlePlaceholder: string
    selectHint: string; newNote: string
    saving: string; save: string; saved: string; dataFlow: string
    locale: string
  }
}

export const EN: Translations = {
  nav: {
    home: 'Home',         homeSub: 'Overview · Quick Nav',
    counter: 'Counter',   counterSub: 'useState · State Mgmt',
    system: 'System Info', systemSub: 'IPC · Main Process',
    file: 'File Reader',  fileSub: 'IPC · File System',
    download: 'Download', downloadSub: 'IPC · Push Events',
    note: 'Notes',        noteSub: 'SQLite · Local Storage',
    section: 'Examples',
  },
  theme: { toDark: 'Switch to Dark', toLight: 'Switch to Light' },
  welcome: {
    title: 'Electron + React Starter',
    subtitle: 'A ready-to-use desktop app template with IPC communication, local database, file operations, and real-time event push.',
    sectionLabel: 'Example Modules',
    ipcArch: 'IPC Architecture',
    github: 'View on GitHub',
    features: {
      counter:  { title: 'Counter',     tag: 'useState',        desc: 'React basic state management with keyboard shortcuts & bounce animation' },
      system:   { title: 'System Info', tag: 'IPC · Main',      desc: 'Fetch real-time system data from the main process via Electron IPC' },
      file:     { title: 'File Reader', tag: 'IPC · File System', desc: 'Full call chain from renderer to main process for reading local files' },
      download: { title: 'Download',    tag: 'IPC · Push',      desc: 'Main process pushes real-time download progress to the renderer' },
      note:     { title: 'Notes',       tag: 'SQLite',          desc: 'Local CRUD with better-sqlite3 — create, read, update, delete' },
    },
  },
  counter: {
    badge: 'Counter',
    desc: 'Demonstrating React useState basic state management',
    reset: 'Reset',
  },
  system: {
    badge: 'System Info',
    desc: 'Fetch real-time system data from the main process via Electron IPC',
    refresh: 'Refresh',
    os: 'OS', arch: 'Architecture', cpuCores: 'CPU Cores',
    totalMemory: 'Total Memory', freeMemory: 'Free Memory',
    hostname: 'Hostname', nodejs: 'Node.js', electron: 'Electron', chrome: 'Chrome',
    coreSuffix: ' cores',
  },
  file: {
    badge: 'File Reader',
    pathLabel: 'File Path',
    readBtn: 'Read',
    readFailed: 'Read Failed',
    emptyHint: 'Enter an absolute file path and press Enter or click Read',
    lineChar: (lines, chars) => `${lines} lines · ${chars} chars`,
  },
  download: {
    badge: 'Download',
    desc: 'Main process simulates download → defineEmitter pushes progress → renderer updates in real-time',
    urlLabel: 'Download URL',
    progressLabel: 'Progress',
    speed: 'Speed', downloaded: 'Downloaded', total: 'Total',
    done: 'Download Complete',
    ipcFlow: 'IPC Push Flow',
    cancel: 'Cancel', reset: 'Reset', start: 'Download', calculating: 'Calculating...',
  },
  note: {
    title: 'Notes',
    loading: 'Loading...', empty: 'No notes', emptyHint: 'Click + to create',
    untitled: '(Untitled)',
    contentPlaceholder: 'Write your notes here...',
    titlePlaceholder: 'Note Title',
    selectHint: 'Select a note, or create one',
    newNote: 'New Note',
    saving: 'Saving...', save: 'Save', saved: 'Saved',
    dataFlow: 'Data Flow',
    locale: 'en-US',
  },
}

export const ZH: Translations = {
  nav: {
    home: '首页',      homeSub: '项目总览 · 快速导航',
    counter: '计数器', counterSub: 'useState · 状态管理',
    system: '系统信息', systemSub: 'IPC · 主进程通信',
    file: '文件读取',  fileSub: 'IPC · 文件系统',
    download: '下载示例', downloadSub: 'IPC · 主进程推送',
    note: '笔记',     noteSub: 'SQLite · 本地存储',
    section: '示例',
  },
  theme: { toDark: '切换暗色模式', toLight: '切换亮色模式' },
  welcome: {
    title: 'Electron + React 入门模板',
    subtitle: '开箱即用的桌面应用开发模板，包含 IPC 通信、本地数据库、文件操作、事件推送等完整示例',
    sectionLabel: '示例模块',
    ipcArch: 'IPC 通信架构',
    github: '在 GitHub 上查看',
    features: {
      counter:  { title: '计数器',   tag: 'useState',       desc: 'React 基础状态管理，键盘快捷键与弹跳动画' },
      system:   { title: '系统信息', tag: 'IPC · 主进程',   desc: '通过 Electron IPC 从主进程获取实时系统数据' },
      file:     { title: '文件读取', tag: 'IPC · 文件系统', desc: '渲染进程调用主进程读取本地文件的完整链路' },
      download: { title: '下载示例', tag: 'IPC · 事件推送', desc: '主进程主动向渲染进程推送实时下载进度' },
      note:     { title: '笔记',     tag: 'SQLite',         desc: '使用 better-sqlite3 实现本地数据增删改查' },
    },
  },
  counter: {
    badge: '计数器',
    desc: '演示 React useState 基础状态管理',
    reset: '重置',
  },
  system: {
    badge: '系统信息',
    desc: '通过 Electron IPC 从主进程获取实时系统数据',
    refresh: '刷新',
    os: '操作系统', arch: '架构', cpuCores: 'CPU 核心',
    totalMemory: '总内存', freeMemory: '空闲内存',
    hostname: '主机名', nodejs: 'Node.js', electron: 'Electron', chrome: 'Chrome',
    coreSuffix: ' 核',
  },
  file: {
    badge: '文件读取',
    pathLabel: '文件路径',
    readBtn: '读取',
    readFailed: '读取失败',
    emptyHint: '输入文件绝对路径后按回车或点击读取',
    lineChar: (lines, chars) => `${lines} 行 · ${chars} 字符`,
  },
  download: {
    badge: '下载示例',
    desc: '主进程模拟下载 → defineEmitter 推送进度 → 渲染进程实时更新',
    urlLabel: '下载地址',
    progressLabel: '进度',
    speed: '速度', downloaded: '已下载', total: '总大小',
    done: '下载完成',
    ipcFlow: 'IPC 推送链路',
    cancel: '取消', reset: '重置', start: '下载', calculating: '计算中…',
  },
  note: {
    title: '笔记',
    loading: '加载中…', empty: '暂无笔记', emptyHint: '点击 + 新建',
    untitled: '(无标题)',
    contentPlaceholder: '在这里记录内容…',
    titlePlaceholder: '笔记标题',
    selectHint: '选择一条笔记，或新建',
    newNote: '新建笔记',
    saving: '保存中…', save: '保存', saved: '已保存',
    dataFlow: '数据链路',
    locale: 'zh-CN',
  },
}

interface LangContextValue {
  lang: Lang
  tr: Translations
  toggleLang: () => void
}

export const LangContext = createContext<LangContextValue>({
  lang: 'en',
  tr: EN,
  toggleLang: () => {},
})

export const useLang = () => useContext(LangContext)
