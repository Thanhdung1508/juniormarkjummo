import { useRef, useState } from 'react'
import { Eye, EyeOff, LoaderCircle, Mail, Sparkles } from 'lucide-react'
import Dialog from '../../components/Dialog'
import { validateAuth } from '../../lib/helpers'

export default function AuthDialog({ mode: initialMode, auth, onClose }) {
  const [mode, setMode] = useState(initialMode)
  const [values, setValues] = useState({ email: '', password: '', confirmPassword: '', displayName: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const submitting = useRef(false)
  const signup = mode === 'signup'

  function switchMode() {
    setMode(signup ? 'signin' : 'signup')
    setErrors({}); setError(''); setMessage(''); setShowPassword(false)
    setValues((current) => ({ ...current, password: '', confirmPassword: '' }))
  }

  async function submit(event) {
    event.preventDefault()
    if (submitting.current || !auth.configured) return
    const nextErrors = validateAuth(values, mode)
    setErrors(nextErrors); setError(''); setMessage('')
    if (Object.keys(nextErrors).length) {
      event.currentTarget.elements.namedItem(Object.keys(nextErrors)[0])?.focus()
      return
    }
    submitting.current = true; setBusy(true)
    try {
      const result = await (signup ? auth.signUp(values) : auth.signIn(values))
      if (signup && !result.session) {
        // Supabase có thể ẩn việc email đã tồn tại; không khẳng định đã tạo user.
        setMessage('Vui lòng kiểm tra hộp thư để xác nhận email nếu địa chỉ này đủ điều kiện đăng ký. Nếu đã có tài khoản, hãy đăng nhập.')
        setValues((current) => ({ ...current, password: '', confirmPassword: '' }))
      } else onClose()
    } catch (err) { setError(err.message || 'Chưa thể kết nối. Vui lòng thử lại.') }
    finally { submitting.current = false; setBusy(false) }
  }

  function field(name, label, type, autoComplete, placeholder) {
    return <div className="form-field">
      <label htmlFor={`auth-${name}`}>{label}</label>
      <input id={`auth-${name}`} name={name} type={type} autoComplete={autoComplete}
        value={values[name]} placeholder={placeholder} disabled={busy} required
        maxLength={name === 'displayName' ? 50 : name === 'email' ? 254 : undefined}
        aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `error-${name}` : undefined}
        onChange={(event) => setValues({ ...values, [name]: event.target.value })} />
      {errors[name] && <small className="field-error" id={`error-${name}`}>{errors[name]}</small>}
    </div>
  }

  return <Dialog title={signup ? 'Một chỗ dành riêng cho bạn.' : 'Mừng bạn trở lại tiệm đĩa.'} onClose={busy ? () => {} : onClose} className="auth-dialog">
    <div className="auth-mark"><Sparkles size={22} /> JUNIORMARK • FAN COMMUNITY</div>
    <p className="dialog-intro">{signup ? 'Cùng lưu giữ những giai điệu và khoảnh khắc đẹp của Junior & Mark.' : 'Đăng nhập để trở về góc nhỏ thân quen của chúng mình.'}</p>
    {!auth.configured && <p role="status" className="notice">Dịch vụ tài khoản chưa được kết nối. Bạn vẫn có thể khám phá trang chủ.</p>}
    {message ? <div role="status" className="success-message"><Mail size={30} /><p>{message}</p></div> : <form onSubmit={submit} noValidate>
      {signup && field('displayName', 'Tên hiển thị', 'text', 'nickname', 'Tên bạn muốn mọi người gọi')}
      {field('email', 'Email', 'email', 'email', 'ban@example.com')}
      {field('password', 'Mật khẩu', showPassword ? 'text' : 'password', signup ? 'new-password' : 'current-password', signup ? 'Ít nhất 8 ký tự' : 'Mật khẩu của bạn')}
      {signup && field('confirmPassword', 'Xác nhận mật khẩu', showPassword ? 'text' : 'password', 'new-password', 'Nhập lại mật khẩu')}
      <button type="button" className="text-button password-visibility" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}{showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      </button>
      {error && <p role="alert" className="error-message">{error}</p>}
      <button className="primary-button submit-button" disabled={busy || !auth.configured}>
        {busy && <LoaderCircle className="spin" size={18} />}{busy ? 'Đang xử lý…' : signup ? 'Tạo tài khoản' : 'Đăng nhập'}
      </button>
    </form>}
    <p className="auth-switch">{signup ? 'Đã có tài khoản?' : 'Lần đầu ghé tiệm?'} <button className="text-button" disabled={busy} onClick={switchMode}>{signup ? 'Đăng nhập ngay' : 'Đăng ký ngay'}</button></p>
    <p className="auth-note">Một góc nhỏ của fan, dành cho fan. ♡</p>
  </Dialog>
}
