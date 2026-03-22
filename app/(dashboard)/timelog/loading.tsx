import { PageContainer } from "@/components/page-container";

function SkeletonCard() {
  return (
    <div className="h-28 animate-pulse rounded-2xl border border-(--card-border) bg-(--card)" />
  );
}

export default function TimelogLoading() {
  return (
    <PageContainer className="flex flex-col gap-8 lg:gap-10">
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-(--muted)/20" />
            <div>
              <div className="h-7 w-32 animate-pulse rounded bg-(--muted)/30 sm:h-8" />
              <div className="mt-2 h-4 max-w-xl animate-pulse rounded bg-(--muted)/20" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-32 animate-pulse rounded-lg bg-(--muted)/20" />
            <div className="h-9 w-28 animate-pulse rounded-lg bg-(--muted)/20" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <div className="h-40 animate-pulse rounded-2xl border border-(--card-border) bg-(--card)" />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="h-5 w-24 animate-pulse rounded bg-(--muted)/30" />
            <div className="mt-1 h-4 w-64 animate-pulse rounded bg-(--muted)/20" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 animate-pulse rounded-lg bg-(--muted)/20" />
            <div className="h-9 w-16 animate-pulse rounded-lg bg-(--muted)/20" />
          </div>
        </div>

        <div className="min-h-[320px] animate-pulse rounded-2xl border border-(--card-border) bg-(--card)" />
      </section>
    </PageContainer>
  );
}
