import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Check as CheckIcon, ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, Clock3, Download, Footprints, Headphones, Info, Map as MapIcon, Play, RefreshCw, Sun } from 'lucide-react'
import { BottomNav, DownLink, Eyebrow, Footer, Header, MalteseMark, PdfLink, Photo, PracticalStatus, StopRows } from './components'
import Player from './Player'
import { usePersonalRoute } from './personal-route'
import type { PersonalRoute } from './personal-route'
import { RouteEditor } from './RouteEditor'
import { useGuide } from './features/guide/useGuide'
import { StopNavigation } from './StopNavigation'
import type { AudioManifest, Guide, Page, Stop } from './types'
import { directionsUrl, pad, parseManifest, placeUrl, readPage, stopHref, timeLabel } from './types'

const MapView = lazy(() => import('./MapView'))
const PhotoGuide = import.meta.env.VITE_PHOTO_GUIDE_ENABLED === 'true'
  ? lazy(() => import('./features/photo-guide/PhotoGuide')) : null
const emptyManifest: AudioManifest = { tracks: [] }

class MapBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(_error: Error, _info: ErrorInfo) { /* Static maps below remain usable when the map chunk fails. */ }
  render() { return this.state.failed ? <div className="notice"><Info size={20} /><p>Интерактивная карта не загрузилась. Ниже доступны карты по частям и ссылки OpenStreetMap.</p></div> : this.props.children }
}

export default function App() {
  const { data: guideData, isError: loadError, refetch: refetchGuide, source: guideSource } = useGuide()
  const guide: Guide | null = guideData ?? null
  const [manifest, setManifest] = useState<AudioManifest>(emptyManifest)
  const [pdfReady, setPdfReady] = useState(false)
  const [page, setPage] = useState<Page>(readPage)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [playRequest, setPlayRequest] = useState(0)
  const mainRef = useRef<HTMLElement>(null)
  const personal = usePersonalRoute(guide?.stops)

  const loadGuide = useCallback(async () => {
    await refetchGuide()
  }, [refetchGuide])

  const loadDownloads = useCallback(async () => {
    const [audio, pdf] = await Promise.allSettled([
      fetch('/data/audio-manifest.json', { cache: 'no-cache' }).then(async response => response.ok ? parseManifest(await response.json()) : emptyManifest),
      fetch('/downloads/valletta-audioguide-ru.pdf', { method: 'HEAD', cache: 'no-cache' }).then(response => response.ok && !!response.headers.get('content-type')?.includes('application/pdf')),
    ])
    setManifest(audio.status === 'fulfilled' ? audio.value : emptyManifest)
    setPdfReady(pdf.status === 'fulfilled' && pdf.value)
  }, [])

  useEffect(() => { void loadDownloads(); window.addEventListener('focus', loadDownloads); return () => window.removeEventListener('focus', loadDownloads) }, [loadDownloads])
  useEffect(() => {
    const onHash = () => { setPage(readPage()); window.scrollTo({ top: 0 }); requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true })) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const selected = page.kind === 'stop' ? personal.allStops.find(stop => stop.slug === page.slug) : undefined
  useEffect(() => {
    if (selected) { setActiveId(selected.id); document.title = `${selected.title} · Валлетта. Город за камнем.` }
    else document.title = page.kind === 'map' ? 'Карта прогулки · Валлетта' : page.kind === 'practical' ? 'Практика и источники · Валлетта' : 'Валлетта. Город за камнем. · Русский аудиогид'
  }, [selected, page.kind])

  useEffect(() => { if (selected) personal.remember(selected.id) }, [selected?.id])
  const active = personal.allStops.find(stop => stop.id === activeId)
  const track = manifest.tracks.find(item => item.id === activeId)
  const selectStop = (stop: Stop) => { window.location.hash = stopHref(stop).slice(1) }
  const listen = (stop: Stop) => { setActiveId(stop.id); setPlayRequest(value => value + 1) }

  return <div className={`app-shell ${active ? 'has-player' : ''}`} data-guide-source={guideSource}>
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); mainRef.current?.focus() }}>К содержимому</a>
    <Header page={page} />
    <main id="main-content" tabIndex={-1} ref={mainRef}>
      {!guide ? <section className="loading-screen"><MalteseMark /><Eyebrow>ВАЛЛЕТТА / РУССКИЙ АУДИОГИД</Eyebrow><h1>Город за камнем.</h1>{loadError ? <><p role="alert">Гид не загрузился. Проверьте соединение и попробуйте ещё раз.</p><button className="button button-primary" onClick={() => void loadGuide()}><RefreshCw size={18} />Повторить</button></> : <p role="status">Открываем маршрут…</p>}</section> : <>
        {page.kind === 'home' && <Home guide={guide} manifest={manifest} pdfReady={pdfReady} personal={personal} />}
        {page.kind === 'route' && <RoutePage guide={guide} manifest={manifest} pdfReady={pdfReady} personal={personal} />}
        {page.kind === 'stop' && (selected ? <StopPage stop={selected} guide={guide} manifest={manifest} onListen={listen} personal={personal} /> : <section className="page-heading page-width"><Eyebrow>МАРШРУТ</Eyebrow><h1>Такой остановки нет.</h1><a className="button button-primary" href="#route">Ко всем остановкам<ArrowRight size={18} /></a></section>)}
        {page.kind === 'map' && <MapPage guide={guide} selectedId={page.id} pickMode={page.pick} personal={personal} />}
        {page.kind === 'practical' && <PracticalPage guide={guide} manifest={manifest} pdfReady={pdfReady} />}
        {page.kind === 'photo' && <div className="page-width photo-page"><header className="page-heading"><Eyebrow>ВАЛЛЕТТА · СМОТРЕТЬ ВНИМАТЕЛЬНЕЕ</Eyebrow><h1>Спросить по фото</h1><p>Снимите деталь, которая привлекла ваше внимание.</p></header>{PhotoGuide ? <Suspense fallback={<p role="status">Открываем фотогид…</p>}><PhotoGuide /></Suspense> : <div className="notice"><Info /><p>Фотогид пока недоступен. Все записанные истории и карта работают.</p></div>}<a className="text-link" href="#route"><ArrowLeft size={17} />К моему маршруту</a></div>}
        <Footer guide={guide} />
      </>}
    </main>
    {guide && active && <Player stop={active} stops={personal.selected.length ? personal.selected : personal.allStops} track={track} manifest={manifest} playRequest={playRequest} onSelect={selectStop} onRefresh={loadDownloads} initialSpeed={personal.state.preferences.audioSpeed} onSpeed={speed => personal.setPreference("audioSpeed", speed)} />}
    <BottomNav page={page} />
  </div>
}

