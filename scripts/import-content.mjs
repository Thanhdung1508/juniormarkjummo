import { createPool } from '../server/database.mjs'
import { readFile } from 'node:fs/promises'
const pool = await createPool()
try {
  await pool.query(await readFile('supabase/seed.sql', 'utf8'))
  // Chỉ ẩn ba bản nhạc placeholder chưa có audio, giữ bản đã được biên tập.
  await pool.query(
    "update public.tracks set status='archived' where id in ('track-1','track-2','track-3') and audio_url is null",
  )
  console.log(
    (
      await pool.query(
        'select jsonb_object_agg(key,jsonb_array_length(value)) as counts from jsonb_each(public.get_catalog())',
      )
    ).rows,
  )
} finally {
  await pool.end()
}
