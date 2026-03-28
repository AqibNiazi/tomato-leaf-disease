import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, LayoutDashboard, History, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAppStore from '@/store/useAppStore'
import { StatusDot } from '@/components/ui/StatusDot'

const NAV = [
  { to: '/',        icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analyze', icon: Leaf,            label: 'Analyze'   },
  { to: '/history', icon: History,         label: 'History'   },
  { to: '/classes', icon: BookOpen,        label: 'Diseases'  },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, backendHealth } = useAppStore()
  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: [0.4,0,0.2,1] }}
      className="fixed left-0 top-0 h-screen glass-strong z-40 flex flex-col border-r border-white/5 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5 min-h-[72px]">
        <div className="w-8 h-8 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
          <Leaf size={16} className="text-green-400" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:0.2}} className="overflow-hidden whitespace-nowrap">
              <p className="text-sm font-bold gradient-text">TomatoAI</p>
              <p className="text-[10px] text-slate-500">Disease Detection</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {({ isActive }) => (
              <motion.div whileHover={{ x: 2 }} className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-200 cursor-pointer',
                isActive ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}>
                <Icon size={16} className="flex-shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="whitespace-nowrap font-medium">
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status */}
      <div className="px-3 py-3 border-t border-white/5">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/3 border border-white/5">
          <StatusDot status={backendHealth || 'offline'} />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.p initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-[11px] font-medium text-slate-400 whitespace-nowrap overflow-hidden">
                {backendHealth === 'ok' ? 'Model ready' : backendHealth === 'degraded' ? 'Loading…' : 'Backend offline'}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toggle */}
      <button onClick={toggleSidebar} className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full glass-strong border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-50 cursor-pointer">
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}
