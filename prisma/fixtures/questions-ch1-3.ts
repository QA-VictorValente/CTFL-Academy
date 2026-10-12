import {
  CognitiveLevel,
  DifficultyLevel,
  QuestionEditorialStatus,
} from '@prisma/client';

export interface SeedQuestionItem {
  code: string;
  equivalenceGroupId?: string;
  topicCode: string;
  learningObjectiveCode: string;
  cognitiveLevel: CognitiveLevel;
  difficulty: DifficultyLevel;
  statement: string;
  correctOptionLabel: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  referenceSection: string;
  status?: QuestionEditorialStatus;
  options: {
    label: 'A' | 'B' | 'C' | 'D';
    content: string;
    isCorrect: boolean;
    justification: string;
  }[];
}

export const QUESTIONS_CH1_TO_3: SeedQuestionItem[] = [
  // ==========================================
  // CAPÍTULO 1 — FUNDAMENTOS DE TESTE (10 publicadas + 1 em revisão)
  // ==========================================
  {
    code: 'Q-CTFL-101',
    topicCode: '1.1',
    learningObjectiveCode: 'FL-1.1.1',
    cognitiveLevel: 'K1',
    difficulty: 'EASY',
    statement:
      'De acordo com o Syllabus ISTQB CTFL v4.0.1, qual das alternativas abaixo representa um objetivo típico do teste de software?',
    correctOptionLabel: 'B',
    explanation:
      'Reduzir o nível de risco de qualidade inadequada do software e fornecer informações para tomada de decisão das partes interessadas são objetivos diretos do teste (seção 1.1.1). Provar que não existem defeitos viola o Princípio 1.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 1.1.1 (Objetivos do Teste)',
    options: [
      {
        label: 'A',
        content: 'Provar matematicamente que o objeto de teste está 100% livre de defeitos antes da entrada em produção.',
        isCorrect: false,
        justification: 'Incorreta. O primeiro princípio de teste afirma que o teste mostra a presença de defeitos, não a sua ausência.',
      },
      {
        label: 'B',
        content: 'Reduzir o nível de risco de qualidade inadequada do software e fornecer informações para tomada de decisão.',
        isCorrect: true,
        justification: 'Correta. Reduzir riscos e informar partes interessadas constam explicitamente entre os objetivos típicos na seção 1.1.1.',
      },
      {
        label: 'C',
        content: 'Localizar a linha exata do código-fonte que provocou uma falha e aplicar a correção definitiva no repositório.',
        isCorrect: false,
        justification: 'Incorreta. Localizar a causa no código e corrigir o defeito é objetivo da depuração (debugging), não do teste.',
      },
      {
        label: 'D',
        content: 'Punir individualmente os desenvolvedores responsáveis por módulos com alta densidade de defeitos.',
        isCorrect: false,
        justification: 'Incorreta. O teste avalia a qualidade do produto de trabalho de forma construtiva, jamais com finalidade punitiva.',
      },
    ],
  },
  {
    code: 'Q-CTFL-102',
    topicCode: '1.1',
    learningObjectiveCode: 'FL-1.1.2',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Qual das seguintes afirmações diferencia corretamente as atividades de teste e de depuração (debugging)?',
    correctOptionLabel: 'C',
    explanation:
      'O teste dinâmico provoca falhas causadas por defeitos (e o teste estático encontra defeitos diretamente), enquanto a depuração analisa a falha, diagnostica a causa (o defeito no código) e remove esse defeito.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 1.1.2 (Teste e Depuração)',
    options: [
      {
        label: 'A',
        content: 'O teste corrige defeitos encontrados em produção, enquanto a depuração executa testes de regressão automatizados.',
        isCorrect: false,
        justification: 'Incorreta. A correção de defeitos pertence à depuração; testes de regressão pertencem ao teste.',
      },
      {
        label: 'B',
        content: 'A depuração identifica falhas sem necessidade de acesso ao código-fonte, enquanto o teste exige alteração direta no código.',
        isCorrect: false,
        justification: 'Incorreta. A depuração exige diagnosticar e alterar o código/design, enquanto o teste não corrige o código do produto.',
      },
      {
        label: 'C',
        content: 'O teste identifica defeitos diretamente ou provoca falhas, enquanto a depuração diagnostica a causa da falha e elimina o defeito.',
        isCorrect: true,
        justification: 'Correta. Descreve com exatidão a fronteira entre teste e depuração segundo o Syllabus 4.0.1.',
      },
      {
        label: 'D',
        content: 'Teste e depuração são sinônimos usados para descrever o trabalho exclusivo da equipe independente de QA.',
        isCorrect: false,
        justification: 'Incorreta. São atividades distintas, e a depuração é tipicamente realizada pelos desenvolvedores.',
      },
    ],
  },
  {
    code: 'Q-CTFL-103',
    topicCode: '1.2',
    learningObjectiveCode: 'FL-1.2.2',
    cognitiveLevel: 'K1',
    difficulty: 'EASY',
    statement:
      'Como o Syllabus ISTQB CTFL v4.0.1 define a relação entre Teste, Controle da Qualidade (QC) e Garantia da Qualidade (QA)?',
    correctOptionLabel: 'A',
    explanation:
      'O Controle da Qualidade (QC) é uma abordagem corretiva orientada ao produto (da qual o teste é a principal forma), enquanto a Garantia da Qualidade (QA) é uma abordagem preventiva orientada à implementação e melhoria dos processos.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 1.2.2 (Teste e Garantia da Qualidade)',
    options: [
      {
        label: 'A',
        content: 'O teste é a principal forma de Controle da Qualidade (orientado ao produto), enquanto a Garantia da Qualidade é uma abordagem preventiva orientada ao processo.',
        isCorrect: true,
        justification: 'Correta. Reflete exatamente a distinção conceitual entre QC (produto/corretivo) e QA (processo/preventivo) na seção 1.2.2.',
      },
      {
        label: 'B',
        content: 'A Garantia da Qualidade (QA) restringe-se à execução manual de casos de teste no final do ciclo de vida.',
        isCorrect: false,
        justification: 'Incorreta. QA foca na aderência e melhoria de processos em toda a organização.',
      },
      {
        label: 'C',
        content: 'O Controle da Qualidade (QC) trata exclusivamente da auditoria de processos de RH, sem relação com o teste de software.',
        isCorrect: false,
        justification: 'Incorreta. O teste é justamente a principal atividade de Controle da Qualidade (QC).',
      },
      {
        label: 'D',
        content: 'Garantia da Qualidade e Controle da Qualidade são termos obsoletos substituídos integralmente pela depuração.',
        isCorrect: false,
        justification: 'Incorreta. Ambos fazem parte da Gestão da Qualidade e continuam centrais no Syllabus 4.0.1.',
      },
    ],
  },
  {
    code: 'Q-CTFL-104',
    equivalenceGroupId: 'EQ-ERR-DEF-FAIL',
    topicCode: '1.2',
    learningObjectiveCode: 'FL-1.2.3',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Durante o desenvolvimento de uma API de folha de pagamento, um programador interpretou equivocadamente a tabela do Imposto de Renda e codificou a alíquota de 22,5% como 2,25%. Ao processar o salário de um analista em homologação, o valor líquido retornado pelo endpoint ficou incorreto. Nesse cenário, classifique respectivamente: (1) a interpretação equivocada do programador, (2) a constante 0.0225 gravada no código-fonte e (3) o valor líquido incorreto retornado na execução:',
    correctOptionLabel: 'D',
    explanation:
      '(1) A ação humana equivocada do programador é um Erro (enganar-se); (2) a alíquota errada gravada no código-fonte é um Defeito (bug no artefato); (3) o cálculo incorreto observado quando o endpoint é executado é uma Falha.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 1.2.3 (Erros, Defeitos, Falhas e Causas-Raiz)',
    options: [
      {
        label: 'A',
        content: '(1) Defeito; (2) Falha; (3) Erro.',
        isCorrect: false,
        justification: 'Incorreta. Inverte todos os conceitos do encadeamento causal.',
      },
      {
        label: 'B',
        content: '(1) Falha; (2) Erro; (3) Defeito.',
        isCorrect: false,
        justification: 'Incorreta. A falha é o comportamento incorreto em execução, não a ação humana inicial.',
      },
      {
        label: 'C',
        content: '(1) Causa-raiz; (2) Falha; (3) Defeito.',
        isCorrect: false,
        justification: 'Incorreta. O código incorreto é um defeito, e o resultado em tempo de execução é uma falha.',
      },
      {
        label: 'D',
        content: '(1) Erro; (2) Defeito; (3) Falha.',
        isCorrect: true,
        justification: 'Correta. O erro humano gera o defeito no código, que provoca a falha durante a execução da API.',
      },
    ],
  },
  {
    code: 'Q-CTFL-105',
    topicCode: '1.3',
    learningObjectiveCode: 'FL-1.3.1',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Uma equipe de QA executa exatamente os mesmos 80 casos de teste em todas as sprints há dez meses. Nenhum desses 80 testes falha mais, porém clientes reportaram 12 novos bugs nas funcionalidades recém-lançadas. Qual princípio de teste explica por que a suíte atual deixou de encontrar novos defeitos?',
    correctOptionLabel: 'B',
    explanation:
      'O Princípio 5 ("Os testes se desgastam" / Paradoxo do Pesticida) explica que repetir continuamente os mesmos testes deixa de encontrar novos defeitos, sendo necessário revisar os testes existentes e escrever novos casos de teste.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 1.3.1 (Os Sete Princípios de Teste)',
    options: [
      {
        label: 'A',
        content: 'Falácia da ausência de defeitos.',
        isCorrect: false,
        justification: 'Incorreta. A falácia da ausência de defeitos refere-se a construir um sistema sem bugs mas que não atende às necessidades de negócio do usuário.',
      },
      {
        label: 'B',
        content: 'Os testes se desgastam (Paradoxo do Pesticida).',
        isCorrect: true,
        justification: 'Correta. Repetir os mesmos testes indefinidamente sem criar novos cenários reduz a eficácia na descoberta de novos defeitos.',
      },
      {
        label: 'C',
        content: 'Os defeitos se agrupam (Defect Clustering).',
        isCorrect: false,
        justification: 'Incorreta. O agrupamento de defeitos refere-se à concentração da maioria dos defeitos em poucos módulos.',
      },
      {
        label: 'D',
        content: 'O teste exaustivo é impossível.',
        isCorrect: false,
        justification: 'Incorreta. Este princípio explica a inviabilidade de testar todas as combinações possíveis de entrada.',
      },
    ],
  },
  {
    code: 'Q-CTFL-106',
    topicCode: '1.3',
    learningObjectiveCode: 'FL-1.3.1',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Uma startup desenvolveu um aplicativo financeiro que passou em 100% dos casos de teste derivados da especificação técnica e não apresentou falhas. Contudo, após o lançamento, os usuários abandonaram o aplicativo porque ele não suportava transferências via PIX, que era a principal necessidade do público-alvo. Qual princípio de teste foi negligenciado?',
    correctOptionLabel: 'C',
    explanation:
      'O Princípio 7 ("Falácia da ausência de defeitos") alerta que encontrar e corrigir muitos defeitos na verificação técnica não garante o sucesso se o sistema não atender às expectativas e necessidades reais dos usuários (validação).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 1.3.1 (Princípio 7: Falácia da ausência de defeitos)',
    options: [
      {
        label: 'A',
        content: 'O teste antecipado economiza tempo e dinheiro.',
        isCorrect: false,
        justification: 'Incorreta. O problema descrito é de validação de valor para o usuário, retratado pelo Princípio 7.',
      },
      {
        label: 'B',
        content: 'Os defeitos se agrupam.',
        isCorrect: false,
        justification: 'Incorreta. Não se trata de concentração de bugs em um componente.',
      },
      {
        label: 'C',
        content: 'Falácia da ausência de defeitos.',
        isCorrect: true,
        justification: 'Correta. Um sistema tecnicamente livre de bugs de verificação ainda fracassa se não resolver a necessidade real do usuário.',
      },
      {
        label: 'D',
        content: 'Os testes se desgastam.',
        isCorrect: false,
        justification: 'Incorreta. Refere-se à repetição dos mesmos testes ao longo do tempo.',
      },
    ],
  },
  {
    code: 'Q-CTFL-107',
    topicCode: '1.4',
    learningObjectiveCode: 'FL-1.4.1',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Em qual atividade do processo de teste a base de teste é analisada para identificar características testáveis e definir as condições de teste ("O que testar")?',
    correctOptionLabel: 'A',
    explanation:
      'Na atividade de Análise de Teste (seção 1.4.1), analisa-se a base de teste para identificar características testáveis e definir e priorizar condições de teste associadas (respondendo à pergunta "o que testar?"). O Projeto de Teste responde a "como testar?".',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 1.4.1 (Atividades e Tarefas de Teste)',
    options: [
      {
        label: 'A',
        content: 'Análise de Teste.',
        isCorrect: true,
        justification: 'Correta. A Análise de Teste examina a base de teste e define as condições de teste ("o que testar").',
      },
      {
        label: 'B',
        content: 'Implementação de Teste.',
        isCorrect: false,
        justification: 'Incorreta. A implementação cria e organiza os procedimentos, scripts e massas de dados para execução.',
      },
      {
        label: 'C',
        content: 'Conclusão de Teste.',
        isCorrect: false,
        justification: 'Incorreta. A conclusão ocorre em marcos de encerramento para consolidar lições aprendidas e arquivar o testware.',
      },
      {
        label: 'D',
        content: 'Execução de Teste.',
        isCorrect: false,
        justification: 'Incorreta. A execução roda os testes já implementados e compara resultados reais com esperados.',
      },
    ],
  },
  {
    code: 'Q-CTFL-108',
    topicCode: '1.4',
    learningObjectiveCode: 'FL-1.4.3',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Qual dos seguintes produtos de trabalho (testware) é tipicamente produzido como saída da atividade de Projeto de Teste (Test Design)?',
    correctOptionLabel: 'B',
    explanation:
      'Durante o Projeto de Teste, as condições de teste são elaboradas em casos de teste (de alto nível), cartas de teste (test charters) e são identificados os requisitos de dados de teste e de ambiente de teste.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 1.4.3 (Testware)',
    options: [
      {
        label: 'A',
        content: 'O Plano de Teste contendo orçamento, cronograma e critérios de entrada e saída.',
        isCorrect: false,
        justification: 'Incorreta. O Plano de Teste é testware de saída do Planejamento de Teste.',
      },
      {
        label: 'B',
        content: 'Casos de teste, cartas de teste (test charters) e especificação de requisitos do ambiente de teste.',
        isCorrect: true,
        justification: 'Correta. São produtos de trabalho gerados diretamente na atividade de Projeto de Teste.',
      },
      {
        label: 'C',
        content: 'Logs de execução de teste e relatórios de defeitos abertos.',
        isCorrect: false,
        justification: 'Incorreta. Logs e relatórios de defeitos são saídas da Execução de Teste.',
      },
      {
        label: 'D',
        content: 'O Relatório de Conclusão de Teste e solicitações de mudança para itens de backlog.',
        isCorrect: false,
        justification: 'Incorreta. São saídas da atividade de Conclusão de Teste.',
      },
    ],
  },
  {
    code: 'Q-CTFL-109',
    topicCode: '1.4',
    learningObjectiveCode: 'FL-1.4.4',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Qual é um benefício direto de manter a rastreabilidade bidirecional entre a base de teste e o testware ao longo do projeto?',
    correctOptionLabel: 'D',
    explanation:
      'A rastreabilidade entre requisitos/riscos (base de teste) e casos de teste/resultados/defeitos (testware) permite avaliar o impacto de mudanças, medir a cobertura de requisitos e comunicar os riscos residuais de forma precisa.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 1.4.4 (Rastreabilidade entre a Base de Teste e o Testware)',
    options: [
      {
        label: 'A',
        content: 'Eliminar completamente a necessidade de realizar testes de regressão após alterações no código.',
        isCorrect: false,
        justification: 'Incorreta. A rastreabilidade ajuda a selecionar quais testes de regressão rodar, mas não elimina a regressão.',
      },
      {
        label: 'B',
        content: 'Substituir a necessidade de ferramentas de controle de versão como o Git.',
        isCorrect: false,
        justification: 'Incorreta. Rastreabilidade complementa, mas não substitui o controle de versão.',
      },
      {
        label: 'C',
        content: 'Garantir que nenhum erro humano seja cometido pelos desenvolvedores durante a codificação.',
        isCorrect: false,
        justification: 'Incorreta. A rastreabilidade apoia análise de cobertura e impacto, não impede erros humanos de digitação ou lógica.',
      },
      {
        label: 'D',
        content: 'Facilitar a análise de impacto quando um requisito muda e permitir verificar a cobertura dos requisitos pelos casos de teste.',
        isCorrect: true,
        justification: 'Correta. São dois dos principais benefícios práticos da rastreabilidade descritos na seção 1.4.4.',
      },
    ],
  },
  {
    code: 'Q-CTFL-110',
    topicCode: '1.5',
    learningObjectiveCode: 'FL-1.5.3',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Qual é o principal benefício de contar com independência no teste de software, e qual é uma potencial desvantagem se a equipe de teste for isolada demais?',
    correctOptionLabel: 'A',
    explanation:
      'Testadores independentes identificam tipos diferentes de falhas e defeitos devido às suas diferentes experiências e vieses cognitivos em relação ao autor. Contudo, o isolamento excessivo pode causar problemas de comunicação, postura adversarial e desenvolvedores perdendo o senso de responsabilidade pela qualidade.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 1.5.3 (Independência do Teste)',
    options: [
      {
        label: 'A',
        content: 'Benefício: vieses cognitivos diferentes ajudam a detectar premissas falsas do autor; Desvantagem: isolamento, falhas de comunicação e perda do senso de responsabilidade pela qualidade pelos desenvolvedores.',
        isCorrect: true,
        justification: 'Correta. Resume fielmente os benefícios e riscos da independência do teste na seção 1.5.3.',
      },
      {
        label: 'B',
        content: 'Benefício: redução imediata do salário da equipe de desenvolvimento; Desvantagem: proibição de usar testes automatizados.',
        isCorrect: false,
        justification: 'Incorreta. Independência não tem relação com salários ou proibição de automação.',
      },
      {
        label: 'C',
        content: 'Benefício: o autor do código nunca precisa escrever testes unitários; Desvantagem: aumento da cobertura de ramificação.',
        isCorrect: false,
        justification: 'Incorreta. Mesmo com QA independente, desenvolvedores devem executar testes de componente.',
      },
      {
        label: 'D',
        content: 'Benefício: eliminação da fase de análise de teste; Desvantagem: excesso de colaboração na abordagem Whole Team.',
        isCorrect: false,
        justification: 'Incorreta. A análise de teste continua essencial em qualquer grau de independência.',
      },
    ],
  },

  // ==========================================
  // CAPÍTULO 2 — TESTE AO LONGO DO SDLC (8 publicadas)
  // ==========================================
  {
    code: 'Q-CTFL-201',
    topicCode: '2.1',
    learningObjectiveCode: 'FL-2.1.2',
    cognitiveLevel: 'K1',
    difficulty: 'EASY',
    statement:
      'Qual das seguintes afirmações representa uma boa prática de teste aplicável a TODOS os modelos de Ciclo de Vida de Desenvolvimento de Software (SDLC)?',
    correctOptionLabel: 'C',
    explanation:
      'Independentemente do SDLC (sequencial, iterativo ou incremental), para cada atividade de desenvolvimento há uma atividade de teste correspondente, e os testadores devem participar da revisão dos produtos de trabalho assim que rascunhos estiverem disponíveis.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 2.1.2 (Ciclo de Vida e Boas Práticas de Teste)',
    options: [
      {
        label: 'A',
        content: 'A análise e o projeto de teste só devem começar após todo o código do sistema estar 100% concluído e congelado.',
        isCorrect: false,
        justification: 'Incorreta. Começar apenas no fim atrasa a detecção de defeitos e viola o princípio do teste antecipado.',
      },
      {
        label: 'B',
        content: 'Todos os níveis de teste devem possuir exatamente os mesmos objetivos para garantir redundância.',
        isCorrect: false,
        justification: 'Incorreta. Cada nível de teste possui objetivos específicos e distintos para evitar redundância desnecessária.',
      },
      {
        label: 'C',
        content: 'Para cada atividade de desenvolvimento existe uma atividade de teste correspondente, e a análise de teste de um nível começa durante a atividade de desenvolvimento relacionada.',
        isCorrect: true,
        justification: 'Correta. São duas das quatro boas práticas universais listadas na seção 2.1.2.',
      },
      {
        label: 'D',
        content: 'Testes estáticos só são aplicáveis em modelos sequenciais como Cascata e Modelo V.',
        isCorrect: false,
        justification: 'Incorreta. Testes estáticos e revisões são essenciais tanto em modelos sequenciais quanto em modelos Ágeis.',
      },
    ],
  },
  {
    code: 'Q-CTFL-202',
    topicCode: '2.1',
    learningObjectiveCode: 'FL-2.1.3',
    cognitiveLevel: 'K1',
    difficulty: 'EASY',
    statement:
      'Qual abordagem de desenvolvimento orientada a teste expressa o comportamento desejado de uma aplicação usando casos de teste escritos em linguagem natural estruturada (Dado / Quando / Então) compreensível por todas as partes interessadas?',
    correctOptionLabel: 'B',
    explanation:
      'O BDD (Behavior-Driven Development / Desenvolvimento Orientado ao Comportamento) descreve o comportamento esperado em formato Dado/Quando/Então (Given/When/Then), facilitando a colaboração e a geração de testes automatizados.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 2.1.3 (Teste como Direcionador para o Desenvolvimento de Software)',
    options: [
      {
        label: 'A',
        content: 'TDD (Test-Driven Development) restrito exclusivamente a classes de banco de dados.',
        isCorrect: false,
        justification: 'Incorreta. O TDD foca principalmente em testes de componente/código no ciclo Red-Green-Refactor.',
      },
      {
        label: 'B',
        content: 'BDD (Behavior-Driven Development).',
        isCorrect: true,
        justification: 'Correta. O BDD utiliza cenários Dado/Quando/Então para alinhar negócio, desenvolvimento e QA.',
      },
      {
        label: 'C',
        content: 'Teste de Manutenção Corretiva.',
        isCorrect: false,
        justification: 'Incorreta. O teste de manutenção ocorre após a entrada do sistema em produção.',
      },
      {
        label: 'D',
        content: 'Inspeção Formal de Código.',
        isCorrect: false,
        justification: 'Incorreta. Inspeção é um tipo de revisão estática, não uma abordagem TDD/ATDD/BDD.',
      },
    ],
  },
  {
    code: 'Q-CTFL-203',
    topicCode: '2.1',
    learningObjectiveCode: 'FL-2.1.4',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Qual das seguintes opções descreve corretamente um benefício do DevOps para o teste de software?',
    correctOptionLabel: 'A',
    explanation:
      'O DevOps fornece feedback rápido sobre a qualidade do código, promove processos automatizados de CI/CD que facilitam o estabelecimento de ambientes de teste estáveis e reduz a necessidade de testes manuais repetitivos.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 2.1.4 (DevOps e Teste)',
    options: [
      {
        label: 'A',
        content: 'Feedback rápido sobre a qualidade do código e processos automatizados de CI/CD que promovem ambientes de teste estáveis e testes de regressão automatizados.',
        isCorrect: true,
        justification: 'Correta. Está diretamente alinhada aos impactos positivos do DevOps listados na seção 2.1.4.',
      },
      {
        label: 'B',
        content: 'Eliminação total da necessidade de testes não funcionais de desempenho e segurança.',
        isCorrect: false,
        justification: 'Incorreta. Pelo contrário, o DevOps aumenta a visibilidade de características não funcionais.',
      },
      {
        label: 'C',
        content: 'Zero custo e zero esforço para configurar servidores de entrega contínua e manter suítes automatizadas.',
        isCorrect: false,
        justification: 'Incorreta. O Syllabus aponta explicitamente que o DevOps exige esforço e investimento para configurar e manter a automação.',
      },
      {
        label: 'D',
        content: 'Substituição completa dos testes exploratórios manuais por pipelines de compilação.',
        isCorrect: false,
        justification: 'Incorreta. Testes manuais (especialmente exploratórios e de usabilidade) continuam necessários no DevOps.',
      },
    ],
  },
  {
    code: 'Q-CTFL-204',
    topicCode: '2.1',
    learningObjectiveCode: 'FL-2.1.5',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Qual das seguintes práticas exemplifica a aplicação da abordagem Shift-Left em um projeto de software?',
    correctOptionLabel: 'D',
    explanation:
      'Revisar especificações do ponto de vista de teste antes do código ser escrito e realizar análise estática no código-fonte antes dos testes dinâmicos são exemplos clássicos de Shift-Left (mover o teste para o início do ciclo).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 2.1.5 (Abordagem Shift-Left)',
    options: [
      {
        label: 'A',
        content: 'Adiar todos os testes não funcionais para a última semana antes do lançamento em produção.',
        isCorrect: false,
        justification: 'Incorreta. O Shift-Left recomenda iniciar testes não funcionais o mais cedo possível (inclusive em nível de componente quando viável).',
      },
      {
        label: 'B',
        content: 'Aguardar o cliente reportar incidentes em produção para iniciar a escrita dos primeiros casos de teste.',
        isCorrect: false,
        justification: 'Incorreta. Isso é reação tardia, o oposto do Shift-Left.',
      },
      {
        label: 'C',
        content: 'Desativar as ferramentas de análise estática no pipeline de Integração Contínua para acelerar o merge.',
        isCorrect: false,
        justification: 'Incorreta. A análise estática antes do teste dinâmico é um pilar do Shift-Left.',
      },
      {
        label: 'D',
        content: 'Revisar especificações de requisitos em busca de ambiguidades e escrever casos de teste antes da implementação do código.',
        isCorrect: true,
        justification: 'Correta. São as duas primeiras práticas de Shift-Left destacadas na seção 2.1.5.',
      },
    ],
  },
  {
    code: 'Q-CTFL-205',
    topicCode: '2.2',
    learningObjectiveCode: 'FL-2.2.1',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Uma fintech desenvolveu seu sistema interno de antifraude e agora precisa testar a comunicação via HTTPS/Webhooks entre esse sistema, a API externa do Banco Central e o gateway externo da bandeira de cartões. Qual nível de teste é o mais apropriado para validar essas interfaces entre sistemas independentes?',
    correctOptionLabel: 'C',
    explanation:
      'O Teste de Integração de Sistemas foca nas interfaces e interações entre sistemas diferentes, pacotes de terceiros e microsserviços externos.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 2.2.1 (Níveis de Teste)',
    options: [
      {
        label: 'A',
        content: 'Teste de Componente.',
        isCorrect: false,
        justification: 'Incorreta. O teste de componente avalia unidades isoladas dentro de um mesmo sistema.',
      },
      {
        label: 'B',
        content: 'Teste de Integração de Componentes.',
        isCorrect: false,
        justification: 'Incorreta. Foca nas interfaces entre componentes internos do próprio sistema.',
      },
      {
        label: 'C',
        content: 'Teste de Integração de Sistemas.',
        isCorrect: true,
        justification: 'Correta. Valida as interfaces e protocolos entre o sistema sob teste e sistemas/serviços externos.',
      },
      {
        label: 'D',
        content: 'Teste Alfa.',
        isCorrect: false,
        justification: 'Incorreta. Teste Alfa é uma forma de Teste de Aceite executada nas instalações da organização desenvolvedora.',
      },
    ],
  },
  {
    code: 'Q-CTFL-206',
    topicCode: '2.2',
    learningObjectiveCode: 'FL-2.2.2',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Um engenheiro de QA executa testes para verificar se a página de busca de cursos responde em menos de 400ms com 500 usuários simultâneos e se é totalmente navegável por leitores de tela. Esses testes pertencem principalmente a qual tipo de teste?',
    correctOptionLabel: 'B',
    explanation:
      'Desempenho (tempo de resposta sob carga) e acessibilidade/usabilidade avaliam "quão bem" o sistema se comporta, sendo características do Teste Não Funcional (seção 2.2.2).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 2.2.2 (Tipos de Teste)',
    options: [
      {
        label: 'A',
        content: 'Teste Caixa-Branca de Instrução.',
        isCorrect: false,
        justification: 'Incorreta. Não está avaliando cobertura de linhas de código-fonte.',
      },
      {
        label: 'B',
        content: 'Teste Não Funcional.',
        isCorrect: true,
        justification: 'Correta. Eficiência de desempenho e usabilidade/acessibilidade são características de qualidade não funcionais.',
      },
      {
        label: 'C',
        content: 'Teste de Manutenção por Aposentadoria.',
        isCorrect: false,
        justification: 'Incorreta. Não se trata de desativação de sistema.',
      },
      {
        label: 'D',
        content: 'Depuração Estrutural.',
        isCorrect: false,
        justification: 'Incorreta. Depuração é localização e correção de defeitos no código.',
      },
    ],
  },
  {
    code: 'Q-CTFL-207',
    topicCode: '2.2',
    learningObjectiveCode: 'FL-2.2.3',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Após um desenvolvedor corrigir o defeito BUG-402 (que impedia a exportação de relatórios em PDF), o QA executa: (I) o exato caso de teste de exportação de PDF que havia falhado anteriormente; e (II) a suíte de testes de exportação em CSV e Excel para garantir que essas funções continuam funcionando. Como são classificados os testes (I) e (II), respectivamente?',
    correctOptionLabel: 'A',
    explanation:
      '(I) Reexecutar o teste que falhou para verificar se o defeito específico foi corrigido é Teste de Confirmação. (II) Testar áreas inalteradas para garantir que a correção não introduziu efeitos colaterais é Teste de Regressão.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 2.2.3 (Teste de Confirmação e Teste de Regressão)',
    options: [
      {
        label: 'A',
        content: '(I) Teste de Confirmação; (II) Teste de Regressão.',
        isCorrect: true,
        justification: 'Correta. Confirmação valida a correção do defeito; Regressão verifica a ausência de efeitos adversos no restante do sistema.',
      },
      {
        label: 'B',
        content: '(I) Teste de Regressão; (II) Teste de Confirmação.',
        isCorrect: false,
        justification: 'Incorreta. Os conceitos estão invertidos.',
      },
      {
        label: 'C',
        content: '(I) Teste Estático; (II) Teste Exploratório.',
        isCorrect: false,
        justification: 'Incorreta. Ambos são testes dinâmicos motivados por uma alteração corretiva.',
      },
      {
        label: 'D',
        content: '(I) Teste Alfa; (II) Teste Beta.',
        isCorrect: false,
        justification: 'Incorreta. Alfa e Beta são variantes do Teste de Aceite.',
      },
    ],
  },
  {
    code: 'Q-CTFL-208',
    topicCode: '2.3',
    learningObjectiveCode: 'FL-2.3.1',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Uma seguradora decidiu desativar definitivamente seu sistema legado de cotação automotiva, substituindo-o por uma nova plataforma web. Por exigência regulatória da SUSEP, todas as apólices emitidas nos últimos 10 anos devem permanecer arquivadas e recuperáveis para auditoria. Qual gatilho motiva os testes de retenção e restauração desses dados?',
    correctOptionLabel: 'D',
    explanation:
      'Os três gatilhos do teste de manutenção são Modificação, Migração e Aposentadoria (Retirement). Quando uma aplicação chega ao fim da vida útil e é desativada, o gatilho é a Aposentadoria, exigindo testar o arquivamento e a restauração de dados.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 2.3 (Teste de Manutenção)',
    options: [
      {
        label: 'A',
        content: 'Manutenção Corretiva de Emergência (Hotfix).',
        isCorrect: false,
        justification: 'Incorreta. Não se trata de corrigir um bug no sistema legado para mantê-lo operando.',
      },
      {
        label: 'B',
        content: 'Desenvolvimento Orientado a Testes (TDD).',
        isCorrect: false,
        justification: 'Incorreta. TDD é uma prática de desenvolvimento de código novo, não um gatilho de manutenção.',
      },
      {
        label: 'C',
        content: 'Refatoração de Componente Interno.',
        isCorrect: false,
        justification: 'Incorreta. O sistema legado está sendo desligado definitivamente.',
      },
      {
        label: 'D',
        content: 'Aposentadoria (Desativação) do sistema.',
        isCorrect: true,
        justification: 'Correta. A aposentadoria de um sistema exige testes de arquivamento e recuperação de dados por longos períodos.',
      },
    ],
  },

  // ==========================================
  // CAPÍTULO 3 — TESTE ESTÁTICO (6 publicadas)
  // ==========================================
  {
    code: 'Q-CTFL-301',
    topicCode: '3.1',
    learningObjectiveCode: 'FL-3.1.1',
    cognitiveLevel: 'K1',
    difficulty: 'EASY',
    statement:
      'Qual dos seguintes itens NÃO é adequado para ser examinado por meio de revisão humana em um teste estático?',
    correctOptionLabel: 'C',
    explanation:
      'Qualquer produto de trabalho que possa ser lido e compreendido pode ser objeto de revisão (histórias de usuário, código-fonte, planos de teste, contratos). Já um arquivo executável binário compilado de terceiros sem código-fonte não é legível para revisão humana.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 3.1.1 (Produtos de Trabalho Examináveis pelo Teste Estático)',
    options: [
      {
        label: 'A',
        content: 'Histórias de usuário e critérios de aceite escritos pelo Product Owner.',
        isCorrect: false,
        justification: 'Incorreta. Histórias e critérios de aceite são amplamente revisados no teste estático.',
      },
      {
        label: 'B',
        content: 'Planos de teste, casos de teste e cartas de teste exploratório.',
        isCorrect: false,
        justification: 'Incorreta. Artefatos de testware podem e devem passar por revisão estática.',
      },
      {
        label: 'C',
        content: 'Código executável binário compilado e ofuscado de terceiros sem acesso ao código-fonte.',
        isCorrect: true,
        justification: 'Correta. Produtos de trabalho ilegíveis por humanos não são apropriados para revisão estática manual.',
      },
      {
        label: 'D',
        content: 'Scripts de migração SQL e arquivos de configuração de pipeline CI/CD.',
        isCorrect: false,
        justification: 'Incorreta. São textos estruturados perfeitamente legíveis e revisáveis.',
      },
    ],
  },
  {
    code: 'Q-CTFL-302',
    topicCode: '3.1',
    learningObjectiveCode: 'FL-3.1.3',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Ao comparar o Teste Estático com o Teste Dinâmico, qual das afirmações abaixo é VERDADEIRA?',
    correctOptionLabel: 'B',
    explanation:
      'O teste estático encontra defeitos diretamente nos produtos de trabalho sem executar o software, enquanto o teste dinâmico executa o software e provoca falhas a partir das quais os defeitos subjacentes são posteriormente diagnosticados.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 3.1.3 (Diferenças entre Teste Estático e Teste Dinâmico)',
    options: [
      {
        label: 'A',
        content: 'Tanto o teste estático quanto o teste dinâmico exigem que o código-fonte esteja compilado e em execução no servidor.',
        isCorrect: false,
        justification: 'Incorreta. O teste estático não executa o software e pode ocorrer antes mesmo de existir código.',
      },
      {
        label: 'B',
        content: 'O teste estático identifica defeitos diretamente nos artefatos, enquanto o teste dinâmico provoca falhas visíveis durante a execução.',
        isCorrect: true,
        justification: 'Correta. É a distinção fundamental apresentada na seção 3.1.3.',
      },
      {
        label: 'C',
        content: 'O teste dinâmico é mais eficaz que o teste estático para encontrar desvios de padrões de nomenclatura de variáveis e código morto inalcançável.',
        isCorrect: false,
        justification: 'Incorreta. Desvios de padrão de codificação e código inalcançável são detectados pelo teste estático (análise estática / code review).',
      },
      {
        label: 'D',
        content: 'O teste estático substitui integralmente a necessidade de realizar testes dinâmicos em sistemas críticos.',
        isCorrect: false,
        justification: 'Incorreta. Teste estático e teste dinâmico são complementares.',
      },
    ],
  },
  {
    code: 'Q-CTFL-303',
    topicCode: '3.2',
    learningObjectiveCode: 'FL-3.2.2',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Durante uma revisão formal de um documento de arquitetura, cada revisor utiliza um checklist para inspecionar o documento por conta própria e anota possíveis anomalias antes da reunião de revisão. Em qual atividade do processo genérico de revisão isso ocorre?',
    correctOptionLabel: 'C',
    explanation:
      'As 5 atividades do processo de revisão são: (1) Planejamento, (2) Início da Revisão, (3) Revisão Individual (Preparação Individual), (4) Comunicação e Análise e (5) Correção e Relatório. A avaliação individual e registro inicial de anomalias ocorrem na Revisão Individual.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 3.2.2 (Atividades do Processo de Revisão)',
    options: [
      {
        label: 'A',
        content: 'Planejamento.',
        isCorrect: false,
        justification: 'Incorreta. No planejamento definem-se escopo, critérios de entrada/saída e participantes.',
      },
      {
        label: 'B',
        content: 'Início da Revisão.',
        isCorrect: false,
        justification: 'Incorreta. No início distribuem-se os artefatos e explicam-se os papéis.',
      },
      {
        label: 'C',
        content: 'Revisão Individual.',
        isCorrect: true,
        justification: 'Correta. Na revisão individual cada participante examina o artefato e anota anomalias e dúvidas.',
      },
      {
        label: 'D',
        content: 'Correção e Relatório.',
        isCorrect: false,
        justification: 'Incorreta. Ocorre após a comunicação e análise para corrigir defeitos confirmados.',
      },
    ],
  },
  {
    code: 'Q-CTFL-304',
    topicCode: '3.2',
    learningObjectiveCode: 'FL-3.2.3',
    cognitiveLevel: 'K1',
    difficulty: 'EASY',
    statement:
      'Em uma reunião formal de revisão, qual papel é responsável por garantir a execução eficaz da reunião, incluindo a gestão do tempo, a mediação de pontos de vista divergentes e a manutenção de um ambiente seguro onde todos possam se expressar?',
    correctOptionLabel: 'B',
    explanation:
      'O Moderador (ou Facilitador) é o responsável por conduzir a reunião de revisão com eficácia, mediar discussões, controlar o tempo e manter um ambiente seguro e objetivo.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 3.2.3 (Papéis e Responsabilidades em Revisões)',
    options: [
      {
        label: 'A',
        content: 'Relator (Scribe / Escriba).',
        isCorrect: false,
        justification: 'Incorreta. O relator registra anomalias, decisões e pontos em aberto durante a reunião.',
      },
      {
        label: 'B',
        content: 'Moderador (Facilitador).',
        isCorrect: true,
        justification: 'Correta. O moderador garante o bom andamento da reunião, mediação e gestão de tempo.',
      },
      {
        label: 'C',
        content: 'Gerente (Manager).',
        isCorrect: false,
        justification: 'Incorreta. O gerente decide o que será revisado e aloca recursos como pessoal e tempo.',
      },
      {
        label: 'D',
        content: 'Autor.',
        isCorrect: false,
        justification: 'Incorreta. O autor cria e corrige o produto de trabalho sob revisão.',
      },
    ],
  },
  {
    code: 'Q-CTFL-305',
    topicCode: '3.2',
    learningObjectiveCode: 'FL-3.2.4',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Qual tipo de revisão segue o processo mais formal, exige preparação individual prévia obrigatória, coleta métricas para melhoria do processo e proíbe que o autor do produto de trabalho atue como líder da revisão, relator ou moderador?',
    correctOptionLabel: 'D',
    explanation:
      'A Inspeção é o tipo mais formal de revisão. Nela, o autor não pode atuar como líder da revisão, relator nem moderador, há preparação individual obrigatória e coleta formal de métricas.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 3.2.4 (Tipos de Revisão)',
    options: [
      {
        label: 'A',
        content: 'Revisão Informal.',
        isCorrect: false,
        justification: 'Incorreta. A revisão informal não segue processo documentado nem exige métricas.',
      },
      {
        label: 'B',
        content: 'Walkthrough (Acompanhamento).',
        isCorrect: false,
        justification: 'Incorreta. No Walkthrough, o próprio autor lidera a sessão de revisão.',
      },
      {
        label: 'C',
        content: 'Revisão por Pares Ad-hoc.',
        isCorrect: false,
        justification: 'Incorreta. É uma forma de revisão informal.',
      },
      {
        label: 'D',
        content: 'Inspeção.',
        isCorrect: true,
        justification: 'Correta. A Inspeção é a revisão mais formal e possui todas as restrições e características citadas.',
      },
    ],
  },
  {
    code: 'Q-CTFL-306',
    topicCode: '3.2',
    learningObjectiveCode: 'FL-3.2.5',
    cognitiveLevel: 'K1',
    difficulty: 'EASY',
    statement:
      'Qual das seguintes práticas contribui diretamente para o sucesso de uma revisão técnica ou inspeção?',
    correctOptionLabel: 'A',
    explanation:
      'Dividir produtos de trabalho grandes em partes pequenas (para que os revisores não percam a concentração) e realizar a revisão em um ambiente de confiança onde os defeitos encontrados são tratados de forma objetiva (sem avaliar a pessoa do autor) são fatores críticos de sucesso (seção 3.2.5).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 3.2.5 (Fatores de Sucesso para Revisões)',
    options: [
      {
        label: 'A',
        content: 'Dividir documentos extensos em partes menores e manter uma atmosfera de confiança onde o produto é avaliado, e não o autor.',
        isCorrect: true,
        justification: 'Correta. Consta explicitamente entre os fatores de sucesso na seção 3.2.5.',
      },
      {
        label: 'B',
        content: 'Agendar reuniões contínuas de 6 horas sem intervalo para revisar centenas de páginas de uma única vez.',
        isCorrect: false,
        justification: 'Incorreta. Reuniões longas demais degradam a atenção e a eficácia na detecção de anomalias.',
      },
      {
        label: 'C',
        content: 'Utilizar o número de defeitos encontrados na revisão como critério para reduzir o bônus anual do autor do documento.',
        isCorrect: false,
        justification: 'Incorreta. Avaliar ou punir os participantes destrói a confiança e inviabiliza revisões eficazes.',
      },
      {
        label: 'D',
        content: 'Omitir os objetivos e critérios de saída da revisão para dar total liberdade subjetiva aos participantes.',
        isCorrect: false,
        justification: 'Incorreta. Definir objetivos claros e critérios de saída mensuráveis é requisito para uma boa revisão.',
      },
    ],
  },
];
