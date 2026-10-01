import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import JummoCompanion from './JummoCompanion'
it('recognizes individual profile routes instead of showing a missing-page message', () => {
  sessionStorage.clear()
  render(<JummoCompanion route="profiles/junior" />)
  expect(screen.queryByText('Jummo đã ngủ quên ở đây')).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Khám phá kho lưu trữ ↗' })).toBeInTheDocument()
})
it('offers context and remembers a session dismissal across routes', async () => {
  sessionStorage.clear()
  const user = userEvent.setup()
  const view = render(<JummoCompanion route="studio" />)
  expect(screen.getByRole('link', { name: 'Khám phá kho lưu trữ ↗' })).toHaveAttribute('href', '#/timeline')
  await user.click(screen.getByRole('button', { name: 'Ẩn hướng dẫn của Jummo' }))
  view.unmount()
  render(<JummoCompanion route="media" />)
  expect(screen.queryByRole('complementary', { name: 'Jummo đồng hành' })).not.toBeInTheDocument()
})
