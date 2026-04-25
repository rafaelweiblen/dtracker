import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

// Auth.js requires: id, name, email, emailVerified, image
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

// Auth.js + @auth/drizzle-adapter: PK composta (provider, provider_account_id) — obrigatória para o adapter SQLite.
export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    // eslint-disable-next-line camelcase
    refresh_token: text("refresh_token"),
    // eslint-disable-next-line camelcase
    access_token: text("access_token"),
    // eslint-disable-next-line camelcase
    expires_at: integer("expires_at"),
    // eslint-disable-next-line camelcase
    token_type: text("token_type"),
    scope: text("scope"),
    // eslint-disable-next-line camelcase
    id_token: text("id_token"),
    // eslint-disable-next-line camelcase
    session_state: text("session_state"),
  },
  (t) => ({
    compoundKey: primaryKey({ columns: [t.provider, t.providerAccountId] }),
  }),
);

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
