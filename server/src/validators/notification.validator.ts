import { z } from 'zod';

export const getNotificationsQuerySchema = z.object({
  query: z.object({
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
    cursor: z.string().optional(),
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Notification ID is required'),
  }),
});
