import { t, useLanguage } from '../i18n/language'
import { catalog } from '../data/catalog'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './RecordPlayer.css'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle } from 'lucide-react'

const tracks = catalog.tracks.map(t => ({ title: t.title, artist: t.subtitle, audioSrc: t.audio_url, album: 'JuniorMark • Sun & Moon', artwork: '/images/fan-photos/HNwNJ4GbsAE5PwW.jpg', spotifyUrl: t.source_url || 'https://open.spotify.com/search/' + encodeURIComponent(t.title) }))
const formatTime = (value) => Number.isFinite(value) ? `${Math.floor(value / 60).toString().padStart(2, '0')}:${Math.floor(value % 60).toString().padStart(2, '0')}` : '--:--'

// App owns this instance. Only the hero UI is portaled into the Studio route.
// An omitted target also supports rendering the player on its own.
export default function RecordPlayer(props) {
  useLanguage()
  return tracks.length ? <Player {...props} /> : <p>{t("Chưa có bản nhạc.", "No tracks yet.")}</p>
}
function Player({ heroTarget } = {}) {
  const { language } = useLanguage()
  const [selected, setSelected] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState('')
  const [showMini, setShowMini] = useState(false)
  const audio = useRef(null)
  const card = useRef(null)
  const active = useRef(0)
  const request = useRef(0)
  const wantsPlay = useRef(false)
  const track = tracks[selected]

  useEffect(() => {
    const element = audio.current
    const stop = () => {
      request.current++
      wantsPlay.current = false
      if (!element.paused) element.pause()
    }
    element.volume = 0.7
    return stop
  }, [])

  useEffect(() => {
    const update = () => setShowMini(!card.current || card.current.getBoundingClientRect().bottom <= 0)
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    if (card.current) observer?.observe(card.current)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      observer?.disconnect()
    }
  }, [heroTarget])

  const playAudio = useCallback(async () => {
    const token = ++request.current
    wantsPlay.current = true
    setError('')
    try { await audio.current.play() }
    catch {
      if (token !== request.current) return
      wantsPlay.current = false
      setPlaying(false)
      setError('playback-error')
    }
  }, [])
  const pauseAudio = useCallback(() => {
    request.current++
    wantsPlay.current = false
    audio.current.pause()
    setPlaying(false)
  }, [])
  const selectTrack = useCallback((index) => {
    request.current++
    audio.current.pause()
    active.current = (index + tracks.length) % tracks.length
    setSelected(active.current)
    setPlaying(false)
    setElapsed(0)
    setDuration(0)
    // Set source and play inside the user gesture for mobile browsers.
    audio.current.src = tracks[active.current].audioSrc
    audio.current.load()
    void playAudio()
  }, [playAudio])
  function togglePlay() {
    if (wantsPlay.current) {
      pauseAudio()
    } else void playAudio()
  }
  useEffect(() => {
    const session = navigator.mediaSession
    if (!session || typeof session.setActionHandler !== 'function') return
    const handlers = {
      play: () => { void playAudio() },
      pause: pauseAudio,
      previoustrack: () => selectTrack(active.current - 1),
      nexttrack: () => selectTrack(active.current + 1),
    }
    const registered = []
    for (const [action, handler] of Object.entries(handlers)) {
      // Browsers may expose Media Session but only support some actions.
      try { session.setActionHandler(action, handler); registered.push(action) } catch { /* optional API */ }
    }
    return () => {
      for (const action of registered) {
        try { session.setActionHandler(action, null) } catch { /* optional API */ }
      }
      session.metadata = null
      session.playbackState = 'none'
    }
  }, [playAudio, pauseAudio, selectTrack])

  useEffect(() => {
    if (!navigator.mediaSession || typeof MediaMetadata === 'undefined') return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: t('JuniorMark • Mặt trời & Mặt trăng', 'JuniorMark • Sun & Moon'),
      artwork: [{ src: new URL(track.artwork, window.location.href).href, type: 'image/jpeg' }],
    })
  }, [track, language])

  useEffect(() => {
    if (navigator.mediaSession) navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'
  }, [playing])

  function seek(event) {
    const time = Math.min(duration, Math.max(0, Number(event.target.value)))
    audio.current.currentTime = time
    setElapsed(time)
  }
  function changeVolume(event) {
    const value = Number(event.target.value)
    audio.current.volume = value
    audio.current.muted = false
    setVolume(value)
    setMuted(false)
  }
  function progress(prefix) {
    return <div className="scrubber">
      <label className="sr-only" htmlFor={`${prefix}-progress`}>{t("Vị trí phát nhạc", "Playback position")}</label>
      <input id={`${prefix}-progress`} type="range" min="0" max={duration || 1} step="0.1" value={Math.min(elapsed, duration || 0)} disabled={!duration} onChange={seek} />
      <div><span>{formatTime(elapsed)}</span><span>{t("♫ ĐANG PHÁT", "♫ NOW PLAYING")}</span><span>{formatTime(duration)}</span></div>
    </div>
  }
  function controls() {
    return <div className="player-controls">
      <button className="round-button" aria-label={t("Bản trước", "Previous track")} onClick={() => selectTrack(active.current - 1)}><SkipBack size={19} /></button>
      <button className="round-button play-button" aria-label={playing ? t('Tạm dừng', 'Pause') : t('Phát nhạc', 'Play music')} onClick={togglePlay}>{playing ? <Pause size={24} /> : <Play size={24} />}</button>
      <button className="round-button" aria-label={t("Bản tiếp theo", "Next track")} onClick={() => selectTrack(active.current + 1)}><SkipForward size={19} /></button>
    </div>
  }
  function volumeControl(prefix) {
    return <div className="music-volume">
      <button className="round-button small" aria-label={muted ? t('Bật âm thanh', 'Unmute') : t('Tắt âm thanh', 'Mute')} aria-pressed={muted} onClick={() => { audio.current.muted = !muted; setMuted(!muted) }}>{muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
      <label className="sr-only" htmlFor={`${prefix}-volume`}>{t("Âm lượng", "Volume")}</label>
      <input id={`${prefix}-volume`} type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume} onChange={changeVolume} />
    </div>
  }
  const hero =
    <section ref={card} className="record-console panel" id={heroTarget === undefined ? 'record-player' : undefined} aria-label={t("Góc âm nhạc", "Music corner")}>
      <div className="turntable">
        <div className="album-sleeve"><img src="/images/fan-photos/HNwNJ4GbsAE5PwW.jpg" alt={t("JuniorMark trên bìa đĩa", "JuniorMark on the record sleeve")} loading="lazy" /></div>
        <div className={`vinyl ${playing ? 'playing' : ''}`} aria-hidden="true"><div className="vinyl-label"><span>{t("MẶT A • 33 VÒNG/PHÚT", "SIDE A • 33 RPM")}</span><strong>JuniorMark</strong><small>{t("MẶT TRỜI & MẶT TRĂNG", "SUN & MOON")}</small><i /></div></div>
        <div className={`tonearm ${playing ? 'playing' : ''}`} aria-hidden="true"><i /></div>
        <div className="turntable-meta"><span>{t("● TRÁI TIM MỘC • TÂM HỒN SỐ", "● ANALOG HEART • DIGITAL SOUL")}</span><span>{t("PHIÊN BẢN MẶT TRỜI & MẶT TRĂNG", "SUN & MOON SPECIAL")}</span></div>
      </div>
      <div className="player-details">
        <span className="eyebrow">{t('BẢN NHẠC TINH TÚ #', 'CONSTELLATION TRACK #')}{String(selected + 1).padStart(2, '0')}</span>
        <h2>{track.title}</h2><p className="muted">{track.artist}</p>
        {progress('hero')}
        <div className="music-actions">{controls()}<button className="round-button small" aria-label={t("Chọn bản ngẫu nhiên", "Choose a random track")} onClick={() => selectTrack(active.current + 1 + Math.floor(Math.random() * (tracks.length - 1)))}><Shuffle size={18} /></button>{volumeControl('hero')}</div>
        <p className="player-note" role="status">{error ? t('Không thể phát âm thanh. Vui lòng bấm Phát nhạc để thử lại.', 'Unable to play audio. Please press Play to try again.') : t('Giai điệu dành cho những khoảnh khắc của chúng mình.', 'Melodies for the moments we share.')}</p>
        <span className="eyebrow tracklist-title">{t("DANH SÁCH NHẠC GIỮA TRỜI SAO", "CELESTIAL TAPE DECK TRACKLIST")}</span>
        <div className="tracklist music-tracklist">{tracks.map((item, index) => <div className="music-track" key={item.title}>
          <button aria-pressed={index === selected} className={index === selected ? 'selected' : ''} onClick={() => selectTrack(index)}><span>♫ {String(index + 1).padStart(2, '0')}. {item.title}<small>{item.artist}</small></span><span>♫</span></button>
          <a href={item.spotifyUrl} target="_blank" rel="noreferrer" aria-label={t(`Tìm ${item.title} trên Spotify`, `Find ${item.title} on Spotify`)}>Spotify ↗</a>
        </div>)}</div>
      </div>
    </section>

  return <>
    {heroTarget === undefined ? hero : heroTarget ? createPortal(hero, heroTarget) : null}
    <audio ref={audio} src={tracks[0].audioSrc} preload="auto"
        onPlaying={() => { wantsPlay.current = true; setPlaying(true) }}
        onPause={() => {
          // Ignore an old queued pause if a new source is already playing.
          if (!audio.current.paused) return
          wantsPlay.current = false
          setPlaying(false)
        }} onWaiting={() => setPlaying(false)}
        onEnded={() => selectTrack(active.current + 1)}
        onTimeUpdate={() => setElapsed(audio.current.currentTime)}
        onDurationChange={() => setDuration(Number.isFinite(audio.current.duration) ? audio.current.duration : 0)}
        onLoadedMetadata={() => setDuration(Number.isFinite(audio.current.duration) ? audio.current.duration : 0)}
        onError={() => { wantsPlay.current = false; setPlaying(false); setError('playback-error') }} />
    {showMini && createPortal(<><section className="music-mini" aria-label={t("Trình phát thu nhỏ", "Mini player")}>
      <div className="music-mini-info"><img src="/images/fan-photos/HNwNJ4GbsAE5PwW.jpg" alt="" /><div><strong>{track.title}</strong><small>{track.artist}</small><span>{error ? t('Không thể phát âm thanh. Vui lòng thử lại.', 'Unable to play audio. Please try again.') : (playing ? t('Đang phát', 'Playing') : t('Sẵn sàng phát', 'Ready to play'))}</span></div></div>
      <div className="music-mini-playback">{controls()}{progress('mini')}</div>
      {volumeControl('mini')}
    </section><div className="music-mini-spacer" aria-hidden="true" /></>, document.body)}
  </>
}
