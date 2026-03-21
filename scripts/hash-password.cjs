/**
 * Usage: node scripts/hash-password.cjs "your-plain-password"
 * Paste AUTH_PASSWORD_HASH_B64 into .env (required for Next.js — raw bcrypt uses `$` and Next expands it).
 */
const bcrypt = require("bcryptjs");

const pwd = process.argv[2];
if (!pwd) {
  console.error('Usage: node scripts/hash-password.cjs "your-password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(pwd, 12);
const b64 = Buffer.from(hash, "utf8").toString("base64");
console.log("Add this line to .env:");
console.log(`AUTH_PASSWORD_HASH_B64=${b64}`);
console.log("");
console.log("Raw bcrypt (for reference only — do not paste into .env):");
console.log(hash);
