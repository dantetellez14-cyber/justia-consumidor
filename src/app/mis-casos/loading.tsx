export default function MisCasosLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header skeleton */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-200" />
          <div className="space-y-1.5">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </header>

      {/* Content skeleton */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <div className="h-5 w-28 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-5 w-16 animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-64 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="flex gap-6">
                  <div className="space-y-1.5">
                    <div className="h-3 w-12 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-8 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-12 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
