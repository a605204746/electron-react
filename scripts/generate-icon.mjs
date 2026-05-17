import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'resources')
mkdirSync(outDir, { recursive: true })

const SIZE = 256
const RADIUS = 40

// 圆角矩形 SVG 背景 + 文字
const svg = `
<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5"/>
      <stop offset="100%" style="stop-color:#7C3AED"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="${SIZE - 8}" height="${SIZE - 8}" rx="${RADIUS}" ry="${RADIUS}" fill="url(#bg)"/>
  <text x="128" y="148" font-family="Arial, Helvetica, sans-serif" font-size="96" font-weight="bold"
        fill="white" text-anchor="middle" dominant-baseline="central">ER</text>
</svg>`

async function generate() {
  // PNG (256x256, 用于 Linux)
  await sharp(Buffer.from(svg))
    .resize(SIZE, SIZE)
    .png()
    .toFile(join(outDir, 'icon.png'))

  // ICO (包含 16/32/48/64/128/256 多尺寸, 用于 Windows)
  const sizes = [16, 32, 48, 64, 128, 256]
  const pngBuffers = await Promise.all(
    sizes.map(s => sharp(Buffer.from(svg)).resize(s, s).png().toBuffer())
  )
  await writeIco(join(outDir, 'icon.ico'), pngBuffers, sizes)

  // ICNS (macOS) — electron-builder 支持从 PNG 自动转换，这里直接复制 PNG 即可
  // macOS 打包时 electron-builder 会自动处理 icon.png -> icon.icns
  // 但为了明确，我们还是用 PNG 就行

  console.log('Icons generated in', outDir)
}

// 写 ICO 文件格式
function writeIco(filePath, pngBuffers, sizes) {
  const count = pngBuffers.length
  // ICO header: 6 bytes
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)   // reserved
  header.writeUInt16LE(1, 2)   // type: ICO
  header.writeUInt16LE(count, 4)

  // 目录项: 每个 16 bytes
  const dirEntries = []
  let dataOffset = 6 + count * 16
  for (let i = 0; i < count; i++) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 0)  // width (0 = 256)
    entry.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 1)  // height
    entry.writeUInt8(0, 2)   // palette
    entry.writeUInt8(0, 3)   // reserved
    entry.writeUInt16LE(1, 4) // color planes
    entry.writeUInt16LE(32, 6) // bits per pixel
    entry.writeUInt32LE(pngBuffers[i].length, 8)  // size
    entry.writeUInt32LE(dataOffset, 12) // offset
    dirEntries.push(entry)
    dataOffset += pngBuffers[i].length
  }

  const allData = Buffer.concat([header, ...dirEntries, ...pngBuffers])
  writeFileSync(filePath, allData)
}

generate().catch(err => { console.error(err); process.exit(1) })