import { cn } from '@/lib/utils'
const variants = {
  healthy:'bg-green-500/20 text-green-400 border-green-500/30',
  disease:'bg-red-500/20 text-red-400 border-red-500/30',
  warning:'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  info:'bg-blue-500/20 text-blue-400 border-blue-500/30',
  default:'bg-slate-500/20 text-slate-400 border-slate-500/30',
}
export function Badge({ children, variant = 'default', className }) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border', variants[variant], className)}>
      {children}
    </span>
  )
}
