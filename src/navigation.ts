import type { Stop } from './types'

export const coordinateLabel = (point: { lat: number; lng: number }) => `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`

export function navigationDestination(stop: Stop) {
  return stop.taxiDestination ?? { name: stop.title, address: stop.address ?? `Точка на карте: ${coordinateLabel(stop)}`, lat: stop.lat, lng: stop.lng }
}

// Current rider CTA issued by Bolt's first-party homepage JS (research handoff).
// Destination parameters are unverified; do not add them or website GPS pickup.
export const BOLT_RIDER_URL = 'https://bolt.sng.link/Epy3j/o5l4/8p88'
export const boltUrl = (_stop: Stop) => BOLT_RIDER_URL

export function navigationMapUrl(stop: Stop) {
  const destination = navigationDestination(stop)
  const url = new URL('https://www.google.com/maps/search/')
  url.searchParams.set('api', '1')
  url.searchParams.set('query', `${destination.lat},${destination.lng}`)
  return url.toString()
}

export function destinationCopyText(stop: Stop) {
  const destination = navigationDestination(stop)
  return stop.taxiDestination ? `${destination.name}, ${destination.address}` : stop.address ?? coordinateLabel(stop)
}
