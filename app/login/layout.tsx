import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — InternLog",
  description: "Sign in to InternLog to track internship hours and reflections.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
