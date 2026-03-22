import { PageContainer } from "@/components/page-container";

function SkeletonCard() {
  return (
    <div className="h-32 animate-pulse rounded-2xl border border-(--card-border) bg-(--card)" />
  );
}

function SkeletonBar() {
  return (
    <div
      className="h-4 animate-pulse rounded-full bg-background"
      style={{ width: "60%" }}
    />
  );
}

export default function DashboardLoading() {
  return (
    <PageContainer className="flex flex-col gap-10 lg:gap-12">
      <div className="space-y-2">
        <div className="h-4 w-24 animate-pulse rounded bg-(--muted)/30" />
        <div className="h-8 w-48 animate-pulse rounded bg-(--muted)/30" />
        <div className="mt-2 h-4 max-w-2xl animate-pulse rounded bg-(--muted)/20" />
      </div>

      <div className="rounded-2xl border border-(--card-border) bg-(--card) p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="h-4 w-40 animate-pulse rounded bg-(--muted)/30" />
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-2">
            <div className="h-14 w-32 animate-pulse rounded bg-(--muted)/30 sm:h-16" />
            <div className="h-6 w-20 animate-pulse rounded bg-(--muted)/20" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-(--muted)/20" />
            <div className="h-8 w-16 animate-pulse rounded bg-(--muted)/30" />
          </div>
        </div>
        <div className="mt-4 h-4 w-32 animate-pulse rounded bg-(--muted)/20" />
        <SkeletonBar />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="h-5 w-48 animate-pulse rounded bg-(--muted)/30" />
            <div className="mt-1 h-4 w-36 animate-pulse rounded bg-(--muted)/20" />
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-(--card-border) bg-(--card) p-6 shadow-sm">
          <div className="flex h-48 items-end justify-between gap-1 sm:gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="flex min-w-0 flex-1 flex-col items-center gap-2.5"
              >
                <div
                  className="w-full max-w-[3rem] animate-pulse rounded-t-lg bg-(--muted)/20"
                  style={{ height: `${30 + Math.random() * 50}%` }}
                />
                <div className="h-3 w-8 animate-pulse rounded bg-(--muted)/20" />
                <div className="h-3 w-6 animate-pulse rounded bg-(--muted)/20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
