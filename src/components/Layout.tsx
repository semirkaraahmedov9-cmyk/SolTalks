import { useEffect, useRef, type MouseEvent } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { t } from '../i18n';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

export function Layout() {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  // In a single-page app the browser does not announce page changes, so after
  // navigation we move focus to the new page's heading. Screen readers then
  // read the new title, and keyboard users start at the top of the content.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    document.querySelector<HTMLElement>('#main h1')?.focus();
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main" onClick={focusMain}>
        {t.a11y.skipToContent}
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="site-main">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

// With HashRouter, "#main" would be treated as a route, so focus it by hand.
function focusMain(event: MouseEvent) {
  event.preventDefault();
  document.getElementById('main')?.focus();
}
