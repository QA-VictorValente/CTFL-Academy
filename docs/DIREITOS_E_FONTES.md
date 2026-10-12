# Política de Fontes, Referências e Direitos de Uso do Conteúdo

## 1. Referência Curricular Oficial

A estrutura de capítulos, a numeração dos tópicos (`1.1` a `6.2`), os códigos de Objetivos de Aprendizagem (`FL-1.1.1` a `FL-6.2.1`), os níveis cognitivos (`K1`, `K2`, `K3`) e os pesos da matriz de exame seguem como referência documental o **Syllabus Oficial ISTQB® Certified Tester Foundation Level (CTFL) v4.0.1** (disponibilizado pelo ISTQB® e pelo BSTQB no Brasil).

## 2. Originalidade e Rastreabilidade do Conteúdo

- **Textos Didáticos e Exemplos**: Todo o material explicativo das 22 aulas, exemplos práticos de engenharia de software e aplicações na rotina de QA foram redigidos de forma **100% original e autoral em português brasileiro** (`prisma/fixtures/syllabus-content.ts`).
- **Banco de Questões e Flashcards**: As 55 questões (`prisma/fixtures/questions-ch1-3.ts` e `prisma/fixtures/questions-ch4-6.ts`) e os 20 flashcards (`prisma/fixtures/flashcards-achievements.ts`) incluídos no seed padrão são **autorais (`sourceType: AUTHORIAL`, `isOfficialSample: false`)**, elaborados especificamente para treinar os objetivos de aprendizagem do Syllabus sem reproduzir cópias não autorizadas de exames proprietários.
- **Rastreabilidade no Banco de Dados**: Toda questão possui vínculo obrigatório com `QuestionSource` (`name`, `sourceType`, `referenceDocument`, `licenseNotes`) e `referenceSection`, permitindo distinguir claramente itens autorais de eventuais questões oficiais de exemplo ou adaptações cadastradas pelo administrador.
