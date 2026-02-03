import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-border bg-card flex-shrink-0 border-b px-6 py-4">
        <Skeleton className="mb-2 h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Quick Stats Skeletons */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Skeleton className="mb-2 h-4 w-32" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row 1 Skeletons */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <Skeleton className="mb-1 h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="pt-0">
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row 2 Skeletons */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="mb-1 h-5 w-40" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-[280px] w-full" />
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <Skeleton className="mb-1 h-5 w-48" />
                <Skeleton className="h-4 w-36" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-[280px] w-full" />
              </CardContent>
            </Card>
          </div>

          {/* Category Averages Skeleton */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <Skeleton className="mb-1 h-5 w-56" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-secondary/50 rounded-lg p-4">
                    <Skeleton className="mb-2 h-4 w-24" />
                    <Skeleton className="mb-1 h-6 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