function Home({ guide, manifest, pdfReady, personal }: { guide: Guide; manifest: AudioManifest; pdfReady: boolean; personal: PersonalRoute }) {
  const start = personal.selected.find(stop => stop.id === personal.state.recentStop) || personal.selected[0] || guide.stops[0]
  const hero = guide.stops.find(stop => stop.slug === 'upper-barrakka') || guide.stops[0]
  return <>
    <section className="hero page-width" aria-labelledby="hero-title">
      <div className="hero-top"><div><Eyebrow>МАЛЬТА · ДЛЯ ДВОИХ · 30 ОКТЯБРЯ 2026</Eyebrow><h1 id="hero-title">Валлетта.<br /><span>Город за камнем.</span></h1></div>
        <div className="hero-description"><p>Прогулка по городу рыцарей.<br />За медовыми фасадами — следы осад, тени Караваджо и истории, которые стоит услышать вдвоём.</p><div className="walk-facts"><span><Headphones />{guide.stops.length} историй</span><span><Clock3 />{guide.duration.split(' с ')[0]}</span><span><Footprints />{guide.distance.split(' по ')[0]}</span></div></div>
      </div>
      <div className="hero-actions"><div className="button-group"><a className="button button-primary" href={stopHref(start)}>{personal.state.recentStop ? "Продолжить прогулку" : "Начать прогулку"}<ArrowUpRight size={18} aria-hidden="true" /></a><PdfLink ready={pdfReady} /></div><p>Начало: City Gate <span>· от автобусов 41 / 42</span></p></div>
      <details className="start-taxi"><summary>На такси к началу<ArrowUpRight size={17} aria-hidden="true" /></summary><StopNavigation stop={guide.stops[0]} taxiOnly /></details>
      <Photo image={hero.image} className="hero-photo" eager />
      <div className="hero-caption"><div><span className="large-range">01—{guide.stops.length}</span><p>От городских ворот к морю.<br />И обратно — сквозь четыре века.</p></div><DownLink href="#route">Мой маршрут · {personal.selected.length} точек</DownLink></div>
    </section>
    <section className="intro-section page-width"><div><Eyebrow>НЕТОРОПЛИВО. ВДВОЁМ. ПЕШКОМ.</Eyebrow><h2>Небольшой город.<br /><em>Большие истории.</em></h2></div><div className="intro-copy"><p>{guide.intro}</p><p className="editorial-note"><Sun size={19} aria-hidden="true" />Дневная прогулка. Для спокойного темпа выберите один интерьер — собор или форт.</p><a className="text-link" href="#practical">Проверить часы и спланировать день<ArrowUpRight size={17} aria-hidden="true" /></a></div></section>
    <section className="home-route page-width"><div className="section-heading"><div><Eyebrow>КАЖДАЯ ТОЧКА — ОТДЕЛЬНЫЙ РАССКАЗ</Eyebrow><h2>Авторские истории</h2></div><a className="text-link" href="#map"><MapIcon size={17} aria-hidden="true" />Открыть карту<ArrowUpRight size={17} aria-hidden="true" /></a></div><StopRows stops={guide.stops} tracks={manifest.tracks} /></section>
    <section className="download-band page-width"><div><Eyebrow>ВОЗЬМИТЕ ГОРОД С СОБОЙ</Eyebrow><h2>Бумага помнит дорогу.</h2><p>Авторский PDF с картами и рассказами. Ваши изменения сохраняются в сайте. Сохраните перед выходом — он останется с вами без интернета.</p></div><PdfLink ready={pdfReady} /></section>
  </>
}

