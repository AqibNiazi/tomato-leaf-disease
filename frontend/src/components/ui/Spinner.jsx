import { cn } from '@/lib/utils'
export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <div className={cn('border-2 border-white/10 border-t-green-400 rounded-full animate-spin', sizes[size], className)} />
  )
}
