import { setLanguage } from '../../i18n/language'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import AccountPage from './AccountPage'
import { AuthContext } from '../auth/authContext'
import { OrbitContext } from '../orbit/orbitContext'

const backend = vi.hoisted(() => ({ notes: [], fail: false }))
vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    from(table) {
      let operation = 'select',
        values,
        id
      const builder = {
        select() {
          return this
        },
        eq(key, value) {
          if (key === 'id') id = value
          return this
        },
        order() {
          return this
        },
        range() {
          return this
        },
        maybeSingle() {
          return this
        },
        single() {
          return this
        },
        insert(v) {
          operation = 'insert'
          values = v
          return this
        },
        update(v) {
          operation = 'update'
          values = v
          return this
        },
        delete() {
          operation = 'delete'
          return this
        },
        upsert(v) {
          operation = 'upsert'
          values = v
          return this
        },
        then(resolve) {
          if (backend.fail)
            return Promise.resolve({ data: null, error: { message: 'offline' } }).then(resolve)
          if (table === 'user_settings')
            return Promise.resolve({ data: { show_country: false }, error: null }).then(resolve)
          if (operation === 'insert') {
            const row = { ...values, id: 'note-1', updated_at: '2026-09-22' }
            backend.notes = [row]
            return Promise.resolve({ data: row, error: null }).then(resolve)
          }
          if (operation === 'delete') {
            backend.notes = backend.notes.filter((n) => n.id !== id)
            return Promise.resolve({ error: null }).then(resolve)
          }
          return Promise.resolve({ data: backend.notes, error: null }).then(resolve)
        },
      }
      return builder
    },
  },
}))
const auth = {
  session: { user: { id: 'fan-a', email: 'fan@example.com' } },
  profile: { display_name: 'Fan', bio: '', avatar_url: '' },
  configured: true,
  loading: false,
  updateProfile: vi.fn(),
}
const orbit = { items: [], loading: false, error: '', has: () => false, save: vi.fn() }
function view(value = auth) {
  return (
    <AuthContext.Provider value={value}>
      <OrbitContext.Provider value={orbit}>
        <AccountPage openAuth={vi.fn()} />
      </OrbitContext.Provider>
    </AuthContext.Provider>
  )
}
beforeEach(() => {
  backend.notes = []
  backend.fail = false
  vi.clearAllMocks()
})
it('protects the account page without inventing a session', () => {
  render(view({ ...auth, session: null, configured: false }))
  expect(screen.getByText(/Dịch vụ tài khoản chưa được kết nối/)).toBeInTheDocument()
  expect(screen.queryByLabelText('Tên hiển thị')).not.toBeInTheDocument()
})
it('creates a private note and deletes only after confirmation', async () => {
  render(view())
  fireEvent.click(screen.getByRole('button', { name: 'Ghi chú', exact: true }))
  await waitFor(() => expect(screen.getByLabelText('Tiêu đề ghi chú')).toBeInTheDocument())
  fireEvent.change(screen.getByLabelText('Tiêu đề ghi chú'), { target: { value: 'Kỷ niệm' } })
  fireEvent.change(screen.getByLabelText(/^Nội dung/), { target: { value: 'Một ngày vui' } })
  fireEvent.click(screen.getByRole('button', { name: 'Lưu ghi chú' }))
  await screen.findByText('Đã lưu ghi chú riêng tư.')
  expect(backend.notes[0].user_id).toBe('fan-a')
  fireEvent.click(screen.getByRole('button', { name: 'Xóa Kỷ niệm' }))
  expect(backend.notes).toHaveLength(1)
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận xóa' }))
  await screen.findByText('Đã xóa ghi chú.')
  expect(backend.notes).toHaveLength(0)
})
it('keeps draft after failed save and never announces success', async () => {
  render(view())
  fireEvent.click(screen.getByRole('button', { name: 'Ghi chú', exact: true }))
  await screen.findByLabelText('Tiêu đề ghi chú')
  fireEvent.change(screen.getByLabelText('Tiêu đề ghi chú'), { target: { value: 'Giữ lại' } })
  backend.fail = true
  fireEvent.click(screen.getByRole('button', { name: 'Lưu ghi chú' }))
  await screen.findByText(/Không lưu được ghi chú/)
  expect(screen.getByLabelText('Tiêu đề ghi chú')).toHaveValue('Giữ lại')
  expect(screen.queryByText('Đã lưu ghi chú riêng tư.')).not.toBeInTheDocument()
})
it('clears personal drafts when the account changes', async () => {
  const page = render(view())
  fireEvent.click(screen.getByRole('button', { name: 'Ghi chú', exact: true }))
  await screen.findByLabelText('Tiêu đề ghi chú')
  fireEvent.change(screen.getByLabelText('Tiêu đề ghi chú'), { target: { value: 'Secret A' } })
  page.rerender(
    view({
      ...auth,
      session: { user: { id: 'fan-b', email: 'b@example.com' } },
      profile: { display_name: 'Fan B' },
    }),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Ghi chú', exact: true }))
  await screen.findByLabelText('Tiêu đề ghi chú')
  expect(screen.getByLabelText('Tiêu đề ghi chú')).toHaveValue('')
})

afterEach(() => act(() => setLanguage('vi')))
it('switches account tabs and saved notifications while preserving private note text', async () => {
  render(view())
  fireEvent.click(screen.getByRole('button', { name: 'Ghi chú', exact: true }))
  await screen.findByLabelText('Tiêu đề ghi chú')
  fireEvent.change(screen.getByLabelText('Tiêu đề ghi chú'), { target: { value: 'Kỷ niệm' } })
  fireEvent.change(screen.getByLabelText(/^Nội dung/), { target: { value: 'Một ngày vui' } })
  fireEvent.click(screen.getByRole('button', { name: 'Lưu ghi chú' }))
  await screen.findByText('Đã lưu ghi chú riêng tư.')
  act(() => setLanguage('en'))
  expect(screen.getByRole('button', { name: 'Notes', exact: true })).toBeInTheDocument()
  expect(screen.getByText('Private note saved.')).toBeInTheDocument()
  expect(screen.getByLabelText('Note title')).toHaveValue('Kỷ niệm')
  expect(screen.getByLabelText(/^Content/)).toHaveValue('Một ngày vui')
  expect(screen.getByRole('button', { name: 'Delete Kỷ niệm' })).toBeInTheDocument()
})
