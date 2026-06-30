import type { HttpErrorBody } from '../types/api';
export function getApiErrorReason(error: unknown): string {
  if (typeof error !== 'string') return 'Неизвестная ошибка';
  try {
    return (JSON.parse(error) as HttpErrorBody).reason;
  } catch {
    return error;
  }
}
