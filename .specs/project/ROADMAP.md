# Roadmap

**Current Milestone:** MVP Completo  
**Status:** In Progress

---

## Milestone 1: MVP Completo

**Goal:** App funcional com todos os fluxos principais — registro, histórico, calendário, offline  
**Target:** Uso diário em produção

### Features

**Autenticação com Google** — COMPLETE
- Sign-in com Google OAuth
- Redirect para `/home` após login
- Redirect para `/` se não autenticado
- Dados isolados por usuário

**Registro de Entradas** — COMPLETE
- Tipos: escape (🍴) e exercício (💪)
- Campo de descrição com limite de 280 caracteres
- Salvar em data atual
- Otimismo UI — entrada aparece imediatamente

**Edição e Exclusão** — COMPLETE
- Swipe left > 60px revela botões de editar/excluir
- Indicador "· editado" após edição
- Dialog de confirmação antes de excluir
- Hover no desktop também revela botões

**Log Diário (Home)** — COMPLETE
- Lista entradas do dia agrupadas por tipo
- Streak bar: exercício consecutivo + dias desde última escapada
- Estado vazio com instrução de uso
- Navegação de data via `?date=` param

**Calendário Mensal** — COMPLETE
- Grid 7 colunas por mês
- Indicadores visuais por dia: ponto vermelho (escape), ponto verde (exercício)
- Navegação entre meses
- Link para página de detalhe de cada dia

**Página de Dia Passado** — COMPLETE
- Detalhe de qualquer dia com suas entradas
- Leitura somente (sem FAB)

**PWA + Offline** — COMPLETE
- Instalável como app
- Registro offline via IndexedDB (sync-queue)
- Indicador ⏳ em entradas pendentes
- Retry automático ao reconectar (máx 3 tentativas)
- Falha permanente após 3 tentativas (status: failed)

**Seleção de Data Passada ao Registrar** — COMPLETE
- Chip de data no formulário (mostra "Hoje" ou "23 de abr")
- DatePickerSheet: calendário em bottom sheet
- Datas futuras desabilitadas
- Integração com offline queue (preserva data escolhida)

**Ajustes e Fix Dates** — COMPLETE
- Página de settings com avatar do usuário
- Botão "Fix Dates" para corrigir entradas salvas com timezone UTC errado
- Sign out

**Correção de Timezone** — COMPLETE
- `DateSync` component: corrige data do servidor via `?date=` URL param
- Streaks calculados com data local do cliente (não UTC do servidor)

**Navegação (Bottom Nav)** — COMPLETE
- Início, Calendário, Ajustes
- Indicador visual na tab ativa

**Ranking de Sequências de Exercício** — COMPLETE
- Card de exercício na home leva a `/streaks`
- Top 3 maiores sequências históricas, ordenadas por comprimento
- Cada item mostra medalha, quantidade de dias e período (data início–fim)
- Estado vazio quando sem sequências registradas

---

## Milestone 2: Qualidade e Confiabilidade

**Goal:** Cobertura de testes nas camadas críticas e eliminação dos principais riscos identificados

### Features

**Testes de Server Actions** — PLANNED
- `createEntry`, `updateEntry`, `deleteEntry`, `fixEntryDates`
- Mock de `auth()` e cliente Drizzle

**Testes de Queries DB** — PLANNED
- `getEntriesForDate`, `getMonthSummary`, `getStreaks`
- Banco de dados em memória para testes

**Fix de Segurança: offsetMinutes clamp** — PLANNED
- Limitar `offsetMinutes` a `[-840, 840]` em `fixEntryDates`

**Atualização NextAuth para estável** — PLANNED
- Migrar de `5.0.0-beta.31` para versão estável quando disponível

---

## Future Considerations

- Notificações push (lembrete diário de registro)
- Exportação de dados (CSV/JSON)
- Gráficos de tendência (progresso ao longo do tempo)
- Múltiplos perfis ou metas personalizadas
