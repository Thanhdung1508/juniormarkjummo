import { readFile, writeFile } from 'node:fs/promises'

const files = [
  '001_fan_profiles.sql',
  '002_fan_messages.sql',
  '003_archive_items.sql',
  '003_content_catalog.sql',
  '004_community_and_storage.sql',
  '005_document_features.sql',
  '006_account_features.sql',
  'seed.sql',
]
const parts = [
  '-- JUNIORMARK: chạy trong SQL Editor của dự án Supabase TRỐNG.',
  '-- Supabase cung cấp auth.users/auth.uid/storage; KHÔNG chạy local-supabase-compat.sql trên cloud.',
  '-- Nếu đã chạy các migration trước: chỉ chạy file migration còn thiếu; không chạy lại bundle này.',
  '-- Dữ liệu lịch và quỹ gắn is_demo=true chỉ để minh họa.',
  '',
]
for (const name of files)
  parts.push(
    `-- FILE: ${name}\n${await readFile(new URL(`../supabase/${name}`, import.meta.url), 'utf8')}`,
  )
await writeFile(new URL('../supabase/setup.sql', import.meta.url), parts.join('\n'))
console.log('Generated supabase/setup.sql')
