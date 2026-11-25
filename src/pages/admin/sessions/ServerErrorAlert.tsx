import { ErrorCodeChip } from '@/components/ErrorCodeChip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { messageFor } from '@/lib/errors';
import { TriangleAlert } from '@/lib/icons';

interface ServerErrorAlertProps {
  title: string;
  error: unknown;
}

export const ServerErrorAlert = ({ title, error }: ServerErrorAlertProps) => {
  return (
    <Alert variant="destructive">
      <TriangleAlert aria-hidden />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>
          {messageFor(error)} <ErrorCodeChip error={error} />
        </p>
      </AlertDescription>
    </Alert>
  );
};
