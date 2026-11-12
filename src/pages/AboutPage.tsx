import { t } from '../i18n';
import { Page } from '../components/Page';
import { ComingSoon } from '../components/ComingSoon';

export function AboutPage() {
  return (
    <Page title={t.about.title}>
      <ComingSoon />
    </Page>
  );
}
