import { readFile } from 'node:fs/promises'
import { createPool } from './database.mjs'
import { createApp } from './app.mjs'

if (process.env.NODE_ENV === 'production')
  throw new Error(
    'Backend này là local development. Dùng Supabase cho triển khai online hoặc cấu hình triển khai production riêng.',
  )
const pool = await createPool()
await pool.query(await readFile(new URL('./local-auth.sql', import.meta.url), 'utf8'))
const server = createApp(pool, { origin: process.env.APP_ORIGIN || 'http://127.0.0.1:5173' })
server.listen(Number(process.env.API_PORT || 3001), '127.0.0.1', () =>
  console.log('JuniorMark API ready: http://127.0.0.1:3001/api/health'),
)
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () =>
    server.close(async () => {
      await pool.end()
      process.exit(0)
    }),
  )
