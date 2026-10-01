import demo from './catalog.demo.json'
import { apiClient } from '../lib/apiClient'

// Một snapshot cho mỗi lần mở website. Bản online không âm thầm thay lỗi API bằng dữ liệu mẫu.
export const catalog = structuredClone(demo)
export async function loadCatalog() {
  if (!apiClient) return
  const { data, error } = await apiClient.rpc('get_catalog')
  if (error) throw new Error(error.message)
  for (const key of Object.keys(demo)) {
    if (!Array.isArray(data?.[key])) throw new Error('Dữ liệu nội dung chưa hợp lệ.')
  }
  Object.assign(catalog, data)
}
export const birthdayLabel = (value) =>
  value ? value.slice(5, 10).split('-').reverse().join('/') : 'Chưa xác minh'
