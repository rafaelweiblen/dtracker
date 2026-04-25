import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (process.env.VERCEL === "1") {
  if (!tursoUrl) {
    throw new Error(
      "TURSO_DATABASE_URL está vazio. No dashboard da Turso, copia a URL do banco e define-a na Vercel (Settings → Environment Variables).",
    );
  }
  if (!tursoToken) {
    throw new Error(
      "TURSO_AUTH_TOKEN está vazio. Cria um token na Turso (Database → show credentials) e cola-o na Vercel.",
    );
  }
}

const databaseUrl = tursoUrl && tursoUrl.length > 0 ? tursoUrl : "file:./local.db";

const client = createClient({
  url: databaseUrl,
  authToken: tursoToken && tursoToken.length > 0 ? tursoToken : undefined,
});

export const db = drizzle(client, { schema });
