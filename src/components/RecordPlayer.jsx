import { useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'

// Các tiêu đề trong bản thiết kế là nội dung mẫu. Thêm audioSrc khi có bản thu được phép sử dụng.
const tracks = [
  { title: 'Warm Whisper', subtitle: 'Cherry Magic • Acoustic mood', audioSrc: '' },
  { title: 'Acoustic Starlight', subtitle: 'Midnight Session', audioSrc: '' },
  { title: 'Our Sunnymoon', subtitle: 'Acoustic Live', audioSrc: '' },
]
const formatTime = (value) => Number.isFinite(value) ? `${Math.floor(value / 60).toString().padStart(2, '0')}:${Math.floor(value % 60).toString().padStart(2, '0')}` : '--:--'

export default function RecordPlayer() {
  const [selected, setSelected] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState('')
  const audio = useRef(null)
  const track = tracks[selected]
  function selectTrack(index) {
    audio.current?.pause()
    setSelected(index); setPlaying(false); setElapsed(0); setDuration(0); setError('')
  }
  async function togglePlay() {
    if (!track.audioSrc) return
    if (playing) audio.current.pause()
    else {
      try { await audio.current.play(); setError('') }
      catch { setError('Chưa thể phát bản thu này. Vui lòng thử lại.') }
    }
  }
  return <section className="record-console panel" id="record-player" aria-label="Góc âm nhạc">
    <div className="turntable">
      <div className="album-sleeve"><img src="/images/fan-photos/HNwNJ4GbsAE5PwW.jpg" alt="JuniorMark trên bìa đĩa" loading="lazy" /></div>
      <div className={`vinyl ${playing ? 'playing' : ''}`} aria-hidden="true"><div className="vinyl-label"><span>SIDE A • 33 RPM</span><strong>JuniorMark</strong><small>SUN & MOON</small><i /></div></div>
      <div className={`tonearm ${playing ? 'playing' : ''}`} aria-hidden="true"><i /></div>
      <div className="turntable-meta"><span>● ANALOG HEART • DIGITAL SOUL</span><span>SUN & MOON SPECIAL</span></div>
    </div>
    <div className="player-details">
      <span className="eyebrow">CONSTELLATION TRACK #{String(selected + 1).padStart(2, '0')}</span>
      <h2>{track.title}</h2><p className="muted">Junior & Mark • {track.subtitle}</p>
      <div className="scrubber">
        <label className="sr-only" htmlFor="audio-progress">Vị trí phát nhạc</label>
        <input id="audio-progress" type="range" min="0" max={duration || 1} value={elapsed} disabled={!track.audioSrc || !duration}
               onChange={(event) => { audio.current.currentTime = Number(event.target.value); setElapsed(Number(event.target.value)) }} />
        <div><span>{track.audioSrc ? formatTime(elapsed) : '--:--'}</span><span>✦ STEREO MOOD</span><span>{track.audioSrc ? formatTime(duration) : '--:--'}</span></div>
      </div>
      <div className="player-controls">
        <button className="round-button" aria-label="Bản trước" onClick={() => selectTrack((selected + tracks.length - 1) % tracks.length)}><img src="/images/figma/caba5.svg" alt="" /></button>
        <button className="round-button play-button" aria-label={playing ? 'Tạm dừng' : 'Phát nhạc'} disabled={!track.audioSrc} onClick={togglePlay}>{playing ? <Pause size={24} /> : <Play size={24} />}</button>
        <button className="round-button" aria-label="Bản tiếp theo" onClick={() => selectTrack((selected + 1) % tracks.length)}><img src="/images/figma/6b5ce.svg" alt="" /></button>
        <button className="round-button small" aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'} aria-pressed={muted} disabled={!track.audioSrc} onClick={() => setMuted(!muted)}><img src="/images/figma/ddc61.svg" alt="" /></button>
        <button className="round-button small" aria-label="Chọn bản ngẫu nhiên" onClick={() => selectTrack((selected + 1 + Math.floor(Math.random() * (tracks.length - 1))) % tracks.length)}><img src="/images/figma/6b655.svg" alt="" /></button>
      </div>
      <p className="player-note" role="status">{error || (!track.audioSrc && 'Playlist từ bản thiết kế • Bản thu sẽ được bổ sung sau.')}</p>
      <span className="eyebrow tracklist-title">CELESTIAL TAPE DECK TRACKLIST</span>
      <div className="tracklist">{tracks.map((item, index) => <button key={item.title} aria-pressed={index === selected} className={index === selected ? 'selected' : ''} onClick={() => selectTrack(index)}><span>♫ {String(index + 1).padStart(2, '0')}. {item.title}</span><span>ACOUSTIC</span></button>)}</div>
    </div>
    <audio ref={audio} src={track.audioSrc || undefined} muted={muted} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
           onTimeUpdate={() => setElapsed(audio.current.currentTime)} onLoadedMetadata={() => setDuration(audio.current.duration)} onError={() => { setPlaying(false); setError('Bản thu chưa tải được. Vui lòng thử lại sau.') }} />
  </section>
}