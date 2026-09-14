// Hàm thuần cho tìm kiếm, lịch và kiểm tra nội dung; không phụ thuộc giao diện.
export const normalize = (s = '') =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
export function filterPhotos(items, { query = '', person = 'all', topic = 'all' }) {
  return items.filter(
    (p) =>
      (person === 'all' || p.person === person) &&
      (topic === 'all' || p.topic === topic) &&
      normalize(`${p.title} ${p.alt || ''} ${p.credit || ''}`).includes(normalize(query.trim())),
  )
}
export function calendarCells(year, month) {
  const first = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return Array.from({ length: Math.ceil((first + count) / 7) * 7 }, (_, i) =>
    i >= first && i < first + count ? i - first + 1 : null,
  )
}
const escapeICS = (s) =>
  s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
export function eventCalendar(events) {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
  const rows = events.flatMap((e) => {
    const end = new Date(`${e.date}T00:00:00Z`)
    end.setUTCDate(end.getUTCDate() + 1)
    return [
      'BEGIN:VEVENT',
      `UID:${e.id}-${e.date}@juniormark.local`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${e.date.replace(/-/g, '')}`,
      `DTEND;VALUE=DATE:${end.toISOString().slice(0, 10).replace(/-/g, '')}`,
      `SUMMARY:${escapeICS(e.title)}`,
      `DESCRIPTION:${escapeICS(e.demo ? 'Lịch minh họa thiết kế, không phải sự kiện xác nhận.' : e.description || '')}`,
      'END:VEVENT',
    ]
  })
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JuniorMark Fansite//Calendar//VI',
    ...rows,
    'END:VCALENDAR',
  ].join('\r\n')
}
export function downloadText(name, content, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function validateMessage({ name = '', country = '', body = '', spectrum = '' }) {
  if (name.trim().length < 2 || name.trim().length > 50)
    return 'Tên hiển thị cần từ 2 đến 50 ký tự.'
  if (!country.trim() || country.trim().length > 60)
    return 'Nhập quốc gia / thành phố, tối đa 60 ký tự.'
  if (!body.trim() || body.trim().length > 200) return 'Lời nhắn cần từ 1 đến 200 ký tự.'
  if (!['junior', 'mark', 'jummo'].includes(spectrum)) return 'Chọn một bản sắc tinh tú.'
  return ''
}
// Kết quả theo số lựa chọn; hòa điểm chọn Jummo (kết nối cả hai sắc màu).
export function quizResult(answers) {
  const counts = [0, 0, 0]
  answers.forEach((a) => {
    if (a >= 0 && a < 3) counts[a]++
  })
  const max = Math.max(...counts),
    winners = counts.flatMap((n, i) => (n === max ? [i] : []))
  return winners.length === 1 ? winners[0] : 2
}
// Âm tổng hợp cho tương tác nốt nhạc, không giả làm bản thu của nghệ sĩ.
let audioContext
export async function playNote(index = 0) {
  const Context = window.AudioContext || window.webkitAudioContext
  if (!Context) return false
  try {
    audioContext ||= new Context()
    await audioContext.resume()
    const oscillator = audioContext.createOscillator(),
      gain = audioContext.createGain(),
      now = audioContext.currentTime
    oscillator.type = 'sine'
    oscillator.frequency.value = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88][index % 7]
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.12, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1)
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start()
    oscillator.stop(now + 1.05)
    oscillator.onended = () => {
      oscillator.disconnect()
      gain.disconnect()
    }
    return true
  } catch {
    return false
  }
}
