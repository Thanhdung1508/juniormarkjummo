import { useState } from 'react'
import { eras, photoPath } from './journeyData'
import { PageIntro, SectionTitle, Tip } from './shared'

export default function Timeline({ openPhoto }) {
  const initial = new URLSearchParams(location.hash.split('?')[1]).get('era')
  const [id, setId] = useState(eras.some((e) => e.id === initial) ? initial : 'cherry')
  const era = eras.find((e) => e.id === id)
  return (
    <>
      <PageIntro
        eyebrow="STARLIGHT CHRONOLOGY"
        title="Constellation of Memories"
        description="Bản đồ các vì tinh tú đánh dấu từng chương trong hành trình Junior & Mark."
      >
        <Tip>Chạm vào một cột mốc để mở kho ký ức.</Tip>
      </PageIntro>
      <section className="constellation-timeline" aria-label="Bản đồ cột mốc">
        <div className="era-tabs">
          {eras.map((e, i) => (
            <button key={e.id} aria-pressed={id === e.id} onClick={() => setId(e.id)}>
              <span>
                {e.year} • {e.label}
              </span>
              <h3>{e.title}</h3>
              <small>{e.roles}</small>
              <b>✦</b>
              <span>0{i + 1} · Khám phá →</span>
            </button>
          ))}
        </div>
        <div className="orbit-trail" aria-hidden="true">
          ✦ · · · ✧ · · · ✦ · · · ✧
        </div>
      </section>
      <div className="timeline-detail" aria-live="polite">
        <article className="archive-panel">
          <span className="eyebrow">KHOẢNH KHẮC KỶ NIỆM • {era.year}</span>
          <h2>{era.title}</h2>
          <img className="feature-photo" src={photoPath(era.image)} alt="Ảnh minh họa bộ sưu tập" />
          <p>{era.text}</p>
          <small>
            Ảnh thuộc bộ sưu tập người dùng cung cấp, không khẳng định được chụp tại sự kiện này.
          </small>
        </article>
        <aside className="archive-panel">
          <SectionTitle eyebrow="TẦN SỐ GHI ÂM KỶ NIỆM">{era.roles}</SectionTitle>
          <p>Khám phá ảnh gốc và những câu chuyện từ hành trình chung.</p>
          <a className="primary-button" href="#/media">
            Mở kho truyền thông ↗
          </a>
          <hr />
          <h3>Playlist gắn liền cột mốc</h3>
          <p>Bản thu trong thiết kế chưa được cung cấp.</p>
          <a
            className="secondary-button"
            href="https://www.youtube.com/@gmmtv"
            target="_blank"
            rel="noreferrer"
          >
            Ghé kênh GMMTV ↗
          </a>
        </aside>
      </div>
      <SectionTitle eyebrow="4 CỘT MỐC • VÔ VÀN KỶ NIỆM">Fandom Stellar Gallery</SectionTitle>
      <div className="three-columns">
        {eras.slice(0, 3).map((e) => (
          <button
            className="image-story"
            key={e.id}
            onClick={() =>
              openPhoto({
                src: photoPath(e.image),
                alt: 'Khoảnh khắc JuniorMark',
                title: e.title,
                credit: 'Bộ ảnh người dùng cung cấp',
              })
            }
          >
            <img src={photoPath(e.image)} alt={e.title} loading="lazy" />
            <div>
              <h3>{e.title}</h3>
              <p>{e.roles}</p>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}
