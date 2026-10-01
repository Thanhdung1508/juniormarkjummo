import { t } from '../i18n/language'
// Ngày sinh nhật dùng UTC+7 (Bangkok), không dùng múi giờ của máy người xem.
export function birthdayCountdown(month, day, now = new Date()) {
  const local = new Date(now.getTime() + 7 * 3600000)
  let year = local.getUTCFullYear()
  const today = local.getUTCMonth() + 1 === month && local.getUTCDate() === day
  let target = Date.UTC(year, month - 1, day) - 7 * 3600000
  if (!today && target < now.getTime()) target = Date.UTC(++year, month - 1, day) - 7 * 3600000
  const seconds = Math.max(0, Math.floor((target - now.getTime()) / 1000))
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
    today,
    year,
  }
}

// Kiểm tra ở giao diện để phản hồi nhanh; backend Kotlin vẫn xác thực phía máy chủ.
export function validateAuth(values, mode) {
  const errors = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email?.trim() || ''))
    errors.email = t('Nhập địa chỉ email hợp lệ.', 'Enter a valid email address.')
  if (!values.password) errors.password = t('Nhập mật khẩu của bạn.', 'Enter your password.')
  if (mode === 'signup') {
    const name = values.displayName?.trim() || ''
    if (name.length < 2 || name.length > 50)
      errors.displayName = t(
        'Tên hiển thị cần từ 2 đến 50 ký tự.',
        'Your display name must contain 2–50 characters.',
      )
    if ((values.password?.length || 0) < 8)
      errors.password = t(
        'Mật khẩu cần ít nhất 8 ký tự.',
        'Your password must contain at least 8 characters.',
      )
    if (values.confirmPassword !== values.password)
      errors.confirmPassword = t('Mật khẩu xác nhận chưa khớp.', 'The passwords do not match.')
  }
  return errors
}

export function readTheme(storage) {
  try {
    return (storage || window.localStorage).getItem('juniormark-theme') === 'light'
      ? 'light'
      : 'dark'
  } catch {
    return 'dark'
  }
}

export function authErrorMessage(error) {
  const messages = {
    invalid_credentials: t('Email hoặc mật khẩu chưa đúng.', 'Incorrect email or password.'),
    email_not_confirmed: t(
      'Bạn cần xác nhận email trước khi đăng nhập.',
      'Please confirm your email before signing in.',
    ),
    user_already_exists: t(
      'Không thể đăng ký bằng thông tin này. Bạn có thể thử đăng nhập.',
      'Unable to register with these details. You can try signing in.',
    ),
    weak_password: t(
      'Mật khẩu chưa đủ mạnh. Hãy dùng mật khẩu dài hơn, có chữ và số.',
      'Your password is too weak. Use a longer password with letters and numbers.',
    ),
    over_email_send_rate_limit: t(
      'Bạn đã yêu cầu quá nhiều email. Vui lòng thử lại sau.',
      'Too many emails requested. Please try again later.',
    ),
    over_request_rate_limit: t(
      'Bạn thao tác quá nhanh. Vui lòng chờ một chút.',
      'Too many requests. Please wait a moment.',
    ),
    signup_disabled: t('Đăng ký hiện đang tạm đóng.', 'Registration is temporarily closed.'),
    email_address_invalid: t('Địa chỉ email không hợp lệ.', 'Invalid email address.'),
  }
  return (
    messages[error?.code] ||
    t(
      'Chưa thể kết nối tài khoản. Vui lòng thử lại sau.',
      'Unable to connect to your account. Please try again later.',
    )
  )
}
