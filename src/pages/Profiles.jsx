import { t as tr, useLanguage, localize } from '../i18n/language'
import { catalog, birthdayLabel } from '../data/catalog'
import { useState } from 'react'
import { Chips, PageIntro, SectionTitle, Tip } from './shared'
import { photoPath } from './journeyData'
import { memoriesForPerson } from '../data/memories'
import ArtistSources from '../components/ArtistSources'

export default function Profiles({ person = 'duo' }) {
  useLanguage()
  const [selected, setSelected] = useState(person),
    [fact, setFact] = useState(0)
  const people = catalog.artists
    .filter((a) => a.kind === 'artist')
    .map((a) => ({
      ...a,
      birthday: birthdayLabel(a.birthday),
      image: a.portrait_image,
      theme: a.label,
      text: a.bio,
    }))
  return (
    <>
      <PageIntro
        eyebrow={tr('HỒ SƠ VÀ KHO LƯU TRỮ TINH TÚ', 'ORBITAL DOSSIER & ARCHIVES')}
        title={
          <>
            {' '}
            {tr('Mặt Trời, Mặt Trăng Và', 'The Sun, The Moon &')}{' '}
            <em>{tr('Quỹ Đạo Chung', 'Their Orbit')}</em>
          </>
        }
        description={tr(
          'Hai sắc màu, một hành trình được lưu giữ cùng JuniorMark và Jummo.',
          'Two colors, one journey preserved with JuniorMark and Jummo.',
        )}
      >
        <Chips
          label={tr('Chọn hồ sơ', 'Choose a profile')}
          value={selected}
          onChange={setSelected}
          options={[
            ['duo', tr('Cặp Đôi Tinh Tú', 'Celestial Duo')],
            ['junior', 'Junior Panachai'],
            ['mark', 'Mark Jiruntanin'],
          ]}
        />
      </PageIntro>
      <div className="profile-grid">
        {people
          .filter((p) => selected === 'duo' || p.id === selected)
          .map((p) => (
            <article className={`archive-panel profile-card ${p.id}`} key={p.id}>
              <span className="eyebrow">
                {localize(p.theme)} {tr('• NGHỆ SĨ GMMTV', '• GMMTV ARTIST')}
              </span>
              <div className="profile-main">
                <img src={photoPath(p.image)} alt={p.name} />
                <div>
                  <h2>{p.name}</h2>
                  {p.full_name_english && <p className="profile-full-name">{p.full_name_english}</p>}
                  <p className="blue">{localize(p.birthday)}</p>
                  <p>{localize(p.text)}</p>
                  <div className="profile-tags">
                    {p.skills.map((s) => (
                      <span key={s}>{localize(s)}</span>
                    ))}
                  </div>
                  <ArtistSources artist={p} />
                </div>
              </div>
            </article>
          ))}
      </div>
      <section className="archive-panel">
        <SectionTitle eyebrow={tr('BẢN HÒA ĐIỆU TINH TÚ', 'CELESTIAL HARMONIC MATRIX')}>
          {' '}
          {tr(
            'Duyên Nợ Tinh Cầu: Mặt Trời Và Mặt Trăng',
            'Celestial Connection: Sun & Moon Duality',
          )}{' '}
        </SectionTitle>
        <div className="duality-grid">
          <div>
            <h3>{tr('☀ Junior • Mặt Trời', '☀ Junior • The Sun')}</h3>
            <p>
              {tr(
                'Ánh dương ấm áp, sự đồng hành và những câu chuyện được kể bằng nụ cười.',
                'Warm sunshine, companionship and stories told through smiles.',
              )}
            </p>
          </div>
          <img
            src="/images/jummo-mascot.png"
            alt={tr('Jummo kết nối Mặt Trời và Mặt Trăng', 'Jummo connects Sun & Moon')}
          />
          <div>
            <h3>{tr('☾ Mark • Mặt Trăng', '☾ Mark • The Moon')}</h3>
            <p>
              {tr(
                'Ánh nguyệt dịu dàng, âm nhạc và những khoảng lặng trong góc nhỏ của fandom.',
                'Gentle moonlight, music and quiet moments in our little fandom corner.',
              )}
            </p>
          </div>
        </div>
      </section>
      <SectionTitle eyebrow={tr('KHO ÂM THANH VÀ THƯ', 'AUDIO & LETTER ARCHIVES')}>
        {tr('Ghi Chú Và Lời Nhắn Âm Thanh', 'Liner Notes & Voice Memos')}
      </SectionTitle>
      <div className="two-columns">
        {[
          'Mặt Trời Sau Cơn Mưa',
          'Khúc Hát Giữa Dải Ngân Hà',
        ].map((s, i) => (
          <article className="archive-panel" key={s}>
            <h3>
              {' '}
              {tr('Lời nhắn âm thanh #', 'Voice Memo #')}
              {i + 1}: {localize(s)}
            </h3>
            <p>
              {tr(
                'Tên chuyên mục từ thiết kế. Bản ghi âm sẽ được bổ sung khi có nguồn.',
                'Section names come from the design. Recordings will be added when sources are available.',
              )}
            </p>
            <button className="secondary-button" disabled>
              {' '}
              {tr('Chưa có bản thu', 'No recording yet')}{' '}
            </button>
          </article>
        ))}
      </div>
      <SectionTitle eyebrow={tr('HÀNH TRÌNH TINH TÚ', 'CELESTIAL TRAJECTORY')}>
        {tr('Hành Trình Của Cặp Đôi', 'The Vertical Couple Journey')}
      </SectionTitle>
      <div className="vertical-journey">
        {memoriesForPerson(selected).map((e, i) => (
          <article key={e.id}>
            <div>
              <span className="eyebrow">
                {localize(e.year)} {tr('• CHƯƠNG 0', '• ARC 0')}
                {i + 1}
              </span>
              <h3>{e.title}</h3>
              <p>{localize(e.roles)}</p>
              <p>{localize(e.text)}</p>
              <a href={`#/timeline?era=${e.id}`} className="text-button">
                {' '}
                {tr('Khám phá cột mốc ↗', 'Explore milestone ↗')}{' '}
              </a>
            </div>
            <img
              src={photoPath(e.image)}
              alt={`${tr('Ảnh bộ sưu tập', 'Collection photo')} ${e.title}`}
              loading="lazy"
            />
          </article>
        ))}
      </div>
      <Tip>
        {
          [
            tr(
              'Jummo là góc kết nối hai sắc màu Mặt Trời và Mặt Trăng trong thiết kế fansite.',
              'Jummo connects the Sun & Moon colors in this fansite.',
            ),
            tr(
              'Bạn có thể lưu ngày sinh nhật ở Studio để thêm vào lịch cá nhân.',
              'Save birthdays in the Studio to add them to your personal calendar.',
            ),
            tr(
              'Kho Truyền Thông lưu ảnh gốc và ghi nguồn để bạn dễ tìm lại.',
              'The Media Hub keeps original photos and credits so you can find them again.',
            ),
          ][fact]
        }{' '}
        <button className="text-button" onClick={() => setFact((fact + 1) % 3)}>
          {' '}
          {tr('Đổi lời nhắc', 'Change reminder')}{' '}
        </button>
      </Tip>
    </>
  )
}
