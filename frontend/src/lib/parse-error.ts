import axios from 'axios';

export function parseApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'An unexpected error occurred.';
  const data = error.response?.data as { message?: string | string[] } | undefined;
  if (!data?.message) return 'An unexpected error occurred.';
  if (Array.isArray(data.message)) return data.message.join(' · ');
  return data.message;
}
