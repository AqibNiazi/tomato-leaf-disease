import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import useAppStore from '@/store/useAppStore'
import { useHealth } from '@/hooks/useHealth'

export function AppShell({ children }) {
  useHealth()
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <motion.main
        animate={{ marginLeft: sidebarCollapsed ? 64 : 240 }}
        transition={{ duration: 0.3, ease: [0.4,0,0.2,1] }}
        className="flex-1 flex flex-col min-h-screen overflow-x-hidden"
      >
        {children}
      </motion.main>
    </div>
  )
}
