import { t as tr, useLanguage, localize } from '../i18n/language'
import { useEffect, useState } from 'react'
import { useOrbit } from '../features/orbit/orbitContext'
import { useAuth } from '../features/auth/authContext'
import { apiClient } from '../lib/apiClient'
import { findMemory, memories } from '../data/memories'
import { readJourney } from '../lib/journey'
import { orbitBadges } from '../lib/orbit'
import { PageIntro, SectionTitle } from './shared'
import SaveToOrbit from '../components/SaveToOrbit'
import ShareCardButton from '../components/ShareCardButton'
import { safeSavedUrl } from '../features/account/account'

export default function MyOrbit({ openAuth, openAccount }) {
  useLanguage()
  const orbit = useOrbit(),
    auth = useAuth()
  const [messages, setMessages] = useState([]),
    [messageError, setMessageError] = useState('')
  useEffect(() => {
    let active = true
    if (!orbit.userId || !apiClient) return
    apiClient
      .rpc('my_archive_messages')
      .then(({ data, error }) => {
        if (active) {
          setMessages((data || []).map((message) => ({ ...message, ownerId: orbit.userId })))
          setMessageError(
            error
              ? tr(
                  'Chưa thể tải lời nhắn riêng. Vui lòng thử lại sau.',
                  'Private messages could not load. Try again later.',
                )
              : '',
          )
        }
      })
      .catch(() => {
        if (active)
          setMessageError(
            tr(
              'Chưa thể tải lời nhắn riêng. Vui lòng thử lại sau.',
              'Private messages could not load. Try again later.',
            ),
          )
      })
    return () => {
      active = false
    }
  }, [orbit.userId])
  function savedTitle(item) {
    const title = typeof item.payload.title === 'string' ? savedTitle(item) : ''
    if (item.kind === 'event') {
      const name = title.replace(/^(Sinh nhật |Birthday · )/, '')
      if (name !== title) return tr('Sinh nhật ', 'Birthday · ') + name
    }
    return localize(title)
  }
  const visits = orbit.userId
    ? orbit.items
        .filter((item) => item.kind === 'progress' && findMemory(item.item_id))
        .map((item) => item.item_id)
    : readJourney().visited
  const badges = orbitBadges([
    ...orbit.items,
    ...visits.map((id) => ({ kind: 'progress', item_id: id })),
  ])
  return (
    <>
      <PageIntro
        eyebrow={tr('Kho lưu trữ cá nhân', 'Your personal archive')}
        title={tr('Quỹ Đạo Của Tôi', 'My Orbit')}
        description={tr(
          'Những kỷ niệm, ngày đặc biệt đã lưu và các chương bạn đã khám phá.',
          'Saved memories, dates and the chapters you have explored.',
        )}
      >
        <button
          className="secondary-button"
          onClick={auth.session ? openAccount : () => openAuth('signin')}
        >
          {auth.session ? tr('Cài đặt tài khoản', 'Account settings') : tr('Đăng nhập', 'Sign in')}
        </button>
      </PageIntro>
      <p className="notice">
        {orbit.userId
          ? tr(
              'Bộ sưu tập riêng tư của tài khoản. Bộ sưu tập khách được lưu riêng trong trình duyệt này.',
              'Private account collection. Guest collections stay separate on this browser.',
            )
          : tr(
              'Bộ sưu tập khách chỉ lưu trên trình duyệt này. Đăng nhập để mở bộ sưu tập riêng tư của tài khoản.',
              'Guest collection · saved on this browser only. Signing in opens your separate private collection.',
            )}
      </p>
      <a className="text-button" href="#/account">
        {tr(
          'Hồ sơ · Cài đặt · Quyền riêng tư · Ghi chú ↗',
          'Profile · Settings · Privacy · Notes ↗',
        )}
      </a>
      <SectionTitle eyebrow={tr('BỘ SƯU TẬP CỦA BẠN', 'YOUR COLLECTION')}>
        {tr('Ảnh và trang đã lưu', 'Saved photos and pages')}
      </SectionTitle>
      <div className="orbit-list">
        {orbit.items
          .filter((item) => ['photo', 'page'].includes(item.kind))
          .map((item) => (
            <article key={item.kind + item.item_id}>
              <h3>
                <a href={safeSavedUrl(item.payload.url)}>
                  {typeof item.payload.title === 'string'
                    ? savedTitle(item)
                    : tr('Mục đã lưu', 'Saved item')}{' '}
                  ↗
                </a>
              </h3>
              {typeof item.payload.excerpt === 'string' && <p>{localize(item.payload.excerpt)}</p>}
              <SaveToOrbit kind={item.kind} id={item.item_id} payload={item.payload} />
            </article>
          ))}
      </div>
      {orbit.loading && <p role="status">{tr('Đang tải Quỹ Đạo Của Tôi…', 'Loading My Orbit…')}</p>}
      {orbit.error && (
        <p className="error-message" role="alert">
          {localize(orbit.error)}
        </p>
      )}
      <SectionTitle eyebrow={tr('Sưu tầm', 'Collect')}>
        {tr('Kỷ Niệm Đã Lưu', 'Saved Memories')}
      </SectionTitle>
      <div className="orbit-list">
        {orbit.items
          .filter((item) => item.kind === 'memory')
          .map((item) => (
            <article key={item.item_id}>
              <h3>
                <a href={`#/timeline?memory=${item.item_id}`}>
                  {findMemory(item.item_id)?.title || tr('Kỷ niệm lưu trữ', 'Archived memory')}
                </a>
              </h3>
              <SaveToOrbit kind="memory" id={item.item_id} payload={item.payload} />
            </article>
          ))}
      </div>
      {!orbit.items.some((item) => item.kind === 'memory') && (
        <p>
          {tr('Chưa có kỷ niệm nào được lưu.', 'No saved memories yet.')}{' '}
          <a className="text-button" href="#/timeline">
            {tr('Khám phá Chòm Sao ↗', 'Explore the Constellation ↗')}
          </a>
        </p>
      )}
      <SectionTitle eyebrow={tr('Trở lại', 'Return')}>
        {tr('Sự Kiện Đã Lưu', 'Saved Events')}
      </SectionTitle>
      <div className="orbit-list">
        {orbit.items
          .filter((item) => item.kind === 'event')
          .map((item) => (
            <article key={item.item_id}>
              <h3>
                {typeof item.payload.title === 'string'
                  ? savedTitle(item)
                  : tr('Ngày đã lưu', 'Saved date')}
              </h3>
              <p>
                {typeof item.payload.date === 'string' ? item.payload.date : ''} ·{' '}
                {item.payload.demo
                  ? tr('MINH HỌA / MẪU', 'DEMO / SAMPLE')
                  : tr(
                      'CHƯA XÁC NHẬN · Nhắc sinh nhật từ kho lưu trữ',
                      'UNCONFIRMED · Archive birthday reminder',
                    )}
              </p>
              <a href="#/schedule">{tr('Mở Lịch Trình ↗', 'Open Schedule ↗')}</a>
              <SaveToOrbit kind="event" id={item.item_id} payload={item.payload} />
            </article>
          ))}
      </div>
      {!orbit.items.some((item) => item.kind === 'event') && (
        <p>
          {tr('Chưa có ngày nào được lưu.', 'No saved dates yet.')}{' '}
          <a className="text-button" href="#/schedule">
            {tr('Khám phá ngày đặc biệt ↗', 'Explore Orbit dates ↗')}
          </a>
        </p>
      )}
      <SectionTitle eyebrow={tr('Tham gia', 'Participate')}>
        {tr('Ngôi Sao / Lời Nhắn Của Tôi', 'My Star / messages')}
      </SectionTitle>
      {orbit.userId ? (
        <>
          {messageError && <p role="status">{localize(messageError)}</p>}
          {messages
            .filter((message) => message.ownerId === orbit.userId)
            .map((message) => (
              <article className="orbit-message" key={message.id}>
                <h3>{message.name}</h3>
                <p>{message.body}</p>
                <small>
                  {localize(message.status)} · {localize(message.spectrum)}
                </small>
              </article>
            ))}
          {!messages.length && !messageError && (
            <p>{tr('Chưa tìm thấy lời nhắn đã gửi.', 'No submitted messages found.')}</p>
          )}
        </>
      ) : (
        <p>
          {tr('Lời nhắn khách là bản xem thử cục bộ trong', 'Guest messages are local previews in')}{' '}
          <a className="text-button" href="#/sky">
            {tr('Bầu Trời Sao', 'Starry Sky')}
          </a>
          {tr(
            '. Đăng nhập để gửi lời nhắn chờ duyệt.',
            '. Sign in to submit a message for moderation.',
          )}
        </p>
      )}
      <SectionTitle eyebrow={tr('Khám phá', 'Explore')}>
        {tr('Tiến Độ Hành Trình', 'Journey Progress')}
      </SectionTitle>
      <p>
        {visits.length}/{memories.length}{' '}
        {tr('kỷ niệm biên tập đã khám phá.', 'editorial memories explored.')}
      </p>
      <progress
        aria-label={tr('Tiến độ hành trình', 'Journey progress')}
        max={memories.length}
        value={visits.length}
      />
      <ul>
        {memories.map((memory) => (
          <li key={memory.id}>
            <a href={`#/timeline?era=${memory.era}`}>
              {visits.includes(memory.id) ? '✦' : '✧'} {memory.title}
            </a>
          </li>
        ))}
      </ul>
      <SectionTitle
        eyebrow={tr('Kỷ niệm từ fansite · không xếp hạng', 'Fansite keepsakes · no rankings')}
      >
        {tr('Huy hiệu của bạn', 'Your badges')}
      </SectionTitle>
      <p>
        {badges.length
          ? badges.map(localize).join(' · ')
          : tr(
              'Khám phá một kỷ niệm để bắt đầu bộ sưu tập.',
              'Explore a memory to begin your collection.',
            )}
      </p>
      <p className="muted">
        {tr(
          'Ngôi Sao Đầu Tiên: gửi một ngôi sao. Bạn Của Jummo: ghé thăm Jummo. Nhà Khám Phá: xem một kỷ niệm. Người Khám Phá Kỷ Nguyên: khám phá đủ',
          'First Star: submit a star. Jummo Friend: visit Jummo. Archive Explorer: explore a memory. Era Explorer: explore all',
        )}{' '}
        {memories.length} {tr('giai đoạn.', 'eras.')}
      </p>
      <ShareCardButton
        filename="my-orbit"
        card={{
          title: tr('Quỹ Đạo Của Tôi', 'My Orbit'),
          subtitle: orbit.userId
            ? tr('Kho riêng tư của tôi · Tóm tắt', 'My private archive · Summary')
            : tr('Bộ sưu tập trình duyệt · Tóm tắt', 'My browser collection · Summary'),
          lines: [
            `${orbit.items.filter((item) => item.kind === 'memory').length} ${tr('kỷ niệm đã lưu', 'saved memories')}`,
            `${orbit.items.filter((item) => item.kind === 'event').length} ${tr('ngày đã lưu', 'saved dates')}`,
            `${visits.length}/${memories.length} ${tr('kỷ niệm đã khám phá', 'memories explored')}`,
            badges.length
              ? badges.map(localize).join(' · ')
              : tr('Một hành trình vừa bắt đầu', 'A journey just beginning'),
          ],
        }}
      />
      <SectionTitle eyebrow={tr('Cộng đồng', 'Community')}>
        {tr('Mục yêu thích đã lưu', 'Saved favorites')}
      </SectionTitle>
      {orbit.items
        .filter((item) => item.kind === 'favorite')
        .map((item) => (
          <article className="orbit-message" key={item.item_id}>
            <a href={item.payload.kind === 'note' ? '#/wall' : '#/sky'}>
              {typeof item.payload.name === 'string'
                ? item.payload.name
                : tr('Lời nhắn cộng đồng', 'Community message')}{' '}
              ↗
            </a>
            <SaveToOrbit kind="favorite" id={item.item_id} payload={item.payload} />
          </article>
        ))}
    </>
  )
}
