import { useState } from 'react'
import { ArrowUpRight, Car, Copy, MapPin } from 'lucide-react'
import type { Stop } from './types'
import { mapHref } from './types'
import { boltUrl, coordinateLabel, destinationCopyText, navigationDestination, navigationMapUrl } from './navigation'

export function StopNavigation({ stop, taxiOnly = false }: { stop: Stop; taxiOnly?: boolean }) {
  const [message, setMessage] = useState('')
  const destination = navigationDestination(stop)
  const copy = async (value: string) => {
    setMessage('')
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(value)
      setMessage('Скопировано. Можно вставить в Bolt.')
    } catch { setMessage('Не удалось скопировать. Выделите и скопируйте текст адреса вручную.') }
  }
  return <section className="stop-navigation" aria-label={taxiOnly ? 'На такси к началу прогулки' : 'Адрес и как добраться'}>
    {!taxiOnly && <div className="address-row"><div><p className="eyebrow">{stop.address ? 'Адрес' : 'Точка на карте'}</p><p className="selectable-address">{stop.address ?? `${stop.title} · ${coordinateLabel(stop)}`}</p></div><button type="button" className="text-button" onClick={() => void copy(stop.address ?? coordinateLabel(stop))}><Copy size={16} aria-hidden="true" />Скопировать</button></div>}
    {stop.taxiDestination && <div className="taxi-destination"><p className="eyebrow">{taxiOnly ? 'К началу прогулки · для такси' : 'Ориентир для такси'}</p><p className="selectable-address"><strong>{destination.name}</strong><br />{destination.address}</p><p className="navigation-note">{stop.taxiDestination.note}</p></div>}
    {taxiOnly && !stop.taxiDestination && <p className="selectable-address">{destination.name} · {destination.address}</p>}
    <div className="button-group navigation-actions"><a className="button button-outline" href={boltUrl(stop)} target="_blank" rel="noopener noreferrer"><Car size={17} aria-hidden="true" />Открыть в Bolt<ArrowUpRight size={15} aria-hidden="true" /></a><a className="button button-outline" href={taxiOnly ? navigationMapUrl(stop) : mapHref(stop)} {...(taxiOnly ? { target: '_blank', rel: 'noopener noreferrer' } : {})}><MapPin size={17} aria-hidden="true" />На карте</a>{(stop.taxiDestination || taxiOnly) && <button type="button" className="text-button" onClick={() => void copy(destinationCopyText(stop))}><Copy size={16} aria-hidden="true" />Скопировать для такси</button>}</div>
    <p className="navigation-note">Адрес нужно вставить в Bolt вручную. Проверьте доступную точку высадки в Bolt.</p>
    <p className="copy-status" role="status" aria-live="polite" aria-atomic="true">{message}</p>
  </section>
}
