import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, RotateCcw, Download } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfidenceChart } from './ConfidenceChart'
import { formatConfidence, getDiseaseIcon, CHART_COLORS } from '@/lib/utils'

const container = { hidden:{}, show:{ transition:{ staggerChildren:0.06 } } }
const item = { hidden:{ opacity:0, x:-12 }, show:{ opacity:1, x:0 } }

export function ResultCard({ result, previewUrl, onReset }) {
  if (!result) return null
  const { predictions, top_prediction, is_healthy, inference_ms } = result
  const icon = getDiseaseIcon(top_prediction?.label || '')

  const handleDownload = () => {
    const text = predictions.map(p => `${p.rank}. ${p.label}: ${p.confidence}%`).join('\n')
    const blob = new Blob([`TomatoAI Results\n${new Date().toLocaleString()}\n\nTop: ${top_prediction.label}\nConfidence: ${top_prediction.confidence}%\n\nAll predictions:\n${text}\n\nInference time: ${inference_ms}ms`], {type:'text/plain'})
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'tomato-ai-result.txt'
    a.click()
  }

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">

      {/* Left: image + top result */}
      <Card className="flex flex-col gap-4">
        <CardHeader>
          <CardTitle>Analysis Result</CardTitle>
          <Badge variant={is_healthy ? 'healthy' : 'disease'}>
            {is_healthy ? '✓ Healthy' : '⚠ Disease detected'}
          </Badge>
        </CardHeader>

        {previewUrl && (
          <div className="relative rounded-xl overflow-hidden aspect-square w-full max-w-xs mx-auto">
            <img src={previewUrl} alt="Analyzed leaf" className="w-full h-full object-cover" />
            <div className={`absolute inset-0 ${is_healthy ? 'ring-2 ring-green-400/40' : 'ring-2 ring-red-400/40'} rounded-xl`} />
            <div className="absolute top-2 right-2">
              <Badge variant={is_healthy ? 'healthy' : 'disease'}>{icon}</Badge>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Top diagnosis</span>
            <span className="text-sm font-semibold text-white">{top_prediction?.label}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Confidence</span>
            <span className={`text-sm font-bold ${is_healthy ? 'text-green-400' : 'text-red-400'}`}>
              {formatConfidence(top_prediction?.confidence)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Inference time</span>
            <span className="text-xs text-slate-500">{inference_ms} ms</span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="ghost" onClick={onReset} className="flex-1"><RotateCcw size={14} />New scan</Button>
          <Button variant="outline" onClick={handleDownload}><Download size={14} /></Button>
        </div>
      </Card>

      {/* Right: chart + ranked list */}
      <Card className="flex flex-col gap-4">
        <CardHeader>
          <CardTitle>Confidence breakdown</CardTitle>
          <span className="text-xs text-slate-500">Top {predictions.length} predictions</span>
        </CardHeader>

        <ConfidenceChart predictions={predictions} />

        <motion.ul variants={container} initial="hidden" animate="show" className="space-y-2 mt-1">
          {predictions.map((p, i) => (
            <motion.li key={p.index} variants={item} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: `${CHART_COLORS[i]}20`, color: CHART_COLORS[i] }}>
                {p.rank}
              </span>
              <span className="flex-1 text-sm text-slate-300 truncate">{p.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${p.confidence}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: CHART_COLORS[i] }}
                  />
                </div>
                <span className="text-xs font-medium w-12 text-right" style={{ color: CHART_COLORS[i] }}>
                  {formatConfidence(p.confidence)}
                </span>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </Card>
    </motion.div>
  )
}
