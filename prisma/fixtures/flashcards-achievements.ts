import { DifficultyLevel } from '@prisma/client';

export interface SeedFlashcardItem {
  topicCode: string;
  front: string;
  back: string;
  tags: string[];
  difficulty: DifficultyLevel;
}

export interface SeedAchievementItem {
  code: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  ruleType: string;
  ruleThreshold: number;
}

export const SEED_FLASHCARDS: SeedFlashcardItem[] = [
  {
    topicCode: '1.1',
    front: 'Qual é a diferença entre Verificação e Validação no teste de software?',
    back: 'Verificação confirma se o sistema cumpre os requisitos especificados ("construir o produto corretamente"). Validação confirma se o sistema atende às necessidades reais dos usuários no ambiente operacional ("construir o produto certo").',
    tags: ['FL-1.1.1', 'Verificação', 'Validação'],
    difficulty: 'EASY',
  },
  {
    topicCode: '1.1',
    front: 'Qual é a diferença fundamental entre Teste e Depuração (Debugging)?',
    back: 'O Teste provoca falhas (dinâmico) ou encontra defeitos diretamente (estático). A Depuração é a atividade de desenvolvimento que diagnostica a causa da falha no código e corrige o defeito.',
    tags: ['FL-1.1.2', 'Debugging'],
    difficulty: 'EASY',
  },
  {
    topicCode: '1.2',
    front: 'Diferencie Erro, Defeito e Falha segundo o glossário ISTQB.',
    back: 'Erro (Error/Mistake): ação humana equivocada. Defeito (Defect/Bug/Fault): imperfeição em um artefato (código ou documento). Falha (Failure): comportamento incorreto observável durante a execução do sistema.',
    tags: ['FL-1.2.3', 'Conceitos Essenciais'],
    difficulty: 'EASY',
  },
  {
    topicCode: '1.2',
    front: 'Como se diferenciam Garantia da Qualidade (QA) e Controle da Qualidade (QC)?',
    back: 'QA (Garantia da Qualidade) é preventiva e orientada ao PROCESSO. QC (Controle da Qualidade, que inclui o Teste) é corretivo e orientado ao PRODUTO.',
    tags: ['FL-1.2.2', 'QA', 'QC'],
    difficulty: 'MEDIUM',
  },
  {
    topicCode: '1.3',
    front: 'Quais são os 7 Princípios de Teste do ISTQB CTFL?',
    back: '1. O teste mostra a presença de defeitos, não a ausência; 2. Teste exaustivo é impossível; 3. Teste antecipado economiza tempo e dinheiro; 4. Defeitos se agrupam; 5. Os testes se desgastam (Paradoxo do Pesticida); 6. O teste depende do contexto; 7. Falácia da ausência de defeitos.',
    tags: ['FL-1.3.1', 'Princípios'],
    difficulty: 'MEDIUM',
  },
  {
    topicCode: '1.4',
    front: 'Qual atividade responde a "O que testar?" e qual responde a "Como testar?"?',
    back: 'Análise de Teste define as condições de teste ("O que testar?"). Projeto de Teste elabora os casos de teste e dados de teste ("Como testar?").',
    tags: ['FL-1.4.1', 'Processo de Teste'],
    difficulty: 'MEDIUM',
  },
  {
    topicCode: '1.5',
    front: 'O que preconiza a abordagem Whole Team (Equipe Unificada)?',
    back: 'Qualquer membro da equipe com as competências necessárias pode realizar tarefas de teste e todos os membros da equipe compartilham a responsabilidade pela qualidade.',
    tags: ['FL-1.5.2', 'Whole Team'],
    difficulty: 'EASY',
  },
  {
    topicCode: '2.1',
    front: 'Diferencie TDD, ATDD e BDD.',
    back: 'TDD: testes unitários escritos antes do código (Red-Green-Refactor). ATDD: testes derivados colaborativamente dos critérios de aceite antes do desenvolvimento. BDD: comportamento expresso em linguagem natural Dado/Quando/Então.',
    tags: ['FL-2.1.3', 'TDD', 'ATDD', 'BDD'],
    difficulty: 'MEDIUM',
  },
  {
    topicCode: '2.2',
    front: 'Quais são os 5 Níveis de Teste definidos no Syllabus CTFL v4.0.1?',
    back: '1. Teste de Componente (Unitário); 2. Teste de Integração de Componentes; 3. Teste de Sistema; 4. Teste de Integração de Sistemas; 5. Teste de Aceite.',
    tags: ['FL-2.2.1', 'Níveis de Teste'],
    difficulty: 'EASY',
  },
  {
    topicCode: '2.2',
    front: 'Qual é a diferença entre Teste de Confirmação e Teste de Regressão?',
    back: 'Teste de Confirmação verifica se um defeito específico foi efetivamente corrigido. Teste de Regressão verifica se uma mudança não introduziu efeitos adversos em partes inalteradas do software.',
    tags: ['FL-2.2.3', 'Confirmação', 'Regressão'],
    difficulty: 'EASY',
  },
  {
    topicCode: '2.3',
    front: 'Quais são os 3 gatilhos (triggers) para o Teste de Manutenção?',
    back: '1. Modificação (melhorias planejadas ou correções); 2. Migração (mudança de plataforma/infraestrutura); 3. Aposentadoria (desativação do sistema, validando retenção e restauração de dados).',
    tags: ['FL-2.3.1', 'Manutenção'],
    difficulty: 'MEDIUM',
  },
  {
    topicCode: '3.1',
    front: 'Como o Teste Estático e o Teste Dinâmico se diferenciam na detecção de problemas?',
    back: 'O Teste Estático examina artefatos sem executar o software e encontra DEFEITOS diretamente. O Teste Dinâmico executa o software e provoca FALHAS visíveis.',
    tags: ['FL-3.1.3', 'Teste Estático'],
    difficulty: 'EASY',
  },
  {
    topicCode: '3.2',
    front: 'Quais são os 4 Tipos de Revisão no Teste Estático, do menos formal ao mais formal?',
    back: '1. Revisão Informal; 2. Walkthrough (liderado pelo autor); 3. Revisão Técnica (liderada por moderador com especialistas); 4. Inspeção (mais formal, liderada por moderador, coleta métricas, autor não pode ser líder/moderador/relator).',
    tags: ['FL-3.2.4', 'Revisões'],
    difficulty: 'MEDIUM',
  },
  {
    topicCode: '4.2',
    front: 'Na Análise de Valor Limite (BVA), quais pontos são testados na BVA de 2 valores vs. BVA de 3 valores para uma faixa inteira [10, 20]?',
    back: 'BVA de 2 valores testa o limite e o vizinho adjacente externo: {9, 10, 20, 21} (4 valores). BVA de 3 valores testa o limite e ambos os vizinhos imediatos: {9, 10, 11, 19, 20, 21} (6 valores).',
    tags: ['FL-4.2.2', 'BVA', 'K3'],
    difficulty: 'HARD',
  },
  {
    topicCode: '4.3',
    front: 'Qual é a relação de subsunção entre Cobertura de Ramificação (Branch) e Cobertura de Instrução (Statement)?',
    back: '100% de Cobertura de Ramificação SEMPRE garante 100% de Cobertura de Instrução. Porém, 100% de Cobertura de Instrução NÃO garante 100% de Cobertura de Ramificação.',
    tags: ['FL-4.3.2', 'Caixa-Branca'],
    difficulty: 'MEDIUM',
  },
  {
    topicCode: '4.5',
    front: 'O que significam os 3 Cs e o acrônimo INVEST em Histórias de Usuário?',
    back: '3 Cs: Card, Conversation, Confirmation (critérios de aceite). INVEST: Independent, Negotiable, Valuable, Estimable, Small, Testable.',
    tags: ['FL-4.5.1', 'INVEST', '3Cs'],
    difficulty: 'EASY',
  },
  {
    topicCode: '5.1',
    front: 'Quais são as fórmulas da Estimativa de Três Pontos (Three-Point Estimation) para o valor esperado (E) e o desvio padrão (SD)?',
    back: 'Sendo a = otimista, m = mais provável e b = pessimista: E = (a + 4m + b) / 6 e SD = (b - a) / 6.',
    tags: ['FL-5.1.4', 'Estimativa', 'K3'],
    difficulty: 'HARD',
  },
  {
    topicCode: '5.1',
    front: 'Como são organizados os 4 Quadrantes de Teste Ágil (Q1, Q2, Q3 e Q4)?',
    back: 'Q1 (Tecnologia / Apoia a equipe): Unitários/Componente. Q2 (Negócio / Apoia a equipe): Funcionais/BDD. Q3 (Negócio / Critica o produto): Exploratórios/Usabilidade/UAT. Q4 (Tecnologia / Critica o produto): Desempenho/Segurança.',
    tags: ['FL-5.1.7', 'Quadrantes'],
    difficulty: 'MEDIUM',
  },
  {
    topicCode: '5.2',
    front: 'Qual é a diferença entre Risco de Projeto e Risco de Produto?',
    back: 'Risco de Projeto afeta o cronograma, orçamento ou recursos do projeto (ex.: falta de pessoal, atraso de ambiente). Risco de Produto afeta diretamente as características de qualidade do software (ex.: cálculo errado, falha de segurança).',
    tags: ['FL-5.2.2', 'Riscos'],
    difficulty: 'MEDIUM',
  },
  {
    topicCode: '6.2',
    front: 'Cite 3 benefícios e 3 riscos clássicos da Automação de Testes.',
    back: 'Benefícios: redução de trabalho manual repetitivo, consistência/repetibilidade, feedback mais rápido no CI. Riscos: expectativas irreais, subestimativa do esforço de manutenção dos scripts, confiança excessiva na ferramenta.',
    tags: ['FL-6.2.1', 'Automação'],
    difficulty: 'EASY',
  },
];

