import { t, useLanguage, localize } from '../i18n/language'
import { useState } from 'react'
import { cardText, exportCardPng } from '../lib/shareCard'
import { downloadText } from '../lib/archive'
export default function ShareCardButton({ card, filename = 'juniormark-card', label }) {
  useLanguage()
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  async function download() {
    setBusy(true); setError('')
    try { await exportCardPng(card, filename) } catch { setError('export-error') } finally { setBusy(false) }
  }
  return <div className="share-card-action"><button className="primary-button" disabled={busy} onClick={download}>{busy ? t('Đang chuẩn bị thẻ…', 'Preparing card…') : (label ? localize(label) : t('Tải thẻ PNG', 'Download PNG card'))}</button>{error && <><p role="status">{t('Chưa thể xuất ảnh PNG. Bạn có thể lưu bản văn bản bên dưới.', 'PNG export is unavailable. You can save the text version below.')}</p><button className="text-button" onClick={() => downloadText(`${filename}.txt`, cardText(card))}>{t('Tải bản văn bản', 'Download text fallback')}</button></>}</div>
}
