import { t as tr, useLanguage, localize } from '../i18n/language'
import { useEffect, useState } from 'react'
import SaveToOrbit from '../components/SaveToOrbit'
import { photos } from '../lib/photos'
import { memories, memoryForPhoto } from '../data/memories'
import { filterPhotos } from '../lib/archive'
import { Chips, Empty, PageIntro, SectionTitle } from './shared'

const library = photos.map((p) => ({
  ...p,
  memoryId: memoryForPhoto(p.file)?.id,
  era: memoryForPhoto(p.file)?.era,
  person: p.people.includes('junior') && p.people.includes('mark') ? 'duo' : p.people[0],
  topic: p.topic,
}))
export default function MediaHub({ openPhoto }) {
  useLanguage()
  // Kết hợp các bộ lọc trước khi phân trang; tải ảnh dùng file gốc, không dùng thumbnail.
  const [query, setQuery] = useState(''),
    [person, setPerson] = useState('all'),
    [topic, setTopic] = useState('all'),
    [era, setEra] = useState(
      () => new URLSearchParams(location.hash.split('?')[1]).get('era') || 'all',
    ),
    [source, setSource] = useState('all'),
    [sort, setSort] = useState('original'),
    [limit, setLimit] = useState(8)
  let items = filterPhotos(library, { query, person, topic }).filter(
    (photo) =>
      (era === 'all' || photo.era === era) &&
      (source === 'all' ||
        (source === 'official' ? photo.credit === 'GMMTV' : photo.credit !== 'GMMTV')),
  )
  useEffect(() => {
    const sync = () => {
      setEra(new URLSearchParams(location.hash.split('?')[1]).get('era') || 'all')
      setLimit(8)
    }
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])
  if (sort === 'title') items = [...items].sort((a, b) => a.title.localeCompare(b.title))
  if (sort === 'reverse') items = [...items].reverse()
  return (
    <>
      <PageIntro
        eyebrow={tr('KHO LƯU TRỮ TINH TÚ • THƯ VIỆN ẢNH', 'CELESTIAL ARCHIVE • PHOTO VAULT')}
        title={tr('Kho Truyền Thông', 'Visual Archive')}
        description={tr(
          'Lưu giữ ánh sáng sân khấu, những khoảnh khắc đời thường và bé linh vật Jummo.',
          'Preserving stage lights, everyday moments and our little mascot Jummo.',
        )}
      >
        <div className="stat-pill">
          <strong>{photos.length}</strong>
          <span>{tr('ẢNH TRONG THƯ VIỆN', 'PHOTOS IN THE ARCHIVE')}</span>
        </div>
      </PageIntro>
      <section className="archive-panel media-filters">
        <Chips
          label={tr('Giai đoạn biên tập', 'Editorial era')}
          value={era}
          onChange={(value) => {
            setEra(value)
            setLimit(8)
          }}
          options={[
            ['all', tr('Tất cả giai đoạn', 'All eras')],
            ...memories.map((memory) => [memory.era, memory.title]),
          ]}
        />
        <Chips
          label={tr('Nguồn ảnh', 'Photo source')}
          value={source}
          onChange={(value) => {
            setSource(value)
            setLimit(8)
          }}
          options={[
            ['all', tr('Tất cả nguồn', 'All sources')],
            ['official', tr('Nguồn chính thức · GMMTV', 'Official source · GMMTV')],
            [
              'supplied',
              tr('Bộ sưu tập từ người hâm mộ / được cung cấp', 'Fan / supplied collection'),
            ],
          ]}
        />
        <Chips
          label={tr('Nhân vật', 'Character')}
          value={person}
          onChange={(v) => {
            setPerson(v)
            setLimit(8)
          }}
          options={[
            ['all', tr('Tất cả', 'All')],
            ['junior', tr('Chỉ Junior', 'Junior Only')],
            ['mark', tr('Chỉ Mark', 'Mark Only')],
            ['duo', tr('Cặp đôi JuniorMark', 'JuniorMark Couple')],
            ['jummo', 'Jummo'],
          ]}
        />
        <Chips
          label={tr('Chủ đề', 'Topic')}
          value={topic}
          onChange={(v) => {
            setTopic(v)
            setLimit(8)
          }}
          options={[
            ['all', tr('Tất cả chủ đề', 'All topics')],
            ['stage', tr('Sân khấu', 'Stage')],
            ['portrait', tr('Chân dung', 'Portrait')],
            ['cozy', tr('Đời thường', 'Everyday life')],
          ]}
        />
        <label className="search-field">
          {' '}
          {tr('Tìm theo tên, mô tả hoặc nguồn ảnh', 'Search by name, description or credit')}{' '}
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setLimit(8)
            }}
            placeholder={tr('Nhập từ khóa…', 'Enter keywords…')}
          />
        </label>
        <p className="muted">
          {tr(
            'Kho ảnh chưa xác minh ngày chụp. Các liên kết giai đoạn do biên tập viên lựa chọn, không xác nhận thời gian hoặc địa điểm chụp.',
            'Undated archive. Era links are editorial associations, not confirmation of where or when a photo was taken.',
          )}
        </p>
      </section>
      <div className="archive-heading toolbar">
        <h2>{tr('Phòng Lưu Trữ Hình Ảnh', 'Photo Archive')}</h2>
        <span aria-live="polite">
          {items.length} {tr('kết quả', 'results')}
        </span>
        <label>
          {' '}
          {tr('Sắp xếp', 'Sort')}{' '}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="original">{tr('Thứ tự bộ sưu tập', 'Collection order')}</option>
            <option value="reverse">{tr('Thứ tự ngược', 'Reverse order')}</option>
            <option value="title">{tr('Tên A–Z', 'Name A–Z')}</option>
          </select>
        </label>
      </div>
      <div className="media-grid">
        {items.slice(0, limit).map((p) => (
          <article className="media-photo" key={p.file}>
            <button
              onClick={() => openPhoto(p)}
              aria-label={`${tr('Xem ảnh', 'View photo')} ${localize(p.title)}`}
            >
              <img
                src={p.src}
                style={{ objectPosition: p.position }}
                alt={localize(p.alt)}
                loading="lazy"
              />
              <span>{localize(p.tag)}</span>
            </button>
            <div>
              <h3>{localize(p.title)}</h3>
              <p>{localize(p.credit)}</p>
              <SaveToOrbit
                kind="photo"
                id={p.file}
                payload={{ title: p.title, url: p.src, credit: p.credit }}
              />
              {p.memoryId && (
                <a href={`#/timeline?era=${p.era}&memory=${p.memoryId}`}>
                  {tr('Kỷ niệm biên tập liên quan ↗', 'Related editorial memory ↗')}
                </a>
              )}
              <a href={p.src} download={p.file}>
                {' '}
                {tr('Tải ảnh gốc ↓', 'Download original photo ↓')}{' '}
              </a>
            </div>
          </article>
        ))}
      </div>
      {!items.length && (
        <Empty>
          {tr(
            'Chưa có ảnh phù hợp. Thử thay từ khóa hoặc bộ lọc.',
            'No matching photos. Try different keywords or filters.',
          )}
        </Empty>
      )}
      {limit < items.length && (
        <button className="secondary-button load-more" onClick={() => setLimit((n) => n + 8)}>
          {' '}
          {tr('Tải thêm ảnh (', 'Load more photos (')}
          {items.length - limit})
        </button>
      )}
      <SectionTitle eyebrow={tr('KHO LƯU TRỮ THƯỚC PHIM', 'CINEMATIC ARCHIVES')}>
        {tr('Kho Video Và Thước Phim Kỷ Niệm', 'Video Vault & Memories')}
      </SectionTitle>
      <div className="video-vault archive-panel">
        <img
          src="/images/fan-photos/HNwgVKGbsAA2z-b.jpg"
          alt={tr('Khoảnh khắc sân khấu JuniorMark', 'JuniorMark stage moment')}
        />
        <div>
          <h2>{tr('JuniorMark trên kênh GMMTV', 'JuniorMark on the GMMTV channel')}</h2>
          <p>
            {' '}
            {tr(
              'Khám phá video từ kênh chính thức. Các fancam và video có Vietsub trong thiết kế sẽ được thêm khi có liên kết nguồn cụ thể.',
              'Explore videos from the official channel. Fan recordings and subtitled videos will be added when source links are available.',
            )}{' '}
          </p>
          <a
            className="primary-button"
            href="https://www.youtube.com/@gmmtv"
            target="_blank"
            rel="noreferrer"
          >
            {' '}
            {tr('Mở kênh GMMTV ↗', 'Open the GMMTV channel ↗')}{' '}
          </a>
        </div>
      </div>
      <section className="archive-panel">
        <SectionTitle eyebrow={tr('BỘ SƯU TẬP RIÊNG CỦA FANSITE', 'EXCLUSIVE FANSITE BUNDLES')}>
          {tr('Tải Trọn Bộ Ảnh Gốc', 'Download Original Photo Collections')}
        </SectionTitle>
        <p>
          {' '}
          {tr(
            'Hiện có thể tải từng ảnh bằng nút dưới ảnh. Các gói Fan-Pack, RAW và photobook trong mẫu chưa được cung cấp.',
            'You can currently download individual photos using their download buttons. Fan packs, RAW packages and photobooks are not yet available.',
          )}{' '}
        </p>
        <p className="muted">
          {' '}
          {tr(
            'Giữ nguyên watermark và ghi nguồn khi chia sẻ. Nguồn mỗi ảnh nằm trong cửa sổ xem ảnh.',
            'Keep watermarks intact and include credits when sharing. Each photo’s source is listed in its viewer.',
          )}{' '}
        </p>
      </section>
    </>
  )
}
