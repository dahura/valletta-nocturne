import { useEffect, useId, useRef, useState } from 'react'
import { Camera, ImagePlus, LoaderCircle, Trash2 } from 'lucide-react'
import { abortPhotoRequest, beginPhotoRequest, bx } from './bx-client'
import './PhotoGuide.css'

export interface PhotoGuideProps {
  stops?: readonly { id: number; title: string }[]
  currentLocation?: { lat: number; lng: number; accuracy?: number } | null
  onStopSelect?: (stopId: number) => void
}
type Photo = { blob: Blob; url: string }
type PhotoReply = {
  status: 'identified' | 'uncertain' | 'unknown'; stopId?: number; title: string; visibleEvidence: string[]; answer: string
  sources: { label: string; url: string }[]; suggestedStops?: { stopId: number; title: string }[]
}

async function compress(file: File): Promise<Blob> {
  if (/heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)) throw new Error('Это HEIC. Сохраните фото как JPEG в приложении «Фото» или снимите новое через кнопку камеры.')
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Выберите фотографию JPEG, PNG или WebP.')
  if (file.size > 20 * 1024 * 1024) throw new Error('Исходное фото больше 20 МБ. Выберите уменьшенную копию.')
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode().catch(() => { throw new Error('Не удалось открыть файл. Попробуйте сохранить его как JPEG.') })
    if (!image.naturalWidth || image.naturalWidth * image.naturalHeight > 80_000_000) throw new Error('Фото слишком большого разрешения. Выберите уменьшенную копию.')
    for (const [edge, quality] of [[1600, .84], [1400, .73], [1200, .6]] as const) {
      const scale = Math.min(1, edge / Math.max(image.naturalWidth, image.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Браузер не смог подготовить фотографию.')
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      // Canvas redraw removes the original EXIF metadata; only this JPEG is sent.
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
      if (blob && blob.size <= 1_048_576) return blob
    }
    throw new Error('Не удалось сжать фото до 1 МБ. Выберите менее подробный снимок.')
  } finally { URL.revokeObjectURL(url) }
}

function base64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(new Error('Не удалось подготовить фото для отправки.'))
    reader.readAsDataURL(blob)
  })
}

