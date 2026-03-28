import { motion } from 'framer-motion'
import { ProgressBar } from '@/components/ui/ProgressBar'
import useAppStore from '@/store/useAppStore'

export function ScanAnimation() {
  const { predictionStatus, previewUrl, uploadProgress } = useAppStore()
  const isUploading = predictionStatus === 'uploading'
  const isScanning  = predictionStatus === 'scanning'

  if (!previewUrl || (!isUploading && !isScanning)) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center gap-6 w-full"
    >
      {/* Image with scan overlay */}
      <div className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <img src={previewUrl} alt="Leaf preview" className="w-full object-cover aspect-square" />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-900/50" />

        {/* Corner brackets */}
        {[['top-3 left-3','tl'],['top-3 right-3','tr'],['bottom-3 left-3','bl'],['bottom-3 right-3','br']].map(([pos, c]) => (
          <span key={c} className={`absolute ${pos} w-6 h-6 border-green-400 ${
            c==='tl'?'border-t-2 border-l-2':c==='tr'?'border-t-2 border-r-2':c==='bl'?'border-b-2 border-l-2':'border-b-2 border-r-2'
          }`} />
        ))}

        {/* Scan line */}
        {isScanning && (
          <motion.div
            className="scan-line absolute left-0 right-0"
            animate={{ top: ['5%', '95%', '5%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Grid overlay */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
            className="absolute inset-0"
            style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.5) 1px,transparent 1px)', backgroundSize: '24px 24px' }}
          />
        )}

        {/* Status text */}
        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-1.5">
          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-green-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs font-medium text-green-400">
              {isUploading ? `Uploading… ${uploadProgress}%` : 'Analyzing leaf tissue…'}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>{isUploading ? 'Uploading image' : 'Running inference'}</span>
          <span>{isUploading ? `${uploadProgress}%` : 'Processing…'}</span>
        </div>
        <ProgressBar value={isUploading ? uploadProgress : undefined} />
        {isScanning && (
          <motion.div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-green-400 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
