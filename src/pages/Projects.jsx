import { t as tr, useLanguage, localize } from '../i18n/language'
import { catalog } from '../data/catalog'
import { useState } from 'react'
import { normalize, downloadText } from '../lib/archive'
import { Empty, PageIntro, SectionTitle, Tip } from './shared'
import { memories } from '../data/memories'
import ShareCardButton from '../components/ShareCardButton'
const glossary = catalog.glossary.map((e) => [e.title, e.body])
const checklist = catalog.checklist_items.map((e) => e.label)
export default function Projects({ showInfo }) {
  const { locale } = useLanguage()
  // Tracker là dữ liệu mẫu. Checklist và chứng nhận chạy cục bộ, không nhận quyên góp.
  const [query, setQuery] = useState(''),
    [checked, setChecked] = useState([]),
    [name, setName] = useState(''),
    [certificate, setCertificate] = useState(false),
    [copy, setCopy] = useState(''),
    [tweet, setTweet] = useState(null)
  const projects = catalog.projects.map((p) => {
    const amount = catalog.project_entries
      .filter((e) => e.project_id === p.id)
      .reduce((sum, e) => sum + Number(e.amount), 0)
    return [
      p.title,
      p.goal_amount ? Math.round((amount / p.goal_amount) * 100) : 0,
      amount,
      Number(p.goal_amount),
    ]
  })
  const terms = glossary
    .map((entry) => entry.map(localize))
    .filter((t) => normalize(t.join(' ')).includes(normalize(query)))
  async function copyText() {
    try {
      await navigator.clipboard.writeText(
        tweet ??
          tr(
            'Một ngày thật ấm áp cùng Junior & Mark 💛 #JuniorMark',
            'A warm day with Junior & Mark 💛 #JuniorMark',
          ),
      )
      setCopy(tr('Đã sao chép nội dung.', 'Copied.'))
    } catch {
      setCopy(
        tr(
          'Không sao chép tự động được; bạn có thể chọn nội dung trong ô để sao chép.',
          'Automatic copying failed; select the text in the box to copy it.',
        ),
      )
    }
  }
  return (
    <>
      <PageIntro
        eyebrow={tr('TRẠM CỘNG ĐỒNG TINH TÚ', 'CELESTIAL COMMUNITY HUB')}
        title={tr('Trạm Người Hâm Mộ', 'Fan Hub')}
        description={tr(
          'Một trạm nhỏ để tìm hiểu fandom, theo dõi các dự án và bắt đầu hành trình của bạn.',
          'A little hub to learn about the fandom, follow projects and begin your journey.',
        )}
      >
        <Tip>
          {tr(
            'Cùng tìm hiểu và cổ vũ theo nhịp riêng của bạn.',
            'Learn and show support at your own pace.',
          )}
        </Tip>
      </PageIntro>
      <nav className="page-jump">
        <a href="#/projects?section=tracker">{tr('Dự Án Người Hâm Mộ', 'Fan Projects')}</a>
        <a href="#/projects?section=guide">
          {tr('Cẩm Nang Người Mới / Từ Điển', 'New Fan Guide / Glossary')}
        </a>
        <a href="#/projects?section=vote">{tr('Hướng Dẫn Cổ Vũ', 'Support Guide')}</a>
        <a href="#/projects?section=pass">
          {tr('Người Mới / Thẻ Tinh Tú', 'Baby Fan / Celestial Pass')}
        </a>
      </nav>
      <section id="tracker">
        <SectionTitle
          eyebrow={tr('Dự án người hâm mộ · Ý tưởng minh họa', 'Fan Projects · Demo concepts only')}
        >
          {' '}
          {tr('Dự Án Người Hâm Mộ · Theo Dõi Dự Án', 'Fan Projects · Project Tracker')}{' '}
        </SectionTitle>
        <p className="notice">
          {' '}
          {tr(
            'Các thẻ có nhãn MINH HỌA chỉ thể hiện ý tưởng thiết kế. Website chưa mở quyên góp, không nhận tiền.',
            'Cards marked DEMO illustrate design concepts. This website does not accept donations or payments.',
          )}{' '}
        </p>
        <div className="three-columns">
          {projects.map(([title, progress, amount, goal], i) => (
            <article className="archive-panel project-card" key={localize(title)}>
              <img
                src={catalog.projects[i].image}
                alt={tr('Ảnh minh họa dự án', 'Project illustration')}
              />
              <span className="eyebrow">
                {catalog.projects[i].is_demo
                  ? tr('MINH HỌA • DỰ ÁN MẪU', 'DEMO / SAMPLE • SAMPLE PROJECT')
                  : tr('DỰ ÁN', 'PROJECT')}{' '}
                • {progress}%
              </span>
              <h3>{localize(title)}</h3>
              <progress max="100" value={progress} />
              <p>
                {amount.toLocaleString(locale)} / {goal.toLocaleString(locale)}đ
              </p>
              <button
                className="secondary-button"
                onClick={() =>
                  showInfo(
                    title,
                    catalog.projects[i].is_demo
                      ? tr(
                          'Đây là thẻ minh họa trong thiết kế. Không có giao dịch nào được thực hiện.',
                          'This is a design demonstration card. No transaction takes place.',
                        )
                      : localize(catalog.projects[i].description),
                  )
                }
              >
                {' '}
                {tr('Xem thông tin', 'View information')}{' '}
              </button>
            </article>
          ))}
        </div>
      </section>
      <section id="guide">
        <SectionTitle
          eyebrow={tr('CẨM NANG VÀ TỪ ĐIỂN NGƯỜI HÂM MỘ', 'FAN STARTER KIT & ENCYCLOPEDIA')}
        >
          {' '}
          {tr('Cẩm Nang Nhập Môn Cho Người Hâm Mộ Mới', 'Baby Fan Guide: Getting Started')}{' '}
        </SectionTitle>
        <div className="archive-panel">
          <h3>{tr('Từ Điển Fandom & Giải Mã Thuật Ngữ', 'Fandom Dictionary & Terminology')}</h3>
          <label className="search-field">
            {' '}
            {tr('Tìm biệt danh / thuật ngữ', 'Search nicknames / terms')}{' '}
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Jummo, OST…"
            />
          </label>
          <div className="three-columns">
            {terms.map(([title, body]) => (
              <article className="glossary-card" key={localize(title)}>
                <h3>{localize(title)}</h3>
                <p>{localize(body)}</p>
              </article>
            ))}
          </div>
          {!terms.length && (
            <Empty>{tr('Chưa tìm thấy thuật ngữ phù hợp.', 'No matching terms found.')}</Empty>
          )}
        </div>
      </section>
      <div className="two-columns">
        <section className="archive-panel" id="vote">
          <SectionTitle eyebrow={tr('Hướng Dẫn Cổ Vũ', 'Support Guide')}>
            {tr('Hướng Dẫn Bình Chọn', 'Voting Guide')}
          </SectionTitle>
          <a className="text-button" href="#/projects?section=stream">
            {tr('Xem Video & Xu Hướng X ↗', 'Streaming & Trend X ↗')}
          </a>
          <p>
            {' '}
            {tr(
              'Chưa có cuộc bình chọn được xác minh trong hệ thống. Khi tham gia, đọc điều lệ và giới hạn lượt tại cổng chính thức của từng giải.',
              'No verified voting campaigns are available. Before participating, read the rules and vote limits on each award’s official site.',
            )}{' '}
          </p>
          <div className="checklist">
            {checklist.map((text, i) => (
              <label key={localize(text)}>
                <input
                  type="checkbox"
                  checked={checked.includes(i)}
                  onChange={() =>
                    setChecked((c) => (c.includes(i) ? c.filter((n) => n !== i) : [...c, i]))
                  }
                />
                {localize(text)}
              </label>
            ))}
          </div>
          <button
            className="secondary-button"
            onClick={() =>
              downloadText(
                'baby-fan-checklist.txt',
                checklist
                  .map((t, i) => `${checked.includes(i) ? '[x]' : '[ ]'} ${localize(t)}`)
                  .join('\n'),
              )
            }
          >
            {' '}
            {tr('Tải danh sách việc cần làm ↓', 'Download checklist ↓')}{' '}
          </button>
        </section>
        <section className="archive-panel" id="stream">
          <SectionTitle eyebrow={tr('XEM VIDEO VÀ XU HƯỚNG X', 'STREAMING & TREND X')}>
            {tr('Cổ Vũ Bằng Giai Điệu Của Bạn', 'Support with Your Own Melody')}
          </SectionTitle>
          <p>
            {' '}
            {tr(
              'Xem video từ nguồn chính thức, tương tác tự nhiên và tôn trọng quy định của nền tảng. Không có công thức đảm bảo lượt xem hoặc thứ hạng.',
              'Watch official videos, interact naturally and respect platform rules. No formula guarantees views or rankings.',
            )}{' '}
          </p>
          <a
            className="secondary-button"
            href="https://www.youtube.com/@gmmtv"
            target="_blank"
            rel="noreferrer"
          >
            {' '}
            {tr('Mở kênh GMMTV ↗', 'Open the GMMTV channel ↗')}{' '}
          </a>
          <label className="search-field">
            {' '}
            {tr('Soạn lời cổ vũ', 'Write your support message')}{' '}
            <textarea
              value={
                tweet ??
                tr(
                  'Một ngày thật ấm áp cùng Junior & Mark 💛 #JuniorMark',
                  'A warm day with Junior & Mark 💛 #JuniorMark',
                )
              }
              maxLength={280}
              onChange={(e) => setTweet(e.target.value)}
              rows={4}
            />
          </label>
          <button className="primary-button" onClick={copyText}>
            {' '}
            {tr('Sao chép lời cổ vũ', 'Copy support message')}{' '}
          </button>
          <p role="status">{localize(copy)}</p>
          <small>
            {tr('Nội dung chưa được đăng lên X.', 'This content has not been posted to X.')}
          </small>
        </section>
      </div>
      <SectionTitle eyebrow={tr('TRỌN BỘ KỶ NGUYÊN', 'ALL ERAS')}>
        {tr('Lộ Trình Khám Phá JuniorMark', 'Your JuniorMark Discovery Journey')}
      </SectionTitle>
      <div className="three-columns">
        {memories.map((memory) => (
          <a className="archive-panel" href={`#/timeline?era=${memory.era}`} key={memory.id}>
            <h3>{memory.title}</h3>
            <p>
              {tr(
                'Khám phá cột mốc và ảnh trong kho lưu trữ →',
                'Explore milestones and archive photos →',
              )}
            </p>
          </a>
        ))}
      </div>
      <section className="archive-panel graduation" id="pass">
        <div>
          <SectionTitle eyebrow={tr('THẺ TINH TÚ JUMMO', 'JUMMO CELESTIAL PASS')}>
            {tr('Nhận Huy Hiệu Người Hâm Mộ Mới', 'Get Your New Fan Badge')}
          </SectionTitle>
          <p>
            {tr(
              'Hoàn thành danh sách phía trên và ghi tên để nhận thẻ kỷ niệm của fansite.',
              'Complete the checklist above and enter your name to receive a fansite keepsake card.',
            )}
          </p>
          <label className="search-field">
            {' '}
            {tr('Tên trên thẻ', 'Name on card')}{' '}
            <input
              value={name}
              maxLength={50}
              onChange={(e) => {
                setName(e.target.value)
                setCertificate(false)
              }}
            />
          </label>
          <button
            className="primary-button"
            disabled={checked.length !== checklist.length || name.trim().length < 2}
            onClick={() => setCertificate(true)}
          >
            {' '}
            {tr('Tạo thẻ kỷ niệm fansite', 'Create fansite keepsake card')}{' '}
          </button>
        </div>
        <div className="certificate">
          <img
            src="/images/jummo-mascot.png"
            alt={tr('Jummo trên thẻ kỷ niệm', 'Jummo on a keepsake card')}
          />
          <span className="eyebrow">{tr('THẺ TINH TÚ JUMMO', 'JUMMO CELESTIAL PASS')}</span>
          <h3>{certificate ? name.trim() : tr('Người Hâm Mộ Mới Danh Dự', 'Honorary New Fan')}</h3>
          <p>
            {certificate
              ? tr('Đã hoàn thành danh sách', 'Checklist completed')
              : tr('Chờ hoàn thành danh sách', 'Waiting for checklist completion')}
          </p>
          <small>
            {tr(
              'Thẻ kỷ niệm của fansite, không phải chứng nhận chính thức.',
              'A fansite keepsake, not an official certificate.',
            )}
          </small>
          {certificate && (
            <ShareCardButton
              card={{
                title: name.trim(),
                subtitle: tr(
                  'Người Hâm Mộ Mới · Thẻ Tinh Tú Jummo',
                  'Baby Fan · Jummo Celestial Pass',
                ),
                lines: [
                  tr('Đã hoàn thành danh sách nhập môn.', 'Completed the Baby Fan checklist.'),
                  tr(
                    'Thẻ kỷ niệm của fansite, không phải chứng nhận chính thức.',
                    'A fansite keepsake, not an official certificate.',
                  ),
                ],
              }}
              filename="baby-fan-pass"
              label={tr('Lưu thẻ PNG ↓', 'Save PNG card ↓')}
            />
          )}
        </div>
      </section>
    </>
  )
}
