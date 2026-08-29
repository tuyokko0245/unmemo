'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string
  error?: string
  helperText?: string
  value: string
  onChange: (value: string) => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, value, onChange, className, ...rest },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[13px] font-medium text-text-secondary">{label}</label>}
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          'h-[52px] w-full rounded-md border bg-bg-primary px-4 text-sm text-text-primary outline-none transition-colors',
          error ? 'border-error' : 'border-border focus:border-border-focus focus:shadow-md',
          className ?? '',
        ].join(' ')}
        {...rest}
      />
      {error && <span className="text-xs text-error">{error}</span>}
      {!error && helperText && <span className="text-xs text-text-tertiary">{helperText}</span>}
    </div>
  )
})
