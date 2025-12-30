// Hook to get pending void requests count
import { useQuery } from '@tanstack/react-query';
import { listVoidRequests } from '../api/orders.api';

export const useVoidRequestsCount = () => {
    return useQuery({
        queryKey: ['voidRequests', 'count'],
        queryFn: async () => {
            const requests = await listVoidRequests({ status: 'PENDING' });
            return requests.length;
        },
        refetchInterval: 10000, // Refresh every 10 seconds
        staleTime: 5000,
    });
};
