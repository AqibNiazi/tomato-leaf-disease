import { RadialBarChart, RadialBar, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import { CHART_COLORS, formatConfidence } from '@/lib/utils'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs space-y-0.5 shadow-xl">
      <p className="font-semibold text-white">{d.label}</p>
      <p className="text-green-400">{formatConfidence(d.confidence)}</p>
    </div>
  )
}

export function ConfidenceChart({ predictions = [] }) {
  const data = predictions.map((p, i) => ({
    label:      p.label,
    confidence: p.confidence,
    fill:       CHART_COLORS[i] || '#64748b',
  }))

  return (
    <div className="relative w-full" style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%" cy="50%" innerRadius="30%" outerRadius="90%"
          barSize={10} data={data} startAngle={90} endAngle={-270}
        >
          <RadialBar background={{ fill: 'rgba(255,255,255,0.03)' }} dataKey="confidence" max={100}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </RadialBar>
          <Tooltip content={<CustomTooltip />} />
        </RadialBarChart>
      </ResponsiveContainer>
      {/* Centre label */}
      {data[0] && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl font-bold gradient-text">{data[0].confidence.toFixed(0)}%</p>
          <p className="text-[10px] text-slate-500 text-center max-w-[80px] leading-tight">{data[0].label}</p>
        </div>
      )}
    </div>
  )
}
