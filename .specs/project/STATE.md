# State

**Last Updated:** 2026-04-25  
**Current Work:** Brownfield mapping + project initialization — concluído

---

## Recent Decisions (Last 60 days)

### AD-001: Timezone via URL param ao invés de cookie (2026-04-24)

**Decision:** `DateSync` corrige a data do servidor via `router.replace(?date=YYYY-MM-DD)` — recarrega a página com a data local do cliente como searchParam  
**Reason:** Server Actions e Server Components não têm acesso ao timezone do cliente; URL param é a forma mais simples de passar a data local sem estado extra  
**Trade-off:** Causa um re-render extra na primeira carga quando a data UTC difere da local (após 21h horário de Brasília)  
**Impact:** Todas as páginas devem ler `searchParams.date` e passá-la para as queries em vez de usar `new Date()`

### AD-002: getStreaks aceita `today` opcional (2026-04-24)

**Decision:** `getStreaks(userId, today?)` — `today` vem da página (timezone-corrigido) em vez de ser computado internamente com `new Date()` (UTC)  
**Reason:** Correção do bug que mostrava 2 dias desde última escapada quando eram apenas 1 (escapada em 23/04, hoje 24/04)  
**Trade-off:** Nenhum — é estritamente mais correto  
**Impact:** Home page deve sempre passar `today` ao chamar `getStreaks`

### AD-003: Seleção de data passada via DatePickerSheet (2026-04-25)

**Decision:** Formulário de criação de entrada inclui chip de data + `DatePickerSheet` (bottom sheet com calendário)  
**Reason:** Permitir registrar entradas retroativamente sem criar uma página separada de "entrada passada"  
**Trade-off:** Formulário fica levemente mais complexo; datas futuras são bloqueadas por UI (não validadas no servidor)  
**Impact:** `EntryForm` recebe `initialDate?` prop; `createEntry` já aceitava `date?` opcional

### AD-004: Offline queue com max 3 retries + status permanent failed (2026-04-23)

**Decision:** Entradas no IndexedDB têm `retries: number` e `status: "pending" | "failed"`. Após 3 falhas → `status: "failed"`, nunca mais reprocessado automaticamente  
**Reason:** Evitar loop infinito de retry para entradas que falham por erro de validação ou data inválida  
**Trade-off:** Entrada pode ficar "presa" como failed sem feedback claro ao usuário sobre o motivo  
**Impact:** UI mostra ⏳ para pendente; não há UI separada para failed (concern documentado)

### AD-005: Pure functions extraídas para testabilidade (2026-04-20)

**Decision:** `computeStreaks` e `computeMonthSummary` em `db/queries/entries.ts` são funções puras exportadas separadas das queries DB  
**Reason:** Lógica de negócio crítica (streaks) precisa de testes unitários sem infraestrutura de banco  
**Trade-off:** Lógica vive no mesmo arquivo que as queries (acoplamento de localização)  
**Impact:** Tests em `entries.test.ts` testam apenas as funções puras; queries DB não têm testes

---

## Lessons Learned

### L-001: Deploy deve rodar de dentro de `app/`, não da raiz do repo

**Context:** `vercel --prod` rodado de `/Users/rafaelweiblendossantos/Dieta` (pai de `app/`)  
**Problem:** "No Next.js version detected" — Vercel não encontrou `package.json` com Next.js  
**Solution:** Sempre rodar `vercel --prod` de `/Users/rafaelweiblendossantos/Dieta/app/`  
**Prevents:** Deploys falhos por diretório errado

### L-002: prd.md está fora do repositório git

**Context:** `prd.md` vive em `/Users/rafaelweiblendossantos/Dieta/prd.md`; o git root é `app/`  
**Problem:** `git add ../prd.md` falha com "is outside repository"  
**Solution:** Editar o arquivo local — não é versionado. Considerar mover para dentro de `app/` ou usar `.specs/` para documentação  
**Prevents:** Frustração ao tentar commitar a documentação do produto

### L-003: createEntry date fallback usa UTC do servidor

**Context:** `app/actions/entries.ts` linha 38 — fallback para `now.toISOString()` quando `date` ausente  
**Problem:** Após 21h horário Brasil, o servidor já está em "amanhã" UTC — entries sem data explícita salvas no dia errado  
**Solution:** Sempre passar `date` explicitamente dos formulários/hooks de chamada  
**Prevents:** Entradas salvas com data errada por race condition de timezone

---

## Deferred Ideas

- [ ] Notificações push para lembrete diário — Captured during: feature de registro
- [ ] Exportação de dados (CSV) — Captured during: page de settings
- [ ] Gráfico de tendência ao longo do tempo — Captured during: ROADMAP

---

## Preferences

**Model Guidance Shown:** never
