import { useEffect, useState } from 'react'
import { CalendarPlus, Moon, Sun } from 'lucide-react'
import { birthdayCountdown } from '../lib/helpers'

// File lịch là sự kiện cả ngày, lặp hàng năm; không yêu cầu quyền truy cập lịch cá nhân.
function saveBirthday(name, month, day, year) {
  const date = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//JuniorMark Fansite//Birthday//VI', 'BEGIN:VEVENT', `UID:birthday-${name.toLowerCase().replaceAll(' ', '-')}@juniormark-fansite`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${date}`, 'DURATION:P1D', 'RRULE:FREQ=YEARLY', `SUMMARY:Happy Birthday ${name}`, 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = `${name}-birthday.ics`; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function Birthdays() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const interval = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(interval) }, [])
  return <section className="birthday-grid" id="profiles" aria-label="Sinh nhật Junior và Mark">
    {[{ name: 'Junior Panachai', month: 10, day: 23, label: 'ÁNH DƯƠNG RẠNG RỠ', orbit: 'SOLAR ORBIT', Icon: Sun }, { name: 'Mark Jiruntanin', month: 6, day: 15, label: 'ÁNH NGUYỆT DỊU ÊM', orbit: 'LUNAR ORBIT', Icon: Moon }].map(({ name, month, day, label, orbit, Icon }, index) => {
      const count = birthdayCountdown(month, day, now)
      return <article className={`birthday-card ${index ? 'lunar' : 'solar'}`} key={name}>
        <div className="birthday-heading"><span className="birthday-icon"><Icon size={24} /></span><div><small>{label}</small><h2>{name}</h2><p>Sinh nhật: {day} tháng {String(month).padStart(2, '0')}</p></div><span className="orbit-tag">{orbit}</span></div>
        <div className="birthday-bottom"><div>{count.today ? <strong className="birthday-today">Happy Birthday! ♡</strong> : <><strong>{count.days}</strong><span>NGÀY ĐẾN SINH NHẬT KẾ TIẾP<small>{String(count.hours).padStart(2, '0')} giờ : {String(count.minutes).padStart(2, '0')} phút : {String(count.seconds).padStart(2, '0')} giây</small></span></>}</div>
          <button onClick={() => saveBirthday(name, month, day, count.year)} aria-label={`Lưu sinh nhật ${name} vào lịch`}><CalendarPlus size={13} /> LƯU VÀO LỊCH</button>
        </div>
      </article>
    })}
  </section>
}
