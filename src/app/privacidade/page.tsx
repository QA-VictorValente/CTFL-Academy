import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacidadePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-3">
            <Badge variant="default">Conformidade & Privacidade</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Política de Privacidade
            </h1>
            <p className="text-sm text-muted-foreground">
              Última atualização: Outubro de 2026
            </p>
          </div>

          <Card>
            <CardContent className="p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-foreground">
                  1. Dados Coletados
                </h2>
                <p>
                  O CTFL Academy coleta apenas as informações estritamente
                  necessárias para o funcionamento da plataforma de estudos: nome
                  de exibição, endereço de e-mail, credenciais de autenticação
                  protegidas por hash criptográfico, preferências de estudo e
                  histórico de atividades acadêmicas (aulas estudadas, simulados,
                  flashcards e conquistas).
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-foreground">
                  2. Finalidade e Uso dos Dados
                </h2>
                <p>
                  Seus dados são utilizados exclusivamente para calcular seu
                  progresso individual nos capítulos do Syllabus CTFL v4.0.1,
                  priorizar questões inéditas em simulados, agendar revisões de
                  flashcards e gerar recomendações personalizadas de revisão de
                  conteúdo.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-foreground">
                  3. Ausência de Rankings Públicos e Compartilhamento
                </h2>
                <p>
                  O CTFL Academy não exibe rankings públicos nem compartilha
                  dados pessoais de estudantes com terceiros ou serviços externos
                  de inteligência artificial.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-foreground">
                  4. Exclusão Segura de Conta
                </h2>
                <p>
                  A qualquer momento, o estudante pode solicitar a exclusão
                  definitiva de sua conta diretamente na página de{' '}
                  <strong>Perfil e Preferências</strong>, mediante confirmação
                  explícita. Todos os dados pessoais, sessões e históricos
                  associados ao perfil são removidos ou anonimizados com
                  segurança.
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
