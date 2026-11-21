import { isApiError } from '@/lib/errors';
import { ERROR_CODE } from '@/types/errors';

interface ErrorCodeChipProps {
  error: unknown;
}

// The five-digit code next to an error message, so a screenshot tells support what failed.
export const ErrorCodeChip = ({ error }: ErrorCodeChipProps) => {
  const code = isApiError(error) ? error.code : ERROR_CODE.INTERNAL;

  return <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs">{code}</code>;
};
