import { t as tr, useLanguage, localize } from '../i18n/language'
import { catalog } from '../data/catalog'
import { photoPath } from '../data/memories'
import { useState } from 'react'
import { calendarCells, downloadText, eventCalendar } from '../lib/archive'
import { Chips, Empty, PageIntro, Tip } from './shared'
import SaveToOrbit from '../components/SaveToOrbit'

// Lịch minh họa tách riêng; không dẫn tới mua vé hoặc ghi danh giả.
const examples = catalog.events
  .filter((e) => e.event_status !== 'cancelled')
  .map((e) => ({
    ...e,
    date: new Intl.DateTimeFormat('en-CA', {
      timeZone: e.timezone || 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(e.starts_at)),
    demo: e.is_demo,
  }))
export default function Schedule({ showInfo }) {
  useLanguage()
  const now = new Date(),
    [year, setYear] = useState(now.getFullYear()),
    [month, setMonth] = useState(now.getMonth()),
    [view, setView] = useState(() =>
      window.matchMedia?.('(max-width: 640px)').matches ? 'agenda' : 'list',
    ),
    [category, setCategory] = useState('all'),
    [demo, setDemo] = useState(false)
  const birthdays = catalog.artists
    .filter((a) => a.birthday)
    .map((a) => ({
      id: a.id,
      date: year + a.birthday.slice(4, 10),
      title: tr('Sinh nhật ', 'Birthday · ') + a.name,
      category: 'birthday',
      description: tr(
        'Ngày sinh nhật, không phải lịch fanmeeting.',
        'Birthday reminder, not a fan meeting schedule.',
      ),
      image: a.portrait_image,
    }))
  const events = [...birthdays, ...examples.filter((e) => demo || !e.demo)]
    .filter(
      (e) => (category === 'all' || e.category === category) && Number(e.date.slice(0, 4)) === year,
    )
    .sort((a, b) => a.date.localeCompare(b.date))
  function shift(n) {
    if (view === 'agenda') {
      setYear((current) => current + n)
      return
    }
    const d = new Date(year, month + n, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }
  function save(list) {
    downloadText(
      'juniormark-calendar.ics',
      eventCalendar(
        list.map((event) => ({
          ...event,
          title: localize(event.title),
          description: localize(event.description),
        })),
      ),
      'text/calendar;charset=utf-8',
    )
  }
  return (
    <>
      <PageIntro
        eyebrow={tr('LỊCH QUỸ ĐẠO • GMT+7', 'ORBIT CALENDAR • GMT+7')}
        title={tr('Lịch Trình Tinh Tú • JuniorMark', 'Celestial Schedule • JuniorMark')}
        description={tr(
          'Theo dõi những ngày đặc biệt và lưu vào lịch cá nhân.',
          'Follow special dates and save them to your personal calendar.',
        )}
      >
        <div className="toolbar">
          <button className="primary-button" onClick={() => save(events)} disabled={!events.length}>
            {' '}
            {tr('Tải file .ICS ↓', 'Download .ICS file ↓')}{' '}
          </button>
          <button
            className="secondary-button"
            onClick={() =>
              showInfo(
                tr('Đồng bộ lịch', 'Calendar sync'),
                tr(
                  'Tải file .ICS rồi nhập vào Google Calendar hoặc Apple Calendar. Đây là bản nhập một lần, chưa phải lịch tự đồng bộ.',
                  'Download the .ICS file and import it into Google Calendar or Apple Calendar. This is a one-time import, not automatic synchronization.',
                ),
              )
            }
          >
            Google / Apple Calendar
          </button>
        </div>
      </PageIntro>
      <Tip>
        {' '}
        {tr(
          'Ngày sinh nhật luôn có sẵn. Bật “Xem lịch minh họa” để xem các thẻ sự kiện trong mẫu thiết kế; đây không phải lịch đã xác nhận.',
          'Birthdays are always available. Enable the sample calendar to see design examples; these are not confirmed events.',
        )}{' '}
      </Tip>
      <label className="demo-switch">
        <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} />{' '}
        {tr('Xem lịch minh họa thiết kế', 'Show sample design calendar')}{' '}
      </label>
      <div className="archive-panel toolbar">
        <Chips
          label={tr('Kiểu xem lịch', 'Calendar view')}
          value={view}
          onChange={setView}
          options={[
            ['agenda', tr('Danh sách ngày', 'Agenda')],
            ['list', tr('Dòng thời gian', 'Timeline')],
            ['month', tr('Lịch tháng', 'Monthly calendar')],
          ]}
        />
        <Chips
          label={tr('Loại sự kiện', 'Event type')}
          value={category}
          onChange={setCategory}
          options={[
            ['all', tr('Tất cả', 'All')],
            ['birthday', tr('Sinh nhật', 'Birthday')],
            ['fancon', tr('Gặp Gỡ Người Hâm Mộ • Hòa Nhạc', 'Fan Meeting • Concert')],
            ['press', tr('Phim / Họp báo', 'Film / Press')],
          ]}
        />
      </div>
      <div className="toolbar month-toolbar">
        <button
          className="icon-button"
          aria-label={
            view === 'agenda'
              ? tr('Năm trước', 'Previous year')
              : tr('Tháng trước', 'Previous month')
          }
          onClick={() => shift(-1)}
        >
          ←
        </button>
        <h2>
          {view === 'agenda'
            ? `${tr('Danh sách ngày', 'Agenda')} · ${year}`
            : tr(`Tháng ${month + 1}, ${year}`, `Month ${month + 1}, ${year}`)}
        </h2>
        <button
          className="icon-button"
          aria-label={
            view === 'agenda' ? tr('Năm sau', 'Next year') : tr('Tháng sau', 'Next month')
          }
          onClick={() => shift(1)}
        >
          →
        </button>
        <button
          className="text-button"
          onClick={() => {
            setYear(now.getFullYear())
            setMonth(now.getMonth())
          }}
        >
          {' '}
          {tr('Hôm nay', 'Today')}{' '}
        </button>
      </div>
      {view === 'agenda' && (
        <nav className="date-rail" aria-label={tr('Các ngày trong danh sách', 'Agenda dates')}>
          {events.map((event) => (
            <a key={event.id} href={`#/schedule?section=event-${event.id}`}>
              {event.date.slice(5)} ·{' '}
              {event.demo ? tr('MINH HỌA', 'DEMO') : tr('Sinh nhật', 'Birthday')}
            </a>
          ))}
        </nav>
      )}
      {view === 'month' ? (
        <div
          className="month-grid"
          aria-label={tr(`Lịch tháng ${month + 1}/${year}`, `Calendar for ${month + 1}/${year}`)}
        >
          {tr('T2,T3,T4,T5,T6,T7,CN', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun')
            .split(',')
            .map((d) => (
              <b key={d}>{d}</b>
            ))}
          {calendarCells(year, month).map((day, i) => (
            <div key={i} className={!day ? 'blank-day' : ''}>
              {day && (
                <>
                  <span>{day}</span>
                  {events
                    .filter(
                      (e) =>
                        e.date ===
                        `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                    )
                    .map((e) => (
                      <button
                        key={e.id}
                        onClick={() =>
                          showInfo(
                            localize(e.title),
                            e.demo
                              ? tr(
                                  'Sự kiện minh họa thiết kế, chưa có thông báo chính thức.',
                                  'Sample design event without an official announcement.',
                                )
                              : localize(e.description),
                          )
                        }
                      >
                        {e.demo ? tr('Mẫu · ', 'Sample · ') : ''}
                        {localize(e.title)}
                      </button>
                    ))}
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="event-list">
          {events
            .filter((e) => view === 'agenda' || Number(e.date.slice(5, 7)) === month + 1)
            .map((e) => (
              <article className="archive-panel event-card" id={`event-${e.id}`} key={e.id}>
                <img
                  src={photoPath(e.image)}
                  alt={tr('Ảnh minh họa JuniorMark', 'JuniorMark illustration')}
                />
                <div>
                  <span className="eyebrow">
                    {e.date.split('-').reverse().join('/')} •{' '}
                    {e.demo
                      ? tr('MINH HỌA · LỊCH MẪU', 'DEMO / SAMPLE · SAMPLE CALENDAR')
                      : tr(
                          'CHƯA XÁC NHẬN · Nhắc sinh nhật từ kho lưu trữ',
                          'UNCONFIRMED · Archive birthday reminder',
                        )}
                  </span>
                  <h3>{localize(e.title)}</h3>
                  <p>
                    {e.demo
                      ? tr(
                          'Nội dung từ bản thiết kế, chưa xác nhận ngày giờ hoặc địa điểm.',
                          'Design sample; date, time and location are unconfirmed.',
                        )
                      : localize(e.description)}
                  </p>
                  <button className="secondary-button" onClick={() => save([e])}>
                    {' '}
                    {tr('Lưu vào lịch ↓', 'Save to calendar ↓')}{' '}
                  </button>
                  <SaveToOrbit
                    kind="event"
                    id={`${e.id}-${e.date}`}
                    payload={{ title: e.title, date: e.date, demo: Boolean(e.demo) }}
                  />
                </div>
              </article>
            ))}
          {!events.some((e) => view === 'agenda' || Number(e.date.slice(5, 7)) === month + 1) && (
            <Empty>{tr('Chưa có sự kiện trong tháng này.', 'No events this month.')}</Empty>
          )}
        </div>
      )}
      <div className="three-columns schedule-tips">
        {[
          [
            tr('Quy chuẩn fandom', 'Fandom guidelines'),
            tr(
              'Theo dõi quy định riêng của đơn vị tổ chức về banner, máy ảnh và đồ mang vào.',
              'Check the organizer’s rules for banners, cameras and permitted items.',
            ),
          ],
          [
            tr('Di chuyển & địa điểm', 'Travel & venue'),
            tr(
              'Kiểm tra địa chỉ trên thông báo chính thức trước khi lên lịch đi lại.',
              'Check the address in the official announcement before planning travel.',
            ),
          ],
          [
            tr('Theo dõi thông báo', 'Follow announcements'),
            tr(
              'Lịch trong fansite không thay thế thông báo của GMMTV hoặc đơn vị tổ chức.',
              'The fansite calendar does not replace announcements from GMMTV or event organizers.',
            ),
          ],
        ].map(([h, p]) => (
          <article className="archive-panel" key={h}>
            <h3>{h}</h3>
            <p>{p}</p>
          </article>
        ))}
      </div>
    </>
  )
}
