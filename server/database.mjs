import pg from 'pg'
import { readFile } from 'node:fs/promises'

export async function createPool() {
  // Không dùng VITE_*: mật khẩu DB chỉ được đọc trong tiến trình backend.
  if (process.env.DATABASE_URL)
    return new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10 })
  if (process.env.NODE_ENV === 'production')
    throw new Error('DATABASE_URL is required in production.')
  const password = (
    await readFile(new URL('../.local/postgres-password.local', import.meta.url), 'utf8')
  ).trim()
  return new pg.Pool({
    host: '127.0.0.1',
    port: 55432,
    database: 'juniormark',
    user: 'postgres',
    password,
    max: 10,
  })
}

// Không thực thi truy vấn nghiệp vụ dưới quyền chủ DB. Luôn dùng một transaction riêng.
export async function asUser(pool, userId, action) {
  const client = await pool.connect()
  try {
    await client.query('begin')
    await client.query(`set local role ${userId ? 'authenticated' : 'anon'}`)
    await client.query("select set_config('request.jwt.claim.sub',$1,true)", [userId || ''])
    const result = await action(client)
    await client.query('commit')
    return result
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}
