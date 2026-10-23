import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function TermosPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <PublicHeader />

      <main className="flex-1 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-3">
            <Badge variant="default">Termos & Condições</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Termos de Uso
            </h1>
            <p className="text-sm text-muted-foreground">
              Última atualização: Outubro de 2026
            </p>
          </div>

          <Card>
            <CardContent className="p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-foreground">
                  1. Objeto da Plataforma
                </h2>
                <p>
                  O CTFL Academy é uma plataforma educacional destinada ao estudo
                  e preparação para a certificação ISTQB® Certified Tester
                  Foundation Level (CTFL) baseada no Syllabus v4.0.1.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-foreground">
                  2. Propriedade Intelectual e Referências ao Syllabus
                </h2>
                <p>
                  ISTQB® é marca registrada do International Software Testing
                  Qualifications Board. Os capítulos e códigos de Objetivos de
                  Aprendizagem seguem a organização pública do Syllabus v4.0.1.
                  As explicações didáticas, exemplos práticos de rotina de QA,
                  flashcards e questões cadastradas como autorais pertencem ao
                  acervo didático do CTFL Academy, respeitando integralmente os
                  direitos autorais e a indicação explícita de fonte em cada item.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-foreground">
                  3. Responsabilidades do Usuário
                </h2>
                <p>
                  O usuário compromete-se a manter a confidencialidade de suas
                  credenciais de acesso e a utilizar a plataforma de boa-fé, sem
                  tentar contornar mecanismos de segurança, limites de requisição
                  ou controles de tempo de simulado.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
