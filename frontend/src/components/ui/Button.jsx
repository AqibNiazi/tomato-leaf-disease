import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-green-500 hover:bg-green-400 text-white shadow-lg shadow-green-500/25',
  ghost:   'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10',
  danger:  'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30',
  outline: 'border border-green-500/50 text-green-400 hover:bg-green-500/10',
}

export function Button({ children, variant = 'primary', className, disabled, onClick, type = 'button', ...props }) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
