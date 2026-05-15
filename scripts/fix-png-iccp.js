/**
 * 移除 PNG 文件中错误的 iCCP chunk，消除 libpng 警告
 * 用法: node scripts/fix-png-iccp.js [目录]
 */
const fs = require('fs')
const path = require('path')

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

function isPNG(buf) {
  return buf.length >= 8 && PNG_SIGNATURE.every((b, i) => buf[i] === b)
}

function removeICCPChunk(buf) {
  if (!isPNG(buf)) return null

  const chunks = []
  let offset = 8 // skip PNG signature
  let hadICCP = false

  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset)
    const type = buf.toString('ascii', offset + 4, offset + 8)
    const chunkEnd = offset + 12 + length

    if (type === 'iCCP') {
      hadICCP = true
    } else {
      chunks.push(buf.slice(offset, chunkEnd))
    }
    offset = chunkEnd
  }

  if (!hadICCP) return null

  return Buffer.concat([PNG_SIGNATURE, ...chunks])
}

function processDir(dir) {
  let fixed = 0
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      fixed += processDir(fullPath)
    } else if (entry.name.endsWith('.png')) {
      try {
        const buf = fs.readFileSync(fullPath)
        const fixed_buf = removeICCPChunk(buf)
        if (fixed_buf) {
          fs.writeFileSync(fullPath, fixed_buf)
          console.log('fixed:', fullPath)
          fixed++
        }
      } catch (e) {
        console.warn('skip:', fullPath, e.message)
      }
    }
  }
  return fixed
}

const targetDir = process.argv[2] || path.join(__dirname, '..', 'node_modules')
console.log('扫描目录:', targetDir)
const count = processDir(targetDir)
console.log(`完成，修复了 ${count} 个文件`)
