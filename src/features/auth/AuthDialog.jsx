import { t, useLanguage, localize, translateError } from '../../i18n/language'
import { useRef, useState } from 'react'
import { Eye, EyeOff, LoaderCircle, Mail, Sparkles } from 'lucide-react'
import Dialog from '../../components/Dialog'
import { validateAuth } from '../../lib/helpers'

export default function AuthDialog({ mode: initialMode, auth, onClose }) {
  useLanguage()
  const [mode, setMode] = useState(initialMode)
  const [values, setValues] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const submitting = useRef(false)
  const signup = mode === 'signup'
  const reset = mode === 'reset'

  function switchMode() {
    setMode(signup ? 'signin' : 'signup')
    setErrors({})
    setError('')
    setMessage('')
    setShowPassword(false)
    setValues((current) => ({ ...current, password: '', confirmPassword: '' }))
  }

  async function submit(event) {
    event.preventDefault()
    if (submitting.current || !auth.configured) return
    const nextErrors = reset
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
        ? {}
        : { email: t('Nhập địa chỉ email hợp lệ.', 'Enter a valid email address.') }
      : validateAuth(values, mode)
    setErrors(nextErrors)
    setError('')
    setMessage('')
    if (Object.keys(nextErrors).length) {
      event.currentTarget.elements.namedItem(Object.keys(nextErrors)[0])?.focus()
      return
    }
    submitting.current = true
    setBusy(true)
    try {
      if (reset) {
        await auth.requestPasswordReset(values.email)
        setMessage(
          t(
            'Nếu email đủ điều kiện, bạn sẽ nhận được liên kết đặt lại mật khẩu. Vui lòng kiểm tra cả thư rác.',
            'If this email is eligible, you will receive a password reset link. Please also check your spam folder.',
          ),
        )
        return
      }
      const result = await (signup ? auth.signUp(values) : auth.signIn(values))
      if (signup && !result.session) {
        // backend Kotlin có thể ẩn việc email đã tồn tại; không khẳng định đã tạo user.
        setMessage(
          t(
            'Vui lòng kiểm tra hộp thư để xác nhận email nếu địa chỉ này đủ điều kiện đăng ký. Nếu đã có tài khoản, hãy đăng nhập.',
            'Please check your inbox to confirm your email if it is eligible for registration. If you already have an account, please sign in.',
          ),
        )
        setValues((current) => ({ ...current, password: '', confirmPassword: '' }))
      } else onClose()
    } catch (err) {
      setError(
        err.message ||
          t('Chưa thể kết nối. Vui lòng thử lại.', 'Unable to connect. Please try again.'),
      )
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  function field(name, label, type, autoComplete, placeholder) {
    return (
      <div className="form-field">
        <label htmlFor={`auth-${name}`}>{label}</label>
        <input
          id={`auth-${name}`}
          name={name}
          type={type}
          autoComplete={autoComplete}
          value={values[name]}
          placeholder={placeholder}
          disabled={busy}
          required
          maxLength={name === 'displayName' ? 50 : name === 'email' ? 254 : undefined}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `error-${name}` : undefined}
          onChange={(event) => setValues({ ...values, [name]: event.target.value })}
        />
        {errors[name] && (
          <small className="field-error" id={`error-${name}`}>
            {translateError(errors[name])}
          </small>
        )}
      </div>
    )
  }

  return (
    <Dialog
      title={
        reset
          ? t('Lấy lại mật khẩu', 'Reset your password')
          : signup
            ? t('Một chỗ dành riêng cho bạn.', 'A place just for you.')
            : t('Mừng bạn trở lại tiệm đĩa.', 'Welcome back to the record shop.')
      }
      onClose={busy ? () => {} : onClose}
      className="auth-dialog"
    >
      <div className="auth-mark">
        <Sparkles size={22} />{' '}
        {t('JUNIORMARK • CỘNG ĐỒNG NGƯỜI HÂM MỘ', 'JUNIORMARK • FAN COMMUNITY')}
      </div>
      <p className="dialog-intro">
        {signup
          ? t(
              'Cùng lưu giữ những giai điệu và khoảnh khắc đẹp của Junior & Mark.',
              'Save the melodies and special moments of Junior & Mark together.',
            )
          : t(
              'Đăng nhập để trở về góc nhỏ thân quen của chúng mình.',
              'Sign in to return to our familiar little corner.',
            )}
      </p>
      {!auth.configured && (
        <p role="status" className="notice">
          {t(
            'Dịch vụ tài khoản chưa được kết nối. Bạn vẫn có thể khám phá trang chủ.',
            'Account services are not connected yet. You can still explore the home page.',
          )}
        </p>
      )}
      {message ? (
        <div role="status" className="success-message">
          <Mail size={30} />
          <p>{localize(message)}</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          {signup &&
            field(
              'displayName',
              t('Tên hiển thị', 'Display name'),
              'text',
              'nickname',
              t('Tên bạn muốn mọi người gọi', 'What would you like us to call you?'),
            )}
          {field('email', 'Email', 'email', 'email', 'ban@example.com')}
          {!reset &&
            field(
              'password',
              t('Mật khẩu', 'Password'),
              showPassword ? 'text' : 'password',
              signup ? 'new-password' : 'current-password',
              signup
                ? t('Ít nhất 8 ký tự', 'At least 8 characters')
                : t('Mật khẩu của bạn', 'Your password'),
            )}
          {signup &&
            field(
              'confirmPassword',
              t('Xác nhận mật khẩu', 'Confirm password'),
              showPassword ? 'text' : 'password',
              'new-password',
              t('Nhập lại mật khẩu', 'Enter your password again'),
            )}
          {!reset && (
            <button
              type="button"
              className="text-button password-visibility"
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPassword
                ? t('Ẩn mật khẩu', 'Hide password')
                : t('Hiện mật khẩu', 'Show password')}
            </button>
          )}
          {error && (
            <p role="alert" className="error-message">
              {translateError(error)}
            </p>
          )}
          <button className="primary-button submit-button" disabled={busy || !auth.configured}>
            {busy && <LoaderCircle className="spin" size={18} />}
            {busy
              ? t('Đang xử lý…', 'Processing…')
              : reset
                ? t('Gửi liên kết khôi phục', 'Send recovery link')
                : signup
                  ? t('Tạo tài khoản', 'Create account')
                  : t('Đăng nhập', 'Sign in')}
          </button>
        </form>
      )}
      {!signup && (
        <button
          className="text-button"
          disabled={busy}
          onClick={() => {
            setMode(reset ? 'signin' : 'reset')
            setError('')
            setErrors({})
            setMessage('')
            setValues((v) => ({ ...v, password: '', confirmPassword: '' }))
          }}
        >
          {reset
            ? t('Quay lại đăng nhập', 'Back to sign in')
            : t('Quên mật khẩu?', 'Forgot your password?')}
        </button>
      )}
      <p className="auth-switch">
        {signup
          ? t('Đã có tài khoản?', 'Already have an account?')
          : t('Lần đầu ghé tiệm?', 'Your first visit?')}{' '}
        <button className="text-button" disabled={busy} onClick={switchMode}>
          {signup ? t('Đăng nhập ngay', 'Sign in now') : t('Đăng ký ngay', 'Sign up now')}
        </button>
      </p>
      <p className="auth-note">
        {t('Một góc nhỏ của fan, dành cho fan. ♡', 'A little corner by fans, for fans. ♡')}
      </p>
    </Dialog>
  )
}
