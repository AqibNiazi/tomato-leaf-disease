import { motion } from 'framer-motion'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { getDiseaseIcon } from '@/lib/utils'
import { useClasses } from '@/hooks/useClasses'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
const item = { hidden: { opacity:0, y:12 }, show: { opacity:1, y:0 } }

export function ClassesGrid() {
  const { classes, loading, error } = useClasses()

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (error)   return <p className="text-center text-red-400 py-8">{error}</p>

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {classes.map((cls) => {
        const isHealthy = cls.label.toLowerCase().includes('healthy')
        return (
          <motion.div key={cls.index} variants={item} whileHover={{ y: -2, scale: 1.02 }}
            className="glass rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all duration-200 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl">{getDiseaseIcon(cls.label)}</span>
              <Badge variant={isHealthy ? 'healthy' : 'disease'}>{isHealthy ? 'Healthy' : 'Disease'}</Badge>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{cls.label}</p>
              <p className="text-[10px] text-slate-600 mt-0.5 font-mono">{cls.class_name}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-auto">
              <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">Index {cls.index}</span>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
