import type { Guide } from '../../types'

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const sources = (value: unknown) => Array.isArray(value) && value.every(source => record(source) && text(source.label) && text(source.url))

/** Validate both network sources against the frozen 13-stop author contract. */
export function requireAuthorGuide(value: unknown): Guide {
  // Eden revives ISO calendar dates as Date; restore this contract's date string.
  if (record(value) && value.date instanceof Date && Number.isFinite(value.date.getTime())) {
    value = { ...value, date: value.date.toISOString().slice(0, 10) }
  }
  const valid = (() => {
    if (!record(value) || !['title', 'subtitle', 'duration', 'distance', 'intro'].every(key => text(value[key]))) return false
    if (value.date !== '2026-10-30' || !Array.isArray(value.routeNotes) || !value.routeNotes.every(text)) return false
    if (!sources(value.sources) || !Array.isArray(value.practical) || !value.practical.every(item =>
      record(item) && text(item.title) && text(item.text) && typeof item.verified === 'boolean' && (item.url === undefined || text(item.url))
    )) return false
    if (!Array.isArray(value.stops) || value.stops.length !== 13) return false
    const ids = new Set<number>()
    const slugs = new Set<string>()
    return value.stops.every(stop => {
      if (!record(stop) || !finite(stop.id) || !Number.isInteger(stop.id) || stop.id < 1 || stop.id > 13 || ids.has(stop.id)) return false
      if (!text(stop.slug) || slugs.has(stop.slug) || !['title', 'subtitle', 'narration', 'nextDirections'].every(key => text(stop[key]))) return false
      if (!finite(stop.lat) || Math.abs(stop.lat) > 90 || !finite(stop.lng) || Math.abs(stop.lng) > 180 || !finite(stop.walkMinutes) || stop.walkMinutes < 0) return false
      const sections = stop.sections
      if (!record(sections) || !['what', 'history', 'look'].every(key => text(sections[key])) || (sections.legend !== undefined && !text(sections.legend))) return false
      const image = stop.image
      if (!record(image) || !['src', 'alt', 'author', 'license', 'sourceUrl'].every(key => text(image[key])) || !sources(stop.sources)) return false
      ids.add(stop.id)
      slugs.add(stop.slug)
      return true
    })
  })()
  if (!valid) throw new Error('Данные гида не содержат полный проверенный маршрут из 13 остановок.')
  return value as Guide
}
