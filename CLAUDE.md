@AGENTS.md

## Checklist de entrega

Toda implementação de feature, correção de bug ou mudança de comportamento deve incluir:

- [ ] **PRD atualizado** (`prd.md` na raiz do repositório):
  - RFs novos ou alterados adicionados à tabela de requisitos funcionais
  - Regras de negócio novas documentadas na seção "Regras de negócio"
  - US afetados atualizados (critérios de aceite precisos, não vagos)
  - US novos criados para fluxos que ainda não existiam
  - Versão e data do documento incrementadas
- [ ] **Comportamentos edge case documentados** na seção "Regras de negócio" (ex: o que acontece em caso de falha, limites, timezone, estado vazio)
- [ ] **Deploy**: commit + push para `main` e `vercel --prod` a partir de `app/`

## Migrações de banco de dados em produção

**NUNCA use `.env.local` para rodar migrações em produção.** O `.env.local` pode apontar para um banco Turso diferente do que a Vercel usa. Isso já causou uma outage em produção (tabela `weights` não existia no banco correto).

Sempre que houver mudança de schema, execute:

```bash
vercel env pull .env.production.local --environment production --yes && \
  TURSO_DATABASE_URL=$(grep TURSO_DATABASE_URL .env.production.local | cut -d= -f2-) \
  TURSO_AUTH_TOKEN=$(grep TURSO_AUTH_TOKEN .env.production.local | cut -d= -f2-) \
  pnpm db:migrate && \
  rm .env.production.local
```

Execute esse comando **antes do deploy** para garantir que o banco de produção esteja atualizado quando o código novo chegar.
