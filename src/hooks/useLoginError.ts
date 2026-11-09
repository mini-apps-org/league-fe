import { useSearchParams } from 'react-router';

import { loginErrorMessage, parseLoginErrorReason } from '@/lib/errors';
import type { LoginErrorReason } from '@/types/errors';

interface LoginError {
  reason: LoginErrorReason;
  message: string;
}

export function useLoginError(): LoginError | null {
  const [params] = useSearchParams();
  const reason = parseLoginErrorReason(params.get('error'));

  if (reason === null) {
    return null;
  }

  return { reason, message: loginErrorMessage(reason) };
}
