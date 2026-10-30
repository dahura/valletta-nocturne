import type { ReactNode } from 'react'
import { BXProvider, createBXClient } from '@dahura/bx/client'
import type { AppRouter } from './server'

let photoController: AbortController | null = null
export function abortPhotoRequest() { photoController?.abort(); photoController = null }
export function beginPhotoRequest() { abortPhotoRequest(); photoController = new AbortController() }

const photoFetch = (async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const signal = /\/photo\/(explain|confirm)$/.test(new URL(url, window.location.origin).pathname) ? photoController?.signal : undefined
  const response = await fetch(input, { ...init, ...(signal ? { signal } : {}) })
  if (!response.ok) {
    const value = await response.clone().json().catch(() => null) as { message?: string } | null
    throw new Error(value?.message ?? (response.status === 429 ? 'Слишком много запросов. Попробуйте позже.' : 'Не удалось получить ответ фотогида.'))
  }
  return response
}) as typeof fetch

export const bx = createBXClient<AppRouter>({
  baseUrl: typeof window === 'undefined' ? 'http://localhost:5173/api/bx' : `${window.location.origin}/api/bx`,
  invalidates: { 'photo/explain': [], 'photo/confirm': [] }, fetch: photoFetch,
})

export function BXAppProvider({ children }: { children: ReactNode }) {
  return <BXProvider client={bx} queryClientConfig={{ defaultOptions: { queries: { retry: 1, staleTime: 60_000 }, mutations: { retry: false, gcTime: 0 } } }}>{children}</BXProvider>
}
