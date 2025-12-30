import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listOrders, createOrder, sendOrder, voidOrderItem, createVoidRequest } from '../api/orders.api';

// Hook to subscribe to POS notifications (SSE) when items are done from kitchen
export const usePosNotifications = (onItemDone) => {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { ...notification, id }]);
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    let source = null;
    let reconnectTimeout = null;

    const connect = () => {
      try {
        // Get the access token from localStorage and pass as query param for SSE
        const token = localStorage.getItem('accessToken');
        const url = token
          ? `/api/orders/notifications/stream?token=${encodeURIComponent(token)}`
          : '/api/orders/notifications/stream';

        source = new EventSource(url);

        source.onopen = () => {
          setConnected(true);
        };

        source.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'ITEM_DONE') {
              addNotification({
                type: 'item_done',
                itemId: data.itemId,
                station: data.station,
                message: '🍳 Món đã hoàn thành từ bếp!',
              });
              if (onItemDone) {
                onItemDone(data);
              }
            }
          } catch (e) {
            // Ignore parse errors
          }
        };

        source.onerror = () => {
          setConnected(false);
          source?.close();
          // Reconnect after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (e) {
        // EventSource not supported or other error
        setConnected(false);
      }
    };

    connect();

    return () => {
      source?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [addNotification, onItemDone]);

  return { notifications, connected, removeNotification };
};

export const useOrders = (params, options = {}) =>
  useQuery({
    queryKey: ['orders', params],
    queryFn: () => listOrders(params),
    staleTime: 5000,
    ...options,
  });

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => qc.invalidateQueries(['orders']),
  });
};

export const useSendOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendOrder,
    onSuccess: () => qc.invalidateQueries(['orders']),
  });
};

export const useVoidOrderItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, orderItemId, reason, managerPin, managerUsername }) =>
      voidOrderItem(orderId, { orderItemId, reason, managerPin, managerUsername }),
    onSuccess: () => qc.invalidateQueries(['orders']),
  });
};

export const useCreateVoidRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, orderItemId, reason }) =>
      createVoidRequest({ orderId, orderItemId, reason }),
    onSuccess: () => {
      qc.invalidateQueries(['orders']);
      qc.invalidateQueries(['voidRequests']);
    },
  });
};

