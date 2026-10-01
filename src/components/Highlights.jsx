import { t, useLanguage, localize } from '../i18n/language'
import { catalog } from '../data/catalog'
import { ArrowUpRight } from 'lucide-react'

const stories = catalog.editorial_entries.filter(e => e.section === 'highlight').map((e, i) => ({ ...e, text: e.body, badge: e.subtitle, color: ['pink', 'gold', 'blue'][i % 3] }))
export default function Highlights({ openStory }) {
  useLanguage()
  return <section className="highlights-section" id="highlights" aria-labelledby="highlights-title">
    <div className="section-heading"><div><span className="eyebrow">{t("✧ PHÒNG LƯU TRỮ & DỰ ÁN NGHỆ THUẬT", "✧ ARCHIVE & ART PROJECTS")}</span><h2 id="highlights-title">{t("Kỷ niệm tinh tú", "Starry Highlights")}</h2></div><p>{t("Một góc biên tập những câu chuyện và tác phẩm", "A curated corner of stories and works")}<br />{t("trong hành trình của Junior & Mark.", "from Junior & Mark’s journey.")}</p></div>
    <div className="story-grid">{stories.map((story) => <article className="story-card" key={localize(story.title)}><div className="story-image"><img src={story.image} alt={t(`Ảnh minh họa bộ sưu tập ${localize(story.title)}`, `Illustration for ${localize(story.title)}`)} loading="lazy" /><span className={`story-badge ${story.color}`}>{localize(story.badge)}</span></div><div className="story-body"><small>{localize(story.tag)}</small><h3>{localize(story.title)}</h3><p>{localize(story.text)}</p><button className="text-button" onClick={() => openStory(story)}>{t("Khám phá bộ sưu tập", "Explore the collection")} <ArrowUpRight size={15} /></button></div></article>)}</div>
  </section>
}
