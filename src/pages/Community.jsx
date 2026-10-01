import { t as tr, useLanguage, localize } from '../i18n/language'
import { useState } from 'react'
import { useAuth } from '../features/auth/authContext'
import useMessages from '../features/community/useMessages'
import { playNote } from '../lib/archive'
import { Chips, Empty, PageIntro, Quiz, SectionTitle } from './shared'
import SkyExperience from './SkyExperience'
import { useOrbit } from '../features/orbit/orbitContext'
import { safeMessageDate } from '../lib/starLayout'
import Dialog from '../components/Dialog'
import SaveToOrbit from '../components/SaveToOrbit'

export default function Community({ kind = 'star', openAuth }) {
  useLanguage()
  const spectra = [
    ['all', tr('Tất cả vì sao', 'All stars')],
    ['junior', tr('Junior Ánh Dương', 'Junior Sunshine')],
    ['mark', tr('Mark Ánh Nguyệt', 'Mark Moonlight')],
    ['jummo', tr('Jummo Hướng Dương', 'Jummo Sunflower')],
  ]
  const orbit = useOrbit()
  // Dùng chung form và dữ liệu cho Starry Sky/Wall; từng loại lưu ở không gian riêng.
  const auth = useAuth(),
    api = useMessages(kind, auth.session?.user.id),
    isSky = kind === 'star'
  const [filter, setFilter] = useState('all'),
    [form, setForm] = useState({ name: '', country: '', body: '', spectrum: 'jummo' }),
    [skySubmission, setSkySubmission] = useState(null),
    [notice, setNotice] = useState(''),
    [error, setError] = useState(''),
    [selected, setSelected] = useState(null)
  const visible = api.messages.filter((m) => filter === 'all' || m.spectrum === filter)
  const field = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  async function submit(e) {
    e.preventDefault()
    const source = (
      e.nativeEvent.submitter || e.currentTarget.querySelector('button.primary-button')
    )?.getBoundingClientRect()
    const origin = source
      ? { x: source.left + source.width / 2, y: source.top + source.height / 2 }
      : null
    const previousIds = api.messages.map((item) => item.id)
    setError('')
    setNotice('')
    try {
      const message = await api.submit(form)
      if (message) {
        if (isSky && orbit) await orbit.save('progress', 'star', { demo: api.demo })
        if (isSky) setSkySubmission({ origin, previousIds, form: { ...form }, at: Date.now() })
        setNotice(message)
        field('body', '')
      }
    } catch (e) {
      setError(e.message)
    }
  }
  async function inspect(m, i) {
    setSelected(m)
    await playNote(i)
  }
  const wishForm = (
    <form
      className={`archive-panel community-form spectrum-${form.spectrum}`}
      onSubmit={submit}
      noValidate
    >
      <SectionTitle
        eyebrow={
          isSky
            ? tr('THẮP SÁNG NGUYỆN ƯỚC', 'LIGHT UP A WISH')
            : tr('BẢN PHÍM GIAO HƯỞNG', 'SYMPHONY KEYBOARD')
        }
      >
        {isSky
          ? tr('Phóng Ngôi Sao Lên Bầu Trời', 'Send a Star into the Sky')
          : tr('Gõ Nốt Nhạc Của Bạn', 'Play Your Note')}
      </SectionTitle>
      <label>
        {' '}
        {tr('Tên hiển thị / Biệt danh', 'Display name / Fandom nickname')}{' '}
        <input
          value={form.name}
          maxLength={50}
          onChange={(e) => field('name', e.target.value)}
          placeholder={tr('Tên của bạn', 'Your name')}
        />
      </label>
      <label>
        {' '}
        {tr('Quốc gia / Thành phố', 'Country / City')}{' '}
        <input
          value={form.country}
          maxLength={60}
          onChange={(e) => field('country', e.target.value)}
          placeholder={tr('Hà Nội, Bangkok…', 'Hanoi, Bangkok…')}
        />
      </label>
      <Chips
        label={tr('Chọn bản sắc', 'Choose your spectrum')}
        options={spectra.slice(1)}
        value={form.spectrum}
        onChange={(v) => field('spectrum', v)}
      />
      <label>
        {' '}
        {tr('Lời chúc / Tâm nguyện', 'Message / Wish')}{' '}
        <textarea
          value={form.body}
          maxLength={200}
          onChange={(e) => field('body', e.target.value)}
          rows={4}
        />
      </label>
      <small>
        {form.body.length}
        {tr('/200 ký tự', '/200 characters')}
      </small>
      {error && (
        <p className="error-message" role="alert">
          {localize(error)}
        </p>
      )}
      {notice && (
        <p className="notice" role="status">
          {localize(notice)}
        </p>
      )}
      {!api.demo && !auth.session ? (
        <button type="button" className="primary-button" onClick={() => openAuth('signin')}>
          {' '}
          {tr('Đăng nhập để gửi', 'Sign in to submit')}{' '}
        </button>
      ) : (
        <button className="primary-button" disabled={api.busy}>
          {api.busy
            ? tr('Đang gửi…', 'Submitting…')
            : api.demo
              ? tr('Lưu nguyện ước xem thử', 'Save a preview wish')
              : isSky
                ? tr('Phóng ngôi sao', 'Launch a star')
                : tr('Thả nốt nhạc lên tường', 'Leave a note on the wall')}
        </button>
      )}
    </form>
  )
  if (isSky)
    return (
      <SkyExperience
        key={auth.session?.user.id || 'guest'}
        api={api}
        userId={auth.session?.user.id}
        submission={skySubmission}
        notice={localize(notice)}
        spectra={spectra}
      >
        {wishForm}
      </SkyExperience>
    )
  return (
    <>
      <PageIntro
        eyebrow={tr('GÓC GIAO LƯU CỦA NGƯỜI HÂM MỘ', 'FAN RESONANCE & INTERACTIVE CHAMBER')}
        title={tr('Buổi Hòa Tấu Và Bức Tường Giai Điệu', 'The Jam Session & Wall of Melody')}
        description={tr(
          'Gửi lời nhắn trên những nốt đàn, cùng Jummo lưu giữ giai điệu từ trái tim bạn.',
          'Leave a message on a musical note and let Jummo keep the melody from your heart.',
        )}
      >
        <div className="stat-pill">
          <strong>{api.messages.length}</strong>
          <span>
            {tr('NỐT NHẠC', 'NOTES')}{' '}
            {api.demo ? tr('TRÊN MÁY NÀY', 'ON THIS DEVICE') : tr('ĐÃ DUYỆT', 'APPROVED')}
          </span>
        </div>
      </PageIntro>
      <p className="notice">
        {api.demo
          ? tr(
              'Đang ở chế độ xem thử: lời nhắn chỉ lưu trên trình duyệt này.',
              'Preview mode: messages are saved only in this browser.',
            )
          : tr(
              'Lời nhắn mới cần được duyệt trước khi xuất hiện công khai.',
              'New messages require approval before appearing publicly.',
            )}{' '}
        {tr(
          'Âm thanh tương tác là nốt nhạc tổng hợp.',
          'Interactive sounds are synthesized musical notes.',
        )}{' '}
      </p>
      {api.error && (
        <p className="error-message" role="alert">
          {localize(api.error)}
        </p>
      )}
      <div className="toolbar">
        <Chips
          label={tr('Lọc bản sắc', 'Filter spectrum')}
          options={spectra}
          value={filter}
          onChange={setFilter}
        />
      </div>
      <div className="notes-grid">
        {visible.map((m, i) => (
          <article className={`archive-panel note-card ${m.spectrum}`} key={m.id}>
            <button
              className="text-button"
              aria-label={`${tr('Nghe nốt nhạc của', 'Play the note from')} ${m.name}`}
              onClick={() => playNote(i)}
            >
              ♫ {m.spectrum.toUpperCase()}
            </button>
            <blockquote>“{m.body}”</blockquote>
            <p>
              {m.name} · {m.country}
            </p>
            <button className="text-button" onClick={() => inspect(m, i)}>
              {' '}
              {tr('Mở chi tiết ngôi sao ↗', 'Open star details ↗')}{' '}
            </button>
            <SaveToOrbit kind="favorite" id={m.id} payload={{ name: m.name, kind }} />
          </article>
        ))}
        {!visible.length && (
          <Empty>
            {tr('Chưa có nốt nhạc trong bộ lọc này.', 'No notes match this filter yet.')}
          </Empty>
        )}
      </div>
      {selected && (
        <Dialog title={selected.name} onClose={() => setSelected(null)}>
          <p>{selected.body}</p>
          <p>
            {tr('Địa điểm tự khai:', 'Declared location:')} {selected.country}
          </p>
          <p>
            {tr('Sắc màu:', 'Spectrum:')} {localize(selected.spectrum)}
          </p>
          <p>{safeMessageDate(selected.created_at)} · UTC+7</p>
          <SaveToOrbit kind="favorite" id={selected.id} payload={{ name: selected.name, kind }} />
        </Dialog>
      )}
      <div className="two-columns">
        {wishForm}
        <aside className="archive-panel">
          <SectionTitle eyebrow={tr('KẾT NỐI NGƯỜI HÂM MỘ', 'FANDOM CONNECTION')}>
            {tr('Góc Cổ Vũ Và Bình Chọn', 'Support & Voting Assistant Hub')}
          </SectionTitle>
          <p>
            {tr(
              'Soạn lời cổ vũ của riêng bạn, xem nguồn thông báo và hướng dẫn dành cho fan mới.',
              'Write your own words of support, check announcement sources and explore the new fan guide.',
            )}
          </p>
          <a className="primary-button" href="#/projects">
            {' '}
            {tr('Mở Dự án & Cẩm nang →', 'Open Fan Projects & Guide →')}{' '}
          </a>
          <p className="muted">
            {tr(
              'Không có chiến dịch bình chọn nào đã được cấu hình.',
              'No voting campaigns have been configured.',
            )}
          </p>
        </aside>
      </div>
      <Quiz />
    </>
  )
}
