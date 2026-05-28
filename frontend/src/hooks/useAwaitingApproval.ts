import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { PaginatedResponse, Transfer } from '@/types/api';

export function useAwaitingApproval() {
  return useQuery({
    queryKey: ['transfers', 'pending-approval'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Transfer>>('/transfers', {
        params: { status: 'PENDING_APPROVAL', limit: 3, page: 1 },
      });
      return data;
    },
  });
}