function RoutePage({ guide, pdfReady, personal }: { guide: Guide; manifest: AudioManifest; pdfReady: boolean; personal: PersonalRoute }) {
  const first = personal.selected.find(stop => !personal.state.visited.includes(stop.id)) || personal.selected[0]
  return <div className="page-width"><header className="page-heading"><Eyebrow>ПРОГУЛКА В ВАШЕМ ТЕМПЕ · БЕЗ ЛОГИНА</Eyebrow><h1>Мой маршрут</h1><p>Выбрано {personal.selected.length} из {personal.allStops.length} точек. Уже были: {personal.selected.filter(stop => personal.state.visited.includes(stop.id)).length}.</p><p className="route-estimate">{personal.changed ? `≈ ${personal.estimateMinutes} мин без интерьеров — грубая оценка по прямым отрезкам. По улицам путь длиннее.` : `${guide.duration}. ${guide.distance}.`}</p><div className="button-group">{first && <a href={stopHref(first)} className="button button-primary">К следующей истории<ArrowRight size={18} /></a>}<a className="button button-outline" href="#map"><MapIcon size={17} />Моя карта</a></div></header>
    <div className="route-layout"><RouteEditor route={personal} /><aside className="route-aside"><a href="#map" className="route-map-preview"><img src="/maps/route-overview.png" alt="Карта авторского маршрута: исходные 13 остановок" loading="lazy" /><span>Карта авторской петли<ArrowUpRight size={16} /></span></a><div className="route-aside-copy"><Eyebrow>СОХРАНЯЕТСЯ НА ЭТОМ УСТРОЙСТВЕ</Eyebrow><p>Меняйте порядок и пропускайте точки. Изменения и отметки сохраняются локально. Авторский PDF остаётся исходным.</p><PdfLink ready={pdfReady} /></div></aside></div>
    <section className="route-notes"><div><Eyebrow>АВТОРСКИЙ ПЛАН ПРОГУЛКИ</Eyebrow><h2>В вашем темпе</h2></div><ol>{guide.routeNotes.map((note, index) => <li key={note}><span>{pad(index + 1)}</span><p>{note}</p></li>)}</ol></section>
  </div>
}

