import type { Config } from "drizzle-kit";

const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
const isRemote = !!tursoUrl;

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: isRemote ? "turso" : "sqlite",
  dbCredentials: isRemote
    ? {
        url: tursoUrl!,
        authToken: process.env.TURSO_AUTH_TOKEN?.trim(),
      }
    : { url: "file:./local.db" },
} satisfies Config;
