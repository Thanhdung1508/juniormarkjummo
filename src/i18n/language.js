import { useSyncExternalStore } from 'react'
import { contentTranslations } from './content'

const storageKey = 'juniormark-language'
const listeners = new Set()
const translations = new Map()
registerTranslations(contentTranslations)
let language = 'vi'
try { if (localStorage.getItem(storageKey) === 'en') language = 'en' } catch { /* Trình duyệt chặn lưu trữ: dùng tiếng Việt. */ }

export const getLanguage = () => language
export function registerTranslations(pairs) {
  for (const [vi, en, ...aliases] of pairs) {
    for (const text of [vi, en, ...aliases]) translations.set(text, [vi, en])
  }
}
// Truyền hai bản dịch rõ ràng, không tự dịch tên hoặc nội dung fan nhập.
export function t(vi, en) {
  if (en === undefined) return localize(vi)
  registerTranslations([[vi, en]])
  return language === 'en' ? en : vi
}
export function localize(value) {
  if (typeof value !== 'string') return value
  const pair = translations.get(value)
  return pair ? pair[language === 'en' ? 1 : 0] : value
}
export function translateError(error) {
  return localize(typeof error === 'string' ? error : error?.message || t('Không thể hoàn tất yêu cầu. Vui lòng thử lại.', 'Could not complete the request. Please try again.'))
}
function updateDocument() {
  if (typeof document === 'undefined') return
  document.documentElement.lang = language
  document.title = t('JuniorMark — Tiệm đĩa tinh tú', 'JuniorMark — The Celestial Record Store')
}
export function setLanguage(next) {
  if (!['vi', 'en'].includes(next)) return
  language = next
  try { localStorage.setItem(storageKey, next) } catch { /* Lựa chọn vẫn có hiệu lực trong phiên hiện tại. */ }
  updateDocument()
  for (const listener of listeners) listener()
}
function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) }
export function useLanguage() {
  const current = useSyncExternalStore(subscribe, getLanguage, () => 'vi')
  return { language: current, setLanguage, t, localize, locale: current === 'vi' ? 'vi-VN' : 'en-US' }
}
if (typeof window !== 'undefined') window.addEventListener('storage', (event) => {
  if (event.key === storageKey || event.key === null) {
    language = event.newValue === 'en' ? 'en' : 'vi'
    updateDocument()
    for (const listener of listeners) listener()
  }
})
updateDocument()
