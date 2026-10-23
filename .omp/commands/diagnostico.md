---
description: "Aciona o Modo Diagnóstico (auditoria somente-leitura) com os agentes especialistas do CTFL Academy."
argument-hint: "[escopo: ex. geral, arquitetura, testes, seguranca, ci-cd, ux]"
---

Ative o **MODO DIAGNÓSTICO** da orquestração multiagente do **CTFL Academy** conforme `docs/orquestracao/MANUAL_ORQUESTRACAO.md`.

Escopo solicitado pelo usuário: `$ARGUMENTS`

Instruções obrigatórias:
1. Acione em paralelo via `task` os agentes dedicados pertinentes ao escopo (`po`, `scrum-master`, `desenvolvedor`, `qa`, `devops`).
2. **Regra estrita de diagnóstico:** Nenhum agente pode modificar arquivos de código (`src/`, `prisma/`), banco de dados ou infraestrutura durante o diagnóstico.
3. Consolide os achados reais com evidências verificadas (`arquivo:linha` e saídas de comandos não destrutivos), classifique riscos por severidade e apresente recomendações priorizadas pelo `po` e `scrum-master`.
