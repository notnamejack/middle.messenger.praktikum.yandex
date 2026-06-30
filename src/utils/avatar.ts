import { API_BASE } from '../api/constants';

export function getAvatarUrl(avatar: string | null): string | null {
  if (!avatar) return null;
  return `${API_BASE}/resources${avatar}`;
}
