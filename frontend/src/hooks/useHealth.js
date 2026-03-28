import { useEffect } from 'react'
import { fetchHealth } from '@/lib/api'
import useAppStore from '@/store/useAppStore'

export function useHealth() {
  const setBackendHealth = useAppStore((s) => s.setBackendHealth)

  useEffect(() => {
    async function check() {
      try {
        const data = await fetchHealth()
        setBackendHealth(data.model_loaded ? 'ok' : 'degraded')
      } catch {
        setBackendHealth('offline')
      }
    }
    check()
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  }, [setBackendHealth])
}
