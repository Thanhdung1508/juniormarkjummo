import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { setLanguage } from '../i18n/language'
import { AuthContext } from '../features/auth/authContext'
import CharacterStage from './CharacterStage'
import Community from './Community'
import Projects from './Projects'

vi.mock('../lib/apiClient', () => ({ apiClient: null }))
beforeEach(() => {
  localStorage.clear()
  setLanguage('vi')
})
afterEach(() => {
  setLanguage('vi')
})

it('switches profile controls without changing the selected character', async () => {
  const user = userEvent.setup()
  render(<CharacterStage />)
  await user.click(screen.getByRole('button', { name: 'Chọn Mark Jiruntanin', exact: true }))
  expect(screen.getByRole('button', { name: 'Khám phá Mark Jiruntanin' })).toBeInTheDocument()
  act(() => setLanguage('en'))
  expect(
    screen.getByRole('button', { name: 'Select Mark Jiruntanin', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Discover Mark Jiruntanin' })).toBeInTheDocument()
  act(() => setLanguage('vi'))
  expect(screen.getByRole('button', { name: 'Khám phá Mark Jiruntanin' })).toBeInTheDocument()
})

it('switches form labels while keeping fan-written content untouched', async () => {
  const user = userEvent.setup()
  render(
    <AuthContext.Provider value={{ session: null }}>
      <Community kind="note" />
    </AuthContext.Provider>,
  )
  const message = screen.getByRole('textbox', { name: 'Lời chúc / Tâm nguyện' })
  await user.type(message, 'Hello Junior, mãi tỏa sáng 💛')
  act(() => setLanguage('en'))
  expect(screen.getByRole('textbox', { name: 'Message / Wish' })).toHaveValue(
    'Hello Junior, mãi tỏa sáng 💛',
  )
  expect(screen.getByRole('button', { name: 'Save a preview wish' })).toBeInTheDocument()
})

it('translates the untouched support draft but preserves edits across language switches', async () => {
  const user = userEvent.setup()
  render(<Projects showInfo={() => {}} />)
  expect(screen.getByRole('textbox', { name: 'Soạn lời cổ vũ' })).toHaveValue(
    'Một ngày thật ấm áp cùng Junior & Mark 💛 #JuniorMark',
  )
  act(() => setLanguage('en'))
  const draft = screen.getByRole('textbox', { name: 'Write your support message' })
  expect(draft).toHaveValue('A warm day with Junior & Mark 💛 #JuniorMark')
  await user.clear(draft)
  await user.type(draft, 'Our own fan message')
  act(() => setLanguage('vi'))
  expect(screen.getByRole('textbox', { name: 'Soạn lời cổ vũ' })).toHaveValue('Our own fan message')
})
