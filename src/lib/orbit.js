import { t } from '../i18n/language'
import { memories } from '../data/memories'
const key = 'jm-orbit-guest'
export function validOrbitItem(item) {
  return (
    item &&
    ['memory', 'event', 'favorite', 'progress', 'photo', 'page'].includes(item.kind) &&
    typeof item.item_id === 'string' &&
    item.item_id.length > 0 &&
    item.item_id.length <= 200 &&
    item.payload &&
    typeof item.payload === 'object' &&
    !Array.isArray(item.payload)
  )
}
export function readGuestOrbit(storage) {
  try {
    const value = JSON.parse((storage || localStorage).getItem(key) || '[]')
    return Array.isArray(value) ? value.filter(validOrbitItem).slice(0, 1000) : []
  } catch {
    return []
  }
}
export function writeGuestOrbit(items, storage) {
  try {
    ;(storage || localStorage).setItem(key, JSON.stringify(items))
  } catch {
    throw new Error(
      t(
        'Trình duyệt không cho lưu trữ. Thay đổi trong Quỹ đạo của tôi chưa được lưu.',
        'Browser storage is unavailable. Your Orbit change was not saved.',
      ),
    )
  }
}
export function changeOrbitItems(items, item, remove = false) {
  const rest = items.filter((entry) => entry.kind !== item.kind || entry.item_id !== item.item_id)
  return remove ? rest : [...rest, item]
}
export async function loadOrbit(client, userId) {
  if (!client)
    throw new Error(
      t('Đồng bộ Quỹ đạo của tôi chưa được cấu hình.', 'My Orbit sync is not configured.'),
    )
  const { data, error } = await client
    .from('archive_items')
    .select('kind,item_id,payload')
    .eq('user_id', userId)
  if (error)
    throw new Error(
      t(
        'Chưa tải được Quỹ đạo của tôi. Hãy kiểm tra kết nối và thử lại; bạn vẫn có thể khám phá website.',
        'My Orbit could not load. Check your connection and migration 003; browsing is still available.',
      ),
    )
  return (data || []).filter(validOrbitItem)
}
export async function persistOrbitItem(client, userId, item, remove = false) {
  if (!client)
    throw new Error(
      t('Đồng bộ Quỹ đạo của tôi chưa được cấu hình.', 'My Orbit sync is not configured.'),
    )
  const query = client.from('archive_items')
  const result = remove
    ? await query.delete().eq('user_id', userId).eq('kind', item.kind).eq('item_id', item.item_id)
    : await query.upsert({ user_id: userId, ...item }, { onConflict: 'user_id,kind,item_id' })
  if (result.error)
    throw new Error(
      t(
        'Thay đổi trong Quỹ đạo của tôi chưa được lưu. Hãy kiểm tra kết nối và thử lại.',
        'My Orbit change was not saved. Check connection, owner permissions, and migration 003.',
      ),
    )
}
export function orbitBadges(items) {
  const done = new Set(items.filter((item) => item.kind === 'progress').map((item) => item.item_id))
  const visited = memories.filter((memory) => done.has(memory.id)).length
  return [
    done.has('star') && t('Ngôi sao đầu tiên', 'First Star'),
    done.has('jummo') && t('Bạn của Jummo', 'Jummo Friend'),
    visited > 0 && t('Người khám phá kho lưu trữ', 'Archive Explorer'),
    visited === memories.length && t('Người khám phá các thời kỳ', 'Era Explorer'),
  ].filter(Boolean)
}
