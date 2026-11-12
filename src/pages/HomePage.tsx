import { Link } from 'react-router-dom';
import { t } from '../i18n';
import { Page } from '../components/Page';
import { PixelWave } from '../components/PixelWave';

export function HomePage() {
  return (
    <div className="hero on-dark">
      <PixelWave />
      <Page title={t.home.title} isHome>
        <p className="hero__intro">{t.home.intro}</p>
        <div className="hero__actions">
          <Link to="/convert" className="btn btn--primary">
            {t.home.ctaConvert}
          </Link>
          <Link to="/library" className="btn btn--secondary">
            {t.home.ctaLibrary}
          </Link>
        </div>
      </Page>
    </div>
  );
}
