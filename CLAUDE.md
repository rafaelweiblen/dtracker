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
