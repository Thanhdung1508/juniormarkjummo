import { beforeEach, expect, it, vi } from 'vitest'
import demo from './catalog.demo.json'
const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }))
vi.mock('../lib/apiClient', () => ({ apiClient: { rpc } }))
beforeEach(() => { vi.resetModules(); rpc.mockReset() })
it('uses published database content instead of the bundled preview', async () => {
  const data = structuredClone(demo)
  data.artists[0].name = 'Edited in database'
  data.media_items = []
  rpc.mockResolvedValue({ data })
  const { catalog, loadCatalog } = await import('./catalog')
  await loadCatalog()
  expect(rpc).toHaveBeenCalledWith('get_catalog')
  expect(catalog.artists[0].name).toBe('Edited in database')
  expect(catalog.media_items).toEqual([])
})
it('fails explicitly on an unavailable or incomplete catalog', async () => {
  const { loadCatalog } = await import('./catalog')
  rpc.mockResolvedValueOnce({ error: { message: 'Offline' } })
  await expect(loadCatalog()).rejects.toThrow('Offline')
  rpc.mockResolvedValueOnce({ data: { artists: [] } })
  await expect(loadCatalog()).rejects.toThrow('Dữ liệu nội dung chưa hợp lệ.')
})
