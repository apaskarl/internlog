"use client";

import { Icon } from "@iconify/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");

    setPending(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,110,122,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.12),transparent)]"
        aria-hidden
      />

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-2 text-[var(--foreground)]">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-muted)] text-[var(--accent)]">
              <Icon
                icon="mdi:clipboard-text-clock-outline"
                className="h-7 w-7"
                aria-hidden
              />
            </span>
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Sign in to InternLog
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Use the email and password configured for your account.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-lg shadow-slate-900/5 dark:shadow-none sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? (
              <p
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="text-sm font-medium text-[var(--foreground)]"
              >
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-[var(--accent)]/0 transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="text-sm font-medium text-[var(--foreground)]"
              >
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-[var(--accent)]/0 transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 enabled:active:scale-[0.99] disabled:opacity-60 dark:text-slate-950"
            >
              <Icon icon="mdi:login" className="h-5 w-5" aria-hidden />
              {pending ? "Signing in…" : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--muted)]">
            Single-user app — credentials are checked on the server.
          </p>
        </div>

      </div>
    </div>
  );
}
