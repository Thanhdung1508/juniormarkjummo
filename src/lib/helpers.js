// Ngày sinh nhật dùng UTC+7 (Bangkok), không dùng múi giờ của máy người xem.
export function birthdayCountdown(month, day, now = new Date()) {
  const local = new Date(now.getTime() + 7 * 3600000)
  let year = local.getUTCFullYear()
  const today = local.getUTCMonth() + 1 === month && local.getUTCDate() === day
  let target = Date.UTC(year, month - 1, day) - 7 * 3600000
  if (!today && target < now.getTime()) target = Date.UTC(++year, month - 1, day) - 7 * 3600000
  const seconds = Math.max(0, Math.floor((target - now.getTime()) / 1000))
  return { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60, today, year }
}

// Kiểm tra ở giao diện để phản hồi nhanh; Supabase vẫn xác thực phía máy chủ.
export function validateAuth(values, mode) {
  const errors = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email?.trim() || '')) errors.email = 'Nhập địa chỉ email hợp lệ.'
  if (!values.password) errors.password = 'Nhập mật khẩu của bạn.'
  if (mode === 'signup') {
    const name = values.displayName?.trim() || ''
    if (name.length < 2 || name.length > 50) errors.displayName = 'Tên hiển thị cần từ 2 đến 50 ký tự.'
    if ((values.password?.length || 0) < 8) errors.password = 'Mật khẩu cần ít nhất 8 ký tự.'
    if (values.confirmPassword !== values.password) errors.confirmPassword = 'Mật khẩu xác nhận chưa khớp.'
  }
  return errors
}

export function readTheme(storage) {
  try { return (storage || window.localStorage).getItem('juniormark-theme') === 'light' ? 'light' : 'dark' }
  catch { return 'dark' }
}

export function authErrorMessage(error) {
  const messages = {
    invalid_credentials: 'Email hoặc mật khẩu chưa đúng.',
    email_not_confirmed: 'Bạn cần xác nhận email trước khi đăng nhập.',
    user_already_exists: 'Không thể đăng ký bằng thông tin này. Bạn có thể thử đăng nhập.',
    weak_password: 'Mật khẩu chưa đủ mạnh. Hãy dùng mật khẩu dài hơn, có chữ và số.',
    over_email_send_rate_limit: 'Bạn đã yêu cầu quá nhiều email. Vui lòng thử lại sau.',
    over_request_rate_limit: 'Bạn thao tác quá nhanh. Vui lòng chờ một chút.',
    signup_disabled: 'Đăng ký hiện đang tạm đóng.',
    email_address_invalid: 'Địa chỉ email không hợp lệ.',
  }
  return messages[error?.code] || 'Chưa thể kết nối tài khoản. Vui lòng thử lại sau.'
}
