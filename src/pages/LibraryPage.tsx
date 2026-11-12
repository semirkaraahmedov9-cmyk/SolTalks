import { t } from '../i18n';
import { Page } from '../components/Page';
import { ComingSoon } from '../components/ComingSoon';

export function LibraryPage() {
  return (
    <Page title={t.library.title}>
      <ComingSoon />
    </Page>
  );
}
