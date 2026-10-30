export interface Source {
  label: string
  url: string
  checked?: string
}

export interface GuideImage {
  src: string
  alt: string
  author: string
  license: string
  sourceUrl: string
}

export interface Stop {
  id: number
  slug: string
  title: string
  subtitle: string
  lat: number
  lng: number
  address?: string
  taxiDestination?: { name: string; address: string; lat: number; lng: number; note: string }
  sections: { what: string; history: string; look: string; legend?: string }
  narration: string
  image: GuideImage
  sources: Source[]
  nextDirections: string
  walkMinutes: number
  custom?: boolean
}

export interface Guide {
  title: string
  subtitle: string
  date: string
  duration: string
  distance: string
  intro: string
  routeNotes: string[]
  stops: Stop[]
  practical: { title: string; text: string; url?: string; verified: boolean }[]
  sources: Source[]
}

export interface AudioTrack {
  id: number
  title?: string
  src: string
  duration: number
}

export interface AudioManifest {
  voiceName?: string
  provider?: string
  fictionalVoice?: boolean
  complete?: boolean
  tracks: AudioTrack[]
}

export type Page = { kind: 'home' | 'route' | 'practical' | 'photo' } | { kind: 'stop'; slug: string } | { kind: 'map'; id?: number; pick?: boolean }

export function readPage(): Page {
  const hash = window.location.hash.slice(1)
  if (hash.startsWith('stop/')) return { kind: 'stop', slug: decodeURIComponent(hash.slice(5)) }
  if (hash.startsWith('map')) {
    const id = Number(hash.split('/')[1])
    return { kind: 'map', id: Number.isFinite(id) && id > 0 ? id : undefined, pick: hash === 'map/pick' }
  }
  if (hash === 'route' || hash === 'practical' || hash === 'photo') return { kind: hash }
  return { kind: 'home' }
}

export const stopHref = (stop: Stop) => `#stop/${stop.slug}`
export const mapHref = (stop?: Stop) => stop ? `#map/${stop.id}` : '#map'
export const pad = (id: number) => String(id).padStart(2, '0')
export const placeUrl = (stop: Stop) => `https://www.openstreetmap.org/?mlat=${stop.lat}&mlon=${stop.lng}#map=18/${stop.lat}/${stop.lng}`
export const directionsUrl = (from: Stop, to: Stop) => `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${from.lat}%2C${from.lng}%3B${to.lat}%2C${to.lng}`
export const timeLabel = (time: number) => Number.isFinite(time) && time >= 0 ? `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}` : '—:—'
export const stopNumber = (stop: Stop) => stop.custom ? '+' : pad(stop.id)

export function validateGuide(value: unknown): value is Guide {
  if (!value || typeof value !== 'object') return false
  const guide = value as Guide
  return typeof guide.intro === 'string' && Array.isArray(guide.stops) && guide.stops.length > 0 && guide.stops.every(stop =>
    Number.isFinite(stop.id) && typeof stop.slug === 'string' && typeof stop.title === 'string' &&
    Number.isFinite(stop.lat) && Number.isFinite(stop.lng) && !!stop.sections && typeof stop.sections.what === 'string'
  ) && Array.isArray(guide.practical) && Array.isArray(guide.sources) && Array.isArray(guide.routeNotes)
}

export function parseManifest(value: unknown): AudioManifest {
  if (!value || typeof value !== 'object') return { tracks: [] }
  const data = value as AudioManifest
  return { ...data, tracks: Array.isArray(data.tracks) ? data.tracks.filter(track =>
    Number.isFinite(track.id) && typeof track.src === 'string' && /^\/audio\/[^?]+\.mp3$/.test(track.src) &&
    Number.isFinite(track.duration) && track.duration > 0
  ) : [] }
}
