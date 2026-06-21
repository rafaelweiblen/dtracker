const { readFileSync, existsSync } = require("node:fs");
const path = require("node:path");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    const current = process.env[key]?.trim();
    if (!current) process.env[key] = value;
  }
}

/** Prefer process.env (CI); fallback .env.production.local for local runs. */
function loadTursoEnv() {
  loadEnvFile(path.resolve(process.cwd(), ".env.production.local"));
  return {
    url: process.env.TURSO_DATABASE_URL?.trim() || "",
    token: process.env.TURSO_AUTH_TOKEN?.trim() || "",
  };
}

module.exports = { loadTursoEnv };
