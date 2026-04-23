import QRCode from 'qrcode'
import './style.css'

const presets = {
  url: 'https://example.com',
  text: 'Hallo Boss',
  wifi: 'WIFI:T:WPA;S:MeinWLAN;P:geheimespasswort;;',
}

document.querySelector('#app').innerHTML = `
  <main class="shell">
    <section class="hero">
      <div>
        <p class="eyebrow">QRPoint</p>
        <h1>QR-Code Generator</h1>
        <p class="lead">Erstelle schnell QR-Codes für Links, Texte oder WLAN. Optimiert für Netlify.</p>
      </div>
      <div class="card form-card">
        <label for="preset">Vorlage</label>
        <select id="preset">
          <option value="url">Link</option>
          <option value="text">Text</option>
          <option value="wifi">WLAN</option>
        </select>

        <label for="content">Inhalt</label>
        <textarea id="content" rows="5" placeholder="Text oder Link"></textarea>

        <div class="row">
          <div>
            <label for="size">Größe</label>
            <input id="size" type="range" min="128" max="1024" step="16" value="320" />
          </div>
          <div>
            <label for="margin">Rand</label>
            <input id="margin" type="range" min="0" max="8" step="1" value="2" />
          </div>
        </div>

        <button id="generate">QR generieren</button>
        <p id="status" class="status">Bereit.</p>
      </div>
    </section>

    <section class="output card">
      <div class="preview-head">
        <h2>Vorschau</h2>
        <button id="download" class="secondary">PNG herunterladen</button>
      </div>
      <canvas id="qr" width="320" height="320" aria-label="QR-Code Vorschau"></canvas>
      <p class="hint">Tipp: Ideal für Web, Visitenkarten, Flyer und schnelle Sharing-Links.</p>
    </section>
  </main>
`

const presetEl = document.querySelector('#preset')
const contentEl = document.querySelector('#content')
const sizeEl = document.querySelector('#size')
const marginEl = document.querySelector('#margin')
const statusEl = document.querySelector('#status')
const canvasEl = document.querySelector('#qr')
const generateBtn = document.querySelector('#generate')
const downloadBtn = document.querySelector('#download')

function syncPreset() {
  contentEl.value = presets[presetEl.value]
  renderQR()
}

async function renderQR() {
  const text = contentEl.value.trim()
  if (!text) {
    statusEl.textContent = 'Bitte Inhalt eingeben.'
    return
  }

  const size = Number(sizeEl.value)
  const margin = Number(marginEl.value)
  canvasEl.width = size
  canvasEl.height = size

  try {
    await QRCode.toCanvas(canvasEl, text, {
      width: size,
      margin,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
    statusEl.textContent = 'QR-Code erstellt.'
  } catch (error) {
    statusEl.textContent = 'Fehler beim Erstellen.'
    console.error(error)
  }
}

function downloadPNG() {
  const link = document.createElement('a')
  link.download = 'qrpoint.png'
  link.href = canvasEl.toDataURL('image/png')
  link.click()
}

presetEl.addEventListener('change', syncPreset)
generateBtn.addEventListener('click', renderQR)
sizeEl.addEventListener('input', renderQR)
marginEl.addEventListener('input', renderQR)
downloadBtn.addEventListener('click', downloadPNG)
contentEl.addEventListener('input', renderQR)

syncPreset()
