import { t, useLanguage, localize } from '../i18n/language'
import { useOrbit } from '../features/orbit/orbitContext'
export default function SaveToOrbit({ kind, id, payload = {} }) {
  useLanguage()
  const orbit = useOrbit()
  if (!orbit) return null
  const saved = orbit.has(kind, id)
  return <div className="orbit-save"><button className="secondary-button" aria-pressed={saved} disabled={orbit.loading || orbit.busy} onClick={() => orbit.save(kind, id, payload, saved)}>{saved ? t('Đã lưu · Xóa khỏi quỹ đạo của tôi', 'Saved · Remove from My Orbit') : t('Lưu vào quỹ đạo của tôi', 'Save to My Orbit')}</button>{orbit.error && <p role="status" className="error-message">{localize(orbit.error)}</p>}</div>
}

