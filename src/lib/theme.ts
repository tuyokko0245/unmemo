export interface BaseColorTheme {
  id: string
  name: string
  hex: string
}

export const BASE_COLOR_THEMES: BaseColorTheme[] = [
  { id: 'mint', name: 'ミントグリーン', hex: '#2AAF82' },
  { id: 'sky', name: 'スカイブルー', hex: '#3B96C2' },
  { id: 'lavender', name: 'ラベンダー', hex: '#8B7CC8' },
  { id: 'coral', name: 'コーラルピンク', hex: '#E57B8C' },
  { id: 'sunny', name: 'サニーイエロー', hex: '#D4A820' },
  { id: 'sage', name: 'セージグリーン', hex: '#6B9B6B' },
  { id: 'peach', name: 'ピーチ', hex: '#D4824A' },
  { id: 'mauve', name: 'モーブ', hex: '#A06090' },
]

export const DEFAULT_BASE_COLOR = BASE_COLOR_THEMES[0].hex

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)]
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

function mix(hex: string, target: [number, number, number], ratio: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r + (target[0] - r) * ratio, g + (target[1] - g) * ratio, b + (target[2] - b) * ratio)
}

export function generateColorRamp(baseHex: string) {
  const white: [number, number, number] = [255, 255, 255]
  const black: [number, number, number] = [0, 0, 0]
  return {
    50: mix(baseHex, white, 0.95),
    100: mix(baseHex, white, 0.85),
    200: mix(baseHex, white, 0.62),
    300: mix(baseHex, white, 0.4),
    400: mix(baseHex, white, 0.2),
    500: baseHex,
    600: mix(baseHex, black, 0.12),
    700: mix(baseHex, black, 0.35),
  }
}

export function applyBaseColor(baseHex: string) {
  const ramp = generateColorRamp(baseHex)
  const root = document.documentElement
  for (const [key, value] of Object.entries(ramp)) {
    root.style.setProperty(`--base-${key}`, value)
  }

  const themeColorMeta = document.querySelector('meta[name="theme-color"]')
  themeColorMeta?.setAttribute('content', baseHex)
}
