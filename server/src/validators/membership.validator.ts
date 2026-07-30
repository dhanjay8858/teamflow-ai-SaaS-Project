import { z } from 'zod';
import { MembershipRole } from '../types/organization.types.js';

export const updateRoleSchema = z.object({
  body: z.object({
    role: z.nativeEnum(MembershipRole),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    workspaceId: z.string().min(1, 'Workspace ID is required'),
    userId: z.string().min(1, 'User ID is required'),
    role: z.nativeEnum(MembershipRole).optional(),
  }),
});
