import { useState } from 'react'
import { ArrowDown, ArrowUpRight, Check, Download, Headphones, MapPin, Route, Info, BookOpen } from 'lucide-react'
import type { GuideImage, Guide, Page, Stop } from './types'
import { pad, stopHref, timeLabel } from './types'

export function MalteseMark({ className = '' }: { className?: string }) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 40 40" fill="currentColor"><path d="M20 2 24 14 37 8 29 20 37 32 24 26 20 38 16 26 3 32 11 20 3 8 16 14Z" /></svg>
}

export function Header({ page }: { page: Page }) {
  return <header className="site-header">
    <a className="brand" href="#" aria-label="Валлетта. Город за камнем. Главная"><MalteseMark /><span>VALLETTA <span className="brand-slash">/</span> NOCTURNE</span></a>
    <nav className="desktop-nav" aria-label="Основная навигация">
      <a href="#route" aria-current={page.kind === 'route' || page.kind === 'stop' ? 'page' : undefined}>Маршрут</a>
      <a href="#map" aria-current={page.kind === 'map' ? 'page' : undefined}>Карта прогулки</a>
      <a href="#practical" aria-current={page.kind === 'practical' ? 'page' : undefined}>Практика</a>
    </nav>
    <span className="header-language"><a href="#photo">Спросить по фото ↗</a><span aria-hidden="true" className="language-short">RU</span></span>
  </header>
}

export function BottomNav({ page }: { page: Page }) {
  const links = [{ kind: 'route', title: 'Маршрут', Icon: Route }, { kind: 'map', title: 'Карта', Icon: MapPin }, { kind: 'practical', title: 'Практика', Icon: BookOpen }]
  const active = page.kind === 'home' || page.kind === 'stop' || page.kind === 'photo' ? 'route' : page.kind
  return <nav className="bottom-nav" aria-label="Навигация для прогулки">{links.map(({ kind, title, Icon }) =>
    <a key={kind} href={`#${kind}`} aria-current={active === kind ? 'page' : undefined}><Icon aria-hidden="true" size={22} strokeWidth={1.6} /><span>{title}</span></a>
  )}</nav>
}

export function Photo({ image, className = '', eager = false, caption = true }: { image: GuideImage; className?: string; eager?: boolean; caption?: boolean }) {
  const [failed, setFailed] = useState(!image.src)
  return <figure className={`photo ${className}`}>
    {failed ? <div className="photo-unavailable"><MalteseMark /><span>Фотография недоступна</span></div> :
      <img src={image.src} alt={image.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />}
    {caption && <figcaption><a href={image.sourceUrl} target="_blank" rel="noreferrer">{image.author} · {image.license}<ArrowUpRight size={12} aria-hidden="true" /></a><span>Wikimedia Commons · кадр</span></figcaption>}
  </figure>
}

export function PdfLink({ ready, className = '' }: { ready: boolean; className?: string }) {
  return ready ? <a className={`button button-outline ${className}`} href="/downloads/valletta-audioguide-ru.pdf" download><span>Авторский PDF</span><Download size={17} aria-hidden="true" /></a> :
    <span className={`button button-outline button-unavailable ${className}`} aria-disabled="true"><span>PDF пока недоступен</span><Info size={17} aria-hidden="true" /></span>
}

export function StopRows({ stops, tracks = [], compact = false }: { stops: Stop[]; tracks?: { id: number; duration: number }[]; compact?: boolean }) {
  return <ol className={`stop-rows ${compact ? 'compact' : ''}`}>{stops.map(stop => {
    const track = tracks.find(item => item.id === stop.id)
    return <li key={stop.id}><a href={stopHref(stop)} className="stop-row"><span className="stop-number">{pad(stop.id)}</span>
      {!compact && <Photo image={stop.image} caption={false} className="stop-thumb" />}
      <span className="stop-row-copy"><span className="stop-row-title">{stop.title}</span><span className="stop-row-subtitle">{stop.subtitle}</span></span>
      <span className="stop-row-duration">{track && <><Headphones size={14} aria-hidden="true" />{timeLabel(track.duration)}</>}</span><ArrowUpRight className="stop-row-arrow" size={20} aria-hidden="true" />
    </a></li>
  })}</ol>
}

export function Footer({ guide }: { guide: Guide }) {
  return <footer className="site-footer"><a className="footer-brand" href="#"><MalteseMark />Город за камнем.</a><div><span>Русский аудиогид · Валлетта · 30.10.2026</span><span>История — по источникам. Атмосфера — в вашем темпе.</span></div><a href="#practical">Источники и практика<ArrowUpRight size={15} aria-hidden="true" /></a><span className="sr-only">{guide.subtitle}</span></footer>
}

export function Eyebrow({ children }: { children: React.ReactNode }) { return <p className="eyebrow">{children}</p> }

export function PracticalStatus({ verified }: { verified: boolean }) {
  return <span className={`practical-status ${verified ? 'verified' : ''}`}>{verified ? <Check size={14} aria-hidden="true" /> : <Info size={14} aria-hidden="true" />}{verified ? 'Сведения проверены' : 'Есть уточнения'}</span>
}

export function DownLink({ href, children }: { href: string; children: React.ReactNode }) { return <a className="text-link" href={href}>{children}<ArrowDown size={17} aria-hidden="true" /></a> }
