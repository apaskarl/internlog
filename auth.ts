import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

/** Next.js expands `$` in `.env`; bcrypt hashes contain `$2a$…` and get corrupted. Use AUTH_PASSWORD_HASH_B64. */
function bcryptHashFromEnv(): string | null {
  const b64 = process.env.AUTH_PASSWORD_HASH_B64?.trim();
  if (b64) {
    try {
      return Buffer.from(b64, "base64").toString("utf8");
    } catch {
      return null;
    }
  }
  const raw = process.env.AUTH_PASSWORD_HASH?.trim();
  if (raw && /^\$2[aby]\$/.test(raw)) {
    return raw;
  }
  return null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const emailRaw = credentials?.email;
        const passwordRaw = credentials?.password;
        if (
          typeof emailRaw !== "string" ||
          typeof passwordRaw !== "string" ||
          !emailRaw ||
          !passwordRaw
        ) {
          return null;
        }

        const allowed = process.env.AUTH_ALLOWED_EMAIL?.trim().toLowerCase();
        const hash = bcryptHashFromEnv();
        if (!allowed || !hash) {
          console.error(
            "InternLog auth: set AUTH_ALLOWED_EMAIL and AUTH_PASSWORD_HASH_B64 (see scripts/hash-password.cjs).",
          );
          return null;
        }

        const email = emailRaw.trim().toLowerCase();
        if (email !== allowed) {
          return null;
        }

        const ok = await bcrypt.compare(passwordRaw, hash);
        if (!ok) {
          return null;
        }

        return {
          id: "1",
          email: allowed,
          name: "Intern",
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
});
