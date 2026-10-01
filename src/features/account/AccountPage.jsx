import { t, useLanguage, localize, translateError } from '../../i18n/language'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/authContext'
import { useOrbit } from '../orbit/orbitContext'
import { apiClient } from '../../lib/apiClient'
import { downloadPrivateData, safeSavedUrl, validateNote } from './account'
import PasswordForm from '../auth/PasswordForm'
import ThemeToggle from '../../components/ThemeToggle'
import SaveToOrbit from '../../components/SaveToOrbit'
import './AccountPage.css'

const blankNote = { title: '', body: '' }

// Mỗi lần đổi tài khoản remount toàn bộ vùng dữ liệu riêng, không hiển thị dữ liệu tài khoản cũ.
export default function AccountPage({ openAuth }) {
  useLanguage()
  const auth = useAuth()
  if (auth.loading)
    return (
      <section className="archive-panel" role="status">
        {t('Đang kiểm tra phiên đăng nhập…', 'Checking your session…')}
      </section>
    )
  if (!auth.session)
    return (
      <section className="archive-panel account-guest">
        <h1>{t('Góc cá nhân', 'Your space')}</h1>
        <p>
          {t(
            'Đăng nhập để quản lý hồ sơ, lưu ảnh, ghi chú và đồng bộ bộ sưu tập trên các thiết bị.',
            'Sign in to manage your profile, save photos and notes, and sync your collection across devices.',
          )}
        </p>
        {!auth.configured && (
          <p className="notice">
            {t(
              'Dịch vụ tài khoản chưa được kết nối. Bộ sưu tập khách vẫn dùng được trên thiết bị này.',
              'Account services are not connected yet. Your guest collection is still available on this device.',
            )}
          </p>
        )}
        <div className="account-actions">
          <button className="primary-button" onClick={() => openAuth('signin')}>
            {t('Đăng nhập', 'Sign in')}
          </button>
          <button className="secondary-button" onClick={() => openAuth('signup')}>
            {t('Đăng ký', 'Sign up')}
          </button>
          <a className="text-button" href="#/orbit">
            {t('Xem bộ sưu tập khách ↗', 'View guest collection ↗')}
          </a>
        </div>
      </section>
    )
  return <AccountWorkspace key={auth.session.user.id} auth={auth} />
}

