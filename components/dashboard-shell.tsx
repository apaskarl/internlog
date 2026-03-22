"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { SessionStatusWidget } from "@/components/session-status-widget";
import { USER_PROFILE } from "@/lib/user-profile";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Overview",
    icon: "mdi:view-dashboard-outline",
  },
  { href: "/timelog", label: "Time log", icon: "mdi:clock-outline" },
  {
    href: "/reports",
    label: "Monthly reports",
    icon: "mdi:notebook-outline",
  },
] as const;

function headerForPath(pathname: string) {
  if (pathname === "/timelog") {
    return {
      title: "Time log",
      subtitle: "Clock-in & clock-out for each internship day",
    };
  }
  if (pathname === "/reports") {
    return {
      title: "Monthly reports",
      subtitle: "Learnings, tasks & reflections by month",
    };
  }
  return {
    title: "Overview",
    subtitle: "Hours, attendance & quick stats",
  };
}

function navLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const header = headerForPath(pathname);

  return (
    <div className="relative flex min-h-full flex-1 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,110,122,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.12),transparent)]"
        aria-hidden
      />

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        id="app-sidebar"
        className={
          "fixed top-0 left-0 z-50 flex h-full min-h-screen w-64 shrink-0 flex-col border-r border-[var(--card-border)] bg-[var(--card)] shadow-xl transition-transform duration-200 ease-out lg:translate-x-0 lg:shadow-none " +
          (sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
        }
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--card-border)] px-5 transition-opacity hover:opacity-90"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
            <Icon
              icon="mdi:clipboard-text-clock-outline"
              className="h-5 w-5"
              aria-hidden
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight text-[var(--foreground)]">
              InternLog
            </p>
            <p className="truncate text-xs text-[var(--muted)]">
              Internship tracker
            </p>
          </div>
        </Link>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Navigate
          </p>
          {NAV_ITEMS.map((item) => {
            const active = navLinkActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors " +
                  (active
                    ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]")
                }
                onClick={() => setSidebarOpen(false)}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  icon={item.icon}
                  className="h-5 w-5 shrink-0 opacity-90"
                  aria-hidden
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--card-border)] p-4">
          <div className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)]/80 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- external avatar URL */}
            <img
              src={USER_PROFILE.avatarUrl}
              alt={USER_PROFILE.name}
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-full border border-[var(--card-border)] bg-[var(--background)] object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight text-[var(--foreground)]">
                {USER_PROFILE.name}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                ID {USER_PROFILE.idNumber}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-64">
        <header className="fixed top-0 left-0 right-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[var(--card-border)] bg-[var(--card)]/90 px-4 backdrop-blur-md sm:px-6 lg:left-64 lg:right-0">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] transition-colors hover:bg-[var(--background)]/80 lg:hidden"
              aria-expanded={sidebarOpen}
              aria-controls="app-sidebar"
              aria-label={
                sidebarOpen ? "Close navigation menu" : "Open navigation menu"
              }
              onClick={() => setSidebarOpen((o) => !o)}
            >
              <Icon
                icon={sidebarOpen ? "mdi:close" : "mdi:menu"}
                className="h-6 w-6"
                aria-hidden
              />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--foreground)]">
                {header.title}
              </p>
              <p className="truncate text-xs text-[var(--muted)]">
                {header.subtitle}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              <Icon icon="mdi:logout" className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-hidden pt-16">
          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>

        <footer className="shrink-0 border-t border-[var(--card-border)] bg-[var(--card)]/60 px-4 py-5 text-center text-xs text-[var(--muted)] backdrop-blur-sm sm:px-6">
          <p>
            InternLog — built for tracking internship attendance and growth.
            Data shown is sample content.
          </p>
        </footer>

        <SessionStatusWidget />
      </div>
    </div>
  );
}
