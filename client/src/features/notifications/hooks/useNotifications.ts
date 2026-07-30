import { useEffect } from 'react';
import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '../../../config/api.client';
import { socketClient } from '../../../config/socket.client';
import { useAuthStore } from '../../../stores/auth.store';
import {
  PaginatedNotificationsResult,
  NotificationItemData,
} from '../../../types/notification';
import { AuthApiResponse } from '../../../types/auth';

const NOTIFICATIONS_KEY = ['notifications'];
const UNREAD_COUNT_KEY = ['notifications', 'unread-count'];

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?.id ?? '';

  // -------------------------------------------------------------------------
  // 1. Queries
  // -------------------------------------------------------------------------

  const notificationsQuery = useInfiniteQuery<AuthApiResponse<PaginatedNotificationsResult>>({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as string | undefined;
      const url = cursor
        ? `/notifications?limit=20&cursor=${cursor}`
        : '/notifications?limit=20';
      return apiClient.get<unknown, AuthApiResponse<PaginatedNotificationsResult>>(url);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.data?.nextCursor ?? undefined,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const unreadCountQuery = useQuery<AuthApiResponse<{ unreadCount: number }>>({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: () =>
      apiClient.get<unknown, AuthApiResponse<{ unreadCount: number }>>(
        '/notifications/unread-count'
      ),
    enabled: isAuthenticated,
    staleTime: 15_000,
  });

  // -------------------------------------------------------------------------
  // 2. Real-Time Socket.IO Synchronization
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const socket = socketClient.connect();

    const joinRoom = () => {
      socket.emit('join_user_room', { userId });
    };

    if (socket.connected) {
      joinRoom();
    }
    socket.on('connect', joinRoom);

    const handleNotificationCreated = () => {
      // Invalidate or prepend notification
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    };

    const handleNotificationRead = () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    };

    const handleNotificationDeleted = () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    };

    const handleUnreadCountUpdated = (data: { unreadCount: number }) => {
      queryClient.setQueryData(UNREAD_COUNT_KEY, (old: any) => ({
        ...old,
        data: { unreadCount: data.unreadCount },
      }));
    };

    socket.on('NOTIFICATION_CREATED', handleNotificationCreated);
    socket.on('NOTIFICATION_READ', handleNotificationRead);
    socket.on('NOTIFICATION_DELETED', handleNotificationDeleted);
    socket.on('UNREAD_COUNT_UPDATED', handleUnreadCountUpdated);

    return () => {
      socket.emit('leave_user_room', { userId });
      socket.off('connect', joinRoom);
      socket.off('NOTIFICATION_CREATED', handleNotificationCreated);
      socket.off('NOTIFICATION_READ', handleNotificationRead);
      socket.off('NOTIFICATION_DELETED', handleNotificationDeleted);
      socket.off('UNREAD_COUNT_UPDATED', handleUnreadCountUpdated);
    };
  }, [isAuthenticated, userId, queryClient]);

  // -------------------------------------------------------------------------
  // 3. Mutations
  // -------------------------------------------------------------------------

  const markReadMutation = useMutation<
    AuthApiResponse<{ notification: NotificationItemData }>,
    Error,
    string
  >({
    mutationFn: (id: string) =>
      apiClient.patch<unknown, AuthApiResponse<{ notification: NotificationItemData }>>(
        `/notifications/${id}/read`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });

  const markAllReadMutation = useMutation<
    AuthApiResponse<{ modifiedCount: number }>,
    Error
  >({
    mutationFn: () =>
      apiClient.patch<unknown, AuthApiResponse<{ modifiedCount: number }>>(
        '/notifications/read-all'
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });

  const deleteNotificationMutation = useMutation<
    AuthApiResponse<null>,
    Error,
    string
  >({
    mutationFn: (id: string) =>
      apiClient.delete<unknown, AuthApiResponse<null>>(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });

  const unreadCount = unreadCountQuery.data?.data?.unreadCount ?? 0;

  return {
    notificationsQuery,
    unreadCount,
    markReadMutation,
    markAllReadMutation,
    deleteNotificationMutation,
  };
};
