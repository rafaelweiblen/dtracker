# dtracker

Registo pessoal de hábitos (exercício, escapadas, água, peso) com calendário e tendências.

## Language

**Grelha do mês**:
A vista mensal na página Calendário.
_Avoid_: date picker dos formulários, calendário de peso em `/weight`

**Faixa de números**:
Os dois valores imediatamente abaixo da grelha do mês: SMA-7 e a contagem de registos de exercício na janela. Só leitura; não muda quando a grelha navega de mês. Neste esforço não inclui outros hábitos.

**Hoje da faixa**:
A data âncora da faixa é sempre o dia corrente, mesmo quando a grelha mostra outro mês.

**Janela de exercício**:
Desde o primeiro registo de exercício até hoje. O tecto são os 12 meses de calendário inclusivos que terminam no mês corrente (Out 2025–Set 2026, não «o mesmo dia há um ano»). O que está antes ignora-se.

**Meses no rótulo**:
Número de meses de calendário inclusivos do mês de início da janela até o mês corrente, no máximo 12. Há janela ⇒ pelo menos 1. O dia do mês não conta (31 Jan→1 Mar = 3). Meses vazios no meio entram (Abril→Setembro = 6).
_Avoid_: meses completos decorridos, só meses com treino, 0 meses

**Registo de exercício**:
Uma entrada de tipo exercício. Unidade da contagem na faixa (dois no mesmo dia contam dois). Na copy da faixa a palavra é **treino(s)**.
_Avoid_: dia com exercício (como unidade da faixa), exercício (como substantivo da faixa)

**Dia com exercício**:
Um dia de calendário com pelo menos um registo de exercício, independentemente de quantos exercícios houve nesse dia. Serve o calendário, não a faixa.
_Avoid_: sessão

**Sem dados**:
Texto da faixa quando a SMA-7 não é calculável, ou quando nunca houve um registo de exercício (não existe janela). Não se usa quando a janela existe e a contagem é 0.
_Avoid_: usar «Sem dados» para zero treinos nos últimos 12 meses

**SMA-7**:
Média aritmética dos pesos nos sete dias de calendário consecutivos que terminam no dia âncora, só quando os sete dias têm peso.
_Avoid_: média móvel (sem janela), média dos últimos 12 meses
