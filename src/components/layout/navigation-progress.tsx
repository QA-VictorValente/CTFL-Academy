'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = React.useState(false);

  // Sempre que a rota ou query string termina de atualizar, encerra o estado de carregamento
  React.useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Intercepta cliques em links internos (<a href="/...">) para feedback visual instantâneo
  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const targetAttr = anchor.getAttribute('target');
      if (
        !href ||
        targetAttr === '_blank' ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        anchor.hasAttribute('download')
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;

        // Se for apenas uma âncora na mesma página (ex.: /#simulados estando em /), não ativa loader de página
        const currentUrl = new URL(window.location.href);
        if (
          url.pathname === currentUrl.pathname &&
          url.search === currentUrl.search
        ) {
          return;
        }

        setIsNavigating(true);
      } catch {
        // Ignora URLs malformadas
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  // Timeout de segurança caso uma navegação seja cancelada
  React.useEffect(() => {
    if (!isNavigating) return;
    const timer = setTimeout(() => setIsNavigating(false), 8000);
    return () => clearTimeout(timer);
  }, [isNavigating]);

  if (!isNavigating) return null;

  return (
    <>
      {/* Barra superior contínua no tema Indigo/Violet */}
      <div
        role="progressbar"
        aria-label="Carregando página"
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-indigo-500/15"
      >
        <div className="h-full w-2/3 animate-pulse rounded-r-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
      </div>

      {/* Pílula discreta e elegante no topo central */}
      <div className="pointer-events-none fixed left-1/2 top-3.5 z-[100] -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-150">
        <div className="flex items-center gap-2 rounded-full border border-indigo-500/40 bg-card/95 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-lg shadow-indigo-500/15 backdrop-blur-md">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
          <span>Carregando...</span>
        </div>
      </div>
    </>
  );
}

export function NavigationProgress() {
  return (
    <React.Suspense fallback={null}>
      <NavigationProgressInner />
    </React.Suspense>
  );
}
