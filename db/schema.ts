import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * App metadata / future migration anchor. Add `time_logs`, `monthly_reports`, etc. here.
 */
export const appMeta = sqliteTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
