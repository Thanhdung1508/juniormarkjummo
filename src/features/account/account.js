import { t } from '../../i18n/language'
// Link lưu từ website chỉ được mở về route và ảnh nội bộ đã biết.
export function safeSavedUrl(value) {
  if (typeof value !== 'string' || /[\\\s<>]/.test(value)) return '#/orbit'
  if (
    /^#\/(studio|profiles(?:\/(?:junior|mark))?|timeline|media|schedule|sky|wall|jummo|projects|orbit)(?:\?[^#]*)?$/.test(
      value,
    )
  )
    return value
  if (/^\/images\/[a-zA-Z0-9_./%-]+$/.test(value) && !value.includes('..')) return value
  return '#/orbit'
}
export function validateNote(note) {
  if (!note.title?.trim() || note.title.trim().length > 120)
    return t('Tiêu đề cần từ 1 đến 120 ký tự.', 'The title must contain 1–120 characters.')
  if ((note.body?.length || 0) > 10000)
    return t('Ghi chú tối đa 10.000 ký tự.', 'Notes can contain up to 10,000 characters.')
  return ''
}
export function validateProfile(profile) {
  if (
    !profile.display_name ||
    profile.display_name.trim().length < 2 ||
    profile.display_name.trim().length > 50
  )
    return t(
      'Tên hiển thị cần từ 2 đến 50 ký tự.',
      'Your display name must contain 2–50 characters.',
    )
  if ((profile.bio?.length || 0) > 500)
    return t('Giới thiệu tối đa 500 ký tự.', 'Your bio can contain up to 500 characters.')
  if (profile.avatar_url && !/^https:\/\/[^\s]+$/.test(profile.avatar_url))
    return t('Ảnh đại diện cần đường dẫn HTTPS.', 'Your avatar must use an HTTPS URL.')
  return ''
}
export function downloadPrivateData(data) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'juniormark-my-data.json'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
