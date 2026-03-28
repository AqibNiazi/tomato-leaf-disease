import { TopBar } from '@/components/layout/TopBar'
import { ClassesGrid } from '@/features/classes/ClassesGrid'

export function ClassesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Disease Library" subtitle="All detectable tomato leaf conditions" />
      <div className="flex-1 p-6">
        <ClassesGrid />
      </div>
    </div>
  )
}