function StopPage({ stop, guide, manifest, onListen, personal }: { stop: Stop; guide: Guide; manifest: AudioManifest; onListen: (stop: Stop) => void; personal: PersonalRoute }) {
  const index = personal.selected.findIndex(item => item.id === stop.id)
  const previous = personal.selected[index - 1]
  const next = index >= 0 ? personal.selected[index + 1] : undefined
  const track = manifest.tracks.find(item => item.id === stop.id)
  const sectionLabels = { what: 'Что это', history: 'История', look: 'На что смотреть', legend: 'Легенда' }
  return <div className="stop-layout page-width">
    <aside className="stop-sidebar" aria-label="Остановки маршрута"><a className="back-link" href="#route"><ArrowLeft size={16} aria-hidden="true" />Весь маршрут</a><p className="eyebrow">13 ИСТОРИЙ ВАЛЛЕТТЫ</p><ol>{guide.stops.map(item => <li key={item.id}><a href={stopHref(item)} aria-current={item.id === stop.id ? 'page' : undefined}><span>{pad(item.id)}</span><span>{item.title}</span>{item.id === stop.id && <Headphones size={15} aria-hidden="true" />}</a></li>)}</ol></aside>
    <article className="stop-article" key={stop.id}>
      <div className="stop-breadcrumb"><a href="#route"><ArrowLeft size={16} aria-hidden="true" />Все остановки</a><span>{pad(stop.id)} / {guide.stops.length}</span></div>
      <Photo image={stop.image} className="stop-photo" eager />
      <header className="stop-heading"><Eyebrow>ОСТАНОВКА {pad(stop.id)}</Eyebrow><h1>{stop.title}</h1><p className="stop-subtitle">{stop.subtitle}</p><button className="visited-button story-visited" aria-pressed={personal.state.visited.includes(stop.id)} onClick={() => personal.toggleVisited(stop.id)}><CheckIcon />Уже были</button><div className="stop-actions"><button className="button button-primary" disabled={!track} onClick={() => onListen(stop)}><Play size={16} fill="currentColor" aria-hidden="true" />{track ? `Слушать · ${timeLabel(track.duration)}` : stop.custom ? 'Нет записанного аудио' : 'Аудио недоступно'}</button>{track && <a className="text-link stop-download" href={track.src} download><Download size={16} aria-hidden="true" />MP3</a>}</div></header>
      <StopNavigation stop={stop} />
      <div className="story-sections">{(Object.entries(sectionLabels) as [keyof typeof sectionLabels, string][]).map(([key, title]) => stop.sections[key] ? <section key={key} className={key === 'legend' ? 'legend-section' : ''}><h2>{title}</h2>{stop.sections[key]!.split('\n').filter(Boolean).map((text, i) => <p key={i}>{text}</p>)}</section> : null)}</div>
      <details className="source-details"><summary>Источники этой истории<ChevronDown size={17} aria-hidden="true" /></summary><ul>{stop.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}<ArrowUpRight size={14} aria-hidden="true" /></a></li>)}</ul><p>Фотография: <a href={stop.image.sourceUrl} target="_blank" rel="noreferrer">{stop.image.author} · {stop.image.license}</a>. Для отображения фотография кадрирована.</p></details>
      <section className="next-walk"><div className="next-walk-heading"><Footprints size={23} aria-hidden="true" /><Eyebrow>{next ? 'ДАЛЬШЕ ПЕШКОМ' : 'ВОЗВРАЩЕНИЕ К CITY GATE'}{!personal.changed && ` · ≈ ${stop.walkMinutes} МИН`}</Eyebrow></div><p>{personal.changed ? next ? `Далее — ${next.title}. Порядок изменён вами. Откройте пеший путь в OpenStreetMap и сверяйтесь с обстановкой на месте.` : "Ваш маршрут завершён. Обратный путь к City Gate можно открыть в OpenStreetMap." : stop.nextDirections}</p><a className="text-link" href={directionsUrl(stop, next || guide.stops[0])} target="_blank" rel="noreferrer">Путь в OpenStreetMap<ArrowUpRight size={16} aria-hidden="true" /></a>{next ? <a className="next-stop-link" href={stopHref(next)}><span><small>СЛЕДУЮЩАЯ ИСТОРИЯ · {pad(next.id)}</small><strong>{next.title}</strong></span><ArrowRight size={25} aria-hidden="true" /></a> : <a className="next-stop-link" href="#practical"><span><small>ПОСЛЕ ПРОГУЛКИ</small><strong>Кофе и обратный автобус</strong></span><ArrowRight size={25} aria-hidden="true" /></a>}</section>
      <div className="stop-pagination">{previous ? <a href={stopHref(previous)}><ArrowLeft size={16} aria-hidden="true" />Предыдущая история</a> : <a href="#route"><ArrowLeft size={16} aria-hidden="true" />Весь маршрут</a>}<a href={placeUrl(stop)} target="_blank" rel="noreferrer">Точка в OSM<ArrowUpRight size={16} aria-hidden="true" /></a></div>
    </article>
  </div>
}

