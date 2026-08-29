export function SkeletonCard() {
  return (
    <div className="flex min-h-[150px] flex-col gap-2 rounded-md bg-bg-secondary p-3 shadow-sm">
      <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
      <div className="h-3 w-full animate-pulse rounded bg-border" />
      <div className="h-3 w-5/6 animate-pulse rounded bg-border" />
      <div className="mt-auto h-3 w-1/3 animate-pulse rounded bg-border" />
    </div>
  )
}
