import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto'
import { promisify } from 'node:util'
const derive = promisify(scrypt)
export const token = () => randomBytes(32).toString('hex')
export const digest = (value) => createHash('sha256').update(value).digest('hex')
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const key = await derive(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })
  return `scrypt:${salt}:${key.toString('hex')}`
}
export async function verifyPassword(password, stored) {
  const [, salt, key] = stored.split(':')
  const actual = await derive(password, salt, 64, {
    N: 32768,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  })
  const expected = Buffer.from(key, 'hex')
  return expected.length === actual.length && timingSafeEqual(actual, expected)
}
export function httpError(status, message, code = 'request_failed') {
  return Object.assign(new Error(message), { status, code })
}
export function validEmail(value) {
  return (
    typeof value === 'string' &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  )
}
export function validPassword(value) {
  return typeof value === 'string' && value.length >= 8 && value.length <= 128
}

// Bộ đếm bền vững qua restart, key băm không ghi email/IP nguyên văn.
export async function rateLimit(pool, key, max, seconds) {
  const result = await pool.query(
    `insert into private.local_auth_limits(key,hits,expires_at) values($1,1,now()+make_interval(secs=>$2))
   on conflict(key) do update set hits=case when local_auth_limits.expires_at<now() then 1 else local_auth_limits.hits+1 end,
   expires_at=case when local_auth_limits.expires_at<now() then excluded.expires_at else local_auth_limits.expires_at end returning hits`,
    [digest(key), seconds],
  )
  if (result.rows[0].hits > max)
    throw httpError(429, 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.', 'over_request_rate_limit')
}
