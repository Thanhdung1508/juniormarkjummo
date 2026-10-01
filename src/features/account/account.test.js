import { expect, it } from 'vitest'
import { safeSavedUrl, validateNote, validateProfile } from './account'
it('rejects executable, protocol-relative and unknown saved routes', () => {
  for (const url of [
    'javascript:alert(1)',
    '//evil.test',
    '/\\evil.test',
    '#/unknown',
    'https://evil.test',
  ])
    expect(safeSavedUrl(url)).toBe('#/orbit')
  expect(safeSavedUrl('#/profiles/junior')).toBe('#/profiles/junior')
  expect(safeSavedUrl('/images/fan-photos/photo.jpg')).toBe('/images/fan-photos/photo.jpg')
})
it('validates notes and profile before sending', () => {
  expect(validateNote({ title: ' ', body: 'test' })).toBeTruthy()
  expect(validateNote({ title: 'Note', body: 'x'.repeat(10001) })).toBeTruthy()
  expect(validateNote({ title: 'Note', body: 'My memory' })).toBe('')
  expect(validateProfile({ display_name: 'Fan', bio: '', avatar_url: 'javascript:x' })).toBeTruthy()
  expect(validateProfile({ display_name: 'Fan', bio: 'Hello', avatar_url: '' })).toBe('')
})
