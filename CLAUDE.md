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

**NUNCA use `.env.local` para rodar migrações em produção.** O banco de produção é o Turso `dieta-prod`. O `vercel env pull` retorna credenciais vazias para esse projeto e NÃO deve ser usado para migrações.

Sempre que houver mudança de schema, execute:

```bash
cd app && \
  TURSO_DATABASE_URL="libsql://dieta-prod-rafaelweiblen.aws-us-east-1.turso.io" \
  TURSO_AUTH_TOKEN=$(turso db tokens create dieta-prod) \
  pnpm db:migrate
```

Para verificar as tabelas existentes no banco de produção:

```bash
turso db shell dieta-prod "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

Execute a migração **antes do deploy** para garantir que o banco de produção esteja atualizado quando o código novo chegar.
