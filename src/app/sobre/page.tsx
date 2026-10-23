import Link from 'next/link';
import {
  BookOpen,
  Award,
  Layers,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SobrePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <PublicHeader />

      <main className="flex-1 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="space-y-4">
            <Badge variant="default">Apresentação da Plataforma</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Sobre o CTFL Academy
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              O <strong>CTFL Academy</strong> é uma plataforma educacional e
              técnica construída sob medida para estudantes e profissionais de
              Qualidade de Software (QA), Engenharia de Testes e Desenvolvimento
              que buscam a certificação{' '}
              <strong>ISTQB® Certified Tester Foundation Level (CTFL)</strong>{' '}
              em sua versão <strong>4.0.1</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Fidelidade ao Syllabus 4.0.1
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Cada capítulo, tópico e objetivo de aprendizagem (FL-1.1.1 até
                  FL-6.2.1) segue rigorosamente a estrutura oficial do ISTQB/BSTQB,
                  diferenciando os níveis cognitivos K1 (Lembrar), K2
                  (Compreender) e K3 (Aplicar).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layers className="h-5 w-5 text-teal-700 dark:text-teal-400" />
                  Simulados Determinísticos sem IA
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  O gerador de simulados utiliza regras determinísticas,
                  selecionando questões aprovadas e publicadas pela curadoria
                  editorial, respeitando os pesos oficiais de cada capítulo e
                  priorizando questões inéditas para o estudante.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                  Aprendizagem Baseada em Evidências
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Combinamos aulas estruturadas, exemplos reais de QA (APIs,
                  bancos de dados, pipelines CI/CD), exercícios de fixação,
                  flashcards com repetição espaçada e caderno inteligente de
                  revisão de erros.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="h-5 w-5 text-sky-700 dark:text-sky-400" />
                  Privacidade e Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Não expomos rankings públicos nem dados pessoais de estudantes.
                  O progresso é individual, persistido em banco de dados
                  PostgreSQL com controle de acesso rigoroso no servidor e opção
                  de exclusão segura de conta.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-2xl border border-primary/25 bg-secondary/60 p-8 text-center space-y-4">
            <h2 className="text-xl font-bold">
              Pronto para iniciar sua preparação estruturada?
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Crie sua conta gratuitamente e acesse os 6 capítulos completos,
              flashcards e simulados oficiais.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Link href="/cadastro">
                <Button>
                  Criar Conta de Estudante
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Já tenho conta</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
