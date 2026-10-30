import { useMemo, useState } from 'react'
import type { Stop } from './types'

const STORAGE_KEY = 'valletta-nocturne.route.v1'
const EMPTY_STOPS: Stop[] = []
interface CustomPoint { id: number; title: string; lat: number; lng: number }
interface RouteState {
  order: number[]
  skipped: number[]
  visited: number[]
  customPoints: CustomPoint[]
  recentStop: number | null
  preferences: { hideVisited: boolean; audioSpeed: number }
}
interface SavedRoute { version: 1; state: RouteState; undo?: RouteState }
const fresh = (): RouteState => ({ order: [], skipped: [], visited: [], customPoints: [], recentStop: null, preferences: { hideVisited: false, audioSpeed: 1 } })
const ids = (input: unknown) => Array.isArray(input) ? [...new Set(input.filter((id): id is number => typeof id === 'number' && Number.isSafeInteger(id) && id > 0))].slice(0, 100) : []

function readState(input: unknown): RouteState {
  if (!input || typeof input !== 'object') return fresh()
  const value = input as Partial<RouteState>
  const points = Array.isArray(value.customPoints) ? value.customPoints.filter(point => point && Number.isSafeInteger(point.id) && point.id > 1000 && typeof point.title === 'string' && point.title.trim().length > 0 && point.title.length <= 100 && Number.isFinite(point.lat) && Math.abs(point.lat) <= 90 && Number.isFinite(point.lng) && Math.abs(point.lng) <= 180).slice(0, 25) : []
  return { order: ids(value.order), skipped: ids(value.skipped), visited: ids(value.visited), customPoints: points,
    recentStop: typeof value.recentStop === 'number' && Number.isSafeInteger(value.recentStop) ? value.recentStop : null,
    preferences: { hideVisited: value.preferences?.hideVisited === true, audioSpeed: [0.85, 1, 1.25].includes(value.preferences?.audioSpeed ?? 0) ? value.preferences!.audioSpeed : 1 } }
}

function load(): { state: RouteState; undo?: RouteState; notice: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { state: fresh(), notice: '' }
    const value = JSON.parse(raw) as Partial<SavedRoute>
    if (value.version !== 1) return { state: fresh(), notice: 'Сохранение другой версии не прочитано. Открыт авторский маршрут.' }
    return { state: readState(value.state), undo: value.undo ? readState(value.undo) : undefined, notice: '' }
  } catch { return { state: fresh(), notice: 'Не удалось прочитать сохранение. Маршрут можно настроить заново.' } }
}

function customStop(point: CustomPoint): Stop {
  return { ...point, slug: `my-${point.id}`, subtitle: 'Ваша точка маршрута', custom: true,
    sections: { what: 'Эту точку вы добавили сами. Для неё нет записанного рассказа. Можно посмотреть место на карте и продолжить прогулку.', history: '', look: '' },
    narration: '', image: { src: '', alt: '', author: '', license: '', sourceUrl: '' }, sources: [], nextDirections: '', walkMinutes: 0 }
}

export function metresBetween(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const rad = Math.PI / 180
  const deltaLat = (to.lat - from.lat) * rad
  const deltaLng = (to.lng - from.lng) * rad
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(from.lat * rad) * Math.cos(to.lat * rad) * Math.sin(deltaLng / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)))
}

export function distanceLabel(distance: number) { return distance < 10 ? 'менее 10 м' : distance < 1000 ? `≈ ${Math.round(distance / 10) * 10} м` : `≈ ${(distance / 1000).toFixed(1)} км` }

export function usePersonalRoute(authorStops: Stop[] = EMPTY_STOPS) {
  const [saved, setSaved] = useState(load)
  const state = saved.state
  const allStops = useMemo(() => [...authorStops, ...state.customPoints.map(customStop)], [authorStops, state.customPoints])
  const byId = useMemo(() => new Map(allStops.map(stop => [stop.id, stop])), [allStops])
  const order = [...state.order.filter(id => byId.has(id)), ...allStops.map(stop => stop.id).filter(id => !state.order.includes(id))]
  const ordered = order.map(id => byId.get(id)!)
  const selected = ordered.filter(stop => !state.skipped.includes(stop.id))
  const changed = selected.length !== authorStops.length || selected.some((stop, i) => stop.id !== authorStops[i]?.id)
  const linearMetres = selected.slice(1).reduce((total, stop, i) => total + metresBetween(selected[i], stop), 0)
  const estimateMinutes = Math.ceil(linearMetres / 65) + selected.length * 3

  const write = (next: RouteState, undo = state) => {
    let notice = ''
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state: next, undo } satisfies SavedRoute)) }
    catch { notice = 'Хранилище браузера недоступно. Изменения действуют только до закрытия страницы.' }
    setSaved({ state: next, undo, notice })
  }
  const move = (id: number, direction: -1 | 1) => {
    const index = order.indexOf(id), target = index + direction
    if (index < 0 || target < 0 || target >= order.length) return
    const next = [...order]; [next[index], next[target]] = [next[target], next[index]]
    write({ ...state, order: next })
  }
  const toggleSkip = (id: number) => write({ ...state, order, skipped: state.skipped.includes(id) ? state.skipped.filter(item => item !== id) : [...state.skipped, id] })
  const toggleVisited = (id: number) => write({ ...state, order, visited: state.visited.includes(id) ? state.visited.filter(item => item !== id) : [...state.visited, id] })
  const reset = () => write({ ...fresh(), order: authorStops.map(stop => stop.id), preferences: state.preferences })
  const undo = () => { if (saved.undo) write(saved.undo, state) }
  const remember = (id: number) => {
    if (state.recentStop === id || !byId.has(id)) return
    const next = { ...state, recentStop: id }
    let notice = saved.notice
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state: next, undo: saved.undo } satisfies SavedRoute)) }
    catch { notice = 'Изменения не сохраняются между посещениями: хранилище браузера недоступно.' }
    setSaved({ ...saved, state: next, notice })
  }
  const addPoint = (title: string, lat: number, lng: number) => {
    if (!title.trim() || title.trim().length > 100 || !Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lng) || Math.abs(lng) > 180 || state.customPoints.length >= 25) return null
    const point: CustomPoint = { id: Date.now() + Math.floor(Math.random() * 1000), title: title.trim(), lat, lng }
    write({ ...state, customPoints: [...state.customPoints, point], order: [...order, point.id] })
    return customStop(point)
  }
  const setPreference = <K extends keyof RouteState['preferences']>(key: K, value: RouteState['preferences'][K]) => write({ ...state, order, preferences: { ...state.preferences, [key]: value } })
  return { state, allStops, ordered, selected, changed, estimateMinutes, linearMetres, notice: saved.notice, canUndo: !!saved.undo, move, toggleSkip, toggleVisited, reset, undo, remember, addPoint, setPreference }
}

export type PersonalRoute = ReturnType<typeof usePersonalRoute>
