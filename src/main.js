import QRCode from 'qrcode'
import './style.css'
import { clamp, getLogoMetrics, getQRText, getRenderOptions } from './qr-utils.js'

const presets = {
  url: 'https://example.com',
  text: 'Hallo Boss',
  wifi: 'WIFI:T:WPA;S:MeinWLAN;P:geheimespasswort;;',
}

const state = {
  logoDataUrl: '',
  logoName: '',
  renderId: 0,
}

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="shell">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">QRPoint</p>
        <h1>QR-Code einfach erstellen</h1>
        <p class="lead">Link eingeben, QR generieren, fertig.</p>
      </div>

      <div class="card form-card">
        <div class="field-group">
          <label for="preset">Vorlage</label>
          <select id="preset">
            <option value="url">Link</option>
            <option value="text">Text</option>
            <option value="wifi">WLAN</option>
          </select>
        </div>

        <div class="field-group">
          <label for="content">Inhalt</label>
          <textarea id="content" rows="4" placeholder="Text oder Link"></textarea>
        </div>

        <button id="generate" type="button">Erstellen</button>
        <p id="status" class="status">Bereit.</p>

        <details class="advanced-panel">
          <summary>Mehr Einstellungen</summary>

          <div class="advanced-body">
            <div class="row">
              <div class="field-group">
                <label for="size">Größe</label>
                <input id="size" type="range" min="128" max="1024" step="16" value="320" />
              </div>
              <div class="field-group">
                <label for="margin">Rand</label>
                <input id="margin" type="range" min="0" max="8" step="1" value="2" />
              </div>
            </div>

            <div class="field-group">
              <label for="logo">Logo</label>
              <input id="logo" type="file" accept="image/*" />
            </div>

            <div class="row row-actions">
              <div class="field-group">
                <label for="logoScale">Logo-Größe</label>
                <input id="logoScale" type="range" min="8" max="28" step="1" value="18" />
              </div>
              <div class="action-stack">
                <span class="logo-pill" id="logoName">Kein Logo</span>
                <button id="clearLogo" type="button" class="secondary">Entfernen</button>
              </div>
            </div>
          </div>
        </details>
      </div>
    </section>

    <section class="output card">
      <div class="preview-head">
        <h2>QR</h2>
        <button id="download" type="button" class="secondary">Download</button>
      </div>
      <canvas id="qr" width="320" height="320" aria-label="QR-Code Vorschau"></canvas>
    </section>
  </main>
`

const presetEl = document.querySelector('#preset')
const contentEl = document.querySelector('#content')
const sizeEl = document.querySelector('#size')
const marginEl = document.querySelector('#margin')
const logoEl = document.querySelector('#logo')
const logoScaleEl = document.querySelector('#logoScale')
const logoNameEl = document.querySelector('#logoName')
const clearLogoBtn = document.querySelector('#clearLogo')
const statusEl = document.querySelector('#status')
const canvasEl = document.querySelector('#qr')
const generateBtn = document.querySelector('#generate')
const downloadBtn = document.querySelector('#download')

function syncPreset() {
  contentEl.value = presets[presetEl.value]
  renderQR()
}

function getSettings() {
  const size = Number(sizeEl.value)
  const hasLogo = Boolean(state.logoDataUrl)
  const margin = Math.max(Number(marginEl.value), hasLogo ? 4 : 0)
  const logoScale = clamp(Number(logoScaleEl.value) / 100, 0.08, 0.28)

  return {
    text: getQRText(contentEl.value),
    size,
    margin,
    logoScale,
    hasLogo,
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

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Logo konnte nicht geladen werden.'))
    image.src = src
  })
}

function drawLogoOverlay(canvas, image, settings) {
  const ctx = canvas.getContext('2d')
  const metrics = getLogoMetrics(settings.size, settings.logoScale)
  const center = settings.size / 2
  const radius = Math.max(14, metrics.boxSize * 0.18)

  ctx.save()
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(15, 23, 42, 0.14)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 3
  drawRoundedRect(ctx, metrics.x, metrics.y, metrics.boxSize, metrics.boxSize, radius)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  const ratio = image.width / image.height
  let drawWidth = metrics.logoSize
  let drawHeight = metrics.logoSize

  if (ratio >= 1) {
    drawHeight = Math.round(metrics.logoSize / ratio)
  } else {
    drawWidth = Math.round(metrics.logoSize * ratio)
  }

  const dx = center - drawWidth / 2
  const dy = center - drawHeight / 2
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight)
  ctx.restore()
}

async function renderQR() {
  const renderId = ++state.renderId
  const settings = getSettings()

  if (!settings.text) {
    statusEl.textContent = 'Bitte Inhalt eingeben.'
    return
  }

  const size = settings.size
  canvasEl.width = size
  canvasEl.height = size

  try {
    await QRCode.toCanvas(canvasEl, settings.text, getRenderOptions(settings))

    if (settings.hasLogo && state.logoDataUrl) {
      const image = await loadImage(state.logoDataUrl)
      if (renderId !== state.renderId) return
      drawLogoOverlay(canvasEl, image, settings)
      statusEl.textContent = 'QR-Code mit Logo erstellt.'
    } else {
      statusEl.textContent = 'QR-Code erstellt.'
    }
  } catch (error) {
    statusEl.textContent = error instanceof Error ? error.message : 'Fehler beim Erstellen.'
    console.error(error)
  }
}

function downloadPNG() {
  const link = document.createElement('a')
  link.download = 'qrpoint.png'
  link.href = canvasEl.toDataURL('image/png')
  link.click()
}

function setLogoName(name) {
  logoNameEl.textContent = name || 'Kein Logo gewählt'
}

async function handleLogoUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    statusEl.textContent = 'Bitte ein Bild als Logo auswählen.'
    logoEl.value = ''
    return
  }

  try {
    const dataUrl = await fileToDataUrl(file)
    state.logoDataUrl = dataUrl
    state.logoName = file.name
    setLogoName(file.name)
    renderQR()
  } catch (error) {
    state.logoDataUrl = ''
    state.logoName = ''
    setLogoName('Kein Logo gewählt')
    statusEl.textContent = 'Logo konnte nicht geladen werden.'
    console.error(error)
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'))
    reader.readAsDataURL(file)
  })
}

function clearLogo() {
  state.logoDataUrl = ''
  state.logoName = ''
  logoEl.value = ''
  setLogoName('Kein Logo gewählt')
  renderQR()
}

presetEl.addEventListener('change', syncPreset)
generateBtn.addEventListener('click', renderQR)
sizeEl.addEventListener('input', renderQR)
marginEl.addEventListener('input', renderQR)
logoScaleEl.addEventListener('input', renderQR)
downloadBtn.addEventListener('click', downloadPNG)
contentEl.addEventListener('input', renderQR)
logoEl.addEventListener('change', handleLogoUpload)
clearLogoBtn.addEventListener('click', clearLogo)

syncPreset()
setLogoName('Kein Logo gewählt')
