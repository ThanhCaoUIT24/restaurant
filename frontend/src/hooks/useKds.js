import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listTickets, updateItemStatus } from '../api/kds.api';

export const useKdsTickets = (station) =>
  useQuery({
    queryKey: ['kds', station],
    queryFn: () => listTickets(station),
    refetchInterval: 5000,
  });

export const useKdsStream = (station) => {
  const [tickets, setTickets] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const url = token
      ? `/api/kds/stream?station=${encodeURIComponent(station || '')}&token=${encodeURIComponent(token)}`
      : `/api/kds/stream?station=${encodeURIComponent(station || '')}`;
    const source = new EventSource(url);

    source.onopen = () => {
      // connected
    };

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (!station || parsed.station === station) {
          setTickets(parsed.tickets || []);
        }
      } catch (e) {
        // ignore parse errors
      }
    };

    source.onerror = () => {
      source.close();
      // don't attempt immediate reconnect here; rely on user refresh or later improvements
    };

    return () => source.close();
  }, [station]);
  return tickets;
};

export const useUpdateKdsStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, status }) => updateItemStatus(itemId, status),
    onSuccess: (_data, variables) => qc.invalidateQueries(['kds', variables.station]),
  });
};
