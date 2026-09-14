import { describe, expect, it } from 'vitest'
import { filterPhotos, calendarCells, eventCalendar, validateMessage, quizResult } from './archive'

describe('bộ lọc và lịch', () => {
  it('quiz chọn đúng nhóm đa số, hòa điểm trả Jummo', () => {
    expect(quizResult([0, 0, 0])).toBe(0)
    expect(quizResult([1, 1, 1])).toBe(1)
    expect(quizResult([2, 2, 2])).toBe(2)
    expect(quizResult([0, 1, 0])).toBe(0)
    expect(quizResult([0, 1, 2])).toBe(2)
  })
  it('kết hợp tìm không dấu và bộ lọc', () => {
    const items = [
      { title: 'Ánh nắng', person: 'duo', topic: 'cozy' },
      { title: 'Ánh nắng', person: 'mark', topic: 'portrait' },
    ]
    expect(filterPhotos(items, { query: 'anh nang', person: 'duo', topic: 'all' })).toEqual([
      items[0],
    ])
  })
  it('tháng hai năm nhuận có 29 ngày, tuần bắt đầu thứ hai', () => {
    const days = calendarCells(2024, 1)
    expect(days.slice(0, 3)).toEqual([null, null, null])
    expect(days.filter(Boolean)).toHaveLength(29)
    expect(days.length % 7).toBe(0)
  })
  it('xuất ICS escape nội dung và đúng ngày kết thúc', () => {
    const ics = eventCalendar([{ id: 'bday', title: 'A, B; C', date: '2026-12-31' }])
    expect(ics).toContain('DTEND;VALUE=DATE:20270101')
    expect(ics).toContain('SUMMARY:A\\, B\\; C')
    expect(ics).toContain('\r\nEND:VCALENDAR')
  })
  it('chặn lời nhắn trống, quá dài hoặc loại sao không hợp lệ', () => {
    expect(
      validateMessage({ name: 'Fan', country: 'VN', body: '  ', spectrum: 'junior' }),
    ).toBeTruthy()
    expect(
      validateMessage({ name: 'Fan', country: 'VN', body: 'a'.repeat(201), spectrum: 'mark' }),
    ).toBeTruthy()
    expect(
      validateMessage({
        name: 'Fan',
        country: 'VN',
        body: 'Chúc một ngày vui',
        spectrum: 'invalid',
      }),
    ).toBeTruthy()
    expect(
      validateMessage({ name: 'Fan', country: 'VN', body: 'Chúc một ngày vui', spectrum: 'jummo' }),
    ).toBe('')
  })
})
