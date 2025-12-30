import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../auth/authContext';

export const useNotifications = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Initial fetch using React Query
    const query = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await api.get('/notifications');
            return data;
        },
        staleTime: Infinity, // Data is kept fresh by SSE
        enabled: !!user,
    });

    // SSE Connection
    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        console.log('[SSE] Connecting notifications...');
        const url = `${import.meta.env.VITE_API_URL}/notifications/stream?token=${token}`;
        const source = new EventSource(url);

        source.onopen = () => {
            console.log('[SSE] Connected');
        };

        source.onmessage = (event) => {
            if (event.data === ': heartbeat') return;

            try {
                const data = JSON.parse(event.data);

                if (data.type === 'INITIAL') {
                    // Update initial data
                    queryClient.setQueryData(['notifications'], {
                        notifications: data.notifications,
                        unreadCount: data.unreadCount
                    });
                } else if (data.type === 'NEW_NOTIFICATION') {
                    // Add new notification to top
                    queryClient.setQueryData(['notifications'], (old) => {
                        if (!old) return { notifications: [data.notification], unreadCount: 1 };
                        // Dedup check
                        if (old.notifications.some(n => n.id === data.notification.id)) return old;

                        return {
                            notifications: [data.notification, ...old.notifications].slice(0, 20),
                            unreadCount: old.unreadCount + 1
                        };
                    });
                }
            } catch (err) {
                console.error('SSE Error parsing:', err);
            }
        };

        source.onerror = (err) => {
            console.error('Notification SSE Error:', err);
            // Browser auto-retries, but check state
            if (source.readyState === EventSource.CLOSED) {
                // Connection closed logic
            }
        };

        return () => {
            console.log('[SSE] Disconnecting...');
            source.close();
        };
    }, [queryClient, user]);

    // Mark as read
    const markRead = useMutation({
        mutationFn: async (id) => {
            const { data } = await api.patch(`/notifications/${id}/read`);
            return data;
        },
        onSuccess: (data, variables) => {
            // Optimistic update or refetch
            queryClient.setQueryData(['notifications'], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    notifications: old.notifications.map(n => n.id === variables ? { ...n, daDoc: true } : n),
                    unreadCount: Math.max(0, old.unreadCount - 1)
                };
            });
        },
    });

    // Mark all as read
    const markAllRead = useMutation({
        mutationFn: async () => {
            const { data } = await api.patch('/notifications/read-all');
            return data;
        },
        onSuccess: () => {
            queryClient.setQueryData(['notifications'], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    notifications: old.notifications.map(n => ({ ...n, daDoc: true })),
                    unreadCount: 0
                };
            });
        },
    });

    return {
        ...query,
        markRead,
        markAllRead
    };
};
