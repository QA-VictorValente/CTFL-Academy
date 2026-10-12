import { SeedQuestionItem } from './questions-ch1-3';

export const QUESTIONS_CH4_TO_6: SeedQuestionItem[] = [
  // ==========================================
  // CAPÍTULO 4 — ANÁLISE E PROJETO DE TESTE (15 publicadas)
  // ==========================================
  {
    code: 'Q-CTFL-401',
    topicCode: '4.1',
    learningObjectiveCode: 'FL-4.1.1',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Qual característica distingue fundamentalmente as técnicas de teste Caixa-Preta das técnicas de teste Caixa-Branca?',
    correctOptionLabel: 'B',
    explanation:
      'As técnicas Caixa-Preta derivam casos de teste a partir da especificação do comportamento externo sem referência à estrutura interna, enquanto as técnicas Caixa-Branca derivam testes da estrutura interna e do código do objeto de teste.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.1.1 (Visão Geral das Técnicas de Teste)',
    options: [
      {
        label: 'A',
        content: 'Técnicas caixa-preta só podem ser aplicadas no nível de Teste de Aceite, enquanto caixa-branca só existe no Teste de Sistema.',
        isCorrect: false,
        justification: 'Incorreta. Ambas podem ser usadas em qualquer nível de teste.',
      },
      {
        label: 'B',
        content: 'Técnicas caixa-preta baseiam-se na especificação externa do comportamento sem olhar para o código interno, enquanto técnicas caixa-branca baseiam-se na estrutura interna e código-fonte.',
        isCorrect: true,
        justification: 'Correta. Define com precisão a distinção fundamental entre as duas categorias.',
      },
      {
        label: 'C',
        content: 'Técnicas caixa-preta dependem exclusivamente da intuição sem documentação, enquanto técnicas caixa-branca proíbem o uso de ferramentas.',
        isCorrect: false,
        justification: 'Incorreta. Intuição e conhecimento de falhas passadas caracterizam as técnicas baseadas na experiência.',
      },
      {
        label: 'D',
        content: 'Técnicas caixa-branca detectam facilmente requisitos omitidos que nunca foram implementados no código.',
        isCorrect: false,
        justification: 'Incorreta. O teste caixa-branca avalia apenas o que foi codificado, não detectando requisitos esquecidos.',
      },
    ],
  },
  {
    code: 'Q-CTFL-402',
    equivalenceGroupId: 'EQ-EP-DISCOUNT',
    topicCode: '4.2',
    learningObjectiveCode: 'FL-4.2.1',
    cognitiveLevel: 'K3',
    difficulty: 'MEDIUM',
    statement:
      'Uma plataforma de cursos concede desconto conforme a quantidade inteira de licenças adquiridas em um único pedido (mínimo de 1 e máximo de 100 licenças por pedido): de 1 a 10 licenças = 0% de desconto; de 11 a 50 licenças = 10% de desconto; de 51 a 100 licenças = 20% de desconto. Quantidades menores que 1 ou maiores que 100 são rejeitadas. Utilizando Particionamento de Equivalência (EP), qual conjunto de entradas atinge 100% de cobertura de partições válidas e inválidas com o número mínimo de casos de teste?',
    correctOptionLabel: 'C',
    explanation:
      'Existem 5 partições de equivalência: (1) Inválida <= 0; (2) Válida 1..10; (3) Válida 11..50; (4) Válida 51..100; (5) Inválida >= 101. O conjunto {0, 5, 25, 80, 120} contém exatamente 1 representante para cada uma das 5 partições.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.2.1 (Particionamento de Equivalência)',
    options: [
      {
        label: 'A',
        content: '{1, 10, 11, 50, 51, 100}',
        isCorrect: false,
        justification: 'Incorreta. Não cobre as duas partições inválidas (<= 0 e >= 101) e repete valores nas mesmas partições válidas.',
      },
      {
        label: 'B',
        content: '{5, 25, 80}',
        isCorrect: false,
        justification: 'Incorreta. Cobre apenas as 3 partições válidas, deixando de cobrir as 2 partições inválidas (60% de cobertura total).',
      },
      {
        label: 'C',
        content: '{0, 5, 25, 80, 120}',
        isCorrect: true,
        justification: 'Correta. Cobre 100% das 5 partições: 0 (<=0), 5 (1..10), 25 (11..50), 80 (51..100) e 120 (>=101).',
      },
      {
        label: 'D',
        content: '{-5, 0, 15, 30}',
        isCorrect: false,
        justification: 'Incorreta. Repete as partições <=0 e 11..50 e não cobre as partições 1..10, 51..100 nem >=101.',
      },
    ],
  },
  {
    code: 'Q-CTFL-403',
    topicCode: '4.2',
    learningObjectiveCode: 'FL-4.2.1',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Ao aplicar Particionamento de Equivalência em uma tela de cadastro com múltiplos campos de entrada, por que as partições inválidas devem ser testadas individualmente (combinando apenas uma entrada inválida por vez com valores válidos nos demais campos)?',
    correctOptionLabel: 'A',
    explanation:
      'Se duas partições inválidas forem combinadas no mesmo caso de teste e o sistema parar a validação no primeiro erro encontrado, o tratamento do segundo erro não será exercitado — fenômeno conhecido como mascaramento de defeitos (defect masking).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.2.1 (Particionamento de Equivalência)',
    options: [
      {
        label: 'A',
        content: 'Para evitar o mascaramento de defeitos, caso a falha ou mensagem de erro de uma entrada inválida oculte a falha de outra entrada inválida.',
        isCorrect: true,
        justification: 'Correta. Testar partições inválidas isoladamente evita que o tratamento de um erro impeça a verificação do outro.',
      },
      {
        label: 'B',
        content: 'Porque sistemas modernos aceitam no máximo um parâmetro por requisição HTTP.',
        isCorrect: false,
        justification: 'Incorreta. Requisições HTTP transportam múltiplos parâmetros normalmente.',
      },
      {
        label: 'C',
        content: 'Para garantir 100% de cobertura de ramificação (branch coverage) sem executar o código.',
        isCorrect: false,
        justification: 'Incorreta. EP é uma técnica caixa-preta, não caixa-branca.',
      },
      {
        label: 'D',
        content: 'Porque partições válidas não podem ser combinadas no mesmo caso de teste.',
        isCorrect: false,
        justification: 'Incorreta. Partições válidas de parâmetros diferentes podem e devem ser combinadas (ex.: critério Each Choice).',
      },
    ],
  },
  {
    code: 'Q-CTFL-404',
    equivalenceGroupId: 'EQ-BVA-2VAL',
    topicCode: '4.2',
    learningObjectiveCode: 'FL-4.2.2',
    cognitiveLevel: 'K3',
    difficulty: 'MEDIUM',
    statement:
      'Um campo de formulário aceita a idade inteira de um candidato à habilitação especial somente se estiver no intervalo de 18 a 65 anos (inclusive). Utilizando a Análise de Valor Limite de 2 valores (2-value BVA), qual conjunto de valores de teste atinge 100% de cobertura dos limites dessa faixa válida?',
    correctOptionLabel: 'B',
    explanation:
      'Na BVA de 2 valores, para cada valor limite testam-se o próprio limite e o vizinho mais próximo na partição adjacente: para o limite inferior 18, testam-se 17 e 18; para o limite superior 65, testam-se 65 e 66. Conjunto: {17, 18, 65, 66}.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.2.2 (Análise de Valor Limite)',
    options: [
      {
        label: 'A',
        content: '{17, 18, 19, 64, 65, 66}',
        isCorrect: false,
        justification: 'Incorreta. Este conjunto de 6 elementos corresponde à BVA de 3 valores (3-value BVA), e não à BVA de 2 valores.',
      },
      {
        label: 'B',
        content: '{17, 18, 65, 66}',
        isCorrect: true,
        justification: 'Correta. Testa cada limite (18 e 65) e seu vizinho adjacente imediato (17 e 66), totalizando 4 valores.',
      },
      {
        label: 'C',
        content: '{18, 40, 65}',
        isCorrect: false,
        justification: 'Incorreta. Faltam os vizinhos imediatos nas partições adjacentes (17 e 66).',
      },
      {
        label: 'D',
        content: '{16, 17, 66, 67}',
        isCorrect: false,
        justification: 'Incorreta. Não inclui os próprios limites válidos 18 e 65.',
      },
    ],
  },
  {
    code: 'Q-CTFL-405',
    equivalenceGroupId: 'EQ-BVA-3VAL',
    topicCode: '4.2',
    learningObjectiveCode: 'FL-4.2.2',
    cognitiveLevel: 'K3',
    difficulty: 'HARD',
    statement:
      'Um sistema de refrigeração industrial dispara o modo econômico quando a temperatura inteira configurada (em °C) está entre 10°C e 15°C (inclusive). Valores abaixo de 10°C acionam o modo turbo e valores acima de 15°C acionam o modo ventilação. Utilizando a Análise de Valor Limite de 3 valores (3-value BVA) para os limites da faixa do modo econômico [10, 15], quais valores devem ser testados para atingir 100% de cobertura?',
    correctOptionLabel: 'D',
    explanation:
      'Na BVA de 3 valores, para cada limite testam-se o próprio limite e seus dois vizinhos imediatos (um de cada lado): para o limite 10 -> {9, 10, 11}; para o limite 15 -> {14, 15, 16}. União: {9, 10, 11, 14, 15, 16}.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.2.2 (Análise de Valor Limite de 3 Valores)',
    options: [
      {
        label: 'A',
        content: '{9, 10, 15, 16}',
        isCorrect: false,
        justification: 'Incorreta. Este é o conjunto da BVA de 2 valores (faltam os vizinhos internos 11 e 14).',
      },
      {
        label: 'B',
        content: '{10, 12, 15}',
        isCorrect: false,
        justification: 'Incorreta. Não cobre os vizinhos externos (9 e 16) nem os vizinhos internos (11 e 14).',
      },
      {
        label: 'C',
        content: '{8, 9, 10, 15, 16, 17}',
        isCorrect: false,
        justification: 'Incorreta. Os valores 8 e 17 não são vizinhos imediatos dos limites 10 e 15.',
      },
      {
        label: 'D',
        content: '{9, 10, 11, 14, 15, 16}',
        isCorrect: true,
        justification: 'Correta. Cobre os 3 pontos do limite inferior (9, 10, 11) e os 3 pontos do limite superior (14, 15, 16).',
      },
    ],
  },
  {
    code: 'Q-CTFL-406',
    topicCode: '4.2',
    learningObjectiveCode: 'FL-4.2.3',
    cognitiveLevel: 'K3',
    difficulty: 'HARD',
    statement:
      'Considere a seguinte regra de concessão de empréstimo consignado:\n- Condição C1: Cliente possui margem consignável disponível? (T/F)\n- Condição C2: Cliente possui mais de 12 meses de vínculo empregatício? (T/F)\n- Condição C3: Cliente é correntista VIP do banco? (T/F)\nRegras:\n- Se C1 for Falso, o empréstimo é SEMPRE Negado (independentemente de C2 e C3).\n- Se C1 for Verdadeiro e C2 for Verdadeiro, o empréstimo é Aprovado (se C3=T, com Taxa Reduzida; se C3=F, com Taxa Padrão).\n- Se C1 for Verdadeiro e C2 for Falso, o empréstimo só é Aprovado (com Taxa Padrão) se C3 for Verdadeiro; caso contrário (C3=F), é Negado.\nUm testador já executou os seguintes 3 casos de teste:\nCT1: C1=T, C2=T, C3=T\nCT2: C1=T, C2=F, C3=T\nCT3: C1=F, C2=T, C3=F\nQual combinação adicional abaixo é necessária para testar o cenário em que o cliente possui margem (C1=T), não tem 12 meses de vínculo (C2=F) e tem o empréstimo Negado?',
    correctOptionLabel: 'B',
    explanation:
      'Para testar a regra C1=T, C2=F resultando em Negado, a condição C3 deve ser Falsa (C1=T, C2=F, C3=F).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.2.3 (Teste de Tabela de Decisão)',
    options: [
      {
        label: 'A',
        content: 'C1=F, C2=F, C3=F',
        isCorrect: false,
        justification: 'Incorreta. Nesta combinação C1 é Falso, que já pertence à regra colapsada coberta pelo CT3.',
      },
      {
        label: 'B',
        content: 'C1=T, C2=F, C3=F',
        isCorrect: true,
        justification: 'Correta. Cobre exatamente a coluna pendente onde C1=T, C2=F e C3=F (empréstimo negado por falta de tempo de vínculo e não ser VIP).',
      },
      {
        label: 'C',
        content: 'C1=T, C2=T, C3=T',
        isCorrect: false,
        justification: 'Incorreta. Repete exatamente o CT1 já executado.',
      },
      {
        label: 'D',
        content: 'C1=F, C2=T, C3=T',
        isCorrect: false,
        justification: 'Incorreta. Com C1=F, C2 e C3 são irrelevantes ("-") e a regra já foi coberta pelo CT3.',
      },
    ],
  },
  {
    code: 'Q-CTFL-407',
    topicCode: '4.2',
    learningObjectiveCode: 'FL-4.2.4',
    cognitiveLevel: 'K3',
    difficulty: 'HARD',
    statement:
      'Um carrinho de compras possui os seguintes estados e transições válidas:\n1. VAZIO -> [adicionar item] -> COM_ITENS\n2. COM_ITENS -> [adicionar item] -> COM_ITENS\n3. COM_ITENS -> [remover último item] -> VAZIO\n4. COM_ITENS -> [ir para checkout] -> EM_CHECKOUT\n5. EM_CHECKOUT -> [voltar ao carrinho] -> COM_ITENS\n6. EM_CHECKOUT -> [confirmar pagamento] -> PEDIDO_CONCLUIDO (estado final)\nQual das sequências abaixo representa um único caso de teste que atinge a maior cobertura de transições válidas (0-switch) partindo do estado inicial VAZIO até o estado final PEDIDO_CONCLUIDO?',
    correctOptionLabel: 'C',
    explanation:
      'A sequência VAZIO -> (1) COM_ITENS -> (3) VAZIO -> (1) COM_ITENS -> (2) COM_ITENS -> (4) EM_CHECKOUT -> (5) COM_ITENS -> (4) EM_CHECKOUT -> (6) PEDIDO_CONCLUIDO exercita todas as 6 transições válidas (1, 2, 3, 4, 5 e 6) em um único fluxo contínuo válido!',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.2.4 (Teste de Transição de Estado)',
    options: [
      {
        label: 'A',
        content: 'VAZIO -> COM_ITENS -> EM_CHECKOUT -> PEDIDO_CONCLUIDO (exercita 3 de 6 transições).',
        isCorrect: false,
        justification: 'Incorreta. Deixa de cobrir as transições 2, 3 e 5.',
      },
      {
        label: 'B',
        content: 'VAZIO -> EM_CHECKOUT -> PEDIDO_CONCLUIDO.',
        isCorrect: false,
        justification: 'Incorreta. A transição direta de VAZIO para EM_CHECKOUT é inválida.',
      },
      {
        label: 'C',
        content: 'VAZIO -> COM_ITENS -> VAZIO -> COM_ITENS -> COM_ITENS -> EM_CHECKOUT -> COM_ITENS -> EM_CHECKOUT -> PEDIDO_CONCLUIDO (exercita 6 de 6 transições).',
        isCorrect: true,
        justification: 'Correta. Percorre 100% das 6 transições válidas respeitando todas as regras de origem e destino.',
      },
      {
        label: 'D',
        content: 'VAZIO -> COM_ITENS -> PEDIDO_CONCLUIDO -> EM_CHECKOUT.',
        isCorrect: false,
        justification: 'Incorreta. Contém transições inexistentes e tenta sair do estado final.',
      },
    ],
  },
  {
    code: 'Q-CTFL-408',
    topicCode: '4.2',
    learningObjectiveCode: 'FL-4.2.4',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'No Teste de Transição de Estado, qual critério de cobertura exige que os casos de teste exercitem todas as transições válidas E também tentem forçar transições inválidas (não permitidas) a partir de cada estado?',
    correctOptionLabel: 'D',
    explanation:
      'O critério de Cobertura de Todas as Transições (All Transitions coverage) exige exercitar todas as transições válidas e tentar executar transições inválidas (representadas pelas células nulas/vazias na Tabela de Estados).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.2.4 (Critérios de Cobertura de Transição de Estado)',
    options: [
      {
        label: 'A',
        content: 'Cobertura de Todos os Estados (All States coverage).',
        isCorrect: false,
        justification: 'Incorreta. É o critério mais fraco e exige apenas visitar cada estado ao menos uma vez.',
      },
      {
        label: 'B',
        content: 'Cobertura de Transições Válidas (0-switch coverage).',
        isCorrect: false,
        justification: 'Incorreta. Cobre apenas as transições válidas especificadas no diagrama de estados.',
      },
      {
        label: 'C',
        content: 'Cobertura Each Choice.',
        isCorrect: false,
        justification: 'Incorreta. Each Choice é um critério de Particionamento de Equivalência para múltiplos parâmetros.',
      },
      {
        label: 'D',
        content: 'Cobertura de Todas as Transições (All Transitions coverage).',
        isCorrect: true,
        justification: 'Correta. Exige testar tanto todas as transições válidas quanto as tentativas de transições inválidas.',
      },
    ],
  },
  {
    code: 'Q-CTFL-409',
    topicCode: '4.3',
    learningObjectiveCode: 'FL-4.3.1',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Analise a seguinte função:\n1: function calcularFrete(pesoKg, clientePrime) {\n2:   let frete = pesoKg * 5;\n3:   if (clientePrime === true) {\n4:     frete = 0;\n5:   }\n6:   return frete;\n7: }\nQual é o número mínimo de casos de teste necessário para atingir 100% de Cobertura de Instrução (Statement Coverage) e qual é o número mínimo para atingir 100% de Cobertura de Ramificação (Branch Coverage)?',
    correctOptionLabel: 'B',
    explanation:
      'Com 1 único caso de teste onde clientePrime === true (ex.: calcularFrete(10, true)), as linhas 1, 2, 3, 4 e 6 são executadas, atingindo 100% de Cobertura de Instrução. Porém, para atingir 100% de Cobertura de Ramificação, é preciso também testar o ramo falso do if (clientePrime === false), exigindo no mínimo 2 casos de teste.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seções 4.3.1 e 4.3.2 (Teste de Instrução e Teste de Ramificação)',
    options: [
      {
        label: 'A',
        content: '2 casos de teste para 100% de Instrução e 2 casos de teste para 100% de Ramificação.',
        isCorrect: false,
        justification: 'Incorreta. Como não há bloco else, apenas 1 caso de teste com clientePrime=true já executa todas as instruções.',
      },
      {
        label: 'B',
        content: '1 caso de teste para 100% de Instrução e 2 casos de teste para 100% de Ramificação.',
        isCorrect: true,
        justification: 'Correta. 1 teste (true) executa todas as instruções; 2 testes (true e false) cobrem ambos os ramos da decisão.',
      },
      {
        label: 'C',
        content: '2 casos de teste para 100% de Instrução e 1 caso de teste para 100% de Ramificação.',
        isCorrect: false,
        justification: 'Incorreta. A cobertura de ramificação subsume a cobertura de instrução, nunca exigindo menos testes.',
      },
      {
        label: 'D',
        content: '1 caso de teste para 100% de Instrução e 1 caso de teste para 100% de Ramificação.',
        isCorrect: false,
        justification: 'Incorreta. Um único caso de teste não consegue tomar simultaneamente o ramo verdadeiro e o ramo falso de um if.',
      },
    ],
  },
  {
    code: 'Q-CTFL-410',
    topicCode: '4.3',
    learningObjectiveCode: 'FL-4.3.2',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Qual das seguintes afirmações descreve corretamente a relação entre Cobertura de Instrução e Cobertura de Ramificação (Branch)?',
    correctOptionLabel: 'A',
    explanation:
      'A Cobertura de Ramificação subsume a Cobertura de Instrução: atingir 100% de Cobertura de Ramificação garante 100% de Cobertura de Instrução, mas atingir 100% de Cobertura de Instrução NÃO garante 100% de Cobertura de Ramificação.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.3.2 (Teste de Ramificação e Cobertura de Ramificação)',
    options: [
      {
        label: 'A',
        content: '100% de cobertura de ramificação garante 100% de cobertura de instrução, mas 100% de cobertura de instrução não garante 100% de cobertura de ramificação.',
        isCorrect: true,
        justification: 'Correta. É a relação formal de subsunção definida na seção 4.3.2.',
      },
      {
        label: 'B',
        content: '100% de cobertura de instrução sempre garante 100% de cobertura de ramificação.',
        isCorrect: false,
        justification: 'Incorreta. Um if sem else pode ter 100% de instruções executadas e apenas 50% dos ramos cobertos.',
      },
      {
        label: 'C',
        content: 'Cobertura de instrução e cobertura de ramificação são métricas caixa-preta baseadas em histórias de usuário.',
        isCorrect: false,
        justification: 'Incorreta. Ambas são métricas estruturais caixa-branca.',
      },
      {
        label: 'D',
        content: 'Nenhuma das duas métricas consegue identificar código inalcançável (dead code).',
        isCorrect: false,
        justification: 'Incorreta. Ambas ajudam a identificar trechos que nunca podem ser alcançados.',
      },
    ],
  },
  {
    code: 'Q-CTFL-411',
    topicCode: '4.3',
    learningObjectiveCode: 'FL-4.3.3',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Qual é uma limitação intrínseca das técnicas de teste Caixa-Branca que justifica a necessidade de combiná-las com técnicas Caixa-Preta?',
    correctOptionLabel: 'C',
    explanation:
      'Como o teste caixa-branca baseia-se exclusivamente no código implementado, ele não é capaz de detectar defeitos de omissão (requisitos que estavam na especificação mas não foram codificados).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.3.3 (O Valor do Teste Caixa-Branca)',
    options: [
      {
        label: 'A',
        content: 'Técnicas caixa-branca não podem ser usadas em testes de componente.',
        isCorrect: false,
        justification: 'Incorreta. Testes de componente são o nível onde técnicas caixa-branca são mais amplamente aplicadas.',
      },
      {
        label: 'B',
        content: 'Técnicas caixa-branca ignoram a lógica interna do código.',
        isCorrect: false,
        justification: 'Incorreta. Elas focam justamente na lógica e estrutura interna do código.',
      },
      {
        label: 'C',
        content: 'Se um requisito da especificação foi esquecido e não foi implementado no código, o teste caixa-branca não detectará sua ausência.',
        isCorrect: true,
        justification: 'Correta. Defeitos de omissão de requisitos exigem técnicas caixa-preta baseadas na especificação.',
      },
      {
        label: 'D',
        content: 'Técnicas caixa-branca não conseguem detectar código extra não especificado adicionado pelo desenvolvedor.',
        isCorrect: false,
        justification: 'Incorreta. Detectar código extra oculto na implementação é justamente uma força do teste caixa-branca.',
      },
    ],
  },
  {
    code: 'Q-CTFL-412',
    topicCode: '4.4',
    learningObjectiveCode: 'FL-4.4.1',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Um testador experiente cria uma lista estruturada de falhas comuns em formulários web (como campos em branco, strings com aspas simples SQL, valores negativos em quantidades e duplo clique rápido no botão salvar) e projeta testes especificamente para tentar provocar essas falhas. Qual técnica de teste está sendo aplicada?',
    correctOptionLabel: 'A',
    explanation:
      'A Suposição de Erro (Error Guessing), implementada metodicamente por meio de Ataques de Falha (Fault Attacks), utiliza listas de erros, defeitos e falhas prováveis baseadas na experiência do testador.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.4.1 (Suposição de Erro / Error Guessing)',
    options: [
      {
        label: 'A',
        content: 'Suposição de Erro (Error Guessing) com uso de Ataques de Falha (Fault Attacks).',
        isCorrect: true,
        justification: 'Correta. Descreve exatamente a aplicação metódica da suposição de erro segundo a seção 4.4.1.',
      },
      {
        label: 'B',
        content: 'Teste de Ramificação Estrutural.',
        isCorrect: false,
        justification: 'Incorreta. Não se baseia no grafo de fluxo de controle do código.',
      },
      {
        label: 'C',
        content: 'Inspeção Formal de Requisitos.',
        isCorrect: false,
        justification: 'Incorreta. Trata-se de teste dinâmico baseado na experiência.',
      },
      {
        label: 'D',
        content: 'Estimativa de Três Pontos.',
        isCorrect: false,
        justification: 'Incorreta. Estimativa de três pontos é uma técnica de planejamento de esforço.',
      },
    ],
  },
  {
    code: 'Q-CTFL-413',
    topicCode: '4.4',
    learningObjectiveCode: 'FL-4.4.2',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Quando uma equipe dispõe de pouca documentação formal e tempo restrito, optando por realizar sessões cronometradas (time-boxed) guiadas por Cartas de Teste (Test Charters) nas quais o aprendizado, o projeto e a execução ocorrem simultaneamente, qual técnica está sendo utilizada?',
    correctOptionLabel: 'C',
    explanation:
      'No Teste Exploratório, os testes são projetados, executados e avaliados simultaneamente enquanto o testador aprende sobre o objeto de teste, frequentemente estruturado em sessões baseadas em Cartas de Teste (Session-Based Testing).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.4.2 (Teste Exploratório)',
    options: [
      {
        label: 'A',
        content: 'Teste de Tabela de Decisão Minimizada.',
        isCorrect: false,
        justification: 'Incorreta. Tabela de decisão é uma técnica caixa-preta sistemática que requer regras especificadas previamente.',
      },
      {
        label: 'B',
        content: 'Análise Estática de Fluxo de Dados.',
        isCorrect: false,
        justification: 'Incorreta. Análise estática não executa o sistema.',
      },
      {
        label: 'C',
        content: 'Teste Exploratório (baseado em sessão).',
        isCorrect: true,
        justification: 'Correta. Combina aprendizado, projeto e execução simultâneos sob orientação de uma carta de teste.',
      },
      {
        label: 'D',
        content: 'Teste de Instrução Caixa-Branca.',
        isCorrect: false,
        justification: 'Incorreta. Foca em linhas de código executáveis.',
      },
    ],
  },
  {
    code: 'Q-CTFL-414',
    topicCode: '4.5',
    learningObjectiveCode: 'FL-4.5.1',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Na escrita colaborativa de Histórias de Usuário, o que significam os "3 Cs" e qual é a relação deles com o critério "T" do acrônimo INVEST?',
    correctOptionLabel: 'D',
    explanation:
      'Os 3 Cs são Card (Cartão), Conversation (Conversa) e Confirmation (Confirmação — os critérios de aceite). O "T" de INVEST significa Testable (Testável): se uma história não possui critérios de aceite claros e verificáveis (Confirmation), ela não é testável.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.5.1 (Escrita Colaborativa de Histórias de Usuário)',
    options: [
      {
        label: 'A',
        content: 'Code, Compile, Commit; e o "T" significa Time-boxed.',
        isCorrect: false,
        justification: 'Incorreta. Esses termos referem-se à codificação e não aos conceitos de histórias de usuário.',
      },
      {
        label: 'B',
        content: 'Cost, Calendar, Contract; e o "T" significa Technical.',
        isCorrect: false,
        justification: 'Incorreta. Não corresponde ao modelo de Ron Jeffries / Bill Wake adotado no Syllabus.',
      },
      {
        label: 'C',
        content: 'Component, Class, Coverage; e o "T" significa Transparent.',
        isCorrect: false,
        justification: 'Incorreta. Termos de teste estrutural, não de histórias de usuário.',
      },
      {
        label: 'D',
        content: 'Card, Conversation e Confirmation (critérios de aceite); e o "T" de INVEST significa Testable (Testável).',
        isCorrect: true,
        justification: 'Correta. Descreve com exatidão os 3 Cs e a característica Testable do INVEST.',
      },
    ],
  },
  {
    code: 'Q-CTFL-415',
    topicCode: '4.5',
    learningObjectiveCode: 'FL-4.5.3',
    cognitiveLevel: 'K3',
    difficulty: 'MEDIUM',
    statement:
      'Considere a seguinte História de Usuário de uma biblioteca universitária:\n"Como aluno com matrícula ativa, quero renovar meu empréstimo de livro online, para estender o prazo por mais 7 dias."\nCritérios de Aceite:\n1. A renovação só é permitida se o livro não possuir fila de espera de outro aluno.\n2. O aluno não pode possuir multas em aberto superiores a R$ 10,00.\n3. Cada empréstimo pode ser renovado no máximo 2 vezes consecutivas.\nUtilizando ATDD para derivar casos de teste, qual das opções abaixo representa um caso de teste POSITIVO válido que deve resultar na renovação bem-sucedida?',
    correctOptionLabel: 'A',
    explanation:
      'Um caso de teste positivo no ATDD satisfaz todas as regras dos critérios de aceite: livro sem fila de espera, multa de R$ 5,00 (<= R$ 10,00) e 1ª renovação (<= 2), devendo estender o prazo por 7 dias.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.5.3 (ATDD)',
    options: [
      {
        label: 'A',
        content: 'Aluno ativo solicita a 1ª renovação de um livro sem fila de espera, possuindo R$ 5,00 de multa -> Resultado esperado: Renovação aprovada (+7 dias).',
        isCorrect: true,
        justification: 'Correta. Atende aos três critérios de aceite e valida o comportamento positivo esperado.',
      },
      {
        label: 'B',
        content: 'Aluno ativo solicita a 3ª renovação de um livro sem fila de espera e sem multas -> Resultado esperado: Renovação aprovada.',
        isCorrect: false,
        justification: 'Incorreta. Viola o critério 3 (máximo de 2 renovações), portanto deveria ser rejeitado (teste negativo).',
      },
      {
        label: 'C',
        content: 'Aluno ativo solicita a 1ª renovação de um livro reservado na fila por outro colega -> Resultado esperado: Renovação aprovada.',
        isCorrect: false,
        justification: 'Incorreta. Viola o critério 1 (não pode ter fila de espera).',
      },
      {
        label: 'D',
        content: 'Aluno ativo solicita a 1ª renovação com multa em aberto de R$ 25,00 -> Resultado esperado: Renovação aprovada.',
        isCorrect: false,
        justification: 'Incorreta. Viola o critério 2 (multa máxima de R$ 10,00).',
      },
    ],
  },

  // ==========================================
  // CAPÍTULO 5 — GERENCIAMENTO DAS ATIVIDADES DE TESTE (10 publicadas)
  // ==========================================
  {
    code: 'Q-CTFL-501',
    topicCode: '5.1',
    learningObjectiveCode: 'FL-5.1.3',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'No contexto do desenvolvimento Ágil, como são comumente chamados os Critérios de Entrada (Entry Criteria) para que uma história de usuário possa iniciar na iteração e os Critérios de Saída (Exit Criteria) para que ela seja considerada concluída?',
    correctOptionLabel: 'B',
    explanation:
      'No desenvolvimento Ágil, os critérios de entrada de uma história de usuário são chamados de Definição de Preparado (Definition of Ready - DoR), e os critérios de saída são chamados de Definição de Pronto (Definition of Done - DoD).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 5.1.3 (Critérios de Entrada e Critérios de Saída)',
    options: [
      {
        label: 'A',
        content: 'Critérios de Entrada = DoD (Definition of Done); Critérios de Saída = DoR (Definition of Ready).',
        isCorrect: false,
        justification: 'Incorreta. Inverte os conceitos de DoR e DoD.',
      },
      {
        label: 'B',
        content: 'Critérios de Entrada = DoR (Definition of Ready); Critérios de Saída = DoD (Definition of Done).',
        isCorrect: true,
        justification: 'Correta. DoR define o que é preciso para iniciar; DoD define o que é preciso para concluir.',
      },
      {
        label: 'C',
        content: 'Critérios de Entrada = Retrospectiva; Critérios de Saída = Planning Poker.',
        isCorrect: false,
        justification: 'Incorreta. Retrospectiva é cerimônia de melhoria e Planning Poker é técnica de estimativa.',
      },
      {
        label: 'D',
        content: 'Critérios de Entrada = Baseline; Critérios de Saída = Test Charter.',
        isCorrect: false,
        justification: 'Incorreta. Baseline pertence à gerência de configuração e Test Charter ao teste exploratório.',
      },
    ],
  },
  {
    code: 'Q-CTFL-502',
    equivalenceGroupId: 'EQ-EST-3POINT',
    topicCode: '5.1',
    learningObjectiveCode: 'FL-5.1.4',
    cognitiveLevel: 'K3',
    difficulty: 'MEDIUM',
    statement:
      'Uma equipe utiliza a técnica de Estimativa de Três Pontos (Three-Point Estimation) para calcular o esforço de teste de um novo módulo de faturamento:\n- Estimativa mais otimista (a) = 12 pessoas-hora\n- Estimativa mais provável (m) = 21 pessoas-hora\n- Estimativa mais pessimista (b) = 42 pessoas-hora\nQuais são, respectivamente, o valor da estimativa final esperada (E) e o desvio padrão / erro de medição (SD)?',
    correctOptionLabel: 'C',
    explanation:
      'Aplicando as fórmulas oficiais da Estimativa de Três Pontos:\nE = (a + 4*m + b) / 6 = (12 + 4*21 + 42) / 6 = (12 + 84 + 42) / 6 = 138 / 6 = 23 pessoas-hora.\nSD = (b - a) / 6 = (42 - 12) / 6 = 30 / 6 = 5 pessoas-hora.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 5.1.4 (Técnicas de Estimativa)',
    options: [
      {
        label: 'A',
        content: 'E = 25 pessoas-hora; SD = 5 pessoas-hora.',
        isCorrect: false,
        justification: 'Incorreta. 25 seria a média aritmética simples (12+21+42)/3, ignorando o peso 4 da estimativa mais provável.',
      },
      {
        label: 'B',
        content: 'E = 23 pessoas-hora; SD = 10 pessoas-hora.',
        isCorrect: false,
        justification: 'Incorreta. O desvio padrão é (42 - 12) / 6 = 5, e não 10.',
      },
      {
        label: 'C',
        content: 'E = 23 pessoas-hora; SD = 5 pessoas-hora.',
        isCorrect: true,
        justification: 'Correta. E = (12 + 84 + 42) / 6 = 23h e SD = (42 - 12) / 6 = 5h.',
      },
      {
        label: 'D',
        content: 'E = 21 pessoas-hora; SD = 6 pessoas-hora.',
        isCorrect: false,
        justification: 'Incorreta. Não aplicou a ponderação de três pontos.',
      },
    ],
  },
  {
    code: 'Q-CTFL-503',
    topicCode: '5.1',
    learningObjectiveCode: 'FL-5.1.5',
    cognitiveLevel: 'K3',
    difficulty: 'HARD',
    statement:
      'Quatro casos de teste devem ser executados usando a estratégia de Priorização Baseada em Risco (do risco mais crítico para o menos crítico), respeitando obrigatoriamente as dependências lógicas entre os casos:\n- CT1: Risco Médio (Sem dependências)\n- CT2: Risco Muito Alto (Depende da execução prévia do CT1)\n- CT3: Risco Alto (Depende da execução prévia do CT4)\n- CT4: Risco Baixo (Sem dependências)\nQual é a ordem de execução correta que maximiza a execução antecipada dos maiores riscos sem violar nenhuma dependência?',
    correctOptionLabel: 'A',
    explanation:
      'O maior risco é o CT2 (Muito Alto), mas ele depende do CT1. Logo, executamos CT1 primeiro para destravar imediatamente o CT2 (CT1 -> CT2). Em seguida, o próximo maior risco é o CT3 (Alto), que depende do CT4; logo executamos CT4 -> CT3. Ordem final: CT1 -> CT2 -> CT4 -> CT3.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 5.1.5 (Priorização de Casos de Teste)',
    options: [
      {
        label: 'A',
        content: 'CT1 -> CT2 -> CT4 -> CT3',
        isCorrect: true,
        justification: 'Correta. Respeita as dependências (CT1 antes de CT2; CT4 antes de CT3) e prioriza entregar o risco Muito Alto antes do Alto.',
      },
      {
        label: 'B',
        content: 'CT2 -> CT3 -> CT1 -> CT4',
        isCorrect: false,
        justification: 'Incorreta. Viola as dependências técnicas, pois CT2 exige CT1 e CT3 exige CT4.',
      },
      {
        label: 'C',
        content: 'CT4 -> CT1 -> CT3 -> CT2',
        isCorrect: false,
        justification: 'Incorreta. Atrasa desnecessariamente a execução do caso de maior risco (CT2) para o final.',
      },
      {
        label: 'D',
        content: 'CT1 -> CT4 -> CT2 -> CT3',
        isCorrect: false,
        justification: 'Incorreta. Após executar CT1, o CT2 (Risco Muito Alto) já estava desbloqueado e deveria rodar imediatamente antes de CT4.',
      },
    ],
  },
  {
    code: 'Q-CTFL-504',
    topicCode: '5.1',
    learningObjectiveCode: 'FL-5.1.6',
    cognitiveLevel: 'K1',
    difficulty: 'EASY',
    statement:
      'De acordo com o modelo da Pirâmide de Teste descrito no Syllabus ISTQB CTFL v4.0.1, quais são as características dos testes localizados na camada da base da pirâmide em comparação aos testes do topo?',
    correctOptionLabel: 'D',
    explanation:
      'A camada da base da pirâmide (testes de componente/unitários) possui testes rápidos, isolados, de granularidade fina e em grande quantidade, enquanto o topo (testes E2E/UI) possui poucos testes de alta granularidade e execução mais lenta.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 5.1.6 (Pirâmide de Teste)',
    options: [
      {
        label: 'A',
        content: 'Na base ficam os testes manuais exploratórios lentos, e no topo ficam milhares de testes unitários.',
        isCorrect: false,
        justification: 'Incorreta. Os testes unitários rápidos formam a base da pirâmide.',
      },
      {
        label: 'B',
        content: 'A base contém poucos testes ponta a ponta (E2E) de interface gráfica.',
        isCorrect: false,
        justification: 'Incorreta. Os testes E2E ficam no topo da pirâmide.',
      },
      {
        label: 'C',
        content: 'Todas as camadas da pirâmide possuem exatamente a mesma velocidade de execução e a mesma quantidade de testes.',
        isCorrect: false,
        justification: 'Incorreta. O formato de pirâmide indica volume decrescente e custo/tempo crescente rumo ao topo.',
      },
      {
        label: 'D',
        content: 'A base contém grande quantidade de testes pequenos, rápidos e isolados (como testes de componente), enquanto o topo contém menos testes de ponta a ponta mais lentos.',
        isCorrect: true,
        justification: 'Correta. Sintetiza com perfeição o modelo da Pirâmide de Teste.',
      },
    ],
  },
  {
    code: 'Q-CTFL-505',
    topicCode: '5.1',
    learningObjectiveCode: 'FL-5.1.7',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'No modelo dos Quadrantes de Teste Ágil, em qual quadrante se enquadram os Testes Exploratórios e os Testes de Usabilidade?',
    correctOptionLabel: 'C',
    explanation:
      'O Quadrante Q3 é voltado ao negócio (business-facing) e critica o produto (critique the product), contendo testes exploratórios, testes de usabilidade e testes de aceite do usuário.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 5.1.7 (Quadrantes de Teste)',
    options: [
      {
        label: 'A',
        content: 'Quadrante Q1 (voltado à tecnologia e apoia a equipe).',
        isCorrect: false,
        justification: 'Incorreta. Q1 contém testes de componente e integração de componentes automatizados.',
      },
      {
        label: 'B',
        content: 'Quadrante Q2 (voltado ao negócio e apoia a equipe).',
        isCorrect: false,
        justification: 'Incorreta. Q2 contém testes funcionais de histórias de usuário e protótipos criados para guiar o desenvolvimento.',
      },
      {
        label: 'C',
        content: 'Quadrante Q3 (voltado ao negócio e critica o produto).',
        isCorrect: true,
        justification: 'Correta. Q3 agrupa testes exploratórios, usabilidade e validação com foco em criticar o produto sob a ótica do negócio/usuário.',
      },
      {
        label: 'D',
        content: 'Quadrante Q4 (voltado à tecnologia e critica o produto).',
        isCorrect: false,
        justification: 'Incorreta. Q4 agrupa testes de desempenho, carga, segurança e confiabilidade.',
      },
    ],
  },
  {
    code: 'Q-CTFL-506',
    topicCode: '5.2',
    learningObjectiveCode: 'FL-5.2.2',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    statement:
      'Analise os quatro riscos levantados durante o planejamento de uma release:\nI. Dois analistas de automação sêniores pediram demissão e não há substitutos contratados.\nII. O cálculo de frete pode cobrar valor incorreto para CEPs da região Norte.\nIII. O fornecedor externo atrasará em 3 semanas a liberação do ambiente de homologação.\nIV. O sistema pode permitir que um usuário comum visualize faturas de outro cliente alterando o ID na URL (IDOR).\nQuais itens são Riscos de Projeto e quais são Riscos de Produto, respectivamente?',
    correctOptionLabel: 'B',
    explanation:
      'I (falta de pessoal) e III (atraso de fornecedor/ambiente) afetam o cronograma e recursos do projeto -> Riscos de Projeto. II (cálculo funcional incorreto) e IV (vulnerabilidade de segurança no software) afetam diretamente a qualidade do sistema -> Riscos de Produto.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 5.2.2 (Riscos de Projeto e Riscos de Produto)',
    options: [
      {
        label: 'A',
        content: 'Riscos de Projeto: I e II; Riscos de Produto: III e IV.',
        isCorrect: false,
        justification: 'Incorreta. II é risco funcional de produto e III é risco de atraso de projeto.',
      },
      {
        label: 'B',
        content: 'Riscos de Projeto: I e III; Riscos de Produto: II e IV.',
        isCorrect: true,
        justification: 'Correta. I e III dizem respeito a recursos e fornecedores do projeto; II e IV dizem respeito à qualidade e segurança do software.',
      },
      {
        label: 'C',
        content: 'Riscos de Projeto: II e IV; Riscos de Produto: I e III.',
        isCorrect: false,
        justification: 'Incorreta. Inverte completamente as duas categorias.',
      },
      {
        label: 'D',
        content: 'Todos os itens (I, II, III e IV) são exclusivamente Riscos de Produto.',
        isCorrect: false,
        justification: 'Incorreta. Pessoal e atrasos de entrega de ambiente são riscos clássicos de projeto.',
      },
    ],
  },
  {
    code: 'Q-CTFL-507',
    topicCode: '5.2',
    learningObjectiveCode: 'FL-5.2.3',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Como a análise de riscos de produto influencia diretamente o escopo e a abordagem de teste em um projeto com tempo e recursos limitados?',
    correctOptionLabel: 'A',
    explanation:
      'A análise de riscos de produto é usada para focar o esforço de teste nas áreas onde falhas teriam maior probabilidade e impacto, selecionando técnicas de teste mais rigorosas e priorizando a execução dos testes de maior risco.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 5.2.3 (Análise de Riscos de Produto)',
    options: [
      {
        label: 'A',
        content: 'Direciona maior esforço, cobertura mais rigorosa e priorização antecipada para os itens de maior nível de risco.',
        isCorrect: true,
        justification: 'Correta. A análise de riscos guia a intensidade, as técnicas e a ordem de execução dos testes.',
      },
      {
        label: 'B',
        content: 'Determina que todos os módulos do sistema recebam exatamente a mesma quantidade de casos de teste, independentemente do risco.',
        isCorrect: false,
        justification: 'Incorreta. Distribuir esforço igualmente ignora a análise de riscos.',
      },
      {
        label: 'C',
        content: 'Elimina a necessidade de executar testes nas funcionalidades classificadas com risco alto.',
        isCorrect: false,
        justification: 'Incorreta. Funcionalidades de risco alto são justamente as que exigem mais testes para mitigação.',
      },
      {
        label: 'D',
        content: 'Substitui a execução de testes pela contratação de apólices de seguro empresarial.',
        isCorrect: false,
        justification: 'Incorreta. Transferir risco não substitui a mitigação técnica de riscos de qualidade via testes.',
      },
    ],
  },
  {
    code: 'Q-CTFL-508',
    topicCode: '5.3',
    learningObjectiveCode: 'FL-5.3.2',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Qual relatório é elaborado quando um nível de teste, iteração ou projeto atinge seus critérios de saída, consolidando um resumo das atividades realizadas, a avaliação da qualidade, as lições aprendidas e a lista de riscos residuais e defeitos não resolvidos?',
    correctOptionLabel: 'C',
    explanation:
      'O Relatório de Conclusão de Teste (Test Completion Report) resume um estágio concluído de testes, documentando desvios em relação ao plano, qualidade alcançada e riscos residuais.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 5.3.2 (Relatórios de Teste)',
    options: [
      {
        label: 'A',
        content: 'Carta de Teste Exploratório (Test Charter).',
        isCorrect: false,
        justification: 'Incorreta. Carta de teste é entrada para uma sessão de teste exploratório.',
      },
      {
        label: 'B',
        content: 'Relatório Diário de Progresso de Teste.',
        isCorrect: false,
        justification: 'Incorreta. O relatório de progresso é emitido regularmente durante a execução, não no encerramento.',
      },
      {
        label: 'C',
        content: 'Relatório de Conclusão de Teste (Test Completion Report).',
        isCorrect: true,
        justification: 'Correta. É emitido quando os critérios de saída são atingidos e consolida resultados finais e riscos residuais.',
      },
      {
        label: 'D',
        content: 'Plano de Contingência de Infraestrutura.',
        isCorrect: false,
        justification: 'Incorreta. Não é o relatório de encerramento do processo de teste.',
      },
    ],
  },
  {
    code: 'Q-CTFL-509',
    topicCode: '5.4',
    learningObjectiveCode: 'FL-5.4.1',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Qual é o papel do Gerenciamento de Configuração (Configuration Management) no apoio às atividades de teste?',
    correctOptionLabel: 'D',
    explanation:
      'O Gerenciamento de Configuração assegura que todos os itens de teste e de testware sejam identificados de forma única, tenham versão controlada, componham baselines rastreáveis e permitam reproduzir resultados de teste com fidelidade.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 5.4 (Gerenciamento de Configuração)',
    options: [
      {
        label: 'A',
        content: 'Definir o salário e a avaliação de desempenho anual dos engenheiros de QA.',
        isCorrect: false,
        justification: 'Incorreta. Gestão de RH não faz parte do gerenciamento de configuração.',
      },
      {
        label: 'B',
        content: 'Gerar automaticamente histórias de usuário sem intervenção do Product Owner.',
        isCorrect: false,
        justification: 'Incorreta. Gerenciamento de configuração controla versões e baselines de artefatos.',
      },
      {
        label: 'C',
        content: 'Impedir que qualquer alteração seja feita nos scripts de teste durante todo o ciclo de vida do produto.',
        isCorrect: false,
        justification: 'Incorreta. Ele controla e versiona as mudanças nas baselines, não proíbe a evolução do sistema.',
      },
      {
        label: 'D',
        content: 'Garantir identificação única, controle de versão e baselines reproduzíveis para objetos de teste, scripts e massas de dados.',
        isCorrect: true,
        justification: 'Correta. Reflete exatamente o suporte do Gerenciamento de Configuração descrito na seção 5.4.',
      },
    ],
  },
  {
    code: 'Q-CTFL-510',
    topicCode: '5.5',
    learningObjectiveCode: 'FL-5.5.1',
    cognitiveLevel: 'K3',
    difficulty: 'MEDIUM',
    statement:
      'Um testador abriu o seguinte relatório de defeito:\n"Título: Erro ao finalizar simulado.\nDescrição: Cliquei no botão Finalizar Simulado e deu erro na tela. Corrijam com urgência pois isso atrapalha o usuário."\nPara tornar este relatório de defeito eficaz e alinhado às boas práticas da seção 5.5 do Syllabus CTFL v4.0.1, quais informações essenciais estão FALTANDO?',
    correctOptionLabel: 'A',
    explanation:
      'O relatório carece de identificação da versão/build do objeto de teste e do ambiente (navegador/SO), passos claros para reprodução com os dados utilizados, resultado esperado vs. resultado obtido (mensagem/código de erro real) e classificação objetiva de severidade e prioridade.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 5.5 (Gerenciamento de Defeitos)',
    options: [
      {
        label: 'A',
        content: 'Identificação da versão do sistema e do ambiente de teste, passos detalhados para reprodução, resultado esperado versus resultado real obtido e evidências/logs.',
        isCorrect: true,
        justification: 'Correta. São os campos indispensáveis para que o desenvolvedor compreenda e reproduza a falha.',
      },
      {
        label: 'B',
        content: 'O nome do desenvolvedor culpado pelo erro e a sugestão de punição administrativa.',
        isCorrect: false,
        justification: 'Incorreta. Relatórios de defeitos devem ser objetivos e jamais punitivos.',
      },
      {
        label: 'C',
        content: 'O orçamento total do departamento de TI e o currículo do testador.',
        isCorrect: false,
        justification: 'Incorreta. Informações irrelevantes para diagnóstico e resolução do defeito.',
      },
      {
        label: 'D',
        content: 'A correção completa já codificada em linguagem de máquina pelo próprio testador.',
        isCorrect: false,
        justification: 'Incorreta. Codificar a correção faz parte da depuração pelo desenvolvimento, não do relatório de defeito.',
      },
    ],
  },

  // ==========================================
  // CAPÍTULO 6 — FERRAMENTAS DE TESTE (4 publicadas)
  // ==========================================
  {
    code: 'Q-CTFL-601',
    topicCode: '6.1',
    learningObjectiveCode: 'FL-6.1.1',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Qual categoria de ferramentas de teste permite simular milhares de usuários simultâneos e medir tempos de resposta e consumo de recursos — atividades que seriam inviáveis de realizar manualmente?',
    correctOptionLabel: 'B',
    explanation:
      'As Ferramentas de Teste Não Funcional (como ferramentas de teste de carga, estresse e desempenho) permitem realizar medições e simulações em larga escala que são impraticáveis manualmente.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 6.1 (Suporte de Ferramentas para o Teste)',
    options: [
      {
        label: 'A',
        content: 'Ferramentas de Revisão Estática de Requisitos.',
        isCorrect: false,
        justification: 'Incorreta. Ferramentas de teste estático não executam o sistema nem simulam carga.',
      },
      {
        label: 'B',
        content: 'Ferramentas de Teste Não Funcional (desempenho e carga).',
        isCorrect: true,
        justification: 'Correta. Viabilizam a execução de testes de carga e desempenho impossíveis de reproduzir manualmente.',
      },
      {
        label: 'C',
        content: 'Ferramentas de Quadro Virtual e Chat Colaborativo.',
        isCorrect: false,
        justification: 'Incorreta. São ferramentas de comunicação e colaboração.',
      },
      {
        label: 'D',
        content: 'Editores de Texto Simples.',
        isCorrect: false,
        justification: 'Incorreta. Não realizam testes não funcionais.',
      },
    ],
  },
  {
    code: 'Q-CTFL-602',
    topicCode: '6.1',
    learningObjectiveCode: 'FL-6.1.1',
    cognitiveLevel: 'K2',
    difficulty: 'EASY',
    statement:
      'Em um projeto moderno, o uso de linters (como ESLint) para verificar padrões de código e calcular a complexidade ciclomática sem executar o programa é um exemplo de qual categoria de ferramenta?',
    correctOptionLabel: 'C',
    explanation:
      'Linters e analisadores de código que avaliam o código-fonte sem executá-lo pertencem à categoria de Ferramentas de Teste Estático (Análise Estática).',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 6.1 (Suporte de Ferramentas para o Teste)',
    options: [
      {
        label: 'A',
        content: 'Ferramentas de Execução Dinâmica de Teste.',
        isCorrect: false,
        justification: 'Incorreta. Ferramentas de teste estático não executam o código.',
      },
      {
        label: 'B',
        content: 'Ferramentas de Geração de Massa de Dados.',
        isCorrect: false,
        justification: 'Incorreta. Linters avaliam a estrutura do código, não geram dados de banco.',
      },
      {
        label: 'C',
        content: 'Ferramentas de Teste Estático.',
        isCorrect: true,
        justification: 'Correta. Apoiam o teste estático e a análise estática de código sem execução.',
      },
      {
        label: 'D',
        content: 'Ferramentas de Monitoramento de Produção.',
        isCorrect: false,
        justification: 'Incorreta. Atuam sobre o código-fonte durante o desenvolvimento/CI.',
      },
    ],
  },
  {
    code: 'Q-CTFL-603',
    topicCode: '6.2',
    learningObjectiveCode: 'FL-6.2.1',
    cognitiveLevel: 'K1',
    difficulty: 'EASY',
    statement:
      'Qual das seguintes opções representa um BENEFÍCIO real da automação da execução de testes de acordo com o Syllabus ISTQB CTFL v4.0.1?',
    correctOptionLabel: 'A',
    explanation:
      'A automação de testes proporciona economia de tempo na redução de trabalho manual repetitivo (como testes de regressão), maior consistência/repetibilidade, prevenção de erros humanos simples e feedback mais rápido.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 6.2 (Benefícios e Riscos da Automação de Testes)',
    options: [
      {
        label: 'A',
        content: 'Prevenção de erros humanos simples por meio de maior consistência e repetibilidade na execução de testes repetitivos.',
        isCorrect: true,
        justification: 'Correta. É um dos benefícios diretos listados na seção 6.2.',
      },
      {
        label: 'B',
        content: 'Eliminação completa da necessidade de manutenção dos scripts de teste quando a interface do sistema muda.',
        isCorrect: false,
        justification: 'Incorreta. O esforço contínuo de manutenção dos scripts é justamente um custo/risco que precisa ser gerenciado.',
      },
      {
        label: 'C',
        content: 'Substituição total do pensamento crítico humano na análise de regras de negócio.',
        isCorrect: false,
        justification: 'Incorreta. Confiar demais na ferramenta ignorando o pensamento crítico humano é um risco, não um benefício.',
      },
      {
        label: 'D',
        content: 'Garantia de 100% de ausência de defeitos após a primeira execução automatizada.',
        isCorrect: false,
        justification: 'Incorreta. Viola o primeiro princípio de teste e configura expectativa irreal.',
      },
    ],
  },
  {
    code: 'Q-CTFL-604',
    topicCode: '6.2',
    learningObjectiveCode: 'FL-6.2.1',
    cognitiveLevel: 'K1',
    difficulty: 'EASY',
    statement:
      'Qual das alternativas abaixo descreve um RISCO potencial associado à introdução de uma ferramenta de automação de testes?',
    correctOptionLabel: 'D',
    explanation:
      'Subestimar o tempo, custo e esforço necessários para introduzir a ferramenta, treinar a equipe e manter os scripts de teste (além de criar expectativas irreais quanto aos benefícios da ferramenta) são riscos clássicos documentados na seção 6.2.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 6.2 (Benefícios e Riscos da Automação de Testes)',
    options: [
      {
        label: 'A',
        content: 'Redução do tempo de execução dos testes de regressão no pipeline de CI/CD.',
        isCorrect: false,
        justification: 'Incorreta. Isso é um benefício da automação, não um risco.',
      },
      {
        label: 'B',
        content: 'Maior consistência e repetibilidade na execução dos casos de teste.',
        isCorrect: false,
        justification: 'Incorreta. Também é um benefício da automação.',
      },
      {
        label: 'C',
        content: 'Liberação de tempo dos testadores para projetar testes mais profundos e exploratórios.',
        isCorrect: false,
        justification: 'Incorreta. É um benefício direto da redução do trabalho manual repetitivo.',
      },
      {
        label: 'D',
        content: 'Expectativas irreais sobre a ferramenta e estimativas imprecisas do esforço contínuo necessário para manter os scripts de teste.',
        isCorrect: true,
        justification: 'Correta. São os dois primeiros riscos potenciais destacados na seção 6.2 do Syllabus.',
      },
    ],
  },

  // ==========================================
  // QUESTÕES EM FILA EDITORIAL (IN_REVIEW e DRAFT) PARA CURADORIA ADMIN
  // ==========================================
  {
    code: 'Q-CTFL-901',
    topicCode: '1.5',
    learningObjectiveCode: 'FL-1.5.2',
    cognitiveLevel: 'K1',
    difficulty: 'EASY',
    status: 'IN_REVIEW',
    statement:
      'De acordo com a abordagem Whole Team (Equipe Unificada), quem detém a responsabilidade pela qualidade do software dentro de uma equipe Ágil?',
    correctOptionLabel: 'B',
    explanation:
      'Na abordagem Whole Team, todos os membros da equipe multifuncional compartilham a responsabilidade pela qualidade e qualquer membro com as competências necessárias pode realizar tarefas de teste.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 1.5.2 (Abordagem Whole Team)',
    options: [
      {
        label: 'A',
        content: 'Exclusivamente o líder de QA externo à equipe.',
        isCorrect: false,
        justification: 'Incorreta. Contraria diretamente o conceito de equipe unificada.',
      },
      {
        label: 'B',
        content: 'Todos os membros da equipe compartilham coletivamente a responsabilidade pela qualidade.',
        isCorrect: true,
        justification: 'Correta. É a definição central da abordagem Whole Team.',
      },
      {
        label: 'C',
        content: 'Apenas o Product Owner após a entrega em produção.',
        isCorrect: false,
        justification: 'Incorreta. Desenvolvedores, QAs e representantes de negócio compartilham a qualidade durante todo o ciclo.',
      },
      {
        label: 'D',
        content: 'O departamento jurídico da organização.',
        isCorrect: false,
        justification: 'Incorreta. Não reflete a abordagem Whole Team.',
      },
    ],
  },
  {
    code: 'Q-CTFL-902',
    topicCode: '4.4',
    learningObjectiveCode: 'FL-4.4.3',
    cognitiveLevel: 'K2',
    difficulty: 'MEDIUM',
    status: 'DRAFT',
    statement:
      'Ao elaborar e manter um checklist para Teste Baseado em Checklist (seção 4.4.3), qual cuidado deve ser tomado pela equipe de qualidade?',
    correctOptionLabel: 'C',
    explanation:
      'As entradas do checklist devem ser formuladas como perguntas verificáveis individualmente e o checklist deve ser atualizado regularmente com base na análise de novos defeitos, evitando porém que fique longo demais.',
    referenceSection: 'Syllabus CTFL v4.0.1 - Seção 4.4.3 (Teste Baseado em Checklist)',
    options: [
      {
        label: 'A',
        content: 'Nunca alterar um checklist após sua criação inicial.',
        isCorrect: false,
        justification: 'Incorreta. Checklists precisam evoluir conforme novas falhas e aprendizados surgem.',
      },
      {
        label: 'B',
        content: 'Escrever passos procedurais de clique linha por linha em vez de condições de verificação.',
        isCorrect: false,
        justification: 'Incorreta. Checklists definem "o que verificar", mantendo flexibilidade em "como verificar".',
      },
      {
        label: 'C',
        content: 'Formular itens verificáveis individualmente e atualizar a lista periodicamente com base em análises de defeitos, sem deixá-la excessivamente longa.',
        isCorrect: true,
        justification: 'Correta. Segue exatamente as recomendações da seção 4.4.3.',
      },
      {
        label: 'D',
        content: 'Restringir o checklist apenas a itens de teste caixa-branca.',
        isCorrect: false,
        justification: 'Incorreta. Checklists podem cobrir características funcionais e não funcionais diversas.',
      },
    ],
  },
];
