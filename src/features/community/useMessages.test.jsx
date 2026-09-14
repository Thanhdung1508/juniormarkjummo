import { act, renderHook } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
vi.mock('../../lib/supabase', () => ({ supabase: null }))
import useMessages from './useMessages'
beforeEach(() => localStorage.clear())
it('lưu bản xem thử, khôi phục sau remount và tách sao khỏi nốt nhạc', async () => {
  const hook = renderHook(() => useMessages('star'))
  await act(async () => {
    await hook.result.current.submit({
      name: 'Mây',
      country: 'Việt Nam',
      body: 'Chúc một ngày vui',
      spectrum: 'junior',
    })
  })
  expect(hook.result.current.messages).toHaveLength(1)
  hook.unmount()
  expect(renderHook(() => useMessages('star')).result.current.messages[0].name).toBe('Mây')
  expect(renderHook(() => useMessages('note')).result.current.messages).toHaveLength(0)
})
it('từ chối lưu nếu validation không đạt', async () => {
  const { result } = renderHook(() => useMessages('star'))
  await expect(
    result.current.submit({ name: 'A', country: '', body: '', spectrum: 'jummo' }),
  ).rejects.toThrow()
  expect(localStorage.getItem('jm-demo-star')).toBeNull()
})
