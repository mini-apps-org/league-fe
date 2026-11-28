import { useTranslation } from 'react-i18next';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { TriangleAlert } from '@/lib/icons';

export interface BulkDeleteFailureView {
  id: string;
  name: string;
  teamCode: string;
  message: string;
}

export interface BulkDeleteOutcome {
  deletedCount: number;
  failures: BulkDeleteFailureView[];
}

interface BulkDeleteResultProps {
  outcome: BulkDeleteOutcome;
  onDismiss: () => void;
}

export const BulkDeleteResult = ({ outcome, onDismiss }: BulkDeleteResultProps) => {
  const { t } = useTranslation();
  const { deletedCount, failures } = outcome;

  return (
    <Alert variant={failures.length > 0 ? 'destructive' : 'default'}>
      {failures.length > 0 && <TriangleAlert aria-hidden />}
      <AlertTitle>
        {t('teams.bulk.resultDeleted', { count: deletedCount })}
        {failures.length > 0 && ` ${t('teams.bulk.resultFailed', { count: failures.length })}`}
      </AlertTitle>
      <AlertDescription>
        <p>{t('teams.bulk.resultPlayersFreed')}</p>
        {failures.length > 0 && (
          <ul className="mt-1 flex flex-col gap-1">
            {failures.map((failure) => (
              <li key={failure.id}>
                <span className="font-medium">{`${failure.name} · ${failure.teamCode}`}</span>
                {` · ${failure.message}`}
              </li>
            ))}
          </ul>
        )}
      </AlertDescription>
      <AlertAction>
        <Button variant="ghost" onClick={onDismiss}>
          {t('teams.bulk.dismiss')}
        </Button>
      </AlertAction>
    </Alert>
  );
};
