/**
 * sync-config.mjs
 *
 * 读取 app.config.json，同步配置到：
 *   - package.json          (name, author, description)
 *   - electron-builder.yml  (appId, productName, copyright, author, icon)
 *   - frontend/index.html   (<title>)
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const ROOT = join(SCRIPT_DIR, '..')
const config = JSON.parse(readFileSync(join(ROOT, 'app.config.json'), 'utf-8'))
const branding = config.branding

const npmName = branding.productName.toLowerCase().replace(/\s+/g, '-')

// ── package.json ──
const pkgPath = join(ROOT, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
pkg.name        = npmName
pkg.author      = branding.author
pkg.description = branding.description
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
console.log('✅ package.json synced')

// ── electron-builder.yml ──
const ymlPath = join(ROOT, 'electron-builder.yml')
const lines = readFileSync(ymlPath, 'utf-8').split('\n')
let section = ''
for (let i = 0; i < lines.length; i++) {
  if (/^appId:/.test(lines[i]))       lines[i] = `appId: ${branding.appId}`
  if (/^productName:/.test(lines[i])) lines[i] = `productName: ${branding.productName}`
  if (/^copyright:/.test(lines[i]))   lines[i] = `copyright: ${branding.copyright}`
  if (/^author:/.test(lines[i]))      lines[i] = `author: ${branding.author}`

  if (/^win:/.test(lines[i]))   section = 'win'
  if (/^mac:/.test(lines[i]))   section = 'mac'
  if (/^linux:/.test(lines[i])) section = 'linux'
  if (/^(nsis|directories|files):/.test(lines[i])) section = ''

  if (section && /^  icon:/.test(lines[i])) {
    lines[i] = `  icon: ${branding.icon[section] || branding.icon.win}`
  }
}
writeFileSync(ymlPath, lines.join('\n'))
console.log('✅ electron-builder.yml synced')

// ── frontend/index.html ──
const htmlPath = join(ROOT, 'frontend', 'index.html')
let html = readFileSync(htmlPath, 'utf-8')
html = html.replace(/<title>.*<\/title>/, `<title>${branding.title}</title>`)
writeFileSync(htmlPath, html)
console.log('✅ frontend/index.html synced')

console.log('\n🎉 All config synced from app.config.json')