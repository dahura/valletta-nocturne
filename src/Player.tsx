import { useEffect, useRef, useState } from 'react'
import { Download, LoaderCircle, Pause, Play, RefreshCw, SkipBack, SkipForward } from 'lucide-react'
import type { AudioManifest, AudioTrack, Stop } from './types'
import { pad, stopHref, timeLabel } from './types'

interface Props {
  stop: Stop
  stops: Stop[]
  track?: AudioTrack
  manifest: AudioManifest
  playRequest: number
  onSelect: (stop: Stop) => void
  onRefresh: () => void
  initialSpeed: number
  onSpeed: (speed: number) => void
}

export default function Player({ stop, stops, track, manifest, playRequest, onSelect, onRefresh, initialSpeed, onSpeed }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(track?.duration ?? 0)
  const [error, setError] = useState('')
  const speed = initialSpeed
  const index = stops.findIndex(item => item.id === stop.id)

  useEffect(() => {
    const audio = audioRef.current
    setPlaying(false); setCurrent(0); setWaiting(false); setError(''); setDuration(track?.duration ?? 0)
    if (audio) { audio.pause(); audio.load(); audio.playbackRate = speed }
    return () => audio?.pause()
  }, [track?.src, stop.id])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio || !track) return
    if (!audio.paused) { audio.pause(); return }
    setError(''); setWaiting(true)
    try { await audio.play() } catch { setError('Не удалось включить аудио. Проверьте соединение и попробуйте снова.'); setWaiting(false); setPlaying(false) }
  }

  useEffect(() => {
    if (playRequest > 0 && track) void toggle()
    // A request is made only by an explicit Listen button, never by navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playRequest])

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed
  }, [speed])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({ title: stop.title, artist: manifest.voiceName || 'Валлетта. Город за камнем.', album: 'Русский аудиогид' })
    navigator.mediaSession.setActionHandler('play', () => { void audioRef.current?.play().catch(() => setError('Нажмите «Слушать» в плеере.')) })
    navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause())
    return () => { navigator.mediaSession.setActionHandler('play', null); navigator.mediaSession.setActionHandler('pause', null) }
  }, [stop.title, manifest.voiceName])

  const seek = (value: number) => { if (audioRef.current && Number.isFinite(value)) { audioRef.current.currentTime = value; setCurrent(value) } }
  const retry = () => { audioRef.current?.load(); setError(''); onRefresh() }

  return <section className={`player-dock ${!track ? 'no-track' : ''}`} aria-label="Аудиоплеер">
    <audio ref={audioRef} src={track?.src} preload="metadata"
      onPlay={() => { setPlaying(true); setWaiting(false) }} onPause={() => setPlaying(false)}
      onTimeUpdate={event => setCurrent(event.currentTarget.currentTime)}
      onLoadedMetadata={event => { if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration) }}
      onEnded={() => { setPlaying(false); setWaiting(false) }} onWaiting={() => setWaiting(true)} onPlaying={() => setWaiting(false)}
      onCanPlay={() => setWaiting(false)} onError={() => { if (track) { setError('Запись не загрузилась. Текст рассказа доступен на странице.'); setPlaying(false); setWaiting(false) } }} />
    <div className="player-inner">
      <a href={stopHref(stop)} className="player-meta"><span className="player-eyebrow">Слушать город · {stop.custom ? 'СВОЯ ТОЧКА' : pad(stop.id)} / {stops.length}</span><span className="player-title">{stop.title}</span></a>
      <div className="player-transport">
        <button className="icon-button" disabled={index <= 0} onClick={() => onSelect(stops[index - 1])} aria-label="Предыдущая остановка"><SkipBack size={20} fill="currentColor" aria-hidden="true" /></button>
        <button className="play-button" disabled={!track} onClick={() => void toggle()} aria-label={playing ? 'Пауза' : 'Слушать рассказ'}>{waiting ? <LoaderCircle className="spinner" size={24} aria-hidden="true" /> : playing ? <Pause size={23} fill="currentColor" aria-hidden="true" /> : <Play size={23} fill="currentColor" aria-hidden="true" />}</button>
        <button className="icon-button" disabled={index === stops.length - 1} onClick={() => onSelect(stops[index + 1])} aria-label="Следующая остановка"><SkipForward size={20} fill="currentColor" aria-hidden="true" /></button>
      </div>
      <div className="player-timeline">{track ? <>
        <label className="sr-only" htmlFor="audio-position">Позиция воспроизведения</label>
        <input id="audio-position" type="range" min="0" max={duration || track.duration} step="0.1" value={Math.min(current, duration || track.duration)} onChange={event => seek(Number(event.target.value))} aria-valuetext={`${timeLabel(current)} из ${timeLabel(duration || track.duration)}`} />
        <div className="player-times"><span>{timeLabel(current)}</span><span>{timeLabel(duration || track.duration)}</span></div>
      </> : <div className="audio-unavailable"><span>{stop.custom ? 'Нет записанного аудио.' : 'Аудио пока недоступно.'}</span><span>Читайте рассказ на странице.</span></div>}</div>
      <div className="player-extras">{track ? <>
        <button className="speed-button" onClick={() => onSpeed(speed === 1 ? 1.25 : speed === 1.25 ? 0.85 : 1)} aria-label={`Скорость ${speed}. Нажмите, чтобы изменить`}>{speed}×</button>
        <a className="icon-button" href={track.src} download aria-label={`Скачать MP3: ${stop.title}`}><Download size={21} aria-hidden="true" /></a>
      </> : <button className="icon-button" onClick={onRefresh} aria-label="Обновить список аудио"><RefreshCw size={19} aria-hidden="true" /></button>}</div>
      {error && <div className="player-error" role="status"><span>{error}</span><button onClick={retry}>Повторить</button></div>}
    </div>
  </section>
}
