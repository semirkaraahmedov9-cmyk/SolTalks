import { t } from '../i18n';
import { publicUrl } from '../utils/publicUrl';

/** Footer with the EU funding acknowledgement required on every page. */
export function SiteFooter() {
  return (
    <footer className="site-footer on-dark">
      <div className="container site-footer__inner">
        <p className="site-footer__privacy">{t.footer.privacy}</p>
        <div className="site-footer__funding">
          {/* The emblem has a white background, so it sits on a white plate. */}
          <div className="eu-badge">
            <img
              src={publicUrl('brand/eu-funded-en.png')}
              alt={t.footer.euEmblemAlt}
              width="1200"
              height="480"
            />
          </div>
          <div className="site-footer__texts">
            <p>{t.footer.project}</p>
            <p className="site-footer__disclaimer">{t.footer.disclaimer}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
