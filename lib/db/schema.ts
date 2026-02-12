import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const snippets = sqliteTable("snippets", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
