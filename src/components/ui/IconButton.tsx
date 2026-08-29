'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: ReactNode
  label: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'filled'
}

const sizeClasses = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-[52px] w-[52px]',
}

export function IconButton({ icon, label, size = 'md', variant = 'ghost', className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={[
        'inline-flex items-center justify-center rounded-full transition-colors',
        sizeClasses[size],
        variant === 'filled' ? 'bg-base-500 text-white hover:bg-base-600' : 'text-text-primary hover:bg-bg-secondary',
        className ?? '',
      ].join(' ')}
      {...rest}
    >
      {icon}
    </button>
  )
}
