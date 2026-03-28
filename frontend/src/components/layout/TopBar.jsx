import { motion } from 'framer-motion'
import { Cpu } from 'lucide-react'
import useAppStore from '@/store/useAppStore'

export function TopBar({ title, subtitle }) {
  const backendHealth = useAppStore((s) => s.backendHealth)
  return (
    <motion.header initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex items-center justify-between px-6 py-4 border-b border-white/5 glass-strong sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 text-xs text-slate-400">
          <Cpu size={12} className="text-green-400" />
          <span>ResNet-50</span>
          <span className={`w-1.5 h-1.5 rounded-full ${backendHealth === 'ok' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        </div>
      </div>
    </motion.header>
  )
}
