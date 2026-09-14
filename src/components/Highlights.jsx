import { ArrowUpRight } from 'lucide-react'

const stories = [
  { image: '/images/fan-photos/HPWCyKybkAAHKUm.jpg', badge: 'JUMMO MOMENTS', title: 'Một bầu trời mang tên Jummo', text: 'Giữa những mảnh confetti, có một mặt trời nhỏ luôn ở cạnh chúng mình.', detail: 'Ảnh Jummo tại sự kiện được người dùng cung cấp. Một khoảnh khắc để lưu lại trong góc nhỏ của cộng đồng. Credit trên ảnh: BRACIB.', tag: 'OUR LITTLE SUNSHINE', color: 'pink' },
  { image: '/images/fan-photos/HNwgVKGbsAA2z-b.jpg', badge: 'TOGETHER ON STAGE', title: 'Một lời hứa, hai nụ cười', text: 'Những cái móc tay và ánh nhìn dịu dàng làm nên ký ức của JuniorMark.', detail: 'Ảnh JuniorMark móc tay trên sân khấu từ bộ ảnh người dùng cung cấp. Giữ nguyên ảnh gốc và watermark khi xem ảnh lớn trong gallery.', tag: 'JUNIORMARK MEMORY', color: 'gold' },
  { image: '/images/fan-photos/HNpnaOZbsAAGFbv.jpg', badge: 'COZY DAYS', title: 'Nắng ghé qua khung cửa', text: 'Một buổi sáng thật chậm, một khoảng trời ấm áp, và hai người bên nhau.', detail: 'Ảnh trong bộ trang phục trắng từ người dùng, có logo CITER trên ảnh. Bản gốc được giữ nguyên trong thư viện.', tag: 'PHOTO DIARY', color: 'blue' },
]
export default function Highlights({ openStory }) {
  return <section className="highlights-section" id="highlights" aria-labelledby="highlights-title">
    <div className="section-heading"><div><span className="eyebrow">✧ PHÒNG LƯU TRỮ & DỰ ÁN NGHỆ THUẬT</span><h2 id="highlights-title">Starry Highlights • Kỷ Niệm Tinh Tú</h2></div><p>Một góc biên tập những câu chuyện và tác phẩm<br />trong hành trình của Junior & Mark.</p></div>
    <div className="story-grid">{stories.map((story) => <article className="story-card" key={story.title}><div className="story-image"><img src={story.image} alt={`Ảnh minh họa bộ sưu tập ${story.title}`} loading="lazy" /><span className={`story-badge ${story.color}`}>{story.badge}</span></div><div className="story-body"><small>{story.tag}</small><h3>{story.title}</h3><p>{story.text}</p><button className="text-button" onClick={() => openStory(story)}>Khám phá bộ sưu tập <ArrowUpRight size={15} /></button></div></article>)}</div>
  </section>
}
