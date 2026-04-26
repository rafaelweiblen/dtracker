# Feature: Ranking de Sequências de Exercício

**Status:** In Progress  
**Complexity:** Medium  
**Created:** 2026-04-25

---

## User Story

Como usuário, quero visualizar um ranking das minhas maiores sequências de exercício, para acompanhar meu histórico de consistência.

---

## Acceptance Criteria

### AC1 — Navegação pelo card de exercício
**Dado que** o usuário está na home  
**Quando** clica no card de "dias consecutivos de exercício" no StreakBar  
**Então** o sistema navega para a página `/streaks`

### AC2 — Ranking top 3 sequências
**Dado que** o usuário está na página `/streaks`  
**Quando** teve sequências históricas de 10 dias, 6 dias, 1 dia e 4 dias  
**Então** o ranking mostra as **3 maiores**: 1º 10 dias, 2º 6 dias, 3º 4 dias

---

## Requirements

### RF-001: Card clicável no StreakBar
O card de exercício em `StreakBar` deve ser um link (`<Link href="/streaks">`) com cursor pointer e feedback visual de tap.

### RF-002: Página de ranking `/streaks`
Página Server Component em `app/(app)/streaks/page.tsx` que busca e exibe o ranking.

### RF-003: Top 3 sequências
Exibir exatamente as **3 maiores sequências** de todos os tempos, ordenadas por comprimento decrescente. Se existirem menos de 3, exibir o que existir.

### RF-004: Dados de cada sequência
Cada item do ranking deve mostrar:
- Posição (1º, 2º, 3º)
- Quantidade de dias
- Período (ex: "12 abr – 21 abr")

### RF-005: Estado vazio
Se o usuário não tiver nenhuma sequência de exercício, exibir mensagem "Nenhuma sequência registrada ainda".

### RF-006: Sequência ativa incluída
A sequência atualmente em andamento (terminando hoje ou ontem) deve ser incluída no ranking.

### RF-007: Navegação de volta
Botão/link de volta para `/home` no topo da página.

---

## Out of Scope

- Ranking entre usuários (multi-user)
- Sequências de escapadas (apenas exercício)
- Mais de 3 posições no ranking

---

## Technical Notes

- Nova função pura `computeStreakHistory(rows, today)` em `db/queries/entries.ts`
  - Agrupa datas de exercício em runs consecutivos
  - Retorna top 3 por comprimento decrescente
  - Tipo: `StreakRun { startDate: string; endDate: string; length: number }`
- Nova query `getStreakHistory(userId, today?)` — usa mesma query de `getStreaks` (todas as entradas)
- Timezone: `today` vem de `searchParams.date` (via `DateSync`)
- Testes unitários para `computeStreakHistory` em `entries.test.ts`
