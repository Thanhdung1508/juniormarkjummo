import { t, useLanguage, localize } from '../i18n/language'
import { catalog } from '../data/catalog'
import { useEffect, useState } from 'react'
import { CalendarPlus, Moon, Sun } from 'lucide-react'
import { birthdayCountdown } from '../lib/helpers'

// File lịch là sự kiện cả ngày, lặp hàng năm; không yêu cầu quyền truy cập lịch cá nhân.
function saveBirthday(name, month, day, year) {
  const date = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//JuniorMark Fansite//Birthday//VI', 'BEGIN:VEVENT', `UID:birthday-${name.toLowerCase().replaceAll(' ', '-')}@juniormark-fansite`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${date}`, 'DURATION:P1D', 'RRULE:FREQ=YEARLY', `SUMMARY:${t('Chúc mừng sinh nhật', 'Happy Birthday')} ${name}`, 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = `${name}-birthday.ics`; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function Birthdays() {
  useLanguage()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const interval = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(interval) }, [])
  return <section className="birthday-grid" id="profiles" aria-label={t("Sinh nhật Junior và Mark", "Junior and Mark birthdays")}>
    {catalog.artists.filter(a => a.birthday).map(a => ({ name: a.name, month: Number(a.birthday.slice(5,7)), day: Number(a.birthday.slice(8,10)), label: a.label, orbit: a.role_label, Icon: a.id === 'junior' ? Sun : Moon })).map(({ name, month, day, label, orbit, Icon }, index) => {
      const count = birthdayCountdown(month, day, now)
      return <article className={`birthday-card ${index ? 'lunar' : 'solar'}`} key={name}>
        <div className="birthday-heading"><span className="birthday-icon"><Icon size={24} /></span><div><small>{localize(label)}</small><h2>{name}</h2><p>{t(`Sinh nhật: ${day} tháng ${String(month).padStart(2, '0')}`, `Birthday: ${day}/${String(month).padStart(2, '0')}`)}</p></div><span className="orbit-tag">{localize(orbit)}</span></div>
        <div className="birthday-bottom"><div>{count.today ? <strong className="birthday-today">{t("Chúc mừng sinh nhật! ♡", "Happy Birthday! ♡")}</strong> : <><strong>{count.days}</strong><span>{t("NGÀY ĐẾN SINH NHẬT KẾ TIẾP", "DAYS UNTIL THE NEXT BIRTHDAY")}<small>{String(count.hours).padStart(2, '0')} {t('giờ', 'hr')} : {String(count.minutes).padStart(2, '0')} {t('phút', 'min')} : {String(count.seconds).padStart(2, '0')} {t('giây', 'sec')}</small></span></>}</div>
          <button onClick={() => saveBirthday(name, month, day, count.year)} aria-label={t(`Lưu sinh nhật ${name} vào lịch`, `Save ${name}’s birthday to calendar`)}><CalendarPlus size={13} /> {t("LƯU VÀO LỊCH", "SAVE TO CALENDAR")}</button>
        </div>
      </article>
    })}
  </section>
}
