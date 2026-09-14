import ThemeToggle from './ThemeToggle'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <h2>✧ The Celestial Record Store</h2>
            <p>
              Music from Mark, Stories from Junior, Guided by Jummo
              <br />
              under midnight constellations.
            </p>
          </div>
          <div className="footer-links">
            <a href="https://www.gmm-tv.com/" target="_blank" rel="noreferrer">
              GMMTV
            </a>
            <a href="https://www.youtube.com/@gmmtv" target="_blank" rel="noreferrer">
              YouTube
            </a>
            <a href="https://x.com/GMMTV" target="_blank" rel="noreferrer">
              X (Twitter)
            </a>
            <a href="https://open.spotify.com/search/JuniorMark" target="_blank" rel="noreferrer">
              Spotify
            </a>
            <ThemeToggle />
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} JuniorMark Fanclub. Crafted with starlight & love.</p>
          <p>Fansite không chính thức • Credit ảnh trong thư viện</p>
          <div className="footer-extra">
            <a href="#/profiles/junior">Liner Notes</a>
            <a href="#/studio?section=record-player">Cosmic Frequency</a>
            <a href="#/jummo">Jummo Mascot Lore</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
