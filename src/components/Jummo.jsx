import { t, useLanguage, localize } from '../i18n/language'
import { catalog } from '../data/catalog'
import { useState } from 'react'
import { BookOpen, Headphones, Heart, MessageCircle } from 'lucide-react'

const moods = catalog.editorial_entries.filter(e => e.section === 'mood').map((e,i) => ({ title: e.subtitle || e.title, quote: e.body, Icon: [Headphones,BookOpen,Heart][i % 3] }))
export default function Jummo() {
  useLanguage()
  const [mood, setMood] = useState(0)
  if (!moods.length) return null
  return <section className="jummo-section panel" id="jummo" aria-labelledby="jummo-title">
    <div className="jummo-portrait"><img src="/images/jummo-mascot.png" alt={t("Jummo mặc bộ đồ xanh với mũ hướng dương vàng", "Jummo in a blue outfit and yellow sunflower hat")} loading="lazy" /><span>{t("NGƯỜI BẠN ĐỒNG HÀNH VŨ TRỤ", "YOUR COSMIC COMPANION")}</span><h2 id="jummo-title">{t("Jummo (Linh vật vũ trụ)", "Jummo (Cosmic Mascot)")}</h2><p>{t("Bé bảo hộ đĩa than & nốt nhạc tình thân", "Little guardian of vinyl records & loving melodies")}</p></div>
    <div className="jummo-content"><div className="jummo-bubble"><span className="eyebrow"><MessageCircle size={14} /> {t("LỜI NHẮN TỪ JUMMO", "A MESSAGE FROM JUMMO")}</span><p aria-live="polite">“{localize(moods[mood].quote)}”</p></div>
      <p className="eyebrow blue">{t("CHỌN TÂM TRẠNG TRONG PHÒNG THU CÙNG HAI ANH:", "CHOOSE YOUR STUDIO MOOD WITH THE DUO:")}</p>
      <div className="mood-buttons">{moods.map(({ title, Icon }, index) => <button key={title} className={mood === index ? 'active' : ''} aria-pressed={mood === index} onClick={() => setMood(index)}><Icon size={16} />{localize(title)}</button>)}</div>
    </div>
  </section>
}
