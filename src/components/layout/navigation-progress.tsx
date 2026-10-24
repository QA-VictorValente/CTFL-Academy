'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isFading, setIsFading] = React.useState(false);

  // Monitora alterações de rota para concluir a barra com precisão
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isVisible) {
      setProgress(100);
      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      }, 150);

      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        setIsNavigating(false);
        setIsFading(false);
        setProgress(0);
      }, 350);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [pathname, searchParams, isVisible]);

  // Avanço dinâmico e fluido enquanto a navegação ocorre
  React.useEffect(() => {
    if (!isNavigating) return;

    setIsVisible(true);
    setIsFading(false);
    setProgress(18);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 50) return prev + 12;
        if (prev < 75) return prev + 6;
        if (prev < 92) return prev + 2;
        return 94;
      });
    }, 180);

    return () => clearInterval(interval);
  }, [isNavigating]);

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
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsNavigating(false);
        setIsFading(false);
        setProgress(0);
      }, 200);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isNavigating]);

  if (!isVisible) return null;

  return (
    <>
      {/* Barra de alta precisão no topo em gradiente Teal/Esmeralda com micro-shimmer */}
      <div
        role="progressbar"
        aria-label="Carregando página"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-transparent transition-opacity duration-200 ease-out ${
          isFading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          className="nav-precision-progress relative h-full rounded-r-full transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%` }}
        >
          {/* Micro-shimmer tecnológico que desliza pela barra */}
          <div className="pointer-events-none absolute inset-0 w-1/3 bg-white/20 animate-tech-shimmer motion-reduce:hidden" />
          {/* Micro-glow sutil de precisão na ponta da barra */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-2 bg-emerald-200/80 blur-[1px] motion-reduce:hidden" />
        </div>
      </div>

      {/* Pílula discreta de telemetria se a navegação demorar mais de 300ms */}
      {progress > 40 && (
        <div className="pointer-events-none fixed left-1/2 top-3.5 z-[100] -translate-x-1/2 animate-screen-enter">
          <div className="flex items-center gap-2 rounded-full bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground ring-1 ring-border/80">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
            <span>Navegando...</span>
          </div>
        </div>
      )}
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
