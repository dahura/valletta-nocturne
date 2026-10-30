import { useCallback, useEffect, useState } from 'react'
import { bx } from '../../lib/bx'
import type { Guide } from '../../types'
import { requireAuthorGuide } from './validateGuide'

/** Verified catalog from the real BX guide.get procedure; GPS/route stay local. */
export function useGuide() {
  const query = bx.guide.get.useQuery({}, { retry: false, networkMode: 'always', select: requireAuthorGuide })
  const [fallback, setFallback] = useState<{ data?: Guide; error?: Error }>({})
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (query.data) return
    const controller = new AbortController()
    let active = true
    let timeout: ReturnType<typeof setTimeout> | undefined
    const load = async () => {
      timeout = setTimeout(() => controller.abort(), 8_000)
      try {
        const response = await fetch('/data/guide.json', { signal: controller.signal, cache: 'no-cache' })
        if (!response.ok) throw new Error('Не удалось загрузить сохранённый гид.')
        const data = requireAuthorGuide(await response.json())
        if (active) setFallback({ data })
      } catch (error) {
        if (active) setFallback({ error: error instanceof Error ? error : new Error('Гид недоступен.') })
      } finally { clearTimeout(timeout) }
    }
    // Start immediately after an API error, or after four seconds without data.
    const timer = setTimeout(() => { void load() }, query.isError ? 0 : 4_000)
    return () => { active = false; clearTimeout(timer); clearTimeout(timeout); controller.abort() }
  }, [query.data, query.isError, attempt])

  const refetchQuery = query.refetch
  const refetch = useCallback(() => {
    setFallback({})
    setAttempt(value => value + 1)
    return refetchQuery()
  }, [refetchQuery])
  const data = query.data ?? fallback.data
  return {
    data, refetch,
    isLoading: !data && !fallback.error,
    isError: !data && !!fallback.error,
    error: fallback.error ?? query.error,
    source: query.data ? 'bx' as const : fallback.data ? 'static' as const : undefined,
  }
}