export const SEED_ACHIEVEMENTS: SeedAchievementItem[] = [
  {
    code: 'FIRST_LESSON',
    title: 'Primeiro Passo no Syllabus',
    description: 'Concluiu sua primeira aula didática do Syllabus CTFL v4.0.1.',
    icon: 'BookOpen',
    xpReward: 50,
    ruleType: 'LESSONS_COMPLETED',
    ruleThreshold: 1,
  },
  {
    code: 'FIVE_LESSONS',
    title: 'Estudante Dedicado',
    description: 'Concluiu pelo menos 5 aulas didáticas na plataforma.',
    icon: 'Layers',
    xpReward: 100,
    ruleType: 'LESSONS_COMPLETED',
    ruleThreshold: 5,
  },
  {
    code: 'FIRST_FLASHCARD',
    title: 'Memória Ativa',
    description: 'Revisou pelo menos 5 flashcards com repetição espaçada.',
    icon: 'Brain',
    xpReward: 50,
    ruleType: 'FLASHCARDS_REVIEWED',
    ruleThreshold: 5,
  },
  {
    code: 'EXERCISES_10',
    title: 'Praticante Analítico',
    description: 'Respondeu corretamente a pelo menos 10 questões na plataforma.',
    icon: 'CheckCircle2',
    xpReward: 100,
    ruleType: 'CORRECT_ANSWERS',
    ruleThreshold: 10,
  },
  {
    code: 'FIRST_EXAM',
    title: 'Batismo de Prova',
    description: 'Finalizou seu primeiro simulado cronometrado na plataforma.',
    icon: 'Clock',
    xpReward: 120,
    ruleType: 'EXAMS_COMPLETED',
    ruleThreshold: 1,
  },
  {
    code: 'EXAM_PASSED',
    title: 'Aprovado no Critério ISTQB (65%+)',
    description: 'Alcançou aprovação (>= 65% de acerto) em um simulado.',
    icon: 'Award',
    xpReward: 250,
    ruleType: 'EXAMS_PASSED',
    ruleThreshold: 1,
  },
  {
    code: 'STREAK_3',
    title: 'Consistência de QA (3 Dias)',
    description: 'Manteve uma sequência de estudos ativa por 3 dias consecutivos.',
    icon: 'Flame',
    xpReward: 150,
    ruleType: 'STREAK_DAYS',
    ruleThreshold: 3,
  },
];
