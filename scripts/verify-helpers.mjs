import assert from 'node:assert/strict'
import {
  DEFAULT_STATE,
  MAX_RENDER_SIZE,
  MIN_LOGO_SCALE,
  MAX_LOGO_SCALE,
  clamp,
  createState,
  getLogoMetrics,
  getQRText,
  getRenderOptions,
  normalizeQRStyle,
} from '../src/qr-utils.js'

function test(name, fn) {
  try {
    fn()
    console.log(`✓ ${name}`)
  } catch (error) {
    console.error(`✗ ${name}`)
    throw error
  }
}

test('createState returns a copy', () => {
  const state = createState(DEFAULT_STATE)
  assert.notStrictEqual(state, DEFAULT_STATE)
  assert.deepEqual(state, DEFAULT_STATE)
})

test('clamp respects bounds', () => {
  assert.equal(clamp(5, 10, 20), 10)
  assert.equal(clamp(15, 10, 20), 15)
  assert.equal(clamp(25, 10, 20), 20)
})

test('getQRText trims whitespace', () => {
  assert.equal(getQRText('  hello  '), 'hello')
})

test('getRenderOptions switches error correction with logo presence', () => {
  const withoutLogo = getRenderOptions({ size: 320, margin: 2, hasLogo: false })
  const withLogo = getRenderOptions({ size: 320, margin: 2, hasLogo: true })

  assert.equal(withoutLogo.errorCorrectionLevel, 'M')
  assert.equal(withLogo.errorCorrectionLevel, 'H')
  assert.equal(withoutLogo.width, 320)
  assert.equal(withLogo.margin, 2)
})

test('normalizeQRStyle only accepts known values', () => {
  assert.equal(normalizeQRStyle('dots'), 'dots')
  assert.equal(normalizeQRStyle('rounded'), 'rounded')
  assert.equal(normalizeQRStyle('soft'), 'soft')
  assert.equal(normalizeQRStyle('diamond'), 'diamond')
  assert.equal(normalizeQRStyle('unknown'), 'classic')
})

test('getLogoMetrics keeps the logo constrained', () => {
  const metrics = getLogoMetrics(400, 0.5)
  assert.ok(metrics.logoSize <= 400 * MAX_LOGO_SCALE)
  assert.ok(metrics.logoSize >= 400 * MIN_LOGO_SCALE)
  assert.ok(metrics.boxSize > metrics.logoSize)
})

test('sane render size constant remains available', () => {
  assert.ok(MAX_RENDER_SIZE >= 1024)
})
