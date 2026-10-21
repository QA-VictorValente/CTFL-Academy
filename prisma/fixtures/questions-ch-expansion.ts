import {
  CognitiveLevel,
  DifficultyLevel,
  QuestionEditorialStatus,
} from '@prisma/client';
import type { SeedQuestionItem } from './questions-ch1-3';

export const QUESTIONS_CH_EXPANSION: SeedQuestionItem[] = [
  // =========================================================================
  // CAPÍTULO 1 — FUNDAMENTOS DE TESTE (5 novas questões: Q-CTFL-111 a 115)
  // =========================================================================
  {
    code: 'Q-CTFL-111',
    topicCode: '1.2',
    learningObjectiveCode: 'FL-1.2.1',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Um desenvolvedor cometeu um engano ao interpretar a fórmula de desconto por pontualidade no código tributário de um ERP. Durante os testes de aceitação em homologação, o cálculo resultou em uma dedução indevida de 15% na fatura emitida. Considerando a terminologia padrão do Syllabus ISTQB CTFL v4.0.1, assinale a correlação correta entre engano, defeito e falha.',
    correctOptionLabel: 'C',
    explanation:
      'Segundo o Syllabus CTFL v4.0.1 (seção 1.2.1), uma pessoa comete um engano (erro humano) que introduz um defeito (falha interna, bug) no código. Quando esse código com defeito é executado e gera um resultado incorreto observado (dedução indevida na fatura), ocorre uma falha.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 1.2.1 (Por que o Teste é Necessário? Erros, Defeitos e Falhas)',
    options: [
      {
        label: 'A',
        content: 'O engano foi a dedução indevida; o defeito foi a fórmula mal escrita; a falha foi o estresse do desenvolvedor.',
        isCorrect: false,
        justification: 'A dedução indevida é a falha perceptível, e o engano é o ato humano inicial, não o resultado da fatura.',
      },
      {
        label: 'B',
        content: 'O defeito foi a interpretação equivocada; a falha foi a linha de código errada; o engano foi a emissão da fatura.',
        isCorrect: false,
        justification: 'A interpretação equivocada é o erro/engano humano; a linha no código é o defeito; e a emissão com valor errado é a falha.',
      },
      {
        label: 'C',
        content: 'O engano foi a interpretação incorreta da fórmula; o defeito foi a instrução inadequada inserida no código; a falha foi a dedução indevida de 15% calculada na execução.',
        isCorrect: true,
        justification: 'Engano (humano) -> Defeito (no artefato/código) -> Falha (desvio dinâmico durante a execução observada).',
      },
      {
        label: 'D',
        content: 'A falha foi o engano do desenvolvedor; o defeito foi a execução do teste de aceitação; o erro foi a aceitação do cliente.',
        isCorrect: false,
        justification: 'Definições completamente invertidas em relação ao padrão internacional ISTQB.',
      },
    ],
  },
  {
    code: 'Q-CTFL-112',
    topicCode: '1.3',
    learningObjectiveCode: 'FL-1.3.1',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Um gerente de produto exige que a equipe de QA execute 100% de todas as combinações possíveis de dados em um formulário com 12 campos alfanuméricos antes de liberar a versão. Qual princípio de teste do Syllabus ISTQB CTFL v4.0.1 explica por que essa exigência é inviável e como a equipe deve agir?',
    correctOptionLabel: 'B',
    explanation:
      'O Princípio 2 (O teste exaustivo é impossível) estabelece que testar tudo (todas as combinações de entradas e pré-condições) não é viável, exceto em casos triviais. Em vez do teste exaustivo, a equipe deve utilizar análise de risco, técnicas de teste e priorização para concentrar os esforços.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 1.3 (Princípios de Teste - Princípio 2: O teste exaustivo é impossível)',
    options: [
      {
        label: 'A',
        content: 'Princípio 1 (O teste mostra a presença de defeitos), devendo a equipe focar apenas em testes de caixa-branca automatizados.',
        isCorrect: false,
        justification: 'O Princípio 1 trata da demonstração da presença de defeitos, e não da impossibilidade combinatória.',
      },
      {
        label: 'B',
        content: 'Princípio 2 (O teste exaustivo é impossível), devendo a equipe utilizar análise de riscos, técnicas de teste e priorização para guiar os esforços.',
        isCorrect: true,
        justification: 'Princípio 2 define a inviabilidade de testar todas as combinações e prescreve o gerenciamento de riscos e priorização.',
      },
      {
        label: 'C',
        content: 'Princípio 4 (Defeitos se agrupam), devendo a equipe testar apenas o primeiro campo do formulário.',
        isCorrect: false,
        justification: 'O Princípio 4 aborda a densidade de defeitos (clustering), mas não justifica a impossibilidade de testar todas as entradas.',
      },
      {
        label: 'D',
        content: 'Princípio 7 (A ilusão da ausência de erros), significando que o formulário nunca funcionará corretamente.',
        isCorrect: false,
        justification: 'O Princípio 7 alerta que corrigir defeitos não garante o sucesso do produto se as necessidades do usuário não forem atendidas.',
      },
    ],
  },
  {
    code: 'Q-CTFL-113',
    topicCode: '1.3',
    learningObjectiveCode: 'FL-1.3.1',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'A abordagem de testes adotada para um software de controle de marca-passo cardíaco exige rigor formal, alta rastreabilidade e cobertura estrita de código. Já para um aplicativo móvel de jogo casual, o foco principal é usabilidade e testes exploratórios rápidos. Qual princípio de teste do Syllabus ISTQB fundamenta essa diferença de abordagem?',
    correctOptionLabel: 'D',
    explanation:
      'O Princípio 6 (O teste depende do contexto) determina que nenhum teste é realizado da mesma forma em contextos distintos. O teste de um sistema crítico para a segurança da vida humana difere radicalmente do teste de um aplicativo comercial ou jogo de entretenimento.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 1.3 (Princípios de Teste - Princípio 6: O teste depende do contexto)',
    options: [
      {
        label: 'A',
        content: 'Princípio 3 (O teste inicial economiza tempo e dinheiro).',
        isCorrect: false,
        justification: 'Trata do início precoce do teste estático e dinâmico, mas não da variação metodológica de acordo com o contexto operacional.',
      },
      {
        label: 'B',
        content: 'Princípio 5 (O paradoxo do pesticida / os testes se desgastam).',
        isCorrect: false,
        justification: 'Trata da necessidade de atualizar os casos de teste para encontrar novos defeitos.',
      },
      {
        label: 'C',
        content: 'Princípio 1 (O teste mostra a presença de defeitos, não a sua ausência).',
        isCorrect: false,
        justification: 'Enfatiza que os testes reduzem a incerteza mas não provam ausência de bugs.',
      },
      {
        label: 'D',
        content: 'Princípio 6 (O teste depende do contexto).',
        isCorrect: true,
        justification: 'O teste depende do contexto de negócios, riscos, requisitos regulatórios e criticidade da aplicação.',
      },
    ],
  },
  {
    code: 'Q-CTFL-114',
    topicCode: '1.4',
    learningObjectiveCode: 'FL-1.4.1',
    cognitiveLevel: 'K2',
    difficulty: 'HARD',
    statement:
      'Durante o processo fundamental de teste, um profissional está identificando "o que testar", derivando condições de teste a partir das histórias de usuário e avaliando a testabilidade da base de teste. Em qual atividade de teste esse profissional está engajado, de acordo com o Syllabus CTFL v4.0.1?',
    correctOptionLabel: 'A',
    explanation:
      'Segundo o Syllabus CTFL v4.0.1 (seção 1.4.1), a Análise de Teste é a atividade onde a base de teste é analisada para identificar recursos testáveis e definir e priorizar condições de teste correspondentes ("o que testar"). O Projeto de Teste, por sua vez, define "como testar" (casos de teste e dados de teste).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 1.4.1 (Atividades de Teste e Tarefas)',
    options: [
      {
        label: 'A',
        content: 'Análise de Teste.',
        isCorrect: true,
        justification: 'A análise de teste responde a "o que testar", definindo condições de teste e avaliando a testabilidade da base de teste.',
      },
      {
        label: 'B',
        content: 'Projeto de Teste (Design).',
        isCorrect: false,
        justification: 'O projeto de teste elabora casos de teste detalhados, dados de teste e procedimentos ("como testar").',
      },
      {
        label: 'C',
        content: 'Implementação de Teste.',
        isCorrect: false,
        justification: 'A implementação organiza os casos de teste em suítes, cria scripts de automação e prepara o ambiente.',
      },
      {
        label: 'D',
        content: 'Execução de Teste.',
        isCorrect: false,
        justification: 'A execução roda os testes (manualmente ou via automação) e compara os resultados reais com os esperados.',
      },
    ],
  },
  {
    code: 'Q-CTFL-115',
    topicCode: '1.5',
    learningObjectiveCode: 'FL-1.5.1',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Em equipes ágeis que adotam a abordagem de "Equipe Inteira" (Whole Team Approach), como a responsabilidade pela qualidade do software é distribuída de acordo com o Syllabus ISTQB v4.0.1?',
    correctOptionLabel: 'C',
    explanation:
      'Na abordagem Whole Team (seção 1.5.1), qualquer membro da equipe pode desempenhar qualquer tarefa e todos compartilham a responsabilidade pela qualidade. Os testadores trazem sua mentalidade especializada de teste e colaboram com desenvolvedores e representantes de negócio desde o início.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 1.5.1 (Habilidades e Abordagem de Equipe Inteira)',
    options: [
      {
        label: 'A',
        content: 'Exclusivamente com o testador de QA, que deve ser o único a aprovar ou reprovar entregas.',
        isCorrect: false,
        justification: 'Isola a responsabilidade e contradiz diretamente a abordagem colaborativa de equipe inteira.',
      },
      {
        label: 'B',
        content: 'Exclusivamente com o Product Owner, que define e escreve todos os testes automatizados.',
        isCorrect: false,
        justification: 'O PO é responsável pela priorização de negócio, não pela autoria exclusiva de testes de software.',
      },
      {
        label: 'C',
        content: 'Compartilhada por todos os membros da equipe (desenvolvedores, testadores, POs e designers), onde cada indivíduo contribui ativamente para a qualidade.',
        isCorrect: true,
        justification: 'A abordagem Whole Team estabelece que a qualidade é uma responsabilidade coletiva e contínua de todo o time.',
      },
      {
        label: 'D',
        content: 'Com a equipe externa de auditoria de conformidade após o encerramento do desenvolvimento.',
        isCorrect: false,
        justification: 'Auditorias externas tardias representam modelos legados e não o conceito moderno de Whole Team em desenvolvimento contínuo.',
      },
    ],
  },

  // =========================================================================
  // CAPÍTULO 2 — TESTE AO LONGO DO SDLC (4 novas questões: Q-CTFL-209 a 212)
  // =========================================================================
  {
    code: 'Q-CTFL-209',
    topicCode: '2.1',
    learningObjectiveCode: 'FL-2.1.2',
    cognitiveLevel: 'K1',
    difficulty: 'EASY',
    statement:
      'Qual das seguintes opções descreve a sequência típica do ciclo "Red-Green-Refactor" utilizado no Desenvolvimento Orientado a Testes (TDD)?',
    correctOptionLabel: 'B',
    explanation:
      'O TDD (seção 2.1.2) segue o ciclo: 1) Escrever um teste que falha inicialmente (Red); 2) Escrever o código mínimo necessário para fazer o teste passar (Green); 3) Refatorar o código para melhorar seu design e manutenibilidade, mantendo o teste passando (Refactor).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 2.1.2 (Abordagens de Teste Primeiro: TDD, ATDD, BDD)',
    options: [
      {
        label: 'A',
        content: 'Refatorar o código existente, compilar até passar (Green) e depois gerar os relatórios em caso de erro (Red).',
        isCorrect: false,
        justification: 'A refatoração só ocorre após a existência de um teste verde estabilizado.',
      },
      {
        label: 'B',
        content: 'Escrever um teste automatizado que inicialmente falha (Red), escrever o código mínimo para que ele passe (Green) e em seguida refatorar o código mantendo o teste passando.',
        isCorrect: true,
        justification: 'Esta é a definição canônica e exata do ciclo Red-Green-Refactor em TDD.',
      },
      {
        label: 'C',
        content: 'Executar testes estáticos na documentação (Red), executar os testes no ambiente de homologação (Green) e implantar em produção.',
        isCorrect: false,
        justification: 'Mistura níveis de ambiente com o ciclo de microdesign do TDD.',
      },
      {
        label: 'D',
        content: 'Criar os testes manuais na planilha (Red), esperar o desenvolvedor entregar a funcionalidade (Green) e automatizar no final da sprint.',
        isCorrect: false,
        justification: 'Descreve teste tardio tradicional, exatamente o oposto de abordagens de teste primeiro (Test-First).',
      },
    ],
  },
  {
    code: 'Q-CTFL-210',
    topicCode: '2.2',
    learningObjectiveCode: 'FL-2.2.1',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Um engenheiro de testes precisa validar a comunicação entre o microsserviço de Pagamento e o gateway financeiro externo via chamadas REST e mensagens JSON, verificando contratos de API e tratamento de timeouts de rede. De acordo com o Syllabus CTFL v4.0.1, em qual nível de teste essa atividade se enquadra principalmente?',
    correctOptionLabel: 'C',
    explanation:
      'O Teste de Integração (seção 2.2.1) foca nas interações e interfaces entre componentes ou sistemas. Especificamente, o Teste de Integração de Sistemas valida interfaces entre diferentes sistemas ou serviços (como o microsserviço interno e o gateway de pagamento externo).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 2.2.1 (Níveis de Teste: Teste de Componente, Integração, Sistema e Aceitação)',
    options: [
      {
        label: 'A',
        content: 'Teste de Componente isolado com mocks estáticos.',
        isCorrect: false,
        justification: 'O teste de componente isolado valida a lógica interna de uma única classe ou função, sem tráfego de interface.',
      },
      {
        label: 'B',
        content: 'Teste de Aceitação Operacional (OAT).',
        isCorrect: false,
        justification: 'OAT trata de prontidão operacional (backup, disaster recovery, migração de dados) por administradores.',
      },
      {
        label: 'C',
        content: 'Teste de Integração (focando em interfaces, contratos de API e comunicação entre serviços).',
        isCorrect: true,
        justification: 'O teste de integração foca explicitamente na comunicação, troca de mensagens e contratos entre componentes e sistemas.',
      },
      {
        label: 'D',
        content: 'Teste de Aceitação do Usuário (UAT).',
        isCorrect: false,
        justification: 'O UAT foca na adequação aos processos de negócio e requisitos funcionais sob o olhar do usuário final.',
      },
    ],
  },
  {
    code: 'Q-CTFL-211',
    topicCode: '2.2',
    learningObjectiveCode: 'FL-2.2.3',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'A respeito dos Tipos de Teste descritos no Syllabus CTFL v4.0.1 (funcionais, não funcionais, caixa-branca e testes relacionados a mudanças), qual das afirmações a seguir é a mais correta?',
    correctOptionLabel: 'A',
    explanation:
      'O Syllabus CTFL v4.0.1 (seção 2.2.3) enfatiza que os tipos de teste podem ser aplicados em todos os níveis de teste. Por exemplo, testes não funcionais (como eficiência de desempenho ou segurança) podem ser executados no teste de componente, de integração, de sistema e de aceitação.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 2.2.3 (Tipos de Teste)',
    options: [
      {
        label: 'A',
        content: 'Testes não funcionais (como desempenho e segurança) podem e devem ser aplicados em qualquer nível de teste, desde o teste de componente até o teste de aceitação.',
        isCorrect: true,
        justification: 'Conceito essencial do ISTQB: os tipos de teste não são restritos a um único nível.',
      },
      {
        label: 'B',
        content: 'Testes não funcionais só podem ser realizados após o sistema estar completamente implantado em ambiente de produção.',
        isCorrect: false,
        justification: 'Incorreto e de alto risco; testes de desempenho e segurança precoces evitam retrabalhos arquiteturais caros.',
      },
      {
        label: 'C',
        content: 'Testes funcionais avaliam características de "quão bem" o sistema se comporta, enquanto os testes não funcionais avaliam "o que" o sistema faz.',
        isCorrect: false,
        justification: 'Definição invertida. Funcionais avaliam "o que" o sistema faz; não funcionais avaliam "quão bem" (desempenho, usabilidade, etc.).',
      },
      {
        label: 'D',
        content: 'Testes de regressão são aplicados apenas quando uma nova funcionalidade é criada pela primeira vez.',
        isCorrect: false,
        justification: 'O teste de regressão é realizado após qualquer alteração (correção de bug, refatoração, atualização) para garantir que áreas inalteradas não foram afetadas.',
      },
    ],
  },
  {
    code: 'Q-CTFL-212',
    topicCode: '2.3',
    learningObjectiveCode: 'FL-2.3.1',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Uma organização bancária decide migrar seu banco de dados legador para uma solução em nuvem e arquivar dados financeiros de mais de 10 anos que não serão mais consultados ativamente. Qual tipo de teste é acionado por esse gatilho de mudança e aposentadoria de dados?',
    correctOptionLabel: 'B',
    explanation:
      'O Teste de Manutenção (seção 2.3.1) é acionado por modificações (melhorias, correções), migrações de ambiente operacional (ex: nuvem) e descontinuação/aposentadoria de sistemas (arquivamento e retenção de dados).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 2.3.1 (Teste de Manutenção e seus Gatilhos)',
    options: [
      {
        label: 'A',
        content: 'Teste de Usabilidade em Dispositivos Móveis.',
        isCorrect: false,
        justification: 'Não tem relação com a migração e retenção de banco de dados corporativo.',
      },
      {
        label: 'B',
        content: 'Teste de Manutenção (incluindo testes de migração e de arquivamento/recuperação de dados descontinuados).',
        isCorrect: true,
        justification: 'Migração e arquivamento/descontinuação são gatilhos clássicos definidos no teste de manutenção.',
      },
      {
        label: 'C',
        content: 'Teste Exploratório Sem Base de Teste.',
        isCorrect: false,
        justification: 'Migrações corporativas exigem critérios estritos de integridade de dados e conformidade legal.',
      },
      {
        label: 'D',
        content: 'Teste de Acessibilidade Web (WCAG).',
        isCorrect: false,
        justification: 'Acessibilidade trata de uso inclusivo de interfaces, não de migração e arquivamento de infraestrutura.',
      },
    ],
  },

  // =========================================================================
  // CAPÍTULO 3 — TESTE ESTÁTICO (4 novas questões: Q-CTFL-307 a 310)
  // =========================================================================
  {
    code: 'Q-CTFL-307',
    topicCode: '3.1',
    learningObjectiveCode: 'FL-3.1.2',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Qual das seguintes alternativas destaca uma vantagem exclusiva do teste estático quando comparado ao teste dinâmico no ciclo de vida de desenvolvimento?',
    correctOptionLabel: 'C',
    explanation:
      'Segundo o Syllabus CTFL v4.0.1 (seção 3.1.2), o teste estático pode encontrar defeitos (causas raiz) diretamente nos produtos de trabalho (como requisitos ambíguos ou código com vulnerabilidade) sem necessidade de executar o software, reduzindo drasticamente o custo de correção.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 3.1.2 (Valor do Teste Estático)',
    options: [
      {
        label: 'A',
        content: 'O teste estático permite medir o tempo exato de resposta de uma transação sob carga real de milhares de usuários.',
        isCorrect: false,
        justification: 'Medir tempos de resposta em tempo de execução sob carga é papel exclusivo do teste dinâmico de desempenho.',
      },
      {
        label: 'B',
        content: 'O teste estático dispensa a necessidade de qualquer teste dinâmico posterior.',
        isCorrect: false,
        justification: 'Ambos são complementares; o teste dinâmico continua indispensável para validar comportamento em tempo de execução.',
      },
      {
        label: 'C',
        content: 'O teste estático identifica diretamente os defeitos no produto de trabalho (como contradições em requisitos ou violações de código) em vez de identificar apenas a falha externa resultante.',
        isCorrect: true,
        justification: 'Vantagem fundamental: localizar o defeito na fonte antes que ele se manifeste como falha em tempo de execução.',
      },
      {
        label: 'D',
        content: 'O teste estático só pode ser executado por ferramentas de IA totalmente automatizadas.',
        isCorrect: false,
        justification: 'O teste estático inclui revisões manuais por pessoas (inspeções, revisões por pares) e análise estática automatizada por linters.',
      },
    ],
  },
  {
    code: 'Q-CTFL-308',
    topicCode: '3.2',
    learningObjectiveCode: 'FL-3.2.2',
    cognitiveLevel: 'K1',
    difficulty: 'EASY',
    statement:
      'Em uma revisão formal descrita no Syllabus CTFL v4.0.1, qual é o papel do participante responsável por documentar anomalias, decisões e novas informações levantadas durante a reunião de revisão?',
    correctOptionLabel: 'D',
    explanation:
      'O Escriba (ou Registrador) é a pessoa encarregada de registrar os defeitos encontrados, as anomalias, as recomendações e as decisões tomadas durante a reunião de revisão (seção 3.2.2).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 3.2.2 (Papéis e Responsabilidades no Processo de Revisão)',
    options: [
      {
        label: 'A',
        content: 'Autor.',
        isCorrect: false,
        justification: 'O Autor é quem criou o artefato sob revisão e geralmente responde dúvidas sobre o documento.',
      },
      {
        label: 'B',
        content: 'Facilitador (ou Moderador).',
        isCorrect: false,
        justification: 'O Facilitador conduz a reunião, gerencia o tempo e assegura o clima construtivo.',
      },
      {
        label: 'C',
        content: 'Líder de Revisão.',
        isCorrect: false,
        justification: 'O Líder de Revisão decide o que será revisado, agenda participantes e obtém os recursos necessários.',
      },
      {
        label: 'D',
        content: 'Escriba (ou Registrador).',
        isCorrect: true,
        justification: 'O Escriba é o encarregado formal de anotar todos os apontamentos e decisões.',
      },
    ],
  },
  {
    code: 'Q-CTFL-309',
    topicCode: '3.2',
    learningObjectiveCode: 'FL-3.2.3',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Considere dois tipos de revisão: a Revisão Informal e a Inspeção. Qual característica diferencia rigorosamente a Inspeção das demais formas de revisão no padrão ISTQB CTFL v4.0.1?',
    correctOptionLabel: 'A',
    explanation:
      'A Inspeção (seção 3.2.3) é o tipo mais formal de revisão. Ela é regida por regras e critérios de entrada e saída definidos, medição de métricas de processo, uso de listas de verificação obrigatórias, preparação prévia estruturada e liderança por um facilitador treinado.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 3.2.3 (Tipos de Revisão: Informal, Walkthrough, Revisão Técnica e Inspeção)',
    options: [
      {
        label: 'A',
        content: 'Possui alto nível de formalidade, critérios objetivos de entrada e saída documentados, coleta sistemática de métricas e papéis formais bem definidos.',
        isCorrect: true,
        justification: 'A inspeção é formal, orientada a regras, critérios e métricas quantitativas de qualidade.',
      },
      {
        label: 'B',
        content: 'Não possui nenhum objetivo principal além de ensinar novos membros da equipe sem registrar atas.',
        isCorrect: false,
        justification: 'Isso é uma característica informal de treinamento ou walkthrough simples, não de uma inspeção formal.',
      },
      {
        label: 'C',
        content: 'É sempre conduzida exclusivamente pelo autor do artefato, que deve rejeitar opiniões externas.',
        isCorrect: false,
        justification: 'A inspeção nunca é liderada pelo autor; é conduzida por um moderador/facilitador treinado.',
      },
      {
        label: 'D',
        content: 'Dispensa reuniões e é baseada apenas em anotações não estruturadas em chats da equipe.',
        isCorrect: false,
        justification: 'A inspeção formal segue processo estruturado, com reuniões dedicadas e registro formal de anomalias.',
      },
    ],
  },
  {
    code: 'Q-CTFL-310',
    topicCode: '3.2',
    learningObjectiveCode: 'FL-3.2.4',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Durante a preparação individual para uma revisão de requisitos de um portal de saúde, um revisor é orientado a adotar a perspectiva de um paciente idoso com baixa visão, enquanto outro adota a perspectiva do administrador de banco de dados focado em conformidade LGPD. Qual técnica de revisão individual está sendo aplicada?',
    correctOptionLabel: 'B',
    explanation:
      'A revisão baseada em papéis (Role-based Review, seção 3.2.4) orienta os revisores a avaliarem o produto de trabalho a partir da perspectiva de diferentes partes interessadas (ex: usuário final com necessidades específicas, operador de infraestrutura, auditor de compliance).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 3.2.4 (Técnicas de Revisão Individual)',
    options: [
      {
        label: 'A',
        content: 'Leitura ad hoc sem foco pré-determinado.',
        isCorrect: false,
        justification: 'Na leitura ad hoc, os revisores leem sem orientação ou perspectiva estruturada.',
      },
      {
        label: 'B',
        content: 'Revisão baseada em papéis (Role-based).',
        isCorrect: true,
        justification: 'Avaliar a partir de personas e papéis de partes interessadas é a definição de revisão baseada em papéis.',
      },
      {
        label: 'C',
        content: 'Revisão baseada em listas de verificação (Checklist-based).',
        isCorrect: false,
        justification: 'A revisão baseada em listas segue perguntas ou tópicos preestabelecidos em um formulário padrão.',
      },
      {
        label: 'D',
        content: 'Revisão baseada em defeitos ortográficos.',
        isCorrect: false,
        justification: 'Não constitui uma técnica individual formal de teste estático segundo o Syllabus.',
      },
    ],
  },

  // =========================================================================
  // CAPÍTULO 4 — ANÁLISE E PROJETO DE TESTE (6 novas questões: Q-CTFL-416 a 421)
  // =========================================================================
  {
    code: 'Q-CTFL-416',
    topicCode: '4.2',
    learningObjectiveCode: 'FL-4.2.1',
    cognitiveLevel: 'K3',
    difficulty: 'HARD',
    statement:
      'Um campo de entrada de idade aceita apenas valores inteiros de 18 a 60 anos (inclusive) para contratação de um seguro. Valores abaixo de 18 ou acima de 60 são rejeitados com mensagens específicas. Entradas não numéricas também devem ser rejeitadas. Aplicando o Particionamento de Equivalência (EP), qual é o conjunto mínimo de valores de teste para cobrir todas as classes de equivalência (válidas e inválidas)?',
    correctOptionLabel: 'C',
    explanation:
      'Classes de equivalência identificadas:\n1. Inválida (menor que 18): ex. 15\n2. Válida (de 18 a 60): ex. 35\n3. Inválida (maior que 60): ex. 68\n4. Inválida (não numérica): ex. "abc"\nO conjunto { 15, 35, 68, "abc" } cobre todas as 4 partições com representatividade mínima necessária.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.2.1 (Particionamento de Equivalência)',
    options: [
      {
        label: 'A',
        content: '{ 18, 30, 60 }',
        isCorrect: false,
        justification: 'Contém apenas valores da partição válida, não cobrindo as partições inválidas.',
      },
      {
        label: 'B',
        content: '{ 10, 20, 70 }',
        isCorrect: false,
        justification: 'Não cobre a partição inválida de valores não numéricos.',
      },
      {
        label: 'C',
        content: '{ 15, 35, 68, "abc" }',
        isCorrect: true,
        justification: 'Cobre exatamente: inválida inferior (<18), válida (18-60), inválida superior (>60) e inválida de formato não numérico.',
      },
      {
        label: 'D',
        content: '{ 17, 18, 19, 59, 60, 61 }',
        isCorrect: false,
        justification: 'Este é um conjunto típico de Análise de Valor Limite (BVA), não o particionamento de equivalência com formato.',
      },
    ],
  },
  {
    code: 'Q-CTFL-417',
    topicCode: '4.2',
    learningObjectiveCode: 'FL-4.2.2',
    cognitiveLevel: 'K3',
    difficulty: 'HARD',
    statement:
      'Uma taxa de juros de 5% é aplicada se a pontuação de crédito do cliente estiver no intervalo de 700 a 850 (inclusive). Considerando a técnica de Análise de Valor Limite (BVA) de 2 valores por limite no conjunto de números inteiros, quais valores devem ser selecionados para testar os limites inferior e superior deste intervalo?',
    correctOptionLabel: 'B',
    explanation:
      'Na BVA de 2 valores (seção 4.2.2), para cada fronteira testamos o valor no limite e o valor imediatamente adjacente fora da partição:\n- Limite inferior (700): 699 (fora) e 700 (dentro).\n- Limite superior (850): 850 (dentro) e 851 (fora).\nConjunto total de valores: 699, 700, 850 e 851.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.2.2 (Análise de Valor Limite - BVA de 2 e 3 valores)',
    options: [
      {
        label: 'A',
        content: '{ 700, 701, 849, 850 }',
        isCorrect: false,
        justification: 'Não testa os valores imediatamente fora das partições (699 e 851).',
      },
      {
        label: 'B',
        content: '{ 699, 700, 850, 851 }',
        isCorrect: true,
        justification: 'Valores exatos nos limites (700, 850) e seus adjacentes externos imediatos (699, 851) na BVA de 2 valores.',
      },
      {
        label: 'C',
        content: '{ 0, 700, 850, 1000 }',
        isCorrect: false,
        justification: '0 e 1000 são valores arbitrários, não limites adjacentes imediatos de fronteira.',
      },
      {
        label: 'D',
        content: '{ 698, 699, 700, 850, 851, 852 }',
        isCorrect: false,
        justification: 'Esse conjunto corresponde a uma abordagem de 3 valores misturada ou excessiva.',
      },
    ],
  },
  {
    code: 'Q-CTFL-418',
    topicCode: '4.2',
    learningObjectiveCode: 'FL-4.2.3',
    cognitiveLevel: 'K3',
    difficulty: 'HARD',
    statement:
      'Uma loja virtual aplica frete grátis se o valor da compra for maior que R$ 200 OU se o cliente for membro VIP. Além disso, se o cliente utilizar cupom de primeira compra, recebe 10% de desconto adicional no total. Quantas combinações possíveis de condições existem em uma Tabela de Decisão completa para este cenário?',
    correctOptionLabel: 'D',
    explanation:
      'O cenário possui 3 condições booleanas (Verdadeiro ou Falso):\n1. Compra > R$ 200?\n2. Cliente VIP?\n3. Cupom de primeira compra?\nEm uma tabela de decisão completa sem redução inicial, o número de colunas (regras) é dado por 2^N, onde N é o número de condições binárias: 2^3 = 8 regras.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.2.3 (Teste de Tabela de Decisão)',
    options: [
      {
        label: 'A',
        content: '3 regras.',
        isCorrect: false,
        justification: '3 é apenas o número de condições, não o número de combinações de regras.',
      },
      {
        label: 'B',
        content: '4 regras.',
        isCorrect: false,
        justification: '4 seria o número de combinações para apenas 2 condições binárias (2^2).',
      },
      {
        label: 'C',
        content: '6 regras.',
        isCorrect: false,
        justification: 'Cálculo linear incorreto (2 * 3). A combinatória de condições binárias é exponencial (2^N).',
      },
      {
        label: 'D',
        content: '8 regras.',
        isCorrect: true,
        justification: 'Para 3 condições binárias, a tabela de decisão completa possui 2^3 = 8 regras distintas.',
      },
    ],
  },
  {
    code: 'Q-CTFL-419',
    topicCode: '4.2',
    learningObjectiveCode: 'FL-4.2.4',
    cognitiveLevel: 'K3',
    difficulty: 'MEDIUM',
    statement:
      'No diagrama de transição de estados de um pedido, os estados possíveis são: [Novo] -> [Pago] -> [Enviado] -> [Entregue]. A partir de [Novo] ou [Pago], o pedido também pode transitar para [Cancelado]. Não é permitido transitar de [Enviado] diretamente para [Cancelado]. Qual das seguintes alternativas descreve um teste de transição inválida?',
    correctOptionLabel: 'A',
    explanation:
      'O teste de transição de estados (seção 4.2.4) projeta casos de teste tanto para transições válidas (caminho pretendido pelo sistema) quanto para transições inválidas (tentar acionar um evento que não deveria ser aceito no estado atual). Tentar cancelar um pedido que já está no estado [Enviado] testa a rejeição de uma transição inválida.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.2.4 (Teste de Transição de Estados)',
    options: [
      {
        label: 'A',
        content: 'Estando o pedido no estado [Enviado], o usuário clica em "Cancelar Pedido" e o sistema deve bloquear a ação exibindo mensagem de erro.',
        isCorrect: true,
        justification: 'Representa exatamente a verificação de que uma transição não permitida (inválida) é bloqueada.',
      },
      {
        label: 'B',
        content: 'Estando o pedido no estado [Novo], o usuário realiza o pagamento e o pedido vai para [Pago].',
        isCorrect: false,
        justification: 'Esta é uma transição válida prevista no modelo.',
      },
      {
        label: 'C',
        content: 'Estando o pedido no estado [Pago], a transportadora retira o pacote e o pedido vai para [Enviado].',
        isCorrect: false,
        justification: 'Esta é uma transição perfeitamente válida.',
      },
      {
        label: 'D',
        content: 'Estando o pedido no estado [Novo], o usuário desiste da compra e o pedido transita para [Cancelado].',
        isCorrect: false,
        justification: 'Transição válida expressamente permitida pelo modelo de estados.',
      },
    ],
  },
  {
    code: 'Q-CTFL-420',
    topicCode: '4.3',
    learningObjectiveCode: 'FL-4.3.1',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Sobre as técnicas de teste caixa-branca, qual é a relação correta entre Cobertura de Instrução (Statement Coverage) e Cobertura de Ramo (Branch Coverage)?',
    correctOptionLabel: 'B',
    explanation:
      'No teste caixa-branca (seção 4.3.1), a Cobertura de Ramo (Branch Coverage) é mais rigorosa do que a Cobertura de Instrução (Statement Coverage). Atingir 100% de cobertura de ramos garante automaticamente 100% de cobertura de instruções, mas o inverso não é verdadeiro (100% de instruções não garante 100% de ramos, especialmente em desvios sem bloco else).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.3.1 (Técnicas de Caixa-Branca: Teste de Instrução e Ramo)',
    options: [
      {
        label: 'A',
        content: 'Atingir 100% de cobertura de instrução garante 100% de cobertura de ramos em qualquer trecho de código.',
        isCorrect: false,
        justification: 'Falso. Um comando "if" sem "else" pode ter sua instrução interna executada com 1 teste, mas o ramo falso nunca foi percorrido.',
      },
      {
        label: 'B',
        content: '100% de cobertura de ramos garante 100% de cobertura de instruções, mas 100% de cobertura de instruções não garante 100% de cobertura de ramos.',
        isCorrect: true,
        justification: 'Princípio formal de subsunção de cobertura caixa-branca: Branch Coverage subsume Statement Coverage.',
      },
      {
        label: 'C',
        content: 'Ambas as métricas são sinônimas e exigem rigorosamente a mesma quantidade de casos de teste em todos os casos.',
        isCorrect: false,
        justification: 'Não são sinônimas. Branch avalia decisões condicionais completas (True/False); Statement avalia apenas linhas executáveis.',
      },
      {
        label: 'D',
        content: 'A cobertura de ramos só se aplica a código compilado em C e não pode ser medida em linguagens modernas como TypeScript.',
        isCorrect: false,
        justification: 'Branch coverage é uma métrica universal suportada por ferramentas em qualquer linguagem de programação moderna.',
      },
    ],
  },
  {
    code: 'Q-CTFL-421',
    topicCode: '4.5',
    learningObjectiveCode: 'FL-4.5.1',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Em equipes que utilizam Desenvolvimento Guiado por Comportamento (BDD) e colaboração baseada nos "Três Amigos", qual é o formato típico utilizado para estruturar critérios de aceitação e cenários de teste compartilhados?',
    correctOptionLabel: 'C',
    explanation:
      'O BDD (seção 4.5.1) utiliza a estrutura Dado-Quando-Entao (Given-When-Then): "Dado" um contexto inicial/pré-condição, "Quando" um evento ou ação ocorre, "Então" um resultado observável esperado deve acontecer. Isso facilita a compreensão compartilhada entre negócio, desenvolvedores e testadores.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.5.1 (Abordagens de Teste Baseadas em Colaboração)',
    options: [
      {
        label: 'A',
        content: 'Diagramas UML de Entidade e Relacionamento físico de banco de dados.',
        isCorrect: false,
        justification: 'Diagramas ER tratam de arquitetura física de dados, não de comportamento de requisitos conversacionais.',
      },
      {
        label: 'B',
        content: 'Instruções de Assembly e registradores de memória.',
        isCorrect: false,
        justification: 'Instruções de baixo nível não servem para comunicação com representantes de negócio.',
      },
      {
        label: 'C',
        content: 'A sintaxe Dado / Quando / Então (Given / When / Then).',
        isCorrect: true,
        justification: 'Sintaxe padrão universal do BDD (Gherkin/Given-When-Then) para descrever comportamento de negócio.',
      },
      {
        label: 'D',
        content: 'Planilhas com fórmulas binárias de álgebra booleana fechada.',
        isCorrect: false,
        justification: 'Contradiz a linguagem ubíqua e clara defendida pelo BDD para alinhamento entre as partes interessadas.',
      },
    ],
  },

  // =========================================================================
  // CAPÍTULO 5 — GERENCIAMENTO DAS ATIVIDADES DE TESTE (4 novas: Q-CTFL-511 a 514)
  // =========================================================================
  {
    code: 'Q-CTFL-511',
    topicCode: '5.1',
    learningObjectiveCode: 'FL-5.1.3',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Em relação aos Critérios de Entrada (Entry Criteria) e Critérios de Saída (Exit Criteria) definidos no planejamento de teste de acordo com o Syllabus CTFL v4.0.1, assinale a opção que representa um Critério de Saída típico para a conclusão do teste de sistema:',
    correctOptionLabel: 'A',
    explanation:
      'Critérios de Saída (seção 5.1.3) definem quando uma atividade de teste ou nível pode ser considerado concluído. Exemplos típicos: percentual de execução de testes planejado atingido (ex: 100%), todos os defeitos de severidade crítica/alta resolvidos ou mitigados, e cobertura de requisitos alcançada.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 5.1.3 (Critérios de Entrada e de Saída)',
    options: [
      {
        label: 'A',
        content: '98% dos testes planejados foram executados e não há defeitos abertos com severidade crítica ou alta não mitigados.',
        isCorrect: true,
        justification: 'Exemplo clássico de critério de saída (Definition of Done da fase de teste).',
      },
      {
        label: 'B',
        content: 'O ambiente de teste foi provisionado e a build inicial foi instalada com sucesso.',
        isCorrect: false,
        justification: 'Isto é um critério de entrada (para começar a testar), não de saída.',
      },
      {
        label: 'C',
        content: 'A equipe de desenvolvimento iniciou a escrita do código dos requisitos priorizados.',
        isCorrect: false,
        justification: 'Início do desenvolvimento de código não é critério de saída da fase de teste de sistema.',
      },
      {
        label: 'D',
        content: 'O documento de requisitos de negócio foi aprovado pelo patrocinador do projeto.',
        isCorrect: false,
        justification: 'Critério de entrada para as fases de análise e design, não de encerramento do teste dinâmico.',
      },
    ],
  },
  {
    code: 'Q-CTFL-512',
    topicCode: '5.2',
    learningObjectiveCode: 'FL-5.2.2',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Qual das seguintes opções apresenta um exemplo de Risco de Produto e um exemplo de Risco de Projeto, respectivamente, conforme as definições do Syllabus ISTQB CTFL v4.0.1?',
    correctOptionLabel: 'D',
    explanation:
      'Segundo o Syllabus CTFL v4.0.1 (seção 5.2.2):\n- Risco de Produto refere-se à possibilidade de que um produto de trabalho não satisfaça as necessidades dos usuários ou apresente defeitos/falhas de qualidade (ex: o software calcula juros incorretamente).\n- Risco de Projeto refere-se a situações que ameaçam a capacidade do projeto de atingir seus objetivos de prazo, orçamento ou recursos (ex: atraso na entrega do ambiente de teste ou escassez de profissionais qualificados).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 5.2.2 (Riscos de Produto e Riscos de Projeto)',
    options: [
      {
        label: 'A',
        content: 'Risco de Produto: o fornecedor de nuvem atrasou a entrega dos servidores; Risco de Projeto: o software falha ao processar pagamentos com cartão.',
        isCorrect: false,
        justification: 'Exemplos invertidos. O atraso do fornecedor é de projeto; a falha do software é de produto.',
      },
      {
        label: 'B',
        content: 'Risco de Produto: a equipe perdeu dois desenvolvedores seniores; Risco de Projeto: o tempo de resposta do sistema excede 10 segundos.',
        isCorrect: false,
        justification: 'Invertido. Perda de pessoal é risco de projeto; lentidão do sistema é risco de produto.',
      },
      {
        label: 'C',
        content: 'Risco de Produto: o orçamento da empresa foi reduzido em 20%; Risco de Projeto: a documentação do usuário está desatualizada.',
        isCorrect: false,
        justification: 'Orçamento é risco de projeto, não de produto.',
      },
      {
        label: 'D',
        content: 'Risco de Produto: o software calcula descontos incorretamente causando perdas financeiras; Risco de Projeto: atraso no fornecimento do ambiente de teste por equipe terceira.',
        isCorrect: true,
        justification: 'Cálculo incorreto no produto afeta a qualidade do software; atraso na infraestrutura afeta cronograma e gestão do projeto.',
      },
    ],
  },
  {
    code: 'Q-CTFL-513',
    topicCode: '5.3',
    learningObjectiveCode: 'FL-5.3.1',
    cognitiveLevel: 'K1',
    difficulty: 'EASY',
    statement:
      'Durante as atividades de monitoramento e controle de teste, qual das seguintes métricas é comumente utilizada para avaliar o progresso da execução e a qualidade do software?',
    correctOptionLabel: 'B',
    explanation:
      'Métricas de teste (seção 5.3.1) fornecem dados objetivos para monitoramento: percentual de casos de teste executados (passados/reprovados), densidade de defeitos, taxa de descoberta de falhas e tempo médio de correção são amplamente empregados.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 5.3.1 (Métricas Utilizadas no Teste)',
    options: [
      {
        label: 'A',
        content: 'Número total de linhas de código deletadas pelo linter estático.',
        isCorrect: false,
        justification: 'Linhas deletadas não indicam se os requisitos foram validados com sucesso.',
      },
      {
        label: 'B',
        content: 'Taxa de execução de casos de teste (passados, reprovados e bloqueados) e densidade de defeitos encontrados por módulo.',
        isCorrect: true,
        justification: 'Métrica objetiva recomendada pelo ISTQB para monitorar o avanço e a estabilidade da aplicação.',
      },
      {
        label: 'C',
        content: 'Quantidade de e-mails trocados entre o QA e o Scrum Master.',
        isCorrect: false,
        justification: 'Volume de mensagens de chat ou e-mail não reflete qualidade técnica nem progresso de testes.',
      },
      {
        label: 'D',
        content: 'Velocidade de digitação dos testadores em palavras por minuto.',
        isCorrect: false,
        justification: 'Completamente irrelevante para a engenharia de qualidade de software.',
      },
    ],
  },
  {
    code: 'Q-CTFL-514',
    topicCode: '5.5',
    learningObjectiveCode: 'FL-5.5.1',
    cognitiveLevel: 'K3',
    difficulty: 'HARD',
    statement:
      'Um testador registrou o seguinte relatório de defeito:\n"O sistema travou ao gerar o relatório fiscal. Corrijam urgente."\nO desenvolvedor devolveu o defeito alegando impossibilidade de reproduzir o erro. De acordo com as boas práticas de Gerenciamento de Defeitos do Syllabus CTFL v4.0.1, quais informações essenciais estão faltando nesse relatório?',
    correctOptionLabel: 'C',
    explanation:
      'Segundo o Syllabus CTFL v4.0.1 (seção 5.5.1), um relatório de defeito eficaz deve conter: identificador único, passos detalhados de reprodução, dados de entrada utilizados, resultado esperado versus resultado obtido, ambiente/versão do software, logs/capturas de tela de apoio e classificação clara de severidade e prioridade.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 5.5.1 (Gerenciamento de Defeitos e Conteúdo do Relatório de Defeitos)',
    options: [
      {
        label: 'A',
        content: 'Apenas o nome do autor do código fonte que cometeu o engano.',
        isCorrect: false,
        justification: 'Relatórios de defeitos não devem focar em culpar pessoas, mas sim em dados técnicos reproduzíveis.',
      },
      {
        label: 'B',
        content: 'O valor do salário do desenvolvedor responsável pelo módulo.',
        isCorrect: false,
        justification: 'Totalmente descabido e sem valor técnico.',
      },
      {
        label: 'C',
        content: 'Passos detalhados para reprodução, dados de entrada utilizados, resultado esperado versus resultado real observado, versão/ambiente e evidências de apoio (logs ou capturas de tela).',
        isCorrect: true,
        justification: 'Informações mandatórias para que qualquer desenvolvedor consiga isolar a causa raiz sem ambiguidades.',
      },
      {
        label: 'D',
        content: 'A garantia assinada de que o usuário nunca mais cometerá um erro de digitação.',
        isCorrect: false,
        justification: 'Não faz sentido no contexto de engenharia de software.',
      },
    ],
  },

  // =========================================================================
  // CAPÍTULO 6 — FERRAMENTAS DE TESTE (2 novas questões: Q-CTFL-605 e 606)
  // =========================================================================
  {
    code: 'Q-CTFL-605',
    topicCode: '6.1',
    learningObjectiveCode: 'FL-6.1.1',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Ferramentas de análise estática de código (como linters e analisadores de segurança SonarQube) e ferramentas de execução de testes (como Playwright ou Vitest) fornecem suporte a diferentes atividades de teste. Qual a principal distinção no modo de operação entre essas duas categorias?',
    correctOptionLabel: 'A',
    explanation:
      'As ferramentas de análise estática examinam o código, as dependências e a arquitetura sem executar o software (seção 6.1.1). Já as ferramentas de execução de testes dinâmica acionam o software em tempo de execução, alimentando dados de entrada e checando as saídas contra oráculos de teste.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 6.1.1 (Classificação de Ferramentas de Suporte ao Teste)',
    options: [
      {
        label: 'A',
        content: 'As ferramentas estáticas analisam o código fonte ou modelos sem executar a aplicação, enquanto as ferramentas de execução dinâmica requerem que o software esteja em execução para operar.',
        isCorrect: true,
        justification: 'Distinção canônica entre suporte a testes estáticos e testes dinâmicos.',
      },
      {
        label: 'B',
        content: 'Ferramentas de análise estática substituem totalmente a necessidade de testadores humanos.',
        isCorrect: false,
        justification: 'Linters e analisadores identificam padrões sintáticos ou vulnerabilidades conhecidas, mas não validam intenção de negócio.',
      },
      {
        label: 'C',
        content: 'Ferramentas de execução de testes não geram logs nem comparam resultados esperados.',
        isCorrect: false,
        justification: 'Ferramentas dinâmicas têm como função primária executar asserções e gerar relatórios de aprovação/reprovação.',
      },
      {
        label: 'D',
        content: 'Ferramentas estáticas só funcionam se conectadas a bancos de dados de produção.',
        isCorrect: false,
        justification: 'Análise estática avalia arquivos de código em repouso e não depende de conexões com bancos de produção.',
      },
    ],
  },
  {
    code: 'Q-CTFL-606',
    topicCode: '6.2',
    learningObjectiveCode: 'FL-6.2.1',
    cognitiveLevel: 'K1',
    difficulty: 'MEDIUM',
    statement:
      'Ao planejar a introdução de uma ferramenta de automação de testes em um projeto, qual dos seguintes itens representa um risco ou custo frequentemente subestimado pelas organizações, de acordo com o Syllabus CTFL v4.0.1?',
    correctOptionLabel: 'D',
    explanation:
      'O Syllabus CTFL v4.0.1 (seção 6.2.1) alerta explicitamente para os riscos da automação: expectativas irreais sobre o que a ferramenta pode alcançar, subestimar o tempo e o custo contínuo necessário para manter o testware (scripts e massa de dados) quando o software sofre alterações, e dependência excessiva de uma ferramenta proprietária.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 6.2.1 (Benefícios e Riscos da Automação de Testes)',
    options: [
      {
        label: 'A',
        content: 'A automação executar testes repetitivos com maior velocidade e consistência.',
        isCorrect: false,
        justification: 'Isto é um benefício consagrado da automação, não um risco ou custo oculto.',
      },
      {
        label: 'B',
        content: 'A redução do erro humano durante regressões longas e enfadonhas.',
        isCorrect: false,
        justification: 'Isto é outro benefício reconhecido do teste automatizado.',
      },
      {
        label: 'C',
        content: 'A obtenção de métricas imediatas e relatórios gráficos no pipeline de CI.',
        isCorrect: false,
        justification: 'Isto é uma vantagem direta de visibilidade e feedback contínuo.',
      },
      {
        label: 'D',
        content: 'Subestimar o esforço contínuo e o custo de manutenção dos scripts de teste automatizados e da massa de dados quando a aplicação evolui.',
        isCorrect: true,
        justification: 'Risco clássico citado no Syllabus: scripts quebram com mudanças na UI/API e demandam manutenção constante.',
      },
    ],
  },
];
