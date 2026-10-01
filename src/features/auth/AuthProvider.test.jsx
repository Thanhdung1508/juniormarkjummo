import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthProvider from './AuthProvider'
import { useAuth } from './authContext'

// Chỉ thay ranh giới SDK/network; dùng nguyên AuthProvider và các effect thật.
const sdk = vi.hoisted(() => ({
  listener: null,
  queries: new Map(),
  signOut: vi.fn(),
  unsubscribe: vi.fn(),
}))
vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    auth: {
      onAuthStateChange: (listener) => {
        sdk.listener = listener
        return { data: { subscription: { unsubscribe: sdk.unsubscribe } } }
      },
      signOut: (...args) => sdk.signOut(...args),
    },
    from: () => ({
      select: () => ({
        eq: (_column, id) => ({
          single: () => new Promise((resolve) => sdk.queries.set(id, resolve)),
        }),
      }),
    }),
  },
}))
function Observer() {
  const auth = useAuth()
  return (
    <>
      <p>{auth.loading ? 'loading' : auth.session?.user.id || 'guest'}</p>
      <p>{auth.profile?.display_name || 'no-profile'}</p>
      <button onClick={() => auth.signOut().catch(() => {})}>logout</button>
    </>
  )
}
beforeEach(() => {
  sessionStorage.clear()
  sdk.queries.clear()
  vi.clearAllMocks()
  sdk.signOut.mockResolvedValue({ error: null })
})
describe('Vòng đời backend Kotlin session', () => {
  it('khôi phục session ban đầu và chỉ hiển thị hồ sơ tương ứng', async () => {
    render(
      <AuthProvider>
        <Observer />
      </AuthProvider>,
    )
    expect(screen.getByText('loading')).toBeInTheDocument()
    act(() => sdk.listener('INITIAL_SESSION', { user: { id: 'fan-a' } }))
    expect(screen.getByText('fan-a')).toBeInTheDocument()
    await act(async () =>
      sdk.queries.get('fan-a')({ data: { id: 'fan-a', display_name: 'Alice' }, error: null }),
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
  it('bỏ qua hồ sơ cũ trả về sau khi chuyển tài khoản', async () => {
    render(
      <AuthProvider>
        <Observer />
      </AuthProvider>,
    )
    act(() => sdk.listener('SIGNED_IN', { user: { id: 'fan-a' } }))
    act(() => sdk.listener('SIGNED_IN', { user: { id: 'fan-b' } }))
    await act(async () =>
      sdk.queries.get('fan-b')({ data: { id: 'fan-b', display_name: 'Bob' }, error: null }),
    )
    await act(async () =>
      sdk.queries.get('fan-a')({ data: { id: 'fan-a', display_name: 'Alice' }, error: null }),
    )
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })
  it('đăng xuất thành công xóa session và hồ sơ', async () => {
    render(
      <AuthProvider>
        <Observer />
      </AuthProvider>,
    )
    act(() => sdk.listener('SIGNED_IN', { user: { id: 'fan-a' } }))
    await act(async () =>
      sdk.queries.get('fan-a')({ data: { id: 'fan-a', display_name: 'Alice' }, error: null }),
    )
    fireEvent.click(screen.getByText('logout'))
    await waitFor(() => expect(screen.getByText('guest')).toBeInTheDocument())
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
    expect(sdk.signOut).toHaveBeenCalledWith({ scope: 'local' })
  })
  it('lỗi đăng xuất không làm mất trạng thái đăng nhập giả', async () => {
    sdk.signOut.mockResolvedValue({ error: { code: 'unexpected_failure' } })
    render(
      <AuthProvider>
        <Observer />
      </AuthProvider>,
    )
    act(() => sdk.listener('SIGNED_IN', { user: { id: 'fan-a' } }))
    await act(async () => fireEvent.click(screen.getByText('logout')))
    expect(screen.getByText('fan-a')).toBeInTheDocument()
  })
  it('xử lý SIGNED_OUT và hủy theo dõi khi unmount', () => {
    const view = render(
      <AuthProvider>
        <Observer />
      </AuthProvider>,
    )
    act(() => sdk.listener('SIGNED_IN', { user: { id: 'fan-a' } }))
    act(() => sdk.listener('SIGNED_OUT', null))
    expect(screen.getByText('guest')).toBeInTheDocument()
    view.unmount()
    expect(sdk.unsubscribe).toHaveBeenCalledTimes(1)
  })
})

function RecoveryObserver() {
  const auth = useAuth()
  return (
    <>
      <p>{auth.recovering ? 'recovery-eligible' : 'normal-session'}</p>
      <p>{auth.recoveryOpen ? 'recovery-open' : 'recovery-closed'}</p>
      <button onClick={auth.dismissRecovery}>dismiss recovery</button>
    </>
  )
}
it('keeps recovery eligible after dialog dismissal and reload, then clears for another account', () => {
  const session = { user: { id: 'recovering-fan' } }
  let page = render(
    <AuthProvider>
      <RecoveryObserver />
    </AuthProvider>,
  )
  act(() => sdk.listener('PASSWORD_RECOVERY', session))
  fireEvent.click(screen.getByText('dismiss recovery'))
  expect(screen.getByText('recovery-eligible')).toBeInTheDocument()
  expect(screen.getByText('recovery-closed')).toBeInTheDocument()
  page.unmount()
  page = render(
    <AuthProvider>
      <RecoveryObserver />
    </AuthProvider>,
  )
  act(() => sdk.listener('INITIAL_SESSION', session))
  expect(screen.getByText('recovery-open')).toBeInTheDocument()
  act(() => sdk.listener('SIGNED_IN', { user: { id: 'different-fan' } }))
  expect(screen.getByText('normal-session')).toBeInTheDocument()
  expect(sessionStorage.getItem('jm-recovery-user')).toBeNull()
})
