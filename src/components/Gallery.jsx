import { useState } from 'react'
import { photos } from '../lib/photos'

export default function Gallery({ openPhoto }) {
  const [expanded, setExpanded] = useState(false)
  const visiblePhotos = expanded ? photos : photos.slice(0, 4)
  return <section className="gallery-section" id="gallery" aria-labelledby="gallery-title"><div className="section-heading"><h2 id="gallery-title">▧ Gallery: Ánh Sáng & Vòng Tay</h2><span className="eyebrow">35MM FILM ARCHIVE</span></div>
    <div className="gallery-grid" id="photo-grid">{visiblePhotos.map((photo) => <button className="gallery-item" key={photo.src} onClick={() => openPhoto(photo)} aria-label={`Xem ảnh ${photo.title}`}><img src={photo.src} style={{ objectPosition: photo.position || 'center' }} alt={photo.alt} loading="lazy" /><span><small>{photo.tag}</small><strong>{photo.title}</strong></span><i aria-hidden="true">↗</i></button>)}</div>
    <button className="gallery-more" aria-expanded={expanded} aria-controls="photo-grid" onClick={() => setExpanded(!expanded)}>{expanded ? 'Thu gọn bộ ảnh' : `Xem toàn bộ ${photos.length} khoảnh khắc`} <span aria-hidden="true">{expanded ? '↑' : '↗'}</span></button>
  </section>
}
