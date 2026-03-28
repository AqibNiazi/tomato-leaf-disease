import { TopBar } from '@/components/layout/TopBar'
import { HistoryPanel } from '@/features/history/HistoryPanel'

export function HistoryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Scan History" subtitle="Your past predictions, stored locally" />
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <HistoryPanel />
      </div>
    </div>
  )
}
