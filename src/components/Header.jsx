import { useState } from 'react'
import { Disc3, Menu, UserRound, X } from 'lucide-react'

const links = [
  ['Studio', '#/studio'],
  ['Profiles', '#/profiles'],
  ['Timeline', '#/timeline'],
  ['Media Hub', '#/media'],
  ['Schedule', '#/schedule'],
  ['Starry Sky', '#/sky'],
  ['Jummo World', '#/jummo'],
  ['Fan Projects', '#/projects'],
]

export default function Header({ auth, openAuth, openAccount, route = 'studio' }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <header className="header-wrap">
      <div className="site-header">
        <a className="brand" href="#/studio" aria-label="JuniorMark — Trang chủ">
          <span className="brand-logo">
            <img src="/images/juniormark-logo.png" width="36" height="36" alt="" />
          </span>
          <span>
            <strong>JuniorMark</strong>
            <small>CELESTIAL RECORD STORE & STUDIO</small>
          </span>
        </a>
        <nav
          className={expanded ? 'main-nav expanded' : 'main-nav'}
          id="main-nav"
          aria-label="Điều hướng chính"
        >
          {links.map(([label, href]) => (
            <a
              key={href}
              className={route.split('/')[0] === href.slice(2) ? 'nav-home' : ''}
              aria-current={route.split('/')[0] === href.slice(2) ? 'page' : undefined}
              href={href}
              onClick={() => setExpanded(false)}
            >
              {label}
            </a>
          ))}
        </nav>
        <a href="#/studio?section=record-player" className="mini-ost" aria-label="Đến góc âm nhạc">
          <Disc3 size={17} />
          <span>
            <b>Cozy Night OST</b>
            <small>JuniorMark's corner</small>
          </span>
          <span className="equalizer" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </a>
        <button
          className="account-button"
          aria-label={
            auth.loading ? 'Đang tải tài khoản' : auth.session ? 'Tài khoản' : 'Đăng nhập'
          }
          disabled={auth.loading}
          onClick={auth.session ? openAccount : () => openAuth('signin')}
        >
          <UserRound size={16} />
          <span>{auth.loading ? 'Đang tải…' : auth.session ? 'Tài khoản' : 'Đăng nhập'}</span>
        </button>
        <button
          className="icon-button menu-button"
          aria-label={expanded ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={expanded}
          aria-controls="main-nav"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  )
}
