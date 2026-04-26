'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Props {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom'
}

export default function Tooltip({ content, children, position = 'top' }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [open, close])

  const popupClass = position === 'top'
    ? 'bottom-full mb-2'
    : 'top-full mt-2'

  const arrowClass = position === 'top'
    ? 'top-full border-t-gray-800'
    : 'bottom-full border-b-gray-800'

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
    >
      {children}
      {open && (
        <span
          className={`absolute z-50 left-1/2 -translate-x-1/2 ${popupClass} w-52 bg-gray-800 text-white text-xs leading-relaxed rounded-xl px-3 py-2 shadow-xl pointer-events-none whitespace-normal text-center`}
        >
          {content}
          <span
            className={`absolute left-1/2 -translate-x-1/2 ${arrowClass} border-[5px] border-transparent`}
          />
        </span>
      )}
    </span>
  )
}
