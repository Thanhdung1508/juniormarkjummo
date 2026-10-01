import { t, useLanguage, localize, translateError } from '../../i18n/language'
import { useRef, useState } from 'react'

export default function PasswordForm({ auth }) {
  useLanguage()
  const [values, setValues] = useState({ old: '', password: '', confirm: '' })
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('')
  const lock = useRef(false)
  async function submit(event) {
    event.preventDefault()
    if (lock.current) return
    setError('')
    setMessage('')
    if (values.password.length < 8 || values.password !== values.confirm) {
      setError(
        t(
          'Mật khẩu cần ít nhất 8 ký tự và hai lần nhập phải khớp.',
          'Use at least 8 characters and make sure both passwords match.',
        ),
      )
      return
    }
    lock.current = true
    setBusy(true)
    try {
      await auth.updatePassword(values.password, values.old)
      setValues({ old: '', password: '', confirm: '' })
      setMessage(t('Đã đổi mật khẩu thành công.', 'Your password has been changed.'))
    } catch (error) {
      setError(error.message)
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="account-form">
      <h2>
        {auth.recovering
          ? t('Đặt mật khẩu mới', 'Set a new password')
          : t('Đổi mật khẩu', 'Change password')}
      </h2>
      {!auth.recovering && (
        <label>
          {t('Mật khẩu hiện tại', 'Current password')}
          <input
            type="password"
            autoComplete="current-password"
            required
            value={values.old}
            disabled={busy}
            onChange={(e) => setValues({ ...values, old: e.target.value })}
          />
        </label>
      )}
      <label>
        {t('Mật khẩu mới', 'New password')}
        <input
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={values.password}
          disabled={busy}
          onChange={(e) => setValues({ ...values, password: e.target.value })}
        />
      </label>
      <label>
        {t('Nhập lại mật khẩu mới', 'Confirm your new password')}
        <input
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={values.confirm}
          disabled={busy}
          onChange={(e) => setValues({ ...values, confirm: e.target.value })}
        />
      </label>
      {error && (
        <p role="alert" className="error-message">
          {translateError(error)}
        </p>
      )}
      {message && <p role="status">{localize(message)}</p>}
      <button className="primary-button" disabled={busy}>
        {busy ? t('Đang cập nhật…', 'Updating…') : t('Lưu mật khẩu mới', 'Save new password')}
      </button>
    </form>
  )
}
