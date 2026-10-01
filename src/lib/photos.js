import { catalog } from '../data/catalog'

// Nội dung ảnh lấy từ media_items; credit và nguồn luôn đi cùng ảnh.
export const photos = catalog.media_items
  .filter((p) => p.kind === 'photo')
  .map((p) => ({
    topic: p.topic,
    people: catalog.media_artists.filter((a) => a.media_id === p.id).map((a) => a.artist_id),
    id: p.id,
    file: p.file_name,
    src: p.url,
    title: p.title,
    tag: p.tag,
    alt: p.alt,
    position: p.position,
    credit: p.credit,
    source: p.source_url,
    downloadable: p.downloadable,
  }))
