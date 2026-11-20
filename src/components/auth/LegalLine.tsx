import { Trans } from 'react-i18next';
import { Link } from 'react-router';

import { ROUTES } from '@/utils';

// One key with the links as placeholders: three fragments would fix English word order.
export function LegalLine() {
  return (
    <p className="text-center text-xs text-muted-foreground">
      <Trans
        i18nKey="auth.legal"
        components={{
          rules: <Link to={ROUTES.RULES} className="underline underline-offset-2" />,
          privacy: <Link to={ROUTES.PRIVACY} className="underline underline-offset-2" />,
        }}
      />
    </p>
  );
}
