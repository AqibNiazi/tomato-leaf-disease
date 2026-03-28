import { AnimatePresence, motion } from 'framer-motion'
import { DropZone } from './DropZone'
import { ScanAnimation } from './ScanAnimation'
import { ResultCard } from './ResultCard'
import { ErrorState } from './ErrorState'
import useAppStore from '@/store/useAppStore'
import { usePredict } from '@/hooks/usePredict'

export function PredictorPanel() {
  const { predictionStatus, prediction, predictionError, previewUrl } = useAppStore()
  const { reset } = usePredict()

  return (
    <AnimatePresence mode="wait">
      {predictionStatus === 'idle' && (
        <motion.div key="drop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <DropZone />
        </motion.div>
      )}

      {(predictionStatus === 'uploading' || predictionStatus === 'scanning') && (
        <motion.div key="scan" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex justify-center">
          <ScanAnimation />
        </motion.div>
      )}

      {predictionStatus === 'done' && prediction && (
        <motion.div key="result" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <ResultCard result={prediction} previewUrl={previewUrl} onReset={reset} />
        </motion.div>
      )}

      {predictionStatus === 'error' && (
        <motion.div key="error" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <ErrorState message={predictionError} onRetry={reset} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
