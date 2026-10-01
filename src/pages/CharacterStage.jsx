import { t as tr, useLanguage, localize } from '../i18n/language'
import { catalog } from '../data/catalog'
import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import ProfileDossier from './ProfileDossier'

// Frame 2002:35: nhân vật đang chọn ở giữa; hai nhân vật phụ hai bên.
const characters = catalog.artists.map((a) => ({
  ...a,
  tag: a.label,
  image: a.stage_image,
  description: a.stage_description,
  href: a.kind === 'mascot' ? '#/jummo' : '#/profiles/' + a.id,
}))
export default function CharacterStage() {
  useLanguage()
  const [active, setActive] = useState(0),
    [open, setOpen] = useState(false),
    current = characters[active]
  if (!current)
    return <p>{tr('Chưa có hồ sơ được công bố.', 'No profiles have been published yet.')}</p>
  const move = (direction) =>
    setActive((i) => (i + direction + characters.length) % characters.length)
  return (
    <section
      className="character-selector"
      aria-label={tr('Chọn nhân vật xem hồ sơ', 'Choose a character to view their profile')}
      onKeyDown={(e) => {
        if (open) return
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          move(-1)
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          move(1)
        }
      }}
    >
      <header className="stage-intro">
        <span className="eyebrow">
          {tr('HỒ SƠ VÀ KHO LƯU TRỮ TINH TÚ', 'ORBITAL DOSSIER & ARCHIVES')}
        </span>
        <h1>{tr('Mặt Trời, Mặt Trăng và Quỹ Đạo Chung', 'The Sun, The Moon & Their Orbit')}</h1>
        <p>
          {tr(
            'Chọn nhân vật rồi bấm Khám phá để xem hồ sơ.',
            'Choose a character, then select Discover to view their profile.',
          )}
        </p>
      </header>
      <div className={`character-stage active-${current.id}`}>
        <span className="ghost-type" aria-hidden="true">
          {current.id.toUpperCase()}
        </span>
        {characters.map((c, i) => {
          const position = (i - active + characters.length) % characters.length
          return (
            <button
              key={c.id}
              className={`stage-person ${['center', 'right', 'left'][position]} ${c.id}`}
              onClick={() => setActive(i)}
              aria-label={`${tr('Chọn', 'Select')} ${c.name}`}
              aria-pressed={active === i}
            >
              {active === i && (
                <span className="active-pill">{tr('● ĐANG CHỌN', '● ACTIVE SELECTION')}</span>
              )}
              <img src={c.image} alt={c.name} />
              <span className="stage-person-name">{c.name}</span>
            </button>
          )
        })}
      </div>
      <div className="stage-bottom">
        <article className="stage-bio archive-panel" aria-live="polite">
          <span className="eyebrow">
            {localize(current.tag)} •{' '}
            {current.id === 'jummo'
              ? tr('LINH VẬT', 'STUDIO MASCOT')
              : tr('NGHỆ SĨ GMMTV', 'GMMTV ARTIST')}
          </span>
          <h2>{current.name}</h2>
          <p>{localize(current.description)}</p>
          <div className="stage-controls">
            <button
              className="icon-button"
              aria-label={tr('Nhân vật trước', 'Previous character')}
              onClick={() => move(-1)}
            >
              <ArrowLeft size={18} />
            </button>
            <button
              className="icon-button"
              aria-label={tr('Nhân vật tiếp theo', 'Next character')}
              onClick={() => move(1)}
            >
              <ArrowRight size={18} />
            </button>
            <div className="stage-dots">
              {characters.map((c, i) => (
                <button
                  key={c.id}
                  aria-label={`${tr('Chuyển tới', 'Go to')} ${c.name}`}
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                />
              ))}
            </div>
          </div>
        </article>
        <button
          className="discover-button"
          onClick={() => setOpen(true)}
          aria-label={`${tr('Khám phá', 'Discover')} ${current.name}`}
        >
          {' '}
          {tr('KHÁM PHÁ', 'DISCOVER')} <ArrowRight size={28} />
        </button>
      </div>
      {open && <ProfileDossier person={current.id} onClose={() => setOpen(false)} />}
    </section>
  )
}
