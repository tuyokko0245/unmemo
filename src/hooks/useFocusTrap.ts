'use client'

import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Modal instances register themselves here in open order so that, when
// several focus-trapped overlays are open at once (e.g. a bottom sheet
// opened from inside the side drawer), Escape/Tab only affect the
// topmost (most recently opened) one.
const openStack: number[] = []
let nextId = 0

export function useFocusTrap(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const id = nextId++
    openStack.push(id)

    previouslyFocused.current = document.activeElement as HTMLElement | null
    const container = containerRef.current
    if (container && !container.contains(document.activeElement)) {
      const focusables = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      focusables[0]?.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (openStack[openStack.length - 1] !== id) return

      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !container) return
      const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      const idx = openStack.indexOf(id)
      if (idx !== -1) openStack.splice(idx, 1)
      previouslyFocused.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return containerRef
}
