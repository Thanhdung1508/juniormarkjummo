import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import ThemeToggle from './ThemeToggle'

it('nút theme tại footer đổi toàn trang và phục hồi lựa chọn sau khi mở lại', () => {
  localStorage.clear()
  const view = render(<ThemeToggle />)
  fireEvent.click(screen.getByRole('button', { name: 'Chuyển sang giao diện sáng ấm' }))
  expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  view.unmount()
  render(<ThemeToggle />)
  expect(screen.getByRole('button', { name: 'Chuyển sang giao diện tối' })).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(screen.getByRole('button', { name: 'Chuyển sang giao diện tối' }))
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  localStorage.clear()
})
