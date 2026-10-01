import { t as tr, useLanguage, localize } from '../i18n/language'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { apiClient } from '../lib/apiClient'
import { layoutStars, readStarSlots, storeStarSlots, safeMessageDate } from '../lib/starLayout'
import { playNote } from '../lib/archive'
import { Chips } from './shared'
import Dialog from '../components/Dialog'
import SaveToOrbit from '../components/SaveToOrbit'
import StarSkyBackground from './StarSkyBackground'
import './SkyExperience.css'

// Presentation for #/sky. Messages, validation and submission remain in Community.
export default function SkyExperience({ api, userId, submission, notice, spectra, children }) {
  useLanguage()
  const root = useRef(null),
    canvas = useRef(null),
    stars = useRef(new Map())
  const launch = useRef(null),
    handled = useRef(submission),
    drag = useRef(null),
    idleTimer = useRef(null)
  const flightClock = useRef(null)
  const [drawer, setDrawer] = useState(false),
    [filters, setFilters] = useState(false)
  const [filter, setFilter] = useState('all'),
    [view, setView] = useState('galaxy')
  const [page, setPage] = useState(0),
    [ownerAttempt, setOwnerAttempt] = useState(0)
  const [zoom, setZoom] = useState(1),
    [center, setCenter] = useState({ x: 600, y: 500 })
  const [size, setSize] = useState({ width: 1200, height: 800 })
  const [fullscreen, setFullscreen] = useState(false),
    [idle, setIdle] = useState(false)
  const [feedback, setFeedback] = useState(''),
    [selected, setSelected] = useState(null)
  const [owned, setOwned] = useState([]),
    [ownerError, setOwnerError] = useState('')
  const [ownedForSubmission, setOwnedForSubmission] = useState(null)
  const [ownerLoading, setOwnerLoading] = useState(Boolean(userId && !api.demo))
  const [flight, setFlight] = useState(null),
    [pulse, setPulse] = useState(null),
    [focusId, setFocusId] = useState(null)
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false,
  )

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!query) return
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  // Reuse the existing owner-only lookup; pending messages never enter the public feed.
  useEffect(() => {
    if (api.demo || !userId || !apiClient) return
    let active = true
    apiClient
      .rpc('my_archive_messages')
      .then(({ data, error }) => {
        if (!active) return
        if (error) throw error
        setOwnerError('')
        setOwned(
          (data || []).filter(
            (m) => m.kind === 'star' && ['approved', 'pending'].includes(m.status),
          ),
        )
        setOwnedForSubmission(submission)
      })
      .catch(() => {
        if (active)
          setOwnerError(
            tr(
              'Không tải được ngôi sao đã lưu. Hãy thử lại mục Ngôi Sao Của Tôi. Lời nhắn của bạn vẫn được lưu.',
              'Your saved star could not load. Try My Star again. Your submission remains saved.',
            ),
          )
      })
      .finally(() => {
        if (active) setOwnerLoading(false)
      })
    return () => {
      active = false
    }
  }, [api.demo, userId, submission, ownerAttempt])

  // Demo entries are explicitly browser-local previews, not inferred account ownership.
  const myStar = api.demo ? api.messages[0] : owned[0]
  const messages = useMemo(() => {
    const publicIds = new Set(api.messages.map((m) => m.id))
    return [...api.messages, ...owned.filter((m) => !publicIds.has(m.id))]
  }, [api.messages, owned])
  const slots = useMemo(() => layoutStars(messages, readStarSlots()), [messages])
  useEffect(() => {
    storeStarSlots(slots)
  }, [slots])
  const visible = messages.filter((m) => filter === 'all' || m.spectrum === filter)
  const pageSize = size.width < 600 || size.height < 650 ? 1 : 4
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize)),
    currentPage = Math.min(page, pageCount - 1)
  const scale = Math.max(0.65, Math.min(size.width / 1200, size.height / 1000)) * zoom
  const point = (id) => ({
    x: size.width / 2 + (slots[id].x - center.x) * scale,
    y: (size.focusY ?? size.height / 2) + (slots[id].y - center.y) * scale,
  })

  useLayoutEffect(() => {
    const measure = () => {
      const rect = canvas.current?.getBoundingClientRect()
      const controls = root.current?.querySelector('.sky-controls')?.getBoundingClientRect()
      const bottom = root.current?.querySelector('.sky-bottom')?.getBoundingClientRect()
      if (rect?.width && rect.height)
        setSize({
          width: rect.width,
          height: rect.height,
          focusY:
            controls && bottom ? (controls.bottom + bottom.top) / 2 - rect.top : rect.height / 2,
        })
      const header = document.querySelector('.header-wrap')?.getBoundingClientRect()
      if (header)
        root.current?.style.setProperty('--sky-header', `${Math.ceil(header.bottom + 12)}px`)
    }
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    if (canvas.current) observer?.observe(canvas.current)
    for (const element of root.current?.querySelectorAll('.sky-controls, .sky-bottom') || [])
      observer?.observe(element)
    const header = document.querySelector('.header-wrap')
    if (header) observer?.observe(header)
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [view])

  useEffect(() => {
    const update = () => {
      setFullscreen(document.fullscreenElement === root.current)
      setIdle(false)
    }
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])
  function wake() {
    setIdle(false)
    clearTimeout(idleTimer.current)
    if (fullscreen && !drawer && !filters && !selected && !flight)
      idleTimer.current = setTimeout(() => setIdle(true), 4500)
  }
  useEffect(() => {
    if (fullscreen && !drawer && !filters && !selected && !flight)
      idleTimer.current = setTimeout(() => setIdle(true), 4500)
    return () => clearTimeout(idleTimer.current)
  }, [fullscreen, drawer, filters, selected, flight])

  async function toggleFullscreen() {
    setFeedback('')
    try {
      if (document.fullscreenElement === root.current) await document.exitFullscreen()
      else if (root.current?.requestFullscreen) await root.current.requestFullscreen()
      else
        setFeedback(
          tr(
            'Trình duyệt không hỗ trợ toàn màn hình. Bạn vẫn có thể khám phá bầu trời rộng tại đây.',
            'Fullscreen is unavailable in this browser. You can still explore the full-width sky.',
          ),
        )
    } catch {
      setFeedback(
        tr(
          'Không mở được toàn màn hình. Bạn vẫn có thể khám phá bầu trời tại đây.',
          'Fullscreen could not open. You can still explore the sky here.',
        ),
      )
    }
  }
  function focusStar(star) {
    if (ownerError) {
      setOwnerLoading(true)
      setOwnerError('')
      setOwnerAttempt((value) => value + 1)
      return
    }
    if (!star || !slots[star.id]) {
      setDrawer(true)
      return
    }
    setView('galaxy')
    setFilter('all')
    setFilters(false)
    setCenter({ x: slots[star.id].x, y: slots[star.id].y })
    setFocusId(star.id)
  }
  useEffect(() => {
    if (!focusId || drawer || flight) return
    const frame = requestAnimationFrame(() => {
      stars.current.get(focusId)?.focus({ preventScroll: true })
      setFocusId(null)
    })
    return () => cancelAnimationFrame(frame)
  }, [focusId, drawer, flight, view, filter])

  // Resolve the persisted ID before taking off so the destination is the real saved slot.
  useEffect(() => {
    if (!submission || handled.current === submission) return
    const candidates = api.demo
      ? api.messages.filter((m) => !submission.previousIds.includes(m.id))
      : ownedForSubmission === submission
        ? owned
        : []
    const saved = candidates.find(
      (m) =>
        m.body === submission.form.body.trim() &&
        m.name === submission.form.name.trim() &&
        m.country === submission.form.country.trim() &&
        m.spectrum === submission.form.spectrum,
    )
    if (!saved || !slots[saved.id]) return
    const frame = requestAnimationFrame(() => {
      handled.current = submission
      setDrawer(false)
      setFilters(false)
      setView('galaxy')
      setFilter('all')
      setCenter({ x: slots[saved.id].x, y: slots[saved.id].y })
      setFlight({ id: saved.id, origin: submission.origin })
    })
    return () => cancelAnimationFrame(frame)
  }, [submission, api.demo, api.messages, owned, ownedForSubmission, slots])

  useEffect(() => {
    if (!flight || view !== 'galaxy') return
    const target = stars.current.get(flight.id)?.querySelector('b')
    const node = launch.current
    if (!target || !node) return
    const bounds = canvas.current.getBoundingClientRect()
    const start = flight.origin || { x: bounds.left + bounds.width / 2, y: bounds.bottom - 70 }
    const segments = [...node.parentElement.querySelectorAll('path')]
    // Keep elapsed time across resize/fullscreen changes; screen-space endpoints
    // are remeasured each frame, so the projectile lands on the real star.
    if (flightClock.current?.id !== flight.id)
      flightClock.current = { id: flight.id, start: performance.now() }
    const started = flightClock.current.start
    const duration = reduced ? 520 : 1600,
      arrivalDuration = reduced ? 140 : 180
    let frame
    function draw() {
      const now = performance.now()
      const end = target.getBoundingClientRect()
      const destination = { x: end.left + end.width / 2, y: end.top + end.height / 2 }
      const elapsed = now - started
      const progress = Math.min(1, Math.max(0, elapsed / duration))
      const control = {
        x:
          (start.x + destination.x) / 2 +
          (reduced ? 0 : Math.min(90, Math.abs(start.x - destination.x) * 0.2)),
        y: Math.min(start.y, destination.y) - (reduced ? 12 : 75),
      }
      function at(t) {
        return {
          x: (1 - t) ** 2 * start.x + 2 * (1 - t) * t * control.x + t ** 2 * destination.x,
          y: (1 - t) ** 2 * start.y + 2 * (1 - t) * t * control.y + t ** 2 * destination.y,
        }
      }
      const position = at(progress)
      const arrival = Math.min(1, Math.max(0, (elapsed - duration) / arrivalDuration))
      node.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%) scale(${1 + Math.sin(arrival * Math.PI) * 0.6})`
      node.style.opacity = '1'
      segments.forEach((segment, index) => {
        const distance = (segments.length - index) * (reduced ? 0.008 : 0.014)
        const from = at(Math.max(0, progress - distance))
        const to = at(Math.max(0, progress - distance + (reduced ? 0.008 : 0.014)))
        segment.setAttribute('d', `M ${from.x} ${from.y} L ${to.x} ${to.y}`)
        segment.style.opacity = `${((index + 1) / segments.length) * 0.85 * (1 - arrival)}`
      })
      if (elapsed < duration + arrivalDuration) frame = requestAnimationFrame(draw)
      else {
        setFlight(null)
        setPulse(flight.id)
        setFocusId(flight.id)
      }
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [flight, reduced, view, fullscreen])

  async function inspect(message, index) {
    if (drag.current?.moved) return
    setSelected(message)
    try {
      await playNote(index)
    } catch {
      /* Details remain usable without audio. */
    }
  }
  function move(event) {
    wake()
    const start = drag.current
    if (!start || start.pointerId !== event.pointerId || flight) return
    const dx = event.clientX - start.x,
      dy = event.clientY - start.y
    if (Math.abs(dx) + Math.abs(dy) > 6) start.moved = true
    if (start.moved) setCenter({ x: start.center.x - dx / scale, y: start.center.y - dy / scale })
  }
  function reset() {
    setZoom(1)
    setCenter({ x: 600, y: 500 })
    setFilter('all')
    setFeedback('')
  }

  return (
    <section
      ref={root}
      className={`sky-experience ${fullscreen ? 'is-fullscreen' : ''} ${idle ? 'is-idle' : ''}`}
      aria-label={tr('Bầu Trời Sao Của Chúng Ta', 'Our Starry Sky')}
      onPointerMove={wake}
      onPointerDown={wake}
      onWheel={wake}
      onFocusCapture={wake}
      onKeyDown={(event) => {
        wake()
        if (event.key !== 'Escape' || drawer || selected) return
        if (filters) {
          setFilters(false)
          return
        }
        if (document.fullscreenElement === root.current) {
          event.preventDefault()
          document
            .exitFullscreen()
            .catch(() =>
              setFeedback(
                tr(
                  'Không thoát được toàn màn hình. Hãy dùng nút thoát toàn màn hình của trình duyệt.',
                  'Fullscreen could not close. Use your browser’s exit fullscreen control.',
                ),
              ),
            )
        }
      }}
    >
      <div className="sky-heading sky-nonessential">
        <span className="eyebrow">
          {tr(
            'JUNIORMARK · MỖI NGƯỜI MỘT ÁNH SÁNG NHỎ',
            'JUNIORMARK · A LITTLE LIGHT FROM EACH OF US',
          )}
        </span>
        <h1>{tr('Bầu Trời Sao Của Chúng Ta', 'Our Starry Sky')}</h1>
        <p>{tr('Mỗi lời chúc là một vì sao.', 'Every wish is a star.')}</p>
      </div>
      <div
        className="sky-controls sky-glass"
        role="group"
        aria-label={tr('Điều khiển bầu trời', 'Sky controls')}
      >
        <button
          aria-expanded={filters}
          aria-controls="sky-filters"
          onClick={() => setFilters((value) => !value)}
          disabled={Boolean(flight)}
        >
          {tr('Bộ lọc', 'Filter')}
        </button>
        <button
          onClick={() => focusStar(myStar)}
          disabled={Boolean(flight) || ownerLoading}
          title={
            myStar
              ? tr('Tìm Ngôi Sao Của Tôi', 'Find My Star')
              : tr('Tạo Ngôi Sao Của Tôi', 'Create My Star')
          }
        >
          {tr('Ngôi Sao Của Tôi', 'My Star')}
        </button>
        <button onClick={reset} disabled={Boolean(flight)}>
          {tr('Đặt lại', 'Reset')}
        </button>
        <button
          aria-label={
            fullscreen
              ? tr('Thoát toàn màn hình', 'Exit fullscreen')
              : tr('Mở toàn màn hình', 'Enter fullscreen')
          }
          onClick={toggleFullscreen}
        >
          {fullscreen ? tr('Thoát', 'Exit') : tr('Toàn màn hình ↗', 'Fullscreen ↗')}
        </button>
      </div>
      {filters && (
        <div id="sky-filters" className="sky-filter-panel sky-glass">
          <Chips
            label={tr('Lọc bản sắc', 'Filter spectrum')}
            options={spectra}
            value={filter}
            onChange={(value) => {
              setFilter(value)
              setPage(0)
            }}
          />
          <Chips
            label={tr('Chế độ xem thiên hà', 'Galaxy view')}
            options={[
              ['galaxy', tr('Thiên hà', 'Galaxy')],
              ['list', tr('Danh sách dễ đọc', 'Readable list')],
            ]}
            value={view}
            onChange={(value) => {
              setView(value)
              setFilters(false)
            }}
          />
        </div>
      )}
      <div
        ref={canvas}
        className={`sky-canvas ${view === 'list' ? 'is-list' : ''}`}
        aria-label={tr(
          'Bầu trời tương tác. Kéo hoặc dùng phím mũi tên để khám phá.',
          'Interactive sky. Drag or use arrow keys to explore.',
        )}
        tabIndex={0}
        onPointerDown={(event) => {
          drag.current = null
          if (flight || view !== 'galaxy' || event.target.closest('button') || event.button !== 0)
            return
          drag.current = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            center,
            moved: false,
          }
          event.currentTarget.setPointerCapture?.(event.pointerId)
        }}
        onPointerMove={move}
        onPointerUp={() => {
          drag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget || flight) return
          const steps = {
            ArrowLeft: [-100, 0],
            ArrowRight: [100, 0],
            ArrowUp: [0, -100],
            ArrowDown: [0, 100],
          }
          if (steps[event.key]) {
            event.preventDefault()
            setCenter((c) => ({
              x: c.x + steps[event.key][0] / scale,
              y: c.y + steps[event.key][1] / scale,
            }))
          }
        }}
      >
        <StarSkyBackground />
        {view === 'galaxy' ? (
          visible.map((m, index) => {
            const pos = point(m.id),
              own = m.id === myStar?.id
            return (
              <button
                key={m.id}
                ref={(node) => {
                  if (node) stars.current.set(m.id, node)
                  else stars.current.delete(m.id)
                }}
                className={`sky-star ${m.spectrum} ${own ? 'is-mine' : ''} ${flight?.id === m.id ? 'is-arriving' : ''} ${pulse === m.id ? 'sky-pulse' : ''}`}
                style={{ left: pos.x, top: pos.y }}
                aria-label={`${own ? tr('Ngôi Sao Của Bạn. ', 'Your Star. ') : ''}${tr('Ngôi sao của', 'Star from')} ${m.name}: ${m.body}${m.status === 'pending' ? tr('. Chờ duyệt; chỉ bạn thấy', '. Awaiting approval; visible only to you') : ''}`}
                onAnimationEnd={() => setPulse(null)}
                onFocus={() => {
                  if (
                    !flight &&
                    (pos.x < 60 ||
                      pos.x > size.width - 60 ||
                      pos.y < 160 ||
                      pos.y > size.height - 140)
                  )
                    setCenter({ x: slots[m.id].x, y: slots[m.id].y })
                }}
                onClick={() => inspect(m, index)}
              >
                <b aria-hidden="true">✦</b>
                <span>{own ? tr('Ngôi Sao Của Bạn', 'Your Star') : m.name}</span>
                {own && (
                  <small>
                    {m.status === 'pending'
                      ? tr('Chỉ bạn thấy · chờ duyệt', 'Only you · awaiting approval')
                      : api.demo
                        ? tr('Đã lưu trên trình duyệt này', 'Saved on this browser')
                        : m.name}
                  </small>
                )}
              </button>
            )
          })
        ) : (
          <div className="sky-readable-list">
            {visible
              .slice(currentPage * pageSize, currentPage * pageSize + pageSize)
              .map((m, index) => (
                <button className="sky-glass" key={m.id} onClick={() => inspect(m, index)}>
                  <strong>
                    {m.id === myStar?.id ? tr('Ngôi Sao Của Bạn · ', 'Your Star · ') : ''}
                    {m.name}
                  </strong>
                  <span>{m.body}</span>
                  {m.status === 'pending' && (
                    <small>{tr('Chỉ bạn thấy · chờ duyệt', 'Only you · awaiting approval')}</small>
                  )}
                </button>
              ))}
          </div>
        )}
        {!visible.length && (
          <p className="sky-empty">
            {filter === 'all'
              ? tr(
                  'Bầu trời đang chờ nguyện ước đầu tiên của bạn.',
                  'A sky waiting for your first wish.',
                )
              : tr('Chưa có ngôi sao nào thuộc sắc màu này.', 'No stars in this spectrum yet.')}
          </p>
        )}
      </div>
      {flight &&
        createPortal(
          <div className="sky-flight" aria-hidden="true">
            <svg>
              {Array.from({ length: 12 }, (_, index) => (
                <path key={index} strokeWidth={1 + index * 0.35} />
              ))}
            </svg>
            <b ref={launch}>✦</b>
          </div>,
          document.fullscreenElement || document.body,
        )}
      {view === 'list' && (
        <div className="sky-pagination sky-glass">
          <button
            aria-label={tr('Các ngôi sao trước', 'Previous stars')}
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            ←
          </button>
          <span>
            {currentPage + 1} / {pageCount}
          </span>
          <button
            aria-label={tr('Các ngôi sao tiếp theo', 'Next stars')}
            disabled={currentPage === pageCount - 1}
            onClick={() => setPage(currentPage + 1)}
          >
            →
          </button>
        </div>
      )}
      <div className="sky-bottom sky-nonessential">
        <div className="sky-personal sky-glass">
          <span>
            {myStar
              ? tr(
                  '✦ Ánh sáng của bạn đã thuộc về bầu trời này',
                  '✦ Your light is part of this sky',
                )
              : tr(
                  '✧ Một nguyện ước nhỏ. Một ánh sáng dài lâu.',
                  '✧ A little wish. A lasting light.',
                )}
          </span>
          <button disabled={ownerLoading || Boolean(flight)} onClick={() => focusStar(myStar)}>
            {ownerLoading
              ? tr('Đang tìm ngôi sao của bạn…', 'Finding your star…')
              : ownerError
                ? tr('Thử tìm lại ngôi sao', 'Retry My Star')
                : myStar
                  ? tr('Tìm Ngôi Sao Của Tôi', 'Find My Star')
                  : tr('Tạo Ngôi Sao Của Tôi', 'Create My Star')}
          </button>
        </div>
        <div className="sky-actions">
          <div
            className="sky-zoom sky-glass"
            role="group"
            aria-label={tr('Thu phóng bầu trời', 'Sky zoom')}
          >
            <button
              aria-label={tr('Thu nhỏ', 'Zoom out')}
              disabled={zoom <= 0.75 || Boolean(flight)}
              onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
            >
              −
            </button>
            <output aria-live="polite">{Math.round(zoom * 100)}%</output>
            <button
              aria-label={tr('Phóng to', 'Zoom in')}
              disabled={zoom >= 2 || Boolean(flight)}
              onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
            >
              +
            </button>
          </div>
          <button
            className="primary-button"
            disabled={Boolean(flight)}
            onClick={() => setDrawer(true)}
          >
            {tr('+ Gửi Một Ngôi Sao', '+ Leave a Star')}
          </button>
        </div>
        <p className="sky-caption">
          {api.messages.length}{' '}
          {api.demo
            ? tr('ngôi sao cục bộ · Bản xem thử trên trình duyệt', 'local stars · Browser preview')
            : tr(
                'ngôi sao công khai · Lời chúc mới cần được duyệt',
                'public stars · New wishes are moderated',
              )}
          <span>
            {tr(
              'Kéo để khám phá · Chọn ngôi sao để nghe',
              'Drag to explore · Select a star to listen',
            )}
          </span>
        </p>
      </div>
      <div className="sky-status" role="status">
        {localize(feedback || ownerError || api.error)}
      </div>
      <span className="sr-only" role="status">
        {!drawer && localize(notice)}
      </span>
      {drawer && (
        <Dialog
          title={tr('Gửi Một Ngôi Sao', 'Leave a Star')}
          className="sky-drawer"
          onClose={() => setDrawer(false)}
        >
          {children}
        </Dialog>
      )}
      {selected && (
        <Dialog title={selected.name} className="sky-details" onClose={() => setSelected(null)}>
          <p>{selected.body}</p>
          <p>
            {tr('Địa điểm tự khai:', 'Declared location:')} {selected.country}
          </p>
          <p>
            {tr('Sắc màu:', 'Spectrum:')} {localize(selected.spectrum)}
          </p>
          <p>{safeMessageDate(selected.created_at)} · UTC+7</p>
          {selected.status === 'pending' && (
            <p>
              {tr(
                'Chỉ bạn thấy ngôi sao này. Lời nhắn đang chờ duyệt trước khi xuất hiện công khai.',
                'Only you can see this star. Awaiting moderation before it appears publicly.',
              )}
            </p>
          )}
          <SaveToOrbit
            kind="favorite"
            id={selected.id}
            payload={{ name: selected.name, kind: 'star' }}
          />
        </Dialog>
      )}
    </section>
  )
}
