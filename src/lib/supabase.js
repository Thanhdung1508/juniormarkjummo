import { createClient } from '@supabase/supabase-js'

// Chỉ dùng publishable/anon key ở trình duyệt. Không đặt service_role key ở đây.
const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
let client = null
if (url && key) {
  try { client = createClient(url, key) }
  catch { console.warn('Cấu hình Supabase chưa hợp lệ. Kiểm tra file .env.local.') }
}
export const supabase = client
