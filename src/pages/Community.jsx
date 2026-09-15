import { useState } from 'react'
import { useAuth } from '../features/auth/authContext'
import useMessages from '../features/community/useMessages'
import { playNote } from '../lib/archive'
import { Chips, Empty, PageIntro, Quiz, SectionTitle } from './shared'
import StarSkyBackground from './StarSkyBackground'

const spectra = [
  ['all', 'Tất cả vì sao'],
  ['junior', 'Junior Ánh Dương'],
  ['mark', 'Mark Ánh Nguyệt'],
  ['jummo', 'Jummo Sunflower'],
]
export default function Community({ kind = 'star', openAuth, showInfo }) {
  // Dùng chung form và dữ liệu cho Starry Sky/Wall; từng loại lưu ở không gian riêng.
  const auth = useAuth(),
    api = useMessages(kind, auth.session?.user.id),
    isSky = kind === 'star'
  const [filter, setFilter] = useState('all'),
    [form, setForm] = useState({ name: '', country: '', body: '', spectrum: 'jummo' }),
    [notice, setNotice] = useState(''),
    [error, setError] = useState(''),
    [zoom, setZoom] = useState(1),
    [liked, setLiked] = useState([])
  const visible = api.messages.filter((m) => filter === 'all' || m.spectrum === filter)
  const field = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  async function submit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    try {
      const message = await api.submit(form)
      if (message) {
        setNotice(message)
        field('body', '')
      }
    } catch (e) {
      setError(e.message)
    }
  }
  async function inspect(m, i) {
    await playNote(i)
    showInfo(m.name, `${m.body}\n${m.country}`)
  }
  return (
    <>
      <PageIntro
        eyebrow={
          isSky
            ? 'MILKY WAY GATEWAY / COSMIC FANDOM SANCTUARY'
            : 'FAN RESONANCE & INTERACTIVE CHAMBER'
        }
        title={isSky ? 'Our Starry Sky' : 'The Jam Session & Wall of Melody'}
        description={
          isSky
            ? 'Bầu Trời Nguyện Ước JuniorMark — mỗi lời chúc là một vì sao.'
            : 'Gửi lời nhắn trên những nốt đàn, cùng Jummo lưu giữ giai điệu từ trái tim bạn.'
        }
      >
        <div className="stat-pill">
          <strong>{api.messages.length}</strong>
          <span>
            {isSky ? 'NGÔI SAO' : 'NỐT NHẠC'} {api.demo ? 'TRÊN MÁY NÀY' : 'ĐÃ DUYỆT'}
          </span>
        </div>
      </PageIntro>
      <p className="notice">
        {api.demo
          ? 'Đang ở chế độ xem thử: lời nhắn chỉ lưu trên trình duyệt này.'
          : 'Lời nhắn mới cần được duyệt trước khi xuất hiện công khai.'}{' '}
        Âm thanh tương tác là nốt nhạc tổng hợp.
      </p>
      {api.error && (
        <p className="error-message" role="alert">
          {api.error}
        </p>
      )}
      <div className="toolbar">
        <Chips label="Lọc bản sắc" options={spectra} value={filter} onChange={setFilter} />
        {isSky && (
          <div className="toolbar">
            <button
              className="icon-button"
              aria-label="Thu nhỏ bầu trời"
              onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
            >
              −
            </button>
            <button
              className="icon-button"
              aria-label="Phóng to bầu trời"
              onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
            >
              +
            </button>
            <button className="text-button" onClick={() => setZoom(1)}>
              Đặt lại
            </button>
          </div>
        )}
      </div>
      {isSky ? (
        <section className="sky-window" aria-label="Bầu trời tương tác">
          <div className="star-field" style={{ width: `${100 * zoom}%`, minHeight: 450 * zoom }}>
            <StarSkyBackground />
            {visible.map((m, i) => (
              <button
                className={`sky-star ${m.spectrum}`}
                style={{ left: `${10 + ((i * 31) % 80)}%`, top: `${15 + ((i * 23) % 65)}%` }}
                key={m.id}
                onClick={() => inspect(m, i)}
              >
                <b>✦</b>
                <span>{m.name}</span>
              </button>
            ))}
            {!visible.length && <Empty>Bầu trời đang chờ ngôi sao đầu tiên của bạn.</Empty>}
          </div>
        </section>
      ) : (
        <div className="notes-grid">
          {visible.map((m, i) => (
            <article className={`archive-panel note-card ${m.spectrum}`} key={m.id}>
              <button
                className="text-button"
                aria-label={`Nghe nốt nhạc của ${m.name}`}
                onClick={() => playNote(i)}
              >
                ♫ {m.spectrum.toUpperCase()}
              </button>
              <blockquote>“{m.body}”</blockquote>
              <p>
                {m.name} · {m.country}
              </p>
              <button
                className="text-button"
                aria-pressed={liked.includes(m.id)}
                onClick={() =>
                  setLiked((l) => (l.includes(m.id) ? l.filter((id) => id !== m.id) : [...l, m.id]))
                }
              >
                {liked.includes(m.id) ? '♥ Đã lưu yêu thích' : '♡ Yêu thích'}
              </button>
            </article>
          ))}
          {!visible.length && <Empty>Chưa có nốt nhạc trong bộ lọc này.</Empty>}
        </div>
      )}
      <div className="two-columns">
        <form className={`archive-panel community-form spectrum-${form.spectrum}`} onSubmit={submit} noValidate>
          <SectionTitle eyebrow={isSky ? 'THẮP SÁNG NGUYỆN ƯỚC' : 'BẢN PHÍM GIAO HƯỞNG'}>
            {isSky ? 'Phóng Ngôi Sao Lên Bầu Trời' : 'Gõ Nốt Nhạc Của Bạn'}
          </SectionTitle>
          <label>
            Tên hiển thị / Fandom nickname
            <input
              value={form.name}
              maxLength={50}
              onChange={(e) => field('name', e.target.value)}
              placeholder="Tên của bạn"
            />
          </label>
          <label>
            Quốc gia / Thành phố
            <input
              value={form.country}
              maxLength={60}
              onChange={(e) => field('country', e.target.value)}
              placeholder="Hà Nội, Bangkok…"
            />
          </label>
          <Chips
            label="Chọn bản sắc"
            options={spectra.slice(1)}
            value={form.spectrum}
            onChange={(v) => field('spectrum', v)}
          />
          <label>
            Lời chúc / Tâm nguyện
            <textarea
              value={form.body}
              maxLength={200}
              onChange={(e) => field('body', e.target.value)}
              rows={4}
            />
          </label>
          <small>{form.body.length}/200 ký tự</small>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}
          {!api.demo && !auth.session ? (
            <button type="button" className="primary-button" onClick={() => openAuth('signin')}>
              Đăng nhập để gửi
            </button>
          ) : (
            <button className="primary-button" disabled={api.busy}>
              {api.busy
                ? 'Đang gửi…'
                : api.demo
                  ? 'Lưu nguyện ước xem thử'
                  : isSky
                    ? 'Phóng ngôi sao'
                    : 'Thả nốt nhạc lên tường'}
            </button>
          )}
        </form>
        <aside className="archive-panel">
          <SectionTitle eyebrow="FANDOM CONNECTION">
            {isSky ? 'Những Vì Sao Mới Nhất' : 'Support & Voting Assistant Hub'}
          </SectionTitle>
          {isSky ? (
            <>
              {api.messages.slice(0, 5).map((m, i) => (
                <button className="recent-star" key={m.id} onClick={() => inspect(m, i)}>
                  <span>0{i + 1} ✦</span>
                  <div>
                    <b>{m.name}</b>
                    <small>{m.country}</small>
                  </div>
                </button>
              ))}
              {!api.messages.length && <p>Danh sách sẽ xuất hiện khi có lời nhắn.</p>}
              <a className="secondary-button" href="#/wall">
                Ghé Wall of Melody →
              </a>
            </>
          ) : (
            <>
              <p>
                Soạn lời cổ vũ của riêng bạn, xem nguồn thông báo và hướng dẫn dành cho fan mới.
              </p>
              <a className="primary-button" href="#/projects">
                Mở Fan Projects & Cẩm nang →
              </a>
              <p className="muted">Không có chiến dịch bình chọn nào đã được cấu hình.</p>
            </>
          )}
        </aside>
      </div>
      {isSky ? (
        <section className="archive-panel">
          <SectionTitle eyebrow="WORLD FANDOM CONSTELLATION">
            Hành Tinh Fandom & Dấu Ấn Toàn Cầu
          </SectionTitle>
          <p>
            {new Set(api.messages.map((m) => m.country)).size} địa điểm được người gửi khai báo
            trong {api.demo ? 'bản xem thử' : 'các lời nhắn đã duyệt'}.
          </p>
          <p className="muted">
            Các số liệu 24.892 ngôi sao và 148 quốc gia trong thiết kế là dữ liệu minh họa, không
            hiển thị như thống kê thật.
          </p>
        </section>
      ) : (
        <Quiz />
      )}
    </>
  )
}
