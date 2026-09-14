export default function Hero() {
  return <section className="hero-section" id="studio" aria-labelledby="home-title">
    <div className="eyebrow-pill"><img src="/images/figma/96c9d.svg" width="12" height="14" alt="" /> MIDNIGHT FREQUENCY • 432 HZ STUDIO ROOM</div>
    <h1 id="home-title">THE CELESTIAL RECORD STORE</h1>
    <p className="hero-subtitle">Music from Mark, Stories from Junior<br className="mobile-break" /> • Guided by Jummo under starry skies</p>
    <div className="hero-labels"><span>ACOUSTIC SESSION</span><i /><span>LATE NIGHT ANALOG TAPE</span><i /><span>BANGKOK • GMMTV ORBIT</span></div>
    <div className="hero-photos">
      <a className="hero-photo gold-photo" href="#/profiles">
        <img className="photo" src="/images/fan-photos/HNwNJ4GbsAE5PwW.jpg" alt="JuniorMark trong căn phòng với ánh đèn vàng ấm" fetchPriority="high" />
        <span className="photo-badge"><img src="/images/figma/08e36.svg" alt="" /> THE CELESTIAL DUO</span>
        <div className="photo-caption"><small>IN OUR WARM LITTLE WORLD</small><h2>Junior & Mark</h2><p>Ánh Dương & Ánh Nguyệt • Voice of Destiny</p></div>
        <span className="photo-tag">✦ Main Stars</span>
      </a>
      <a className="hero-photo blue-photo" href="#/media">
        <img className="photo" src="/images/fan-photos/HNpnaOZbsAAGFbv.jpg" alt="JuniorMark bên cửa sổ trong bộ ảnh trang phục trắng" fetchPriority="high" />
        <span className="photo-badge"><img src="/images/figma/cfeb0.svg" alt="" /> STUDIO BACKSTAGE LIFE</span>
        <div className="photo-caption"><small>COZY MOMENTS & SUNLIGHT</small><h2>Panachai & Jiruntanin</h2><p>Một chút bình yên, một khoảng trời chung</p></div>
      </a>
    </div>
  </section>
}

