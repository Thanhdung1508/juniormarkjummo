import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AuthDialog from './AuthDialog'

function enterCredentials() {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'fan@example.com' } })
  fireEvent.change(screen.getByLabelText('Mật khẩu', { exact: true }), { target: { value: 'safePass123' } })
}
describe('Biểu mẫu tài khoản', () => {
  it('đóng hộp thoại khi đăng nhập thành công', async () => {
    const onClose = vi.fn()
    render(<AuthDialog mode="signin" auth={{ configured: true, signIn: async () => ({ session: { user: { id: 'fan' } } }) }} onClose={onClose} />)
    enterCredentials()
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập', exact: true }))
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  })
  it('đóng hộp thoại khi đăng ký trả về session, chặn gửi lặp khi chờ', async () => {
    let finish
    const pending = new Promise((resolve) => { finish = resolve })
    const onClose = vi.fn()
    const signUp = vi.fn(() => pending)
    render(<AuthDialog mode="signup" auth={{ configured: true, signUp }} onClose={onClose} />)
    enterCredentials()
    fireEvent.change(screen.getByLabelText('Tên hiển thị'), { target: { value: 'Jummo' } })
    fireEvent.change(screen.getByLabelText('Xác nhận mật khẩu'), { target: { value: 'safePass123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản', exact: true }))
    expect(screen.getByRole('button', { name: 'Đang xử lý…' })).toBeDisabled()
    finish({ session: { user: { id: 'fan' } } })
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(signUp).toHaveBeenCalledTimes(1)
  })
  it('chặn đăng nhập khi chưa cấu hình dịch vụ, không tạo session giả', () => {
    render(<AuthDialog mode="signin" auth={{ configured: false }} onClose={() => {}} />)
    expect(screen.getByRole('button', { name: 'Đăng nhập', exact: true })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('chưa được kết nối')
  })
  it('hiển thị lỗi đăng nhập và giữ hộp thoại mở', async () => {
    const onClose = vi.fn()
    render(<AuthDialog mode="signin" auth={{ configured: true, signIn: async () => { throw new Error('Email hoặc mật khẩu chưa đúng.') } }} onClose={onClose} />)
    enterCredentials()
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập', exact: true }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Email hoặc mật khẩu chưa đúng.')
    expect(onClose).not.toHaveBeenCalled()
  })
  it('chờ xác nhận email sau đăng ký, không coi là đã đăng nhập', async () => {
    const onClose = vi.fn()
    render(<AuthDialog mode="signup" auth={{ configured: true, signUp: async () => ({ session: null, user: {} }) }} onClose={onClose} />)
    enterCredentials()
    fireEvent.change(screen.getByLabelText('Tên hiển thị'), { target: { value: 'Jummo' } })
    fireEvent.change(screen.getByLabelText('Xác nhận mật khẩu'), { target: { value: 'safePass123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản', exact: true }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('kiểm tra hộp thư'))
    expect(onClose).not.toHaveBeenCalled()
  })
})
