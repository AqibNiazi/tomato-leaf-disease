import { AnimatePresence, motion } from 'framer-motion'
import { History, Trash2 } from 'lucide-react'
import { HistoryCard } from './HistoryCard'
import { Button } from '@/components/ui/Button'
import useAppStore from '@/store/useAppStore'

export function HistoryPanel() {
  const { history, clearHistory } = useAppStore()

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/8 flex items-center justify-center">
          <History size={24} className="text-slate-500" />
        </div>
        <p className="font-medium text-slate-400">No history yet</p>
        <p className="text-sm text-slate-600">Analyzed leaves will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{history.length} scan{history.length !== 1 ? 's' : ''}</span>
        <Button variant="danger" onClick={clearHistory} className="text-xs px-3 py-1.5">
          <Trash2 size={12} />Clear all
        </Button>
      </div>
      <AnimatePresence>
        {history.map((entry) => (
          <HistoryCard key={entry.id} entry={entry} />
        ))}
      </AnimatePresence>
    </div>
  )
}
