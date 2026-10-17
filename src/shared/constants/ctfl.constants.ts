/**
 * Matriz Oficial de Distribuição de Questões CTFL v4.0.1 (Total: 40 questões)
 * Capítulo 1: Fundamentos do Teste (8 questões)
 * Capítulo 2: Testes ao Longo do Ciclo de Vida do Desenvolvimento de Software (6 questões)
 * Capítulo 3: Teste Estático (4 questões)
 * Capítulo 4: Análise e Projeto de Teste (12 questões)
 * Capítulo 5: Gerenciando as Atividades de Teste (8 questões)
 * Capítulo 6: Ferramentas de Teste (2 questões)
 */
export const CTFL_OFFICIAL_DISTRIBUTION: Record<string, number> = {
  '1': 8,
  '2': 6,
  '3': 4,
  '4': 12,
  '5': 8,
  '6': 2,
} as const;

export const CTFL_TOTAL_QUESTIONS = 40;
export const CTFL_PASS_SCORE_PERCENT = 65; // Mínimo de 26/40 para aprovação
export const CTFL_STANDARD_DURATION_MINUTES = 60;
export const CTFL_NON_NATIVE_DURATION_MINUTES = 75; // +25% de tempo adicional
