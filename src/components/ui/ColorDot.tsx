'use client'

import { Check } from 'lucide-react'

interface ColorDotProps {
  color: string
  colorName: string
  isSelected: boolean
  size?: 'sm' | 'md'
  onClick: () => void
}

export function ColorDot({ color, colorName, isSelected, size = 'md', onClick }: ColorDotProps) {
  const dimension = size === 'sm' ? 32 : 40
  return (
    <button
      type="button"
      aria-label={colorName}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-full"
      style={{
        width: dimension,
        height: dimension,
        backgroundColor: color,
        border: isSelected ? '2px solid white' : 'none',
        boxShadow: isSelected ? '0 0 0 2px var(--base-500)' : 'none',
      }}
    >
      {isSelected && <Check size={16} className="text-text-primary" />}
    </button>
  )
}
