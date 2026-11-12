import { t } from '../i18n';
import { Page } from '../components/Page';
import { ComingSoon } from '../components/ComingSoon';

export function ConvertPage() {
  return (
    <Page title={t.convert.title}>
      <ComingSoon />
    </Page>
  );
}
