import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  count: number
  rowHeight: number
  label: string
  /** Scroll returns to the top whenever this value changes. */
  resetKey: string
  renderRow: (index: number) => ReactNode
}

const OVERSCAN = 4

/** Fixed-height windowing: only the rows near the viewport are in the DOM. */
export function VirtualList({ count, rowHeight, label, resetKey, renderRow }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [top, setTop] = useState(0)
  const [height, setHeight] = useState(480)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setHeight(el.clientHeight)
    const observer = new ResizeObserver(() => setHeight(el.clientHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0
    setTop(0)
  }, [resetKey])

  const start = Math.max(0, top - OVERSCAN)
  const end = Math.min(count, top + Math.ceil(height / rowHeight) + OVERSCAN)
  const rows: ReactNode[] = []
  for (let i = start; i < end; i++) rows.push(renderRow(i))

  return (
    <div
      ref={ref}
      className="vlist"
      tabIndex={0}
      role="region"
      aria-label={label}
      onScroll={(e) => setTop(Math.floor(e.currentTarget.scrollTop / rowHeight))}
    >
      <div style={{ height: count * rowHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${start * rowHeight}px)` }} role="list">
          {rows}
        </div>
      </div>
    </div>
  )
}
