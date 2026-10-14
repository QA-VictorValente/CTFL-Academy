import { MindMapTemplate } from '@/types/notebook';

export const CTFL_MINDMAP_TEMPLATES: MindMapTemplate[] = [
  {
    id: '7-principios',
    name: 'Os 7 Princípios Universais do Teste',
    description: 'Syllabus CTFL 1.3 — Diretrizes fundamentais para planejamento e execução de testes.',
    chapterNumber: 1,
    data: {
      version: 1,
      root: {
        id: 'root-1',
        text: 'Os 7 Princípios do Teste (Syllabus 1.3)',
        emoji: '🧠',
        color: '#6366f1',
        children: [
          {
            id: 'p1',
            text: '1. O teste mostra a presença de defeitos',
            emoji: '🐛',
            color: '#ec4899',
            children: [
              { id: 'p1-1', text: 'Não prova a ausência de defeitos', emoji: '⚠️' },
              { id: 'p1-2', text: 'Reduz probabilidade de defeitos não descobertos', emoji: '📉' },
            ],
          },
          {
            id: 'p2',
            text: '2. O teste exaustivo é impossível',
            emoji: '♾️',
            color: '#f59e0b',
            children: [
              { id: 'p2-1', text: 'Testar tudo é inviável (entradas e estados infinitos)', emoji: '🛑' },
              { id: 'p2-2', text: 'Usar Análise de Riscos e Técnicas de Teste', emoji: '🎯' },
            ],
          },
          {
            id: 'p3',
            text: '3. Teste antecipado economiza tempo e dinheiro (Early Testing)',
            emoji: '⏳',
            color: '#10b981',
            children: [
              { id: 'p3-1', text: 'Shift-Left: testar desde requisitos e estórias', emoji: '⬅️' },
              { id: 'p3-2', text: 'Custo de correção cresce exponencialmente com o tempo', emoji: '💰' },
            ],
          },
          {
            id: 'p4',
            text: '4. Os defeitos se agrupam (Defect Clustering)',
            emoji: '🎯',
            color: '#8b5cf6',
            children: [
              { id: 'p4-1', text: 'Princípio de Pareto: ~80% dos defeitos em ~20% dos módulos', emoji: '📊' },
              { id: 'p4-2', text: 'Módulos complexos e com alta rotatividade de código', emoji: '⚙️' },
            ],
          },
          {
            id: 'p5',
            text: '5. Os testes se desgastam (Paradoxo do Pesticida)',
            emoji: '🧪',
            color: '#ef4444',
            children: [
              { id: 'p5-1', text: 'Mesmos testes repetidos deixam de achar novos bugs', emoji: '😴' },
              { id: 'p5-2', text: 'Necessário atualizar dados e escrever novos cenários', emoji: '🔄' },
            ],
          },
          {
            id: 'p6',
            text: '6. O teste depende do contexto',
            emoji: '🌐',
            color: '#06b6d4',
            children: [
              { id: 'p6-1', text: 'E-commerce != App médico != Software de aviação', emoji: '🏥' },
              { id: 'p6-2', text: 'Metodologia Ágil (Scrum) != Modelo Sequencial (V-Model)', emoji: '🏃' },
            ],
          },
          {
            id: 'p7',
            text: '7. Falácia da ausência de defeitos',
            emoji: '🚫',
            color: '#64748b',
            children: [
              { id: 'p7-1', text: 'Corrigir bugs não garante sistema útil', emoji: '🤷' },
              { id: 'p7-2', text: 'Verificação técnica não substitui Validação de negócio', emoji: '🤝' },
            ],
          },
        ],
      },
    },
  },
  {
    id: 'niveis-e-tipos',
    name: 'Níveis vs. Tipos de Teste (Capítulo 2)',
    description: 'Syllabus CTFL 2.1 e 2.2 — Diferença entre níveis de isolamento e características avaliadas.',
    chapterNumber: 2,
    data: {
      version: 1,
      root: {
        id: 'root-2',
        text: 'Níveis e Tipos de Teste (Syllabus Cap. 2)',
        emoji: '🏗️',
        color: '#8b5cf6',
        children: [
          {
            id: 'niveis',
            text: 'Níveis de Teste (Isolamento & Escopo)',
            emoji: '🧱',
            color: '#6366f1',
            children: [
              { id: 'n1', text: 'Teste de Componente / Unitário (funções isoladas)', emoji: '🔬' },
              { id: 'n2', text: 'Teste de Integração de Componentes (módulos e APIs)', emoji: '🔗' },
              { id: 'n3', text: 'Teste de Sistema (sistema ponta a ponta integrado)', emoji: '🖥️' },
              { id: 'n4', text: 'Teste de Integração de Sistemas (APIs externas, legado)', emoji: '🌐' },
              { id: 'n5', text: 'Teste de Aceite (UAT, Operacional, Regulatório)', emoji: '✍️' },
            ],
          },
          {
            id: 'tipos',
            text: 'Tipos de Teste (Características Avaliadas)',
            emoji: '🎨',
            color: '#10b981',
            children: [
              { id: 't1', text: 'Funcional: "O que o sistema faz" (Requisitos)', emoji: '📋' },
              { id: 't2', text: 'Não-Funcional: Desempenho, Segurança, Usabilidade', emoji: '⚡' },
              { id: 't3', text: 'Caixa-Branca: Estrutura interna e caminhos de código', emoji: '⚙️' },
              { id: 't4', text: 'Ligado a Mudanças: Confirmação vs. Regressão', emoji: '🔄' },
            ],
          },
        ],
      },
    },
  },
  {
    id: 'tecnicas-teste',
    name: 'Técnicas de Projeto de Teste (Capítulo 4)',
    description: 'Syllabus CTFL 4.0 — Caixa-Preta (Caixa-Fechada), Caixa-Branca e Experiência.',
    chapterNumber: 4,
    data: {
      version: 1,
      root: {
        id: 'root-3',
        text: 'Técnicas de Teste (Syllabus Cap. 4)',
        emoji: '📐',
        color: '#10b981',
        children: [
          {
            id: 'cp',
            text: 'Caixa-Preta (Baseada em Especificação)',
            emoji: '📦',
            color: '#3b82f6',
            children: [
              { id: 'cp1', text: 'Particionamento de Equivalência (EP)', emoji: '🗂️' },
              { id: 'cp2', text: 'Análise de Valor Limite (BVA 2 e 3 valores)', emoji: '📏' },
              { id: 'cp3', text: 'Tabela de Decisão (combinações de regras)', emoji: '📊' },
              { id: 'cp4', text: 'Teste de Transição de Estados (eventos e estados)', emoji: '🔀' },
            ],
          },
          {
            id: 'cb',
            text: 'Caixa-Branca (Baseada na Estrutura Interna)',
            emoji: '⚙️',
            color: '#ec4899',
            children: [
              { id: 'cb1', text: 'Teste de Instrução (Statement Coverage)', emoji: '📄' },
              { id: 'cb2', text: 'Teste de Ramificação (Branch Coverage)', emoji: '🌿' },
              { id: 'cb3', text: 'Regra de Subsunção: 100% Branch cobre 100% Instrução', emoji: '💡' },
            ],
          },
          {
            id: 'exp',
            text: 'Baseada na Experiência',
            emoji: '🕵️',
            color: '#f59e0b',
            children: [
              { id: 'exp1', text: 'Suposição de Erro (Error Guessing)', emoji: '🎯' },
              { id: 'exp2', text: 'Teste Exploratório (Charter + Timeboxing)', emoji: '🧭' },
              { id: 'exp3', text: 'Teste Baseado em Lista de Verificação (Checklist)', emoji: '📋' },
            ],
          },
        ],
      },
    },
  },
  {
    id: 'processo-teste',
    name: 'Atividades do Processo de Teste (ISO 29119)',
    description: 'Syllabus CTFL 1.4 — As atividades essenciais do processo de teste e seu testware.',
    chapterNumber: 1,
    data: {
      version: 1,
      root: {
        id: 'root-4',
        text: 'Processo de Teste (Syllabus 1.4 / ISO 29119)',
        emoji: '🔄',
        color: '#06b6d4',
        children: [
          {
            id: 'a1',
            text: '1. Planejamento do Teste',
            emoji: '📅',
            color: '#6366f1',
            children: [{ id: 'a1-1', text: 'Testware: Plano de Teste, Estimativas, Critérios DoR/DoD', emoji: '📝' }],
          },
          {
            id: 'a2',
            text: '2. Monitoramento e Controle',
            emoji: '📈',
            color: '#3b82f6',
            children: [{ id: 'a2-1', text: 'Testware: Relatórios de Progresso e Métricas', emoji: '📊' }],
          },
          {
            id: 'a3',
            text: '3. Análise do Teste ("O que testar?")',
            emoji: '🔍',
            color: '#10b981',
            children: [{ id: 'a3-1', text: 'Testware: Condições de Teste (Test Conditions)', emoji: '🎯' }],
          },
          {
            id: 'a4',
            text: '4. Modelagem do Teste ("Como testar?")',
            emoji: '📐',
            color: '#f59e0b',
            children: [{ id: 'a4-1', text: 'Testware: Casos de Teste (Test Cases), Dados de Teste', emoji: '📑' }],
          },
          {
            id: 'a5',
            text: '5. Implementação do Teste',
            emoji: '🛠️',
            color: '#ec4899',
            children: [{ id: 'a5-1', text: 'Testware: Procedimentos de Teste, Scripts de Automação', emoji: '💻' }],
          },
          {
            id: 'a6',
            text: '6. Execução do Teste',
            emoji: '🚀',
            color: '#8b5cf6',
            children: [{ id: 'a6-1', text: 'Testware: Logs de Execução, Relatórios de Defeitos (Bugs)', emoji: '🐛' }],
          },
          {
            id: 'a7',
            text: '7. Conclusão do Teste',
            emoji: '🏁',
            color: '#14b8a6',
            children: [{ id: 'a7-1', text: 'Testware: Relatório de Conclusão do Teste e Lições Aprendidas', emoji: '🏆' }],
          },
        ],
      },
    },
  },
];
