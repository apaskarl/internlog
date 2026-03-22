"use client";

import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { PageContainer } from "@/components/page-container";
import {
  PLACEHOLDER_DOCUMENTS,
  type UploadedDocument,
} from "@/lib/placeholder-data";

const FILTERS = [
  { id: "all" as const, label: "All types" },
  { id: "monthly_report" as const, label: "Monthly reports" },
  { id: "legal" as const, label: "Legal" },
  { id: "onboarding" as const, label: "Onboarding" },
  { id: "hr" as const, label: "HR" },
];

function fileIcon(ext: UploadedDocument["fileExt"]) {
  return ext === "pdf" ? "mdi:file-pdf-box" : "mdi:file-word-box";
}

export default function DocumentsPage() {
  const all = PLACEHOLDER_DOCUMENTS;
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return all;
    return all.filter((d) => d.category === filter);
  }, [all, filter]);

  return (
    <PageContainer className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 border-b border-[var(--card-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
            <Icon icon="mdi:folder-file-outline" className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
              Documents
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
              Monthly reports, MOA, NDA, and other uploads (sample list).
            </p>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <span className="sr-only">Filter</span>
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as (typeof FILTERS)[number]["id"])
            }
            className="cursor-pointer rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)]"
          >
            {FILTERS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="divide-y divide-[var(--card-border)] overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        {filtered.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-[var(--muted)]">
            Nothing in this category.
          </li>
        ) : (
          filtered.map((doc) => (
            <li key={doc.id}>
              <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <Icon
                    icon={fileIcon(doc.fileExt)}
                    className={
                      "mt-0.5 h-8 w-8 shrink-0 " +
                      (doc.fileExt === "pdf"
                        ? "text-red-600 dark:text-red-400"
                        : "text-sky-700 dark:text-sky-400")
                    }
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--foreground)]">{doc.title}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      {doc.categoryLabel} · {doc.uploadedAt} · {doc.sizeLabel}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled
                  className="inline-flex shrink-0 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-xs font-medium text-[var(--muted)] opacity-60 sm:ml-2"
                >
                  <Icon icon="mdi:download-outline" className="h-4 w-4" aria-hidden />
                  Download
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      <p className="text-center text-xs text-[var(--muted)]">
        Preview only — uploads and downloads are not wired up yet.
      </p>
    </PageContainer>
  );
}
