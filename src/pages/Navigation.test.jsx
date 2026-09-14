import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import App from '../App'

afterEach(() => {
  window.location.hash = ''
  vi.restoreAllMocks()
})
it('skip link giữ nguyên trang và nội dung tìm kiếm', async () => {
  window.location.hash = '/media'
  window.scrollTo = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()
  const user = userEvent.setup()
  render(<App />)
  await user.type(screen.getByRole('searchbox'), 'sunshine')
  await user.click(screen.getByRole('link', { name: 'Đi đến nội dung chính' }))
  expect(window.location.hash).toBe('#/media')
  expect(screen.getByRole('searchbox')).toHaveValue('sunshine')
  expect(screen.getByRole('main')).toHaveFocus()
  expect(screen.getByRole('button', { name: 'Xem ảnh Our Little Sunshine' })).toBeInTheDocument()
})
