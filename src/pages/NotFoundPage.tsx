import { Link } from 'react-router-dom';
import { t } from '../i18n';
import { Page } from '../components/Page';

export function NotFoundPage() {
  return (
    <Page title={t.notFound.title}>
      <p className="lead">{t.notFound.text}</p>
      <p>
        <Link to="/">{t.notFound.backHome}</Link>
      </p>
    </Page>
  );
}
