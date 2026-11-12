import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { t } from '../i18n';

const LINKS = [
  { to: '/', label: t.nav.home },
  { to: '/convert', label: t.nav.convert },
  { to: '/library', label: t.nav.library },
  { to: '/volunteer', label: t.nav.volunteer },
  { to: '/about', label: t.nav.about },
];

/** Main navigation. On small screens the list is behind a "Меню" button. */
export function MainNav() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  // Close the mobile menu after choosing a page.
  useEffect(() => setOpen(false), [pathname]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  return (
    <nav className="main-nav" aria-label={t.a11y.mainNavLabel} onKeyDown={onKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        className="main-nav__toggle"
        aria-expanded={open}
        aria-controls="main-nav-list"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="main-nav__icon" aria-hidden="true" />
        {t.a11y.menuButton}
      </button>
      <ul id="main-nav-list" className={open ? 'main-nav__list is-open' : 'main-nav__list'}>
        {LINKS.map((link) => (
          <li key={link.to}>
            {/* NavLink adds aria-current="page" to the active link automatically. */}
            <NavLink to={link.to} end={link.to === '/'} className="main-nav__link">
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
