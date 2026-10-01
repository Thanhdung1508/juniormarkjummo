import { useLanguage } from '../i18n/language'
import './LanguageSelect.css'

export default function LanguageSelect() {
  const { language, setLanguage, t } = useLanguage()
  return <select className="language-select" aria-label={t('Ngôn ngữ', 'Language')} value={language} onChange={(event) => setLanguage(event.target.value)}>
    <option value="vi" lang="vi">Tiếng Việt</option>
    <option value="en" lang="en">English</option>
  </select>
}
