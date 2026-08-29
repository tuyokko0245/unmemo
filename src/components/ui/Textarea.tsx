'use client'

import { forwardRef, useEffect, useRef, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  label?: string
  error?: string
  minRows?: number
  autoExpand?: boolean
  value: string
  onChange: (value: string) => void
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, minRows = 3, autoExpand = true, value, onChange, className, ...rest },
  forwardedRef,
) {
  const innerRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!autoExpand) return
    const el = innerRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value, autoExpand])

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[13px] font-medium text-text-secondary">{label}</label>}
      <textarea
        ref={(node) => {
          innerRef.current = node
          if (typeof forwardedRef === 'function') forwardedRef(node)
          else if (forwardedRef) forwardedRef.current = node
        }}
        rows={minRows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          'w-full resize-none rounded-md border bg-bg-primary px-4 py-3 text-sm leading-relaxed text-text-primary outline-none transition-colors',
          error ? 'border-error' : 'border-border focus:border-border-focus focus:shadow-md',
          className ?? '',
        ].join(' ')}
        {...rest}
      />
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  )
})
