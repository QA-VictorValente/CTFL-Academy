import * as React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/50 py-12 text-sm text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5 text-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-base font-bold">CTFL Academy</span>
            </div>
            <p className="max-w-md text-xs leading-relaxed">
              Plataforma completa de preparação técnica para a certificação
              ISTQB® Certified Tester Foundation Level (CTFL) baseada no
              Syllabus v4.0.1. Conteúdo didático original, banco de questões
              auditado, repetição espaçada e simulados cronometrados.
            </p>
            <p className="text-[11px] opacity-80">
              ISTQB® é uma marca registrada do International Software Testing
              Qualifications Board. Este sistema utiliza o Syllabus v4.0.1 como
              referência educacional com conteúdo didático autoral em português
              brasileiro.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Plataforma
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/sobre" className="hover:text-foreground transition">
                  Apresentação da Plataforma
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition">
                  Acessar Conta
                </Link>
              </li>
              <li>
                <Link
                  href="/cadastro"
                  className="hover:text-foreground transition"
                >
                  Criar Conta de Estudante
                </Link>
              </li>
              <li>
                <Link
                  href="/recuperar-senha"
                  className="hover:text-foreground transition"
                >
                  Recuperação de Acesso
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Legal & Conformidade
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/privacidade"
                  className="hover:text-foreground transition"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/termos"
                  className="hover:text-foreground transition"
                >
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} CTFL Academy. Todos os direitos reservados.</p>
          <p>Engenharia de Qualidade de Software • Syllabus CTFL v4.0.1</p>
        </div>
      </div>
    </footer>
  );
}
