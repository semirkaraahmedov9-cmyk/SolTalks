import { t } from '../i18n';
import { Page } from '../components/Page';
import { ComingSoon } from '../components/ComingSoon';

export function VolunteerPage() {
  return (
    <Page title={t.volunteer.title}>
      <ComingSoon />
    </Page>
  );
}
