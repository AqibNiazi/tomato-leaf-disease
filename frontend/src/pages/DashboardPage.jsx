import { motion } from 'framer-motion'
import { Leaf, Cpu, History, BookOpen, TrendingUp, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import useAppStore from '@/store/useAppStore'
import { getDiseaseIcon, formatConfidence } from '@/lib/utils'

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.08 } } }
const fadeUp  = { hidden:{ opacity:0, y:16 }, show:{ opacity:1, y:0 } }

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div variants={fadeUp} className="glass rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={14} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  )
}

export function DashboardPage() {
  const { history, backendHealth } = useAppStore()
  const totalScans   = history.length
  const healthy      = history.filter(h => h.result?.is_healthy).length
  const diseased     = totalScans - healthy
  const recent       = history.slice(0, 4)

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Dashboard" subtitle="Welcome back — your analysis overview" />
      <div className="flex-1 p-6 space-y-6">
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Leaf}      label="Total scans"   value={totalScans} color="bg-green-500/15 text-green-400" />
          <StatCard icon={TrendingUp} label="Healthy"      value={healthy}    color="bg-emerald-500/15 text-emerald-400" />
          <StatCard icon={BookOpen}  label="Diseased"      value={diseased}   color="bg-red-500/15 text-red-400" />
          <StatCard icon={Cpu}       label="Model status"  value={backendHealth === 'ok' ? 'Ready' : 'Offline'} color="bg-blue-500/15 text-blue-400" />
        </motion.div>

        {/* Quick action */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="glass rounded-2xl p-6 border border-green-500/10 bg-green-500/5 relative overflow-hidden"
        >
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-green-500/5 border border-green-500/10" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Analyze a new leaf</h2>
              <p className="text-sm text-slate-400 mt-1">Upload an image to detect diseases instantly using deep learning.</p>
            </div>
            <Link to="/analyze">
              <Button><Leaf size={15} />Start analysis<ChevronRight size={14} /></Button>
            </Link>
          </div>
        </motion.div>

        {/* Recent scans */}
        {recent.length > 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300">Recent scans</h3>
              <Link to="/history" className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recent.map((entry) => (
                <Card key={entry.id} hover className="flex items-center gap-3 py-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                    {entry.previewUrl
                      ? <img src={entry.previewUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">🍅</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {getDiseaseIcon(entry.result.top_prediction?.label)} {entry.result.top_prediction?.label}
                    </p>
                    <p className="text-xs text-slate-500">{formatConfidence(entry.result.top_prediction?.confidence)}</p>
                  </div>
                  <Badge variant={entry.result.is_healthy ? 'healthy' : 'disease'}>
                    {entry.result.is_healthy ? 'Healthy' : 'Disease'}
                  </Badge>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
