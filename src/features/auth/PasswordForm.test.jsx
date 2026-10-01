import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import PasswordForm from './PasswordForm'
import AuthDialog from './AuthDialog'
it('requests a recovery link using email only', async () => {
  const requestPasswordReset = vi.fn().mockResolvedValue(undefined)
  render(
    <AuthDialog
      mode="signin"
      auth={{ configured: true, requestPasswordReset }}
      onClose={() => {}}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Quên mật khẩu?' }))
  expect(screen.queryByLabelText('Mật khẩu', { exact: true })).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'fan@example.com' } })
  fireEvent.click(screen.getByRole('button', { name: 'Gửi liên kết khôi phục' }))
  await waitFor(() => expect(requestPasswordReset).toHaveBeenCalledWith('fan@example.com'))
  await screen.findByText(/Nếu email đủ điều kiện/)
})
it('rejects mismatched new passwords before calling Auth', () => {
  const updatePassword = vi.fn()
  render(<PasswordForm auth={{ recovering: true, updatePassword }} />)
  fireEvent.change(screen.getByLabelText('Mật khẩu mới'), { target: { value: 'Password123' } })
  fireEvent.change(screen.getByLabelText('Nhập lại mật khẩu mới'), {
    target: { value: 'Different123' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Lưu mật khẩu mới' }))
  expect(screen.getByRole('alert')).toHaveTextContent('phải khớp')
  expect(updatePassword).not.toHaveBeenCalled()
})
