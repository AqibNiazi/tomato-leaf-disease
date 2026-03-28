import { motion } from 'framer-motion'
import { Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatConfidence, getDiseaseIcon } from '@/lib/utils'
import useAppStore from '@/store/useAppStore'

export function HistoryCard({ entry }) {
  const removeFromHistory = useAppStore((s) => s.removeFromHistory)
  const { id, timestamp, previewUrl, fileName, result } = entry
  const { top_prediction, is_healthy } = result

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      className="group glass rounded-2xl p-4 flex items-center gap-4 border border-white/5 hover:border-white/10 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/8">
        {previewUrl
          ? <img src={previewUrl} alt={fileName} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">🍅</div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {getDiseaseIcon(top_prediction?.label)} {top_prediction?.label}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{fileName}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant={is_healthy ? 'healthy' : 'disease'}>
            {is_healthy ? 'Healthy' : 'Disease'}
          </Badge>
          <span className="text-xs text-slate-500">
            {formatConfidence(top_prediction?.confidence)}
          </span>
        </div>
      </div>

      {/* Timestamp + delete */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className="text-[10px] text-slate-600">
          {new Date(timestamp).toLocaleDateString()}
        </span>
        <button
          onClick={() => removeFromHistory(id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400 cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  )
}
