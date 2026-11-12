import { Link } from 'react-router-dom';
import { t } from '../i18n';
import { publicUrl } from '../utils/publicUrl';
import { DisplayToggles } from './DisplayToggles';
import { MainNav } from './MainNav';

export function SiteHeader() {
  return (
    <header className="site-header on-dark">
      <DisplayToggles />
      <div className="container site-header__bar">
        <Link to="/" className="brand" aria-label={t.site.homeLinkLabel}>
          {/* Decorative: the link already has a text label. */}
          <img className="brand__logo" src={publicUrl('brand/logo-dove.jpg')} alt="" width="48" height="48" />
          <span className="brand__name">{t.site.name}</span>
        </Link>
        <MainNav />
      </div>
    </header>
  );
}
