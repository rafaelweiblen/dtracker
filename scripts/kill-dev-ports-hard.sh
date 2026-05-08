#!/usr/bin/env bash
# Mata LISTEN na 3000 e 3750. Usa só se ficaste com um next dev antigo do Dieta
# na 3000 E já não precisas desse processo. Se outro projeto usa a 3000,
# NÃO corras este script — usa só dev:kill ou mata o PID certo com lsof.
set -euo pipefail
for port in 3000 3750; do
  pids=$(lsof -ti "tcp:${port}" -sTCP:LISTEN 2>/dev/null || true)
  if [[ -n "${pids}" ]]; then
    echo "A terminar processos na porta ${port}: ${pids}"
    kill -9 ${pids} 2>/dev/null || true
  fi
done
echo "Portas 3000 e 3750 verificadas."
