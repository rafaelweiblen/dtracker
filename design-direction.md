# Direcção visual — Diet Tracker

**Escolha: Orgânico / wellness** (Fase 0)

- Neutros e superfícies com **matiz subtil para o verde** da marca; poucos cantos agressivos; hierarquia clara sem “painéis de dashboard genéricos”.
- **Tipografia**: display serif humanista (Fraunces) + corpo arredondado legível (Nunito), para tom calmo e próximo de hábitos/saúde.
- **Composição**: mobile‑first com **ritmo assimétrico** (blocos principais vs secundários), menos centragens totalmente simétricas na entrada da app.

## Verificação (Fase 5)

- **Contraste**: texto sobre `primary/destructive` tinto e badges com opacidade suficiente; revisar em ferramentas se novos contrastes falharem WCAG AA em texto pequeno.
- **Movimento**: animações da landing e da home respeitam `prefers-reduced-motion` (ver `.landing-reveal`, `.home-section-reveal` em `globals.css`).
- **Foco**: FAB, BottomNav e botões críticos usam `focus-visible:ring-2 ring-ring`; evitar remover outline sem substituto.
