import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

// Native dialog giữ focus trong hộp thoại, hỗ trợ Escape và làm nền inert.
export default function Dialog({ title, onClose, children, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      previousFocus?.focus()
    }
  }, [])
  return <dialog ref={ref} className={`dialog ${className}`} aria-labelledby="dialog-title"
    onCancel={(event) => { event.preventDefault(); onClose() }}
    onClick={(event) => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose() } }}>
    <button className="icon-button dialog-close" aria-label="Đóng" onClick={onClose}><X size={20} /></button>
    <h2 id="dialog-title">{title}</h2>
    {children}
  </dialog>
}
