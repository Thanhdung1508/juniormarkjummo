import { t, useLanguage, localize } from '../i18n/language'
import { useEffect, useState } from 'react'
import { memories, findMemory } from '../data/memories'
import { readJourney, nearestBirthday } from '../lib/journey'
import { useOrbit } from '../features/orbit/orbitContext'
import { Tip } from '../pages/shared'
let sessionDismissed = false
export default function JummoCompanion({ route }) {
  useLanguage()
  const orbit = useOrbit()
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem('jm-companion-dismissed') === 'yes' } catch { return sessionDismissed }
  })
  useEffect(() => {
    if (route === 'jummo' && orbit && !orbit.loading && !orbit.busy && !orbit.error && !orbit.has('progress', 'jummo')) void orbit.save('progress', 'jummo')
  }, [route, orbit])
  if (dismissed) return null
  const knownRoutes = ['studio', 'profiles', 'timeline', 'media', 'schedule', 'sky', 'wall', 'jummo', 'orbit', 'account', 'projects']
  const missing = !knownRoutes.includes(route) && !['profiles/junior', 'profiles/mark'].includes(route)
  const query = new URLSearchParams(window.location.hash.split('?')[1])
  const current = findMemory(query.get('memory')) || findMemory(query.get('era')) || findMemory(readJourney().lastMemory)
  const next = memories[(memories.findIndex((memory) => memory.id === current?.id) + 1) % memories.length]
  let title = t("Cẩm nang nhỏ của Jummo", "Jummo’s little guide"), message = t("Một ngôi sao có thể mở ra cả một chương.", "One star can open a whole chapter."), links = [[t("Khám phá kho lưu trữ", "Explore the Archive"), '#/timeline']]
  let mode = 'companion-home', image = '/main_mas.png'
  if (route === 'studio') { title = t("Lần đầu bạn ghé thăm?", "First time here?"); message = t("Gặp gỡ hai anh, khám phá kỷ niệm hoặc gửi một ngôi sao khi bạn sẵn sàng.", "Meet the duo, explore a memory, or leave a star when you are ready."); links = [[t("Gặp Junior & Mark", "Meet Junior & Mark"), '#/profiles'], [t("Khám phá kho lưu trữ", "Explore the Archive"), '#/timeline'], [t("Gửi một ngôi sao", "Leave a star"), '#/sky']] }
  else if (route === 'timeline') { mode = 'companion-timeline'; message = t(`Chương đang xem: ${localize(current?.title || 'Cherry Magic')}. Jummo gợi ý ngôi sao tiếp theo: ${localize(next.title)}.`, `Active chapter: ${localize(current?.title || 'Cherry Magic')}. Jummo suggests the next star: ${localize(next.title)}.`); links = [[t("Theo ngôi sao tiếp theo", "Follow the next star"), `#/timeline?era=${next.era}`]] }
  else if (route === 'media') { mode = 'companion-media'; image = '/camera_ms.png'; message = t("Mỗi ảnh đều có nguồn gốc đi kèm. Ngày chụp được để trống khi chưa xác minh.", "Original credits stay with every photo. Capture dates are left undated when unverified."); links = [[t("Mở kỷ niệm liên quan", "Open the related memory"), `#/timeline?era=${current?.era || 'cherry'}`]] }
  else if (route === 'schedule') { mode = 'companion-schedule'; image = '/calender_ms.png'; message = t(`Sinh nhật gần nhất: ${nearestBirthday().name}. Chưa có sự kiện sắp tới được xác minh.`, `Nearest archive birthday: ${nearestBirthday().name}. No verified upcoming event is listed.`); links = [[t("Khám phá hồ sơ", "Explore their profile"), `#/profiles/${nearestBirthday().name.startsWith('Junior') ? 'junior' : 'mark'}`]] }
  else if (['sky', 'wall', 'projects'].includes(route)) { mode = 'companion-community'; message = t("Hãy gửi một ngôi sao tử tế theo nhịp riêng của bạn. Lời nhắn công khai mới sẽ được duyệt.", "Leave a kind star at your own pace. New public messages are moderated."); links = [[t("Ghé bầu trời sao", "Visit Starry Sky"), '#/sky']] }
  else if (route === 'jummo') { message = t("Mang một chút nắng Jummo vào hành trình của bạn.", "Bring a little Jummo sunshine into your journey."); links = [[t("Khám phá kỷ niệm của Jummo", "Explore Jummo’s memory"), '#/timeline?era=fancon']] }
  else if (route === 'orbit' || route === 'account') { mode = 'companion-orbit'; message = t("Bộ sưu tập lớn dần qua những lần ghé thăm và lưu kỷ niệm.", "Your collection grows through real visits and saves."); links = [[t("Tiếp tục hành trình của bạn", "Continue your journey"), `#/timeline?era=${current?.era || 'cherry'}`]] }
  else if (missing) { mode = 'companion-missing'; image = '/sleep_mc.png'; title = t("Jummo đã ngủ quên ở đây", "Jummo fell asleep here"); message = t("Lối đi này chưa có trên bản đồ lưu trữ.", "This archive path is not in the map yet."); links = [[t("Về phòng thu", "Back to Studio"), '#/studio'], [t("Mở kho lưu trữ", "Open Archive"), '#/timeline']] }
  return <aside className={`jummo-companion ${mode} glass-medium`} aria-label={t('Jummo đồng hành', 'Jummo companion')}>
    <Tip title={title} image={image} className="companion-tip">{message}</Tip>
    <div className="companion-links">{links.map(([label, href]) => <a className="text-button" href={href} key={href}>{label} ↗</a>)}</div>
    <button className="icon-button" aria-label={t('Ẩn hướng dẫn của Jummo', 'Dismiss Jummo guide')} onClick={() => { sessionDismissed = true; setDismissed(true); try { sessionStorage.setItem('jm-companion-dismissed', 'yes') } catch { /* in-memory session fallback */ } }}>×</button>
  </aside>
}
