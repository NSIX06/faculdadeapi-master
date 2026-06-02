'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseApiResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useApi<T>(fetcher: () => Promise<T>): UseApiResult<T> {
  const [data, setData]         = useState<T | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [trigger, setTrigger]   = useState(0)

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcherRef.current()
      .then(result => { if (!cancelled) { setData(result); setLoading(false) } })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [trigger])

  const refetch = useCallback(() => setTrigger(t => t + 1), [])

  return { data, isLoading, error, refetch }
}
