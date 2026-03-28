import { useState, useEffect } from 'react'
import { fetchClasses } from '@/lib/api'

export function useClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchClasses()
      .then((data) => setClasses(data.classes || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { classes, loading, error }
}
