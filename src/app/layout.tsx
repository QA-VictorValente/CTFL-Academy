import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/providers/toast-provider';

export const metadata: Metadata = {
  title: {
    default: 'CTFL Academy — Preparação Completa ISTQB CTFL 4.0.1',
    template: '%s | CTFL Academy',
  },
  description:
    'Plataforma completa de estudos, exercícios, flashcards com repetição espaçada e simulados oficiais cronometrados para a certificação ISTQB Certified Tester Foundation Level (CTFL) v4.0.1.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
