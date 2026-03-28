import { TopBar } from '@/components/layout/TopBar'
import { PredictorPanel } from '@/features/predictor/PredictorPanel'

export function AnalyzePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Analyze Leaf" subtitle="Upload a tomato leaf image for instant disease detection" />
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <PredictorPanel />
      </div>
    </div>
  )
}
