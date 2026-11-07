import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from '@/lib/icons';

interface LegalPageLayoutProps {
  title: string;
  body: string;
}

// Outside the auth gate: both pages are linked from the signed-out login screen.
export default function LegalPageLayout({ title, body }: LegalPageLayoutProps) {
  const { t } = useTranslation();

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl space-y-4 p-6">
      <Button asChild variant="ghost" className="-ml-2 h-11 px-2">
        <Link to="/login">
          <ArrowLeft className="size-5" aria-hidden />
          {t('common.back')}
        </Link>
      </Button>

      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-text-2">{body}</p>
    </main>
  );
}
