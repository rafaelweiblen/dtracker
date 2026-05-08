# Política de segurança

## Versões suportadas

| Versão / ramo | Suportado |
|---------------|-----------|
| `main` (deploy em produção) | Sim |

## Como reportar uma vulnerabilidade

**Não** abra um issue público com detalhes de segurança.

1. No GitHub do repositório, use **Private vulnerability reporting** (Settings → Advanced Security), se estiver ativo.
2. Caso contrário, contacte o mantenedor por um canal privado (email ou mensagem directa) com:
   - descrição do problema,
   - passos para reproduzir (se aplicável),
   - impacto estimado.

Esperamos uma primeira resposta em poucos dias úteis; correcções dependem da gravidade e do tempo disponível.

## Boas práticas para contribuidores

- Não commite segredos (`.env`, tokens OAuth, `AUTH_SECRET`, URLs Turso com credenciais).
- Use `pnpm audit` localmente antes de PRs grandes de dependências.
