import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import {
  hashPassword,
  verifyPassword,
  token,
  digest,
  httpError,
  validEmail,
  validPassword,
  rateLimit,
} from './security.mjs'
import { queryData, callRpc } from './repository.mjs'

export function createApp(
  pool,
  { origin = 'http://127.0.0.1:5173', mailDir = new URL('../.local/mail/', import.meta.url) } = {},
) {
  const dummy = hashPassword(token())
  const cookie = (res, value) =>
    res.setHeader(
      'Set-Cookie',
      `jm_session=${value}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${value ? 604800 : 0}${origin.startsWith('https:') ? '; Secure' : ''}`,
    )
  async function newSession(client, id, res, recovery = false) {
    const raw = token()
    await client.query(
      'insert into private.local_sessions(token_hash,user_id,recovery) values($1,$2,$3)',
      [digest(raw), id, recovery],
    )
    cookie(res, raw)
  }
  async function session(req) {
    const raw = (req.headers.cookie || '')
      .split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith('jm_session='))
      ?.slice(11)
    if (!raw || !/^[a-f0-9]{64}$/.test(raw)) return null
    return (
      (
        await pool.query(
          `select s.token_hash,s.user_id,s.recovery,a.email,u.raw_user_meta_data from private.local_sessions s join private.local_accounts a using(user_id) join auth.users u on u.id=a.user_id where token_hash=$1 and expires_at>now()`,
          [digest(raw)],
        )
      ).rows[0] || null
    )
  }
  const publicSession = (s) =>
    s
      ? {
          user: { id: s.user_id, email: s.email, user_metadata: s.raw_user_meta_data },
          recovery: s.recovery,
        }
      : null
  async function transaction(action) {
    const c = await pool.connect()
    try {
      await c.query('begin')
      const r = await action(c)
      await c.query('commit')
      return r
    } catch (e) {
      await c.query('rollback')
      throw e
    } finally {
      c.release()
    }
  }
  return http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    try {
      // Same-origin POST + JSON: chặn CSRF, không mở CORS cho website khác.
      if (req.headers.origin && req.headers.origin !== origin)
        throw httpError(403, 'Origin không hợp lệ.')
      const path = new URL(req.url, 'http://localhost').pathname
      if (req.method === 'GET' && path === '/api/health') {
        await pool.query('select 1')
        res.end(JSON.stringify({ ok: true }))
        return
      }
      if (req.method === 'GET' && path === '/api/auth/session') {
        res.end(JSON.stringify({ data: { session: publicSession(await session(req)) } }))
        return
      }
      if (
        req.method !== 'POST' ||
        req.headers.origin !== origin ||
        !req.headers['content-type']?.startsWith('application/json')
      )
        throw httpError(403, 'Yêu cầu không hợp lệ.')
      let raw = ''
      for await (const chunk of req) {
        raw += chunk
        if (Buffer.byteLength(raw) > 65536) throw httpError(413, 'Dữ liệu quá lớn.')
      }
      let body
      try {
        body = JSON.parse(raw || '{}')
      } catch {
        throw httpError(400, 'JSON không hợp lệ.')
      }
      if (!body || Array.isArray(body) || typeof body !== 'object')
        throw httpError(400, 'Dữ liệu không hợp lệ.')
      const current = await session(req)
      let data
      if (path.startsWith('/api/auth/'))
        await rateLimit(pool, 'ip:' + req.socket.remoteAddress, 120, 600)
      if (path === '/api/auth/signup') {
        if (
          !validEmail(body.email) ||
          !validPassword(body.password) ||
          typeof body.displayName !== 'string' ||
          body.displayName.trim().length < 2 ||
          body.displayName.trim().length > 50
        )
          throw httpError(400, 'Thông tin đăng ký không hợp lệ.')
        const email = body.email.trim().toLowerCase()
        await rateLimit(pool, 'signup:' + req.socket.remoteAddress, 15, 3600)
        const password = await hashPassword(body.password)
        const id = randomUUID()
        await transaction(async (c) => {
          await c.query('insert into auth.users(id,raw_user_meta_data) values($1,$2)', [
            id,
            { display_name: body.displayName.trim() },
          ])
          await c.query(
            'insert into private.local_accounts(user_id,email,password_hash) values($1,$2,$3)',
            [id, email, password],
          )
          await newSession(c, id, res)
        })
        data = {
          session: {
            user: { id, email, user_metadata: { display_name: body.displayName.trim() } },
          },
        }
      } else if (path === '/api/auth/signin') {
        if (
          !validEmail(body.email) ||
          typeof body.password !== 'string' ||
          body.password.length > 128
        )
          throw httpError(400, 'Thông tin đăng nhập không hợp lệ.')
        const email = body.email.trim().toLowerCase()
        await rateLimit(pool, 'signin:' + email, 20, 600)
        const account = (
          await pool.query('select * from private.local_accounts where email=$1', [email])
        ).rows[0]
        const valid = await verifyPassword(body.password, account?.password_hash || (await dummy))
        if (!account || !valid)
          throw httpError(401, 'Email hoặc mật khẩu chưa đúng.', 'invalid_credentials')
        if (current)
          await pool.query('delete from private.local_sessions where token_hash=$1', [
            current.token_hash,
          ])
        await newSession(pool, account.user_id, res)
        data = { session: { user: { id: account.user_id, email } } }
      } else if (path === '/api/auth/signout') {
        if (current)
          await pool.query(
            body.scope === 'global'
              ? 'delete from private.local_sessions where user_id=$1'
              : 'delete from private.local_sessions where token_hash=$1',
            [body.scope === 'global' ? current.user_id : current.token_hash],
          )
        cookie(res, '')
        data = {}
      } else if (path === '/api/auth/reset') {
        if (!validEmail(body.email)) throw httpError(400, 'Email không hợp lệ.')
        const email = body.email.trim().toLowerCase()
        await rateLimit(pool, 'reset:' + email, 4, 1800)
        const account = (
          await pool.query('select user_id from private.local_accounts where email=$1', [email])
        ).rows[0]
        if (account) {
          const rawToken = token()
          await pool.query('delete from private.local_password_resets where user_id=$1', [
            account.user_id,
          ])
          await pool.query(
            'insert into private.local_password_resets(token_hash,user_id) values($1,$2)',
            [digest(rawToken), account.user_id],
          )
          await mkdir(mailDir, { recursive: true })
          await writeFile(
            new URL(`${Date.now()}-${randomUUID()}.json`, mailDir),
            JSON.stringify(
              {
                to: email,
                subject: 'Đặt lại mật khẩu JuniorMark (local)',
                url: origin + '/#/account?recovery=' + rawToken,
              },
              null,
              2,
            ),
            { mode: 0o600 },
          )
        }
        data = {}
      } else if (path === '/api/auth/recover') {
        if (typeof body.token !== 'string' || !/^[a-f0-9]{64}$/.test(body.token))
          throw httpError(400, 'Liên kết không hợp lệ.')
        data = await transaction(async (c) => {
          const reset = (
            await c.query(
              'delete from private.local_password_resets where token_hash=$1 and expires_at>now() returning user_id',
              [digest(body.token)],
            )
          ).rows[0]
          if (!reset) throw httpError(400, 'Liên kết đã dùng hoặc hết hạn.')
          await newSession(c, reset.user_id, res, true)
          const a = (
            await c.query('select email from private.local_accounts where user_id=$1', [
              reset.user_id,
            ])
          ).rows[0]
          return { session: { user: { id: reset.user_id, email: a.email }, recovery: true } }
        })
      } else if (path === '/api/auth/password') {
        if (!current) throw httpError(401, 'Vui lòng đăng nhập.', 'session_expired')
        if (!validPassword(body.password)) throw httpError(400, 'Mật khẩu cần 8–128 ký tự.')
        const account = (
          await pool.query('select password_hash from private.local_accounts where user_id=$1', [
            current.user_id,
          ])
        ).rows[0]
        if (
          !current.recovery &&
          !(
            typeof body.oldPassword === 'string' &&
            body.oldPassword.length <= 128 &&
            (await verifyPassword(body.oldPassword, account.password_hash))
          )
        )
          throw httpError(401, 'Mật khẩu hiện tại chưa đúng.', 'invalid_credentials')
        const hashed = await hashPassword(body.password)
        await transaction(async (c) => {
          await c.query('update private.local_accounts set password_hash=$1 where user_id=$2', [
            hashed,
            current.user_id,
          ])
          await c.query('delete from private.local_sessions where user_id=$1', [current.user_id])
          await c.query('delete from private.local_password_resets where user_id=$1', [
            current.user_id,
          ])
          await newSession(c, current.user_id, res)
        })
        data = {}
      } else if (path === '/api/data') data = await queryData(pool, current?.user_id, body)
      else if (path === '/api/rpc')
        data = await callRpc(pool, current?.user_id, body.name, body.args)
      else throw httpError(404, 'Không tìm thấy API.')
      res.end(JSON.stringify({ data }))
    } catch (error) {
      const status =
        error.status ||
        (error.code === '23505'
          ? 409
          : ['23514', '22P02', '23503'].includes(error.code)
            ? 400
            : error.code === '42501'
              ? 403
              : 500)
      res.statusCode = status
      // Không trả SQL, thông tin cấu hình hay stack trace cho trình duyệt.
      res.end(
        JSON.stringify({
          error: {
            code: error.status ? error.code : 'request_failed',
            message: error.status
              ? error.message
              : status === 409
                ? 'Thông tin đã tồn tại.'
                : status === 400
                  ? 'Dữ liệu không hợp lệ.'
                  : status === 403
                    ? 'Không có quyền thực hiện.'
                    : 'Chưa xử lý được yêu cầu. Vui lòng thử lại.',
          },
        }),
      )
      if (status === 500) console.error('API failure:', error.code || error.name)
    }
  })
}
