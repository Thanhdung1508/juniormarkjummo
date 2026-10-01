import { t, useLanguage, localize } from '../i18n/language'
import { useState } from 'react'
import { photos } from '../lib/photos'

export default function Gallery({ openPhoto }) {
  useLanguage()
  const [expanded, setExpanded] = useState(false)
  const visiblePhotos = expanded ? photos : photos.slice(0, 4)
  return <section className="gallery-section" id="gallery" aria-labelledby="gallery-title"><div className="section-heading"><h2 id="gallery-title">{t("▧ Thư viện: Ánh sáng & Vòng tay", "▧ Gallery: Light & Embrace")}</h2><span className="eyebrow">{t("KHO ẢNH PHIM 35MM", "35MM FILM ARCHIVE")}</span></div>
    <div className="gallery-grid" id="photo-grid">{visiblePhotos.map((photo) => <button className="gallery-item" key={photo.src} onClick={() => openPhoto(photo)} aria-label={t(`Xem ảnh ${localize(photo.title)}`, `View photo ${localize(photo.title)}`)}><img src={photo.src} style={{ objectPosition: photo.position || 'center' }} alt={localize(photo.alt)} loading="lazy" /><span><small>{localize(photo.tag)}</small><strong>{localize(photo.title)}</strong></span><i aria-hidden="true">↗</i></button>)}</div>
    <button className="gallery-more" aria-expanded={expanded} aria-controls="photo-grid" onClick={() => setExpanded(!expanded)}>{expanded ? t('Thu gọn bộ ảnh', 'Show fewer photos') : t(`Xem toàn bộ ${photos.length} khoảnh khắc`, `View all ${photos.length} moments`)} <span aria-hidden="true">{expanded ? '↑' : '↗'}</span></button>
  </section>
}
