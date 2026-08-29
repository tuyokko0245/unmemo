export const PASTEL_COLORS = [
  { name: 'ミントグリーン', hex: '#A8E6CF' },
  { name: 'ライトブルー', hex: '#AED9E0' },
  { name: 'スカイブルー', hex: '#B5D5E8' },
  { name: 'ラベンダー', hex: '#C8B8DB' },
  { name: 'ライラック', hex: '#D4B8E0' },
  { name: 'ピーチ', hex: '#F9C5A7' },
  { name: 'サーモンピンク', hex: '#FABEBE' },
  { name: 'ベビーピンク', hex: '#FFCCD5' },
  { name: 'ローズ', hex: '#F8B4C8' },
  { name: 'イエロー', hex: '#FFF1A8' },
  { name: 'バナナ', hex: '#FAEDB0' },
  { name: 'ライトオレンジ', hex: '#FDDCB5' },
  { name: 'コーラル', hex: '#FFBDA8' },
  { name: 'セージグリーン', hex: '#B8D8B8' },
  { name: 'ライムグリーン', hex: '#C5E8A8' },
  { name: 'スプリンググリーン', hex: '#B8E8C8' },
  { name: 'アクアマリン', hex: '#A8DDD8' },
  { name: 'パウダーブルー', hex: '#B8CCE8' },
  { name: 'モーブ', hex: '#D8B8D8' },
  { name: 'グレイッシュホワイト', hex: '#E8E8E8' },
] as const

export function assignRandomPastel(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return PASTEL_COLORS[hash % PASTEL_COLORS.length].hex
}
