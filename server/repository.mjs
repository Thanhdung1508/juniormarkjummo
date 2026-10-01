import { asUser } from './database.mjs'
import { httpError } from './security.mjs'

// Tên bảng/cột/conflict không bao giờ lấy trực tiếp từ input chưa kiểm tra.
const tables = {
  fan_profiles: {
    read: ['id', 'display_name', 'bio', 'avatar_url', 'created_at'],
    write: ['display_name', 'bio', 'avatar_url'],
    ops: ['select', 'update'],
  },
  user_notes: {
    read: ['id', 'user_id', 'title', 'body', 'created_at', 'updated_at'],
    write: ['user_id', 'title', 'body'],
    ops: ['select', 'insert', 'update', 'delete'],
  },
  user_settings: {
    read: ['user_id', 'show_country', 'updated_at'],
    write: ['user_id', 'show_country'],
    ops: ['select', 'upsert'],
    key: ['user_id'],
  },
  archive_items: {
    read: ['user_id', 'kind', 'item_id', 'payload'],
    write: ['user_id', 'kind', 'item_id', 'payload'],
    ops: ['select', 'upsert', 'delete'],
    key: ['user_id', 'kind', 'item_id'],
  },
  fan_messages: {
    read: [
      'id',
      'kind',
      'name',
      'country',
      'body',
      'spectrum',
      'status',
      'created_at',
      'country_code',
      'position_x',
      'position_y',
    ],
    write: ['user_id', 'kind', 'name', 'country', 'body', 'spectrum', 'country_code'],
    ops: ['select', 'insert', 'delete'],
  },
}
const quote = (name) => `"${name}"`
export async function queryData(pool, userId, input) {
  const {
    table,
    operation = 'select',
    filters = [],
    order = [],
    offset = 0,
    limit = 1000,
    cardinality,
  } = input
  const schema = tables[table]
  if (!schema || !schema.ops.includes(operation))
    throw httpError(400, 'Thao tác dữ liệu không hợp lệ.')
  if (!userId && !(table === 'fan_messages' && operation === 'select'))
    throw httpError(401, 'Vui lòng đăng nhập.', 'session_expired')
  const columns = input.columns ? input.columns.split(',').map((s) => s.trim()) : schema.read
  if (!columns.length || columns.some((c) => !schema.read.includes(c)))
    throw httpError(400, 'Trường dữ liệu không hợp lệ.')
  if (!Array.isArray(filters) || filters.length > 12 || !Array.isArray(order) || order.length > 4)
    throw httpError(400, 'Bộ lọc không hợp lệ.')
  if (
    !Number.isInteger(offset) ||
    offset < 0 ||
    offset > 100000 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 1000
  )
    throw httpError(400, 'Phân trang không hợp lệ.')
  const params = []
  const bind = (value) => {
    params.push(value)
    return '$' + params.length
  }
  const where = filters.map((f) => {
    if (
      !f ||
      ![...schema.read, 'user_id'].includes(f.column) ||
      !['string', 'boolean', 'number'].includes(typeof f.value)
    )
      throw httpError(400, 'Bộ lọc không hợp lệ.')
    // fan_messages.user_id không được cấp SELECT; chủ bài dùng RPC my_archive_messages.
    if (table === 'fan_messages' && f.column === 'user_id')
      throw httpError(400, 'Bộ lọc không hỗ trợ.')
    return `${quote(f.column)}=${bind(f.value)}`
  })
  let sql = ''
  if (operation === 'select') {
    const sorting = order.map((o) => {
      if (!schema.read.includes(o.column)) throw httpError(400, 'Sắp xếp không hợp lệ.')
      return quote(o.column) + (o.ascending === false ? ' desc' : ' asc')
    })
    sql = `select ${columns.map(quote)} from public.${quote(table)}${where.length ? ' where ' + where.join(' and ') : ''}${sorting.length ? ' order by ' + sorting.join(',') : ''} limit ${bind(limit)} offset ${bind(offset)}`
  } else if (operation === 'delete') {
    if (!where.length) throw httpError(400, 'Cần chọn bản ghi để xóa.')
    sql = `delete from public.${quote(table)} where ${where.join(' and ')} returning ${columns.map(quote)}`
  } else {
    const values = input.values
    if (!values || Array.isArray(values) || typeof values !== 'object')
      throw httpError(400, 'Dữ liệu không hợp lệ.')
    const keys = Object.keys(values)
    if (!keys.length || keys.some((c) => !schema.write.includes(c)))
      throw httpError(400, 'Trường cập nhật không hợp lệ.')
    if (values.user_id !== undefined && values.user_id !== userId)
      throw httpError(403, 'Không có quyền sửa dữ liệu tài khoản khác.')
    if (operation === 'update') {
      if (!where.length) throw httpError(400, 'Cần chọn bản ghi để sửa.')
      sql = `update public.${quote(table)} set ${keys.map((k) => quote(k) + '=' + bind(values[k]))} where ${where.join(' and ')} returning ${columns.map(quote)}`
    } else {
      sql = `insert into public.${quote(table)} (${keys.map(quote)}) values (${keys.map((k) => bind(values[k]))})`
      if (operation === 'upsert')
        sql += ` on conflict (${schema.key.map(quote)}) do update set ${keys.map((k) => `${quote(k)}=excluded.${quote(k)}`)}`
      sql += ` returning ${columns.map(quote)}`
    }
  }
  return asUser(pool, userId, async (client) => {
    const { rows } = await client.query(sql, params)
    if (cardinality === 'single' && rows.length !== 1)
      throw httpError(404, 'Không tìm thấy bản ghi.', 'not_found')
    if (cardinality === 'maybeSingle' && rows.length > 1)
      throw httpError(409, 'Có nhiều hơn một bản ghi.')
    return cardinality ? rows[0] || null : rows
  })
}
const functions = {
  get_catalog: [],
  export_my_data: [],
  my_archive_messages: [],
  claim_daily_fortune: [],
  get_community_stats: ['p_kind'],
  get_message_feed: ['p_kind', 'p_before', 'p_before_id', 'p_limit'],
  moderate_message: ['p_id', 'p_status'],
}
export async function callRpc(pool, userId, name, args = {}) {
  if (
    !Object.hasOwn(functions, name) ||
    !args ||
    Array.isArray(args) ||
    Object.keys(args).some((k) => !functions[name].includes(k))
  )
    throw httpError(400, 'Hàm dữ liệu không hợp lệ.')
  if (!userId && !['get_catalog', 'get_community_stats', 'get_message_feed'].includes(name))
    throw httpError(401, 'Vui lòng đăng nhập.', 'session_expired')
  const keys = Object.keys(args)
  return asUser(pool, userId, async (client) => {
    const sqlArgs = keys.map((key, i) => `${quote(key)} => $${i + 1}`).join(',')
    if (['my_archive_messages', 'get_message_feed'].includes(name))
      return (
        await client.query(
          `select * from public.${quote(name)}(${sqlArgs})`,
          keys.map((k) => args[k]),
        )
      ).rows
    return (
      await client.query(
        `select public.${quote(name)}(${sqlArgs}) as data`,
        keys.map((k) => args[k]),
      )
    ).rows[0].data
  })
}
