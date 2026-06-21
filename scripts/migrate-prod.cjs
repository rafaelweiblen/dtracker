const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { loadTursoEnv } = require("./load-turso-env.cjs");

const { url, token } = loadTursoEnv();

if (!url || !token) {
  console.error(
    [
      "TURSO_DATABASE_URL / TURSO_AUTH_TOKEN em falta.",
      "",
      "CI: define secrets TURSO_* no GitHub.",
      "Local: copia de Vercel → Settings → Environment Variables para .env.production.local",
      "(vercel env pull NÃO exporta variáveis encriptadas).",
      "",
      "Alternativa: Turso dashboard → SQL → db/migrations/0003_weight_goals.sql",
    ].join("\n")
  );
  process.exit(1);
}

const drizzleBin = path.resolve(
  process.cwd(),
  "node_modules/drizzle-kit/bin.cjs"
);
const result = spawnSync(process.execPath, [drizzleBin, "migrate"], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
