import { useEffect, type ReactNode } from 'react';
import { t } from '../i18n';

interface PageProps {
  title: string;
  /** Set on the home page, where the browser tab shows only the site name. */
  isHome?: boolean;
  children?: ReactNode;
}

/** Common page frame: sets the browser tab title and renders the one <h1>. */
export function Page({ title, isHome = false, children }: PageProps) {
  useEffect(() => {
    document.title = isHome ? t.site.name : `${title} – ${t.site.name}`;
  }, [title, isHome]);

  return (
    <>
      {/* tabIndex -1 lets Layout move focus here after navigation. */}
      <h1 tabIndex={-1}>{title}</h1>
      {children}
    </>
  );
}
