import { t as tr, useLanguage, localize } from '../i18n/language'
import { catalog, birthdayLabel } from '../data/catalog'
import { useState } from 'react'
import Dialog from '../components/Dialog'
import { eras } from './journeyData'
import ArtistSources from '../components/ArtistSources'

const data = Object.fromEntries(
  catalog.artists.map((a) => [
    a.id,
    {
      ...a,
      image: a.stage_image,
      birthday: birthdayLabel(a.birthday),
      color: a.color_label,
      role: a.role_label,
      intro: a.bio,
    },
  ]),
)
export default function ProfileDossier({ person, onClose }) {
  useLanguage()
  // Ba tab chỉ thay nội dung bên trong modal; đóng modal giữ nguyên nhân vật ở sân khấu.
  const [tab, setTab] = useState('overview'),
    p = data[person]
  if (!p) return null
  return (
    <Dialog
      title={`${tr('Hồ sơ tinh tú', 'Celestial File')} • ${p.name}`}
      onClose={onClose}
      className="profile-dossier"
    >
      <div
        className="dossier-tabs"
        role="tablist"
        aria-label={tr('Nội dung hồ sơ', 'Profile contents')}
      >
        {['overview', 'filmography', 'discography'].map((t) => (
          <button
            role="tab"
            id={`tab-${t}`}
            aria-controls="dossier-panel"
            aria-selected={tab === t}
            key={t}
            onClick={() => setTab(t)}
            onKeyDown={(e) => {
              const tabs = ['overview', 'filmography', 'discography']
              if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault()
                const next = tabs[(tabs.indexOf(t) + (e.key === 'ArrowRight' ? 1 : 2)) % 3]
                setTab(next)
                document.getElementById(`tab-${next}`)?.focus()
              }
            }}
          >
            {
              {
                overview: tr('Tổng quan', 'Overview'),
                filmography: tr('Vai diễn', 'Filmography'),
                discography: tr('Bản thu', 'Discography'),
              }[t]
            }
          </button>
        ))}
      </div>
      <div id="dossier-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'overview' ? (
          <>
            <div className="dossier-overview">
              <aside className="dossier-portrait">
                <span className="eyebrow">{localize(p.label)}</span>
                <img src={p.image} alt={p.name} />
                <strong>{localize(p.role)}</strong>
              </aside>
              <div>
                <h2>{p.name} ✦</h2>
                <p className="blue">
                  {person === 'jummo'
                    ? tr('Linh vật', 'Studio Mascot')
                    : tr('Nghệ sĩ GMMTV', 'GMMTV Artist')}
                </p>
                <dl className="dossier-facts">
                  {[
                    [tr('Họ tên', 'Full name'), p.full_name_english || p.name],
                    [tr('Sinh nhật', 'Birthday'), p.birthday],
                    [tr('Hình tượng', 'Persona'), p.role],
                    [tr('Không gian', 'Space'), 'JuniorMark Celestial'],
                    [tr('Màu thiết kế', 'Design colors'), p.color],
                    [tr('Hồ sơ', 'Profile'), tr('Kho lưu trữ của người hâm mộ', 'Fan archive')],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{localize(value)}</dd>
                    </div>
                  ))}
                </dl>
                <p>{localize(p.intro)}</p>
                <ArtistSources artist={p} />
                <a
                  className="secondary-button"
                  href={person === 'jummo' ? '#/jummo' : `#/profiles/${person}`}
                  onClick={onClose}
                >
                  {' '}
                  {tr('Xem trang đầy đủ ↗', 'View full page ↗')}{' '}
                </a>
              </div>
            </div>
            <div className="three-columns dossier-traits">
              {[
                tr('Sắc màu riêng', 'Personal colors'),
                tr('Dấu mốc hành trình', 'Journey milestones'),
                tr('Hòa Điệu Tinh Tú', 'Celestial Harmony'),
              ].map((t, i) => (
                <article className="archive-panel" key={t}>
                  <h3>{t}</h3>
                  <p>
                    {
                      [
                        localize(p.role),
                        tr(
                          'Những vai diễn và ký ức được lưu lại cùng fandom.',
                          'Roles and memories preserved with the fandom.',
                        ),
                        tr(
                          'Kết nối Junior, Mark và Jummo trong một góc nhỏ ấm áp.',
                          'Connecting Junior, Mark and Jummo in a warm little corner.',
                        ),
                      ][i]
                    }
                  </p>
                </article>
              ))}
            </div>
          </>
        ) : tab === 'filmography' ? (
          <div className="dossier-films">
            {person === 'jummo' ? (
              <p>
                {tr(
                  'Jummo là linh vật, chưa có danh sách vai diễn.',
                  'Jummo is a mascot and has no acting credits yet.',
                )}
              </p>
            ) : (
              eras
                .filter((e) => e.id !== 'fancon' && e.people.includes(person))
                .map((e) => (
                  <article className="archive-panel" key={e.id}>
                    <span className="eyebrow">{localize(e.year)}</span>
                    <h3>{e.title}</h3>
                    <p>
                      {
                        catalog.work_roles.find((r) => r.work_id === e.id && r.artist_id === person)
                          ?.role_name
                      }
                    </p>
                  </article>
                ))
            )}
          </div>
        ) : (
          <div className="archive-panel">
            <h3>{tr('Danh Sách Bản Thu Và Kho Âm Thanh', 'Discography & Audio Archive')}</h3>
            <p>
              {' '}
              {tr(
                'Bạn có thể nghe danh sách nhạc tại Phòng thu. Danh sách tác phẩm đầy đủ và nguồn phát hành đang được bổ sung; playlist không phải đĩa nhạc chính thức của riêng nghệ sĩ.',
                'Listen to the playlist in the Studio. A complete discography and release sources are being compiled; the playlist is not this artist’s official discography.',
              )}{' '}
            </p>
            <a
              className="secondary-button"
              href="https://www.youtube.com/@gmmtv"
              target="_blank"
              rel="noreferrer"
            >
              {' '}
              {tr('Khám phá kênh GMMTV ↗', 'Explore the GMMTV channel ↗')}{' '}
            </a>
          </div>
        )}
      </div>
    </Dialog>
  )
}
