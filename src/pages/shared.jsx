import { t as tr, useLanguage, localize } from '../i18n/language'
import { catalog } from '../data/catalog'
import { useState } from 'react'
import { quizResult } from '../lib/archive'
import ShareCardButton from '../components/ShareCardButton'

export function PageIntro({ eyebrow, title, description, children }) {
  useLanguage()
  return (
    <header className="archive-intro">
      <div>
        <span className="eyebrow">{localize(eyebrow)}</span>
        <h1 tabIndex={-1}>{localize(title)}</h1>
        <p>{localize(description)}</p>
      </div>
      {children}
    </header>
  )
}
export function Chips({ label, options, value, onChange }) {
  useLanguage()
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map(([id, name]) => (
        <button type="button" key={id} aria-pressed={value === id} onClick={() => onChange(id)}>
          {localize(name)}
        </button>
      ))}
    </div>
  )
}
export function SectionTitle({ eyebrow, children }) {
  useLanguage()
  return (
    <div className="archive-heading">
      <span className="eyebrow">{localize(eyebrow)}</span>
      <h2>{children}</h2>
    </div>
  )
}
export function Empty({ children }) {
  useLanguage()
  return (
    <p className="empty-state" role="status">
      {children}
    </p>
  )
}
export function Tip({
  children,
  title = tr('Jummo nhắc bạn', 'A reminder from Jummo'),
  className = '',
  image = '/images/jummo-mascot.png',
}) {
  useLanguage()
  return (
    <aside className={`archive-tip ${className}`.trim()}>
      <img src={image} width="48" height="58" alt="Jummo" />
      <div>
        <b>{localize(title)}</b>
        <p>{children}</p>
      </div>
    </aside>
  )
}
export function Quiz() {
  useLanguage()
  const [answers, setAnswers] = useState([]),
    [result, setResult] = useState(false)
  const questions = catalog.quiz_questions.map((q) => localize(q.prompt))
  const choices = catalog.quiz_questions.map((q) =>
    [q.solar_choice, q.lunar_choice, q.jummo_choice].map(localize),
  )
  if (!questions.length) return <Empty>{tr('Chưa có câu hỏi.', 'No questions yet.')}</Empty>
  const title = [
    tr('Ánh Dương', 'Solar — Sunshine'),
    tr('Ánh Nguyệt', 'Lunar — Moonlight'),
    tr('Jummo — Hướng Dương', 'Jummo — Sunflower'),
  ][quizResult(answers)]
  return (
    <section className="archive-panel quiz-panel">
      <span className="eyebrow">
        {tr('TRẮC NGHIỆM TÂM HỒN TINH TÚ', 'CELESTIAL SOUL TEST • MINI QUIZ')}
      </span>
      <h2>{tr('Góc Sưu Tầm Thẻ Bài', 'Keepsake Card Collection')}</h2>
      {result ? (
        <>
          <img
            className="quiz-mascot"
            src="/images/jummo-mascot.png"
            alt={tr('Thẻ Jummo', 'Jummo card')}
          />
          <h3>{localize(title)}</h3>
          <p>{tr('Thẻ kỷ niệm vui dành riêng cho bạn.', 'A fun keepsake card just for you.')}</p>
          <ShareCardButton
            card={{
              title,
              subtitle: tr('Tâm Hồn Tinh Tú · Thẻ trắc nghiệm', 'Celestial Soul · Quiz keepsake'),
              lines: [
                tr('Thẻ kỷ niệm vui dành riêng cho bạn.', 'A fun keepsake card just for you.'),
              ],
            }}
            filename="jummo-quiz"
            label={tr('Lưu thẻ kỷ niệm PNG', 'Save keepsake PNG')}
          />
          <button
            className="text-button"
            onClick={() => {
              setAnswers([])
              setResult(false)
            }}
          >
            {' '}
            {tr('Làm lại', 'Try again')}{' '}
          </button>
        </>
      ) : (
        <>
          <p>
            {tr('Câu hỏi', 'Question')} {answers.length + 1}/{questions.length}
          </p>
          <h3>{questions[answers.length]}</h3>
          <div className="quiz-options">
            {choices[answers.length].map((c, i) => (
              <button
                key={c}
                onClick={() => {
                  const next = [...answers, i]
                  setAnswers(next)
                  if (next.length === questions.length) setResult(true)
                }}
              >
                {String.fromCharCode(65 + i)} · {c}
              </button>
            ))}
          </div>
          <progress max={questions.length} value={answers.length} />
        </>
      )}
    </section>
  )
}
