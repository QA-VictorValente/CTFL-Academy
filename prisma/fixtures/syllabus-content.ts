import { CognitiveLevel } from '@prisma/client';

export interface LearningObjectiveItem {
  code: string;
  kLevel: CognitiveLevel;
  description: string;
}

export interface DefinitionItem {
  term: string;
  definition: string;
}

export interface SeedLesson {
  slug: string;
  title: string;
  explanation: string;
  definitions: DefinitionItem[];
  practicalExamples: string;
  qaRoutineExamples: string;
  summary: string;
  estimatedMinutes: number;
  orderIndex: number;
}

export interface SeedTopic {
  code: string;
  slug: string;
  title: string;
  kLevelMax: CognitiveLevel;
  orderIndex: number;
  learningObjectives: LearningObjectiveItem[];
  lessons: SeedLesson[];
}

export interface SeedChapter {
  number: number;
  slug: string;
  title: string;
  description: string;
  introduction: string;
  learningObjectivesSummary: string;
  examWeightQuestions: number;
  recommendedOrder: number;
  topics: SeedTopic[];
}

export const SYLLABUS_CHAPTERS_DATA: SeedChapter[] = [
  {
    number: 1,
    slug: 'fundamentos-de-teste',
    title: 'Fundamentos de Teste',
    description:
      'Conceitos essenciais do teste de software, a diferença entre erro, defeito e falha, os 7 princípios fundamentais, processo de teste, testware e abordagem Whole Team.',
    introduction:
      'O Capítulo 1 do Syllabus ISTQB CTFL v4.0.1 estabelece a base conceitual da engenharia de qualidade e teste de software. Aqui você compreenderá por que o teste vai muito além da simples execução de código, como erros humanos geram defeitos no código ou na documentação e resultam em falhas em produção, além de dominar os sete princípios universais de teste e a dinâmica colaborativa das equipes modernas.',
    learningObjectivesSummary:
      'Compreender objetivos típicos de teste (FL-1.1.1), diferenciar teste de depuração (FL-1.1.2), distinguir erro, defeito, falha e causa-raiz (FL-1.2.3), explicar os 7 princípios de teste (FL-1.3.1), dominar atividades, testware e rastreabilidade (FL-1.4.1 a FL-1.4.5) e aplicar habilidades essenciais, Whole Team e independência (FL-1.5.1 a FL-1.5.3).',
    examWeightQuestions: 8,
    recommendedOrder: 1,
    topics: [
      {
        code: '1.1',
        slug: '1-1-o-que-e-teste',
        title: '1.1 O que é Teste?',
        kLevelMax: 'K2',
        orderIndex: 1,
        learningObjectives: [
          {
            code: 'FL-1.1.1',
            kLevel: 'K1',
            description: 'Identificar objetivos típicos do teste.',
          },
          {
            code: 'FL-1.1.2',
            kLevel: 'K2',
            description: 'Diferenciar o teste da depuração (debugging).',
          },
        ],
        lessons: [
          {
            slug: 'o-que-e-teste-e-diferenca-para-depuracao',
            title: 'Natureza do Teste, Verificação vs. Validação e Teste vs. Depuração',
            explanation: `O teste de software é um conjunto de atividades destinadas a descobrir defeitos e avaliar a qualidade de artefatos de software (conhecidos como objetos de teste). Um equívoco comum é pensar que testar consiste apenas em executar um programa e clicar na tela: a execução de testes é apenas uma das atividades de um processo muito mais amplo.

O teste engloba tanto o **teste dinâmico** (que executa o software com dados de entrada) quanto o **teste estático** (que avalia especificações, histórias de usuário, arquitetura e código-fonte sem executá-los). Além disso, o teste envolve:
- **Verificação**: confirmar se o sistema cumpre os requisitos especificados ("estamos construindo o produto corretamente?").
- **Validação**: confirmar se o sistema atende às reais necessidades dos usuários e partes interessadas no seu ambiente operacional ("estamos construindo o produto certo?").

### Objetivos típicos de teste (FL-1.1.1)
1. Avaliar produtos de trabalho como requisitos, histórias de usuário, arquitetura e código.
2. Provocar falhas e encontrar defeitos.
3. Garantir a cobertura exigida de um objeto de teste.
4. Reduzir o nível de risco de qualidade inadequada do software.
5. Verificar se os requisitos especificados foram atendidos.
6. Verificar se um objeto de teste está em conformidade com requisitos contratuais, legais e regulatórios.
7. Fornecer informações às partes interessadas para tomada de decisão fundamentada.
8. Construir confiança na qualidade do objeto de teste.
9. Validar se o objeto de teste está completo e funciona conforme esperado pelas partes interessadas.

### Teste vs. Depuração (FL-1.1.2)
**Teste** e **depuração (debugging)** são atividades distintas e complementares:
- **Teste** pode provocar falhas causadas por defeitos no software (no teste dinâmico) ou identificar diretamente defeitos no objeto de teste (no teste estático).
- **Depuração** é a atividade de desenvolvimento que encontra a causa da falha (o defeito no código ou configuração), analisa essa causa e elimina o defeito. O processo típico de depuração envolve: (1) reprodução da falha, (2) diagnóstico (encontrar a causa-raiz/defeito) e (3) correção do defeito. Após a correção, o teste entra novamente em ação com o **teste de confirmação** e o **teste de regressão**.`,
            definitions: [
              {
                term: 'Objeto de Teste (Test Object)',
                definition: 'O produto de trabalho a ser testado (ex.: sistema web, API, especificação de requisitos).',
              },
              {
                term: 'Verificação (Verification)',
                definition: 'Confirmação, por meio de fornecimento de evidência objetiva, de que os requisitos especificados foram cumpridos.',
              },
              {
                term: 'Validação (Validation)',
                definition: 'Confirmação, por meio de evidência objetiva, de que os requisitos para um uso ou aplicação específica pretendida foram cumpridos.',
              },
              {
                term: 'Depuração (Debugging)',
                definition: 'Processo de encontrar, analisar e remover as causas de falhas em um componente ou sistema.',
              },
            ],
            practicalExamples: `Em um e-commerce:
- **Verificação**: a especificação exige que compras acima de R$ 200 tenham frete grátis. O teste verifica se um carrinho de R$ 200,01 aplica frete R$ 0,00 na API \`POST /api/checkout/calculate\`.
- **Validação**: mesmo cumprindo a especificação técnica, percebe-se que o fluxo de checkout exige 9 telas seguidas no celular, fazendo os clientes desistirem da compra. A validação avalia se o sistema resolve o problema real do usuário.
- **Teste vs. Depuração**: o QA executa um teste de integração e observa que o endpoint retorna HTTP 500 quando o CEP possui hífen (isso é **teste** provocando uma falha). O desenvolvedor abre os logs, descobre que a expressão regular na linha 42 do serviço de frete rejeita o caractere \`-\` e corrige o código (isso é **depuração**).`,
            qaRoutineExamples: `Na rotina diária de uma squad Ágil:
1. O QA registra um bug claro com passos de reprodução, payload da requisição HTTP e resposta recebida.
2. O desenvolvedor realiza o *debugging* local, corrige a query SQL e abre um Pull Request.
3. O QA realiza o **teste de confirmação** para garantir que a falha original deixou de ocorrer.`,
            summary:
              'Testar inclui atividades estáticas e dinâmicas de verificação e validação. Enquanto o teste revela falhas ou defeitos para avaliar a qualidade e reduzir riscos, a depuração localiza e corrige a causa do defeito no código.',
            estimatedMinutes: 15,
            orderIndex: 1,
          },
        ],
      },
      {
        code: '1.2',
        slug: '1-2-por-que-o-teste-e-necessario',
        title: '1.2 Por que o Teste é Necessário?',
        kLevelMax: 'K2',
        orderIndex: 2,
        learningObjectives: [
          {
            code: 'FL-1.2.1',
            kLevel: 'K2',
            description: 'Exemplificar por que o teste é necessário.',
          },
          {
            code: 'FL-1.2.2',
            kLevel: 'K1',
            description: 'Lembrar a relação entre teste e garantia da qualidade (QA).',
          },
          {
            code: 'FL-1.2.3',
            kLevel: 'K2',
            description: 'Distinguir entre erro, defeito, falha e causa-raiz.',
          },
        ],
        lessons: [
          {
            slug: 'erro-defeito-falha-causa-raiz-e-qa-vs-qc',
            title: 'Erro, Defeito, Falha, Causa-Raiz e Controle vs. Garantia da Qualidade',
            explanation: `O teste rigoroso de sistemas é indispensável para evitar prejuízos financeiros, danos de reputação, perda de tempo ou até riscos à segurança humana. O teste fornece uma forma econômica de detectar defeitos antes da entrega em produção.

### Teste (QC) vs. Garantia da Qualidade (QA) (FL-1.2.2)
No vocabulário formal do ISTQB, é fundamental distinguir **Controle da Qualidade (QC)** de **Garantia da Qualidade (QA)**:
- **Controle da Qualidade (Quality Control - QC)**: abordagem corretiva e orientada ao **produto**, focada em atividades que apoiam o alcance de níveis adequados de qualidade. O **teste** é a principal forma de controle de qualidade.
- **Garantia da Qualidade (Quality Assurance - QA)**: abordagem preventiva e orientada ao **processo**, focada na implementação e melhoria dos processos para assegurar que bons produtos sejam gerados. Os resultados dos testes alimentam tanques de melhoria do processo (QA) e verificam o produto (QC).

### Erro, Defeito, Falha e Causa-Raiz (FL-1.2.3)
Esta é uma das distinções mais cobradas na prova CTFL:
1. **Erro (Error / Mistake)**: ação humana que produz um resultado incorreto (por distração, pressão de prazo, falta de conhecimento ou má interpretação).
2. **Defeito (Defect / Bug / Fault)**: imperfeição ou deficiência em um produto de trabalho (no código-fonte, em uma query SQL, ou em um requisito escrito) onde ele não atende às suas especificações.
3. **Falha (Failure)**: evento no qual um sistema ou componente não executa uma função exigida dentro dos limites especificados quando executado. Nem todo defeito causa uma falha (por exemplo, um defeito em um trecho de código nunca executado ou acionado apenas em anos bissextos). Além disso, falhas também podem ser causadas por condições ambientais externas (radiação, queda de energia, interferência eletromagnética), mesmo sem defeito no código!
4. **Causa-Raiz (Root Cause)**: razão fundamental para a ocorrência de um problema (por exemplo, falta de treinamento da equipe nas regras fiscais do ICMS), cuja remoção previne a recorrência de erros semelhantes no futuro.`,
            definitions: [
              {
                term: 'Erro (Error / Mistake)',
                definition: 'Uma ação humana que produz um resultado incorreto.',
              },
              {
                term: 'Defeito (Defect / Bug / Fault)',
                definition: 'Uma imperfeição ou deficiência em um produto de trabalho onde ele não atende aos seus requisitos ou especificações.',
              },
              {
                term: 'Falha (Failure)',
                definition: 'Um evento no qual um componente ou sistema não executa uma função necessária dentro dos limites especificados.',
              },
              {
                term: 'Causa-Raiz (Root Cause)',
                definition: 'Uma razão fundamental para a ocorrência de um problema.',
              },
            ],
            practicalExamples: `Imagine um sistema bancário de cálculo de juros compostos:
- **Causa-Raiz**: O Product Owner não incluiu exemplos de arredondamento bancário na documentação e o desenvolvedor júnior nunca havia trabalhado com tipos decimais de precisão fixa.
- **Erro**: O desenvolvedor, cansado no fim da sprint, decide usar o tipo \`float\` de ponto flutuante padrão e multiplica a taxa por 12 em vez de exponenciar.
- **Defeito**: A linha \`const total = valor * (1 + taxa * 12)\` gravada no arquivo \`calculoJuros.ts\`.
- **Falha**: Quando um cliente simula um empréstimo de R$ 10.000 por 24 meses no aplicativo, o valor final exibido na tela está R$ 418,50 menor que o valor real devido.`,
            qaRoutineExamples: `Durante uma cerimônia de *Post-Mortem* de incidente em produção:
A equipe identifica que a **falha** (cobrança duplicada no cartão) ocorreu devido a um **defeito** (ausência de chave de idempotência no endpoint \`POST /payments\`), introduzido por um **erro** humano durante a refatoração, cuja **causa-raiz** era a falta de um checklist de segurança financeira nas revisões de arquitetura.`,
            summary:
              'Pessoas cometem erros (ações humanas), que introduzem defeitos nos artefatos (bugs no código ou documentos), os quais podem se manifestar como falhas durante a execução do sistema. A análise de causa-raiz atua no processo (QA) para prevenir novos erros.',
            estimatedMinutes: 18,
            orderIndex: 1,
          },
        ],
      },
      {
        code: '1.3',
        slug: '1-3-principios-de-teste',
        title: '1.3 Princípios de Teste',
        kLevelMax: 'K2',
        orderIndex: 3,
        learningObjectives: [
          {
            code: 'FL-1.3.1',
            kLevel: 'K2',
            description: 'Explicar os sete princípios de teste.',
          },
        ],
        lessons: [
          {
            slug: 'os-sete-principios-de-teste-do-istqb',
            title: 'Os 7 Princípios Universais do Teste de Software',
            explanation: `Ao longo das últimas décadas, a engenharia de software consolidou **sete princípios fundamentais de teste** que servem como diretrizes gerais para qualquer projeto:

1. **O teste mostra a presença de defeitos, não a sua ausência**: O teste pode provar que defeitos existem, mas não pode provar que o software está 100% livre de defeitos. Mesmo que nenhum teste falhe, defeitos ocultos ainda podem existir.
2. **O teste exaustivo é impossível**: Testar todas as combinações possíveis de entradas, pré-condições e estados é inviável (exceto em casos triviais). Por isso, utilizamos técnicas de teste, análise de riscos e priorização para focar os esforços.
3. **O teste antecipado economiza tempo e dinheiro (Early Testing)**: Quanto mais cedo um defeito for encontrado (por exemplo, na revisão dos requisitos ou histórias de usuário), mais barato e rápido será corrigi-lo do que se for descoberto em produção.
4. **Os defeitos se agrupam (Defect Clustering)**: Um pequeno número de módulos ou componentes geralmente contém a maioria dos defeitos descobertos ou é responsável pela maior parte das falhas operacionais (aplicação do Princípio de Pareto: ~80% dos defeitos em ~20% dos módulos).
5. **Os testes se desgastam (Pesticide Paradox / Paradoxo do Pesticida)**: Se os mesmos testes forem repetidos continuamente da mesma maneira, eles deixarão de encontrar novos defeitos. Para descobrir novos defeitos, os testes existentes precisam ser atualizados e novos testes precisam ser criados (embora testes de regressão automatizados continuem úteis para detectar regressões!).
6. **O teste depende do contexto**: Não se testa um aplicativo de jogos casuais da mesma forma que um software embarcado de controle de tráfego aéreo ou um sistema hospitalar de infusão intravenosa.
7. **Falácia da ausência de defeitos**: Encontrar e corrigir centenas de defeitos (100% de verificação da especificação) de nada servirá se o sistema construído for inutilizável, difícil de operar ou não atender às reais necessidades de negócio do usuário (falha na validação).`,
            definitions: [
              {
                term: 'Agrupamento de Defeitos (Defect Clustering)',
                definition: 'Concentração desproporcional de defeitos em um pequeno conjunto de módulos de um sistema (Princípio de Pareto).',
              },
              {
                term: 'Paradoxo do Pesticida (Tests wear out)',
                definition: 'Fenômeno em que a repetição contínua dos mesmos casos de teste deixa de revelar novos defeitos no sistema.',
              },
              {
                term: 'Falácia da Ausência de Defeitos',
                definition: 'Crença equivocada de que corrigir todos os defeitos técnicos garante o sucesso de um sistema que não atende às necessidades do usuário.',
              },
            ],
            practicalExamples: `- **Teste Exaustivo Impossível**: Um formulário de transferência bancária com apenas 3 campos (conta destino de 10 dígitos, valor de até 10 dígitos e data) possui mais de $10^{20}$ combinações possíveis. Aplicamos Particionamento de Equivalência e Valor Limite em vez de testar tudo.
- **Agrupamento de Defeitos**: No repositório Git da empresa, o módulo legado \`BillingEngine.ts\` concentra 65% dos bugs abertos nos últimos 6 meses. O líder de teste aloca maior cobertura de testes para esse módulo.`,
            qaRoutineExamples: `Ao planejar a regressão de uma sprint, o QA percebe que a suíte automatizada roda os mesmos 120 testes há um ano sem falhar, mas bugs continuam escapando no fluxo de cupons promocionais. Aplicando o princípio de que **os testes se desgastam**, o QA adiciona novos cenários com combinações de cupons cumulativos.`,
            summary:
              'Os 7 princípios guiam decisões práticas: não busque testar todas as combinações possíveis, inicie os testes cedo, monitore onde os defeitos se concentram, renove seus casos de teste, adapte a estratégia ao contexto e nunca esqueça o valor de negócio.',
            estimatedMinutes: 20,
            orderIndex: 1,
          },
        ],
      },
      {
        code: '1.4',
        slug: '1-4-atividades-testware-e-papeis',
        title: '1.4 Atividades de Teste, Testware e Papéis de Teste',
        kLevelMax: 'K2',
        orderIndex: 4,
        learningObjectives: [
          {
            code: 'FL-1.4.1',
            kLevel: 'K2',
            description: 'Resumir as diferentes atividades e tarefas de teste.',
          },
          {
            code: 'FL-1.4.2',
            kLevel: 'K2',
            description: 'Explicar o impacto do contexto no processo de teste.',
          },
          {
            code: 'FL-1.4.3',
            kLevel: 'K2',
            description: 'Diferenciar o testware que suporta as atividades de teste.',
          },
          {
            code: 'FL-1.4.4',
            kLevel: 'K2',
            description: 'Explicar o valor de manter a rastreabilidade.',
          },
          {
            code: 'FL-1.4.5',
            kLevel: 'K2',
            description: 'Comparar os diferentes papéis no teste.',
          },
        ],
        lessons: [
          {
            slug: 'processo-de-teste-testware-rastreabilidade-e-papeis',
            title: 'Atividades do Processo de Teste, Testware, Rastreabilidade e Papéis',
            explanation: `O processo de teste é composto por um conjunto estruturado de atividades principais (que podem ocorrer de forma iterativa ou paralela em projetos Ágeis):

1. **Planejamento de Teste**: Definir os objetivos do teste e selecionar a abordagem para alcançá-los dentro das restrições do projeto (produz o Plano de Teste).
2. **Monitoramento e Controle de Teste**:
   - *Monitoramento*: Verificação contínua de todas as atividades de teste e comparação do progresso real com o plano.
   - *Controle*: Tomada de ações diretivas ou corretivas necessárias para atingir os objetivos do plano (ex.: realocar testadores, repriorizar testes).
3. **Análise de Teste**: Analisar a base de teste (requisitos, histórias, arquitetura) para identificar características testáveis e definir **condições de teste** ("O que testar?"), além de encontrar defeitos na própria base de teste.
4. **Projeto de Teste (Test Design)**: Elaborar as condições de teste em **casos de teste** de alto nível, conjuntos de cartas de teste exploratório e identificar dados e ambiente de teste ("Como testar?").
5. **Implementação de Teste**: Criar ou adquirir o testware necessário para a execução (scripts automatizados, massa de dados, procedimentos de teste ordenados, preparação do ambiente).
6. **Execução de Teste**: Executar os testes (manualmente ou por ferramentas), comparar resultados reais com resultados esperados, registrar logs de execução e reportar defeitos.
7. **Conclusão de Teste**: Coletar dados de atividades concluídas para consolidar experiência, arquivar testware, limpar o ambiente, criar solicitações de mudança para defeitos não resolvidos e emitir o **Relatório de Conclusão de Teste**.

### Rastreabilidade (FL-1.4.4)
Manter a rastreabilidade bidirecional entre a **base de teste** (requisitos/riscos) e o **testware** (condições, casos de teste, resultados e defeitos) permite avaliar cobertura, analisar o impacto de mudanças nos requisitos e auditar a qualidade da entrega.

### Papéis no Teste (FL-1.4.5)
O Syllabus v4.0 destaca dois papéis principais:
- **Papel de Gerenciamento de Teste**: Responsabilidade geral pelo processo de teste, equipe e liderança (planejamento, monitoramento, controle e conclusão).
- **Papel de Teste (Testing Role)**: Responsabilidade pelos aspectos técnicos e de engenharia do teste (análise, projeto, implementação e execução).`,
            definitions: [
              {
                term: 'Base de Teste (Test Basis)',
                definition: 'O corpo de conhecimento usado como base para a análise e o projeto de teste (ex.: requisitos, histórias de usuário, código).',
              },
              {
                term: 'Condição de Teste (Test Condition)',
                definition: 'Um aspecto testável de um componente ou sistema identificado como base para o teste (responde a "O que testar?").',
              },
              {
                term: 'Testware',
                definition: 'Produtos de trabalho produzidos durante o processo de teste para uso no planejamento, projeto, execução, avaliação e relatórios.',
              },
            ],
            practicalExamples: `- **Análise de Teste ("O que testar?")**: A partir da história de usuário US-104 (Pagamento via PIX), identifica-se a condição de teste: *"Validar expiração do QR Code PIX após 30 minutos"*.
- **Projeto de Teste ("Como testar?")**: Aplicar Análise de Valor Limite para projetar casos de teste em 29min59s, 30min00s e 30min01s.
- **Implementação de Teste**: Criar o script Playwright e o mock do webhook do Banco Central.`,
            qaRoutineExamples: `Quando o cliente altera a regra de estorno de cartão no meio do projeto, a **matriz de rastreabilidade** permite ao QA identificar em segundos exatamente quais 8 casos de teste e 3 scripts automatizados estão vinculados ao requisito \`REQ-PAY-09\`.`,
            summary:
              'As 7 atividades do processo de teste geram testware específico em cada etapa. A análise responde "o que testar" (condições) e o projeto responde "como testar" (casos de teste), sempre apoiados pela rastreabilidade com a base de teste.',
            estimatedMinutes: 22,
            orderIndex: 1,
          },
        ],
      },
      {
        code: '1.5',
        slug: '1-5-habilidades-whole-team-e-independencia',
        title: '1.5 Habilidades Essenciais e Boas Práticas em Teste',
        kLevelMax: 'K2',
        orderIndex: 5,
        learningObjectives: [
          {
            code: 'FL-1.5.1',
            kLevel: 'K2',
            description: 'Dar exemplos de habilidades genéricas necessárias para o teste.',
          },
          {
            code: 'FL-1.5.2',
            kLevel: 'K1',
            description: 'Lembrar as vantagens da abordagem Whole Team (Equipe Unificada).',
          },
          {
            code: 'FL-1.5.3',
            kLevel: 'K2',
            description: 'Distinguir os benefícios e desvantagens da independência do teste.',
          },
        ],
        lessons: [
          {
            slug: 'habilidades-de-teste-whole-team-e-independencia',
            title: 'Mentalidade Crítica, Abordagem Whole Team e Níveis de Independência',
            explanation: `### Habilidades Essenciais do Testador (FL-1.5.1)
Um bom profissional de teste combina conhecimento técnico (técnicas de teste, automação, APIs, bancos de dados) com:
- Curiosidade, pensamento crítico, atenção aos detalhes e ceticismo profissional.
- **Boa comunicação e empatia**: como reportar defeitos pode ser percebido como uma crítica ao autor do código, o testador deve comunicar falhas de forma construtiva, objetiva e colaborativa, evitando posturas confrontadoras.

### Abordagem Whole Team (Equipe Unificada) (FL-1.5.2)
Originada na Programação Extrema (XP) e no Ágil, a abordagem **Whole Team** significa que qualquer membro da equipe com as habilidades necessárias pode realizar tarefas de teste, e **todos os membros compartilham a responsabilidade pela qualidade**. Testadores trabalham lado a lado com representantes de negócio (para criar critérios de aceite) e com desenvolvedores (para definir a estratégia de automação).

### Independência do Teste (FL-1.5.3)
Os defeitos podem ser encontrados por diferentes pessoas com graus crescentes de independência:
1. Sem testadores independentes (os próprios autores testam seu código).
2. Pares dentro da mesma equipe (outros desenvolvedores ou testadores da squad).
3. Testadores de fora da equipe, mas dentro da organização (equipe independente de QA).
4. Testadores externos à organização (consultoria externa ou usuários finais).

- **Principal benefício da independência**: Testadores independentes possuem vieses cognitivos diferentes dos autores do código, sendo mais eficazes em identificar falhas e premissas equivocadas que o desenvolvedor não percebeu.
- **Principais desvantagens da independência excessiva**: Isolamento da equipe de desenvolvimento, problemas de comunicação, postura adversarial ("nós contra eles"), gargalos na entrega e desenvolvedores perdendo o senso de responsabilidade pela qualidade.`,
            definitions: [
              {
                term: 'Abordagem Whole Team',
                definition: 'Prática em que toda a equipe multifuncional compartilha a responsabilidade pela qualidade e colabora nas atividades de teste.',
              },
              {
                term: 'Independência do Teste',
                definition: 'Separação de responsabilidades que incentiva a realização de testes objetivos por pessoas diferentes do autor do artefato.',
              },
            ],
            practicalExamples: `Em um banco digital, os desenvolvedores executam testes unitários no próprio código (baixa independência), o QA da squad realiza testes exploratórios e de API (independência moderada dentro do *Whole Team*) e uma auditoria externa realiza testes de penetração antes do lançamento (alta independência).`,
            qaRoutineExamples: `Em vez de abrir um ticket dizendo *"O desenvolvedor quebrou o login novamente"*, o QA escreve um comentário objetivo e neutro: *"Ao autenticar com usuário sem perfil vinculado, a API retorna HTTP 500 em vez de HTTP 403 conforme especificado na US-12. Segue log da stack trace para facilitar o diagnóstico."*`,
            summary:
              'A comunicação construtiva, a colaboração Whole Team e o equilíbrio adequado de independência evitam vieses de confirmação do autor sem criar silos ou gargalos.',
            estimatedMinutes: 15,
            orderIndex: 1,
          },
        ],
      },
    ],
  },
  {
    number: 2,
    slug: 'teste-ao-longo-do-ciclo-de-vida',
    title: 'Teste ao Longo do Ciclo de Vida de Desenvolvimento de Software',
    description:
      'Impacto dos modelos de SDLC, Shift-Left, TDD/ATDD/BDD, DevOps, níveis de teste, tipos de teste, confirmação vs. regressão e teste de manutenção.',
    introduction:
      'O Capítulo 2 explora como o teste se adapta aos diferentes modelos de Ciclo de Vida de Desenvolvimento de Software (sequenciais, iterativos e incrementais), como práticas modernas como Shift-Left e DevOps aceleram o feedback e como estruturar níveis de teste (Componente, Integração, Sistema e Aceite) e tipos de teste.',
    learningObjectivesSummary:
      'Compreender o impacto do SDLC no teste (FL-2.1.1 a FL-2.1.6), distinguir os 5 níveis de teste e 4 tipos de teste (FL-2.2.1 e FL-2.2.2), diferenciar confirmação de regressão (FL-2.2.3) e identificar os gatilhos do teste de manutenção (FL-2.3.1).',
    examWeightQuestions: 6,
    recommendedOrder: 2,
    topics: [
      {
        code: '2.1',
        slug: '2-1-teste-no-contexto-do-sdlc',
        title: '2.1 Teste no Contexto de um SDLC',
        kLevelMax: 'K2',
        orderIndex: 1,
        learningObjectives: [
          {
            code: 'FL-2.1.1',
            kLevel: 'K2',
            description: 'Explicar o impacto do ciclo de vida de desenvolvimento de software escolhido no teste.',
          },
          {
            code: 'FL-2.1.2',
            kLevel: 'K1',
            description: 'Lembrar boas práticas de teste aplicáveis a todos os modelos de SDLC.',
          },
          {
            code: 'FL-2.1.3',
            kLevel: 'K1',
            description: 'Lembrar exemplos de abordagens de desenvolvimento orientadas a teste (TDD, ATDD, BDD).',
          },
          {
            code: 'FL-2.1.4',
            kLevel: 'K2',
            description: 'Resumir como o DevOps pode impactar o teste.',
          },
          {
            code: 'FL-2.1.5',
            kLevel: 'K2',
            description: 'Explicar a abordagem Shift-Left.',
          },
          {
            code: 'FL-2.1.6',
            kLevel: 'K2',
            description: 'Explicar como retrospectivas podem ser usadas como mecanismo de melhoria de processo.',
          },
        ],
        lessons: [
          {
            slug: 'sdlc-tdd-atdd-bdd-devops-e-shift-left',
            title: 'Modelos de SDLC, TDD/ATDD/BDD, DevOps, Shift-Left e Retrospectivas',
            explanation: `### Impacto do SDLC e Boas Práticas Universais (FL-2.1.1, FL-2.1.2)
- Em **modelos sequenciais** (Cascata, Modelo V), nas fases iniciais os testadores participam de revisões de requisitos e análise/projeto de teste, mas o teste dinâmico só ocorre mais tarde no ciclo.
- Em **modelos iterativos e incrementais** (Scrum, Kanban), cada iteração entrega um incremento funcional, exigindo feedback rápido, testes contínuos e automação pesada de regressão.
- **Boas práticas universais em qualquer SDLC**: (1) Para cada atividade de desenvolvimento existe uma atividade de teste correspondente; (2) Diferentes níveis de teste possuem objetivos específicos e não redundantes; (3) A análise e o projeto de teste de um nível começam durante a atividade de desenvolvimento correspondente; (4) Testadores participam das revisões de produtos de trabalho assim que rascunhos estão disponíveis.

### TDD, ATDD e BDD (FL-2.1.3)
- **TDD (Test-Driven Development)**: Direciona a codificação por meio de testes unitários automatizados escritos *antes* do código, seguindo o ciclo *Red -> Green -> Refactor*.
- **ATDD (Acceptance Test-Driven Development)**: Deriva testes a partir dos critérios de aceite em colaboração entre negócio, dev e QA antes da implementação da funcionalidade.
- **BDD (Behavior-Driven Development)**: Expressa o comportamento desejado da aplicação em linguagem natural estruturada (*Dado / Quando / Então* — Gherkin), servindo como documentação viva e base para automação.

### DevOps e Shift-Left (FL-2.1.4, FL-2.1.5)
- **DevOps** promove integração entre desenvolvimento e operações com pipelines de CI/CD, fornecendo feedback rápido sobre a qualidade do código, ambientes automatizados e redução de testes manuais repetitivos, embora exija investimento em infraestrutura de automação.
- **Shift-Left** é o princípio de realizar atividades de teste o mais cedo possível no ciclo de vida (sem descuidar dos testes tardios em produção). Exemplos de Shift-Left: revisar especificações antes do código, analisar código estaticamente na IDE e escrever casos de teste antes da implementação.`,
            definitions: [
              {
                term: 'Shift-Left',
                definition: 'Abordagem para encontrar defeitos mais cedo no ciclo de vida, movendo atividades de teste para a esquerda na linha do tempo do projeto.',
              },
              {
                term: 'CI/CD (Integração e Entrega Contínua)',
                definition: 'Pipeline automatizado que compila, testa e implanta incrementos de software de forma frequente e confiável.',
              },
            ],
            practicalExamples: `Em um pipeline GitHub Actions (DevOps + Shift-Left):
Sempre que um desenvolvedor abre um Pull Request, o pipeline executa ESLint, TypeScript typecheck, testes unitários Vitest e análise estática de segurança antes mesmo que um revisor humano aprove o código.`,
            qaRoutineExamples: `Na reunião de *Refinamento (Three Amigos)*, o PO, o Dev e o QA aplicam **BDD/ATDD** discutindo cenários de borda para uma funcionalidade de estorno parcial antes de qualquer linha de código ser escrita. Na **retrospectiva** ao final da sprint, a equipe analisa por que dois bugs escaparam e melhora sua Definição de Pronto (DoD).`,
            summary:
              'Independentemente do SDLC, o teste deve começar cedo (Shift-Left). TDD, ATDD e BDD usam testes para guiar o desenvolvimento, enquanto DevOps e retrospectivas promovem entrega contínua e melhoria constante do processo.',
            estimatedMinutes: 20,
            orderIndex: 1,
          },
        ],
      },
      {
        code: '2.2',
        slug: '2-2-niveis-e-tipos-de-teste',
        title: '2.2 Níveis de Teste e Tipos de Teste',
        kLevelMax: 'K2',
        orderIndex: 2,
        learningObjectives: [
          {
            code: 'FL-2.2.1',
            kLevel: 'K2',
            description: 'Distinguir os diferentes níveis de teste.',
          },
          {
            code: 'FL-2.2.2',
            kLevel: 'K2',
            description: 'Distinguir os diferentes tipos de teste.',
          },
          {
            code: 'FL-2.2.3',
            kLevel: 'K2',
            description: 'Distinguir teste de confirmação de teste de regressão.',
          },
        ],
        lessons: [
          {
            slug: 'niveis-de-teste-tipos-de-teste-confirmacao-e-regressao',
            title: 'Os 5 Níveis de Teste, os 4 Tipos de Teste e Confirmação vs. Regressão',
            explanation: `### Os 5 Níveis de Teste no Syllabus v4.0 (FL-2.2.1)
Níveis de teste são grupos de atividades de teste organizadas e gerenciadas juntas, relacionadas às fases de desenvolvimento:
1. **Teste de Componente (Teste Unitário)**: Foca em componentes ou unidades isoladas (funções, classes, módulos), frequentemente usando mocks/stubs e executado pelos desenvolvedores.
2. **Teste de Integração de Componentes**: Foca nas interfaces e interações entre componentes internos do sistema (ex.: camada de serviço conversando com o banco de dados PostgreSQL).
3. **Teste de Sistema**: Foca no comportamento e capacidades de todo o sistema integrado ponta a ponta (E2E), verificando tarefas funcionais e características não funcionais em um ambiente representativo da produção.
4. **Teste de Integração de Sistemas**: Foca nas interfaces e protocolos entre o nosso sistema e sistemas externos, microsserviços de terceiros ou gateways de pagamento.
5. **Teste de Aceite**: Foca na validação e na prontidão para implantação, garantindo que o sistema atende às necessidades de negócio do usuário (inclui UAT - Aceite do Usuário, OAT - Aceite Operacional, Aceite Contratual/Regulatório e testes Alfa/Beta).

### Os 4 Tipos de Teste (FL-2.2.2)
Qualquer tipo de teste pode ser aplicado em **qualquer nível de teste**:
1. **Teste Funcional**: Avalia "o que" o sistema faz (completude, correção e adequação funcional).
2. **Teste Não Funcional**: Avalia "quão bem" o sistema se comporta (desempenho, segurança, usabilidade, confiabilidade, manutenibilidade, portabilidade).
3. **Teste Caixa-Preta**: Baseado em especificações e comportamento externo, sem considerar a estrutura interna do objeto de teste.
4. **Teste Caixa-Branca**: Baseado na estrutura interna, arquitetura, fluxos de controle ou código do sistema.

### Teste de Confirmação vs. Teste de Regressão (FL-2.2.3)
- **Teste de Confirmação (Re-testing)**: Confirma que um defeito reportado anteriormente foi efetivamente corrigido (repetindo o teste que falhou ou executando novos testes que exercitem a correção).
- **Teste de Regressão**: Confirma que uma alteração (correção de bug, nova funcionalidade ou refatoração) **não introduziu efeitos colaterais adversos** em partes inalteradas do software.`,
            definitions: [
              {
                term: 'Teste de Confirmação (Confirmation Testing)',
                definition: 'Teste dinâmico realizado após a correção de defeitos com o objetivo de confirmar que as falhas causadas por esses defeitos não ocorrem mais.',
              },
              {
                term: 'Teste de Regressão (Regression Testing)',
                definition: 'Teste de um componente ou sistema previamente testado após sua modificação para garantir que defeitos não foram introduzidos ou descobertos em áreas inalteradas.',
              },
            ],
            practicalExamples: `Ao corrigir um bug no cálculo de desconto progressivo:
- **Teste de Confirmação**: Executar novamente o cenário com 3 itens no carrinho e confirmar que o desconto de 15% agora é calculado corretamente.
- **Teste de Regressão**: Executar a suíte de testes de frete, cupom e fechamento de pedido para garantir que a alteração no cálculo de desconto não quebrou o pagamento via cartão.`,
            qaRoutineExamples: `Em arquiteturas de microsserviços, o QA diferencia claramente o **Teste de Integração de Componentes** (testar o controller + Prisma + PostgreSQL interno da API de Pedidos) do **Teste de Integração de Sistemas** (testar a comunicação entre a API de Pedidos, o gateway Stripe e o ERP da transportadora).`,
            summary:
              'Os 5 níveis definem a granularidade do objeto testado (do componente isolado até a integração entre sistemas e o aceite), os 4 tipos definem o foco da avaliação e a dupla Confirmação + Regressão garante mudanças seguras.',
            estimatedMinutes: 20,
            orderIndex: 1,
          },
        ],
      },
      {
        code: '2.3',
        slug: '2-3-teste-de-manutencao',
        title: '2.3 Teste de Manutenção',
        kLevelMax: 'K2',
        orderIndex: 3,
        learningObjectives: [
          {
            code: 'FL-2.3.1',
            kLevel: 'K2',
            description: 'Resumir o teste de manutenção e seus gatilhos.',
          },
        ],
        lessons: [
          {
            slug: 'teste-de-manutencao-escopo-e-gatilhos',
            title: 'Gatilhos e Escopo do Teste de Manutenção',
            explanation: `Após a entrada de um sistema em produção, ele frequentemente passa por manutenções corretivas, adaptativas ou evolutivas, ser migrado ou até mesmo desativado. O **Teste de Manutenção** avalia tanto o sucesso da alteração quanto a ausência de regressões no restante do sistema em operação.

### Os 3 Gatilhos (Triggers) do Teste de Manutenção (FL-2.3.1)
1. **Modificação**: Mudanças planejadas de melhoria (novas regras fiscais), mudanças corretivas (hotfixes de emergência) ou mudanças de ambiente (atualização do sistema operacional ou do motor do banco de dados PostgreSQL).
2. **Migração**: Mudança de uma plataforma para outra (ex.: migrar um sistema on-premise para AWS/nuvem ou migrar dados de um banco legado para uma nova estrutura). Exige testes operacionais do novo ambiente e testes de conversão/migração de dados.
3. **Aposentadoria (Retirement / Desativação)**: Quando uma aplicação atinge o fim de sua vida útil. O teste de manutenção verifica o arquivamento seguro dos dados por exigências legais (ex.: retenção de notas fiscais por 5 anos) e os procedimentos de restauração caso esses dados precisem ser consultados no futuro.

### O que define o escopo do Teste de Manutenção?
O escopo depende de: (1) o grau de risco da alteração, (2) o tamanho do sistema existente e (3) o tamanho da alteração realizada (determinados por meio de **análise de impacto**).`,
            definitions: [
              {
                term: 'Análise de Impacto (Impact Analysis)',
                definition: 'Identificação de todas as áreas de um sistema que podem ser afetadas por uma mudança planejada, usada para decidir a extensão dos testes de regressão.',
              },
            ],
            practicalExamples: `Quando um hospital desativa seu antigo sistema de prontuário eletrônico em desktop (**Aposentadoria**), a equipe de QA executa testes para validar que 100% dos históricos médicos dos últimos 20 anos foram exportados para o repositório de arquivo morto criptografado e podem ser lidos pelo módulo de auditoria.`,
            qaRoutineExamples: `Antes de atualizar a versão do Node.js de 18 para 20 em produção (**Modificação de ambiente**), o QA realiza análise de impacto e executa os testes de regressão nas integrações críticas que dependem de bibliotecas nativas de criptografia.`,
            summary:
              'O teste de manutenção é acionado por Modificação, Migração ou Aposentadoria do sistema, e seu escopo é dimensionado pela análise de impacto, tamanho do sistema e nível de risco.',
            estimatedMinutes: 15,
            orderIndex: 1,
          },
        ],
      },
    ],
  },
  {
    number: 3,
    slug: 'teste-estatico',
    title: 'Teste Estático',
    description:
      'Fundamentos do teste estático, comparação com o teste dinâmico, processo formal de revisão, papéis e tipos de revisão (Informal, Walkthrough, Técnica, Inspeção).',
    introduction:
      'O Capítulo 3 aborda o Teste Estático — uma das ferramentas de maior retorno sobre investimento (ROI) na engenharia de qualidade. Diferente do teste dinâmico, o teste estático examina artefatos (requisitos, histórias, arquitetura, código) sem executar o software, encontrando defeitos diretamente na fonte antes que se transformem em falhas caras.',
    learningObjectivesSummary:
      'Reconhecer produtos de trabalho examináveis (FL-3.1.1), explicar o valor do teste estático e compará-lo ao dinâmico (FL-3.1.2, FL-3.1.3), compreender o feedback antecipado, atividades, papéis, os 4 tipos de revisão e os fatores de sucesso (FL-3.2.1 a FL-3.2.5).',
    examWeightQuestions: 4,
    recommendedOrder: 3,
    topics: [
      {
        code: '3.1',
        slug: '3-1-conceitos-basicos-de-teste-estatico',
        title: '3.1 Conceitos Básicos de Teste Estático',
        kLevelMax: 'K2',
        orderIndex: 1,
        learningObjectives: [
          {
            code: 'FL-3.1.1',
            kLevel: 'K1',
            description: 'Reconhecer tipos de produtos de trabalho que podem ser examinados pelos diferentes tipos de teste estático.',
          },
          {
            code: 'FL-3.1.2',
            kLevel: 'K2',
            description: 'Explicar o valor do teste estático.',
          },
          {
            code: 'FL-3.1.3',
            kLevel: 'K2',
            description: 'Comparar e contrastar teste estático e teste dinâmico.',
          },
        ],
        lessons: [
          {
            slug: 'conceitos-valor-e-diferencas-teste-estatico-vs-dinamico',
            title: 'Teste Estático, Análise Estática e Comparação com Teste Dinâmico',
            explanation: `O **Teste Estático** avalia produtos de trabalho por meio de revisões manuais (ex.: revisão de requisitos, code review) ou ferramentas automatizadas de **análise estática** (ex.: linters, analisadores de complexidade ciclomática, scanners SAST de segurança) sem executar o código.

### Quais produtos de trabalho podem sofrer teste estático? (FL-3.1.1)
Praticamente **qualquer produto de trabalho que possa ser lido e compreendido**: especificações de requisitos, histórias de usuário, critérios de aceite, arquitetura, código-fonte, planos de teste, casos de teste, scripts de banco de dados, contratos e configurações de CI/CD.
*(Atenção para pegadinhas de prova: código executável compilado de terceiros em binário opaco ou criptografado que não pode ser lido por humanos nem interpretado por ferramentas não é apropriado para revisão humana).*

### Teste Estático vs. Teste Dinâmico (FL-3.1.3)
1. **Como encontram problemas**: O teste estático encontra **defeitos diretamente** nos produtos de trabalho; o teste dinâmico provoca **falhas** durante a execução, e uma análise posterior (depuração) é necessária para achar o defeito subjacente.
2. **Cobertura de caminhos raros**: O teste estático pode avaliar facilmente caminhos de código raramente executados ou inalcançáveis (código morto), enquanto o teste dinâmico só avalia caminhos efetivamente executados.
3. **Tipos de defeitos típicos do teste estático**: Ambiguidades e contradições em requisitos, desvios de padrões de codificação, variáveis declaradas e nunca utilizadas, vulnerabilidades de segurança no código e problemas de manutenibilidade (alta acoplamento / baixa coesão) que não se manifestam como falhas visíveis no teste dinâmico.`,
            definitions: [
              {
                term: 'Teste Estático (Static Testing)',
                definition: 'Teste que não envolve a execução do item de teste (inclui revisões e análise estática).',
              },
              {
                term: 'Análise Estática (Static Analysis)',
                definition: 'O processo de avaliar um componente ou sistema baseado em sua forma, estrutura, conteúdo ou documentação, sem executá-lo, geralmente apoiado por ferramentas.',
              },
            ],
            practicalExamples: `- Uma revisão na história de usuário identifica que a regra *"Aplicar desconto para clientes VIP"* não define qual é o percentual de desconto (**defeito de omissão/ambiguidade** encontrado antes de escrever código).
- O ESLint / TypeScript identifica uma função auxiliar exportada que nunca é chamada em nenhum arquivo (**código morto** detectado via análise estática).`,
            qaRoutineExamples: `No refinamento técnico da sprint, o QA revisa os critérios de aceite da história e encontra uma contradição: o requisito A diz que o pedido mínimo é R$ 50 e o requisito B diz que pedidos de R$ 30 têm frete fixo. Corrigir essa frase na reunião leva 2 minutos; corrigir depois de codificado levaria 2 dias.`,
            summary:
              'O teste estático examina artefatos legíveis sem executar o software, localizando defeitos diretamente e precocemente, além de avaliar manutenibilidade e conformidade com padrões.',
            estimatedMinutes: 16,
            orderIndex: 1,
          },
        ],
      },
      {
        code: '3.2',
        slug: '3-2-processo-de-feedback-e-revisao',
        title: '3.2 Processo de Feedback e Revisão',
        kLevelMax: 'K2',
        orderIndex: 2,
        learningObjectives: [
          {
            code: 'FL-3.2.1',
            kLevel: 'K1',
            description: 'Identificar os benefícios do feedback frequente e antecipado das partes interessadas.',
          },
          {
            code: 'FL-3.2.2',
            kLevel: 'K2',
            description: 'Resumir as atividades do processo de revisão.',
          },
          {
            code: 'FL-3.2.3',
            kLevel: 'K1',
            description: 'Lembrar as responsabilidades atribuídas aos principais papéis ao realizar revisões.',
          },
          {
            code: 'FL-3.2.4',
            kLevel: 'K2',
            description: 'Comparar e contrastar os diferentes tipos de revisão.',
          },
          {
            code: 'FL-3.2.5',
            kLevel: 'K1',
            description: 'Lembrar os fatores que contribuem para uma revisão bem-sucedida.',
          },
        ],
        lessons: [
          {
            slug: 'processo-formal-de-revisao-papeis-e-tipos-de-revisao',
            title: 'As 5 Atividades de Revisão, os 6 Papéis e os 4 Tipos de Revisão (ISO/IEC 20246)',
            explanation: `### Atividades do Processo Genérico de Revisão (FL-3.2.2)
De acordo com a norma ISO/IEC 20246 adotada pelo ISTQB, um processo estruturado de revisão compreende 5 atividades:
1. **Planejamento (Planning)**: Definir o escopo, propósito, produto de trabalho a ser revisado, características de qualidade a avaliar, critérios de entrada/saída e selecionar os participantes.
2. **Início da Revisão (Review Initiation)**: Garantir que todos os participantes tenham acesso ao documento, compreendam seu papel e possuam as ferramentas e checklists necessários.
3. **Revisão Individual (Individual Review)**: Cada revisor examina o produto de trabalho individualmente (usando técnicas como ad-hoc, checklist, cenários ou perspectiva) e anota anomalias, recomendações e dúvidas.
4. **Comunicação e Análise (Communication and Analysis)**: As anomalias identificadas são comunicadas e analisadas (em uma reunião de revisão ou via thread eletrônica) para decidir se são defeitos reais, qual sua severidade e quem as corrigirá, além de tomar a decisão sobre o status do artefato (aceito, aceito com modificações ou rejeitado).
5. **Correção e Relatório (Fixing and Reporting)**: O autor cria relatórios de defeitos para as anomalias confirmadas, realiza as correções necessárias e o status final é reportado quando os critérios de saída são atingidos.

### Os 6 Papéis na Revisão (FL-3.2.3)
- **Gerente (Manager)**: Decide o que será revisado e fornece recursos (tempo e pessoal).
- **Autor (Author)**: Cria e corrige o produto de trabalho em revisão.
- **Moderador (Moderator / Facilitador)**: Garante a execução eficaz das reuniões de revisão (mediação, gestão do tempo e ambiente seguro onde o artefato é avaliado, e não o autor).
- **Relator / Escriba (Scribe / Recorder)**: Coleta anomalias dos revisores e registra pontos, decisões e novos defeitos encontrados durante a reunião.
- **Revisor (Reviewer)**: Especialista no assunto que identifica anomalias no produto de trabalho.
- **Líder de Revisão (Review Leader)**: Responsável geral pelo processo de revisão (decide quem participará e organiza quando e onde ocorrerá).

### Os 4 Tipos de Revisão (do menos formal ao mais formal) (FL-3.2.4)
1. **Revisão Informal**: Não segue processo formal definido, não exige reunião nem relatório documentado formal; seu objetivo principal é detectar anomalias rapidamente (ex.: revisão por pares / *buddy check*).
2. **Walkthrough (Acompanhamento)**: Liderado pelo **autor** do artefato. Objetivos: avaliar qualidade, construir confiança, **educar/treinar os participantes**, obter consenso e gerar novas ideias. Revisão individual prévia é opcional.
3. **Revisão Técnica**: Realizada por revisores tecnicamente qualificados e liderada por um **moderador** treinado (não pelo autor). Objetivos: ganhar consenso sobre decisões técnicas, detectar defeitos e avaliar alternativas de arquitetura.
4. **Inspeção**: O tipo mais formal de revisão. Segue o processo completo, exige preparação individual, é liderada por um **moderador** (o autor **não** pode atuar como líder da revisão, relator ou moderador!), coleta métricas para melhoria do processo de desenvolvimento e produz relatórios formais.`,
            definitions: [
              {
                term: 'Anomalia (Anomaly)',
                definition: 'Qualquer condição que se desvie do esperado com base em especificações, normas ou experiência (pode ser confirmada como defeito ou descartada como falso positivo).',
              },
              {
                term: 'Inspeção (Inspection)',
                definition: 'Um tipo formal de revisão que utiliza papéis definidos, preparação individual obrigatória, critérios de entrada/saída e coleta de métricas.',
              },
            ],
            practicalExamples: `- **Walkthrough**: O arquiteto de software reúne a squad por 40 minutos e apresenta na tela o novo diagrama de sequência de checkout para nivelar o conhecimento do time e colher sugestões.
- **Inspeção**: Em um software de dispositivo médico (marca-passo), a especificação de segurança passa por uma Inspeção formal com moderador independente, escriba dedicado, checklists regulatórios da ANVISA/FDA e coleta de métricas de densidade de defeitos por página.`,
            qaRoutineExamples: `Para uma revisão bem-sucedida (**FL-3.2.5**), o QA e a equipe dividem documentos extensos em partes pequenas (para não perder a concentração), definem objetivos claros, mantêm um clima de confiança psicológica (sem culpar o autor) e utilizam checklists objetivos.`,
            summary:
              'As revisões variam da Revisão Informal até a Inspeção rigorosa. Lembre-se: o Walkthrough é conduzido pelo autor e inclui educação da equipe; a Inspeção é liderada por um moderador, proíbe o autor de ser líder/moderador/relator e coleta métricas.',
            estimatedMinutes: 25,
            orderIndex: 1,
          },
        ],
      },
    ],
  },
  {
    number: 4,
    slug: 'analise-e-projeto-de-teste',
    title: 'Análise e Projeto de Teste',
    description:
      'Técnicas Caixa-Preta (Particionamento de Equivalência, Valor Limite de 2 e 3 valores, Tabela de Decisão, Transição de Estado), Caixa-Branca, Baseadas na Experiência e Colaboração (ATDD).',
    introduction:
      'O Capítulo 4 é o capítulo de maior peso na prova oficial CTFL 4.0 (12 questões das 40, ou 30% do exame!) e concentra a maioria das questões práticas de nível cognitivo K3 (Aplicar). Aqui você aprenderá a derivar casos de teste matemáticos e sistemáticos usando técnicas Caixa-Preta, avaliar cobertura Caixa-Branca (Instrução e Ramificação), aplicar técnicas Baseadas na Experiência e construir Histórias de Usuário e Critérios de Aceite.',
    learningObjectivesSummary:
      'Distinguir categorias de técnicas (FL-4.1.1), aplicar EP, BVA, Tabela de Decisão e Transição de Estado em problemas K3 (FL-4.2.1 a FL-4.2.4), explicar cobertura de instrução e branch (FL-4.3.1 a FL-4.3.3), dominar Error Guessing, Exploratório e Checklist (FL-4.4.1 a FL-4.4.3) e aplicar Histórias de Usuário, Critérios de Aceite e ATDD (FL-4.5.1 a FL-4.5.3).',
    examWeightQuestions: 12,
    recommendedOrder: 4,
    topics: [
      {
        code: '4.1',
        slug: '4-1-visao-geral-das-tecnicas-de-teste',
        title: '4.1 Visão Geral das Técnicas de Teste',
        kLevelMax: 'K2',
        orderIndex: 1,
        learningObjectives: [
          {
            code: 'FL-4.1.1',
            kLevel: 'K2',
            description: 'Distinguir técnicas de teste caixa-preta, caixa-branca e baseadas na experiência.',
          },
        ],
        lessons: [
          {
            slug: 'categorias-de-tecnicas-caixa-preta-caixa-branca-e-experiencia',
            title: 'Comparação entre Técnicas Caixa-Preta, Caixa-Branca e Baseadas na Experiência',
            explanation: `As técnicas de teste auxiliam o testador na análise ("o que testar") e no projeto ("como testar"), permitindo criar um conjunto enxuto, porém altamente sistemático e eficaz, de casos de teste. Elas são classificadas em três grandes famílias:

1. **Técnicas de Teste Caixa-Preta (Comportamentais ou Baseadas em Especificação)**:
   - Baseiam-se na análise do comportamento externo especificado do objeto de teste (requisitos, regras de negócio, modelos de estado), **sem referência à estrutura interna ou código**.
   - Os casos de teste são independentes de como o software é implementado: se a implementação mudar mas a regra de negócio permanecer igual, os testes continuam válidos.
2. **Técnicas de Teste Caixa-Branca (Estruturais)**:
   - Baseiam-se na análise da arquitetura interna, projeto detalhado, fluxos de controle e código-fonte do objeto de teste.
   - Os casos de teste dependem diretamente de como o software foi construído.
3. **Técnicas de Teste Baseadas na Experiência**:
   - Aproveitam o conhecimento e a experiência de testadores, desenvolvedores e usuários sobre o domínio de negócio, a tecnologia e os modos típicos de falha do software.
   - São excelentes para complementar técnicas caixa-preta e caixa-branca, encontrando defeitos que especificações formais não previram.`,
            definitions: [
              {
                term: 'Técnica Caixa-Preta',
                definition: 'Técnica de teste baseada em uma análise da especificação de um componente ou sistema sem referência à sua estrutura interna.',
              },
              {
                term: 'Técnica Caixa-Branca',
                definition: 'Técnica de teste baseada exclusivamente na estrutura interna de um componente ou sistema.',
              },
              {
                term: 'Técnica Baseada na Experiência',
                definition: 'Técnica de teste baseada na experiência, conhecimento e intuição do testador quanto a falhas passadas ou prováveis.',
              },
            ],
            practicalExamples: `Ao testar um microserviço de validação de CPF e limite de crédito:
- **Caixa-Preta**: Testar as faixas de renda (até R$ 2.000, de R$ 2.001 a R$ 8.000, acima de R$ 8.000) descritas na especificação funcional.
- **Caixa-Branca**: Verificar se ambos os ramos (\`true\` e \`false\`) do \`if (scoreSerasa < 400 && possuiRestricao)\` foram exercitados pelos testes unitários.
- **Baseada na Experiência**: Inserir CPF com espaços nas pontas, emojis no campo de nome ou enviar duas requisições concorrentes em menos de 50ms.`,
            qaRoutineExamples: `Em projetos reais, um QA sênior nunca usa uma única família isoladamente: começa com Caixa-Preta para garantir cobertura das regras de negócio, verifica Caixa-Branca junto aos devs para identificar ramos órfãos no código e aplica Teste Exploratório (Experiência) para descobrir fluxos inesperados.`,
            summary:
              'Caixa-preta olha para a especificação externa, caixa-branca examina a estrutura interna do código e técnicas baseadas na experiência usam o repertório humano para complementar ambas.',
            estimatedMinutes: 14,
            orderIndex: 1,
          },
        ],
      },
      {
        code: '4.2',
        slug: '4-2-tecnicas-de-teste-caixa-preta',
        title: '4.2 Técnicas de Teste Caixa-Preta',
        kLevelMax: 'K3',
        orderIndex: 2,
        learningObjectives: [
          {
            code: 'FL-4.2.1',
            kLevel: 'K3',
            description: 'Usar Particionamento de Equivalência (EP) para derivar casos de teste.',
          },
          {
            code: 'FL-4.2.2',
            kLevel: 'K3',
            description: 'Usar Análise de Valor Limite (BVA) para derivar casos de teste.',
          },
          {
            code: 'FL-4.2.3',
            kLevel: 'K3',
            description: 'Usar Teste de Tabela de Decisão para derivar casos de teste.',
          },
          {
            code: 'FL-4.2.4',
            kLevel: 'K3',
            description: 'Usar Teste de Transição de Estado para derivar casos de teste.',
          },
        ],
        lessons: [
          {
            slug: 'particionamento-equivalencia-valor-limite-tabela-decisao-transicao-estado',
            title: 'EP, BVA (2 e 3 valores), Tabela de Decisão e Transição de Estado (K3)',
            explanation: `Este é o tópico mais exigido em questões práticas (K3) da certificação CTFL 4.0!

### 1. Particionamento de Equivalência (EP) (FL-4.2.1)
Divide os dados em partições (classes de equivalência) sob a premissa de que todos os valores dentro de uma mesma partição são processados da mesma forma pelo objeto de teste.
- **Partições Válidas**: valores que devem ser aceitos pelo sistema.
- **Partições Inválidas**: valores que devem ser rejeitados ou tratados com mensagem de erro.
- **Cobertura EP**: Número de partições exercitadas dividido pelo total de partições identificadas. Para **100% de cobertura EP**, basta testar **1 valor representativo de cada partição** (válida e inválida).
- **Regra importante sobre partições inválidas**: Em entradas com múltiplos parâmetros, partições inválidas devem ser testadas **individualmente** (combinadas apenas com valores válidos nos demais parâmetros) para evitar o **mascaramento de defeitos (defect masking)**!
- **Critério Each Choice**: Quando há múltiplos parâmetros de entrada, o critério *Each Choice* exige que cada partição de cada parâmetro apareça em pelo menos um caso de teste.

### 2. Análise de Valor Limite (BVA) (FL-4.2.2)
Foca nos limites das partições ordenadas, onde os desenvolvedores mais cometem erros (como trocar \`<\` por \`<=\`). O Syllabus 4.0 cobra duas variações:
- **BVA de 2 valores (2-value BVA)**: Para cada limite, testam-se **2 pontos**: o próprio valor limite e o seu vizinho mais próximo pertencente à partição adjacente.
  - *Exemplo*: Para uma partição inteira válida $[10, 20]$:
    - Limite inferior $10$: testa-se **$9$** e **$10$**.
    - Limite superior $20$: testa-se **$20$** e **$21$**.
    - Total para $[10, 20]$ com BVA de 2 valores: **$\{9, 10, 20, 21\}$** (4 valores).
- **BVA de 3 valores (3-value BVA)**: Para cada limite, testam-se **3 pontos**: o próprio valor limite e **ambos** os vizinhos imediatos (um de cada lado).
  - *Exemplo*: Para a mesma partição $[10, 20]$:
    - Limite inferior $10$: testa-se **$9, 10, 11$**.
    - Limite superior $20$: testa-se **$19, 20, 21$**.
    - Total para $[10, 20]$ com BVA de 3 valores: **$\{9, 10, 11, 19, 20, 21\}$** (6 valores).

### 3. Teste de Tabela de Decisão (FL-4.2.3)
Ideal para regras de negócio complexas com combinações lógicas de condições (causas) que produzem diferentes ações (efeitos).
- Cada coluna da tabela representa uma **regra de decisão** (combinação única de condições).
- Notações padrão: \`T\` (Verdadeiro), \`F\` (Falso), \`–\` (Irrelevante / *Don't care*), \`N/A\` (Inviável), \`X\` (Ação executada).
- Em uma tabela minimizada (colapsada), colunas com os mesmos resultados onde uma condição não afeta a ação são fundidas usando \`–\`, e combinações impossíveis são removidas. **100% de cobertura** exige pelo menos 1 caso de teste por coluna viável.

### 4. Teste de Transição de Estado (FL-4.2.4)
Modela o sistema por seus **estados**, **transições**, **eventos**, **condições de guarda** (\`evento [guarda] / ação\`). O Syllabus v4.0 define três critérios de cobertura:
1. **Cobertura de Todos os Estados (All States)**: Exercitar todos os estados (o critério mais fraco).
2. **Cobertura de Transições Válidas (0-switch coverage)**: Exercitar todas as transições válidas individuais do diagrama/tabela de estados (o critério mais usado).
3. **Cobertura de Todas as Transições (All Transitions)**: Exercitar todas as transições válidas **e também tentar forçar transições inválidas** a partir de cada estado (usando a Tabela de Estados para identificar células vazias/inválidas).`,
            definitions: [
              {
                term: 'BVA de 2 valores',
                definition: 'Para cada valor limite, cobre o limite e o vizinho mais próximo pertencente à partição adjacente.',
              },
              {
                term: 'BVA de 3 valores',
                definition: 'Para cada valor limite, cobre o limite e ambos os seus vizinhos imediatos (interno e externo).',
              },
              {
                term: 'Cobertura 0-switch (Transições Válidas)',
                definition: 'Critério de cobertura de transição de estado que exige exercitar cada transição válida individual pelo menos uma vez.',
              },
            ],
            practicalExamples: `**Problema Clássico de Prova (BVA)**:
Uma regra de negócio concede bônus para funcionários com tempo de casa entre **2 e 5 anos** (inclusive, em anos inteiros):
- Partições: Inválida ($< 2$), Válida ($2..5$), Inválida ($> 5$).
- **EP (100%)**: $\{1, 3, 6\}$ (3 testes).
- **BVA de 2 valores (100%)**: Limite 2 $\rightarrow \{1, 2\}$; Limite 5 $\rightarrow \{5, 6\}$. Conjunto total: **$\{1, 2, 5, 6\}$** (4 testes).
- **BVA de 3 valores (100%)**: Limite 2 $\rightarrow \{1, 2, 3\}$; Limite 5 $\rightarrow \{4, 5, 6\}$. Conjunto total: **$\{1, 2, 3, 4, 5, 6\}$** (6 testes).`,
            qaRoutineExamples: `Ao testar uma máquina de estados de um Pedido no banco de dados (\`CRIADO -> PAGO -> ENVIADO -> ENTREGUE\` ou \`CANCELADO\`), o QA monta a **Tabela de Estados** e testa uma transição inválida (All Transitions): enviar \`POST /pedidos/123/cancelar\` quando o pedido já está no estado \`ENTREGUE\`, garantindo que a API retorne HTTP 422.`,
            summary:
              'EP divide entradas em classes equivalentes; BVA testa as fronteiras com 2 ou 3 valores por limite; Tabela de Decisão organiza combinações de regras lógicas; e Transição de Estado valida estados, transições válidas (0-switch) e transições inválidas.',
            estimatedMinutes: 30,
            orderIndex: 1,
          },
        ],
      },
      {
        code: '4.3',
        slug: '4-3-tecnicas-de-teste-caixa-branca',
        title: '4.3 Técnicas de Teste Caixa-Branca',
        kLevelMax: 'K2',
        orderIndex: 3,
        learningObjectives: [
          {
            code: 'FL-4.3.1',
            kLevel: 'K2',
            description: 'Explicar o teste de instrução (statement testing).',
          },
          {
            code: 'FL-4.3.2',
            kLevel: 'K2',
            description: 'Explicar o teste de ramificação (branch testing).',
          },
          {
            code: 'FL-4.3.3',
            kLevel: 'K2',
            description: 'Explicar o valor do teste caixa-branca.',
          },
        ],
        lessons: [
          {
            slug: 'cobertura-de-instrucao-e-cobertura-de-ramificacao-branch',
            title: 'Teste de Instrução, Teste de Ramificação (Branch) e Subsunção',
            explanation: `### 1. Teste de Instrução e Cobertura de Instrução (FL-4.3.1)
- Os itens de cobertura são as **instruções executáveis (statements)** do código.
- **Cobertura de Instrução**: Número de instruções executadas pelos testes dividido pelo número total de instruções executáveis do código (expresso em %).
- **100% de cobertura de instrução** garante que toda linha executável foi rodada pelo menos uma vez (ajudando a detectar código morto), mas **não** garante que todas as lógicas de decisão foram testadas! Por exemplo, um \`if (condicao)\` sem cláusula \`else\` pode atingir 100% de cobertura de instrução apenas com a condição verdadeira, sem nunca testar o que acontece quando a condição é falsa.

### 2. Teste de Ramificação (Branch Testing) e Cobertura de Ramificação (FL-4.3.2)
- Os itens de cobertura são as **ramificações (branches)** — transferências de controle entre dois nós no grafo de fluxo de controle (incluindo ramos incondicionais e ramos condicionais verdadeiros e falsos de \`if\`, \`switch\`, loops \`while\`/\`for\`).
- **Cobertura de Ramificação**: Número de ramificações exercitadas dividido pelo total de ramificações do código.
- **Relação de Subsunção (Regra de Ouro para a Prova)**:
  - **100% de Cobertura de Ramificação (Branch) SEMPRE garante 100% de Cobertura de Instrução (Statement)**.
  - Porém, **100% de Cobertura de Instrução NÃO garante 100% de Cobertura de Ramificação**!

### 3. Valor do Teste Caixa-Branca (FL-4.3.3)
- Força fundamental: considera **toda a implementação do código**, permitindo detectar defeitos mesmo quando a especificação é vaga, incompleta ou quando existem fluxos extras no código não documentados nos requisitos.
- Fraqueza fundamental: se um requisito foi **esquecido** na codificação (defeito de omissão), 100% de cobertura caixa-branca no código existente não detectará o requisito ausente!`,
            definitions: [
              {
                term: 'Cobertura de Instrução (Statement Coverage)',
                definition: 'Percentual de instruções executáveis no código que foram exercitadas por um conjunto de casos de teste.',
              },
              {
                term: 'Cobertura de Ramificação (Branch Coverage)',
                definition: 'Percentual de ramificações (transferências de controle condicionais e incondicionais) exercitadas pelos casos de teste.',
              },
            ],
            practicalExamples: `Considere o trecho:
\`\`\`ts
function aplicarTaxa(valor: number, isento: boolean) {
  let total = valor;
  if (!isento) {
    total = total + 15;
  }
  return total;
}
\`\`\`
- Com **apenas 1 teste** \`aplicarTaxa(100, false)\`, todas as linhas são executadas: **100% de cobertura de instrução**, mas apenas **50% de cobertura de ramificação** (pois o ramo \`isento === true\` que pula o \`if\` não foi testado).
- Adicionando um **2º teste** \`aplicarTaxa(100, true)\`, atingimos **100% de cobertura de ramificação**.`,
            qaRoutineExamples: `Ao analisar o relatório de cobertura do Vitest/Istanbul no CI, o QA observa que um arquivo tem 100% de *Statements* mas apenas 75% de *Branches*, identificando rapidamente que faltam testes para os ramos de exceção (\`else\` / ternários).`,
            summary:
              '100% de cobertura de ramificação (branch) subsume 100% de cobertura de instrução (statement), mas o inverso não é verdadeiro. O teste caixa-branca avalia todo o código escrito, mas não detecta requisitos omitidos.',
            estimatedMinutes: 18,
            orderIndex: 1,
          },
        ],
      },
      {
        code: '4.4',
        slug: '4-4-tecnicas-baseadas-na-experiencia',
        title: '4.4 Técnicas de Teste Baseadas na Experiência',
        kLevelMax: 'K2',
        orderIndex: 4,
        learningObjectives: [
          {
            code: 'FL-4.4.1',
            kLevel: 'K2',
            description: 'Explicar a suposição de erro (error guessing).',
          },
          {
            code: 'FL-4.4.2',
            kLevel: 'K2',
            description: 'Explicar o teste exploratório.',
          },
          {
            code: 'FL-4.4.3',
            kLevel: 'K2',
            description: 'Explicar o teste baseado em checklist.',
          },
        ],
        lessons: [
          {
            slug: 'error-guessing-teste-exploratorio-e-checklist',
            title: 'Suposição de Erro (Error Guessing), Teste Exploratório e Teste Baseado em Checklist',
            explanation: `### 1. Suposição de Erro (Error Guessing) e Ataques de Falha (FL-4.4.1)
Antecipa a ocorrência de erros, defeitos e falhas com base no conhecimento do testador sobre:
- Como a aplicação funcionou no passado.
- Os tipos de erros que os desenvolvedores costumam cometer (ex.: divisão por zero, referências nulas, falta de sanitização de strings).
- Falhas que ocorreram em aplicações similares.
Uma forma metódica de aplicar a suposição de erro é o uso de **Ataques de Falha (Fault Attacks)**: criar ou usar uma lista de possíveis erros, defeitos e falhas e projetar testes especificamente para expô-los.

### 2. Teste Exploratório (Exploratory Testing) (FL-4.4.2)
No teste exploratório, os testes são **projetados, executados e avaliados simultaneamente** enquanto o testador aprende sobre o objeto de teste.
- É extremamente útil quando há especificações poucas ou inadequadas, ou sob forte pressão de tempo.
- Frequentemente é estruturado por meio de **Testes Baseados em Sessão (Session-Based Testing)** dentro de um bloco de tempo definido (*time-box*, ex.: 60 a 120 minutos), guiado por uma **Carta de Teste (Test Charter)** que define os objetivos da sessão, seguido de um *debriefing*.

### 3. Teste Baseado em Checklist (Checklist-Based Testing) (FL-4.4.3)
O testador projeta, implementa e executa testes para cobrir condições de teste contidas em um **checklist** construído com base na experiência, no que é importante para o usuário ou no entendimento de por que e como o software falha.
- Os itens do checklist devem ser formulados na forma de perguntas verificáveis isoladamente.
- Os checklists devem ser atualizados periodicamente com base em análises de defeitos recentes, mas evitando que fiquem longos demais.`,
            definitions: [
              {
                term: 'Carta de Teste (Test Charter)',
                definition: 'Declaração dos objetivos do teste e possíveis ideias sobre como testar, usada para guiar uma sessão de teste exploratório.',
              },
              {
                term: 'Ataque de Falha (Fault Attack)',
                definition: 'Abordagem metódica de suposição de erro focada em criar uma lista de falhas prováveis e tentar provocá-las no sistema.',
              },
            ],
            practicalExamples: `- **Error Guessing**: Testar upload de arquivo vazio (0 bytes), arquivo de 5GB, nome de arquivo com \`../\` ou extensão dupla \`.pdf.exe\`.
- **Teste Exploratório**: Carta de Teste de 60 minutos: *"Explorar o fluxo de agendamento de exames simultâneos usando duas abas do navegador para descobrir condições de corrida"*.`,
            qaRoutineExamples: `Antes de liberar uma release na sexta-feira, a equipe executa um **Checklist de Prontidão Web** (verificar responsividade mobile, links quebrados, cabeçalhos de segurança HTTP e acessibilidade por teclado \`Tab\`) combinado com uma sessão de **Teste Exploratório** de 45 minutos.`,
            summary:
              'Suposição de erro usa listas de falhas típicas (fault attacks); teste exploratório une aprendizado, projeto e execução simultâneos guiados por cartas de teste; e o teste baseado em checklist oferece consistência sem a rigidez de scripts detalhados.',
            estimatedMinutes: 16,
            orderIndex: 1,
          },
        ],
      },
      {
        code: '4.5',
        slug: '4-5-abordagens-baseadas-em-colaboracao',
        title: '4.5 Abordagens de Teste Baseadas em Colaboração',
        kLevelMax: 'K3',
        orderIndex: 5,
        learningObjectives: [
          {
            code: 'FL-4.5.1',
            kLevel: 'K2',
            description: 'Explicar como escrever histórias de usuário em colaboração com desenvolvedores e representantes de negócio.',
          },
          {
            code: 'FL-4.5.2',
            kLevel: 'K2',
            description: 'Classificar as diferentes opções para escrever critérios de aceite.',
          },
          {
            code: 'FL-4.5.3',
            kLevel: 'K3',
            description: 'Usar o desenvolvimento orientado a testes de aceite (ATDD) para derivar casos de teste.',
          },
        ],
        lessons: [
          {
            slug: 'historias-de-usuario-3cs-invest-criterios-de-aceite-e-atdd',
            title: 'Histórias de Usuário (3 Cs e INVEST), Critérios de Aceite e ATDD (K3)',
            explanation: `Diferente das técnicas de teste focadas em encontrar defeitos, as abordagens baseadas em colaboração focam na **prevenção de defeitos** por meio do alinhamento e entendimento compartilhado entre negócio, desenvolvimento e teste.

### 1. Histórias de Usuário: Os 3 Cs e o Acrônimo INVEST (FL-4.5.1)
Boas histórias de usuário contemplam os **3 Cs**:
- **Card (Cartão)**: Meio físico ou eletrônico que descreve a história (frequentemente no formato: *"Como um [papel], eu quero [objetivo], para que [benefício de negócio]"*).
- **Conversation (Conversa)**: Discussão colaborativa sobre como o software será usado.
- **Confirmation (Confirmação)**: Os **critérios de aceite** que confirmam que o objetivo foi alcançado.

E seguem as 6 características **INVEST**:
- **I**ndependent (Independente)
- **N**egotiable (Negociável)
- **V**aluable (Valiosa)
- **E**stimable (Estimável)
- **S**mall (Pequena)
- **T**estable (Testável)

### 2. Formatos de Critérios de Aceite (FL-4.5.2)
Existem duas formas principais de redigir critérios de aceite:
1. **Orientados a Cenários (Scenario-oriented)**: Usam o formato **Dado / Quando / Então (Given / When / Then)** do BDD, descrevendo pré-condições, ação do ator e resultado observável.
2. **Orientados a Regras (Rule-oriented)**: Listas de verificação (bullet points) de regras de negócio ou mapeamento tabular de entradas e saídas.

### 3. Derivando Casos de Teste com ATDD (FL-4.5.3)
No ATDD, a partir da história de usuário e de seus critérios de aceite, derivam-se:
- **Casos de teste positivos**: Confirmam o comportamento correto sem exceções (caminho feliz e variações válidas).
- **Casos de teste negativos**: Confirmam que o sistema trata adequadamente entradas inválidas, violações de permissão ou pré-condições não atendidas.`,
            definitions: [
              {
                term: 'INVEST',
                definition: 'Critério de qualidade para histórias de usuário: Independent, Negotiable, Valuable, Estimable, Small, Testable.',
              },
              {
                term: 'Critérios de Aceite',
                definition: 'Condições que um produto de trabalho deve satisfazer para ser aceito pelos usuários, clientes ou outras partes interessadas.',
              },
            ],
            practicalExamples: `**História de Usuário**: *"Como estudante da CTFL Academy, quero finalizar meu simulado para consultar minha nota e diagnóstico de aprovação."*
**Critérios de Aceite (Orientados a Regras)**:
- Nota mínima para aprovação: 26 acertos de 40 questões (65%).
- Não permitir alterar respostas após a finalização.
**Casos de Teste ATDD derivados**:
- *CT-01 (Positivo)*: Finalizar prova com 28 acertos dentro do prazo $\rightarrow$ Exibir status \`APROVADO\` (70%).
- *CT-02 (Positivo)*: Finalizar prova com 25 acertos dentro do prazo $\rightarrow$ Exibir status \`REPROVADO\` (62,5%).
- *CT-03 (Negativo)*: Enviar requisição \`POST /answers\` para tentativa já finalizada $\rightarrow$ Retornar erro HTTP 400 e manter nota inalterada.`,
            qaRoutineExamples: `Durante o refinamento, se uma história não for **Testável** (o "T" de INVEST), como *"O sistema deve ser super intuitivo e moderno"*, o QA ajuda o PO a transformá-la em critérios de aceite mensuráveis.`,
            summary:
              'Histórias de usuário unem Card, Conversation e Confirmation com os critérios INVEST. Os critérios de aceite podem ser orientados a cenários (Dado/Quando/Então) ou orientados a regras, servindo de base direta para derivar casos de teste no ATDD.',
            estimatedMinutes: 18,
            orderIndex: 1,
          },
        ],
      },
    ],
  },
  {
    number: 5,
    slug: 'gerenciamento-das-atividades-de-teste',
    title: 'Gerenciamento das Atividades de Teste',
    description:
      'Planejamento, critérios de entrada/saída, estimativa (3 pontos / Planning Poker), priorização de casos de teste, pirâmide e quadrantes de teste, riscos, configuração e defeitos.',
    introduction:
      'O Capítulo 5 responde por 8 questões na prova CTFL 4.0 (20% do exame) e combina conceitos estratégicos de gestão com habilidades práticas K3: cálculo de estimativa de esforço de teste, priorização de casos de teste e elaboração de relatórios de defeito profissionais.',
    learningObjectivesSummary:
      'Compreender plano de teste, critérios de entrada/saída, pirâmide e quadrantes de teste (FL-5.1.1 a FL-5.1.7), calcular estimativas e priorizar testes em questões K3 (FL-5.1.4 e FL-5.1.5), gerenciar riscos de projeto e de produto (FL-5.2.1 a FL-5.2.4), monitorar métricas e relatórios (FL-5.3.1 a FL-5.3.3), apoiar gerência de configuração (FL-5.4.1) e elaborar relatórios de defeitos (FL-5.5.1).',
    examWeightQuestions: 8,
    recommendedOrder: 5,
    topics: [
      {
        code: '5.1',
        slug: '5-1-planejamento-de-teste',
        title: '5.1 Planejamento de Teste',
        kLevelMax: 'K3',
        orderIndex: 1,
        learningObjectives: [
          {
            code: 'FL-5.1.1',
            kLevel: 'K2',
            description: 'Exemplificar o propósito e o conteúdo de um plano de teste.',
          },
          {
            code: 'FL-5.1.2',
            kLevel: 'K1',
            description: 'Reconhecer como um testador agrega valor ao planejamento de iteração e de release.',
          },
          {
            code: 'FL-5.1.3',
            kLevel: 'K2',
            description: 'Comparar e contrastar critérios de entrada e critérios de saída.',
          },
          {
            code: 'FL-5.1.4',
            kLevel: 'K3',
            description: 'Usar técnicas de estimativa para calcular o esforço de teste necessário.',
          },
          {
            code: 'FL-5.1.5',
            kLevel: 'K3',
            description: 'Aplicar priorização de casos de teste.',
          },
          {
            code: 'FL-5.1.6',
            kLevel: 'K1',
            description: 'Lembrar os conceitos da pirâmide de teste.',
          },
          {
            code: 'FL-5.1.7',
            kLevel: 'K2',
            description: 'Resumir os quadrantes de teste e suas relações com níveis e tipos de teste.',
          },
        ],
        lessons: [
          {
            slug: 'planejamento-estimativa-3-pontos-priorizacao-piramide-e-quadrantes',
            title: 'Critérios de Entrada/Saída (DoR/DoD), Estimativa de 3 Pontos, Priorização, Pirâmide e Quadrantes',
            explanation: `### 1. Critérios de Entrada e Critérios de Saída (FL-5.1.3)
- **Critérios de Entrada (Entry Criteria)**: Pré-condições para iniciar uma dada atividade de teste (no Ágil, para uma história de usuário, são chamados de **Definição de Preparado / Definition of Ready - DoR**).
- **Critérios de Saída (Exit Criteria)**: Condições que devem ser atingidas para declarar uma atividade de teste como concluída (no Ágil, são chamados de **Definição de Pronto / Definition of Done - DoD**).

### 2. Técnicas de Estimativa de Esforço de Teste (K3 — FL-5.1.4)
O Syllabus 4.0 apresenta 4 técnicas (duas baseadas em métricas e duas baseadas em especialistas):
1. **Estimativa Baseada em Proporções (Ratios)**: Usa proporções históricas de projetos anteriores (ex.: se historicamente a razão desenvolvimento:teste é 3:2 e o desenvolvimento levará 600 horas, o teste é estimado em 400 horas).
2. **Extrapolação**: Coleta medições logo no início do projeto atual e extrapola o esforço restante usando um modelo matemático.
3. **Wideband Delphi / Planning Poker**: Especialistas fazem estimativas anônimas iterativas e discutem divergências até alcançar consenso.
4. **Estimativa de Três Pontos (Three-Point Estimation)**: Usa três valores estimados pelos especialistas:
   - $a$ = estimativa mais otimista (*optimistic*)
   - $m$ = estimativa mais provável (*most likely*)
   - $b$ = estimativa mais pessimista (*pessimistic*)
   - **Estimativa final esperada ($E$)**:
     $$E = \\frac{a + 4m + b}{6}$$
   - **Erro padrão / Desvio padrão ($SD$)**:
     $$SD = \\frac{b - a}{6}$$
   *(Exemplo: Se $a = 6$, $m = 9$ e $b = 18$ horas, então $E = (6 + 36 + 18) / 6 = 10$ horas e $SD = (18 - 6) / 6 = 2$ horas, resultando no intervalo $10 \\pm 2$ horas, ou seja, entre 8 e 12 horas).*

### 3. Priorização de Casos de Teste (K3 — FL-5.1.5)
Quando os casos de teste e dados já estão especificados, a ordem de execução segue três estratégias principais (sempre respeitando **dependências técnicas/lógicas** entre testes!):
1. **Priorização Baseada em Risco**: Executar primeiro os testes que cobrem os riscos mais críticos.
2. **Priorização Baseada em Cobertura**: Executar primeiro os testes que proporcionam a maior cobertura em menor tempo (na variante *Cobertura Adicional*, cada próximo teste é o que alcança a maior cobertura *nova* ainda não coberta).
3. **Priorização Baseada em Requisitos**: Executar primeiro os testes dos requisitos mais importantes definidos pelas partes interessadas.

### 4. Pirâmide de Teste e Quadrantes de Teste (FL-5.1.6, FL-5.1.7)
- **Pirâmide de Teste (Mike Cohn)**: Base larga com muitos testes de componente/unitários (rápidos e isolados), camada intermediária com testes de integração/serviço/API, e topo estreito com poucos testes E2E/UI (mais lentos e custosos).
- **Quadrantes de Teste (Brian Marick / Crispin & Gregory)**:
  - **Q1** (Voltado à Tecnologia + Apoia a Equipe): Testes de componente e integração de componentes (Automatizados).
  - **Q2** (Voltado ao Negócio + Apoia a Equipe): Testes funcionais, exemplos, histórias de usuário, protótipos (Automatizados e Manuais).
  - **Q3** (Voltado ao Negócio + Critica o Produto): Testes exploratórios, usabilidade, aceite do usuário (Manuais).
  - **Q4** (Voltado à Tecnologia + Critica o Produto): Testes de desempenho, carga, segurança e demais não funcionais (Ferramentas).`,
            definitions: [
              {
                term: 'Definição de Preparado (DoR)',
                definition: 'Critérios de entrada no Ágil que uma história de usuário deve atender antes de entrar na iteração.',
              },
              {
                term: 'Definição de Pronto (DoD)',
                definition: 'Critérios de saída no Ágil que um item deve satisfazer para ser considerado completo e pronto para entrega.',
              },
            ],
            practicalExamples: `**Cálculo K3 de Estimativa de 3 Pontos**:
O time estima a criação da suíte E2E de pagamentos:
- Otimista ($a$) = 10 pessoas-hora
- Mais provável ($m$) = 16 pessoas-hora
- Pessimista ($b$) = 34 pessoas-hora
$$E = \\frac{10 + 4(16) + 34}{6} = \\frac{108}{6} = 18\\text{ horas}$$
$$SD = \\frac{34 - 10}{6} = 4\\text{ horas}$$`,
            qaRoutineExamples: `Se o teste \`CT-03 (Finalizar Pedido)\` depende de \`CT-01 (Criar Conta)\` e \`CT-02 (Adicionar Produto ao Carrinho)\`, mesmo que \`CT-03\` tenha risco mais alto, na execução prática precisamos respeitar a dependência lógica ou preparar o estado via banco/API antes.`,
            summary:
              'Domine a fórmula da Estimativa de 3 Pontos E = (a + 4m + b)/6 e SD = (b - a)/6, as regras de priorização de casos de teste, a estrutura da Pirâmide de Teste e os 4 Quadrantes de Teste.',
            estimatedMinutes: 25,
            orderIndex: 1,
          },
        ],
      },
      {
        code: '5.2',
        slug: '5-2-gerenciamento-de-riscos',
        title: '5.2 Gerenciamento de Riscos',
        kLevelMax: 'K2',
        orderIndex: 2,
        learningObjectives: [
          {
            code: 'FL-5.2.1',
            kLevel: 'K1',
            description: 'Identificar nível de risco usando probabilidade de risco e impacto de risco.',
          },
          {
            code: 'FL-5.2.2',
            kLevel: 'K2',
            description: 'Distinguir entre riscos de projeto e riscos de produto.',
          },
          {
            code: 'FL-5.2.3',
            kLevel: 'K2',
            description: 'Explicar como a análise de riscos de produto pode influenciar a abrangência e o escopo do teste.',
          },
          {
            code: 'FL-5.2.4',
            kLevel: 'K2',
            description: 'Explicar quais medidas podem ser tomadas em resposta aos riscos de produto analisados.',
          },
        ],
        lessons: [
          {
            slug: 'riscos-de-projeto-vs-riscos-de-produto-e-mitigacao',
            title: 'Probabilidade x Impacto, Riscos de Projeto vs. Riscos de Produto e Controle de Riscos',
            explanation: `### 1. Definição e Nível de Risco (FL-5.2.1)
Um **risco** é um evento futuro potencial que, se ocorrer, terá consequências negativas. O **Nível de Risco** é determinado por dois fatores:
- **Probabilidade de Risco (Likelihood)**: a chance de o evento ocorrer (maior que 0% e menor que 100%).
- **Impacto de Risco (Impact / Dano)**: as consequências ou severidade do prejuízo caso o evento se concretize.

### 2. Riscos de Projeto vs. Riscos de Produto (FL-5.2.2)
Esta distinção cai em quase todas as provas CTFL:
- **Riscos de Projeto**: Relacionados à gestão e controle do projeto, podendo afetar o cronograma, orçamento ou escopo:
  - Questões organizacionais (atrasos na entrega de ambientes, conflitos políticos).
  - Questões de pessoas (falta de testadores qualificados, rotatividade da equipe, falta de treinamento).
  - Questões técnicas/fornecedores (atraso na entrega de uma API de terceiro, ambiente de teste indisponível, cortes de orçamento).
- **Riscos de Produto (Riscos de Qualidade)**: Relacionados diretamente às características de qualidade do **objeto de teste** (software):
  - Funcionalidades ausentes ou cálculos errados, tempo de resposta lento sob carga, falhas de segurança/vazamento de dados, experiência de usuário confusa ou perda de integridade no banco de dados.

### 3. Análise e Controle de Riscos de Produto pelo Teste (FL-5.2.3, FL-5.2.4)
O **teste é uma forma de mitigação de risco de produto**! Quanto maior o nível de risco de um item de produto:
- Mais cedo o teste começa;
- Mais rigorosas são as técnicas de teste escolhidas (ex.: BVA de 3 valores e Tabela de Decisão Completa em vez de apenas EP simples);
- Maior o nível de cobertura exigido e maior a independência de quem testa.
As ações possíveis de controle de risco são: **mitigar** (por meio de testes), **transferir** (seguro ou terceirização), **aceitar** o risco ou criar **planos de contingência**.`,
            definitions: [
              {
                term: 'Risco de Projeto',
                definition: 'Um risco que afeta a capacidade do projeto de atingir seus objetivos (prazo, custo, recursos, fornecedores).',
              },
              {
                term: 'Risco de Produto',
                definition: 'Um risco diretamente relacionado à possibilidade de o objeto de teste não satisfazer as necessidades dos usuários ou especificações.',
              },
            ],
            practicalExamples: `- *"O ambiente de homologação não ficará pronto até sexta-feira"* $\rightarrow$ **Risco de Projeto**.
- *"O módulo de autenticação pode permitir escalação de privilégio para administrador"* $\rightarrow$ **Risco de Produto** (mitigado com testes rigorosos de autorização no servidor).`,
            qaRoutineExamples: `Em uma matriz de risco de release, o fluxo de exclusão de conta recebe **Probabilidade Média** e **Impacto Crítico**, exigindo testes de integração automatizados, testes E2E e revisão de código obrigatória como medidas de mitigação.`,
            summary:
              'Nível de risco combina Probabilidade e Impacto. Riscos de projeto afetam cronograma, pessoas e recursos; riscos de produto afetam a qualidade do software e direcionam o rigor, a cobertura e a priorização dos testes.',
            estimatedMinutes: 18,
            orderIndex: 1,
          },
        ],
      },
      {
        code: '5.3',
        slug: '5-3-monitoramento-controle-e-conclusao',
        title: '5.3 Monitoramento, Controle e Conclusão de Teste',
        kLevelMax: 'K2',
        orderIndex: 3,
        learningObjectives: [
          {
            code: 'FL-5.3.1',
            kLevel: 'K1',
            description: 'Lembrar métricas usadas para teste.',
          },
          {
            code: 'FL-5.3.2',
            kLevel: 'K2',
            description: 'Resumir os propósitos, conteúdos e audiências dos relatórios de teste.',
          },
          {
            code: 'FL-5.3.3',
            kLevel: 'K2',
            description: 'Exemplificar como comunicar o status do teste.',
          },
        ],
        lessons: [
          {
            slug: 'metricas-de-teste-relatorios-de-progresso-e-conclusao',
            title: 'Métricas de Teste, Relatórios de Progresso vs. Relatórios de Conclusão',
            explanation: `### 1. Métricas Usadas no Teste (FL-5.3.1)
As métricas são coletadas para mostrar o progresso em relação ao planejado e avaliar a qualidade:
- **Métricas de Progresso do Projeto e de Teste**: Casos de teste planejados vs. executados, aprovados vs. reprovados, tempo gasto vs. estimado.
- **Métricas de Qualidade do Produto e Defeitos**: Densidade de defeitos, defeitos encontrados vs. corrigidos, distribuição por severidade/prioridade.
- **Métricas de Risco e Cobertura**: Percentual de riscos mitigados, cobertura de requisitos e cobertura de código (instrução/ramificação).
- **Métricas de Custo**: Custo do teste, custo da qualidade e custo de correção de defeitos.

### 2. Relatório de Progresso de Teste vs. Relatório de Conclusão de Teste (FL-5.3.2)
- **Relatório de Progresso de Teste (Test Progress Report)**: Emitido regular e periodicamente *durante* as atividades de teste (ex.: diariamente ou a cada sprint) para apoiar o monitoramento e controle contínuo, apontando impedimentos e desvios de cronograma.
- **Relatório de Conclusão de Teste (Test Completion Report)**: Emitido *ao final* de um nível de teste, iteração ou projeto quando os critérios de saída são alcançados. Resume o que foi testado, avalia a qualidade final, lista os **riscos residuais e defeitos conhecidos não corrigidos** e registra lições aprendidas.`,
            definitions: [
              {
                term: 'Relatório de Progresso de Teste',
                definition: 'Relatório produzido em intervalos regulares sobre o andamento das atividades de teste em relação a uma linha de base.',
              },
              {
                term: 'Relatório de Conclusão de Teste',
                definition: 'Relatório resumo produzido quando um marco de conclusão de teste é atingido, consolidando resultados, desvios e riscos residuais.',
              },
            ],
            practicalExamples: `- **Para a Diretoria Executiva**: Um painel sintético de semáforo (Verde/Amarelo/Vermelho) com cobertura de riscos críticos de negócio e bloqueadores de Go-Live.
- **Para o Time Técnico**: Dashboard detalhado com logs de falha do CI, taxa de flakiness e lista de bugs pendentes por componente.`,
            qaRoutineExamples: `Em equipes Ágeis (**FL-5.3.3**), a comunicação do status do teste ocorre de forma mais leve e frequente nas reuniões diárias (*Daily Stand-up*), quadros Kanban, gráficos de *burndown* e dashboards automatizados, enquanto ambientes regulados exigem relatórios formais assinados.`,
            summary:
              'Métricas fundamentam decisões: Relatórios de Progresso apoiam o controle contínuo durante a execução, enquanto o Relatório de Conclusão consolida o resultado final e documenta os riscos residuais.',
            estimatedMinutes: 15,
            orderIndex: 1,
          },
        ],
      },
      {
        code: '5.4',
        slug: '5-4-gerenciamento-de-configuracao',
        title: '5.4 Gerenciamento de Configuração',
        kLevelMax: 'K2',
        orderIndex: 4,
        learningObjectives: [
          {
            code: 'FL-5.4.1',
            kLevel: 'K2',
            description: 'Resumir como o gerenciamento de configuração apoia o teste.',
          },
        ],
        lessons: [
          {
            slug: 'gerenciamento-de-configuracao-baselines-e-reprodutibilidade',
            title: 'Itens de Configuração, Baselines e Reprodutibilidade no Teste',
            explanation: `No teste de software, o **Gerenciamento de Configuração (Configuration Management - CM)** é a disciplina que identifica, controla e rastreia todos os produtos de trabalho (código, planos de teste, casos de teste, scripts automatizados, massas de dados e configurações de ambiente) como **Itens de Configuração (Configuration Items)**.

### Como o Gerenciamento de Configuração apoia o teste? (FL-5.4.1)
1. Todos os itens de teste e artefatos de testware são identificados de forma única, têm sua versão controlada e são rastreados quanto a alterações.
2. Conjunto de itens aprovados compõem uma **Linha de Base (Baseline)**, que só pode ser alterada por um processo formal de controle de mudanças.
3. Permite **reproduzir fielmente** qualquer resultado de teste ou reverter para uma baseline anterior estável caso uma nova release apresente falhas graves em produção.`,
            definitions: [
              {
                term: 'Linha de Base (Baseline)',
                definition: 'Uma especificação ou produto de trabalho que foi formalmente revisado e acordado, que a partir de então serve como base para desenvolvimento futuro e só pode ser alterado por procedimentos formais de controle de mudança.',
              },
            ],
            practicalExamples: `Sem Gerenciamento de Configuração, um QA roda os testes automatizados da branch \`v2.1\` contra o servidor de homologação que está na versão \`v1.9\`, gerando dezenas de falsas falhas. Com CM adequado (Git tags, Docker images imutáveis e migrations versionadas), o pipeline garante que código, banco e suíte de testes pertençam exatamente ao mesmo commit SHA.`,
            qaRoutineExamples: `Ao abrir um bug report, o QA informa o hash exato do commit ou a versão da build (\`v1.4.2-build.88\`) e a versão do schema do banco de dados, permitindo ao desenvolvedor fazer checkout exato daquele estado para reproduzir o problema.`,
            summary:
              'O Gerenciamento de Configuração garante identificação única, versionamento, baselines controladas e rastreabilidade entre o objeto de teste e o testware.',
            estimatedMinutes: 12,
            orderIndex: 1,
          },
        ],
      },
      {
        code: '5.5',
        slug: '5-5-gerenciamento-de-defeitos',
        title: '5.5 Gerenciamento de Defeitos',
        kLevelMax: 'K3',
        orderIndex: 5,
        learningObjectives: [
          {
            code: 'FL-5.5.1',
            kLevel: 'K3',
            description: 'Preparar um relatório de defeito (defect report).',
          },
        ],
        lessons: [
          {
            slug: 'como-elaborar-um-relatorio-de-defeito-completo-k3',
            title: 'Estrutura e Boas Práticas de um Relatório de Defeito (K3)',
            explanation: `Um dos objetivos principais do teste é encontrar defeitos e registrá-los de modo que possam ser compreendidos, reproduzidos e resolvidos com eficiência.

### Elementos Essenciais de um Bom Relatório de Defeito (K3 — FL-5.5.1)
1. **Identificador único** (gerado geralmente pela ferramenta).
2. **Título curto e descritivo** resumindo a anomalia observada.
3. **Data, organização emissora, autor e seu papel**.
4. **Identificação do objeto de teste e do ambiente de teste** (versão do software/build, sistema operacional, navegador, banco de dados).
5. **Contexto do defeito**: qual caso de teste estava sendo executado, fase/nível de teste e **passos claros e mínimos para reprodução**, incluindo dados de entrada utilizados.
6. **Resultado esperado** (com referência à especificação/requisito) e **Resultado atual (observado)**.
7. **Severidade** do defeito (grau de impacto técnico/funcional no sistema) e **Prioridade** de correção (urgência de negócio para corrigir).
8. **Status do defeito** (ex.: Aberto, Em Análise, Resolvido, Reaberto, Fechado, Rejeitado/Duplicado).
9. **Evidências e referências** (logs de erro, capturas de tela, gravações, payloads JSON).

*Atenção para questões K3 na prova*: Ao analisar um relatório de defeito incompleto em uma questão da prova, verifique sempre se faltam a **versão do objeto de teste**, o **ambiente**, os **passos de reprodução** ou a distinção clara entre **resultado esperado vs. resultado obtido**!`,
            definitions: [
              {
                term: 'Severidade (Severity)',
                definition: 'O grau de impacto que um defeito tem no desenvolvimento ou na operação de um componente ou sistema.',
              },
              {
                term: 'Prioridade (Priority)',
                definition: 'O nível de importância (urgência) de negócio atribuído a um item, como um defeito, para determinar a ordem em que deve ser corrigido.',
              },
            ],
            practicalExamples: `- **Alta Severidade + Baixa Prioridade**: O sistema trava completamente se o usuário digitar uma data do ano 2099 em um relatório interno usado apenas no fechamento anual.
- **Baixa Severidade + Alta Prioridade**: O logotipo principal da empresa está com o nome grafado incorretamente na página inicial durante a campanha da Black Friday (não impede nenhuma função técnica, mas exige correção imediata).`,
            qaRoutineExamples: `Antes de submeter o relatório no Jira/GitHub Issues, o QA verifica se o bug não é duplicado, isola o número mínimo de passos necessários para reproduzi-lo e anexa o comando \`cURL\` da chamada que falhou.`,
            summary:
              'Um relatório de defeito eficaz fornece título claro, ambiente e versão da build, passos mínimos de reprodução, resultado esperado vs. obtido, severidade, prioridade e evidências objetivas.',
            estimatedMinutes: 18,
            orderIndex: 1,
          },
        ],
      },
    ],
  },
  {
    number: 6,
    slug: 'ferramentas-de-teste',
    title: 'Ferramentas de Teste',
    description:
      'Classificação das ferramentas de suporte ao teste e os benefícios e riscos reais da automação de testes.',
    introduction:
      'O Capítulo 6 fecha o Syllabus CTFL v4.0.1 (2 questões na prova oficial) apresentando as categorias de ferramentas que apoiam as atividades de teste e analisando com realismo os benefícios e os riscos/armadilhas da automação de testes.',
    learningObjectivesSummary:
      'Explicar como diferentes tipos de ferramentas apoiam o teste (FL-6.1.1) e lembrar os benefícios e riscos da automação de testes (FL-6.2.1).',
    examWeightQuestions: 2,
    recommendedOrder: 6,
    topics: [
      {
        code: '6.1',
        slug: '6-1-suporte-de-ferramentas-para-o-teste',
        title: '6.1 Suporte de Ferramentas para o Teste',
        kLevelMax: 'K2',
        orderIndex: 1,
        learningObjectives: [
          {
            code: 'FL-6.1.1',
            kLevel: 'K2',
            description: 'Explicar como diferentes tipos de ferramentas de teste apoiam o teste.',
          },
        ],
        lessons: [
          {
            slug: 'classificacao-das-ferramentas-de-suporte-ao-teste',
            title: 'Categorias de Ferramentas de Suporte ao Teste',
            explanation: `As ferramentas de teste auxiliam na eficiência, consistência e automação de diversas atividades do processo de teste. O Syllabus 4.0 classifica as ferramentas conforme a atividade que apoiam:

1. **Ferramentas de Gerenciamento**: Aumentam a eficiência do processo gerenciando o SDLC, requisitos, testes, defeitos e configuração.
2. **Ferramentas de Teste Estático**: Apoiam revisões e análise estática de código (linters, verificadores de padrões e métricas de complexidade).
3. **Ferramentas de Projeto e Implementação de Teste**: Facilitam a geração de casos de teste, dados de teste (massa de dados anonimizada/sintética) e procedimentos de teste.
4. **Ferramentas de Execução e Cobertura de Teste**: Executam testes automatizados (ex.: Playwright, Vitest) e medem a cobertura estrutural ou funcional alcançada.
5. **Ferramentas de Teste Não Funcional**: Permitem realizar testes que são inviáveis ou impossíveis de executar manualmente, como testes de carga/estresse (simulando milhares de usuários simultâneos), desempenho e varreduras de segurança.
6. **Ferramentas de DevOps**: Apoiam o pipeline de entrega automatizada (CI/CD), provisionamento de ambientes e monitoramento contínuo.
7. **Ferramentas de Colaboração**: Facilitam a comunicação entre a equipe (chats, wikis, quadros virtuais).
8. **Ferramentas de Virtualização, Contêineres e Escalabilidade**: Permitem provisionar bancos de dados e serviços isolados (ex.: Docker Compose, mocks de APIs).`,
            definitions: [
              {
                term: 'Ferramenta de Execução de Teste',
                definition: 'Ferramenta que executa testes contra um objeto de teste designado e avalia os resultados reais frente aos resultados esperados.',
              },
            ],
            practicalExamples: `Na própria arquitetura do **CTFL Academy**:
- **Vitest e Playwright**: Ferramentas de Execução e Cobertura de Teste.
- **ESLint e TypeScript**: Ferramentas de Teste Estático / Análise Estática.
- **GitHub Actions**: Ferramenta de DevOps / CI.
- **Docker Compose**: Ferramenta de Contêineres para isolamento do ambiente de banco PostgreSQL.`,
            qaRoutineExamples: `Para testar se um endpoint de venda de ingressos suporta 10.000 requisições por segundo, é humanamente impossível usar 10.000 testadores manuais clicando ao mesmo tempo — o QA utiliza uma **ferramenta de teste não funcional** de carga.`,
            summary:
              'As ferramentas apoiam desde o gerenciamento e análise estática até a geração de massa de dados, execução automatizada, CI/CD e testes não funcionais inviáveis manualmente.',
            estimatedMinutes: 14,
            orderIndex: 1,
          },
        ],
      },
      {
        code: '6.2',
        slug: '6-2-beneficios-e-riscos-da-automacao',
        title: '6.2 Benefícios e Riscos da Automação de Testes',
        kLevelMax: 'K1',
        orderIndex: 2,
        learningObjectives: [
          {
            code: 'FL-6.2.1',
            kLevel: 'K1',
            description: 'Lembrar os benefícios e riscos da automação de testes.',
          },
        ],
        lessons: [
          {
            slug: 'beneficios-e-riscos-reais-da-automacao-de-testes',
            title: 'Benefícios Potenciais e Riscos da Automação de Testes',
            explanation: `Simplesmente adquirir ou instalar uma ferramenta não garante o sucesso da automação. Cada nova ferramenta exige esforço para introduzir, manter e treinar a equipe.

### Benefícios Potenciais da Automação de Execução de Testes (FL-6.2.1)
1. **Economia de tempo** pela redução de trabalho manual repetitivo (ex.: reexecutar testes de regressão a cada build).
2. **Prevenção de erros humanos simples** por meio de maior consistência e repetibilidade (os testes são executados sempre na mesma ordem e com a mesma precisão).
3. **Avaliação mais objetiva** (ex.: cálculo exato de cobertura e tempos de resposta em milissegundos).
4. **Acesso mais fácil a informações sobre o teste** e estatísticas para apoiar a gestão.
5. **Redução nos tempos de execução de teste**, proporcionando feedback mais antecipado no pipeline de CI/CD.
6. **Mais tempo para os testadores** projetarem novos testes mais profundos e realizarem testes exploratórios.

### Riscos Potenciais da Automação de Testes (FL-6.2.1)
1. **Expectativas irreais** quanto aos benefícios de uma ferramenta (ex.: achar que a automação substituirá o pensamento crítico humano ou encontrará todos os bugs sozinha).
2. **Estimativas imprecisas** de tempo, custo e esforço necessários para introduzir a ferramenta, manter os scripts de teste e alterar o processo existente.
3. **Usar uma ferramenta de teste quando o teste manual é mais apropriado** (ex.: tentar automatizar avaliação subjetiva de usabilidade ou uma funcionalidade instável que será descartada amanhã).
4. **Confiar demais na ferramenta**, ignorando a necessidade de pensamento crítico humano.
5. **Dependência do fornecedor** da ferramenta (que pode encerrar o negócio, descontinuar a ferramenta ou aumentar preços) ou abandono de um projeto open source pela comunidade.
6. **Incompatibilidade** da ferramenta com a plataforma de desenvolvimento ou arquitetura tecnológica do sistema.
7. **Escolher uma ferramenta inadequada** que não cumpre requisitos regulatórios ou normas de segurança.`,
            definitions: [
              {
                term: 'Manutenção de Automação de Testes',
                definition: 'Esforço contínuo necessário para atualizar scripts de teste, seletores e dados conforme o sistema sob teste evolui.',
              },
            ],
            practicalExamples: `Uma empresa decide automatizar 100% da interface gráfica de um módulo que ainda está em fase de prototipação visual e muda de layout todos os dias. Em duas semanas, o time gasta 80% do tempo consertando seletores quebrados (**risco de usar automação quando o teste manual/exploratório era mais apropriado** e subestimar o esforço de manutenção).`,
            qaRoutineExamples: `Antes de adotar um novo framework de automação na empresa, o QA realiza uma **Prova de Conceito (PoC)** avaliando compatibilidade técnica, curva de aprendizado da equipe, custo de manutenção dos scripts e suporte da comunidade open source.`,
            summary:
              'A automação traz repetibilidade, rapidez no feedback de regressão e redução de erros humanos repetitivos, mas envolve riscos reais como expectativas irreais, alto custo de manutenção de scripts e escolha de ferramentas incompatíveis.',
            estimatedMinutes: 15,
            orderIndex: 1,
          },
        ],
      },
    ],
  },
];
