# DTracker — Rastreador de Dieta e Exercício

**Vision:** Aplicativo mobile-first para rastrear escapadas da dieta e sessões de exercício, com contadores de sequência e histórico visual.  
**For:** Uso pessoal — usuário único rastreando sua própria disciplina  
**Solves:** Falta de um lugar simples para registrar "escapei hoje" ou "exercitei hoje" e visualizar tendências ao longo do tempo

## Goals

- Registro rápido de escapadas e exercícios com descrição (< 3 taps do início ao salvar)
- Visibilidade de consistência: streaks de exercício e dias sem escapar
- Funcionar offline — o app deve aceitar registros mesmo sem internet

## Tech Stack

**Core:**
- Framework: Next.js 16.2.4 (App Router)
- Language: TypeScript 5.x
- Database: Turso (libSQL/SQLite)

**Key dependencies:** Drizzle ORM, NextAuth v5, Serwist (PWA), idb (IndexedDB), Tailwind CSS v4

## Scope

**v1 inclui:**
- Autenticação com Google OAuth
- Registro de entradas: tipo (escape/exercício) + descrição + data
- Log diário com edição e exclusão por swipe
- Streak bar: dias consecutivos de exercício + dias desde última escapada
- Calendário mensal com indicadores visuais por dia
- Página de detalhe para qualquer dia passado
- Seleção de data passada ao criar registro (não apenas hoje)
- PWA instalável com suporte offline via IndexedDB
- Fix Dates: corrigir datas de entradas salvas com timezone errado

**Explicitamente fora de escopo:**
- Multi-usuário ou compartilhamento
- Metas calóricas ou nutritivas
- Categorias além de escape/exercício
- Notificações push
- Exportação de dados

## Constraints

- Timeline: produto pessoal — sem deadline
- Technical: Vercel free tier, Turso free tier
- Resources: desenvolvedor solo
