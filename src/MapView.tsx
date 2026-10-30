import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Footprints, Info, LocateFixed, MapPin, X } from 'lucide-react'
import L from 'leaflet'
import type { GeoJsonObject } from 'geojson'
import 'leaflet/dist/leaflet.css'
import type { Stop } from './types'
import { directionsUrl, pad, placeUrl, stopHref, stopNumber } from './types'
import { distanceLabel, metresBetween } from './personal-route'
import { useLocation } from './use-location'
import { CustomStopForm } from './RouteEditor'

interface Props { stops: Stop[]; allStops: Stop[]; initialId?: number; changed: boolean; visited: number[]; pickMode?: boolean; onAdd: (title: string, lat: number, lng: number) => Stop | null }

export default function MapView({ stops, allStops, initialId, changed, visited, pickMode, onAdd }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<number, L.Marker>>(new Map())
  const gpsLayers = useRef<L.LayerGroup | null>(null)
  const [selectedId, setSelectedId] = useState(initialId || stops[0]?.id || allStops[0].id)
  const [routeError, setRouteError] = useState(false)
  const [tilesError, setTilesError] = useState(false)
  const [routeLoaded, setRouteLoaded] = useState(false)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>()
  const location = useLocation()
  const selected = allStops.find(stop => stop.id === selectedId) || allStops[0]
  const index = stops.findIndex(stop => stop.id === selected.id)
  const previous = stops[index - 1]
  const nearest = location.position && stops.length ? stops.map(stop => ({ stop, distance: metresBetween(location.position!, stop) })).sort((a, b) => a.distance - b.distance)[0] : null
  const next = stops.find(stop => !visited.includes(stop.id))

  useEffect(() => { if (initialId && allStops.some(stop => stop.id === initialId)) setSelectedId(initialId) }, [initialId, allStops])

  useEffect(() => {
    if (!hostRef.current) return
    const controller = new AbortController()
    const map = L.map(hostRef.current, { scrollWheelZoom: false, zoomControl: true, tapTolerance: 15 })
    mapRef.current = map
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map)
    tiles.on('tileerror', () => setTilesError(true))
    const markerStops = stops.some(stop => stop.id === selectedId) ? stops : [...stops, selected]
    for (const stop of markerStops) {
      const marker = L.marker([stop.lat, stop.lng], { keyboard: true, title: `${stop.custom ? 'Своя точка' : `История ${stop.id}`}: ${stop.title}`, icon: L.divIcon({ className: 'route-marker', html: `<span>${stopNumber(stop)}</span>`, iconSize: [44, 44], iconAnchor: [22, 22] }) }).addTo(map)
      const tooltip = document.createElement('span'); tooltip.textContent = `${stopNumber(stop)} · ${stop.title}`
      marker.bindTooltip(tooltip, { direction: 'top', offset: [0, -18] })
      marker.on('click', () => setSelectedId(stop.id))
      markersRef.current.set(stop.id, marker)
    }
    if (stops.length) map.fitBounds(L.latLngBounds(stops.map(stop => [stop.lat, stop.lng] as L.LatLngTuple)), { padding: [38, 38] })
    else map.setView([35.898, 14.514], 16)
    markersRef.current.get(selectedId)?.getElement()?.classList.add('is-selected')
    if (changed) {
      if (stops.length > 1) L.polyline(stops.map(stop => [stop.lat, stop.lng] as L.LatLngTuple), { color: '#702D3A', weight: 3, opacity: 0.8, dashArray: '6,8' }).addTo(map)
    } else {
      fetch('/data/route.geojson', { signal: controller.signal }).then(async response => {
        if (!response.ok) throw new Error('route')
        const data = await response.json() as GeoJsonObject
        if (!controller.signal.aborted) { L.geoJSON(data, { style: { color: '#702D3A', weight: 4, opacity: 0.85 }, filter: feature => feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString' }).addTo(map); setRouteLoaded(true) }
      }).catch(error => { if (error.name !== 'AbortError') setRouteError(true) })
    }
    if (pickMode) map.on('click', event => { setCoordinates({ lat: event.latlng.lat, lng: event.latlng.lng }) })
    gpsLayers.current = L.layerGroup().addTo(map)
    const resize = new ResizeObserver(() => map.invalidateSize({ pan: false }))
    resize.observe(hostRef.current)
    return () => { controller.abort(); resize.disconnect(); map.remove(); markersRef.current.clear(); mapRef.current = null; gpsLayers.current = null }
  }, [stops, changed, pickMode])

  useEffect(() => {
    markersRef.current.forEach((marker, id) => { marker.getElement()?.classList.toggle('is-selected', id === selected.id); marker.setZIndexOffset(id === selected.id ? 1000 : 0) })
  }, [selected.id])
  useEffect(() => {
    const layers = gpsLayers.current
    if (!layers) return
    layers.clearLayers()
    if (!location.position) return
    const { lat, lng, accuracy } = location.position
    L.circle([lat, lng], { radius: accuracy, color: '#235D72', fillColor: '#235D72', fillOpacity: 0.12, weight: 1 }).addTo(layers)
    L.circleMarker([lat, lng], { radius: 7, color: '#FFFFFF', weight: 3, fillColor: '#235D72', fillOpacity: 1 }).bindTooltip('Вы здесь').addTo(layers)
  }, [location.position, stops])
  useEffect(() => {
    if (!coordinates || !mapRef.current) return
    const marker = L.circleMarker([coordinates.lat, coordinates.lng], { radius: 8, color: '#242725', fillOpacity: 0.8 }).addTo(mapRef.current)
    return () => { marker.remove() }
  }, [coordinates])

  return <section className="interactive-map-section" aria-label="Интерактивная карта маршрута">
    <div className="location-panel"><div className="location-heading"><div><span className="eyebrow">{location.enabled ? 'ВЫ ЗДЕСЬ · GPS ВКЛЮЧЁН' : 'ОРИЕНТИР НА ПРОГУЛКЕ'}</span><p>{location.waiting ? 'Определяем местоположение…' : 'GPS включается только по вашей кнопке.'}</p></div>{location.enabled ? <button className="button button-outline" onClick={location.stop}><X size={17} />Выключить GPS</button> : <button className="button button-primary" onClick={location.start}><LocateFixed size={18} />Моё местоположение</button>}</div>
      {location.error && <p className="location-error" role="status">{location.error}</p>}
      {location.position && <div className="location-details"><p>Точность: ±{Math.round(location.position.accuracy)} м.{location.poorAccuracy && ' Точность низкая — ориентируйтесь по карте и указателям.'}{location.outside && ' Вы вне Валлетты; все точки доступны для ручного выбора.'}</p>{nearest && <p className="nearest-stop">Ближайшая выбранная: <button className="inline-button" onClick={() => setSelectedId(nearest.stop.id)}>{nearest.stop.title}</button> · <strong>{distanceLabel(nearest.distance)} по прямой</strong></p>}<button className="text-button" onClick={() => mapRef.current?.setView([location.position!.lat, location.position!.lng], 17, { animate: false })}>Показать меня на карте<LocateFixed size={15} /></button></div>}
      <small>Только пока открыта эта карта. В фоне GPS выключается; история перемещений не сохраняется. Аудио не включается автоматически.</small>
    </div>
    {changed && <div className="schematic-notice"><Info size={19} /><p>Ваш маршрут изменён. Пунктир — <strong>прямые отрезки, схема порядка</strong>, а не пеший путь. Для дороги по улицам откройте OpenStreetMap.</p></div>}
    {!stops.length && <p className="notice">Все точки пропущены. Верните нужные в «Мой маршрут» или добавьте свою.</p>}
    {pickMode && <p className="notice"><MapPin size={20} />Нажмите место на карте, затем задайте название и добавьте точку.</p>}
    <div className="map-and-stop"><div className="interactive-map" ref={hostRef} aria-label="Карта с номерами историй" /><aside className="map-selected">{pickMode ? <><p className="eyebrow">СВОЯ ТОЧКА</p><h2>Отметьте место</h2><CustomStopForm onAdd={onAdd} coordinates={coordinates} /></> : <><div className="map-selected-top"><p className="eyebrow">{selected.custom ? 'СВОЯ ТОЧКА' : `ИСТОРИЯ · ${pad(selected.id)}`}{index >= 0 && ` / В МАРШРУТЕ ${index + 1}`}</p><MapPin size={20} /></div><h2>{selected.title}</h2><p>{selected.subtitle}</p><a className="button button-primary" href={stopHref(selected)}>К рассказу<ArrowUpRight size={17} /></a><a className="button button-outline" href={previous ? directionsUrl(previous, selected) : placeUrl(selected)} target="_blank" rel="noreferrer">{previous ? 'От предыдущей точки' : 'Открыть в OSM'}<ArrowUpRight size={17} /></a><div className="map-walk-note"><Footprints size={18} /><p>{changed ? 'Пунктир обозначает ваш порядок. Пеший путь откроется по кнопке выше.' : routeLoaded ? 'Авторская линия рассчитана по уличной сети; проходимость на месте не проверена.' : 'Линия загружается. Переходы описаны в каждой истории.'}</p></div><label className="map-select-label" htmlFor="map-stop-select">Выбрать точку вручную</label><select id="map-stop-select" value={selected.id} onChange={event => setSelectedId(Number(event.target.value))}>{allStops.map(stop => <option value={stop.id} key={stop.id}>{stopNumber(stop)} · {stop.title}</option>)}</select></>}</aside></div>
    {next && !pickMode && <div className="map-next"><span>Следующая непосещённая: <a href={stopHref(next)}>{next.title}</a></span>{location.position && <a className="text-link" href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${location.position.lat}%2C${location.position.lng}%3B${next.lat}%2C${next.lng}`} target="_blank" rel="noreferrer">Пеший путь от меня<ArrowUpRight size={15} /></a>}</div>}
    <p className="map-helper">Для масштаба используйте + / − или два пальца. GPS не перемещает карту и не меняет выбранную историю.</p>{(routeError || tilesError) && <div className="notice" role="status"><Info size={20} /><p>{tilesError ? 'Подложка загрузилась не полностью. ' : ''}{routeError ? 'Авторская линия недоступна. ' : ''}Используйте карты по частям ниже или откройте точку в OpenStreetMap.</p></div>}
  </section>
}
