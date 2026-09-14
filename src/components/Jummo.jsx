import { useState } from 'react'
import { BookOpen, Headphones, Heart, MessageCircle } from 'lucide-react'

const moods = [
  { title: 'Đang nghe nhạc (Lo-Fi Acoustic)', Icon: Headphones, quote: 'Xin chào bạn thương! Mình là Jummo đây. Hôm nay tiệm đĩa Celestial đang mở khúc ca nhẹ nhàng lắm, bạn đã uống một tách trà ấm chưa?' },
  { title: 'Đang đọc kịch bản & sách', Icon: BookOpen, quote: 'Một trang sách, một câu chuyện, một chút bình yên. Ngồi xuống cùng mình và lưu lại những khoảnh khắc bạn yêu nhé.' },
  { title: 'Gửi ngàn tim yêu (Fandom Vibe)', Icon: Heart, quote: 'Dù hôm nay thế nào, ở đây vẫn luôn có một góc nhỏ dành cho bạn. Cảm ơn vì đã cùng thương Junior & Mark!' },
]
export default function Jummo() {
  const [mood, setMood] = useState(0)
  return <section className="jummo-section panel" id="jummo" aria-labelledby="jummo-title">
    <div className="jummo-portrait"><img src="/images/jummo-mascot.png" alt="Jummo mặc bộ đồ xanh với mũ hướng dương vàng" loading="lazy" /><span>YOUR COSMIC COMPANION</span><h2 id="jummo-title">Jummo (Linh Vật Vũ Trụ)</h2><p>Bé bảo hộ đĩa than & nốt nhạc tình thân</p></div>
    <div className="jummo-content"><div className="jummo-bubble"><span className="eyebrow"><MessageCircle size={14} /> LỜI NHẮN TỪ JUMMO</span><p aria-live="polite">“{moods[mood].quote}”</p></div>
      <p className="eyebrow blue">CHỌN TÂM TRẠNG TRONG PHÒNG THU CÙNG HAI ANH:</p>
      <div className="mood-buttons">{moods.map(({ title, Icon }, index) => <button key={title} className={mood === index ? 'active' : ''} aria-pressed={mood === index} onClick={() => setMood(index)}><Icon size={16} />{title}</button>)}</div>
    </div>
  </section>
}
