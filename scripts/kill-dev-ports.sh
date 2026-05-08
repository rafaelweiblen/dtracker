#!/usr/bin/env bash
# Liberta só a porta deste app (Dieta), por defeito 3750.
# Não mexe na 3000 — podes ter outro projeto à escuta na 3000.
#
# Se o Next disser "Another next dev server is already running" por causa de
# uma instância antiga deste repo na 3000: para à mão com `lsof -i :3000` e
# kill no PID, ou corre (com cuidado): `pnpm dev:kill:hard`
set -euo pipefail
PORT="${DIETA_DEV_PORT:-3750}"
pids=$(lsof -ti "tcp:${PORT}" -sTCP:LISTEN 2>/dev/null || true)
if [[ -n "${pids}" ]]; then
  echo "A terminar processos na porta ${PORT}: ${pids}"
  kill -9 ${pids} 2>/dev/null || true
else
  echo "Porta ${PORT} já estava livre."
fi
