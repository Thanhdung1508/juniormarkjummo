import assert from 'node:assert/strict'
import { readFile, readdir, rm } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { createPool } from '../server/database.mjs'
import { createApp } from '../server/app.mjs'
const pool = await createPool(),
  ids = [],
  suffix = randomUUID()
const mailDir = new URL('../.local/test-mail-' + suffix + '/', import.meta.url)
await pool.query(await readFile(new URL('../server/local-auth.sql', import.meta.url), 'utf8'))
const server = createApp(pool, { mailDir })
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const base = 'http://127.0.0.1:' + server.address().port + '/api/',
  origin = 'http://127.0.0.1:5173'
let checks = 0
const equal = (a, b) => {
  assert.deepEqual(a, b)
  checks++
}
async function call(path, body = {}, cookie = '', expected = 200) {
  const r = await fetch(base + path, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(body),
  })
  const data = await r.json()
  equal(r.status, expected)
  return { ...data, cookie: r.headers.get('set-cookie')?.split(';')[0] }
}
try {
  const email = 'backend-' + suffix + '@example.invalid',
    pass = 'Test-password-394!'
  const a = await call('auth/signup', { email, password: pass, displayName: 'Test Alpha' })
  ids.push(a.data.session.user.id)
  const b = await call('auth/signup', {
    email: 'b-' + email,
    password: pass,
    displayName: 'Test Beta',
  })
  ids.push(b.data.session.user.id)
  const hash = (
    await pool.query('select password_hash from private.local_accounts where user_id=$1', [ids[0]])
  ).rows[0].password_hash
  equal(hash.startsWith('scrypt:'), true)
  equal(hash.includes(pass), false)
  await call('auth/signin', { email, password: 'wrong-password' }, '', 401)
  const note = await call(
    'data',
    {
      table: 'user_notes',
      operation: 'insert',
      values: { user_id: ids[0], title: 'Private note', body: 'Only Alpha' },
    },
    a.cookie,
  )
  const noteId = note.data[0].id
  equal((await call('data', { table: 'user_notes' }, b.cookie)).data, [])
  equal(
    (
      await call(
        'data',
        {
          table: 'user_notes',
          operation: 'update',
          filters: [{ column: 'id', value: noteId }],
          values: { body: 'Hacked' },
        },
        b.cookie,
      )
    ).data,
    [],
  )
  await call(
    'data',
    {
      table: 'user_notes',
      operation: 'insert',
      values: { user_id: ids[0], title: 'Forbidden', body: '' },
    },
    b.cookie,
    403,
  )
  await call('data', { table: 'local_accounts' }, a.cookie, 400)
  await call(
    'data',
    {
      table: 'fan_profiles',
      operation: 'update',
      filters: [{ column: 'id', value: ids[0] }],
      values: { display_name: 'Updated Alpha', bio: 'Hello' },
    },
    a.cookie,
  )
  await call(
    'data',
    {
      table: 'user_settings',
      operation: 'upsert',
      values: { user_id: ids[0], show_country: false },
    },
    a.cookie,
  )
  await call(
    'data',
    {
      table: 'archive_items',
      operation: 'upsert',
      values: {
        user_id: ids[0],
        kind: 'page',
        item_id: 'profiles',
        payload: { title: 'Profiles', url: '#/profiles' },
      },
    },
    a.cookie,
  )
  const exported = await call('rpc', { name: 'export_my_data' }, a.cookie)
  equal(!!exported.data, true)
  const catalog = await call('rpc', { name: 'get_catalog' })
  equal(catalog.data.artists.length, 3)
  equal(catalog.data.tracks.length, 4)
  const csrf = await fetch(base + 'auth/signout', {
    method: 'POST',
    headers: { Origin: 'https://wrong.invalid', 'Content-Type': 'application/json' },
    body: '{}',
  })
  equal(csrf.status, 403)
  await call('auth/reset', { email })
  const mail = JSON.parse(await readFile(new URL((await readdir(mailDir))[0], mailDir), 'utf8'))
  const token = mail.url.split('recovery=')[1]
  const recovery = await call('auth/recover', { token })
  await call('auth/recover', { token }, '', 400)
  await call('auth/password', { password: 'Changed-password-89!' }, recovery.cookie)
  await call('data', { table: 'user_notes' }, a.cookie, 401)
  await call('auth/signin', { email, password: pass }, '', 401)
  const renewed = await call('auth/signin', { email, password: 'Changed-password-89!' })
  equal((await call('data', { table: 'user_notes' }, renewed.cookie)).data[0].body, 'Only Alpha')
  await call('auth/signout', { scope: 'global' }, renewed.cookie)
  await call('data', { table: 'user_notes' }, renewed.cookie, 401)
  console.log('Backend HTTP + PostgreSQL: ' + checks + ' checks passed')
} finally {
  for (const id of ids) await pool.query('delete from auth.users where id=$1', [id])
  await new Promise((resolve) => server.close(resolve))
  await pool.end()
  // Thư mục do test này tạo, UUID riêng, nằm bên trong .local của dự án.
  await rm(mailDir, { recursive: true, force: true })
}
