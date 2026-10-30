import { useEffect, useState } from 'react'

export interface Position { lat: number; lng: number; accuracy: number; timestamp: number }

export function useLocation() {
  const [enabled, setEnabled] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const [error, setError] = useState('')
  const [waiting, setWaiting] = useState(false)
  const start = () => {
    setError('')
    if (!navigator.geolocation) { setError('Браузер не поддерживает GPS. Выберите точку вручную.'); return }
    if (!window.isSecureContext) { setError('Для GPS нужен защищённый адрес сайта. Карта и ручной выбор работают.'); return }
    setEnabled(true); setWaiting(true)
  }
  const stop = () => { setEnabled(false); setPosition(null); setWaiting(false) }

  useEffect(() => {
    if (!enabled || !navigator.geolocation) return
    let active = true
    const id = navigator.geolocation.watchPosition(result => {
      if (!active) return
      const { latitude: lat, longitude: lng, accuracy } = result.coords
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(accuracy)) return
      setPosition({ lat, lng, accuracy, timestamp: result.timestamp }); setWaiting(false); setError('')
    }, failure => {
      if (!active) return
      const messages: Record<number, string> = { 1: 'Доступ к геопозиции запрещён. Разрешите его в настройках браузера или выберите точку вручную.', 2: 'Местоположение не определилось. Попробуйте на открытом месте или выберите точку вручную.', 3: 'GPS не ответил вовремя. Повторите запрос или выберите точку вручную.' }
      setError(messages[failure.code] || 'GPS недоступен. Ручной выбор работает.'); setEnabled(false); setWaiting(false); setPosition(null)
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 })
    const onHidden = () => { if (document.hidden) { setEnabled(false); setPosition(null); setWaiting(false) } }
    const onLeave = () => navigator.geolocation.clearWatch(id)
    document.addEventListener('visibilitychange', onHidden)
    window.addEventListener('pagehide', onLeave)
    return () => { active = false; navigator.geolocation.clearWatch(id); document.removeEventListener('visibilitychange', onHidden); window.removeEventListener('pagehide', onLeave) }
  }, [enabled])

  const outside = position ? position.lat < 35.889 || position.lat > 35.908 || position.lng < 14.501 || position.lng > 14.526 : false
  return { enabled, position, waiting, error, outside, poorAccuracy: !!position && position.accuracy > 100, start, stop }
}

export type LocationState = ReturnType<typeof useLocation>
