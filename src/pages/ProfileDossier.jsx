import { useState } from 'react'
import Dialog from '../components/Dialog'
import { eras } from './journeyData'

const data = {
  junior: {
    name: 'Junior Panachai',
    label: 'SOLAR EMBER',
    image: '/images/junior-stage.png',
    birthday: '23/10',
    color: 'Sun Flare Gold',
    role: 'Ánh Dương • Sun',
    intro: 'Góc hồ sơ Junior: diễn xuất, sân khấu và những câu chuyện trong hành trình JuniorMark.',
  },
  mark: {
    name: 'Mark Jiruntanin',
    label: 'LUNAR MELODY',
    image: '/images/mark-stage.png',
    birthday: '15/06',
    color: 'Cosmic Blue',
    role: 'Ánh Nguyệt • Moon',
    intro: 'Góc hồ sơ Mark: vai diễn, giai điệu và những dấu mốc được fandom lưu giữ.',
  },
  jummo: {
    name: 'Jummo Mascot',
    label: 'CELESTIAL GUARDIAN',
    image: '/images/jummo-mascot.png',
    birthday: 'Chưa xác minh',
    color: 'Sun Gold & Cosmic Blue',
    role: 'Sun & Moon Companion',
    intro: 'Linh vật hướng dương kết nối hai sắc màu của JuniorMark.',
  },
}
export default function ProfileDossier({ person, onClose }) {
  // Ba tab chỉ thay nội dung bên trong modal; đóng modal giữ nguyên nhân vật ở sân khấu.
  const [tab, setTab] = useState('overview'),
    p = data[person]
  return (
    <Dialog title={`Celestial File • ${p.name}`} onClose={onClose} className="profile-dossier">
      <div className="dossier-tabs" role="tablist" aria-label="Nội dung hồ sơ">
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
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div id="dossier-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'overview' ? (
          <>
            <div className="dossier-overview">
              <aside className="dossier-portrait">
                <span className="eyebrow">{p.label}</span>
                <img src={p.image} alt={p.name} />
                <strong>{p.role}</strong>
              </aside>
              <div>
                <h2>{p.name} ✦</h2>
                <p className="blue">{person === 'jummo' ? 'Studio Mascot' : 'GMMTV Artist'}</p>
                <dl className="dossier-facts">
                  {[
                    ['Tên hiển thị', p.name],
                    ['Sinh nhật', p.birthday],
                    ['Hình tượng', p.role],
                    ['Không gian', 'JuniorMark Celestial'],
                    ['Màu thiết kế', p.color],
                    ['Hồ sơ', 'Fan archive'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <p>{p.intro}</p>
                <a
                  className="secondary-button"
                  href={person === 'jummo' ? '#/jummo' : `#/profiles/${person}`}
                  onClick={onClose}
                >
                  Xem trang đầy đủ ↗
                </a>
              </div>
            </div>
            <div className="three-columns dossier-traits">
              {['Sắc màu riêng', 'Dấu mốc hành trình', 'Celestial Harmony'].map((t, i) => (
                <article className="archive-panel" key={t}>
                  <h3>{t}</h3>
                  <p>
                    {
                      [
                        p.role,
                        'Những vai diễn và ký ức được lưu lại cùng fandom.',
                        'Kết nối Junior, Mark và Jummo trong một góc nhỏ ấm áp.',
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
              <p>Jummo là linh vật, chưa có danh sách vai diễn.</p>
            ) : (
              eras
                .filter((e) => e.id !== 'fancon')
                .map((e) => (
                  <article className="archive-panel" key={e.id}>
                    <span className="eyebrow">{e.year}</span>
                    <h3>{e.title}</h3>
                    <p>{person === 'junior' ? e.roles.split(' & ')[0] : e.roles.split(' & ')[1]}</p>
                  </article>
                ))
            )}
          </div>
        ) : (
          <div className="archive-panel">
            <h3>Discography & Audio Archive</h3>
            <p>
              Chưa có danh sách bản thu được xác minh và file audio. Các tên bài trong mẫu không
              được coi là đĩa nhạc chính thức.
            </p>
            <a
              className="secondary-button"
              href="https://www.youtube.com/@gmmtv"
              target="_blank"
              rel="noreferrer"
            >
              Khám phá kênh GMMTV ↗
            </a>
          </div>
        )}
      </div>
    </Dialog>
  )
}
