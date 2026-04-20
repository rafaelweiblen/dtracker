import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const entries = sqliteTable(
  "entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["escape", "exercise"] }).notNull(),
    description: text("description").notNull(),
    date: text("date").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    edited: integer("edited", { mode: "boolean" }).notNull().default(false),
    pendingSync: integer("pending_sync", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (t) => [index("idx_entries_user_date").on(t.userId, t.date)]
);

export type User = typeof users.$inferSelect;
export type Entry = typeof entries.$inferSelect;
export type EntryType = "escape" | "exercise";
