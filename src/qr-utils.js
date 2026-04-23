import QRCode from 'qrcode'

export const QR_STYLES = [
  { value: 'classic', label: 'Klassisch' },
  { value: 'dots', label: 'Punkte' },
  { value: 'rounded', label: 'Rund' },
]

export const presets = {
  url: 'https://example.com',
  text: 'Hallo Boss',
  wifi: 'WIFI:T:WPA;S:MeinWLAN;P:geheimespasswort;;',
}

export const DEFAULT_STATE = {
  preset: 'url',
  content: presets.url,
  size: 320,
  margin: 2,
  logoDataUrl: '',
  logoName: '',
  logoScale: 0.18,
  qrStyle: 'classic',
}

export const MAX_RENDER_SIZE = 1024
export const MIN_LOGO_SCALE = 0.08
export const MAX_LOGO_SCALE = 0.28

export function createState(initialState = DEFAULT_STATE) {
  return { ...initialState }
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function getQRText(content) {
  return content.trim()
}

export function normalizeQRStyle(value) {
  return QR_STYLES.some((style) => style.value === value) ? value : 'classic'
}

export function getRenderOptions({ size, margin, hasLogo }) {
  return {
    width: size,
    margin,
    errorCorrectionLevel: hasLogo ? 'H' : 'M',
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  }
}

export function getLogoMetrics(canvasSize, logoScale) {
  const logoSize = clamp(canvasSize * logoScale, canvasSize * MIN_LOGO_SCALE, canvasSize * MAX_LOGO_SCALE)
  const padding = Math.max(10, logoSize * 0.18)
  const boxSize = logoSize + padding * 2

  return {
    logoSize,
    padding,
    boxSize,
    x: (canvasSize - boxSize) / 2,
    y: (canvasSize - boxSize) / 2,
  }
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, radius)
    ctx.fill()
    return
  }

  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
  ctx.fill()
}

function isFinderModule(row, col, size) {
  const lastFinderStart = size - 7
  return (
    (row < 7 && col < 7) ||
    (row < 7 && col >= lastFinderStart) ||
    (row >= lastFinderStart && col < 7)
  )
}

function isTimingModule(row, col) {
  return row === 6 || col === 6
}

function isSpecialModule(row, col, size) {
  return isFinderModule(row, col, size) || isTimingModule(row, col)
}

function drawModule(ctx, style, x, y, size, isSpecial) {
  if (style === 'dots' && !isSpecial) {
    const diameter = size * 0.78
    const offset = (size - diameter) / 2
    ctx.beginPath()
    ctx.arc(x + size / 2, y + size / 2, diameter / 2, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  if (style === 'rounded' && !isSpecial) {
    drawRoundedRect(ctx, x + size * 0.08, y + size * 0.08, size * 0.84, size * 0.84, size * 0.28)
    return
  }

  ctx.fillRect(x, y, size, size)
}

export function renderStyledQRCode(canvas, text, options = {}) {
  const {
    width,
    margin = 2,
    color = { dark: '#0f172a', light: '#ffffff' },
    errorCorrectionLevel = 'M',
    style = 'classic',
  } = options

  const qr = QRCode.create(text, { errorCorrectionLevel })
  const size = qr.modules.size
  const totalSize = size + margin * 2
  const cellSize = width / totalSize

  canvas.width = width
  canvas.height = width

  const ctx = canvas.getContext('2d')
  ctx.fillStyle = color.light
  ctx.fillRect(0, 0, width, width)

  ctx.fillStyle = color.dark
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!qr.modules.data[row * size + col]) continue
      const x = (margin + col) * cellSize
      const y = (margin + row) * cellSize
      drawModule(ctx, style, x, y, cellSize, isSpecialModule(row, col, size))
    }
  }

  return qr
}
