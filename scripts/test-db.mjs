import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

// PostgreSQL thật qua WASM; chỉ giả lập phần schema do Supabase Auth/Storage quản lý.
// Không chứng minh được email, HTTP Storage, JWT hay cấu hình trên dự án Supabase thật.
const db = new PGlite()
let checks = 0
const equal = (actual, expected, label) => {
  assert.deepEqual(actual, expected, label)
  checks++
}
const scalar = async (sql) => Object.values((await db.query(sql)).rows[0])[0]
const denied = async (sql) => {
  await assert.rejects(db.query(sql), (error) =>
    ['42501', '23505', '23514', '23503', 'P0001'].includes(error.code),
  )
  checks++
}
const fanA = '11111111-1111-4111-8111-111111111111'
const fanB = '22222222-2222-4222-8222-222222222222'
const editor = '33333333-3333-4333-8333-333333333333'
const moderator = '44444444-4444-4444-8444-444444444444'
const asRole = async (role, id = '') => {
  await db.exec('reset role')
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id])
  await db.exec(`set role ${role}`)
}
try {
  await db.exec(`
    create role anon; create role authenticated;
    grant usage on schema public to anon,authenticated;
    create schema auth;
    create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
    $$;
    grant usage on schema auth to anon,authenticated;
    grant execute on function auth.uid() to anon,authenticated;
    create schema storage;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id),name text);
    alter table storage.objects enable row level security;
    grant usage on schema storage to anon,authenticated;
    grant select,insert,update,delete on storage.objects to anon,authenticated;
  `)
  for (const file of [
    '001_fan_profiles.sql',
    '002_fan_messages.sql',
    '003_content_catalog.sql',
    '004_community_and_storage.sql',
    '005_document_features.sql',
    'seed.sql',
  ]) {
    await db.exec(await readFile(new URL(`../supabase/${file}`, import.meta.url), 'utf8'))
    console.log(`OK ${file}`)
  }
  // Seed có thể chạy lại và không ghi đè nội dung đã sửa.
  await db.exec("update public.artists set bio='Edited biography' where id='junior'")
  await db.exec(await readFile(new URL('../supabase/seed.sql', import.meta.url), 'utf8'))
  equal(
    await scalar("select bio from public.artists where id='junior'"),
    'Edited biography',
    'seed preserves edits',
  )
  for (const id of [fanA, fanB, editor, moderator]) {
    await db.query(
      'insert into auth.users(id,raw_user_meta_data) values($1,\'{"display_name":"Test fan","role":"admin"}\')',
      [id],
    )
  }
  await db.query("insert into private.staff values($1,'editor'),($2,'moderator')", [
    editor,
    moderator,
  ])
  await db.exec(
    "insert into public.glossary(id,title,body) values('private-draft','Hidden','Not public')",
  )
  await asRole('anon')
  await denied('select public.claim_daily_fortune()')
  equal(await scalar('select count(*)::int from public.artists'), 3, 'public artists')
  equal(
    await scalar("select count(*)::int from public.glossary where id='private-draft'"),
    0,
    'draft hidden',
  )
  equal((await scalar('select public.get_catalog()')).media_items.length, 16, 'catalog bundle')
  await denied('select * from private.staff')
  await denied('select * from public.fan_profiles')
  await denied("insert into public.glossary(id,title,body) values('hack','Hack','Hack')")
  await asRole('authenticated', fanA)
  const fortune = await scalar('select to_jsonb(public.claim_daily_fortune())')
  equal(
    (await scalar('select to_jsonb(public.claim_daily_fortune())')).id,
    fortune.id,
    'same daily fortune',
  )
  equal(await scalar('select count(*)::int from public.jummo_daily_logs'), 1, 'single daily claim')
  await denied(
    `insert into public.jummo_daily_logs(user_id,fortune_id,claimed_date) values('${fanA}','${fortune.id}',current_date+1)`,
  )
  equal(await scalar('select count(*)::int from public.fan_profiles'), 1, 'own profile only')
  equal(await scalar("select private.has_role('editor')"), false, 'metadata cannot elevate role')
  await denied("insert into public.glossary(id,title,body) values('hack','Hack','Hack')")
  await denied(
    `insert into public.fan_messages(user_id,kind,name,country,body,spectrum) values('${fanB}','star','Test','VN','Hi','jummo')`,
  )
  await denied(
    `insert into public.fan_messages(user_id,kind,name,country,body,spectrum,status) values('${fanA}','star','Test','VN','Hi','jummo','approved')`,
  )
  await db.exec(
    `insert into public.fan_messages(user_id,kind,name,country,body,spectrum) values('${fanA}','star','Test','VN','Hello','jummo')`,
  )
  equal(
    await scalar("select status from public.fan_messages where body='Hello'"),
    'pending',
    'submissions pending',
  )
  const messageId = await scalar("select id from public.fan_messages where body='Hello'")
  await denied(`select public.moderate_message('${messageId}','approved')`)
  await denied(
    `insert into public.message_likes(user_id,message_id) values('${fanA}','${messageId}')`,
  )
  await asRole('anon')
  equal(
    (await db.query("select * from public.get_message_feed('star')")).rows.length,
    0,
    'pending excluded from feed',
  )
  await asRole('authenticated', moderator)
  await db.exec(`select public.moderate_message('${messageId}','approved')`)
  await denied("insert into public.glossary(id,title,body) values('hack','Hack','Hack')")
  await asRole('authenticated', fanA)
  await db.exec(
    `insert into public.message_likes(user_id,message_id) values('${fanA}','${messageId}')`,
  )
  await denied(
    `insert into public.message_likes(user_id,message_id) values('${fanA}','${messageId}')`,
  )
  await db.exec(
    `insert into public.media_bookmarks values('${fanA}','photo-01'); insert into public.user_checklist(user_id,item_id) values('${fanA}','check-1'); insert into public.fan_progress(user_id,kind,data) values('${fanA}','quiz','{"result":"jummo"}')`,
  )
  await asRole('authenticated', fanB)
  equal(
    await scalar('select count(*)::int from public.jummo_daily_logs'),
    0,
    'daily claims private',
  )
  equal(await scalar('select count(*)::int from public.message_likes'), 0, 'likes private')
  equal(await scalar('select count(*)::int from public.media_bookmarks'), 0, 'bookmarks private')
  equal(await scalar('select count(*)::int from public.user_checklist'), 0, 'checklist private')
  equal(await scalar('select count(*)::int from public.fan_progress'), 0, 'progress private')
  await denied(
    `insert into public.fan_progress(user_id,kind,data) values('${fanA}','baby_fan_certificate','{}')`,
  )
  await db.exec("update public.fan_progress set data='{}'")
  await asRole('anon')
  equal(
    await scalar("select public.get_community_stats('star')"),
    { messages: 1, locations: 1, likes: 1 },
    'public aggregates',
  )
  const feed = (await db.query("select * from public.get_message_feed('star')")).rows
  equal(feed.length, 1, 'approved visible')
  equal(Object.hasOwn(feed[0], 'user_id'), false, 'feed does not expose account id')
  await asRole('authenticated', fanA)
  equal(
    await scalar("select data->>'result' from public.fan_progress"),
    'jummo',
    'other account cannot update progress',
  )
  // Xóa bài không xóa lượt gửi; trình duyệt không được tự đặt timestamp/ID.
  for (let i = 0; i < 4; i++)
    await db.exec(
      `insert into public.fan_messages(user_id,kind,name,country,body,spectrum) values('${fanA}','star','Test','VN','Test ${i}','jummo')`,
    )
  await db.exec(`delete from public.fan_messages where id='${messageId}'`)
  await denied(
    `insert into public.fan_messages(user_id,kind,name,country,body,spectrum) values('${fanA}','star','Test','VN','Too many','jummo')`,
  )
  await denied("insert into storage.objects(bucket_id,name) values('site-media','hack.png')")
  await asRole('authenticated', editor)
  await db.exec("update public.glossary set status='published' where id='private-draft'")
  await db.exec("insert into storage.objects(bucket_id,name) values('site-media','ok.png')")
  await denied(`select public.moderate_message('${messageId}','approved')`)
  await denied("update public.artists set stage_image='javascript:alert(1)' where id='junior'")
  await asRole('anon')
  equal(
    await scalar("select count(*)::int from public.glossary where id='private-draft'"),
    1,
    'editor can publish',
  )
  await db.exec('reset role')
  equal(
    (await scalar('select count(*)::int from private.audit_log')) > 0,
    true,
    'audit records writes',
  )
  console.log(`PASS ${checks} database checks`)
} finally {
  await db.close()
}
