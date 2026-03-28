import { cn } from '@/lib/utils'
const map = { ok:'bg-green-400', degraded:'bg-yellow-400', offline:'bg-red-400' }
export function StatusDot({ status }) {
  return (
    <span className="relative flex h-2 w-2">
      {status === 'ok' && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      )}
      <span className={cn('relative inline-flex rounded-full h-2 w-2', map[status] || 'bg-slate-500')} />
    </span>
  )
}
