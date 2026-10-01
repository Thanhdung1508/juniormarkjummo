import { setLanguage } from '../i18n/language'
import { beforeEach, afterEach, expect, it } from 'vitest'
import {
  readGuestOrbit,
  writeGuestOrbit,
  changeOrbitItems,
  loadOrbit,
  persistOrbitItem,
  orbitBadges,
} from './orbit'
beforeEach(() => setLanguage('vi'))
afterEach(() => setLanguage('vi'))
it('saves and unsaves independently and rejects malformed guest records', () => {
  localStorage.clear()
  let items = changeOrbitItems([], { kind: 'memory', item_id: 'cherry', payload: {} })
  writeGuestOrbit(items)
  expect(readGuestOrbit()).toHaveLength(1)
  items = changeOrbitItems(items, items[0], true)
  expect(items).toEqual([])
  localStorage.setItem('jm-orbit-guest', '{"wrong":true}')
  expect(readGuestOrbit()).toEqual([])
  expect(() =>
    writeGuestOrbit([], {
      setItem() {
        throw Error('blocked')
      },
    }),
  ).toThrow(/lưu trữ/)
})
it('surfaces server and RLS errors without pretending a save succeeded', async () => {
  const client = {
    from: () => ({
      select: () => ({ eq: async () => ({ error: { message: 'denied' } }) }),
      upsert: async () => ({ error: { message: 'RLS' } }),
    }),
  }
  await expect(loadOrbit(client, 'owner')).rejects.toThrow(/Quỹ đạo/)
  await expect(
    persistOrbitItem(client, 'owner', { kind: 'memory', item_id: 'cherry', payload: {} }),
  ).rejects.toThrow(/Quỹ đạo/)
})
it('badges depend only on completed actions', () => {
  expect(orbitBadges([])).toEqual([])
  expect(orbitBadges([{ kind: 'progress', item_id: 'jummo' }])).toContain('Bạn của Jummo')
  expect(orbitBadges([{ kind: 'progress', item_id: 'star' }])).toContain('Ngôi sao đầu tiên')
  expect(orbitBadges([{ kind: 'progress', item_id: 'cherry' }])).toContain(
    'Người khám phá kho lưu trữ',
  )
})

it('translates badges and storage failures into English when requested', () => {
  setLanguage('en')
  expect(
    orbitBadges([
      { kind: 'progress', item_id: 'jummo' },
      { kind: 'progress', item_id: 'star' },
      { kind: 'progress', item_id: 'cherry' },
    ]),
  ).toEqual(['First Star', 'Jummo Friend', 'Archive Explorer'])
  expect(() =>
    writeGuestOrbit([], {
      setItem() {
        throw Error('blocked')
      },
    }),
  ).toThrow(/storage/i)
})
