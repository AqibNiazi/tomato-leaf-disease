import { useCallback } from 'react'
import { predictDisease } from '@/lib/api'
import useAppStore from '@/store/useAppStore'

export function usePredict() {
  const {
    setPrediction, setPredictionStatus, setPredictionError,
    setUploadProgress, setPreviewUrl, resetPrediction, addToHistory,
  } = useAppStore()

  const runPrediction = useCallback(async (file) => {
    if (!file) return
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)
    setPredictionStatus('uploading')
    setUploadProgress(0)

    try {
      const result = await predictDisease(file, (pct) => {
        setUploadProgress(pct)
        if (pct === 100) setPredictionStatus('scanning')
      })
      await new Promise((r) => setTimeout(r, 1200))
      setPrediction(result)
      addToHistory({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        previewUrl: preview,
        fileName: file.name,
        result,
      })
    } catch (err) {
      setPredictionError(err.message || 'Prediction failed.')
    }
  }, [addToHistory, setPrediction, setPredictionError,
      setPredictionStatus, setUploadProgress, setPreviewUrl])

  const reset = useCallback(() => resetPrediction(), [resetPrediction])
  return { runPrediction, reset }
}
