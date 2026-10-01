import { t, useLanguage, localize } from '../../i18n/language'
import { useEffect, useRef, useState } from 'react'
import { apiClient } from '../../lib/apiClient'
import { validateMessage } from '../../lib/archive'

// Chưa cấu hình: lưu bản xem thử trên máy. Có cấu hình: chỉ đọc bài đã duyệt, gửi bài ở pending.
export default function useMessages(kind, userId) {
  useLanguage()
  const key = `jm-demo-${kind}`,
    busyRef = useRef(false)
  const [messages, setMessages] = useState(() => {
      if (apiClient) return []
      try {
        const saved = JSON.parse(localStorage.getItem(key) || '[]')
        return Array.isArray(saved)
          ? saved.filter((m) => m && typeof m.id === 'string' && !validateMessage(m)).slice(0, 100)
          : []
      } catch {
        return []
      }
    }),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false)
  useEffect(() => {
    let active = true
    if (!apiClient) return
    apiClient
      .from('fan_messages')
      .select('id,name,country,body,spectrum,created_at')
      .eq('kind', kind)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data, error: e }) => {
        if (active) {
          setMessages(data || [])
          setError(
            e
              ? t(
                  'Chưa tải được lời nhắn. Kiểm tra kết nối và migration cộng đồng.',
                  'Messages could not load. Please check your connection and try again.',
                )
              : '',
          )
        }
      })
    return () => {
      active = false
    }
  }, [kind, key])
  async function submit(form) {
    const invalid = validateMessage(form)
    if (invalid) throw new Error(invalid)
    if (busyRef.current) return null
    busyRef.current = true
    setBusy(true)
    try {
      const message = {
        name: form.name.trim(),
        country: form.country.trim(),
        body: form.body.trim(),
        spectrum: form.spectrum,
      }
      if (apiClient) {
        if (!userId) throw new Error(t('Đăng nhập để gửi lời nhắn.', 'Sign in to send a message.'))
        const { error: e } = await apiClient
          .from('fan_messages')
          .insert({ ...message, kind, user_id: userId })
        if (e)
          throw new Error(
            t(
              'Chưa gửi được lời nhắn. Thử lại hoặc kiểm tra cấu hình cộng đồng.',
              'Your message could not be sent. Please try again.',
            ),
          )
        return t(
          'Đã gửi lời nhắn, đang chờ quản trị viên duyệt.',
          'Message sent and awaiting moderator approval.',
        )
      }
      const next = [
        { ...message, id: crypto.randomUUID(), created_at: new Date().toISOString() },
        ...messages,
      ].slice(0, 100)
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        throw new Error(
          t(
            'Trình duyệt không cho lưu bản xem thử. Nội dung chưa được lưu.',
            'Your browser could not save the preview. Your content has not been saved.',
          ),
        )
      }
      setMessages(next)
      return t(
        'Đã lưu bản xem thử trên trình duyệt này. Chưa công khai lên cộng đồng.',
        'Preview saved in this browser. It has not been published to the community.',
      )
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }
  return { messages, error: localize(error), busy, submit, demo: !apiClient }
}
