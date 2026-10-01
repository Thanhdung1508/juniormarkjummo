import { setLanguage } from '../i18n/language'
import { afterEach, expect, it } from 'vitest'
import { cardText, wrapCardText } from './shareCard'
afterEach(() => setLanguage('vi'))
it('includes a fansite disclaimer and only explicitly provided personal content', () => {
  const text = cardText({ title: 'My Orbit', lines: ['2 saved memories'], user_id: 'private-uuid' })
  expect(text).toContain('người hâm mộ không chính thức')
  expect(text).toContain('2 saved memories')
  expect(text).not.toContain('private-uuid')
})
it('wraps long words and limits overflowing lines', () => {
  const lines = wrapCardText('abcdefghijk lmnop qrstuv', 5, (text) => text.length, 3)
  expect(lines).toHaveLength(3)
  expect(lines.every((line) => line.length <= 5)).toBe(true)
  expect(lines[2]).toMatch(/…$/)
})

it('exports an English disclaimer without translating personal content', () => {
  setLanguage('en')
  const text = cardText({ title: 'Ghi chú riêng của tôi', lines: ['Kỷ niệm của Mai'] })
  expect(text).toContain('Unofficial fansite')
  expect(text).toContain('Ghi chú riêng của tôi')
  expect(text).toContain('Kỷ niệm của Mai')
})
