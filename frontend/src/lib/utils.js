import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatConfidence(value) {
  return `${Number(value).toFixed(1)}%`
}

export function getSeverityColor(confidence) {
  if (confidence >= 85) return 'text-green-400'
  if (confidence >= 60) return 'text-yellow-400'
  return 'text-red-400'
}

export function cleanLabel(classNameRaw) {
  return classNameRaw
    .replace(/^Tomato_{1,3}/i, '')
    .replace(/_/g, ' ')
    .trim()
}

export const CHART_COLORS = ['#22c55e','#84cc16','#3b82f6','#f59e0b','#8b5cf6']

export const DISEASE_ICONS = {
  healthy:'🌿', bacterial_spot:'🔴', early_blight:'🟤',
  late_blight:'⚫', leaf_mold:'🟡', septoria_leaf_spot:'⚪',
  spider_mites:'🕷️', target_spot:'🎯', yellow_leaf_curl:'🍋', mosaic_virus:'🧬',
}

export function getDiseaseIcon(label = '') {
  const key = label.toLowerCase().replace(/\s+/g, '_')
  for (const [pattern, icon] of Object.entries(DISEASE_ICONS)) {
    if (key.includes(pattern)) return icon
  }
  return '🍅'
}
