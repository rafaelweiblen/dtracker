"use strict";

/**
 * Cria o utilizador local usado com AUTH_BYPASS (INSERT OR IGNORE).
 * Executar a partir da pasta `app/`, com variáveis carregadas do `.env.local`.
 *
 *   node --env-file=.env.local scripts/seed-dev-user.cjs
 */

const { createClient } = require("@libsql/client");

const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
const databaseUrl =
  tursoUrl && tursoUrl.length > 0 ? tursoUrl : "file:./local.db";
const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

const DEV_ID =
  process.env.AUTH_BYPASS_USER_ID?.trim() ||
  "00000000-0000-0000-0000-000000000001";

async function main() {
  const client = createClient({
    url: databaseUrl,
    authToken: tursoToken && tursoToken.length > 0 ? tursoToken : undefined,
  });
  const now = Math.floor(Date.now() / 1000);
  await client.execute({
    sql: `INSERT OR IGNORE INTO users (id, name, email, email_verified, image, created_at) VALUES (?, ?, ?, NULL, NULL, ?)`,
    args: [DEV_ID, "Dev Local", "dev-local@example.test", now],
  });
  console.log("OK: utilizador dev (INSERT OR IGNORE)", DEV_ID);
  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
