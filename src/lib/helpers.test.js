import { describe, expect, it } from 'vitest'
import { birthdayCountdown, readTheme, validateAuth } from './helpers'

describe('Đếm ngược theo ngày sinh nhật ở múi giờ Việt Nam/Thái Lan', () => {
  it('tính đúng 1 ngày trước sinh nhật, không lệ thuộc múi giờ máy', () => {
    expect(birthdayCountdown(10, 23, new Date('2026-10-21T17:00:00Z'))).toEqual({ days: 1, hours: 0, minutes: 0, seconds: 0, today: false, year: 2026 })
  })
  it('chúc mừng suốt ngày sinh nhật thay vì nhảy ngay sang năm sau', () => {
    expect(birthdayCountdown(10, 23, new Date('2026-10-23T12:00:00Z')).today).toBe(true)
  })
  it('chuyển sang sinh nhật năm sau khi hết ngày', () => {
    expect(birthdayCountdown(10, 23, new Date('2026-10-23T17:00:00Z')).year).toBe(2027)
  })
})

describe('Kiểm tra biểu mẫu tài khoản', () => {
  const valid = { email: 'fan@example.com', password: 'safePass123', confirmPassword: 'safePass123', displayName: 'Jummo' }
  it('từ chối mật khẩu xác nhận khác nhau', () => {
    expect(validateAuth({ ...valid, confirmPassword: 'different' }, 'signup')).toHaveProperty('confirmPassword')
  })
  it('từ chối tên trống, email sai và mật khẩu đăng ký ngắn', () => {
    const errors = validateAuth({ email: 'bad', password: 'abc', displayName: '  ', confirmPassword: 'abc' }, 'signup')
    expect(Object.keys(errors)).toEqual(expect.arrayContaining(['email', 'password', 'displayName']))
  })
  it('không áp quy tắc mật khẩu đăng ký lên tài khoản đã tồn tại', () => {
    expect(validateAuth({ email: valid.email, password: 'short' }, 'signin')).toEqual({})
  })
  it('chấp nhận dữ liệu đăng ký hợp lệ', () => expect(validateAuth(valid, 'signup')).toEqual({}))
})

describe('Ghi nhớ theme an toàn', () => {
  it('đọc lựa chọn sáng đã lưu', () => expect(readTheme({ getItem: () => 'light' })).toBe('light'))
  it('dùng tối nếu giá trị lạ hoặc storage bị chặn', () => {
    expect(readTheme({ getItem: () => 'invalid' })).toBe('dark')
    expect(readTheme({ getItem: () => { throw new Error('blocked') } })).toBe('dark')
  })
})
