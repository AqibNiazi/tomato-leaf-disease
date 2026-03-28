import { motion } from 'framer-motion'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function ErrorState({ message, onRetry }) {
  return (
    <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="flex flex-col items-center gap-5 py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertTriangle size={28} className="text-red-400" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-white">Analysis failed</p>
        <p className="text-sm text-slate-400 max-w-xs">{message || 'Something went wrong. Please try again.'}</p>
      </div>
      <Button variant="danger" onClick={onRetry}><RotateCcw size={14} />Try again</Button>
    </motion.div>
  )
}
