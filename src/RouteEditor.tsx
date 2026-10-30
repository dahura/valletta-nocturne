import { useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpRight, Camera, Check, MapPin, Plus, RotateCcw, Undo2 } from 'lucide-react'
import type { FormEvent } from 'react'
import type { PersonalRoute } from './personal-route'
import type { Stop } from './types'
import { stopHref, stopNumber } from './types'

export function RouteEditor({ route }: { route: PersonalRoute }) {
  const [message, setMessage] = useState('')
  const shown = route.state.preferences.hideVisited ? route.ordered.filter(stop => !route.state.visited.includes(stop.id)) : route.ordered
  return <section className="route-editor" aria-label="Настройка моего маршрута"><div className="editor-toolbar"><label className="checkbox-label"><input type="checkbox" checked={route.state.preferences.hideVisited} onChange={event => route.setPreference('hideVisited', event.target.checked)} />Скрывать посещённые</label><div className="editor-reset"><button className="text-button" onClick={() => { route.reset(); setMessage('Восстановлен авторский маршрут. Изменения можно отменить.') }}><RotateCcw size={16} />Авторская петля</button><button className="text-button" disabled={!route.canUndo} onClick={() => { route.undo(); setMessage('Последнее изменение отменено.') }}><Undo2 size={16} />Отменить</button></div></div>
    <p className="editor-help">Номер истории совпадает с PDF и аудио. Порядок прогулки — ваш.</p>
    <div className="route-message" role="status">{message || route.notice}</div>
    <ol className="editable-stops">{shown.map(stop => {
      const index = route.ordered.findIndex(item => item.id === stop.id)
      const skipped = route.state.skipped.includes(stop.id)
      const visited = route.state.visited.includes(stop.id)
      const position = route.selected.findIndex(item => item.id === stop.id) + 1
      return <li key={stop.id} className={`${skipped ? 'is-skipped' : ''} ${visited ? 'is-visited' : ''}`}><div className="editable-stop-main"><span className="editor-order" aria-label={skipped ? 'Пропущена' : `Порядок в маршруте: ${position}`}>{skipped ? '—' : `${position}.`}</span><span className="stable-number" aria-label={stop.custom ? 'Своя точка' : `История ${stop.id}`}>{stopNumber(stop)}</span><a className="editable-stop-title" href={stopHref(stop)}>{stop.title}<small>{stop.custom ? 'Своя точка · без записи' : stop.subtitle}</small></a><div className="reorder-buttons"><button className="icon-button" disabled={index === 0} aria-label={`Поднять выше: ${stop.title}`} onClick={() => { route.move(stop.id, -1); setMessage(`${stop.title}: перемещено выше.`) }}><ArrowUp size={18} /></button><button className="icon-button" disabled={index === route.ordered.length - 1} aria-label={`Опустить ниже: ${stop.title}`} onClick={() => { route.move(stop.id, 1); setMessage(`${stop.title}: перемещено ниже.`) }}><ArrowDown size={18} /></button></div></div><div className="editable-stop-actions"><button className="visited-button" aria-pressed={visited} aria-label={`Уже были: ${stop.title}`} onClick={() => route.toggleVisited(stop.id)}><Check size={15} />Уже были</button><button className="skip-button" aria-label={`${skipped ? 'Вернуть' : 'Пропустить'}: ${stop.title}`} onClick={() => { route.toggleSkip(stop.id); setMessage(`${stop.title}: ${skipped ? 'возвращена в маршрут' : 'пропущена'}.`) }}>{skipped ? 'Вернуть в маршрут' : 'Пропустить'}</button><a className="stop-map-link" href={`#map/${stop.id}`} aria-label={`На карте: ${stop.title}`}><MapPin size={16} />На карте</a></div></li>
    })}</ol>{!shown.length && <p className="notice">Здесь нет точек для отображения. Выключите «Скрывать посещённые» или добавьте свою точку.</p>}
    <details className="add-point-details"><summary><Plus size={20} />Добавить свою точку</summary><CustomStopForm onAdd={route.addPoint} /><a className="text-link" href="#map/pick">Выбрать место на карте<ArrowUpRight size={16} /></a></details>
    <div className="photo-entry"><Camera size={25} aria-hidden="true" /><div><h3>Что перед вами?</h3><p>Можно спросить гида по фотографии места.</p></div><a className="button button-outline" href="#photo">Спросить по фото<ArrowUpRight size={17} /></a></div>
  </section>
}

export function CustomStopForm({ onAdd, coordinates }: { onAdd: (title: string, lat: number, lng: number) => Stop | null; coordinates?: { lat: number; lng: number } }) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const rawLat = String(form.get('latitude') || '').trim(), rawLng = String(form.get('longitude') || '').trim()
    if (!rawLat || !rawLng) { setError('Укажите обе координаты или выберите место на карте.'); return }
    const result = onAdd(title, Number(rawLat.replace(',', '.')), Number(rawLng.replace(',', '.')))
    if (!result) { setError('Проверьте название и координаты. Можно добавить не более 25 своих точек.'); return }
    window.location.hash = stopHref(result).slice(1)
  }
  return <form className="custom-point-form" onSubmit={submit}><label>Название<input name="point-title" value={title} onChange={event => setTitle(event.target.value)} maxLength={100} required placeholder="Например, место для кофе" /></label><div className="coordinate-fields" key={coordinates ? `${coordinates.lat},${coordinates.lng}` : 'manual'}><label>Широта<input name="latitude" inputMode="decimal" defaultValue={coordinates?.lat.toFixed(6)} placeholder="35.898000" required /></label><label>Долгота<input name="longitude" inputMode="decimal" defaultValue={coordinates?.lng.toFixed(6)} placeholder="14.514000" required /></label></div><p>Координаты сохраняются только как выбранная вами точка. Записанного рассказа для неё нет.</p>{error && <p role="alert" className="form-error">{error}</p>}<button className="button button-primary" type="submit">Добавить в мой маршрут<Plus size={17} /></button></form>
}
