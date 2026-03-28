import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, ImageIcon, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { usePredict } from '@/hooks/usePredict'
import useAppStore from '@/store/useAppStore'

const ACCEPTED = { 'image/jpeg': ['.jpg','.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }
const MAX_SIZE = 8 * 1024 * 1024

export function DropZone() {
  const { runPrediction } = usePredict()
  const [dragError, setDragError] = useState(null)
  const predictionStatus = useAppStore((s) => s.predictionStatus)

  const onDrop = useCallback((accepted, rejected) => {
    setDragError(null)
    if (rejected.length > 0) {
      const err = rejected[0].errors[0]
      setDragError(err.code === 'file-too-large' ? 'File exceeds 8 MB limit.' : 'Only JPEG, PNG and WebP accepted.')
      return
    }
    if (accepted.length > 0) runPrediction(accepted[0])
  }, [runPrediction])

  const isProcessing = ['uploading','scanning'].includes(predictionStatus)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED, maxSize: MAX_SIZE, multiple: false, disabled: isProcessing,
  })

  return (
    <motion.div
      {...getRootProps()}
      whileHover={!isProcessing ? { scale: 1.005 } : {}}
      className={cn(
        'relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-10 flex flex-col items-center justify-center gap-5 min-h-[320px] overflow-hidden',
        isDragActive ? 'border-green-400 bg-green-500/10 shadow-lg shadow-green-500/20' : 'border-white/10 bg-white/3 hover:border-green-500/40 hover:bg-green-500/5',
        isProcessing && 'pointer-events-none opacity-60'
      )}
    >
      <input {...getInputProps()} />
      {/* Corner accents */}
      {[['top-0 left-0','tl'],['top-0 right-0','tr'],['bottom-0 left-0','bl'],['bottom-0 right-0','br']].map(([pos, corner]) => (
        <span key={corner} className={`absolute ${pos} w-5 h-5 ${
          corner === 'tl' ? 'border-t-2 border-l-2 rounded-tl-xl' :
          corner === 'tr' ? 'border-t-2 border-r-2 rounded-tr-xl' :
          corner === 'bl' ? 'border-b-2 border-l-2 rounded-bl-xl' :
                            'border-b-2 border-r-2 rounded-br-xl'
        } ${isDragActive ? 'border-green-400' : 'border-white/20'} transition-colors duration-300`} />
      ))}

      <motion.div animate={isDragActive ? {scale:1.1,rotate:5} : {scale:1,rotate:0}} className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isDragActive
            ? <motion.div key="leaf" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}><Leaf size={32} className="text-green-400" /></motion.div>
            : <motion.div key="up" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}><Upload size={32} className="text-slate-400" /></motion.div>
          }
        </AnimatePresence>
      </motion.div>

      <div className="text-center space-y-1.5">
        <p className="text-base font-semibold text-slate-200">{isDragActive ? 'Release to analyze' : 'Drop a leaf image here'}</p>
        <p className="text-sm text-slate-500">or click to browse your files</p>
        <p className="text-xs text-slate-600">JPEG · PNG · WebP · Max 8 MB</p>
      </div>
      <Button variant="outline" className="pointer-events-none"><ImageIcon size={14} />Choose image</Button>
      <AnimatePresence>
        {dragError && (
          <motion.p initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="absolute bottom-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
            {dragError}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
