import { useState } from 'react'
import { downloadText } from '../lib/archive'
import { Chips, PageIntro, Quiz, SectionTitle } from './shared'

export default function JummoWorld({ showInfo, openPhoto }) {
  // Năm lần chạm mở thư do fansite biên tập; không gán lời nhắn này cho nghệ sĩ.
  const [mood, setMood] = useState('music'),
    [rain, setRain] = useState(false),
    [taps, setTaps] = useState(0)
  const moods = {
    music: ['Jummo Headphone', 'Đắm chìm trong tiếng guitar và một giai điệu ấm áp.', '🎧'],
    book: ['Jummo Storybook', 'Một góc yên tĩnh để đọc sách và lưu lại câu chuyện.', '📖'],
    heart: ['Sunflower Heart', 'Gửi thật nhiều yêu thương tới JuniorMark và bạn.', '💛'],
  }
  const letter =
    'Gửi các vì sao thân yêu,\nMột ngày dù bận rộn đến đâu, mong bạn vẫn giữ cho mình một khoảng bình yên. Cảm ơn bạn đã mang âm nhạc và nụ cười đến góc nhỏ này.\n— Lời nhắn biên tập của fansite, không phải thư thật của nghệ sĩ.'
  return (
    <>
      <PageIntro
        eyebrow="JUNIOR (SUN) & MARK (MOON) SANCTUARY"
        title={
          <>
            Jummo’s Cosmic Studio &<br /> Secret Attic
          </>
        }
        description="Khám phá phòng sinh hoạt của Jummo, người bạn nhỏ trong dải ngân hà JuniorMark."
      >
        <button className="primary-button" onClick={() => setRain((v) => !v)} aria-pressed={rain}>
          {rain ? 'Dừng Mưa Jummo' : 'Kích hoạt Mưa Jummo'}
        </button>
      </PageIntro>
      {rain && (
        <div className="jummo-rain" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} style={{ left: `${i * 8}%`, animationDelay: `${i * 0.2}s` }}>
              🌻
            </span>
          ))}
        </div>
      )}
      <div className="two-columns">
        <section className="archive-panel mascot-stage">
          <button aria-label="Chạm Jummo mở thư" onClick={() => setTaps((n) => Math.min(5, n + 1))}>
            <img src="/images/jummo-mascot.png" alt="Jummo Mascot" />
            <span className="mood-accessory">{moods[mood][2]}</span>
          </button>
          <p>
            {moods[mood][0]} • Chạm {taps}/5
          </p>
        </section>
        <section className="archive-panel mood-console">
          <SectionTitle eyebrow="MOOD SWITCHER CONSOLE">Chọn biểu cảm & phụ kiện</SectionTitle>
          <Chips
            label="Tâm trạng Jummo"
            value={mood}
            onChange={setMood}
            options={Object.entries(moods).map(([id, m]) => [id, `${m[2]} ${m[0]}`])}
          />
          <h3 aria-live="polite">{moods[mood][1]}</h3>
          <div className="profile-tags">
            <span>Cosmic Blue & Sun Gold</span>
            <span>Gắn kết trái tim</span>
          </div>
          <a className="text-button" href="#/wall">
            Jummo chào bạn • Gửi nốt nhạc →
          </a>
        </section>
      </div>
      <SectionTitle eyebrow="SECRET MOMENTS & WARM HUGS">
        Những Cái Ôm Ngọt Ngào Bên Jummo
      </SectionTitle>
      <div className="three-columns">
        {[
          ['/images/junior-mark.png', 'Vòng tay bên người bạn nhỏ'],
          ['/images/fan-photos/HPWCyKybkAAHKUm.jpg', 'Jummo cùng biển bong bóng'],
          ['/images/fan-photos/HLlKtNeaUAA42uM.jpg', 'Nhật ký những ngày bình yên'],
        ].map(([src, title]) => (
          <button
            className="image-story"
            key={src}
            onClick={() =>
              openPhoto({
                src,
                title,
                alt: title,
                credit: 'Ảnh từ thiết kế / bộ ảnh người dùng cung cấp',
              })
            }
          >
            <img src={src} alt={title} />
            <div>
              <h3>{title}</h3>
            </div>
          </button>
        ))}
      </div>
      <section className="archive-panel attic-panel">
        <div>
          <SectionTitle eyebrow="SECRET HANDWRITTEN VAULT">
            Hòm Thư Tay Bí Mật Từ Tầng Gác Xép
          </SectionTitle>
          <p>Chạm vào Jummo 5 lần để mở lời nhắn kỷ niệm của fansite.</p>
          <progress max="5" value={taps} />
        </div>
        <div className="letter-paper">
          {taps === 5 ? (
            <>
              <h3>Gửi các vì sao thân yêu</h3>
              <p>{letter}</p>
              <button
                className="secondary-button"
                onClick={() => downloadText('loi-nhan-jummo.txt', letter)}
              >
                Lưu dòng chữ này ↓
              </button>
            </>
          ) : (
            <p>✉ Phong thư đang chờ bạn • {taps}/5</p>
          )}
        </div>
      </section>
      <SectionTitle eyebrow="JUMMO GOODIES & DIGITAL MERCH">Tải Về Quà Tặng Của Jummo</SectionTitle>
      <div className="three-columns">
        <article className="archive-panel">
          <h3>Jummo Mascot</h3>
          <p>Ảnh mascot đang dùng trong giao diện.</p>
          <a className="secondary-button" href="/images/jummo-mascot.png" download>
            Tải ảnh mascot ↓
          </a>
        </article>
        <article className="archive-panel">
          <h3>Bộ Sticker & Hình Nền</h3>
          <p>Thiết kế có mục 24 sticker và hình nền 4K. File gốc chưa được cung cấp.</p>
          <button className="secondary-button" disabled>
            Chưa có gói tải
          </button>
        </article>
        <article className="archive-panel">
          <h3>Hộ Chiếu & Nhật Ký</h3>
          <p>Lưu lại hành trình ghé thăm tiệm đĩa.</p>
          <button
            className="secondary-button"
            onClick={() =>
              showInfo(
                'Nhật ký Jummo',
                'Hôm nay bạn đã ghé gác xép, chọn một tâm trạng và gửi yêu thương. Hãy lưu lời nhắn sau khi mở phong thư.',
              )
            }
          >
            Xem cuốn nhật ký
          </button>
        </article>
      </div>
      <Quiz />
    </>
  )
}