export default function PhotoGuide({ currentLocation = null, onStopSelect }: PhotoGuideProps = {}) {
  const camera = useRef<HTMLInputElement>(null)
  const picker = useRef<HTMLInputElement>(null)
  const generation = useRef(0)
  const checkId = useId()
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [preparing, setPreparing] = useState(false)
  const [shareLocation, setShareLocation] = useState(false)
  const [error, setError] = useState('')
  const [reply, setReply] = useState<PhotoReply | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const explain = bx.photo.explain.useMutation()
  const confirm = bx.photo.confirm.useMutation()
  const busy = explain.isPending || confirm.isPending

  useEffect(() => () => { abortPhotoRequest(); generation.current += 1 }, [])
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.url) }, [photo])
  useEffect(() => { if (!currentLocation) setShareLocation(false) }, [currentLocation])

  function reset() {
    generation.current += 1
    abortPhotoRequest()
    explain.reset(); confirm.reset()
    setPhoto(null); setReply(null); setConfirmed(false); setError(''); setPreparing(false)
  }
  async function choose(file?: File) {
    if (!file) return
    reset()
    const token = generation.current
    setPreparing(true)
    try {
      const blob = await compress(file)
      if (token === generation.current) setPhoto({ blob, url: URL.createObjectURL(blob) })
    } catch (cause) { if (token === generation.current) setError(cause instanceof Error ? cause.message : 'Не удалось подготовить фото.') }
    finally { if (token === generation.current) setPreparing(false) }
  }
  async function send() {
    if (!photo || busy) return
    const token = generation.current
    setError(''); setReply(null); setConfirmed(false)
    beginPhotoRequest()
    try {
      const encoded = await base64(photo.blob)
      if (token !== generation.current) return
      const value = await explain.mutateAsync({ image: { mimeType: 'image/jpeg', base64: encoded },
        ...(shareLocation && currentLocation ? { location: currentLocation, shareLocation: true } : {}) })
      if (token === generation.current) setReply(value)
    } catch (cause) { if (token === generation.current) setError(cause instanceof Error ? cause.message : 'Не удалось отправить фото. Проверьте соединение.') }
  }
  async function chooseStop(stopId: number) {
    const token = generation.current
    setError('')
    beginPhotoRequest()
    try {
      const value = await confirm.mutateAsync({ stopId })
      if (token === generation.current) { setReply(value); setConfirmed(true) }
    } catch (cause) { if (token === generation.current) setError(cause instanceof Error ? cause.message : 'Не удалось открыть описание.') }
  }

  return <section className="photo-guide" aria-label="Фотогид">
    <p className="photo-guide-intro">Снимите здание или выберите фото. Гид посмотрит на видимые детали и предложит, что это за место.</p>
    <input ref={camera} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden onChange={event => { void choose(event.target.files?.[0]); event.target.value = '' }} />
    <input ref={picker} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={event => { void choose(event.target.files?.[0]); event.target.value = '' }} />
    <div className="photo-guide-actions">
      <button type="button" className="photo-guide-button" onClick={() => camera.current?.click()}><Camera size={20} aria-hidden="true" />Снять фото</button>
      <button type="button" className="photo-guide-button" onClick={() => picker.current?.click()}><ImagePlus size={20} aria-hidden="true" />{photo ? 'Изменить фото' : 'Выбрать файл'}</button>
    </div>
    {preparing && <p className="photo-guide-state" role="status">Готовим фото на вашем устройстве…</p>}
    {photo && <figure className="photo-guide-preview"><img src={photo.url} alt="Выбранная фотография для гида" /><figcaption>Фото подготовлено: {Math.ceil(photo.blob.size / 1024)} КБ. Пока оно только на этом устройстве.</figcaption></figure>}
    {photo && currentLocation && <label className="photo-guide-location" htmlFor={checkId}><input id={checkId} type="checkbox" checked={shareLocation} onChange={event => setShareLocation(event.target.checked)} disabled={busy} /><span>Добавить моё положение к запросу <small>Необязательно. Координаты не доказывают, что за место на фото.</small></span></label>}
    {photo && <>
      <p className="photo-guide-privacy">После нажатия фото будет передано в OpenAI для распознавания. На сайте фотография не сохраняется. Исходные метаданные удалены при подготовке.</p>
      <div className="photo-guide-actions">
        <button type="button" className="photo-guide-button photo-guide-primary" disabled={busy || preparing} onClick={() => { void send() }}>{busy ? <><LoaderCircle size={20} className="photo-guide-spinner" aria-hidden="true" />Рассматриваем фото…</> : 'Рассказать об этом месте'}</button>
        <button type="button" className="photo-guide-button" onClick={reset}><Trash2 size={18} aria-hidden="true" />Удалить</button>
        {busy && <button type="button" className="photo-guide-button" onClick={() => { generation.current += 1; abortPhotoRequest(); explain.reset(); confirm.reset(); setError('Запрос отменён.'); }}>Отменить запрос</button>}
      </div>
    </>}
    {error && <p className="photo-guide-error" role="alert">{error}</p>}
    <div className="photo-guide-result" aria-live="polite" aria-busy={busy}>
      {reply && <>
        <p className="photo-guide-eyebrow">{confirmed ? 'Место подтверждено вами' : reply.status === 'identified' ? 'Похоже на остановку маршрута' : 'Результат по фотографии'}</p>
        <h2>{reply.title}</h2>
        {reply.visibleEvidence.length > 0 && <><h3>Что видно</h3><ul>{reply.visibleEvidence.map((item, index) => <li key={index}>{item}</li>)}</ul></>}
        <div className="photo-guide-answer">{reply.answer.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        {!confirmed && reply.status === 'identified' && reply.stopId && <button type="button" className="photo-guide-button photo-guide-primary" disabled={busy} onClick={() => { void chooseStop(reply.stopId!) }}>Да, это место — открыть историю</button>}
        {!confirmed && reply.suggestedStops?.length ? <div className="photo-guide-candidates"><p>Если вы узнаёте место, выберите его:</p>{reply.suggestedStops.map(stop => <button type="button" className="photo-guide-button" key={stop.stopId} disabled={busy} onClick={() => { void chooseStop(stop.stopId) }}>{stop.title}</button>)}</div> : null}
        {confirmed && reply.sources.length > 0 && <div className="photo-guide-sources"><h3>Проверенные источники</h3><ul>{reply.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul></div>}
        {confirmed && reply.stopId && onStopSelect && <button type="button" className="photo-guide-button" onClick={() => onStopSelect(reply.stopId!)}>Открыть остановку маршрута</button>}
      </>}
    </div>
  </section>
}
