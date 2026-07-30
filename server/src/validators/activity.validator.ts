import { z } from 'zod';
import { DomainEventType, ActivityEntityType } from '../types/activity.types.js';

export const activityFilterQuerySchema = z.object({
  query: z.object({
    workspaceId: z.string().optional(),
    organizationId: z.string().optional(),
    userId: z.string().optional(),
    eventType: z.nativeEnum(DomainEventType).optional(),
    entityType: z.nativeEnum(ActivityEntityType).optional(),
    page: z.string().transform((v) => parseInt(v, 10)).optional(),
    limit: z.string().transform((v) => parseInt(v, 10)).optional(),
  }),
});
