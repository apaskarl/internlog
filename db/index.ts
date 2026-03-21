import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const url = process.env.DATABASE_URL ?? "file:./data/internlog.db";
const filePath = url.startsWith("file:")
  ? url.slice("file:".length)
  : url;

const resolved = path.isAbsolute(filePath)
  ? filePath
  : path.join(process.cwd(), filePath);

fs.mkdirSync(path.dirname(resolved), { recursive: true });

const sqlite = new Database(resolved);
export const db = drizzle(sqlite, { schema });
