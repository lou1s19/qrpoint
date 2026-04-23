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
  logoScale: 0.22,
}

export const MAX_RENDER_SIZE = 1024
export const MIN_LOGO_SCALE = 0.12
export const MAX_LOGO_SCALE = 0.32

export function createState(initialState = DEFAULT_STATE) {
  return { ...initialState }
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function getQRText(content) {
  return content.trim()
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