function MapPage({ guide, selectedId, pickMode, personal }: { guide: Guide; selectedId?: number; pickMode?: boolean; personal: PersonalRoute }) {
  const [mapPart, setMapPart] = useState('overview')
  const maps = [{ id: 'overview', label: 'Вся прогулка' }, { id: 'west', label: 'Западная часть' }, { id: 'east', label: 'Восточная часть' }]
  return <div className="page-width map-page"><header className="page-heading"><Eyebrow>УЛИЦА ЗА УЛИЦЕЙ · {guide.distance.split(' по ')[0]}</Eyebrow><h1>Карта прогулки</h1><p>Выберите точку. Откройте рассказ — и продолжайте в своём темпе.</p></header><MapBoundary><Suspense fallback={<div className="map-loading" role="status"><MapIcon size={30} /><p>Открываем карту…</p></div>}><MapView stops={personal.selected} allStops={personal.allStops} initialId={selectedId} changed={personal.changed} visited={personal.state.visited} pickMode={pickMode} onAdd={personal.addPoint} /></Suspense></MapBoundary>
    <section className="static-maps"><div className="section-heading"><div><Eyebrow>КРУПНЕЕ. С НОМЕРАМИ И УЛИЦАМИ.</Eyebrow><h2>Авторская карта по частям</h2></div><a href={`/maps/route-${mapPart}.png`} className="text-link" download>Скачать карту<Download size={17} aria-hidden="true" /></a></div><div className="map-part-controls" role="group" aria-label="Фрагмент карты">{maps.map(map => <button key={map.id} aria-pressed={mapPart === map.id} onClick={() => setMapPart(map.id)}>{map.label}</button>)}</div><a className="static-map-image" href={`/maps/route-${mapPart}.png`} target="_blank" rel="noreferrer"><img src={`/maps/route-${mapPart}.png`} alt={`${maps.find(map => map.id === mapPart)?.label}: нумерация остановок и путь по уличной сети OpenStreetMap`} loading="lazy" /></a><p className="map-attribution">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>. Маршрут рассчитан по пешеходной уличной сети; проходимость на месте не проверена. Возможны ступени, работы и обходы.</p></section>
  </div>
}

function PracticalPage({ guide, manifest, pdfReady }: { guide: Guide; manifest: AudioManifest; pdfReady: boolean }) {
  return <div className="page-width practical-page"><header className="page-heading"><Eyebrow>ПРОВЕРЕНО 30.10.2026</Eyebrow><h1>Чтобы день<br /><em>сложился.</em></h1><p>Часы, билеты, пауза на кофе и путь домой.</p></header><div className="practical-notice"><Info size={23} aria-hidden="true" /><p>Ниже — опубликованные сведения на дату проверки. Они не подтверждают отсутствие разовых закрытий, отмен и изменений именно сегодня. Гид не показывает наличие мест и прибытие автобусов в реальном времени.</p></div><section className="practical-grid" aria-label="Практическая информация">{guide.practical.map((item, index) => <article className="practical-item" key={item.title}><div className="practical-item-top"><span className="item-number">{pad(index + 1)}</span><PracticalStatus verified={item.verified} /></div><h2>{item.title}</h2><p>{item.text}</p>{item.url && <a href={item.url} className="text-link" target="_blank" rel="noreferrer">Официальный источник<ArrowUpRight size={15} aria-hidden="true" /></a>}</article>)}</section>
    <section className="practical-downloads"><div><Eyebrow>СОХРАНИТЬ ПЕРЕД ВЫХОДОМ</Eyebrow><h2>Гид с собой</h2><p>PDF содержит карты и все истории. Аудио можно скачать отдельно для каждой остановки.</p><PdfLink ready={pdfReady} /></div><div className="audio-downloads"><p className="eyebrow">MP3 · {manifest.tracks.length} ИЗ {guide.stops.length} ЗАПИСЕЙ</p>{manifest.tracks.length ? <ol>{guide.stops.map(stop => { const track = manifest.tracks.find(item => item.id === stop.id); return track ? <li key={stop.id}><a href={track.src} download><span className="item-number">{pad(stop.id)}</span><span>{stop.title}</span><small>{timeLabel(track.duration)}</small><Download size={17} aria-hidden="true" /></a></li> : null })}</ol> : <p>Аудиозаписи сейчас недоступны. Все рассказы можно прочитать в маршруте.</p>}{manifest.voiceName && <p className="voice-credit">Голос: {manifest.voiceName}.{manifest.fictionalVoice && ' Оригинальный вымышленный голос, синтезированный с помощью ИИ.'}{manifest.provider && ` Озвучивание: ${manifest.provider}.`}</p>}</div></section>
    <details className="all-sources source-details"><summary>Все источники гида · {guide.sources.length}<ChevronDown size={18} aria-hidden="true" /></summary><ul>{guide.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}<ArrowUpRight size={14} aria-hidden="true" /></a></li>)}</ul></details>
  </div>
}
