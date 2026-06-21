const { createClient } = require("@libsql/client");
const { loadTursoEnv } = require("./load-turso-env.cjs");

const { url, token } = loadTursoEnv();

if (!url || !token) {
  console.error("TURSO_DATABASE_URL / TURSO_AUTH_TOKEN em falta");
  process.exit(1);
}

const client = createClient({ url, authToken: token });

async function main() {
  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log("tables:", tables.rows.map((r) => r.name).join(", "));

  const migrations = await client
    .execute(
      "SELECT id, hash, created_at FROM __drizzle_migrations ORDER BY created_at"
    )
    .catch(() => ({ rows: [] }));
  console.log("migrations:", migrations.rows);

  const hasGoals = tables.rows.some((r) => r.name === "weight_goals");
  console.log("weight_goals:", hasGoals ? "OK" : "MISSING");
  process.exit(hasGoals ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
