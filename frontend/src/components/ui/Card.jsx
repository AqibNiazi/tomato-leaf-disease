import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function Card({ children, className, hover = false, ...props }) {
  const Comp = hover ? motion.div : 'div'
  const motionProps = hover ? { whileHover: { y: -2, scale: 1.005 } } : {}
  return (
    <Comp
      className={cn('glass rounded-2xl p-5', className)}
      {...motionProps}
      {...props}
    >
      {children}
    </Comp>
  )
}

export function CardHeader({ children, className }) {
  return <div className={cn('flex items-center justify-between mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }) {
  return <h3 className={cn('text-sm font-semibold text-slate-300 uppercase tracking-wider', className)}>{children}</h3>
}