function AccountWorkspace({ auth }) {
  const { locale } = useLanguage()
  const tabs = [
    ['profile', t('Hồ sơ', 'Profile')],
    ['settings', t('Cài đặt', 'Settings')],
    ['privacy', t('Quyền riêng tư', 'Privacy')],
    ['saved', t('Đã lưu', 'Saved')],
    ['notes', t('Ghi chú', 'Notes')],
  ]

  const orbit = useOrbit(),
    userId = auth.session.user.id
  const [tab, setTab] = useState('profile'),
    [draft, setDraft] = useState(null)
  const [notes, setNotes] = useState([]),
    [note, setNote] = useState(blankNote),
    [selected, setSelected] = useState(null),
    [confirmDelete, setConfirmDelete] = useState(null)
  const [showCountry, setShowCountry] = useState(false),
    [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState(''),
    [retry, setRetry] = useState(0)
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('')
  const [reduceMotion, setReduceMotion] = useState(
    () => document.documentElement.dataset.reduceMotion === 'true',
  )
  const alive = useRef(true),
    lock = useRef(false)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])
  useEffect(() => {
    let active = true
    async function load() {
      const settings = await apiClient
        .from('user_settings')
        .select('show_country')
        .eq('user_id', userId)
        .maybeSingle()
      if (settings.error) throw settings.error
      let all = []
      // Đọc từng trang để không cắt mất ghi chú khi API giới hạn số bản ghi.
      for (let offset = 0; ; offset += 100) {
        const result = await apiClient
          .from('user_notes')
          .select('id,title,body,updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .order('id')
          .range(offset, offset + 99)
        if (result.error) throw result.error
        all.push(...result.data)
        if (!active || result.data.length < 100) break
      }
      if (active) {
        setShowCountry(settings.data?.show_country ?? false)
        setNotes(all)
      }
    }
    load()
      .catch(() => {
        if (active)
          setLoadError(
            t(
              'Chưa tải được dữ liệu cá nhân. Kiểm tra kết nối rồi thử lại. Không có thay đổi nào được lưu.',
              'Your personal data could not load. Check your connection and try again. No changes were saved.',
            ),
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [userId, retry])
  const profile = draft || {
    display_name: auth.profile?.display_name || '',
    bio: auth.profile?.bio || '',
    avatar_url: auth.profile?.avatar_url || '',
  }
  async function run(action, success) {
    if (lock.current) return
    lock.current = true
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await action()
      if (alive.current) setMessage(success)
    } catch (error) {
      if (alive.current)
        setError(
          error.message ||
            t(
              'Chưa lưu được thay đổi. Vui lòng thử lại.',
              'Your changes could not be saved. Please try again.',
            ),
        )
    } finally {
      lock.current = false
      if (alive.current) setBusy(false)
    }
  }
  async function saveNote(event) {
    event.preventDefault()
    const invalid = validateNote(note)
    if (invalid) {
      setError(invalid)
      return
    }
    await run(
      async () => {
        const data = { title: note.title.trim(), body: note.body }
        const builder = selected
          ? apiClient.from('user_notes').update(data).eq('id', selected).eq('user_id', userId)
          : apiClient.from('user_notes').insert({ ...data, user_id: userId })
        const result = await builder.select('id,title,body,updated_at').single()
        if (result.error)
          throw new Error(
            t(
              'Không lưu được ghi chú. Nội dung đang soạn vẫn được giữ để thử lại.',
              'Your note could not be saved. Your draft is kept so you can try again.',
            ),
          )
        if (alive.current) {
          setNotes((old) => [result.data, ...old.filter((n) => n.id !== result.data.id)])
          setSelected(result.data.id)
        }
      },
      t('Đã lưu ghi chú riêng tư.', 'Private note saved.'),
    )
  }
  function savedUrl(item) {
    if (item.kind === 'memory') return '#/timeline?memory=' + encodeURIComponent(item.item_id)
    if (item.kind === 'event') return '#/schedule'
    if (item.kind === 'favorite') return item.payload.kind === 'note' ? '#/wall' : '#/sky'
    return safeSavedUrl(item.payload.url)
  }
  const saved = orbit.items.filter(
    (item) =>
      item.kind !== 'progress' &&
      `${item.payload.title || item.item_id}`.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <div className="account-workspace">
      <header className="account-heading">
        <div>
          <span className="eyebrow">
            {t('QUỸ ĐẠO CỦA TÔI · GÓC RIÊNG CỦA BẠN', 'MY ORBIT · YOUR OWN SPACE')}
          </span>
          <h1>{t('Góc cá nhân', 'Your space')}</h1>
          <p>
            {auth.profile?.display_name || t('Thành viên', 'Member')} · {auth.session.user.email}
          </p>
        </div>
        <a className="text-button" href="#/orbit">
          {t('Hành trình của bạn ↗', 'Your journey ↗')}
        </a>
      </header>
      <nav className="account-tabs" aria-label={t('Quản lý tài khoản', 'Account management')}>
        {tabs.map(([id, label]) => (
          <button
            className={tab === id ? 'selected' : ''}
            aria-current={tab === id ? 'page' : undefined}
            key={id}
            disabled={busy}
            onClick={() => {
              setTab(id)
              setError('')
              setMessage('')
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="archive-panel account-panel">
        {error && (
          <p role="alert" className="error-message">
            {translateError(error)}
          </p>
        )}
        {message && (
          <p role="status" className="success-message">
            {localize(message)}
          </p>
        )}
        {tab === 'profile' && (
          <form
            className="account-form"
            onSubmit={(e) => {
              e.preventDefault()
              run(() => auth.updateProfile(profile), t('Đã cập nhật hồ sơ.', 'Profile updated.'))
            }}
          >
            <h2>{t('Hồ sơ của bạn', 'Your profile')}</h2>
            <p className="muted">
              {t(
                'Email dùng để đăng nhập. Hồ sơ này chỉ hiển thị trong tài khoản của bạn.',
                'Use your email to sign in. This profile is only visible in your account.',
              )}
            </p>
            {auth.profileError && (
              <p role="alert" className="error-message">
                {translateError(auth.profileError)}
              </p>
            )}
            {auth.profile?.avatar_url && (
              <img
                className="profile-avatar"
                src={auth.profile.avatar_url}
                alt={t('Ảnh đại diện của bạn', 'Your avatar')}
                referrerPolicy="no-referrer"
              />
            )}
            <label>
              {t('Tên hiển thị', 'Display name')}
              <input
                required
                minLength={2}
                maxLength={50}
                autoComplete="nickname"
                value={profile.display_name}
                disabled={busy || !auth.profile}
                onChange={(e) => setDraft({ ...profile, display_name: e.target.value })}
              />
            </label>
            <label>
              {t('Ảnh đại diện (link HTTPS)', 'Avatar (HTTPS link)')}
              <input
                type="url"
                value={profile.avatar_url}
                disabled={busy || !auth.profile}
                placeholder="https://…"
                onChange={(e) => setDraft({ ...profile, avatar_url: e.target.value })}
              />
            </label>
            <label>
              {t('Giới thiệu', 'Bio')}
              <textarea
                rows={4}
                maxLength={500}
                value={profile.bio}
                disabled={busy || !auth.profile}
                onChange={(e) => setDraft({ ...profile, bio: e.target.value })}
              />
              <small>
                {profile.bio.length}/500 {t('ký tự', 'characters')}
              </small>
            </label>
            <button className="primary-button" disabled={busy || !auth.profile}>
              {busy ? t('Đang lưu…', 'Saving…') : t('Lưu hồ sơ', 'Save profile')}
            </button>
          </form>
        )}
        {tab === 'settings' && (
          <div className="account-form">
            <h2>{t('Cài đặt hiển thị', 'Display settings')}</h2>
            <p className="muted">
              {t(
                'Lưu trên thiết bị này, dùng cả khi bạn đăng xuất.',
                'Saved on this device, including when you sign out.',
              )}
            </p>
            <ThemeToggle />
            <label className="account-check">
              <input
                type="checkbox"
                checked={reduceMotion}
                onChange={(e) => {
                  const next = e.target.checked
                  setReduceMotion(next)
                  document.documentElement.dataset.reduceMotion = String(next)
                  try {
                    localStorage.setItem('jm-reduce-motion', String(next))
                  } catch {
                    setError(
                      t(
                        'Đã đổi hiển thị nhưng trình duyệt không cho lưu cài đặt.',
                        'Display updated, but your browser could not save this setting.',
                      ),
                    )
                  }
                }}
              />
              {t('Giảm chuyển động và hiệu ứng', 'Reduce motion and effects')}
            </label>
            <hr />
            <PasswordForm auth={auth} />
            <button
              className="text-button"
              disabled={busy}
              onClick={() =>
                run(
                  () => auth.requestPasswordReset(auth.session.user.email),
                  t(
                    'Nếu email đủ điều kiện, liên kết khôi phục sẽ được gửi đến hộp thư của bạn.',
                    'If your email is eligible, a recovery link will be sent to your inbox.',
                  ),
                )
              }
            >
              {t(
                'Quên mật khẩu hiện tại? Gửi liên kết khôi phục',
                'Forgot your current password? Send a recovery link',
              )}
            </button>
            <hr />
            <button
              className="secondary-button"
              disabled={busy}
              onClick={() => run(() => auth.signOut(), '')}
            >
              {t('Đăng xuất thiết bị này', 'Sign out of this device')}
            </button>
          </div>
        )}
        {tab === 'privacy' && (
          <div className="account-form">
            <h2>{t('Quyền riêng tư', 'Privacy')}</h2>
            <p>
              {t(
                'Ghi chú, hồ sơ và danh sách đã lưu chỉ thuộc tài khoản của bạn. Lời nhắn cộng đồng sẽ công khai sau khi được duyệt.',
                'Your notes, profile, and saved list belong only to your account. Community messages become public after approval.',
              )}
            </p>
            {loading ? (
              <p role="status">{t('Đang tải tùy chọn…', 'Loading preferences…')}</p>
            ) : loadError ? (
              <p role="alert">{translateError(loadError)}</p>
            ) : (
              <>
                <label className="account-check">
                  <input
                    type="checkbox"
                    checked={showCountry}
                    disabled={busy}
                    onChange={(e) => setShowCountry(e.target.checked)}
                  />
                  {t('Hiện quốc gia trên lời nhắn mới', 'Show country on new messages')}
                </label>
                <small>
                  {t(
                    'Áp dụng cho các lần gửi tiếp theo. Tắt tùy chọn sẽ thay quốc gia bằng GLOBAL; bài cũ giữ nguyên.',
                    'Applies to future submissions. Turning this off replaces your country with GLOBAL; existing posts stay unchanged.',
                  )}
                </small>
                <button
                  className="primary-button"
                  disabled={busy}
                  onClick={() =>
                    run(
                      async () => {
                        const result = await apiClient
                          .from('user_settings')
                          .upsert({ user_id: userId, show_country: showCountry })
                        if (result.error)
                          throw new Error(
                            t(
                              'Chưa lưu được lựa chọn quyền riêng tư.',
                              'Your privacy preference could not be saved.',
                            ),
                          )
                      },
                      t('Đã lưu lựa chọn quyền riêng tư.', 'Privacy preference saved.'),
                    )
                  }
                >
                  {t('Lưu quyền riêng tư', 'Save privacy settings')}
                </button>
              </>
            )}
            {loadError && (
              <button
                className="secondary-button"
                onClick={() => {
                  setLoading(true)
                  setLoadError('')
                  setRetry((n) => n + 1)
                }}
              >
                {t('Thử tải lại', 'Try loading again')}
              </button>
            )}
            <hr />
            <h3>{t('Bản sao dữ liệu', 'Data copy')}</h3>
            <p>
              {t(
                'Tải hồ sơ, ghi chú, mục đã lưu và lịch sử cá nhân thành file JSON trên máy bạn.',
                'Download your profile, notes, saved items, and personal history as a JSON file.',
              )}
            </p>
            <button
              className="secondary-button"
              disabled={busy}
              onClick={() =>
                run(
                  async () => {
                    const result = await apiClient.rpc('export_my_data')
                    if (result.error)
                      throw new Error(
                        t(
                          'Không xuất được dữ liệu. Hãy thử lại.',
                          'Data could not be exported. Please try again.',
                        ),
                      )
                    if (alive.current) downloadPrivateData(result.data)
                  },
                  t('Đã tạo file dữ liệu cá nhân.', 'Your personal data file is ready.'),
                )
              }
            >
              {t('Tải dữ liệu của tôi', 'Download my data')}
            </button>
            <button
              className="secondary-button"
              disabled={busy}
              onClick={() => run(() => auth.signOut('global'), '')}
            >
              {t('Đăng xuất tất cả thiết bị', 'Sign out of all devices')}
            </button>
            <small>
              {t(
                'Phiên đang mở trên thiết bị khác có thể còn hiệu lực đến khi access token hết hạn.',
                'Sessions on other devices may remain active until their access tokens expire.',
              )}
            </small>
          </div>
        )}
        {tab === 'saved' && (
          <div className="account-form">
            <h2>{t('Nơi lưu trữ', 'Your collection')}</h2>
            <p>
              {t(
                'Lưu liên kết và thông tin của nội dung trên web. Ảnh gốc vẫn ở thư viện, không sao chép thành file riêng.',
                'Save links and details of website content. Original photos remain in the gallery and are not copied into separate files.',
              )}
            </p>
            <label>
              {t('Tìm mục đã lưu', 'Search saved items')}
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('Tên ảnh, trang, kỷ niệm…', 'Photo, page, or memory title…')}
              />
            </label>
            {orbit.loading ? (
              <p role="status">{t('Đang tải bộ sưu tập…', 'Loading your collection…')}</p>
            ) : orbit.error ? (
              <p role="alert">{translateError(orbit.error)}</p>
            ) : (
              <>
                <p>
                  {saved.length} {t('mục', 'items')}
                </p>
                <div className="account-saved-list">
                  {saved.map((item) => (
                    <article key={item.kind + ':' + item.item_id}>
                      <small>
                        {
                          {
                            photo: t('Ảnh', 'Photo'),
                            page: t('Trang web', 'Web page'),
                            memory: t('Kỷ niệm', 'Memory'),
                            event: t('Lịch', 'Schedule'),
                            favorite: t('Yêu thích', 'Favorite'),
                          }[item.kind]
                        }
                      </small>
                      <h3>
                        <a href={savedUrl(item)}>
                          {typeof item.payload.title === 'string'
                            ? item.kind === 'favorite'
                              ? item.payload.title
                              : localize(item.payload.title)
                            : item.item_id}{' '}
                          ↗
                        </a>
                      </h3>
                      <SaveToOrbit kind={item.kind} id={item.item_id} payload={item.payload} />
                    </article>
                  ))}
                </div>
                {!saved.length && (
                  <p>
                    {t('Chưa có mục phù hợp.', 'No matching items yet.')}{' '}
                    <a className="text-button" href="#/media">
                      {t('Khám phá thư viện ảnh ↗', 'Explore the photo gallery ↗')}
                    </a>
                  </p>
                )}
              </>
            )}
          </div>
        )}
        {tab === 'notes' && (
          <>
            <h2>{t('Ghi chú riêng', 'Private notes')}</h2>
            <p>
              {t(
                'Chỉ bạn đọc được. Nội dung được lưu khi bấm “Lưu ghi chú”.',
                'Only you can read these. Content is saved when you select “Save note”.',
              )}
            </p>
            {loading ? (
              <p role="status">{t('Đang tải ghi chú…', 'Loading notes…')}</p>
            ) : loadError ? (
              <>
                <p role="alert">{translateError(loadError)}</p>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setLoading(true)
                    setLoadError('')
                    setRetry((n) => n + 1)
                  }}
                >
                  {t('Thử tải lại', 'Try loading again')}
                </button>
              </>
            ) : (
              <div className="account-notes">
                <aside>
                  <button
                    className="secondary-button"
                    disabled={busy}
                    onClick={() => {
                      setSelected(null)
                      setNote(blankNote)
                      setConfirmDelete(null)
                    }}
                  >
                    {t('+ Ghi chú mới', '+ New note')}
                  </button>
                  {notes.map((n) => (
                    <article key={n.id}>
                      <button
                        className="text-button"
                        disabled={busy}
                        onClick={() => {
                          setSelected(n.id)
                          setNote({ title: n.title, body: n.body })
                          setConfirmDelete(null)
                        }}
                      >
                        {n.title}
                      </button>
                      <small>{new Date(n.updated_at).toLocaleDateString(locale)}</small>
                      <button
                        className="text-button"
                        disabled={busy}
                        aria-label={t('Xóa ', 'Delete ') + n.title}
                        onClick={() => setConfirmDelete(n.id)}
                      >
                        {t('Xóa ', 'Delete ')}
                      </button>
                      {confirmDelete === n.id && (
                        <div>
                          <p>{t('Xóa vĩnh viễn ghi chú này?', 'Permanently delete this note?')}</p>
                          <button
                            className="secondary-button"
                            disabled={busy}
                            onClick={() =>
                              run(
                                async () => {
                                  const result = await apiClient
                                    .from('user_notes')
                                    .delete()
                                    .eq('id', n.id)
                                    .eq('user_id', userId)
                                  if (result.error)
                                    throw new Error(
                                      t(
                                        'Chưa xóa được ghi chú.',
                                        'This note could not be deleted.',
                                      ),
                                    )
                                  if (alive.current) {
                                    setNotes((old) => old.filter((item) => item.id !== n.id))
                                    setConfirmDelete(null)
                                    if (selected === n.id) {
                                      setSelected(null)
                                      setNote(blankNote)
                                    }
                                  }
                                },
                                t('Đã xóa ghi chú.', 'Note deleted.'),
                              )
                            }
                          >
                            {t('Xác nhận xóa', 'Confirm deletion')}
                          </button>
                          <button className="text-button" onClick={() => setConfirmDelete(null)}>
                            {t('Hủy', 'Cancel')}
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                  {!notes.length && (
                    <p>{t('Viết ghi chú đầu tiên của bạn.', 'Write your first note.')}</p>
                  )}
                </aside>
                <form className="account-form" onSubmit={saveNote}>
                  <label>
                    {t('Tiêu đề ghi chú', 'Note title')}
                    <input
                      required
                      maxLength={120}
                      value={note.title}
                      disabled={busy}
                      onChange={(e) => setNote({ ...note, title: e.target.value })}
                    />
                  </label>
                  <label>
                    {t('Nội dung', 'Content')}
                    <textarea
                      rows={12}
                      maxLength={10000}
                      value={note.body}
                      disabled={busy}
                      onChange={(e) => setNote({ ...note, body: e.target.value })}
                    />
                    <small>
                      {note.body.length}/{(10000).toLocaleString(locale)} {t('ký tự', 'characters')}
                    </small>
                  </label>
                  <button className="primary-button" disabled={busy}>
                    {busy ? t('Đang lưu…', 'Saving…') : t('Lưu ghi chú', 'Save note')}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
