import { useEffect, useState } from 'react'
import { readTheme } from '../lib/helpers'

// Giữ đúng vị trí và nhãn Warm Midnight Glow trong footer Figma (2007:467).
export default function ThemeToggle() {
  const [theme, setTheme] = useState(readTheme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { window.localStorage.setItem('juniormark-theme', theme) } catch { /* Vẫn đổi theme nếu trình duyệt chặn storage. */ }
  }, [theme])
  useEffect(() => {
    const sync = (event) => { if (event.key === 'juniormark-theme') setTheme(readTheme()) }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  return <button className="theme-toggle" aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng ấm' : 'Chuyển sang giao diện tối'}
    aria-pressed={theme === 'light'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
    <img src="/images/figma/dc868.svg" alt="" width="14" height="14" />
    {theme === 'dark' ? 'Warm Midnight Glow' : 'Warm Morning Glow'}
  </button>
}
